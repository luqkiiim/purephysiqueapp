function LoadingBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-3xl bg-slate-200/70 ${className}`} />;
}

export default function ClientLoading() {
  return (
    <div className="page-shell pb-28 space-y-5">
      <header className="surface-card overflow-hidden p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <LoadingBlock className="h-3 w-28 rounded-full" />
            <LoadingBlock className="h-10 w-48" />
          </div>
          <div className="flex flex-col items-end gap-3">
            <LoadingBlock className="h-8 w-24 rounded-full" />
            <LoadingBlock className="h-8 w-28 rounded-full" />
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

      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-xl border-t border-white/10 bg-[rgba(10,10,10,0.94)] px-3 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.35)] backdrop-blur sm:rounded-t-4xl sm:border-x">
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 5 }, (_, index) => (
            <LoadingBlock key={index} className="h-12 w-full rounded-2xl" />
          ))}
        </div>
      </nav>
    </div>
  );
}
