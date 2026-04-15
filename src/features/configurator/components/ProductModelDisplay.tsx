import { Pencil } from 'lucide-react'
import type { ProductModel, ModelDefinition, StepId, Configuration } from '@shared/types'

interface ProductModelDisplayProps {
  model: ModelDefinition
  productModel: ProductModel
  config: Configuration
  onEditStep: (stepId: StepId) => void
}

function resolveLookupValue(model: ModelDefinition, config: Configuration): string {
  const { codeLookup } = model.productModelSchema
  if (!codeLookup) return ''

  const keyParts: string[] = []
  for (const stepId of codeLookup.steps) {
    const val = config[stepId]
    keyParts.push(val ?? '')
  }

  return codeLookup.map[keyParts.join('|')] ?? ''
}

export function ProductModelDisplay({
  model,
  productModel,
  config,
  onEditStep,
}: ProductModelDisplayProps) {
  const { parts } = productModel
  const { partsOrder, separatorMap, baseCode, codeLookup } = model.productModelSchema

  const lookupStepSet = new Set(codeLookup?.steps ?? [])
  const lookupValue = codeLookup ? resolveLookupValue(model, config) : ''
  let lookupRendered = false

  return (
    <div className="flex flex-wrap items-center gap-1 font-mono text-[15px] md:text-sm">
      {baseCode && <span className="font-medium text-slate-900">{baseCode}</span>}

      {partsOrder.map((stepId, index) => {
        if (lookupStepSet.has(stepId)) {
          if (lookupRendered) return null
          lookupRendered = true

          const firstLookupStep = codeLookup!.steps[0]
          const hasValue = !!lookupValue
          const showSeparator =
            separatorMap?.[stepId] === '-' && (baseCode ? true : index > 0)

          return (
            <div key="lookup-combined" className="contents">
              {showSeparator && <span className="text-slate-400">-</span>}

              <button
                type="button"
                onClick={() => onEditStep(firstLookupStep)}
                className={`group relative min-w-10 rounded-sm border px-2.5 py-1.5 text-center transition-colors md:min-w-6 md:px-1.5 md:py-0.5 ${
                  hasValue
                    ? 'border-slate-300 bg-white text-slate-900 hover:border-slate-400'
                    : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300'
                }`}
              >
                {lookupValue || '?'}
                <span className="pointer-events-none absolute -right-1 -top-1 hidden text-slate-400 group-hover:block max-md:hidden!">
                  <Pencil className="h-2.5 w-2.5" />
                </span>
              </button>
            </div>
          )
        }

        const value = parts[stepId] ?? ''
        const separator = separatorMap?.[stepId] ?? ''
        const isLabelStep = stepId === 'label' || stepId === 'installationOptions'
        const isEmpty = !value
        const hasValue = !!value

        const shouldHideEmptyLabel =
          isLabelStep && isEmpty && model.id !== 'call-point-stopper'

        if (shouldHideEmptyLabel) {
          return null
        }

        const isUniversalStopperEnglish =
          (model.id === 'universal-stopper' ||
            model.id === 'low-profile-universal-stopper' ||
            model.id === 'enviro-stopper') &&
          stepId === 'language' &&
          config.language === 'EN'

        if (isUniversalStopperEnglish) {
          return null
        }

        const isCallPointStopperHidden =
          model.id === 'call-point-stopper' &&
          ((stepId === 'colour' && config.colour === 'R') ||
            (stepId === 'label' &&
              ['FIRE', 'EMERGENCY_DOOR', 'EMERGENCY_OPERATE'].includes(
                config.label as string,
              )))

        if (isCallPointStopperHidden) {
          return null
        }

        const isGlobalResetInactiveSeries =
          model.id === 'global-reset' && isEmpty && !value

        if (isGlobalResetInactiveSeries) {
          return null
        }

        const showSeparator = separator === '-' && (baseCode ? true : index > 0)

        return (
          <div key={stepId} className="contents">
            {showSeparator && <span className="text-slate-400">-</span>}

            <button
              type="button"
              onClick={() => onEditStep(stepId)}
              className={`group relative min-w-10 rounded-sm border px-2.5 py-1.5 text-center transition-colors md:min-w-6 md:px-1.5 md:py-0.5 ${
                hasValue
                  ? 'border-slate-300 bg-white text-slate-900 hover:border-slate-400'
                  : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300'
              }`}
            >
              {value || '?'}
              <span className="pointer-events-none absolute -right-1 -top-1 hidden text-slate-400 group-hover:block max-md:hidden!">
                <Pencil className="h-2.5 w-2.5" />
              </span>
            </button>
          </div>
        )
      })}
    </div>
  )
}
