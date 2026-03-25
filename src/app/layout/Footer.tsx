import {
  Globe,
  // BookOpen, FileText,
} from 'lucide-react'
import { useTranslation } from '@shared/i18n'

const LINKEDIN_PATH =
  'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'

export function Footer() {
  const year = new Date().getFullYear().toString()
  const { t } = useTranslation()

  return (
    <footer className="border-t border-slate-200 bg-slate-900 py-8">
      <div className="mx-auto max-w-7xl px-4 md:px-6 xl:px-8">
        <div className="flex items-center justify-center gap-8">
          <a
            href="https://fortisec.com.ua"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Official website"
          >
            <Globe className="h-5 w-5" />
          </a>
          <a
            href="https://www.linkedin.com/company/fortisecua"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="LinkedIn"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d={LINKEDIN_PATH} />
            </svg>
          </a>
          {/* TODO: Uncomment when the refferences will be ready */}
          {/* <a
            href="#"
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Product catalogue"
          >
            <BookOpen className="h-5 w-5" />
          </a>
          <a
            href="#"
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Installation guides"
          >
            <FileText className="h-5 w-5" />
          </a> */}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">{t('footer.copyright', { year })}</p>
        </div>
      </div>
    </footer>
  )
}
