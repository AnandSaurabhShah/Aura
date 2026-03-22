"use client";

import { useEffect, useMemo, useState } from "react";

import { formatCompactCurrency, formatCurrency } from "@/lib/format";
import {
  branchCatalog,
  cardCatalog,
  documentCatalog,
  faqCatalog,
  fundCatalog,
  getChecklist,
  getRouteFamily,
  nriCatalog,
  offerCatalog,
  type CatalogItem,
  type RouteFamily,
} from "@/lib/featureWorkbenchData";

type ApplicationEntry = {
  id: string;
  slug: string;
  title: string;
  fullName: string;
  email: string;
  city: string;
  amount: string;
  note: string;
  createdAt: string;
  status: "Submitted";
};

type CartEntry = {
  id: string;
  name: string;
  amount: string;
};

function usePersistentState<T>(key: string, initialValue: T) {
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

function getActionLabel(family: RouteFamily, slug: string) {
  if (slug === "video-kyc") return "Book video KYC";
  if (slug === "global-transfers") return "Create transfer request";
  if (slug === "grievance-redressal") return "Raise grievance";
  if (slug === "service-requests") return "Create service request";
  if (family === "card") return "Apply for this card";
  if (family === "loan") return "Apply for this loan";
  if (family === "wealth") return "Start investing";
  if (family === "offer") return "Activate offer";
  if (family === "education") return "Create study plan";
  return "Start this journey";
}

function getPlannerCopy(family: RouteFamily, slug: string) {
  if (family === "loan") return "EMI planner";
  if (family === "wealth") return slug === "shopping-cart" ? "Investment basket planner" : "Goal and SIP planner";
  if (family === "nri") return "FX and remittance planner";
  if (family === "card" || family === "offer") return "Rewards and savings planner";
  if (family === "digital" || family === "security") return "Readiness score";
  if (family === "education") return "Study-abroad budget planner";
  return "Deposit and balance planner";
}

function getPlannerDescription(family: RouteFamily) {
  if (family === "nri") {
    return "Keep remittance amount, indicative FX and fee buffer separated so the payout math stays easy to scan.";
  }
  if (family === "card" || family === "offer") {
    return "Compare monthly spend, reward rate and annual fee with enough breathing room to judge true net value.";
  }
  if (family === "wealth") {
    return "Model contribution pace, expected return and horizon without losing the outcome summary.";
  }
  if (family === "loan") {
    return "Adjust amount, rate and tenure with a cleaner EMI summary beside the input stack.";
  }
  return "Use the planner inputs on the left and read the computed scenario summary on the right.";
}

function getPlannerFields(family: RouteFamily) {
  if (family === "nri") {
    return [
      ["Remittance amount", "principal", "Amount to fund before fees."],
      ["Indicative FX", "rate", "Live corridor quote or working rate."],
      ["Fee buffer", "term", "Service charge or corridor buffer."],
    ] as const;
  }

  if (family === "card" || family === "offer") {
    return [
      ["Monthly spend", "principal", "Eligible monthly spend on the card."],
      ["Reward rate", "rate", "Cashback, miles or points rate."],
      ["Annual fee", "term", "Fee to net off against reward value."],
    ] as const;
  }

  if (family === "wealth") {
    return [
      ["Monthly contribution", "principal", "Recurring SIP or basket amount."],
      ["Expected return", "rate", "Illustrative annualised return."],
      ["Horizon", "term", "Investment duration in months."],
    ] as const;
  }

  if (family === "loan") {
    return [
      ["Loan amount", "principal", "Principal to be financed."],
      ["Interest rate", "rate", "Annual rate used for the EMI."],
      ["Tenure", "term", "Repayment term in months."],
    ] as const;
  }

  return [
    ["Principal", "principal", "Starting amount or contribution."],
    ["Rate / FX", "rate", "Yield, reward rate or corridor FX."],
    ["Term", "term", "Months, fee or scenario duration."],
  ] as const;
}

type PlannerBreakdownItem = {
  label: string;
  value: string;
  percent: number;
  color: string;
};

type PlannerResultEnhanced = {
  headline: string;
  subtext: string;
  lines: string[];
  breakdowns: PlannerBreakdownItem[];
  accent: "positive" | "negative" | "neutral";
  badge: string;
};

function getPlannerResult(
  family: RouteFamily,
  values: { principal: number; rate: number; term: number },
): PlannerResultEnhanced {
  if (family === "loan") {
    const monthlyRate = values.rate / 1200;
    const emi =
      monthlyRate === 0
        ? values.principal / values.term
        : (values.principal * monthlyRate * (1 + monthlyRate) ** values.term) /
          ((1 + monthlyRate) ** values.term - 1);
    const totalPayment = emi * values.term;
    const totalInterest = totalPayment - values.principal;
    const principalPercent = values.principal / Math.max(totalPayment, 1) * 100;
    const interestPercent = totalInterest / Math.max(totalPayment, 1) * 100;
    return {
      headline: formatCurrency(emi),
      subtext: "Estimated monthly EMI",
      lines: [
        `Loan amount ${formatCurrency(values.principal)}`,
        `Tenure ${values.term} months at ${values.rate.toFixed(2)}%`,
      ],
      breakdowns: [
        { label: "Principal", value: formatCompactCurrency(values.principal), percent: principalPercent, color: "#3b82f6" },
        { label: "Interest", value: formatCompactCurrency(totalInterest), percent: interestPercent, color: "#f97316" },
      ],
      accent: "neutral",
      badge: `Total payable ${formatCompactCurrency(totalPayment)}`,
    };
  }

  if (family === "wealth") {
    const monthlyRate = values.rate / 1200;
    const futureValue =
      monthlyRate === 0
        ? values.principal * values.term
        : (values.principal * ((1 + monthlyRate) ** values.term - 1)) /
          monthlyRate;
    const totalContributed = values.principal * values.term;
    const wealthGain = futureValue - totalContributed;
    const contribPercent = totalContributed / Math.max(futureValue, 1) * 100;
    const gainPercent = wealthGain / Math.max(futureValue, 1) * 100;
    const years = Math.floor(values.term / 12);
    const months = values.term % 12;
    const horizonLabel = years > 0
      ? months > 0 ? `${years}y ${months}m` : `${years} years`
      : `${months} months`;

    return {
      headline: formatCompactCurrency(futureValue),
      subtext: "Projected corpus value",
      lines: [
        `Monthly SIP ${formatCurrency(values.principal)} over ${horizonLabel}`,
        `Total invested ${formatCompactCurrency(totalContributed)}`,
      ],
      breakdowns: [
        { label: "Your contributions", value: formatCompactCurrency(totalContributed), percent: contribPercent, color: "#3b82f6" },
        { label: "Estimated returns", value: formatCompactCurrency(wealthGain), percent: gainPercent, color: "#10b981" },
      ],
      accent: wealthGain > 0 ? "positive" : "neutral",
      badge: `Returns ${wealthGain > 0 ? "+" : ""}${formatCompactCurrency(wealthGain)} (${((wealthGain / Math.max(totalContributed, 1)) * 100).toFixed(1)}%)`,
    };
  }

  if (family === "nri") {
    const fee = Math.max(values.term, values.principal * 0.0045);
    const converted = (values.principal - fee) * values.rate;
    const feePercent = fee / Math.max(values.principal, 1) * 100;
    return {
      headline: formatCompactCurrency(converted),
      subtext: "Beneficiary receives",
      lines: [
        `Transfer amount ${formatCurrency(values.principal)}`,
        `Fee buffer ${formatCurrency(fee)} at FX ${values.rate.toFixed(2)}`,
      ],
      breakdowns: [
        { label: "Net transfer", value: formatCurrency(values.principal - fee), percent: 100 - feePercent, color: "#3b82f6" },
        { label: "Fees", value: formatCurrency(fee), percent: feePercent, color: "#ef4444" },
      ],
      accent: "neutral",
      badge: `Effective rate ${values.rate.toFixed(2)}`,
    };
  }

  if (family === "card" || family === "offer") {
    const annualSpend = values.principal * 12;
    const grossValue = annualSpend * (values.rate / 100);
    const netValue = grossValue - values.term;
    const rewardPercent = grossValue / Math.max(annualSpend, 1) * 100;
    const feeImpact = values.term / Math.max(grossValue, 1) * 100;

    return {
      headline: formatCurrency(netValue),
      subtext: netValue >= 0 ? "Annual net rewards earned" : "Annual net cost after fee",
      lines: [
        `Annual spend ${formatCompactCurrency(annualSpend)}`,
        `Gross reward value ${formatCurrency(grossValue)}`,
      ],
      breakdowns: [
        { label: "Gross rewards", value: formatCurrency(grossValue), percent: Math.min(100, rewardPercent * 20), color: "#10b981" },
        { label: "Annual fee drag", value: formatCurrency(values.term), percent: Math.min(100, feeImpact * 100), color: "#ef4444" },
      ],
      accent: netValue >= 0 ? "positive" : "negative",
      badge: netValue >= 0
        ? `Fee recovered in ${grossValue > 0 ? Math.ceil(values.term / (grossValue / 12)).toFixed(0) : "—"} months`
        : "Fee exceeds reward value",
    };
  }

  if (family === "digital" || family === "security") {
    const score = Math.max(0, Math.min(100, values.principal + values.rate - values.term));
    return {
      headline: `${score.toFixed(0)} / 100`,
      subtext: "Readiness score",
      lines: [
        `Security controls ${values.principal.toFixed(0)}`,
        `Digital completion ${values.rate.toFixed(0)} with risk drag ${values.term.toFixed(0)}`,
      ],
      breakdowns: [
        { label: "Score achieved", value: `${score.toFixed(0)}%`, percent: score, color: score > 60 ? "#10b981" : "#f97316" },
      ],
      accent: score > 60 ? "positive" : "neutral",
      badge: score > 80 ? "Excellent readiness" : score > 60 ? "Good progress" : "Needs attention",
    };
  }

  if (family === "education") {
    const totalCost = values.principal + values.rate * values.term;
    const tuitionPercent = values.principal / Math.max(totalCost, 1) * 100;
    const livingPercent = (values.rate * values.term) / Math.max(totalCost, 1) * 100;
    return {
      headline: formatCompactCurrency(totalCost),
      subtext: "Estimated total budget",
      lines: [
        `Tuition ${formatCurrency(values.principal)}`,
        `Living cost ${formatCurrency(values.rate)} for ${values.term} months`,
      ],
      breakdowns: [
        { label: "Tuition", value: formatCompactCurrency(values.principal), percent: tuitionPercent, color: "#6366f1" },
        { label: "Living expenses", value: formatCompactCurrency(values.rate * values.term), percent: livingPercent, color: "#f59e0b" },
      ],
      accent: "neutral",
      badge: `Per-month burn ${formatCurrency(totalCost / Math.max(values.term, 1))}`,
    };
  }

  const maturity = values.principal * (1 + values.rate / 100 / 12) ** values.term;
  const interest = maturity - values.principal;
  const principalPct = values.principal / Math.max(maturity, 1) * 100;
  return {
    headline: formatCompactCurrency(maturity),
    subtext: "Projected balance",
    lines: [
      `Starting balance ${formatCurrency(values.principal)}`,
      `Growth over ${values.term} months at ${values.rate.toFixed(2)}%`,
    ],
    breakdowns: [
      { label: "Principal", value: formatCompactCurrency(values.principal), percent: principalPct, color: "#3b82f6" },
      { label: "Interest earned", value: formatCompactCurrency(interest), percent: 100 - principalPct, color: "#10b981" },
    ],
    accent: interest > 0 ? "positive" : "neutral",
    badge: `Interest earned ${formatCompactCurrency(interest)}`,
  };
}

function getCatalog(feature: { slug: string }, family: RouteFamily) {
  if (feature.slug === "branches-atm") return branchCatalog;
  if (feature.slug === "faq" || feature.slug === "help-support") return faqCatalog;
  if (
    ["application-forms", "accounts-terms", "rates-fees", "regulatory-disclosures", "important-notices", "branch-notices"].includes(
      feature.slug,
    )
  ) {
    return documentCatalog;
  }
  if (family === "card") return cardCatalog;
  if (family === "wealth") return fundCatalog;
  if (family === "nri" || family === "education") return nriCatalog;
  if (family === "offer") return offerCatalog;
  if (family === "support" || family === "digital") return faqCatalog;
  return documentCatalog;
}

export function FeatureWorkbench({
  feature,
}: {
  feature: { slug: string; title: string };
}) {
  const family = getRouteFamily(feature.slug);
  const [filter, setFilter] = useState("");
  const [applications, setApplications] = usePersistentState<ApplicationEntry[]>(
    "aura-feature-applications",
    [],
  );
  const [cart, setCart] = usePersistentState<CartEntry[]>("aura-wealth-cart", []);
  const [checklist, setChecklist] = usePersistentState<Record<string, boolean>>(
    `aura-checklist-${feature.slug}`,
    {},
  );
  const [form, setForm] = useState({
    fullName: "Anand Shah",
    email: "anand.shah@premier.demo.aura",
    city: "Mumbai",
    amount: "100000",
    note: "",
  });
  const [planner, setPlanner] = useState({
    principal: family === "card" || family === "offer" ? "45000" : "100000",
    rate: family === "loan" ? "8.25" : family === "wealth" ? "12" : family === "nri" ? "83.10" : family === "card" || family === "offer" ? "3.5" : "6",
    term: family === "loan" ? "60" : family === "wealth" ? "120" : family === "education" ? "24" : family === "card" || family === "offer" ? "999" : "12",
  });

  const catalog = useMemo(() => getCatalog(feature, family), [feature, family]);
  const filteredCatalog = useMemo(
    () =>
      catalog.filter((item) =>
        `${item.name} ${item.category} ${item.subtitle} ${item.tags.join(" ")}`
          .toLowerCase()
          .includes(filter.toLowerCase()),
      ),
    [catalog, filter],
  );

  const recentApplications = applications
    .filter((entry) => entry.slug === feature.slug)
    .slice(-3)
    .reverse();

  const plannerResult = getPlannerResult(family, {
    principal: Number(planner.principal || 0),
    rate: Number(planner.rate || 0),
    term: Number(planner.term || 0),
  });

  function submitApplication() {
    const entry: ApplicationEntry = {
      id: crypto.randomUUID(),
      slug: feature.slug,
      title: feature.title,
      fullName: form.fullName,
      email: form.email,
      city: form.city,
      amount: form.amount,
      note: form.note,
      createdAt: new Date().toISOString(),
      status: "Submitted",
    };
    setApplications((current) => [...current, entry]);
    setForm((current) => ({ ...current, note: "" }));
  }

  function toggleChecklistItem(item: string) {
    setChecklist((current) => ({ ...current, [item]: !current[item] }));
  }

  function addToCart(item: CatalogItem) {
    setCart((current) => {
      if (current.some((entry) => entry.id === item.id)) {
        return current;
      }
      return [
        ...current,
        {
          id: item.id,
          name: item.name,
          amount: item.metricA,
        },
      ];
    });
  }

  function applyCatalogItem(item: CatalogItem) {
    setForm((current) => ({
      ...current,
      note: `Selected option: ${item.name} (${item.category})`,
    }));
  }

  function removeFromCart(id: string) {
    setCart((current) => current.filter((entry) => entry.id !== id));
  }

  const checklistItems = getChecklist(feature.slug, family);
  const plannerFields = getPlannerFields(family);

  return (
    <section className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
      <div className="grid gap-5">
        <article className="rounded-[30px] border border-[color:var(--border)] bg-white p-6 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
            Action Center
          </p>
          <div className="mt-4 grid gap-3">
            {[
              ["Full name", "fullName"],
              ["Email", "email"],
              ["City", "city"],
              ["Amount / target", "amount"],
            ].map(([label, key]) => (
              <label key={key} className="grid gap-2 text-sm text-[color:var(--ink-soft)]">
                {label}
                <input
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--panel)] px-4 py-3 text-[color:var(--ink)] outline-none"
                  value={form[key as keyof typeof form]}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                />
              </label>
            ))}
            <label className="grid gap-2 text-sm text-[color:var(--ink-soft)]">
              Notes
              <textarea
                className="min-h-24 rounded-2xl border border-[color:var(--border)] bg-[color:var(--panel)] px-4 py-3 text-[color:var(--ink)] outline-none"
                value={form.note}
                onChange={(event) =>
                  setForm((current) => ({ ...current, note: event.target.value }))
                }
              />
            </label>
            <button
              type="button"
              onClick={submitApplication}
              className="rounded-full bg-[color:var(--brand-red)] px-5 py-3 text-sm font-semibold text-white"
            >
              {getActionLabel(family, feature.slug)}
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {recentApplications.length > 0 ? (
              recentApplications.map((entry) => (
                <div key={entry.id} className="rounded-3xl bg-[color:var(--panel)] px-4 py-4">
                  <p className="text-sm font-semibold text-[color:var(--ink)]">
                    {entry.fullName} - {entry.amount}
                  </p>
                  <p className="mt-1 text-xs text-[color:var(--muted)]">
                    {entry.status} from {entry.city}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-3xl bg-[color:var(--panel)] px-4 py-4 text-sm leading-7 text-[color:var(--ink-soft)]">
                Start the workflow above and your submissions for this feature will
                be stored locally and tracked here.
              </div>
            )}
          </div>
        </article>

        <article className="rounded-[30px] border border-[color:var(--border)] bg-white shadow-soft overflow-hidden">
          {/* Planner header with gradient accent stripe */}
          <div
            className="px-7 pt-7 pb-5"
            style={{
              background: "linear-gradient(135deg, rgba(219, 31, 53, 0.06) 0%, rgba(255,255,255,0.95) 60%)",
            }}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[color:var(--brand-red)]/10 text-xs font-bold text-[color:var(--brand-red)]">
                    {family === "wealth" ? "📈" : family === "card" || family === "offer" ? "🎁" : family === "loan" ? "🏠" : family === "nri" ? "🌐" : "📊"}
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-red)]">
                    {getPlannerCopy(family, feature.slug)}
                  </p>
                </div>
                <p className="max-w-2xl text-sm leading-7 text-[color:var(--ink-soft)]">
                  {getPlannerDescription(family)}
                </p>
              </div>
              <div className="flex-shrink-0 rounded-full border border-[color:var(--brand-red)]/15 bg-white px-4 py-2 text-xs font-semibold text-[color:var(--brand-red)]">
                ⚡ Live scenario
              </div>
            </div>
          </div>

          {/* Planner body with inputs and outcome */}
          <div className="px-7 pb-7 pt-2">
            <div className="grid gap-6 xl:grid-cols-[1fr_1.15fr]">

              {/* Input fields with unit badges */}
              <div className="grid content-start gap-5">
                {plannerFields.map(([label, key, hint]) => {
                  const unitBadge =
                    key === "principal"
                      ? "₹"
                      : key === "rate" && (family === "nri")
                        ? "FX"
                        : key === "rate"
                          ? "%"
                          : key === "term" && (family === "card" || family === "offer")
                            ? "₹/yr"
                            : "mo";
                  return (
                    <label
                      key={key}
                      className="group rounded-[24px] border border-[color:var(--border)] bg-[color:var(--panel)] p-5 transition-all hover:border-[color:var(--brand-red)]/25 hover:shadow-md"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-[color:var(--ink)]">{label}</p>
                          <p className="mt-1 text-[11px] leading-5 text-[color:var(--muted)]">{hint}</p>
                        </div>
                        <span className="flex-shrink-0 rounded-xl bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[color:var(--muted)] shadow-sm">
                          {unitBadge}
                        </span>
                      </div>
                      <input
                        className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3.5 text-lg font-semibold text-[color:var(--ink)] outline-none transition-colors focus:border-[color:var(--brand-red)]/40 focus:ring-2 focus:ring-[color:var(--brand-red)]/10"
                        value={planner[key as keyof typeof planner]}
                        inputMode="decimal"
                        onChange={(event) =>
                          setPlanner((current) => ({
                            ...current,
                            [key]: event.target.value,
                          }))
                        }
                      />
                    </label>
                  );
                })}
              </div>

              {/* Outcome card with visual breakdowns */}
              <div className="grid content-start gap-5">
                {/* Headline outcome */}
                <div
                  className="rounded-[24px] p-6"
                  style={{
                    background:
                      plannerResult.accent === "positive"
                        ? "linear-gradient(145deg, #ecfdf5 0%, #f0fdf4 40%, #ffffff 100%)"
                        : plannerResult.accent === "negative"
                          ? "linear-gradient(145deg, #fef2f2 0%, #fff1f2 40%, #ffffff 100%)"
                          : "linear-gradient(145deg, #eff6ff 0%, #f0f9ff 40%, #ffffff 100%)",
                    border: "1px solid",
                    borderColor:
                      plannerResult.accent === "positive"
                        ? "rgba(16, 185, 129, 0.2)"
                        : plannerResult.accent === "negative"
                          ? "rgba(239, 68, 68, 0.2)"
                          : "rgba(59, 130, 246, 0.2)",
                  }}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
                    {plannerResult.subtext}
                  </p>
                  <p
                    className="mt-3 text-4xl font-bold leading-tight"
                    style={{
                      color:
                        plannerResult.accent === "positive"
                          ? "#059669"
                          : plannerResult.accent === "negative"
                            ? "#dc2626"
                            : "var(--ink)",
                    }}
                  >
                    {plannerResult.headline}
                  </p>
                  <div className="mt-3">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold"
                      style={{
                        backgroundColor:
                          plannerResult.accent === "positive"
                            ? "rgba(16, 185, 129, 0.12)"
                            : plannerResult.accent === "negative"
                              ? "rgba(239, 68, 68, 0.12)"
                              : "rgba(59, 130, 246, 0.12)",
                        color:
                          plannerResult.accent === "positive"
                            ? "#059669"
                            : plannerResult.accent === "negative"
                              ? "#dc2626"
                              : "#2563eb",
                      }}
                    >
                      {plannerResult.accent === "positive" ? "▲" : plannerResult.accent === "negative" ? "▼" : "●"}{" "}
                      {plannerResult.badge}
                    </span>
                  </div>
                </div>

                {/* Visual breakdown bars */}
                <div className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--panel)] p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                    Composition
                  </p>
                  <div className="mt-4 space-y-4">
                    {plannerResult.breakdowns.map((item) => (
                      <div key={item.label}>
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-xs font-medium text-[color:var(--ink-soft)]">
                              {item.label}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-[color:var(--ink)]">
                            {item.value}
                          </span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-white">
                          <div
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{
                              width: `${Math.max(2, Math.min(100, item.percent))}%`,
                              backgroundColor: item.color,
                              opacity: 0.85,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detail lines */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {plannerResult.lines.map((line) => (
                    <div
                      key={line}
                      className="rounded-[20px] border border-[color:var(--border)] bg-white px-4 py-4 text-sm leading-7 text-[color:var(--ink-soft)]"
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>

      <div className="grid gap-5">
        <article className="rounded-[30px] border border-[color:var(--border)] bg-white p-6 shadow-soft">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Explorer
              </p>
              <p className="mt-1 text-sm text-[color:var(--ink-soft)]">
                Filter live data for this journey and take an action directly.
              </p>
            </div>
            <input
              className="rounded-full border border-[color:var(--border)] bg-[color:var(--panel)] px-4 py-2 text-sm text-[color:var(--ink)] outline-none"
              placeholder="Search"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            />
          </div>

          {feature.slug === "shopping-cart" ? (
            <div className="mt-4 space-y-3">
              {cart.length > 0 ? (
                cart.map((entry) => (
                  <div key={entry.id} className="rounded-3xl bg-[color:var(--panel)] px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[color:var(--ink)]">
                          {entry.name}
                        </p>
                        <p className="text-xs text-[color:var(--muted)]">
                          {entry.amount}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(entry.id)}
                        className="rounded-full border border-[color:var(--border)] px-3 py-2 text-xs font-semibold text-[color:var(--ink)]"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl bg-[color:var(--panel)] px-4 py-4 text-sm leading-7 text-[color:var(--ink-soft)]">
                  Your cart is empty. Add funds from mutual-funds or ESG routes and they
                  will appear here immediately.
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 grid gap-3">
              {filteredCatalog.map((item) => (
                <div key={item.id} className="rounded-3xl bg-[color:var(--panel)] px-4 py-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[color:var(--ink)]">
                        {item.name}
                      </p>
                      <p className="mt-1 text-xs leading-6 text-[color:var(--muted)]">
                        {item.subtitle}
                      </p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                        {item.metricA}
                      </p>
                      <p className="mt-1 text-xs text-[color:var(--muted)]">
                        {item.metricB}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--ink)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      family === "wealth" ? addToCart(item) : applyCatalogItem(item)
                    }
                    className="mt-4 rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-xs font-semibold text-[color:var(--ink)]"
                  >
                    {family === "wealth" ? "Add to shopping cart" : "Use in action center"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="rounded-[30px] border border-[color:var(--border)] bg-white p-6 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
            Progress checklist
          </p>
          <div className="mt-4 space-y-3">
            {checklistItems.map((item) => (
              <label
                key={item}
                className="flex cursor-pointer items-start gap-3 rounded-3xl bg-[color:var(--panel)] px-4 py-4"
              >
                <input
                  type="checkbox"
                  checked={Boolean(checklist[item])}
                  onChange={() => toggleChecklistItem(item)}
                  className="mt-1 h-4 w-4"
                />
                <span className="text-sm leading-7 text-[color:var(--ink-soft)]">
                  {item}
                </span>
              </label>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
