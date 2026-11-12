import React, { useState, useEffect } from 'react';
import { 
  Key, 
  ShieldCheck, 
  Lock, 
  Check, 
  Copy, 
  Trash2, 
  Plus, 
  RefreshCw, 
  Server, 
  Cpu, 
  Eye, 
  EyeOff, 
  AlertCircle,
  MessageSquare,
  Github,
  FileText,
  Send,
  Loader2
} from 'lucide-react';
import { CredentialItem } from '../../types';

const INITIAL_PRESETS: { type: CredentialItem['type']; name: string; icon: any; placeholder: string; desc: string; defaultEndpoint?: string }[] = [
  {
    type: 'ollama',
    name: 'Local Ollama Service',
    icon: Server,
    placeholder: 'http://localhost:11434',
    desc: 'Self-hosted Ollama server endpoint (supports DeepSeek, Llama3, Qwen, Mistral)',
    defaultEndpoint: 'http://localhost:11434'
  },
  {
    type: 'gemini',
    name: 'Google Gemini API',
    icon: Cpu,
    placeholder: 'AIzaSy...',
    desc: 'Google Gemini 2.5 Flash, Gemini 3.1 Pro & Google Search Grounding'
  },
  {
    type: 'openai',
    name: 'OpenAI API Key',
    icon: Cpu,
    placeholder: 'sk-proj-...',
    desc: 'OpenAI GPT-4o, GPT-4o-mini, o3-mini models'
  },
  {
    type: 'anthropic',
    name: 'Anthropic Claude API Key',
    icon: Cpu,
    placeholder: 'sk-ant-api03-...',
    desc: 'Claude 3.7 Sonnet, Claude 3.5 Haiku reasoning models'
  },
  {
    type: 'deepseek',
    name: 'DeepSeek Official API',
    icon: Cpu,
    placeholder: 'sk-...',
    desc: 'DeepSeek-V3 and DeepSeek-R1 cloud endpoints'
  },
  {
    type: 'qwen',
    name: 'Alibaba Qwen DashScope API',
    icon: Cpu,
    placeholder: 'sk-...',
    desc: 'Qwen-2.5-Max, Qwen-Plus, Qwen-Coder models'
  },
  {
    type: 'minimax',
    name: 'MiniMax AI Key',
    icon: Cpu,
    placeholder: 'eyJhbGciOi...',
    desc: 'MiniMax-01 and MiniMax-Chat models'
  },
  {
    type: 'groq',
    name: 'Groq Cloud API Key',
    icon: Cpu,
    placeholder: 'gsk_...',
    desc: 'Ultra low-latency LPU inference for Llama 3.3 70B'
  },
  {
    type: 'slack',
    name: 'Slack Incoming Webhook',
    icon: MessageSquare,
    placeholder: 'https://hooks.slack.com/services/...',
    desc: 'Post alerts and interactive notifications into Slack channels'
  },
  {
    type: 'discord',
    name: 'Discord Webhook URL',
    icon: Send,
    placeholder: 'https://discord.com/api/webhooks/...',
    desc: 'Broadcast rich embed notifications into Discord servers'
  },
  {
    type: 'github',
    name: 'GitHub Personal Access Token',
    icon: Github,
    placeholder: 'ghp_...',
    desc: 'Automate GitHub repository issues, PRs, and workflow dispatches'
  },
  {
    type: 'notion',
    name: 'Notion Internal Integration Secret',
    icon: FileText,
    placeholder: 'secret_...',
    desc: 'Read and append records into Notion databases'
  }
];

export const CredentialsView: React.FC = () => {
  const [credentials, setCredentials] = useState<CredentialItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(INITIAL_PRESETS[0]);
  const [inputValue, setInputValue] = useState('');
  const [endpointUrl, setEndpointUrl] = useState(INITIAL_PRESETS[0].defaultEndpoint || '');
  const [credentialName, setCredentialName] = useState(INITIAL_PRESETS[0].name);
  const [showSecret, setShowSecret] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [testingOllama, setTestingOllama] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<{ ok: boolean; models?: string[]; message?: string } | null>(null);

  const fetchCredentials = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/credentials');
      if (res.ok) {
        const data = await res.json();
        setCredentials(data.credentials || []);
      }
    } catch (e) {
      console.error('Failed to fetch credentials', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  const handleSelectPreset = (preset: typeof INITIAL_PRESETS[0]) => {
    setSelectedPreset(preset);
    setCredentialName(preset.name);
    setEndpointUrl(preset.defaultEndpoint || '');
    setInputValue('');
    setSaveStatus(null);
    setOllamaStatus(null);
  };

  const handleSaveCredential = async () => {
    if (!inputValue && selectedPreset.type !== 'ollama') {
      setSaveStatus('Please provide a secret key or token');
      return;
    }

    try {
      setSaveStatus('Encrypting and saving...');
      const payload = {
        name: credentialName,
        type: selectedPreset.type,
        value: inputValue || endpointUrl,
        endpointUrl: endpointUrl
      };

      const res = await fetch('/api/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSaveStatus('✅ Credential saved & encrypted securely!');
        setInputValue('');
        fetchCredentials();
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        setSaveStatus('❌ Failed to save credential');
      }
    } catch (err: any) {
      setSaveStatus(`❌ Error: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/credentials/${id}`, { method: 'DELETE' });
      setCredentials(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      console.error('Failed to delete credential', e);
    }
  };

  const handleTestOllama = async () => {
    setTestingOllama(true);
    setOllamaStatus(null);
    try {
      const url = endpointUrl || 'http://localhost:11434';
      const res = await fetch(`/api/credentials/ollama-ping?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      setOllamaStatus(data);
    } catch (err: any) {
      setOllamaStatus({ ok: false, message: err.message });
    } finally {
      setTestingOllama(false);
    }
  };

  return (
    <div className="flex-1 h-full bg-[#09090b] overflow-y-auto p-4 lg:p-8 custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/5 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <Lock className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Security & Vault</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-100 tracking-tight">Credential Manager & AI Vault</h1>
            <p className="text-slate-400 text-xs lg:text-sm mt-1">
              Securely store API keys for Local Ollama, Cloud LLMs (OpenAI, Claude, Gemini, DeepSeek, Qwen, MiniMax), and SaaS Integrations.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs font-mono text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>AES-256 Encrypted</span>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Preset Selector */}
          <div className="lg:col-span-5 bg-[#0c0c0e] border border-white/10 rounded-xl p-4 lg:p-5 shadow-xl flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-400" />
              <span>Select Integration Provider</span>
            </h3>

            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {INITIAL_PRESETS.map((preset) => {
                const Icon = preset.icon;
                const isSelected = selectedPreset.type === preset.type;
                const isConfigured = credentials.some(c => c.type === preset.type);

                return (
                  <button
                    key={preset.type}
                    onClick={() => handleSelectPreset(preset)}
                    className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#18181b] border-blue-500/60 shadow-md'
                        : 'bg-white/5 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-md ${isSelected ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-slate-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-200">{preset.name}</div>
                        <div className="text-[10px] text-slate-400 line-clamp-1">{preset.desc}</div>
                      </div>
                    </div>
                    {isConfigured && (
                      <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Vault Input Form & Active Keys */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Form Box */}
            <div className="bg-[#0c0c0e] border border-white/10 rounded-xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <selectedPreset.icon className="w-5 h-5 text-blue-400" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{selectedPreset.name}</h3>
                    <p className="text-[11px] text-slate-400">{selectedPreset.desc}</p>
                  </div>
                </div>
              </div>

              {/* Credential Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Credential Identifier</label>
                <input
                  type="text"
                  value={credentialName}
                  onChange={(e) => setCredentialName(e.target.value)}
                  className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-2 text-xs text-slate-200 outline-none"
                />
              </div>

              {/* Endpoint URL if Ollama */}
              {selectedPreset.type === 'ollama' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Ollama Base URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={endpointUrl}
                        onChange={(e) => setEndpointUrl(e.target.value)}
                        placeholder="http://localhost:11434"
                        className="flex-1 bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-2 text-xs text-slate-200 font-mono outline-none"
                      />
                      <button
                        onClick={handleTestOllama}
                        disabled={testingOllama}
                        className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        {testingOllama ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                        <span>Ping Endpoint</span>
                      </button>
                    </div>
                  </div>

                  {ollamaStatus && (
                    <div className={`p-3 rounded-lg border text-xs font-mono ${
                      ollamaStatus.ok 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}>
                      <div className="font-bold flex items-center gap-1.5 mb-1">
                        {ollamaStatus.ok ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        <span>{ollamaStatus.ok ? 'Ollama Server Connected!' : 'Connection Failed'}</span>
                      </div>
                      {ollamaStatus.models && ollamaStatus.models.length > 0 && (
                        <div className="text-[11px] text-slate-300">
                          Available Models: <span className="text-emerald-400">{ollamaStatus.models.join(', ')}</span>
                        </div>
                      )}
                      {ollamaStatus.message && <div>{ollamaStatus.message}</div>}
                    </div>
                  )}
                </div>
              )}

              {/* Secret Value Input */}
              {selectedPreset.type !== 'ollama' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Secret API Key / Token</label>
                  <div className="relative">
                    <input
                      type={showSecret ? 'text' : 'password'}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={selectedPreset.placeholder}
                      className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md px-3 py-2 text-xs text-slate-200 font-mono outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
                    >
                      {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {saveStatus && (
                <div className="text-xs font-mono font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 p-2.5 rounded-md">
                  {saveStatus}
                </div>
              )}

              <button
                onClick={handleSaveCredential}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Save Encrypted Credential</span>
              </button>
            </div>

            {/* Active Vault Keys List */}
            <div className="bg-[#0c0c0e] border border-white/10 rounded-xl p-5 shadow-xl space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Configured Credentials ({credentials.length})</span>
                <button onClick={fetchCredentials} className="text-slate-500 hover:text-slate-300">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </h3>

              {credentials.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500 font-mono">
                  No credentials stored yet. Select a provider above to add your first key.
                </div>
              ) : (
                <div className="space-y-2">
                  {credentials.map((cred) => (
                    <div 
                      key={cred.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-[#18181b] border border-white/5 hover:border-white/10 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded bg-blue-500/10 text-blue-400">
                          <Key className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-200">{cred.name}</div>
                          <div className="text-[10px] font-mono text-slate-400">
                            {cred.type.toUpperCase()} • {cred.value}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDelete(cred.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all"
                        title="Delete credential"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
