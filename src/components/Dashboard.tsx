import React, { useState } from "react";
import { WorkoutSession, TargetMuscle, EloProfile, GymRank } from "../types";
import { getMuscleVolumeStats, getProgressionRecommendation } from "../utils";
import { EXERCISE_DATABASE } from "../data";
import { Dumbbell, Flame, Brain, TrendingUp, HelpCircle, Trophy, Sparkles, ChevronRight, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";

interface DashboardProps {
  sessions: WorkoutSession[];
  userElo: EloProfile;
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ sessions, userElo, onNavigate }: DashboardProps) {
  const muscleStats = getMuscleVolumeStats(sessions);
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);

  // Get active progression engine recommendations for core exercises
  const recommendedExercises = ["ex-bench-press", "ex-hack-squat", "ex-lat-pulldown"];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero OS Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                  <Brain className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-sans tracking-tight text-white">ScienceLifter</h2>
                  <p className="text-xs text-neutral-400 font-mono">SEASONAL CYCLE: {userElo.seasonName}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-mono font-bold rounded-full border border-amber-500/20 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" />
                {userElo.rank}
              </span>
            </div>

            <p className="text-sm text-neutral-300 leading-relaxed mb-6 max-w-xl">
              Your lifting is measured against empirical physiology targets. The **ELO System** evaluates intensity, progress rate, consistency, and tracking mechanics. No gym-bro guessing, just pure progressive overload.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-neutral-800">
            <div className="text-center sm:text-left">
              <span className="text-xs text-neutral-500 font-mono block">LIFETIME ELO</span>
              <span className="text-3xl font-extrabold text-white tracking-tight font-mono">{userElo.lifetimeElo}</span>
            </div>
            <div className="text-center sm:text-left">
              <span className="text-xs text-neutral-500 font-mono block">SEASONAL ELO</span>
              <span className="text-3xl font-extrabold text-cyan-400 tracking-tight font-mono">{userElo.seasonalElo}</span>
            </div>
            <div className="text-center sm:text-left">
              <span className="text-xs text-neutral-500 font-mono block">MED CYCLE WEEK</span>
              <span className="text-3xl font-extrabold text-white tracking-tight font-mono">{userElo.weekOfSeason} / 12</span>
            </div>
            <div className="text-center sm:text-left">
              <span className="text-xs text-neutral-500 font-mono block">ACTIVE STREAK</span>
              <span className="text-3xl font-extrabold text-amber-400 tracking-tight font-mono flex items-center justify-center sm:justify-start gap-1">
                30<Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
              </span>
            </div>
          </div>
        </div>

        {/* ELO Components Radar Bar Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold tracking-wider font-mono text-neutral-300 uppercase mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              ELO Biometrics Metrics
            </h3>
            
            <div className="space-y-4">
              {/* Strength */}
              <div 
                className="group cursor-help"
                onMouseEnter={() => setHoveredComponent("strength")}
                onMouseLeave={() => setHoveredComponent(null)}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-neutral-300 font-medium">Strength index (30%)</span>
                  <span className="text-white font-mono font-bold">{userElo.components.strength}/100</span>
                </div>
                <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-500 rounded-full transition-all duration-500" 
                    style={{ width: `${userElo.components.strength}%` }}
                  />
                </div>
              </div>

              {/* Progress */}
              <div 
                className="group cursor-help"
                onMouseEnter={() => setHoveredComponent("progress")}
                onMouseLeave={() => setHoveredComponent(null)}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-neutral-300 font-medium">Overload Rate (30%)</span>
                  <span className="text-white font-mono font-bold">{userElo.components.progress}/100</span>
                </div>
                <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                    style={{ width: `${userElo.components.progress}%` }}
                  />
                </div>
              </div>

              {/* Consistency */}
              <div 
                className="group cursor-help"
                onMouseEnter={() => setHoveredComponent("consistency")}
                onMouseLeave={() => setHoveredComponent(null)}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-neutral-300 font-medium">Session Consistency (20%)</span>
                  <span className="text-white font-mono font-bold">{userElo.components.consistency}/100</span>
                </div>
                <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                    style={{ width: `${userElo.components.consistency}%` }}
                  />
                </div>
              </div>

              {/* Science score */}
              <div 
                className="group cursor-help"
                onMouseEnter={() => setHoveredComponent("science")}
                onMouseLeave={() => setHoveredComponent(null)}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-neutral-300 font-medium">Tracking Science Score (20%)</span>
                  <span className="text-white font-mono font-bold">{userElo.components.scienceScore}/100</span>
                </div>
                <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                    style={{ width: `${userElo.components.scienceScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-neutral-950 rounded-xl text-xs text-neutral-400 font-sans border border-neutral-800 min-h-[56px] flex items-center">
            {hoveredComponent === "strength" && "Based on your Estimated 1 Rep Max normalized by your bodyweight. Keep chasing progressive overload."}
            {hoveredComponent === "progress" && "Measures how consistently your estimated 1RM is climbing. Encourages micro-loads vs static lifts."}
            {hoveredComponent === "consistency" && "Percent of scheduled sessions fully logged. Essential for neural adaptation and hypertrophy consistency."}
            {hoveredComponent === "science" && "Calculates RIR precision, strict utilization of rest-time counters, and staying in target weekly muscle sets range."}
            {!hoveredComponent && "Hover over any metric index to explore its scientific purpose and factors."}
          </div>
        </div>
      </div>

      {/* Progression Engine */}
      <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded-md bg-cyan-500/10 border border-cyan-500/20">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight">Active Mechanical Overload Coach</h3>
            </div>
            <p className="text-xs text-neutral-400 font-sans">
              Dynamic double-progression outputs calculated automatically using your historical training sets.
            </p>
          </div>
          <button 
            onClick={() => onNavigate("logger")}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-neutral-900 font-bold text-xs font-sans rounded-xl transition-all shadow-md flex items-center gap-1.5 self-start"
          >
            Open Live Logger <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendedExercises.map((exId) => {
            const rec = getProgressionRecommendation(exId, sessions);
            const exerciseDef = EXERCISE_DATABASE.find((e) => e.id === exId);
            return (
              <div 
                key={exId} 
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  rec.type === "increase_weight" 
                    ? "bg-cyan-500/5 border-cyan-500/30" 
                    : rec.type === "deload" 
                    ? "bg-rose-500/5 border-rose-500/30" 
                    : "bg-neutral-950 border-neutral-800"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="text-xs font-bold text-neutral-300 tracking-tight truncate max-w-[150px]">
                      {exerciseDef?.name}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                      rec.type === "increase_weight"
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                        : rec.type === "deload"
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        : "bg-neutral-800 text-neutral-400"
                    }`}>
                      {rec.type.replace("_", " ")}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-neutral-200 mb-2">{rec.title}</p>
                  <p className="text-[11px] text-neutral-400 leading-relaxed mb-4">{rec.explanation}</p>
                </div>

                <div className="pt-3 border-t border-neutral-800/60 mt-auto">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-500">PREV INTENSITY:</span>
                    <span className="text-neutral-300">{rec.originalWeight > 0 ? `${rec.originalWeight}kg x ${rec.originalReps}` : "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono mt-1">
                    <span className="text-neutral-500">NEXT TARGET:</span>
                    <span className="text-cyan-400 font-bold">
                      {rec.targetWeight > 0 ? `${rec.targetWeight}kg` : "Establish"} x {rec.targetRepsRange}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Muscle Volume Targets */}
      <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-1 rounded-md bg-amber-500/10 border border-amber-500/20">
            <Dumbbell className="w-4 h-4 text-amber-500" />
          </span>
          <h3 className="text-lg font-bold text-white tracking-tight">Active Weekly Muscle Growth Radar</h3>
        </div>
        <p className="text-xs text-neutral-400 font-sans mb-6">
          Shows aggregate weekly set counts. Compounded primary exercises count fully (`1.0`), secondary compound helpers receive a `0.5` biological credit, ensuring scientifically balanced fatigue management.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {muscleStats.map((stat) => {
            const percentage = Math.min(100, (stat.effectiveSets / stat.targetRange.max) * 100);
            return (
              <div key={stat.muscle} className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-neutral-200">{stat.muscle}</span>
                    <span className={`text-[10px] font-mono font-bold uppercase ${
                      stat.status === "Optimal" 
                        ? "text-emerald-400" 
                        : stat.status === "Overreaching" 
                        ? "text-rose-400" 
                        : "text-amber-500"
                    }`}>
                      {stat.status}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5 mb-3">
                    <span className="text-2xl font-extrabold text-white font-mono">{stat.effectiveSets}</span>
                    <span className="text-xs text-neutral-500 font-mono">/ {stat.targetRange.min}-{stat.targetRange.max} sets</span>
                  </div>
                </div>

                <div className="space-y-1.5 mt-auto">
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        stat.status === "Optimal" 
                          ? "bg-emerald-500" 
                          : stat.status === "Overreaching" 
                          ? "bg-rose-500" 
                          : "bg-amber-500"
                      }`} 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-neutral-500 font-mono">
                    <span>{stat.targetRange.min} Min</span>
                    <span>{stat.targetRange.max} Max</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Philosophy Anchor Box */}
      <div className="bg-neutral-950 border border-neutral-800/60 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 flex-shrink-0 border border-indigo-500/20">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-bold text-neutral-200 font-mono uppercase tracking-wider">Coach Keenan's Biomechanics Recall</h4>
          <p className="text-xs text-neutral-400 leading-relaxed mt-0.5">
            "Your body doesn't count sets; it responds to mechanical tension. Ten lazy sets at 5 RIR will yield exactly zero growth. Focus exclusively on the deep stretch, control the eccentric path, and take your working sets down to a true, audited 1-2 Reps In Reserve."
          </p>
        </div>
      </div>
    </div>
  );
}
