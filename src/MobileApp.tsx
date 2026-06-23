import React, { useState, useEffect } from "react";
import { WorkoutSession, EloProfile, GymRank } from "./types";
import { INITIAL_ELO_PROFILE, INITIAL_WORKOUT_HISTORY } from "./data";
import Home from "./components/Home";
import WorkoutLogger from "./components/WorkoutLogger";
import ScienceFeed from "./components/ScienceFeed";
import Insights from "./components/Insights";
import Leaderboards from "./components/Leaderboards";
import { Activity, Dumbbell, BookOpen, Trophy, LayoutGrid, Signal, Wifi, BatteryFull } from "lucide-react";

const NAV_ITEMS = [
  { id: "dashboard", label: "Home", Icon: LayoutGrid },
  { id: "logger", label: "Log", Icon: Dumbbell },
  { id: "insights", label: "Insights", Icon: Activity },
  { id: "leaderboards", label: "Ranks", Icon: Trophy },
  { id: "feed", label: "Feed", Icon: BookOpen },
] as const;

export default function MobileApp() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [userElo, setUserElo] = useState<EloProfile>(INITIAL_ELO_PROFILE);
  const [clock, setClock] = useState<string>("9:41");

  // Live status-bar clock
  useEffect(() => {
    const update = () =>
      setClock(
        new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).replace(/\s?[AP]M/, "")
      );
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load from local storage
  useEffect(() => {
    const cachedSessions = localStorage.getItem("science_lift_sessions");
    const cachedElo = localStorage.getItem("science_lift_elo");

    if (cachedSessions) {
      setSessions(JSON.parse(cachedSessions));
    } else {
      setSessions(INITIAL_WORKOUT_HISTORY);
      localStorage.setItem("science_lift_sessions", JSON.stringify(INITIAL_WORKOUT_HISTORY));
    }

    if (cachedElo) {
      setUserElo(JSON.parse(cachedElo));
    } else {
      setUserElo(INITIAL_ELO_PROFILE);
      localStorage.setItem("science_lift_elo", JSON.stringify(INITIAL_ELO_PROFILE));
    }
  }, []);

  // Save new session and dynamically recalculate ELO scores based on physical output
  const handleSaveSession = (newSession: WorkoutSession) => {
    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);
    localStorage.setItem("science_lift_sessions", JSON.stringify(updatedSessions));

    const completedSetsCount = newSession.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);

    const averageStimulus =
      newSession.exercises.reduce((sumEx, ex) => {
        const avgSetStimulus =
          ex.sets.reduce((sumS, s) => sumS + (s.stimulusScore || 8), 0) / (ex.sets.length || 1);
        return sumEx + avgSetStimulus;
      }, 0) / (newSession.exercises.length || 1);

    const strengthIncrement = Math.round(completedSetsCount * 0.4);
    const progressIncrement = 4;
    const consistencyIncrement = 5;
    const scienceIncrement = Math.round(averageStimulus * 1.8);

    const totalIncrement = Math.round(
      (strengthIncrement + progressIncrement + consistencyIncrement + scienceIncrement) / 3
    );

    const updatedElo: EloProfile = {
      ...userElo,
      lifetimeElo: userElo.lifetimeElo + totalIncrement,
      seasonalElo: userElo.seasonalElo + Math.round(totalIncrement * 1.2),
      components: {
        strength: Math.min(100, userElo.components.strength + Math.round(strengthIncrement / 1.5)),
        progress: Math.min(100, userElo.components.progress + Math.round(progressIncrement)),
        consistency: Math.min(100, userElo.components.consistency + Math.round(consistencyIncrement)),
        scienceScore: Math.min(100, userElo.components.scienceScore + Math.round(scienceIncrement / 2.5)),
      },
    };

    const curLifetime = updatedElo.lifetimeElo;
    let finalRank = GymRank.INTERMEDIATE;
    if (curLifetime < 1000) finalRank = GymRank.NOVICE;
    else if (curLifetime >= 1000 && curLifetime < 1500) finalRank = GymRank.INTERMEDIATE;
    else if (curLifetime >= 1500 && curLifetime < 2000) finalRank = GymRank.ADVANCED;
    else if (curLifetime >= 2000 && curLifetime < 2500) finalRank = GymRank.ELITE;
    else finalRank = GymRank.MONSTER;

    updatedElo.rank = finalRank;

    setUserElo(updatedElo);
    localStorage.setItem("science_lift_elo", JSON.stringify(updatedElo));
  };

  return (
    <div className="min-h-screen bg-black flex justify-center font-sans text-white">
      <div className="relative w-full max-w-[430px] h-screen bg-neutral-950 flex flex-col overflow-hidden md:my-4 md:h-[calc(100vh-2rem)] md:rounded-[44px] md:border-[10px] md:border-neutral-900 md:shadow-2xl">

        {/* Status bar */}
        <div className="flex items-center justify-between px-7 pt-3 pb-1 flex-shrink-0">
          <span className="text-sm font-semibold tracking-tight">{clock}</span>
          <div className="flex items-center gap-1.5 text-white">
            <Signal className="w-4 h-4" />
            <Wifi className="w-4 h-4" />
            <BatteryFull className="w-5 h-5" />
          </div>
        </div>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === "dashboard" && (
            <Home sessions={sessions} userElo={userElo} onNavigate={(tab) => setActiveTab(tab)} />
          )}

          {activeTab === "logger" && (
            <div className="px-3 pb-8">
              <WorkoutLogger sessions={sessions} onSaveSession={handleSaveSession} />
            </div>
          )}

          {activeTab === "feed" && (
            <div className="px-3 pb-8">
              <ScienceFeed />
            </div>
          )}

          {activeTab === "insights" && (
            <div className="px-3 pb-8">
              <Insights sessions={sessions} userElo={userElo} />
            </div>
          )}

          {activeTab === "leaderboards" && (
            <div className="px-3 pb-8">
              <Leaderboards />
            </div>
          )}
        </main>

        {/* Bottom tab bar */}
        <nav className="flex-shrink-0 bg-neutral-900/95 backdrop-blur border-t border-neutral-800/70 px-2 pt-2.5 pb-6">
          <div className="flex items-center justify-around">
            {NAV_ITEMS.map(({ id, label, Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className="flex flex-col items-center gap-1 px-3 py-1 cursor-pointer active:scale-90 transition-transform"
                >
                  <Icon
                    className={`w-6 h-6 transition-colors ${active ? "text-violet-400" : "text-neutral-500"}`}
                    strokeWidth={active ? 2.4 : 2}
                  />
                  <span
                    className={`text-[10px] font-semibold transition-colors ${
                      active ? "text-violet-400" : "text-neutral-600"
                    }`}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
