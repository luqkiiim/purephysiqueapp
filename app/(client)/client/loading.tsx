function LoadingBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-3xl bg-slate-200/70 ${className}`} />;
}

export default function ClientLoading() {
  return (
    <div className="page-shell space-y-5 pb-32 sm:pb-28">
      <header className="surface-card overflow-hidden p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <LoadingBlock className="h-3 w-28 rounded-full" />
              <LoadingBlock className="h-8 w-28 rounded-full" />
            </div>
            <LoadingBlock className="h-10 w-48 max-w-full" />
          </div>
          <div className="grid gap-2 sm:justify-items-end">
            <LoadingBlock className="h-10 w-28 rounded-full" />
          </div>
        </div>
      </header>

      <section className="surface-card p-5 sm:p-6">
        <LoadingBlock className="h-8 w-64" />
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <LoadingBlock className="h-24 w-full" />
          <LoadingBlock className="h-24 w-full" />
          <LoadingBlock className="h-24 w-full" />
        </div>
      </section>

      <section className="surface-card p-5 sm:p-6">
        <LoadingBlock className="h-6 w-40" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: 5 }, (_, index) => (
            <LoadingBlock key={index} className="h-14 w-full" />
          ))}
        </div>
      </section>

      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-xl border-t border-white/10 bg-[rgba(10,10,10,0.94)] px-3 pb-[calc(env(safe-area-inset-bottom,0)+0.75rem)] pt-2 shadow-[0_-8px_24px_rgba(0,0,0,0.35)] backdrop-blur sm:rounded-t-4xl sm:border-x">
        <div className="flex gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-5 sm:overflow-visible sm:pb-0">
          {Array.from({ length: 5 }, (_, index) => (
            <LoadingBlock key={index} className="h-14 w-[4.75rem] rounded-[1.15rem] sm:w-full" />
          ))}
        </div>
      </nav>
    </div>
  );
}
