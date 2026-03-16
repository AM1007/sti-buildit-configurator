import type { ModelDefinition, CustomTextData, Configuration } from '@shared/types'
import { buildProductModel } from '@entities/product/buildProductModel'
import { Sidebar } from './Sidebar'
import { MainPanel } from './MainPanel'

interface DesktopLayoutProps {
  model: ModelDefinition
  config: Configuration
  customText: CustomTextData | null
  currentStep: string | null
  completionPercent: number
  completedSteps: number
  totalSteps: number
  productModel: ReturnType<typeof buildProductModel>
  selectOption: (stepId: string, optionId: string) => void
  clearSelection: (stepId: string) => void
  setCurrentStep: (stepId: string) => void
  onEditStep: (stepId: string) => void
  onReset: () => void
  onAddToMyList: () => void
  onRemoveFromMyList: () => void
  isInMyList: boolean
  actionsReady: boolean
  productName: string
  heroDescription?: string
  imagePath: string | null
  onCustomTextSubmit: (data: Omit<CustomTextData, 'submitted'>) => void
}

export function DesktopLayout({
  model,
  config,
  customText,
  currentStep,
  completionPercent,
  completedSteps,
  totalSteps,
  productModel,
  selectOption,
  clearSelection,
  setCurrentStep,
  onEditStep,
  onReset,
  onAddToMyList,
  onRemoveFromMyList,
  isInMyList,
  actionsReady,
  productName,
  heroDescription,
  imagePath,
  onCustomTextSubmit,
}: DesktopLayoutProps) {
  return (
    <div className="mx-auto flex max-w-7xl items-start gap-6 px-6 pb-8 pt-8 lg:px-8">
      <Sidebar
        model={model}
        config={config}
        customText={customText}
        currentStep={currentStep}
        modelId={model.id}
        onSelectOption={(stepId, optionId) => selectOption(stepId, optionId)}
        onClearOption={(stepId) => clearSelection(stepId)}
        onSetCurrentStep={setCurrentStep}
        className="w-[520px] shrink-0"
      />

      <MainPanel
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
        productDescription={heroDescription}
        productImageUrl={imagePath}
        onCustomTextSubmit={onCustomTextSubmit}
        className="min-w-0 flex-1 sticky top-20"
      />
    </div>
  )
}
