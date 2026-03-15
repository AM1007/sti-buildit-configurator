import { describe, it, expect } from "vitest";
import {
  buildEAModelCode,
  parseEAModelCode,
  isValidEACombination,
  getValidEAOptionsForStep,
  VALID_MODEL_CODES,
  ENVIRO_ARMOUR_CONSTRAINTS,
} from "../rules/enviroArmourRules";
import { enviroArmourModel } from "../data/models/enviroArmour";
import { buildProductModel } from "../buildProductModel";
import {
  isConfigurationComplete,
  getMissingRequiredSteps,
  getCompletionPercentage,
} from "../filterOptions";
import { createConstraintEngine } from "../rules/constraintEngine";
import type { Configuration } from "../types";

// ─────────────────────────────────────────────────────────────
// buildEAModelCode
// ─────────────────────────────────────────────────────────────

describe("buildEAModelCode", () => {
  it("builds all 6 valid SKUs correctly", () => {
    expect(buildEAModelCode({ material: "S", size: "121005", doorType: "O" }))
      .toBe("ES-121005-O");
    expect(buildEAModelCode({ material: "S", size: "161608", doorType: "O" }))
      .toBe("ES-161608-O");
    expect(buildEAModelCode({ material: "S", size: "231609", doorType: "O" }))
      .toBe("ES-231609-O");
    expect(buildEAModelCode({ material: "S", size: "312312", doorType: "O" }))
      .toBe("ES-312312-O");
    expect(buildEAModelCode({ material: "T", size: "121006", doorType: "C" }))
      .toBe("ET-121006-C");
    expect(buildEAModelCode({ material: "T", size: "181408", doorType: "C" }))
      .toBe("ET-181408-C");
  });

  it("returns null when any field is missing", () => {
    expect(buildEAModelCode({ material: "S", size: "121005" })).toBeNull();
    expect(buildEAModelCode({ material: "S", doorType: "O" })).toBeNull();
    expect(buildEAModelCode({ size: "121005", doorType: "O" })).toBeNull();
    expect(buildEAModelCode({})).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────
// parseEAModelCode
// ─────────────────────────────────────────────────────────────

describe("parseEAModelCode", () => {
  it("parses all 6 valid SKUs correctly", () => {
    expect(parseEAModelCode("ES-121005-O")).toEqual({
      material: "S",
      size: "121005",
      doorType: "O",
    });
    expect(parseEAModelCode("ET-121006-C")).toEqual({
      material: "T",
      size: "121006",
      doorType: "C",
    });
    expect(parseEAModelCode("ES-312312-O")).toEqual({
      material: "S",
      size: "312312",
      doorType: "O",
    });
  });

  it("returns null for invalid format", () => {
    expect(parseEAModelCode("INVALID")).toBeNull();
    expect(parseEAModelCode("ES-12100-O")).toBeNull();
    expect(parseEAModelCode("EX-121005-O")).toBeNull();
    expect(parseEAModelCode("ES-121005-X")).toBeNull();
    expect(parseEAModelCode("")).toBeNull();
  });

  it("round-trips for all VALID_MODEL_CODES", () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseEAModelCode(code);
      expect(parsed).not.toBeNull();
      const rebuilt = buildEAModelCode(parsed!);
      expect(rebuilt).toBe(code);
    }
  });
});

// ─────────────────────────────────────────────────────────────
// VALID_MODEL_CODES integrity
// ─────────────────────────────────────────────────────────────

describe("VALID_MODEL_CODES", () => {
  it("contains exactly 6 entries", () => {
    expect(VALID_MODEL_CODES.length).toBe(6);
  });

  it("has no duplicates", () => {
    expect(new Set(VALID_MODEL_CODES).size).toBe(6);
  });

  it("4 fibreglass (ES) and 2 polycarbonate (ET) entries", () => {
    const es = VALID_MODEL_CODES.filter((c) => c.startsWith("ES"));
    const et = VALID_MODEL_CODES.filter((c) => c.startsWith("ET"));
    expect(es.length).toBe(4);
    expect(et.length).toBe(2);
  });

  it("all ES codes have opaque door (O)", () => {
    for (const code of VALID_MODEL_CODES.filter((c) => c.startsWith("ES"))) {
      expect(code.endsWith("-O")).toBe(true);
    }
  });

  it("all ET codes have clear door (C)", () => {
    for (const code of VALID_MODEL_CODES.filter((c) => c.startsWith("ET"))) {
      expect(code.endsWith("-C")).toBe(true);
    }
  });

  it("all codes parse successfully", () => {
    for (const code of VALID_MODEL_CODES) {
      expect(parseEAModelCode(code)).not.toBeNull();
    }
  });
});

// ─────────────────────────────────────────────────────────────
// isValidEACombination
// ─────────────────────────────────────────────────────────────

describe("isValidEACombination", () => {
  it("all 6 VALID_MODEL_CODES pass validation", () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseEAModelCode(code)!;
      expect(isValidEACombination(parsed)).toEqual({ valid: true });
    }
  });

  it("returns valid for incomplete selection", () => {
    expect(isValidEACombination({})).toEqual({ valid: true });
    expect(isValidEACombination({ material: "S" })).toEqual({ valid: true });
    expect(isValidEACombination({ material: "S", size: "121005" })).toEqual({ valid: true });
  });

  it("rejects fibreglass with clear door — S only goes with O", () => {
    const result = isValidEACombination({
      material: "S",
      size: "121005",
      doorType: "C",
    });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toContain("ES-121005-C");
    }
  });

  it("rejects polycarbonate with opaque door — T only goes with C", () => {
    const result = isValidEACombination({
      material: "T",
      size: "121006",
      doorType: "O",
    });
    expect(result.valid).toBe(false);
  });

  it("rejects S material with T-only sizes", () => {
    const result = isValidEACombination({
      material: "S",
      size: "121006",
      doorType: "O",
    });
    expect(result.valid).toBe(false);
  });

  it("rejects T material with S-only sizes", () => {
    const result = isValidEACombination({
      material: "T",
      size: "121005",
      doorType: "C",
    });
    expect(result.valid).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────
// getValidEAOptionsForStep
// ─────────────────────────────────────────────────────────────

describe("getValidEAOptionsForStep", () => {
  it("returns both materials when nothing selected", () => {
    const valid = getValidEAOptionsForStep("material", {});
    expect(valid).toContain("S");
    expect(valid).toContain("T");
  });

  it("S material only allows opaque door", () => {
    const valid = getValidEAOptionsForStep("doorType", { material: "S" });
    expect(valid).toEqual(["O"]);
  });

  it("T material only allows clear door", () => {
    const valid = getValidEAOptionsForStep("doorType", { material: "T" });
    expect(valid).toEqual(["C"]);
  });

  it("S material allows 4 sizes, T material allows 2 sizes", () => {
    const sValid = getValidEAOptionsForStep("size", { material: "S" });
    const tValid = getValidEAOptionsForStep("size", { material: "T" });
    expect(sValid).toHaveLength(4);
    expect(tValid).toHaveLength(2);
  });

  it("S sizes are mutually exclusive with T sizes", () => {
    const sValid = getValidEAOptionsForStep("size", { material: "S" });
    const tValid = getValidEAOptionsForStep("size", { material: "T" });
    for (const size of sValid) {
      expect(tValid).not.toContain(size);
    }
  });

  it("opaque door only allows S material", () => {
    const valid = getValidEAOptionsForStep("material", { doorType: "O" });
    expect(valid).toEqual(["S"]);
  });

  it("clear door only allows T material", () => {
    const valid = getValidEAOptionsForStep("material", { doorType: "C" });
    expect(valid).toEqual(["T"]);
  });

  it("size 121005 only allows opaque door and S material", () => {
    const doorValid = getValidEAOptionsForStep("doorType", { size: "121005" });
    const materialValid = getValidEAOptionsForStep("material", { size: "121005" });
    expect(doorValid).toEqual(["O"]);
    expect(materialValid).toEqual(["S"]);
  });
});

// ─────────────────────────────────────────────────────────────
// Constraint engine integration
// ─────────────────────────────────────────────────────────────

describe("ENVIRO_ARMOUR_CONSTRAINTS + constraintEngine", () => {
  const engine = createConstraintEngine(ENVIRO_ARMOUR_CONSTRAINTS);

  it("blocks clear door when material is S", () => {
    const result = engine.checkOptionAvailability("doorType", "C", { material: "S" });
    expect(result.available).toBe(false);
  });

  it("allows opaque door when material is S", () => {
    const result = engine.checkOptionAvailability("doorType", "O", { material: "S" });
    expect(result.available).toBe(true);
  });

  it("blocks opaque door when material is T", () => {
    const result = engine.checkOptionAvailability("doorType", "O", { material: "T" });
    expect(result.available).toBe(false);
  });

  it("blocks T-only sizes when material is S", () => {
    for (const size of ["121006", "181408"]) {
      const result = engine.checkOptionAvailability("size", size, { material: "S" });
      expect(result.available).toBe(false);
    }
  });

  it("blocks S-only sizes when material is T", () => {
    for (const size of ["161608", "231609", "312312"]) {
      const result = engine.checkOptionAvailability("size", size, { material: "T" });
      expect(result.available).toBe(false);
    }
  });

  it("doorType determines material bidirectionally", () => {
    expect(
      engine.checkOptionAvailability("material", "S", { doorType: "C" }).available
    ).toBe(false);
    expect(
      engine.checkOptionAvailability("material", "T", { doorType: "O" }).available
    ).toBe(false);
    expect(
      engine.checkOptionAvailability("material", "S", { doorType: "O" }).available
    ).toBe(true);
    expect(
      engine.checkOptionAvailability("material", "T", { doorType: "C" }).available
    ).toBe(true);
  });

  it("constraint engine modelId matches", () => {
    expect(ENVIRO_ARMOUR_CONSTRAINTS.modelId).toBe("enviro-armour");
  });
});

// ─────────────────────────────────────────────────────────────
// buildProductModel integration
// ─────────────────────────────────────────────────────────────

describe("buildProductModel — enviroArmour", () => {
  it("builds ES-121005-O correctly", () => {
    const config: Configuration = {
      material: "S",
      size: "121005",
      doorType: "O",
    };
    const result = buildProductModel(config, enviroArmourModel);
    expect(result.fullCode).toBe("ES-121005-O");
    expect(result.isComplete).toBe(true);
  });

  it("builds ET-121006-C correctly", () => {
    const config: Configuration = {
      material: "T",
      size: "121006",
      doorType: "C",
    };
    const result = buildProductModel(config, enviroArmourModel);
    expect(result.fullCode).toBe("ET-121006-C");
    expect(result.isComplete).toBe(true);
  });

  it("builds ET-181408-C correctly", () => {
    const config: Configuration = {
      material: "T",
      size: "181408",
      doorType: "C",
    };
    const result = buildProductModel(config, enviroArmourModel);
    expect(result.fullCode).toBe("ET-181408-C");
    expect(result.isComplete).toBe(true);
  });

  it("baseCode is E", () => {
    const config: Configuration = { material: null, size: null, doorType: null };
    const result = buildProductModel(config, enviroArmourModel);
    expect(result.baseCode).toBe("E");
  });

  it("material code appended without separator", () => {
    const config: Configuration = {
      material: "S",
      size: "121005",
      doorType: "O",
    };
    const result = buildProductModel(config, enviroArmourModel);
    expect(result.fullCode.startsWith("ES")).toBe(true);
    expect(result.fullCode.startsWith("E-S")).toBe(false);
  });

  it("marks incomplete when steps missing", () => {
    const config: Configuration = { material: "S", size: null, doorType: null };
    const result = buildProductModel(config, enviroArmourModel);
    expect(result.isComplete).toBe(false);
    expect(result.missingSteps).toContain("size");
    expect(result.missingSteps).toContain("doorType");
  });

  it("all 6 valid codes generated from parsed configurations", () => {
    const validSet = new Set(VALID_MODEL_CODES);
    let matchCount = 0;

    for (const code of VALID_MODEL_CODES) {
      const parsed = parseEAModelCode(code)!;
      const config: Configuration = {
        material: parsed.material ?? null,
        size: parsed.size ?? null,
        doorType: parsed.doorType ?? null,
      };
      const result = buildProductModel(config, enviroArmourModel);
      if (validSet.has(result.fullCode)) matchCount++;
    }

    expect(matchCount).toBe(VALID_MODEL_CODES.length);
  });
});

// ─────────────────────────────────────────────────────────────
// filterOptions completeness — enviroArmour
// ─────────────────────────────────────────────────────────────

describe("isConfigurationComplete — enviroArmour", () => {
  it("returns true when all three steps selected", () => {
    const config: Configuration = { material: "S", size: "121005", doorType: "O" };
    expect(isConfigurationComplete(enviroArmourModel, config)).toBe(true);
  });

  it("returns false when any step missing", () => {
    expect(isConfigurationComplete(enviroArmourModel, {
      material: "S", size: "121005", doorType: null,
    })).toBe(false);

    expect(isConfigurationComplete(enviroArmourModel, {
      material: null, size: null, doorType: null,
    })).toBe(false);
  });

  it("getMissingRequiredSteps returns correct steps", () => {
    const config: Configuration = { material: "T", size: null, doorType: null };
    const missing = getMissingRequiredSteps(enviroArmourModel, config);
    expect(missing).toContain("size");
    expect(missing).toContain("doorType");
    expect(missing).not.toContain("material");
  });

  it("getCompletionPercentage returns correct percentages", () => {
    expect(getCompletionPercentage(enviroArmourModel, {
      material: null, size: null, doorType: null,
    })).toBe(0);

    expect(getCompletionPercentage(enviroArmourModel, {
      material: "S", size: null, doorType: null,
    })).toBe(33);

    expect(getCompletionPercentage(enviroArmourModel, {
      material: "S", size: "121005", doorType: null,
    })).toBe(67);

    expect(getCompletionPercentage(enviroArmourModel, {
      material: "S", size: "121005", doorType: "O",
    })).toBe(100);
  });
});

// ─────────────────────────────────────────────────────────────
// Model definition integrity
// ─────────────────────────────────────────────────────────────

describe("enviroArmourModel definition", () => {
  it("has correct model id and slug", () => {
    expect(enviroArmourModel.id).toBe("enviro-armour");
    expect(enviroArmourModel.slug).toBe("enviro-armour");
  });

  it("stepOrder matches steps", () => {
    const stepIds = enviroArmourModel.steps.map((s) => s.id);
    for (const stepId of enviroArmourModel.stepOrder) {
      expect(stepIds).toContain(stepId);
    }
  });

  it("all steps are required", () => {
    for (const step of enviroArmourModel.steps) {
      expect(step.required).toBe(true);
    }
  });

  it("baseCode is E", () => {
    expect(enviroArmourModel.productModelSchema.baseCode).toBe("E");
  });

  it("separatorMap: material no sep, size and doorType use dash", () => {
    const { separatorMap } = enviroArmourModel.productModelSchema;
    expect(separatorMap?.material).toBe("");
    expect(separatorMap?.size).toBe("-");
    expect(separatorMap?.doorType).toBe("-");
  });

  it("material options are T and S", () => {
    const materialStep = enviroArmourModel.steps.find((s) => s.id === "material")!;
    const ids = materialStep.options.map((o) => o.id);
    expect(ids).toContain("T");
    expect(ids).toContain("S");
  });

  it("size options count matches allowlist sizes", () => {
    const sizeStep = enviroArmourModel.steps.find((s) => s.id === "size")!;
    expect(sizeStep.options).toHaveLength(6);
  });
});