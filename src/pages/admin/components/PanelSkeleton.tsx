import { Loader2 } from "lucide-react";

export function PanelSkeleton() {
  return (
    <div className="flex flex-col gap-6 h-full w-full animate-pulse">
      <div className="space-y-2">
        <div className="h-4 w-24 bg-admin-surface2 rounded" />
        <div className="h-8 w-48 bg-admin-surface2 rounded" />
        <div className="h-4 w-64 bg-admin-surface2 rounded" />
      </div>
      
      <div className="flex gap-4">
        <div className="h-24 w-1/4 bg-admin-surface2 rounded-xl" />
        <div className="h-24 w-1/4 bg-admin-surface2 rounded-xl" />
        <div className="h-24 w-1/4 bg-admin-surface2 rounded-xl" />
        <div className="h-24 w-1/4 bg-admin-surface2 rounded-xl" />
      </div>

      <div className="flex-1 min-h-[400px] w-full bg-admin-surface2 rounded-xl flex items-center justify-center">
        <Loader2 className="animate-spin text-admin-muted w-8 h-8" />
      </div>
    </div>
  );
}
