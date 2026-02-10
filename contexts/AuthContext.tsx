'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
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

  const supabase = useMemo(() => createClient(), [])
  const lastVisibilityRefresh = useRef(0)

  // Enrichir le user avec les données DB (subscription, etc.)
  const enrichUser = useCallback(async (authUser: User): Promise<AuthUser> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role, name, trial_end_date, subscription_status, subscription_end_date, stripe_customer_id, stripe_subscription_id')
        .eq('id', authUser.id)
        .single()

      if (error || !data) {
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
    } catch {
      return authUser as AuthUser
    }
  }, [supabase])

  const refresh = useCallback(async () => {
    try {
      const { data: { user: authUser }, error } = await supabase.auth.getUser()
      if (error || !authUser) {
        setUser(null)
        return
      }
      const enriched = await enrichUser(authUser)
      setUser(enriched)
    } catch {
      // ignore
    }
  }, [supabase, enrichUser])

  useEffect(() => {
    let mounted = true

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) return

        if (
          event === 'INITIAL_SESSION' ||
          event === 'SIGNED_IN' ||
          event === 'TOKEN_REFRESHED' ||
          event === 'USER_UPDATED'
        ) {
          if (session?.user) {
            // 1. User immédiat depuis le JWT (role + name dans user_metadata)
            const meta = session.user.user_metadata || {}
            const quickUser: AuthUser = {
              ...session.user,
              role: meta.role,
              name: meta.name,
            }
            setUser(quickUser)
            setLoading(false)

            // 2. Enrichir en arrière-plan APRÈS que le verrou interne soit libéré
            setTimeout(async () => {
              if (!mounted) return
              try {
                const enriched = await enrichUser(session.user)
                if (mounted) {
                  setUser(enriched)
                }
              } catch {
                // Le user du JWT suffit
              }
            }, 0)
          } else if (event === 'INITIAL_SESSION') {
            setUser(null)
            setLoading(false)
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
  }, [supabase, enrichUser])

  // Rafraîchir quand l'onglet redevient visible (debounced: max 1 refresh per 30s)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now()
        if (now - lastVisibilityRefresh.current < 30000) return
        lastVisibilityRefresh.current = now
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
