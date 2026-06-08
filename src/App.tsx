import React, { useState, useEffect } from "react";
import { WorkoutSession, EloProfile, GymRank } from "./types";
import { INITIAL_ELO_PROFILE, INITIAL_WORKOUT_HISTORY } from "./data";
import Dashboard from "./components/Dashboard";
import WorkoutLogger from "./components/WorkoutLogger";
import ScienceFeed from "./components/ScienceFeed";
import AICoach from "./components/AICoach";
import Leaderboards from "./components/Leaderboards";
import { Brain, Dumbbell, BookOpen, Trophy, Sparkles, LayoutDashboard, Flame } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [userElo, setUserElo] = useState<EloProfile>(INITIAL_ELO_PROFILE);
  const [coachInitialQuestion, setCoachInitialQuestion] = useState<string>("");

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

  // Save new session and dynamically recalculate ELO scores base on physical output
  const handleSaveSession = (newSession: WorkoutSession) => {
    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);
    localStorage.setItem("science_lift_sessions", JSON.stringify(updatedSessions));

    // Aggregate set performance to recalculate muscle score indicators
    const completedSetsCount = newSession.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    
    const averageStimulus = newSession.exercises.reduce((sumEx, ex) => {
      const avgSetStimulus = ex.sets.reduce((sumS, s) => sumS + (s.stimulusScore || 8), 0) / (ex.sets.length || 1);
      return sumEx + avgSetStimulus;
    }, 0) / (newSession.exercises.length || 1);

    // ELO Progression multipliers
    const strengthIncrement = Math.round(completedSetsCount * 0.4);
    const progressIncrement = 4;
    const consistencyIncrement = 5;
    const scienceIncrement = Math.round(averageStimulus * 1.8);

    const totalIncrement = Math.round((strengthIncrement + progressIncrement + consistencyIncrement + scienceIncrement) / 3);

    const updatedElo: EloProfile = {
      ...userElo,
      lifetimeElo: userElo.lifetimeElo + totalIncrement,
      seasonalElo: userElo.seasonalElo + Math.round(totalIncrement * 1.2),
      components: {
        strength: Math.min(100, userElo.components.strength + Math.round(strengthIncrement / 1.5)),
        progress: Math.min(100, userElo.components.progress + Math.round(progressIncrement)),
        consistency: Math.min(100, userElo.components.consistency + Math.round(consistencyIncrement)),
        scienceScore: Math.min(100, userElo.components.scienceScore + Math.round(scienceIncrement / 2.5))
      }
    };

    // Calculate Gym Rank relative to new ELO threshold
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

  // Navigates to coach and pre-populates discussion on an article
  const handleDiscussArticle = (articleTitle: string) => {
    setCoachInitialQuestion(articleTitle);
    setActiveTab("coach");
  };

  const handleClearInitialQuestion = () => {
    setCoachInitialQuestion("");
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans flex flex-col md:flex-row">
      
      {/* Side Navigation Bar */}
      <aside className="w-full md:w-64 bg-neutral-900 border-b md:border-b-0 md:border-r border-neutral-800 flex flex-col justify-between p-6 flex-shrink-0">
        <div>
          {/* Brand Logo & Tag */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/25">
              <Dumbbell className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-[13px] font-extrabold tracking-tight uppercase text-white font-mono">Biotech Lift OS</h1>
              <span className="text-[10px] text-neutral-400 font-sans block mt-0.5">Evidence-Based Gym OS</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                activeTab === "dashboard"
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Progress Dashboard
            </button>
            <button
              onClick={() => setActiveTab("logger")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                activeTab === "logger"
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850"
              }`}
            >
              <Dumbbell className="w-4 h-4" />
              Workout Live Logger
            </button>
            <button
              onClick={() => setActiveTab("feed")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                activeTab === "feed"
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Lifting Physiology Feed
            </button>
            <button
              onClick={() => setActiveTab("coach")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                activeTab === "coach"
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850"
              }`}
            >
              <Brain className="w-4 h-4" />
              Dynamic Gym AI Coach
            </button>
            <button
              onClick={() => setActiveTab("leaderboards")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                activeTab === "leaderboards"
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850"
              }`}
            >
              <Trophy className="w-4 h-4" />
              Competitive Arenas
            </button>
          </nav>
        </div>

        {/* Small Bottom Profile */}
        <div className="mt-8 pt-6 border-t border-neutral-800/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-xs text-cyan-400 border border-cyan-500/20">
              SL
            </div>
            <div>
              <span className="text-[11px] font-bold text-white block">ScienceLifter</span>
              <span className="text-[9px] text-cyan-400 font-mono tracking-tight font-semibold uppercase flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5 text-cyan-400" /> ELO {userElo.lifetimeElo}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Panel Frame */}
      <main className="flex-1 bg-neutral-950 p-6 md:p-10 h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header Title Accent */}
          <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-md animate-ping" />
              <p className="text-[10px] font-mono uppercase text-neutral-500 tracking-wider">
                Active Client Environment
              </p>
            </div>
            <p className="text-[10px] font-mono uppercase text-neutral-500 tracking-wider flex items-center gap-1">
              30-DAY STREAK <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            </p>
          </div>

          {/* Render Active Page Tab */}
          {activeTab === "dashboard" && (
            <Dashboard 
              sessions={sessions} 
              userElo={userElo} 
              onNavigate={(tab) => setActiveTab(tab)} 
            />
          )}

          {activeTab === "logger" && (
            <WorkoutLogger 
              sessions={sessions} 
              onSaveSession={handleSaveSession} 
            />
          )}

          {activeTab === "feed" && (
            <ScienceFeed 
              onDiscussArticle={handleDiscussArticle} 
            />
          )}

          {activeTab === "coach" && (
            <AICoach 
              sessions={sessions} 
              userElo={userElo}
              initialQuestion={coachInitialQuestion}
              onClearInitialQuestion={handleClearInitialQuestion}
            />
          )}

          {activeTab === "leaderboards" && (
            <Leaderboards />
          )}
        </div>
      </main>

    </div>
  );
}
