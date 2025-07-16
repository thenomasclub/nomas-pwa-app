// deno-lint-ignore-file no-explicit-any
// Supabase Edge Function: create-event-payment
// Creates Stripe payment intents for individual event bookings

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
    const { eventId, userId } = await req.json();
    
    if (!eventId || !userId) {
      return new Response("Missing eventId or userId", { status: 400 });
    }

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return new Response("Event not found", { status: 404 });
    }

    // Check if event is free
    if (event.is_free || event.price_cents === 0) {
      return new Response("Event is free - no payment required", { status: 400 });
    }

    // Get user profile to check membership status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('membership_tier, stripe_customer_id, subscription_status')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return new Response("User not found", { status: 404 });
    }

    // Check if user has active premium membership
    const isPremiumMember = profile.membership_tier !== 'free' && 
                           profile.subscription_status === 'active';

    // Premium events require payment from ALL users (including premium members)
    // Regular paid events are free for premium members
    if (isPremiumMember && !event.is_premium_event) {
      return new Response("Premium members get free access to regular events", { status: 400 });
    }

    // Check if user already has a booking for this event
    const { data: existingBooking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .single();

    if (bookingError && bookingError.code !== 'PGRST116') {
      return new Response("Error checking existing booking", { status: 500 });
    }

    if (existingBooking) {
      return new Response("User already has a booking for this event", { status: 400 });
    }

    // Get or create Stripe customer
    let customerId = profile.stripe_customer_id;
    if (!customerId) {
      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      if (!userData.user) {
        return new Response("User not found", { status: 404 });
      }

      const customer = await stripe.customers.create({
        email: userData.user.email,
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

    // Create payment intent with custom amount (no price ID needed)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: event.price_cents,
      currency: 'usd',
      customer: customerId,
      metadata: {
        supabase_user_id: userId,
        event_id: eventId,
        event_title: event.title,
        event_price_cents: event.price_cents.toString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
      // Optional: Add description for better tracking
      description: `Event booking: ${event.title}`,
    });

    // Create booking with pending payment status
    const { error: insertError } = await supabase
      .from('bookings')
      .insert({
        user_id: userId,
        event_id: eventId,
        status: 'confirmed',
        payment_status: 'pending',
        stripe_payment_intent_id: paymentIntent.id,
        amount_paid_cents: event.price_cents,
      });

    if (insertError) {
      console.error('Error creating booking:', insertError);
      return new Response("Failed to create booking", { status: 500 });
    }

    console.log(`✅ Payment intent created for event ${eventId}, user ${userId}, amount ${event.price_cents} cents`);

    return new Response(
      JSON.stringify({
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
        amount: event.price_cents,
        event_title: event.title,
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}); 