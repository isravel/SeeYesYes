/**
 * Height, in pixels, for a textarea that grows with its content.
 * - `needed`: content height including borders.
 * - `natural`: the height its `rows` produce, which is the smallest it ever shrinks to.
 * - `floor`: a taller height the reader dragged it to; the field never shrinks below it while they keep it there.
 * - `max`: the height that `maxRows` allows. Beyond it the field scrolls instead of growing.
 */
export function fitHeight(input: { needed: number; natural: number; floor: number; max: number }): { height: number; scrolls: boolean } {
  const { needed, natural, floor, max } = input;
  const limit = Math.max(max, natural);
  // A manual height above the limit is the reader's choice, so it wins over the maximum.
  const height = Math.max(Math.min(Math.max(needed, natural), limit), floor);
  return { height, scrolls: needed > height };
}

/** Pixel limit for `rows` lines of text, from computed metrics. Falls back to a 1.4 line height when `line-height: normal` yields NaN. */
export function maxHeightForRows(rows: number, metrics: { lineHeight: number; fontSize: number; paddingY: number; border: number }): number {
  const line = Number.isFinite(metrics.lineHeight) && metrics.lineHeight > 0 ? metrics.lineHeight : metrics.fontSize * 1.4;
  return Math.max(1, rows) * line + metrics.paddingY + metrics.border;
}
