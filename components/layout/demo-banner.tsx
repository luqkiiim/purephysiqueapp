import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function DemoBanner({ enabled }: { enabled: boolean }) {
  if (!enabled) {
    return null;
  }

  return (
    <div className="surface-muted flex items-center gap-3 px-4 py-3">
      <Sparkles className="h-4 w-4 text-accent-coral" />
      <p className="text-sm text-slate-700">
        Demo mode is active because Supabase auth or admin access is not configured yet.
      </p>
      <Badge tone="accent">Preview data</Badge>
    </div>
  );
}
