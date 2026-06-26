import React from "react";
import { CURATED_HALL_OF_FAME } from "../utils/mockData";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { Trophy, Award, Calendar, Flame, Brain, Dumbbell, TrendingUp, Medal, Star } from "lucide-react";

export default function LeaderboardsScreen() {
  const { activeBoard, setActiveBoard, entries } = useLeaderboard("bench");

  // Rank specifications for the user help block
  const RANK_TIERS = [
    { title: "Novice", eloRange: "0 - 1000", bg: "bg-neutral-800/40 text-neutral-400 border-neutral-700" },
    { title: "Intermediate", eloRange: "1000 - 1500", bg: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
    { title: "Advanced", eloRange: "1500 - 2000", bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    { title: "Elite", eloRange: "2000 - 2500", bg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
    { title: "Evidence-Based Monster", eloRange: "2500+", bg: "bg-amber-500/10 text-amber-400 border-amber-500/20" }
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
    <div className="space-y-5 animate-fade-in">
      {/* Upper season and rank info */}
      <div className="space-y-3">
        {/* Active Season Banner */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 p-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1 rounded-md bg-violet-500/10 border border-violet-500/20 text-violet-400">
                <Calendar className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold font-mono tracking-wider text-neutral-300 uppercase">Mesocycle Competition Profile</h3>
            </div>

            <h2 className="text-2xl font-extrabold text-white tracking-tight">Season 1: Chest Specialization</h2>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-xl mt-2 font-sans">
              All seasonal ELO ratings reset at the start of each 12-week mesocycle to foster fresh goals and competition. Current week: Week 5 of 12. Your performance on chest compound lifts yields a 1.2x ELO progress booster.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-neutral-800/80">
            <span className="text-[10px] text-neutral-500 font-mono uppercase">Seasonal Badges:</span>
            <span className="px-2 py-1 bg-violet-500/5 text-violet-400 text-[10px] font-mono font-bold rounded-lg border border-violet-500/20 flex items-center gap-1">
              Top 1% Bench
            </span>
            <span className="px-2 py-1 bg-emerald-500/5 text-emerald-400 text-[10px] font-mono font-bold rounded-lg border border-emerald-500/20 flex items-center gap-1">
              Science Master
            </span>
            <span className="px-2 py-1 bg-amber-500/5 text-amber-500 text-[10px] font-mono font-bold rounded-lg border border-amber-500/20 flex items-center gap-1">
              30-Day Streak
            </span>
          </div>
        </div>

        {/* ELO Rank Calibration */}
        <div className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-900 p-5">
          <h3 className="text-xs font-bold font-mono text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-violet-400" />
            Rank Calibration
          </h3>
          <div className="space-y-2">
            {RANK_TIERS.map((tier) => (
              <div key={tier.title} className={`flex items-center justify-between rounded-lg border p-2 text-[10px] ${tier.bg}`}>
                <span className="font-bold">
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
              className={`flex-shrink-0 whitespace-nowrap rounded-lg border px-3.5 py-2 text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 ${
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
          <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5">
            <h3 className="border-b border-neutral-800 pb-3 mb-2 text-base font-bold capitalize tracking-tight text-white">
              {activeBoard} Leaderboard rankings
            </h3>
            <p className="text-xs text-neutral-400 leading-normal mb-6">
              {getSubTitleText()}
            </p>

            {/* Table layout */}
            <div className="space-y-2">
              {entries.map((item, idx) => {
                const isSelf = item.id === "user-self";
                return (
                  <div 
                    key={item.id} 
                    className={`flex items-center justify-between rounded-lg border p-4 ${
                      isSelf 
                        ? "bg-violet-500/10 border-violet-500/35 relative overflow-hidden" 
                        : "bg-neutral-950 border-neutral-800"
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
                          <span className="rounded border border-neutral-800 bg-neutral-900 px-1.5 py-0.5 text-[9px] font-mono uppercase text-neutral-500">
                            {item.rankName}
                          </span>
                        </div>

                        {item.badges.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {item.badges.map((b) => (
                              <span key={b} className="rounded border border-neutral-800/60 bg-neutral-900 px-1 py-0.5 text-[8px] font-medium text-neutral-400">
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
      <section className="rounded-lg border border-neutral-800 bg-neutral-900 p-5">
        <h3 className="mb-4 flex items-center gap-2 text-base font-bold tracking-tight text-white">
          <Star className="w-5 h-5 text-amber-500" />
          General Hall of Fame Registers
        </h3>
        
        <div className="space-y-3">
          {CURATED_HALL_OF_FAME.map((fame) => (
            <div key={fame.season} className="grid grid-cols-1 gap-4 rounded-lg border border-neutral-800 bg-neutral-950 p-4 text-left">
              <div>
                <span className="text-[9px] font-mono text-neutral-500 block uppercase">HISTORIC Meso SEASON</span>
                <span className="text-xs font-extrabold text-white">{fame.season}</span>
              </div>
              <div>
                <span className="text-[9px] font-mono text-neutral-500 block uppercase">BENCH OVERLOAD CHAMP</span>
                <span className="text-xs font-semibold text-neutral-300">{fame.benchChamp}</span>
              </div>
              <div>
                <span className="text-[9px] font-mono text-neutral-500 block uppercase">LIFTING SCIENCE CHAMP</span>
                <span className="text-xs font-semibold text-neutral-300">{fame.scienceChamp}</span>
              </div>
              <div>
                <span className="text-[9px] font-mono text-neutral-500 block uppercase">CONSISTENCY CHAMP</span>
                <span className="text-xs font-semibold text-neutral-300">{fame.consistencyChamp}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
