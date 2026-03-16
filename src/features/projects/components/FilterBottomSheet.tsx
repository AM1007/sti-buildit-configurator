import { useEffect, useRef, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useTranslation } from '@shared/i18n'

interface FilterBottomSheetProps {
  open: boolean
  onClose: () => void
  title: string
  activeCount: number
  onClear: () => void
  children: ReactNode
}

export function FilterBottomSheet({
  open,
  onClose,
  title,
  activeCount,
  onClear,
  children,
}: FilterBottomSheetProps) {
  const { t } = useTranslation()
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const scrollY = window.scrollY
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      window.scrollTo(0, scrollY)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute bottom-0 left-0 right-0 flex max-h-[90vh] flex-col overflow-hidden rounded-t-lg bg-white"
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-slate-300" />
            </div>

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <h3 className="text-[15px] font-semibold text-slate-900">{title}</h3>
              <button
                type="button"
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-900 rounded-sm hover:bg-slate-200 transition-colors"
                aria-label={t('common.close')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>

            {activeCount > 0 && (
              <div className="border-t border-slate-200 bg-slate-50 px-5 py-3">
                <button
                  type="button"
                  onClick={() => {
                    onClear()
                    onClose()
                  }}
                  className="h-11 w-full rounded-sm border border-slate-200 bg-white text-[13px] font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                >
                  {t('common.clear')} ({activeCount})
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
