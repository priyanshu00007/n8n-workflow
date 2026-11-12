/**
 * Integration test suite for the Nexus AI Workflow Engine.
 * Boots a fresh server on a test port, exercises every flow via the real API,
 * and reports pass/fail per test. Run with: npm test
 */
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = 3199;
const BASE = `http://localhost:${PORT}`;
const API_KEY = 'test-suite-key';

let server: ChildProcess | null = null;
let passed = 0;
let failed = 0;
const failures: string[] = [];

function log(msg: string) { console.log(msg); }

async function api(
  method: string,
  url: string,
  body?: any,
  opts: { headers?: Record<string, string>; expectStatus?: number } = {}
): Promise<{ status: number; data: any }> {
  const res = await fetch(`${BASE}${url}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY, ...(opts.headers || {}) },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(60_000)
  });
  let data: any = null;
  try { data = await res.json(); } catch { /* non-json */ }
  return { status: res.status, data };
}

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    passed++;
    log(`  PASS  ${name}`);
  } catch (err: any) {
    failed++;
    failures.push(`${name}: ${err.message}`);
    log(`  FAIL  ${name} — ${err.message}`);
  }
}

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

async function waitForServer(timeoutMs = 30_000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${BASE}/api/health`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return;
    } catch { /* not up yet */ }
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error('Server did not start in time');
}

async function startServer(withAuth: boolean): Promise<void> {
  const env: Record<string, string> = { ...process.env as any, PORT: String(PORT) };
  if (withAuth) env.API_KEY = API_KEY;
  // Direct node + tsx loader avoids npx/shell path issues (spaces in Windows user dirs)
  server = spawn(process.execPath, ['--import', 'tsx', path.join(__dirname, '..', 'server.ts')], {
    env: env as any,
    stdio: ['ignore', fs.openSync('test-server.log', 'a'), fs.openSync('test-server.log', 'a')]
  });
  try {
    await waitForServer();
  } catch (err: any) {
    let log = '';
    try { log = fs.readFileSync('test-server.log', 'utf8').slice(-500); } catch {}
    throw new Error(`${err.message}\n[test-server.log] ${log}`);
  }
}

async function stopServer(): Promise<void> {
  if (server) {
    server.kill();
    server = null;
    await new Promise(r => setTimeout(r, 1500));
  }
}

async function main() {
  log('\n═══ Nexus Flow Engine — Integration Test Suite ═══\n');

  // ---------- Phase 1: Auth ON ----------
  log('── Phase 1: API-key auth (API_KEY set) ──');
  await startServer(true);

  await test('health endpoint is exempt from auth', async () => {
    const res = await fetch(`${BASE}/api/health`);
    assert(res.ok, `expected 200, got ${res.status}`);
  });

  await test('request without API key -> 401', async () => {
    const res = await fetch(`${BASE}/api/executions`);
    assert(res.status === 401, `expected 401, got ${res.status}`);
  });

  await test('request with wrong key -> 401', async () => {
    const res = await fetch(`${BASE}/api/executions`, { headers: { 'x-api-key': 'wrong' } });
    assert(res.status === 401, `expected 401, got ${res.status}`);
  });

  await test('request with correct key passes auth (200 or 503-no-DB)', async () => {
    const { status } = await api('GET', '/api/executions');
    // 200 = DB configured; 503 = auth OK but no Postgres in test env (graceful degradation)
    assert(status === 200 || status === 503, `auth failed unexpectedly: ${status}`);
  });

  await stopServer();
  log('');

  // ---------- Phase 2: Auth OFF, full flow tests ----------
  log('── Phase 2: Engine flows (no auth) ──');
  await startServer(false);

  await test('health returns engine info', async () => {
    const { status, data } = await api('GET', '/api/health');
    assert(status === 200 && data.status === 'ok', 'health not ok');
  });

  await test('execute rejects empty workflow', async () => {
    const { status } = await api('POST', '/api/workflows/execute', { nodes: [], edges: [] });
    assert(status === 400, `expected 400, got ${status}`);
  });

  await test('manual trigger flattens payload (input.score works)', async () => {
    const { status, data } = await api('POST', '/api/workflows/execute', {
      workflowId: 'it-flat',
      workflowTitle: 'IT Flatten',
      nodes: [
        { id: 'n1', data: { label: 'T', category: 'trigger', typeId: 'manual_trigger', config: {} } },
        { id: 'n2', data: { label: 'IF', category: 'logic', typeId: 'if_condition', config: { expression: 'input.score > 50' } } }
      ],
      edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
      triggerData: { score: 80 }
    });
    assert(status === 200, `execute failed: ${status}`);
    const ifStep = data.steps.find((s: any) => s.nodeId === 'n2');
    assert(ifStep?.branchTaken === 'true', `expected true branch, got ${ifStep?.branchTaken}`);
  });

  await test('webhook trigger flattens body (input.field works)', async () => {
    // Register workflow
    await api('POST', '/api/workflows/execute', {
      workflowId: 'it-webhook',
      workflowTitle: 'IT Webhook',
      nodes: [
        { id: 'n1', data: { label: 'Hook', category: 'trigger', typeId: 'webhook_trigger', config: {} } },
        { id: 'n2', data: { label: 'IF', category: 'logic', typeId: 'if_condition', config: { expression: 'input.alertLevel === "high"' } } },
        { id: 'n3', data: { label: 'Yes', category: 'action', typeId: 'filter_node', config: { filterKey: 'items', matchValue: '' } } }
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3', sourceHandle: 'true' }
      ],
      triggerData: {}
    });
    // Fire webhook
    const { status, data } = await api('POST', '/api/webhooks/it-webhook', { alertLevel: 'high', host: 'srv1' });
    assert(status === 200, `webhook failed: ${status}`);
    assert(data.status === 'success', `webhook exec status: ${data.status}`);
  });

  await test('retry with continue-on-error lets flow proceed', async () => {
    const { status, data } = await api('POST', '/api/workflows/execute', {
      workflowId: 'it-retry',
      workflowTitle: 'IT Retry',
      nodes: [
        { id: 'n1', data: { label: 'T', category: 'trigger', typeId: 'manual_trigger', config: {} } },
        { id: 'n2', data: { label: 'Fails', category: 'action', typeId: 'code_executor', config: { code: 'throw new Error("boom")', retry: { maxAttempts: 3, baseDelayMs: 30, continueOnError: true } } } },
        { id: 'n3', data: { label: 'After', category: 'logic', typeId: 'filter_node', config: { filterKey: 'items', matchValue: '' } } }
      ],
      edges: [{ id: 'e1', source: 'n1', target: 'n2' }, { id: 'e2', source: 'n2', target: 'n3' }],
      triggerData: { items: [1] }
    });
    assert(status === 200 && data.status === 'success', 'flow should succeed');
    const failStep = data.steps.find((s: any) => s.nodeId === 'n2');
    assert(failStep?.attempts === 3, `expected 3 attempts, got ${failStep?.attempts}`);
    assert(data.steps.some((s: any) => s.nodeId === 'n3'), 'downstream did not run');
  });

  await test('fail-fast (no retry) stops the flow and marks failed', async () => {
    const { data } = await api('POST', '/api/workflows/execute', {
      workflowId: 'it-failfast',
      workflowTitle: 'IT FailFast',
      nodes: [
        { id: 'n1', data: { label: 'T', category: 'trigger', typeId: 'manual_trigger', config: {} } },
        { id: 'n2', data: { label: 'Boom', category: 'action', typeId: 'code_executor', config: { code: 'throw new Error("fatal")' } } },
        { id: 'n3', data: { label: 'Never', category: 'logic', typeId: 'filter_node', config: {} } }
      ],
      edges: [{ id: 'e1', source: 'n1', target: 'n2' }, { id: 'e2', source: 'n2', target: 'n3' }],
      triggerData: {}
    });
    assert(data.status === 'failed', `expected failed, got ${data.status}`);
    assert(!data.steps.some((s: any) => s.nodeId === 'n3'), 'downstream should not run');
  });

  await test('SSE stream broadcasts step events', async () => {
    const events: string[] = [];
    const controller = new AbortController();
    const reader = fetch(`${BASE}/api/workflows/stream/it-sse`, { signal: controller.signal })
      .then(r => r.body!.getReader())
      .then(async (reader) => {
        const dec = new TextDecoder();
        while (events.filter(e => e === 'step_completed').length < 1) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = dec.decode(value);
          if (chunk.includes('event: step_completed')) events.push('step_completed');
          if (chunk.includes('event: connected')) events.push('connected');
        }
        controller.abort();
      }).catch(() => {});

    await new Promise(r => setTimeout(r, 800)); // let SSE subscribe
    await api('POST', '/api/workflows/execute', {
      workflowId: 'it-sse',
      workflowTitle: 'IT SSE',
      nodes: [
        { id: 'n1', data: { label: 'T', category: 'trigger', typeId: 'manual_trigger', config: {} } },
        { id: 'n2', data: { label: 'F', category: 'logic', typeId: 'filter_node', config: { filterKey: 'items', matchValue: '' } } }
      ],
      edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
      triggerData: { items: [1] }
    });
    await Promise.race([reader, new Promise(r => setTimeout(r, 8000))]);
    controller.abort();
    assert(events.includes('step_completed'), 'no step_completed frame received');
  });

  await test('email simulate adds to inbox', async () => {
    await api('POST', '/api/email/simulate', { from: 't@t.com', subject: 'S', body: 'B' });
    const { data } = await api('GET', '/api/email/inbox');
    assert((data.emails || []).length >= 1, 'inbox empty after simulate');
  });

  await test('triggers registry lists saved workflows', async () => {
    const { status, data } = await api('GET', '/api/triggers');
    assert(status === 200, 'triggers endpoint failed');
    assert(Array.isArray(data.triggers), 'triggers not array');
    assert(data.triggers.some((t: any) => t.workflowId === 'it-webhook'), 'it-webhook missing from registry');
  });

  await test('cron toggle endpoint flips cronEnabled', async () => {
    const { status, data } = await api('POST', '/api/triggers/it-webhook/toggle-cron', { enabled: false });
    assert(status === 200 && data.cronEnabled === false, 'toggle failed');
  });

  await test('scheduler status endpoint', async () => {
    const { status, data } = await api('GET', '/api/scheduler');
    assert(status === 200 && typeof data.enabled === 'boolean', 'scheduler status failed');
  });

  await test('models endpoint lists providers', async () => {
    const { status, data } = await api('GET', '/api/models');
    assert(status === 200, 'models endpoint failed');
    assert(data.local || data.providers, 'models payload missing keys');
  });

  await stopServer();
  log('');

  // ---------- Summary ----------
  log('════════════════════════════════════════');
  log(`  ${passed} passed, ${failed} failed, ${passed + failed} total`);
  if (failures.length) {
    log('\nFailures:');
    failures.forEach(f => log(`  • ${f}`));
  }
  log('════════════════════════════════════════\n');
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(async (err) => {
  console.error('Suite crashed:', err);
  await stopServer();
  process.exit(1);
});
