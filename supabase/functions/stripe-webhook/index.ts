// deno-lint-ignore-file no-explicit-any
// Supabase Edge Function: stripe-webhook
// Listens for Stripe webhook events and updates user membership tiers

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.17.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeSecret || !webhookSecret) {
    return new Response("Stripe env vars not set", { status: 500 });
  }

  // Raw body is needed for Stripe signature verification
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    const stripe = new Stripe(stripeSecret, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("⚠️  Webhook signature verification failed.", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  // Map Stripe product IDs -> membership tiers
  const productToTier: Record<string, string> = {
    "prod_SeWWFDCN8bCb2n": "monthly",    // Nomas Exclusive Club - 1 Month
  };

  // Map for checkout session tier mapping
  const priceToTier: Record<string, string> = {
    // You'll need to add actual price IDs from your Stripe dashboard
    // Example: "price_1234567890": "monthly",
  };

  // Helper to update profile by customer ID with enhanced error handling
  const updateProfile = async (
    customerId: string,
    tier: string,
    subscriptionId: string | null,
    expiresAt: number | null,
    subscriptionStatus?: string,
  ) => {
    try {
      const updateData: any = {
        membership_tier: tier,
        stripe_subscription_id: subscriptionId,
        membership_expires_at: expiresAt ? new Date(expiresAt * 1000).toISOString() : null,
      };

      // Add subscription status if provided
      if (subscriptionStatus) {
        updateData.subscription_status = subscriptionStatus;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("stripe_customer_id", customerId);

      if (error) {
        console.error("Supabase update error:", error.message);
        throw error;
      }

      console.log(`✅ Profile updated for customer ${customerId}: tier=${tier}, expires=${expiresAt ? new Date(expiresAt * 1000).toISOString() : null}`);
    } catch (error: any) {
      console.error("Failed to update profile:", error.message);
      throw error;
    }
  };

  // Helper to log webhook events for monitoring
  const logWebhookEvent = async (eventType: string, customerId: string, status: 'success' | 'error', details?: string) => {
    try {
      await supabase
        .from('webhook_logs')
        .insert({
          event_type: eventType,
          customer_id: customerId,
          status,
          details,
          processed_at: new Date().toISOString()
        });
    } catch (error) {
      // Don't fail the webhook if logging fails
      console.error("Failed to log webhook event:", error);
    }
  };

  try {
    console.log(`🔔 Processing webhook event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string | null;
        
        // Try to get tier from metadata first, then fallback to price mapping
        let tier = (session as any).metadata?.plan || "premium";
        const priceId = (session as any).metadata?.price_id;
        if (priceId && priceToTier[priceId]) {
          tier = priceToTier[priceId];
        }

        await updateProfile(customerId, tier, subscriptionId, null);
        await logWebhookEvent("checkout.session.completed", customerId, "success");
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const productId = subscription.items.data[0].price.product as string;
        const tier = productToTier[productId] ?? "premium";
        
        await updateProfile(
          customerId, 
          tier, 
          subscription.id, 
          subscription.current_period_end,
          subscription.status
        );
        await logWebhookEvent(`customer.subscription.${event.type.split('.')[2]}`, customerId, "success");
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        await updateProfile(customerId, "free", null, null, "canceled");
        await logWebhookEvent("customer.subscription.deleted", customerId, "success");
        break;
      }

      // Handle payment failures
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const subscriptionId = invoice.subscription as string;

        console.log(`❌ Payment failed for customer ${customerId}, subscription ${subscriptionId}`);
        
        // Update subscription status but don't downgrade tier immediately
        // Stripe will handle retry logic and eventual cancellation
        await supabase
          .from("profiles")
          .update({ subscription_status: "past_due" })
          .eq("stripe_customer_id", customerId);

        await logWebhookEvent("invoice.payment_failed", customerId, "success", `Payment failed for subscription ${subscriptionId}`);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        console.log(`✅ Payment succeeded for customer ${customerId}`);
        
        // Update subscription status to active
        await supabase
          .from("profiles")
          .update({ subscription_status: "active" })
          .eq("stripe_customer_id", customerId);

        await logWebhookEvent("invoice.payment_succeeded", customerId, "success");
        break;
      }

      // Handle subscription status changes
      case "customer.subscription.trial_will_end": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        console.log(`⏰ Trial ending soon for customer ${customerId}`);
        
        await supabase
          .from("profiles")
          .update({ subscription_status: "trialing" })
          .eq("stripe_customer_id", customerId);

        await logWebhookEvent("customer.subscription.trial_will_end", customerId, "success");
        break;
      }

      case "customer.subscription.paused": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await supabase
          .from("profiles")
          .update({ subscription_status: "paused" })
          .eq("stripe_customer_id", customerId);

        await logWebhookEvent("customer.subscription.paused", customerId, "success");
        break;
      }

      case "customer.subscription.resumed": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await supabase
          .from("profiles")
          .update({ subscription_status: "active" })
          .eq("stripe_customer_id", customerId);

        await logWebhookEvent("customer.subscription.resumed", customerId, "success");
        break;
      }

      // Handle customer updates
      case "customer.updated": {
        const customer = event.data.object as Stripe.Customer;
        
        // Update customer email if changed
        if (customer.email) {
          await supabase
            .from("profiles")
            .update({ email: customer.email })
            .eq("stripe_customer_id", customer.id);
        }

        await logWebhookEvent("customer.updated", customer.id, "success");
        break;
      }

      // Handle payment intents for individual event payments
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const customerId = paymentIntent.customer as string;
        const eventId = paymentIntent.metadata?.event_id;
        const userId = paymentIntent.metadata?.supabase_user_id;

        console.log(`✅ Payment succeeded for event ${eventId}, user ${userId}`);
        
        if (eventId && userId) {
          // Update booking payment status
          const { error } = await supabase
            .from('bookings')
            .update({ 
              payment_status: 'paid',
              amount_paid_cents: paymentIntent.amount
            })
            .eq('event_id', eventId)
            .eq('user_id', userId)
            .eq('stripe_payment_intent_id', paymentIntent.id);

          if (error) {
            console.error('Error updating booking payment status:', error);
          }
        }

        await logWebhookEvent("payment_intent.succeeded", customerId, "success", `Event: ${eventId}, Amount: ${paymentIntent.amount}`);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const customerId = paymentIntent.customer as string;
        const eventId = paymentIntent.metadata?.event_id;
        const userId = paymentIntent.metadata?.supabase_user_id;

        console.log(`❌ Payment failed for event ${eventId}, user ${userId}`);
        
        if (eventId && userId) {
          // Update booking payment status and remove booking
          const { error } = await supabase
            .from('bookings')
            .update({ payment_status: 'failed' })
            .eq('event_id', eventId)
            .eq('user_id', userId)
            .eq('stripe_payment_intent_id', paymentIntent.id);

          if (error) {
            console.error('Error updating booking payment status:', error);
          }
        }

        await logWebhookEvent("payment_intent.payment_failed", customerId, "success", `Event: ${eventId}, Amount: ${paymentIntent.amount}`);
        break;
      }

      // Handle disputes and chargebacks
      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute;
        const charge = dispute.charge as Stripe.Charge;
        const customerId = charge.customer as string;

        console.log(`⚠️ Dispute created for customer ${customerId}`);
        
        // Log dispute for manual review
        await logWebhookEvent("charge.dispute.created", customerId, "success", `Dispute amount: ${dispute.amount}`);
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
        // Log unhandled events for monitoring
        await logWebhookEvent(event.type, "unknown", "success", "Unhandled event type");
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });

  } catch (error: any) {
    console.error(`❌ Error processing webhook ${event.type}:`, error.message);
    
    // Try to log the error
    try {
      const customerId = (event.data.object as any).customer || 
                        (event.data.object as any).id || 
                        "unknown";
      await logWebhookEvent(event.type, customerId, "error", error.message);
    } catch (logError) {
      console.error("Failed to log webhook error:", logError);
    }

    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}); 