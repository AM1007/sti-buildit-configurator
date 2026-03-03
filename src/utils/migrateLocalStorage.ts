const LEGACY_KEY = "configurator-storage";
const TARGET_KEY = "project-storage";
const GUEST_PROJECT_ID = "guest-default";

interface LegacyPersistedState {
  state: {
    myList?: unknown[];
    projectMeta?: Record<string, unknown>;
  };
  version?: number;
}

interface TargetPersistedState {
  state: {
    guestConfigurations: unknown[];
    guestProjectMeta: Record<string, unknown>;
    activeProjectId: string;
  };
  version: number;
}

function isNonEmptyArray(value: unknown): value is unknown[] {
  return Array.isArray(value) && value.length > 0;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function migrateLocalStorage(): void {
  try {
    const targetRaw = localStorage.getItem(TARGET_KEY);

    if (targetRaw) {
      const target = JSON.parse(targetRaw) as TargetPersistedState;

      if (
        target?.state &&
        isNonEmptyArray(target.state.guestConfigurations)
      ) {
        cleanupLegacyKey();
        return;
      }
    }

    const legacyRaw = localStorage.getItem(LEGACY_KEY);

    if (!legacyRaw) {
      return;
    }

    const legacy = JSON.parse(legacyRaw) as LegacyPersistedState;

    if (!legacy?.state) {
      return;
    }

    const { myList, projectMeta } = legacy.state;

    if (!isNonEmptyArray(myList)) {
      cleanupLegacyKey();
      return;
    }

    const normalizedList = myList.map((item) => {
      if (!isPlainObject(item)) return item;
      return {
        ...item,
        qty: typeof item.qty === "number" ? item.qty : 1,
        note: typeof item.note === "string" ? item.note : "",
      };
    });

    const now = Date.now();
    const defaultMeta = {
      projectName: "",
      clientName: "",
      createdAt: now,
      updatedAt: now,
      date: new Date().toISOString().slice(0, 10),
      lastExportedAt: null,
    };

    const migratedMeta = isPlainObject(projectMeta)
      ? {
          projectName:
            typeof projectMeta.projectName === "string"
              ? projectMeta.projectName
              : "",
          clientName:
            typeof projectMeta.clientName === "string"
              ? projectMeta.clientName
              : "",
          createdAt:
            typeof projectMeta.createdAt === "number"
              ? projectMeta.createdAt
              : now,
          updatedAt:
            typeof projectMeta.updatedAt === "number"
              ? projectMeta.updatedAt
              : now,
          date:
            typeof projectMeta.date === "string"
              ? projectMeta.date
              : defaultMeta.date,
          lastExportedAt:
            typeof projectMeta.lastExportedAt === "number"
              ? projectMeta.lastExportedAt
              : null,
        }
      : defaultMeta;

    const targetState: TargetPersistedState = {
      state: {
        guestConfigurations: normalizedList,
        guestProjectMeta: migratedMeta,
        activeProjectId: GUEST_PROJECT_ID,
      },
      version: 1,
    };

    localStorage.setItem(TARGET_KEY, JSON.stringify(targetState));

    cleanupLegacyKey();

    console.info(
      `[migration] Migrated ${normalizedList.length} configurations from ${LEGACY_KEY} to ${TARGET_KEY}`
    );
  } catch (error) {
    console.warn("[migration] localStorage migration failed:", error);
  }
}

function cleanupLegacyKey(): void {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw) as LegacyPersistedState;
    if (!parsed?.state) return;

    const { myList, projectMeta, ...rest } = parsed.state as Record<string, unknown>;

    if (Object.keys(rest).length === 0) {
      localStorage.removeItem(LEGACY_KEY);
      return;
    }

    parsed.state = rest as LegacyPersistedState["state"];
    localStorage.setItem(LEGACY_KEY, JSON.stringify(parsed));
  } catch {
  }
}