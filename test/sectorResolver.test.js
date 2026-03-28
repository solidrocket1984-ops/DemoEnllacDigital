import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveSectorId } from '../src/lib/sectorResolver.js';

test('resolveSectorId prioritizes route', () => {
  assert.equal(resolveSectorId({ routeSector: 'clinic', querySector: 'tourism', selectedSector: 'winery' }), 'clinic');
});

test('resolveSectorId fallback to settings and neutral', () => {
  assert.equal(resolveSectorId({ settings: [{ key: 'default_sector', value: 'tourism' }] }), 'tourism');
  assert.equal(resolveSectorId({ routeSector: 'unknown', defaultSector: 'neutral' }), 'neutral');
});
