import { useState } from 'react'
import { CircleCheck } from 'lucide-react'
import { useIsMobile } from '@shared/hooks/useMediaQuery'
import { useTranslation } from '@shared/i18n'

interface HeroContentProps {
  productName: string
  title: string
  description: string
  series?: string
  badges?: string[]
}

export function HeroContent({
  productName,
  description,
  series,
  badges,
}: HeroContentProps) {
  const { t } = useTranslation()
  const isMobile = useIsMobile()
  const [expanded, setExpanded] = useState(false)
  const hasBadges = series || (badges && badges.length > 0)

  return (
    <div className="flex flex-col gap-4">
      {hasBadges && (
        <div className="flex flex-wrap items-center gap-3">
          {series && (
            <span className="inline-flex items-center rounded-sm border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-[13px] font-medium text-slate-600 md:px-2 md:py-1 md:text-xs">
              {series}
            </span>
          )}
          {series && badges && badges.length > 0 && (
            <div className="h-4 w-px bg-slate-200" />
          )}
          {badges?.map((badge, index) => (
            <span
              key={index}
              className={`flex items-center gap-1 text-[13px] font-medium md:text-xs ${
                index === 0 ? 'text-brand-600' : 'text-slate-600 md:text-slate-500'
              }`}
            >
              <CircleCheck className="h-3.5 w-3.5 md:h-3 md:w-3" />
              {badge}
            </span>
          ))}
        </div>
      )}

      {!hasBadges && (
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center rounded-sm border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-[13px] font-medium text-slate-600 md:px-2 md:py-1 md:text-xs">
            {productName}
          </span>
        </div>
      )}

      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
        {productName}
      </h1>

      <div className="relative">
        <article
          className={`max-w-2xl text-[15px] leading-relaxed text-slate-600 md:text-base md:text-slate-500 ${
            isMobile && !expanded ? 'line-clamp-3' : ''
          }`}
          dangerouslySetInnerHTML={{ __html: description }}
        />
        {isMobile && !expanded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="mt-1.5 text-[13px] font-semibold text-brand-600 active:text-brand-700"
          >
            {t('common.readMore', { defaultValue: 'Read more' })} ▸
          </button>
        )}
      </div>
    </div>
  )
}
