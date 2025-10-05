import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Skip middleware if environment variables are not properly set
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_') || supabaseKey.includes('your_')) {
    console.warn('Skipping Supabase middleware - configure environment variables for production');
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // Check for Telegram authentication first
  const telegramToken = request.cookies.get('telegram-auth-token')?.value;
  let isAuthenticated = false;

  if (telegramToken) {
    try {
      const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
      const { verifyTelegramJWT } = await import('@/lib/utils/telegram-auth');
      const payload = await verifyTelegramJWT(telegramToken, jwtSecret);
      
      if (payload && payload.telegram_id) {
        // Verify user exists in database
        const { data: user, error } = await supabase
          .from('users')
          .select('id, telegram_id')
          .eq('telegram_id', payload.telegram_id)
          .single();
        
        if (user && !error) {
          isAuthenticated = true;
        }
      }
    } catch (error) {
      console.error('Telegram auth verification error in middleware:', error);
      // Remove invalid token
      supabaseResponse.cookies.delete('telegram-auth-token');
    }
  }

  // If no Telegram auth, check Supabase auth
  if (!isAuthenticated) {
    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      isAuthenticated = true;
    }
  }

  // Redirect to auth if not authenticated and not on auth pages
  if (
    !isAuthenticated &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/api/auth')
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/auth/signin'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}