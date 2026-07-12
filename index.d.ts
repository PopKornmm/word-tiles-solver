/** Standard tile values, a to z. Blanks score 0 (handled by the search). */
export const SCORES: Record<string, number>;

/** Sum of standard tile values for a word. Unknown characters score 0. */
export function scoreWord(word: string): number;

/** The bundled ENABLE word list (public domain) as an array. */
export function loadWordList(): string[];

export interface FromRackOptions {
  /** Skip words shorter than this. Default 2. */
  minLength?: number;
  /** Cap the returned list. Default 0 (no cap). */
  maxResults?: number;
}

export interface RackResult {
  word: string;
  score: number;
}

export interface LookupOptions {
  /** 'starts', 'ends' or 'contains'. Default 'contains'. */
  kind?: 'starts' | 'ends' | 'contains';
  /** Skip words shorter than this. Default 2. */
  minLength?: number;
}

export class WordSolver {
  /** Lowercase a-z words. Anything else, or single letters, is skipped. */
  constructor(words: string[]);

  /**
   * Every word makeable from a rack of letters. Use ? for a blank tile.
   * Sorted by score desc, then alphabetically. Blanks score 0; if a word is
   * buildable with and without a blank you get the better score.
   */
  fromRack(rack: string, opts?: FromRackOptions): RackResult[];

  /** Exact rearrangements only (same letters, same counts), input excluded. */
  anagrams(letters: string): string[];

  /** Fixed-length pattern, ? matches any letter. "c??e" finds cafe, cage... */
  pattern(pat: string): string[];

  /** Dictionary search by fragment: prefix, suffix or substring. */
  lookup(fragment: string, opts?: LookupOptions): string[];

  /** Is this exact word in the dictionary? */
  has(word: string): boolean;
}
