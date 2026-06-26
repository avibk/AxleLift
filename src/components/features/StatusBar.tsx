import { BatteryFull, Signal, Wifi } from "lucide-react";

interface StatusBarProps {
  clock: string;
}

export function StatusBar({ clock }: StatusBarProps) {
  return (
    <div className="flex flex-shrink-0 items-center justify-between px-7 pb-1 pt-3">
      <span className="text-sm font-semibold tracking-tight">{clock}</span>
      <div className="flex items-center gap-1.5 text-white">
        <Signal className="h-4 w-4" />
        <Wifi className="h-4 w-4" />
        <BatteryFull className="h-5 w-5" />
      </div>
    </div>
  );
}
