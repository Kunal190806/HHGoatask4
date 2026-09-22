import React from 'react';
import { Activity, ShieldAlert, Cpu, Share2, Search, ArrowUpRight, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Operations Center
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Real-time graph-driven investigations & NBA Engine.</p>
        </div>
        <div className="flex gap-4">
          <div className="glass-panel px-4 py-2 rounded-lg flex items-center gap-2">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search Case or Txn..." 
              className="bg-transparent border-none outline-none text-sm w-48 text-slate-200 placeholder-slate-500"
            />
          </div>
        </div>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <MetricCard 
          title="Active Investigations" 
          value="24" 
          trend="+3" 
          icon={<Activity className="text-blue-400" />} 
          accent="blue" 
        />
        <MetricCard 
          title="Agent Resolved (24h)" 
          value="182" 
          trend="+12%" 
          icon={<Cpu className="text-indigo-400" />} 
          accent="indigo" 
        />
        <MetricCard 
          title="Graph Queries / sec" 
          value="1.2k" 
          trend="Stable" 
          icon={<Share2 className="text-emerald-400" />} 
          accent="emerald" 
        />
        <MetricCard 
          title="High Risk Alerts" 
          value="7" 
          trend="-2" 
          icon={<ShieldAlert className="text-rose-400" />} 
          accent="rose" 
        />
      </div>
      
      {/* Main Investigation Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Cases Table */}
        <div className="xl:col-span-2 glass-panel rounded-2xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-800/50 flex justify-between items-center bg-slate-900/50">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-400" />
              Agent Case Queue
            </h2>
            <button className="text-sm font-medium text-blue-400 hover:text-blue-300 transition flex items-center gap-1">
              View All <ArrowUpRight size={16} />
            </button>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider bg-slate-900/30">
                  <th className="p-5 font-medium">Case ID</th>
                  <th className="p-5 font-medium">Entity / Trigger</th>
                  <th className="p-5 font-medium">Risk Score</th>
                  <th className="p-5 font-medium">State</th>
                  <th className="p-5 font-medium text-right">NBA Recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                <CaseRow 
                  id="HHG-017" 
                  entity="C06403-K2" 
                  trigger="Graph Anomaly (Device)" 
                  score={0.92} 
                  state="AWAITING_APPROVAL" 
                  action="BLOCK_CARD" 
                  active={true}
                />
                <CaseRow 
                  id="HHG-018" 
                  entity="C13440-K2" 
                  trigger="Out-of-Region Use" 
                  score={0.71} 
                  state="COLLECTING_EVIDENCE" 
                  action="STEP_UP_AUTH" 
                />
                <CaseRow 
                  id="HHG-019" 
                  entity="C05876-K2" 
                  trigger="Model Score Spike" 
                  score={0.88} 
                  state="RESOLVED" 
                  action="ALLOW" 
                  resolved={true}
                />
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Agent Trace Sidebar */}
        <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-800/50 bg-slate-900/50">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Cpu size={18} className="text-blue-400" />
              Live Agent Trace
            </h2>
            <p className="text-xs text-slate-400 mt-1">Tracing execution for HHG-017</p>
          </div>
          
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            <TraceStep 
              title="Alert Received" 
              time="10:42:01 AM"
              desc="Model flagged txn 3000332 with score 0.92."
              status="done"
            />
            <TraceStep 
              title="Graph Tool: get_device_neighbors" 
              time="10:42:02 AM"
              desc="Found 1 connected card (C06403-K1) linked to prior confirmed fraud CC-0002."
              status="done"
              isCode
            />
            <TraceStep 
              title="GraphRAG: Policy Lookup" 
              time="10:42:03 AM"
              desc="Retrieved Policy R6 (Shared Origin Fraud). Recommendation: BLOCK_CARD."
              status="done"
            />
            <TraceStep 
              title="Awaiting Approval" 
              time="10:42:04 AM"
              desc="Generated NBA: Block Card C06403-K2. Requires L1 Approval."
              status="active"
              pulse
            />
          </div>
          
          <div className="p-4 border-t border-slate-800/50 bg-slate-900/30">
            <button className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition hover:-translate-y-0.5">
              Approve Block Action
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// Subcomponents

function MetricCard({ title, value, trend, icon, accent }: any) {
  const accentColors: any = {
    blue: 'from-blue-500/20 to-transparent border-blue-500/20',
    indigo: 'from-indigo-500/20 to-transparent border-indigo-500/20',
    emerald: 'from-emerald-500/20 to-transparent border-emerald-500/20',
    rose: 'from-rose-500/20 to-transparent border-rose-500/20',
  };

  return (
    <div className={`glass-card rounded-2xl p-6 bg-gradient-to-br ${accentColors[accent]} relative overflow-hidden group`}>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-700/50">
          {icon}
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-md bg-slate-900/80 border border-slate-700/50 ${trend.startsWith('+') || trend === 'Stable' ? 'text-emerald-400' : 'text-rose-400'}`}>
          {trend}
        </span>
      </div>
      <div className="relative z-10">
        <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
        <p className="text-3xl font-bold mt-1 text-white">{value}</p>
      </div>
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition duration-500"></div>
    </div>
  )
}

function CaseRow({ id, entity, trigger, score, state, action, active, resolved }: any) {
  return (
    <tr className={`group cursor-pointer transition-colors ${active ? 'bg-blue-500/5' : 'hover:bg-slate-800/30'}`}>
      <td className="p-5">
        <span className="font-mono text-sm text-slate-300 font-medium group-hover:text-blue-400 transition">{id}</span>
      </td>
      <td className="p-5">
        <p className="text-sm font-medium text-slate-200">{entity}</p>
        <p className="text-xs text-slate-500">{trigger}</p>
      </td>
      <td className="p-5">
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${score > 0.8 ? 'bg-rose-500' : score > 0.5 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
              style={{ width: `${score * 100}%` }} 
            />
          </div>
          <span className="text-xs font-bold text-slate-300">{score.toFixed(2)}</span>
        </div>
      </td>
      <td className="p-5">
        <span className={`px-2.5 py-1 text-xs font-bold rounded-md border ${
          resolved ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
          state === 'AWAITING_APPROVAL' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
          'bg-blue-500/10 text-blue-400 border-blue-500/20'
        }`}>
          {state}
        </span>
      </td>
      <td className="p-5 text-right">
        <span className="text-sm font-semibold text-slate-200">{action}</span>
      </td>
    </tr>
  )
}

function TraceStep({ title, time, desc, status, isCode, pulse }: any) {
  return (
    <div className="relative pl-6 pb-2 border-l-2 border-slate-700/50 last:border-0 last:pb-0">
      <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
        status === 'done' ? 'bg-emerald-500' : 'bg-blue-500'
      } ${pulse ? 'animate-pulse' : ''}`} />
      
      <div className="flex justify-between items-start mb-1">
        <h4 className="text-sm font-bold text-slate-200">{title}</h4>
        <span className="text-[10px] text-slate-500 font-mono">{time}</span>
      </div>
      
      {isCode ? (
        <div className="mt-2 bg-slate-950 rounded-lg p-3 border border-slate-800">
          <code className="text-xs text-emerald-400 font-mono">{desc}</code>
        </div>
      ) : (
        <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
      )}
    </div>
  )
}
