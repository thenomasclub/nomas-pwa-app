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
    const { plan, userId } = await req.json();
    
    if (!plan || !userId) {
      return new Response("Missing plan or userId", { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Get Stripe price for the specific membership product
    let priceId: string;
    
    if (plan === 'monthly') {
      // Get active prices for the membership product
      const prices = await stripe.prices.list({
        product: 'prod_SdL3dabH9F03TY',
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