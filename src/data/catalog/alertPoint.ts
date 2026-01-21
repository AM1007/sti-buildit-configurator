import type { ConfiguratorMeta } from "./types";

export const alertPointMeta: ConfiguratorMeta = {
  id: "alert-point",
  slug: "alert-point",
  name: "Alert Point",
  description: "Standalone Alarm Device Signals an Emergency",
  imagePath: "/Configurators/13_Alert Point.webp",
  features: ["sound"],
  colours: ["red", "blue", "green", "white"],
  isImplemented: true,
};