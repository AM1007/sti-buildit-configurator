import { useState } from 'react'
import { Link } from 'react-router-dom'
import { UserPlus, X } from 'lucide-react'
import { useIsAuthenticated } from '@features/auth/store/authStore'
import { useTranslation } from '@shared/i18n'

export function AuthPromptBanner() {
  const { t } = useTranslation()
  const isAuthenticated = useIsAuthenticated()
  const [dismissed, setDismissed] = useState(false)

  if (isAuthenticated || dismissed) return null

  return (
    <div className="mb-6 flex items-start gap-3 rounded-sm border border-blue-200 bg-blue-50 px-4 py-3">
      <UserPlus className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-blue-900">{t('authPrompt.title')}</p>
        <p className="text-xs text-blue-700 mt-0.5">{t('authPrompt.description')}</p>
        <Link
          to="/register"
          className="inline-flex items-center mt-2 text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors"
        >
          {t('authPrompt.cta')}
          <span className="ml-1">&rarr;</span>
        </Link>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="p-0.5 text-blue-400 hover:text-blue-600 transition-colors shrink-0"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
