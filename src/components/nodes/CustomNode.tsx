import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { 
  Bot, 
  Calendar, 
  Clock, 
  Zap, 
  Send, 
  Search, 
  ShieldCheck, 
  Code, 
  Sparkles, 
  Inbox, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  CalendarPlus,
  Globe,
  Sliders,
  Filter,
  Hourglass,
  Mail,
  Play,
  Copy,
  Trash2,
  Terminal,
  GitBranch,
  Cpu,
  MessageSquare,
  Github,
  FileText,
  Server,
  Database,
  BrainCircuit,
  Layers,
  Newspaper,
  MapPin
} from 'lucide-react';
import { WorkflowNodeData } from '../../types';
import { useWorkflowStore } from '../../store/useWorkflowStore';

const ICON_MAP: Record<string, React.ElementType> = {
  Bot,
  Calendar,
  Clock,
  Zap,
  Send,
  Search,
  ShieldCheck,
  Code,
  Sparkles,
  Inbox,
  CalendarPlus,
  Globe,
  Sliders,
  Filter,
  Hourglass,
  Mail,
  Terminal,
  GitBranch,
  Cpu,
  MessageSquare,
  Github,
  FileText,
  Server,
  Database,
  BrainCircuit,
  Layers,
  Newspaper,
  MapPin
};

const CATEGORY_STYLES: Record<string, { bg: string; border: string; badge: string; text: string }> = {
  trigger: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-950/30',
    border: 'border-emerald-500/40',
    badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    text: 'text-emerald-400'
  },
  agent: {
    bg: 'bg-indigo-500/10 dark:bg-indigo-950/30',
    border: 'border-indigo-500/40',
    badge: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    text: 'text-indigo-400'
  },
  tool: {
    bg: 'bg-sky-500/10 dark:bg-sky-950/30',
    border: 'border-sky-500/40',
    badge: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    text: 'text-sky-400'
  },
  logic: {
    bg: 'bg-amber-500/10 dark:bg-amber-950/30',
    border: 'border-amber-500/40',
    badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    text: 'text-amber-400'
  },
  action: {
    bg: 'bg-rose-500/10 dark:bg-rose-950/30',
    border: 'border-rose-500/40',
    badge: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    text: 'text-rose-400'
  },
  code: {
    bg: 'bg-purple-500/10 dark:bg-purple-950/30',
    border: 'border-purple-500/40',
    badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    text: 'text-purple-400'
  }
};

const GLOW_MAP: Record<string, string> = {
  trigger: 'node-glow-blue',
  agent: 'node-glow-purple',
  tool: 'node-glow-blue',
  logic: 'node-glow-amber',
  action: 'node-glow-green',
  code: 'node-glow-purple'
};

export const CustomNode = memo(({ id, data, selected }: NodeProps<any>) => {
  const nodeData = data as WorkflowNodeData;
  const IconComponent = ICON_MAP[nodeData.iconName] || Bot;
  const style = CATEGORY_STYLES[nodeData.category] || CATEGORY_STYLES.agent;
  const glowClass = GLOW_MAP[nodeData.category] || 'node-glow-purple';

  const { testSingleNode, duplicateNode, deleteNode, isTestingNodeId } = useWorkflowStore();

  const isTrigger = nodeData.category === 'trigger';
  const isConditional = nodeData.typeId === 'if_condition';
  const isTestingThis = isTestingNodeId === id;

  const handleTestStep = (e: React.MouseEvent) => {
    e.stopPropagation();
    testSingleNode(id);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateNode(id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNode(id);
  };

  return (
    <div
      className={`group relative min-w-[250px] max-w-[290px] rounded-xl border bg-[#141418] p-3.5 transition-all duration-200 shadow-xl ${glowClass} ${
        selected ? 'ring-2 ring-blue-500 border-blue-400 shadow-blue-500/20' : style.border
      } ${nodeData.status === 'running' ? 'ring-2 ring-amber-500/80 animate-pulse' : ''}`}
    >
      {/* Quick Action Floating Bar on Hover */}
      <div className="absolute -top-3.5 right-3 hidden group-hover:flex items-center gap-1 bg-[#1c1c22] border border-white/10 rounded-full px-2 py-0.5 shadow-2xl z-30 transition-all">
        <button
          onClick={handleTestStep}
          disabled={isTestingThis}
          title="Test this single step"
          className="p-1 rounded-full hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 transition-colors"
        >
          {isTestingThis ? <Loader2 className="w-3 h-3 animate-spin text-amber-400" /> : <Play className="w-3 h-3 fill-current" />}
        </button>
        <button
          onClick={handleDuplicate}
          title="Duplicate node"
          className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Copy className="w-3 h-3" />
        </button>
        <button
          onClick={handleDelete}
          title="Delete node"
          className="p-1 rounded-full hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Input Target Handle */}
      {!isTrigger && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3.5 !h-3.5 !bg-blue-500 !border-4 !border-[#0c0c0e] transition-transform hover:scale-125 hover:!bg-blue-400"
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg border ${style.badge}`}>
            <IconComponent className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 font-mono">
            {nodeData.category}
          </span>
        </div>

        {/* Status indicator badge */}
        {(nodeData.status === 'running' || isTestingThis) && (
          <div className="flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Running</span>
          </div>
        )}
        {nodeData.status === 'success' && !isTestingThis && (
          <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>{nodeData.lastRunTimeMs ? `${nodeData.lastRunTimeMs}ms` : 'Passed'}</span>
          </div>
        )}
        {nodeData.status === 'failed' && !isTestingThis && (
          <div className="flex items-center gap-1 text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
            <XCircle className="w-3 h-3" />
            <span>Error</span>
          </div>
        )}
      </div>

      {/* Title & Description */}
      <div>
        <h3 className="font-semibold text-xs text-slate-100 leading-tight mb-1">
          {nodeData.label}
        </h3>
        {nodeData.description && (
          <p className="text-[11px] text-slate-400 line-clamp-2 leading-snug">
            {nodeData.description}
          </p>
        )}
      </div>

      {/* Preview Output Chip */}
      {nodeData.lastRunOutput && (
        <div className="mt-2.5 pt-2 border-t border-white/5 text-[10px] text-slate-300 font-mono bg-black/50 border border-white/5 rounded p-2 line-clamp-2 overflow-hidden">
          {typeof nodeData.lastRunOutput === 'string'
            ? nodeData.lastRunOutput
            : (nodeData.lastRunOutput.response 
                ? nodeData.lastRunOutput.response.slice(0, 80) + '...'
                : JSON.stringify(nodeData.lastRunOutput))}
        </div>
      )}

      {/* Output Source Handles */}
      {isConditional ? (
        <>
          {/* True Branch Handle (Top Right) */}
          <div className="absolute right-0 top-6 translate-x-full pl-2 flex items-center gap-1 pointer-events-none">
            <span className="text-[9px] font-bold font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              TRUE
            </span>
          </div>
          <Handle
            id="true"
            type="source"
            position={Position.Right}
            style={{ top: '35%' }}
            className="!w-3.5 !h-3.5 !bg-emerald-500 !border-4 !border-[#0c0c0e] transition-transform hover:scale-125 hover:!bg-emerald-400"
          />

          {/* False Branch Handle (Bottom Right) */}
          <div className="absolute right-0 bottom-6 translate-x-full pl-2 flex items-center gap-1 pointer-events-none">
            <span className="text-[9px] font-bold font-mono text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
              FALSE
            </span>
          </div>
          <Handle
            id="false"
            type="source"
            position={Position.Right}
            style={{ top: '75%' }}
            className="!w-3.5 !h-3.5 !bg-rose-500 !border-4 !border-[#0c0c0e] transition-transform hover:scale-125 hover:!bg-rose-400"
          />
        </>
      ) : (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3.5 !h-3.5 !bg-blue-500 !border-4 !border-[#0c0c0e] transition-transform hover:scale-125 hover:!bg-blue-400"
        />
      )}
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

