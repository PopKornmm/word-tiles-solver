'use strict';

const fs = require('fs');
const path = require('path');

// Standard tile values. Blanks score 0, handled in the search itself.
const SCORES = {
  a: 1, b: 3, c: 3, d: 2, e: 1, f: 4, g: 2, h: 4, i: 1, j: 8, k: 5,
  l: 1, m: 3, n: 1, o: 1, p: 3, q: 10, r: 1, s: 1, t: 1, u: 1, v: 4,
  w: 4, x: 8, y: 4, z: 10
};

function scoreWord(word) {
  let s = 0;
  for (let i = 0; i < word.length; i++) s += SCORES[word[i]] || 0;
  return s;
}

/** Load the bundled ENABLE word list (public domain). */
function loadWordList() {
  const raw = fs.readFileSync(path.join(__dirname, 'words.txt'), 'utf8');
  return raw.split('\n').map(w => w.trim()).filter(Boolean);
}

class WordSolver {
  /**
   * @param {string[]} words lowercase a-z words. Anything else is skipped.
   */
  constructor(words) {
    this.root = { kids: Object.create(null), word: null };
    // Two indexes on purpose: the trie answers "what can I build from this
    // rack", the anagram map answers "exact rearrangements of these letters".
    // I first tried doing anagrams through the trie and it was both slower
    // and uglier than a sorted-key lookup.
    this.byKey = new Map();
    this.byLen = new Map();

    for (const w of words) {
      if (!/^[a-z]+$/.test(w) || w.length < 2) continue;
      let node = this.root;
      for (const ch of w) {
        node = node.kids[ch] || (node.kids[ch] = { kids: Object.create(null), word: null });
      }
      node.word = w;

      const key = w.split('').sort().join('');
      const bucket = this.byKey.get(key);
      if (bucket) bucket.push(w); else this.byKey.set(key, [w]);

      const lenBucket = this.byLen.get(w.length);
      if (lenBucket) lenBucket.push(w); else this.byLen.set(w.length, [w]);
    }
  }

  /**
   * Every word makeable from a rack of letters. Use ? for a blank tile.
   * Returns [{ word, score }] sorted by score desc, then alphabetically.
   * Blank tiles contribute 0 to the score; if a word can be made with or
   * without a blank, you get the better (real letters) score.
   */
  fromRack(rack, opts) {
    const minLength = (opts && opts.minLength) || 2;
    const counts = Object.create(null);
    let blanks = 0;
    for (const ch of String(rack).toLowerCase()) {
      if (ch === '?') blanks++;
      else if (ch >= 'a' && ch <= 'z') counts[ch] = (counts[ch] || 0) + 1;
    }

    const best = new Map(); // word -> best score
    const walk = (node, score, blanksLeft) => {
      if (node.word && node.word.length >= minLength) {
        const prev = best.get(node.word);
        if (prev === undefined || score > prev) best.set(node.word, score);
      }
      for (const ch in node.kids) {
        if (counts[ch] > 0) {
          counts[ch]--;
          walk(node.kids[ch], score + SCORES[ch], blanksLeft);
          counts[ch]++;
        }
        // Fair warning: every blank roughly multiplies the branching by 26.
        // One blank is instant, two you can feel, three is your own fault.
        if (blanksLeft > 0) {
          walk(node.kids[ch], score, blanksLeft - 1);
        }
      }
    };
    walk(this.root, 0, blanks);

    const out = [];
    for (const [word, score] of best) out.push({ word, score });
    out.sort((a, b) => (b.score - a.score) || (a.word < b.word ? -1 : 1));
    return out;
  }

  /**
   * Exact anagrams of the given letters (same letters, same count).
   * No blank support here; go through fromRack if you need that.
   */
  anagrams(letters) {
    const clean = String(letters).toLowerCase().replace(/[^a-z]/g, '');
    if (!clean) return [];
    const hits = this.byKey.get(clean.split('').sort().join('')) || [];
    return hits.filter(w => w !== clean);
  }

  /**
   * Fixed-length pattern search, ? matches any letter. "c??e" finds cafe,
   * cage, cake... Linear scan over the matching length bucket, which is
   * plenty for interactive use.
   */
  pattern(pat) {
    const p = String(pat).toLowerCase();
    if (!/^[a-z?]+$/.test(p)) return [];
    const bucket = this.byLen.get(p.length) || [];
    const out = [];
    for (const w of bucket) {
      let ok = true;
      for (let i = 0; i < p.length; i++) {
        if (p[i] !== '?' && p[i] !== w[i]) { ok = false; break; }
      }
      if (ok) out.push(w);
    }
    return out;
  }

  /** Is this exact word in the dictionary? */
  has(word) {
    const w = String(word).toLowerCase();
    let node = this.root;
    for (const ch of w) {
      node = node.kids[ch];
      if (!node) return false;
    }
    return node.word === w;
  }
}

module.exports = { WordSolver, loadWordList, scoreWord, SCORES };
