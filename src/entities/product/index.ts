export type { ProductEntry } from './registry'
export {
  PRODUCT_REGISTRY,
  getProduct,
  getProductBySlug,
  getAllProducts,
  getImplementedProducts,
} from './registry'

export {
  buildProductModel,
  isAllRequiredStepsSelected,
  identifyModel,
} from './buildProductModel'

export { getModelById, MODEL_REGISTRY } from './models'

export type {
  ConfiguratorMeta,
  ColourId,
  FeatureId,
  ProductTag,
  PrimaryTag,
  FunctionalTag,
} from './catalog/types'
