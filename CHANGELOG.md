# Changelog

Versions before 1.0.0 were internal, from before the public release.

## 1.0.1

- fromRack accepts a maxResults option to cap the returned list, handy
  when you only want the top scoring words
- added the homepage field to package.json (was missing from 1.0.0)

## 1.0.0

- exact anagram lookup through a sorted-letter key map (the trie was the
  wrong tool for this, see the comment in index.js)
- bundled the ENABLE list and added loadWordList()
- browser demo
- docs

## 0.3.0

- pattern search (fixed length, ? wildcard)
- fixed blank scoring: blanks were scoring their letter value, they now
  score 0 like they should
- fromRack now keeps the best score when a word is reachable both with and
  without a blank

## 0.2.0

- blank tile support (? in the rack)

## 0.1.0

- trie build, rack search, tile scoring
