import test from 'node:test';
import assert from 'node:assert/strict';
import { postToAgent } from '../src/lib/agentClient.js';

const baseConfig = { urls: ['https://agent.test/v1/chat', 'https://agent.test/chat'], timeoutMs: 5, token: 'abc' };

test('postToAgent maps Failed to fetch to NETWORK', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => { throw new TypeError('Failed to fetch'); };
  await assert.rejects(postToAgent({ agentConfig: baseConfig, payload: {}, requestId: 'r1' }), (err) => err.code === 'NETWORK');
  global.fetch = originalFetch;
});

test('postToAgent maps backend 4xx', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({ ok: false, status: 400, headers: { get: () => 'application/json' }, text: async () => JSON.stringify({ message: 'bad' }) });
  await assert.rejects(postToAgent({ agentConfig: { ...baseConfig, timeoutMs: 50, urls: ['https://agent.test/v1/chat'] }, payload: {}, requestId: 'r2' }), (err) => err.code === 'BACKEND_4XX');
  global.fetch = originalFetch;
});

test('postToAgent falls back from /v1/chat to /chat on 5xx', async () => {
  const originalFetch = global.fetch;
  let count = 0;
  global.fetch = async () => {
    count += 1;
    if (count === 1) return { ok: false, status: 500, headers: { get: () => 'application/json' }, text: async () => JSON.stringify({ message: 'upstream' }) };
    return { ok: true, status: 200, headers: { get: () => 'application/json' }, text: async () => JSON.stringify({ reply_text: 'ok' }) };
  };
  const result = await postToAgent({ agentConfig: { ...baseConfig, timeoutMs: 50 }, payload: {}, requestId: 'r3' });
  assert.equal(result.usedUrl, 'https://agent.test/chat');
  global.fetch = originalFetch;
});

test('postToAgent treats timeout as TIMEOUT', async () => {
  const originalFetch = global.fetch;
  global.fetch = async (_url, { signal }) => new Promise((_, reject) => { signal.addEventListener('abort', () => reject(new Error('timed out'))); });
  await assert.rejects(postToAgent({ agentConfig: baseConfig, payload: {}, requestId: 'r4' }), (err) => err.code === 'TIMEOUT');
  global.fetch = originalFetch;
});
