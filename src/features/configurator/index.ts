export {
  useConfigurationStore,
  useCurrentModelId,
  useConfig,
  useCustomText,
  useCurrentStep,
} from './store/configurationStore'

export { useConfiguration } from './hooks/useConfiguration'
export { useModelTranslations } from './hooks/useModelTranslations'

export {
  isConfigurationComplete,
  getMissingRequiredSteps,
  getCompletionPercentage,
  getOptionsWithAvailability,
  getVisibleSteps,
  getSelectionsToReset,
  filterAvailableOptions,
  isOptionAvailable,
  isSelectionStillValid,
} from './lib/filterOptions'

export { getHeroContent } from './lib/heroContent'
export { getModelDescription } from './lib/getModelDescription'
export { getModelSummary } from './lib/getModelSummary'
export { getHeroDescription } from './lib/getHeroDescription'
export { downloadProductPdf, printProductPdf } from './lib/generateProductPdf'

export { BuildItCalculator } from './components/BuildItCalculator'
export { ConfigurationBlock } from './components/ConfigurationBlock'
export { CustomTextDisplay } from './components/CustomTextDisplay'
export { CustomTextForm } from './components/CustomTextForm'
export { DesktopLayout } from './components/DesktopLayout'
export { EmptyStateContent } from './components/EmptyStateContent'
export { MainPanel } from './components/MainPanel'
export { MobileTabletLayout } from './components/MobileTabletLayout'
export { OptionBottomSheet } from './components/OptionBottomSheet'
export { OptionCard } from './components/OptionCard'
export { PdfMenu } from './components/PdfMenu'
export { ProductModelDisplay } from './components/ProductModelDisplay'
export { ProductPreview } from './components/ProductPreview'
export { ProductPreviewContent } from './components/ProductPreviewContent'
export { Sidebar } from './components/Sidebar'
export { StepSelector } from './components/StepSelector'
