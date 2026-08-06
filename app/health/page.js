// Health-check page. Fetches from a public API for now — swap for a real
// backend ping once the DB/API decision is made.
async function getStatus() {
  try {
    const res = await fetch("https://api.github.com/zen", { cache: "no-store" });
    if (!res.ok) throw new Error(`Upstream returned ${res.status}`);
    const text = await res.text();
    return { ok: true, message: text, checkedAt: new Date().toISOString() };
  } catch (err) {
    return { ok: false, message: err.message, checkedAt: new Date().toISOString() };
  }
}

export default async function HealthPage() {
  const status = await getStatus();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <p className="text-xs uppercase tracking-wide text-muted">
        System
      </p>
      <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-ink">
        Health Check
      </h1>

      <div className="mt-8 border border-line p-6">
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              status.ok ? "bg-green-600" : "bg-red-600"
            }`}
          />
          <span className="font-medium text-ink">
            {status.ok ? "Healthy" : "Unhealthy"}
          </span>
        </div>
        <p className="mt-4 text-sm text-muted">
          Fetched: {status.message}
        </p>
        <p className="mt-2 text-xs text-muted">
          Checked at {status.checkedAt}
        </p>
      </div>
    </div>
  );
}
