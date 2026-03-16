import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Info, Plus } from 'lucide-react'
import { useMyList, useProjectMeta } from '../hooks/useProjectSelectors'
import { useProjectStore } from '@features/projects/store/projectStore'
import { SpecificationTable } from '@features/projects/components/SpecificationTable'
import { SpecificationMobileList } from '@features/projects/components/SpecificationMobileItem'
import { DetailDrawer } from '@features/projects/components/DetailDrawer'
import { DetailBottomSheet } from '@features/projects/components/DetailBottomSheet'
import { AuthPromptBanner } from '@features/auth/components/AuthPromptBanner'
import { useIsMobile } from '@shared/hooks/useMediaQuery'
import { useTranslation, useLanguage } from '@shared/i18n'
import { deserializeMyList } from '@shared/utils/configSerializer'
import { downloadMyListXlsx } from '@shared/utils/generateMyListXlsx'
import { toast } from '@shared/utils/toast'

function useMyListFromUrl() {
  const [searchParams, setSearchParams] = useSearchParams()
  const hasProcessed = useRef(false)
  const { lang } = useLanguage()
  const { t } = useTranslation()

  const setGuestState = useProjectStore((s) => s.setGuestState)
  const setGuestProjectMeta = useProjectStore((s) => s.setGuestProjectMeta)

  useEffect(() => {
    if (hasProcessed.current) return

    const listParam = searchParams.get('list')
    if (!listParam) return

    hasProcessed.current = true

    const parsed = deserializeMyList(listParam)
    if (!parsed) {
      console.warn('Failed to parse My List from URL')
      searchParams.delete('list')
      setSearchParams(searchParams, { replace: true })
      return
    }

    const now = Date.now()
    setGuestState(parsed.items, {
      projectName: parsed.projectMeta.projectName ?? '',
      clientName: parsed.projectMeta.clientName ?? '',
      date: parsed.projectMeta.date ?? new Date().toISOString().slice(0, 10),
      createdAt: now,
      updatedAt: now,
      lastExportedAt: null,
    })

    searchParams.delete('list')
    setSearchParams(searchParams, { replace: true })

    const meta = useProjectStore.getState().guestProjectMeta

    setTimeout(async () => {
      try {
        const currentItems = useProjectStore.getState().guestConfigurations
        if (currentItems.length > 0) {
          await downloadMyListXlsx(currentItems, lang as 'en' | 'uk', meta)
          setGuestProjectMeta({ lastExportedAt: Date.now(), updatedAt: Date.now() })
        }
      } catch {
        toast.error(t('toast.downloadError'))
      }
    }, 500)
  }, [searchParams, setSearchParams, setGuestState, setGuestProjectMeta, lang, t])
}

export function MyListPage() {
  const myList = useMyList()
  const projectMeta = useProjectMeta()
  const removeConfiguration = useProjectStore((s) => s.removeConfiguration)
  const updateConfigurationQty = useProjectStore((s) => s.updateConfigurationQty)
  const updateConfigurationNote = useProjectStore((s) => s.updateConfigurationNote)
  const isMobile = useIsMobile()

  const [drawerItemId, setDrawerItemId] = useState<string | null>(null)

  useMyListFromUrl()

  const drawerItem = useMemo(
    () => myList.find((item) => item.id === drawerItemId) ?? null,
    [myList, drawerItemId],
  )
  const isDrawerOpen = drawerItem !== null

  const summary = useMemo(() => {
    const uniqueModels = myList.length
    const totalUnits = myList.reduce((sum, item) => sum + item.qty, 0)
    return { uniqueModels, totalUnits }
  }, [myList])

  const handleViewDetails = (id: string) => {
    setDrawerItemId(id)
  }

  const handleCloseDrawer = () => {
    setDrawerItemId(null)
  }

  if (myList.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 xl:px-8 py-8 md:py-10">
      <PageHeader />
      <AuthPromptBanner />
      <ProjectSummary
        uniqueModels={summary.uniqueModels}
        totalUnits={summary.totalUnits}
        updatedAt={projectMeta.updatedAt}
      />

      <div className="hidden md:block">
        <SpecificationTable
          items={myList}
          onQtyChange={updateConfigurationQty}
          onNoteChange={updateConfigurationNote}
          onViewDetails={handleViewDetails}
          onRemove={removeConfiguration}
        />
      </div>

      <div className="md:hidden">
        <SpecificationMobileList
          items={myList}
          onQtyChange={updateConfigurationQty}
          onNoteChange={updateConfigurationNote}
          onViewDetails={handleViewDetails}
          onRemove={removeConfiguration}
        />
      </div>

      {isMobile ? (
        <DetailBottomSheet
          item={drawerItem}
          isOpen={isDrawerOpen}
          onClose={handleCloseDrawer}
          onRemove={removeConfiguration}
        />
      ) : (
        <DetailDrawer
          item={drawerItem}
          isOpen={isDrawerOpen}
          onClose={handleCloseDrawer}
          onRemove={removeConfiguration}
        />
      )}
    </div>
  )
}

function PageHeader() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-1">
          {t('myList.title')}
        </h1>
        <p className="text-sm text-slate-500">{t('myList.subtitle')}</p>
      </div>
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors group"
      >
        <Plus className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
        {t('myList.continueConfiguring')}
      </Link>
    </div>
  )
}

interface ProjectSummaryProps {
  uniqueModels: number
  totalUnits: number
  updatedAt: number
}

function ProjectSummary({ uniqueModels, totalUnits, updatedAt }: ProjectSummaryProps) {
  const { t } = useTranslation()

  const formattedDate = useMemo(() => {
    const d = new Date(updatedAt)
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }, [updatedAt])

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
      <div className="flex items-center gap-6">
        <SummaryMetric
          label={t('projectSummary.uniqueModels')}
          value={String(uniqueModels).padStart(2, '0')}
        />
        <Divider />
        <SummaryMetric
          label={t('projectSummary.totalUnits')}
          value={String(totalUnits).padStart(2, '0')}
        />
        <Divider />
        <SummaryMetric label={t('projectSummary.lastUpdated')} value={formattedDate} />
      </div>
      <div className="sm:ml-auto flex items-center gap-1.5 text-xs text-brand-600">
        <Info className="h-3.5 w-3.5" />
        {t('projectSummary.storedLocally')}
      </div>
    </div>
  )
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-semibold text-slate-500 mb-0.5 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm font-mono text-slate-900">{value}</span>
    </div>
  )
}

function Divider() {
  return <div className="w-px h-8 bg-slate-200 hidden sm:block" />
}

function EmptyState() {
  const { t } = useTranslation()

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 xl:px-8 py-8 md:py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-1">
          {t('myList.title')}
        </h1>
        <p className="text-sm text-slate-500">{t('myList.subtitle')}</p>
      </div>

      <AuthPromptBanner />

      <div className="flex flex-col items-center justify-center py-20 border border-slate-200 rounded-sm bg-white text-center">
        <div className="h-12 w-12 rounded-sm bg-slate-100 flex items-center justify-center mb-5">
          <span className="text-slate-400 text-2xl">☆</span>
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          {t('myList.emptyTitle')}
        </h2>
        <p className="text-sm text-slate-500 mb-6 max-w-xs">
          {t('myList.emptyDescription')}
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-5 py-2 bg-slate-900 text-white text-sm font-medium rounded-sm hover:bg-slate-800 transition-colors"
        >
          {t('myList.startConfiguring')}
        </Link>
      </div>
    </div>
  )
}
