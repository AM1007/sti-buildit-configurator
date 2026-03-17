import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { subscribeToAuthEvent } from '@shared/api/authApi'
import { useAuthStore } from '@features/auth/store/authStore'
import { useTranslation } from '@shared/i18n'
import { mapAuthError } from '@features/auth/lib/mapAuthError'

export function UpdatePasswordPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const updatePassword = useAuthStore((s) => s.updatePassword)

  const [isRecoverySession, setIsRecoverySession] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDone, setIsDone] = useState(false)

  useEffect(() => {
    const unsubscribe = subscribeToAuthEvent('PASSWORD_RECOVERY', () => {
      setIsRecoverySession(true)
      setIsCheckingSession(false)
    })

    const timer = setTimeout(() => {
      setIsCheckingSession(false)
    }, 2000)

    return () => {
      unsubscribe()
      clearTimeout(timer)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError(t('auth.passwordMinLength'))
      return
    }

    if (password !== confirmPassword) {
      setError(t('auth.passwordsDoNotMatch'))
      return
    }

    setIsSubmitting(true)
    const result = await updatePassword(password)

    if (result.error) {
      setError(mapAuthError(result.error, t))
      setIsSubmitting(false)
      return
    }

    setIsDone(true)
    setIsSubmitting(false)

    setTimeout(() => {
      navigate('/account')
    }, 2500)
  }

  if (isCheckingSession) {
    return (
      <div className="w-full max-w-sm mx-auto px-4 py-12 md:py-20">
        <p className="text-sm text-slate-500">{t('common.loading')}</p>
      </div>
    )
  }

  if (!isRecoverySession) {
    return (
      <div className="w-full max-w-sm mx-auto px-4 py-12 md:py-20">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="h-9 w-9 rounded-sm bg-red-50 border border-red-200 flex items-center justify-center">
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {t('auth.invalidResetLink')}
          </h1>
        </div>
        <p className="text-sm text-slate-500 mb-6">
          {t('auth.invalidResetLinkDescription')}
        </p>
        <button
          type="button"
          onClick={() => navigate('/reset-password')}
          className="w-full h-10 rounded-sm bg-slate-900 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
        >
          {t('auth.requestNewLink')}
        </button>
      </div>
    )
  }

  if (isDone) {
    return (
      <div className="w-full max-w-sm mx-auto px-4 py-12 md:py-20">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="h-9 w-9 rounded-sm bg-green-50 border border-green-200 flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {t('auth.passwordUpdated')}
          </h1>
        </div>
        <p className="text-sm text-slate-500">{t('auth.passwordUpdatedDescription')}</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm mx-auto px-4 py-12 md:py-20">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-1">
          {t('auth.updatePassword')}
        </h1>
        <p className="text-sm text-slate-500">{t('auth.updatePasswordDescription')}</p>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-2 rounded-sm border border-red-200 bg-red-50 px-3 py-2.5">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="new-password"
            className="block text-xs font-medium text-slate-700 mb-1.5"
          >
            {t('auth.newPassword')}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="new-password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-10 rounded-sm border border-slate-200 bg-white pl-9 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">{t('auth.passwordHint')}</p>
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="block text-xs font-medium text-slate-700 mb-1.5"
          >
            {t('auth.confirmPassword')}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-10 rounded-sm border border-slate-200 bg-white pl-9 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-10 rounded-sm bg-slate-900 text-sm font-medium text-white hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? t('common.loading') : t('auth.updatePassword')}
        </button>
      </form>
    </div>
  )
}
