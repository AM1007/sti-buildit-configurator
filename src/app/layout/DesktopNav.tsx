import { Link, useLocation } from 'react-router-dom'
import { User } from 'lucide-react'
import { useMyListCount } from '@features/projects'
import { useIsAuthenticated, useUser } from '@features/auth/store/authStore'
import { useTranslation, useLanguage } from '@shared/i18n'
import { UserDropdown } from './UserDropdown'

export function DesktopNav() {
  const myListCount = useMyListCount()
  const { t } = useTranslation()
  const { lang, setLang } = useLanguage()
  const location = useLocation()
  const isAuthenticated = useIsAuthenticated()
  const user = useUser()

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/')

  const listPath = isAuthenticated ? '/projects' : '/my-list'
  const listLabel = isAuthenticated ? t('projects.title') : t('common.myList')

  return (
    <div className="mx-auto max-w-7xl h-16 grid grid-cols-3 items-center px-6 xl:px-8">
      <div className="flex items-center">
        <Link to="/" className="shrink-0">
          <img src="/sti_American.svg" alt="STI" className="h-9 w-auto" />
        </Link>
      </div>

      <nav className="flex items-center justify-center gap-8">
        <Link
          to="/"
          className={`text-sm font-medium transition-colors ${
            isActive('/') && !isActive('/projects') && !isActive('/my-list')
              ? 'text-slate-900'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {t('common.home')}
        </Link>
        <Link
          to={listPath}
          className={`text-sm font-medium transition-colors flex items-center gap-2 ${
            isActive(listPath) ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {listLabel}
          {!isAuthenticated && myListCount > 0 && (
            <span className="flex items-center justify-center min-w-5 h-5 rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white leading-none">
              {myListCount}
            </span>
          )}
        </Link>
      </nav>

      <div className="flex items-center justify-end gap-6">
        <div className="flex items-center gap-0.5 text-sm font-medium">
          <button
            type="button"
            onClick={() => setLang('uk')}
            className={`px-1.5 py-0.5 rounded-sm transition-colors ${
              lang === 'uk'
                ? 'text-slate-900 font-semibold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            UA
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`px-1.5 py-0.5 rounded-sm transition-colors ${
              lang === 'en'
                ? 'text-slate-900 font-semibold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            EN
          </button>
        </div>

        <div className="w-px h-5 bg-slate-200" />

        {isAuthenticated && user ? (
          <UserDropdown user={user} />
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <User className="h-4 w-4" />
            <span>{t('auth.signIn')}</span>
          </Link>
        )}
      </div>
    </div>
  )
}
