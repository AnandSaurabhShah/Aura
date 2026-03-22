"use client";

import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";
import { formatCompactCurrency, formatCurrency, formatDateLabel } from "@/lib/format";
import { DashboardOverview } from "@/lib/types";

const summaryLabels = [
  ["Deposits", "total_deposits", "currency"],
  ["Available cash", "total_available_cash", "currency"],
  ["Investments", "total_investments", "currency"],
  ["Travel rewards", "travel_rewards_points", "points"],
] as const;

export default function AccountList() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<DashboardOverview>("/api/dashboard/overview/1")
      .then(setOverview)
      .catch(() => setError("Unable to load account overview."));
  }, []);

  if (!overview && !error) {
    return <div className="h-[420px] rounded-[32px] bg-white/70 shadow-soft" />;
  }

  if (error || !overview) {
    return (
      <div className="rounded-[32px] border border-[color:var(--border)] bg-white p-6 text-sm text-[color:var(--brand-red)] shadow-soft">
        {error}
      </div>
    );
  }

  return (
    <section className="space-y-5 rounded-[32px] border border-[color:var(--border)] bg-white p-6 shadow-soft">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-red)]">
            One view of all your accounts
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-[color:var(--ink)]">
            {overview.user.full_name}
          </h2>
          <p className="mt-2 text-sm leading-7 text-[color:var(--ink-soft)]">
            Relationship manager {overview.user.relationship_manager} with{" "}
            {overview.user.segment.replace("_", " ")} servicing and approved KYC.
          </p>
        </div>
        <div className="rounded-3xl bg-[color:var(--panel)] px-4 py-3 text-sm text-[color:var(--ink-soft)]">
          Customer {overview.user.customer_number}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {summaryLabels.map(([label, key, displayType]) => (
          <div
            key={label}
            className="rounded-3xl bg-[color:var(--panel)] px-4 py-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              {label}
            </p>
            <p className="mt-3 text-2xl font-semibold text-[color:var(--ink)]">
              {displayType === "points"
                ? `${overview.summary[key].toLocaleString("en-IN")} pts`
                : formatCompactCurrency(overview.summary[key], "INR")}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3">
          {overview.accounts.map((account) => (
            <div
              key={account.id}
              className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--panel)] px-4 py-4"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[color:var(--ink)]">
                    {account.name}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
                    {account.account_type} • {account.account_number}
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-lg font-semibold text-[color:var(--ink)]">
                    {formatCurrency(account.current_balance, account.currency)}
                  </p>
                  <p className="text-xs text-[color:var(--muted)]">
                    Available {formatCurrency(account.available_balance, account.currency)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4">
          <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--panel)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Credit cards
            </p>
            <div className="mt-3 space-y-3">
              {overview.credit_cards.map((card) => (
                <div key={card.id} className="rounded-3xl bg-white px-4 py-4">
                  <p className="text-sm font-semibold text-[color:var(--ink)]">
                    {card.card_name}
                  </p>
                  <p className="mt-1 text-xs text-[color:var(--muted)]">
                    {card.network} • **** {card.last_four}
                  </p>
                  <p className="mt-3 text-sm text-[color:var(--ink-soft)]">
                    Utilised {formatCurrency(card.current_balance)} of{" "}
                    {formatCurrency(card.credit_limit)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--panel)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Liabilities and recent activity
            </p>
            <div className="mt-3 space-y-3">
              {overview.loans.map((loan) => (
                <div key={loan.id} className="rounded-3xl bg-white px-4 py-4">
                  <p className="text-sm font-semibold text-[color:var(--ink)]">
                    {loan.loan_name}
                  </p>
                  <p className="mt-1 text-xs text-[color:var(--muted)]">
                    Outstanding {formatCompactCurrency(loan.outstanding_principal)}
                  </p>
                </div>
              ))}
              {overview.recent_transactions.slice(0, 3).map((transaction) => (
                <div key={transaction.id} className="rounded-3xl bg-white px-4 py-4">
                  <p className="text-sm font-semibold text-[color:var(--ink)]">
                    {transaction.merchant_name ?? transaction.narration}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-xs text-[color:var(--muted)]">
                    <span>{formatDateLabel(transaction.booked_at)}</span>
                    <span>{formatCurrency(transaction.amount, transaction.currency)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
