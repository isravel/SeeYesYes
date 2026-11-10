import { createContext } from 'react';

/**
 * True inside a surface that already blurs what is behind it (a glass Card or Dialog).
 * Browsers only let a backdrop filter see content outside its nearest filtered ancestor, so a glass Card nested in one
 * could not blur the page anyway and would only add paint cost. Nested glass keeps its tint and edge and drops the blur.
 */
export const GlassLayerContext = createContext(false);
