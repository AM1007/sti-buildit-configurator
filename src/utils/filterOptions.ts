import type { Option, Configuration } from "../types";

export function isOptionAvailable(
  option: Option,
  config: Configuration
): boolean {
  if (!option.availableFor) {
    return true;
  }

  if (!config.colour) {
    return false;
  }

  return option.availableFor.includes(config.colour);
}

export function filterAvailableOptions(
  options: Option[],
  config: Configuration
): Option[] {
  return options.filter((option) => isOptionAvailable(option, config));
}

export function isSelectionStillValid(
  optionId: string | null,
  options: Option[],
  config: Configuration
): boolean {
  if (!optionId) {
    return true;
  }

  const option = options.find((o) => o.id === optionId);

  if (!option) {
    return false;
  }
  
  return isOptionAvailable(option, config);
}