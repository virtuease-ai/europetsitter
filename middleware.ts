import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.pathname
  console.log(`[Middleware] ▶ ${request.method} ${url}`)

  // 1. SUPABASE D'ABORD
  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  })

  // Log les cookies auth présents dans la requête
  const authCookies = request.cookies.getAll().filter(c => c.name.startsWith('sb-'))
  console.log(`[Middleware] 🍪 Cookies auth trouvés: ${authCookies.length}`, authCookies.map(c => `${c.name}=${c.value.substring(0, 20)}...`))

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          console.log(`[Middleware] 🔄 setAll appelé avec ${cookiesToSet.length} cookies:`, cookiesToSet.map(c => c.name))
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

  const { data: { user }, error } = await supabase.auth.getUser()
  console.log(`[Middleware] 👤 getUser result:`, user ? `${user.email} (${user.id.substring(0, 8)})` : 'null', error ? `ERROR: ${error.message}` : '')

  // 2. INTL ENSUITE
  const intlResponse = intlMiddleware(request)

  if (intlResponse) {
    const supabaseCookies = supabaseResponse.cookies.getAll()
    console.log(`[Middleware] 🔀 Merge ${supabaseCookies.length} cookies Supabase → intlResponse`)
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
