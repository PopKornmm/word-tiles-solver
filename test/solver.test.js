'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { WordSolver, loadWordList, scoreWord } = require('..');

const TOY = [
  'cat', 'act', 'at', 'ta', 'car', 'arc', 'care', 'race', 'acre',
  'cafe', 'cage', 'cake', 'case', 'cave', 'quart', 'quartz', 'zoo'
];
const solver = new WordSolver(TOY);

test('fromRack finds every buildable word', () => {
  const words = solver.fromRack('tac').map(r => r.word);
  assert.deepStrictEqual(words.sort(), ['act', 'at', 'cat', 'ta']);
});

test('fromRack respects minLength', () => {
  const words = solver.fromRack('tac', { minLength: 3 }).map(r => r.word);
  assert.deepStrictEqual(words.sort(), ['act', 'cat']);
});

test('fromRack sorts by score then alphabetically', () => {
  const words = solver.fromRack('care', { minLength: 3 }).map(r => r.word);
  // acre/care/race all score 6, then arc/car at 5, each group alphabetical
  assert.deepStrictEqual(words, ['acre', 'care', 'race', 'arc', 'car']);
});

test('blank tile fills any letter and scores 0', () => {
  const res = solver.fromRack('ca?');
  const words = res.map(r => r.word);
  assert.ok(words.includes('cat'));
  assert.ok(words.includes('car'));
  const cat = res.find(r => r.word === 'cat');
  // c(3) + a(1) + blank(0)
  assert.strictEqual(cat.score, 4);
});

test('real letters win over blanks for scoring', () => {
  // 'cat?' can build cat with real letters (5) or with the blank (4).
  const cat = solver.fromRack('cat?').find(r => r.word === 'cat');
  assert.strictEqual(cat.score, 5);
});

test('anagrams returns exact rearrangements, input excluded', () => {
  assert.deepStrictEqual(solver.anagrams('care').sort(), ['acre', 'race']);
  assert.deepStrictEqual(solver.anagrams('zoo'), []);
});

test('pattern search with ? wildcards', () => {
  const hits = solver.pattern('ca?e');
  assert.deepStrictEqual(hits.sort(), ['cafe', 'cage', 'cake', 'care', 'case', 'cave']);
});

test('pattern rejects garbage input', () => {
  assert.deepStrictEqual(solver.pattern('c4$e'), []);
});

test('has() is exact membership', () => {
  assert.strictEqual(solver.has('quartz'), true);
  assert.strictEqual(solver.has('quart'), true);
  assert.strictEqual(solver.has('quar'), false);
});

test('scoreWord matches tile values', () => {
  assert.strictEqual(scoreWord('quartz'), 24);
  assert.strictEqual(scoreWord('cat'), 5);
});

// Regression: words with repeated letters must not be buildable from a rack
// holding only one copy of that letter.
test('letter counts are respected', () => {
  const s = new WordSolver(['moo', 'mo']);
  const words = s.fromRack('mo').map(r => r.word);
  assert.deepStrictEqual(words, ['mo']);
});

test('smoke test on the bundled ENABLE list', () => {
  const words = loadWordList();
  assert.ok(words.length > 170000);
  const big = new WordSolver(words);
  assert.ok(big.has('zyzzyva'));
  const res = big.fromRack('aetrs');
  assert.ok(res.length > 50);
  assert.ok(res.every(r => r.word.length >= 2));
});
