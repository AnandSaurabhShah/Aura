"use client";

import { useEffect, useState } from "react";

import { DocVerifyPanel } from "@/components/DocVerifyPanel";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import type { DashboardOverview } from "@/lib/types";

type LoanType = "HOME_LOAN" | "LAP" | "PERSONAL_LOAN" | "EDUCATION_LOAN" | "CAR_LOAN";
type Tab = "apply" | "schedule" | "pay";

type LoanApplication = {
  application_id: string;
  loan_type: string;
  principal: number;
  tenure_months: number;
  interest_rate: number;
  monthly_emi: number;
  total_payable: number;
  total_interest: number;
  status: string;
  missing_documents: string[];
};

type ScheduleRow = {
  month: number;
  emi: number;
  principal_component: number;
  interest_component: number;
  outstanding: number;
};

type Schedule = { application_id: string; monthly_emi: number; schedule: ScheduleRow[] };
type RequiredDoc = { doc_type: string; label: string; sample_id: string };

const LOAN_TYPES: { value: LoanType; label: string; icon: string; maxAmt: string; rate: number }[] = [
  { value: "HOME_LOAN", label: "Home Loan", icon: "🏠", maxAmt: "₹5 Cr", rate: 8.65 },
  { value: "LAP", label: "Loan Against Property", icon: "🏢", maxAmt: "₹3 Cr", rate: 9.25 },
  { value: "PERSONAL_LOAN", label: "Personal Loan", icon: "💼", maxAmt: "₹25 L", rate: 10.99 },
  { value: "EDUCATION_LOAN", label: "Education Loan", icon: "🎓", maxAmt: "₹40 L", rate: 9.75 },
  { value: "CAR_LOAN", label: "Car Loan", icon: "🚗", maxAmt: "₹50 L", rate: 8.99 },
];

const DOC_MAP: Record<LoanType, Array<{ doc_type: string; label: string; sample_id: string }>> = {
  HOME_LOAN: [
    { doc_type: "KYC", label: "KYC Document", sample_id: "KYC-PREM-1001" },
    { doc_type: "INCOME_PROOF", label: "Income / Salary Proof", sample_id: "INCM-SAL-7731" },
    { doc_type: "BANK_STATEMENT", label: "6-Month Bank Statement", sample_id: "STMT-6M-2026" },
    { doc_type: "PROPERTY_VALUATION", label: "Property Valuation Report", sample_id: "PROP-VAL-8801" },
  ],
  LAP: [
    { doc_type: "KYC", label: "KYC Document", sample_id: "KYC-PREM-1001" },
    { doc_type: "INCOME_PROOF", label: "Income / Salary Proof", sample_id: "INCM-SAL-7731" },
    { doc_type: "BANK_STATEMENT", label: "6-Month Bank Statement", sample_id: "STMT-6M-2026" },
    { doc_type: "PROPERTY_VALUATION", label: "Property Valuation Report", sample_id: "PROP-VAL-8801" },
  ],
  PERSONAL_LOAN: [
    { doc_type: "KYC", label: "KYC Document", sample_id: "KYC-PREM-1001" },
    { doc_type: "INCOME_PROOF", label: "Income / Salary Proof", sample_id: "INCM-SAL-7731" },
    { doc_type: "BANK_STATEMENT", label: "6-Month Bank Statement", sample_id: "STMT-6M-2026" },
  ],
  EDUCATION_LOAN: [
    { doc_type: "KYC", label: "KYC Document", sample_id: "KYC-PREM-1001" },
    { doc_type: "INCOME_PROOF", label: "Income / Salary Proof", sample_id: "INCM-SAL-7731" },
    { doc_type: "PURPOSE_DOCUMENT", label: "Purpose Supporting Document", sample_id: "PSUP-EDU-4421" },
  ],
  CAR_LOAN: [
    { doc_type: "KYC", label: "KYC Document", sample_id: "KYC-PREM-1001" },
    { doc_type: "INCOME_PROOF", label: "Income / Salary Proof", sample_id: "INCM-SAL-7731" },
    { doc_type: "BANK_STATEMENT", label: "6-Month Bank Statement", sample_id: "STMT-6M-2026" },
  ],
};

function computeEMI(p: number, r: number, n: number) {
  const mr = r / 100 / 12;
  if (mr === 0 || n === 0) return p / n;
  return (p * mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);
}

export function LoanApplicationFlow() {
  const [tab, setTab] = useState<Tab>("apply");
  const [loanType, setLoanType] = useState<LoanType>("PERSONAL_LOAN");
  const [principal, setPrincipal] = useState("500000");
  const [tenure, setTenure] = useState("60");
  const [purpose, setPurpose] = useState("General");
  const [linkedAccountId, setLinkedAccountId] = useState("");
  const [verifiedDocIds, setVerifiedDocIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [emiMessage, setEmiMessage] = useState<string | null>(null);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);

  const currentLoanInfo = LOAN_TYPES.find((l) => l.value === loanType)!;
  const requiredDocs: RequiredDoc[] = DOC_MAP[loanType] ?? [];

  useEffect(() => {
    apiFetch<DashboardOverview>("/api/dashboard/overview/1").then(setOverview).catch(() => null);
  }, []);

  useEffect(() => {
    if (!linkedAccountId && overview?.accounts[0]) {
      setLinkedAccountId(String(overview.accounts[0].id));
    }
  }, [overview, linkedAccountId]);

  const p = Number(principal || 0);
  const n = Number(tenure || 0);
  const rate = currentLoanInfo.rate;
  const emiPreview = p > 0 && n > 0 ? computeEMI(p, rate, n) : 0;
  const totalPayable = emiPreview * n;
  const totalInterest = totalPayable - p;
  const allDocsVerified = verifiedDocIds.length >= requiredDocs.length;
  const accounts = overview?.accounts ?? [];

  async function handleApply() {
    setLoading(true);
    try {
      const result = await apiFetch<LoanApplication>("/api/loans/apply", {
        method: "POST",
        body: JSON.stringify({
          user_id: 1,
          loan_type: loanType,
          principal: p,
          tenure_months: n,
          interest_rate: rate,
          purpose,
          linked_account_id: linkedAccountId ? Number(linkedAccountId) : null,
          verified_documents: verifiedDocIds,
        }),
      });
      setApplication(result);
    } finally {
      setLoading(false);
    }
  }

  async function loadSchedule() {
    if (!application) return;
    setLoading(true);
    try {
      const result = await apiFetch<Schedule>(`/api/loans/${application.application_id}/schedule`);
      setSchedule(result);
      setTab("schedule");
    } finally {
      setLoading(false);
    }
  }

  async function payEMI() {
    if (!application) return;
    setLoading(true);
    setEmiMessage(null);
    try {
      const result = await apiFetch<{ message: string; outstanding_after: number; account_balance_after: number | null }>(
        `/api/loans/${application.application_id}/pay-emi?linked_account_id=${linkedAccountId || ""}`,
        { method: "POST" },
      );
      setEmiMessage(result.message + (result.account_balance_after !== null ? ` Account balance: ${formatCurrency(result.account_balance_after)}` : ""));
      setApplication((prev) => prev ? { ...prev, status: result.outstanding_after <= 0 ? "CLOSED" : "ACTIVE" } : prev);
    } catch (err) {
      setEmiMessage(err instanceof Error ? err.message : "EMI payment failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-[32px] border border-[color:var(--border)] bg-white shadow-soft">
      {/* Header */}
      <div className="px-7 pt-7 pb-6"
        style={{ background: "linear-gradient(135deg, rgba(219,31,53,0.06) 0%, rgba(255,255,255,0.97) 55%)" }}>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--brand-red)]/10 text-xl">🏦</span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-red)]">Aura Premier Lending</p>
            <h2 className="text-2xl font-semibold text-[color:var(--ink)]">Loan Application Portal</h2>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {LOAN_TYPES.map((lt) => (
            <button key={lt.value} type="button"
              onClick={() => { setLoanType(lt.value); setApplication(null); setSchedule(null); setVerifiedDocIds([]); }}
              className={`rounded-[16px] border p-4 text-left transition-all ${loanType === lt.value
                ? "border-[color:var(--brand-red)]/30 bg-white shadow-sm"
                : "border-transparent bg-white/60 hover:bg-white"}`}>
              <span className="text-2xl">{lt.icon}</span>
              <p className={`mt-2 text-xs font-semibold ${loanType === lt.value ? "text-[color:var(--brand-red)]" : "text-[color:var(--ink)]"}`}>{lt.label}</p>
              <p className="mt-0.5 text-[10px] text-[color:var(--muted)]">Up to {lt.maxAmt} · {lt.rate}%</p>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[color:var(--border)] px-7">
        {(["apply", "schedule", "pay"] as Tab[]).map((t) => (
          <button key={t} type="button"
            onClick={() => application && setTab(t)}
            className={`border-b-2 px-5 py-3.5 text-sm font-semibold capitalize transition-colors ${tab === t
              ? "border-[color:var(--brand-red)] text-[color:var(--brand-red)]"
              : "border-transparent text-[color:var(--muted)] hover:text-[color:var(--ink)]"}`}>
            {t === "apply" ? "Apply" : t === "schedule" ? "Amortization" : "Pay EMI"}
          </button>
        ))}
      </div>

      <div className="p-7 space-y-5">

        {/* ── Apply tab ── */}
        {tab === "apply" && !application && (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="block text-sm font-medium text-[color:var(--ink-soft)]">Loan Amount (₹)</span>
                <input className="w-full rounded-[14px] border border-[color:var(--border)] bg-[color:var(--panel)] px-4 py-3.5 text-sm outline-none focus:border-[color:var(--brand-red)]/40 focus:ring-2 focus:ring-[color:var(--brand-red)]/10"
                  value={principal} onChange={(e) => setPrincipal(e.target.value)} />
              </label>
              <label className="space-y-2">
                <span className="block text-sm font-medium text-[color:var(--ink-soft)]">Tenure (months)</span>
                <input className="w-full rounded-[14px] border border-[color:var(--border)] bg-[color:var(--panel)] px-4 py-3.5 text-sm outline-none focus:border-[color:var(--brand-red)]/40 focus:ring-2 focus:ring-[color:var(--brand-red)]/10"
                  value={tenure} onChange={(e) => setTenure(e.target.value)} />
              </label>
              <label className="space-y-2">
                <span className="block text-sm font-medium text-[color:var(--ink-soft)]">Purpose</span>
                <input className="w-full rounded-[14px] border border-[color:var(--border)] bg-[color:var(--panel)] px-4 py-3.5 text-sm outline-none focus:border-[color:var(--brand-red)]/40 focus:ring-2 focus:ring-[color:var(--brand-red)]/10"
                  value={purpose} onChange={(e) => setPurpose(e.target.value)} />
              </label>
              <label className="space-y-2">
                <span className="block text-sm font-medium text-[color:var(--ink-soft)]">Linked Account (EMI deduction)</span>
                <select className="w-full rounded-[14px] border border-[color:var(--border)] bg-[color:var(--panel)] px-4 py-3.5 text-sm outline-none focus:border-[color:var(--brand-red)]/40"
                  value={linkedAccountId} onChange={(e) => setLinkedAccountId(e.target.value)}>
                  {accounts.map((a) => <option key={a.id} value={a.id}>{a.name} — {formatCurrency(a.available_balance, a.currency)}</option>)}
                </select>
              </label>
            </div>

            {emiPreview > 0 && (
              <div className="grid gap-3 rounded-[20px] bg-gradient-to-r from-[color:var(--brand-red)]/5 to-white p-5 sm:grid-cols-3">
                {[["Monthly EMI", formatCurrency(emiPreview)], ["Total Payable", formatCurrency(totalPayable)], ["Total Interest", formatCurrency(totalInterest)]].map(([lbl, val]) => (
                  <div key={lbl} className="rounded-[14px] bg-white px-4 py-4 shadow-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[color:var(--muted)]">{lbl}</p>
                    <p className="mt-1.5 text-xl font-bold text-[color:var(--ink)]">{val}</p>
                  </div>
                ))}
              </div>
            )}

            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                  Documents ({verifiedDocIds.length}/{requiredDocs.length} verified)
                </p>
              </div>
              <DocVerifyPanel requiredDocs={requiredDocs} onVerifiedChange={setVerifiedDocIds} />
            </div>

            <button type="button" onClick={handleApply} disabled={loading || !allDocsVerified}
              className="rounded-full bg-[color:var(--brand-red)] px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-red-200/40 disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? "Processing…" : !allDocsVerified ? "Verify all documents to proceed" : "Submit Application →"}
            </button>
          </>
        )}

        {tab === "apply" && application && (
          <div className={`rounded-[20px] border p-6 ${application.status === "APPROVED" ? "border-emerald-200 bg-gradient-to-r from-emerald-50 to-white" : "border-amber-200 bg-amber-50"}`}>
            <p className={`text-2xl font-bold ${application.status === "APPROVED" ? "text-emerald-800" : "text-amber-800"}`}>
              {application.status === "APPROVED" ? "✅ Loan Approved!" : "⚠️ Pending Documents"}
            </p>
            <p className="mt-1 text-xs text-[color:var(--muted)]">ID: <span className="font-mono font-bold">{application.application_id}</span></p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[["Monthly EMI", formatCurrency(application.monthly_emi)], ["Total Payable", formatCurrency(application.total_payable)], ["Interest", formatCurrency(application.total_interest)]].map(([lbl, val]) => (
                <div key={lbl} className="rounded-[14px] bg-white px-4 py-3"><p className="text-[10px] font-semibold uppercase tracking-widest text-[color:var(--muted)]">{lbl}</p><p className="mt-1.5 text-lg font-bold text-[color:var(--ink)]">{val}</p></div>
              ))}
            </div>
            {application.missing_documents.length > 0 && <p className="mt-3 text-xs text-amber-700">Missing: {application.missing_documents.join(", ")}</p>}
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={loadSchedule} disabled={loading} className="rounded-full bg-[color:var(--brand-red)] px-5 py-2.5 text-xs font-semibold text-white shadow-md">View Schedule</button>
              <button type="button" onClick={() => setTab("pay")} className="rounded-full border border-[color:var(--border)] bg-white px-5 py-2.5 text-xs font-semibold text-[color:var(--ink)]">Pay EMI</button>
              <button type="button" onClick={() => { setApplication(null); setVerifiedDocIds([]); }} className="rounded-full border border-[color:var(--border)] bg-white px-5 py-2.5 text-xs font-semibold text-[color:var(--ink)]">New Application</button>
            </div>
          </div>
        )}

        {/* ── Schedule tab ── */}
        {tab === "schedule" && (
          <>
            {!schedule ? (
              <button type="button" onClick={loadSchedule} disabled={!application || loading} className="rounded-full bg-[color:var(--brand-red)] px-8 py-3.5 text-sm font-semibold text-white shadow-lg">{loading ? "Loading…" : "Load Schedule"}</button>
            ) : (
              <div className="overflow-auto max-h-96 rounded-[20px] border border-[color:var(--border)]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-[color:var(--panel)]">
                    <tr>{["Month", "EMI", "Principal", "Interest", "Outstanding"].map((h) => <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[color:var(--muted)]">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {schedule.schedule.map((row, i) => (
                      <tr key={row.month} className={i % 2 === 0 ? "bg-white" : "bg-[color:var(--panel)]/40"}>
                        <td className="px-4 py-2.5 text-[color:var(--muted)]">{row.month}</td>
                        <td className="px-4 py-2.5 font-semibold">{formatCurrency(row.emi)}</td>
                        <td className="px-4 py-2.5 text-emerald-700">{formatCurrency(row.principal_component)}</td>
                        <td className="px-4 py-2.5 text-[color:var(--brand-red)]">{formatCurrency(row.interest_component)}</td>
                        <td className="px-4 py-2.5">{formatCurrency(row.outstanding)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── Pay EMI tab ── */}
        {tab === "pay" && (
          <>
            {application ? (
              <>
                <div className="rounded-[20px] border border-[color:var(--border)] bg-[color:var(--panel)] p-5">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[["ID", application.application_id], ["Monthly EMI", formatCurrency(application.monthly_emi)], ["Status", application.status]].map(([lbl, val]) => (
                      <div key={lbl} className="rounded-[14px] bg-white px-4 py-3"><p className="text-[10px] font-semibold uppercase tracking-widest text-[color:var(--muted)]">{lbl}</p><p className="mt-1.5 text-sm font-bold text-[color:var(--ink)] truncate">{val}</p></div>
                    ))}
                  </div>
                </div>
                {emiMessage && (
                  <div className={`rounded-[16px] border px-5 py-4 text-sm ${emiMessage.includes("🎉") || emiMessage.toLowerCase().includes("success") ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"}`}>{emiMessage}</div>
                )}
                <button type="button" onClick={payEMI} disabled={loading || application.status === "CLOSED" || application.status === "PENDING_DOCUMENTS"}
                  className="rounded-full bg-[color:var(--brand-red)] px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-red-200/40 disabled:cursor-not-allowed disabled:opacity-50">
                  {loading ? "Processing…" : application.status === "CLOSED" ? "Loan Fully Repaid ✓" : `Pay EMI (${formatCurrency(application.monthly_emi)}) →`}
                </button>
              </>
            ) : (
              <p className="text-sm text-[color:var(--ink-soft)]">Submit a loan application first from the Apply tab.</p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
