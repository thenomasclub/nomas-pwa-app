import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

// IMPORTANT: The service role key has elevated privileges. Never expose it in client-side
// code in production. This helper is meant for internal/admin usage in development or
// trusted environments only.

export const supabaseAdmin = serviceRoleKey && !serviceRoleKey.includes('placeholder')
  ? createClient(supabaseUrl, serviceRoleKey)
  : null; 