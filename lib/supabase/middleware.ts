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

  // For web app mode - automatically authenticate with Telegram ID if available
  if (!isAuthenticated) {
    // Check if this is a Telegram Web App
    const userAgent = request.headers.get('user-agent') || '';
    const telegramWebApp = request.headers.get('x-telegram-web-app') || 
                          request.nextUrl.searchParams.get('tgWebAppData') ||
                          userAgent.includes('TelegramBot');
    
    if (telegramWebApp) {
      // For Telegram Web App, we'll handle authentication automatically
      // The app should provide Telegram user data through initData
      console.log('Telegram Web App detected, allowing access for auto-authentication');
      return NextResponse.next();
    }
    
    // For non-Telegram access, still allow access but log it
    console.log('Non-authenticated access detected, allowing for web app mode');
    return NextResponse.next();
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