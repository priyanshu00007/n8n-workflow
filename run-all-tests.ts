import { INITIAL_WORKFLOW_TEMPLATES } from './src/data/initialTemplates';
import fs from 'fs';

const SKIP = [
  'tpl-daily-calendar-briefing',
  'tpl-conditional-calendar-routing',
  'tpl-multi-agent-researcher',
  'tpl-meeting-scheduler-bot',
  'tpl-rag-vector-qa',
  'tpl-autonomous-agentic-loop'
];
const mine = INITIAL_WORKFLOW_TEMPLATES.filter(t => !SKIP.includes(t.id));

async function main() {
  console.log(`${mine.length} new workflows to test:\n`);
  const results: any[] = [];

  for (const tpl of mine) {
    const payload = {
      workflowId: tpl.id,
      workflowTitle: tpl.title,
      nodes: tpl.nodes,
      edges: tpl.edges,
      triggerData: { testRun: true, body: { location: 'coffee in Tokyo', topic: 'AI chips', subject: 'Quarterly review' } }
    };

    try {
      const res = await fetch('http://localhost:3100/api/workflows/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data: any = await res.json();
      const stepLine = (data.steps || []).map((s: any) => `${s.nodeLabel}:${s.status}`).join(' -> ');
      const ok = data.status === 'success';
      console.log(`${ok ? 'PASS' : 'FAIL'} | ${tpl.title}`);
      console.log(`      ${stepLine}`);
      (data.steps || []).forEach((s: any) => {
        (s.logs || []).forEach((l: string) => console.log(`        [${s.nodeLabel}] ${l}`));
      });
      results.push({ id: tpl.id, status: data.status, steps: (data.steps || []).length });
    } catch (err: any) {
      console.log(`ERR  | ${tpl.title}: ${err.message}`);
      results.push({ id: tpl.id, status: 'error', error: err.message });
    }
  }

  fs.writeFileSync('test-results.json', JSON.stringify(results, null, 2));
  const passed = results.filter(r => r.status === 'success').length;
  console.log(`\n=== ${passed}/${results.length} workflows passed ===`);
  process.exit(0);
}

main();
