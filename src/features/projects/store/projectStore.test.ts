import { describe, it, expect, beforeEach, vi } from 'vitest'
import type {
  ModelId,
  ModelDefinition,
  SavedConfiguration,
  Configuration,
  CustomTextData,
} from '@shared/types'
import { GUEST_PROJECT_ID } from '@shared/types'
import { useProjectStore } from '@features/projects/store/projectStore'

const TEST_MODEL_ID: ModelId = 'stopper-stations'

const TEST_MODEL: ModelDefinition = {
  id: TEST_MODEL_ID,
  name: 'Stopper Stations',
  slug: 'stopper-stations',
  stepOrder: ['colour', 'cover', 'text'],
  steps: [
    {
      id: 'colour',
      title: 'Colour',
      required: true,
      options: [{ id: 'red', code: '0', label: 'Red' }],
    },
    {
      id: 'cover',
      title: 'Cover',
      required: true,
      options: [{ id: 'shield', code: '2', label: 'Shield' }],
    },
    {
      id: 'text',
      title: 'Text',
      required: true,
      options: [{ id: 'FR', code: 'FR', label: 'Fire' }],
    },
  ],
  productModelSchema: {
    baseCode: 'SS2',
    separator: 'dash',
    partsOrder: ['colour', 'cover', 'text'],
  },
} as ModelDefinition

const COMPLETE_CONFIG: Configuration = { colour: 'red', cover: 'shield', text: 'FR' }
const INCOMPLETE_CONFIG: Configuration = { colour: 'red', cover: null, text: null }

vi.mock('@entities/product', () => ({
  isAllRequiredStepsSelected: vi.fn((model: ModelDefinition, config: Configuration) => {
    return model.stepOrder.every((stepId) => {
      const step = model.steps.find((s) => s.id === stepId)
      if (!step?.required) return true
      return config[stepId] != null
    })
  }),
  buildProductModel: vi.fn((_config: Configuration, _model: ModelDefinition) => ({
    baseCode: 'SS2',
    parts: { colour: '0', cover: '2', text: 'FR' },
    fullCode: 'SS2-0-2-FR',
    isComplete: true,
    missingSteps: [],
  })),
}))

vi.mock('@shared/api/projectsApi', () => ({
  fetchProjects: vi.fn(() => Promise.resolve([])),
  createProject: vi.fn((_userId: string, name: string, clientName?: string) =>
    Promise.resolve({
      id: 'proj-1',
      userId: 'user-1',
      name,
      clientName: clientName ?? '',
      date: '2026-01-01',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      lastExportedAt: null,
    }),
  ),
  updateProjectMeta: vi.fn(() => Promise.resolve(true)),
  deleteProject: vi.fn(() => Promise.resolve(true)),
}))

vi.mock('@shared/api/configurationsApi', () => ({
  fetchConfigurations: vi.fn(() => Promise.resolve([])),
  addConfiguration: vi.fn((params: Record<string, unknown>) =>
    Promise.resolve({
      id: `remote-${Date.now()}`,
      modelId: params.modelId,
      productCode: params.productCode,
      configuration: params.config,
      customText: params.customText,
      savedAt: Date.now(),
      name: params.name,
      qty: 1,
      note: '',
    }),
  ),
  removeConfiguration: vi.fn(() => Promise.resolve(true)),
  updateConfigurationQty: vi.fn(() => Promise.resolve(true)),
  updateConfigurationNote: vi.fn(() => Promise.resolve(true)),
  clearConfigurations: vi.fn(() => Promise.resolve(true)),
  checkDuplicateInProject: vi.fn(() => Promise.resolve(false)),
  fetchProjectsWithProduct: vi.fn(() => Promise.resolve(new Map())),
  checkProductInAnyProject: vi.fn(() => Promise.resolve(false)),
}))

function resetStore() {
  useProjectStore.setState({
    projects: [],
    activeProjectId: GUEST_PROJECT_ID,
    guestConfigurations: [],
    guestProjectMeta: {
      projectName: '',
      clientName: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      date: '2026-01-01',
      lastExportedAt: null,
    },
    remoteConfigurations: {},
    isLoading: false,
  })
}

describe('projectStore', () => {
  beforeEach(() => {
    resetStore()
    vi.clearAllMocks()
  })

  describe('guest addConfiguration', () => {
    it('adds configuration to guest list when complete', () => {
      useProjectStore
        .getState()
        .addConfiguration(TEST_MODEL_ID, COMPLETE_CONFIG, null, TEST_MODEL)

      const configs = useProjectStore.getState().guestConfigurations
      expect(configs).toHaveLength(1)
      expect(configs[0].modelId).toBe(TEST_MODEL_ID)
      expect(configs[0].productCode).toBe('SS2-0-2-FR')
      expect(configs[0].qty).toBe(1)
      expect(configs[0].note).toBe('')
    })

    it('does not add incomplete configuration', () => {
      useProjectStore
        .getState()
        .addConfiguration(TEST_MODEL_ID, INCOMPLETE_CONFIG, null, TEST_MODEL)

      expect(useProjectStore.getState().guestConfigurations).toHaveLength(0)
    })

    it('updates guestProjectMeta.updatedAt on add', () => {
      const before = useProjectStore.getState().guestProjectMeta.updatedAt

      useProjectStore
        .getState()
        .addConfiguration(TEST_MODEL_ID, COMPLETE_CONFIG, null, TEST_MODEL)

      const after = useProjectStore.getState().guestProjectMeta.updatedAt
      expect(after).toBeGreaterThanOrEqual(before)
    })

    it('stores custom text when provided', () => {
      const customText: CustomTextData = {
        lineCount: 1,
        line1: 'Test',
        line2: '',
        submitted: true,
      }

      useProjectStore
        .getState()
        .addConfiguration(TEST_MODEL_ID, COMPLETE_CONFIG, customText, TEST_MODEL)

      const configs = useProjectStore.getState().guestConfigurations
      expect(configs[0].customText).toBeDefined()
      expect(configs[0].customText!.line1).toBe('Test')
    })
  })

  describe('guest removeConfiguration', () => {
    it('removes configuration by id', () => {
      useProjectStore
        .getState()
        .addConfiguration(TEST_MODEL_ID, COMPLETE_CONFIG, null, TEST_MODEL)
      const id = useProjectStore.getState().guestConfigurations[0].id

      useProjectStore.getState().removeConfiguration(id)

      expect(useProjectStore.getState().guestConfigurations).toHaveLength(0)
    })

    it('does nothing for non-existent id', () => {
      useProjectStore
        .getState()
        .addConfiguration(TEST_MODEL_ID, COMPLETE_CONFIG, null, TEST_MODEL)

      useProjectStore.getState().removeConfiguration('nonexistent')

      expect(useProjectStore.getState().guestConfigurations).toHaveLength(1)
    })
  })

  describe('guest clearConfigurations', () => {
    it('clears all guest configurations', () => {
      useProjectStore
        .getState()
        .addConfiguration(TEST_MODEL_ID, COMPLETE_CONFIG, null, TEST_MODEL)
      useProjectStore
        .getState()
        .addConfiguration(TEST_MODEL_ID, COMPLETE_CONFIG, null, TEST_MODEL)

      useProjectStore.getState().clearConfigurations()

      expect(useProjectStore.getState().guestConfigurations).toHaveLength(0)
    })
  })

  describe('guest updateConfigurationQty', () => {
    it('updates quantity for guest configuration', () => {
      useProjectStore
        .getState()
        .addConfiguration(TEST_MODEL_ID, COMPLETE_CONFIG, null, TEST_MODEL)
      const id = useProjectStore.getState().guestConfigurations[0].id

      useProjectStore.getState().updateConfigurationQty(id, 5)

      expect(useProjectStore.getState().guestConfigurations[0].qty).toBe(5)
    })

    it('clamps quantity to minimum 1', () => {
      useProjectStore
        .getState()
        .addConfiguration(TEST_MODEL_ID, COMPLETE_CONFIG, null, TEST_MODEL)
      const id = useProjectStore.getState().guestConfigurations[0].id

      useProjectStore.getState().updateConfigurationQty(id, 0)

      expect(useProjectStore.getState().guestConfigurations[0].qty).toBe(1)
    })

    it('floors decimal quantities', () => {
      useProjectStore
        .getState()
        .addConfiguration(TEST_MODEL_ID, COMPLETE_CONFIG, null, TEST_MODEL)
      const id = useProjectStore.getState().guestConfigurations[0].id

      useProjectStore.getState().updateConfigurationQty(id, 3.7)

      expect(useProjectStore.getState().guestConfigurations[0].qty).toBe(3)
    })
  })

  describe('guest updateConfigurationNote', () => {
    it('updates note for guest configuration', () => {
      useProjectStore
        .getState()
        .addConfiguration(TEST_MODEL_ID, COMPLETE_CONFIG, null, TEST_MODEL)
      const id = useProjectStore.getState().guestConfigurations[0].id

      useProjectStore.getState().updateConfigurationNote(id, 'For lobby')

      expect(useProjectStore.getState().guestConfigurations[0].note).toBe('For lobby')
    })
  })

  describe('getActiveConfigurations', () => {
    it('returns guest configurations when active project is guest', () => {
      useProjectStore
        .getState()
        .addConfiguration(TEST_MODEL_ID, COMPLETE_CONFIG, null, TEST_MODEL)

      const active = useProjectStore.getState().getActiveConfigurations()
      expect(active).toHaveLength(1)
    })

    it('returns remote configurations when active project is remote', () => {
      const remoteConfig: SavedConfiguration = {
        id: 'remote-1',
        modelId: TEST_MODEL_ID,
        productCode: 'SS2-0-2-FR',
        configuration: COMPLETE_CONFIG,
        savedAt: Date.now(),
        qty: 1,
        note: '',
      }

      useProjectStore.setState({
        activeProjectId: 'proj-1',
        remoteConfigurations: { 'proj-1': [remoteConfig] },
      })

      const active = useProjectStore.getState().getActiveConfigurations()
      expect(active).toHaveLength(1)
      expect(active[0].id).toBe('remote-1')
    })

    it('returns empty array for unknown remote project', () => {
      useProjectStore.setState({ activeProjectId: 'unknown-project' })

      const active = useProjectStore.getState().getActiveConfigurations()
      expect(active).toHaveLength(0)
    })
  })

  describe('setActiveProjectId', () => {
    it('switches active project', () => {
      useProjectStore.getState().setActiveProjectId('proj-1')

      expect(useProjectStore.getState().activeProjectId).toBe('proj-1')
    })
  })

  describe('clearGuestData', () => {
    it('clears guest configurations and resets meta', () => {
      useProjectStore
        .getState()
        .addConfiguration(TEST_MODEL_ID, COMPLETE_CONFIG, null, TEST_MODEL)
      useProjectStore.getState().setGuestProjectMeta({ projectName: 'My Project' })

      useProjectStore.getState().clearGuestData()

      const state = useProjectStore.getState()
      expect(state.guestConfigurations).toHaveLength(0)
      expect(state.guestProjectMeta.projectName).toBe('')
    })
  })

  describe('loadConfigurationIntoWizard', () => {
    it('returns saved configuration by id', () => {
      useProjectStore
        .getState()
        .addConfiguration(TEST_MODEL_ID, COMPLETE_CONFIG, null, TEST_MODEL)
      const id = useProjectStore.getState().guestConfigurations[0].id

      const loaded = useProjectStore.getState().loadConfigurationIntoWizard(id)
      expect(loaded).not.toBeNull()
      expect(loaded!.id).toBe(id)
    })

    it('returns null for non-existent id', () => {
      const loaded = useProjectStore.getState().loadConfigurationIntoWizard('nonexistent')
      expect(loaded).toBeNull()
    })
  })

  describe('remote addRemoteConfiguration', () => {
    it('adds configuration via API and updates remote state', async () => {
      useProjectStore.setState({
        activeProjectId: 'proj-1',
        remoteConfigurations: { 'proj-1': [] },
      })

      const result = await useProjectStore
        .getState()
        .addRemoteConfiguration(
          'user-1',
          'proj-1',
          TEST_MODEL_ID,
          COMPLETE_CONFIG,
          null,
          TEST_MODEL,
        )

      expect(result).not.toBeNull()
      const remote = useProjectStore.getState().remoteConfigurations['proj-1']
      expect(remote).toHaveLength(1)
    })

    it('returns null for incomplete configuration', async () => {
      const result = await useProjectStore
        .getState()
        .addRemoteConfiguration(
          'user-1',
          'proj-1',
          TEST_MODEL_ID,
          INCOMPLETE_CONFIG,
          null,
          TEST_MODEL,
        )

      expect(result).toBeNull()
    })
  })

  describe('remote removeRemoteConfiguration', () => {
    it('removes configuration via API and updates remote state', async () => {
      useProjectStore.setState({
        activeProjectId: 'proj-1',
        remoteConfigurations: {
          'proj-1': [
            {
              id: 'remote-1',
              modelId: TEST_MODEL_ID,
              productCode: 'SS2-0-2-FR',
              configuration: COMPLETE_CONFIG,
              savedAt: Date.now(),
              qty: 1,
              note: '',
            },
          ],
        },
      })

      await useProjectStore.getState().removeRemoteConfiguration('remote-1', 'proj-1')

      expect(useProjectStore.getState().remoteConfigurations['proj-1']).toHaveLength(0)
    })
  })

  describe('fetchProjects', () => {
    it('fetches and stores projects', async () => {
      const { fetchProjects } = await import('@shared/api/projectsApi')
      vi.mocked(fetchProjects).mockResolvedValueOnce([
        {
          id: 'p1',
          userId: 'u1',
          name: 'Project 1',
          clientName: '',
          date: '2026-01-01',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
          lastExportedAt: null,
        },
      ])

      await useProjectStore.getState().fetchProjects('u1')

      expect(useProjectStore.getState().projects).toHaveLength(1)
      expect(useProjectStore.getState().projects[0].name).toBe('Project 1')
    })
  })

  describe('createProject', () => {
    it('creates project and adds to list', async () => {
      const project = await useProjectStore
        .getState()
        .createProject('user-1', 'New Project', 'Client')

      expect(project).not.toBeNull()
      expect(project!.name).toBe('New Project')
      expect(useProjectStore.getState().projects).toHaveLength(1)
    })
  })

  describe('deleteProject', () => {
    it('removes project and cleans up remote configurations', async () => {
      useProjectStore.setState({
        projects: [
          {
            id: 'proj-1',
            userId: 'u1',
            name: 'P1',
            clientName: '',
            date: '',
            createdAt: '',
            updatedAt: '',
            lastExportedAt: null,
          },
        ],
        activeProjectId: 'proj-1',
        remoteConfigurations: { 'proj-1': [] },
      })

      await useProjectStore.getState().deleteProject('proj-1')

      expect(useProjectStore.getState().projects).toHaveLength(0)
      expect(useProjectStore.getState().remoteConfigurations).not.toHaveProperty('proj-1')
      expect(useProjectStore.getState().activeProjectId).toBe(GUEST_PROJECT_ID)
    })
  })
})
