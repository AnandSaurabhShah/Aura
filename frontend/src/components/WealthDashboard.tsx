"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { apiFetch } from "@/lib/api";
import { formatDateLabel, formatPercent } from "@/lib/format";
import { WealthForecast } from "@/lib/types";

export default function WealthDashboard() {
  const [forecast, setForecast] = useState<WealthForecast | null>(null);

  useEffect(() => {
    apiFetch<WealthForecast>("/api/wealth/predict", {
      method: "POST",
      body: JSON.stringify({
        asset_name: "Aura Premier Growth Mandate",
        macro_tilt: 0.18,
        volatility_bias: 0.04,
        inflation_surprise: -0.01,
      }),
    })
      .then(setForecast)
      .catch(() => setForecast(null));
  }, []);

  const chartData = useMemo(
    () =>
      (forecast?.series ?? []).map((point) => ({
        date: formatDateLabel(point.date),
        actual_return: point.actual_return,
        predicted_return: point.predicted_return,
        lower_base: point.forecast ? point.lower_bound : null,
        interval:
          point.forecast &&
          point.lower_bound !== null &&
          point.upper_bound !== null
            ? point.upper_bound - point.lower_bound
            : null,
      })),
    [forecast],
  );

  if (!forecast) {
    return <div className="h-[420px] rounded-[32px] bg-white/70 shadow-soft" />;
  }

  return (
    <section className="rounded-[32px] border border-[color:var(--border)] bg-white p-6 shadow-soft">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-red)]">
        Conformal Prediction Dashboard
      </p>
      <div className="mt-4 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--panel)] p-4">
          <div className="mb-4">
            <p className="text-xl font-semibold text-[color:var(--ink)]">
              {forecast.asset_name}
            </p>
            <p className="text-sm text-[color:var(--muted)]">{forecast.horizon}</p>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.08)" />
                <XAxis dataKey="date" stroke="#7f8b9f" tickLine={false} axisLine={false} />
                <YAxis stroke="#7f8b9f" tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="lower_base"
                  stackId="interval"
                  fill="transparent"
                  stroke="transparent"
                />
                <Area
                  type="monotone"
                  dataKey="interval"
                  stackId="interval"
                  fill="rgba(219, 31, 53, 0.16)"
                  stroke="transparent"
                />
                <Line
                  type="monotone"
                  dataKey="actual_return"
                  stroke="#111827"
                  strokeWidth={2.2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="predicted_return"
                  stroke="#db1f35"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[28px] bg-[color:var(--panel)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Next-week range
            </p>
            <p className="mt-3 text-3xl font-semibold text-[color:var(--ink)]">
              {formatPercent(forecast.expected_week_return)}
            </p>
            <p className="mt-2 text-sm text-[color:var(--ink-soft)]">
              90% band {formatPercent(forecast.lower_bound_90)} to{" "}
              {formatPercent(forecast.upper_bound_90)}
            </p>
          </div>

          <div className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--panel)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Narrative
            </p>
            <p className="mt-3 text-sm leading-7 text-[color:var(--ink-soft)]">
              {forecast.narrative}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
