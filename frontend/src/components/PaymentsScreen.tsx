"use client";

import { useEffect, useMemo, useState } from "react";

import { RazorpayGatewayPanel } from "@/components/RazorpayGatewayPanel";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import type {
  Account,
  CreditCard,
  DashboardOverview,
  PaymentOrder,
  PaymentVerification,
} from "@/lib/types";

type PaymentMode = "bills" | "card" | "debit" | "gateway" | "tax" | "mandate";

type PaymentRecord = {
  id: string;
  slug: string;
  title: string;
  mode: PaymentMode;
  sourceAccountId: number;
  destination: string;
  amount: number;
  status: "Processed" | "Queued";
  submittedAt: string;
  note: string;
};

type MandateRecord = {
  id: string;
  beneficiary: string;
  amount: number;
  frequency: string;
  startDate: string;
  status: "Active";
};

function useLocalStore<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        setValue(JSON.parse(raw) as T);
      }
    } catch {}
  }, [key]);

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

function getMode(slug: string): PaymentMode {
  if (slug === "credit-card-payments") return "card";
  if (slug === "google-pay" || slug === "simplypay") return "card";
  if (slug === "debit-card-payments") return "debit";
  if (slug === "payment-gateway" || slug === "secure-online-payments") return "gateway";
  if (slug === "online-tax-payment") return "tax";
  if (slug === "e-nach" || slug === "e-mandate") return "mandate";
  return "bills";
}

function getDestinationLabel(mode: PaymentMode) {
  if (mode === "card") return "Target card";
  if (mode === "debit") return "Merchant / beneficiary";
  if (mode === "gateway") return "Merchant order ID";
  if (mode === "tax") return "PAN or challan reference";
  if (mode === "mandate") return "Biller / beneficiary";
  return "Biller / payee";
}

export function PaymentsScreen({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const mode = getMode(slug);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [records, setRecords] = useLocalStore<PaymentRecord[]>("aura-payments", []);
  const [mandates, setMandates] = useLocalStore<MandateRecord[]>(
    "aura-mandates",
    [],
  );
  const [form, setForm] = useState({
    sourceAccountId: "",
    destination: "",
    amount: "25000",
    note: "",
    frequency: "Monthly",
    startDate: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    apiFetch<DashboardOverview>("/api/dashboard/overview/1")
      .then((data) =>
        setOverview(data),
      )
      .catch(() => setOverview(null));
  }, []);

  useEffect(() => {
    if (!overview || form.sourceAccountId) return;
    const firstAccount = overview.accounts[0];
    if (firstAccount) {
      setForm((current) => ({
        ...current,
        sourceAccountId: String(firstAccount.id),
      }));
    }
  }, [form.sourceAccountId, overview]);

  const sourceAccounts = overview?.accounts ?? [];
  const cards = overview?.credit_cards ?? [];

  const selectedAccount = sourceAccounts.find(
    (account) => account.id === Number(form.sourceAccountId),
  );

  const recentPayments = useMemo(
    () => records.filter((item) => item.slug === slug).slice(-4).reverse(),
    [records, slug],
  );

  const amount = Number(form.amount || 0);
  const sourceLabel = selectedAccount
    ? `${selectedAccount.name} | ${selectedAccount.account_number}`
    : "Select source account";
  const paymentDisabledReason = !selectedAccount
    ? "Choose a source account before opening checkout."
    : !form.destination.trim()
      ? `Add ${getDestinationLabel(mode).toLowerCase()} to continue.`
      : amount <= 0
        ? "Enter a valid amount to continue."
        : null;

  function handleMandateSubmit() {
    const amount = Number(form.amount || 0);
    if (!selectedAccount || amount <= 0) return;

    const mandate: MandateRecord = {
      id: crypto.randomUUID(),
      beneficiary: form.destination,
      amount,
      frequency: form.frequency,
      startDate: form.startDate,
      status: "Active",
    };
    setMandates((current) => [...current, mandate]);
  }

  function fillCard(card: CreditCard) {
    setForm((current) => ({
      ...current,
      destination: `${card.card_name} | ${card.last_four}`,
      amount: String(Math.max(1000, Math.round(card.current_balance))),
    }));
  }

  function fillPayee(account: Account) {
    setForm((current) => ({
      ...current,
      destination: `${account.name} | ${account.account_number}`,
    }));
  }

  async function createOrder() {
    if (!selectedAccount) {
      throw new Error("Select a source account before launching Razorpay.");
    }

    return apiFetch<PaymentOrder>("/api/payments/orders", {
      method: "POST",
      body: JSON.stringify({
        user_id: 1,
        route_slug: slug,
        route_title: title,
        payment_mode: mode,
        source_account_id: selectedAccount.id,
        amount,
        currency: selectedAccount.currency,
        destination: form.destination,
        note: form.note,
      }),
    });
  }

  function handlePaymentVerified(result: PaymentVerification) {
    if (!selectedAccount || !result.verified) return;

    const record: PaymentRecord = {
      id: result.transaction_reference ?? crypto.randomUUID(),
      slug,
      title,
      mode,
      sourceAccountId: selectedAccount.id,
      destination: form.destination,
      amount,
      status: result.status === "CAPTURED" ? "Processed" : "Queued",
      submittedAt: new Date().toISOString(),
      note: form.note || result.transaction_reference || title,
    };
    setRecords((current) => [...current, record]);
    setForm((current) => ({ ...current, note: "" }));
  }

  return (
    <section className="rounded-[32px] border border-[color:var(--border)] bg-white p-6 shadow-soft">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-red)]">
            Payments Screen
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[color:var(--ink)]">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-7 text-[color:var(--ink-soft)]">
            Source funds, beneficiary details, schedules and recent activity are
            handled from one dedicated payment flow.
          </p>
        </div>
        {selectedAccount ? (
          <div className="rounded-3xl bg-[color:var(--panel)] px-4 py-3 text-sm text-[color:var(--ink-soft)]">
            Available {formatCurrency(selectedAccount.available_balance, selectedAccount.currency)}
          </div>
        ) : null}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="grid gap-5">
          <article className="rounded-[28px] bg-[color:var(--panel)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Payment setup
            </p>
            <div className="mt-4 grid gap-3">
              <label className="grid gap-2 text-sm text-[color:var(--ink-soft)]">
                Source account
                <select
                  className="rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-[color:var(--ink)] outline-none"
                  value={form.sourceAccountId}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      sourceAccountId: event.target.value,
                    }))
                  }
                >
                  {sourceAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm text-[color:var(--ink-soft)]">
                {getDestinationLabel(mode)}
                <input
                  className="rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-[color:var(--ink)] outline-none"
                  value={form.destination}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      destination: event.target.value,
                    }))
                  }
                />
              </label>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="grid gap-2 text-sm text-[color:var(--ink-soft)]">
                  Amount
                  <input
                    className="rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-[color:var(--ink)] outline-none"
                    value={form.amount}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        amount: event.target.value,
                      }))
                    }
                  />
                </label>

                {mode === "mandate" ? (
                  <label className="grid gap-2 text-sm text-[color:var(--ink-soft)]">
                    Frequency
                    <select
                      className="rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-[color:var(--ink)] outline-none"
                      value={form.frequency}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          frequency: event.target.value,
                        }))
                      }
                    >
                      {["Monthly", "Quarterly", "Yearly"].map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <label className="grid gap-2 text-sm text-[color:var(--ink-soft)]">
                    Reference note
                    <input
                      className="rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-[color:var(--ink)] outline-none"
                      value={form.note}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          note: event.target.value,
                        }))
                      }
                    />
                  </label>
                )}
              </div>

              {mode === "mandate" ? (
                <label className="grid gap-2 text-sm text-[color:var(--ink-soft)]">
                  Start date
                  <input
                    type="date"
                    className="rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-[color:var(--ink)] outline-none"
                    value={form.startDate}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        startDate: event.target.value,
                      }))
                    }
                  />
                </label>
              ) : null}

              {mode === "mandate" ? (
                <button
                  type="button"
                  onClick={handleMandateSubmit}
                  className="rounded-full bg-[color:var(--brand-red)] px-5 py-3 text-sm font-semibold text-white"
                >
                  Create mandate
                </button>
              ) : (
                <div className="rounded-3xl border border-[color:var(--border)] bg-white px-4 py-4">
                  <p className="text-sm font-semibold text-[color:var(--ink)]">
                    Razorpay pipeline ready
                  </p>
                  <p className="mt-1 text-xs leading-6 text-[color:var(--muted)]">
                    Continue from the checkout rail to create the order, open the gateway,
                    verify the signature and post the ledger entry.
                  </p>
                </div>
              )}
            </div>
          </article>

          <article className="rounded-[28px] bg-[color:var(--panel)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Quick picks
            </p>
            <div className="mt-4 grid gap-3">
              {(mode === "card" ? cards : sourceAccounts.slice(0, 3)).map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() =>
                    mode === "card"
                      ? fillCard(item as CreditCard)
                      : fillPayee(item as Account)
                  }
                  className="rounded-3xl border border-[color:var(--border)] bg-white px-4 py-4 text-left"
                >
                  <p className="text-sm font-semibold text-[color:var(--ink)]">
                    {"card_name" in item ? item.card_name : item.name}
                  </p>
                  <p className="mt-1 text-xs text-[color:var(--muted)]">
                    {"card_name" in item
                      ? `Outstanding ${formatCurrency(item.current_balance)}`
                      : `Available ${formatCurrency(item.available_balance, item.currency)}`}
                  </p>
                </button>
              ))}
            </div>
          </article>
        </div>

        <div className="grid gap-5">
          {mode !== "mandate" ? (
            <RazorpayGatewayPanel
              title={`${title} checkout`}
              subtitle="Launch a Razorpay-compatible checkout with order creation, authorization, signature verification and ledger settlement tracked in one place."
              amount={amount}
              currency={selectedAccount?.currency ?? "INR"}
              sourceLabel={sourceLabel}
              destinationLabel={form.destination || "Add beneficiary or merchant"}
              actionLabel="Continue to Razorpay"
              disabled={Boolean(paymentDisabledReason)}
              disabledReason={paymentDisabledReason}
              createOrder={createOrder}
              onVerified={handlePaymentVerified}
            />
          ) : null}

          <article className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--panel)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Recent activity
            </p>
            <div className="mt-4 space-y-3">
              {recentPayments.length > 0 ? (
                recentPayments.map((record) => (
                  <div key={record.id} className="rounded-3xl bg-white px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[color:var(--ink)]">
                          {record.destination}
                        </p>
                        <p className="mt-1 text-xs text-[color:var(--muted)]">
                          {formatCurrency(record.amount)} | {record.note || record.title}
                        </p>
                      </div>
                      <span className="rounded-full bg-[color:var(--panel)] px-3 py-1 text-xs font-semibold text-[color:var(--ink)]">
                        {record.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl bg-white px-4 py-4 text-sm leading-7 text-[color:var(--ink-soft)]">
                  No recent payments for this route yet. Submit one from the setup panel.
                </div>
              )}
            </div>
          </article>

          {mode === "mandate" ? (
            <article className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--panel)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Active mandates
              </p>
              <div className="mt-4 space-y-3">
                {mandates.length > 0 ? (
                  mandates.slice(-4).reverse().map((item) => (
                    <div key={item.id} className="rounded-3xl bg-white px-4 py-4">
                      <p className="text-sm font-semibold text-[color:var(--ink)]">
                        {item.beneficiary}
                      </p>
                      <p className="mt-1 text-xs text-[color:var(--muted)]">
                        {formatCurrency(item.amount)} | {item.frequency} from {item.startDate}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl bg-white px-4 py-4 text-sm leading-7 text-[color:var(--ink-soft)]">
                    Create a mandate to start recurring bill or EMI debits.
                  </div>
                )}
              </div>
            </article>
          ) : (
            <article className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--panel)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Processing guidance
              </p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-[color:var(--ink-soft)]">
                <p>Orders are created first, then routed into a Razorpay-style checkout for authorization.</p>
                <p>Successful payments are verified server-side before the transaction is written into the Aura ledger.</p>
                <p>Use source accounts from the Premier overview to keep balances and payment instructions aligned.</p>
              </div>
            </article>
          )}
        </div>
      </div>
    </section>
  );
}
