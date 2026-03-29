import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RotateCcw,
  Share2,
  Star,
  Pencil,
  FileText,
  ChevronLeft,
  ChevronRight,
  Lock,
} from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperType } from 'swiper'
import { ClipLoader } from 'react-spinners'
import type { ModelDefinition, CustomTextData, Configuration } from '@shared/types'
import { buildProductModel } from '@entities/product'
import { ProductPreview } from './ProductPreview'
import { ProductModelDisplay } from './ProductModelDisplay'
import { ShareMenu } from '@shared/ui/ShareMenu'
import { PdfMenu } from './PdfMenu'
import { CustomTextForm } from './CustomTextForm'
import { CustomTextDisplay } from './CustomTextDisplay'
import {
  shouldShowCustomTextForm,
  hasSubmittedCustomText,
  getCustomTextConfig,
  getMaxLength,
} from '@entities/product/customTextConfig'
import { getEffectiveLineCount } from '@shared/utils/customTextHelpers'
import { getModelSummary } from '@features/configurator/lib/getModelSummary'
import { useTranslation, useLanguage } from '@shared/i18n'

interface MobileTabletLayoutProps {
  model: ModelDefinition
  config: Configuration
  customText: CustomTextData | null
  productModel: ReturnType<typeof buildProductModel>
  completionPercent: number
  completedSteps: number
  totalSteps: number
  onEditStep: (stepId: string) => void
  onReset: () => void
  onAddToMyList: () => void
  onRemoveFromMyList: () => void
  isInMyList: boolean
  isLocked?: boolean
  actionsReady: boolean
  productName: string
  heroDescription?: string
  imagePath: string | null
  imagePaths?: string[]
  onCustomTextSubmit: (data: Omit<CustomTextData, 'submitted'>) => void
}

function MobilePreviewImage({ src, alt }: { src: string; alt: string }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  return (
    <div className="flex h-80 md:h-96 items-center justify-center">
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
            width="400"
            height="400"
            className={`max-h-full max-w-full select-none object-contain transition-opacity duration-300 ${
              loading ? 'h-0 opacity-0' : 'opacity-100'
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

export function MobileTabletLayout({
  model,
  config,
  customText,
  productModel,
  completionPercent,
  completedSteps,
  totalSteps,
  onEditStep,
  onReset,
  onAddToMyList,
  onRemoveFromMyList,
  isInMyList,
  actionsReady,
  productName,
  heroDescription,
  imagePath,
  imagePaths,
  onCustomTextSubmit,
}: MobileTabletLayoutProps) {
  const { t } = useTranslation()
  const { lang } = useLanguage()
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [showPdfMenu, setShowPdfMenu] = useState(false)
  const [modelDescription, setModelDescription] = useState<string | null>(null)
  const [userOverrideEdit, setUserOverrideEdit] = useState(false)
  const [previewImageLoading, setPreviewImageLoading] = useState(true)
  const [previewImageError, setPreviewImageError] = useState(false)
  const [swiperIndex, setSwiperIndex] = useState(0)
  const swiperRef = useRef<SwiperType | null>(null)

  const showCustomTextForm = shouldShowCustomTextForm(
    model,
    config,
    customText,
    productModel.isComplete,
  )
  const showCustomTextDisplay = hasSubmittedCustomText(model.id, config, customText)
  const customTextConfig = getCustomTextConfig(model.id)

  const canShowPreview = productModel.isComplete && !!imagePath
  const showPreviewImage = canShowPreview && !userOverrideEdit && !showCustomTextForm
  const slides = imagePaths && imagePaths.length > 1 ? imagePaths : null

  useEffect(() => {
    if (!canShowPreview) {
      setUserOverrideEdit(false)
    }
  }, [canShowPreview])

  useEffect(() => {
    setPreviewImageLoading(true)
    setPreviewImageError(false)
    setSwiperIndex(0)
  }, [imagePath])

  useEffect(() => {
    let cancelled = false

    if (productModel.isComplete) {
      const currentLang = lang as 'en' | 'uk'
      getModelSummary(productModel.fullCode, model.id, currentLang).then((desc) => {
        if (!cancelled) {
          setModelDescription(desc)
        }
      })
    } else {
      setModelDescription(null)
    }

    return () => {
      cancelled = true
    }
  }, [productModel.isComplete, productModel.fullCode, model.id, lang])

  const handleStarClick = () => {
    if (!actionsReady) return
    if (isInMyList) {
      onRemoveFromMyList()
    } else {
      onAddToMyList()
    }
  }

  const starTitle = !actionsReady
    ? t('configurator.submitCustomTextHint')
    : isInMyList
      ? t('configurator.removeFromMyList')
      : t('configurator.addToMyList')

  const shareTitle = !actionsReady
    ? t('configurator.submitCustomTextHint')
    : t('common.share')

  const getFormMaxLength = (): number => {
    if (!customTextConfig) return 20
    const effectiveLineCount = getEffectiveLineCount(
      customTextConfig.variant,
      customText?.lineCount ?? 2,
    )
    return getMaxLength(model.id, effectiveLineCount)
  }

  const renderPreviewContent = () => {
    if (slides) {
      return (
        <>
          <div className="relative w-full">
            <Swiper
              onSwiper={(swiper) => {
                swiperRef.current = swiper
              }}
              onSlideChange={(swiper) => setSwiperIndex(swiper.activeIndex)}
              slidesPerView={1}
              spaceBetween={0}
              speed={300}
              className="w-full"
            >
              {slides.map((src, index) => (
                <SwiperSlide key={src}>
                  <MobilePreviewImage
                    src={src}
                    alt={`${productModel.fullCode} ${index + 1}`}
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {swiperIndex > 0 && (
              <button
                type="button"
                onClick={() => swiperRef.current?.slidePrev()}
                className="absolute left-1 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-500 shadow-sm backdrop-blur-sm transition-all active:scale-95"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}

            {swiperIndex < slides.length - 1 && (
              <button
                type="button"
                onClick={() => swiperRef.current?.slideNext()}
                className="absolute right-1 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-500 shadow-sm backdrop-blur-sm transition-all active:scale-95"
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
                    index === swiperIndex ? 'w-4 bg-brand-600' : 'w-1.5 bg-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="mt-3 text-center font-mono text-xs font-semibold text-slate-600">
            {productModel.fullCode}
          </p>
        </>
      )
    }

    return (
      <>
        {previewImageError ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <p className="text-sm font-medium text-slate-500">
              {t('configurator.previewNotAvailable')}
            </p>
          </div>
        ) : (
          <div className="relative flex h-80 md:h-96 w-full items-center justify-center">
            {previewImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <ClipLoader color="#c8102e" size={40} />
              </div>
            )}
            <img
              alt={productModel.fullCode}
              src={imagePath!}
              width="400"
              height="400"
              className={`max-h-full max-w-full select-none object-contain transition-opacity duration-300 ${
                previewImageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={() => setPreviewImageLoading(false)}
              onError={() => {
                setPreviewImageLoading(false)
                setPreviewImageError(true)
              }}
            />
          </div>
        )}
        {!previewImageLoading && !previewImageError && (
          <p className="mt-3 text-center font-mono text-xs font-semibold text-slate-600">
            {productModel.fullCode}
          </p>
        )}
      </>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 pt-6 md:px-6">
      <div className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm">
        <AnimatePresence mode="wait" initial={false}>
          {showCustomTextForm && customTextConfig ? (
            <motion.div
              key="custom-text-form"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="p-4 md:p-5"
            >
              <CustomTextForm
                variant={customTextConfig.variant}
                maxLength={getFormMaxLength()}
                onSubmit={onCustomTextSubmit}
                initialData={customText ?? undefined}
              />
            </motion.div>
          ) : showPreviewImage && imagePath ? (
            <motion.div
              key="preview-image"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative flex flex-col items-center justify-center p-4 md:p-5"
            >
              {renderPreviewContent()}
              <button
                type="button"
                onClick={() => setUserOverrideEdit(true)}
                className="absolute right-3 bottom-3 inline-flex h-10 w-10 items-center justify-center rounded-sm border border-slate-200 bg-white/90 text-slate-500 shadow-sm backdrop-blur-sm transition-colors hover:border-slate-300 hover:text-brand-600 md:h-9 md:w-9"
                aria-label={t('configurator.editSelections')}
                title={t('configurator.editSelections')}
              >
                <Pencil className="h-4 w-4 md:h-3.5 md:w-3.5" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="product-preview"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="p-4 md:p-5"
            >
              {isInMyList && (
                <div className="mb-3 flex items-center gap-2 rounded-sm border border-amber-200 bg-amber-50 px-3 py-2">
                  <Lock className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                  <span className="text-xs font-medium text-amber-700">
                    {t('configurator.lockedBanner')}
                  </span>
                </div>
              )}
              <ProductPreview model={model} config={config} onEditStep={onEditStep} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showCustomTextDisplay && customText && (
        <div className="mt-4 rounded-sm border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <CustomTextDisplay customText={customText} />
        </div>
      )}

      <div className="mt-4 rounded-sm border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-slate-900">
            {t('configurator.configuration', { defaultValue: 'Configuration' })}
          </h2>
          <button
            type="button"
            onClick={onReset}
            className={`flex items-center gap-1 text-[13px] transition-colors ${
              isInMyList
                ? 'text-red-600 hover:text-red-700'
                : 'text-slate-500 hover:text-brand-600'
            }`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {t('common.reset')}
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-end justify-between">
            <span className="text-[13px] font-medium text-slate-600">
              {t('configurator.stepsCompleted', {
                completed: completedSteps.toString(),
                total: totalSteps.toString(),
              })}
            </span>
            <span className="font-mono text-[13px] text-slate-500">
              {Math.min(100, Math.max(0, completionPercent))}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-brand-600 transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, completionPercent))}%` }}
              role="progressbar"
              aria-valuenow={Math.min(100, Math.max(0, completionPercent))}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            {t('configurator.productModel', { defaultValue: 'Target SKU' })}
          </span>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="min-w-0">
              <ProductModelDisplay
                model={model}
                productModel={productModel}
                config={config}
                onEditStep={onEditStep}
              />
            </div>
            {productModel.isComplete && (
              <div className="flex shrink-0 items-center gap-1 self-end md:self-auto md:ml-auto">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      if (!actionsReady) return
                      setShowPdfMenu((prev) => !prev)
                      setShowShareMenu(false)
                    }}
                    disabled={!actionsReady}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-sm border transition-colors ${
                      actionsReady
                        ? 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-brand-600'
                        : 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed'
                    }`}
                    aria-expanded={showPdfMenu}
                    aria-haspopup="true"
                    aria-label="PDF"
                    title="PDF"
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                  {showPdfMenu && actionsReady && (
                    <PdfMenu
                      productModel={productModel}
                      modelId={model.id}
                      config={config}
                      customText={customText}
                      onClose={() => setShowPdfMenu(false)}
                      productName={productName}
                      productDescription={heroDescription}
                      productImageUrl={imagePath}
                    />
                  )}
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      if (!actionsReady) return
                      setShowShareMenu((prev) => !prev)
                      setShowPdfMenu(false)
                    }}
                    disabled={!actionsReady}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-sm border transition-colors ${
                      actionsReady
                        ? 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-brand-600'
                        : 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed'
                    }`}
                    aria-expanded={showShareMenu}
                    aria-haspopup="true"
                    aria-label={shareTitle}
                    title={shareTitle}
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  {showShareMenu && actionsReady && (
                    <ShareMenu
                      productModel={productModel}
                      modelId={model.id}
                      config={config}
                      customText={customText}
                      onClose={() => setShowShareMenu(false)}
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleStarClick}
                  disabled={!actionsReady}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-sm border transition-colors ${
                    !actionsReady
                      ? 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed'
                      : isInMyList
                        ? 'border-brand-600 bg-brand-600 text-white hover:bg-brand-700'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-brand-600'
                  }`}
                  aria-label={starTitle}
                  aria-pressed={isInMyList}
                  title={starTitle}
                >
                  <Star className={`h-4 w-4 ${isInMyList ? 'fill-current' : ''}`} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {modelDescription && (
        <div className="mt-4 rounded-sm border border-slate-200 bg-white p-5 shadow-sm">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            {t('configurator.modelDescription', { defaultValue: 'Model Description' })}
          </span>
          <p className="text-[15px] leading-relaxed text-slate-600">{modelDescription}</p>
        </div>
      )}
    </div>
  )
}
