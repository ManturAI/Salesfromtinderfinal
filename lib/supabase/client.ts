import { createBrowserClient } from '@supabase/ssr'
import { createMockClient } from './mock-client'
import type { SupabaseClient } from '@supabase/supabase-js'

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Use mock client if environment variables are not properly set
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_') || supabaseKey.includes('your_')) {
    console.warn('Using mock Supabase client - configure environment variables for production');
    return createMockClient() as unknown as SupabaseClient;
  }
  
  return createBrowserClient(supabaseUrl, supabaseKey);
}