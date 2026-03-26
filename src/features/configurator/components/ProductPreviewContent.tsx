import { useState, useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperType } from 'swiper'
import { ClipLoader } from 'react-spinners'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from '@shared/i18n'

interface ProductPreviewContentProps {
  imagePath: string
  imagePaths?: string[]
  productCode: string
}

export function ProductPreviewContent({
  imagePath,
  imagePaths,
  productCode,
}: ProductPreviewContentProps) {
  const { t } = useTranslation()
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const swiperRef = useRef<SwiperType | null>(null)

  const [prevImagePath, setPrevImagePath] = useState(imagePath)
  if (imagePath !== prevImagePath) {
    setPrevImagePath(imagePath)
    setIsLoading(true)
    setHasError(false)
    setActiveIndex(0)
  }

  const slides = imagePaths && imagePaths.length > 1 ? imagePaths : null

  if (slides) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-5">
        <div className="relative mx-auto w-full">
          <Swiper
            onSwiper={(swiper) => {
              swiperRef.current = swiper
            }}
            onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
            slidesPerView={1}
            spaceBetween={0}
            speed={300}
            className="w-full"
          >
            {slides.map((src, index) => (
              <SwiperSlide key={src}>
                <SwiperImage src={src} alt={`${productCode} ${index + 1}`} />
              </SwiperSlide>
            ))}
          </Swiper>

          {activeIndex > 0 && (
            <button
              type="button"
              onClick={() => swiperRef.current?.slidePrev()}
              className="absolute left-1 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-500 shadow-sm backdrop-blur-sm transition-all hover:bg-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          {activeIndex < slides.length - 1 && (
            <button
              type="button"
              onClick={() => swiperRef.current?.slideNext()}
              className="absolute right-1 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-500 shadow-sm backdrop-blur-sm transition-all hover:bg-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}

          <div className="mt-3 flex items-center justify-center gap-1.5">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => swiperRef.current?.slideTo(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeIndex ? 'w-4 bg-brand-600' : 'w-1.5 bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>

        <p className="mt-4 text-center font-mono text-xs font-semibold text-slate-600">
          {productCode}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-5">
      {hasError ? (
        <div className="flex w-full flex-col items-center gap-4 py-16 text-center">
          <p className="text-sm font-medium text-slate-500">
            {t('configurator.previewNotAvailable')}
          </p>
          <p className="text-xs text-slate-400">{t('configurator.imageFailedToLoad')}</p>
        </div>
      ) : (
        <div className="relative mx-auto flex h-128 w-full items-center justify-center">
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
            className={`max-h-full max-w-full select-none object-contain transition-opacity duration-300 ${
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

function SwiperImage({ src, alt }: { src: string; alt: string }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  return (
    <div className="flex h-128 items-center justify-center">
      {error ? (
        <div className="flex h-full w-full items-center justify-center">
          <p className="text-sm text-slate-400">Image not available</p>
        </div>
      ) : (
        <div className="relative flex h-full w-full items-center justify-center">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <ClipLoader color="#c8102e" size={32} />
            </div>
          )}
          <img
            alt={alt}
            loading="lazy"
            width="600"
            height="600"
            className={`max-h-full max-w-full select-none object-contain transition-opacity duration-300 ${
              loading ? 'opacity-0' : 'opacity-100'
            }`}
            src={src}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false)
              setError(true)
            }}
          />
        </div>
      )}
    </div>
  )
}
