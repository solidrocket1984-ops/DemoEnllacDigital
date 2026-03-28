import test from 'node:test';
import assert from 'node:assert/strict';
import { textToList } from '../src/lib/textToList.js';

test('textToList keeps arrays and trims', () => {
  assert.deepEqual(textToList([' A ', '', '• B']), ['A', 'B']);
});

test('textToList parses multiline bullets', () => {
  assert.deepEqual(textToList('- Primera\n• Segunda\n3) Tercera'), ['Primera', 'Segunda', 'Tercera']);
});
