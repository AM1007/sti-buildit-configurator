import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, FolderOpen, LogOut, ChevronDown } from 'lucide-react'
import { useAuthStore } from '@features/auth/store/authStore'
import { useTranslation } from '@shared/i18n'

interface UserDropdownProps {
  user: { email: string }
}

export function UserDropdown({ user }: UserDropdownProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const signOut = useAuthStore((s) => s.signOut)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const initial = user.email.charAt(0).toUpperCase()

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleSignOut = async () => {
    setOpen(false)
    await signOut()
    navigate('/')
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-slate-900 text-[11px] font-bold text-white leading-none">
          {initial}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-sm border border-slate-200 bg-white shadow-sm">
          <div className="px-3 py-2.5 border-b border-slate-100">
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>

          <div className="py-1">
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                navigate('/account')
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
            >
              <User className="h-4 w-4 text-slate-400" />
              {t('header.account')}
            </button>

            <button
              type="button"
              onClick={() => {
                setOpen(false)
                navigate('/projects')
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
            >
              <FolderOpen className="h-4 w-4 text-slate-400" />
              {t('projects.title')}
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
            >
              <LogOut className="h-4 w-4" />
              {t('account.signOut')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
