'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: 'owner' | 'sitter'
  fallbackUrl?: string
}

export function AuthGuard({
  children,
  requiredRole,
  fallbackUrl = '/fr/connexion',
}: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.replace(fallbackUrl)
      return
    }

    if (requiredRole && user.role !== requiredRole) {
      router.replace('/fr')
    }
  }, [loading, user, requiredRole, router, fallbackUrl])

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
