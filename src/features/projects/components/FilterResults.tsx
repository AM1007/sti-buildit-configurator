import { LayoutGrid, List } from 'lucide-react'
import { useTranslation } from '@shared/i18n'

type ViewMode = 'grid' | 'list'

interface ResultCounterProps {
  shown: number
  total: number
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  isPaginated: boolean
  onTogglePagination: () => void
}

export function ResultCounter({
  shown,
  total,
  viewMode,
  onViewModeChange,
  isPaginated,
  onTogglePagination,
}: ResultCounterProps) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onTogglePagination}
        className="text-[13px] text-slate-500 hover:text-slate-600 transition-colors cursor-pointer whitespace-nowrap md:text-xs md:text-slate-400 md:hover:text-slate-600"
      >
        {isPaginated
          ? t('filter.showingOf', { shown: String(shown), total: String(total) })
          : t('grid.showingAll')}
      </button>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onViewModeChange('list')}
          aria-label={t('view.list')}
          className={`rounded-sm p-2 transition-colors cursor-pointer md:p-1.5 ${
            viewMode === 'list'
              ? 'bg-slate-100 text-slate-900'
              : 'text-slate-500 hover:text-slate-600 md:text-slate-400'
          }`}
        >
          <List className="h-[18px] w-[18px] md:h-4 md:w-4" />
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange('grid')}
          aria-label={t('view.grid')}
          className={`rounded-sm p-2 transition-colors cursor-pointer md:p-1.5 ${
            viewMode === 'grid'
              ? 'bg-slate-100 text-slate-900'
              : 'text-slate-500 hover:text-slate-600 md:text-slate-400'
          }`}
        >
          <LayoutGrid className="h-[18px] w-[18px] md:h-4 md:w-4" />
        </button>
      </div>
    </div>
  )
}

interface EmptyStateProps {
  onClear: () => void
}

export function EmptyState({ onClear }: EmptyStateProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <p className="text-[15px] text-slate-600 mb-4 md:text-sm md:text-slate-500">
        {t('filter.noResults')}
      </p>
      <button
        type="button"
        onClick={onClear}
        className="w-full md:w-auto px-6 py-2.5 text-[13px] font-medium text-white bg-slate-900 rounded-sm hover:bg-slate-800 transition-colors cursor-pointer md:py-2 md:text-xs"
      >
        {t('filter.clearFilters')}
      </button>
    </div>
  )
}
