import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  console.log('[SupabaseClient] 🔧 createClient() appelé')
  console.log('[SupabaseClient] 🍪 Cookies actuels:', typeof document !== 'undefined' ? document.cookie.substring(0, 200) : 'SSR - pas de document')
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
