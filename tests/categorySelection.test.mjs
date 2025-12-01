import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveSelectionId, normalizeOptionalValue } from '../src/lib/categorySelection.js';

test('resolveSelectionId prioritizes deepest selection', () => {
  assert.equal(resolveSelectionId('root', '', ''), 'root');
  assert.equal(resolveSelectionId('root', 'sub', ''), 'sub');
  assert.equal(resolveSelectionId('root', 'sub', 'subsub'), 'subsub');
});

test('resolveSelectionId returns empty when nothing selected', () => {
  assert.equal(resolveSelectionId('', '', ''), '');
});

test('normalizeOptionalValue maps none to empty', () => {
  assert.equal(normalizeOptionalValue('none'), '');
  assert.equal(normalizeOptionalValue('abc'), 'abc');
});
