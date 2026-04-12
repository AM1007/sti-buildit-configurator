export type {
  ConfiguratorMeta,
  ColourId,
  FeatureId,
  ProductTag,
  PrimaryTag,
  FunctionalTag,
} from './types'

export { g3MultipurposePushButtonMeta } from './g3MultipurposePushButton'
export { stopperStationsMeta } from './stopperStations'
export { universalStopperMeta } from './universalStopper'
export { gfFireAlarmPushButtonMeta } from './gfFireAlarmPushButton'
export { lowProfileUniversalStopperMeta } from './lowProfileUniversalStopper'
export { globalResetMeta } from './globalReset'
export { resetCallPointsMeta } from './resetCallPoints'
export { waterproofResetCallPointMeta } from './waterproofResetCallPoint'
export { enviroStopperMeta } from './enviroStopper'
export { indoorPushButtonsMeta } from './indoorPushButtons'
export { keySwitchesMeta } from './keySwitches'
export { waterproofPushButtonsMeta } from './waterproofPushButtons'
export { callPointStopperMeta } from './callPointStopper'
export { enviroArmourMeta } from './enviroArmour'
export { euroStopperMeta } from './euroStopper'
export { stopperIIMeta } from './stopperII'

import type { ConfiguratorMeta } from './types'
import { g3MultipurposePushButtonMeta } from './g3MultipurposePushButton'
import { stopperStationsMeta } from './stopperStations'
import { universalStopperMeta } from './universalStopper'
import { gfFireAlarmPushButtonMeta } from './gfFireAlarmPushButton'
import { lowProfileUniversalStopperMeta } from './lowProfileUniversalStopper'
import { globalResetMeta } from './globalReset'
import { resetCallPointsMeta } from './resetCallPoints'
import { waterproofResetCallPointMeta } from './waterproofResetCallPoint'
import { enviroStopperMeta } from './enviroStopper'
import { indoorPushButtonsMeta } from './indoorPushButtons'
import { keySwitchesMeta } from './keySwitches'
import { waterproofPushButtonsMeta } from './waterproofPushButtons'
import { callPointStopperMeta } from './callPointStopper'
import { enviroArmourMeta } from './enviroArmour'
import { euroStopperMeta } from './euroStopper'
import { stopperIIMeta } from './stopperII'

export const allConfigurators: ConfiguratorMeta[] = [
  g3MultipurposePushButtonMeta,
  stopperStationsMeta,
  globalResetMeta,
  resetCallPointsMeta,
  waterproofResetCallPointMeta,
  gfFireAlarmPushButtonMeta,
  indoorPushButtonsMeta,
  keySwitchesMeta,
  waterproofPushButtonsMeta,
  euroStopperMeta,
  universalStopperMeta,
  lowProfileUniversalStopperMeta,
  enviroStopperMeta,
  callPointStopperMeta,
  enviroArmourMeta,
  stopperIIMeta,
]

export function getConfiguratorBySlug(slug: string): ConfiguratorMeta | undefined {
  return allConfigurators.find((c) => c.slug === slug)
}

export function getAllConfiguratorIds(): string[] {
  return allConfigurators.map((c) => c.id)
}
