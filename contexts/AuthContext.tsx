'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  // Créer le client Supabase une seule fois par instance du provider
  const supabase = useMemo(() => createClient(), [])

  const enrichUser = useCallback(async (authUser: User): Promise<AuthUser> => {
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
  }, [supabase])

  const updateUser = useCallback(async (authUser: User | null) => {
    if (authUser) {
      const enriched = await enrichUser(authUser)
      setUser(enriched)
    } else {
      setUser(null)
    }
  }, [enrichUser])

  const refresh = useCallback(async () => {
    try {
      // D'abord essayer getSession pour récupérer la session depuis les cookies
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.warn('[Auth] Refresh getSession error:', sessionError.message)
        setUser(null)
        return
      }

      if (session?.user) {
        await updateUser(session.user)
      } else {
        // Si pas de session, essayer getUser comme fallback
        const { data: { user: authUser } } = await supabase.auth.getUser()
        await updateUser(authUser)
      }
    } catch (error) {
      console.error('[Auth] Refresh error:', error)
    }
  }, [supabase, updateUser])

  // Initialisation de l'auth
  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      try {
        // Utiliser getSession() d'abord - il lit les cookies et est plus rapide
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (!mounted) return

        if (sessionError) {
          console.warn('[Auth] Init getSession error:', sessionError.message)
          setUser(null)
          setLoading(false)
          return
        }

        if (session?.user) {
          await updateUser(session.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('[Auth] Init error:', error)
        if (mounted) setUser(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initAuth()

    // Écouter les changements d'état d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) return

        console.log('[Auth] Auth state changed:', event, session?.user?.email)

        switch (event) {
          case 'SIGNED_OUT':
            setUser(null)
            setLoading(false)
            break

          case 'SIGNED_IN':
          case 'TOKEN_REFRESHED':
          case 'USER_UPDATED':
            if (session?.user) {
              await updateUser(session.user)
            }
            setLoading(false)
            break

          case 'INITIAL_SESSION':
            // Gérer la session initiale si elle existe
            if (session?.user) {
              await updateUser(session.user)
            }
            setLoading(false)
            break
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, updateUser])

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

  const value = useMemo(() => ({
    user,
    loading,
    refresh,
    refreshKey,
  }), [user, loading, refresh, refreshKey])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  return useContext(AuthContext)
}
