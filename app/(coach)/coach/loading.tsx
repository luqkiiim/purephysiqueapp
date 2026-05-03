import { CoachMobileNavigation } from "@/components/layout/coach-mobile-tabs";

function LoadingBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-3xl bg-slate-200/70 ${className}`} />;
}

export default function CoachLoading() {
  return (
    <CoachMobileNavigation>
      <header className="surface-card overflow-hidden p-4 sm:p-6">
        <div className="flex flex-col gap-5">
          <div className="space-y-3">
            <LoadingBlock className="h-3 w-28 rounded-full" />
            <div className="space-y-3">
              <LoadingBlock className="h-9 w-56" />
              <LoadingBlock className="h-4 w-full max-w-2xl" />
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="hidden grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-center">
              <LoadingBlock className="h-10 w-24 rounded-full" />
              <LoadingBlock className="h-10 w-24 rounded-full" />
              <LoadingBlock className="h-10 w-24 rounded-full" />
            </div>
            <div className="grid gap-2 sm:flex sm:flex-wrap sm:justify-end">
              <LoadingBlock className="h-10 w-full rounded-full sm:w-24" />
              <LoadingBlock className="h-10 w-full rounded-full sm:w-24" />
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="surface-card p-6">
            <LoadingBlock className="h-4 w-28" />
            <LoadingBlock className="mt-5 h-10 w-20" />
            <LoadingBlock className="mt-4 h-4 w-32" />
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="surface-card p-6 sm:p-8">
          <LoadingBlock className="h-6 w-40" />
          <LoadingBlock className="mt-3 h-4 w-80 max-w-full" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 4 }, (_, index) => (
              <LoadingBlock key={index} className="h-16 w-full" />
            ))}
          </div>
        </div>
        <div className="surface-card p-6 sm:p-8">
          <LoadingBlock className="h-6 w-36" />
          <LoadingBlock className="mt-3 h-4 w-64 max-w-full" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 3 }, (_, index) => (
              <LoadingBlock key={index} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </section>
    </CoachMobileNavigation>
  );
}
