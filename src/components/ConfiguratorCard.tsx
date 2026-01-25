import { Link } from "react-router-dom";
import type { ConfiguratorMeta, ColourId } from "../data/catalog";
import { useTranslation } from "../i18n";
import { useModelTranslations } from "../hooks/useModelTranslations";

interface ConfiguratorCardProps {
  config: ConfiguratorMeta;
}

const COLOUR_MAP: Record<ColourId, string> = {
  yellow: "#F9F800",
  red: "#E90203",
  white: "#FFFFFF",
  green: "#165C05",
  blue: "#040866",
  orange: "#FFA500",
  clear: "transparent",
};

export function ConfiguratorCard({ config }: ConfiguratorCardProps) {
  const { t } = useTranslation();
  const { meta } = useModelTranslations(config.slug);
  const href = `/configurator/${config.slug}`;

  const displayDescription = meta?.heroTitle ?? config.description;

  return (
    <Link to={href} aria-label={config.name} className="block">
      <article className="group/primary-card flex h-full flex-col justify-between bg-white transition-all duration-300 hover:drop-shadow-xl">
        <div className="relative flex-1 border-2 border-b-0 border-solid border-gray-200 transition-all group-hover/primary-card:border-transparent">
          <div className="relative h-auto w-full px-11 py-8 lg:px-12">
            <img
              alt={`${config.name} featured product model`}
              loading="lazy"
              width="600"
              height="600"
              decoding="async"
              className="w-full lg:object-cover"
              src={config.imagePath}
            />
          </div>

          <div className="flex flex-1 flex-col gap-1 px-4 pb-3 pt-4 lg:py-4">
            <h3 className="font-bold text-lg lg:text-xl flex min-h-11 w-full items-center text-black lg:min-h-17">
              <span className="line-clamp-2 w-full text-left">{config.name}</span>
            </h3>

            <span className="font-normal text-sm lg:text-base line-clamp-2 min-h-12 text-left text-gray-500">
              {displayDescription}
            </span>

            <div className="grid grid-cols-1 gap-0.5 text-gray-500">
              {config.features && config.features.length > 0 && (
                <div className="flex items-center justify-start gap-2 py-0.5">
                  <span className="font-normal text-sm">{t("card.features")}:</span>
                  <div className="flex gap-2">
                    {config.features.map((feature) => (
                      <img
                        key={feature}
                        alt={`${feature} feature`}
                        loading="lazy"
                        width="16"
                        height="16"
                        decoding="async"
                        src={`/icons/${feature}.webp`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {config.colours && config.colours.length > 0 && (
                <div className="font-normal text-sm flex items-center justify-start gap-2 py-0.5">
                  {t("card.colours")}:
                  <div className="flex items-center gap-1">
                    {config.colours.map((colour) => (
                      <div
                        key={colour}
                        className="block h-4 w-4 overflow-hidden border border-solid border-gray-200"
                        style={{ backgroundColor: COLOUR_MAP[colour] }}
                        title={colour}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <span className="cursor-pointer inline-flex items-center justify-center relative ring-offset-0 transition-all duration-300 ease-in-out focus-visible:outline-none box-border font-bold text-base gap-1.5 px-5 py-1 min-h-10 border-4 lg:gap-2.5 lg:px-7 lg:py-3 lg:min-h-14 lg:text-lg bg-brand-600 border-brand-600 text-white hover:bg-brand-700 hover:border-brand-700 w-full">
          {t("card.buildYourModel")}
          <span className="inline-grid leading-none text-inherit">
            <ArrowRightIcon />
          </span>
        </span>
      </article>
    </Link>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13L5 11ZM19.7071 12.7071C20.0976 12.3166 20.0976 11.6834 19.7071 11.2929L13.3431 4.92893C12.9526 4.53841 12.3195 4.53841 11.9289 4.92893C11.5384 5.31946 11.5384 5.95262 11.9289 6.34315L17.5858 12L11.9289 17.6569C11.5384 18.0474 11.5384 18.6805 11.9289 19.0711C12.3195 19.4616 12.9526 19.4616 13.3431 19.0711L19.7071 12.7071ZM5 13L19 13L19 11L5 11L5 13Z"
        fill="currentColor"
      />
    </svg>
  );
}