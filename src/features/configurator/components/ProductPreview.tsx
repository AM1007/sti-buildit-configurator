import type { Configuration, ModelDefinition, StepId } from '@shared/types'
import { PreviewTile } from '@features/projects/components/PreviewTile'
import { useModelTranslations } from '../hooks/useModelTranslations'
import { getVisibleSteps } from '@features/configurator/lib/filterOptions'

interface ProductPreviewProps {
  model: ModelDefinition
  config: Configuration
  onEditStep: (stepId: StepId) => void
}

export function ProductPreview({ model, config, onEditStep }: ProductPreviewProps) {
  const { getStepTitle } = useModelTranslations(model.id)

  const visibleSteps = getVisibleSteps(model, config)

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
      {visibleSteps.map((step) => {
        const isUniversalStopperEnglish =
          (model.id === 'universal-stopper' ||
            model.id === 'low-profile-universal-stopper' ||
            model.id === 'enviro-stopper') &&
          step.id === 'language' &&
          config.language === 'EN'

        if (isUniversalStopperEnglish) {
          return null
        }

        const selectedOptionId = config[step.id]
        const selectedOption = step.options.find((o) => o.id === selectedOptionId)

        return (
          <PreviewTile
            key={step.id}
            stepId={step.id}
            label={getStepTitle(step.id)}
            image={selectedOption?.image}
            isSelected={!!selectedOptionId}
            onEdit={onEditStep}
          />
        )
      })}
    </div>
  )
}
