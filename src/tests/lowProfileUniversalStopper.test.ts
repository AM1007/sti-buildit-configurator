import { describe, it, expect } from "vitest";
import {
  buildLPUSModelCode,
  parseLPUSModelCode,
  isValidLPUSCombination,
  getValidLPUSOptionsForStep,
  VALID_MODEL_CODES,
  LOW_PROFILE_UNIVERSAL_STOPPER_CONSTRAINTS,
} from "../rules/lowProfileUniversalStopperRules";
import { lowProfileUniversalStopperModel } from "../data/models/lowProfileUniversalStopper";
import { buildProductModel } from "../buildProductModel";
import {
  isConfigurationComplete,
  getMissingRequiredSteps,
  getCompletionPercentage,
} from "../filterOptions";
import { createConstraintEngine } from "../rules/constraintEngine";
import type { Configuration } from "../types";

// ─────────────────────────────────────────────────────────────
// buildLPUSModelCode
// ─────────────────────────────────────────────────────────────

describe("buildLPUSModelCode", () => {
  it("builds STI-14000NC correctly", () => {
    expect(buildLPUSModelCode({ mounting: "0", hoodSounder: "00", colourLabel: "NC" }))
      .toBe("STI-14000NC");
  });

  it("builds STI-14110FR correctly", () => {
    expect(buildLPUSModelCode({ mounting: "1", hoodSounder: "10", colourLabel: "FR" }))
      .toBe("STI-14110FR");
  });

  it("builds STI-14200NW correctly — mounting=2 only NW", () => {
    expect(buildLPUSModelCode({ mounting: "2", hoodSounder: "00", colourLabel: "NW" }))
      .toBe("STI-14200NW");
  });

  it("builds STI-14220CY correctly", () => {
    expect(buildLPUSModelCode({ mounting: "2", hoodSounder: "20", colourLabel: "CY" }))
      .toBe("STI-14220CY");
  });

  it("returns null when any field is missing", () => {
    expect(buildLPUSModelCode({ mounting: "0", hoodSounder: "00" })).toBeNull();
    expect(buildLPUSModelCode({ mounting: "0", colourLabel: "NC" })).toBeNull();
    expect(buildLPUSModelCode({ hoodSounder: "00", colourLabel: "NC" })).toBeNull();
    expect(buildLPUSModelCode({})).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────
// parseLPUSModelCode
// ─────────────────────────────────────────────────────────────

describe("parseLPUSModelCode", () => {
  it("parses STI-14000NC correctly", () => {
    expect(parseLPUSModelCode("STI-14000NC")).toEqual({
      mounting: "0",
      hoodSounder: "00",
      colourLabel: "NC",
    });
  });

  it("parses STI-14220CY correctly", () => {
    expect(parseLPUSModelCode("STI-14220CY")).toEqual({
      mounting: "2",
      hoodSounder: "20",
      colourLabel: "CY",
    });
  });

  it("returns null for invalid format", () => {
    expect(parseLPUSModelCode("INVALID")).toBeNull();
    expect(parseLPUSModelCode("STI-13000NC")).toBeNull();
    expect(parseLPUSModelCode("STI-14000N")).toBeNull();
    expect(parseLPUSModelCode("")).toBeNull();
  });

  it("round-trips for all VALID_MODEL_CODES", () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseLPUSModelCode(code);
      expect(parsed).not.toBeNull();
      const rebuilt = buildLPUSModelCode(parsed!);
      expect(rebuilt).toBe(code);
    }
  });
});

// ─────────────────────────────────────────────────────────────
// VALID_MODEL_CODES integrity
// ─────────────────────────────────────────────────────────────

describe("VALID_MODEL_CODES", () => {
  it("contains exactly 14 entries", () => {
    expect(VALID_MODEL_CODES.length).toBe(14);
  });

  it("has no duplicates", () => {
    expect(new Set(VALID_MODEL_CODES).size).toBe(14);
  });

  it("5 flush (0), 7 surface dual (1), 2 surface+frame (2)", () => {
    expect(VALID_MODEL_CODES.filter((c) => parseLPUSModelCode(c)?.mounting === "0").length).toBe(5);
    expect(VALID_MODEL_CODES.filter((c) => parseLPUSModelCode(c)?.mounting === "1").length).toBe(7);
    expect(VALID_MODEL_CODES.filter((c) => parseLPUSModelCode(c)?.mounting === "2").length).toBe(2);
  });

  it("mounting=2 only has hoodSounder=00 or 20, never 10", () => {
    const m2 = VALID_MODEL_CODES.filter((c) => parseLPUSModelCode(c)?.mounting === "2");
    for (const code of m2) {
      expect(parseLPUSModelCode(code)?.hoodSounder).not.toBe("10");
    }
  });

  it("NW colourLabel only with mounting=2 and hoodSounder=00", () => {
    const nwCodes = VALID_MODEL_CODES.filter((c) => parseLPUSModelCode(c)?.colourLabel === "NW");
    expect(nwCodes).toHaveLength(1);
    expect(nwCodes[0]).toBe("STI-14200NW");
  });

  it("NC colourLabel only with hoodSounder=00", () => {
    const ncCodes = VALID_MODEL_CODES.filter((c) => parseLPUSModelCode(c)?.colourLabel === "NC");
    for (const code of ncCodes) {
      expect(parseLPUSModelCode(code)?.hoodSounder).toBe("00");
    }
  });

  it("false positive STI-14010FR not in allowlist", () => {
    expect(VALID_MODEL_CODES).not.toContain("STI-14010FR");
  });

  it("false positive STI-14120CY not in allowlist", () => {
    expect(VALID_MODEL_CODES).not.toContain("STI-14120CY");
  });

  it("all codes start with STI-14", () => {
    for (const code of VALID_MODEL_CODES) {
      expect(code.startsWith("STI-14")).toBe(true);
    }
  });

  it("all codes parse successfully", () => {
    for (const code of VALID_MODEL_CODES) {
      expect(parseLPUSModelCode(code)).not.toBeNull();
    }
  });
});

// ─────────────────────────────────────────────────────────────
// isValidLPUSCombination
// ─────────────────────────────────────────────────────────────

describe("isValidLPUSCombination", () => {
  it("all 14 VALID_MODEL_CODES pass validation", () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseLPUSModelCode(code)!;
      expect(isValidLPUSCombination(parsed)).toEqual({ valid: true });
    }
  });

  it("returns valid for incomplete selection", () => {
    expect(isValidLPUSCombination({})).toEqual({ valid: true });
    expect(isValidLPUSCombination({ mounting: "0" })).toEqual({ valid: true });
    expect(isValidLPUSCombination({ mounting: "0", hoodSounder: "00" })).toEqual({ valid: true });
  });

  it("rejects false positive STI-14010FR — flush, label hood, fire red", () => {
    const result = isValidLPUSCombination({ mounting: "0", hoodSounder: "10", colourLabel: "FR" });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.reason).toContain("STI-14010FR");
  });

  it("rejects false positive STI-14120CY — surface, sounder, yellow custom", () => {
    const result = isValidLPUSCombination({ mounting: "1", hoodSounder: "20", colourLabel: "CY" });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.reason).toContain("STI-14120CY");
  });

  it("rejects mounting=2 with hoodSounder=10", () => {
    const result = isValidLPUSCombination({ mounting: "2", hoodSounder: "10", colourLabel: "EG" });
    expect(result.valid).toBe(false);
  });

  it("rejects NW with mounting=0 or 1", () => {
    for (const mounting of ["0", "1"]) {
      const result = isValidLPUSCombination({ mounting, hoodSounder: "00", colourLabel: "NW" });
      expect(result.valid).toBe(false);
    }
  });
});

// ─────────────────────────────────────────────────────────────
// getValidLPUSOptionsForStep
// ─────────────────────────────────────────────────────────────

describe("getValidLPUSOptionsForStep", () => {
  it("returns all three mountings when nothing selected", () => {
    const valid = getValidLPUSOptionsForStep("mounting", {});
    expect(valid).toContain("0");
    expect(valid).toContain("1");
    expect(valid).toContain("2");
  });

  it("mounting=2 does not allow hoodSounder=10", () => {
    const valid = getValidLPUSOptionsForStep("hoodSounder", { mounting: "2" });
    expect(valid).not.toContain("10");
    expect(valid).toContain("00");
    expect(valid).toContain("20");
  });

  it("hoodSounder=00 only allows NC and NW colourLabels", () => {
    const valid = getValidLPUSOptionsForStep("colourLabel", { hoodSounder: "00" });
    expect(valid).toContain("NC");
    expect(valid).toContain("NW");
    expect(valid).not.toContain("FR");
    expect(valid).not.toContain("EG");
    expect(valid).not.toContain("NY");
    expect(valid).not.toContain("CY");
  });

  it("NC colourLabel only valid with hoodSounder=00", () => {
    const valid = getValidLPUSOptionsForStep("hoodSounder", { colourLabel: "NC" });
    expect(valid).toEqual(["00"]);
  });

  it("NW colourLabel only valid with mounting=2", () => {
    const valid = getValidLPUSOptionsForStep("mounting", { colourLabel: "NW" });
    expect(valid).toEqual(["2"]);
  });

  it("NY colourLabel not valid with mounting=2", () => {
    const valid = getValidLPUSOptionsForStep("mounting", { colourLabel: "NY" });
    expect(valid).not.toContain("2");
    expect(valid).toContain("0");
    expect(valid).toContain("1");
  });

  it("mounting=2 only allows NW and CY colourLabels", () => {
    const valid = getValidLPUSOptionsForStep("colourLabel", { mounting: "2" });
    expect(valid).toContain("NW");
    expect(valid).toContain("CY");
    expect(valid).not.toContain("NC");
    expect(valid).not.toContain("FR");
    expect(valid).not.toContain("EG");
    expect(valid).not.toContain("NY");
  });

  it("hoodSounder=20 only allows FR, EG, CY", () => {
    const valid = getValidLPUSOptionsForStep("colourLabel", { hoodSounder: "20" });
    expect(valid).toContain("FR");
    expect(valid).toContain("EG");
    expect(valid).toContain("CY");
    expect(valid).not.toContain("NC");
    expect(valid).not.toContain("NW");
    expect(valid).not.toContain("NY");
  });
});

// ─────────────────────────────────────────────────────────────
// Constraint engine integration
// ─────────────────────────────────────────────────────────────

describe("LOW_PROFILE_UNIVERSAL_STOPPER_CONSTRAINTS + constraintEngine", () => {
  const engine = createConstraintEngine(LOW_PROFILE_UNIVERSAL_STOPPER_CONSTRAINTS);

  it("blocks hoodSounder=10 when mounting=2", () => {
    expect(engine.checkOptionAvailability("hoodSounder", "10", { mounting: "2" }).available)
      .toBe(false);
  });

  it("allows hoodSounder=00 and 20 when mounting=2", () => {
    expect(engine.checkOptionAvailability("hoodSounder", "00", { mounting: "2" }).available)
      .toBe(true);
    expect(engine.checkOptionAvailability("hoodSounder", "20", { mounting: "2" }).available)
      .toBe(true);
  });

  it("blocks NC colourLabel when hoodSounder=10 or 20", () => {
    for (const hs of ["10", "20"]) {
      expect(engine.checkOptionAvailability("colourLabel", "NC", { hoodSounder: hs }).available)
        .toBe(false);
    }
  });

  it("allows NC colourLabel when hoodSounder=00", () => {
    expect(engine.checkOptionAvailability("colourLabel", "NC", { hoodSounder: "00" }).available)
      .toBe(true);
  });

  it("blocks NW colourLabel when mounting=0 or 1", () => {
    for (const mounting of ["0", "1"]) {
      expect(engine.checkOptionAvailability("colourLabel", "NW", { mounting }).available)
        .toBe(false);
    }
  });

  it("allows NW colourLabel when mounting=2", () => {
    expect(engine.checkOptionAvailability("colourLabel", "NW", { mounting: "2" }).available)
      .toBe(true);
  });

  it("blocks FR and EG colourLabels when hoodSounder=00", () => {
    for (const cl of ["FR", "EG"]) {
      expect(engine.checkOptionAvailability("colourLabel", cl, { hoodSounder: "00" }).available)
        .toBe(false);
    }
  });

  it("constraint engine modelId matches", () => {
    expect(LOW_PROFILE_UNIVERSAL_STOPPER_CONSTRAINTS.modelId).toBe("low-profile-universal-stopper");
  });
});

// ─────────────────────────────────────────────────────────────
// buildProductModel integration
// ─────────────────────────────────────────────────────────────

describe("buildProductModel — lowProfileUniversalStopper", () => {
  it("builds STI-14000NC correctly — cover fixed as 14", () => {
    const config: Configuration = {
      cover: "14", mounting: "0", hoodSounder: "00", colourLabel: "NC",
    };
    const result = buildProductModel(config, lowProfileUniversalStopperModel);
    expect(result.fullCode).toBe("STI-14000NC");
    expect(result.isComplete).toBe(true);
  });

  it("builds STI-14110FR correctly", () => {
    const config: Configuration = {
      cover: "14", mounting: "1", hoodSounder: "10", colourLabel: "FR",
    };
    const result = buildProductModel(config, lowProfileUniversalStopperModel);
    expect(result.fullCode).toBe("STI-14110FR");
    expect(result.isComplete).toBe(true);
  });

  it("builds STI-14200NW correctly", () => {
    const config: Configuration = {
      cover: "14", mounting: "2", hoodSounder: "00", colourLabel: "NW",
    };
    const result = buildProductModel(config, lowProfileUniversalStopperModel);
    expect(result.fullCode).toBe("STI-14200NW");
    expect(result.isComplete).toBe(true);
  });

  it("builds STI-14220CY correctly", () => {
    const config: Configuration = {
      cover: "14", mounting: "2", hoodSounder: "20", colourLabel: "CY",
    };
    const result = buildProductModel(config, lowProfileUniversalStopperModel);
    expect(result.fullCode).toBe("STI-14220CY");
    expect(result.isComplete).toBe(true);
  });

  it("cover uses dash separator, others have none", () => {
    const config: Configuration = {
      cover: "14", mounting: "0", hoodSounder: "00", colourLabel: "NC",
    };
    const result = buildProductModel(config, lowProfileUniversalStopperModel);
    expect(result.fullCode).toContain("-14");
    expect(result.fullCode).not.toContain("-0");
    expect(result.fullCode).not.toContain("-00");
    expect(result.fullCode).not.toContain("-NC");
  });

  it("baseCode is STI", () => {
    const config: Configuration = {
      cover: null, mounting: null, hoodSounder: null, colourLabel: null,
    };
    const result = buildProductModel(config, lowProfileUniversalStopperModel);
    expect(result.baseCode).toBe("STI");
  });

  it("marks incomplete when steps missing", () => {
    const config: Configuration = {
      cover: "14", mounting: "0", hoodSounder: null, colourLabel: null,
    };
    const result = buildProductModel(config, lowProfileUniversalStopperModel);
    expect(result.isComplete).toBe(false);
    expect(result.missingSteps).toContain("hoodSounder");
    expect(result.missingSteps).toContain("colourLabel");
  });

  it("all 14 valid codes generated from parsed configurations using cover=14", () => {
    const validSet = new Set(VALID_MODEL_CODES);
    let matchCount = 0;
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseLPUSModelCode(code)!;
      const config: Configuration = {
        cover: "14",
        mounting: parsed.mounting ?? null,
        hoodSounder: parsed.hoodSounder ?? null,
        colourLabel: parsed.colourLabel ?? null,
      };
      const result = buildProductModel(config, lowProfileUniversalStopperModel);
      if (validSet.has(result.fullCode)) matchCount++;
    }
    expect(matchCount).toBe(VALID_MODEL_CODES.length);
  });
});

// ─────────────────────────────────────────────────────────────
// filterOptions completeness — lowProfileUniversalStopper
// ─────────────────────────────────────────────────────────────

describe("isConfigurationComplete — lowProfileUniversalStopper", () => {
  it("returns true when all 4 steps selected", () => {
    const config: Configuration = {
      cover: "14", mounting: "0", hoodSounder: "00", colourLabel: "NC",
    };
    expect(isConfigurationComplete(lowProfileUniversalStopperModel, config)).toBe(true);
  });

  it("returns false when any step missing", () => {
    expect(isConfigurationComplete(lowProfileUniversalStopperModel, {
      cover: "14", mounting: "0", hoodSounder: "00", colourLabel: null,
    })).toBe(false);
  });

  it("getMissingRequiredSteps returns correct missing steps", () => {
    const config: Configuration = {
      cover: "14", mounting: "1", hoodSounder: null, colourLabel: null,
    };
    const missing = getMissingRequiredSteps(lowProfileUniversalStopperModel, config);
    expect(missing).toContain("hoodSounder");
    expect(missing).toContain("colourLabel");
    expect(missing).not.toContain("cover");
    expect(missing).not.toContain("mounting");
  });

  it("getCompletionPercentage for 4-step model", () => {
    expect(getCompletionPercentage(lowProfileUniversalStopperModel, {
      cover: null, mounting: null, hoodSounder: null, colourLabel: null,
    })).toBe(0);

    expect(getCompletionPercentage(lowProfileUniversalStopperModel, {
      cover: "14", mounting: null, hoodSounder: null, colourLabel: null,
    })).toBe(25);

    expect(getCompletionPercentage(lowProfileUniversalStopperModel, {
      cover: "14", mounting: "0", hoodSounder: "00", colourLabel: null,
    })).toBe(75);

    expect(getCompletionPercentage(lowProfileUniversalStopperModel, {
      cover: "14", mounting: "0", hoodSounder: "00", colourLabel: "NC",
    })).toBe(100);
  });
});

// ─────────────────────────────────────────────────────────────
// Model definition integrity
// ─────────────────────────────────────────────────────────────

describe("lowProfileUniversalStopperModel definition", () => {
  it("has correct model id and slug", () => {
    expect(lowProfileUniversalStopperModel.id).toBe("low-profile-universal-stopper");
    expect(lowProfileUniversalStopperModel.slug).toBe("low-profile-universal-stopper");
  });

  it("cover step has exactly one option — 14", () => {
    const coverStep = lowProfileUniversalStopperModel.steps.find((s) => s.id === "cover")!;
    expect(coverStep.options).toHaveLength(1);
    expect(coverStep.options[0].id).toBe("14");
  });

  it("hoodSounder step has 3 options — 00, 10, 20", () => {
    const hsStep = lowProfileUniversalStopperModel.steps.find((s) => s.id === "hoodSounder")!;
    const ids = hsStep.options.map((o) => o.id);
    expect(ids).toEqual(["00", "10", "20"]);
  });

  it("colourLabel step has 6 options", () => {
    const clStep = lowProfileUniversalStopperModel.steps.find((s) => s.id === "colourLabel")!;
    expect(clStep.options).toHaveLength(6);
  });

  it("baseCode is STI", () => {
    expect(lowProfileUniversalStopperModel.productModelSchema.baseCode).toBe("STI");
  });

  it("cover uses dash separator, others have none", () => {
    const { separatorMap } = lowProfileUniversalStopperModel.productModelSchema;
    expect(separatorMap?.cover).toBe("-");
    expect(separatorMap?.mounting).toBe("");
    expect(separatorMap?.hoodSounder).toBe("");
    expect(separatorMap?.colourLabel).toBe("");
  });

  it("all steps are required", () => {
    for (const step of lowProfileUniversalStopperModel.steps) {
      expect(step.required).toBe(true);
    }
  });
});