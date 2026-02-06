'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useLocale } from 'next-intl'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: 'owner' | 'sitter'
}

export function AuthGuard({
  children,
  requiredRole,
}: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const locale = useLocale()

  console.log('[AuthGuard] 🛡️ Render: loading=', loading, 'user=', user?.email || 'null', 'role=', user?.role || 'none', 'requiredRole=', requiredRole)

  useEffect(() => {
    if (loading) {
      console.log('[AuthGuard] ⏳ loading=true, en attente...')
      return
    }

    if (!user) {
      console.log('[AuthGuard] 🚪 Pas de user → redirect vers', `/${locale}/connexion`)
      router.replace(`/${locale}/connexion`)
      return
    }

    if (requiredRole && user.role !== requiredRole) {
      console.log('[AuthGuard] ⛔ Mauvais rôle:', user.role, '!==', requiredRole, '→ redirect vers', `/${locale}`)
      router.replace(`/${locale}`)
    } else {
      console.log('[AuthGuard] ✅ Accès autorisé pour', user.email, 'role=', user.role)
    }
  }, [loading, user, requiredRole, router, locale])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (requiredRole && user.role !== requiredRole) {
    return null
  }

  return <>{children}</>
}
