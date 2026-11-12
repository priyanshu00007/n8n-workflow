import React, { useState, useCallback, useMemo } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  BackgroundVariant, 
  Node, 
  ReactFlowProvider 
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Clock, 
  Zap, 
  Bot, 
  Calendar, 
  CalendarPlus, 
  Search, 
  Code, 
  Send, 
  Plus, 
  Trash2, 
  Sparkles, 
  Layers, 
  LayoutGrid, 
  RotateCcw, 
  Play, 
  Loader2, 
  Sliders, 
  Filter, 
  Hourglass, 
  Mail, 
  ChevronLeft, 
  ChevronRight, 
  Upload, 
  Download, 
  X, 
  Check,
  Cpu,
  MessageSquare,
  Github,
  FileText,
  Server,
  Database,
  BrainCircuit,
  Newspaper,
  MapPin
} from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { CustomNode } from '../nodes/CustomNode';
import { NodeConfigDrawer } from '../Panels/NodeConfigDrawer';
import { WorkflowNodeData } from '../../types';

const NODE_TYPES = {
  customNode: CustomNode
};

const PALETTE_TEMPLATES = [
  {
    category: 'Triggers',
    items: [
      {
        typeId: 'cron_trigger',
        category: 'trigger' as const,
        label: 'Schedule Trigger',
        iconName: 'Clock',
        description: 'Fires on cron interval or set time'
      },
      {
        typeId: 'webhook_trigger',
        category: 'trigger' as const,
        label: 'Webhook Trigger',
        iconName: 'Zap',
        description: 'Triggers on incoming HTTP POST payload'
      },
      {
        typeId: 'manual_trigger',
        category: 'trigger' as const,
        label: 'Manual Click Trigger',
        iconName: 'Play',
        description: 'Fires when user manually triggers run'
      }
    ]
  },
  {
    category: 'Universal AI Models & Ollama',
    items: [
      {
        typeId: 'ollama_local_model',
        category: 'agent' as const,
        label: 'Ollama Local LLM',
        iconName: 'Server',
        description: 'Run DeepSeek, Llama3, Qwen, Mistral on localhost:11434'
      },
      {
        typeId: 'universal_ai_model',
        category: 'agent' as const,
        label: 'Universal Cloud LLM Router',
        iconName: 'Cpu',
        description: 'Run OpenAI GPT-4o, Claude 3.7, DeepSeek, Gemini, Qwen, MiniMax'
      },
      {
        typeId: 'agentic_tool_caller',
        category: 'agent' as const,
        label: 'Autonomous Agentic Loop',
        iconName: 'BrainCircuit',
        description: 'Multi-turn agent that autonomously decides and calls tools in a loop'
      },
      {
        typeId: 'adk_reasoning_agent',
        category: 'agent' as const,
        label: 'ADK Reasoning Agent',
        iconName: 'Bot',
        description: 'Autonomous multi-step reasoning agent'
      },
      {
        typeId: 'search_grounding',
        category: 'agent' as const,
        label: 'Search Grounding Agent',
        iconName: 'Search',
        description: 'Fetches live web search results & factual citations'
      }
    ]
  },
  {
    category: 'RAG & Vector Memory',
    items: [
      {
        typeId: 'vector_db_query',
        category: 'tool' as const,
        label: 'Vector DB: Semantic Search',
        iconName: 'Database',
        description: 'Semantic vector similarity query against Qdrant, Pinecone or local store'
      },
      {
        typeId: 'document_embedder',
        category: 'tool' as const,
        label: 'Document Embedder & Chunking',
        iconName: 'Layers',
        description: 'Chunks text documents and indexes embeddings into vector store'
      }
    ]
  },
  {
    category: 'Email, News & Maps',
    items: [
      {
        typeId: 'email_receiver',
        category: 'tool' as const,
        label: 'Email: Fetch Inbox',
        iconName: 'Inbox',
        description: 'Reads latest inbox emails (IMAP-ready, simulated inbox built-in)'
      },
      {
        typeId: 'email_sender',
        category: 'action' as const,
        label: 'Email: Send (SMTP)',
        iconName: 'Mail',
        description: 'Sends real email via SMTP or simulated preview'
      },
      {
        typeId: 'news_fetcher',
        category: 'tool' as const,
        label: 'News: RSS Fetcher',
        iconName: 'Newspaper',
        description: 'Fetches live articles from any RSS/Atom news feed'
      },
      {
        typeId: 'maps_scraper',
        category: 'tool' as const,
        label: 'Maps: Place Scraper',
        iconName: 'MapPin',
        description: 'Real OpenStreetMap place search — no API key needed'
      }
    ]
  },
  {
    category: 'SaaS & App Connectors',
    items: [
      {
        typeId: 'slack_message',
        category: 'action' as const,
        label: 'Slack: Send Message',
        iconName: 'MessageSquare',
        description: 'Posts structured alerts and blocks to Slack channels'
      },
      {
        typeId: 'discord_webhook',
        category: 'action' as const,
        label: 'Discord: Webhook Alert',
        iconName: 'Send',
        description: 'Sends rich embed notifications to Discord channels'
      },
      {
        typeId: 'github_action',
        category: 'action' as const,
        label: 'GitHub: Repository Ops',
        iconName: 'Github',
        description: 'Creates issues, pulls PRs, or triggers repository dispatches'
      },
      {
        typeId: 'notion_database',
        category: 'action' as const,
        label: 'Notion: Database Record',
        iconName: 'FileText',
        description: 'Creates or updates pages inside Notion databases'
      }
    ]
  },
  {
    category: 'Logic & Flow Control',
    items: [
      {
        typeId: 'if_condition',
        category: 'logic' as const,
        label: 'IF / Else Condition',
        iconName: 'Sliders',
        description: 'Routes payload based on True/False condition'
      },
      {
        typeId: 'filter_node',
        category: 'logic' as const,
        label: 'Array Filter Node',
        iconName: 'Filter',
        description: 'Filters lists & arrays based on text match'
      },
      {
        typeId: 'delay_timer',
        category: 'logic' as const,
        label: 'Delay / Timer Pause',
        iconName: 'Hourglass',
        description: 'Pauses workflow execution for N seconds'
      }
    ]
  },
  {
    category: 'Google Workspace & Code',
    items: [
      {
        typeId: 'gcal_list_events',
        category: 'tool' as const,
        label: 'Google Calendar: Fetch Events',
        iconName: 'Calendar',
        description: 'Retrieves calendar schedule'
      },
      {
        typeId: 'gcal_create_event',
        category: 'tool' as const,
        label: 'Google Calendar: Create Event',
        iconName: 'CalendarPlus',
        description: 'Creates a new meeting invite'
      },
      {
        typeId: 'code_executor',
        category: 'code' as const,
        label: 'Code Sandbox Executor',
        iconName: 'Code',
        description: 'Transforms intermediate payload in JS'
      }
    ]
  },
  {
    category: 'Actions & Webhooks',
    items: [
      {
        typeId: 'http_webhook',
        category: 'action' as const,
        label: 'HTTP Webhook Dispatcher',
        iconName: 'Send',
        description: 'Dispatches payload to external API'
      },
      {
        typeId: 'email_notifier',
        category: 'action' as const,
        label: 'Email Alert Notifier',
        iconName: 'Mail',
        description: 'Sends automated email summary'
      }
    ]
  }
];

export const WorkflowCanvasInner: React.FC = () => {
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect, 
    addNode, 
    setSelectedNodeId, 
    selectedNodeId, 
    deleteNode, 
    setIsAiModalOpen, 
    autoLayoutNodes, 
    clearCanvas, 
    resetToDefault, 
    runCurrentWorkflow, 
    isExecuting,
    isPaletteOpen,
    setIsPaletteOpen,
    isImportModalOpen,
    setIsImportModalOpen,
    importWorkflowJson,
    exportWorkflowJson
  } = useWorkflowStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, [setSelectedNodeId]);

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  const handleAddNewNode = (item: typeof PALETTE_TEMPLATES[0]['items'][0]) => {
    const id = 'node-' + Date.now().toString(36);
    const newNode: Node<WorkflowNodeData> = {
      id,
      type: 'customNode',
      position: { 
        x: 250 + (nodes.length % 3) * 60, 
        y: 120 + (nodes.length % 4) * 60 
      },
      data: {
        label: item.label,
        category: item.category,
        typeId: item.typeId,
        iconName: item.iconName,
        description: item.description,
        config: {}
      }
    };
    addNode(newNode);
  };

  const filteredPalette = useMemo(() => {
    if (!searchQuery.trim()) return PALETTE_TEMPLATES;
    const query = searchQuery.toLowerCase();
    return PALETTE_TEMPLATES.map(sec => ({
      ...sec,
      items: sec.items.filter(item => 
        item.label.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      )
    })).filter(sec => sec.items.length > 0);
  }, [searchQuery]);

  const handleExecuteImport = () => {
    setImportError(null);
    if (!importJsonText.trim()) return;
    const success = importWorkflowJson(importJsonText);
    if (!success) {
      setImportError('Invalid JSON schema. Expected { nodes: [...], edges: [...] }');
    }
  };

  return (
    <div className="flex-1 flex relative overflow-hidden bg-[#09090b]">
      {/* Sidebar Palette Drawer */}
      <aside className={`${isPaletteOpen ? 'w-64' : 'w-0 -translate-x-full md:translate-x-0 md:w-12'} transition-all duration-300 bg-[#0c0c0e] border-r border-white/10 flex flex-col z-20 shadow-xl select-none overflow-hidden`}>
        {isPaletteOpen ? (
          <div className="p-3.5 flex flex-col gap-4 overflow-y-auto h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200 font-bold text-xs tracking-tight">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>NODE PALETTE</span>
              </div>
              <button
                onClick={() => setIsPaletteOpen(false)}
                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-slate-200"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Search Palette */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search nodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 outline-none placeholder:text-slate-500 font-mono"
              />
            </div>

            {/* Categorized Node Palette */}
            <div className="flex flex-col gap-4 pb-4">
              {filteredPalette.map((section) => (
                <div key={section.category}>
                  <h3 className="px-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">
                    {section.category}
                  </h3>
                  <div className="flex flex-col gap-1.5">
                    {section.items.map((item) => (
                      <button
                        key={item.typeId}
                        onClick={() => handleAddNewNode(item)}
                        className="flex items-start gap-2.5 p-2 rounded-md bg-white/5 border border-white/5 hover:border-blue-500/30 text-left transition-colors group cursor-pointer"
                      >
                        <div className="p-1 rounded bg-blue-500/20 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors mt-0.5">
                          <Plus className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-200 group-hover:text-white">
                            {item.label}
                          </div>
                          <div className="text-[10px] text-slate-500 leading-tight line-clamp-1">
                            {item.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-2 flex flex-col items-center gap-4">
            <button
              onClick={() => setIsPaletteOpen(true)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
              title="Expand Node Palette"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="writing-mode-vertical text-[10px] uppercase font-bold text-slate-500 tracking-widest font-mono py-4">
              PALETTE
            </div>
          </div>
        )}
      </aside>

      {/* Main Graph Canvas */}
      <div className="flex-1 relative h-full bg-[#09090b]">
        {/* Canvas Floating Top Action Bar */}
        <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-1.5 sm:gap-2 bg-[#0c0c0e]/95 backdrop-blur-md border border-white/10 p-1.5 rounded-lg shadow-2xl select-none">
          {!isPaletteOpen && (
            <button
              onClick={() => setIsPaletteOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-white/10 text-xs font-medium text-slate-300"
            >
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Add Nodes</span>
            </button>
          )}

          <button
            onClick={autoLayoutNodes}
            title="Auto arrange nodes in DAG topology"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-white/10 text-xs font-medium text-slate-300 transition-colors"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Auto Layout</span>
          </button>

          <div className="h-4 w-px bg-white/10" />

          <button
            onClick={resetToDefault}
            title="Reset to default Calendar Briefing flow"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-white/10 text-xs font-medium text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Reset Blueprint</span>
          </button>

          <button
            onClick={clearCanvas}
            title="Clear all nodes on canvas"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-rose-500/20 text-xs font-medium text-slate-400 hover:text-rose-300 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Clear</span>
          </button>

          <div className="h-4 w-px bg-white/10" />

          <button
            onClick={runCurrentWorkflow}
            disabled={isExecuting || nodes.length === 0}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all shadow-md ${
              isExecuting || nodes.length === 0
                ? 'bg-blue-950/40 text-blue-400/40 border border-white/5 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
            }`}
          >
            {isExecuting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Executing...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Canvas</span>
              </>
            )}
          </button>
        </div>

        {/* Empty Canvas Placeholder Overlay */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
            <div className="max-w-md p-6 bg-[#0c0c0e]/95 border border-white/10 rounded-xl shadow-2xl pointer-events-auto">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-100 mb-1">Canvas is Empty</h3>
              <p className="text-xs text-slate-400 mb-4">
                Click nodes in the left palette to add them, or load a pre-built blueprint workflow below.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={resetToDefault}
                  className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all"
                >
                  Load Calendar AI Blueprint
                </button>
                <button
                  onClick={() => setIsAiModalOpen(true)}
                  className="px-3 py-1.5 rounded-md bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all"
                >
                  Prompt AI Builder
                </button>
              </div>
            </div>
          </div>
        )}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={NODE_TYPES}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          defaultEdgeOptions={{
            animated: true,
            style: { strokeWidth: 2, stroke: '#3b82f6' }
          }}
          className="bg-[#09090b]"
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="#1e1e2e" />
          <Controls className="!bg-[#18181b] !border-white/10 !text-slate-300 !rounded-md" />
          <MiniMap 
            nodeColor="#334155"
            maskColor="rgba(9, 9, 11, 0.85)"
            className="!bg-[#0c0c0e] !border-white/10 !rounded-md hidden sm:block"
          />
        </ReactFlow>

        {/* Selected Node Floating Action Delete */}
        {selectedNodeId && (
          <div className="absolute bottom-6 left-6 z-20 flex items-center gap-2 bg-[#18181b] border border-white/10 p-2 rounded-md shadow-2xl">
            <span className="text-xs text-slate-400 px-2 font-mono">Node Selected</span>
            <button
              onClick={() => deleteNode(selectedNodeId)}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium border border-rose-500/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Config Drawer */}
      <NodeConfigDrawer />

      {/* Import JSON Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#0c0c0e] border border-white/10 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm text-slate-100">Import Workflow JSON</h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              rows={10}
              placeholder="Paste workflow JSON here..."
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md p-3 text-xs text-slate-200 font-mono outline-none resize-none leading-relaxed"
            />

            {importError && (
              <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
                {importError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-3 py-1.5 rounded text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteImport}
                disabled={!importJsonText.trim()}
                className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20"
              >
                Import into Canvas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const WorkflowCanvas: React.FC = () => (
  <ReactFlowProvider>
    <WorkflowCanvasInner />
  </ReactFlowProvider>
);

