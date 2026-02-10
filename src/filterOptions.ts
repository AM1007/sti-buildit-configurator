import type { Option, Configuration, Step, ModelId, ModelDefinition } from "./types";
import type { ModelConstraints } from "./rules/types";
import { createConstraintEngine, getStepAvailability } from "./rules/constraintEngine";
import { G3_MULTIPURPOSE_PUSH_BUTTON_CONSTRAINTS } from "./rules/G3multipurposepushbuttonrules";
import {
  getValidOptionsForStep as getValidG3Options,
  type G3SelectionState,
} from "./rules/G3multipurposepushbuttonrules";
import { STOPPER_STATIONS_CONSTRAINTS } from "./rules/stopperStationsRules";
import {
  getValidSSOptionsForStep as getValidSSOptions,
  type SSSelectionState,
} from "./rules/stopperStationsRules";
import { GF_FIRE_ALARM_PUSH_BUTTON_CONSTRAINTS } from "./rules/gfFireAlarmPushButtonRules";
import {
  getValidGFOptionsForStep,
  type GFSelectionState,
} from "./rules/gfFireAlarmPushButtonRules";
import { GLOBAL_RESET_CONSTRAINTS } from "./rules/globalResetRules";
import {
  getValidGLROptionsForStep,
  type GLRSelectionState,
} from "./rules/globalResetRules";
import { RESET_CALL_POINTS_CONSTRAINTS } from "./rules/resetCallPointsRules";
import {
  getValidRPOptionsForStep,
  type RPSelectionState,
} from "./rules/resetCallPointsRules";
import { WATERPROOF_RESET_CALL_POINT_CONSTRAINTS } from "./rules/waterproofResetCallPointRules";
import {
  getValidWRPOptionsForStep,
  type WRPSelectionState,
} from "./rules/waterproofResetCallPointRules";
import { INDOOR_PUSH_BUTTONS_CONSTRAINTS } from "./rules/indoorPushButtonsRules";
import {
  getValidIPBOptionsForStep,
  type IPBSelectionState,
} from "./rules/indoorPushButtonsRules";
import { KEY_SWITCHES_CONSTRAINTS } from "./rules/keySwitchesRules";
import {
  getValidKSOptionsForStep,
  type KSSelectionState,
} from "./rules/keySwitchesRules";
import { WATERPROOF_PUSH_BUTTONS_CONSTRAINTS } from "./rules/waterproofPushButtonsRules";
import {
  getValidWPBOptionsForStep,
  type WPBSelectionState,
} from "./rules/waterproofPushButtonsRules";
import { UNIVERSAL_STOPPER_CONSTRAINTS } from "./rules/universalStopperRules";
import {
  getValidUSOptionsForStep,
  type USSelectionState,
} from "./rules/universalStopperRules";

// ============================================================================
// Constraints registry
// ============================================================================

const CONSTRAINTS_MAP: Record<string, ModelConstraints> = {
  "g3-multipurpose-push-button": G3_MULTIPURPOSE_PUSH_BUTTON_CONSTRAINTS,
  "stopper-stations": STOPPER_STATIONS_CONSTRAINTS,
  "gf-fire-alarm-push-button": GF_FIRE_ALARM_PUSH_BUTTON_CONSTRAINTS,
  "global-reset": GLOBAL_RESET_CONSTRAINTS,
  "reset-call-points": RESET_CALL_POINTS_CONSTRAINTS,
  "waterproof-reset-call-point": WATERPROOF_RESET_CALL_POINT_CONSTRAINTS,
  "indoor-push-buttons": INDOOR_PUSH_BUTTONS_CONSTRAINTS,
  "key-switches": KEY_SWITCHES_CONSTRAINTS,
  "waterproof-push-buttons": WATERPROOF_PUSH_BUTTONS_CONSTRAINTS,
  "universal-stopper": UNIVERSAL_STOPPER_CONSTRAINTS,
};

function getModelConstraints(modelId: ModelId): ModelConstraints | null {
  return CONSTRAINTS_MAP[modelId] ?? null;
}

// ============================================================================
// Basic option availability (legacy)
// ============================================================================

export function isOptionAvailable(
  option: Option,
  config: Configuration
): boolean {
  if (!option.availableFor) {
    return true;
  }

  if (!config.colour) {
    return false;
  }

  return option.availableFor.includes(config.colour);
}

export function filterAvailableOptions(
  options: Option[],
  config: Configuration
): Option[] {
  return options.filter((option) => isOptionAvailable(option, config));
}

export function isSelectionStillValid(
  optionId: string | null,
  options: Option[],
  config: Configuration
): boolean {
  if (!optionId) {
    return true;
  }

  const option = options.find((o) => o.id === optionId);

  if (!option) {
    return false;
  }

  return isOptionAvailable(option, config);
}

// ============================================================================
// Allowlist validation for G3 model
// ============================================================================

function configToG3Selection(config: Configuration): G3SelectionState {
  return {
    model: config.model ?? undefined,
    colour: config.colour ?? undefined,
    cover: config.cover ?? undefined,
    buttonType: config.buttonType ?? undefined,
    text: config.text ?? undefined,
    language: config.language ?? undefined,
  };
}

function isG3Model(modelId: ModelId): boolean {
  return modelId === "g3-multipurpose-push-button";
}

/**
 * Gets valid options for a step, applying allowlist validation for G3 model.
 * Returns Set of valid option IDs.
 */
function getG3AllowlistValidOptions(
  stepId: string,
  config: Configuration
): Set<string> | null {
  const g3Selection = configToG3Selection(config);
  
  // Remove the current step from selections to get "other" selections
  const { [stepId as keyof G3SelectionState]: _, ...otherSelections } = g3Selection;
  
  const validOptions = getValidG3Options(
    stepId as keyof G3SelectionState,
    otherSelections
  );
  
  return new Set(validOptions);
}

// ============================================================================
// Allowlist validation for Stopper Stations model
// ============================================================================

function configToSSSelection(config: Configuration): SSSelectionState {
  return {
    colour: config.colour ?? undefined,
    cover: config.cover ?? undefined,
    activation: config.activation ?? undefined,
    text: config.text ?? undefined,
    language: config.language ?? undefined,
  };
}

function isSSModel(modelId: ModelId): boolean {
  return modelId === "stopper-stations";
}

/**
 * Gets valid options for a step, applying allowlist validation for SS model.
 * Returns Set of valid option IDs, or null if not applicable.
 *
 * ASSUMPTION: activation sub-variants (6-red, 6-green, 6-blue, 7-red,
 * 7-green, 7-blue) share the same code digit ("6" or "7") in the model code.
 * The allowlist stores raw codes, so getValidSSOptions returns "6"/"7".
 * The UI option IDs are "6-red", "6-green", etc. We must map:
 *   allowlist code "6" → UI options "6-red", "6-green", "6-blue"
 *   allowlist code "7" → UI options "7-red", "7-green", "7-blue"
 * For non-activation steps this mapping is identity (code === id).
 */
/** Steps that participate in allowlist validation (base model code).
 *  installationOptions is NOT part of the base code — it uses constraint
 *  matrices only and must be skipped here. */
const SS_ALLOWLIST_STEPS: ReadonlySet<string> = new Set<keyof SSSelectionState>([
  "colour", "cover", "activation", "text", "language",
]);

function getSSAllowlistValidOptions(
  stepId: string,
  config: Configuration
): Set<string> | null {
  // Steps outside the base model code are handled by constraint matrices only
  if (!SS_ALLOWLIST_STEPS.has(stepId)) return null;

  const ssSelection = configToSSSelection(config);

  // Build "other" selections: all fields except the current step
  const otherSelections: Partial<SSSelectionState> = {};
  for (const key of Object.keys(ssSelection) as (keyof SSSelectionState)[]) {
    if (key === stepId) continue;
    otherSelections[key] = ssSelection[key];
  }

  // For activation step: convert UI option id (e.g. "6-red") to code ("6")
  // before passing to allowlist lookup
  if (otherSelections.activation) {
    otherSelections.activation = normalizeActivationToCode(otherSelections.activation);
  }

  const validCodes = getValidSSOptions(
    stepId as keyof SSSelectionState,
    otherSelections as Omit<SSSelectionState, typeof stepId>
  );

  // For activation step: expand allowlist codes back to UI option IDs
  // "6" → ["6-red", "6-green", "6-blue"], "7" → ["7-red", "7-green", "7-blue"]
  if (stepId === "activation") {
    const expandedIds = new Set<string>();
    for (const code of validCodes) {
      const uiIds = expandActivationCodeToIds(code);
      for (const id of uiIds) {
        expandedIds.add(id);
      }
    }
    return expandedIds;
  }

  return new Set(validCodes);
}

/**
 * Maps UI activation option ID to its model code digit.
 * "6-red" → "6", "7-green" → "7", "0" → "0", etc.
 */
function normalizeActivationToCode(activationId: string): string {
  if (activationId.startsWith("6-")) return "6";
  if (activationId.startsWith("7-")) return "7";
  return activationId;
}

/**
 * Expands a single activation code to all possible UI option IDs.
 * "6" → ["6-red", "6-green", "6-blue"]
 * "7" → ["7-red", "7-green", "7-blue"]
 * "0" → ["0"], etc.
 */
function expandActivationCodeToIds(code: string): string[] {
  if (code === "6") return ["6-red", "6-green", "6-blue"];
  if (code === "7") return ["7-red", "7-green", "7-blue"];
  return [code];
}

// ============================================================================
// Allowlist validation for GF Fire Alarm Push Button model
// ============================================================================

function configToGFSelection(config: Configuration): GFSelectionState {
  return {
    model: config.model ?? undefined,
    cover: config.cover ?? undefined,
    text: config.text ?? undefined,
    language: config.language ?? undefined,
  };
}

function isGFModel(modelId: ModelId): boolean {
  return modelId === "gf-fire-alarm-push-button";
}

/**
 * Gets valid options for a step, applying allowlist validation for GF model.
 * Returns Set of valid option IDs.
 */
function getGFAllowlistValidOptions(
  stepId: string,
  config: Configuration
): Set<string> | null {
  const gfSelection = configToGFSelection(config);

  // Remove the current step from selections to get "other" selections
  const { [stepId as keyof GFSelectionState]: _, ...otherSelections } = gfSelection;

  const validOptions = getValidGFOptionsForStep(
    stepId as keyof GFSelectionState,
    otherSelections
  );

  return new Set(validOptions);
}

// ============================================================================
// Allowlist validation for Global ReSet model
// ============================================================================

function configToGLRSelection(config: Configuration): GLRSelectionState {
  return {
    colour: config.colour ?? undefined,
    cover: config.cover ?? undefined,
    text: config.text ?? undefined,
    language: config.language ?? undefined,
  };
}

function isGLRModel(modelId: ModelId): boolean {
  return modelId === "global-reset";
}

/** Steps that participate in allowlist validation for GLR.
 *  Cover and Language are fixed (single option) but still validated. */
const GLR_ALLOWLIST_STEPS: ReadonlySet<string> = new Set<keyof GLRSelectionState>([
  "colour", "cover", "text", "language",
]);

/**
 * Gets valid options for a step, applying allowlist validation for GLR model.
 * Returns Set of valid option IDs, or null if not applicable.
 */
function getGLRAllowlistValidOptions(
  stepId: string,
  config: Configuration
): Set<string> | null {
  // Steps outside the base model code are handled by constraint matrices only
  if (!GLR_ALLOWLIST_STEPS.has(stepId)) return null;

  const glrSelection = configToGLRSelection(config);

  // Build "other" selections: all fields except the current step
  const otherSelections: Partial<GLRSelectionState> = {};
  for (const key of Object.keys(glrSelection) as (keyof GLRSelectionState)[]) {
    if (key === stepId) continue;
    otherSelections[key] = glrSelection[key];
  }

  const validOptions = getValidGLROptionsForStep(
    stepId as keyof GLRSelectionState,
    otherSelections as Omit<GLRSelectionState, typeof stepId>
  );

  return new Set(validOptions);
}

// ============================================================================
// Allowlist validation for ReSet Call Points model
// ============================================================================

function configToRPSelection(config: Configuration): RPSelectionState {
  return {
    colour: config.colour ?? undefined,
    mounting: config.mounting ?? undefined,
    electricalArrangement: config.electricalArrangement ?? undefined,
    label: config.label ?? undefined,
  };
}

function isRPModel(modelId: ModelId): boolean {
  return modelId === "reset-call-points";
}

/** All RP steps participate in allowlist validation. */
const RP_ALLOWLIST_STEPS: ReadonlySet<string> = new Set<keyof RPSelectionState>([
  "colour", "mounting", "electricalArrangement", "label",
]);

/**
 * Gets valid options for a step, applying allowlist validation for RP model.
 * Returns Set of valid option IDs, or null if not applicable.
 *
 * This closes the 14 false positives that pass pairwise constraint matrices
 * but are absent from the 50-model whitelist (e.g. RP-RS2-11, RP-GF2-11-CL).
 */
function getRPAllowlistValidOptions(
  stepId: string,
  config: Configuration
): Set<string> | null {
  if (!RP_ALLOWLIST_STEPS.has(stepId)) return null;

  const rpSelection = configToRPSelection(config);

  // Build "other" selections: all fields except the current step
  const otherSelections: Partial<RPSelectionState> = {};
  for (const key of Object.keys(rpSelection) as (keyof RPSelectionState)[]) {
    if (key === stepId) continue;
    otherSelections[key] = rpSelection[key];
  }

  const validOptions = getValidRPOptionsForStep(
    stepId as keyof RPSelectionState,
    otherSelections as Omit<RPSelectionState, typeof stepId>
  );

  return new Set(validOptions);
}

// ============================================================================
// Allowlist validation for Waterproof ReSet Call Point model
// ============================================================================

function configToWRPSelection(config: Configuration): WRPSelectionState {
  return {
    colour: config.colour ?? undefined,
    electricalArrangement: config.electricalArrangement ?? undefined,
    label: config.label ?? undefined,
  };
}

function isWRPModel(modelId: ModelId): boolean {
  return modelId === "waterproof-reset-call-point";
}

/** All WRP steps participate in allowlist validation. */
const WRP_ALLOWLIST_STEPS: ReadonlySet<string> = new Set<keyof WRPSelectionState>([
  "colour", "electricalArrangement", "label",
]);

/**
 * Gets valid options for a step, applying allowlist validation for WRP model.
 * Returns Set of valid option IDs, or null if not applicable.
 *
 * This closes 1 false positive that passes pairwise constraint matrices
 * but is absent from the 23-model whitelist: WRP2-R-02-CL.
 */
function getWRPAllowlistValidOptions(
  stepId: string,
  config: Configuration
): Set<string> | null {
  if (!WRP_ALLOWLIST_STEPS.has(stepId)) return null;

  const wrpSelection = configToWRPSelection(config);

  // Build "other" selections: all fields except the current step
  const otherSelections: Partial<WRPSelectionState> = {};
  for (const key of Object.keys(wrpSelection) as (keyof WRPSelectionState)[]) {
    if (key === stepId) continue;
    otherSelections[key] = wrpSelection[key];
  }

  const validOptions = getValidWRPOptionsForStep(
    stepId as keyof WRPSelectionState,
    otherSelections as Omit<WRPSelectionState, typeof stepId>,
  );

  return new Set(validOptions);
}

// ============================================================================
// Allowlist validation for Indoor Push Buttons model
// ============================================================================

function configToIPBSelection(config: Configuration): IPBSelectionState {
  return {
    colour: config.colour ?? undefined,
    buttonColour: config.buttonColour ?? undefined,
    pushButtonType: config.pushButtonType ?? undefined,
    electricalArrangements: config.electricalArrangements ?? undefined,
    label: config.label ?? undefined,
  };
}

function isIPBModel(modelId: ModelId): boolean {
  return modelId === "indoor-push-buttons";
}

/** All IPB steps participate in allowlist validation. */
const IPB_ALLOWLIST_STEPS: ReadonlySet<string> = new Set<keyof IPBSelectionState>([
  "colour", "buttonColour", "pushButtonType", "electricalArrangements", "label",
]);

/**
 * Gets valid options for a step, applying allowlist validation for IPB model.
 * Returns Set of valid option IDs, or null if not applicable.
 *
 * This closes 15 false positives that pass pairwise constraint matrices
 * but are absent from the 35-model whitelist (e.g. SS3-5G60, SS3-9R60).
 */
function getIPBAllowlistValidOptions(
  stepId: string,
  config: Configuration
): Set<string> | null {
  if (!IPB_ALLOWLIST_STEPS.has(stepId)) return null;

  const ipbSelection = configToIPBSelection(config);

  // Build "other" selections: all fields except the current step
  const otherSelections: Partial<IPBSelectionState> = {};
  for (const key of Object.keys(ipbSelection) as (keyof IPBSelectionState)[]) {
    if (key === stepId) continue;
    otherSelections[key] = ipbSelection[key];
  }

  const validOptions = getValidIPBOptionsForStep(
    stepId as keyof IPBSelectionState,
    otherSelections as Omit<IPBSelectionState, typeof stepId>,
  );

  return new Set(validOptions);
}

// ============================================================================
// Allowlist validation for Key Switches model
// ============================================================================

function configToKSSelection(config: Configuration): KSSelectionState {
  return {
    colourMounting: config.colourMounting ?? undefined,
    switchType: config.switchType ?? undefined,
    electricalArrangement: config.electricalArrangement ?? undefined,
    label: config.label ?? undefined,
  };
}

function isKSModel(modelId: ModelId): boolean {
  return modelId === "key-switches";
}

/** All KS steps participate in allowlist validation.
 *  Label availability depends on the full triplet (colourMounting + switchType +
 *  electricalArrangement), not on any single step — the allowlist catches this.
 *  25 false positives are closed by this level. */
const KS_ALLOWLIST_STEPS: ReadonlySet<string> = new Set<keyof KSSelectionState>([
  "colourMounting", "switchType", "electricalArrangement", "label",
]);

/**
 * Gets valid options for a step, applying allowlist validation for KS model.
 * Returns Set of valid option IDs, or null if not applicable.
 */
function getKSAllowlistValidOptions(
  stepId: string,
  config: Configuration
): Set<string> | null {
  if (!KS_ALLOWLIST_STEPS.has(stepId)) return null;

  const ksSelection = configToKSSelection(config);

  // Build "other" selections: all fields except the current step
  const otherSelections: Partial<KSSelectionState> = {};
  for (const key of Object.keys(ksSelection) as (keyof KSSelectionState)[]) {
    if (key === stepId) continue;
    otherSelections[key] = ksSelection[key];
  }

  const validOptions = getValidKSOptionsForStep(
    stepId as keyof KSSelectionState,
    otherSelections as Omit<KSSelectionState, typeof stepId>
  );

  return new Set(validOptions);
}

// ============================================================================
// Allowlist validation for Waterproof Push Buttons model
// ============================================================================

function configToWPBSelection(config: Configuration): WPBSelectionState {
  return {
    housingColour: config.housingColour ?? undefined,
    buttonColour: config.buttonColour ?? undefined,
    buttonType: config.buttonType ?? undefined,
    label: config.label ?? undefined,
  };
}

function isWPBModel(modelId: ModelId): boolean {
  return modelId === "waterproof-push-buttons";
}

/** Steps that participate in allowlist validation for WPB.
 *  electricalArrangements excluded — single option "4", no variability. */
const WPB_ALLOWLIST_STEPS: ReadonlySet<string> = new Set<keyof WPBSelectionState>([
  "housingColour", "buttonColour", "buttonType", "label",
]);

/**
 * Gets valid options for a step, applying allowlist validation for WPB model.
 * Returns Set of valid option IDs, or null if not applicable.
 *
 * This closes 13 false positives that pass pairwise constraint matrices
 * but are absent from the 36-model whitelist.
 */
function getWPBAllowlistValidOptions(
  stepId: string,
  config: Configuration
): Set<string> | null {
  if (!WPB_ALLOWLIST_STEPS.has(stepId)) return null;

  const wpbSelection = configToWPBSelection(config);

  // Build "other" selections: all fields except the current step
  const otherSelections: Partial<WPBSelectionState> = {};
  for (const key of Object.keys(wpbSelection) as (keyof WPBSelectionState)[]) {
    if (key === stepId) continue;
    otherSelections[key] = wpbSelection[key];
  }

  const validOptions = getValidWPBOptionsForStep(
    stepId as keyof WPBSelectionState,
    otherSelections as Omit<WPBSelectionState, typeof stepId>,
  );

  return new Set(validOptions);
}

// ============================================================================
// Allowlist validation for Universal Stopper model
// ============================================================================

function configToUSSelection(config: Configuration): USSelectionState {
  return {
    mounting: config.mounting ?? undefined,
    hoodSounder: config.hoodSounder ?? undefined,
    colourLabel: config.colourLabel ?? undefined,
  };
}

function isUSModel(modelId: ModelId): boolean {
  return modelId === "universal-stopper";
}

/** All US steps participate in allowlist validation. */
const US_ALLOWLIST_STEPS: ReadonlySet<string> = new Set<keyof USSelectionState>([
  "mounting", "hoodSounder", "colourLabel",
]);

/**
 * Gets valid options for a step, applying allowlist validation for US model.
 * Returns Set of valid option IDs, or null if not applicable.
 *
 * This closes 23 false positives that pass pairwise constraint matrices
 * but are absent from the 65-model whitelist.
 */
function getUSAllowlistValidOptions(
  stepId: string,
  config: Configuration
): Set<string> | null {
  if (!US_ALLOWLIST_STEPS.has(stepId)) return null;

  const usSelection = configToUSSelection(config);

  // Build "other" selections: all fields except the current step
  const otherSelections: Partial<USSelectionState> = {};
  for (const key of Object.keys(usSelection) as (keyof USSelectionState)[]) {
    if (key === stepId) continue;
    otherSelections[key] = usSelection[key];
  }

  const validOptions = getValidUSOptionsForStep(
    stepId as keyof USSelectionState,
    otherSelections as Omit<USSelectionState, typeof stepId>,
  );

  return new Set(validOptions);
}

// ============================================================================
// Enhanced option availability with constraint engine + allowlist
// ============================================================================

export interface OptionAvailabilityResult {
  available: boolean;
  reason?: string;
}

export interface OptionWithAvailability {
  option: Option;
  availability: OptionAvailabilityResult;
}

/**
 * Gets all options for a step with their availability status.
 * Combines constraint matrix checks with allowlist validation for
 * G3, SS, GF, GLR, RP, WRP, IPB, KS, WPB, and US models.
 */
export function getOptionsWithAvailability(
  step: Step,
  config: Configuration,
  modelId: ModelId
): OptionWithAvailability[] {
  const constraints = getModelConstraints(modelId);
  
  // If no constraints defined, all options are available
  if (!constraints) {
    return step.options.map((option) => ({
      option,
      availability: { available: true },
    }));
  }
  
  const engine = createConstraintEngine(constraints);
  const allOptionIds = step.options.map((o) => o.id);
  const stepAvailability = getStepAvailability(engine, step.id, allOptionIds, config);
  
  // Apply allowlist validation per model
  const g3AllowlistValid = isG3Model(modelId)
    ? getG3AllowlistValidOptions(step.id, config)
    : null;

  const ssAllowlistValid = isSSModel(modelId)
    ? getSSAllowlistValidOptions(step.id, config)
    : null;

  const gfAllowlistValid = isGFModel(modelId)
    ? getGFAllowlistValidOptions(step.id, config)
    : null;

  const glrAllowlistValid = isGLRModel(modelId)
    ? getGLRAllowlistValidOptions(step.id, config)
    : null;

  const rpAllowlistValid = isRPModel(modelId)
    ? getRPAllowlistValidOptions(step.id, config)
    : null;

  const wrpAllowlistValid = isWRPModel(modelId)
    ? getWRPAllowlistValidOptions(step.id, config)
    : null;

  const ipbAllowlistValid = isIPBModel(modelId)
    ? getIPBAllowlistValidOptions(step.id, config)
    : null;

  const ksAllowlistValid = isKSModel(modelId)
    ? getKSAllowlistValidOptions(step.id, config)
    : null;

  const wpbAllowlistValid = isWPBModel(modelId)
    ? getWPBAllowlistValidOptions(step.id, config)
    : null;

  const usAllowlistValid = isUSModel(modelId)
    ? getUSAllowlistValidOptions(step.id, config)
    : null;
  
  return step.options.map((option) => {
    const constraintResult = stepAvailability.options.find(
      (o) => o.optionId === option.id
    );
    
    // Check constraint matrix
    if (constraintResult && !constraintResult.available) {
      const reason = constraintResult.reasons.length > 0
        ? constraintResult.reasons[0].message
        : "Not available with current configuration";
      return {
        option,
        availability: { available: false, reason },
      };
    }
    
    // Check G3 allowlist (only if constraint passed)
    if (g3AllowlistValid && !g3AllowlistValid.has(option.id)) {
      return {
        option,
        availability: {
          available: false,
          reason: "This option does not lead to a valid product model",
        },
      };
    }

    // Check SS allowlist (only if constraint passed)
    if (ssAllowlistValid && !ssAllowlistValid.has(option.id)) {
      return {
        option,
        availability: {
          available: false,
          reason: "This option does not lead to a valid product model",
        },
      };
    }

    // Check GF allowlist (only if constraint passed)
    if (gfAllowlistValid && !gfAllowlistValid.has(option.id)) {
      return {
        option,
        availability: {
          available: false,
          reason: "This option does not lead to a valid product model",
        },
      };
    }

    // Check GLR allowlist (only if constraint passed)
    if (glrAllowlistValid && !glrAllowlistValid.has(option.id)) {
      return {
        option,
        availability: {
          available: false,
          reason: "This option does not lead to a valid product model",
        },
      };
    }

    // Check RP allowlist (only if constraint passed)
    if (rpAllowlistValid && !rpAllowlistValid.has(option.id)) {
      return {
        option,
        availability: {
          available: false,
          reason: "This option does not lead to a valid product model",
        },
      };
    }

    // Check WRP allowlist (only if constraint passed)
    if (wrpAllowlistValid && !wrpAllowlistValid.has(option.id)) {
      return {
        option,
        availability: {
          available: false,
          reason: "This option does not lead to a valid product model",
        },
      };
    }

    // Check IPB allowlist (only if constraint passed)
    if (ipbAllowlistValid && !ipbAllowlistValid.has(option.id)) {
      return {
        option,
        availability: {
          available: false,
          reason: "This option does not lead to a valid product model",
        },
      };
    }

    // Check KS allowlist (only if constraint passed)
    if (ksAllowlistValid && !ksAllowlistValid.has(option.id)) {
      return {
        option,
        availability: {
          available: false,
          reason: "This option does not lead to a valid product model",
        },
      };
    }

    // Check WPB allowlist (only if constraint passed)
    if (wpbAllowlistValid && !wpbAllowlistValid.has(option.id)) {
      return {
        option,
        availability: {
          available: false,
          reason: "This option does not lead to a valid product model",
        },
      };
    }

    // Check US allowlist (only if constraint passed)
    if (usAllowlistValid && !usAllowlistValid.has(option.id)) {
      return {
        option,
        availability: {
          available: false,
          reason: "This option does not lead to a valid product model",
        },
      };
    }
    
    return {
      option,
      availability: { available: true },
    };
  });
}

// ============================================================================
// Configuration completeness
// ============================================================================

export function isConfigurationComplete(
  model: ModelDefinition,
  config: Configuration
): boolean {
  for (const stepId of model.stepOrder) {
    const step = model.steps.find((s) => s.id === stepId);
    if (!step) continue;
    
    // Skip non-required steps
    if (!step.required) continue;
    
    const selection = config[stepId];
    if (!selection) {
      return false;
    }
  }
  return true;
}

export function getMissingRequiredSteps(
  model: ModelDefinition,
  config: Configuration
): string[] {
  const missing: string[] = [];
  
  for (const stepId of model.stepOrder) {
    const step = model.steps.find((s) => s.id === stepId);
    if (!step) continue;
    
    // Skip non-required steps
    if (!step.required) continue;
    
    const selection = config[stepId];
    if (!selection) {
      missing.push(stepId);
    }
  }
  
  return missing;
}

export function getCompletionPercentage(
  model: ModelDefinition,
  config: Configuration
): number {
  const requiredSteps = model.stepOrder.filter((stepId) => {
    const step = model.steps.find((s) => s.id === stepId);
    return step && step.required;
  });
  
  if (requiredSteps.length === 0) return 100;
  
  const completedCount = requiredSteps.filter(
    (stepId) => config[stepId] !== null && config[stepId] !== undefined
  ).length;
  
  return Math.round((completedCount / requiredSteps.length) * 100);
}

// ============================================================================
// Selection reset logic
// ============================================================================

/**
 * Returns list of step IDs that should be reset when a step selection changes.
 * This is needed when changing an earlier step invalidates later selections.
 */
export function getSelectionsToReset(
  model: ModelDefinition,
  changedStepId: string,
  newConfig: Configuration
): string[] {
  const toReset: string[] = [];
  const constraints = getModelConstraints(model.id);
  
  if (!constraints) {
    return toReset;
  }
  
  const engine = createConstraintEngine(constraints);
  const changedStepIndex = model.stepOrder.indexOf(changedStepId);
  
  // Check all steps after the changed step
  for (let i = changedStepIndex + 1; i < model.stepOrder.length; i++) {
    const stepId = model.stepOrder[i];
    const currentSelection = newConfig[stepId];
    
    if (!currentSelection) continue;
    
    const result = engine.checkOptionAvailability(stepId, currentSelection, newConfig);
    
    if (!result.available) {
      toReset.push(stepId);
    }
  }
  
  // For G3 model, also check if selection leads to invalid model
  if (isG3Model(model.id)) {
    for (let i = changedStepIndex + 1; i < model.stepOrder.length; i++) {
      const stepId = model.stepOrder[i];
      if (toReset.includes(stepId)) continue;
      
      const currentSelection = newConfig[stepId];
      if (!currentSelection) continue;
      
      const validOptions = getG3AllowlistValidOptions(stepId, newConfig);
      if (validOptions && !validOptions.has(currentSelection)) {
        toReset.push(stepId);
      }
    }
  }

  // For SS model, also check if selection leads to invalid model
  if (isSSModel(model.id)) {
    for (let i = changedStepIndex + 1; i < model.stepOrder.length; i++) {
      const stepId = model.stepOrder[i];
      if (toReset.includes(stepId)) continue;

      const currentSelection = newConfig[stepId];
      if (!currentSelection) continue;

      const validOptions = getSSAllowlistValidOptions(stepId, newConfig);
      if (validOptions && !validOptions.has(currentSelection)) {
        toReset.push(stepId);
      }
    }
  }

  // For GF model, also check if selection leads to invalid model
  if (isGFModel(model.id)) {
    for (let i = changedStepIndex + 1; i < model.stepOrder.length; i++) {
      const stepId = model.stepOrder[i];
      if (toReset.includes(stepId)) continue;

      const currentSelection = newConfig[stepId];
      if (!currentSelection) continue;

      const validOptions = getGFAllowlistValidOptions(stepId, newConfig);
      if (validOptions && !validOptions.has(currentSelection)) {
        toReset.push(stepId);
      }
    }
  }

  // For GLR model, also check if selection leads to invalid model
  if (isGLRModel(model.id)) {
    for (let i = changedStepIndex + 1; i < model.stepOrder.length; i++) {
      const stepId = model.stepOrder[i];
      if (toReset.includes(stepId)) continue;

      const currentSelection = newConfig[stepId];
      if (!currentSelection) continue;

      const validOptions = getGLRAllowlistValidOptions(stepId, newConfig);
      if (validOptions && !validOptions.has(currentSelection)) {
        toReset.push(stepId);
      }
    }
  }

  // For RP model, also check if selection leads to invalid model
  if (isRPModel(model.id)) {
    for (let i = changedStepIndex + 1; i < model.stepOrder.length; i++) {
      const stepId = model.stepOrder[i];
      if (toReset.includes(stepId)) continue;

      const currentSelection = newConfig[stepId];
      if (!currentSelection) continue;

      const validOptions = getRPAllowlistValidOptions(stepId, newConfig);
      if (validOptions && !validOptions.has(currentSelection)) {
        toReset.push(stepId);
      }
    }
  }

  // For WRP model, also check if selection leads to invalid model
  if (isWRPModel(model.id)) {
    for (let i = changedStepIndex + 1; i < model.stepOrder.length; i++) {
      const stepId = model.stepOrder[i];
      if (toReset.includes(stepId)) continue;

      const currentSelection = newConfig[stepId];
      if (!currentSelection) continue;

      const validOptions = getWRPAllowlistValidOptions(stepId, newConfig);
      if (validOptions && !validOptions.has(currentSelection)) {
        toReset.push(stepId);
      }
    }
  }

  // For IPB model, also check if selection leads to invalid model
  if (isIPBModel(model.id)) {
    for (let i = changedStepIndex + 1; i < model.stepOrder.length; i++) {
      const stepId = model.stepOrder[i];
      if (toReset.includes(stepId)) continue;

      const currentSelection = newConfig[stepId];
      if (!currentSelection) continue;

      const validOptions = getIPBAllowlistValidOptions(stepId, newConfig);
      if (validOptions && !validOptions.has(currentSelection)) {
        toReset.push(stepId);
      }
    }
  }

  // For KS model, also check if selection leads to invalid model
  if (isKSModel(model.id)) {
    for (let i = changedStepIndex + 1; i < model.stepOrder.length; i++) {
      const stepId = model.stepOrder[i];
      if (toReset.includes(stepId)) continue;

      const currentSelection = newConfig[stepId];
      if (!currentSelection) continue;

      const validOptions = getKSAllowlistValidOptions(stepId, newConfig);
      if (validOptions && !validOptions.has(currentSelection)) {
        toReset.push(stepId);
      }
    }
  }

  // For WPB model, also check if selection leads to invalid model
  if (isWPBModel(model.id)) {
    for (let i = changedStepIndex + 1; i < model.stepOrder.length; i++) {
      const stepId = model.stepOrder[i];
      if (toReset.includes(stepId)) continue;

      const currentSelection = newConfig[stepId];
      if (!currentSelection) continue;

      const validOptions = getWPBAllowlistValidOptions(stepId, newConfig);
      if (validOptions && !validOptions.has(currentSelection)) {
        toReset.push(stepId);
      }
    }
  }

  // For US model, also check if selection leads to invalid model
  if (isUSModel(model.id)) {
    for (let i = changedStepIndex + 1; i < model.stepOrder.length; i++) {
      const stepId = model.stepOrder[i];
      if (toReset.includes(stepId)) continue;

      const currentSelection = newConfig[stepId];
      if (!currentSelection) continue;

      const validOptions = getUSAllowlistValidOptions(stepId, newConfig);
      if (validOptions && !validOptions.has(currentSelection)) {
        toReset.push(stepId);
      }
    }
  }
  
  return toReset;
}