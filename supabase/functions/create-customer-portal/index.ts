// deno-lint-ignore-file no-explicit-any
// Supabase Edge Function: create-customer-portal
// Creates Stripe customer portal sessions for subscription management

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.17.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  // Only allow POST requests
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
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response("Missing userId", { status: 400 });
    }

    // Get user profile to find their Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return new Response("User not found", { status: 404 });
    }

    if (!profile.stripe_customer_id) {
      return new Response("No Stripe customer found for this user", { status: 400 });
    }

    // Create customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${req.headers.get('origin')}/profile`,
    });

    console.log(`✅ Customer portal session created for user ${userId}, customer ${profile.stripe_customer_id}`);

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error creating customer portal session:', error);
    
    // Handle specific Stripe errors
    let errorMessage = error.message;
    if (error.type === 'StripeInvalidRequestError') {
      if (error.message.includes('No such customer')) {
        errorMessage = 'Customer not found in Stripe. Please contact support.';
      } else if (error.message.includes('billing portal')) {
        errorMessage = 'Billing portal is not configured. Please contact support.';
      }
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}); 