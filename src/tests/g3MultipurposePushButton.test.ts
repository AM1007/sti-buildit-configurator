import { describe, it, expect } from "vitest";
import {
  buildG3ModelCode,
  parseG3ModelCode,
  isValidG3Combination,
  getValidOptionsForStep,
  VALID_MODEL_CODES,
  G3_MULTIPURPOSE_PUSH_BUTTON_CONSTRAINTS,
} from "../rules/g3multipurposepushbuttonrules";
import { g3MultipurposePushButtonModel } from "../data/models/g3MultipurposePushButton";
import { buildProductModel } from "../buildProductModel";
import {
  isConfigurationComplete,
  getMissingRequiredSteps,
  getCompletionPercentage,
} from "../filterOptions";
import { createConstraintEngine } from "../rules/constraintEngine";
import type { Configuration } from "../types";

// ─────────────────────────────────────────────────────────────
// buildG3ModelCode
// ─────────────────────────────────────────────────────────────

describe("buildG3ModelCode", () => {
  it("builds G3A209ZA-EN correctly", () => {
    expect(buildG3ModelCode({
      model: "A", colour: "2", cover: "0", buttonType: "9", text: "ZA", language: "EN",
    })).toBe("G3A209ZA-EN");
  });

  it("builds G3C429LD-EN correctly", () => {
    expect(buildG3ModelCode({
      model: "C", colour: "4", cover: "2", buttonType: "9", text: "LD", language: "EN",
    })).toBe("G3C429LD-EN");
  });

  it("builds G3C002AB-EN correctly", () => {
    expect(buildG3ModelCode({
      model: "C", colour: "0", cover: "0", buttonType: "2", text: "AB", language: "EN",
    })).toBe("G3C002AB-EN");
  });

  it("language separator is dash — only separator in the SKU", () => {
    const code = buildG3ModelCode({
      model: "A", colour: "2", cover: "0", buttonType: "9", text: "ZA", language: "EN",
    });
    expect(code).toContain("-EN");
    expect(code?.indexOf("-")).toBe(code!.length - 3);
  });

  it("returns null when any field is missing", () => {
    expect(buildG3ModelCode({ model: "A", colour: "2", cover: "0", buttonType: "9", text: "ZA" }))
      .toBeNull();
    expect(buildG3ModelCode({ model: "A", colour: "2", cover: "0", buttonType: "9", language: "EN" }))
      .toBeNull();
    expect(buildG3ModelCode({})).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────
// parseG3ModelCode
// ─────────────────────────────────────────────────────────────

describe("parseG3ModelCode", () => {
  it("parses G3A209ZA-EN correctly", () => {
    expect(parseG3ModelCode("G3A209ZA-EN")).toEqual({
      model: "A",
      colour: "2",
      cover: "0",
      buttonType: "9",
      text: "ZA",
      language: "EN",
    });
  });

  it("parses G3C002AB-EN correctly", () => {
    expect(parseG3ModelCode("G3C002AB-EN")).toEqual({
      model: "C",
      colour: "0",
      cover: "0",
      buttonType: "2",
      text: "AB",
      language: "EN",
    });
  });

  it("parses G3C325ZA-EN correctly", () => {
    expect(parseG3ModelCode("G3C325ZA-EN")).toEqual({
      model: "C",
      colour: "3",
      cover: "2",
      buttonType: "5",
      text: "ZA",
      language: "EN",
    });
  });

  it("returns null for invalid format", () => {
    expect(parseG3ModelCode("INVALID")).toBeNull();
    expect(parseG3ModelCode("G3A2090ZA-EN")).toBeNull();
    expect(parseG3ModelCode("G3A209ZA")).toBeNull();
    expect(parseG3ModelCode("")).toBeNull();
  });

  it("round-trips for all VALID_MODEL_CODES", () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseG3ModelCode(code);
      expect(parsed).not.toBeNull();
      const rebuilt = buildG3ModelCode(parsed!);
      expect(rebuilt).toBe(code);
    }
  });
});

// ─────────────────────────────────────────────────────────────
// VALID_MODEL_CODES integrity
// ─────────────────────────────────────────────────────────────

describe("VALID_MODEL_CODES", () => {
  it("contains exactly 29 entries", () => {
    expect(VALID_MODEL_CODES.length).toBe(29);
  });

  it("has no duplicates", () => {
    expect(new Set(VALID_MODEL_CODES).size).toBe(29);
  });

  it("12 model A codes, 17 model C codes", () => {
    const modelA = VALID_MODEL_CODES.filter((c) => parseG3ModelCode(c)?.model === "A");
    const modelC = VALID_MODEL_CODES.filter((c) => parseG3ModelCode(c)?.model === "C");
    expect(modelA.length).toBe(12);
    expect(modelC.length).toBe(17);
  });

  it("all codes end with -EN — only language available", () => {
    for (const code of VALID_MODEL_CODES) {
      expect(code.endsWith("-EN")).toBe(true);
    }
  });

  it("model A never has colour 0 or 1", () => {
    const modelACodes = VALID_MODEL_CODES.filter((c) => parseG3ModelCode(c)?.model === "A");
    for (const code of modelACodes) {
      const parsed = parseG3ModelCode(code)!;
      expect(parsed.colour).not.toBe("0");
      expect(parsed.colour).not.toBe("1");
    }
  });

  it("model A never has buttonType 2 or 5", () => {
    const modelACodes = VALID_MODEL_CODES.filter((c) => parseG3ModelCode(c)?.model === "A");
    for (const code of modelACodes) {
      const parsed = parseG3ModelCode(code)!;
      expect(parsed.buttonType).not.toBe("2");
      expect(parsed.buttonType).not.toBe("5");
    }
  });

  it("AB text only appears with model C, colour 0, cover 0, buttonType 2", () => {
    const abCodes = VALID_MODEL_CODES.filter((c) => parseG3ModelCode(c)?.text === "AB");
    expect(abCodes.length).toBeGreaterThan(0);
    for (const code of abCodes) {
      const parsed = parseG3ModelCode(code)!;
      expect(parsed.model).toBe("C");
      expect(parsed.colour).toBe("0");
      expect(parsed.cover).toBe("0");
      expect(parsed.buttonType).toBe("2");
    }
  });

  it("HV text only appears with model A, colour 2, cover 2, buttonType 9", () => {
    const hvCodes = VALID_MODEL_CODES.filter((c) => parseG3ModelCode(c)?.text === "HV");
    expect(hvCodes.length).toBe(1);
    expect(hvCodes[0]).toBe("G3A229HV-EN");
  });

  it("EV text only appears with model C, colour 4, cover 2, buttonType 9", () => {
    const evCodes = VALID_MODEL_CODES.filter((c) => parseG3ModelCode(c)?.text === "EV");
    expect(evCodes.length).toBe(1);
    expect(evCodes[0]).toBe("G3C429EV-EN");
  });

  it("all codes parse successfully", () => {
    for (const code of VALID_MODEL_CODES) {
      expect(parseG3ModelCode(code)).not.toBeNull();
    }
  });
});

// ─────────────────────────────────────────────────────────────
// isValidG3Combination
// ─────────────────────────────────────────────────────────────

describe("isValidG3Combination", () => {
  it("all 29 VALID_MODEL_CODES pass validation", () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseG3ModelCode(code)!;
      expect(isValidG3Combination(parsed)).toEqual({ valid: true });
    }
  });

  it("returns valid for incomplete selection", () => {
    expect(isValidG3Combination({})).toEqual({ valid: true });
    expect(isValidG3Combination({ model: "A" })).toEqual({ valid: true });
    expect(isValidG3Combination({ model: "A", colour: "2", cover: "0", buttonType: "9", text: "ZA" }))
      .toEqual({ valid: true });
  });

  it("rejects model A with colour 0 — not in allowlist", () => {
    const result = isValidG3Combination({
      model: "A", colour: "0", cover: "0", buttonType: "9", text: "ZA", language: "EN",
    });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.reason).toContain("G3A009ZA-EN");
  });

  it("rejects model A with buttonType 2 — not in allowlist", () => {
    const result = isValidG3Combination({
      model: "A", colour: "2", cover: "0", buttonType: "2", text: "PS", language: "EN",
    });
    expect(result.valid).toBe(false);
  });

  it("rejects HV text with model C — not in allowlist", () => {
    const result = isValidG3Combination({
      model: "C", colour: "2", cover: "2", buttonType: "9", text: "HV", language: "EN",
    });
    expect(result.valid).toBe(false);
  });

  it("rejects EV text with cover 0 — not in allowlist", () => {
    const result = isValidG3Combination({
      model: "C", colour: "4", cover: "0", buttonType: "9", text: "EV", language: "EN",
    });
    expect(result.valid).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────
// getValidOptionsForStep
// ─────────────────────────────────────────────────────────────

describe("getValidOptionsForStep", () => {
  it("returns both models when nothing selected", () => {
    const valid = getValidOptionsForStep("model", {});
    expect(valid).toContain("A");
    expect(valid).toContain("C");
  });

  it("language always returns only EN", () => {
    const valid = getValidOptionsForStep("language", {});
    expect(valid).toEqual(["EN"]);
  });

  it("language is EN regardless of other selections", () => {
    const valid = getValidOptionsForStep("language", {
      model: "C", colour: "4", cover: "2", buttonType: "9", text: "EV",
    });
    expect(valid).toEqual(["EN"]);
  });

  it("model A does not allow colour 0 or 1", () => {
    const valid = getValidOptionsForStep("colour", { model: "A" });
    expect(valid).not.toContain("0");
    expect(valid).not.toContain("1");
    expect(valid).toContain("2");
    expect(valid).toContain("3");
    expect(valid).toContain("4");
  });

  it("model A does not allow buttonType 2 or 5", () => {
    const valid = getValidOptionsForStep("buttonType", { model: "A" });
    expect(valid).not.toContain("2");
    expect(valid).not.toContain("5");
    expect(valid).toContain("9");
  });

  it("HV text only valid with model A", () => {
    const valid = getValidOptionsForStep("model", { text: "HV" });
    expect(valid).toEqual(["A"]);
  });

  it("AB text only valid with model C", () => {
    const valid = getValidOptionsForStep("model", { text: "AB" });
    expect(valid).toEqual(["C"]);
  });

  it("HV text only valid with cover 2", () => {
    const valid = getValidOptionsForStep("cover", { text: "HV" });
    expect(valid).toEqual(["2"]);
  });

  it("EV text only valid with cover 2 and colour 4", () => {
    const coverValid = getValidOptionsForStep("cover", { text: "EV" });
    const colourValid = getValidOptionsForStep("colour", { text: "EV" });
    expect(coverValid).toEqual(["2"]);
    expect(colourValid).toEqual(["4"]);
  });

  it("buttonType 2 only valid with colour 0 or 1", () => {
    const valid = getValidOptionsForStep("colour", { buttonType: "2" });
    expect(valid).toContain("0");
    expect(valid).toContain("1");
    expect(valid).not.toContain("2");
    expect(valid).not.toContain("3");
    expect(valid).not.toContain("4");
  });

  it("colour 0 restricts to very few combinations", () => {
    const buttonTypes = getValidOptionsForStep("buttonType", { colour: "0" });
    expect(buttonTypes).toEqual(["2"]);
    const texts = getValidOptionsForStep("text", { colour: "0" });
    expect(texts).toContain("AB");
    expect(texts).toContain("PS");
  });
});

// ─────────────────────────────────────────────────────────────
// Constraint engine integration
// ─────────────────────────────────────────────────────────────

describe("G3_MULTIPURPOSE_PUSH_BUTTON_CONSTRAINTS + constraintEngine", () => {
  const engine = createConstraintEngine(G3_MULTIPURPOSE_PUSH_BUTTON_CONSTRAINTS);

  it("blocks colour 0 when model is A", () => {
    expect(engine.checkOptionAvailability("colour", "0", { model: "A" }).available)
      .toBe(false);
  });

  it("blocks colour 1 when model is A", () => {
    expect(engine.checkOptionAvailability("colour", "1", { model: "A" }).available)
      .toBe(false);
  });

  it("allows colour 2 3 4 when model is A", () => {
    for (const colour of ["2", "3", "4"]) {
      expect(engine.checkOptionAvailability("colour", colour, { model: "A" }).available)
        .toBe(true);
    }
  });

  it("blocks buttonType 2 and 5 when model is A", () => {
    expect(engine.checkOptionAvailability("buttonType", "2", { model: "A" }).available)
      .toBe(false);
    expect(engine.checkOptionAvailability("buttonType", "5", { model: "A" }).available)
      .toBe(false);
  });

  it("blocks HV text when model is C", () => {
    expect(engine.checkOptionAvailability("text", "HV", { model: "C" }).available)
      .toBe(false);
  });

  it("allows HV text when model is A", () => {
    expect(engine.checkOptionAvailability("text", "HV", { model: "A" }).available)
      .toBe(true);
  });

  it("blocks AB text when model is A", () => {
    expect(engine.checkOptionAvailability("text", "AB", { model: "A" }).available)
      .toBe(false);
  });

  it("blocks EV text when colour is not 4", () => {
    for (const colour of ["0", "1", "2", "3"]) {
      expect(engine.checkOptionAvailability("text", "EV", { colour }).available)
        .toBe(false);
    }
  });

  it("blocks EV text when cover is 0", () => {
    expect(engine.checkOptionAvailability("text", "EV", { cover: "0" }).available)
      .toBe(false);
  });

  it("allows EV text when colour is 4 and cover is 2", () => {
    expect(engine.checkOptionAvailability("text", "EV", { colour: "4" }).available)
      .toBe(true);
    expect(engine.checkOptionAvailability("text", "EV", { cover: "2" }).available)
      .toBe(true);
  });

  it("blocks buttonType 2 when colour is 2, 3, or 4", () => {
    for (const colour of ["2", "3", "4"]) {
      expect(engine.checkOptionAvailability("buttonType", "2", { colour }).available)
        .toBe(false);
    }
  });

  it("constraint engine modelId matches", () => {
    expect(G3_MULTIPURPOSE_PUSH_BUTTON_CONSTRAINTS.modelId).toBe("g3-multipurpose-push-button");
  });
});

// ─────────────────────────────────────────────────────────────
// buildProductModel integration
// ─────────────────────────────────────────────────────────────

describe("buildProductModel — g3MultipurposePushButton", () => {
  it("builds G3A209ZA-EN correctly", () => {
    const config: Configuration = {
      model: "A", colour: "2", cover: "0", buttonType: "9", text: "ZA", language: "EN",
    };
    const result = buildProductModel(config, g3MultipurposePushButtonModel);
    expect(result.fullCode).toBe("G3A209ZA-EN");
    expect(result.isComplete).toBe(true);
  });

  it("builds G3C002AB-EN correctly", () => {
    const config: Configuration = {
      model: "C", colour: "0", cover: "0", buttonType: "2", text: "AB", language: "EN",
    };
    const result = buildProductModel(config, g3MultipurposePushButtonModel);
    expect(result.fullCode).toBe("G3C002AB-EN");
    expect(result.isComplete).toBe(true);
  });

  it("builds G3C429EV-EN correctly", () => {
    const config: Configuration = {
      model: "C", colour: "4", cover: "2", buttonType: "9", text: "EV", language: "EN",
    };
    const result = buildProductModel(config, g3MultipurposePushButtonModel);
    expect(result.fullCode).toBe("G3C429EV-EN");
    expect(result.isComplete).toBe(true);
  });

  it("language separator is only dash in SKU", () => {
    const config: Configuration = {
      model: "C", colour: "3", cover: "2", buttonType: "5", text: "ZA", language: "EN",
    };
    const result = buildProductModel(config, g3MultipurposePushButtonModel);
    expect(result.fullCode).toBe("G3C325ZA-EN");
    expect(result.fullCode.split("-")).toHaveLength(2);
  });

  it("baseCode is G3", () => {
    const config: Configuration = {
      model: null, colour: null, cover: null, buttonType: null, text: null, language: null,
    };
    const result = buildProductModel(config, g3MultipurposePushButtonModel);
    expect(result.baseCode).toBe("G3");
  });

  it("marks incomplete when steps missing", () => {
    const config: Configuration = {
      model: "A", colour: "2", cover: "0", buttonType: null, text: null, language: null,
    };
    const result = buildProductModel(config, g3MultipurposePushButtonModel);
    expect(result.isComplete).toBe(false);
    expect(result.missingSteps).toContain("buttonType");
    expect(result.missingSteps).toContain("text");
    expect(result.missingSteps).toContain("language");
  });

  it("all 29 valid codes generated from parsed configurations", () => {
    const validSet = new Set(VALID_MODEL_CODES);
    let matchCount = 0;

    for (const code of VALID_MODEL_CODES) {
      const parsed = parseG3ModelCode(code)!;
      const config: Configuration = {
        model: parsed.model ?? null,
        colour: parsed.colour ?? null,
        cover: parsed.cover ?? null,
        buttonType: parsed.buttonType ?? null,
        text: parsed.text ?? null,
        language: parsed.language ?? null,
      };
      const result = buildProductModel(config, g3MultipurposePushButtonModel);
      if (validSet.has(result.fullCode)) matchCount++;
    }

    expect(matchCount).toBe(VALID_MODEL_CODES.length);
  });
});

// ─────────────────────────────────────────────────────────────
// filterOptions completeness — g3MultipurposePushButton
// ─────────────────────────────────────────────────────────────

describe("isConfigurationComplete — g3MultipurposePushButton", () => {
  it("returns true when all 6 steps selected", () => {
    const config: Configuration = {
      model: "A", colour: "2", cover: "0", buttonType: "9", text: "ZA", language: "EN",
    };
    expect(isConfigurationComplete(g3MultipurposePushButtonModel, config)).toBe(true);
  });

  it("returns false when any step missing", () => {
    expect(isConfigurationComplete(g3MultipurposePushButtonModel, {
      model: "A", colour: "2", cover: "0", buttonType: "9", text: "ZA", language: null,
    })).toBe(false);
  });

  it("getMissingRequiredSteps returns correct missing steps", () => {
    const config: Configuration = {
      model: "C", colour: "4", cover: "2", buttonType: null, text: null, language: null,
    };
    const missing = getMissingRequiredSteps(g3MultipurposePushButtonModel, config);
    expect(missing).toContain("buttonType");
    expect(missing).toContain("text");
    expect(missing).toContain("language");
    expect(missing).not.toContain("model");
    expect(missing).not.toContain("colour");
    expect(missing).not.toContain("cover");
  });

  it("getCompletionPercentage for 6-step model", () => {
    expect(getCompletionPercentage(g3MultipurposePushButtonModel, {
      model: null, colour: null, cover: null, buttonType: null, text: null, language: null,
    })).toBe(0);

    expect(getCompletionPercentage(g3MultipurposePushButtonModel, {
      model: "A", colour: null, cover: null, buttonType: null, text: null, language: null,
    })).toBe(17);

    expect(getCompletionPercentage(g3MultipurposePushButtonModel, {
      model: "A", colour: "2", cover: "0", buttonType: "9", text: null, language: null,
    })).toBe(67);

    expect(getCompletionPercentage(g3MultipurposePushButtonModel, {
      model: "A", colour: "2", cover: "0", buttonType: "9", text: "ZA", language: "EN",
    })).toBe(100);
  });
});

// ─────────────────────────────────────────────────────────────
// Model definition integrity
// ─────────────────────────────────────────────────────────────

describe("g3MultipurposePushButtonModel definition", () => {
  it("has correct model id and slug", () => {
    expect(g3MultipurposePushButtonModel.id).toBe("g3-multipurpose-push-button");
    expect(g3MultipurposePushButtonModel.slug).toBe("g3-multipurpose-push-button");
  });

  it("has 6 steps in stepOrder", () => {
    expect(g3MultipurposePushButtonModel.stepOrder).toHaveLength(6);
    expect(g3MultipurposePushButtonModel.stepOrder).toEqual([
      "model", "colour", "cover", "buttonType", "text", "language",
    ]);
  });

  it("all steps are required", () => {
    for (const step of g3MultipurposePushButtonModel.steps) {
      expect(step.required).toBe(true);
    }
  });

  it("language step has only one option — EN", () => {
    const langStep = g3MultipurposePushButtonModel.steps.find((s) => s.id === "language")!;
    expect(langStep.options).toHaveLength(1);
    expect(langStep.options[0].id).toBe("EN");
  });

  it("colour step does not include disabled option 5 (Orange)", () => {
    const colourStep = g3MultipurposePushButtonModel.steps.find((s) => s.id === "colour")!;
    const ids = colourStep.options.map((o) => o.id);
    expect(ids).not.toContain("5");
  });

  it("text step does not include disabled options ES, PL, PX, NT", () => {
    const textStep = g3MultipurposePushButtonModel.steps.find((s) => s.id === "text")!;
    const ids = textStep.options.map((o) => o.id);
    for (const disabled of ["ES", "PL", "PX", "NT"]) {
      expect(ids).not.toContain(disabled);
    }
  });

  it("baseCode is G3", () => {
    expect(g3MultipurposePushButtonModel.productModelSchema.baseCode).toBe("G3");
  });

  it("only language uses dash separator", () => {
    const { separatorMap } = g3MultipurposePushButtonModel.productModelSchema;
    expect(separatorMap?.language).toBe("-");
    expect(separatorMap?.model).toBe("");
    expect(separatorMap?.colour).toBe("");
    expect(separatorMap?.cover).toBe("");
    expect(separatorMap?.buttonType).toBe("");
    expect(separatorMap?.text).toBe("");
  });
});