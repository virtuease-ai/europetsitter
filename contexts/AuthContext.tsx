'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  ReactNode,
} from 'react'
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

export interface AuthUser extends User {
  role?: 'owner' | 'sitter'
  name?: string
  trial_end_date?: string
  subscription_status?: string
  subscription_end_date?: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  refresh: () => Promise<void>
  refreshKey: number
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refresh: async () => {},
  refreshKey: 0,
})

const supabase = createClient()

async function enrichUser(authUser: User): Promise<AuthUser> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role, name, trial_end_date, subscription_status, subscription_end_date, stripe_customer_id, stripe_subscription_id')
      .eq('id', authUser.id)
      .single()

    if (error || !data) {
      console.warn('[Auth] Could not enrich user:', error?.message)
      return authUser as AuthUser
    }

    return {
      ...authUser,
      role: data.role,
      name: data.name,
      trial_end_date: data.trial_end_date,
      subscription_status: data.subscription_status,
      subscription_end_date: data.subscription_end_date,
      stripe_customer_id: data.stripe_customer_id,
      stripe_subscription_id: data.stripe_subscription_id,
    }
  } catch (err) {
    console.error('[Auth] enrichUser error:', err)
    return authUser as AuthUser
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const initializedRef = useRef(false)
  const isRefreshingRef = useRef(false)

  const updateUser = useCallback(async (authUser: User | null) => {
    if (authUser) {
      const enriched = await enrichUser(authUser)
      setUser(enriched)
    } else {
      setUser(null)
    }
  }, [])

  const refresh = useCallback(async () => {
    if (isRefreshingRef.current) return

    isRefreshingRef.current = true

    try {
      // Utiliser getUser() qui valide le token côté serveur
      const { data: { user: authUser }, error } = await supabase.auth.getUser()

      if (error) {
        console.warn('[Auth] Refresh getUser error:', error.message)
        // Si le token est invalide, déconnecter
        if (error.message.includes('invalid') || error.message.includes('expired')) {
          setUser(null)
          return
        }
      }

      await updateUser(authUser)
    } catch (error) {
      console.error('[Auth] Refresh error:', error)
    } finally {
      isRefreshingRef.current = false
    }
  }, [updateUser])

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    let mounted = true

    const initAuth = async () => {
      try {
        // Utiliser getUser() qui valide le token côté serveur Supabase
        // C'est plus fiable que getSession() qui ne fait que lire le cookie local
        const { data: { user: authUser }, error } = await supabase.auth.getUser()

        if (!mounted) return

        if (error) {
          console.warn('[Auth] Init getUser error:', error.message)
          setUser(null)
        } else {
          await updateUser(authUser)
        }
      } catch (error) {
        console.error('[Auth] Init error:', error)
        if (mounted) setUser(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) return

        console.log('[Auth] Auth state changed:', event)

        // Ignorer les événements pendant un refresh manuel
        if (isRefreshingRef.current && event === 'SIGNED_IN') {
          return
        }

        switch (event) {
          case 'SIGNED_OUT':
            setUser(null)
            setLoading(false)
            break

          case 'SIGNED_IN':
          case 'TOKEN_REFRESHED':
          case 'USER_UPDATED':
            if (session?.user && mounted) {
              await updateUser(session.user)
            }
            setLoading(false)
            break

          case 'INITIAL_SESSION':
            // La session initiale est gérée par initAuth
            break
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [updateUser])

  // Rafraîchir quand l'onglet redevient visible
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        setRefreshKey(k => k + 1)
        await refresh()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [refresh])

  return (
    <AuthContext.Provider value={{ user, loading, refresh, refreshKey }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  return useContext(AuthContext)
}
