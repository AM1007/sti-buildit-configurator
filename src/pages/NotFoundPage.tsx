import { Link } from 'react-router-dom'
import { useTranslation } from '@shared/i18n'

export function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 md:px-6 xl:px-8">
      <div className="max-w-md md:max-w-lg w-full text-center">
        <div className="bg-white border-2 border-gray-200 p-8 md:p-12">
          <div className="text-8xl md:text-9xl font-bold text-gray-200 mb-6">404</div>

          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
            {t('notFound.title')}
          </h1>

          <p className="text-sm md:text-base text-gray-600 mb-8">
            {t('notFound.description')}
          </p>

          <Link
            to="/"
            className="cursor-pointer inline-flex items-center justify-center font-bold text-sm gap-1 px-4.5 py-0.5 min-h-9 border-4 md:gap-1.5 md:px-6 md:py-1 md:min-h-11 xl:text-base bg-brand-600 border-brand-600 text-white hover:bg-brand-700 hover:border-brand-700 transition-all duration-300"
          >
            {t('notFound.backHome')}
          </Link>
        </div>
      </div>
    </div>
  )
}
