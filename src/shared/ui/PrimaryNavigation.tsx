import { useState } from 'react'
import {
  LayoutGrid,
  ToggleLeft,
  BellRing,
  ShieldCheck,
  Box,
  ChevronDown,
} from 'lucide-react'
import type { PrimaryTag } from '@entities/product'
import { useTranslation } from '@shared/i18n'
import { FilterBottomSheet } from '@features/projects/components/FilterBottomSheet'

const SEGMENTS: readonly (PrimaryTag | 'all')[] = [
  'all',
  'push-button',
  'call-point',
  'protective-cover',
  'enclosure',
]

const LABEL_KEYS: Record<PrimaryTag | 'all', string> = {
  all: 'filter.all',
  'push-button': 'filter.pushButtons',
  'call-point': 'filter.callPoints',
  'protective-cover': 'filter.covers',
  enclosure: 'filter.enclosures',
}

const ICON_MAP: Record<
  PrimaryTag | 'all',
  React.ComponentType<{ className?: string }>
> = {
  all: LayoutGrid,
  'push-button': ToggleLeft,
  'call-point': BellRing,
  'protective-cover': ShieldCheck,
  enclosure: Box,
}

interface PrimaryNavigationProps {
  value: PrimaryTag | 'all'
  onChange: (tag: PrimaryTag | 'all') => void
  rightSlot?: React.ReactNode
}

export function PrimaryNavigation({
  value,
  onChange,
  rightSlot,
}: PrimaryNavigationProps) {
  const { t } = useTranslation()
  const [sheetOpen, setSheetOpen] = useState(false)
  const isFiltered = value !== 'all'

  const handleSelect = (segment: PrimaryTag | 'all') => {
    onChange(segment)
    setSheetOpen(false)
  }

  const handleClear = () => {
    onChange('all')
  }

  return (
    <>
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex h-11 w-full items-center gap-2 rounded-sm border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
        >
          <LayoutGrid className="h-4 w-4 shrink-0 text-slate-500" />
          <span className="truncate">{t('filter.type')}</span>
          {isFiltered && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-sm bg-brand-600 px-1 text-[11px] font-semibold text-white">
              1
            </span>
          )}
          <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-slate-500" />
        </button>

        <FilterBottomSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          title={t('filter.type')}
          activeCount={isFiltered ? 1 : 0}
          onClear={handleClear}
        >
          <div className="grid grid-cols-2 gap-2">
            {SEGMENTS.map((segment) => {
              const Icon = ICON_MAP[segment]
              const isActive = value === segment
              const isAll = segment === 'all'

              return (
                <button
                  key={segment}
                  type="button"
                  onClick={() => handleSelect(segment)}
                  className={`flex items-center gap-2 rounded-sm border px-3 py-3 text-[13px] font-medium transition-colors md:py-2.5 md:text-xs ${
                    isAll ? 'col-span-2' : ''
                  } ${
                    isActive
                      ? 'border-brand-600 text-brand-600'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="h-4 w-4 md:h-3.5 md:w-3.5" />
                  {t(LABEL_KEYS[segment])}
                </button>
              )
            })}
          </div>
        </FilterBottomSheet>
      </div>

      <nav
        role="tablist"
        aria-label={t('filter.productType')}
        className="sticky top-16 z-40 hidden border-b border-slate-200 bg-white md:block"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar xl:gap-8 pl-2">
            {SEGMENTS.map((segment) => {
              const Icon = ICON_MAP[segment]
              const isActive = value === segment

              return (
                <button
                  key={segment}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  onClick={() => onChange(segment)}
                  className={`group relative flex min-w-max items-center gap-2 py-4 text-sm font-medium transition-colors cursor-pointer ${
                    isActive ? 'text-brand-600' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {t(LABEL_KEYS[segment])}
                  <span
                    className={`absolute bottom-0 left-0 h-0.5 bg-brand-600 transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </button>
              )
            })}
          </div>
          {rightSlot && <div className="hidden xl:flex shrink-0 pr-2">{rightSlot}</div>}
        </div>
      </nav>
    </>
  )
}
