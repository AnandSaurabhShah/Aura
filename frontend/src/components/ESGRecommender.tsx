"use client";

import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { ESGRecommendation } from "@/lib/types";

export default function ESGRecommender() {
  const [data, setData] = useState<ESGRecommendation | null>(null);

  useEffect(() => {
    apiFetch<ESGRecommendation>("/api/esg/recommend/1")
      .then(setData)
      .catch(() => setData(null));
  }, []);

  if (!data) {
    return <div className="h-[420px] rounded-[32px] bg-white/70 shadow-soft" />;
  }

  return (
    <section className="rounded-[32px] border border-[color:var(--border)] bg-white p-6 shadow-soft">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-red)]">
        ESG Carbon Recommender
      </p>
      <div className="mt-4 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[28px] bg-[color:var(--panel)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
            Monthly carbon footprint
          </p>
          <p className="mt-3 text-4xl font-semibold text-[color:var(--ink)]">
            {data.total_carbon_kg.toFixed(2)}
          </p>
          <p className="mt-1 text-sm text-[color:var(--muted)]">kg CO2e mapped from MCC activity</p>

          <div className="mt-6 rounded-[28px] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Primary recommendation
            </p>
            <p className="mt-2 text-xl font-semibold text-[color:var(--ink)]">
              {data.recommended_fund.name}
            </p>
            <p className="mt-2 text-sm leading-7 text-[color:var(--ink-soft)]">
              {data.recommended_fund.thesis}
            </p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-red)]">
              Confidence {data.recommended_fund.confidence.toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--panel)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Emissions breakdown
            </p>
            <div className="mt-4 space-y-3">
              {data.breakdown.map((item) => (
                <div key={item.category} className="rounded-3xl bg-white px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[color:var(--ink)]">
                        {item.category}
                      </p>
                      <p className="text-xs text-[color:var(--muted)]">
                        {formatCurrency(item.spend)} spent
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-[color:var(--brand-red)]">
                      {item.carbon_kg.toFixed(2)} kg
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--panel)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Alternatives
              </p>
              <div className="mt-3 space-y-3">
                {data.alternatives.map((item) => (
                  <div key={item.fund_code} className="rounded-3xl bg-white px-4 py-4">
                    <p className="text-sm font-semibold text-[color:var(--ink)]">
                      {item.name}
                    </p>
                    <p className="mt-1 text-xs text-[color:var(--muted)]">
                      {item.risk_profile} • {item.confidence.toFixed(1)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--panel)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Model rationale
              </p>
              <div className="mt-3 space-y-3">
                {data.rationale.map((item) => (
                  <div key={item} className="rounded-3xl bg-white px-4 py-4 text-sm leading-7 text-[color:var(--ink-soft)]">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
