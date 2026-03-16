import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Plus, Loader2 } from 'lucide-react'
import { useProjectStore } from '@features/projects/store/projectStore'
import { useAuthStore } from '@features/auth/store/authStore'
import { useMyList, useProjectMeta } from '../hooks/useProjectSelectors'
import { SpecificationTable } from '@features/projects/components/SpecificationTable'
import { SpecificationMobileList } from '@features/projects/components/SpecificationMobileItem'
import { DetailDrawer } from '@features/projects/components/DetailDrawer'
import { DetailBottomSheet } from '@features/projects/components/DetailBottomSheet'
import { useIsMobile } from '@shared/hooks/useMediaQuery'
import { useTranslation } from '@shared/i18n'
import { GUEST_PROJECT_ID } from '@shared/types'

export function ProjectDetailPage() {
  const { t } = useTranslation()
  const { id: projectId } = useParams<{ id: string }>()
  const user = useAuthStore((s) => s.user)
  const projects = useProjectStore((s) => s.projects)
  const fetchProjects = useProjectStore((s) => s.fetchProjects)
  const fetchConfigurations = useProjectStore((s) => s.fetchConfigurations)
  const setActiveProjectId = useProjectStore((s) => s.setActiveProjectId)
  const removeConfiguration = useProjectStore((s) => s.removeConfiguration)
  const updateConfigurationQty = useProjectStore((s) => s.updateConfigurationQty)
  const updateConfigurationNote = useProjectStore((s) => s.updateConfigurationNote)
  const renameProject = useProjectStore((s) => s.renameProject)
  const isMobile = useIsMobile()

  const myList = useMyList()
  const projectMeta = useProjectMeta()

  const [drawerItemId, setDrawerItemId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')

  const project = useMemo(
    () => projects.find((p) => p.id === projectId) ?? null,
    [projects, projectId],
  )

  useEffect(() => {
    if (!projectId || !user) return

    setActiveProjectId(projectId)
    fetchConfigurations(projectId)

    if (projects.length === 0) {
      fetchProjects(user.id)
    }

    return () => {
      setActiveProjectId(GUEST_PROJECT_ID)
    }
  }, [projectId, user?.id])

  const drawerItem = useMemo(
    () => myList.find((item) => item.id === drawerItemId) ?? null,
    [myList, drawerItemId],
  )

  const summary = useMemo(() => {
    const uniqueModels = myList.length
    const totalUnits = myList.reduce((sum, item) => sum + item.qty, 0)
    return { uniqueModels, totalUnits }
  }, [myList])

  const handleRename = async () => {
    if (!projectId || !editName.trim() || editName.trim() === project?.name) {
      setIsEditing(false)
      return
    }
    await renameProject(projectId, editName.trim())
    setIsEditing(false)
  }

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRename()
    if (e.key === 'Escape') setIsEditing(false)
  }

  if (!user || !projectId) return null

  if (!project) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 xl:px-8 py-8 md:py-10">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 xl:px-8 py-8 md:py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <Link
            to="/projects"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t('projects.backToProjects')}
          </Link>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={handleRenameKeyDown}
                onBlur={handleRename}
                autoFocus
                className="text-2xl font-semibold tracking-tight text-slate-900 h-9 px-2 border border-slate-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
            ) : (
              <>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                  {project.name || t('projects.untitled')}
                </h1>
                <button
                  onClick={() => {
                    setIsEditing(true)
                    setEditName(project.name)
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
          {project.clientName && (
            <p className="text-sm text-slate-500 mt-1">{project.clientName}</p>
          )}
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors group"
        >
          <Plus className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
          {t('myList.continueConfiguring')}
        </Link>
      </div>
      {myList.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
          <div className="flex items-center gap-6">
            <SummaryMetric
              label={t('projectSummary.uniqueModels')}
              value={String(summary.uniqueModels).padStart(2, '0')}
            />
            <div className="w-px h-8 bg-slate-200 hidden sm:block" />
            <SummaryMetric
              label={t('projectSummary.totalUnits')}
              value={String(summary.totalUnits).padStart(2, '0')}
            />
            <div className="w-px h-8 bg-slate-200 hidden sm:block" />
            <SummaryMetric
              label={t('projectSummary.lastUpdated')}
              value={new Date(projectMeta.updatedAt).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            />
          </div>
        </div>
      )}

      {myList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-slate-200 rounded-sm bg-white text-center">
          <div className="h-12 w-12 rounded-sm bg-slate-100 flex items-center justify-center mb-5">
            <span className="text-slate-400 text-2xl">☆</span>
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            {t('projects.emptyProjectTitle')}
          </h2>
          <p className="text-sm text-slate-500 mb-6 max-w-xs">
            {t('projects.emptyProjectDescription')}
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-5 py-2 bg-slate-900 text-white text-sm font-medium rounded-sm hover:bg-slate-800 transition-colors"
          >
            {t('myList.startConfiguring')}
          </Link>
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <SpecificationTable
              items={myList}
              onQtyChange={updateConfigurationQty}
              onNoteChange={updateConfigurationNote}
              onViewDetails={(id) => setDrawerItemId(id)}
              onRemove={removeConfiguration}
            />
          </div>

          <div className="md:hidden">
            <SpecificationMobileList
              items={myList}
              onQtyChange={updateConfigurationQty}
              onNoteChange={updateConfigurationNote}
              onViewDetails={(id) => setDrawerItemId(id)}
              onRemove={removeConfiguration}
            />
          </div>

          {isMobile ? (
            <DetailBottomSheet
              item={drawerItem}
              isOpen={drawerItem !== null}
              onClose={() => setDrawerItemId(null)}
              onRemove={removeConfiguration}
            />
          ) : (
            <DetailDrawer
              item={drawerItem}
              isOpen={drawerItem !== null}
              onClose={() => setDrawerItemId(null)}
              onRemove={removeConfiguration}
            />
          )}
        </>
      )}
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
