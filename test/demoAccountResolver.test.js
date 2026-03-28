import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveDemoAccount } from '../src/lib/demoAccountResolver.js';

const accounts = [
  { id: 1, slug: 'a', nombre: 'A', activa: true, demo_publica: true, sector: 'winery', prioridad_demo: 20 },
  { id: 2, slug: 'b', nombre: 'B', activa: true, demo_publica: false, sector: 'winery', prioridad_demo: 1 },
  { id: 3, slug: 'c', nombre: 'C', activa: true, demo_publica: true, sector: 'clinic', prioridad_demo: 1 },
];

test('resolveDemoAccount explicit account', () => {
  const result = resolveDemoAccount({ accounts, activeSector: 'winery', requestedAccountSlug: 'a' });
  assert.equal(result.account.slug, 'a');
});

test('resolveDemoAccount uses sector public fallback', () => {
  const result = resolveDemoAccount({ accounts, activeSector: 'winery' });
  assert.equal(result.account.slug, 'a');
});

test('resolveDemoAccount ignores stale explicit slug from another sector', () => {
  const result = resolveDemoAccount({ accounts, activeSector: 'clinic', selectedAccountSlug: 'a' });
  assert.equal(result.account.slug, 'c');
});

test('resolveDemoAccount picks default account per sector from settings', () => {
  const result = resolveDemoAccount({
    accounts,
    activeSector: 'winery',
    settings: [{ key: 'default_demo_account_winery', value: 'b' }],
  });
  assert.equal(result.account.slug, 'b');
});
