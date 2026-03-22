import { useEffect } from 'react'
import type {
  Configuration,
  StepId,
  OptionId,
  ModelDefinition,
  CustomTextData,
} from '@shared/types'
import { StepSelector } from './StepSelector'
import { CustomTextDisplay } from './CustomTextDisplay'
import { hasSubmittedCustomText } from '@shared/utils/customTextHelpers'
import { useModelTranslations } from '../hooks/useModelTranslations'
import { getOptionsWithAvailability } from '@features/configurator/lib/filterOptions'

const AUTOSELECT_MODELS = new Set(['global-reset'])

interface SidebarProps {
  model: ModelDefinition
  config: Configuration
  customText: CustomTextData | null
  currentStep: StepId | null
  modelId: string
  onSelectOption: (stepId: StepId, optionId: OptionId) => void
  onClearOption: (stepId: StepId) => void
  onSetCurrentStep: (stepId: StepId) => void
  getStepTitle?: (stepId: string) => string
  getOptionLabel?: (stepId: string, optionId: string) => string
  className?: string
}

export function Sidebar({
  model,
  config,
  customText,
  currentStep,
  modelId,
  onSelectOption,
  onClearOption,
  onSetCurrentStep,
  className = '',
}: SidebarProps) {
  const { getStepTitle, getOptionLabel } = useModelTranslations(modelId)

  const orderedSteps = model.stepOrder
    .map((stepId) => model.steps.find((s) => s.id === stepId))
    .filter((step): step is NonNullable<typeof step> => step !== undefined)

  const visibleSteps = orderedSteps.filter((step) => {
    const options = getOptionsWithAvailability(step, config, model.id)
    return options.some(({ availability }) => availability.available)
  })

  useEffect(() => {
    if (!AUTOSELECT_MODELS.has(model.id)) return
    for (const step of visibleSteps) {
      if (config[step.id]) continue
      const options = getOptionsWithAvailability(step, config, model.id)
      const available = options.filter(({ availability }) => availability.available)
      if (available.length === 1) {
        onSelectOption(step.id, available[0].option.id)
      }
    }
  }, [model.id, config.series])

  const showCustomTextDisplay = hasSubmittedCustomText(model.id, config, customText)

  const totalSteps = visibleSteps.length

  return (
    <aside className={`flex flex-col gap-4 ${className}`}>
      <div className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm">
        {visibleSteps.map((step, index) => (
          <StepSelector
            key={step.id}
            step={step}
            stepIndex={index + 1}
            totalSteps={totalSteps}
            isOpen={currentStep === step.id}
            isCompleted={!!config[step.id]}
            selectedOptionId={config[step.id] ?? null}
            config={config}
            modelId={model.id}
            onSelect={(optionId) => onSelectOption(step.id, optionId)}
            onClear={() => onClearOption(step.id)}
            onToggle={() => onSetCurrentStep(step.id)}
            getStepTitle={getStepTitle}
            getOptionLabel={getOptionLabel}
          />
        ))}

        {showCustomTextDisplay && customText && (
          <div className="border-t border-slate-100 p-4">
            <CustomTextDisplay customText={customText} />
          </div>
        )}
      </div>
    </aside>
  )
}
