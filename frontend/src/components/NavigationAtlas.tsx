import Link from "next/link";

import { featureMap, navigationSections } from "@/config/navigation";

export function NavigationAtlas() {
  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-red)]">
          Mega Menu Atlas
        </p>
        <h2 className="text-3xl font-semibold text-[color:var(--ink)]">
          Every researched Aura-style menu path, mapped explicitly
        </h2>
        <p className="max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
          The navigation below mirrors the public product taxonomy across banking,
          borrowing, wealth, NRI services, rewards and digital self-service.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {navigationSections.map((section) => (
          <article
            key={section.id}
            className="rounded-[28px] border border-[color:var(--border)] bg-white p-6 shadow-soft"
          >
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
                {section.label}
              </p>
              <p className="mt-2 text-sm leading-7 text-[color:var(--ink-soft)]">
                {section.description}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {section.columns.map((column) => (
                <div key={column.heading} className="rounded-3xl bg-[color:var(--panel)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                    {column.heading}
                  </p>
                  <div className="mt-3 space-y-2">
                    {column.items.map((slug) => {
                      const feature = featureMap[slug];
                      return (
                        <Link
                          key={slug}
                          href={feature.href}
                          className="block rounded-2xl border border-transparent bg-white px-3 py-3 transition-colors hover:border-[color:var(--brand-red)]/20 hover:bg-[color:var(--panel-strong)]"
                        >
                          <p className="text-sm font-semibold text-[color:var(--ink)]">
                            {feature.title}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-[color:var(--muted)]">
                            {feature.summary}
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
