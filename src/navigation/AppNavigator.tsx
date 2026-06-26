import { useEffect, useRef, useState } from "react";
import { BottomTabBar, AppTab } from "../components/features/BottomTabBar";
import { StatusBar } from "../components/features/StatusBar";
import { Loader } from "../components/ui/Loader";
import { useScrollReset } from "../hooks/useScrollReset";
import { useWorkoutSession } from "../hooks/useWorkoutSession";
import HomeScreen from "../screens/HomeScreen";
import InsightsScreen from "../screens/InsightsScreen";
import LeaderboardsScreen from "../screens/LeaderboardsScreen";
import ScienceFeedScreen from "../screens/ScienceFeedScreen";
import WorkoutLoggerScreen from "../screens/WorkoutLoggerScreen";

function useStatusClock() {
  const [clock, setClock] = useState("9:41");

  useEffect(() => {
    const update = () => {
      setClock(
        new Date()
          .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
          .replace(/\s?[AP]M/, "")
      );
    };

    update();
    const interval = window.setInterval(update, 30000);
    return () => window.clearInterval(interval);
  }, []);

  return clock;
}

export default function AppNavigator() {
  const [activeTab, setActiveTab] = useState<AppTab>("dashboard");
  const { sessions, userElo, saveSession, isReady } = useWorkoutSession();
  const clock = useStatusClock();
  const mainRef = useRef<HTMLElement>(null);
  useScrollReset(mainRef, [activeTab]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto flex h-screen w-full max-w-[430px] flex-col overflow-hidden bg-neutral-950 font-sans shadow-2xl md:my-4 md:h-[calc(100vh-2rem)] md:rounded-[36px] md:border md:border-neutral-800">
        <StatusBar clock={clock} />

        <main ref={mainRef} className="flex-1 overflow-y-auto px-3 pb-8">
          {!isReady ? (
            <Loader />
          ) : (
            <>
              {activeTab === "dashboard" && (
                <HomeScreen sessions={sessions} userElo={userElo} onNavigate={setActiveTab} />
              )}
              {activeTab === "logger" && <WorkoutLoggerScreen sessions={sessions} onSaveSession={saveSession} />}
              {activeTab === "feed" && <ScienceFeedScreen />}
              {activeTab === "insights" && <InsightsScreen sessions={sessions} userElo={userElo} />}
              {activeTab === "leaderboards" && <LeaderboardsScreen />}
            </>
          )}
        </main>

        <BottomTabBar activeTab={activeTab} onChange={setActiveTab} />
      </div>
    </div>
  );
}
