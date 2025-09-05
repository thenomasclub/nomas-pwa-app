#!/bin/bash

# Klaviyo Integration Setup Script
# Run this script to deploy Klaviyo integration to your Supabase project

echo "🎯 Setting up Klaviyo integration for Nomas PWA..."

# Check if required environment variables are provided
if [ -z "$KLAVIYO_API_KEY" ] || [ -z "$KLAVIYO_LIST_ID" ]; then
    echo "❌ Error: Please set KLAVIYO_API_KEY and KLAVIYO_LIST_ID environment variables"
    echo ""
    echo "Example:"
    echo "export KLAVIYO_API_KEY=pk_your_api_key_here"
    echo "export KLAVIYO_LIST_ID=your_list_id_here"
    echo "./scripts/setup-klaviyo.sh"
    exit 1
fi

echo "📝 Setting Klaviyo secrets in Supabase..."
supabase secrets set KLAVIYO_API_KEY="$KLAVIYO_API_KEY"
supabase secrets set KLAVIYO_LIST_ID="$KLAVIYO_LIST_ID"

echo "🚀 Deploying Klaviyo Edge Function..."
supabase functions deploy add-to-klaviyo

echo "📊 Running database migration..."
supabase db push

echo "✅ Klaviyo integration setup complete!"
echo ""
echo "🧪 To test the integration:"
echo "1. Create a new user account through your app"
echo "2. Check your Klaviyo dashboard to see if the user was added"
echo "3. Check function logs: supabase functions logs add-to-klaviyo"
echo ""
echo "📚 For full setup instructions, see: supabase/KLAVIYO_SETUP.md"
