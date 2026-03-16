const SKU_PREFIX_MAP: Record<string, string> = {
  'g3-multipurpose-push-button': 'G3',
  'stopper-stations': 'SS2',
  'universal-stopper': 'STI',
  'gf-fire-alarm-push-button': 'GF',
  'low-profile-universal-stopper': 'STI-LP',
  'global-reset': 'GLR',
  'reset-call-points': 'RP',
  'waterproof-reset-call-point': 'WRP2',
  'enviro-stopper': 'STI-ES',
  'indoor-push-buttons': 'SS3',
  'key-switches': 'SS3-K',
  'waterproof-push-buttons': 'WSS3',
  'call-point-stopper': 'STI-69',
  'enviro-armour': 'EA',
  'euro-stopper': 'STI-15',
}

export function getSkuPrefix(slug: string): string {
  return SKU_PREFIX_MAP[slug] ?? slug.toUpperCase()
}
