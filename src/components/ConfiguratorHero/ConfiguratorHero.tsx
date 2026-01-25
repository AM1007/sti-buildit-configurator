import type { ConfiguratorHeroData } from "./types";
import { HeroGallery } from "./HeroGallery";
import { HeroContent } from "./HeroContent";
import { useModelTranslations } from "../../hooks/useModelTranslations";

interface ConfiguratorHeroProps {
  data: ConfiguratorHeroData;
  productName: string;
}

export function ConfiguratorHero({ data, productName }: ConfiguratorHeroProps) {
  const { meta } = useModelTranslations(data.modelId);

  const title = meta?.heroTitle ?? data.title;
  const description = meta?.heroDescription ?? data.description;

  return (
    <section className="bg-white py-6 lg:py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:gap-16">
          <div className="w-full lg:sticky lg:top-24 lg:w-1/2">
            <HeroGallery media={data.media} productName={productName} />
          </div>

          <div className="w-full lg:w-1/2">
            <HeroContent
              productName={meta?.name ?? productName}
              title={title}
              description={description}
            />
          </div>
        </div>
      </div>
    </section>
  );
}