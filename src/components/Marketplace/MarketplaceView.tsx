import React, { useMemo, useState } from 'react';
import { 
  Store, 
  ArrowRight, 
  Tag, 
  Sparkles, 
  Search, 
  X
} from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';

export const MarketplaceView: React.FC = () => {
  const { templates, loadTemplate, setActiveTab } = useWorkflowStore();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(templates.map(t => t.category)))],
    [templates]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return templates.filter(t => {
      const matchesCategory = activeCategory === 'all' || t.category === activeCategory;
      const matchesQuery = !q ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [templates, query, activeCategory]);

  const handleUseTemplate = (id: string) => {
    loadTemplate(id);
    setActiveTab('canvas');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#09090b] p-8 space-y-8">
      {/* Banner + Search */}
      <div className="bg-[#0c0c0e] border border-white/5 rounded-xl p-8 relative overflow-hidden shadow-2xl">
        <div className="max-w-2xl relative z-10">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Workflow Marketplace</span>
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight mb-2">
            Production-Ready AI Workflow Templates
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Jumpstart your automation with pre-configured Google Calendar, Google ADK Multi-Agent, and MCP tool workflows.
          </p>
        </div>
      </div>

      {/* Search + Category Filters */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
        <div className="relative lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search templates, tags..."
            className="w-full pl-9 pr-9 py-2 bg-[#0c0c0e] border border-white/10 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all capitalize ${
                activeCategory === cat
                  ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/10'
              }`}
            >
              {cat === 'all' ? `All (${templates.length})` : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="w-8 h-8 text-slate-600 mb-3" />
          <p className="text-sm text-slate-400 font-medium">No templates match “{query || activeCategory}”.</p>
          <button
            onClick={() => { setQuery(''); setActiveCategory('all'); }}
            className="mt-3 text-xs text-blue-400 hover:text-blue-300 font-semibold"
          >
            Clear filters
          </button>
        </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((tpl) => (
          <div 
            key={tpl.id}
            className="bg-[#0c0c0e] border border-white/5 hover:border-blue-500/40 rounded-xl p-5 flex flex-col justify-between transition-all group shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded font-mono">
                  {tpl.category}
                </span>
                <span className="text-xs text-slate-500 font-mono">{tpl.nodes.length} Nodes</span>
              </div>

              <h3 className="text-sm font-semibold text-slate-100 group-hover:text-blue-300 transition-colors mb-2">
                {tpl.title}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                {tpl.description}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-6">
                {tpl.tags.map((tag, i) => (
                  <span key={i} className="text-[10px] text-slate-400 bg-[#18181b] border border-white/5 px-2 py-0.5 rounded font-mono">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleUseTemplate(tpl.id)}
              className="w-full py-2 px-4 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer"
            >
              <span>Load Template</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};
