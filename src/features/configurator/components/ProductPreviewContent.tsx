import { useState } from 'react'
import { ClipLoader } from 'react-spinners'
import { useTranslation } from '@shared/i18n'

interface ProductPreviewContentProps {
  imagePath: string
  productCode: string
}

export function ProductPreviewContent({
  imagePath,
  productCode,
}: ProductPreviewContentProps) {
  const { t } = useTranslation()
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [prevImagePath, setPrevImagePath] = useState(imagePath)
  if (imagePath !== prevImagePath) {
    setPrevImagePath(imagePath)
    setIsLoading(true)
    setHasError(false)
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8">
      {hasError ? (
        <div className="flex w-full flex-col items-center gap-4 py-16 text-center">
          <p className="text-sm font-medium text-slate-500">
            {t('configurator.previewNotAvailable')}
          </p>
          <p className="text-xs text-slate-400">{t('configurator.imageFailedToLoad')}</p>
        </div>
      ) : (
        <div className="relative mx-auto flex w-full max-w-lg items-center justify-center">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <ClipLoader color="#c8102e" size={40} />
            </div>
          )}
          <img
            alt={`${productCode}`}
            loading="lazy"
            width="600"
            height="600"
            className={`w-full select-none object-contain transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            src={imagePath}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false)
              setHasError(true)
            }}
          />
        </div>
      )}
      {!hasError && !isLoading && (
        <p className="mt-4 text-center font-mono text-xs font-semibold text-slate-600">
          {productCode}
        </p>
      )}
    </div>
  )
}
