import { useEffect, useRef } from 'react'
import { useAuthStore } from '@features/auth'
import { useProjectStore } from '@features/projects'
import { useTranslation } from '@shared/i18n'
import { toast } from '@shared/utils/toast'

interface AuthInitializerProps {
  children: React.ReactNode
}

export function AuthInitializer({ children }: AuthInitializerProps) {
  const { t } = useTranslation()
  const initialize = useAuthStore((s) => s.initialize)
  const status = useAuthStore((s) => s.status)
  const user = useAuthStore((s) => s.user)
  const guestConfigurations = useProjectStore((s) => s.guestConfigurations)
  const mergeGuestToRemote = useProjectStore((s) => s.mergeGuestToRemote)

  const prevStatusRef = useRef(status)
  const isMergingRef = useRef(false)

  useEffect(() => {
    const unsubscribe = initialize()
    return unsubscribe
  }, [initialize])

  useEffect(() => {
    const prevStatus = prevStatusRef.current
    prevStatusRef.current = status

    const guestCount = guestConfigurations.length

    if (
      (prevStatus === 'unauthenticated' || prevStatus === 'idle') &&
      status === 'authenticated' &&
      user &&
      guestCount > 0 &&
      !isMergingRef.current
    ) {
      isMergingRef.current = true
      mergeGuestToRemote(user.id)
        .then(() => {
          toast.success(t('merge.success', { count: String(guestCount) }))
        })
        .catch(() => {
          toast.error(t('merge.error'))
        })
        .finally(() => {
          isMergingRef.current = false
        })
    }
  }, [status, user, guestConfigurations.length, mergeGuestToRemote, t])

  return <>{children}</>
}
