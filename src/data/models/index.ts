// ============================================================================
// MODEL REGISTRY
// ============================================================================
//
// Central registry for all configurator models.
// Single source of truth for model lookup and enumeration.
//
// Usage:
//   import { getModelById, getAllModels, PRODUCTION_MODELS } from './models';
// ============================================================================

import type { ModelId, ModelDefinition } from "../../types";

import { stopperStationsModel } from "./stopperStations";
import { indoorPushButtonsModel } from "./indoorPushButtons";
import { keySwitchesModel } from "./keySwitches";
import { waterproofPushButtonsModel } from "./waterproofPushButtons";
import { resetCallPointsModel } from "./resetCallPoints";
import { waterproofResetCallPointModel } from "./waterproofResetCallPoint";

// ============================================================================
// MODEL REGISTRY MAP
// ============================================================================

/**
 * Complete registry of all models.
 * Includes both production-ready and placeholder models.
 */
export const MODEL_REGISTRY: Record<ModelId, ModelDefinition> = {
  "stopper-stations": stopperStationsModel,
  "indoor-push-buttons": indoorPushButtonsModel,
  "key-switches": keySwitchesModel,
  "waterproof-push-buttons": waterproofPushButtonsModel,
  "reset-call-points": resetCallPointsModel,
  "waterproof-reset-call-point": waterproofResetCallPointModel,
};

// ============================================================================
// PRODUCTION-READY MODELS
// ============================================================================

/**
 * Models that are fully verified from PDF specifications.
 * All 6 models verified as of Phase 1.2.
 */
export const PRODUCTION_MODEL_IDS: ModelId[] = [
  "stopper-stations",           // PDF 01 ✓
  "indoor-push-buttons",        // PDF 02 ✓
  "key-switches",               // PDF 03 ✓
  "waterproof-push-buttons",    // PDF 04 ✓
  "reset-call-points",          // PDF 05 ✓
  "waterproof-reset-call-point", // PDF 06 ✓
];

/**
 * Check if a model is production-ready.
 */
export function isProductionReady(modelId: ModelId): boolean {
  return PRODUCTION_MODEL_IDS.includes(modelId);
}

// ============================================================================
// LOOKUP FUNCTIONS
// ============================================================================

/**
 * Get model definition by ID.
 * Returns undefined if model not found.
 */
export function getModelById(modelId: ModelId): ModelDefinition | undefined {
  return MODEL_REGISTRY[modelId];
}

/**
 * Get model definition by URL slug.
 * Returns undefined if not found.
 */
export function getModelBySlug(slug: string): ModelDefinition | undefined {
  return Object.values(MODEL_REGISTRY).find((model) => model.slug === slug);
}

/**
 * Get all registered models.
 */
export function getAllModels(): ModelDefinition[] {
  return Object.values(MODEL_REGISTRY);
}

/**
 * Get only production-ready models.
 */
export function getProductionModels(): ModelDefinition[] {
  return PRODUCTION_MODEL_IDS.map((id) => MODEL_REGISTRY[id]);
}

/**
 * Get all model IDs.
 */
export function getAllModelIds(): ModelId[] {
  return Object.keys(MODEL_REGISTRY) as ModelId[];
}

// ============================================================================
// STEP/OPTION LOOKUP (CROSS-MODEL)
// ============================================================================

/**
 * Get step from a specific model.
 */
export function getStepFromModel(modelId: ModelId, stepId: string) {
  const model = getModelById(modelId);
  return model?.steps.find((s) => s.id === stepId);
}

/**
 * Get option from a specific model and step.
 */
export function getOptionFromModel(
  modelId: ModelId,
  stepId: string,
  optionId: string
) {
  const step = getStepFromModel(modelId, stepId);
  return step?.options.find((o) => o.id === optionId);
}

export { stopperStationsModel } from "./stopperStations";
export { indoorPushButtonsModel } from "./indoorPushButtons";
export { keySwitchesModel } from "./keySwitches";
export { waterproofPushButtonsModel } from "./waterproofPushButtons";
export { resetCallPointsModel } from "./resetCallPoints";
export { waterproofResetCallPointModel } from "./waterproofResetCallPoint";