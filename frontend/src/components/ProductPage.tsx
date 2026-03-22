import Link from "next/link";

import type { FeatureDefinition } from "@/config/navigation";
import { featureMap } from "@/config/navigation";
import { FeatureWorkbench } from "@/components/FeatureWorkbench";
import { FxQuoteStrip } from "@/components/FxQuoteStrip";
import AccountList from "@/components/AccountList";
import ESGRecommender from "@/components/ESGRecommender";
import GlobalTransferForm from "@/components/GlobalTransferForm";
import { LoanApplicationFlow } from "@/components/LoanApplicationFlow";
import { PaymentsScreen } from "@/components/PaymentsScreen";
import { SIPInvestmentFlow } from "@/components/SIPInvestmentFlow";
import WealthDashboard from "@/components/WealthDashboard";
import CreditCardPredictor from "@/components/CreditCardPredictor";

/**
 * Slugs that get the full FeatureWorkbench (Action Center + Planner + Explorer + Checklist).
 * These are "actionable" pages where users need to apply, invest, or configure something.
 */
const WORKBENCH_SLUGS = new Set([
  // Cards & Borrowing
  "premier-credit-card", "live-plus-card", "taj-credit-card", "travelone-card",
  "visa-platinum", "rupay-platinum", "rupay-cashback", "compare-cards",
  "instant-emi", "cash-on-emi", "loan-on-phone", "balance-conversion",
  "balance-transfer",
  // Loans
  "home-loans", "lap", "smart-lap", "nri-home-loan", "personal-loan", "anytime-credit",
  // Wealth
  "bonds", "mutual-funds-online", "mutual-funds", "sip", "goal-planning",
  "shopping-cart", "wealth-account-opening",
  // NRI
  "nre-nro", "compare-nri-accounts", "nre-account", "nro-account",
  "mariners-account", "nre-fixed-deposit", "nro-fixed-deposit",
  "fcnr-deposit", "rfc-deposit", "fx-retail",
  "worldwide-banking", "moving-to-india", "moving-overseas",
  "investing-in-india", "lrs",
  // Offers
  "travel-offers", "electronics-offers", "dining-entertainment-offers",
  "ecommerce-offers", "limited-period-offers",
  "premier-offers", "golf-privileges", "international-privileges",
  // Education
  "overseas-education", "plan-study-abroad", "while-studying-abroad",
  "after-study-abroad", "destination-countries", "education-partners",
  // Accounts
  "premier", "private-bank", "savings", "fixed-deposits", "basic-savings",
  "premier-account", "family-banking", "salary-accounts",
  "personal-banking", "executive-banking",
  // Digital (actionable)
  "video-kyc", "service-requests", "global-transfers", "compliance-status",
]);

/**
 * Slugs that get the Platform Highlights + Connected Routes section.
 * These are pages with curated highlights defined in navigation.ts overrides.
 */
const HIGHLIGHTS_SLUGS = new Set([
  "private-bank", "premier", "basic-savings", "live-plus-card",
  "cash-on-emi", "global-transfers", "esg-recommender",
  "conformal-prediction", "compliance-status",
]);

function renderLiveModule(feature: FeatureDefinition) {
  if (
    [
      "online-banking-payments",
      "credit-card-payments",
      "debit-card-payments",
      "payment-gateway",
      "online-tax-payment",
      "bill-payments",
      "e-nach",
      "e-mandate",
      "google-pay",
      "simplypay",
      "phone-banking",
      "secure-online-payments",
    ].includes(feature.slug)
  ) {
    return <PaymentsScreen slug={feature.slug} title={feature.title} />;
  }

  if (feature.slug === "global-transfers" || feature.slug === "compliance-status") {
    return <GlobalTransferForm />;
  }

  if (feature.slug === "esg-recommender") {
    return <ESGRecommender />;
  }

  if (
    feature.slug === "conformal-prediction" ||
    feature.slug === "wealth-dashboard"
  ) {
    return <WealthDashboard />;
  }

  // Loan pipelines
  if (
    ["home-loans", "lap", "smart-lap", "personal-loan", "anytime-credit", "education-loan", "car-loan"].includes(feature.slug)
  ) {
    return <LoanApplicationFlow />;
  }

  // SIP & Mutual Fund pipelines
  if (
    ["sip", "mutual-funds", "mutual-funds-online", "shopping-cart", "goal-planning", "wealth-account-opening"].includes(feature.slug)
  ) {
    return <SIPInvestmentFlow />;
  }

  // Credit Card Predictor pipeline
  if (
    ["compare-cards", "premier-credit-card", "live-plus-card", "visa-platinum", "rupay-platinum", "rupay-cashback", "taj-credit-card", "travelone-card"].includes(feature.slug)
  ) {
    return <CreditCardPredictor />;
  }

  if (
    ["premier", "private-bank", "nre-nro"].includes(feature.slug)
  ) {
    return <AccountList />;
  }

  if (["fx-retail", "travel-rewards"].includes(feature.slug)) {
    return <FxQuoteStrip />;
  }

  return null;
}

export function ProductPage({ feature }: { feature: FeatureDefinition }) {
  const liveModule = renderLiveModule(feature);
  const showWorkbench = WORKBENCH_SLUGS.has(feature.slug);
  const showHighlights = HIGHLIGHTS_SLUGS.has(feature.slug);
  const hasRelated = feature.related.length > 0;

  return (
    <div className="space-y-8">
      {/* Hero section — always shown */}
      <section className="hero-panel overflow-hidden rounded-[36px] border border-[color:var(--border)] p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[color:var(--brand-red)]">
              {feature.section}
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-[color:var(--ink)]">
              {feature.title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[color:var(--ink-soft)]">
              {feature.hero}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-full bg-[color:var(--brand-red)] px-5 py-3 text-sm font-semibold text-white"
              >
                Back to dashboard
              </Link>
              <Link
                href="/global-transfers"
                className="rounded-full border border-[color:var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[color:var(--ink)]"
              >
                Explore linked journeys
              </Link>
            </div>
          </div>
          <div className="grid gap-3 rounded-[28px] bg-white/80 p-5">
            {feature.metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--panel)] px-4 py-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                  {metric.label}
                </p>
                <p className="mt-2 text-xl font-semibold text-[color:var(--ink)]">
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workbench — only on actionable pages */}
      {showWorkbench ? (
        <FeatureWorkbench feature={{ slug: feature.slug, title: feature.title }} />
      ) : null}

      {/* Highlights + Connected Routes — only pages with curated content */}
      {showHighlights || hasRelated ? (
        <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          {showHighlights ? (
            <article className="rounded-[30px] border border-[color:var(--border)] bg-white p-6 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Platform Highlights
              </p>
              <div className="mt-4 space-y-4">
                {feature.highlights.map((highlight) => (
                  <div
                    key={highlight}
                    className="rounded-3xl bg-[color:var(--panel)] px-4 py-4 text-sm leading-7 text-[color:var(--ink-soft)]"
                  >
                    {highlight}
                  </div>
                ))}
              </div>
            </article>
          ) : null}

          {hasRelated ? (
            <article className="rounded-[30px] border border-[color:var(--border)] bg-white p-6 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Connected Routes
              </p>
              <div className="mt-4 grid gap-3">
                {feature.related.map((slug) => {
                  const linked = featureMap[slug];
                  return (
                    <Link
                      key={slug}
                      href={linked.href}
                      className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--panel)] px-4 py-4 transition-colors hover:border-[color:var(--brand-red)]/20 hover:bg-white"
                    >
                      <p className="text-sm font-semibold text-[color:var(--ink)]">
                        {linked.title}
                      </p>
                      <p className="mt-1 text-xs leading-6 text-[color:var(--muted)]">
                        {linked.summary}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </article>
          ) : null}
        </section>
      ) : null}

      {/* Live Module — rendered last, positioned prominently */}
      {liveModule ? (
        <section className="space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-red)]">
              Live Module
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[color:var(--ink)]">
              Experience this journey in the platform
            </h2>
          </div>
          {liveModule}
        </section>
      ) : null}
    </div>
  );
}
