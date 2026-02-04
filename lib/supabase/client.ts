import { createBrowserClient } from '@supabase/ssr'

/**
 * Client Supabase pour le BROWSER uniquement
 * 
 * ✅ Utilise @supabase/ssr (pas @supabase/supabase-js directement)
 * ✅ Stocke la session dans les COOKIES (synchronisé avec le serveur)
 * ✅ Auto-refresh des tokens fonctionne correctement
 * ✅ Synchronisation entre onglets via cookies
 */
let browserClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (browserClient) return browserClient

  browserClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return browserClient
}
