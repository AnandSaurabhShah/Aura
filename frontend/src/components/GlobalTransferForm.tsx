"use client";

import { FormEvent, useEffect, useState } from "react";

import { DocVerifyPanel } from "@/components/DocVerifyPanel";
import { RazorpayGatewayPanel } from "@/components/RazorpayGatewayPanel";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import type {
  ComplianceDecision,
  DashboardOverview,
  PaymentOrder,
  PaymentVerification,
} from "@/lib/types";

const CURRENCY_OPTIONS = ["USD", "GBP", "EUR", "AED", "SGD", "CAD", "AUD", "JPY"];
const COUNTRY_MAP: Record<string, string> = {
  IN: "🇮🇳 India", GB: "🇬🇧 United Kingdom", US: "🇺🇸 United States",
  AE: "🇦🇪 UAE", SG: "🇸🇬 Singapore", CA: "🇨🇦 Canada",
  AU: "🇦🇺 Australia", DE: "🇩🇪 Germany", FR: "🇫🇷 France",
};
const PURPOSE_OPTIONS = [
  { value: "EDUCATION", label: "🎓 Education" },
  { value: "INVESTMENT", label: "📈 Investment" },
  { value: "PROPERTY_PURCHASE", label: "🏠 Property Purchase" },
  { value: "FAMILY_SUPPORT", label: "👨‍👩‍👧 Family Support" },
  { value: "MEDICAL", label: "🏥 Medical Treatment" },
  { value: "TRAVEL", label: "✈️ Travel" },
  { value: "THIRD_PARTY", label: "🤝 Third Party" },
  { value: "BUSINESS", label: "💼 Business" },
];
const FUNDS_SOURCE = ["SALARY", "SAVINGS", "BUSINESS_INCOME", "INVESTMENT_RETURNS", "GIFT", "INHERITANCE"];
const BENEFICIARY_TYPES = ["SELF", "SPOUSE", "PARENT", "CHILD", "FRIEND", "BUSINESS_ENTITY"];

type Step = 1 | 2 | 3 | 4;
type RequiredDoc = { doc_type: string; label: string; sample_id: string };

const initialPayload = {
  source_account_id: "",
  amount: "25000",
  currency: "USD",
  origin_country: "IN",
  destination_country: "GB",
  purpose_code: "EDUCATION",
  source_of_funds: "SALARY",
  beneficiary_type: "SELF",
  customer_segment: "PREMIER",
};

export default function GlobalTransferForm() {
  const [step, setStep] = useState<Step>(1);
  const [payload, setPayload] = useState(initialPayload);
  const [decision, setDecision] = useState<ComplianceDecision | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentVerification | null>(null);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [requiredDocs, setRequiredDocs] = useState<RequiredDoc[]>([]);
  const [verifiedDocIds, setVerifiedDocIds] = useState<string[]>([]);

  useEffect(() => {
    apiFetch<DashboardOverview>("/api/dashboard/overview/1")
      .then(setOverview)
      .catch(() => setOverview(null));
  }, []);

  useEffect(() => {
    if (!payload.source_account_id && overview?.accounts[0]) {
      setPayload((c) => ({ ...c, source_account_id: String(overview.accounts[0].id) }));
    }
  }, [overview, payload.source_account_id]);

  useEffect(() => {
    apiFetch<RequiredDoc[]>(`/api/documents/required/${payload.purpose_code}`)
      .then(setRequiredDocs)
      .catch(() => setRequiredDocs([]));
    setVerifiedDocIds([]);
  }, [payload.purpose_code]);

  const sourceAccounts = overview?.accounts ?? [];
  const selectedAccount = sourceAccounts.find(
    (a) => a.id === Number(payload.source_account_id),
  );

  async function handleComplianceCheck(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setPaymentResult(null);
    try {
      const result = await apiFetch<ComplianceDecision>("/api/compliance/transfer", {
        method: "POST",
        body: JSON.stringify({
          ...payload,
          amount: Number(payload.amount),
          verified_documents: verifiedDocIds,
        }),
      });
      setDecision(result);
      setStep(4);
    } finally {
      setLoading(false);
    }
  }

  async function createRemittanceOrder(): Promise<PaymentOrder> {
    if (!selectedAccount) throw new Error("Select the funding account first.");
    return apiFetch<PaymentOrder>("/api/payments/orders", {
      method: "POST",
      body: JSON.stringify({
        user_id: 1,
        route_slug: "global-transfers",
        route_title: "Global Money Transfers",
        payment_mode: "remittance",
        source_account_id: selectedAccount.id,
        amount: Number(payload.amount),
        currency: payload.currency,
        destination: `${payload.destination_country} | ${payload.beneficiary_type}`,
        note: `${payload.purpose_code} | ${payload.source_of_funds}`,
        origin_country: payload.origin_country,
        destination_country: payload.destination_country,
        purpose_code: payload.purpose_code,
      }),
    });
  }

  function verdictColor() {
    if (!decision) return "text-[color:var(--ink)]";
    if (decision.decision === "APPROVED") return "text-emerald-700";
    if (decision.decision === "MANUAL_REVIEW") return "text-amber-700";
    return "text-[color:var(--brand-red)]";
  }

  const paymentDisabledReason =
    !decision ? "Run the compliance workflow first."
    : decision.decision !== "APPROVED" ? "Only approved transfers can proceed to payment."
    : !selectedAccount ? "Select the funding account."
    : Number(payload.amount) <= 0 ? "Enter a valid transfer amount."
    : null;

  const allDocsVerified = requiredDocs.length === 0 || verifiedDocIds.length >= requiredDocs.length;

  // ── STEP INDICATOR ──────────────────────────────────────────────────────
  const STEPS = ["Transfer Details", "Document Verification", "Compliance Check", "Payment Gateway"];

  return (
    <section className="overflow-hidden rounded-[32px] border border-[color:var(--border)] bg-white shadow-soft">
      {/* Hero header */}
      <div
        className="px-7 pt-7 pb-6"
        style={{ background: "linear-gradient(135deg, rgba(219,31,53,0.06) 0%, rgba(255,255,255,0.97) 55%)" }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--brand-red)]/10 text-lg">🌐</span>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-red)]">
                Global Money Transfers
              </p>
            </div>
            <h2 className="mt-2 text-3xl font-semibold text-[color:var(--ink)]">
              Cross-border Remittance Workflow
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[color:var(--ink-soft)]">
              Verify your documents, screen with AI compliance agents, then execute a Razorpay settlement — all in one flow.
            </p>
          </div>
          <div className="flex-shrink-0 rounded-[20px] border border-[color:var(--border)] bg-white px-6 py-4 text-center shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">Transfer amount</p>
            <p className="mt-1 text-3xl font-bold text-[color:var(--ink)]">
              {formatCurrency(Number(payload.amount || 0), payload.currency)}
            </p>
            <p className="mt-1 text-xs text-[color:var(--muted)]">
              {COUNTRY_MAP[payload.origin_country] ?? payload.origin_country} → {COUNTRY_MAP[payload.destination_country] ?? payload.destination_country}
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="mt-6 flex items-center gap-0">
          {STEPS.map((label, i) => {
            const num = (i + 1) as Step;
            const isActive = step === num;
            const isDone = step > num;
            return (
              <div key={label} className="flex flex-1 items-center">
                <button
                  type="button"
                  onClick={() => num < step && setStep(num)}
                  className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[color:var(--brand-red)] text-white shadow-lg"
                      : isDone
                        ? "cursor-pointer bg-emerald-500 text-white"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">
                    {isDone ? "✓" : num}
                  </span>
                  <span className="hidden sm:inline">{label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-1 rounded-full ${isDone ? "bg-emerald-400" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="p-7">

        {/* ── STEP 1: Transfer Details ──────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Step 1 — Transfer Details
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Funding account */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[color:var(--ink-soft)]">Funding Account</label>
                <select
                  className="w-full rounded-[14px] border border-[color:var(--border)] bg-[color:var(--panel)] px-4 py-3.5 text-sm text-[color:var(--ink)] outline-none focus:border-[color:var(--brand-red)]/40 focus:ring-2 focus:ring-[color:var(--brand-red)]/10"
                  value={payload.source_account_id}
                  onChange={(e) => setPayload((c) => ({ ...c, source_account_id: e.target.value }))}
                >
                  {sourceAccounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.name} — {formatCurrency(a.available_balance, a.currency)}</option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[color:var(--ink-soft)]">Amount</label>
                <div className="flex gap-2">
                  <select
                    className="w-24 rounded-[14px] border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-3.5 text-sm text-[color:var(--ink)] outline-none focus:border-[color:var(--brand-red)]/40"
                    value={payload.currency}
                    onChange={(e) => setPayload((c) => ({ ...c, currency: e.target.value }))}
                  >
                    {CURRENCY_OPTIONS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <input
                    className="flex-1 rounded-[14px] border border-[color:var(--border)] bg-[color:var(--panel)] px-4 py-3.5 text-sm text-[color:var(--ink)] outline-none focus:border-[color:var(--brand-red)]/40 focus:ring-2 focus:ring-[color:var(--brand-red)]/10"
                    placeholder="0.00"
                    value={payload.amount}
                    onChange={(e) => setPayload((c) => ({ ...c, amount: e.target.value }))}
                  />
                </div>
              </div>

              {/* Origin country */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[color:var(--ink-soft)]">Origin Country</label>
                <select
                  className="w-full rounded-[14px] border border-[color:var(--border)] bg-[color:var(--panel)] px-4 py-3.5 text-sm text-[color:var(--ink)] outline-none focus:border-[color:var(--brand-red)]/40"
                  value={payload.origin_country}
                  onChange={(e) => setPayload((c) => ({ ...c, origin_country: e.target.value }))}
                >
                  {Object.entries(COUNTRY_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>

              {/* Destination */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[color:var(--ink-soft)]">Destination Country</label>
                <select
                  className="w-full rounded-[14px] border border-[color:var(--border)] bg-[color:var(--panel)] px-4 py-3.5 text-sm text-[color:var(--ink)] outline-none focus:border-[color:var(--brand-red)]/40"
                  value={payload.destination_country}
                  onChange={(e) => setPayload((c) => ({ ...c, destination_country: e.target.value }))}
                >
                  {Object.entries(COUNTRY_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>

              {/* Purpose */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[color:var(--ink-soft)]">Purpose of Transfer</label>
                <select
                  className="w-full rounded-[14px] border border-[color:var(--border)] bg-[color:var(--panel)] px-4 py-3.5 text-sm text-[color:var(--ink)] outline-none focus:border-[color:var(--brand-red)]/40"
                  value={payload.purpose_code}
                  onChange={(e) => setPayload((c) => ({ ...c, purpose_code: e.target.value }))}
                >
                  {PURPOSE_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>

              {/* Source of funds */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[color:var(--ink-soft)]">Source of Funds</label>
                <select
                  className="w-full rounded-[14px] border border-[color:var(--border)] bg-[color:var(--panel)] px-4 py-3.5 text-sm text-[color:var(--ink)] outline-none focus:border-[color:var(--brand-red)]/40"
                  value={payload.source_of_funds}
                  onChange={(e) => setPayload((c) => ({ ...c, source_of_funds: e.target.value }))}
                >
                  {FUNDS_SOURCE.map((f) => <option key={f}>{f.replace(/_/g, " ")}</option>)}
                </select>
              </div>

              {/* Beneficiary type */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[color:var(--ink-soft)]">Beneficiary Type</label>
                <select
                  className="w-full rounded-[14px] border border-[color:var(--border)] bg-[color:var(--panel)] px-4 py-3.5 text-sm text-[color:var(--ink)] outline-none focus:border-[color:var(--brand-red)]/40"
                  value={payload.beneficiary_type}
                  onChange={(e) => setPayload((c) => ({ ...c, beneficiary_type: e.target.value }))}
                >
                  {BENEFICIARY_TYPES.map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-full bg-[color:var(--brand-red)] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-200/40 transition-all hover:shadow-xl"
            >
              Next: Verify Documents →
            </button>
          </div>
        )}

        {/* ── STEP 2: Document Verification ─────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Step 2 — Document Verification
              </p>
              <span className="rounded-full bg-[color:var(--panel)] px-3 py-1.5 text-[11px] font-semibold text-[color:var(--ink)]">
                {verifiedDocIds.length}/{requiredDocs.length} verified
              </span>
            </div>

            <div className="rounded-[20px] border border-[color:var(--border)] bg-[color:var(--panel)] px-5 py-4">
              <p className="text-sm font-semibold text-[color:var(--ink)]">
                {PURPOSE_OPTIONS.find((p) => p.value === payload.purpose_code)?.label} requires {requiredDocs.length} document{requiredDocs.length !== 1 ? "s" : ""}
              </p>
              <p className="mt-1 text-xs leading-6 text-[color:var(--ink-soft)]">
                Click a sample ID to auto-fill, then click Verify. All documents must be verified before proceeding to compliance check.
              </p>
            </div>

            <DocVerifyPanel
              requiredDocs={requiredDocs}
              onVerifiedChange={setVerifiedDocIds}
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-full border border-[color:var(--border)] bg-white px-6 py-3 text-sm font-semibold text-[color:var(--ink)]"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!allDocsVerified}
                className="rounded-full bg-[color:var(--brand-red)] px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-red-200/40 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next: Compliance Check →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Compliance Check ───────────────────────────────────── */}
        {step === 3 && (
          <form onSubmit={handleComplianceCheck} className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Step 3 — AI Compliance Check
            </p>

            {/* Summary card */}
            <div className="grid gap-3 rounded-[20px] border border-[color:var(--border)] bg-[color:var(--panel)] p-5 md:grid-cols-3">
              {[
                ["Amount", formatCurrency(Number(payload.amount || 0), payload.currency)],
                ["Corridor", `${COUNTRY_MAP[payload.origin_country] ?? payload.origin_country} → ${COUNTRY_MAP[payload.destination_country] ?? payload.destination_country}`],
                ["Purpose", PURPOSE_OPTIONS.find((p) => p.value === payload.purpose_code)?.label ?? payload.purpose_code],
                ["Source", payload.source_of_funds.replace(/_/g, " ")],
                ["Beneficiary", payload.beneficiary_type],
                ["Docs verified", `${verifiedDocIds.length}/${requiredDocs.length}`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[14px] bg-white px-4 py-3.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[color:var(--muted)]">{label}</p>
                  <p className="mt-1.5 text-sm font-semibold text-[color:var(--ink)]">{value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[20px] border border-[color:var(--border)] bg-[color:var(--panel)] px-5 py-4">
              <p className="text-sm font-semibold text-[color:var(--ink)]">🤖 Multi-Agent Screening</p>
              <p className="mt-1 text-xs leading-6 text-[color:var(--ink-soft)]">
                Your transfer will be screened by three sequential agents — AML Risk Analyst, Tax Compliance Officer, and Compliance Coordinator — before a verdict is issued.
                Verified documents reduce your AML risk score.
              </p>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)}
                className="rounded-full border border-[color:var(--border)] bg-white px-6 py-3 text-sm font-semibold text-[color:var(--ink)]">
                ← Back
              </button>
              <button type="submit" disabled={loading}
                className="rounded-full bg-[color:var(--brand-red)] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-200/40 disabled:opacity-60">
                {loading ? "Running AI agents…" : "Run Compliance Workflow →"}
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 4: Results + Payment ─────────────────────────────────── */}
        {step === 4 && decision && (
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Step 4 — Compliance Verdict & Payment
            </p>

            {/* Verdict hero */}
            <div className={`rounded-[20px] border p-6 ${
              decision.decision === "APPROVED"
                ? "border-emerald-200 bg-gradient-to-r from-emerald-50 to-white"
                : decision.decision === "MANUAL_REVIEW"
                  ? "border-amber-200 bg-amber-50"
                  : "border-red-200 bg-red-50"
            }`}>
              <div className="flex items-start gap-4">
                <span className="text-3xl">
                  {decision.decision === "APPROVED" ? "✅" : decision.decision === "MANUAL_REVIEW" ? "⚠️" : "❌"}
                </span>
                <div className="flex-1">
                  <p className={`text-2xl font-bold ${verdictColor()}`}>{decision.decision}</p>
                  <p className="mt-1 text-sm leading-7 text-[color:var(--ink-soft)]">{decision.reason}</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <span className="rounded-full border bg-white px-3 py-1.5 text-xs font-semibold text-[color:var(--ink)]">
                      AML Score: {decision.aml_score.toFixed(1)}
                    </span>
                    <span className="rounded-full border bg-white px-3 py-1.5 text-xs font-semibold text-[color:var(--ink)]">
                      Tax: {decision.tax_status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Agent trace */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">Agent Trace</p>
              {decision.agent_trace.map((item) => (
                <div key={item.agent} className={`rounded-[16px] border px-5 py-4 ${
                  item.status === "PASS" ? "border-emerald-200 bg-emerald-50"
                  : item.status === "FAIL" ? "border-red-200 bg-red-50"
                  : "border-amber-200 bg-amber-50"
                }`}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[color:var(--ink)]">{item.agent}</p>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      item.status === "PASS" ? "bg-emerald-100 text-emerald-700"
                      : item.status === "FAIL" ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                    }`}>{item.status}</span>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {item.findings.map((f) => (
                      <li key={f} className="text-xs leading-5 text-[color:var(--ink-soft)]">• {f}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Required documents */}
            {decision.required_documents.length > 0 && (
              <div className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--panel)] px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">Required Documents</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {decision.required_documents.map((doc) => (
                    <span key={doc} className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[color:var(--ink)] border border-[color:var(--border)]">{doc}</span>
                  ))}
                </div>
              </div>
            )}

            {paymentResult?.verified && (
              <div className="flex items-center gap-4 rounded-[20px] border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-5">
                <span className="text-2xl">🎉</span>
                <div>
                  <p className="text-sm font-semibold text-emerald-800">Payment captured and lodged in Aura ledger</p>
                  <p className="mt-0.5 text-xs text-emerald-700">Reference: {paymentResult.transaction_reference ?? paymentResult.payment_id}</p>
                </div>
              </div>
            )}

            <button type="button" onClick={() => { setStep(1); setDecision(null); setPaymentResult(null); }}
              className="rounded-full border border-[color:var(--border)] px-6 py-3 text-sm font-semibold text-[color:var(--ink)]">
              ← Start a new transfer
            </button>
          </div>
        )}
      </div>

      {/* Payment rail — always visible when on step 4 */}
      {step === 4 && (
        <div className="border-t border-[color:var(--border)] p-7">
          <RazorpayGatewayPanel
            title="Remittance Payment Rail"
            subtitle="Your transfer is approved — continue through the Razorpay gateway for order creation, checkout authorization and final settlement."
            amount={Number(payload.amount || 0)}
            currency={payload.currency}
            sourceLabel={selectedAccount ? `${selectedAccount.name} | ${selectedAccount.account_number}` : "Select account"}
            destinationLabel={`${COUNTRY_MAP[payload.destination_country] ?? payload.destination_country} | ${payload.beneficiary_type}`}
            actionLabel="Continue to Razorpay →"
            disabled={Boolean(paymentDisabledReason)}
            disabledReason={paymentDisabledReason}
            createOrder={createRemittanceOrder}
            onVerified={(result) => setPaymentResult(result)}
          />
        </div>
      )}
    </section>
  );
}
