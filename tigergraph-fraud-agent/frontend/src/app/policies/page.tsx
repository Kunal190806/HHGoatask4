"use client";
import React from 'react';
import { FileText, Database } from 'lucide-react';

export default function GraphPolicies() {
  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <FileText className="text-emerald-400" /> GraphRAG Policies
        </h1>
        <p className="text-slate-400 mt-2">Active business rules and typologies embedded in the RAG vector store.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
              <Database size={20} />
            </div>
            <h3 className="font-bold text-lg text-slate-200">Rule R1: Verify Action</h3>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            When a transaction originates outside the customer's primary billing region and risk score exceeds 0.60, the agent must require step-up authentication prior to recommending an outright block.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400">
              <Database size={20} />
            </div>
            <h3 className="font-bold text-lg text-slate-200">Rule R6: Shared Origin</h3>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            If a graph traversal reveals that a device executing a high-risk transaction is linked to 3+ unique accounts within 24 hours, the agent must immediately output a BLOCK action and escalate.
          </p>
        </div>
      </div>
    </div>
  );
}
