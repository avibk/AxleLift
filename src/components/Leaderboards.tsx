import React, { useState } from "react";
import { MOCK_LEADERBOARDS, CURATED_HALL_OF_FAME } from "../data";
import { GymRank } from "../types";
import { Trophy, ShieldAlert, Award, Calendar, Flame, Brain, Dumbbell, Sparkles, TrendingUp, Medal, Star } from "lucide-react";

export default function Leaderboards() {
  const [activeBoard, setActiveBoard] = useState<"bench" | "relative" | "progress" | "consistency" | "science">("bench");

  // Rank specifications for the user help block
  const RANK_TIERS = [
    { title: "Novice", eloRange: "0 - 1000", bg: "bg-neutral-800/40 text-neutral-400 border-neutral-700", symbol: "🥉" },
    { title: "Intermediate", eloRange: "1000 - 1500", bg: "bg-violet-500/10 text-violet-450 border-violet-500/20", symbol: "🥈" },
    { title: "Advanced", eloRange: "1500 - 2000", bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", symbol: "🥇" },
    { title: "Elite", eloRange: "2000 - 2500", bg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20", symbol: "💎" },
    { title: "Evidence-Based Monster", eloRange: "2500+", bg: "bg-amber-500/10 text-amber-400 border-amber-500/20", symbol: "👑" }
  ];

  const getSubTitleText = () => {
    switch (activeBoard) {
      case "bench": return "Standard absolute bench press max logged inside active mesocycles.";
      case "relative": return "Bench press max load divided by total bodyweight. Promotes general athleticism.";
      case "progress": return "Highest rate of estimated 1RM development in the last 90 days. Levels the playing field for beginners.";
      case "consistency": return "Attendance rate and scheduled logs compliance based on 24 targeted seasonal workouts.";
      case "science": return "Awarded for perfect logging practices, RIR accuracy (0-3), and completing target weekly volume goals.";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Upper season and rank info */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Active Season Banner */}
        <div className="lg:col-span-3 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500/2 rounded-full blur-3xl" />
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1 rounded-md bg-violet-500/10 border border-violet-500/20 text-violet-400">
                <Calendar className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold font-mono tracking-wider text-neutral-300 uppercase">Mesocycle Competition Profile</h3>
            </div>

            <h2 className="text-2xl font-extrabold text-white tracking-tight">Season 1: Chest Specialization</h2>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-xl mt-2 font-sans">
              All seasonal ELO ratings reset at the start of each 12-week mesocycle to foster fresh goals and competition. Current week: **Week 5 of 12**. Your performance on chest compound lifts yields a 1.2x ELO progress booster!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-neutral-800/80">
            <span className="text-[10px] text-neutral-500 font-mono uppercase">Seasonal Badges:</span>
            <span className="px-2 py-1 bg-violet-500/5 text-violet-400 text-[10px] font-mono font-bold rounded-lg border border-violet-500/20 flex items-center gap-1">
              🏆 Top 1% Bench
            </span>
            <span className="px-2 py-1 bg-emerald-500/5 text-emerald-400 text-[10px] font-mono font-bold rounded-lg border border-emerald-500/20 flex items-center gap-1">
              🧠 Science Master
            </span>
            <span className="px-2 py-1 bg-amber-500/5 text-amber-500 text-[10px] font-mono font-bold rounded-lg border border-amber-500/20 flex items-center gap-1">
              🔥 30-Day Streak
            </span>
          </div>
        </div>

        {/* ELO Rank Calibration */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold font-mono text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-violet-400" />
            Rank Calibration
          </h3>
          <div className="space-y-2">
            {RANK_TIERS.map((tier) => (
              <div key={tier.title} className={`flex items-center justify-between p-2 rounded-xl border text-[10px] ${tier.bg}`}>
                <span className="font-bold flex items-center gap-1">
                  <span>{tier.symbol}</span>
                  {tier.title}
                </span>
                <span className="font-mono">{tier.eloRange} Elo</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main leaderboards view */}
      <div className="space-y-4">
        {/* Board selector pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-3 px-3 no-scrollbar">
          {[
            { id: "bench", label: "Bench", Icon: Dumbbell },
            { id: "relative", label: "Relative", Icon: Award },
            { id: "progress", label: "Improved", Icon: TrendingUp },
            { id: "consistency", label: "Attendance", Icon: Flame },
            { id: "science", label: "Science", Icon: Brain },
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveBoard(id as typeof activeBoard)}
              className={`flex-shrink-0 whitespace-nowrap px-3.5 py-2 rounded-full border text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 ${
                activeBoard === id
                  ? "bg-violet-500/10 text-violet-400 border-violet-500/30"
                  : "bg-neutral-900 border-neutral-800 text-neutral-400"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Board Display Panel */}
        <div className="space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <h3 className="text-md font-bold text-white tracking-tight capitalize border-b border-neutral-850 pb-3 mb-2">
              {activeBoard} Leaderboard rankings
            </h3>
            <p className="text-xs text-neutral-400 leading-normal mb-6">
              {getSubTitleText()}
            </p>

            {/* Table layout */}
            <div className="space-y-2">
              {MOCK_LEADERBOARDS[activeBoard].map((item, idx) => {
                const isSelf = item.id === "user-self";
                return (
                  <div 
                    key={item.id} 
                    className={`flex items-center justify-between p-4 rounded-xl border ${
                      isSelf 
                        ? "bg-violet-500/10 border-violet-500/35 relative overflow-hidden" 
                        : "bg-neutral-950 border-neutral-850"
                    }`}
                  >
                    {isSelf && <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-400" />}

                    <div className="flex items-center gap-4">
                      {/* Medals */}
                      <span className="w-6 text-center font-mono font-bold text-neutral-400 text-xs">
                        {idx === 0 && <Medal className="w-5 h-5 text-amber-400 mx-auto" />}
                        {idx === 1 && <Medal className="w-5 h-5 text-neutral-400 mx-auto" />}
                        {idx === 2 && <Medal className="w-5 h-5 text-amber-700 mx-auto" />}
                        {idx >= 3 && `${idx + 1}`}
                      </span>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${isSelf ? "text-violet-400" : "text-white"}`}>
                            {item.username}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-neutral-900 text-neutral-500 border border-neutral-800 font-mono uppercase">
                            {item.rankName}
                          </span>
                        </div>

                        {item.badges.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {item.badges.map((b) => (
                              <span key={b} className="text-[8px] bg-neutral-900 px-1 py-0.2 rounded text-neutral-400 font-sans border border-neutral-800/60 font-medium">
                                {b}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold text-white uppercase tracking-tight">
                      {item.metaValue}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Hall of Fame section */}
      <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
        <h3 className="text-md font-bold text-white tracking-tight flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-amber-500" />
          General Hall of Fame Registers
        </h3>
        
        <div className="space-y-3">
          {CURATED_HALL_OF_FAME.map((fame) => (
            <div key={fame.season} className="bg-neutral-950 border border-neutral-855 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 text-center sm:text-left">
              <div>
                <span className="text-[9px] font-mono text-neutral-500 block uppercase">HISTORIC Meso SEASON</span>
                <span className="text-xs font-extrabold text-white">{fame.season}</span>
              </div>
              <div>
                <span className="text-[9px] font-mono text-neutral-500 block uppercase">BENCH OVERLOAD CHAMP</span>
                <span className="text-xs font-semibold text-neutral-300">👑 {fame.benchChamp}</span>
              </div>
              <div>
                <span className="text-[9px] font-mono text-neutral-500 block uppercase">LIFTING SCIENCE CHAMP</span>
                <span className="text-xs font-semibold text-neutral-300">🧠 {fame.scienceChamp}</span>
              </div>
              <div>
                <span className="text-[9px] font-mono text-neutral-500 block uppercase">CONSISTENCY CHAMP</span>
                <span className="text-xs font-semibold text-neutral-300">🔥 {fame.consistencyChamp}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
