import type { ModelId, ModelDefinition, Configuration, CustomTextData, CustomTextConfig, CustomTextVariant, StepId } from "../types";

const MODEL_CUSTOM_TEXT_CONFIG: Partial<Record<ModelId, CustomTextConfig>> = {
  "low-profile-universal-stopper": {
    stepId: "colourLabel",
    optionId: "C",
    variant: "multiline-fixed",
    maxLength: 30,
    line2Required: false,
  },
  "stopper-stations": {
    stepId: "text",
    optionId: "ZA",
    variant: "multiline-selectable",
    maxLength: { oneLine: 13, twoLines: 20 },
    line2Required: false,
  },
  "indoor-push-buttons": {
    stepId: "label",
    optionId: "CL",
    variant: "singleline",
    maxLength: 20,
    line2Required: false,
  },
  "key-switches": {
    stepId: "label",
    optionId: "CL",
    variant: "singleline",
    maxLength: 20,
    line2Required: false,
  },
  "waterproof-push-buttons": {
    stepId: "label",
    optionId: "CL",
    variant: "singleline",
    maxLength: 20,
    line2Required: false,
  },
  "reset-call-points": {
    stepId: "label",
    optionId: "CL",
    variant: "multiline-fixed",
    maxLength: 10,
    line2Required: false,
  },
  "waterproof-reset-call-point": {
    stepId: "label",
    optionId: "CL",
    variant: "multiline-fixed",
    maxLength: 10,
    line2Required: false,
  },
  "g3-multipurpose-push-button": {
    stepId: "text",
    optionId: "ZA",
    variant: "multiline-selectable",
    maxLength: { oneLine: 13, twoLines: 20 },
    line2Required: false,
  },
  "universal-stopper": {
    stepId: "colourLabel",
    optionId: "C",
    variant: "multiline-fixed",
    maxLength: 30,
    line2Required: false,
  },
  "global-reset": {
    stepId: "text",
    optionId: "ZA",
    variant: "dual-block-three-line",
    maxLength: 20,
    line2Required: false,
  },
  "enviro-stopper": {
    stepId: "colourLabel",
    optionId: "C",
    variant: "multiline-fixed",
    maxLength: 30,
    line2Required: false,
  },
  "alert-point": {
    stepId: "label",
    optionId: "X",
    variant: "multiline-fixed",
    maxLength: 10,
    line2Required: false,
  },
};

export function getCustomTextConfig(modelId: ModelId): CustomTextConfig | null {
  return MODEL_CUSTOM_TEXT_CONFIG[modelId] ?? null;
}

export function getCustomTextVariant(modelId: ModelId): CustomTextVariant | null {
  const config = getCustomTextConfig(modelId);
  return config?.variant ?? null;
}

export function getCustomTextTrigger(modelId: ModelId): { stepId: StepId; optionId: string } | null {
  const config = getCustomTextConfig(modelId);
  if (!config) return null;
  return { stepId: config.stepId, optionId: config.optionId };
}

export function supportsCustomText(modelId: ModelId): boolean {
  return MODEL_CUSTOM_TEXT_CONFIG[modelId] !== undefined;
}

export function isCustomTextOptionSelected(modelId: ModelId, configuration: Configuration): boolean {
  const config = getCustomTextConfig(modelId);
  if (!config) return false;
  
  const selectedOption = configuration[config.stepId];
  if (!selectedOption) return false;
  
  if (modelId === "universal-stopper" || modelId === "low-profile-universal-stopper" || modelId === "enviro-stopper") {
    return selectedOption.startsWith("C") && selectedOption !== "NC";
  }
  
  return selectedOption === config.optionId;
}

export function isAllStepsCompleted(
  model: ModelDefinition,
  configuration: Configuration
): boolean {
  for (const step of model.steps) {
    if (step.required && !configuration[step.id]) {
      return false;
    }
  }
  return true;
}

export function isNonReturnableLanguageSelected(
  modelId: ModelId,
  configuration: Configuration
): boolean {
  if (modelId !== "stopper-stations") {
    return false;
  }
  
  return configuration.language === "ZL";
}

export function shouldShowCustomTextForm(
  model: ModelDefinition,
  configuration: Configuration,
  customText: CustomTextData | null
): boolean {
  if (!supportsCustomText(model.id)) {
    return false;
  }

  if (!isCustomTextOptionSelected(model.id, configuration)) {
    return false;
  }

  if (!isAllStepsCompleted(model, configuration)) {
    return false;
  }

  if (customText?.submitted) {
    return false;
  }

  return true;
}

export function hasSubmittedCustomText(
  modelId: ModelId,
  configuration: Configuration,
  customText: CustomTextData | null
): boolean {
  if (!isCustomTextOptionSelected(modelId, configuration)) {
    return false;
  }

  return customText?.submitted === true;
}

export function shouldClearCustomText(
  modelId: ModelId,
  triggerStepId: StepId,
  prevOptionId: string | null,
  newOptionId: string | null
): boolean {
  const config = getCustomTextConfig(modelId);
  if (!config) return false;
  
  if (triggerStepId !== config.stepId) return false;
  
  if (prevOptionId === config.optionId && newOptionId !== config.optionId) {
    return true;
  }
  
  return false;
}

export function getMaxLength(modelId: ModelId, lineCount: 1 | 2): number {
  const config = getCustomTextConfig(modelId);
  if (!config) return 20;
  
  if (typeof config.maxLength === "number") {
    return config.maxLength;
  }
  
  return lineCount === 1 ? config.maxLength.oneLine : config.maxLength.twoLines;
}

export function getEffectiveLineCount(variant: CustomTextVariant, selectedLineCount: 1 | 2 | 3): 1 | 2 | 3 {
  switch (variant) {
    case "singleline":
      return 1;
    case "multiline-fixed":
      return 2;
    case "multiline-selectable":
      return selectedLineCount as 1 | 2;
    case "dual-block-three-line":
      return selectedLineCount;
  }
}

export function validateCustomText(
  data: Omit<CustomTextData, "submitted">,
  modelId: ModelId
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const config = getCustomTextConfig(modelId);
  
  if (!config) {
    errors.push("Custom text not supported for this model");
    return { valid: false, errors };
  }
  
  if (config.variant === "dual-block-three-line") {
    const maxLength = typeof config.maxLength === "number" ? config.maxLength : 20;
    
    if (!data.line1.trim()) {
      errors.push("Label Line 1 is required");
    }
    if (data.line1.length > maxLength) {
      errors.push(`Label Line 1 exceeds ${maxLength} characters`);
    }
    if (data.lineCount >= 2 && data.line2 && data.line2.length > maxLength) {
      errors.push(`Label Line 2 exceeds ${maxLength} characters`);
    }
    if (data.lineCount >= 3 && data.line3 && data.line3.length > maxLength) {
      errors.push(`Label Line 3 exceeds ${maxLength} characters`);
    }
    
    if (!data.coverLine1?.trim()) {
      errors.push("Cover Line 1 is required");
    }
    if (data.coverLine1 && data.coverLine1.length > maxLength) {
      errors.push(`Cover Line 1 exceeds ${maxLength} characters`);
    }
    if (data.coverLineCount && data.coverLineCount >= 2 && data.coverLine2 && data.coverLine2.length > maxLength) {
      errors.push(`Cover Line 2 exceeds ${maxLength} characters`);
    }
    if (data.coverLineCount && data.coverLineCount >= 3 && data.coverLine3 && data.coverLine3.length > maxLength) {
      errors.push(`Cover Line 3 exceeds ${maxLength} characters`);
    }
    
    return { valid: errors.length === 0, errors };
  }
  
  const effectiveLineCount = getEffectiveLineCount(config.variant, data.lineCount);
  const maxLength = getMaxLength(modelId, effectiveLineCount as 1 | 2);

  if (!data.line1.trim()) {
    errors.push("Line 1 is required");
  }

  if (data.line1.length > maxLength) {
    errors.push(`Line 1 exceeds ${maxLength} characters`);
  }

  if (effectiveLineCount === 2) {
    if (config.line2Required && !data.line2.trim()) {
      errors.push("Line 2 is required");
    }
    
    if (data.line2.length > maxLength) {
      errors.push(`Line 2 exceeds ${maxLength} characters`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function isConfigurationReadyForActions(
  modelId: ModelId,
  configuration: Configuration,
  customText: CustomTextData | null
): boolean {
  if (!isCustomTextOptionSelected(modelId, configuration)) {
    return true;
  }

  return customText?.submitted === true;
}