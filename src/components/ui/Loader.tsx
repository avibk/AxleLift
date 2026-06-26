import { Loader2 } from "lucide-react";

export function Loader() {
  return (
    <div className="flex min-h-[240px] items-center justify-center text-neutral-500">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  );
}
