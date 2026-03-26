import { useMemo } from 'react'
import type { Step, OptionId, Configuration, ModelId, Option } from '@shared/types'
import { getModelById } from '@entities/product/models'
import { OptionCard } from './OptionCard'
import { getOptionsWithAvailability } from '@features/configurator/lib/filterOptions'
import { useTranslation } from '@shared/i18n'
import { ChevronDown, ChevronRight, Check, EyeOff } from 'lucide-react'

interface StepSelectorProps {
  step: Step
  stepIndex: number
  totalSteps: number
  isOpen: boolean
  isCompleted: boolean
  selectedOptionId: OptionId | null
  config: Configuration
  modelId: ModelId
  onSelect: (optionId: OptionId) => void
  onClear: () => void
  onToggle: () => void
  getStepTitle?: (stepId: string) => string
  getOptionLabel?: (stepId: string, optionId: string) => string
}

function formatStepNumber(index: number): string {
  return index.toString().padStart(2, '0')
}

function resolveOptionImage(
  option: Option,
  config: Configuration,
  modelId: ModelId,
): Option {
  if (!option.imageMap) return option
  const model = getModelById(modelId)
  if (!model?.primaryDependencyStep) return option
  const depValue = config[model.primaryDependencyStep]
  if (!depValue) return option
  const resolved = option.imageMap[depValue]
  if (!resolved) return option
  return { ...option, image: resolved }
}

export function StepSelector({
  step,
  stepIndex,
  isOpen,
  isCompleted,
  selectedOptionId,
  config,
  modelId,
  onSelect,
  onClear,
  onToggle,
  getStepTitle,
  getOptionLabel,
}: StepSelectorProps) {
  const { t } = useTranslation()
  const selectedOption = step.options.find((o) => o.id === selectedOptionId)
  const optionsWithStatus = getOptionsWithAvailability(step, config, modelId)

  const availableOptions = optionsWithStatus.filter(
    ({ availability }) => availability.available,
  )
  const hiddenCount = optionsWithStatus.length - availableOptions.length

  const resolvedOptions = useMemo(
    () =>
      availableOptions.map(({ option, availability }) => ({
        option: resolveOptionImage(option, config, modelId),
        availability,
      })),
    [availableOptions, config, modelId],
  )

  const handleOptionClick = (optionId: OptionId) => {
    if (optionId === selectedOptionId) {
      onClear()
    } else {
      onSelect(optionId)
    }
  }

  const title = getStepTitle ? getStepTitle(step.id) : step.title
  const selectedLabel = selectedOption
    ? getOptionLabel
      ? getOptionLabel(step.id, selectedOption.id)
      : selectedOption.label
    : null

  return (
    <div className={`relative ${stepIndex > 1 ? 'border-t border-slate-100' : ''}`}>
      {isOpen && <div className="absolute bottom-0 left-0 top-0 w-[3px] bg-brand-600" />}

      <button
        type="button"
        className="group flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-slate-50"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`step-${step.id}-content`}
      >
        <div className="flex items-center gap-3">
          <StepIndicator
            stepIndex={stepIndex}
            isOpen={isOpen}
            isCompleted={isCompleted}
          />
          <div className="flex flex-col">
            <span
              className={`text-[15px] font-medium transition-colors md:text-sm ${
                isOpen
                  ? 'text-slate-900'
                  : isCompleted
                    ? 'text-slate-700'
                    : 'text-slate-600 group-hover:text-slate-700 md:text-slate-500'
              }`}
            >
              {title}
            </span>
            {!isOpen && selectedLabel && (
              <span className="mt-0.5 text-[13px] text-slate-500 md:text-xs md:text-slate-400">
                {selectedLabel}
              </span>
            )}
            {!isOpen && !selectedLabel && (
              <span className="mt-0.5 text-[13px] italic text-slate-400 md:text-xs md:text-slate-300">
                {t('configurator.noSelection')}
              </span>
            )}
          </div>
        </div>

        {isOpen ? (
          <ChevronDown className="h-5 w-5 text-slate-400 md:h-4 md:w-4" />
        ) : (
          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-500 md:h-4 md:w-4 md:text-slate-300 md:group-hover:text-slate-400" />
        )}
      </button>

      <div
        className="overflow-hidden transition-all"
        style={{ display: isOpen ? 'block' : 'none' }}
      >
        <div className="px-3 pb-6 pl-9 md:px-4 md:pl-11">
          <div
            id={`step-${step.id}-content`}
            className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3"
            role="listbox"
            aria-label={`${title} options`}
          >
            {resolvedOptions.map(({ option }) => (
              <OptionCard
                key={option.id}
                option={option}
                isSelected={option.id === selectedOptionId}
                isAvailable={true}
                onSelect={() => handleOptionClick(option.id)}
                label={getOptionLabel ? getOptionLabel(step.id, option.id) : option.label}
              />
            ))}
          </div>

          {hiddenCount > 0 && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
              <EyeOff className="h-3 w-3" />
              <span>
                {t('configurator.optionsHidden', { count: hiddenCount.toString() })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface StepIndicatorProps {
  stepIndex: number
  isOpen: boolean
  isCompleted: boolean
}

function StepIndicator({ stepIndex, isOpen, isCompleted }: StepIndicatorProps) {
  if (isCompleted && !isOpen) {
    return (
      <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full border border-brand-600 bg-brand-600 text-white md:h-6 md:w-6">
        <Check className="h-3.5 w-3.5 md:h-3 md:w-3" strokeWidth={3} />
      </span>
    )
  }

  if (isOpen) {
    return (
      <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full border border-brand-600 bg-red-50 font-mono text-xs font-medium text-brand-600 md:h-6 md:w-6 md:text-[10px]">
        {formatStepNumber(stepIndex)}
      </span>
    )
  }

  return (
    <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full border border-slate-200 font-mono text-xs font-medium text-slate-500 group-hover:border-slate-300 md:h-6 md:w-6 md:text-[10px] md:text-slate-400">
      {formatStepNumber(stepIndex)}
    </span>
  )
}
