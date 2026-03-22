"use client";

import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";
import { FxQuote } from "@/lib/types";

export function FxQuoteStrip() {
  const [quotes, setQuotes] = useState<FxQuote[]>([]);

  useEffect(() => {
    apiFetch<FxQuote[]>("/api/dashboard/fx/quotes")
      .then(setQuotes)
      .catch(() => setQuotes([]));
  }, []);

  return (
    <section className="rounded-[32px] border border-[color:var(--border)] bg-white p-6 shadow-soft">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-red)]">
            Live FX ladder
          </p>
          <p className="mt-2 text-sm leading-7 text-[color:var(--ink-soft)]">
            Indicative corridor rates with more space for spread and movement context.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {quotes.map((quote) => (
          <div
            key={quote.pair}
            className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--panel)] px-5 py-5 shadow-soft"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              {quote.pair}
            </p>
            <div className="mt-4 flex items-end justify-between gap-3">
              <p className="text-2xl font-semibold text-[color:var(--ink)]">
                {quote.rate.toFixed(4)}
              </p>
              <p
                className={
                  quote.move_percent >= 0
                    ? "text-sm font-semibold text-emerald-700"
                    : "text-sm font-semibold text-[color:var(--brand-red)]"
                }
              >
                {quote.move_percent >= 0 ? "+" : ""}
                {quote.move_percent.toFixed(3)}%
              </p>
            </div>
            <p className="mt-3 text-xs text-[color:var(--muted)]">
              Indicative spread {quote.spread_bps.toFixed(1)} bps
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
