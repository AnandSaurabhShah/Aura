"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Activity, Users, AlertTriangle, ShieldCheck, Zap, Cpu, BarChart3, TrendingUp, SlidersHorizontal } from "lucide-react";

// Dynamically import the NetworkGraph because standard D3 Force won't render server-side
const NetworkGraph = dynamic(() => import("../../components/NetworkGraph"), { ssr: false });

export default function AnalystWorkspace() {
  const [triggerThreshold, setTriggerThreshold] = useState<number>(0.05);
  const [triggerStats, setTriggerStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchTriggerSim = async (val: number) => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
      const res = await fetch(`${baseUrl}/api/analytics/trigger-engine?threshold=${val}`);
      if (res.ok) {
        setTriggerStats(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTriggerSim(triggerThreshold);
  }, []);

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setTriggerThreshold(val);
  };

  const applySimulation = () => {
    fetchTriggerSim(triggerThreshold);
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-20 mt-16 px-8 max-w-7xl mx-auto">
      
      <header className="mb-10 pt-10 border-b border-gray-200 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
              <Activity className="w-8 h-8 text-indigo-600" />
              WPB Enterprise Data Analytics
            </h1>
            <p className="text-gray-500 mt-2 text-sm max-w-2xl">
              Internal Workbench for Senior Leadership and WPB Data Scientists. Features mathematical network isolation for anomaly tracking, and a live campaign simulator.
            </p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" />
              Authorized Analyst
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Trigger Engine & Stats */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Campaign Trigger Engine
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              Simulate a PageRank topology threshold across the dynamic user transaction graph. Flag nodes exceeding the centrality limit for ad-hoc marketing cross-sells or risk reviews.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4" /> Node Centrality Threshold
                  </label>
                  <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">{triggerThreshold.toFixed(3)}</span>
                </div>
                <input 
                  type="range" 
                  min="0.01" max="0.15" step="0.005"
                  value={triggerThreshold}
                  onChange={handleSlider}
                  className="w-full transition-all accent-indigo-600"
                />
              </div>

              <button 
                onClick={applySimulation}
                disabled={loading}
                className="w-full bg-gray-900 hover:bg-black text-white font-medium py-3 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Run Engine Simulation"}
              </button>
            </div>

            {triggerStats && (
              <div className="mt-8 space-y-4 border-t border-gray-100 pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl text-center">
                    <p className="text-[10px] uppercase text-gray-500 font-bold mb-1 tracking-wider">Eligible Nodes</p>
                    <p className="text-2xl font-black text-gray-900">{triggerStats.triggered_count}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl text-center">
                    <p className="text-[10px] uppercase text-gray-500 font-bold mb-1 tracking-wider">Hit Rate</p>
                    <p className="text-2xl font-black text-indigo-600">{triggerStats.conversion_rate_sim}%</p>
                  </div>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                   <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                     <Users className="w-4 h-4" /> Target Leads
                   </h3>
                   <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                     {triggerStats.campaign_targets.length === 0 ? (
                       <p className="text-xs text-indigo-400 italic">No nodes met the strict threshold.</p>
                     ) : triggerStats.campaign_targets.map((t: any, i: number) => (
                       <div key={i} className="flex justify-between items-center bg-white p-2.5 rounded-lg shadow-sm border border-indigo-50">
                         <div>
                           <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                           <p className="text-[10px] font-mono text-gray-400 mt-0.5">ID: {t.user_id} | Score: {t.trigger_score}</p>
                         </div>
                         <div className="text-right">
                           <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                             {t.recommended_action}
                           </span>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
             <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-600" />
              Generative BI Agent
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              To request ad-hoc reporting or macro analysis on these trigger thresholds, communicate with the global Aura Virtual Assistant pinned to your screen. The AI is securely bound to the transaction context.
            </p>
          </div>
          
        </div>

        {/* Right Column: Interactive Network Graph */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-full overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
               <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    Transaction Topology Map
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">Live directed-graph of intra-bank entity fund cascades</p>
               </div>
               <div className="flex gap-2">
                 <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 shadow-sm">
                   <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> PageRank Alg
                 </span>
               </div>
            </div>
            
            <div className="flex-1 bg-slate-50 relative min-h-[500px]">
              <NetworkGraph />
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
