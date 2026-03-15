import { describe, it, expect } from "vitest";
import { buildProductModel } from "../buildProductModel";
import type { ModelDefinition, Configuration } from "../types";

const mockModel: ModelDefinition = {
  id: "test-model",
  slug: "test-model",
  stepOrder: ["colour", "size"],
  steps: [
    {
      id: "colour",
      required: true,
      options: [
        { id: "red", code: "R", label: "Red" },
        { id: "blue", code: "B", label: "Blue" },
      ],
    },
    {
      id: "size",
      required: true,
      options: [
        { id: "small", code: "S", label: "Small" },
        { id: "large", code: "L", label: "Large" },
      ],
    },
  ],
  productModelSchema: {
    baseCode: "TEST",
    separator: "dash",
    partsOrder: ["colour", "size"],
  },
} as unknown as ModelDefinition;

describe("buildProductModel", () => {
  it("builds full code when all required steps are selected", () => {
    const config: Configuration = { colour: "red", size: "small" };
    const result = buildProductModel(config, mockModel);

    expect(result.isComplete).toBe(true);
    expect(result.fullCode).toBe("TEST-R-S");
    expect(result.missingSteps).toHaveLength(0);
  });

  it("marks incomplete when required step is missing", () => {
    const config: Configuration = { colour: "red", size: null };
    const result = buildProductModel(config, mockModel);

    expect(result.isComplete).toBe(false);
    expect(result.missingSteps).toContain("size");
  });

  it("returns baseCode only when no selections made", () => {
    const config: Configuration = { colour: null, size: null };
    const result = buildProductModel(config, mockModel);

    expect(result.isComplete).toBe(false);
    expect(result.fullCode).toBe("TEST");
  });

  it("skips separator when code is empty", () => {
    const config: Configuration = { colour: "red", size: null };
    const result = buildProductModel(config, mockModel);

    expect(result.fullCode).toBe("TEST-R");
  });

  it("returns correct parts map", () => {
    const config: Configuration = { colour: "blue", size: "large" };
    const result = buildProductModel(config, mockModel);

    expect(result.parts).toEqual({ colour: "B", size: "L" });
  });
});

describe("identifyModel", () => {
  it("identifies models by prefix without false positives", async () => {
    const { identifyModel } = await import("../buildProductModel");

    expect(identifyModel("G3-ABC")).toBe("g3-multipurpose-push-button");
    expect(identifyModel("GF-123")).toBe("gf-fire-alarm-push-button");
    expect(identifyModel("GLR-456")).toBe("global-reset");
    expect(identifyModel("STI-15-XYZ")).toBe("euro-stopper");
    expect(identifyModel("STI-693-ABC")).toBe("call-point-stopper");
    expect(identifyModel("STI-100")).toBe("universal-stopper");
    expect(identifyModel("WSS3-ABC")).toBe("waterproof-push-buttons");
    expect(identifyModel("WRP2-ABC")).toBe("waterproof-reset-call-point");
    expect(identifyModel("SS2-ABC")).toBe("stopper-stations");
    expect(identifyModel("RP-ABC")).toBe("reset-call-points");
    expect(identifyModel("UNKNOWN")).toBeNull();
  });
});