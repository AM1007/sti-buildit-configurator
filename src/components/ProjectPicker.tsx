import { useEffect, useState, useCallback } from "react";
import {
  X, FolderOpen, Plus, Check, Loader2,
} from "lucide-react";
import { useProjectStore } from "../stores/projectStore";
import { useAuthStore } from "../stores/authStore";
import { useTranslation } from "../i18n";
import type { Project, ModelId, Configuration, CustomTextData, ModelDefinition } from "../types";

interface ProjectPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  modelId: ModelId;
  config: Configuration;
  customText: CustomTextData | null;
  model: ModelDefinition;
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
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const projects = useProjectStore((s) => s.projects);
  const fetchProjects = useProjectStore((s) => s.fetchProjects);
  const createProject = useProjectStore((s) => s.createProject);
  const addRemoteConfiguration = useProjectStore((s) => s.addRemoteConfiguration);

  const [savingTo, setSavingTo] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchProjects(user.id);
    }
  }, [isOpen, user, fetchProjects]);

  const handleSelectProject = useCallback(async (project: Project) => {
    if (!user) return;
    setSavingTo(project.id);
    await addRemoteConfiguration(user.id, project.id, modelId, config, customText, model);
    setSavingTo(null);
    onSaved();
    onClose();
  }, [user, modelId, config, customText, model, addRemoteConfiguration, onSaved, onClose]);

  const handleCreateAndSave = useCallback(async () => {
    if (!user || !newName.trim()) return;
    setIsCreating(true);
    const project = await createProject(user.id, newName.trim());
    if (project) {
      setNewName("");
      setShowNewForm(false);
      setIsCreating(false);
      setSavingTo(project.id);
      await addRemoteConfiguration(user.id, project.id, modelId, config, customText, model);
      setSavingTo(null);
      onSaved();
      onClose();
    } else {
      setIsCreating(false);
    }
  }, [user, newName, createProject, addRemoteConfiguration, modelId, config, customText, model, onSaved, onClose]);

  const handleNewFormKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCreateAndSave();
    if (e.key === "Escape") { setShowNewForm(false); setNewName(""); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-sm bg-white rounded-t-lg sm:rounded-sm shadow-lg max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900">
            {t("projectPicker.title")}
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
              <p className="text-sm text-slate-500 mb-3">{t("projectPicker.noProjects")}</p>
              <button
                onClick={() => setShowNewForm(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-sm hover:bg-slate-800 transition-colors"
              >
                <Plus className="h-4 w-4" />
                {t("projectPicker.createNew")}
              </button>
            </div>
          ) : (
            <>
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleSelectProject(project)}
                  disabled={savingTo !== null}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  <FolderOpen className="h-4 w-4 text-slate-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-slate-900 truncate block">
                      {project.name || t("projects.untitled")}
                    </span>
                    {project.clientName && (
                      <span className="text-xs text-slate-500 truncate block">
                        {project.clientName}
                      </span>
                    )}
                  </div>
                  {savingTo === project.id && (
                    <Loader2 className="h-4 w-4 animate-spin text-slate-400 shrink-0" />
                  )}
                  {savingTo !== null && savingTo !== project.id ? null : savingTo === null ? (
                    <Check className="h-4 w-4 text-slate-300 shrink-0" />
                  ) : null}
                </button>
              ))}
            </>
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
                placeholder={t("projects.projectNamePlaceholder")}
                autoFocus
                className="flex-1 h-9 px-3 border border-slate-200 rounded-sm text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              />
              <button
                onClick={handleCreateAndSave}
                disabled={!newName.trim() || isCreating}
                className="h-9 px-3 bg-slate-900 text-white text-sm font-medium rounded-sm hover:bg-slate-800 transition-colors disabled:opacity-50 inline-flex items-center gap-1"
              >
                {isCreating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => { setShowNewForm(false); setNewName(""); }}
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
              {t("projectPicker.createNew")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}