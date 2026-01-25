import { allConfigurators } from "../data/catalog";
import { ConfiguratorCard } from "../components/ConfiguratorCard";
import { useTranslation } from "../i18n";

export function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative flex min-h-106.5 items-center py-10 lg:min-h-145 lg:py-12">
        <img
          alt=""
          src="/hero.avif"
          className="absolute inset-0 z-0 hidden h-full w-full object-cover md:block"
        />
        <img
          alt=""
          src="/hero-portrait.avif"
          className="absolute inset-0 z-0 block h-full w-full object-cover md:hidden"
        />
        
        <span className="absolute inset-0 z-1 h-full w-full bg-black/60" />
        
        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-5 md:gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16 xl:gap-24">
           
            <div className="order-2 flex flex-col gap-5 overflow-hidden wrap-break-word text-center lg:order-1 lg:gap-8 lg:text-left">
              <h1 className="max-w-185 text-4xl font-bold text-white md:text-5xl lg:text-5xl xl:text-6xl">
                {t("home.heroTitle")}
              </h1>
              <p className="text-base font-normal text-white lg:text-xl">
                {t("home.heroDescription")}
              </p>
            </div>
            
            <div className="relative order-1 h-fit overflow-hidden lg:order-2">
              <img
                alt="Build It Configurator Device"
                src="/hero-device.webp"
                width={800}
                height={800}
                className="block h-full w-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto w-full max-w-301.5 px-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
            {allConfigurators.map((config) => (
              <ConfiguratorCard key={config.id} config={config} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}