const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const filename = path.resolve(__dirname, '../src/lib/api-client.ts');
const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
const loaded = new Module(filename, module); loaded.filename = filename; loaded.paths = module.paths; loaded._compile(compiled.outputText, filename);
const { apiClient } = loaded.exports;
test('saved API updates reach the bell without a socket, using the persisted id', async () => {
  const originalFetch = global.fetch, originalWindow = global.window, originalStorage = global.localStorage;
  const events = [];
  global.window = { dispatchEvent: event => events.push(event) };
  global.localStorage = { getItem: () => 'test-token' };
  const saved = { id: 'saved-id', userId: 'test-user', title: 'Đã cập nhật', body: 'Đã lưu', read: false };
  global.fetch = async () => new Response(JSON.stringify({ success: true }), { headers: { 'X-CourtMate-Notification': encodeURIComponent(JSON.stringify(saved)) } });
  try {
    assert.deepEqual(await apiClient.put('/users/profile', { name: 'Updated' }), { success: true });
    assert.equal(events.length, 1);
    assert.equal(events[0].type, 'local-notification:new');
    assert.deepEqual(events[0].detail, saved);
  } finally { global.fetch = originalFetch; global.window = originalWindow; global.localStorage = originalStorage; }
});
test('failed writes do not generate success notifications', async () => {
  const originalFetch = global.fetch, originalWindow = global.window, originalStorage = global.localStorage;
  const events = [];
  global.window = { dispatchEvent: event => events.push(event) };
  global.localStorage = { getItem: () => 'test-token' };
  global.fetch = async () => new Response(JSON.stringify({ message: 'Failed' }), { status: 400 });
  try {
    await assert.rejects(apiClient.put('/users/profile', {}), /Failed/);
    assert.equal(events.length, 0);
  } finally { global.fetch = originalFetch; global.window = originalWindow; global.localStorage = originalStorage; }
});
