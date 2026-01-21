import type { ModelId, ModelDefinition } from "../../types";

import { stopperStationsModel } from "./stopperStations";
import { indoorPushButtonsModel } from "./indoorPushButtons";
import { keySwitchesModel } from "./keySwitches";
import { waterproofPushButtonsModel } from "./waterproofPushButtons";
import { resetCallPointsModel } from "./resetCallPoints";
import { waterproofResetCallPointModel } from "./waterproofResetCallPoint";
import { g3MultipurposePushButtonModel } from "./g3MultipurposePushButton";
import { universalStopperModel } from "./universalStopper";
import { gfFireAlarmPushButtonModel } from "./gfFireAlarmPushButton";
import { lowProfileUniversalStopperModel } from "./lowProfileUniversalStopper";
import { globalResetModel } from "./globalReset";
import { enviroStopperModel } from "./enviroStopper";
import { alertPointModel } from "./alertPoint";

export const MODEL_REGISTRY: Record<ModelId, ModelDefinition> = {
  "stopper-stations": stopperStationsModel,
  "indoor-push-buttons": indoorPushButtonsModel,
  "key-switches": keySwitchesModel,
  "waterproof-push-buttons": waterproofPushButtonsModel,
  "reset-call-points": resetCallPointsModel,
  "waterproof-reset-call-point": waterproofResetCallPointModel,
  "g3-multipurpose-push-button": g3MultipurposePushButtonModel,
  "universal-stopper": universalStopperModel,
  "gf-fire-alarm-push-button": gfFireAlarmPushButtonModel,
  "low-profile-universal-stopper": lowProfileUniversalStopperModel,
  "global-reset": globalResetModel,
  "enviro-stopper": enviroStopperModel,
  "alert-point": alertPointModel,
};

export const PRODUCTION_MODEL_IDS: ModelId[] = [
  "stopper-stations",           
  "indoor-push-buttons",        
  "key-switches",               
  "waterproof-push-buttons",    
  "reset-call-points",          
  "waterproof-reset-call-point", 
  "g3-multipurpose-push-button",
  "universal-stopper",
  "gf-fire-alarm-push-button",
  "low-profile-universal-stopper",
  "global-reset",
  "enviro-stopper",
  "alert-point",
];

export function isProductionReady(modelId: ModelId): boolean {
  return PRODUCTION_MODEL_IDS.includes(modelId);
}

export function getModelById(modelId: ModelId): ModelDefinition | undefined {
  return MODEL_REGISTRY[modelId];
}


export function getModelBySlug(slug: string): ModelDefinition | undefined {
  return Object.values(MODEL_REGISTRY).find((model) => model.slug === slug);
}


export function getAllModels(): ModelDefinition[] {
  return Object.values(MODEL_REGISTRY);
}

export function getProductionModels(): ModelDefinition[] {
  return PRODUCTION_MODEL_IDS.map((id) => MODEL_REGISTRY[id]);
}

export function getAllModelIds(): ModelId[] {
  return Object.keys(MODEL_REGISTRY) as ModelId[];
}

export function getStepFromModel(modelId: ModelId, stepId: string) {
  const model = getModelById(modelId);
  return model?.steps.find((s) => s.id === stepId);
}

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
export { g3MultipurposePushButtonModel } from "./g3MultipurposePushButton";
export { universalStopperModel } from "./universalStopper";
export { gfFireAlarmPushButtonModel } from "./gfFireAlarmPushButton";
export { lowProfileUniversalStopperModel } from "./lowProfileUniversalStopper";
export { globalResetModel } from "./globalReset";
export { enviroStopperModel } from "./enviroStopper";
export { alertPointModel } from "./alertPoint";