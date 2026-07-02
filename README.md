# word-tiles-solver

Word solver for tile games. Give it a rack of letters and it returns every
word you can build, with support for blank tiles, exact anagrams, pattern
search and standard tile scoring. Trie based, no dependencies, ships with the
public domain ENABLE word list (172k words).

I wrote this while building player tools for
[Solving Wordscapes](https://www.solvingwordscapes.com/). The rack-in,
words-out part was generic enough to publish on its own.

## Install

```
npm install word-tiles-solver
```

## Usage

```js
const { WordSolver, loadWordList, scoreWord } = require('word-tiles-solver');

const solver = new WordSolver(loadWordList());

solver.fromRack('aetrs');
// [{ word: 'aster', score: 5 }, { word: 'rates', score: 5 }, ...]

solver.fromRack('aetr?');            // ? is a blank tile
solver.fromRack('aetrs', { minLength: 4 });

solver.anagrams('listen');           // ['enlist', 'silent', 'tinsel', ...]
solver.pattern('c??e');              // ['cafe', 'cage', 'cake', ...]
solver.has('quartz');                // true
scoreWord('quartz');                 // 24
```

You can pass your own word list instead of the bundled one; anything that is
not lowercase a-z, or is a single letter, gets skipped:

```js
const solver = new WordSolver(['cat', 'act', 'tacocat']);
```

## API

- `new WordSolver(words)` builds the indexes once (about a second for the
  full ENABLE list on a normal machine). Reuse the instance.
- `solver.fromRack(rack, { minLength })` returns `[{ word, score }]`, best
  score first. Blanks (`?` in the rack) score 0; if a word is buildable both
  with and without a blank you get the better score.
- `solver.anagrams(letters)` exact rearrangements only, input word excluded.
  Does not take blanks; go through `fromRack` and filter by length if you
  need that.
- `solver.pattern(p)` fixed length, `?` matches any letter.
- `solver.has(word)` exact membership.
- `loadWordList()` the bundled ENABLE list as an array.
- `scoreWord(word)` standard tile values.

## Notes and limitations

- Blanks get expensive fast. Each one multiplies the search branching by
  roughly 26. One blank is instant, two is noticeably slower, more than that
  and you asked for it.
- `pattern()` is a linear scan over words of the right length. Fine for
  interactive use, not meant for millions of calls in a loop.
- There is no board logic at all: no premium squares, no placement, no
  crossword constraints. This solves racks, not boards.
- The bundled list is ENABLE. It is public domain and solid for word games,
  but it is not the official list of any specific game, so a word being here
  does not guarantee a given game accepts it.
- No TypeScript definitions yet.

## Demo

A small browser demo lives in `demo/`. It embeds a standalone copy of the
solver and loads the word list over fetch, so it runs on any static host.

## License

MIT. The ENABLE word list itself is public domain.
