export type ColourId = 'yellow' | 'red' | 'white' | 'green' | 'blue' | 'orange' | 'clear'

export type FeatureId = 'weather' | 'sound'

export type PrimaryTag = 'push-button' | 'call-point' | 'protective-cover' | 'enclosure'

export type FunctionalTag =
  | 'weather-rated'
  | 'sounder'
  | 'reset-device'
  | 'fire-alarm'
  | 'key-operated'

export type ProductTag = PrimaryTag | FunctionalTag

export interface ConfiguratorMeta {
  id: string
  slug: string
  name: string
  description: string
  imagePath: string
  features?: FeatureId[]
  colours?: ColourId[]
  tags: ProductTag[]
  isImplemented: boolean
}
