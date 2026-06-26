import { Activity, BookOpen, Dumbbell, LayoutGrid, LucideIcon, Trophy } from "lucide-react";

export type AppTab = "dashboard" | "logger" | "leaderboards" | "insights" | "feed";

const NAV_ITEMS: Array<{ id: AppTab; label: string; Icon: LucideIcon }> = [
  { id: "dashboard", label: "Home", Icon: LayoutGrid },
  { id: "logger", label: "Log", Icon: Dumbbell },
  { id: "leaderboards", label: "Ranks", Icon: Trophy },
  { id: "insights", label: "Insights", Icon: Activity },
  { id: "feed", label: "Feed", Icon: BookOpen },
];

interface BottomTabBarProps {
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
}

export function BottomTabBar({ activeTab, onChange }: BottomTabBarProps) {
  return (
    <nav className="flex-shrink-0 border-t border-neutral-800/70 bg-neutral-950/95 px-2 pb-6 pt-2.5 backdrop-blur">
      <div className="flex items-center justify-around">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="flex min-w-[58px] flex-col items-center gap-1 rounded-xl px-2 py-1.5 transition-all active:scale-95"
              aria-current={active ? "page" : undefined}
            >
              <Icon
                className={`h-5 w-5 transition-colors ${active ? "text-violet-400" : "text-neutral-500"}`}
                strokeWidth={active ? 2.4 : 2}
              />
              <span className={`text-[10px] font-semibold ${active ? "text-violet-400" : "text-neutral-600"}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
