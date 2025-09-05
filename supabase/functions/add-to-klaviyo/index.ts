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
    
    // Add custom properties for Klaviyo (these go in properties, not attributes)
    profileData.properties = {
      membership_tier: membershipTier || 'free',
      signup_source: 'nomas_pwa',
      signup_date: new Date().toISOString()
    };

    console.log(`Adding user to Klaviyo: ${email}`);

    // First, create/update the profile in Klaviyo
    const profileResponse = await fetch(
      'https://a.klaviyo.com/api/profiles/',
      {
        method: 'POST',
        headers: {
          'Authorization': `Klaviyo-API-Key ${klaviyoApiKey}`,
          'Content-Type': 'application/json',
          'revision': '2023-02-22',
        },
        body: JSON.stringify({
          data: {
            type: 'profile',
            attributes: profileData
          }
        })
      }
    );

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error('Klaviyo profile creation error:', profileResponse.status, errorText);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Klaviyo profile creation failed',
          details: errorText 
        }), 
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const profileData_response = await profileResponse.json();
    const profileId = profileData_response.data.id;
    console.log('Profile created successfully:', profileId);

    // Now add the profile to the list
    const listResponse = await fetch(
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
            id: profileId
          }]
        })
      }
    );

    if (listResponse.ok) {
      console.log('Successfully added to Klaviyo list:', email);
    } else {
      console.log('Profile created but list addition failed - this is OK');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User added to Klaviyo successfully',
        profileId: profileId 
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
