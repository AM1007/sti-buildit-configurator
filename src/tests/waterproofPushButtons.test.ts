import { describe, it, expect } from "vitest";
import {
  buildWPBModelCode,
  parseWPBModelCode,
  isValidWPBCombination,
  getValidWPBOptionsForStep,
  VALID_MODEL_CODES,
  WATERPROOF_PUSH_BUTTONS_CONSTRAINTS,
} from "../rules/waterproofPushButtonsRules";
import { waterproofPushButtonsModel } from "../data/models/waterproofPushButtons";
import { buildProductModel } from "../buildProductModel";
import {
  isConfigurationComplete,
  getMissingRequiredSteps,
  getCompletionPercentage,
} from "../filterOptions";
import { createConstraintEngine } from "../rules/constraintEngine";
import type { Configuration } from "../types";

// ─────────────────────────────────────────────────────────────
// buildWPBModelCode
// ─────────────────────────────────────────────────────────────

describe("buildWPBModelCode", () => {
  it("builds WSS3-1R04 correctly — SAK, no suffix", () => {
    expect(buildWPBModelCode({ housingColour: "1", buttonColour: "R", buttonType: "0", label: "SAK" }))
      .toBe("WSS3-1R04");
  });

  it("builds WSS3-1R04-CL correctly — CL suffix", () => {
    expect(buildWPBModelCode({ housingColour: "1", buttonColour: "R", buttonType: "0", label: "CL" }))
      .toBe("WSS3-1R04-CL");
  });

  it("builds WSS3-EE04 correctly — orange housing only SAK", () => {
    expect(buildWPBModelCode({ housingColour: "E", buttonColour: "E", buttonType: "0", label: "SAK" }))
      .toBe("WSS3-EE04");
  });

  it("builds WSS3-9B14-CL correctly", () => {
    expect(buildWPBModelCode({ housingColour: "9", buttonColour: "B", buttonType: "1", label: "CL" }))
      .toBe("WSS3-9B14-CL");
  });

  it("electricalArrangements=4 hardcoded in SKU position", () => {
    const code = buildWPBModelCode({ housingColour: "7", buttonColour: "R", buttonType: "0", label: "SAK" });
    expect(code).toBe("WSS3-7R04");
    expect(code?.charAt(code.length - 1)).toBe("4");
  });

  it("housingColour uses dash separator, label uses dash, others none", () => {
    const code = buildWPBModelCode({ housingColour: "7", buttonColour: "R", buttonType: "0", label: "SAK" });
    expect(code?.startsWith("WSS3-")).toBe(true);
    expect(code?.split("-")).toHaveLength(2);
  });

  it("returns null when any field is missing", () => {
    expect(buildWPBModelCode({ housingColour: "1", buttonColour: "R", buttonType: "0" })).toBeNull();
    expect(buildWPBModelCode({ housingColour: "1", buttonColour: "R", label: "SAK" })).toBeNull();
    expect(buildWPBModelCode({})).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────
// parseWPBModelCode
// ─────────────────────────────────────────────────────────────

describe("parseWPBModelCode", () => {
  it("parses WSS3-1R04 correctly — SAK label", () => {
    expect(parseWPBModelCode("WSS3-1R04")).toEqual({
      housingColour: "1",
      buttonColour: "R",
      buttonType: "0",
      label: "SAK",
    });
  });

  it("parses WSS3-1R04-CL correctly — CL label", () => {
    expect(parseWPBModelCode("WSS3-1R04-CL")).toEqual({
      housingColour: "1",
      buttonColour: "R",
      buttonType: "0",
      label: "CL",
    });
  });

  it("parses WSS3-EE04 correctly", () => {
    expect(parseWPBModelCode("WSS3-EE04")).toEqual({
      housingColour: "E",
      buttonColour: "E",
      buttonType: "0",
      label: "SAK",
    });
  });

  it("electricalArrangements not present in parsed output", () => {
    const parsed = parseWPBModelCode("WSS3-1R04");
    expect(parsed).not.toHaveProperty("electricalArrangements");
  });

  it("returns null for invalid format", () => {
    expect(parseWPBModelCode("INVALID")).toBeNull();
    expect(parseWPBModelCode("WSS3-1R0")).toBeNull();
    expect(parseWPBModelCode("WSS3-1R044")).toBeNull();
    expect(parseWPBModelCode("SS3-1R04")).toBeNull();
    expect(parseWPBModelCode("")).toBeNull();
  });

  it("round-trips for all VALID_MODEL_CODES", () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseWPBModelCode(code);
      expect(parsed).not.toBeNull();
      const rebuilt = buildWPBModelCode(parsed!);
      expect(rebuilt).toBe(code);
    }
  });
});

// ─────────────────────────────────────────────────────────────
// VALID_MODEL_CODES integrity
// ─────────────────────────────────────────────────────────────

describe("VALID_MODEL_CODES", () => {
  it("contains exactly 36 entries", () => {
    expect(VALID_MODEL_CODES.length).toBe(36);
  });

  it("has no duplicates", () => {
    expect(new Set(VALID_MODEL_CODES).size).toBe(36);
  });

  it("housing distribution: 1→3, 3→6, 5→7, 7→11, 9→8, E→1", () => {
    const parse = (c: string) => parseWPBModelCode(c);
    expect(VALID_MODEL_CODES.filter((c) => parse(c)?.housingColour === "1").length).toBe(3);
    expect(VALID_MODEL_CODES.filter((c) => parse(c)?.housingColour === "3").length).toBe(6);
    expect(VALID_MODEL_CODES.filter((c) => parse(c)?.housingColour === "5").length).toBe(7);
    expect(VALID_MODEL_CODES.filter((c) => parse(c)?.housingColour === "7").length).toBe(11);
    expect(VALID_MODEL_CODES.filter((c) => parse(c)?.housingColour === "9").length).toBe(8);
    expect(VALID_MODEL_CODES.filter((c) => parse(c)?.housingColour === "E").length).toBe(1);
  });

  it("13 CL and 23 SAK codes", () => {
    expect(VALID_MODEL_CODES.filter((c) => c.endsWith("-CL")).length).toBe(13);
    expect(VALID_MODEL_CODES.filter((c) => !c.endsWith("-CL")).length).toBe(23);
  });

  it("ea=4 hardcoded in all SKUs", () => {
    for (const code of VALID_MODEL_CODES) {
      const match = code.match(/^WSS3-[1357E9][RGYWBE][01](4)(-CL)?$/);
      expect(match).not.toBeNull();
      expect(match![1]).toBe("4");
    }
  });

  it("orange housing (E) has exactly one SKU — WSS3-EE04", () => {
    const eCodes = VALID_MODEL_CODES.filter((c) => parseWPBModelCode(c)?.housingColour === "E");
    expect(eCodes).toHaveLength(1);
    expect(eCodes[0]).toBe("WSS3-EE04");
  });

  it("orange housing never has buttonType=1", () => {
    const eCodes = VALID_MODEL_CODES.filter((c) => parseWPBModelCode(c)?.housingColour === "E");
    for (const code of eCodes) {
      expect(parseWPBModelCode(code)?.buttonType).not.toBe("1");
    }
  });

  it("orange housing never has CL label", () => {
    const eCodes = VALID_MODEL_CODES.filter((c) => parseWPBModelCode(c)?.housingColour === "E");
    for (const code of eCodes) {
      expect(parseWPBModelCode(code)?.label).not.toBe("CL");
    }
  });

  it("orange buttonColour (E) only with orange housing (E)", () => {
    const ebCodes = VALID_MODEL_CODES.filter((c) => parseWPBModelCode(c)?.buttonColour === "E");
    for (const code of ebCodes) {
      expect(parseWPBModelCode(code)?.housingColour).toBe("E");
    }
  });

  it("all codes parse successfully", () => {
    for (const code of VALID_MODEL_CODES) {
      expect(parseWPBModelCode(code)).not.toBeNull();
    }
  });
});

// ─────────────────────────────────────────────────────────────
// isValidWPBCombination
// ─────────────────────────────────────────────────────────────

describe("isValidWPBCombination", () => {
  it("all 36 VALID_MODEL_CODES pass validation", () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseWPBModelCode(code)!;
      expect(isValidWPBCombination(parsed)).toEqual({ valid: true });
    }
  });

  it("returns valid for incomplete selection", () => {
    expect(isValidWPBCombination({})).toEqual({ valid: true });
    expect(isValidWPBCombination({ housingColour: "1" })).toEqual({ valid: true });
    expect(isValidWPBCombination({ housingColour: "1", buttonColour: "R", buttonType: "0" }))
      .toEqual({ valid: true });
  });

  it("rejects orange housing with buttonType=1 — not in allowlist", () => {
    const result = isValidWPBCombination({
      housingColour: "E", buttonColour: "E", buttonType: "1", label: "SAK",
    });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.reason).toContain("WSS3-EE14");
  });

  it("rejects orange housing with CL label", () => {
    const result = isValidWPBCombination({
      housingColour: "E", buttonColour: "E", buttonType: "0", label: "CL",
    });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.reason).toContain("WSS3-EE04-CL");
  });

  it("rejects red housing with green button — not in allowlist", () => {
    const result = isValidWPBCombination({
      housingColour: "1", buttonColour: "G", buttonType: "0", label: "SAK",
    });
    expect(result.valid).toBe(false);
  });

  it("rejects yellow button with non-yellow housing", () => {
    for (const housing of ["1", "3", "7", "9", "E"]) {
      const result = isValidWPBCombination({
        housingColour: housing, buttonColour: "Y", buttonType: "0", label: "SAK",
      });
      expect(result.valid).toBe(false);
    }
  });
});

// ─────────────────────────────────────────────────────────────
// getValidWPBOptionsForStep
// ─────────────────────────────────────────────────────────────

describe("getValidWPBOptionsForStep", () => {
  it("red housing only allows red button", () => {
    const valid = getValidWPBOptionsForStep("buttonColour", { housingColour: "1" });
    expect(valid).toEqual(["R"]);
  });

  it("orange housing only allows orange button", () => {
    const valid = getValidWPBOptionsForStep("buttonColour", { housingColour: "E" });
    expect(valid).toEqual(["E"]);
  });

  it("orange housing only allows buttonType=0", () => {
    const valid = getValidWPBOptionsForStep("buttonType", { housingColour: "E" });
    expect(valid).toEqual(["0"]);
  });

  it("orange housing only allows SAK label", () => {
    const valid = getValidWPBOptionsForStep("label", { housingColour: "E" });
    expect(valid).toEqual(["SAK"]);
  });

  it("yellow button only valid with yellow housing", () => {
    const valid = getValidWPBOptionsForStep("housingColour", { buttonColour: "Y" });
    expect(valid).toEqual(["5"]);
  });

  it("blue button only valid with white or blue housing", () => {
    const valid = getValidWPBOptionsForStep("housingColour", { buttonColour: "B" });
    expect(valid).toContain("7");
    expect(valid).toContain("9");
    expect(valid).not.toContain("1");
    expect(valid).not.toContain("3");
    expect(valid).not.toContain("5");
    expect(valid).not.toContain("E");
  });

  it("CL label excludes orange housing", () => {
    const valid = getValidWPBOptionsForStep("housingColour", { label: "CL" });
    expect(valid).not.toContain("E");
    expect(valid).toContain("1");
    expect(valid).toContain("3");
    expect(valid).toContain("7");
    expect(valid).toContain("9");
  });

  it("buttonType=1 excludes orange housing", () => {
    const valid = getValidWPBOptionsForStep("housingColour", { buttonType: "1" });
    expect(valid).not.toContain("E");
  });

  it("orange buttonColour (E) never valid with non-E housing", () => {
    for (const housing of ["1", "3", "5", "7", "9"]) {
      const valid = getValidWPBOptionsForStep("buttonColour", { housingColour: housing });
      expect(valid).not.toContain("E");
    }
  });
});

// ─────────────────────────────────────────────────────────────
// Constraint engine integration
// ─────────────────────────────────────────────────────────────

describe("WATERPROOF_PUSH_BUTTONS_CONSTRAINTS + constraintEngine", () => {
  const engine = createConstraintEngine(WATERPROOF_PUSH_BUTTONS_CONSTRAINTS);

  it("blocks buttonType=1 when housingColour=E", () => {
    expect(engine.checkOptionAvailability("buttonType", "1", { housingColour: "E" }).available)
      .toBe(false);
  });

  it("allows buttonType=0 when housingColour=E", () => {
    expect(engine.checkOptionAvailability("buttonType", "0", { housingColour: "E" }).available)
      .toBe(true);
  });

  it("blocks CL label when housingColour=E", () => {
    expect(engine.checkOptionAvailability("label", "CL", { housingColour: "E" }).available)
      .toBe(false);
  });

  it("allows SAK label when housingColour=E", () => {
    expect(engine.checkOptionAvailability("label", "SAK", { housingColour: "E" }).available)
      .toBe(true);
  });

  it("blocks buttonColour=E when housingColour is not E", () => {
    for (const housing of ["1", "3", "5", "7", "9"]) {
      expect(engine.checkOptionAvailability("buttonColour", "E", { housingColour: housing }).available)
        .toBe(false);
    }
  });

  it("blocks buttonColour=Y when housingColour is not 5", () => {
    for (const housing of ["1", "3", "7", "9", "E"]) {
      expect(engine.checkOptionAvailability("buttonColour", "Y", { housingColour: housing }).available)
        .toBe(false);
    }
  });

  it("blocks buttonColour=G when housingColour=1 or 5 or 9", () => {
    for (const housing of ["1", "5", "9"]) {
      expect(engine.checkOptionAvailability("buttonColour", "G", { housingColour: housing }).available)
        .toBe(false);
    }
  });

  it("blocks buttonColour=E when buttonType=1", () => {
    expect(engine.checkOptionAvailability("buttonColour", "E", { buttonType: "1" }).available)
      .toBe(false);
  });

  it("constraint engine modelId matches", () => {
    expect(WATERPROOF_PUSH_BUTTONS_CONSTRAINTS.modelId).toBe("waterproof-push-buttons");
  });
});

// ─────────────────────────────────────────────────────────────
// buildProductModel integration
// ─────────────────────────────────────────────────────────────

describe("buildProductModel — waterproofPushButtons", () => {
  it("builds WSS3-1R04 correctly", () => {
    const config: Configuration = {
      housingColour: "1", buttonColour: "R", buttonType: "0",
      electricalArrangements: "4", label: "SAK",
    };
    const result = buildProductModel(config, waterproofPushButtonsModel);
    expect(result.fullCode).toBe("WSS3-1R04");
    expect(result.isComplete).toBe(true);
  });

  it("builds WSS3-1R04-CL correctly", () => {
    const config: Configuration = {
      housingColour: "1", buttonColour: "R", buttonType: "0",
      electricalArrangements: "4", label: "CL",
    };
    const result = buildProductModel(config, waterproofPushButtonsModel);
    expect(result.fullCode).toBe("WSS3-1R04-CL");
    expect(result.isComplete).toBe(true);
  });

  it("builds WSS3-EE04 correctly", () => {
    const config: Configuration = {
      housingColour: "E", buttonColour: "E", buttonType: "0",
      electricalArrangements: "4", label: "SAK",
    };
    const result = buildProductModel(config, waterproofPushButtonsModel);
    expect(result.fullCode).toBe("WSS3-EE04");
    expect(result.isComplete).toBe(true);
  });

  it("builds WSS3-9B14-CL correctly", () => {
    const config: Configuration = {
      housingColour: "9", buttonColour: "B", buttonType: "1",
      electricalArrangements: "4", label: "CL",
    };
    const result = buildProductModel(config, waterproofPushButtonsModel);
    expect(result.fullCode).toBe("WSS3-9B14-CL");
    expect(result.isComplete).toBe(true);
  });

  it("SAK label produces no suffix", () => {
    const config: Configuration = {
      housingColour: "3", buttonColour: "G", buttonType: "0",
      electricalArrangements: "4", label: "SAK",
    };
    const result = buildProductModel(config, waterproofPushButtonsModel);
    expect(result.fullCode).toBe("WSS3-3G04");
    expect(result.fullCode).not.toContain("SAK");
    expect(result.fullCode).not.toMatch(/-$/);
  });

  it("baseCode is WSS3", () => {
    const config: Configuration = {
      housingColour: null, buttonColour: null, buttonType: null,
      electricalArrangements: null, label: null,
    };
    const result = buildProductModel(config, waterproofPushButtonsModel);
    expect(result.baseCode).toBe("WSS3");
  });

  it("marks incomplete when steps missing", () => {
    const config: Configuration = {
      housingColour: "1", buttonColour: null, buttonType: null,
      electricalArrangements: null, label: null,
    };
    const result = buildProductModel(config, waterproofPushButtonsModel);
    expect(result.isComplete).toBe(false);
    expect(result.missingSteps).toContain("buttonColour");
    expect(result.missingSteps).toContain("buttonType");
    expect(result.missingSteps).toContain("label");
  });

  it("all 36 valid codes generated from parsed configurations", () => {
    const validSet = new Set(VALID_MODEL_CODES);
    let matchCount = 0;
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseWPBModelCode(code)!;
      const config: Configuration = {
        housingColour: parsed.housingColour ?? null,
        buttonColour: parsed.buttonColour ?? null,
        buttonType: parsed.buttonType ?? null,
        electricalArrangements: "4",
        label: parsed.label ?? null,
      };
      const result = buildProductModel(config, waterproofPushButtonsModel);
      if (validSet.has(result.fullCode)) matchCount++;
    }
    expect(matchCount).toBe(VALID_MODEL_CODES.length);
  });
});

// ─────────────────────────────────────────────────────────────
// filterOptions completeness — waterproofPushButtons
// ─────────────────────────────────────────────────────────────

describe("isConfigurationComplete — waterproofPushButtons", () => {
  it("returns true when all 5 steps selected", () => {
    const config: Configuration = {
      housingColour: "1", buttonColour: "R", buttonType: "0",
      electricalArrangements: "4", label: "SAK",
    };
    expect(isConfigurationComplete(waterproofPushButtonsModel, config)).toBe(true);
  });

  it("returns false when any step missing", () => {
    expect(isConfigurationComplete(waterproofPushButtonsModel, {
      housingColour: "1", buttonColour: "R", buttonType: "0",
      electricalArrangements: "4", label: null,
    })).toBe(false);
  });

  it("getMissingRequiredSteps returns correct missing steps", () => {
    const config: Configuration = {
      housingColour: "9", buttonColour: "B", buttonType: null,
      electricalArrangements: null, label: null,
    };
    const missing = getMissingRequiredSteps(waterproofPushButtonsModel, config);
    expect(missing).toContain("buttonType");
    expect(missing).toContain("electricalArrangements");
    expect(missing).toContain("label");
    expect(missing).not.toContain("housingColour");
    expect(missing).not.toContain("buttonColour");
  });

  it("getCompletionPercentage for 5-step model", () => {
    expect(getCompletionPercentage(waterproofPushButtonsModel, {
      housingColour: null, buttonColour: null, buttonType: null,
      electricalArrangements: null, label: null,
    })).toBe(0);

    expect(getCompletionPercentage(waterproofPushButtonsModel, {
      housingColour: "1", buttonColour: null, buttonType: null,
      electricalArrangements: null, label: null,
    })).toBe(20);

    expect(getCompletionPercentage(waterproofPushButtonsModel, {
      housingColour: "1", buttonColour: "R", buttonType: "0",
      electricalArrangements: null, label: null,
    })).toBe(60);

    expect(getCompletionPercentage(waterproofPushButtonsModel, {
      housingColour: "1", buttonColour: "R", buttonType: "0",
      electricalArrangements: "4", label: "SAK",
    })).toBe(100);
  });
});

// ─────────────────────────────────────────────────────────────
// Model definition integrity
// ─────────────────────────────────────────────────────────────

describe("waterproofPushButtonsModel definition", () => {
  it("has correct model id and slug", () => {
    expect(waterproofPushButtonsModel.id).toBe("waterproof-push-buttons");
    expect(waterproofPushButtonsModel.slug).toBe("waterproof-push-buttons");
  });

  it("electricalArrangements step has exactly one option — 4", () => {
    const eaStep = waterproofPushButtonsModel.steps.find((s) => s.id === "electricalArrangements")!;
    expect(eaStep.options).toHaveLength(1);
    expect(eaStep.options[0].id).toBe("4");
  });

  it("SAK label has empty code", () => {
    const labelStep = waterproofPushButtonsModel.steps.find((s) => s.id === "label")!;
    const sak = labelStep.options.find((o) => o.id === "SAK")!;
    expect(sak.code).toBe("");
  });

  it("baseCode is WSS3", () => {
    expect(waterproofPushButtonsModel.productModelSchema.baseCode).toBe("WSS3");
  });

  it("housingColour and label use dash separator, others none", () => {
    const { separatorMap } = waterproofPushButtonsModel.productModelSchema;
    expect(separatorMap?.housingColour).toBe("-");
    expect(separatorMap?.label).toBe("-");
    expect(separatorMap?.buttonColour).toBe("");
    expect(separatorMap?.buttonType).toBe("");
    expect(separatorMap?.electricalArrangements).toBe("");
  });

  it("all steps are required", () => {
    for (const step of waterproofPushButtonsModel.steps) {
      expect(step.required).toBe(true);
    }
  });

  it("stepOrder has 5 steps", () => {
    expect(waterproofPushButtonsModel.stepOrder).toEqual([
      "housingColour", "buttonColour", "buttonType", "electricalArrangements", "label",
    ]);
  });
});