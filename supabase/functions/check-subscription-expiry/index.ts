// deno-lint-ignore-file no-explicit-any
// Supabase Edge Function: check-subscription-expiry
// Checks for expired subscriptions and downgrades users to free tier

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  // Only allow POST requests (for manual triggering) or cron requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    const now = new Date().toISOString();
    
    // Find all users with expired memberships
    const { data: expiredUsers, error: queryError } = await supabase
      .from('profiles')
      .select('id, email, membership_tier, membership_expires_at, stripe_customer_id')
      .neq('membership_tier', 'free')
      .not('membership_expires_at', 'is', null)
      .lt('membership_expires_at', now);

    if (queryError) {
      throw queryError;
    }

    console.log(`Found ${expiredUsers?.length || 0} expired subscriptions`);

    if (!expiredUsers || expiredUsers.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No expired subscriptions found',
        processed: 0 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update expired users to free tier
    const updatePromises = expiredUsers.map(async (user) => {
      try {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            membership_tier: 'free',
            subscription_status: 'expired',
            stripe_subscription_id: null,
            membership_expires_at: null
          })
          .eq('id', user.id);

        if (updateError) {
          console.error(`Failed to update user ${user.id}:`, updateError);
          return { success: false, userId: user.id, error: updateError.message };
        }

        console.log(`✅ Updated user ${user.id} (${user.email}) to free tier - subscription expired`);
        return { success: true, userId: user.id };
      } catch (error) {
        console.error(`Error updating user ${user.id}:`, error);
        return { success: false, userId: user.id, error: (error as Error).message };
      }
    });

    const results = await Promise.allSettled(updatePromises);
    
    const successful = results
      .filter(result => result.status === 'fulfilled' && result.value.success)
      .length;
    
    const failed = results.length - successful;

    // Log the batch operation
    try {
      await supabase
        .from('webhook_logs')
        .insert({
          event_type: 'subscription_expiry_check',
          customer_id: 'system',
          status: failed > 0 ? 'error' : 'success',
          details: `Processed ${expiredUsers.length} expired subscriptions. Success: ${successful}, Failed: ${failed}`,
          processed_at: now
        });
    } catch (logError) {
      console.error('Failed to log expiry check:', logError);
    }

    return new Response(JSON.stringify({
      message: 'Subscription expiry check completed',
      processed: expiredUsers.length,
      successful,
      failed,
      details: results.map(result => 
        result.status === 'fulfilled' ? result.value : { error: result.reason }
      )
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error in subscription expiry check:', error);

    // Log the error
    try {
      await supabase
        .from('webhook_logs')
        .insert({
          event_type: 'subscription_expiry_check',
          customer_id: 'system',
          status: 'error',
          details: `System error: ${error.message}`,
          processed_at: new Date().toISOString()
        });
    } catch (logError) {
      console.error('Failed to log system error:', logError);
    }

    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}); 