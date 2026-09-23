"use client";
import React from 'react';
import { ShieldAlert, Filter, Download } from 'lucide-react';

export default function CaseQueue() {
  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Global Case Queue
          </h1>
          <p className="text-slate-400 mt-2">All historically generated alerts and agent investigations.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 transition text-slate-200 text-sm font-medium rounded-lg flex items-center gap-2 border border-slate-700">
            <Filter size={16} /> Filter
          </button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 transition text-white text-sm font-medium rounded-lg flex items-center gap-2">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </header>
      
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-20 flex flex-col items-center justify-center text-slate-500">
          <ShieldAlert size={48} className="text-slate-700 mb-4" />
          <h3 className="text-lg font-medium text-slate-300">Queue Synced</h3>
          <p className="mt-2 text-sm max-w-md text-center">
            All active cases are currently routed to the primary Dashboard for live Agentic investigation. 
            Historical queue records will populate here upon batch completion.
          </p>
        </div>
      </div>
    </div>
  );
}
