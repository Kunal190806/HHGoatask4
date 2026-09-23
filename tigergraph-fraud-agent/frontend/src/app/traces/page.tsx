"use client";
import React from 'react';
import { Activity, Terminal } from 'lucide-react';

export default function AgentTraces() {
  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Activity className="text-indigo-400" /> Agent Execution Traces
        </h1>
        <p className="text-slate-400 mt-2">Raw LangGraph state transitions and LLM reasoning logs.</p>
      </header>
      
      <div className="bg-black/50 border border-slate-800 rounded-xl p-6 font-mono text-sm text-green-400/80 shadow-2xl h-[600px] overflow-y-auto">
        <div className="flex items-center gap-2 mb-4 text-slate-500 border-b border-slate-800 pb-4">
          <Terminal size={16} /> System ready. Awaiting verbose trace stream...
        </div>
        <p className="mb-2">[{new Date().toISOString()}] [INFO] TigerGraph Savanna cluster connected.</p>
        <p className="mb-2">[{new Date().toISOString()}] [INFO] MCP Tools loaded: execute_gsql, get_device_neighbors, retrieve_policy</p>
        <p className="mb-2 text-slate-500">Monitoring for live investigation traces...</p>
      </div>
    </div>
  );
}
