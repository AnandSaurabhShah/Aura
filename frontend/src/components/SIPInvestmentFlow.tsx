"use client";

import { useEffect, useState } from "react";

import { DocVerifyPanel } from "@/components/DocVerifyPanel";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import type { DashboardOverview } from "@/lib/types";

type Tab = "funds" | "sip" | "lumpsum" | "holdings" | "rebalance";

type Fund = {
  fund_id: string; name: string; category: string; risk: string;
  nav: number; ytd_return: number; one_yr_return: number; esg_score: number;
  min_sip: number; min_lumpsum: number;
};

type SIPResult = {
  sip_id: string; fund_name: string; monthly_amount: number;
  projected_value: number; projected_returns: number; status: string;
  missing_documents: string[];
};

type Holding = {
  fund_id: string; fund_name: string; category: string;
  units: number; invested: number; current_value: number; pnl: number; pnl_pct: number; via: string;
};

type Portfolio = {
  total_invested: number; current_value: number; total_pnl: number; total_pnl_pct: number;
  holdings: Holding[];
};

type RebalanceSuggestion = {
  suggested_allocation: Array<{ fund_id: string; name: string; suggested_weight: number; current_weight: number; action: string }>;
  rationale: string[];
  confidence_pct: number;
};

const KYC_DOCS = [
  { doc_type: "KYC", label: "KYC Document", sample_id: "KYC-PREM-1001" },
  { doc_type: "PAN", label: "PAN Card", sample_id: "PAN-ABCDE1234F" },
];

const RISK_COLORS: Record<string, string> = {
  Low: "text-emerald-700 bg-emerald-50 border-emerald-200",
  Moderate: "text-amber-700 bg-amber-50 border-amber-200",
  High: "text-red-700 bg-red-50 border-red-200",
};

export function SIPInvestmentFlow() {
  const [tab, setTab] = useState<Tab>("funds");
  const [funds, setFunds] = useState<Fund[]>([]);
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null);
  const [monthlyAmount, setMonthlyAmount] = useState("5000");
  const [horizonMonths, setHorizonMonths] = useState("60");
  const [lumpsumAmount, setLumpsumAmount] = useState("50000");
  const [linkedAccountId, setLinkedAccountId] = useState("");
  const [verifiedDocIds, setVerifiedDocIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [sipResult, setSipResult] = useState<SIPResult | null>(null);
  const [sipTriggerMsg, setSipTriggerMsg] = useState<string | null>(null);
  const [mfMsg, setMfMsg] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [rebalance, setRebalance] = useState<RebalanceSuggestion | null>(null);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);

  useEffect(() => {
    apiFetch<Fund[]>("/api/investments/funds").then(setFunds).catch(() => null);
    apiFetch<DashboardOverview>("/api/dashboard/overview/1").then(setOverview).catch(() => null);
  }, []);

  useEffect(() => {
    if (!linkedAccountId && overview?.accounts[0]) {
      setLinkedAccountId(String(overview.accounts[0].id));
    }
  }, [overview, linkedAccountId]);

  const accounts = overview?.accounts ?? [];
  const allDocsVerified = verifiedDocIds.length >= KYC_DOCS.length;

  async function createSIP() {
    if (!selectedFund) return;
    setLoading(true);
    try {
      const result = await apiFetch<SIPResult>("/api/investments/sip/create", {
        method: "POST",
        body: JSON.stringify({
          user_id: 1,
          fund_id: selectedFund.fund_id,
          monthly_amount: Number(monthlyAmount),
          horizon_months: Number(horizonMonths),
          linked_account_id: linkedAccountId ? Number(linkedAccountId) : null,
          verified_documents: verifiedDocIds,
        }),
      });
      setSipResult(result);
    } finally {
      setLoading(false);
    }
  }

  async function triggerSIP() {
    if (!sipResult) return;
    setLoading(true);
    setSipTriggerMsg(null);
    try {
      const result = await apiFetch<{ message: string; units_allotted: number; current_value: number }>(
        `/api/investments/sip/${sipResult.sip_id}/trigger`, { method: "POST" },
      );
      setSipTriggerMsg(result.message);
    } catch (err) {
      setSipTriggerMsg(err instanceof Error ? err.message : "Trigger failed.");
    } finally {
      setLoading(false);
    }
  }

  async function buyMF() {
    if (!selectedFund) return;
    setLoading(true);
    setMfMsg(null);
    try {
      const result = await apiFetch<{ message: string }>(
        "/api/investments/mf/buy",
        {
          method: "POST",
          body: JSON.stringify({
            user_id: 1,
            fund_id: selectedFund.fund_id,
            amount: Number(lumpsumAmount),
            linked_account_id: linkedAccountId ? Number(linkedAccountId) : null,
            verified_documents: verifiedDocIds,
          }),
        },
      );
      setMfMsg(result.message);
    } catch (err) {
      setMfMsg(err instanceof Error ? err.message : "Purchase failed.");
    } finally {
      setLoading(false);
    }
  }

  async function loadHoldings() {
    setLoading(true);
    try {
      const result = await apiFetch<Portfolio>("/api/investments/1/holdings");
      setPortfolio(result);
      setTab("holdings");
    } finally {
      setLoading(false);
    }
  }

  async function loadRebalance() {
    setLoading(true);
    try {
      const result = await apiFetch<RebalanceSuggestion>("/api/investments/1/rebalance", { method: "POST" });
      setRebalance(result);
      setTab("rebalance");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-[32px] border border-[color:var(--border)] bg-white shadow-soft">
      {/* Header */}
      <div className="px-7 pt-7 pb-6" style={{ background: "linear-gradient(135deg, rgba(219,31,53,0.06) 0%, rgba(255,255,255,0.97) 55%)" }}>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--brand-red)]/10 text-xl">📈</span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-red)]">Aura Investments</p>
            <h2 className="text-2xl font-semibold text-[color:var(--ink)]">SIP & Mutual Fund Platform</h2>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-[color:var(--border)] px-7">
        {(["funds", "sip", "lumpsum", "holdings", "rebalance"] as Tab[]).map((t) => (
          <button key={t} type="button" onClick={() => { if (t === "holdings") loadHoldings(); else if (t === "rebalance") loadRebalance(); else setTab(t); }}
            className={`border-b-2 px-4 py-3.5 text-sm font-semibold capitalize transition-colors ${tab === t
              ? "border-[color:var(--brand-red)] text-[color:var(--brand-red)]"
              : "border-transparent text-[color:var(--muted)] hover:text-[color:var(--ink)]"}`}>
            {t === "sip" ? "Setup SIP" : t === "lumpsum" ? "Lump Sum MF" : t === "rebalance" ? "Rebalance" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="p-7 space-y-5">

        {/* ── Fund Catalog ── */}
        {tab === "funds" && (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">Aura Fund Catalog — Select a fund to invest</p>
            {funds.map((fund) => (
              <button key={fund.fund_id} type="button"
                onClick={() => { setSelectedFund(fund); setTab("sip"); }}
                className={`w-full rounded-[20px] border p-5 text-left transition-all hover:shadow-md ${selectedFund?.fund_id === fund.fund_id ? "border-[color:var(--brand-red)]/30 bg-white shadow-sm" : "border-[color:var(--border)] bg-[color:var(--panel)]"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[color:var(--ink)]">{fund.name}</p>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${RISK_COLORS[fund.risk] ?? "text-gray-600 bg-gray-50 border-gray-200"}`}>{fund.risk}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-[color:var(--muted)]">{fund.category}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-lg font-bold text-emerald-700">+{fund.one_yr_return}%</p>
                    <p className="text-[10px] text-[color:var(--muted)]">1Y returns</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-3">
                  {[
                    ["NAV", `₹${fund.nav}`],
                    ["YTD", `+${fund.ytd_return}%`],
                    ["ESG", `${fund.esg_score}/100`],
                    ["Min SIP", formatCurrency(fund.min_sip)],
                  ].map(([lbl, val]) => (
                    <div key={lbl} className="rounded-[10px] bg-white px-3 py-2 border border-[color:var(--border)]">
                      <p className="text-[9px] font-semibold uppercase tracking-widest text-[color:var(--muted)]">{lbl}</p>
                      <p className="mt-0.5 text-xs font-bold text-[color:var(--ink)]">{val}</p>
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── Setup SIP ── */}
        {tab === "sip" && (
          <div className="space-y-5">
            {selectedFund && (
              <div className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--panel)] px-5 py-4">
                <p className="text-xs text-[color:var(--muted)]">Selected Fund</p>
                <p className="mt-1 font-semibold text-[color:var(--ink)]">{selectedFund.name}</p>
                <p className="text-xs text-[color:var(--muted)]">NAV ₹{selectedFund.nav} · {selectedFund.one_yr_return}% 1Y</p>
              </div>
            )}
            {!selectedFund && <p onClick={() => setTab("funds")} className="cursor-pointer text-sm text-[color:var(--brand-red)] underline">← Select a fund first</p>}

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="block text-sm font-medium text-[color:var(--ink-soft)]">Monthly SIP Amount (₹)</span>
                <input className="w-full rounded-[14px] border border-[color:var(--border)] bg-[color:var(--panel)] px-4 py-3.5 text-sm outline-none focus:border-[color:var(--brand-red)]/40 focus:ring-2 focus:ring-[color:var(--brand-red)]/10"
                  value={monthlyAmount} onChange={(e) => setMonthlyAmount(e.target.value)} />
              </label>
              <label className="space-y-2">
                <span className="block text-sm font-medium text-[color:var(--ink-soft)]">Horizon (months)</span>
                <input className="w-full rounded-[14px] border border-[color:var(--border)] bg-[color:var(--panel)] px-4 py-3.5 text-sm outline-none focus:border-[color:var(--brand-red)]/40 focus:ring-2 focus:ring-[color:var(--brand-red)]/10"
                  value={horizonMonths} onChange={(e) => setHorizonMonths(e.target.value)} />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="block text-sm font-medium text-[color:var(--ink-soft)]">Debit Account</span>
                <select className="w-full rounded-[14px] border border-[color:var(--border)] bg-[color:var(--panel)] px-4 py-3.5 text-sm outline-none focus:border-[color:var(--brand-red)]/40"
                  value={linkedAccountId} onChange={(e) => setLinkedAccountId(e.target.value)}>
                  {accounts.map((a) => <option key={a.id} value={a.id}>{a.name} — {formatCurrency(a.available_balance, a.currency)}</option>)}
                </select>
              </label>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">KYC / PAN Verification ({verifiedDocIds.length}/{KYC_DOCS.length})</p>
              <DocVerifyPanel requiredDocs={KYC_DOCS} onVerifiedChange={setVerifiedDocIds} />
            </div>

            {!sipResult ? (
              <button type="button" onClick={createSIP} disabled={loading || !selectedFund || !allDocsVerified}
                className="rounded-full bg-[color:var(--brand-red)] px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-red-200/40 disabled:cursor-not-allowed disabled:opacity-50">
                {loading ? "Creating SIP…" : !allDocsVerified ? "Complete KYC/PAN verification" : "Create SIP Mandate →"}
              </button>
            ) : (
              <div className="rounded-[20px] border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-6">
                <p className="text-xl font-bold text-emerald-800">✅ SIP Created!</p>
                <p className="mt-1 text-xs text-[color:var(--muted)]">SIP ID: <span className="font-mono font-bold">{sipResult.sip_id}</span></p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[["Monthly", formatCurrency(sipResult.monthly_amount)], ["Projected Value", formatCurrency(sipResult.projected_value)], ["Projected Returns", formatCurrency(sipResult.projected_returns)], ["Status", sipResult.status]].map(([lbl, val]) => (
                    <div key={lbl} className="rounded-[14px] bg-white px-4 py-3"><p className="text-[10px] font-semibold uppercase tracking-widest text-[color:var(--muted)]">{lbl}</p><p className="mt-1.5 text-sm font-bold text-[color:var(--ink)]">{val}</p></div>
                  ))}
                </div>
                {sipTriggerMsg && <div className="mt-3 rounded-[12px] border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-xs text-emerald-800">{sipTriggerMsg}</div>}
                <div className="mt-4 flex flex-wrap gap-3">
                  <button type="button" onClick={triggerSIP} disabled={loading} className="rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow">{loading ? "Processing…" : "Trigger Instalment"}</button>
                  <button type="button" onClick={loadHoldings} className="rounded-full border border-[color:var(--border)] bg-white px-5 py-2.5 text-xs font-semibold text-[color:var(--ink)]">View Holdings</button>
                  <button type="button" onClick={() => setSipResult(null)} className="rounded-full border border-[color:var(--border)] bg-white px-5 py-2.5 text-xs font-semibold text-[color:var(--ink)]">New SIP</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Lump Sum ── */}
        {tab === "lumpsum" && (
          <div className="space-y-5">
            {selectedFund && (
              <div className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--panel)] px-5 py-4">
                <p className="text-xs text-[color:var(--muted)]">Selected Fund</p>
                <p className="mt-1 font-semibold text-[color:var(--ink)]">{selectedFund.name}</p>
              </div>
            )}
            {!selectedFund && <p onClick={() => setTab("funds")} className="cursor-pointer text-sm text-[color:var(--brand-red)] underline">← Select a fund first</p>}
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="block text-sm font-medium text-[color:var(--ink-soft)]">Investment Amount (₹)</span>
                <input className="w-full rounded-[14px] border border-[color:var(--border)] bg-[color:var(--panel)] px-4 py-3.5 text-sm outline-none focus:border-[color:var(--brand-red)]/40 focus:ring-2 focus:ring-[color:var(--brand-red)]/10"
                  value={lumpsumAmount} onChange={(e) => setLumpsumAmount(e.target.value)} />
              </label>
              <label className="space-y-2">
                <span className="block text-sm font-medium text-[color:var(--ink-soft)]">Debit Account</span>
                <select className="w-full rounded-[14px] border border-[color:var(--border)] bg-[color:var(--panel)] px-4 py-3.5 text-sm outline-none focus:border-[color:var(--brand-red)]/40"
                  value={linkedAccountId} onChange={(e) => setLinkedAccountId(e.target.value)}>
                  {accounts.map((a) => <option key={a.id} value={a.id}>{a.name} — {formatCurrency(a.available_balance, a.currency)}</option>)}
                </select>
              </label>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">KYC / PAN Verification ({verifiedDocIds.length}/{KYC_DOCS.length})</p>
              <DocVerifyPanel requiredDocs={KYC_DOCS} onVerifiedChange={setVerifiedDocIds} />
            </div>
            {mfMsg && <div className={`rounded-[16px] border px-5 py-4 text-sm ${mfMsg.includes("successful") ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"}`}>{mfMsg}</div>}
            <button type="button" onClick={buyMF} disabled={loading || !selectedFund || !allDocsVerified}
              className="rounded-full bg-[color:var(--brand-red)] px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-red-200/40 disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? "Purchasing…" : !allDocsVerified ? "Complete KYC/PAN to purchase" : `Buy ${selectedFund?.name ?? "Fund"} →`}
            </button>
          </div>
        )}

        {/* ── Holdings ── */}
        {tab === "holdings" && (
          <div className="space-y-4">
            {portfolio ? (
              <>
                <div className="grid gap-3 sm:grid-cols-4">
                  {[
                    ["Invested", formatCurrency(portfolio.total_invested)],
                    ["Current", formatCurrency(portfolio.current_value)],
                    ["P&L", formatCurrency(portfolio.total_pnl)],
                    ["Return", `${portfolio.total_pnl_pct >= 0 ? "+" : ""}${portfolio.total_pnl_pct}%`],
                  ].map(([lbl, val]) => (
                    <div key={lbl} className={`rounded-[16px] border px-5 py-4 ${lbl === "P&L" || lbl === "Return" ? portfolio.total_pnl >= 0 ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50" : "border-[color:var(--border)] bg-[color:var(--panel)]"}`}>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[color:var(--muted)]">{lbl}</p>
                      <p className={`mt-1.5 text-xl font-bold ${(lbl === "P&L" || lbl === "Return") ? portfolio.total_pnl >= 0 ? "text-emerald-700" : "text-red-700" : "text-[color:var(--ink)]"}`}>{val}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {portfolio.holdings.length === 0 ? (
                    <p className="text-sm text-[color:var(--ink-soft)]">No holdings yet. Create a SIP or buy a mutual fund to see your portfolio here.</p>
                  ) : portfolio.holdings.map((h) => (
                    <div key={h.fund_id + h.via} className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--panel)] px-5 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-[color:var(--ink)]">{h.fund_name}</p>
                          <p className="mt-0.5 text-xs text-[color:var(--muted)]">{h.category} · {h.units.toFixed(4)} units · via {h.via}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-[color:var(--ink)]">{formatCurrency(h.current_value)}</p>
                          <p className={`text-xs font-semibold ${h.pnl >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                            {h.pnl >= 0 ? "+" : ""}{formatCurrency(h.pnl)} ({h.pnl_pct >= 0 ? "+" : ""}{h.pnl_pct}%)
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={loadHoldings} disabled={loading} className="rounded-full border border-[color:var(--border)] bg-white px-5 py-2.5 text-xs font-semibold text-[color:var(--ink)]">{loading ? "Refreshing…" : "↻ Refresh"}</button>
                  <button type="button" onClick={loadRebalance} className="rounded-full bg-[color:var(--brand-red)] px-5 py-2.5 text-xs font-semibold text-white shadow">Get Rebalancing Advice →</button>
                </div>
              </>
            ) : (
              <p className="text-sm text-[color:var(--ink-soft)]">{loading ? "Loading portfolio…" : "No portfolio data. Create a SIP or buy a fund first."}</p>
            )}
          </div>
        )}

        {/* ── Rebalance ── */}
        {tab === "rebalance" && (
          <div className="space-y-5">
            {rebalance ? (
              <>
                <div className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--panel)] px-5 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[color:var(--ink)]">AI Rebalancing Confidence</p>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">{rebalance.confidence_pct}%</span>
                  </div>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${rebalance.confidence_pct}%` }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">Suggested Allocation</p>
                  {rebalance.suggested_allocation.map((s) => (
                    <div key={s.fund_id} className={`flex items-center justify-between rounded-[16px] border px-5 py-4 ${s.action === "INCREASE" ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
                      <div>
                        <p className="text-sm font-semibold text-[color:var(--ink)]">{s.name}</p>
                        <p className="mt-0.5 text-xs text-[color:var(--muted)]">Current {s.current_weight}% → Target {s.suggested_weight}%</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${s.action === "INCREASE" ? "bg-emerald-200 text-emerald-800" : "bg-amber-200 text-amber-800"}`}>{s.action}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">Rationale</p>
                  <ul className="space-y-2">
                    {rebalance.rationale.map((r, i) => (
                      <li key={i} className="text-sm leading-6 text-[color:var(--ink-soft)]">• {r}</li>
                    ))}
                  </ul>
                </div>
                <button type="button" onClick={loadRebalance} disabled={loading} className="rounded-full border border-[color:var(--border)] bg-white px-5 py-2.5 text-xs font-semibold text-[color:var(--ink)]">{loading ? "Recalculating…" : "↻ Recalculate"}</button>
              </>
            ) : (
              <p className="text-sm text-[color:var(--ink-soft)]">{loading ? "Generating rebalancing advice…" : "Click Rebalance tab to get AI-powered portfolio advice."}</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
