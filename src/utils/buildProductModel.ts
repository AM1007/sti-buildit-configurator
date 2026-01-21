import type { ModelDefinition, Configuration, ProductModel } from "../types";

function findCode(
  model: ModelDefinition,
  stepId: string,
  optionId: string | null
): string {
  if (!optionId) {
    return "";
  }

  const step = model.steps.find((s) => s.id === stepId);
  if (!step) {
    return "";
  }

  const option = step.options.find((o) => o.id === optionId);
  return option?.code ?? "";
}

function isStepRequired(model: ModelDefinition, stepId: string): boolean {
  const step = model.steps.find((s) => s.id === stepId);
  return step?.required ?? false;
}

function getSeparator(
  model: ModelDefinition,
  stepId: string,
  code: string
): string {
  const { productModelSchema: schema } = model;
  
  if (!code) {
    return "";
  }

  if (schema.separatorMap && stepId in schema.separatorMap) {
    return schema.separatorMap[stepId];
  }

  if (schema.separator === "none") {
    return "";
  }
  if (schema.separator === "dash") {
    return "-";
  }

  return schema.separator;
}

export function buildProductModel(
  config: Configuration,
  model: ModelDefinition
): ProductModel {
  const { productModelSchema: schema, stepOrder } = model;

  const parts: Record<string, string> = {};
  const missingSteps: string[] = [];

  for (const stepId of stepOrder) {
    const optionId = config[stepId] ?? null;
    const code = findCode(model, stepId, optionId);
    parts[stepId] = code;

    if (isStepRequired(model, stepId) && !optionId) {
      missingSteps.push(stepId);
    }
  }

  let fullCode = schema.baseCode;

  for (const stepId of schema.partsOrder) {
    const code = parts[stepId] ?? "";
    const separator = getSeparator(model, stepId, code);
    fullCode += separator + code;
  }

  const isComplete = missingSteps.length === 0;

  return {
    baseCode: schema.baseCode,
    parts,
    fullCode,
    isComplete,
    missingSteps,
  };
}

export function parseProductModel(
  modelCode: string,
  model: ModelDefinition
): Configuration | null {
  const { productModelSchema: schema } = model;

  if (!modelCode.startsWith(schema.baseCode)) {
    return null;
  }

  return null;
}

export function identifyModel(modelCode: string): string | null {
  if (modelCode.startsWith("G3")) {
    return "g3-multipurpose-push-button";
  }
  if (modelCode.startsWith("GF")) {
    return "gf-fire-alarm-push-button";
  }
  if (modelCode.startsWith("GLR")) {
    return "global-reset";
  }
  if (modelCode.startsWith("STI-")) {
    return "universal-stopper";
  }
  if (modelCode.startsWith("G3")) {
    return "g3-multipurpose-push-button";
  }
  if (modelCode.startsWith("GF")) {
    return "gf-fire-alarm-push-button";
  }
  if (modelCode.startsWith("STI-")) {
    return "universal-stopper";
  }
  if (modelCode.startsWith("G3")) {
    return "g3-multipurpose-push-button";
  }
  if (modelCode.startsWith("STI-")) {
    return "universal-stopper";
  }
  if (modelCode.startsWith("WSS3-")) {
    return "waterproof-push-buttons";
  }
  if (modelCode.startsWith("G3")) {
    return "g3-multipurpose-push-button";
  }
  if (modelCode.startsWith("WSS3-")) {
    return "waterproof-push-buttons";
  }
  if (modelCode.startsWith("WRP2-")) {
    return "waterproof-reset-call-point";
  }
  if (modelCode.startsWith("SS3-")) {
    const afterPrefix = modelCode.slice(4);
    if (afterPrefix.length > 0 && afterPrefix[1] >= "0" && afterPrefix[1] <= "9") {
      return "key-switches";
    }
    return "indoor-push-buttons";
  }
  if (modelCode.startsWith("SS2")) {
    return "stopper-stations";
  }
  if (modelCode.startsWith("RP-")) {
    return "reset-call-points";
  }

  return null;
}