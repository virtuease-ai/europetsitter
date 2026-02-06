import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

// Créer le middleware next-intl
const intlMiddleware = createIntlMiddleware(routing)

export async function middleware(request: NextRequest) {
  // 1. Exécuter le middleware next-intl pour la gestion des locales
  let response = intlMiddleware(request)

  // 2. Si next-intl n'a pas créé de réponse, créer une réponse par défaut
  if (!response) {
    response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }

  // 3. Créer le client Supabase pour rafraîchir la session
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Mettre à jour les cookies dans la requête
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          // Mettre à jour les cookies dans la réponse
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // 4. IMPORTANT: Appeler getUser() pour rafraîchir le token si nécessaire
  // Cela synchronise aussi les cookies entre le navigateur et le serveur
  try {
    await supabase.auth.getUser()
  } catch (error) {
    // Ignorer les erreurs silencieusement - l'utilisateur n'est simplement pas connecté
    console.error('[Middleware] Auth error:', error)
  }

  return response
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/', '/(fr|nl|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
}
