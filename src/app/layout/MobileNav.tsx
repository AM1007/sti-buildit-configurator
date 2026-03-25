import { Link, useLocation } from 'react-router-dom'
import { Home, Star, FolderOpen, Type, User } from 'lucide-react'
import { useMyListCount } from '@features/projects'
import { useIsAuthenticated, useUser } from '@features/auth/store/authStore'
import { useTranslation, useLanguage } from '@shared/i18n'
import type { Language } from '@shared/i18n'

export function MobileNav() {
  const myListCount = useMyListCount()
  const { t } = useTranslation()
  const { lang, setLang } = useLanguage()
  const location = useLocation()
  const isAuthenticated = useIsAuthenticated()
  const user = useUser()

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/')

  const toggleLanguage = () => {
    const next: Language = lang === 'uk' ? 'en' : 'uk'
    setLang(next)
  }

  const initial = user?.email?.charAt(0).toUpperCase() ?? ''

  const listPath = isAuthenticated ? '/projects' : '/my-list'
  const listLabel = isAuthenticated ? t('projects.title') : t('common.myList')
  const ListIcon = isAuthenticated ? FolderOpen : Star

  return (
    <div className="h-14 flex items-center justify-center gap-10">
      <Link
        to="/"
        className={`flex flex-col items-center gap-0.5 transition-colors ${
          isActive('/') &&
          !isActive('/projects') &&
          !isActive('/my-list') &&
          !isActive('/configurator') &&
          !isActive('/login') &&
          !isActive('/account')
            ? 'text-slate-900'
            : 'text-slate-400 hover:text-slate-700'
        }`}
      >
        <Home className="h-5 w-5" />
        <span className="text-[10px] font-medium leading-none">{t('common.home')}</span>
      </Link>

      <Link
        to={listPath}
        className={`relative flex flex-col items-center gap-0.5 transition-colors ${
          isActive(listPath) ? 'text-slate-900' : 'text-slate-400 hover:text-slate-700'
        }`}
      >
        <span className="relative">
          <ListIcon className="h-5 w-5" />
          {!isAuthenticated && myListCount > 0 && (
            <span className="absolute -top-2 -right-3 flex items-center justify-center min-w-4 h-4 rounded-full bg-brand-600 px-0.5 text-[9px] font-bold text-white leading-none">
              {myListCount}
            </span>
          )}
        </span>
        <span className="text-[10px] font-medium leading-none">{listLabel}</span>
      </Link>

      <button
        type="button"
        onClick={toggleLanguage}
        className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-700 transition-colors"
      >
        <Type className="h-5 w-5" />
        <span className="text-[10px] font-medium leading-none uppercase">
          {lang === 'uk' ? 'UA' : 'EN'}
        </span>
      </button>

      {isAuthenticated ? (
        <Link
          to="/account"
          className={`flex flex-col items-center gap-0.5 transition-colors ${
            isActive('/account')
              ? 'text-slate-900'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <span className="flex items-center justify-center h-5 w-5 rounded-full bg-slate-900 text-[10px] font-bold text-white leading-none">
            {initial}
          </span>
          <span className="text-[10px] font-medium leading-none">
            {t('header.account')}
          </span>
        </Link>
      ) : (
        <Link
          to="/login"
          className={`flex flex-col items-center gap-0.5 transition-colors ${
            isActive('/login') ? 'text-slate-900' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-[10px] font-medium leading-none">{t('auth.signIn')}</span>
        </Link>
      )}
    </div>
  )
}
