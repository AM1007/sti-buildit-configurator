import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus, Pencil, Trash2, FolderOpen, ChevronRight,
  X, Check, Loader2,
} from "lucide-react";
import { useProjectStore } from "../stores/projectStore";
import { useAuthStore } from "../stores/authStore";
import { useTranslation } from "../i18n";
import { toast } from "../utils/toast";
import type { Project } from "../types";

export function ProjectsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const projects = useProjectStore((s) => s.projects);
  const isLoading = useProjectStore((s) => s.isLoading);
  const fetchProjects = useProjectStore((s) => s.fetchProjects);
  const createProject = useProjectStore((s) => s.createProject);
  const renameProject = useProjectStore((s) => s.renameProject);
  const deleteProject = useProjectStore((s) => s.deleteProject);
  const fetchConfigurations = useProjectStore((s) => s.fetchConfigurations);
  const remoteConfigurations = useProjectStore((s) => s.remoteConfigurations);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createName, setCreateName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (user) fetchProjects(user.id);
  }, [user, fetchProjects]);

  const handleCreate = useCallback(async () => {
    if (!user || !createName.trim()) return;
    setIsCreating(true);
    const project = await createProject(user.id, createName.trim());
    setIsCreating(false);
    if (project) {
      setCreateName("");
      setShowCreateForm(false);
      navigate(`/projects/${project.id}`);
    }
  }, [user, createName, createProject, navigate]);

  const handleCreateKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCreate();
    if (e.key === "Escape") { setShowCreateForm(false); setCreateName(""); }
  };

  const getConfigCount = (projectId: string): number => {
    return (remoteConfigurations[projectId] ?? []).length;
  };

  // Lazy-load configurations for each project to show item count
  useEffect(() => {
    for (const project of projects) {
      if (!remoteConfigurations[project.id]) {
        fetchConfigurations(project.id);
      }
    }
  }, [projects, remoteConfigurations, fetchConfigurations]);

  if (!user) return null;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-10">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-1">
            {t("projects.title")}
          </h1>
          <p className="text-sm text-slate-500">{t("projects.subtitle")}</p>
        </div>
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-sm hover:bg-slate-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {t("projects.newProject")}
          </button>
        )}
      </div>

      {/* Inline create form */}
      {showCreateForm && (
        <div className="mb-6 bg-white border border-slate-200 rounded-sm p-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {t("projects.projectName")}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              onKeyDown={handleCreateKeyDown}
              placeholder={t("projects.projectNamePlaceholder")}
              autoFocus
              className="flex-1 h-10 px-3 border border-slate-200 rounded-sm text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
            />
            <button
              onClick={handleCreate}
              disabled={!createName.trim() || isCreating}
              className="h-10 px-4 bg-slate-900 text-white text-sm font-medium rounded-sm hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
            >
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {t("projects.create")}
            </button>
            <button
              onClick={() => { setShowCreateForm(false); setCreateName(""); }}
              className="h-10 w-10 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Project list */}
      {isLoading && projects.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState onCreateClick={() => setShowCreateForm(true)} />
      ) : (
        <div className="flex flex-col gap-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              configCount={getConfigCount(project.id)}
              onRename={renameProject}
              onDelete={deleteProject}
            />
          ))}
        </div>
      )}

      {/* Link to guest list */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <Link
          to="/my-list"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          {t("projects.guestListLink")}
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ProjectCard                                                       */
/* ------------------------------------------------------------------ */

interface ProjectCardProps {
  project: Project;
  configCount: number;
  onRename: (projectId: string, name: string) => Promise<void>;
  onDelete: (projectId: string) => Promise<void>;
}

function ProjectCard({ project, configCount, onRename, onDelete }: ProjectCardProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(project.name);
  const [isDeleting, setIsDeleting] = useState(false);

  const formattedDate = new Date(project.updatedAt).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });

  const handleRename = async () => {
    if (!editName.trim() || editName.trim() === project.name) {
      setIsEditing(false);
      setEditName(project.name);
      return;
    }
    await onRename(project.id, editName.trim());
    setIsEditing(false);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleRename();
    if (e.key === "Escape") { setIsEditing(false); setEditName(project.name); }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(project.id);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-sm hover:border-slate-300 transition-colors">
      <Link to={`/projects/${project.id}`} className="block px-4 py-4 sm:px-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="mt-0.5 h-9 w-9 rounded-sm bg-slate-100 flex items-center justify-center shrink-0">
              <FolderOpen className="h-4 w-4 text-slate-500" />
            </div>
            <div className="min-w-0">
              {isEditing ? (
                <div className="flex items-center gap-1.5" onClick={(e) => e.preventDefault()}>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={handleRenameKeyDown}
                    onBlur={handleRename}
                    autoFocus
                    className="h-7 px-2 border border-slate-300 rounded-sm text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              ) : (
                <h3 className="text-sm font-semibold text-slate-900 truncate">
                  {project.name || t("projects.untitled")}
                </h3>
              )}
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                <span>{configCount} {configCount === 1 ? t("projects.item") : t("projects.items")}</span>
                <span className="text-slate-300">|</span>
                <span>{formattedDate}</span>
                {project.clientName && (
                  <>
                    <span className="text-slate-300">|</span>
                    <span className="truncate max-w-[120px]">{project.clientName}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 mt-2.5 shrink-0" />
        </div>
      </Link>

      {/* Actions bar */}
      <div className="border-t border-slate-100 px-4 py-2 sm:px-5 flex items-center gap-1">
        <button
          onClick={(e) => { e.preventDefault(); setIsEditing(true); setEditName(project.name); }}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-sm transition-colors"
        >
          <Pencil className="h-3 w-3" />
          {t("projects.rename")}
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            toast.confirm(
              t("projects.deleteConfirm"),
              () => handleDelete(),
              { confirm: t("common.confirm"), cancel: t("common.cancel") }
            );
          }}
          disabled={isDeleting}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded-sm transition-colors disabled:opacity-50"
        >
          <Trash2 className="h-3 w-3" />
          {t("projects.delete")}
        </button>
      </div>
    </div>
  );
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-20 border border-slate-200 rounded-sm bg-white text-center">
      <div className="h-12 w-12 rounded-sm bg-slate-100 flex items-center justify-center mb-5">
        <FolderOpen className="h-5 w-5 text-slate-400" />
      </div>
      <h2 className="text-lg font-semibold text-slate-900 mb-2">{t("projects.emptyTitle")}</h2>
      <p className="text-sm text-slate-500 mb-6 max-w-xs">{t("projects.emptyDescription")}</p>
      <button
        onClick={onCreateClick}
        className="inline-flex items-center justify-center gap-1.5 px-5 py-2 bg-slate-900 text-white text-sm font-medium rounded-sm hover:bg-slate-800 transition-colors"
      >
        <Plus className="h-4 w-4" />
        {t("projects.createFirst")}
      </button>
    </div>
  );
}