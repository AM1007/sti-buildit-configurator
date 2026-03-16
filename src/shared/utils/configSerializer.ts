import type {
  Configuration,
  CustomTextData,
  SavedConfiguration,
  ProjectMeta,
  ModelId,
} from '../types'

interface SerializedState {
  config: Configuration
  customText?: CustomTextData | null
}

export function serializeConfig(
  config: Configuration,
  customText?: CustomTextData | null,
): string {
  const state: SerializedState = {
    config,
  }

  if (customText) {
    state.customText = customText
  }

  const json = JSON.stringify(state)
  const base64 = btoa(encodeURIComponent(json))

  return base64
}

export function deserializeConfig(encoded: string): SerializedState | null {
  try {
    const json = decodeURIComponent(atob(encoded))
    const state = JSON.parse(json) as SerializedState

    if (!state.config || typeof state.config !== 'object') {
      console.warn('Invalid config structure in URL')
      return null
    }

    return state
  } catch (error) {
    console.warn('Failed to deserialize config from URL:', error)
    return null
  }
}

export function buildShareableUrl(
  baseUrl: string,
  modelId: string,
  config: Configuration,
  customText?: CustomTextData | null,
): string {
  const serialized = serializeConfig(config, customText)

  const params = new URLSearchParams({
    model: modelId,
    state: serialized,
  })

  return `${baseUrl}?${params.toString()}`
}

export function parseConfigFromUrl(searchParams: URLSearchParams): {
  modelId: string | null
  state: SerializedState | null
} {
  const modelId = searchParams.get('model')
  const stateParam = searchParams.get('state')

  let state: SerializedState | null = null

  if (stateParam) {
    state = deserializeConfig(stateParam)
  }

  return { modelId, state }
}

// ---------------------------------------------------------------------------
// My List serialization (for cross-browser transfer via URL)
// ---------------------------------------------------------------------------

/**
 * Compact representation of a saved configuration for URL transfer.
 * Strips fields that can be reconstructed (id, savedAt) to minimize size.
 */
interface CompactSavedItem {
  m: string // modelId
  p: string // productCode
  c: Configuration
  t?: CustomTextData // customText (optional)
  q: number // qty
  n: string // note
}

interface SerializedMyList {
  items: CompactSavedItem[]
  meta?: {
    pn?: string // projectName
    cn?: string // clientName
    d?: string // date
  }
}

function compactItem(item: SavedConfiguration): CompactSavedItem {
  const compact: CompactSavedItem = {
    m: item.modelId,
    p: item.productCode,
    c: item.configuration,
    q: item.qty,
    n: item.note,
  }
  if (item.customText?.submitted) {
    compact.t = item.customText
  }
  return compact
}

function expandItem(compact: CompactSavedItem): SavedConfiguration {
  return {
    id: `shared-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    modelId: compact.m as ModelId,
    productCode: compact.p,
    configuration: compact.c,
    customText: compact.t,
    savedAt: Date.now(),
    qty: compact.q ?? 1,
    note: compact.n ?? '',
  }
}

export function serializeMyList(
  items: SavedConfiguration[],
  projectMeta?: ProjectMeta,
): string {
  const data: SerializedMyList = {
    items: items.map(compactItem),
  }

  if (projectMeta?.projectName || projectMeta?.clientName || projectMeta?.date) {
    data.meta = {}
    if (projectMeta.projectName) data.meta.pn = projectMeta.projectName
    if (projectMeta.clientName) data.meta.cn = projectMeta.clientName
    if (projectMeta.date) data.meta.d = projectMeta.date
  }

  const json = JSON.stringify(data)
  const base64 = btoa(encodeURIComponent(json))
  return base64
}

export function deserializeMyList(encoded: string): {
  items: SavedConfiguration[]
  projectMeta: Partial<ProjectMeta>
} | null {
  try {
    const json = decodeURIComponent(atob(encoded))
    const data = JSON.parse(json) as SerializedMyList

    if (!Array.isArray(data.items) || data.items.length === 0) {
      console.warn('Invalid or empty My List in URL')
      return null
    }

    const items = data.items.map(expandItem)
    const projectMeta: Partial<ProjectMeta> = {}
    if (data.meta?.pn) projectMeta.projectName = data.meta.pn
    if (data.meta?.cn) projectMeta.clientName = data.meta.cn
    if (data.meta?.d) projectMeta.date = data.meta.d

    return { items, projectMeta }
  } catch (error) {
    console.warn('Failed to deserialize My List from URL:', error)
    return null
  }
}

export function buildMyListShareUrl(
  items: SavedConfiguration[],
  projectMeta?: ProjectMeta,
): string {
  const serialized = serializeMyList(items, projectMeta)
  const base = `${window.location.origin}/my-list`
  return `${base}?list=${serialized}`
}
