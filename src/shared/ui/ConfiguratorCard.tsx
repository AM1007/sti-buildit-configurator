import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CloudRain, Volume2, Flame, RotateCcw, KeyRound } from 'lucide-react'
import type { ConfiguratorMeta, ColourId, FunctionalTag } from '@entities/product'
import { useTranslation } from '@shared/i18n'
import { useModelTranslations } from '@features/configurator/hooks/useModelTranslations'
import { getSkuPrefix } from '@shared/utils/getSkuPrefix'

type ViewMode = 'grid' | 'list'

interface ConfiguratorCardProps {
  config: ConfiguratorMeta
  index?: number
  viewMode?: ViewMode
}

const COLOUR_MAP: Record<ColourId, string> = {
  yellow: '#F9F800',
  red: '#E90203',
  white: '#FFFFFF',
  green: '#165C05',
  blue: '#040866',
  orange: '#FFA500',
  clear: 'transparent',
}

const TAG_SPEC: Record<
  FunctionalTag,
  { icon: React.ComponentType<{ className?: string }>; labelKey: string }
> = {
  'weather-rated': { icon: CloudRain, labelKey: 'tag.weatherRated' },
  sounder: { icon: Volume2, labelKey: 'tag.sounder' },
  'fire-alarm': { icon: Flame, labelKey: 'tag.fireAlarm' },
  'reset-device': { icon: RotateCcw, labelKey: 'tag.resetDevice' },
  'key-operated': { icon: KeyRound, labelKey: 'tag.keyOperated' },
}

const FUNCTIONAL_TAG_SET = new Set<string>(Object.keys(TAG_SPEC))

export function ConfiguratorCard({
  config,
  index = 0,
  viewMode = 'grid',
}: ConfiguratorCardProps) {
  const { t } = useTranslation()
  const { meta } = useModelTranslations(config.slug)
  const href = `/configurator/${config.slug}`
  const displayDescription = meta?.heroTitle ?? config.description
  const skuPrefix = getSkuPrefix(config.slug)
  const functionalTags = config.tags.filter((tag) =>
    FUNCTIONAL_TAG_SET.has(tag),
  ) as FunctionalTag[]

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.03 }}
      >
        <Link to={href} aria-label={config.name} className="block">
          <article className="group flex items-center gap-4 bg-white p-4 transition-shadow duration-200 hover:z-10 md:gap-6 md:p-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center bg-slate-50/50 md:h-28 md:w-28">
              <img
                alt={`${config.name} featured product model`}
                loading="lazy"
                width="112"
                height="112"
                decoding="async"
                className="h-full w-full object-contain p-2"
                src={config.imagePath}
              />
            </div>

            <div className="flex flex-1 flex-col gap-1.5 overflow-hidden">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] text-slate-500 md:text-[10px] md:text-slate-400">
                  {skuPrefix}
                </span>
                {config.colours && config.colours.length > 0 && (
                  <div className="flex items-center gap-0.5">
                    {config.colours.map((colour) => (
                      <div
                        key={colour}
                        className="h-3 w-3 border border-slate-200 md:h-2.5 md:w-2.5"
                        style={{ backgroundColor: COLOUR_MAP[colour] }}
                        title={colour}
                      />
                    ))}
                  </div>
                )}
              </div>

              <h3 className="text-[15px] font-semibold text-slate-900 group-hover:text-brand-600 transition-colors truncate md:text-sm">
                {config.name}
              </h3>

              <p className="text-[13px] text-slate-600 line-clamp-2 md:line-clamp-1 md:text-xs md:text-slate-500">
                {displayDescription}
              </p>

              {functionalTags.length > 0 && (
                <div className="flex items-center gap-3">
                  {functionalTags.map((tag) => {
                    const spec = TAG_SPEC[tag]
                    const Icon = spec.icon
                    return (
                      <div
                        key={tag}
                        className="flex items-center gap-1 text-[11px] text-slate-500 md:text-[10px] md:text-slate-400"
                      >
                        <Icon className="h-3.5 w-3.5 md:h-3 md:w-3" />
                        {t(spec.labelKey)}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="hidden md:block shrink-0">
              <span className="inline-flex items-center rounded-sm bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors group-hover:bg-brand-600">
                {t('card.buildYourModel')}
              </span>
            </div>
          </article>
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
    >
      <Link to={href} aria-label={config.name} className="block h-full">
        <article className="group relative flex h-full flex-col bg-white p-5 transition-shadow duration-200 hover:z-10 md:p-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[11px] text-slate-500 md:text-[10px] md:text-slate-400">
              {skuPrefix}
            </span>
            {config.colours && config.colours.length > 0 && (
              <div className="flex items-center gap-0.5">
                {config.colours.map((colour) => (
                  <div
                    key={colour}
                    className="h-3 w-3 border border-slate-200 md:h-2.5 md:w-2.5"
                    style={{ backgroundColor: COLOUR_MAP[colour] }}
                    title={colour}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="mb-4 flex items-center justify-center py-4 bg-slate-50/50 md:py-6">
            <img
              alt={`${config.name} featured product model`}
              loading="lazy"
              width="600"
              height="600"
              decoding="async"
              className="h-auto w-full object-contain px-4 md:px-6"
              src={config.imagePath}
            />
          </div>

          <h3 className="text-[15px] font-semibold text-slate-900 group-hover:text-brand-600 transition-colors md:text-sm">
            {config.name}
          </h3>

          <p className="mt-1 mb-4 text-[13px] leading-relaxed text-slate-600 line-clamp-2 md:text-xs md:text-slate-500">
            {displayDescription}
          </p>

          <div className="mt-auto">
            {functionalTags.length > 0 && (
              <div className="mb-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3">
                {functionalTags.map((tag) => {
                  const spec = TAG_SPEC[tag]
                  const Icon = spec.icon
                  return (
                    <div
                      key={tag}
                      className="flex items-center gap-1 text-[11px] text-slate-500 md:text-[10px] md:text-slate-400"
                    >
                      <Icon className="h-3.5 w-3.5 md:h-3 md:w-3" />
                      {t(spec.labelKey)}
                    </div>
                  )
                })}
              </div>
            )}

            <span className="block w-full rounded-sm bg-brand-600 py-2.5 text-center text-[13px] font-semibold text-white transition-colors group-hover:bg-brand-700 md:py-2 md:text-xs">
              {t('card.buildYourModel')}
            </span>
          </div>
        </article>
      </Link>
    </motion.div>
  )
}
