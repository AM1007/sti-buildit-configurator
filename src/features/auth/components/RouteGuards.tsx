import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@features/auth/store/authStore'

interface GuardProps {
  children: React.ReactNode
}

export function GuestOnly({ children }: GuardProps) {
  const status = useAuthStore((s) => s.status)

  if (status === 'idle') return null
  if (status === 'authenticated') return <Navigate to="/" replace />

  return <>{children}</>
}

export function ProtectedRoute({ children }: GuardProps) {
  const status = useAuthStore((s) => s.status)

  if (status === 'idle') return null
  if (status !== 'authenticated') return <Navigate to="/login" replace />

  return <>{children}</>
}
