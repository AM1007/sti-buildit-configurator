export type ModelId =
  | "stopper-stations"
  | "indoor-push-buttons"
  | "key-switches"
  | "waterproof-push-buttons"
  | "reset-call-points"
  | "waterproof-reset-call-point";

export const MODEL_NAMES: Record<ModelId, string> = {
  "stopper-stations": "Stopper® Stations",
  "indoor-push-buttons": "StopperSwitches Indoor Push Buttons",
  "key-switches": "StopperSwitches Key Switches",
  "waterproof-push-buttons": "StopperSwitches Waterproof Push Buttons",
  "reset-call-points": "ReSet Call Points",
  "waterproof-reset-call-point": "Waterproof ReSet Call Point",
};

export const MODEL_SLUGS: Record<ModelId, string> = {
  "stopper-stations": "stopper-stations",
  "indoor-push-buttons": "indoor-push-buttons",
  "key-switches": "key-switches",
  "waterproof-push-buttons": "waterproof-push-buttons",
  "reset-call-points": "reset-call-points",
  "waterproof-reset-call-point": "waterproof-reset-call-point",
};

export type OptionId = string;

export type StepId = string;

export interface Option {
  id: OptionId;
  label: string;
  code: string;
  image?: string;
  notes?: string;
  availableFor?: string[];
  dependsOn?: StepId;
}

export interface Step {
  id: StepId;
  title: string;
  required: boolean;
  options: Option[];
}

export interface ProductModelSchema {
  baseCode: string;
  partsOrder: StepId[];
  separator: "none" | "dash" | string;
  separatorMap?: Record<StepId, string>;
}

export interface ModelDefinition {
  id: ModelId;
  name: string;
  slug: string;
  steps: Step[];
  stepOrder: StepId[];
  productModelSchema: ProductModelSchema;
  primaryDependencyStep?: StepId;
}

export type Configuration = Record<StepId, OptionId | null>;

export function createEmptyConfiguration(model: ModelDefinition): Configuration {
  const config: Configuration = {};
  for (const stepId of model.stepOrder) {
    config[stepId] = null;
  }
  return config;
}

export interface ProductModel {
  baseCode: string;
  parts: Record<StepId, string>;
  fullCode: string;
  isComplete: boolean;
  missingSteps?: StepId[];
}

export interface SavedConfiguration {
  id: string;
  modelId: ModelId;
  productCode: string;
  configuration: Configuration;
  savedAt: number;
  name?: string;
}
export function generateSavedConfigurationId(): string {
  return `config-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface AvailabilityResult {
  available: boolean;
  reason?: string;
  blockedBy?: StepId;
}

export type LegacyStepId =
  | "colour"
  | "cover"
  | "activation"
  | "text"
  | "language"
  | "installationOptions";

export interface LegacyConfiguration {
  colour: OptionId | null;
  cover: OptionId | null;
  activation: OptionId | null;
  text: OptionId | null;
  language: OptionId | null;
  installationOptions: OptionId | null;
}

export const STEP_ORDER: LegacyStepId[] = [
  "colour",
  "cover",
  "activation",
  "text",
  "language",
  "installationOptions",
];