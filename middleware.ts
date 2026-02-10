import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

export async function middleware(request: NextRequest) {
  // 1. SUPABASE: refresh session cookies (essential for auth to work)
  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // getUser() refreshes the session cookie — this is required by Supabase SSR
  // Note: subscription/paywall check is handled client-side by SubscriptionGuard
  // to avoid an extra DB query on every single navigation
  await supabase.auth.getUser()

  // 2. INTL middleware
  const intlResponse = intlMiddleware(request)

  if (intlResponse) {
    // Merge Supabase cookies into intl response
    const supabaseCookies = supabaseResponse.cookies.getAll()
    supabaseCookies.forEach((cookie) => {
      intlResponse.cookies.set(cookie.name, cookie.value, cookie)
    })
    return intlResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/',
    '/(fr|nl|en)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
}
