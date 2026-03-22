"use client";

import React, { useState } from "react";
import { CreditCard, Zap, BrainCircuit, Scan, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Simulated Card Catalog mapping backend IDs to UI details
const CARD_CATALOG: Record<string, { name: string; image: string; fee: string; color: string }> = {
  "premier-credit-card": {
    name: "Aura Premier Credit Card",
    image: "/images/premier-card.png", // Assume we have some placeholder or generic style
    fee: "Nil (with Premier Status)",
    color: "from-slate-800 to-slate-900",
  },
  "live-plus-card": {
    name: "Aura Live+ Credit Card",
    image: "/images/live-plus.png",
    fee: "₹999 / year",
    color: "from-blue-600 to-indigo-700",
  },
  "visa-platinum": {
    name: "Aura Visa Platinum",
    image: "/images/visa-plat.png",
    fee: "Lifetime Free",
    color: "from-gray-300 to-gray-500",
  },
  "rupay-cashback": {
    name: "Aura RuPay Cashback Platinum",
    image: "/images/rupay-plat.png",
    fee: "₹299 / year",
    color: "from-emerald-500 to-emerald-700",
  },
};

type PredictionResult = {
  prediction_status: string;
  recommended_card_id: string;
  confidence_score: number;
  ml_persona_cluster: string;
  top_spend_category: string;
  ai_agent_rationale: string;
  dl_probabilities: Record<string, number>;
};

export default function CreditCardPredictor() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState("");

  const handlePredict = async () => {
    setScanning(true);
    setError("");
    setResult(null);

    // Simulate Deep AI Scan Delay for UX
    await new Promise((resolve) => setTimeout(resolve, 2500));

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
      const res = await fetch(`${baseUrl}/api/credits/predict/1`);
      if (!res.ok) throw new Error("Failed to reach predictive engine");
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong while predicting.");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-800 mb-2">
          AI Credit Card Predictor
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Our Deep Learning & Contextual Bandit Reinforcement Learning models analyze your real-time 
          transaction history to hyper-personalize the exact credit card that maximizes your lifestyle returns.
        </p>
      </div>

      {!scanning && !result && (
        <div className="flex justify-center mt-12">
          <button
            onClick={handlePredict}
            className="group relative flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-full font-semibold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-xl hover:shadow-red-500/20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-900 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <BrainCircuit className="w-6 h-6 relative z-10 animate-pulse text-red-400 group-hover:text-white" />
            <span className="relative z-10">Scan Spending & Predict My Card</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

      {scanning && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mt-8">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <Scan className="w-16 h-16 text-red-600 animate-[spin_3s_linear_infinite]" />
              <div className="absolute inset-0 border-t-2 border-red-500 rounded-full animate-ping opacity-75" />
            </div>
            <div className="space-y-2 text-center">
              <p className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-red-500" />
                Executing Multi-Layer Perceptron (DL)...
              </p>
              <p className="text-sm text-gray-500">
                Clustering lifestyle persona with K-Means (ML)...
              </p>
              <p className="text-sm text-gray-500">
                Optimizing adoption rewards via Contextual Bandits (RL)...
              </p>
            </div>
            
            {/* Fake progress bar */}
            <div className="w-64 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-red-600 w-full animate-[pulse_1s_ease-in-out_infinite]" style={{ transformOrigin: "left" }} />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-8 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3">
          <ShieldCheck className="w-5 h-5" />
          {error}
        </div>
      )}

      {result && !scanning && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Card Showcase */}
          <div className="lg:col-span-5 relative group perspective">
            <div className={cn(
              "w-full h-[320px] rounded-2xl shadow-2xl p-6 flex flex-col justify-between text-white transform transition-transform duration-500 hover:rotate-3 hover:scale-105",
              CARD_CATALOG[result.recommended_card_id]?.color || "bg-gray-800"
            )}>
              <div className="flex justify-between items-start">
                <h3 className="text-2xl font-bold max-w-[200px] leading-tight">
                  {CARD_CATALOG[result.recommended_card_id]?.name || "Aura Card"}
                </h3>
                <Zap className="w-8 h-8 text-yellow-400" fill="currentColor" />
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-white/70 text-sm uppercase tracking-wider font-semibold">AI Match Confidence</p>
                  <div className="flex items-center gap-3">
                    <div className="text-4xl font-black text-white drop-shadow-md">
                      {result.confidence_score.toFixed(1)}%
                    </div>
                    {result.confidence_score > 80 && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs font-bold rounded-md backdrop-blur-sm border border-green-400/30">
                        HYPER MATCH
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                  <p className="text-sm font-medium">Annual Fee: {CARD_CATALOG[result.recommended_card_id]?.fee}</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Rationale Panel */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="p-2 bg-red-50 rounded-lg">
                  <BrainCircuit className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">AI Agent Rationale</h3>
                  <p className="text-sm text-gray-500">Deterministic Analysis Report</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">ML Lifestyle Cluster</p>
                  <p className="font-bold text-gray-900 flex items-center gap-2">
                    {result.ml_persona_cluster}
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Primary Velocity</p>
                  <p className="font-bold text-gray-900">
                    {result.top_spend_category} Spend
                  </p>
                </div>
              </div>

              <div className="flex-1 bg-gradient-to-r from-gray-900 to-gray-800 p-5 rounded-xl text-gray-100 text-base leading-relaxed relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                <p className="relative z-10 italic">
                  "{result.ai_agent_rationale}"
                </p>
              </div>
              
              <div className="mt-6 flex gap-4">
                <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-medium transition-colors">
                  Apply Now
                </button>
                <button 
                  onClick={() => setResult(null)}
                  className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 rounded-xl font-medium transition-colors"
                >
                  Rescan
                </button>
              </div>

            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
