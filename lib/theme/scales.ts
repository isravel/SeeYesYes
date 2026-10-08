/** Named numeric scales. Token definitions select these; consumers use semantic CSS variables. */
export const spacingSteps = { 1: 0.25, 2: 0.5, 3: 0.75, 4: 1, 6: 1.5, 8: 2, 12: 3, 16: 4, 24: 6 } as const;
export const spacingScale = {
  compact: { inline: .375, 'control-block': .5, 'control-inline': .75, stack: .75, section: 2, 'row-height': 2.75 },
  comfortable: { inline: .5, 'control-block': .625, 'control-inline': 1, stack: 1, section: 2.5, 'row-height': 3 },
  spacious: { inline: .75, 'control-block': .875, 'control-inline': 1.25, stack: 1.5, section: 3, 'row-height': 3.5 },
} as const;
export const radiusScale = { sharp: 0, soft: .5, curvy: 1 } as const;
export const typeScale = { small: .875, default: 1, large: 1.125 } as const;
export const typeSizes = { body: 1, label: .875, caption: .75, heading: 1.5, title: 2, display: 3.875 } as const;
