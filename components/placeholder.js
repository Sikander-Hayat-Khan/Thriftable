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
          className="mt-8 border border-ink px-5 py-2.5 text-sm font-medium text-ink hover:bg-ink hover:text-paper transition-colors"
        >
          {cta}
        </button>
      ) : null}
    </div>
  );
}
