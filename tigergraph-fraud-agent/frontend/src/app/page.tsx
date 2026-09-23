"use client";

import React, { useEffect, useState } from 'react';
import { Activity, ShieldAlert, Cpu, Share2, Search, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';

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
      console.warn("Backend not reached", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
    const interval = setInterval(fetchCases, 5000);
    return () => clearInterval(interval);
  }, []);

  const simulateNewCase = async () => {
    try {
      const createRes = await fetch("http://localhost:8000/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trigger_type: "api_request",
          customer_id: "C" + Math.floor(Math.random() * 10000),
          transaction_id: "TXN" + Math.floor(Math.random() * 100000),
          initial_risk: 0.85 + (Math.random() * 0.15)
        })
      });
      if (!createRes.ok) throw new Error("Failed");
      const createData = await createRes.json();
      const caseId = createData.case.case_id;

      await fetchCases();

      await fetch(`http://localhost:8000/api/cases/${caseId}/investigate`, {
        method: "POST"
      });
      await fetchCases();

    } catch (e) {
      console.warn("Backend unavailable, simulating locally for demo...", e);
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
      
      setTimeout(() => {
        setCases(prev => prev.map(c => c.case_id === mockCaseId ? {
          ...c,
          status: "AWAITING_APPROVAL",
          recommended_action: "BLOCK_CARD",
          confidence_level: "HIGH_CONFIDENCE",
          explanation: "Automated step-up failed. Graph reveals strong historical fraud ring linkage."
        } : c));
        setActiveCase((prev: any) => ({
          ...prev,
          status: "AWAITING_APPROVAL",
          recommended_action: "BLOCK_CARD",
          confidence_level: "HIGH_CONFIDENCE",
          explanation: "Automated step-up failed. Graph reveals strong historical fraud ring linkage."
        }));
      }, 3500);
    }
  };

  const handleApprove = () => {
    if (!activeCase) return;
    setCases(prev => prev.map(c => 
      c.case_id === activeCase.case_id 
        ? { ...c, status: "CLOSED", final_decision: "APPROVED_ACTION" } 
        : c
    ));
    setActiveCase({ ...activeCase, status: "CLOSED", final_decision: "APPROVED_ACTION" });
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
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Real-Time Alerts</h2>
          <p className="text-slate-500 mt-1">Monitor and approve agentic decisions across your network.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID..." 
              className="bg-transparent border-none outline-none text-sm w-48 text-slate-700 placeholder-slate-400"
            />
          </div>
          <button 
            onClick={simulateNewCase}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 transition-all text-white font-semibold rounded-lg shadow-sm flex items-center gap-2"
          >
            <Activity size={18} /> Trigger Signal
          </button>
        </div>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard title="Active Investigations" value={cases.filter(c => c.status === 'OPEN').length.toString()} trend="Live" accent="indigo" />
        <MetricCard title="Agent Resolved" value={cases.filter(c => c.status !== 'OPEN').length.toString()} trend="Session" accent="sky" />
        <MetricCard title="Graph Queries / sec" value="1.2k" trend="Stable" accent="emerald" />
        <MetricCard title="High Risk Alerts" value={cases.filter(c => c.risk_score > 0.8).length.toString()} trend="Tracked" accent="rose" />
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Cases Table */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-[600px]">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <ShieldAlert size={18} className="text-indigo-500" />
              Live Feed
            </h3>
            <button onClick={fetchCases} className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition flex items-center gap-1">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
          
          <div className="overflow-x-auto overflow-y-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider bg-slate-50 sticky top-0">
                  <th className="p-4">Case ID</th>
                  <th className="p-4">Entity</th>
                  <th className="p-4">Risk</th>
                  <th className="p-4">State</th>
                  <th className="p-4 text-right">NBA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCases.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-slate-500">
                      {searchQuery ? "No matches found." : "No active cases."}
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
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-[600px]">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Cpu size={18} className="text-indigo-500" />
              Agent Trace
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {activeCase ? `Tracing ${activeCase.case_id}` : "Select a case"}
            </p>
          </div>
          
          {activeCase ? (
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              <TraceStep 
                title="Alert Received" 
                time="0.0s"
                desc={`Model flagged TXN ${activeCase.transaction_id} for ${activeCase.customer_id} with score ${activeCase.risk_score.toFixed(2)}.`}
                status="done"
              />
              {activeCase.status !== 'OPEN' && (
                <>
                  <TraceStep title="Graph Traversal" time="1.2s" desc="Agent checked devices and IPs." status="done" isCode />
                  <TraceStep title="GraphRAG Policies" time="2.4s" desc={`Retrieved logic. Confidence: ${activeCase.confidence_level}`} status="done" />
                  <TraceStep 
                    title={activeCase.status === "AWAITING_APPROVAL" ? "Awaiting Review" : "Closed"}
                    time="3.5s"
                    desc={`NBA: ${activeCase.recommended_action}. ${activeCase.explanation}`}
                    status={activeCase.status === "AWAITING_APPROVAL" ? "active" : "done"}
                    pulse={activeCase.status === "AWAITING_APPROVAL"}
                  />
                </>
              )}
            </div>
          ) : (
             <div className="p-6 flex-1 flex items-center justify-center text-slate-400 text-sm">
               No case selected.
             </div>
          )}
          
          {activeCase && activeCase.status === 'AWAITING_APPROVAL' && (
            <div className="p-5 border-t border-slate-100 bg-slate-50">
              <button 
                onClick={handleApprove}
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm transition"
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

function MetricCard({ title, value, trend, accent }: any) {
  const accents: any = {
    indigo: 'bg-indigo-50 text-indigo-700',
    sky: 'bg-sky-50 text-sky-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    rose: 'bg-rose-50 text-rose-700',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden group">
      <div className="flex justify-between items-start mb-2 relative z-10">
        <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${accents[accent]}`}>
          {trend}
        </span>
      </div>
      <p className="text-3xl font-extrabold text-slate-900 relative z-10">{value}</p>
    </div>
  )
}

function CaseRow({ id, entity, trigger, score, state, action, active, resolved, onClick }: any) {
  return (
    <tr onClick={onClick} className={`cursor-pointer transition-colors ${active ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}>
      <td className="p-4">
        <span className={`font-mono text-sm font-semibold ${active ? 'text-indigo-700' : 'text-slate-700'}`}>{id}</span>
      </td>
      <td className="p-4">
        <p className="text-sm font-semibold text-slate-800">{entity}</p>
        <p className="text-xs text-slate-500">{trigger}</p>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${score > 0.8 ? 'bg-rose-500' : score > 0.5 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${score * 100}%` }} />
          </div>
          <span className="text-xs font-bold text-slate-600">{score.toFixed(2)}</span>
        </div>
      </td>
      <td className="p-4">
        <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded-md ${
          resolved ? 'bg-emerald-100 text-emerald-700' :
          state === 'AWAITING_APPROVAL' ? 'bg-amber-100 text-amber-700' : 
          'bg-indigo-100 text-indigo-700'
        }`}>
          {state}
        </span>
      </td>
      <td className="p-4 text-right">
        <span className="text-xs font-bold text-slate-700">{action}</span>
      </td>
    </tr>
  )
}

function TraceStep({ title, time, desc, status, isCode, pulse }: any) {
  return (
    <div className="relative pl-6 pb-4 border-l-2 border-slate-200 last:border-0 last:pb-0">
      <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white ${
        status === 'done' ? 'bg-emerald-500' : 'bg-indigo-500'
      } ${pulse ? 'animate-pulse' : ''}`} />
      
      <div className="flex justify-between items-start mb-1">
        <h4 className="text-sm font-bold text-slate-800">{title}</h4>
        <span className="text-[10px] text-slate-400 font-mono font-medium">{time}</span>
      </div>
      
      {isCode ? (
        <div className="mt-2 bg-slate-50 rounded-md p-2 border border-slate-200">
          <code className="text-[11px] text-indigo-600 font-mono font-medium">{desc}</code>
        </div>
      ) : (
        <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
      )}
    </div>
  )
}
