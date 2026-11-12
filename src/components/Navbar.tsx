import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Sparkles, 
  Calendar, 
  Loader2, 
  ChevronRight, 
  User, 
  Download, 
  Upload, 
  Menu, 
  X, 
  Check, 
  Workflow, 
  TrendingUp, 
  Activity, 
  Layers, 
  Bot, 
  Store,
  Key,
  Zap,
  BrainCircuit
} from 'lucide-react';
import { useWorkflowStore } from '../store/useWorkflowStore';

export const Navbar: React.FC = () => {
  const { 
    isExecuting, 
    runCurrentWorkflow, 
    setIsAiModalOpen,
    setIsCalendarModalOpen,
    exportWorkflowJson,
    setIsImportModalOpen,
    activeTab,
    setActiveTab,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    workflowTitle
  } = useWorkflowStore();

  const [downloaded, setDownloaded] = useState(false);

  // Real backend health probe — reflects the actual Express engine, not a fake dot
  const [engineOnline, setEngineOnline] = useState<boolean | null>(null);
  useEffect(() => {
    let cancelled = false;
    const probe = async () => {
      try {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 4000);
        const res = await fetch('/api/health', { signal: controller.signal });
        clearTimeout(t);
        if (!cancelled) setEngineOnline(res.ok);
      } catch {
        if (!cancelled) setEngineOnline(false);
      }
    };
    probe();
    const id = setInterval(probe, 30000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const handleExport = () => {
    const jsonStr = exportWorkflowJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowTitle.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'workflow'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const navItems = [
    { id: 'dashboard', label: 'Analytics', icon: TrendingUp },
    { id: 'canvas', label: 'Canvas Builder', icon: Workflow },
    { id: 'executions', label: 'Executions', icon: Activity },
    { id: 'credentials', label: 'Vault & Keys', icon: Key },
    { id: 'triggers', label: 'Triggers', icon: Zap },
    { id: 'mcp', label: 'MCP Tools', icon: Layers },
    { id: 'agents', label: 'ADK Agents', icon: Bot },
    { id: 'playground', label: 'Model Lab', icon: BrainCircuit },
    { id: 'marketplace', label: 'Templates', icon: Store }
  ] as const;

  return (
    <>
      <header className="h-14 bg-[#09090b] border-b border-white/10 px-4 sm:px-6 flex items-center justify-between gap-4 select-none z-30 relative">
        {/* Brand & Workspace Identity */}
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-extrabold text-xs shadow-md shadow-blue-600/30">
              N
            </div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-100 text-sm tracking-tight hidden sm:block">
                Nexus Flow
              </h1>
              <span
                className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold border ${
                  engineOnline === false
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}
                title={engineOnline === false ? 'Backend not reachable — start it with: npm run dev (or docker compose up)' : 'Backend engine connected'}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${engineOnline === false ? 'bg-rose-400' : 'bg-emerald-400 animate-pulse'}`} />
                <span className="hidden xs:inline">ENGINE</span> {engineOnline === false ? 'OFFLINE' : 'ONLINE'}
              </span>
            </div>
          </div>

          <ChevronRight className="w-3.5 h-3.5 text-slate-600 hidden lg:block" />

          <div className="hidden lg:flex items-center gap-2 bg-white/5 border border-white/10 px-2.5 py-1 rounded text-xs font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>ADK Production Swarm</span>
          </div>
        </div>

        {/* Top Bar Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Import / Export JSON Buttons */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 transition-colors"
            title="Import Workflow JSON"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Import</span>
          </button>

          <button
            onClick={handleExport}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 transition-colors"
            title="Export Workflow JSON"
          >
            {downloaded ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5 text-slate-400" />}
            <span className="hidden md:inline">{downloaded ? 'Exported' : 'Export'}</span>
          </button>

          {/* Calendar Sync */}
          <button
            onClick={() => setIsCalendarModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 transition-colors"
            title="Google Calendar Integration"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Calendar</span>
          </button>

          {/* AI Workflow Generator */}
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md bg-purple-500/10 border border-purple-500/30 hover:border-purple-500/60 text-purple-300 text-xs font-medium transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span className="hidden sm:inline">AI Prompt Flow</span>
          </button>

          {/* Run Workflow Button */}
          <button
            onClick={runCurrentWorkflow}
            disabled={isExecuting}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-md text-xs font-bold transition-all shadow-md ${
              isExecuting
                ? 'bg-amber-600/80 text-amber-100 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 active:scale-95'
            }`}
          >
            {isExecuting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden xs:inline">Running...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Flow</span>
              </>
            )}
          </button>

          <div className="h-4 w-px bg-white/10 mx-0.5 sm:mx-1" />

          <div className="w-7 h-7 rounded-full bg-[#18181b] border border-white/10 flex items-center justify-center text-slate-400 text-xs font-bold">
            <User className="w-3.5 h-3.5" />
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#0c0c0e] border-b border-white/10 p-4 space-y-2 z-30 select-none shadow-2xl">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">
            Navigation Views
          </div>
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-semibold border transition-all ${
                    isActive
                      ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                setIsImportModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex-1 py-1.5 px-3 rounded bg-white/5 border border-white/10 text-xs text-slate-300 font-medium flex items-center justify-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import JSON</span>
            </button>
            <button
              onClick={() => {
                handleExport();
                setIsMobileMenuOpen(false);
              }}
              className="flex-1 py-1.5 px-3 rounded bg-white/5 border border-white/10 text-xs text-slate-300 font-medium flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};


