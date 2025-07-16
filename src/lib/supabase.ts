import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if we have valid credentials (not placeholders)
const hasValidCredentials = 
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') && 
  !supabaseAnonKey.includes('placeholder');

if (!hasValidCredentials) {
  console.warn('⚠️ Supabase credentials not configured. Please update your .env file with real credentials.');
}

// Create client even with placeholder values to prevent app crashes
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
); 