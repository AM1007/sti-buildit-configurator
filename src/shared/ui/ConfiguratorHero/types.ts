import type { ModelId } from '@shared/types'

export interface HeroMediaItem {
  type: 'image' | 'video'
  src: string
  alt?: string
  title?: string
}

export interface ConfiguratorHeroData {
  modelId: ModelId
  title: string
  description: string
  media: HeroMediaItem[]
}
