// deno-lint-ignore-file no-explicit-any
// Supabase Edge Function: create-checkout-session
// Creates Stripe checkout sessions for subscription plans

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.17.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeSecret) {
    return new Response("Stripe secret key not configured", { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  const stripe = new Stripe(stripeSecret, {
    apiVersion: "2023-10-16",
    httpClient: Stripe.createFetchHttpClient(),
  });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    const { plan, userId, redirectTo, eventId } = await req.json();
    
    if (!plan || !userId) {
      return new Response("Missing plan or userId", { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Handle different payment types
    let priceId: string | null = null;
    let eventData: any = null;
    
    if (plan === 'monthly') {
      // Get active prices for the membership product
      const prices = await stripe.prices.list({
        product: 'prod_SeWWFDCN8bCb2n',
        active: true,
        limit: 1,
      });

      if (prices.data.length === 0) {
        return new Response("No active price found for membership product", { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      priceId = prices.data[0].id;
    } else if (plan === 'event') {
      // Handle event payment
      if (!eventId) {
        return new Response("Missing eventId for event payment", { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Get event details
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError || !event) {
        return new Response("Event not found", { 
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      if (event.is_free || event.price_cents === 0) {
        return new Response("Event is free - no payment required", { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      eventData = event;
    } else {
      return new Response("Invalid plan", { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Get user profile to check if they have a Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return new Response("User not found", { 
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
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

    // Create checkout session based on payment type
    let session;
    
    if (plan === 'monthly') {
      // Subscription checkout for membership
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId!,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: redirectTo === 'profile' 
          ? `${req.headers.get('origin')}/profile?payment=success`
          : `${req.headers.get('origin')}/signup-success?payment=success`,
        cancel_url: redirectTo === 'profile' 
          ? `${req.headers.get('origin')}/profile?payment=canceled`
          : `${req.headers.get('origin')}/membership-selection?payment=canceled`,
        metadata: {
          supabase_user_id: userId,
          plan: plan,
          price_id: priceId!,
        },
        allow_promotion_codes: true,
        subscription_data: {
          metadata: {
            supabase_user_id: userId,
            plan: plan,
          },
        },
      });
    } else if (plan === 'event') {
      // One-time payment for event
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'idr',
              product_data: {
                name: `Event: ${eventData.title}`,
                description: eventData.description,
              },
              unit_amount: eventData.price_cents,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${req.headers.get('origin')}/events?payment=success&event_id=${eventId}`,
        cancel_url: `${req.headers.get('origin')}/events?payment=canceled&event_id=${eventId}`,
        metadata: {
          supabase_user_id: userId,
          event_id: eventId,
          event_title: eventData.title,
          event_price_cents: eventData.price_cents.toString(),
        },
      });

      // Don't create booking yet - will be created by webhook after successful payment
    }

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );

  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
}); 