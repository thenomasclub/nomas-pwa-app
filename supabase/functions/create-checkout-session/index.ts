// deno-lint-ignore-file no-explicit-any
// Supabase Edge Function: create-checkout-session
// Creates Stripe checkout sessions for subscription plans

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.17.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeSecret) {
    return new Response("Stripe secret key not configured", { status: 500 });
  }

  const stripe = new Stripe(stripeSecret, {
    apiVersion: "2023-10-16",
    httpClient: Stripe.createFetchHttpClient(),
  });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    const { plan, userId } = await req.json();
    
    if (!plan || !userId) {
      return new Response("Missing plan or userId", { status: 400 });
    }

    // Map plan to Stripe product ID (you'll need to get the actual price IDs from Stripe)
    const productMapping: Record<string, string> = {
      monthly: "prod_SdL3dabH9F03TY",    // Nomas Exclusive Club - 1 Month
      quarterly: "prod_SdL422R3xfb43g",  // Nomas Exclusive Club - 3 Months
      semiannual: "prod_SdjQfxP4bruxAI", // Nomas Exclusive Club - 6 Months
    };

    const productId = productMapping[plan];
    if (!productId) {
      return new Response("Invalid plan", { status: 400 });
    }

    // Get the default price for this product
    const prices = await stripe.prices.list({
      product: productId,
      active: true,
      limit: 1,
    });

    if (prices.data.length === 0) {
      return new Response("No active price found for this product", { status: 400 });
    }

    const priceId = prices.data[0].id;

    // Get user profile to check if they have a Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return new Response("User not found", { status: 404 });
    }

    let customerId = profile.stripe_customer_id;

    // Create Stripe customer if they don't have one
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email,
        metadata: {
          supabase_user_id: userId,
        },
      });
      customerId = customer.id;

      // Update profile with customer ID
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/home?payment=success`,
      cancel_url: `${req.headers.get('origin')}/membership-selection?payment=canceled`,
      metadata: {
        supabase_user_id: userId,
        plan: plan,
        product_id: productId,
        price_id: priceId,
      },
      // Allow promotion codes
      allow_promotion_codes: true,
      // Set up subscription data
      subscription_data: {
        metadata: {
          supabase_user_id: userId,
          plan: plan,
        },
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}); 