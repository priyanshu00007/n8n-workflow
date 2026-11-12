import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  BrainCircuit,
  Send,
  Loader2,
  Trash2,
  Server,
  Wrench,
  Eye,
  MessageSquare,
  Gauge,
  Zap,
  Database,
  AlertTriangle,
  Sparkles,
  Cpu,
  RotateCcw,
  User,
  Workflow,
  Download,
  RefreshCw
} from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { Node } from '@xyflow/react';
import { WorkflowNodeData } from '../../types';

interface LocalModelInfo {
  name: string;
  sizeBytes?: number;
  size?: string;
  params?: string;
  quantization?: string;
  family?: string;
  contextLength?: number;
  capabilities?: string[];
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  stats?: {
    totalDurationMs?: number;
    evalTokens?: number;
    tokensPerSecond?: number | null;
  };
}

const DEFAULT_MODEL = 'qwen2.5:0.5b';

const QUICK_PROMPTS = [
  { label: 'Summarize text', text: 'Summarize the following in 3 crisp bullet points:\n\nThe Nexus Flow platform executes workflow DAGs with conditional branching, local Ollama models, and multi-cloud LLM routing.' },
  { label: 'Draft Slack alert', text: 'Draft a short Slack alert for the on-call team: the news-digest workflow failed at the Ollama step with a 500 error. Keep it under 40 words.' },
  { label: 'Explain a workflow', text: 'Explain in simple words how a webhook-triggered workflow with an IF condition and two branches works.' },
  { label: 'Extract JSON', text: 'Extract the key entities as compact JSON (name, date, action) from: "Priyanshu scheduled a review meeting on Friday to deploy the news digest flow".' }
];

function formatContext(len?: number): string {
  if (!len) return '';
  if (len >= 1000) return `${(len / 1000).toFixed(len % 1000 === 0 ? 0 : 1)}k ctx`;
  return `${len} ctx`;
}

export const PlaygroundView: React.FC = () => {
  const { addNode, setActiveTab, nodes: canvasNodes } = useWorkflowStore();

  const [models, setModels] = useState<LocalModelInfo[]>([]);
  const [ollamaOk, setOllamaOk] = useState<boolean | null>(null);
  const [endpoint, setEndpoint] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL);
  const [systemPrompt, setSystemPrompt] = useState('You are a precise AI assistant running fully offline via Ollama. Be concise.');
  const [temperature, setTemperature] = useState(0.7);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const refreshModels = useCallback(async () => {
    try {
      const res = await fetch('/api/models');
      const data = await res.json();
      const detailed: LocalModelInfo[] = data.local?.modelsDetailed || [];
      setModels(detailed);
      setOllamaOk(!!data.local?.ok);
      setEndpoint(data.local?.endpoint || '');
      setSelectedModel((prev) => {
        if (data.local?.recommended && detailed.some((m) => m.name === data.local.recommended)) return data.local.recommended;
        if (detailed.some((m) => m.name === prev)) return prev;
        return detailed[0]?.name || DEFAULT_MODEL;
      });
    } catch {
      setOllamaOk(false);
    }
  }, []);

  // Initial load + auto-refresh every 30s (picks up newly pulled models)
  useEffect(() => {
    refreshModels();
    const id = setInterval(refreshModels, 30000);
    return () => clearInterval(id);
  }, [refreshModels]);

  // Auto-scroll to the newest token
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, isStreaming]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
  }, []);

  const clearChat = () => {
    stopStreaming();
    setMessages([]);
    setStreamError(null);
  };

  // Bridge: drop the current model + system prompt onto the workflow canvas
  // as a ready-to-run ollama_local_model node.
  const sendToCanvas = () => {
    const id = 'node-' + Date.now().toString(36);
    const newNode: Node<WorkflowNodeData> = {
      id,
      type: 'customNode',
      position: {
        x: 250 + (canvasNodes.length % 3) * 60,
        y: 120 + (canvasNodes.length % 4) * 60
      },
      data: {
        label: `Ollama: ${selectedModel}`,
        category: 'agent',
        typeId: 'ollama_local_model',
        iconName: 'Server',
        description: `Local model from Model Lab — ${models.find((m) => m.name === selectedModel)?.params || 'configurable'}`,
        config: {
          model: selectedModel,
          ollamaUrl: endpoint || 'http://localhost:11434',
          systemPrompt,
          prompt: 'Process the incoming data: {{ $json }}',
          temperature
        }
      }
    };
    addNode(newNode);
    setActiveTab('canvas');
  };

  // Export the full conversation (incl. per-message stats) as JSON
  const exportChat = () => {
    const payload = {
      model: selectedModel,
      systemPrompt,
      temperature,
      exportedAt: new Date().toISOString(),
      messages
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `model-lab-chat-${selectedModel.replace(/[:.]/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sendMessage = useCallback(async (rawText?: string) => {
    const text = (rawText ?? input).trim();
    if (!text || isStreaming) return;

    setInput('');
    setStreamError(null);
    const history = [...messages, { role: 'user' as const, content: text }];
    setMessages([...history, { role: 'assistant', content: '' }]);
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const payloadMessages = [
        ...(systemPrompt.trim() ? [{ role: 'system', content: systemPrompt.trim() }] : []),
        ...history.map((m) => ({ role: m.role, content: m.content }))
      ];

      const res = await fetch('/api/ollama/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: selectedModel, messages: payloadMessages, temperature, stream: true }),
        signal: controller.signal
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      // Parse Ollama NDJSON stream: one JSON object per line
      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response stream');
      const decoder = new TextDecoder();
      let buffer = '';
      let finalStats: ChatMessage['stats'] = undefined;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          let evt: any;
          try { evt = JSON.parse(trimmed); } catch { continue; }
          if (evt.error) throw new Error(evt.error);
          const delta: string = evt.message?.content || '';
          if (delta) {
            setMessages((prev) => {
              const next = [...prev];
              const last = next[next.length - 1];
              if (last?.role === 'assistant') next[next.length - 1] = { ...last, content: last.content + delta };
              return next;
            });
          }
          if (evt.done) {
            finalStats = {
              totalDurationMs: Math.round((evt.total_duration || 0) / 1e6),
              evalTokens: evt.eval_count || 0,
              tokensPerSecond: evt.eval_count && evt.eval_duration
                ? Number(((evt.eval_count / evt.eval_duration) * 1e9).toFixed(1))
                : null
            };
          }
        }
      }

      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.role === 'assistant') next[next.length - 1] = { ...last, stats: finalStats };
        return next;
      });
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        setMessages((prev) => prev.filter((m) => m.content !== ''));
      } else {
        setStreamError(err?.message || 'Failed to reach the local model');
      }
    } finally {
      abortRef.current = null;
      setIsStreaming(false);
    }
  }, [input, isStreaming, messages, selectedModel, systemPrompt, temperature]);

  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* ── Left Sidebar: Model Cards & Controls ── */}
      <aside className="hidden lg:flex w-72 xl:w-80 flex-col border-r border-white/10 bg-[#0c0c0e] overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Engine status */}
          <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-semibold border ${
            ollamaOk === true
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : ollamaOk === false
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                : 'bg-white/5 text-slate-400 border-white/10'
          }`}>
            <Server className="w-3.5 h-3.5" />
            <span className="flex-1 truncate">
              {ollamaOk === true ? `OLLAMA ONLINE · ${endpoint.replace(/^https?:\/\//, '')}` : ollamaOk === false ? 'OLLAMA OFFLINE' : 'CHECKING…'}
            </span>
            {ollamaOk === true && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
          </div>

          {/* Model cards */}
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-mono flex items-center gap-1.5">
              <Cpu className="w-3 h-3" /> Local Models ({models.length})
            </div>
            {ollamaOk === false ? (
              <div className="rounded-lg bg-rose-500/5 border border-rose-500/20 p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-300">
                  <AlertTriangle className="w-3.5 h-3.5" /> Ollama unreachable
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Run <code className="text-rose-300 font-mono">ollama serve</code> locally, or start the Docker stack:
                  <code className="block mt-1 text-rose-300 font-mono">docker compose up -d</code>
                </p>
              </div>
            ) : models.length === 0 ? (
              <div className="rounded-lg bg-white/5 border border-white/10 p-3 text-[10px] text-slate-400 leading-relaxed">
                No models pulled yet. Pull one with:
                <code className="block mt-1 text-blue-300 font-mono">ollama pull qwen2.5:0.5b</code>
              </div>
            ) : (
              <div className="space-y-2">
                {models.map((m) => {
                  const active = selectedModel === m.name;
                  return (
                    <button
                      key={m.name}
                      onClick={() => setSelectedModel(m.name)}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all group ${
                        active
                          ? 'bg-violet-500/10 border-violet-500/40 shadow-sm shadow-violet-500/10'
                          : 'bg-white/[0.03] border-white/10 hover:border-violet-500/30 hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[11px] font-bold font-mono truncate ${active ? 'text-violet-200' : 'text-slate-200'}`}>
                          {m.name}
                        </span>
                        {m.name === DEFAULT_MODEL && (
                          <span className="shrink-0 text-[8px] font-bold uppercase px-1 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-1 mt-1.5">
                        {m.params && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                            {m.params}
                          </span>
                        )}
                        {m.size && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
                            {m.size}
                          </span>
                        )}
                        {m.quantization && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
                            {m.quantization}
                          </span>
                        )}
                        {m.contextLength ? (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
                            {formatContext(m.contextLength)}
                          </span>
                        ) : null}
                      </div>
                      {(m.capabilities?.length || 0) > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {m.capabilities?.map((c) => (
                            <span key={c} className="flex items-center gap-0.5 text-[9px] font-mono px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                              {c === 'tools' ? <Wrench className="w-2.5 h-2.5" /> : c === 'vision' ? <Eye className="w-2.5 h-2.5" /> : <MessageSquare className="w-2.5 h-2.5" />}
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sampling controls */}
          <div className="space-y-3 pt-1">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <Gauge className="w-3 h-3" /> Sampling
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">System Prompt</label>
              <textarea
                rows={3}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full bg-[#18181b] border border-white/10 focus:border-violet-500/50 rounded-md p-2 text-[11px] text-slate-200 font-mono outline-none resize-none leading-relaxed"
              />
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                <span>Temperature</span>
                <span className="text-violet-300">{temperature.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-violet-500"
              />
            </div>
          </div>
        </div>
      </aside>

      {/* ── Right: Chat Area ── */}
      <section className="flex-1 flex flex-col min-w-0 bg-[#09090b]">
        {/* Chat header */}
        <div className="h-11 border-b border-white/10 px-4 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <BrainCircuit className="w-4 h-4 text-violet-400 shrink-0" />
            <span className="text-xs font-bold text-slate-200 truncate">{selectedModel}</span>
            <span className="hidden sm:inline text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">
              local · private · streaming
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={refreshModels}
              disabled={isStreaming}
              className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-40"
              title="Refresh local model list"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={exportChat}
              disabled={messages.length === 0}
              className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Export conversation as JSON"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={sendToCanvas}
              disabled={ollamaOk === false}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 text-violet-300 text-[11px] font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Add this model + system prompt to the workflow canvas"
            >
              <Workflow className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send to Canvas</span>
            </button>
            <button
              onClick={clearChat}
              disabled={messages.length === 0}
              className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[11px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Clear conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-600/20 mb-4">
                <BrainCircuit className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-base font-bold text-slate-100">Model Lab — chat with your local LLM</h2>
              <p className="text-xs text-slate-400 mt-1.5 max-w-sm leading-relaxed">
                Every token runs on <span className="font-mono text-violet-300">{selectedModel}</span> inside Ollama.
                Nothing leaves your machine. Tune the system prompt & temperature on the left, then send a message.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-5 max-w-md">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => sendMessage(p.text)}
                    disabled={ollamaOk === false || isStreaming}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-violet-500/10 hover:border-violet-500/40 border border-white/10 text-[11px] text-slate-300 hover:text-violet-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Sparkles className="w-3 h-3 text-violet-400" />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((m, i) => (
                m.role === 'user' ? (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[85%] flex items-start gap-2">
                      <div className="bg-blue-600 text-white rounded-2xl rounded-tr-md px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap break-words">
                        {m.content}
                      </div>
                      <div className="w-6 h-6 shrink-0 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
                        <User className="w-3 h-3 text-slate-300" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={i} className="flex justify-start">
                    <div className="max-w-[85%] flex items-start gap-2">
                      <div className={`w-6 h-6 shrink-0 rounded-lg flex items-center justify-center ${
                        m.content ? 'bg-violet-500/20 border border-violet-500/30' : 'bg-violet-500/10 border border-violet-500/20'
                      }`}>
                        {m.content ? <BrainCircuit className="w-3 h-3 text-violet-300" /> : <Loader2 className="w-3 h-3 text-violet-300 animate-spin" />}
                      </div>
                      <div className="min-w-0">
                        <div className="bg-[#18181b] border border-white/10 rounded-2xl rounded-tl-md px-3.5 py-2.5 text-xs text-slate-100 leading-relaxed whitespace-pre-wrap break-words">
                          {m.content || ''}
                          {isStreaming && i === messages.length - 1 && m.content && (
                            <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-violet-400 animate-pulse align-text-bottom rounded-sm" />
                          )}
                        </div>
                        {m.stats?.tokensPerSecond != null && (
                          <div className="flex flex-wrap items-center gap-2 mt-1 px-1 text-[9px] font-mono text-slate-500">
                            <span className="flex items-center gap-1 text-emerald-400">
                              <Zap className="w-2.5 h-2.5" /> {m.stats.tokensPerSecond} tok/s
                            </span>
                            {m.stats.evalTokens != null && <span>{m.stats.evalTokens} tokens</span>}
                            {m.stats.totalDurationMs != null && <span>{(m.stats.totalDurationMs / 1000).toFixed(1)}s</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              ))}
              {streamError && (
                <div className="max-w-3xl mx-auto flex items-start gap-2 rounded-lg bg-rose-500/5 border border-rose-500/20 px-3 py-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-rose-200 leading-relaxed">
                    <span className="font-semibold">{streamError}</span>
                    <p className="text-slate-400 mt-0.5">
                      Make sure Ollama is running and the model is pulled: <code className="font-mono text-rose-300">ollama pull {selectedModel}</code>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-white/10 p-3 shrink-0 bg-[#0c0c0e]">
          <div className="max-w-3xl mx-auto">
            {/* Quick prompts (when chat started) */}
            {messages.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {QUICK_PROMPTS.slice(0, 4).map((p) => (
                  <button
                    key={p.label}
                    onClick={() => sendMessage(p.text)}
                    disabled={isStreaming || ollamaOk === false}
                    className="text-[10px] font-mono px-2 py-1 rounded bg-white/5 hover:bg-violet-500/10 border border-white/10 text-slate-400 hover:text-violet-200 transition-colors disabled:opacity-40"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-end gap-2 bg-[#18181b] border border-white/10 focus-within:border-violet-500/50 rounded-xl p-2 transition-colors">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={ollamaOk === false ? 'Ollama is offline — start it first…' : `Message ${selectedModel}…  (Enter to send, Shift+Enter for newline)`}
                disabled={ollamaOk === false}
                className="flex-1 bg-transparent text-xs text-slate-100 placeholder:text-slate-500 outline-none resize-none leading-relaxed max-h-32 disabled:cursor-not-allowed"
                style={{ height: Math.min(input.split('\n').length * 20 + 8, 128) }}
              />
              {isStreaming ? (
                <button
                  onClick={stopStreaming}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-600/20 border border-rose-500/30 text-rose-300 text-xs font-bold hover:bg-rose-600/30 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Stop
                </button>
              ) : (
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || ollamaOk === false}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md shadow-violet-600/20 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" /> Send
                </button>
              )}
            </div>
            {lastAssistant?.stats && (
              <div className="flex items-center gap-3 mt-2 px-1 text-[9px] font-mono text-slate-600">
                <Database className="w-2.5 h-2.5" />
                <span>last response: {lastAssistant.stats.evalTokens ?? 0} tokens · {lastAssistant.stats.tokensPerSecond ?? '–'} tok/s · {(lastAssistant.stats.totalDurationMs ?? 0) / 1000 > 0 ? `${((lastAssistant.stats.totalDurationMs ?? 0) / 1000).toFixed(1)}s total` : ''}</span>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
