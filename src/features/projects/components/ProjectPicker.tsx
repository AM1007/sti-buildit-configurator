import { useEffect, useState, useCallback } from 'react'
import { X, FolderOpen, Plus, Check, Loader2 } from 'lucide-react'
import { useProjectStore } from '@features/projects/store/projectStore'
import { useAuthStore } from '@features/auth'
import * as configurationsApi from '@shared/api/configurationsApi'
import { useTranslation } from '@shared/i18n'
import { buildProductModel } from '@entities/product'
import type {
  Project,
  ModelId,
  Configuration,
  CustomTextData,
  ModelDefinition,
} from '@shared/types'

interface ProjectPickerProps {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  modelId: ModelId
  config: Configuration
  customText: CustomTextData | null
  model: ModelDefinition
}

export function ProjectPicker({
  isOpen,
  onClose,
  onSaved,
  modelId,
  config,
  customText,
  model,
}: ProjectPickerProps) {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const projects = useProjectStore((s) => s.projects)
  const fetchProjects = useProjectStore((s) => s.fetchProjects)
  const createProject = useProjectStore((s) => s.createProject)
  const addRemoteConfiguration = useProjectStore((s) => s.addRemoteConfiguration)
  const removeRemoteConfiguration = useProjectStore((s) => s.removeRemoteConfiguration)

  const [savingTo, setSavingTo] = useState<string | null>(null)
  const [removingFrom, setRemovingFrom] = useState<string | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [savedProjectMap, setSavedProjectMap] = useState<Map<string, string>>(new Map())

  useEffect(() => {
    if (!isOpen || !user) return
    fetchProjects(user.id)
    const productCode = buildProductModel(config, model).fullCode
    configurationsApi
      .fetchProjectsWithProduct(productCode, customText)
      .then(setSavedProjectMap)
  }, [isOpen, user])

  const handleSelectProject = useCallback(
    async (project: Project) => {
      if (!user || savingTo !== null || removingFrom !== null) return

      const isSaved = savedProjectMap.has(project.id)

      if (isSaved) {
        const configId = savedProjectMap.get(project.id)!
        setRemovingFrom(project.id)
        await removeRemoteConfiguration(configId, project.id)
        setRemovingFrom(null)
        setSavedProjectMap((prev) => {
          const next = new Map(prev)
          next.delete(project.id)
          return next
        })
        onSaved()
        return
      }

      setSavingTo(project.id)
      await addRemoteConfiguration(
        user.id,
        project.id,
        modelId,
        config,
        customText,
        model,
      )
      setSavingTo(null)
      setSavedProjectMap((prev) => {
        const next = new Map(prev)
        next.set(project.id, 'optimistic')
        return next
      })
      onSaved()
    },
    [
      user,
      modelId,
      config,
      customText,
      model,
      savedProjectMap,
      addRemoteConfiguration,
      removeRemoteConfiguration,
      onSaved,
      savingTo,
      removingFrom,
    ],
  )

  const handleCreateAndSave = useCallback(async () => {
    if (!user || !newName.trim()) return
    setIsCreating(true)
    const project = await createProject(user.id, newName.trim())
    if (project) {
      setNewName('')
      setShowNewForm(false)
      setIsCreating(false)
      setSavingTo(project.id)
      await addRemoteConfiguration(
        user.id,
        project.id,
        modelId,
        config,
        customText,
        model,
      )
      setSavingTo(null)
      setSavedProjectMap((prev) => {
        const next = new Map(prev)
        next.set(project.id, 'optimistic')
        return next
      })
      onSaved()
    } else {
      setIsCreating(false)
    }
  }, [
    user,
    newName,
    createProject,
    addRemoteConfiguration,
    modelId,
    config,
    customText,
    model,
    onSaved,
  ])

  const handleNewFormKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCreateAndSave()
    if (e.key === 'Escape') {
      setShowNewForm(false)
      setNewName('')
    }
  }

  if (!isOpen) return null

  const isBusy = savingTo !== null || removingFrom !== null

  return (
    <div className="fixed inset-0 z-60 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full sm:max-w-sm bg-white rounded-t-lg sm:rounded-sm shadow-lg max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900">
            {t('projectPicker.title')}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {projects.length === 0 && !showNewForm ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-slate-500 mb-3">
                {t('projectPicker.noProjects')}
              </p>
              <button
                onClick={() => setShowNewForm(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-sm hover:bg-slate-800 transition-colors"
              >
                <Plus className="h-4 w-4" />
                {t('projectPicker.createNew')}
              </button>
            </div>
          ) : (
            projects.map((project) => {
              const isSaved = savedProjectMap.has(project.id)
              const isLoading = savingTo === project.id || removingFrom === project.id

              return (
                <button
                  key={project.id}
                  onClick={() => handleSelectProject(project)}
                  disabled={isBusy}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors disabled:opacity-50 ${
                    isSaved ? 'hover:bg-red-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <FolderOpen
                    className={`h-4 w-4 shrink-0 ${isSaved ? 'text-green-500' : 'text-slate-400'}`}
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-slate-900 truncate block">
                      {project.name || t('projects.untitled')}
                    </span>
                    {project.clientName && (
                      <span className="text-xs text-slate-500 truncate block">
                        {project.clientName}
                      </span>
                    )}
                  </div>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-slate-400 shrink-0" />
                  ) : isSaved ? (
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                  ) : (
                    <Check className="h-4 w-4 text-slate-200 shrink-0" />
                  )}
                </button>
              )
            })
          )}
        </div>

        <div className="border-t border-slate-200 px-4 py-3">
          {showNewForm ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleNewFormKeyDown}
                placeholder={t('projects.projectNamePlaceholder')}
                autoFocus
                className="flex-1 h-9 px-3 border border-slate-200 rounded-sm text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              />
              <button
                onClick={handleCreateAndSave}
                disabled={!newName.trim() || isCreating}
                className="h-9 px-3 bg-slate-900 text-white text-sm font-medium rounded-sm hover:bg-slate-800 transition-colors disabled:opacity-50 inline-flex items-center gap-1"
              >
                {isCreating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
              </button>
              <button
                onClick={() => {
                  setShowNewForm(false)
                  setNewName('')
                }}
                className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewForm(true)}
              className="w-full inline-flex items-center justify-center gap-1.5 h-9 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-sm transition-colors"
            >
              <Plus className="h-4 w-4" />
              {t('projectPicker.createNew')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
