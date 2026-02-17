import type { ConfiguratorMeta } from "./types";

export const resetCallPointsMeta: ConfiguratorMeta = {
  id: "reset-call-points",
  slug: "reset-call-points",
  name: "ReSet Call Points",
  description: "Manual Call Point With Re-settable Operating Element",
  imagePath: "/Configurators/07_ReSet Call Points.webp",
  colours: ["yellow", "red", "white", "green", "blue", "orange"],
  tags: ["call-point", "fire-alarm", "reset-device"],
  isImplemented: true,
};