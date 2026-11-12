import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Loader2, 
  Wand2, 
  Calendar, 
  Bot, 
  Zap, 
  Send 
} from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';

const PROMPT_SUGGESTIONS = [
  {
    title: 'Google Calendar Executive Briefing',
    prompt: 'Create a workflow that triggers every morning at 8am, fetches my Google Calendar events for today, passes them to a Gemini AI Reasoning Agent to draft an executive schedule summary, and dispatches the summary to a Slack webhook.'
  },
  {
    title: 'Multi-Agent Research & Fact-Checker',
    prompt: 'Build a multi-agent workflow where Agent 1 performs web search grounding on a research topic, Agent 2 audits and fact-checks the findings, and a final step schedules a Google Calendar review meeting.'
  },
  {
    title: 'Smart Calendar Meeting Booker',
    prompt: 'Create a meeting scheduler workflow with a Webhook Trigger receiving a meeting booking text, an AI parser extracting event parameters, and a Google Calendar node creating the invite for attendees.'
  }
];

export const AiWorkflowGeneratorModal: React.FC = () => {
  const { isAiModalOpen, setIsAiModalOpen, loadGeneratedWorkflow } = useWorkflowStore();
  const [promptText, setPromptText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isAiModalOpen) return null;

  const handleGenerate = async (customPrompt?: string) => {
    const targetPrompt = customPrompt || promptText;
    if (!targetPrompt.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/ai/generate-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: targetPrompt })
      });

      if (!response.ok) {
        throw new Error(`Server error (${response.status}): ${await response.text()}`);
      }

      const data = await response.json();
      if (data.nodes && data.edges) {
        loadGeneratedWorkflow(data.title || 'Generated AI Workflow', data.nodes, data.edges);
        setIsAiModalOpen(false);
        setPromptText('');
      } else {
        throw new Error('Invalid workflow graph returned from AI');
      }
    } catch (err: any) {
      console.error('Workflow generation failed:', err);
      setErrorMsg(err.message || 'Failed to generate workflow. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#0c0c0e] border border-white/5 rounded-xl p-6 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop decorative */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">AI Workflow Builder</h2>
              <p className="text-xs text-slate-400 mt-0.5">Describe what you want to automate in plain English</p>
            </div>
          </div>
          <button
            onClick={() => setIsAiModalOpen(false)}
            className="p-1 rounded hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Prompt Input */}
        <div className="space-y-3 relative z-10">
          <textarea
            rows={4}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="e.g. Build an automated workflow that fetches today's Google Calendar meetings, uses Gemini to summarize meeting prep notes, and sends a summary report..."
            className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500/50 rounded-md p-3 text-xs text-slate-200 outline-none resize-none transition-all placeholder:text-slate-600"
          />

          {errorMsg && (
            <div className="p-3 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Prompt Quick Suggestions */}
          <div>
            <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-widest mb-2">
              Sample Automations
            </h4>
            <div className="space-y-2">
              {PROMPT_SUGGESTIONS.map((item, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setPromptText(item.prompt);
                    handleGenerate(item.prompt);
                  }}
                  disabled={isLoading}
                  className="w-full text-left p-3 rounded-md bg-[#18181b] hover:bg-white/5 border border-white/5 hover:border-blue-500/40 transition-all group flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="text-xs font-semibold text-blue-300 group-hover:text-blue-200 mb-0.5">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">
                      {item.prompt}
                    </div>
                  </div>
                  <Wand2 className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-end gap-3 relative z-10">
          <button
            onClick={() => setIsAiModalOpen(false)}
            className="px-3 py-1.5 rounded-md text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => handleGenerate()}
            disabled={isLoading || !promptText.trim()}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-all shadow-md ${
              isLoading || !promptText.trim()
                ? 'bg-blue-950/50 text-blue-400/50 cursor-not-allowed border border-white/5'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-300" />
                <span>Designing Graph...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Build Workflow Graph</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
