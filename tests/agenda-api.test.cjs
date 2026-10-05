const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { NextRequest } = require('next/server');

function load(file, dependencies = {}, globals = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, { exports: module.exports, module,
    require: name => dependencies[name] || require(name),
    process: { env: {} }, URL, AbortSignal, ...globals }, { filename: file });
  return module.exports;
}

function fixture(result = { ok: true }, configured = true) {
  const data = load('data/site-data.ts');
  const agenda = load('lib/agenda.ts', { '@/data/site-data': data });
  const calls = [];
  const route = load('app/api/agenda/route.ts', { '@/lib/agenda': agenda }, {
    process: { env: configured ? { GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/test/exec', AGENDA_SECRET: 'server-only-key' } : {} },
    fetch: async (url, options) => {
      calls.push(JSON.parse(options.body));
      return { ok: true, json: async () => result };
    }
  });
  const appointment = { id: '11111111-1111-4111-8111-111111111111', name: 'Pessoa Teste',
    whatsapp: '(22) 99999-9999', professional: 'Aline Reis', date: '2099-10-20',
    time: '09:00', modality: 'presencial', consent: true };
  const post = (body = appointment, origin = 'https://lazuli.example') => route.POST(new NextRequest('https://lazuli.example/api/agenda', {
    method: 'POST', headers: { 'Content-Type': 'application/json', origin },
    body: typeof body === 'string' ? body : JSON.stringify(body)
  }));
  return { route, calls, appointment, post };
}

test('API validates origin, JSON and required fields before calling Google', async () => {
  const f = fixture();
  assert.equal((await f.post(f.appointment, 'https://other.example')).status, 403);
  assert.equal((await f.post('{invalid')).status, 400);
  assert.equal((await f.post({ ...f.appointment, consent: false })).status, 400);
  assert.equal(f.calls.length, 0);
});

test('API confirms only the matching request ID and keeps the secret on the server', async () => {
  const f = fixture({ ok: true, id: '11111111-1111-4111-8111-111111111111' });
  const response = await f.post();
  assert.equal(response.status, 200);
  assert.equal((await response.json()).id, f.appointment.id);
  assert.equal(f.calls[0].secret, 'server-only-key');
  assert.equal(f.calls[0].appointment.whatsapp, '22999999999');
  assert.equal(Object.hasOwn(f.calls[0].appointment, 'reason'), false);
  for (const result of [{ ok: true }, { ok: true, id: 'wrong-id' }]) {
    const invalid = await fixture(result).post();
    assert.equal(invalid.status, 503);
    assert.equal((await invalid.json()).ok, undefined);
  }
});

test('API reports a conflicting slot and does not pretend the request succeeded', async () => {
  const response = await fixture({ ok: false, error: 'slot_unavailable' }).post();
  assert.equal(response.status, 409);
  assert.equal((await response.json()).code, 'slot_unavailable');
});

test('API falls back to a preference request before Google is configured', async () => {
  const f = fixture({}, false);
  const response = await f.route.GET(new NextRequest('https://lazuli.example/api/agenda'));
  assert.equal((await response.json()).mode, 'whatsapp');
  assert.equal((await f.post()).status, 503);
  assert.equal(f.calls.length, 0);
});
