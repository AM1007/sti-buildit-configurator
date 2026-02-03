import type { ModelConstraints, ConstraintMatrix } from "./types";

// ─────────────────────────────────────────────────────────────
// ALLOWLIST: Valid Stopper Stations model codes
// Source: 01–06_Stopper_Stations_[colour].md (209 codes)
// Format: SS2[colour][cover][activation][text]-[language]
// Cover is always "0" in current catalog
// ─────────────────────────────────────────────────────────────

export const VALID_MODEL_CODES: readonly string[] = [
  // ── Red (colour=0): 44 models ──
  "SS2000ES-EN",
  "SS2000NT-EN",
  "SS2000PO-EN",
  "SS2000ZA-EN",
  "SS2001AB-EN",
  "SS2001EM-EN",
  "SS2001ES-EN",
  "SS2001EV-EN",
  "SS2001HV-EN",
  "SS2001LD-EN",
  "SS2001NT-EN",
  "SS2001PO-EN",
  "SS2001PS-EN",
  "SS2001ZA-ZL",
  "SS2002AB-EN",
  "SS2002EM-EN",
  "SS2002EX-EN",
  "SS2002LD-EN",
  "SS2002NT-EN",
  "SS2002ZA-EN",
  "SS2003EM-EN",
  "SS2003NT-EN",
  "SS2004AB-EN",
  "SS2004EM-EN",
  "SS2004ES-EN",
  "SS2004LD-EN",
  "SS2004NT-EN",
  "SS2004PS-EN",
  "SS2004ZA-EN",
  "SS2005ES-EN",
  "SS2005NT-EN",
  "SS2005ZA-EN",
  "SS2006EM-EN",
  "SS2006NT-EN",
  "SS2007AB-EN",
  "SS2008EM-EN",
  "SS2008EX-EN",
  "SS2009AB-EN",
  "SS2009EM-EN",
  "SS2009EX-EN",
  "SS2009LD-EN",
  "SS2009PO-EN",
  "SS2009PX-EN",
  "SS2009ZA-EN",

  // ── Green (colour=1): 44 models ──
  "SS2100EM-EN",
  "SS2100EX-EN",
  "SS2100NT-EN",
  "SS2100ZA-EN",
  "SS2101ES-EN",
  "SS2101EV-EN",
  "SS2101EX-EN",
  "SS2101LD-EN",
  "SS2101ZA-EN",
  "SS2102EM-EN",
  "SS2102EV-EN",
  "SS2102EX-EN",
  "SS2102HV-EN",
  "SS2102LD-EN",
  "SS2102NT-EN",
  "SS2102XT-EN",
  "SS2103AB-EN",
  "SS2103NT-EN",
  "SS2104EX-EN",
  "SS2104NT-EN",
  "SS2104PX-EN",
  "SS2104XT-EN",
  "SS2104ZA-EN",
  "SS2105EX-EN",
  "SS2105NT-EN",
  "SS2105PX-EN",
  "SS2105ZA-EN",
  "SS2106EX-EN",
  "SS2106NT-EN",
  "SS2106PX-EN",
  "SS2106XT-EN",
  "SS2106ZA-EN",
  "SS2107XT-EN",
  "SS2107ZA-ZL",
  "SS2108EM-EN",
  "SS2108EX-EN",
  "SS2108NT-EN",
  "SS2108PX-EN",
  "SS2108XT-EN",
  "SS2109EV-EN",
  "SS2109EX-EN",
  "SS2109NT-EN",
  "SS2109PX-EN",
  "SS2109ZA-EN",

  // ── Yellow (colour=2): 55 models ──
  "SS2200EM-EN",
  "SS2200LD-EN",
  "SS2200PO-EN",
  "SS2200ZA-EN",
  "SS2201AB-EN",
  "SS2201EM-EN",
  "SS2201ES-EN",
  "SS2201EV-EN",
  "SS2201LD-EN",
  "SS2201NT-EN",
  "SS2201PO-EN",
  "SS2201PS-EN",
  "SS2201PX-EN",
  "SS2201ZA-EN",
  "SS2202AB-EN",
  "SS2202EM-EN",
  "SS2202ES-EN",
  "SS2202EX-EN",
  "SS2202HV-EN",
  "SS2202LD-EN",
  "SS2202NT-EN",
  "SS2202PO-EN",
  "SS2202PX-EN",
  "SS2202ZA-EN",
  "SS2203NT-EN",
  "SS2203PO-EN",
  "SS2203ZA-EN",
  "SS2204AB-EN",
  "SS2204EM-EN",
  "SS2204ES-EN",
  "SS2204EV-EN",
  "SS2204LD-EN",
  "SS2204NT-EN",
  "SS2204PO-EN",
  "SS2204ZA-EN",
  "SS2205EM-EN",
  "SS2205ES-EN",
  "SS2205EX-EN",
  "SS2205LD-EN",
  "SS2205NT-EN",
  "SS2205PO-EN",
  "SS2205ZA-EN",
  "SS2207AB-EN",
  "SS2207PO-EN",
  "SS2208NT-EN",
  "SS2208ZA-EN",
  "SS2209EM-EN",
  "SS2209ES-EN",
  "SS2209EV-EN",
  "SS2209EX-EN",
  "SS2209LD-EN",
  "SS2209NT-EN",
  "SS2209PO-EN",
  "SS2209PS-EN",
  "SS2209ZA-EN",

  // ── White (colour=3): 25 models ──
  "SS2300EM-EN",
  "SS2301AB-EN",
  "SS2301EM-EN",
  "SS2301ES-EN",
  "SS2301HV-EN",
  "SS2301LD-EN",
  "SS2301NT-EN",
  "SS2301ZA-EN",
  "SS2302AB-EN",
  "SS2302EM-EN",
  "SS2302LD-EN",
  "SS2302ZA-EN",
  "SS2303NT-EN",
  "SS2304AB-EN",
  "SS2304NT-EN",
  "SS2304ZA-EN",
  "SS2305ZA-EN",
  "SS2307ZA-EN",
  "SS2308EX-EN",
  "SS2308NT-EN",
  "SS2308PX-EN",
  "SS2309EM-EN",
  "SS2309LD-EN",
  "SS2309PO-EN",
  "SS2309ZA-EN",

  // ── Blue (colour=4): 36 models ──
  "SS2400EM-EN",
  "SS2400EX-EN",
  "SS2400LD-EN",
  "SS2400NT-EN",
  "SS2400ZA-EN",
  "SS2401EM-EN",
  "SS2401ES-EN",
  "SS2401EX-EN",
  "SS2401LD-EN",
  "SS2401NT-EN",
  "SS2401ZA-EN",
  "SS2402EM-EN",
  "SS2402LD-EN",
  "SS2402NT-EN",
  "SS2402ZA-EN",
  "SS2403LD-EN",
  "SS2403NT-EN",
  "SS2403ZA-EN",
  "SS2404EM-EN",
  "SS2404ES-EN",
  "SS2404EX-EN",
  "SS2404LD-EN",
  "SS2404ZA-EN",
  "SS2405EM-EN",
  "SS2405LD-EN",
  "SS2405ZA-EN",
  "SS2406EM-EN",
  "SS2406LD-EN",
  "SS2408EX-EN",
  "SS2408NT-EN",
  "SS2408PX-EN",
  "SS2409EM-EN",
  "SS2409EX-EN",
  "SS2409LD-EN",
  "SS2409NT-EN",
  "SS2409ZA-EN",

  // ── Orange (colour=5): 5 models ──
  "SS2501LD-EN",
  "SS2502EM-EN",
  "SS2503ZA-EN",
  "SS2509PO-EN",
  "SS2509ZA-EN",
] as const;

const VALID_MODEL_SET = new Set(VALID_MODEL_CODES);

// ─────────────────────────────────────────────────────────────
// Allowlist selection state
// ─────────────────────────────────────────────────────────────

export interface SSSelectionState {
  colour?: string;
  cover?: string;
  activation?: string;
  text?: string;
  language?: string;
  // installationOptions is NOT part of the base model code
}

// ─────────────────────────────────────────────────────────────
// Build base model code from selections
// installationOptions excluded — they are appended separately
// by buildProductModel and do not affect allowlist validation
// ─────────────────────────────────────────────────────────────

export function buildSSModelCode(selections: SSSelectionState): string | null {
  const { colour, cover, activation, text, language } = selections;
  if (!colour || !cover || !activation || !text || !language) return null;

  // ASSUMPTION: activation sub-variants (6-red, 6-green, etc.)
  // map to single digit in model code. The code property in steps.ts
  // already provides this mapping (code: "6" for all 6-xxx variants).
  // We receive the raw code value here, not the option id.
  return `SS2${colour}${cover}${activation}${text}-${language}`;
}

// ─────────────────────────────────────────────────────────────
// Validate full combination against allowlist
// ─────────────────────────────────────────────────────────────

export function isValidSSCombination(
  selections: SSSelectionState,
): { valid: true } | { valid: false; reason: string } {
  const modelCode = buildSSModelCode(selections);

  // Incomplete selection — allow user to continue picking
  if (!modelCode) return { valid: true };

  if (VALID_MODEL_SET.has(modelCode)) return { valid: true };

  return {
    valid: false,
    reason: `Model ${modelCode} is not available. This combination is not in the approved product list.`,
  };
}

// ─────────────────────────────────────────────────────────────
// Get valid options for a specific step given other selections
// Used by filterOptions to disable unavailable options
// ─────────────────────────────────────────────────────────────

export function getValidSSOptionsForStep(
  stepId: keyof SSSelectionState,
  currentSelections: Omit<SSSelectionState, typeof stepId>,
): string[] {
  const validOptions = new Set<string>();

  for (const code of VALID_MODEL_CODES) {
    const parsed = parseSSModelCode(code);
    if (!parsed) continue;

    let matches = true;
    for (const [key, value] of Object.entries(currentSelections)) {
      if (value && parsed[key as keyof SSSelectionState] !== value) {
        matches = false;
        break;
      }
    }

    if (matches) {
      const optionValue = parsed[stepId];
      if (optionValue) validOptions.add(optionValue);
    }
  }

  return Array.from(validOptions);
}

// ─────────────────────────────────────────────────────────────
// Parse model code back to selection state
//
// ASSUMPTION: activation sub-variants (6-red vs 6-green vs 6-blue,
// 7-red vs 7-green vs 7-blue) cannot be distinguished from the
// model code alone — they all share the same digit.
// This limits reverse parsing but does NOT affect forward
// validation (user selection → code → allowlist check).
// ─────────────────────────────────────────────────────────────

export function parseSSModelCode(code: string): SSSelectionState | null {
  // SS2[colour:1][cover:1][activation:1][text:2]-[language:2]
  const match = code.match(/^SS2(\d)(\d)(\d)([A-Z]{2})-([A-Z]{2})$/);
  if (!match) return null;

  return {
    colour: match[1],
    cover: match[2],
    activation: match[3],
    text: match[4],
    language: match[5],
  };
}

// ─────────────────────────────────────────────────────────────
// CONSTRAINT MATRICES (existing, unchanged)
// ─────────────────────────────────────────────────────────────

const COLOUR_TO_ACTIVATION: ConstraintMatrix = {
  "0": ["0", "1", "2", "3", "4", "5", "6-red", "7-red", "8", "9"],
  "1": ["0", "1", "2", "3", "4", "5", "6-green", "7-green", "8", "9"],
  "2": ["0", "1", "2", "3", "4", "5", "7-red", "8", "9"],
  "3": ["0", "1", "2", "3", "4", "5", "7-red", "8", "9"],
  "4": ["0", "1", "2", "3", "4", "5", "6-blue", "8", "9"],
  "5": ["1", "2", "3", "9"],
};

const ACTIVATION_TO_COLOUR: ConstraintMatrix = {
  "0": ["0", "1", "2", "3", "4"],
  "1": ["0", "1", "2", "3", "4", "5"],
  "2": ["0", "1", "2", "3", "4", "5"],
  "3": ["0", "1", "2", "3", "4", "5"],
  "4": ["0", "1", "2", "3", "4"],
  "5": ["0", "1", "2", "3", "4"],
  "6-red": ["0"],
  "6-green": ["1"],
  "6-blue": ["4"],
  "7-red": ["0", "2", "3"],
  "7-green": ["1"],
  "8": ["0", "1", "2", "3", "4"],
  "9": ["0", "1", "2", "3", "4", "5"],
};

const COLOUR_TO_TEXT: ConstraintMatrix = {
  "0": ["AB", "EM", "ES", "EV", "EX", "HV", "LD", "NT", "PO", "PS", "PX", "ZA"],
  "1": ["AB", "EM", "ES", "EV", "EX", "HV", "LD", "NT", "PX", "XT", "ZA"],
  "2": ["AB", "EM", "ES", "EV", "EX", "HV", "LD", "NT", "PO", "PS", "PX", "ZA"],
  "3": ["AB", "EM", "ES", "EX", "HV", "LD", "NT", "PO", "PX", "ZA"],
  "4": ["EM", "ES", "EX", "LD", "NT", "PX", "ZA"],
  "5": ["EM", "LD", "PO", "ZA"],
};

const TEXT_TO_COLOUR: ConstraintMatrix = {
  "AB": ["0", "1", "2", "3"],
  "EM": ["0", "1", "2", "3", "4", "5"],
  "ES": ["0", "1", "2", "3", "4"],
  "EV": ["0", "1", "2"],
  "EX": ["0", "1", "2", "3", "4"],
  "HV": ["0", "1", "2", "3"],
  "LD": ["0", "1", "2", "3", "4", "5"],
  "NT": ["0", "1", "2", "3", "4"],
  "PO": ["0", "2", "3", "5"],
  "PS": ["0", "2"],
  "PX": ["0", "1", "2", "3", "4"],
  "XT": ["1"],
  "ZA": ["0", "1", "2", "3", "4", "5"],
};

const COLOUR_TO_LANGUAGE: ConstraintMatrix = {
  "0": ["EN", "ZL"],
  "1": ["EN", "ZL"],
  "2": ["EN"],
  "3": ["EN"],
  "4": ["EN"],
  "5": ["EN"],
};

const LANGUAGE_TO_COLOUR: ConstraintMatrix = {
  "EN": ["0", "1", "2", "3", "4", "5"],
  "ZL": ["0", "1"],
};

const ACTIVATION_TO_TEXT: ConstraintMatrix = {
  "0": ["EM", "ES", "EX", "LD", "NT", "PO", "ZA"],
  "1": ["AB", "EM", "ES", "EV", "EX", "HV", "LD", "NT", "PO", "PS", "PX", "ZA"],
  "2": ["AB", "EM", "ES", "EV", "EX", "HV", "LD", "NT", "PO", "PX", "XT", "ZA"],
  "3": ["AB", "EM", "LD", "NT", "PO", "ZA"],
  "4": ["AB", "EM", "ES", "EV", "EX", "LD", "NT", "PO", "PS", "PX", "XT", "ZA"],
  "5": ["EM", "ES", "EX", "LD", "NT", "PO", "PX", "ZA"],
  "6-red": ["EM", "NT"],
  "6-green": ["EX", "NT", "PX", "XT", "ZA"],
  "6-blue": ["EM", "LD"],
  "7-red": ["AB", "PO", "ZA"],
  "7-green": ["XT", "ZA"],
  "8": ["EM", "EX", "NT", "PX", "XT", "ZA"],
  "9": ["AB", "EM", "ES", "EV", "EX", "LD", "NT", "PO", "PS", "PX", "ZA"],
};

const TEXT_TO_ACTIVATION: ConstraintMatrix = {
  "AB": ["1", "2", "3", "4", "7-red", "9"],
  "EM": ["0", "1", "2", "3", "4", "5", "6-blue", "6-red", "8", "9"],
  "ES": ["0", "1", "2", "4", "5", "9"],
  "EV": ["1", "2", "4", "9"],
  "EX": ["0", "1", "2", "4", "5", "6-green", "8", "9"],
  "HV": ["1", "2"],
  "LD": ["0", "1", "2", "3", "4", "5", "6-blue", "9"],
  "NT": ["0", "1", "2", "3", "4", "5", "6-green", "6-red", "8", "9"],
  "PO": ["0", "1", "2", "3", "4", "5", "7-red", "9"],
  "PS": ["1", "4", "9"],
  "PX": ["1", "2", "4", "5", "6-green", "8", "9"],
  "XT": ["2", "4", "6-green", "7-green", "8"],
  "ZA": ["0", "1", "2", "3", "4", "5", "6-green", "7-green", "7-red", "8", "9"],
};

const ACTIVATION_TO_LANGUAGE: ConstraintMatrix = {
  "0": ["EN"],
  "1": ["EN", "ZL"],
  "2": ["EN"],
  "3": ["EN"],
  "4": ["EN"],
  "5": ["EN"],
  "6-red": ["EN"],
  "6-green": ["EN"],
  "6-blue": ["EN"],
  "7-red": ["EN"],
  "7-green": ["EN", "ZL"],
  "8": ["EN"],
  "9": ["EN"],
};

const LANGUAGE_TO_ACTIVATION: ConstraintMatrix = {
  "EN": ["0", "1", "2", "3", "4", "5", "6-blue", "6-green", "6-red", "7-green", "7-red", "8", "9"],
  "ZL": ["1", "7-green"],
};

const TEXT_TO_LANGUAGE: ConstraintMatrix = {
  "AB": ["EN"],
  "EM": ["EN"],
  "ES": ["EN"],
  "EV": ["EN"],
  "EX": ["EN"],
  "HV": ["EN"],
  "LD": ["EN"],
  "NT": ["EN"],
  "PO": ["EN"],
  "PS": ["EN"],
  "PX": ["EN"],
  "XT": ["EN"],
  "ZA": ["EN", "ZL"],
};

const LANGUAGE_TO_TEXT: ConstraintMatrix = {
  "EN": ["AB", "EM", "ES", "EV", "EX", "HV", "LD", "NT", "PO", "PS", "PX", "XT", "ZA"],
  "ZL": ["ZA"],
};

const COLOUR_TO_INSTALLATION: ConstraintMatrix = {
  "0": ["none", "&KIT-71100A-R", "&KIT-71101B-R"],
  "1": ["none", "&KIT-71100A-G", "&KIT-71101B-G"],
  "2": ["none", "&KIT-71100A-Y", "&KIT-71101B-Y"],
  "3": ["none", "&KIT-71100A-W", "&KIT-71101B-W"],
  "4": ["none", "&KIT-71100A-B", "&KIT-71101B-B"],
  "5": ["none", "&KIT-71100A-E", "&KIT-71101B-E"],
};

const ACTIVATION_TO_INSTALLATION: ConstraintMatrix = {
  "0": [
    "&KIT-71101B-R", "&KIT-71101B-G", "&KIT-71101B-Y",
    "&KIT-71101B-W", "&KIT-71101B-B", "&KIT-71101B-E",
  ],
  "1": [
    "&KIT-71101B-R", "&KIT-71101B-E",
    "&KIT-71101B-G", "&KIT-71101B-Y",
    "&KIT-71101B-W", "&KIT-71101B-B",
  ],
  "2": [
    "none",
    "&KIT-71100A-R", "&KIT-71100A-G", "&KIT-71100A-Y",
    "&KIT-71100A-W", "&KIT-71100A-B", "&KIT-71100A-E",
  ],
  "3": [
    "&KIT-71101B-R", "&KIT-71101B-G", "&KIT-71101B-Y",
    "&KIT-71101B-W", "&KIT-71101B-B", "&KIT-71101B-E",
  ],
  "4": [
    "&KIT-71101B-R", "&KIT-71101B-G", "&KIT-71101B-Y",
    "&KIT-71101B-W", "&KIT-71101B-B", "&KIT-71101B-E",
  ],
  "5": [
    "none",
    "&KIT-71100A-R", "&KIT-71100A-G", "&KIT-71100A-Y",
    "&KIT-71100A-W", "&KIT-71100A-B", "&KIT-71100A-E",
  ],
  "6-red": [
    "none",
    "&KIT-71100A-R", "&KIT-71100A-G", "&KIT-71100A-Y",
    "&KIT-71100A-W", "&KIT-71100A-B", "&KIT-71100A-E",
    "&KIT-71101B-G", "&KIT-71101B-B",
  ],
  "6-green": [
    "none",
    "&KIT-71100A-R", "&KIT-71100A-G", "&KIT-71100A-Y",
    "&KIT-71100A-W", "&KIT-71100A-B", "&KIT-71100A-E",
    "&KIT-71101B-R", "&KIT-71101B-Y", "&KIT-71101B-W",
    "&KIT-71101B-B", "&KIT-71101B-E",
  ],
  "6-blue": [
    "none",
    "&KIT-71100A-R", "&KIT-71100A-G", "&KIT-71100A-Y",
    "&KIT-71100A-W", "&KIT-71100A-B", "&KIT-71100A-E",
    "&KIT-71101B-R", "&KIT-71101B-G", "&KIT-71101B-Y",
    "&KIT-71101B-W", "&KIT-71101B-E",
  ],
  "7-red": [
    "&KIT-71100A-R", "&KIT-71100A-G", "&KIT-71100A-Y",
    "&KIT-71100A-W", "&KIT-71100A-B", "&KIT-71100A-E",
    "&KIT-71101B-G", "&KIT-71101B-B",
  ],
  "7-green": [
    "&KIT-71100A-R", "&KIT-71100A-G", "&KIT-71100A-Y",
    "&KIT-71100A-W", "&KIT-71100A-B", "&KIT-71100A-E",
    "&KIT-71101B-R", "&KIT-71101B-Y", "&KIT-71101B-W",
    "&KIT-71101B-B", "&KIT-71101B-E",
  ],
  "8": [
    "none",
    "&KIT-71100A-R", "&KIT-71100A-G", "&KIT-71100A-Y",
    "&KIT-71100A-W", "&KIT-71100A-B", "&KIT-71100A-E",
  ],
  "9": [
    "none",
    "&KIT-71100A-R", "&KIT-71100A-G", "&KIT-71100A-Y",
    "&KIT-71100A-W", "&KIT-71100A-B", "&KIT-71100A-E",
  ],
};

const INSTALLATION_TO_ACTIVATION: ConstraintMatrix = {
  "none": ["2", "5", "6-red", "6-green", "6-blue", "8", "9"],
  "&KIT-71100A-R": ["2", "5", "6-red", "6-green", "6-blue", "7-red", "7-green", "8", "9"],
  "&KIT-71100A-G": ["2", "5", "6-red", "6-green", "6-blue", "7-red", "7-green", "8", "9"],
  "&KIT-71100A-Y": ["2", "5", "6-red", "6-green", "6-blue", "7-red", "7-green", "8", "9"],
  "&KIT-71100A-W": ["2", "5", "6-red", "6-green", "6-blue", "7-red", "7-green", "8", "9"],
  "&KIT-71100A-B": ["2", "5", "6-red", "6-green", "6-blue", "7-red", "7-green", "8", "9"],
  "&KIT-71100A-E": ["2", "5", "6-red", "6-green", "6-blue", "7-red", "7-green", "8", "9"],
  "&KIT-71101B-R": ["0", "1", "3", "4", "6-green", "6-blue", "7-green"],
  "&KIT-71101B-G": ["0", "1", "3", "4", "6-red", "6-blue", "7-red"],
  "&KIT-71101B-Y": ["0", "1", "3", "4", "6-green", "6-blue", "7-green"],
  "&KIT-71101B-W": ["0", "1", "3", "4", "6-green", "6-blue", "7-green"],
  "&KIT-71101B-B": ["0", "1", "3", "4", "6-red", "6-green", "7-red", "7-green"],
  "&KIT-71101B-E": ["0", "1", "3", "4", "6-green", "6-blue", "7-green"],
};

const INSTALLATION_TO_COLOUR: ConstraintMatrix = {
  "none": ["0", "1", "2", "3", "4", "5"],
  "&KIT-71100A-R": ["0"],
  "&KIT-71101B-R": ["0"],
  "&KIT-71100A-G": ["1"],
  "&KIT-71101B-G": ["1"],
  "&KIT-71100A-Y": ["2"],
  "&KIT-71101B-Y": ["2"],
  "&KIT-71100A-W": ["3"],
  "&KIT-71101B-W": ["3"],
  "&KIT-71100A-B": ["4"],
  "&KIT-71101B-B": ["4"],
  "&KIT-71100A-E": ["5"],
  "&KIT-71101B-E": ["5"],
};

export const STOPPER_STATIONS_CONSTRAINTS: ModelConstraints = {
  modelId: "stopper-stations",
  constraints: [
    { sourceStep: "colour", targetStep: "activation", matrix: COLOUR_TO_ACTIVATION },
    { sourceStep: "activation", targetStep: "colour", matrix: ACTIVATION_TO_COLOUR },
    
    { sourceStep: "colour", targetStep: "text", matrix: COLOUR_TO_TEXT },
    { sourceStep: "text", targetStep: "colour", matrix: TEXT_TO_COLOUR },
    
    { sourceStep: "colour", targetStep: "language", matrix: COLOUR_TO_LANGUAGE },
    { sourceStep: "language", targetStep: "colour", matrix: LANGUAGE_TO_COLOUR },
    
    { sourceStep: "activation", targetStep: "text", matrix: ACTIVATION_TO_TEXT },
    { sourceStep: "text", targetStep: "activation", matrix: TEXT_TO_ACTIVATION },
    
    { sourceStep: "activation", targetStep: "language", matrix: ACTIVATION_TO_LANGUAGE },
    { sourceStep: "language", targetStep: "activation", matrix: LANGUAGE_TO_ACTIVATION },
    
    { sourceStep: "text", targetStep: "language", matrix: TEXT_TO_LANGUAGE },
    { sourceStep: "language", targetStep: "text", matrix: LANGUAGE_TO_TEXT },
    
    { sourceStep: "colour", targetStep: "installationOptions", matrix: COLOUR_TO_INSTALLATION },
    { sourceStep: "activation", targetStep: "installationOptions", matrix: ACTIVATION_TO_INSTALLATION },
    { sourceStep: "installationOptions", targetStep: "colour", matrix: INSTALLATION_TO_COLOUR },
    { sourceStep: "installationOptions", targetStep: "activation", matrix: INSTALLATION_TO_ACTIVATION },
  ],
};

export const DEBUG_MATRICES = {
  COLOUR_TO_ACTIVATION,
  ACTIVATION_TO_COLOUR,
  COLOUR_TO_TEXT,
  TEXT_TO_COLOUR,
  COLOUR_TO_LANGUAGE,
  LANGUAGE_TO_COLOUR,
  ACTIVATION_TO_TEXT,
  TEXT_TO_ACTIVATION,
  ACTIVATION_TO_LANGUAGE,
  LANGUAGE_TO_ACTIVATION,
  TEXT_TO_LANGUAGE,
  LANGUAGE_TO_TEXT,
  COLOUR_TO_INSTALLATION,
  ACTIVATION_TO_INSTALLATION,
  INSTALLATION_TO_ACTIVATION,
  INSTALLATION_TO_COLOUR,
  VALID_MODEL_CODES,
};