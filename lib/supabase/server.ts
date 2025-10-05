import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createMockClient } from './mock-client'

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Use mock client if environment variables are not properly set
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_') || supabaseKey.includes('your_')) {
    console.warn('Using mock Supabase client - configure environment variables for production');
    return createMockClient();
  }
  
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      async getAll() {
        return (await cookies()).getAll()
      },
      async setAll(cookiesToSet) {
        try {
          const cookieStore = await cookies();
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}