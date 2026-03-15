import { describe, it, expect } from "vitest";
import {
  buildSSModelCode,
  parseSSModelCode,
  isValidSSCombination,
  getValidSSOptionsForStep,
  VALID_MODEL_CODES,
  STOPPER_STATIONS_CONSTRAINTS,
} from "../rules/stopperStationsRules";
import { stopperStationsModel } from "../data/models/stopperStations";
import { buildProductModel } from "../buildProductModel";
import {
  isConfigurationComplete,
  getMissingRequiredSteps,
  getCompletionPercentage,
} from "../filterOptions";
import { createConstraintEngine } from "../rules/constraintEngine";
import type { Configuration } from "../types";

// ─────────────────────────────────────────────────────────────
// buildSSModelCode
// ─────────────────────────────────────────────────────────────

describe("buildSSModelCode", () => {
  it("builds SS2000ES-EN correctly", () => {
    expect(buildSSModelCode({ colour: "0", cover: "0", activation: "0", text: "ES", language: "EN" }))
      .toBe("SS2000ES-EN");
  });

  it("builds SS2001ZA-ZL correctly — ZL language", () => {
    expect(buildSSModelCode({ colour: "0", cover: "0", activation: "1", text: "ZA", language: "ZL" }))
      .toBe("SS2001ZA-ZL");
  });

  it("builds SS2107ZA-ZL correctly — green ZL", () => {
    expect(buildSSModelCode({ colour: "1", cover: "0", activation: "7", text: "ZA", language: "ZL" }))
      .toBe("SS2107ZA-ZL");
  });

  it("activation sub-variants use single digit code", () => {
    expect(buildSSModelCode({ colour: "0", cover: "0", activation: "6", text: "EM", language: "EN" }))
      .toBe("SS2006EM-EN");
    expect(buildSSModelCode({ colour: "0", cover: "0", activation: "7", text: "AB", language: "EN" }))
      .toBe("SS2007AB-EN");
  });

  it("installationOptions not included in model code", () => {
    const withoutInstall = buildSSModelCode({
      colour: "0", cover: "0", activation: "1", text: "EM", language: "EN",
    });
    expect(withoutInstall).toBe("SS2001EM-EN");
    expect(withoutInstall).not.toContain("KIT");
    expect(withoutInstall).not.toContain("none");
  });

  it("returns null when any required field is missing", () => {
    expect(buildSSModelCode({ colour: "0", cover: "0", activation: "0", text: "ES" })).toBeNull();
    expect(buildSSModelCode({ colour: "0", cover: "0", activation: "0", language: "EN" })).toBeNull();
    expect(buildSSModelCode({})).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────
// parseSSModelCode
// ─────────────────────────────────────────────────────────────

describe("parseSSModelCode", () => {
  it("parses SS2000ES-EN correctly", () => {
    expect(parseSSModelCode("SS2000ES-EN")).toEqual({
      colour: "0",
      cover: "0",
      activation: "0",
      text: "ES",
      language: "EN",
    });
  });

  it("parses SS2001ZA-ZL correctly", () => {
    expect(parseSSModelCode("SS2001ZA-ZL")).toEqual({
      colour: "0",
      cover: "0",
      activation: "1",
      text: "ZA",
      language: "ZL",
    });
  });

  it("parses SS2107ZA-ZL correctly", () => {
    expect(parseSSModelCode("SS2107ZA-ZL")).toEqual({
      colour: "1",
      cover: "0",
      activation: "7",
      text: "ZA",
      language: "ZL",
    });
  });

  it("activation parses as single digit — sub-variants indistinguishable", () => {
    expect(parseSSModelCode("SS2006EM-EN")?.activation).toBe("6");
    expect(parseSSModelCode("SS2007AB-EN")?.activation).toBe("7");
  });

  it("installationOptions not present in parsed output", () => {
    const parsed = parseSSModelCode("SS2000ES-EN");
    expect(parsed).not.toHaveProperty("installationOptions");
  });

  it("returns null for invalid format", () => {
    expect(parseSSModelCode("INVALID")).toBeNull();
    expect(parseSSModelCode("SS200ES-EN")).toBeNull();
    expect(parseSSModelCode("SS2000ES")).toBeNull();
    expect(parseSSModelCode("")).toBeNull();
  });

  it("round-trips for all VALID_MODEL_CODES", () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseSSModelCode(code);
      expect(parsed).not.toBeNull();
      const rebuilt = buildSSModelCode(parsed!);
      expect(rebuilt).toBe(code);
    }
  });
});

// ─────────────────────────────────────────────────────────────
// VALID_MODEL_CODES integrity
// ─────────────────────────────────────────────────────────────

describe("VALID_MODEL_CODES", () => {
  it("contains exactly 209 entries", () => {
    expect(VALID_MODEL_CODES.length).toBe(209);
  });

  it("has no duplicates", () => {
    expect(new Set(VALID_MODEL_CODES).size).toBe(209);
  });

  it("colour distribution: 0→44, 1→44, 2→55, 3→25, 4→36, 5→5", () => {
    const parse = (c: string) => parseSSModelCode(c);
    expect(VALID_MODEL_CODES.filter((c) => parse(c)?.colour === "0").length).toBe(44);
    expect(VALID_MODEL_CODES.filter((c) => parse(c)?.colour === "1").length).toBe(44);
    expect(VALID_MODEL_CODES.filter((c) => parse(c)?.colour === "2").length).toBe(55);
    expect(VALID_MODEL_CODES.filter((c) => parse(c)?.colour === "3").length).toBe(25);
    expect(VALID_MODEL_CODES.filter((c) => parse(c)?.colour === "4").length).toBe(36);
    expect(VALID_MODEL_CODES.filter((c) => parse(c)?.colour === "5").length).toBe(5);
  });

  it("cover is always 0 in all codes", () => {
    for (const code of VALID_MODEL_CODES) {
      expect(parseSSModelCode(code)?.cover).toBe("0");
    }
  });

  it("only 2 ZL language codes", () => {
    const zl = VALID_MODEL_CODES.filter((c) => parseSSModelCode(c)?.language === "ZL");
    expect(zl).toHaveLength(2);
    expect(zl).toContain("SS2001ZA-ZL");
    expect(zl).toContain("SS2107ZA-ZL");
  });

  it("ZL language only with text=ZA", () => {
    for (const code of VALID_MODEL_CODES.filter((c) => parseSSModelCode(c)?.language === "ZL")) {
      expect(parseSSModelCode(code)?.text).toBe("ZA");
    }
  });

  it("ZL language only with colours 0 and 1", () => {
    for (const code of VALID_MODEL_CODES.filter((c) => parseSSModelCode(c)?.language === "ZL")) {
      expect(["0", "1"]).toContain(parseSSModelCode(code)?.colour);
    }
  });

  it("XT text only appears with colour=1 (green)", () => {
    const xtCodes = VALID_MODEL_CODES.filter((c) => parseSSModelCode(c)?.text === "XT");
    for (const code of xtCodes) {
      expect(parseSSModelCode(code)?.colour).toBe("1");
    }
  });

  it("orange (colour=5) only has activations 1, 2, 3, 9", () => {
    const orangeCodes = VALID_MODEL_CODES.filter((c) => parseSSModelCode(c)?.colour === "5");
    const acts = new Set(orangeCodes.map((c) => parseSSModelCode(c)?.activation));
    expect(acts.has("0")).toBe(false);
    expect(acts.has("4")).toBe(false);
    expect(acts.has("5")).toBe(false);
    expect(acts.has("6")).toBe(false);
    expect(acts.has("7")).toBe(false);
    expect(acts.has("8")).toBe(false);
    expect(acts.has("1")).toBe(true);
    expect(acts.has("2")).toBe(true);
    expect(acts.has("3")).toBe(true);
    expect(acts.has("9")).toBe(true);
  });

  it("all codes parse successfully", () => {
    for (const code of VALID_MODEL_CODES) {
      expect(parseSSModelCode(code)).not.toBeNull();
    }
  });
});

// ─────────────────────────────────────────────────────────────
// isValidSSCombination
// ─────────────────────────────────────────────────────────────

describe("isValidSSCombination", () => {
  it("all 209 VALID_MODEL_CODES pass validation", () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseSSModelCode(code)!;
      expect(isValidSSCombination(parsed)).toEqual({ valid: true });
    }
  });

  it("returns valid for incomplete selection", () => {
    expect(isValidSSCombination({})).toEqual({ valid: true });
    expect(isValidSSCombination({ colour: "0" })).toEqual({ valid: true });
  });

  it("rejects ZL language with non-ZA text", () => {
    const result = isValidSSCombination({
      colour: "0", cover: "0", activation: "1", text: "EM", language: "ZL",
    });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.reason).toContain("SS2001EM-ZL");
  });

  it("rejects ZL language with colour=2, 3, 4, or 5", () => {
    for (const colour of ["2", "3", "4", "5"]) {
      const result = isValidSSCombination({
        colour, cover: "0", activation: "1", text: "ZA", language: "ZL",
      });
      expect(result.valid).toBe(false);
    }
  });

  it("rejects XT text with any colour except 1", () => {
    for (const colour of ["0", "2", "3", "4", "5"]) {
      const result = isValidSSCombination({
        colour, cover: "0", activation: "2", text: "XT", language: "EN",
      });
      expect(result.valid).toBe(false);
    }
  });

  it("rejects orange colour with activation=0", () => {
    const result = isValidSSCombination({
      colour: "5", cover: "0", activation: "0", text: "EM", language: "EN",
    });
    expect(result.valid).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────
// getValidSSOptionsForStep
// ─────────────────────────────────────────────────────────────

describe("getValidSSOptionsForStep", () => {
  it("cover always returns only 0", () => {
    expect(getValidSSOptionsForStep("cover", {})).toEqual(["0"]);
    expect(getValidSSOptionsForStep("cover", { colour: "2" })).toEqual(["0"]);
  });

  it("ZL language only valid with ZA text", () => {
    const valid = getValidSSOptionsForStep("text", { language: "ZL" });
    expect(valid).toEqual(["ZA"]);
  });

  it("ZA text allows both EN and ZL languages — only text that does", () => {
    const valid = getValidSSOptionsForStep("language", { text: "ZA" });
    expect(valid).toContain("EN");
    expect(valid).toContain("ZL");
  });

  it("non-ZA texts only allow EN language", () => {
    for (const text of ["EM", "ES", "EX", "LD", "NT", "AB", "XT"]) {
      const valid = getValidSSOptionsForStep("language", { text });
      expect(valid).toEqual(["EN"]);
    }
  });

  it("orange colour only allows activations 1, 2, 3, 9", () => {
    const valid = getValidSSOptionsForStep("activation", { colour: "5" });
    expect(valid).toContain("1");
    expect(valid).toContain("2");
    expect(valid).toContain("3");
    expect(valid).toContain("9");
    expect(valid).not.toContain("0");
    expect(valid).not.toContain("4");
    expect(valid).not.toContain("5");
    expect(valid).not.toContain("6");
    expect(valid).not.toContain("7");
    expect(valid).not.toContain("8");
  });

  it("XT text only valid with colour=1", () => {
    const valid = getValidSSOptionsForStep("colour", { text: "XT" });
    expect(valid).toEqual(["1"]);
  });

  it("ZL language restricts colour to 0 and 1 only", () => {
    const valid = getValidSSOptionsForStep("colour", { language: "ZL" });
    expect(valid).toContain("0");
    expect(valid).toContain("1");
    expect(valid).not.toContain("2");
    expect(valid).not.toContain("3");
    expect(valid).not.toContain("4");
    expect(valid).not.toContain("5");
  });
});

// ─────────────────────────────────────────────────────────────
// Constraint engine integration
// ─────────────────────────────────────────────────────────────

describe("STOPPER_STATIONS_CONSTRAINTS + constraintEngine", () => {
  const engine = createConstraintEngine(STOPPER_STATIONS_CONSTRAINTS);

  it("blocks ZL language when colour is 2, 3, 4, or 5", () => {
    for (const colour of ["2", "3", "4", "5"]) {
      expect(engine.checkOptionAvailability("language", "ZL", { colour }).available)
        .toBe(false);
    }
  });

  it("allows ZL language when colour is 0 or 1", () => {
    for (const colour of ["0", "1"]) {
      expect(engine.checkOptionAvailability("language", "ZL", { colour }).available)
        .toBe(true);
    }
  });

  it("blocks XT text when colour is not 1", () => {
    for (const colour of ["0", "2", "3", "4", "5"]) {
      expect(engine.checkOptionAvailability("text", "XT", { colour }).available)
        .toBe(false);
    }
  });

  it("allows XT text when colour is 1", () => {
    expect(engine.checkOptionAvailability("text", "XT", { colour: "1" }).available)
      .toBe(true);
  });

  it("blocks activation=0 when colour=5", () => {
    expect(engine.checkOptionAvailability("activation", "0", { colour: "5" }).available)
      .toBe(false);
  });

  it("blocks 6-red activation when colour is not 0", () => {
    for (const colour of ["1", "2", "3", "4", "5"]) {
      expect(engine.checkOptionAvailability("activation", "6-red", { colour }).available)
        .toBe(false);
    }
  });

  it("allows 6-red activation when colour is 0", () => {
    expect(engine.checkOptionAvailability("activation", "6-red", { colour: "0" }).available)
      .toBe(true);
  });

  it("blocks 6-green activation when colour is not 1", () => {
    for (const colour of ["0", "2", "3", "4", "5"]) {
      expect(engine.checkOptionAvailability("activation", "6-green", { colour }).available)
        .toBe(false);
    }
  });

  it("blocks 6-blue activation when colour is not 4", () => {
    for (const colour of ["0", "1", "2", "3", "5"]) {
      expect(engine.checkOptionAvailability("activation", "6-blue", { colour }).available)
        .toBe(false);
    }
  });

  it("blocks ZL language when text is not ZA", () => {
    for (const text of ["EM", "ES", "EX", "NT", "AB"]) {
      expect(engine.checkOptionAvailability("language", "ZL", { text }).available)
        .toBe(false);
    }
  });

  it("constraint engine modelId matches", () => {
    expect(STOPPER_STATIONS_CONSTRAINTS.modelId).toBe("stopper-stations");
  });
});

// ─────────────────────────────────────────────────────────────
// buildProductModel integration
// ─────────────────────────────────────────────────────────────

describe("buildProductModel — stopperStations", () => {
  it("builds SS2000ES-EN correctly", () => {
    const config: Configuration = {
      colour: "0", cover: "0", activation: "0", text: "ES", language: "EN",
      installationOptions: "none",
    };
    const result = buildProductModel(config, stopperStationsModel);
    expect(result.fullCode).toBe("SS2000ES-EN");
    expect(result.isComplete).toBe(true);
  });

  it("builds SS2001ZA-ZL correctly", () => {
    const config: Configuration = {
      colour: "0", cover: "0", activation: "1", text: "ZA", language: "ZL",
      installationOptions: "none",
    };
    const result = buildProductModel(config, stopperStationsModel);
    expect(result.fullCode).toBe("SS2001ZA-ZL");
    expect(result.isComplete).toBe(true);
  });

  it("installationOptions with empty code produces no suffix", () => {
    const config: Configuration = {
      colour: "0", cover: "0", activation: "0", text: "ES", language: "EN",
      installationOptions: "none",
    };
    const result = buildProductModel(config, stopperStationsModel);
    expect(result.fullCode).toBe("SS2000ES-EN");
    expect(result.fullCode).not.toContain("none");
  });

  it("installationOptions with KIT code appends to SKU", () => {
    const config: Configuration = {
      colour: "0", cover: "0", activation: "1", text: "EM", language: "EN",
      installationOptions: "&KIT-71100A-R",
    };
    const result = buildProductModel(config, stopperStationsModel);
    expect(result.fullCode).toContain("SS2001EM-EN");
    expect(result.fullCode).toContain("&KIT-71100A-R");
  });

  it("baseCode is SS2", () => {
    const config: Configuration = {
      colour: null, cover: null, activation: null, text: null,
      language: null, installationOptions: null,
    };
    const result = buildProductModel(config, stopperStationsModel);
    expect(result.baseCode).toBe("SS2");
  });

  it("language uses dash separator", () => {
    const config: Configuration = {
      colour: "1", cover: "0", activation: "0", text: "EM", language: "EN",
      installationOptions: "none",
    };
    const result = buildProductModel(config, stopperStationsModel);
    expect(result.fullCode).toBe("SS2100EM-EN");
    expect(result.fullCode).toContain("-EN");
  });

  it("marks incomplete when steps missing", () => {
    const config: Configuration = {
      colour: "0", cover: "0", activation: null, text: null,
      language: null, installationOptions: null,
    };
    const result = buildProductModel(config, stopperStationsModel);
    expect(result.isComplete).toBe(false);
    expect(result.missingSteps).toContain("activation");
    expect(result.missingSteps).toContain("text");
    expect(result.missingSteps).toContain("language");
  });

  it("all 209 valid base codes generated from parsed configurations", () => {
    const validSet = new Set(VALID_MODEL_CODES);
    let matchCount = 0;
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseSSModelCode(code)!;
      const config: Configuration = {
        colour: parsed.colour ?? null,
        cover: parsed.cover ?? null,
        activation: parsed.activation ?? null,
        text: parsed.text ?? null,
        language: parsed.language ?? null,
        installationOptions: "none",
      };
      const result = buildProductModel(config, stopperStationsModel);
      if (validSet.has(result.fullCode)) matchCount++;
    }
    expect(matchCount).toBe(VALID_MODEL_CODES.length);
  });
});

// ─────────────────────────────────────────────────────────────
// filterOptions completeness — stopperStations
// ─────────────────────────────────────────────────────────────

describe("isConfigurationComplete — stopperStations", () => {
  it("returns true when all 6 steps selected", () => {
    const config: Configuration = {
      colour: "0", cover: "0", activation: "0", text: "ES",
      language: "EN", installationOptions: "none",
    };
    expect(isConfigurationComplete(stopperStationsModel, config)).toBe(true);
  });

  it("returns false when any step missing", () => {
    expect(isConfigurationComplete(stopperStationsModel, {
      colour: "0", cover: "0", activation: "0", text: "ES",
      language: "EN", installationOptions: null,
    })).toBe(false);
  });

  it("getMissingRequiredSteps returns correct missing steps", () => {
    const config: Configuration = {
      colour: "0", cover: "0", activation: "1", text: null,
      language: null, installationOptions: null,
    };
    const missing = getMissingRequiredSteps(stopperStationsModel, config);
    expect(missing).toContain("text");
    expect(missing).toContain("language");
    expect(missing).toContain("installationOptions");
    expect(missing).not.toContain("colour");
    expect(missing).not.toContain("cover");
    expect(missing).not.toContain("activation");
  });

  it("getCompletionPercentage for 6-step model", () => {
    expect(getCompletionPercentage(stopperStationsModel, {
      colour: null, cover: null, activation: null, text: null,
      language: null, installationOptions: null,
    })).toBe(0);

    expect(getCompletionPercentage(stopperStationsModel, {
      colour: "0", cover: null, activation: null, text: null,
      language: null, installationOptions: null,
    })).toBe(17);

    expect(getCompletionPercentage(stopperStationsModel, {
      colour: "0", cover: "0", activation: "0", text: null,
      language: null, installationOptions: null,
    })).toBe(50);

    expect(getCompletionPercentage(stopperStationsModel, {
      colour: "0", cover: "0", activation: "0", text: "ES",
      language: "EN", installationOptions: "none",
    })).toBe(100);
  });
});

// ─────────────────────────────────────────────────────────────
// Model definition integrity
// ─────────────────────────────────────────────────────────────

describe("stopperStationsModel definition", () => {
  it("has correct model id and slug", () => {
    expect(stopperStationsModel.id).toBe("stopper-stations");
    expect(stopperStationsModel.slug).toBe("stopper-stations");
  });

  it("has 6 steps in stepOrder", () => {
    expect(stopperStationsModel.stepOrder).toHaveLength(6);
    expect(stopperStationsModel.stepOrder).toEqual([
      "colour", "cover", "activation", "text", "language", "installationOptions",
    ]);
  });

  it("cover step has only one option — 0", () => {
    const coverStep = stopperStationsModel.steps.find((s) => s.id === "cover")!;
    expect(coverStep.options).toHaveLength(1);
    expect(coverStep.options[0].id).toBe("0");
  });

  it("language step has 2 options — EN and ZL", () => {
    const langStep = stopperStationsModel.steps.find((s) => s.id === "language")!;
    const ids = langStep.options.map((o) => o.id);
    expect(ids).toContain("EN");
    expect(ids).toContain("ZL");
    expect(ids).not.toContain("ES");
    expect(ids).not.toContain("FR");
  });

  it("activation step has 13 options including sub-variants", () => {
    const actStep = stopperStationsModel.steps.find((s) => s.id === "activation")!;
    expect(actStep.options).toHaveLength(13);
  });

  it("activation sub-variants share code '6' and '7'", () => {
    const actStep = stopperStationsModel.steps.find((s) => s.id === "activation")!;
    const act6 = actStep.options.filter((o) => o.code === "6");
    const act7 = actStep.options.filter((o) => o.code === "7");
    expect(act6).toHaveLength(3);
    expect(act7).toHaveLength(2);
  });

  it("installationOptions none has empty code", () => {
    const ioStep = stopperStationsModel.steps.find((s) => s.id === "installationOptions")!;
    const none = ioStep.options.find((o) => o.id === "none")!;
    expect(none.code).toBe("");
  });

  it("baseCode is SS2", () => {
    expect(stopperStationsModel.productModelSchema.baseCode).toBe("SS2");
  });

  it("only language uses dash separator", () => {
    const { separatorMap } = stopperStationsModel.productModelSchema;
    expect(separatorMap?.language).toBe("-");
    expect(separatorMap?.colour).toBe("");
    expect(separatorMap?.cover).toBe("");
    expect(separatorMap?.activation).toBe("");
    expect(separatorMap?.text).toBe("");
    expect(separatorMap?.installationOptions).toBe("");
  });

  it("all steps are required", () => {
    for (const step of stopperStationsModel.steps) {
      expect(step.required).toBe(true);
    }
  });
});