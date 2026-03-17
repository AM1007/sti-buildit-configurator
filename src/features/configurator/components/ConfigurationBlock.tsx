import { useState } from 'react'
import { RotateCcw, Share2, Star, FileText } from 'lucide-react'
import type {
  Configuration,
  ProductModel,
  ModelDefinition,
  StepId,
  CustomTextData,
} from '@shared/types'
import { ProductModelDisplay } from './ProductModelDisplay'
import { ShareMenu } from '@shared/ui/ShareMenu'
import { PdfMenu } from './PdfMenu'
import { useTranslation } from '@shared/i18n'

export interface ConfigurationBlockProps {
  model: ModelDefinition
  config: Configuration
  customText: CustomTextData | null
  productModel: ProductModel
  completionPercent: number
  completedSteps: number
  totalSteps: number
  onEditStep: (stepId: StepId) => void
  onReset: () => void
  onAddToMyList: () => void
  onRemoveFromMyList: () => void
  isInMyList: boolean
  actionsReady: boolean
  productName: string
  productDescription?: string
  productImageUrl?: string | null
}

export function ConfigurationBlock({
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
  productDescription,
  productImageUrl,
}: ConfigurationBlockProps) {
  const { t } = useTranslation()
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [showPdfMenu, setShowPdfMenu] = useState(false)

  const clampedPercent = Math.min(100, Math.max(0, completionPercent))

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

  return (
    <div className="mt-4 rounded-sm border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-slate-900 md:text-sm">
          {t('configurator.configuration', { defaultValue: 'Configuration' })}
        </h2>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 text-[13px] text-slate-500 transition-colors hover:text-brand-600 md:text-xs md:text-slate-400"
        >
          <RotateCcw className="h-3.5 w-3.5 md:h-3 md:w-3" />
          {t('common.reset')}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-end justify-between">
          <span className="text-[13px] font-medium text-slate-600 md:text-xs md:text-slate-500">
            {t('configurator.stepsCompleted', {
              completed: completedSteps.toString(),
              total: totalSteps.toString(),
            })}
          </span>
          <span className="font-mono text-[13px] text-slate-500 md:text-xs md:text-slate-400">
            {clampedPercent}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 md:h-1">
          <div
            className="h-full bg-brand-600 transition-all duration-300"
            style={{ width: `${clampedPercent}%` }}
            role="progressbar"
            aria-valuenow={clampedPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 md:text-[10px] md:text-slate-400">
          {t('configurator.productModel', { defaultValue: 'Target SKU' })}
        </span>
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <ProductModelDisplay
              model={model}
              productModel={productModel}
              config={config}
              onEditStep={onEditStep}
            />
          </div>
          {productModel.isComplete && (
            <div className="flex shrink-0 items-center gap-1">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    if (!actionsReady) return
                    setShowPdfMenu((prev) => !prev)
                    setShowShareMenu(false)
                  }}
                  disabled={!actionsReady}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-sm border transition-colors md:h-7 md:w-7 ${
                    actionsReady
                      ? 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-brand-600 md:text-slate-400'
                      : 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed'
                  }`}
                  aria-expanded={showPdfMenu}
                  aria-haspopup="true"
                  aria-label="PDF"
                  title="PDF"
                >
                  <FileText className="h-4 w-4 md:h-3.5 md:w-3.5" />
                </button>
                {showPdfMenu && actionsReady && (
                  <PdfMenu
                    productModel={productModel}
                    modelId={model.id}
                    config={config}
                    customText={customText}
                    onClose={() => setShowPdfMenu(false)}
                    productName={productName}
                    productDescription={productDescription}
                    productImageUrl={productImageUrl}
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
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-sm border transition-colors md:h-7 md:w-7 ${
                    actionsReady
                      ? 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-brand-600 md:text-slate-400'
                      : 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed'
                  }`}
                  aria-expanded={showShareMenu}
                  aria-haspopup="true"
                  aria-label={shareTitle}
                  title={shareTitle}
                >
                  <Share2 className="h-4 w-4 md:h-3.5 md:w-3.5" />
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
                className={`inline-flex h-9 w-9 items-center justify-center rounded-sm border transition-colors md:h-7 md:w-7 ${
                  !actionsReady
                    ? 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed'
                    : isInMyList
                      ? 'border-brand-600 bg-brand-600 text-white hover:bg-brand-700'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-brand-600 md:text-slate-400'
                }`}
                aria-label={starTitle}
                aria-pressed={isInMyList}
                title={starTitle}
              >
                <Star
                  className={`h-4 w-4 md:h-3.5 md:w-3.5 ${isInMyList ? 'fill-current' : ''}`}
                />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
