import React, { useEffect, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { 
  Activity, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  TrendingUp, 
  BarChart3,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { motion } from 'motion/react';

export const DashboardView: React.FC = () => {
  const { executionHistory = [], fetchExecutionHistory } = useWorkflowStore();

  // Pull persisted server history (Postgres) on mount so analytics reflect real runs
  useEffect(() => {
    fetchExecutionHistory();
  }, [fetchExecutionHistory]);

  // If history is empty, use some high-quality mock data for demonstration
  const data = useMemo(() => {
    if (executionHistory.length > 0) {
      // Process actual data
      const processed = executionHistory.slice(0, 10).reverse().map(run => ({
        name: new Date(run.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration: run.totalDurationMs || 0,
        status: run.status === 'completed' ? 1 : 0,
        raw: run
      }));
      return processed;
    }

    // Mock data
    return [
      { name: '10:00', duration: 450, status: 1 },
      { name: '10:30', duration: 1200, status: 1 },
      { name: '11:00', duration: 800, status: 0 },
      { name: '11:30', duration: 600, status: 1 },
      { name: '12:00', duration: 2100, status: 1 },
      { name: '12:30', duration: 950, status: 1 },
      { name: '13:00', duration: 1500, status: 0 },
      { name: '13:30', duration: 1100, status: 1 },
      { name: '14:00', duration: 400, status: 1 },
      { name: '14:30', duration: 750, status: 1 },
    ];
  }, [executionHistory]);

  const stats = useMemo(() => {
    const history = executionHistory.length > 0 ? executionHistory : [];
    const total = history.length || 10;
    const completed = history.length > 0 ? history.filter(r => r.status === 'completed').length : 8;
    const failed = history.length > 0 ? history.filter(r => r.status === 'failed').length : 2;
    const avgLatency = history.length > 0 
      ? Math.round(history.reduce((acc, r) => acc + (r.totalDurationMs || 0), 0) / history.length) 
      : 1045;

    return { total, completed, failed, avgLatency };
  }, [executionHistory]);

  const pieData = [
    { name: 'Success', value: stats.completed, color: '#10b981' },
    { name: 'Failure', value: stats.failed, color: '#f43f5e' },
  ];

  return (
    <div className="flex-1 h-full bg-[#09090b] overflow-y-auto p-8 custom-scrollbar">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex items-end justify-between border-b border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Performance Intelligence</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Workflow Analytics</h1>
            <p className="text-slate-400 text-sm mt-1">Real-time telemetry and execution health metrics for your AI workspace.</p>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-xs font-mono text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Last 24 Hours</span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Executions" 
            value={stats.total.toString()} 
            icon={Activity} 
            color="blue" 
            trend="+12%" 
          />
          <StatCard 
            title="Success Rate" 
            value={`${Math.round((stats.completed / stats.total) * 100)}%`} 
            icon={CheckCircle2} 
            color="emerald" 
            trend="+5.2%" 
          />
          <StatCard 
            title="Avg. Latency" 
            value={`${stats.avgLatency}ms`} 
            icon={Zap} 
            color="amber" 
            trend="-14ms" 
          />
          <StatCard 
            title="Failed Triggers" 
            value={stats.failed.toString()} 
            icon={AlertTriangle} 
            color="rose" 
            trend="-2" 
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Latency Trend */}
          <div className="lg:col-span-2 bg-[#0c0c0e] border border-white/10 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Latency & Runtime Trend</h3>
                  <p className="text-[10px] text-slate-500 uppercase font-mono mt-0.5">Execution duration over time (ms)</p>
                </div>
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `${value}ms`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0c0c0e', 
                      borderColor: '#ffffff10',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    itemStyle={{ color: '#94a3b8' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="duration" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorLatency)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Success/Failure Ratio */}
          <div className="bg-[#0c0c0e] border border-white/10 rounded-xl p-6 shadow-xl flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Stability Matrix</h3>
                <p className="text-[10px] text-slate-500 uppercase font-mono mt-0.5">Health distribution</p>
              </div>
            </div>
            <div className="flex-1 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0c0c0e', 
                      borderColor: '#ffffff10',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    content={({ payload }) => (
                      <div className="flex justify-center gap-6 mt-4">
                        {payload?.map((entry: any, index: number) => (
                          <div key={`item-${index}`} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-xs text-slate-400">{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">System Uptime</span>
                <span className="text-emerald-400 font-mono">99.98%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Error Frequency</span>
                <span className="text-rose-400 font-mono">0.02 / min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Distribution */}
        <div className="bg-[#0c0c0e] border border-white/10 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 border border-purple-500/20">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Step Level Latency Analysis</h3>
                <p className="text-[10px] text-slate-500 uppercase font-mono mt-0.5">Comparative node performance benchmarks</p>
              </div>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.slice(0, 7)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <Tooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ 
                    backgroundColor: '#0c0c0e', 
                    borderColor: '#ffffff10',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar 
                  dataKey="duration" 
                  radius={[4, 4, 0, 0]}
                  fill="#6366f1"
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.status === 1 ? '#6366f1' : '#f43f5e'} 
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: 'blue' | 'emerald' | 'amber' | 'rose';
  trend: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, trend }) => {
  const colors = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
  };

  const trendIsPositive = trend.startsWith('+') || !trend.startsWith('-');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0c0c0e] border border-white/10 rounded-xl p-5 shadow-lg group hover:border-white/20 transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg border ${colors[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
          trendIsPositive ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'
        }`}>
          {trend}
        </div>
      </div>
      <div>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">{title}</p>
        <p className="text-2xl font-bold text-slate-100 font-mono tracking-tight">{value}</p>
      </div>
    </motion.div>
  );
};
