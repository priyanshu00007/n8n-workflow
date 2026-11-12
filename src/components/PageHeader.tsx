import React, { useState } from 'react';
import { 
  Workflow, 
  Activity, 
  Layers, 
  Bot, 
  Store, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Cpu, 
  Search,
  SlidersHorizontal,
  ChevronRight,
  Zap,
  Tag,
  TrendingUp,
  Save,
  Loader2,
  BrainCircuit
} from 'lucide-react';
import { useWorkflowStore } from '../store/useWorkflowStore';
import { SYSTEM_MCP_TOOLS } from '../data/mcpTools';

export const PageHeader: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    workflowTitle, 
    setWorkflowTitle, 
    nodes = [],
    executionHistory = [],
    setIsAiModalOpen,
    saveWorkflowToServer,
    isSavingWorkflow
  } = useWorkflowStore();

  const [saveState, setSaveState] = useState<'idle' | 'ok' | 'err'>('idle');

  const handleSave = async () => {
    const ok = await saveWorkflowToServer();
    setSaveState(ok ? 'ok' : 'err');
    setTimeout(() => setSaveState('idle'), 2000);
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp, badge: 'Insights' },
    { id: 'canvas', label: 'Canvas Builder', icon: Workflow, badge: `${(nodes || []).length} Nodes` },
    { id: 'executions', label: 'Executions & Traces', icon: Activity, badge: `${(executionHistory || []).length} Runs` },
    { id: 'mcp', label: 'MCP Tools', icon: Layers, badge: `${SYSTEM_MCP_TOOLS.length} Tools` },
    { id: 'agents', label: 'ADK Agents', icon: Bot, badge: '3 Swarm' },
    { id: 'playground', label: 'Model Lab', icon: BrainCircuit, badge: 'qwen2.5:0.5b' },
    { id: 'marketplace', label: 'Templates', icon: Store, badge: 'Featured' }
  ] as const;

  return (
    <div className="bg-[#0c0c0e] border-b border-white/10 select-none z-20">
      {/* Primary Page Navigation Tabs */}
      <div className="px-6 pt-2 pb-0 flex items-center justify-between border-b border-white/5">
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all relative ${
                  isActive
                    ? 'text-blue-400 border-blue-500 bg-white/[0.03]'
                    : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-white/[0.02]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  isActive 
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                    : 'bg-white/5 text-slate-500 border border-white/5'
                }`}>
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Quick Context Action */}
        <div className="hidden md:flex items-center gap-2 py-2 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded border border-emerald-500/20 text-[10px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            SYSTEM ONLINE
          </span>
        </div>
      </div>

      {/* Contextual Sub-Header per View */}
      <div className="px-4 sm:px-6 py-2.5 bg-[#09090b]/80 flex flex-wrap items-center justify-between gap-3">
        {/* Dashboard Sub-Header */}
        {activeTab === 'dashboard' && (
          <div className="flex flex-wrap items-center justify-between w-full gap-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold text-slate-200">System Performance Metrics</span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="text-xs text-slate-400 hidden sm:inline">Monitoring real-time latency, success rates, and execution stability</span>
            </div>
          </div>
        )}

        {/* Playground (Model Lab) Sub-Header */}
        {activeTab === 'playground' && (
          <div className="flex flex-wrap items-center justify-between w-full gap-2">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-semibold text-slate-200">Local Model Playground</span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="text-xs text-slate-400 hidden sm:inline">Chat with locally-pulled Ollama models — 100% private, streaming responses</span>
            </div>
          </div>
        )}

        {/* Canvas Sub-Header */}
        {activeTab === 'canvas' && (
          <div className="flex flex-wrap items-center justify-between w-full gap-2">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-[200px]">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono">Workflow:</span>
              <input
                type="text"
                value={workflowTitle}
                onChange={(e) => setWorkflowTitle(e.target.value)}
                className="bg-[#18181b] hover:bg-white/10 focus:bg-white/10 border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1 text-xs font-semibold text-slate-100 outline-none transition-all w-48 sm:w-72 truncate"
                placeholder="Workflow Title..."
              />
              <span className="hidden md:inline text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                Saved Local
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={isSavingWorkflow}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md border text-xs font-medium transition-all ${
                  saveState === 'ok'
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : saveState === 'err'
                    ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                    : 'bg-blue-500/10 text-blue-300 border-blue-500/30 hover:bg-blue-500/20'
                }`}
              >
                {isSavingWorkflow ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saveState === 'ok' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                <span>{isSavingWorkflow ? 'Saving...' : saveState === 'ok' ? 'Saved to DB' : saveState === 'err' ? 'DB Unavailable' : 'Save Workflow'}</span>
              </button>
              <button
                onClick={() => setIsAiModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-medium transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>AI Prompt Flow</span>
              </button>
            </div>
          </div>
        )}

        {/* Executions Sub-Header */}
        {activeTab === 'executions' && (
          <div className="flex flex-wrap items-center justify-between w-full gap-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold text-slate-200">Audit Logs & Execution Telemetry</span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="text-xs text-slate-400 hidden sm:inline">Inspecting step outputs, latency metrics, and payload triggers</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400 text-[11px]">Filter:</span>
              <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 text-[10px] font-bold">
                Passed ({executionHistory.filter(r => r.status === 'completed').length})
              </span>
              <span className="bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded border border-rose-500/20 text-[10px] font-bold">
                Failed ({executionHistory.filter(r => r.status === 'failed').length})
              </span>
            </div>
          </div>
        )}

        {/* MCP Tools Sub-Header */}
        {activeTab === 'mcp' && (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-semibold text-slate-200">Model Context Protocol (MCP) Tool Explorer</span>
              <span className="text-slate-600">|</span>
              <span className="text-xs text-slate-400">Open Standard tool definitions for Gemini AI models</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span className="bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded border border-sky-500/20 font-bold">
                JSON-RPC 2.0 Spec
              </span>
            </div>
          </div>
        )}

        {/* ADK Agents Sub-Header */}
        {activeTab === 'agents' && (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold text-slate-200">Google ADK Autonomous Multi-Agent Mesh</span>
              <span className="text-slate-600">|</span>
              <span className="text-xs text-slate-400">Reasoning loops with Search Grounding & Code Sandboxes</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20 font-bold">
                Gemini 3.6 Flash / 3.1 Pro
              </span>
            </div>
          </div>
        )}

        {/* Marketplace Sub-Header */}
        {activeTab === 'marketplace' && (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-slate-200">Workflow Template Marketplace</span>
              <span className="text-slate-600">|</span>
              <span className="text-xs text-slate-400">Instantly launch verified Google Calendar & AI agent templates</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                5 Verified Blueprint Flow Patterns
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
