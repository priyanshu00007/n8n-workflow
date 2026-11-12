import React, { useEffect, useState } from 'react';
import {
  Webhook,
  Clock,
  Copy,
  Check,
  Power,
  RefreshCw,
  Zap,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';

interface TriggerEntry {
  workflowId: string;
  workflowTitle: string;
  webhookUrl: string;
  webhookActive: boolean;
  cron?: string;
  cronEnabled?: boolean;
  lastFired?: number;
}

export const TriggersView: React.FC = () => {
  const { setActiveTab } = useWorkflowStore();
  const [triggers, setTriggers] = useState<TriggerEntry[]>([]);
  const [schedulerEnabled, setSchedulerEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/triggers');
      const data = await res.json();
      setTriggers(data.triggers || []);
      if (typeof data.schedulerEnabled === 'boolean') setSchedulerEnabled(data.schedulerEnabled);
    } catch { /* offline */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCopy = (key: string, text: string) => {
    const full = text.startsWith('http') ? text : `${window.location.origin}${text}`;
    navigator.clipboard.writeText(full);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleScheduler = async () => {
    const next = !schedulerEnabled;
    setSchedulerEnabled(next);
    try { await fetch('/api/scheduler/toggle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled: next }) }); } catch { setSchedulerEnabled(!next); }
  };

  const toggleCron = async (workflowId: string, enabled: boolean) => {
    setTogglingId(workflowId);
    setTriggers(prev => prev.map(t => t.workflowId === workflowId ? { ...t, cronEnabled: enabled } : t));
    try {
      await fetch(`/api/triggers/${workflowId}/toggle-cron`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled }) });
    } catch {
      setTriggers(prev => prev.map(t => t.workflowId === workflowId ? { ...t, cronEnabled: !enabled } : t));
    }
    setTogglingId(null);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#09090b] p-8 space-y-6 custom-scrollbar">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 text-blue-400 mb-1">
            <Zap className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Automation Triggers</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Webhooks &amp; Schedules</h1>
          <p className="text-slate-400 text-xs mt-1">Copy a webhook URL into any external service, or let the background scheduler fire cron workflows automatically.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-medium transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={toggleScheduler}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold border transition-all ${
              schedulerEnabled
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:border-emerald-500/60'
                : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            Scheduler: {schedulerEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500 font-mono">Loading triggers…</div>
      ) : triggers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Webhook className="w-10 h-10 text-slate-600 mb-3" />
          <p className="text-sm text-slate-400 font-medium">No triggers yet.</p>
          <p className="text-xs text-slate-600 mt-1 max-w-sm">Run or save a workflow that contains a Webhook Trigger or Schedule Trigger node, and it will appear here.</p>
          <button
            onClick={() => setActiveTab('marketplace')}
            className="mt-4 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
          >
            Browse Templates
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {triggers.map((t) => (
            <div key={t.workflowId} className="bg-[#0c0c0e] border border-white/10 rounded-xl p-4 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <button
                    onClick={() => setActiveTab('canvas')}
                    className="text-sm font-semibold text-slate-100 hover:text-blue-300 transition-colors truncate block text-left"
                    title="Open in canvas"
                  >
                    {t.workflowTitle}
                  </button>
                  <span className="text-[10px] font-mono text-slate-500">{t.workflowId}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Cron schedule */}
                  {t.cron && (
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[11px] font-mono text-amber-300">
                        <Clock className="w-3.5 h-3.5" />
                        {t.cron}
                      </span>
                      <button
                        onClick={() => toggleCron(t.workflowId, t.cronEnabled === false)}
                        disabled={togglingId === t.workflowId}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-semibold border transition-all ${
                          t.cronEnabled !== false
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:border-emerald-500/60'
                            : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        {t.cronEnabled !== false ? 'Auto-run ON' : 'Auto-run OFF'}
                      </button>
                    </div>
                  )}
                  {/* Webhook URL */}
                  <div className="flex items-center gap-1.5">
                    <code className="px-2.5 py-1.5 rounded-md bg-black/50 border border-white/10 text-[11px] font-mono text-blue-300 max-w-[280px] truncate">
                      {t.webhookUrl}
                    </code>
                    <button
                      onClick={() => handleCopy(t.workflowId, t.webhookUrl)}
                      className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-slate-200 transition-colors"
                      title="Copy full webhook URL"
                    >
                      {copiedKey === t.workflowId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {t.lastFired && (
                    <span className="text-[10px] font-mono text-slate-500" title="Last cron fire (minute id)">
                      fired ✓
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Auth notice when API key likely set server-side */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 text-[11px] text-slate-400">
            <ShieldAlert className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p>
              Webhook callers must include your API key if one is configured server-side: append
              <code className="mx-1 text-blue-300 font-mono">?apiKey=YOUR_KEY</code>
              or send an <code className="text-blue-300 font-mono">x-api-key</code> header. No key set → webhooks are open to anyone with the URL.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
