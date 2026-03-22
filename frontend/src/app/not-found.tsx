import Link from "next/link";

export default function NotFound() {
  return (
    <div className="hero-panel rounded-[38px] border border-[color:var(--border)] p-10">
      <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[color:var(--brand-red)]">
        Not found
      </p>
      <h1 className="mt-3 text-4xl font-semibold text-[color:var(--ink)]">
        This journey does not exist in the navigation atlas.
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-8 text-[color:var(--ink-soft)]">
        Return to the dashboard to browse the full Aura-style banking and wealth
        menu structure.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-full bg-[color:var(--brand-red)] px-5 py-3 text-sm font-semibold text-white"
      >
        Go to dashboard
      </Link>
    </div>
  );
}
