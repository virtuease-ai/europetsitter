import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Ne pas exécuter de logique entre createServerClient et
  // supabase.auth.getUser(). Un simple bug peut rendre très difficile
  // le débogage des problèmes de session aléatoires.

  // IMPORTANT: NE PAS SUPPRIMER auth.getUser()
  // Cette ligne rafraîchit la session si elle a expiré - nécessaire
  // pour les Server Components. Elle synchronise aussi les cookies
  // entre le navigateur et le serveur.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return supabaseResponse
}
