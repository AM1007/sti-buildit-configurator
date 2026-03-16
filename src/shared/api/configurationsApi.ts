import { supabase } from './supabaseClient'
import type {
  SavedConfiguration,
  ModelId,
  Configuration,
  CustomTextData,
} from '@shared/types'

function rowToSavedConfiguration(row: Record<string, unknown>): SavedConfiguration {
  return {
    id: row.id as string,
    modelId: row.model_id as ModelId,
    productCode: row.product_code as string,
    configuration: row.configuration as Configuration,
    customText: (row.custom_text as CustomTextData | null) ?? undefined,
    savedAt: new Date(row.saved_at as string).getTime(),
    name: (row.name as string | null) ?? undefined,
    qty: row.qty as number,
    note: row.note as string,
  }
}

export async function fetchConfigurations(
  projectId: string,
): Promise<SavedConfiguration[]> {
  const { data, error } = await supabase
    .from('saved_configurations')
    .select('*')
    .eq('project_id', projectId)
    .order('saved_at', { ascending: true })

  if (error) {
    console.error('Failed to fetch configurations:', error.message)
    return []
  }

  return (data ?? []).map(rowToSavedConfiguration)
}

export interface AddConfigurationParams {
  userId: string
  projectId: string
  modelId: ModelId
  productCode: string
  config: Configuration
  customText: CustomTextData | null
  name?: string
}

export async function addConfiguration(
  params: AddConfigurationParams,
): Promise<SavedConfiguration | null> {
  const { data, error } = await supabase
    .from('saved_configurations')
    .insert({
      project_id: params.projectId,
      user_id: params.userId,
      model_id: params.modelId,
      product_code: params.productCode,
      configuration: params.config,
      custom_text: params.customText ?? null,
      qty: 1,
      note: '',
      name: params.name ?? null,
    })
    .select()
    .single()

  if (error || !data) {
    console.error('Failed to add configuration:', error?.message)
    return null
  }

  return rowToSavedConfiguration(data)
}

export async function removeConfiguration(id: string): Promise<boolean> {
  const { error } = await supabase.from('saved_configurations').delete().eq('id', id)

  if (error) {
    console.error('Failed to remove configuration:', error.message)
    return false
  }

  return true
}

export async function updateConfigurationQty(id: string, qty: number): Promise<boolean> {
  const { error } = await supabase
    .from('saved_configurations')
    .update({ qty })
    .eq('id', id)

  if (error) {
    console.error('Failed to update qty:', error.message)
    return false
  }

  return true
}

export async function updateConfigurationNote(
  id: string,
  note: string,
): Promise<boolean> {
  const { error } = await supabase
    .from('saved_configurations')
    .update({ note })
    .eq('id', id)

  if (error) {
    console.error('Failed to update note:', error.message)
    return false
  }

  return true
}

export async function clearConfigurations(configIds: string[]): Promise<boolean> {
  const results = await Promise.all(
    configIds.map((id) => supabase.from('saved_configurations').delete().eq('id', id)),
  )

  const failed = results.some(({ error }) => error !== null)

  if (failed) {
    console.error('Failed to clear some configurations')
    return false
  }

  return true
}

export async function checkDuplicateInProject(
  projectId: string,
  productCode: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('saved_configurations')
    .select('id')
    .eq('project_id', projectId)
    .eq('product_code', productCode)
    .limit(1)

  if (error) {
    console.error('Failed to check duplicate:', error.message)
    return false
  }

  return (data ?? []).length > 0
}

export async function fetchProjectsWithProduct(
  productCode: string,
): Promise<Map<string, string>> {
  const { data, error } = await supabase
    .from('saved_configurations')
    .select('id, project_id')
    .eq('product_code', productCode)

  if (error) {
    console.error('Failed to fetch projects with product:', error.message)
    return new Map()
  }

  return new Map((data ?? []).map((row) => [row.project_id as string, row.id as string]))
}

export async function checkProductInAnyProject(
  userId: string,
  productCode: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('saved_configurations')
    .select('id')
    .eq('user_id', userId)
    .eq('product_code', productCode)
    .limit(1)

  if (error) {
    console.error('Failed to check product in any project:', error.message)
    return false
  }

  return (data ?? []).length > 0
}
