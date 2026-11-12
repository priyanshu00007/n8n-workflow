export type NodeTypeCategory = 
  | 'trigger' 
  | 'agent' 
  | 'tool' 
  | 'logic' 
  | 'action'
  | 'code';

export interface WorkflowNodeData extends Record<string, unknown> {
  label: string;
  category: NodeTypeCategory;
  typeId: string;
  iconName: string;
  description?: string;
  config: Record<string, any>;
  status?: 'idle' | 'running' | 'success' | 'failed';
  lastRunOutput?: any;
  lastRunTimeMs?: number;
  lastErrorMessage?: string;
  branch?: 'true' | 'false' | 'all';
}

export interface ExecutionStepLog {
  nodeId: string;
  nodeLabel: string;
  category?: NodeTypeCategory;
  typeId?: string;
  status: 'running' | 'success' | 'failed' | 'skipped';
  startTime: number;
  endTime?: number;
  durationMs?: number;
  inputPayload: any;
  outputPayload?: any;
  error?: string;
  logs?: string[];
  branchTaken?: 'true' | 'false' | 'main';
}

export interface ExecutionRun {
  id: string;
  workflowId: string;
  workflowTitle: string;
  status: 'running' | 'completed' | 'failed';
  startTime: number;
  endTime?: number;
  totalDurationMs?: number;
  triggerSource: string;
  steps: ExecutionStepLog[];
  finalOutput?: any;
}

export interface WorkflowTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  author: string;
  tags: string[];
  nodes: any[];
  edges: any[];
}

export interface McpTool {
  id: string;
  name: string;
  version: string;
  description: string;
  category: 'workspace' | 'search' | 'code' | 'http' | 'ai' | 'logic';
  parameters: {
    name: string;
    type: string;
    description: string;
    required: boolean;
  }[];
  exampleInput: Record<string, any>;
}

export interface GoogleAdkAgent {
  id: string;
  name: string;
  role: string;
  description: string;
  model: string;
  systemPrompt: string;
  assignedTools: string[];
  temperature: number;
  capabilities: string[];
}

export type AiProviderType = 
  | 'ollama' 
  | 'gemini' 
  | 'openai' 
  | 'anthropic' 
  | 'deepseek' 
  | 'qwen' 
  | 'minimax' 
  | 'groq'
  | 'openrouter';

export interface CredentialItem {
  id: string;
  name: string;
  type: 
    | 'ollama' 
    | 'gemini' 
    | 'openai' 
    | 'anthropic' 
    | 'deepseek' 
    | 'qwen' 
    | 'minimax' 
    | 'groq' 
    | 'slack' 
    | 'discord' 
    | 'github' 
    | 'notion' 
    | 'custom_header';
  value: string; // masked or secret value
  endpointUrl?: string; // for custom Ollama / local URLs (e.g. http://localhost:11434)
  createdAt: string;
  updatedAt: string;
  isConfigured: boolean;
}

