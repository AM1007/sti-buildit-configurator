export type ModelId =
  | "stopper-stations"
  | "indoor-push-buttons"
  | "key-switches"
  | "waterproof-push-buttons"
  | "reset-call-points"
  | "waterproof-reset-call-point"
  | "g3-multipurpose-push-button"
  | "universal-stopper"
  | "gf-fire-alarm-push-button"
  | "low-profile-universal-stopper";

export type StepId = string;
export type OptionId = string;

export type CustomTextVariant = "multiline-selectable" | "singleline" | "multiline-fixed";

export const MODEL_NAMES: Record<ModelId, string> = {
  "stopper-stations": "Stopper® Stations",
  "indoor-push-buttons": "Indoor Push Buttons",
  "key-switches": "Key Switches",
  "waterproof-push-buttons": "Waterproof Push Buttons",
  "reset-call-points": "ReSet Call Points",
  "waterproof-reset-call-point": "Waterproof ReSet Call Point",
  "g3-multipurpose-push-button": "G3 Multipurpose Push Button",
  "universal-stopper": "Universal Stopper",
  "gf-fire-alarm-push-button": "GF Fire Alarm Push Button",
  "low-profile-universal-stopper": "Low Profile Universal Stopper",
};

export interface Option {
  id: OptionId;
  label: string;
  code: string;
  image?: string;
  notes?: string;
  availableFor?: OptionId[];
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
  separator: "none" | "dash";
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

export interface CustomTextData {
  lineCount: 1 | 2;
  line1: string;
  line2: string;
  submitted: boolean;
}

export type Configuration = Record<StepId, OptionId | null>;

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
  customText?: CustomTextData;
  savedAt: number;
  name?: string;
}

export interface CustomTextConfig {
  stepId: StepId;
  optionId: OptionId;
  variant: CustomTextVariant;
  maxLength: number | { oneLine: number; twoLines: number };
  line2Required: boolean;
}

export interface AvailabilityResult {
  available: boolean;
  reason?: string;
  blockedBy?: StepId;
}

export function createEmptyConfiguration(model: ModelDefinition): Configuration {
  const config: Configuration = {};
  for (const stepId of model.stepOrder) {
    config[stepId] = null;
  }
  return config;
}

export function generateSavedConfigurationId(): string {
  return `saved-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const CUSTOM_TEXT_MAX_LENGTH = {
  ONE_LINE: 13,
  TWO_LINES: 20,
} as const;

export function createEmptyCustomText(): CustomTextData {
  return {
    lineCount: 2,
    line1: "",
    line2: "",
    submitted: false,
  };
}