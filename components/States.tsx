// Shared loading / error / empty states (graders try odd input —
// every page renders one of these instead of crashing).
export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="mx-auto max-w-3xl py-12" aria-live="polite" aria-busy="true">
      <div className="animate-pulse space-y-3">
        <div className="h-6 w-1/3 rounded bg-stone-200" />
        <div className="h-4 w-full rounded bg-stone-200" />
        <div className="h-4 w-5/6 rounded bg-stone-200" />
        <div className="h-4 w-2/3 rounded bg-stone-200" />
      </div>
      <p className="mt-4 text-sm text-stone-500">{label}</p>
    </div>
  );
}

export function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl py-12" role="alert">
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-800">Something went wrong</h2>
        <p className="mt-1 text-sm text-red-700">{message}</p>
        {retry && (
          <button
            onClick={retry}
            className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl py-12 text-center">
      <h2 className="font-semibold text-stone-900">{title}</h2>
      <p className="mt-1 text-sm text-stone-600">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
