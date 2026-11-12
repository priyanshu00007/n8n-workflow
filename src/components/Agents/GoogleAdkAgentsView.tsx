import React, { useState } from 'react';
import { 
  Bot, 
  Search, 
  Calendar, 
  ShieldCheck, 
  Sparkles, 
  Cpu, 
  Sliders, 
  Layers,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { GoogleAdkAgent } from '../../types';

const INITIAL_ADK_AGENTS: GoogleAdkAgent[] = [
  {
    id: 'agent-coordinator',
    name: 'Master Orchestration Agent',
    role: 'Orchestrator',
    description: 'Decomposes complex requests into sub-tasks and delegates to specialized sub-agents.',
    model: 'gemini-3.6-flash',
    systemPrompt: 'You are the Master Orchestrator in Google ADK. Plan execution topologies and delegate to Research and Calendar Agents.',
    assignedTools: ['search_grounding', 'google_calendar_list_events'],
    temperature: 0.2,
    capabilities: ['Task Decomposition', 'Sub-agent Delegation', 'State Merging']
  },
  {
    id: 'agent-workspace-calendar',
    name: 'Google Calendar Scheduling Agent',
    role: 'Workspace Executor',
    description: 'Directly manages Google Calendar events, resolves meeting conflicts, and drafts agenda invites.',
    model: 'gemini-3.6-flash',
    systemPrompt: 'You are the Calendar Agent. You specialize in analyzing free/busy slots and scheduling meetings.',
    assignedTools: ['google_calendar_list_events', 'google_calendar_create_event'],
    temperature: 0.1,
    capabilities: ['Calendar Parsing', 'Conflict Resolution', 'Invite Creation']
  },
  {
    id: 'agent-researcher',
    name: 'Grounded Web Research Agent',
    role: 'Fact Finder',
    description: 'Uses Google Search Grounding to fetch live facts and verify sources.',
    model: 'gemini-3.6-flash',
    systemPrompt: 'You are the Web Research Agent. Search live web sources and return concise factual bullet points with citations.',
    assignedTools: ['google_search_grounding'],
    temperature: 0.4,
    capabilities: ['Search Grounding', 'Fact Extraction', 'URL Citations']
  },
  {
    id: 'agent-auditor',
    name: 'Compliance & Verification Auditor',
    role: 'Quality Auditor',
    description: 'Performs final safety, accuracy, and formatting verification before workflow output dispatch.',
    model: 'gemini-3.1-pro-preview',
    systemPrompt: 'You are the Quality Auditor. Ensure all generated summaries adhere to user preferences and contain no hallucinations.',
    assignedTools: ['python_js_code_executor'],
    temperature: 0.0,
    capabilities: ['Hallucination Check', 'Output Validation', 'Format Enforcement']
  }
];

export const GoogleAdkAgentsView: React.FC = () => {
  const [agents, setAgents] = useState<GoogleAdkAgent[]>(INITIAL_ADK_AGENTS);
  const [selectedAgent, setSelectedAgent] = useState<GoogleAdkAgent>(agents[0]);

  const updateAgentField = (field: keyof GoogleAdkAgent, value: any) => {
    setAgents(prev => prev.map(a => a.id === selectedAgent.id ? { ...a, [field]: value } : a));
    setSelectedAgent(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden bg-[#09090b] p-4 lg:p-6 gap-6">
      {/* Agent List Sidebar */}
      <div className="w-full lg:w-80 bg-[#0c0c0e] border border-white/5 rounded-xl p-4 flex flex-col gap-4 max-h-72 lg:max-h-full overflow-hidden shadow-xl flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold text-xs text-slate-100 uppercase tracking-tight">ADK Agent Swarm</h3>
          </div>
          <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">
            Google ADK
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {agents.map((agent) => {
            const isSelected = selectedAgent.id === agent.id;
            return (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-[#18181b] border-blue-500/50 shadow-md'
                    : 'bg-white/5 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-200">{agent.name}</span>
                  <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                    {agent.role}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                  {agent.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Agent Configurator & Topology */}
      <div className="flex-1 bg-[#0c0c0e] border border-white/5 rounded-xl p-4 lg:p-6 flex flex-col overflow-y-auto shadow-xl space-y-6">
        {/* Topology Network Visualizer */}
        <div className="bg-black/40 border border-white/5 rounded-lg p-4 overflow-x-auto">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>Agent Orchestration Mesh Topology</span>
          </h4>
          <div className="flex items-center justify-between gap-3 p-4 bg-[#18181b] rounded-md border border-white/5 min-w-[500px]">
            {agents.map((ag, idx) => (
              <React.Fragment key={ag.id}>
                <div className="flex flex-col items-center text-center p-3 bg-[#09090b] rounded-md border border-white/10 w-36">
                  <Bot className="w-5 h-5 text-blue-400 mb-1" />
                  <span className="text-xs font-semibold text-slate-200 line-clamp-1">{ag.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5">{ag.role}</span>
                </div>
                {idx < agents.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Selected Agent Editor */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">{selectedAgent.name}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{selectedAgent.description}</p>
            </div>
            <div className="text-xs font-mono text-blue-400 bg-blue-500/10 px-3 py-1 rounded-md border border-blue-500/20">
              {selectedAgent.model}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Agent Name</label>
              <input
                type="text"
                value={selectedAgent.name}
                onChange={(e) => updateAgentField('name', e.target.value)}
                className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Gemini Model</label>
              <select
                value={selectedAgent.model}
                onChange={(e) => updateAgentField('model', e.target.value)}
                className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none"
              >
                <option value="gemini-3.6-flash">gemini-3.6-flash (Fast)</option>
                <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Deep Reasoning)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">System Instructions / Persona</label>
            <textarea
              rows={4}
              value={selectedAgent.systemPrompt}
              onChange={(e) => updateAgentField('systemPrompt', e.target.value)}
              className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md p-3 text-xs text-slate-200 font-mono outline-none resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Capabilities & Skills</label>
            <div className="flex flex-wrap gap-2">
              {selectedAgent.capabilities.map((cap, i) => (
                <span key={i} className="text-xs bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>{cap}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
