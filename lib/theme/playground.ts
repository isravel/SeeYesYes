import type { Appearance, Theme } from '@/lib/contract/schema';

/** Session-only changes layered over the applied theme. An empty object means "exactly the applied theme". */
export type PlaygroundOverrides = {
  radius?: Theme['radius']; density?: Theme['density']; shadows?: Theme['shadows']; motion?: Theme['motion'];
  surface?: Theme['effects']['surface']; scale?: Theme['typography']['scale'];
};
export type PlaygroundAppearance = Appearance | null;

/** The theme the Playground preview uses. The applied theme is never modified. */
export function playgroundTheme(applied: Theme, overrides: PlaygroundOverrides): Theme {
  const { surface, scale, ...simple } = overrides;
  return {
    ...applied, ...simple,
    effects: { ...applied.effects, ...(surface ? { surface } : {}) },
    typography: { ...applied.typography, ...(scale ? { scale } : {}) },
  };
}

export const hasOverrides = (overrides: PlaygroundOverrides, appearance: PlaygroundAppearance) => Object.keys(overrides).length > 0 || appearance !== null;
