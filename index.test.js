'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { WordSolver, loadWordList, scoreWord, SCORES } = require('./index.js');

const WORDS = [
  'star', 'rats', 'tars', 'arts', 'tsar', 'sate', 'tease',
  'cave', 'cove', 'core', 'care', 'cafe',
  'night', 'light', 'ovation', 'nova',
  'zzz',            // not a real word but valid a-z, should be indexed
  'Bad-Entry', 'x', // should both be skipped: non a-z, single letter
];
const solver = new WordSolver(WORDS);

test('constructor skips invalid entries', () => {
  assert.equal(solver.has('x'), false);
  assert.equal(solver.has('bad-entry'), false);
  assert.equal(solver.has('zzz'), true);
});

test('scoreWord uses standard tile values', () => {
  assert.equal(scoreWord('quartz'), 24);
  assert.equal(scoreWord('a'), SCORES.a);
  assert.equal(scoreWord(''), 0);
});

test('fromRack finds every buildable word, best score first', () => {
  const words = solver.fromRack('aetrs').map(r => r.word);
  for (const w of ['star', 'rats', 'tars', 'arts', 'tsar', 'sate']) {
    assert.ok(words.includes(w), w + ' should be buildable from aetrs');
  }
  assert.ok(!words.includes('tease'), 'tease needs two e, rack has one');
  const scores = solver.fromRack('aetrs').map(r => r.score);
  const sorted = [...scores].sort((a, b) => b - a);
  assert.deepEqual(scores, sorted, 'results sorted by score desc');
});

test('fromRack blanks: score 0, enable missing letters', () => {
  const res = solver.fromRack('aetrs?');
  const tease = res.find(r => r.word === 'tease');
  assert.ok(tease, 'blank supplies the second e');
  assert.equal(tease.score, scoreWord('tease') - SCORES.e, 'blank letter scores 0');
  const care = res.find(r => r.word === 'care');
  assert.ok(care, 'blank supplies the c');
  assert.equal(care.score, scoreWord('care') - SCORES.c);
});

test('fromRack minLength and maxResults options', () => {
  for (const r of solver.fromRack('aetrs', { minLength: 5 })) {
    assert.ok(r.word.length >= 5);
  }
  assert.equal(solver.fromRack('aetrs', { maxResults: 3 }).length, 3);
});

test('anagrams: exact rearrangements, input excluded', () => {
  const a = solver.anagrams('star');
  assert.deepEqual([...a].sort(), ['arts', 'rats', 'tars', 'tsar']);
  assert.ok(!a.includes('star'));
  assert.deepEqual(solver.anagrams(''), []);
});

test('pattern: fixed length, ? wildcard', () => {
  assert.deepEqual([...solver.pattern('c??e')].sort(), ['cafe', 'care', 'cave', 'core', 'cove']);
  assert.deepEqual(solver.pattern('c?e'), []);
  assert.deepEqual(solver.pattern('not a pattern!'), []);
});

test('lookup: starts, ends, contains, minLength', () => {
  assert.deepEqual([...solver.lookup('ca', { kind: 'starts' })].sort(),
    ['cafe', 'care', 'cave']);
  assert.deepEqual([...solver.lookup('ight', { kind: 'ends' })].sort(),
    ['light', 'night']);
  assert.deepEqual([...solver.lookup('ova')].sort(),
    ['nova', 'ovation'], 'contains is the default kind');
  assert.deepEqual(solver.lookup('ova', { kind: 'contains', minLength: 5 }),
    ['ovation']);
  assert.deepEqual(solver.lookup(''), []);
  assert.deepEqual(solver.lookup('123'), []);
});

test('has: exact membership only', () => {
  assert.equal(solver.has('star'), true);
  assert.equal(solver.has('sta'), false, 'prefixes are not words');
  assert.equal(solver.has('STAR'), true, 'lookup is case insensitive');
});

test('loadWordList returns the bundled ENABLE list', () => {
  const list = loadWordList();
  assert.ok(Array.isArray(list));
  assert.ok(list.length > 100000, 'ENABLE has 172k words');
  assert.ok(list.includes('zephyr'));
});
