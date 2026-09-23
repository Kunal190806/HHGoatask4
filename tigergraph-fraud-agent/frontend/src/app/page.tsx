"use client";

import React, { useEffect, useState } from 'react';
import { Activity, ShieldAlert, Cpu, Share2, Search, ArrowUpRight, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCase, setActiveCase] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCases = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/cases");
      if (res.ok) {
        const data = await res.json();
        setCases(data.cases);
      }
    } catch (e) {
      console.error("Failed to fetch cases", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
    // Poll every 5 seconds for dashboard freshness
    const interval = setInterval(fetchCases, 5000);
    return () => clearInterval(interval);
  }, []);

  const simulateNewCase = async () => {
    try {
      // 1. Create case
      const createRes = await fetch("http://localhost:8000/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trigger_type: "api_request",
          customer_id: "C" + Math.floor(Math.random() * 10000),
          transaction_id: "TXN" + Math.floor(Math.random() * 100000),
          initial_risk: 0.85 + (Math.random() * 0.15) // High risk
        })
      });
      if (!createRes.ok) {
        throw new Error(`Failed to create case: ${await createRes.text()}`);
      }
      const createData = await createRes.json();
      const caseId = createData.case.case_id;

      await fetchCases(); // Refresh to show OPEN state

      // 2. Trigger Investigation
      await fetch(`http://localhost:8000/api/cases/${caseId}/investigate`, {
        method: "POST"
      });

      await fetchCases(); // Refresh to show completed state

    } catch (e) {
      console.warn("Backend unavailable, simulating locally for demo...", e);
      
      // Fallback Demo Mode for Hackathon
      const mockCaseId = "HHG-" + Math.floor(Math.random() * 1000);
      const newMockCase = {
        case_id: mockCaseId,
        customer_id: "C" + Math.floor(Math.random() * 10000),
        transaction_id: "TXN" + Math.floor(Math.random() * 100000),
        risk_score: 0.85 + (Math.random() * 0.15),
        status: "OPEN",
        recommended_action: null,
      };
      
      setCases(prev => [...prev, newMockCase]);
      setActiveCase(newMockCase);
      
      // Simulate processing delay
      setTimeout(() => {
        setCases(prev => prev.map(c => c.case_id === mockCaseId ? {
          ...c,
          status: "AWAITING_APPROVAL",
          recommended_action: "BLOCK_CARD",
          confidence_level: "HIGH_CONFIDENCE",
          explanation: "Automated step-up failed. Device graph confirms historical fraud ring linkage."
        } : c));
        setActiveCase((prev: any) => ({
          ...prev,
          status: "AWAITING_APPROVAL",
          recommended_action: "BLOCK_CARD",
          confidence_level: "HIGH_CONFIDENCE",
          explanation: "Automated step-up failed. Device graph confirms historical fraud ring linkage."
        }));
      }, 3500);
    }
  };

  const handleApprove = () => {
    if (!activeCase) return;
    
    // Optimistic UI update for demo
    setCases(prev => prev.map(c => 
      c.case_id === activeCase.case_id 
        ? { ...c, status: "CLOSED", final_decision: "APPROVED_ACTION" } 
        : c
    ));
    setActiveCase({ ...activeCase, status: "CLOSED", final_decision: "APPROVED_ACTION" });
    
    // Try hitting backend if it's alive, but don't crash if on Vercel fallback
    fetch(`http://localhost:8000/api/cases/${activeCase.case_id}/approve`, {
      method: "POST"
    }).catch(e => console.warn("Backend not reached for approval", e));
  };

  const filteredCases = cases.filter(c => 
    c.case_id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.customer_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.transaction_id && c.transaction_id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
          <button 
            onClick={simulateNewCase}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 transition text-white font-semibold rounded-lg shadow-lg flex items-center gap-2"
          >
            <Activity size={18} /> Trigger Signal
          </button>
          <div className="glass-panel px-4 py-2 rounded-lg flex items-center gap-2">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
          value={cases.filter(c => c.status === 'OPEN').length.toString()} 
          trend="Live" 
          icon={<Activity className="text-blue-400" />} 
          accent="blue" 
        />
        <MetricCard 
          title="Agent Resolved" 
          value={cases.filter(c => c.status !== 'OPEN').length.toString()} 
          trend="Session" 
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
          value={cases.filter(c => c.risk_score > 0.8).length.toString()} 
          trend="Tracked" 
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
            <button 
              onClick={fetchCases}
              className="text-sm font-medium text-slate-400 hover:text-white transition flex items-center gap-1"
            >
              <RefreshCw size={16} /> Refresh
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
                {filteredCases.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      {searchQuery ? "No cases match your search." : "No active cases. Click 'Trigger Signal' to simulate a fraud alert."}
                    </td>
                  </tr>
                )}
                {filteredCases.slice().reverse().map(c => (
                  <CaseRow 
                    key={c.case_id}
                    id={c.case_id} 
                    entity={c.customer_id} 
                    trigger={`TXN ${c.transaction_id}`} 
                    score={c.risk_score} 
                    state={c.status} 
                    action={c.recommended_action || "ANALYZING..."} 
                    active={activeCase?.case_id === c.case_id}
                    resolved={c.status === 'CLOSED'}
                    onClick={() => setActiveCase(c)}
                  />
                ))}
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
            <p className="text-xs text-slate-400 mt-1">
              {activeCase ? `Tracing execution for ${activeCase.case_id}` : "Select a case to view agent traces"}
            </p>
          </div>
          
          {activeCase ? (
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              <TraceStep 
                title="Alert Received" 
                time="T+0.0s"
                desc={`Model flagged TXN ${activeCase.transaction_id} for Customer ${activeCase.customer_id} with initial score ${activeCase.risk_score.toFixed(2)}.`}
                status="done"
              />
              {activeCase.status !== 'OPEN' && (
                <>
                  <TraceStep 
                    title="Graph Tool: execute_gsql" 
                    time="T+1.2s"
                    desc="Agent traversed connected devices, IPs, and historical transactions."
                    status="done"
                    isCode
                  />
                  <TraceStep 
                    title="GraphRAG: Policy Lookup" 
                    time="T+2.4s"
                    desc={`Retrieved policy mappings. Agent assessed Confidence: ${activeCase.confidence_level}`}
                    status="done"
                  />
                  <TraceStep 
                    title={activeCase.status === "AWAITING_APPROVAL" ? "Awaiting Approval" : "Case Closed"}
                    time="T+3.5s"
                    desc={`NBA: ${activeCase.recommended_action}. ${activeCase.explanation}`}
                    status={activeCase.status === "AWAITING_APPROVAL" ? "active" : "done"}
                    pulse={activeCase.status === "AWAITING_APPROVAL"}
                  />
                </>
              )}
            </div>
          ) : (
             <div className="p-6 flex-1 flex items-center justify-center text-slate-500 text-sm">
               No case selected.
             </div>
          )}
          
          {activeCase && activeCase.status === 'AWAITING_APPROVAL' && (
            <div className="p-4 border-t border-slate-800/50 bg-slate-900/30">
              <button 
                onClick={handleApprove}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition hover:-translate-y-0.5"
              >
                Approve {activeCase.recommended_action}
              </button>
            </div>
          )}
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
        <span className={`text-xs font-semibold px-2 py-1 rounded-md bg-slate-900/80 border border-slate-700/50 ${trend.startsWith('+') || trend === 'Stable' || trend === 'Live' || trend === 'Session' || trend === 'Tracked' ? 'text-emerald-400' : 'text-rose-400'}`}>
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

function CaseRow({ id, entity, trigger, score, state, action, active, resolved, onClick }: any) {
  return (
    <tr onClick={onClick} className={`group cursor-pointer transition-colors ${active ? 'bg-blue-500/10' : 'hover:bg-slate-800/30'}`}>
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
