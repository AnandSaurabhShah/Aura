import AccountList from "@/components/AccountList";
import ESGRecommender from "@/components/ESGRecommender";
import { FxQuoteStrip } from "@/components/FxQuoteStrip";
import GlobalTransferForm from "@/components/GlobalTransferForm";
import { NavigationAtlas } from "@/components/NavigationAtlas";
import WealthDashboard from "@/components/WealthDashboard";

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="hero-panel rounded-[38px] border border-[color:var(--border)] p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[color:var(--brand-red)]">
              Aura-style premier banking and wealth platform
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-[color:var(--ink)] lg:text-6xl">
              One operating surface for banking, wealth, FX and compliance.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[color:var(--ink-soft)]">
              The platform mirrors Aura-style public navigation across Premier, Private
              Bank, savings, lending, global transfers, NRI services, digital banking,
              rewards and wealth management, then layers in ESG and conformal AI modules.
            </p>
          </div>
          <div className="grid gap-4">
            {[
              ["Navigation", "Exhaustive researched mega-menu atlas"],
              ["AI investing", "MCC-to-carbon XGBoost ESG recommender"],
              ["Forecasting", "MAPIE next-week return intervals"],
              ["Compliance", "LangGraph AML, tax and coordinator flow"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-[28px] border border-[color:var(--border)] bg-white/85 px-5 py-5 shadow-soft"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                  {label}
                </p>
                <p className="mt-2 text-lg font-semibold text-[color:var(--ink)]">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FxQuoteStrip />
      <AccountList />

      <div className="grid gap-8 xl:grid-cols-2">
        <ESGRecommender />
        <WealthDashboard />
      </div>

      <GlobalTransferForm />
      <NavigationAtlas />
    </div>
  );
}
