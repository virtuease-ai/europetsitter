import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

// Créer le middleware next-intl
const intlMiddleware = createIntlMiddleware(routing)

export async function middleware(request: NextRequest) {
  // 1. D'abord, exécuter le middleware next-intl pour la gestion des locales
  const intlResponse = intlMiddleware(request)

  // 2. Ensuite, rafraîchir la session Supabase
  // On doit créer un nouveau response qui combine les deux
  let response = intlResponse || NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // Copier les cookies sur la réponse
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Cette ligne rafraîchit le token si expiré
  // et synchronise les cookies entre le navigateur et le serveur
  await supabase.auth.getUser()

  return response
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/', '/(fr|nl|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
}
