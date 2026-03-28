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
