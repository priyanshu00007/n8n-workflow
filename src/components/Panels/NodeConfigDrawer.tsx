import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Bot, 
  Calendar, 
  Code, 
  Send, 
  Clock, 
  Zap, 
  Search, 
  Sparkles, 
  Check, 
  Play, 
  Loader2, 
  Copy, 
  Terminal, 
  Sliders, 
  CheckCircle2, 
  XCircle, 
  GitBranch, 
  Hourglass, 
  Mail, 
  Filter 
} from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';

export const NodeConfigDrawer: React.FC = () => {
  const { 
    nodes, 
    selectedNodeId, 
    setSelectedNodeId, 
    updateNodeConfig, 
    testSingleNode, 
    isTestingNodeId 
  } = useWorkflowStore();

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const data = selectedNode?.data;

  const [activeTab, setActiveTab] = useState<'params' | 'test' | 'output'>('params');
  const [label, setLabel] = useState('');
  const [localConfig, setLocalConfig] = useState<Record<string, any>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Live model catalog (local Ollama + online cloud providers)
  const [modelCatalog, setModelCatalog] = useState<{
    local: { ok: boolean; endpoint: string; models: string[]; modelsDetailed?: Array<{ name: string; size?: string; params?: string; quantization?: string; contextLength?: number; capabilities?: string[] }>; recommended?: string | null };
    online: Array<{ id: string; label: string; configured: boolean; defaultModel: string }>;
  } | null>(null);
  useEffect(() => {
    fetch('/api/models')
      .then((r) => r.json())
      .then(setModelCatalog)
      .catch(() => setModelCatalog(null));
  }, []);

  // Test Step Tab state
  const [testInputPayload, setTestInputPayload] = useState<string>('{\n  "sampleEvent": "Demo Execution",\n  "eventCount": 3\n}');
  const [testResult, setTestResult] = useState<any>(null);
  const [testError, setTestError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedNode) {
      setLabel(data?.label || '');
      setLocalConfig(data?.config || {});
      setSavedSuccess(false);
      setTestResult(data?.lastRunOutput ? { outputPayload: data.lastRunOutput, durationMs: data.lastRunTimeMs, status: data.status } : null);
      setTestError(data?.lastErrorMessage || null);
    }
  }, [selectedNodeId, selectedNode]);

  if (!selectedNode || !data) return null;

  const isTestingThis = isTestingNodeId === selectedNode.id;

  const handleSave = () => {
    updateNodeConfig(selectedNode.id, localConfig, label);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const updateConfigField = (field: string, value: any) => {
    setLocalConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleRunSingleTest = async () => {
    setTestError(null);
    let parsedInput = {};
    try {
      parsedInput = JSON.parse(testInputPayload);
    } catch (e: any) {
      setTestError('Invalid JSON format in test input');
      return;
    }

    try {
      // Save current unsaved config first
      updateNodeConfig(selectedNode.id, localConfig, label);
      const res = await testSingleNode(selectedNode.id, parsedInput);
      setTestResult(res);
    } catch (err: any) {
      setTestError(err.message || 'Node execution failed');
    }
  };

  const handleCopyJson = (content: any) => {
    navigator.clipboard.writeText(typeof content === 'string' ? content : JSON.stringify(content, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <aside className="w-96 bg-[#0c0c0e] border-l border-white/10 flex flex-col justify-between overflow-hidden z-20 shadow-2xl select-none">
      {/* Top Header */}
      <div className="p-4 border-b border-white/10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <h3 className="font-bold text-xs text-slate-100 tracking-tight uppercase">NODE CONFIGURATION</h3>
          </div>
          <button
            onClick={() => setSelectedNodeId(null)}
            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Tabs Navigation */}
        <div className="flex items-center gap-1 bg-[#141418] p-1 rounded-lg border border-white/5">
          <button
            onClick={() => setActiveTab('params')}
            className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold transition-all text-center ${
              activeTab === 'params'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            Parameters
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold transition-all text-center flex items-center justify-center gap-1 ${
              activeTab === 'test'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Test Step</span>
          </button>
          <button
            onClick={() => setActiveTab('output')}
            className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold transition-all text-center ${
              activeTab === 'output'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            Output
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* TAB 1: PARAMETERS */}
        {activeTab === 'params' && (
          <div className="space-y-4">
            {/* Node Label */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">
                Node Name
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none transition-colors"
              />
            </div>

            {/* Cron Trigger Node */}
            {data.typeId === 'cron_trigger' && (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Cron Schedule</label>
                    <label className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={localConfig.enabled !== false}
                        onChange={(e) => updateConfigField('enabled', e.target.checked)}
                        className="accent-blue-500 w-3 h-3"
                      />
                      Auto-run
                    </label>
                  </div>
                  <input
                    type="text"
                    value={localConfig.cron || '0 8 * * *'}
                    onChange={(e) => updateConfigField('cron', e.target.value)}
                    placeholder="0 8 * * *"
                    className={`w-full bg-[#18181b] border rounded-md px-3 py-1.5 text-xs text-slate-200 font-mono outline-none transition-colors ${
                      localConfig.enabled === false ? 'border-white/10 opacity-60' : 'border-white/10 focus:border-blue-500/50'
                    }`}
                  />
                  <div className="flex flex-wrap gap-1 mt-2">
                    {[
                      { label: 'Every 5 min', value: '*/5 * * * *' },
                      { label: 'Hourly', value: '0 * * * *' },
                      { label: 'Daily 8AM', value: '0 8 * * *' },
                      { label: 'Weekdays 9AM', value: '0 9 * * 1-5' },
                      { label: 'Mondays 9AM', value: '0 9 * * 1' },
                      { label: 'Every 6h', value: '0 */6 * * *' }
                    ].map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => updateConfigField('cron', preset.value)}
                        className="text-[9px] font-mono bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1.5">
                    {localConfig.enabled === false
                      ? 'Auto-run disabled — this workflow only runs manually.'
                      : 'Background scheduler checks saved workflows every 30s and auto-runs them when the schedule matches.'}
                  </p>
                </div>
              </div>
            )}

            {/* Variable autocomplete helper banner */}
            <div className="p-2.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300">
              <p className="font-semibold mb-0.5">Variable Templating:</p>
              <p className="text-[10px] text-slate-400">Use <code className="text-blue-400 font-mono">{"{{ $json.fieldName }}"}</code> to reference parent node output.</p>
            </div>

            {/* IF / Else Conditional Node */}
            {data.typeId === 'if_condition' && (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Condition Expression (JS)</label>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    <button
                      type="button"
                      onClick={() => updateConfigField('expression', 'input.eventCount > 0')}
                      className="text-[9px] font-mono bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded"
                    >
                      + Has Events
                    </button>
                    <button
                      type="button"
                      onClick={() => updateConfigField('expression', 'input.status === "confirmed"')}
                      className="text-[9px] font-mono bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded"
                    >
                      + Status Confirmed
                    </button>
                  </div>
                  <input
                    type="text"
                    value={localConfig.expression || 'input.eventCount > 0'}
                    onChange={(e) => updateConfigField('expression', e.target.value)}
                    placeholder="input.eventCount > 0"
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md p-2.5 text-xs text-slate-200 font-mono outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                    <span className="font-bold">TRUE Handle:</span> Executes when truthy
                  </div>
                  <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300">
                    <span className="font-bold">FALSE Handle:</span> Executes when falsy
                  </div>
                </div>
              </div>
            )}

            {/* Filter Node */}
            {data.typeId === 'filter_node' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Array Key in Payload</label>
                  <input
                    type="text"
                    value={localConfig.filterKey || 'events'}
                    onChange={(e) => updateConfigField('filterKey', e.target.value)}
                    placeholder="events"
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Filter Match String</label>
                  <input
                    type="text"
                    value={localConfig.matchValue || ''}
                    onChange={(e) => updateConfigField('matchValue', e.target.value)}
                    placeholder="e.g. Sync, Review, Urgent"
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none"
                  />
                </div>
              </div>
            )}

            {/* Delay / Timer Node */}
            {data.typeId === 'delay_timer' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Delay Duration (Seconds)</label>
                  <input
                    type="number"
                    value={localConfig.delaySeconds || 2}
                    onChange={(e) => updateConfigField('delaySeconds', Number(e.target.value))}
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none font-mono"
                  />
                </div>
              </div>
            )}

            {/* Google Calendar List Events */}
            {data.typeId === 'gcal_list_events' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Calendar ID</label>
                  <input
                    type="text"
                    value={localConfig.calendarId || 'primary'}
                    onChange={(e) => updateConfigField('calendarId', e.target.value)}
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Max Events to Return</label>
                  <input
                    type="number"
                    value={localConfig.maxResults || 10}
                    onChange={(e) => updateConfigField('maxResults', Number(e.target.value))}
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none font-mono"
                  />
                </div>
              </div>
            )}

            {/* Google Calendar Create Event */}
            {data.typeId === 'gcal_create_event' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Event Summary / Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Q3 Roadmap Review or {{ $json.summary }}"
                    value={localConfig.summary || ''}
                    onChange={(e) => updateConfigField('summary', e.target.value)}
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Start Time</label>
                  <input
                    type="text"
                    placeholder="Tomorrow 10:00 AM or ISO Date"
                    value={localConfig.startTime || ''}
                    onChange={(e) => updateConfigField('startTime', e.target.value)}
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={localConfig.durationMinutes || 30}
                    onChange={(e) => updateConfigField('durationMinutes', Number(e.target.value))}
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Attendees</label>
                  <input
                    type="text"
                    placeholder="priyanshurathod518@gmail.com, team@company.com"
                    value={localConfig.attendees || ''}
                    onChange={(e) => updateConfigField('attendees', e.target.value)}
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Description / Agenda</label>
                  <textarea
                    rows={2}
                    value={localConfig.description || ''}
                    onChange={(e) => updateConfigField('description', e.target.value)}
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md p-2 text-xs text-slate-200 outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {/* ADK Reasoning Agent */}
            {(data.typeId === 'adk_reasoning_agent' || data.typeId === 'search_grounding') && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Gemini Model</label>
                  <select
                    value={localConfig.model || 'gemini-3.6-flash'}
                    onChange={(e) => updateConfigField('model', e.target.value)}
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none"
                  >
                    <option value="gemini-3.6-flash">gemini-3.6-flash (Fast Reasoning)</option>
                    <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Deep Autonomous Agent)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">System Prompt</label>
                  <textarea
                    rows={4}
                    value={localConfig.systemPrompt || ''}
                    onChange={(e) => updateConfigField('systemPrompt', e.target.value)}
                    placeholder="You are an autonomous executive assistant..."
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md p-2 text-xs text-slate-200 font-mono outline-none resize-none leading-relaxed"
                  />
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-md bg-[#18181b] border border-white/10">
                  <div className="flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-xs text-slate-200 font-medium">Google Search Grounding</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!localConfig.useSearchGrounding || data.typeId === 'search_grounding'}
                    onChange={(e) => updateConfigField('useSearchGrounding', e.target.checked)}
                    className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Code Executor */}
            {data.typeId === 'code_executor' && (
              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">JavaScript Sandbox</label>
                <textarea
                  rows={8}
                  value={localConfig.code || 'return {\n  status: "processed",\n  itemCount: input.eventCount || 0,\n  timestamp: new Date().toISOString()\n};'}
                  onChange={(e) => updateConfigField('code', e.target.value)}
                  className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md p-3 text-xs text-emerald-400 outline-none font-mono leading-relaxed"
                />
              </div>
            )}

            {/* Webhook / HTTP Request */}
            {(data.typeId === 'http_webhook' || data.typeId === 'http_request') && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">HTTP Method</label>
                  <select
                    value={localConfig.method || 'POST'}
                    onChange={(e) => updateConfigField('method', e.target.value)}
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none"
                  >
                    <option value="POST">POST</option>
                    <option value="GET">GET</option>
                    <option value="PUT">PUT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Target Channel / Endpoint</label>
                  <input
                    type="text"
                    value={localConfig.targetChannel || 'executive-briefings'}
                    onChange={(e) => updateConfigField('targetChannel', e.target.value)}
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none font-mono"
                  />
                </div>
              </div>
            )}

            {/* Ollama Local LLM Node */}
            {data.typeId === 'ollama_local_model' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Ollama Host URL</label>
                  <input
                    type="text"
                    value={localConfig.ollamaUrl || 'http://localhost:11434'}
                    onChange={(e) => updateConfigField('ollamaUrl', e.target.value)}
                    placeholder="http://localhost:11434"
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Docker / Localhost Ollama API endpoint</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Local Model Name</label>
                  <input
                    type="text"
                    value={localConfig.model || 'qwen2.5:0.5b'}
                    onChange={(e) => updateConfigField('model', e.target.value)}
                    placeholder="e.g. qwen2.5:0.5b, deepseek-r1, llama3.3, mistral, phi4"
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none font-mono"
                  />
                  {modelCatalog?.local?.modelsDetailed && modelCatalog.local.modelsDetailed.length > 0 ? (
                    <div className="grid grid-cols-1 gap-1.5 mt-2">
                      {modelCatalog.local.modelsDetailed.map((m) => {
                        const active = (localConfig.model || 'qwen2.5:0.5b') === m.name;
                        return (
                          <button
                            key={m.name}
                            onClick={() => updateConfigField('model', m.name)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-md border transition-all ${
                              active
                                ? 'bg-blue-600/20 border-blue-500/50'
                                : 'bg-[#141418] border-white/10 hover:border-blue-500/40'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-[11px] font-mono font-bold truncate ${active ? 'text-blue-200' : 'text-slate-200'}`}>
                                {m.name}
                              </span>
                              <div className="flex items-center gap-1 shrink-0">
                                {(m.capabilities || []).includes('tools') && (
                                  <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">tools</span>
                                )}
                                {m.params && (
                                  <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">{m.params}</span>
                                )}
                                {m.size && (
                                  <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">{m.size}</span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : modelCatalog?.local?.models && modelCatalog.local.models.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {modelCatalog.local.models.map((m) => (
                        <button
                          key={m}
                          onClick={() => updateConfigField('model', m)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                            localConfig.model === m
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : 'bg-[#141418] border-white/10 text-slate-400 hover:text-slate-200 hover:border-blue-500/40'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-slate-500 mt-1">
                    {modelCatalog?.local?.ok
                      ? `Connected: ${modelCatalog.local.endpoint} — ${modelCatalog.local.models.length} model(s) ready`
                      : 'Ollama offline — start the Docker stack to pull & run local models'}
                  </p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Prompt / Instructions</label>
                  <textarea
                    rows={4}
                    value={localConfig.prompt || ''}
                    onChange={(e) => updateConfigField('prompt', e.target.value)}
                    placeholder="Synthesize {{ $json.data }} into an executive summary..."
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md p-2 text-xs text-slate-200 font-mono outline-none resize-none leading-relaxed"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                    <span>Temperature</span>
                    <span>{localConfig.temperature ?? 0.7}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={localConfig.temperature ?? 0.7}
                    onChange={(e) => updateConfigField('temperature', parseFloat(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Universal Cloud LLM Router */}
            {data.typeId === 'universal_ai_model' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">AI Provider</label>
                  <select
                    value={localConfig.provider || 'gemini'}
                    onChange={(e) => updateConfigField('provider', e.target.value)}
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none"
                  >
                    <option value="ollama">Ollama — Local Docker (offline, private)</option>
                    <option value="gemini">Google Gemini (Gemini 2.5 Flash / Pro)</option>
                    <option value="openai">OpenAI (GPT-4o, GPT-4o-mini, o3-mini)</option>
                    <option value="anthropic">Anthropic Claude (Claude 3.7 Sonnet)</option>
                    <option value="deepseek">DeepSeek (DeepSeek-V3, DeepSeek-R1)</option>
                    <option value="qwen">Qwen / Alibaba Cloud (Qwen 2.5 Max)</option>
                    <option value="minimax">MiniMax (MiniMax-01 / Chat)</option>
                    <option value="groq">Groq / LPU (Llama 3.3 70B Fast)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Model Name</label>
                  <input
                    type="text"
                    value={localConfig.model || 'gemini-2.5-flash'}
                    onChange={(e) => updateConfigField('model', e.target.value)}
                    placeholder="e.g. gpt-4o, claude-3-7-sonnet-20250219, deepseek-chat"
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">System Prompt / Persona</label>
                  <textarea
                    rows={3}
                    value={localConfig.systemPrompt || ''}
                    onChange={(e) => updateConfigField('systemPrompt', e.target.value)}
                    placeholder="You are an autonomous enterprise AI agent..."
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md p-2 text-xs text-slate-200 font-mono outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">User Prompt</label>
                  <textarea
                    rows={4}
                    value={localConfig.prompt || ''}
                    onChange={(e) => updateConfigField('prompt', e.target.value)}
                    placeholder="Process input: {{ $json.content }}"
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md p-2 text-xs text-slate-200 font-mono outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* Email Receiver Node */}
            {data.typeId === 'email_receiver' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Folder</label>
                  <select
                    value={localConfig.folder || 'inbox'}
                    onChange={(e) => updateConfigField('folder', e.target.value)}
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none"
                  >
                    <option value="inbox">Inbox (all)</option>
                    <option value="unread">Unread only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Max Emails</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={localConfig.maxEmails || 5}
                    onChange={(e) => updateConfigField('maxEmails', parseInt(e.target.value))}
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-500">Uses the built-in simulated inbox. Add IMAP credentials in production for real mail.</p>
              </div>
            )}

            {/* Email Sender Node */}
            {data.typeId === 'email_sender' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">To</label>
                  <input
                    type="text"
                    value={localConfig.to || ''}
                    onChange={(e) => updateConfigField('to', e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Subject</label>
                  <input
                    type="text"
                    value={localConfig.subject || ''}
                    onChange={(e) => updateConfigField('subject', e.target.value)}
                    placeholder="Your Daily Digest — {{ $json.title }}"
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Body</label>
                  <textarea
                    rows={5}
                    value={localConfig.body || ''}
                    onChange={(e) => updateConfigField('body', e.target.value)}
                    placeholder="{{ $json.response }}"
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md p-2 text-xs text-slate-200 font-mono outline-none resize-none leading-relaxed"
                  />
                </div>
                <p className="text-[10px] text-slate-500">Set SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS in .env for real delivery — otherwise sends are simulated.</p>
              </div>
            )}

            {/* News Fetcher Node */}
            {data.typeId === 'news_fetcher' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">RSS Feed URLs (comma-separated)</label>
                  <textarea
                    rows={3}
                    value={localConfig.feeds || 'https://techcrunch.com/feed/'}
                    onChange={(e) => updateConfigField('feeds', e.target.value)}
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md p-2 text-xs text-slate-200 font-mono outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Max Items Per Feed</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={localConfig.maxItems || 5}
                    onChange={(e) => updateConfigField('maxItems', parseInt(e.target.value))}
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none font-mono"
                  />
                </div>
              </div>
            )}

            {/* Maps Scraper Node */}
            {data.typeId === 'maps_scraper' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Place Search Query</label>
                  <input
                    type="text"
                    value={localConfig.query || '{{ $json.location }}'}
                    onChange={(e) => updateConfigField('query', e.target.value)}
                    placeholder="e.g. coffee shops in Bangalore or {{ $json.body.location }}"
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Result Limit</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={localConfig.limit || 5}
                    onChange={(e) => updateConfigField('limit', parseInt(e.target.value))}
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-500">Uses OpenStreetMap Nominatim — real geocoding, free, no API key.</p>
              </div>
            )}

            {/* Slack Connector */}
            {data.typeId === 'slack_message' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Slack Webhook URL / Channel</label>
                  <input
                    type="text"
                    value={localConfig.webhookUrl || ''}
                    onChange={(e) => updateConfigField('webhookUrl', e.target.value)}
                    placeholder="https://hooks.slack.com/services/..."
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Message Text / Payload</label>
                  <textarea
                    rows={4}
                    value={localConfig.message || ''}
                    onChange={(e) => updateConfigField('message', e.target.value)}
                    placeholder="🚀 *Workflow Alert*\nExecution Output: {{ $json.summary }}"
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md p-2 text-xs text-slate-200 font-mono outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {/* Discord Connector */}
            {data.typeId === 'discord_webhook' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Discord Webhook URL</label>
                  <input
                    type="text"
                    value={localConfig.webhookUrl || ''}
                    onChange={(e) => updateConfigField('webhookUrl', e.target.value)}
                    placeholder="https://discord.com/api/webhooks/..."
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Notification Content</label>
                  <textarea
                    rows={3}
                    value={localConfig.content || ''}
                    onChange={(e) => updateConfigField('content', e.target.value)}
                    placeholder="✨ AI Task Completed: {{ $json.taskName }}"
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md p-2 text-xs text-slate-200 font-mono outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {/* GitHub Action Node */}
            {data.typeId === 'github_action' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">GitHub Repository</label>
                  <input
                    type="text"
                    value={localConfig.repository || ''}
                    onChange={(e) => updateConfigField('repository', e.target.value)}
                    placeholder="owner/repository-name"
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Operation</label>
                  <select
                    value={localConfig.operation || 'create_issue'}
                    onChange={(e) => updateConfigField('operation', e.target.value)}
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none"
                  >
                    <option value="create_issue">Create Issue</option>
                    <option value="list_pull_requests">List Open Pull Requests</option>
                    <option value="trigger_workflow">Trigger Repository Dispatch</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Issue Title / Payload</label>
                  <input
                    type="text"
                    value={localConfig.title || ''}
                    onChange={(e) => updateConfigField('title', e.target.value)}
                    placeholder="[Automated Bug/Task] {{ $json.title }}"
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none font-mono"
                  />
                </div>
              </div>
            )}

            {/* Notion Node */}
            {data.typeId === 'notion_database' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Notion Database ID</label>
                  <input
                    type="text"
                    value={localConfig.databaseId || ''}
                    onChange={(e) => updateConfigField('databaseId', e.target.value)}
                    placeholder="32-character Notion Database ID"
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Page Title</label>
                  <input
                    type="text"
                    value={localConfig.pageTitle || ''}
                    onChange={(e) => updateConfigField('pageTitle', e.target.value)}
                    placeholder="Summary Record: {{ $json.summary }}"
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none font-mono"
                  />
                </div>
              </div>
            )}

            {/* Autonomous Multi-Turn Agentic Loop */}
            {data.typeId === 'agentic_tool_caller' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Agent High-Level Goal</label>
                  <textarea
                    rows={3}
                    value={localConfig.goal || 'Analyze incoming events, verify conflict on Google Calendar, and notify Slack if urgent.'}
                    onChange={(e) => updateConfigField('goal', e.target.value)}
                    placeholder="Describe autonomous objective..."
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md p-2 text-xs text-slate-200 font-mono outline-none resize-none leading-relaxed"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Reasoning Model</label>
                  <select
                    value={localConfig.model || 'gemini-3.1-pro-preview'}
                    onChange={(e) => updateConfigField('model', e.target.value)}
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none"
                  >
                    <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro Preview (Deep Tool Calling)</option>
                    <option value="gemini-3.6-flash">Gemini 3.6 Flash (Fast Agent Loop)</option>
                    <option value="deepseek-r1">DeepSeek-R1 (Local Ollama Reasoning)</option>
                    <option value="gpt-4o">OpenAI GPT-4o (Autonomous Function Calling)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-mono">Allowed Tools in Loop</label>
                  <div className="space-y-1.5">
                    {['Google Calendar', 'Web Search Grounding', 'JavaScript Code Sandbox', 'Slack Dispatcher', 'Notion Database'].map(tool => (
                      <label key={tool} className="flex items-center gap-2 p-1.5 bg-[#18181b] border border-white/5 rounded text-xs text-slate-300 cursor-pointer hover:border-white/10">
                        <input
                          type="checkbox"
                          defaultChecked={true}
                          className="w-3.5 h-3.5 rounded accent-blue-600"
                        />
                        <span>{tool}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Max Autonomous Turns</label>
                  <input
                    type="number"
                    value={localConfig.maxTurns || 5}
                    onChange={(e) => updateConfigField('maxTurns', Number(e.target.value))}
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none font-mono"
                  />
                </div>
              </div>
            )}

            {/* Vector DB Query Node (RAG) */}
            {data.typeId === 'vector_db_query' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Collection Name</label>
                  <input
                    type="text"
                    value={localConfig.collection || 'enterprise_knowledge_base'}
                    onChange={(e) => updateConfigField('collection', e.target.value)}
                    placeholder="enterprise_knowledge_base"
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Semantic Search Query</label>
                  <textarea
                    rows={3}
                    value={localConfig.query || '{{ $json.summary }}'}
                    onChange={(e) => updateConfigField('query', e.target.value)}
                    placeholder="Search query or {{ $json.query }}"
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md p-2 text-xs text-slate-200 font-mono outline-none resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Top K</label>
                    <input
                      type="number"
                      value={localConfig.topK || 3}
                      onChange={(e) => updateConfigField('topK', Number(e.target.value))}
                      className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Min Similarity</label>
                    <input
                      type="number"
                      step="0.05"
                      value={localConfig.minScore || 0.75}
                      onChange={(e) => updateConfigField('minScore', Number(e.target.value))}
                      className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Document Embedder Node */}
            {data.typeId === 'document_embedder' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Target Collection</label>
                  <input
                    type="text"
                    value={localConfig.collection || 'enterprise_knowledge_base'}
                    onChange={(e) => updateConfigField('collection', e.target.value)}
                    placeholder="enterprise_knowledge_base"
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Document Content</label>
                  <textarea
                    rows={4}
                    value={localConfig.documentText || '{{ $json.content }}'}
                    onChange={(e) => updateConfigField('documentText', e.target.value)}
                    placeholder="Text content or {{ $json.body }}"
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md p-2 text-xs text-slate-200 font-mono outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Chunk Size (Tokens)</label>
                  <input
                    type="number"
                    value={localConfig.chunkSize || 512}
                    onChange={(e) => updateConfigField('chunkSize', Number(e.target.value))}
                    className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none font-mono"
                  />
                </div>
              </div>
            )}

            {/* Visual Upstream Variable Pill Mapper Accordion */}
            <div className="pt-2 border-t border-white/10">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono flex items-center justify-between">
                <span>Upstream Variable Pills</span>
                <span className="text-[9px] text-blue-400 font-normal">Click to copy</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  '{{ $json.summary }}',
                  '{{ $json.response }}',
                  '{{ $json.events }}',
                  '{{ $json.eventCount }}',
                  '{{ $json.status }}',
                  '{{ $json.condition }}',
                  '{{ $json.message }}',
                  '{{ $json.title }}'
                ].map((pill) => (
                  <button
                    key={pill}
                    type="button"
                    onClick={() => handleCopyJson(pill)}
                    className="text-[10px] font-mono bg-white/5 hover:bg-blue-600/20 text-slate-300 hover:text-blue-300 border border-white/10 hover:border-blue-500/30 px-2 py-1 rounded transition-all flex items-center gap-1"
                    title="Copy pill"
                  >
                    <span>{pill}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reliability: retry & continue-on-error (non-trigger nodes) */}
        {activeTab === 'params' && data.category !== 'trigger' && (
          <div className="p-3 rounded-lg bg-[#141418] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Reliability</label>
              <label className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={localConfig.retry?.continueOnError === true}
                  onChange={(e) => updateConfigField('retry', { ...(localConfig.retry || {}), continueOnError: e.target.checked })}
                  className="accent-emerald-500 w-3 h-3"
                />
                Continue on error
              </label>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">
                Max Attempts (1–5)
              </label>
              <input
                type="number"
                min={1}
                max={5}
                value={localConfig.retry?.maxAttempts ?? 1}
                onChange={(e) => updateConfigField('retry', { ...(localConfig.retry || {}), maxAttempts: Math.max(1, Math.min(5, Number(e.target.value) || 1)) })}
                className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">
                Base Backoff Delay (ms)
              </label>
              <input
                type="number"
                min={0}
                max={10000}
                step={100}
                value={localConfig.retry?.baseDelayMs ?? 500}
                onChange={(e) => updateConfigField('retry', { ...(localConfig.retry || {}), baseDelayMs: Math.max(0, Math.min(10000, Number(e.target.value) || 0)) })}
                className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none font-mono"
              />
              <p className="text-[10px] text-slate-500 mt-1.5">Exponential backoff with jitter: 500ms → 1s → 2s → 4s…</p>
            </div>
          </div>
        )}

        {/* TAB 2: TEST STEP */}
        {activeTab === 'test' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">Input Payload (JSON)</span>
              <button
                onClick={handleRunSingleTest}
                disabled={isTestingThis}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20"
              >
                {isTestingThis ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>Test This Step</span>
              </button>
            </div>

            <textarea
              rows={6}
              value={testInputPayload}
              onChange={(e) => setTestInputPayload(e.target.value)}
              className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md p-3 text-xs text-slate-200 font-mono outline-none resize-none leading-relaxed"
            />

            {testError && (
              <div className="p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
                {testError}
              </div>
            )}

            {testResult && (
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Step Passed</span>
                  </div>
                  <span className="text-slate-400">{testResult.durationMs}ms</span>
                </div>

                {testResult.branchTaken && (
                  <div className="text-[10px] font-mono text-slate-400 bg-white/5 p-1.5 rounded border border-white/5">
                    Branch: <span className="text-emerald-400 uppercase font-bold">{testResult.branchTaken}</span>
                  </div>
                )}

                <div className="relative">
                  <pre className="p-3 bg-black/60 border border-white/5 rounded-md text-[11px] text-emerald-400 font-mono overflow-x-auto max-h-48">
                    {JSON.stringify(testResult.outputPayload, null, 2)}
                  </pre>
                  <button
                    onClick={() => handleCopyJson(testResult.outputPayload)}
                    className="absolute top-2 right-2 p-1.5 rounded bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-mono flex items-center gap-1"
                  >
                    {copiedPayload ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: OUTPUT SCHEMA */}
        {activeTab === 'output' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">Execution Output</span>
              {data.lastRunOutput && (
                <button
                  onClick={() => handleCopyJson(data.lastRunOutput)}
                  className="flex items-center gap-1 text-[10px] font-mono text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/20 transition-colors"
                >
                  {copiedPayload ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPayload ? 'Copied' : 'Copy JSON'}</span>
                </button>
              )}
            </div>

            {data.lastRunOutput ? (
              <pre className="p-3 bg-black/60 border border-white/5 rounded-md text-[11px] text-emerald-400 font-mono overflow-x-auto max-h-80">
                {JSON.stringify(data.lastRunOutput, null, 2)}
              </pre>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs font-mono bg-[#141418] rounded-md border border-white/5">
                No run output recorded yet. Run the workflow or click "Test Step" to generate output.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Save Action */}
      <div className="p-4 border-t border-white/10 bg-[#09090b]">
        <button
          onClick={handleSave}
          className={`w-full py-2 px-4 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            savedSuccess
              ? 'bg-emerald-600 text-white shadow-emerald-600/30 shadow-md'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20'
          }`}
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>Properties Saved!</span>
            </>
          ) : (
            <span>Save Node Properties</span>
          )}
        </button>
      </div>
    </aside>
  );
};

