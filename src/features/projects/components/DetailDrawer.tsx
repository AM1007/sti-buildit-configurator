import { useCallback, useEffect, useRef } from 'react'
import type { SavedConfiguration } from '@shared/types'
import { DetailHeader, DetailBody, DetailFooter } from './DetailContent'

interface DetailDrawerProps {
  item: SavedConfiguration | null
  isOpen: boolean
  onClose: () => void
  onRemove: (id: string) => void
}

export function DetailDrawer({ item, isOpen, onClose, onRemove }: DetailDrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      return () => {
        document.documentElement.style.overflow = ''
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.right = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus()
    }
  }, [isOpen, item?.id])

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) {
        onClose()
      }
    },
    [onClose],
  )

  if (!isOpen && !item) return null

  return (
    <>
      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        className={`fixed inset-0 z-60 bg-black/35 transition-opacity duration-150 ease-out ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        className={`fixed inset-y-0 right-0 z-70 w-full max-w-[420px] bg-white border-l border-slate-200 shadow-xl flex flex-col transition-transform duration-220 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
        role="dialog"
        aria-modal="true"
      >
        {item && (
          <>
            <DetailHeader item={item} onClose={onClose} closeButtonRef={closeButtonRef} />
            <DetailBody item={item} />
            <DetailFooter item={item} onClose={onClose} onRemove={onRemove} />
          </>
        )}
      </aside>
    </>
  )
}
