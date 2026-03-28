import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAgentPayload } from '../src/lib/agentPayload.js';

test('buildAgentPayload normalizes list fields and empty email', () => {
  const payload = buildAgentPayload({
    lang: 'es',
    scenario: 'libre',
    sector: 'winery',
    account: {
      nombre: 'Demo',
      slug: 'demo',
      faqs_texto: '- uno\n- dos',
      reglas_recomendacion: 'a\nb',
      reglas_objeciones: ['x', 'y'],
    },
    experiences: [{ id: '1', nombre_es: 'Visita', descripcion_es: 'Desc' }],
    messages: [{ role: 'user', content: 'hola' }],
    lead: { email: '   ' },
  });

  assert.deepEqual(payload.winery.faqs, ['uno', 'dos']);
  assert.deepEqual(payload.winery.recommendation_rules, ['a', 'b']);
  assert.deepEqual(payload.winery.objection_rules, ['x', 'y']);
  assert.equal(payload.lead.email, null);
  assert.equal(payload.experiences[0].title, 'Visita');
});

test('buildAgentPayload builds metadata for sector generic demo', () => {
  const payload = buildAgentPayload({
    lang: 'es',
    scenario: 'libre',
    sector: 'professional_services',
    sourceType: 'sector_demo',
    account: {
      id: 'sector-demo-professional-services',
      nombre: 'Nexia Advisory (Demo)',
      slug: 'sector-demo-professional-services',
      sector: 'professional_services',
      is_generic_sector_demo: true,
      faqs_texto: ['¿Trabajáis con pymes?'],
      reglas_recomendacion: ['Si no hay diagnóstico, auditoría inicial.'],
      reglas_objeciones: ['Si hay urgencia, formato sprint.'],
      prompts_sugeridos: ['Necesito asesoramiento'],
    },
    experiences: [{ id: 'ps-audit', nombre: 'Auditoría inicial', descripcion: 'Desc' }],
    messages: [{ role: 'user', content: 'Quiero ayuda' }],
  });

  assert.equal(payload.metadata.source_type, 'sector_demo');
  assert.equal(payload.metadata.sector, 'professional_services');
  assert.equal(payload.metadata.account_slug, 'sector-demo-professional-services');
  assert.equal(payload.metadata.is_generic_sector_demo, true);
  assert.equal(payload.businessContext.sourceType, 'sector_demo');
  assert.equal(payload.offers[0].id, 'ps-audit');
});
