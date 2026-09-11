export class GrftiError extends Error {
  readonly input: string;
  readonly suggestions: readonly string[];

  constructor(message: string, input: string, suggestions: readonly string[] = []) {
    const hint = suggestions.length > 0 ? ` Did you mean ${suggestions.join(', ')}?` : '';
    super(`${message}${hint}`);
    this.name = 'GrftiError';
    this.input = input;
    this.suggestions = suggestions;
  }
}

export const suggestFrom = (candidates: readonly string[], input: string): readonly string[] => {
  const needle = input.trim().toLowerCase();
  const prefix = needle.slice(0, 3);

  return candidates
    .filter((candidate) => candidate.includes(needle) || (prefix.length > 1 && candidate.startsWith(prefix)))
    .slice(0, 4);
};
