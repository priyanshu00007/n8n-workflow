import { create } from 'zustand';
import { Node, Edge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange, Connection, addEdge } from '@xyflow/react';
import { ExecutionRun, WorkflowNodeData, WorkflowTemplate } from '../types';
import { INITIAL_WORKFLOW_TEMPLATES } from '../data/initialTemplates';

interface WorkflowState {
  // Navigation & Responsive State
  activeTab: 'canvas' | 'executions' | 'mcp' | 'agents' | 'marketplace' | 'calendar' | 'dashboard' | 'credentials' | 'triggers' | 'playground';
  setActiveTab: (tab: 'canvas' | 'executions' | 'mcp' | 'agents' | 'marketplace' | 'calendar' | 'dashboard' | 'credentials' | 'triggers' | 'playground') => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isPaletteOpen: boolean;
  setIsPaletteOpen: (open: boolean) => void;

  // Active Workflow
  workflowId: string;
  workflowTitle: string;
  setWorkflowTitle: (title: string) => void;
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];

  // Graph Manipulations
  onNodesChange: (changes: NodeChange<Node<WorkflowNodeData>>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (node: Node<WorkflowNodeData>) => void;
  updateNodeConfig: (nodeId: string, newConfig: Record<string, any>, label?: string) => void;
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  clearCanvas: () => void;
  autoLayoutNodes: () => void;
  resetToDefault: () => void;

  // Selected Node for Config Drawer
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;

  // Single Node Testing
  isTestingNodeId: string | null;
  testSingleNode: (nodeId: string, customInput?: any) => Promise<any>;

  // Execution Engine State
  isExecuting: boolean;
  activeExecutionRun: ExecutionRun | null;
  executionHistory: ExecutionRun[];
  runCurrentWorkflow: () => Promise<void>;

  // AI Generator Modal
  isAiModalOpen: boolean;
  setIsAiModalOpen: (open: boolean) => void;
  loadGeneratedWorkflow: (title: string, nodes: Node<WorkflowNodeData>[], edges: Edge[]) => void;

  // Import / Export
  isImportModalOpen: boolean;
  setIsImportModalOpen: (open: boolean) => void;
  exportWorkflowJson: () => string;
  importWorkflowJson: (jsonString: string) => boolean;

  // Server-side persistence (Postgres)
  isSavingWorkflow: boolean;
  saveWorkflowToServer: () => Promise<boolean>;
  loadWorkflowFromServer: (id: string) => Promise<boolean>;
  fetchSavedWorkflows: () => Promise<any[]>;

  // Execution history from server
  fetchExecutionHistory: () => Promise<void>;

  // Templates & Marketplace
  templates: WorkflowTemplate[];
  loadTemplate: (templateId: string) => void;

  // Calendar Modal
  isCalendarModalOpen: boolean;
  setIsCalendarModalOpen: (open: boolean) => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  activeTab: 'canvas',
  setActiveTab: (tab) => set({ activeTab: tab, isMobileMenuOpen: false }),

  isMobileMenuOpen: false,
  setIsMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),

  isPaletteOpen: true,
  setIsPaletteOpen: (open) => set({ isPaletteOpen: open }),

  workflowId: 'wf-101',
  workflowTitle: 'Untitled Workflow',
  setWorkflowTitle: (title) => set({ workflowTitle: title }),

  // Start with a clean canvas — no demo workflow. Users build from the
  // palette, the Model Lab ("Send to Canvas"), or the template gallery.
  nodes: [],
  edges: [],

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes) as Node<WorkflowNodeData>[]
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges)
    });
  },

  onConnect: (connection) => {
    const isConditional = connection.sourceHandle === 'true' || connection.sourceHandle === 'false';
    const strokeColor = connection.sourceHandle === 'true' ? '#10b981' : (connection.sourceHandle === 'false' ? '#f43f5e' : '#3b82f6');

    set({
      edges: addEdge({
        ...connection,
        animated: true,
        style: { strokeWidth: 2, stroke: strokeColor }
      }, get().edges)
    });
  },

  addNode: (node) => {
    set({
      nodes: [...get().nodes, node],
      selectedNodeId: node.id
    });
  },

  updateNodeConfig: (nodeId, newConfig, label) => {
    set({
      nodes: get().nodes.map((n) => {
        if (n.id === nodeId) {
          return {
            ...n,
            data: {
              ...n.data,
              ...(label ? { label } : {}),
              config: {
                ...n.data.config,
                ...newConfig
              }
            }
          };
        }
        return n;
      })
    });
  },

  deleteNode: (nodeId) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId
    });
  },

  duplicateNode: (nodeId) => {
    const target = get().nodes.find(n => n.id === nodeId);
    if (!target) return;

    const newId = 'node-' + Date.now().toString(36);
    const clonedNode: Node<WorkflowNodeData> = {
      ...target,
      id: newId,
      position: {
        x: target.position.x + 40,
        y: target.position.y + 40
      },
      data: {
        ...target.data,
        label: `${target.data.label} (Copy)`,
        status: 'idle',
        lastRunOutput: undefined,
        lastRunTimeMs: undefined,
        lastErrorMessage: undefined,
        config: { ...target.data.config }
      }
    };

    set({
      nodes: [...get().nodes, clonedNode],
      selectedNodeId: newId
    });
  },

  clearCanvas: () => {
    set({
      nodes: [],
      edges: [],
      selectedNodeId: null
    });
  },

  autoLayoutNodes: () => {
    const currentNodes = get().nodes;
    if (currentNodes.length === 0) return;

    const columns: Record<string, number> = {
      trigger: 0,
      tool: 1,
      code: 1,
      logic: 2,
      agent: 2,
      action: 3
    };

    const columnCounts: number[] = [0, 0, 0, 0];

    const updatedNodes = currentNodes.map((node) => {
      const colIndex = columns[node.data.category] ?? 1;
      const rowIndex = columnCounts[colIndex]++;
      
      const x = 80 + colIndex * 330;
      const y = 100 + rowIndex * 170;

      return {
        ...node,
        position: { x, y }
      };
    });

    set({ nodes: updatedNodes });
  },

  resetToDefault: () => {
    // No demo blueprint anymore — reset means a clean canvas
    set({
      workflowTitle: 'Untitled Workflow',
      nodes: [],
      edges: [],
      selectedNodeId: null
    });
  },

  selectedNodeId: null,
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  isTestingNodeId: null,
  testSingleNode: async (nodeId, customInput) => {
    const targetNode = get().nodes.find(n => n.id === nodeId);
    if (!targetNode) return;

    set({ isTestingNodeId: nodeId });

    // Set node status to running
    set({
      nodes: get().nodes.map(n => n.id === nodeId ? { ...n, data: { ...n.data, status: 'running', lastErrorMessage: undefined } } : n)
    });

    try {
      const res = await fetch('/api/workflows/test-node', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          node: targetNode,
          inputPayload: customInput || { sampleTimestamp: new Date().toISOString() }
        })
      });

      const data = await res.json();
      const isSuccess = data.status === 'success';

      set({
        nodes: get().nodes.map(n => {
          if (n.id === nodeId) {
            return {
              ...n,
              data: {
                ...n.data,
                status: isSuccess ? 'success' : 'failed',
                lastRunOutput: data.outputPayload,
                lastRunTimeMs: data.durationMs,
                lastErrorMessage: data.error
              }
            };
          }
          return n;
        }),
        isTestingNodeId: null
      });

      return data;
    } catch (err: any) {
      set({
        nodes: get().nodes.map(n => {
          if (n.id === nodeId) {
            return {
              ...n,
              data: {
                ...n.data,
                status: 'failed',
                lastErrorMessage: err.message || 'Error testing node'
              }
            };
          }
          return n;
        }),
        isTestingNodeId: null
      });
      throw err;
    }
  },

  isExecuting: false,
  activeExecutionRun: null,
  executionHistory: [],

  runCurrentWorkflow: async () => {
    const { nodes, edges, workflowId, workflowTitle } = get();
    if (nodes.length === 0) return;

    set({ isExecuting: true });

    // Reset node statuses to idle
    set({
      nodes: nodes.map(n => ({ ...n, data: { ...n.data, status: 'idle', lastErrorMessage: undefined } }))
    });

    const runId = 'run-' + Date.now().toString(36);
    const newRun: ExecutionRun = {
      id: runId,
      workflowId,
      workflowTitle,
      status: 'running',
      startTime: Date.now(),
      triggerSource: 'Manual Canvas Execution',
      steps: []
    };

    set({ activeExecutionRun: newRun });

    // Subscribe to the SSE live stream so nodes light up in real time
    const stream = new EventSource(`/api/workflows/stream/${encodeURIComponent(workflowId)}`);
    stream.addEventListener('step_completed', (event) => {
      try {
        const step = JSON.parse((event as MessageEvent).data);
        set((state) => ({
          nodes: state.nodes.map(node => node.id === step.nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  status: step.status,
                  lastRunOutput: step.outputPayload,
                  lastRunTimeMs: step.durationMs,
                  lastErrorMessage: step.error
                }
              }
            : node),
          activeExecutionRun: state.activeExecutionRun
            ? { ...state.activeExecutionRun, steps: [...state.activeExecutionRun.steps, step] }
            : state.activeExecutionRun
        }));
      } catch { /* ignore malformed frames */ }
    });

    try {
      const response = await fetch('/api/workflows/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowId,
          workflowTitle,
          nodes,
          edges,
          triggerData: { manualTimestamp: new Date().toISOString() }
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();

      // Update node statuses and outputs based on execution results
      if (result.steps && Array.isArray(result.steps)) {
        const stepMap = new Map(result.steps.map((s: any) => [s.nodeId, s]));

        set({
          nodes: get().nodes.map(node => {
            const stepResult: any = stepMap.get(node.id);
            if (stepResult) {
              return {
                ...node,
                data: {
                  ...node.data,
                  status: stepResult.status,
                  lastRunOutput: stepResult.outputPayload,
                  lastRunTimeMs: stepResult.durationMs,
                  lastErrorMessage: stepResult.error
                }
              };
            }
            return node;
          })
        });
      }

      const completedRun: ExecutionRun = {
        ...newRun,
        status: result.status === 'success' ? 'completed' : 'failed',
        endTime: Date.now(),
        totalDurationMs: result.totalDurationMs || (Date.now() - newRun.startTime),
        steps: result.steps || [],
        finalOutput: result.finalOutput
      };

      stream.close();

      set((state) => ({
        isExecuting: false,
        activeExecutionRun: completedRun,
        executionHistory: [completedRun, ...state.executionHistory]
      }));

    } catch (err: any) {
      stream.close();
      console.error('Execution error:', err);
      const failedRun: ExecutionRun = {
        ...newRun,
        status: 'failed',
        endTime: Date.now(),
        totalDurationMs: Date.now() - newRun.startTime,
        steps: [
          ...newRun.steps,
          {
            nodeId: 'system',
            nodeLabel: 'Execution Engine',
            status: 'failed',
            startTime: Date.now(),
            inputPayload: {},
            error: err.message || 'Execution error occurred'
          }
        ]
      };

      set((state) => ({
        isExecuting: false,
        activeExecutionRun: failedRun,
        executionHistory: [failedRun, ...state.executionHistory]
      }));
    }
  },

  isAiModalOpen: false,
  setIsAiModalOpen: (open) => set({ isAiModalOpen: open }),

  loadGeneratedWorkflow: (title, nodes, edges) => {
    set({
      workflowTitle: title,
      nodes,
      edges,
      selectedNodeId: null,
      activeTab: 'canvas'
    });
  },

  isImportModalOpen: false,
  setIsImportModalOpen: (open) => set({ isImportModalOpen: open }),

  exportWorkflowJson: () => {
    const { workflowTitle, nodes, edges } = get();
    return JSON.stringify({
      schemaVersion: '1.0',
      exportedAt: new Date().toISOString(),
      title: workflowTitle,
      nodes,
      edges
    }, null, 2);
  },

  importWorkflowJson: (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
        set({
          workflowTitle: parsed.title || 'Imported Workflow',
          nodes: parsed.nodes,
          edges: parsed.edges,
          selectedNodeId: null,
          isImportModalOpen: false,
          activeTab: 'canvas'
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to import workflow JSON:', err);
      return false;
    }
  },

  isSavingWorkflow: false,
  saveWorkflowToServer: async () => {
    const { workflowId, workflowTitle, nodes, edges } = get();
    set({ isSavingWorkflow: true });
    try {
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: workflowId, title: workflowTitle, nodes, edges })
      });
      const data = await res.json();
      return res.ok && data.status === 'saved';
    } catch {
      return false;
    } finally {
      set({ isSavingWorkflow: false });
    }
  },

  loadWorkflowFromServer: async (id) => {
    try {
      const res = await fetch(`/api/workflows/${encodeURIComponent(id)}`);
      if (!res.ok) return false;
      const data = await res.json();
      set({
        workflowId: data.id,
        workflowTitle: data.title,
        nodes: data.nodes,
        edges: data.edges,
        selectedNodeId: null,
        activeTab: 'canvas'
      });
      return true;
    } catch {
      return false;
    }
  },

  fetchSavedWorkflows: async () => {
    try {
      const res = await fetch('/api/workflows');
      if (!res.ok) return [];
      const data = await res.json();
      return data.workflows || [];
    } catch {
      return [];
    }
  },

  fetchExecutionHistory: async () => {
    try {
      const res = await fetch('/api/executions');
      if (!res.ok) return;
      const data = await res.json();
      const runs: ExecutionRun[] = (data.runs || []).map((r: any) => ({
        id: r.id,
        workflowId: r.workflow_id,
        workflowTitle: r.workflow_title,
        status: r.status === 'completed' ? 'completed' : 'failed',
        startTime: new Date(r.started_at).getTime(),
        totalDurationMs: r.total_duration_ms,
        triggerSource: r.trigger_source || 'manual',
        steps: []
      }));
      // Merge with local history, newest first, prefer richer local entries
      const localRuns = get().executionHistory;
      const merged = [...localRuns];
      for (const r of runs) {
        if (!merged.some(m => m.id === r.id)) merged.push(r);
      }
      merged.sort((a, b) => b.startTime - a.startTime);
      set({ executionHistory: merged });
    } catch { /* offline / no DB — keep local history */ }
  },

  templates: INITIAL_WORKFLOW_TEMPLATES,

  loadTemplate: (templateId) => {
    const tpl = get().templates.find((t) => t.id === templateId);
    if (tpl) {
      set({
        workflowTitle: tpl.title,
        nodes: tpl.nodes,
        edges: tpl.edges,
        selectedNodeId: null,
        activeTab: 'canvas'
      });
    }
  },

  isCalendarModalOpen: false,
  setIsCalendarModalOpen: (open) => set({ isCalendarModalOpen: open })
}));
