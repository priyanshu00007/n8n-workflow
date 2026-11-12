import React, { useState } from 'react';
import { 
  Layers, 
  Calendar, 
  Search, 
  Code, 
  Globe, 
  Play, 
  Check, 
  Plus, 
  Sparkles, 
  Loader2,
  Terminal,
  ShieldCheck
} from 'lucide-react';
import { SYSTEM_MCP_TOOLS } from '../../data/mcpTools';
import { McpTool } from '../../types';

export const McpRegistryView: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<McpTool>(SYSTEM_MCP_TOOLS[0]);
  const [inputPayload, setInputPayload] = useState<string>(
    JSON.stringify(SYSTEM_MCP_TOOLS[0].exampleInput, null, 2)
  );
  const [testOutput, setTestOutput] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleSelectTool = (tool: McpTool) => {
    setSelectedTool(tool);
    setInputPayload(JSON.stringify(tool.exampleInput, null, 2));
    setTestOutput(null);
  };

  const handleRunTool = async () => {
    setIsExecuting(true);
    setTestOutput(null);

    try {
      let parsedArgs = {};
      try {
        parsedArgs = JSON.parse(inputPayload);
      } catch (err) {
        throw new Error('Invalid JSON input format');
      }

      // Execute endpoint corresponding to MCP tool
      if (selectedTool.id === 'google_calendar_list_events') {
        const res = await fetch('/api/calendar/events');
        const data = await res.json();
        setTestOutput(data);
      } else if (selectedTool.id === 'google_calendar_create_event') {
        const res = await fetch('/api/calendar/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsedArgs)
        });
        const data = await res.json();
        setTestOutput(data);
      } else {
        // Fallback test runner
        setTestOutput({
          status: 'success',
          mcpToolExecuted: selectedTool.name,
          receivedArguments: parsedArgs,
          timestamp: new Date().toISOString()
        });
      }
    } catch (err: any) {
      setTestOutput({ status: 'error', error: err.message });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden bg-[#09090b] p-4 lg:p-6 gap-6">
      {/* Tool List Sidebar */}
      <div className="w-full lg:w-80 bg-[#0c0c0e] border border-white/5 rounded-xl p-4 flex flex-col gap-4 max-h-72 lg:max-h-full overflow-hidden shadow-xl flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold text-xs text-slate-100 uppercase tracking-tight">MCP Tool Registry</h3>
          </div>
          <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">
            v1.0 Standard
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {SYSTEM_MCP_TOOLS.map((tool) => {
            const isSelected = selectedTool.id === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => handleSelectTool(tool)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-[#18181b] border-blue-500/50 shadow-md'
                    : 'bg-white/5 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-200">{tool.name}</span>
                  <span className="text-[10px] font-mono text-slate-500">{tool.version}</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                  {tool.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tool Test Sandbox & Documentation */}
      <div className="flex-1 bg-[#0c0c0e] border border-white/5 rounded-xl p-4 lg:p-6 flex flex-col overflow-y-auto shadow-xl min-h-[500px]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/5 mb-6 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-100">{selectedTool.name}</h2>
              <span className="text-[10px] uppercase font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">
                {selectedTool.category}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{selectedTool.description}</p>
          </div>

          <button
            onClick={handleRunTool}
            disabled={isExecuting}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md shadow-blue-600/20 w-full sm:w-auto"
          >
            {isExecuting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>Execute Tool Call</span>
          </button>
        </div>

        {/* Workspace Parameters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-[300px]">
          {/* Inputs */}
          <div className="flex flex-col gap-3 min-h-[200px]">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              <span>Input Parameters (JSON)</span>
            </h4>
            <textarea
              value={inputPayload}
              onChange={(e) => setInputPayload(e.target.value)}
              className="flex-1 min-h-[160px] bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md p-3.5 text-xs text-slate-200 font-mono outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Execution Response */}
          <div className="flex flex-col gap-3 min-h-[200px]">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tool Response Output</span>
            </h4>
            <div className="flex-1 min-h-[160px] bg-black/50 border border-white/5 rounded-md p-3.5 overflow-y-auto">
              {!testOutput ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">
                  Click "Execute Tool Call" to trigger execution
                </div>
              ) : (
                <pre className="text-xs font-mono text-emerald-400 leading-relaxed">
                  {JSON.stringify(testOutput, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
