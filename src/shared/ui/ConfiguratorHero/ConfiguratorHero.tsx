import type { ConfiguratorHeroData } from '@shared/ui/ConfiguratorHero/types'
import { HeroGallery } from '@shared/ui/ConfiguratorHero/HeroGallery'
import { HeroContent } from '@shared/ui/ConfiguratorHero/HeroContent'
import { useModelTranslations } from '@features/configurator'

interface ConfiguratorHeroProps {
  data: ConfiguratorHeroData
  productName: string
}

export function ConfiguratorHero({ data, productName }: ConfiguratorHeroProps) {
  const { meta } = useModelTranslations(data.modelId)

  const title = meta?.heroTitle ?? data.title
  const description = meta?.heroDescription ?? data.description

  return (
    <section className="border-b border-slate-200 bg-white py-6 md:py-10">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <HeroGallery media={data.media} productName={productName} />
          </div>

          <div className="flex flex-col justify-center lg:col-span-7">
            <HeroContent
              productName={meta?.name ?? productName}
              title={title}
              description={description}
              series={meta?.series}
              badges={meta?.badges}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
