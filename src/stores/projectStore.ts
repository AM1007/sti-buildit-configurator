import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  SavedConfiguration,
  ProjectMeta,
  Project,
  ModelId,
  Configuration,
  CustomTextData,
  ModelDefinition,
} from "../types";
import { generateSavedConfigurationId, GUEST_PROJECT_ID } from "../types";
import { isConfigurationComplete } from "../filterOptions";
import { buildProductModel } from "../buildProductModel";
import { buildCustomTextFingerprint } from "../utils/customTextHelpers";
import * as projectsApi from "../services/supabase/projectsApi";
import * as configurationsApi from "../services/supabase/configurationsApi";
import { useAuthStore } from "./authStore";

function getTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function createDefaultProjectMeta(): ProjectMeta {
  const now = Date.now();
  return {
    projectName: "",
    clientName: "",
    createdAt: now,
    updatedAt: now,
    date: getTodayISO(),
    lastExportedAt: null,
  };
}

function migrateMyList(myList: SavedConfiguration[]): SavedConfiguration[] {
  return myList.map((item) => ({
    ...item,
    qty: item.qty ?? 1,
    note: item.note ?? "",
  }));
}

interface ProjectState {
  projects: Project[];
  activeProjectId: string;
  guestConfigurations: SavedConfiguration[];
  guestProjectMeta: ProjectMeta;
  remoteConfigurations: Record<string, SavedConfiguration[]>;
  isLoading: boolean;

  getActiveConfigurations: () => SavedConfiguration[];
  getActiveProjectMeta: () => ProjectMeta;
  getConfigurationCount: () => number;

  addConfiguration: (
    modelId: ModelId,
    config: Configuration,
    customText: CustomTextData | null,
    model: ModelDefinition,
    projectId?: string,
    name?: string,
  ) => void;
  removeConfiguration: (id: string) => void;
  clearConfigurations: () => void;
  updateConfigurationQty: (id: string, qty: number) => void;
  updateConfigurationNote: (id: string, note: string) => void;
  loadConfigurationIntoWizard: (id: string) => SavedConfiguration | null;

  setGuestProjectMeta: (meta: Partial<ProjectMeta>) => void;
  setGuestConfigurations: (items: SavedConfiguration[]) => void;
  setGuestState: (items: SavedConfiguration[], meta: ProjectMeta) => void;

  setActiveProjectId: (id: string) => void;

  fetchProjects: (userId: string) => Promise<void>;
  createProject: (userId: string, name: string, clientName?: string) => Promise<Project | null>;
  renameProject: (projectId: string, name: string) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  fetchConfigurations: (projectId: string) => Promise<void>;

  addRemoteConfiguration: (
    userId: string,
    projectId: string,
    modelId: ModelId,
    config: Configuration,
    customText: CustomTextData | null,
    model: ModelDefinition,
    name?: string,
  ) => Promise<SavedConfiguration | null>;
  removeRemoteConfiguration: (id: string, projectId: string) => Promise<void>;
  updateRemoteConfigurationQty: (id: string, projectId: string, qty: number) => Promise<void>;
  updateRemoteConfigurationNote: (id: string, projectId: string, note: string) => Promise<void>;
  clearRemoteConfigurations: (projectId: string) => Promise<void>;
  updateProjectMeta: (
    projectId: string,
    meta: Partial<Pick<Project, "name" | "clientName" | "date" | "lastExportedAt">>
  ) => Promise<void>;

  checkDuplicateInProject: (projectId: string, productCode: string) => Promise<boolean>;
  fetchProjectsWithProduct: (productCode: string) => Promise<Map<string, string>>;
  checkProductInAnyProject: (userId: string, productCode: string) => Promise<boolean>;

  mergeGuestToRemote: (userId: string) => Promise<string | null>;
  clearGuestData: () => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: GUEST_PROJECT_ID,
      guestConfigurations: [],
      guestProjectMeta: createDefaultProjectMeta(),
      remoteConfigurations: {},
      isLoading: false,

      getActiveConfigurations: () => {
        const { activeProjectId, guestConfigurations, remoteConfigurations } = get();
        if (activeProjectId === GUEST_PROJECT_ID) {
          return guestConfigurations;
        }
        return remoteConfigurations[activeProjectId] ?? [];
      },

      getActiveProjectMeta: () => {
        const { activeProjectId, guestProjectMeta, projects } = get();
        if (activeProjectId === GUEST_PROJECT_ID) {
          return guestProjectMeta;
        }
        const project = projects.find((p) => p.id === activeProjectId);
        if (!project) return guestProjectMeta;
        return {
          projectName: project.name,
          clientName: project.clientName,
          createdAt: new Date(project.createdAt).getTime(),
          updatedAt: new Date(project.updatedAt).getTime(),
          date: project.date,
          lastExportedAt: project.lastExportedAt
            ? new Date(project.lastExportedAt).getTime()
            : null,
        };
      },

      getConfigurationCount: () => {
        return get().getActiveConfigurations().length;
      },

      addConfiguration: (modelId, config, customText, model, _projectId, name) => {
        if (!isConfigurationComplete(model, config)) return;

        const { activeProjectId } = get();

        if (activeProjectId !== GUEST_PROJECT_ID) {
          const user = useAuthStore.getState().user;
          if (user) {
            get().addRemoteConfiguration(
              user.id, activeProjectId, modelId, config, customText, model, name
            );
          }
          return;
        }

        const productModel = buildProductModel(config, model);
        const saved: SavedConfiguration = {
          id: generateSavedConfigurationId(),
          modelId,
          productCode: productModel.fullCode,
          configuration: { ...config },
          customText: customText ?? undefined,
          savedAt: Date.now(),
          name,
          qty: 1,
          note: "",
        };

        const { guestConfigurations, guestProjectMeta } = get();
        set({
          guestConfigurations: [...guestConfigurations, saved],
          guestProjectMeta: { ...guestProjectMeta, updatedAt: Date.now() },
        });
      },

      removeConfiguration: (id) => {
        const { activeProjectId } = get();

        if (activeProjectId !== GUEST_PROJECT_ID) {
          get().removeRemoteConfiguration(id, activeProjectId);
          return;
        }

        const { guestConfigurations, guestProjectMeta } = get();
        set({
          guestConfigurations: guestConfigurations.filter((item) => item.id !== id),
          guestProjectMeta: { ...guestProjectMeta, updatedAt: Date.now() },
        });
      },

      clearConfigurations: () => {
        const { activeProjectId } = get();

        if (activeProjectId !== GUEST_PROJECT_ID) {
          get().clearRemoteConfigurations(activeProjectId);
          return;
        }

        set({
          guestConfigurations: [],
          guestProjectMeta: createDefaultProjectMeta(),
        });
      },

      updateConfigurationQty: (id, qty) => {
        const { activeProjectId } = get();
        const clamped = Math.max(1, Math.floor(qty));

        if (activeProjectId !== GUEST_PROJECT_ID) {
          get().updateRemoteConfigurationQty(id, activeProjectId, clamped);
          return;
        }

        const { guestConfigurations, guestProjectMeta } = get();
        set({
          guestConfigurations: guestConfigurations.map((item) =>
            item.id === id ? { ...item, qty: clamped } : item
          ),
          guestProjectMeta: { ...guestProjectMeta, updatedAt: Date.now() },
        });
      },

      updateConfigurationNote: (id, note) => {
        const { activeProjectId } = get();

        if (activeProjectId !== GUEST_PROJECT_ID) {
          get().updateRemoteConfigurationNote(id, activeProjectId, note);
          return;
        }

        const { guestConfigurations, guestProjectMeta } = get();
        set({
          guestConfigurations: guestConfigurations.map((item) =>
            item.id === id ? { ...item, note } : item
          ),
          guestProjectMeta: { ...guestProjectMeta, updatedAt: Date.now() },
        });
      },

      loadConfigurationIntoWizard: (id) => {
        const configs = get().getActiveConfigurations();
        return configs.find((item) => item.id === id) ?? null;
      },

      setGuestProjectMeta: (meta) => {
        const { guestProjectMeta } = get();
        set({ guestProjectMeta: { ...guestProjectMeta, ...meta } });
      },

      setGuestConfigurations: (items) => {
        set({ guestConfigurations: items });
      },

      setGuestState: (items, meta) => {
        set({ guestConfigurations: items, guestProjectMeta: meta });
      },

      setActiveProjectId: (id) => {
        set({ activeProjectId: id });
      },

      fetchProjects: async (userId) => {
        set({ isLoading: true });
        const projects = await projectsApi.fetchProjects(userId);
        set({ projects, isLoading: false });
      },

      createProject: async (userId, name, clientName) => {
        const project = await projectsApi.createProject(userId, name, clientName);
        if (!project) return null;
        const { projects } = get();
        set({ projects: [project, ...projects] });
        return project;
      },

      renameProject: async (projectId, name) => {
        const ok = await projectsApi.renameProject(projectId, name);
        if (!ok) return;
        const { projects } = get();
        set({
          projects: projects.map((p) =>
            p.id === projectId ? { ...p, name, updatedAt: new Date().toISOString() } : p
          ),
        });
      },

      deleteProject: async (projectId) => {
        const ok = await projectsApi.deleteProject(projectId);
        if (!ok) return;
        const { projects, activeProjectId, remoteConfigurations } = get();
        const updated = { ...remoteConfigurations };
        delete updated[projectId];
        set({
          projects: projects.filter((p) => p.id !== projectId),
          remoteConfigurations: updated,
          activeProjectId: activeProjectId === projectId ? GUEST_PROJECT_ID : activeProjectId,
        });
      },

      fetchConfigurations: async (projectId) => {
        const configs = await configurationsApi.fetchConfigurations(projectId);
        const { remoteConfigurations } = get();
        set({
          remoteConfigurations: { ...remoteConfigurations, [projectId]: configs },
        });
      },

      addRemoteConfiguration: async (userId, projectId, modelId, config, customText, model, name) => {
        if (!isConfigurationComplete(model, config)) return null;

        const productModel = buildProductModel(config, model);

        const saved = await configurationsApi.addConfiguration({
          userId,
          projectId,
          modelId,
          productCode: productModel.fullCode,
          config,
          customText,
          name,
        });

        if (!saved) return null;

        const { remoteConfigurations } = get();
        const existing = remoteConfigurations[projectId] ?? [];
        set({
          remoteConfigurations: {
            ...remoteConfigurations,
            [projectId]: [...existing, saved],
          },
        });

        return saved;
      },

      removeRemoteConfiguration: async (id, projectId) => {
        const ok = await configurationsApi.removeConfiguration(id);
        if (!ok) return;
        const { remoteConfigurations } = get();
        const existing = remoteConfigurations[projectId] ?? [];
        set({
          remoteConfigurations: {
            ...remoteConfigurations,
            [projectId]: existing.filter((c) => c.id !== id),
          },
        });
      },

      updateRemoteConfigurationQty: async (id, projectId, qty) => {
        const clamped = Math.max(1, Math.floor(qty));
        const ok = await configurationsApi.updateConfigurationQty(id, clamped);
        if (!ok) return;
        const { remoteConfigurations } = get();
        const existing = remoteConfigurations[projectId] ?? [];
        set({
          remoteConfigurations: {
            ...remoteConfigurations,
            [projectId]: existing.map((c) => (c.id === id ? { ...c, qty: clamped } : c)),
          },
        });
      },

      updateRemoteConfigurationNote: async (id, projectId, note) => {
        const ok = await configurationsApi.updateConfigurationNote(id, note);
        if (!ok) return;
        const { remoteConfigurations } = get();
        const existing = remoteConfigurations[projectId] ?? [];
        set({
          remoteConfigurations: {
            ...remoteConfigurations,
            [projectId]: existing.map((c) => (c.id === id ? { ...c, note } : c)),
          },
        });
      },

      clearRemoteConfigurations: async (projectId) => {
        const { remoteConfigurations } = get();
        const existing = remoteConfigurations[projectId] ?? [];
        const ids = existing.map((c) => c.id);
        const ok = await configurationsApi.clearConfigurations(ids);
        if (!ok) return;
        set({
          remoteConfigurations: {
            ...remoteConfigurations,
            [projectId]: [],
          },
        });
      },

      updateProjectMeta: async (projectId, meta) => {
        const ok = await projectsApi.updateProjectMeta(projectId, meta);
        if (!ok) return;
        const { projects } = get();
        set({
          projects: projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  ...(meta.name !== undefined && { name: meta.name }),
                  ...(meta.clientName !== undefined && { clientName: meta.clientName }),
                  ...(meta.date !== undefined && { date: meta.date }),
                  ...(meta.lastExportedAt !== undefined && { lastExportedAt: meta.lastExportedAt }),
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        });
      },

      checkDuplicateInProject: async (projectId, productCode) => {
        return configurationsApi.checkDuplicateInProject(projectId, productCode);
      },

      fetchProjectsWithProduct: async (productCode) => {
        return configurationsApi.fetchProjectsWithProduct(productCode);
      },

      checkProductInAnyProject: async (userId, productCode) => {
        return configurationsApi.checkProductInAnyProject(userId, productCode);
      },

      mergeGuestToRemote: async (userId) => {
        const { guestConfigurations, guestProjectMeta } = get();
        if (guestConfigurations.length === 0) return null;

        const project = await get().createProject(
          userId,
          guestProjectMeta.projectName || "Untitled Project",
          guestProjectMeta.clientName,
        );

        if (!project) return null;

        for (const item of guestConfigurations) {
          await configurationsApi.addConfiguration({
            userId,
            projectId: project.id,
            modelId: item.modelId,
            productCode: item.productCode,
            config: item.configuration,
            customText: item.customText ?? null,
            name: item.name,
          });
        }

        await get().fetchConfigurations(project.id);
        set({ activeProjectId: project.id });
        get().clearGuestData();

        return project.id;
      },

      clearGuestData: () => {
        set({
          guestConfigurations: [],
          guestProjectMeta: createDefaultProjectMeta(),
        });
      },
    }),
    {
      name: "project-storage",
      version: 1,
      partialize: (state) => ({
        guestConfigurations: state.guestConfigurations,
        guestProjectMeta: state.guestProjectMeta,
        activeProjectId: state.activeProjectId,
      }),
      migrate: (persisted: unknown, version: number) => {
        if (version === 0 || !version) {
          const state = persisted as Record<string, unknown>;
          return {
            guestConfigurations: migrateMyList(
              (state.guestConfigurations as SavedConfiguration[]) ?? []
            ),
            guestProjectMeta: state.guestProjectMeta ?? createDefaultProjectMeta(),
            activeProjectId: GUEST_PROJECT_ID,
          };
        }
        return persisted;
      },
    }
  )
);

export const useGuestConfigurations = () =>
  useProjectStore((s) => s.guestConfigurations);

export const useGuestProjectMeta = () =>
  useProjectStore((s) => s.guestProjectMeta);

export const useGuestConfigurationCount = () =>
  useProjectStore((s) => s.guestConfigurations.length);

export const useProjects = () =>
  useProjectStore((s) => s.projects);

export const useActiveProjectId = () =>
  useProjectStore((s) => s.activeProjectId);

export const useIsGuestProject = (productCode: string | null, customText?: CustomTextData | null) =>
  useProjectStore((s) => {
    if (!productCode) return false;
    const fingerprint = buildCustomTextFingerprint(customText);
    return s.guestConfigurations.some(
      (item) =>
        item.productCode === productCode &&
        buildCustomTextFingerprint(item.customText) === fingerprint
    );
  });

export const useGuestItemIdByProductCode = (productCode: string | null, customText?: CustomTextData | null) =>
  useProjectStore((s) => {
    if (!productCode) return null;
    const fingerprint = buildCustomTextFingerprint(customText);
    const item = s.guestConfigurations.find(
      (c) =>
        c.productCode === productCode &&
        buildCustomTextFingerprint(c.customText) === fingerprint
    );
    return item?.id ?? null;
  });