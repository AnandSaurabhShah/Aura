"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { featureMap, navigationSections, sidebarPrimary } from "@/config/navigation";

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const DashboardIcon = featureMap.premier.icon;

  return (
    <aside
      className={cn(
        "hidden border-r border-[color:var(--border)] bg-white/85 backdrop-blur xl:block",
        className,
      )}
    >
      <div className="sticky top-0 flex h-screen flex-col">
        <div className="border-b border-[color:var(--border)] px-6 py-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-[color:var(--brand-red)] text-sm font-bold text-white">
              Aura
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">
                Premier Platform
              </p>
              <p className="text-base font-semibold text-[color:var(--ink)]">
                Wealth and Banking
              </p>
            </div>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <div className="mb-6 space-y-2">
            <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
              Platform
            </p>
            <Link
              href="/"
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors",
                pathname === "/"
                  ? "bg-[color:var(--brand-red)] text-white shadow-soft"
                  : "text-[color:var(--ink)] hover:bg-[color:var(--panel-strong)]",
              )}
            >
              <DashboardIcon className="h-4 w-4" />
              Dashboard
            </Link>
          </div>

          <div className="mb-6 space-y-2">
            <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
              Priority Routes
            </p>
            {sidebarPrimary.map((slug) => {
              const feature = featureMap[slug];
              const FeatureIcon = feature.icon;
              const active = pathname === feature.href;
              return (
                <Link
                  key={slug}
                  href={feature.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-[color:var(--panel-strong)] text-[color:var(--brand-red)]"
                      : "text-[color:var(--ink)] hover:bg-[color:var(--panel-strong)]",
                  )}
                >
                  <FeatureIcon className="h-4 w-4" />
                  <span>{feature.title}</span>
                </Link>
              );
            })}
          </div>

          <div className="space-y-4">
            {navigationSections.map((section) => (
              <details key={section.id} open className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--panel)] p-3">
                <summary className="cursor-pointer list-none px-2 py-1">
                  <p className="text-sm font-semibold text-[color:var(--ink)]">
                    {section.label}
                  </p>
                  <p className="mt-1 text-xs text-[color:var(--muted)]">
                    {section.description}
                  </p>
                </summary>
                <div className="mt-3 space-y-3">
                  {section.columns.map((column) => (
                    <div key={column.heading}>
                      <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                        {column.heading}
                      </p>
                      <div className="mt-1 space-y-1">
                        {column.items.map((slug) => {
                          const feature = featureMap[slug];
                          const active = pathname === feature.href;

                          return (
                            <Link
                              key={slug}
                              href={feature.href}
                              className={cn(
                                "block rounded-2xl px-2 py-2 text-sm transition-colors",
                                active
                                  ? "bg-white text-[color:var(--brand-red)]"
                                  : "text-[color:var(--ink-soft)] hover:bg-white hover:text-[color:var(--ink)]",
                              )}
                            >
                              {feature.title}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
