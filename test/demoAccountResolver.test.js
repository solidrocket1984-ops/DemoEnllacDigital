import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveDemoAccount, resolveDemoOffers } from '../src/lib/demoAccountResolver.js';

const accounts = [
  { id: 1, slug: 'oriol-rossell', nombre: 'Oriol Rossell', activa: true, demo_publica: true, sector: 'winery', prioridad_demo: 20 },
  { id: 2, slug: 'winery-pro', nombre: 'Winery PRO', activa: true, demo_publica: false, sector: 'winery', prioridad_demo: 1 },
  { id: 3, slug: 'clinic-real', nombre: 'Clinic Real', activa: true, demo_publica: true, sector: 'clinic', prioridad_demo: 1 },
];

test('resolveDemoAccount uses explicit real account when slug exists in active sector', () => {
  const result = resolveDemoAccount({ accounts, activeSector: 'winery', requestedAccountSlug: 'oriol-rossell' });
  assert.equal(result.account.slug, 'oriol-rossell');
  assert.equal(result.sourceType, 'base44');
});

test('resolveDemoAccount ignores stale explicit slug from another sector and uses sector real account', () => {
  const result = resolveDemoAccount({ accounts, activeSector: 'clinic', selectedAccountSlug: 'oriol-rossell' });
  assert.equal(result.account.slug, 'clinic-real');
  assert.equal(result.sourceType, 'base44');
});

test('resolveDemoAccount can force generic sector mode and avoid winery account for non-winery sector', () => {
  const result = resolveDemoAccount({
    accounts,
    activeSector: 'professional_services',
    forceSourceType: 'sector_demo',
  });

  assert.equal(result.sourceType, 'sector_demo');
  assert.equal(result.account.sector, 'professional_services');
  assert.notEqual(result.account.slug, 'oriol-rossell');
});

test('resolveDemoAccount respects per-sector default account from settings when using base44', () => {
  const result = resolveDemoAccount({
    accounts,
    activeSector: 'winery',
    settings: [{ key: 'default_demo_account_winery', value: 'winery-pro' }],
  });
  assert.equal(result.account.slug, 'winery-pro');
  assert.equal(result.sourceType, 'base44');
});

test('resolveDemoOffers returns sector generic offers when source type is sector_demo', () => {
  const accountResult = resolveDemoAccount({ activeSector: 'tourism', forceSourceType: 'sector_demo' });
  const offers = resolveDemoOffers({ sourceType: accountResult.sourceType, account: accountResult.account, activeSector: 'tourism' });

  assert.ok(offers.length >= 3);
  assert.match(offers[0].id, /^tour-/);
});
