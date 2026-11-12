import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Play, 
  ChevronRight, 
  Terminal, 
  Layers, 
  AlertTriangle,
  Loader2,
  Copy,
  Check,
  Filter
} from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { ExecutionRun, ExecutionStepLog } from '../../types';

export const ExecutionLogsView: React.FC = () => {
  const { executionHistory = [], activeExecutionRun, runCurrentWorkflow, isExecuting, fetchExecutionHistory } = useWorkflowStore();
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  useEffect(() => {
    fetchExecutionHistory();
  }, [fetchExecutionHistory]);
  const [copiedPayloadKey, setCopiedPayloadKey] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'failed'>('all');

  const history = executionHistory || [];
  const runsToDisplay = activeExecutionRun 
    ? [activeExecutionRun, ...history.filter(r => r.id !== activeExecutionRun.id)]
    : history;

  const filteredRuns = runsToDisplay.filter(run => {
    if (statusFilter === 'all') return true;
    return run.status === statusFilter;
  });

  const selectedRun: ExecutionRun | undefined = runsToDisplay.find(r => r.id === selectedRunId) || runsToDisplay[0];

  const handleCopy = (key: string, data: any) => {
    navigator.clipboard.writeText(typeof data === 'string' ? data : JSON.stringify(data, null, 2));
    setCopiedPayloadKey(key);
    setTimeout(() => setCopiedPayloadKey(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#09090b] p-4 sm:p-6 gap-4 sm:gap-6">
      {/* Runs History Sidebar */}
      <div className="w-full md:w-80 bg-[#0c0c0e] border border-white/10 rounded-xl p-4 flex flex-col gap-3 shadow-xl max-h-60 md:max-h-full overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-xs text-slate-100 uppercase tracking-tight font-mono">Execution Runs</h3>
          </div>
          <button
            onClick={runCurrentWorkflow}
            disabled={isExecuting}
            className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-blue-600/20"
          >
            {isExecuting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>Run Flow</span>
          </button>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1 bg-[#141418] p-1 rounded-lg border border-white/5 text-[11px] font-mono">
          <button
            onClick={() => setStatusFilter('all')}
            className={`flex-1 py-1 rounded text-center transition-all ${
              statusFilter === 'all' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({runsToDisplay.length})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`flex-1 py-1 rounded text-center transition-all ${
              statusFilter === 'completed' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Passed
          </button>
          <button
            onClick={() => setStatusFilter('failed')}
            className={`flex-1 py-1 rounded text-center transition-all ${
              statusFilter === 'failed' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Failed
          </button>
        </div>

        {filteredRuns.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <Clock className="w-8 h-8 mb-2 opacity-40 text-slate-400" />
            <p className="text-xs font-medium">No execution runs matched.</p>
            <p className="text-[11px] text-slate-600 mt-1">Click "Run Flow" to execute canvas workflow.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredRuns.map((run) => {
              const isSelected = selectedRun?.id === run.id;
              return (
                <button
                  key={run.id}
                  onClick={() => setSelectedRunId(run.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-[#18181b] border-blue-500/50 shadow-md'
                      : 'bg-white/5 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-200 truncate max-w-[160px]">
                      {run.workflowTitle}
                    </span>
                    {run.status === 'running' && (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded font-mono">
                        <Loader2 className="w-3 h-3 animate-spin" /> Running
                      </span>
                    )}
                    {run.status === 'completed' && (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono">
                        <CheckCircle2 className="w-3 h-3" /> Success
                      </span>
                    )}
                    {run.status === 'failed' && (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded font-mono">
                        <XCircle className="w-3 h-3" /> Failed
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>{new Date(run.startTime).toLocaleTimeString()}</span>
                    <span>{run.totalDurationMs ? `${run.totalDurationMs}ms` : 'In progress'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Execution Trace Detail */}
      <div className="flex-1 bg-[#0c0c0e] border border-white/10 rounded-xl p-4 sm:p-6 flex flex-col overflow-hidden shadow-xl">
        {!selectedRun ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <Layers className="w-10 h-10 mb-2 opacity-30 text-blue-400" />
            <p className="text-xs">Select an execution run to view step telemetry & payloads</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Run Summary Banner */}
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-white/10 mb-5 gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <span>{selectedRun.workflowTitle}</span>
                  <span className="text-xs font-mono text-slate-500">({selectedRun.id})</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Triggered via: {selectedRun.triggerSource}</p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono">
                <div className="bg-[#18181b] border border-white/10 px-3 py-1.5 rounded-md text-slate-300">
                  <span className="text-slate-500">Duration: </span>
                  <span className="text-blue-400 font-semibold">
                    {selectedRun.totalDurationMs ? `${selectedRun.totalDurationMs}ms` : 'Running...'}
                  </span>
                </div>
                <div className="bg-[#18181b] border border-white/10 px-3 py-1.5 rounded-md text-slate-300">
                  <span className="text-slate-500">Steps: </span>
                  <span className="text-slate-200 font-semibold">{selectedRun.steps.length}</span>
                </div>
              </div>
            </div>

            {/* Step Waterfall Timeline */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 sm:pr-2">
              {selectedRun.steps.map((step, idx) => (
                <div 
                  key={idx}
                  className="bg-[#141418] border border-white/10 rounded-lg p-4 transition-all hover:border-white/20"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-[#09090b] border border-white/10 text-slate-300 text-xs font-bold font-mono flex items-center justify-center">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs text-slate-100">{step.nodeLabel}</h4>
                        {step.branchTaken && step.branchTaken !== 'main' && (
                          <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                            Branch: {step.branchTaken.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-[11px] text-slate-400">{step.durationMs}ms</span>
                      {step.status === 'success' ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Passed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                          <XCircle className="w-3 h-3" /> Failed
                        </span>
                      )}
                    </div>
                  </div>

                  {step.error && (
                    <div className="mb-3 p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                      <span>{step.error}</span>
                    </div>
                  )}

                  {/* Input / Output Split Code Blocks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                          Input Payload
                        </span>
                        <button
                          onClick={() => handleCopy(`in-${idx}`, step.inputPayload)}
                          className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                        >
                          {copiedPayloadKey === `in-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <pre className="p-3 bg-black/60 border border-white/5 rounded-md text-slate-300 overflow-x-auto max-h-36">
                        {JSON.stringify(step.inputPayload, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                          Output Result
                        </span>
                        <button
                          onClick={() => handleCopy(`out-${idx}`, step.outputPayload)}
                          className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                        >
                          {copiedPayloadKey === `out-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <pre className="p-3 bg-black/60 border border-white/5 rounded-md text-emerald-400 overflow-x-auto max-h-36">
                        {JSON.stringify(step.outputPayload, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

