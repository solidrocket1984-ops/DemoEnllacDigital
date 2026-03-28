import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDemoSearchParams } from '../src/lib/demoState.js';

test('buildDemoSearchParams keeps route mode stable and removes sector query', () => {
  const result = buildDemoSearchParams({
    currentSearch: new URLSearchParams('sector=clinic&account=a'),
    routeSector: 'winery',
    activeSectorId: 'winery',
    activeAccountSlug: 'b',
    sourceType: 'base44',
  });

  assert.equal(result.changed, true);
  assert.equal(result.next.get('sector'), null);
  assert.equal(result.next.get('account'), 'b');
  assert.equal(result.next.get('source'), 'base44');
});

test('buildDemoSearchParams keeps query mode stable and avoids loops', () => {
  const result = buildDemoSearchParams({
    currentSearch: new URLSearchParams('sector=clinic&account=demo&source=sector_demo'),
    routeSector: null,
    activeSectorId: 'clinic',
    activeAccountSlug: 'demo',
    sourceType: 'sector_demo',
  });

  assert.equal(result.changed, false);
  assert.equal(result.next.toString(), 'sector=clinic&account=demo&source=sector_demo');
});
