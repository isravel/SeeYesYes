/** The shortest password the auth templates accept. Consumers may require more, never less, and enforce their real policy on the server. */
export const MIN_PASSWORD_LENGTH = 8;

export type FieldProblem = 'required' | 'invalid' | 'short';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The minimum a form enforces: the baseline, or a stronger value the consumer asked for. Anything weaker or not a number falls back to the baseline. */
export const effectiveMinimum = (requested?: number): number =>
  requested !== undefined && Number.isFinite(requested) ? Math.max(MIN_PASSWORD_LENGTH, Math.floor(requested)) : MIN_PASSWORD_LENGTH;

/** A quick shape check, not proof that the address exists or belongs to the person. Surrounding spaces are ignored. */
export const emailProblem = (value: string): FieldProblem | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return 'required';
  return EMAIL.test(trimmed) ? undefined : 'invalid';
};

export const nameProblem = (value: string): FieldProblem | undefined => (value.trim() ? undefined : 'required');

/**
 * Passwords are never trimmed or changed. With `minimum` the length is counted in characters (not UTF-16 units) against the baseline or stronger value; without it only an empty value is a problem, so sign-in never rejects an older, shorter password.
 */
export const passwordProblem = (value: string, minimum?: number): FieldProblem | undefined => {
  if (value === '') return 'required';
  if (minimum !== undefined && [...value].length < effectiveMinimum(minimum)) return 'short';
  return undefined;
};
