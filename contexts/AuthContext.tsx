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
      // Utiliser getUser() qui valide le token côté serveur
      const { data: { user: authUser }, error } = await supabase.auth.getUser()
      if (error) {
        console.warn('[Auth] Refresh error:', error.message)
        setUser(null)
        return
      }
      await updateUser(authUser)
    } catch (error) {
      console.error('[Auth] Refresh error:', error)
    }
  }, [supabase, updateUser])

  // Initialisation de l'auth - un seul point d'entrée via onAuthStateChange
  useEffect(() => {
    let mounted = true

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) return

        if (event === 'INITIAL_SESSION') {
          if (session?.user) {
            await updateUser(session.user)
          } else {
            // Pas de session dans les cookies - vérifier côté serveur
            // Gère le cas où les tokens doivent être rafraîchis
            try {
              const { data: { user: authUser } } = await supabase.auth.getUser()
              if (mounted) {
                await updateUser(authUser)
              }
            } catch {
              if (mounted) setUser(null)
            }
          }
          if (mounted) setLoading(false)
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          if (session?.user) {
            await updateUser(session.user)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setLoading(false)
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
