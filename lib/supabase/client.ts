import { createBrowserClient } from '@supabase/ssr'

/**
 * Client Supabase pour le BROWSER uniquement
 *
 * ✅ Utilise @supabase/ssr (pas @supabase/supabase-js directement)
 * ✅ Stocke la session dans les COOKIES (synchronisé avec le serveur)
 * ✅ Auto-refresh des tokens fonctionne correctement
 * ✅ Synchronisation entre onglets via cookies
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
