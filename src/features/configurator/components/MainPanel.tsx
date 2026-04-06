import { useState, useEffect, useRef } from 'react'
import type {
  Configuration,
  ProductModel,
  ModelDefinition,
  StepId,
  CustomTextData,
} from '@shared/types'
import { ProductPreview } from './ProductPreview'
import { CustomTextForm } from './CustomTextForm'
import { ConfigurationBlock } from './ConfigurationBlock'
import { ProductPreviewContent } from './ProductPreviewContent'
import { EmptyStateContent } from './EmptyStateContent'
import { getCompletedDeviceImage } from '@shared/utils/getCompletedDeviceImage'
import { getModelSummary } from '../lib/getModelSummary'
import {
  shouldShowCustomTextForm,
  getCustomTextConfig,
  getMaxLength,
} from '@entities/product/customTextConfig'
import { getEffectiveLineCount } from '@shared/utils/customTextHelpers'
import { Lock } from 'lucide-react'
import { useTranslation, useLanguage } from '@shared/i18n'

type TabId = 'edit' | 'preview'

interface MainPanelProps {
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
  imagePaths?: string[]
  onCustomTextSubmit: (data: Omit<CustomTextData, 'submitted'>) => void
  className?: string
}

export function MainPanel({
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
  imagePaths,
  onCustomTextSubmit,
  className = '',
}: MainPanelProps) {
  const { t } = useTranslation()
  const { lang } = useLanguage()
  const [activeTab, setActiveTab] = useState<TabId>('edit')
  const [modelDescription, setModelDescription] = useState<string | null>(null)
  const prevIsComplete = useRef(false)

  const showCustomTextForm = shouldShowCustomTextForm(
    model,
    config,
    customText,
    productModel.isComplete,
  )
  const customTextConfig = getCustomTextConfig(model.id)

  useEffect(() => {
    prevIsComplete.current = false
    setActiveTab('edit')
  }, [model.id])

  useEffect(() => {
    if (actionsReady && !prevIsComplete.current) {
      setActiveTab('preview')
    }
    if (!actionsReady && prevIsComplete.current) {
      setActiveTab('edit')
    }
    prevIsComplete.current = actionsReady
  }, [actionsReady])

  useEffect(() => {
    let cancelled = false
    if (productModel.isComplete) {
      const currentLang = lang as 'en' | 'uk'
      getModelSummary(productModel.fullCode, model.id, currentLang).then((desc) => {
        if (!cancelled) setModelDescription(desc)
      })
    } else {
      setModelDescription(null)
    }
    return () => {
      cancelled = true
    }
  }, [productModel.isComplete, productModel.fullCode, model.id, lang])

  const handleCustomTextSubmit = (data: Omit<CustomTextData, 'submitted'>) => {
    onCustomTextSubmit(data)
    setActiveTab('preview')
  }

  const { imagePath, reason } = getCompletedDeviceImage({
    fullCode: productModel.fullCode,
    modelId: model.id,
    config,
    isComplete: productModel.isComplete,
  })

  const getFormMaxLength = (): number => {
    if (!customTextConfig) return 20
    const effectiveLineCount = getEffectiveLineCount(
      customTextConfig.variant,
      customText?.lineCount ?? 1,
    )
    return getMaxLength(model.id, effectiveLineCount)
  }

  const getScriptRestriction = (): 'latin' | 'cyrillic' | null => {
    const lang = config.language
    if (lang === 'EN') return 'latin'
    if (lang === 'UA') return 'cyrillic'
    return null
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex min-h-[600px] flex-1 flex-col overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200">
          <div className="flex">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`
                relative px-5 py-3 text-[15px] font-medium transition-colors md:text-sm
                ${
                  activeTab === 'edit'
                    ? 'text-slate-900'
                    : 'text-slate-500 hover:text-slate-700 md:text-slate-400 md:hover:text-slate-600'
                }
              `}
            >
              {t('configurator.editSelections')}
              {activeTab === 'edit' && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-brand-600" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`
                relative px-5 py-3 text-[15px] font-medium transition-colors md:text-sm
                ${
                  activeTab === 'preview'
                    ? 'text-slate-900'
                    : 'text-slate-500 hover:text-slate-700 md:text-slate-400 md:hover:text-slate-600'
                }
              `}
            >
              {t('configurator.productPreview')}
              {activeTab === 'preview' && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-brand-600" />
              )}
            </button>
          </div>
        </div>

        <div className="tech-grid relative flex-1">
          {activeTab === 'edit' && (
            <div className="h-full p-8">
              {isInMyList && (
                <div className="mb-4 flex items-center gap-2 rounded-sm border border-amber-200 bg-amber-50 px-3 py-2">
                  <Lock className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                  <span className="text-xs font-medium text-amber-700">
                    {t('configurator.lockedBanner')}
                  </span>
                </div>
              )}
              {showCustomTextForm && customTextConfig ? (
                <CustomTextForm
                  variant={customTextConfig.variant}
                  maxLength={getFormMaxLength()}
                  maxLines={customTextConfig.maxLines}
                  onSubmit={handleCustomTextSubmit}
                  initialData={customText ?? undefined}
                  scriptRestriction={getScriptRestriction()}
                />
              ) : (
                <ProductPreview model={model} config={config} onEditStep={onEditStep} />
              )}
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="flex h-full flex-col">
              {imagePath ? (
                <ProductPreviewContent
                  imagePath={imagePath}
                  imagePaths={imagePaths}
                  productCode={productModel.fullCode}
                />
              ) : (
                <EmptyStateContent reason={reason} />
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end border-t border-slate-200 p-3 font-mono text-[10px] text-slate-400">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                productModel.isComplete ? 'bg-green-400' : 'bg-slate-300'
              }`}
            />
            {productModel.isComplete
              ? t('configurator.configured')
              : t('configurator.waitingForInput')}
          </div>
        </div>
      </div>

      <ConfigurationBlock
        model={model}
        config={config}
        customText={customText}
        productModel={productModel}
        completionPercent={completionPercent}
        completedSteps={completedSteps}
        totalSteps={totalSteps}
        onEditStep={onEditStep}
        onReset={onReset}
        onAddToMyList={onAddToMyList}
        onRemoveFromMyList={onRemoveFromMyList}
        isInMyList={isInMyList}
        actionsReady={actionsReady}
        productName={productName}
        productDescription={productDescription}
        productImageUrl={productImageUrl}
      />

      {modelDescription && (
        <div className="mt-4 rounded-sm border border-slate-200 bg-white p-5 shadow-sm">
          <span className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {t('configurator.modelDescription', { defaultValue: 'Model Description' })}
          </span>
          <p className="text-sm leading-relaxed text-slate-600">{modelDescription}</p>
        </div>
      )}
    </div>
  )
}
