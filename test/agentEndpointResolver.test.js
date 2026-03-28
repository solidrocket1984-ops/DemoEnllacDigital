import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveAgentConfig } from '../src/lib/agentEndpointResolver.js';

test('resolveAgentConfig creates v1 and chat fallback', () => {
  const config = resolveAgentConfig({ settings: [{ key: 'agent_endpoint_url', value: 'https://a.test' }] });
  assert.deepEqual(config.urls, ['https://a.test/v1/chat', 'https://a.test/chat']);
});
