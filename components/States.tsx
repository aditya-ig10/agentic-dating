// Shared loading / error / empty states, lab-styled.
export function Loading({ label = "Setting the room…" }: { label?: string }) {
  return (
    <div className="mx-auto max-w-3xl py-12" aria-live="polite" aria-busy="true">
      <div className="animate-pulse space-y-3" aria-hidden>
        <div className="h-8 w-1/3 -rotate-1 bg-hot/60" />
        <div className="h-4 w-full bg-bone/20" />
        <div className="h-4 w-5/6 rotate-[0.5deg] bg-bone/20" />
        <div className="h-4 w-2/3 -rotate-[0.5deg] bg-bone/20" />
      </div>
      <p className="font-display mt-4 text-sm uppercase tracking-wider text-gold">{label}</p>
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
      <div className="pop border-2 border-ink bg-tang p-6 text-bone">
        <h2 className="font-display text-xl uppercase">The night hit a snag</h2>
        <p className="mt-1 font-medium">{message}</p>
        {retry && (
          <button
            onClick={retry}
            className="font-display mt-4 border-2 border-bone bg-ink px-4 py-2 text-sm uppercase text-bone hover:bg-ink2"
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
      <h2 className="font-display text-2xl uppercase">{title}</h2>
      <p className="mt-1 text-bone/70">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
