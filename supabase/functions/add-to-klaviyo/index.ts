// Supabase Edge Function: add-to-klaviyo
// Adds new users to Klaviyo mailing list automatically

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { email, firstName, lastName, membershipTier } = await req.json();

    if (!email) {
      return new Response('Email is required', { status: 400 });
    }

    const klaviyoListId = Deno.env.get('KLAVIYO_LIST_ID');
    const klaviyoApiKey = Deno.env.get('KLAVIYO_API_KEY');

    if (!klaviyoListId || !klaviyoApiKey) {
      console.error('Klaviyo credentials not configured');
      return new Response('Klaviyo credentials not configured', { status: 500 });
    }

    // Prepare profile data for Klaviyo
    const profileData: Record<string, unknown> = {
      email,
    };

    if (firstName) profileData.first_name = firstName;
    if (lastName) profileData.last_name = lastName;
    if (membershipTier) profileData.membership_tier = membershipTier;
    
    // Add signup source and timestamp
    profileData.signup_source = 'nomas_pwa';
    profileData.signup_date = new Date().toISOString();

    console.log(`Adding user to Klaviyo: ${email}`);

    // Add user to Klaviyo list
    const response = await fetch(
      `https://a.klaviyo.com/api/lists/${klaviyoListId}/relationships/profiles/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Klaviyo-API-Key ${klaviyoApiKey}`,
          'Content-Type': 'application/json',
          'revision': '2023-02-22',
        },
        body: JSON.stringify({
          data: [{
            type: 'profile',
            attributes: profileData
          }]
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Klaviyo API error:', response.status, errorText);
      
      // Don't fail the user creation if Klaviyo fails
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Klaviyo integration failed',
          details: errorText 
        }), 
        { 
          status: 200, // Return 200 so user creation doesn't fail
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await response.json();
    console.log('Successfully added to Klaviyo:', email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User added to Klaviyo successfully',
        klaviyoResponse: data 
      }), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in add-to-klaviyo function:', error);
    
    // Don't fail user creation if Klaviyo integration fails
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        details: error.message 
      }), 
      { 
        status: 200, // Return 200 so user creation doesn't fail
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});
