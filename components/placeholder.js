// Shared placeholder shell for Phase 1 scaffolding.
// Every route renders through this until its real screen gets built.
export default function Placeholder({ heading, body, cta }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <p className="text-xs uppercase tracking-wide text-muted">
        Placeholder
      </p>
      <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-ink">
        {heading}
      </h1>
      {body ? (
        <p className="mt-4 text-muted">{body}</p>
      ) : null}
      {cta ? (
        <button
          type="button"
          className="group relative mt-8 border border-ink px-5 py-2.5 text-sm font-medium text-ink overflow-hidden transition-all duration-300 block cursor-pointer"
        >
          <span className="absolute inset-0 bg-ink translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] z-0" />
          <span className="relative z-10 text-ink group-hover:text-paper transition-colors duration-300">
            {cta}
          </span>
        </button>
      ) : null}
    </div>
  );
}
