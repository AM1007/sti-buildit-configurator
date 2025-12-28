// ============================================================================
// RULES MODULE - PUBLIC API
// ============================================================================

// Types
export type {
  ConstraintMatrix,
  StepConstraint,
  ModelConstraints,
  BlockReason,
  ConstraintResult,
  ConfigurationState,
  IConstraintEngine,
  OptionAvailability,
  StepAvailability,
} from "./types";

// Engine
export {
  createConstraintEngine,
  getStepAvailability,
  findInvalidSelectionsAfterChange,
  formatBlockReasons,
} from "./constraintEngine";

// Model-specific constraints
export { STOPPER_STATIONS_CONSTRAINTS } from "./stopperStationsRules";
export { INDOOR_PUSH_BUTTONS_CONSTRAINTS } from "./indoorPushButtonsRules";
export { KEY_SWITCHES_CONSTRAINTS } from "./keySwitchesRules";
export { WATERPROOF_PUSH_BUTTONS_CONSTRAINTS } from "./waterproofPushButtonsRules";
export { RESET_CALL_POINTS_CONSTRAINTS } from "./resetCallPointsRules";
export { WATERPROOF_RESET_CALL_POINT_CONSTRAINTS } from "./waterproofResetCallPointRules";