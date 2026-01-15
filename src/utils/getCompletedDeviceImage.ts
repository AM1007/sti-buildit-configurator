import type { Configuration, ModelId } from "../types";

interface GetCompletedDeviceImageParams {
  fullCode: string;
  modelId: ModelId;
  config: Configuration;
  isComplete: boolean;
}

interface CompletedDeviceImageResult {
  imagePath: string | null;
  reason?: string;
}

const STOPPER_COLOUR_TO_FOLDER: Record<string, string> = {
  "0": "RED",
  "1": "GREEN",
  "2": "YELLOW",
  "3": "WHITE",
  "4": "BLUE",
  "5": "ORANGE",
};

const MODEL_CONFIG: Record<string, {
  basePath: string;
  colourMap: Record<string, string>;
  colourStep: string;
  clStep?: string;
}> = {
  "low-profile-universal-stopper": {
    basePath: "/Low Profile Universal Stopper/COMPLETED DEVICE",
    colourMap: {
      "FR": "RED",
      "NR": "RED",
      "CR": "RED",
      "EG": "GREEN",
      "NG": "GREEN",
      "CG": "GREEN",
      "NC": "CLEAR",
      "NB": "BLUE",
      "CB": "BLUE",
      "NW": "WHITE",
      "CW": "WHITE",
      "NY": "YELLOW",
      "CY": "YELLOW",
    },
    colourStep: "colourLabel",
  },
  "stopper-stations": {
    basePath: "/Stopper Stations/COMPLETED DEVICE",
    colourMap: STOPPER_COLOUR_TO_FOLDER,
    colourStep: "colour",
  },
  "indoor-push-buttons": {
    basePath: "/Indoor Push Buttons/COMPLETED DEVICE",
    colourMap: {
      "1": "RED",
      "3": "GREEN",
      "5": "YELLOW",
      "7": "WHITE",
      "9": "BLUE",
      "E": "ORANGE",
    },
    colourStep: "colour",
    clStep: "label",
  },
  "key-switches": {
    basePath: "/Key Switches/COMPLETED DEVICE",
    colourMap: {
      "10": "RED",
      "30": "GREEN",
      "50": "YELLOW",
      "70": "WHITE",
      "90": "BLUE",
      "E0": "ORANGE",
    },
    colourStep: "colourMounting",
    clStep: "label",
  },
  "reset-call-points": {
    basePath: "/ReSet Call Points/COMPLETED DEVICE",
    colourMap: {
      "R": "RED",
      "G": "GREEN",
      "Y": "YELLOW",
      "W": "WHITE",
      "B": "BLUE",
      "O": "ORANGE",
    },
    colourStep: "colour",
    clStep: "label",
  },
  "waterproof-push-buttons": {
    basePath: "/Waterproof Push Buttons/COMPLETED DEVICE",
    colourMap: {
      "1": "RED",
      "3": "GREEN",
      "5": "YELLOW",
      "7": "WHITE",
      "9": "BLUE",
      "E": "ORANGE",
    },
    colourStep: "housingColour",
    clStep: "label",
  },
  "waterproof-reset-call-point": {
    basePath: "/Waterproof ReSet Call Point/COMPLETED DEVICE",
    colourMap: {
      "R": "RED",
      "G": "GREEN",
      "Y": "YELLOW",
      "W": "WHITE",
      "B": "BLUE",
      "O": "ORANGE",
    },
    colourStep: "colour",
    clStep: "label",
  },
  "g3-multipurpose-push-button": {
    basePath: "/G3 Multipurpose Push Button/COMPLETED DEVICE",
    colourMap: {
      "0": "RED",
      "1": "GREEN",
      "2": "YELLOW",
      "3": "WHITE",
      "4": "BLUE",
      "5": "ORANGE",
    },
    colourStep: "colour",
  },
  "universal-stopper": {
    basePath: "/Universal Stopper/COMPLETED DEVICE",
    colourMap: {
      "FR": "RED",
      "NR": "RED",
      "CR": "RED",
      "EG": "GREEN",
      "NG": "GREEN",
      "CG": "GREEN",
      "NC": "CLEAR",
      "NK": "BLACK",
      "CK": "BLACK",
      "NB": "BLUE",
      "CB": "BLUE",
      "NW": "WHITE",
      "CW": "WHITE",
      "NY": "YELLOW",
      "CY": "YELLOW",
    },
    colourStep: "colourLabel",
  },
  "gf-fire-alarm-push-button": {
    basePath: "/GF Fire Alarm Push Button/COMPLETED DEVICE",
    colourMap: {
      "A": "RED",
      "C": "RED",
    },
    colourStep: "model",
  },
};

export function getCompletedDeviceImage({
  fullCode,
  modelId,
  config,
  isComplete,
}: GetCompletedDeviceImageParams): CompletedDeviceImageResult {
  
  if (!isComplete) {
    return {
      imagePath: null,
      reason: "Configuration is not complete",
    };
  }

  const modelConfig = MODEL_CONFIG[modelId];
  
  if (!modelConfig) {
    return {
      imagePath: null,
      reason: `Model "${modelId}" does not have completed device images yet`,
    };
  }

  if (modelId === "stopper-stations") {
    if (config.language === "ZL") {
      return {
        imagePath: null,
        reason: "ZL language variants do not have preview images",
      };
    }

    if (config.cover === "2") {
      return {
        imagePath: null,
        reason: "Shield cover variants do not have preview images",
      };
    }
  }

  const colourValue = config[modelConfig.colourStep] ?? "";
  const colourFolder = modelConfig.colourMap[colourValue];
  
  if (!colourFolder) {
    return {
      imagePath: null,
      reason: `Colour "${colourValue}" does not have completed device images yet`,
    };
  }

  const hasCL = modelConfig.clStep && config[modelConfig.clStep] === "CL";
  const fileName = hasCL ? `${fullCode}-CL` : fullCode;
  const imagePath = `${modelConfig.basePath}/${colourFolder}/${fileName}.webp`;

  return {
    imagePath,
  };
}

export function canHaveCompletedDeviceImage(
  modelId: ModelId,
  config: Configuration
): boolean {
  const modelConfig = MODEL_CONFIG[modelId];
  
  if (!modelConfig) {
    return false;
  }

  if (modelId === "stopper-stations") {
    if (config.language === "ZL") {
      return false;
    }
    if (config.cover === "2") {
      return false;
    }
  }

  const colourValue = config[modelConfig.colourStep] ?? "";
  const colourFolder = modelConfig.colourMap[colourValue];
  
  if (!colourFolder) {
    return false;
  }

  return true;
}