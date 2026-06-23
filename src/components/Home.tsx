import React from "react";
import { WorkoutSession, EloProfile } from "../types";
import { EXERCISE_DATABASE } from "../data";
import { SlidersHorizontal, Flame, CircleUser, Trophy } from "lucide-react";

interface HomeProps {
  sessions: WorkoutSession[];
  userElo: EloProfile;
  onNavigate: (tab: string) => void;
}

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const KG_TO_LBS = 2.20462;

// Relative "x min/h/d ago" formatter
function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

// Total tonnage (weight x reps) across the given sessions, in kg
function tonnageKg(sessions: WorkoutSession[]): number {
  return sessions.reduce(
    (sum, s) =>
      sum +
      s.exercises.reduce(
        (e, ex) => e + ex.sets.reduce((acc, set) => acc + set.weight * set.reps, 0),
        0
      ),
    0
  );
}

// Build a primary muscle-group label for a session, e.g. "Chest + triceps"
function sessionFocus(session: WorkoutSession): string {
  const muscles = new Set<string>();
  session.exercises.forEach((we) => {
    const def = EXERCISE_DATABASE.find((e) => e.id === we.exerciseId);
    def?.primaryMuscles.forEach((m) => muscles.add(m));
  });
  const list = Array.from(muscles);
  if (list.length === 0) return session.name;
  return list.slice(0, 2).join(" + ").toLowerCase();
}

// Thin circular progress ring used on the routine cards
function Ring({ value, label }: { value: number; label: string }) {
  const radius = 26;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (Math.min(100, value) / 100) * circ;
  return (
    <div className="relative w-[62px] h-[62px] flex items-center justify-center">
      <svg className="w-[62px] h-[62px] -rotate-90" viewBox="0 0 62 62">
        <circle cx="31" cy="31" r={radius} fill="none" stroke="#262626" strokeWidth="4" />
        <circle
          cx="31"
          cy="31"
          r={radius}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute text-lg font-bold text-white">{label}</span>
    </div>
  );
}

export default function Home({ sessions, userElo, onNavigate }: HomeProps) {
  const now = Date.now();
  const recent = sessions.filter((s) => now - s.timestamp <= ONE_WEEK_MS);
  const volumeLbs = Math.round(tonnageKg(recent) * KG_TO_LBS);
  const volumeDisplay = volumeLbs.toLocaleString("en-US");

  const sorted = [...sessions].sort((a, b) => b.timestamp - a.timestamp);
  const lastSession = sorted[0];

  // Two most recent distinct routines surfaced as cards
  const routineA = sorted[0];
  const routineB = sorted[1];

  // Build a consistency dot-map across ~3 months; light dots on days with a session
  const sessionDays = new Set(
    sessions.map((s) => Math.floor(s.timestamp / (24 * 60 * 60 * 1000)))
  );
  const today = Math.floor(now / (24 * 60 * 60 * 1000));
  const months = ["Jan", "Feb", "Mar"];

  return (
    <div className="px-5 pb-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pt-2 pb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-white">Workouts</h1>
        <button className="w-11 h-11 rounded-full bg-neutral-800/80 flex items-center justify-center text-neutral-300 active:scale-95 transition-transform">
          <CircleUser className="w-6 h-6" />
        </button>
      </div>

      {/* Top row: routine ring + big-number stat */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Routine card */}
        <button
          onClick={() => onNavigate("logger")}
          className="text-left bg-neutral-900 rounded-3xl p-4 h-[160px] flex flex-col justify-between active:scale-[0.98] transition-transform"
        >
          <div className="flex items-start justify-between">
            <Ring value={(userElo.weekOfSeason / 12) * 100} label="1" />
            <SlidersHorizontal className="w-4 h-4 text-neutral-600" />
          </div>
          <div>
            <p className="text-[15px] font-bold text-white capitalize leading-tight">
              {routineA ? sessionFocus(routineA) : "Chest + triceps"}
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">
              {routineA ? new Date(routineA.timestamp).toLocaleDateString("en-US", { weekday: "long" }) : "Fridays"}
            </p>
          </div>
        </button>

        {/* Big stat card */}
        <div className="bg-neutral-900 rounded-3xl p-4 h-[160px] flex flex-col justify-between">
          <div className="flex items-start justify-end">
            <SlidersHorizontal className="w-4 h-4 text-neutral-600" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-extrabold tracking-tight text-white">
                {userElo.components.scienceScore}
              </span>
              <span className="text-sm font-semibold text-neutral-500">/100</span>
            </div>
            <p className="text-[15px] font-bold text-white mt-1">Science score</p>
            <p className="text-xs text-neutral-500 mt-0.5">
              {lastSession ? timeAgo(lastSession.timestamp) : "no data yet"}
            </p>
          </div>
        </div>
      </div>

      {/* Consistency heatmap + secondary routine */}
      <div className="bg-neutral-900 rounded-3xl p-5 mt-3.5">
        <div className="flex items-start justify-between gap-4">
          {months.map((month, mIdx) => (
            <div key={month} className="flex-1">
              <p className="text-xs font-semibold text-neutral-300 text-center mb-2.5">{month}</p>
              <div className="grid grid-cols-6 gap-[5px]">
                {Array.from({ length: 36 }).map((_, i) => {
                  // Map this dot to a day going back from today
                  const dayIndex = today - (mIdx * 36 + i);
                  const active = sessionDays.has(dayIndex);
                  return (
                    <span
                      key={i}
                      className={`w-[5px] h-[5px] rounded-full ${
                        active ? "bg-violet-400" : "bg-neutral-700/60"
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-5 pt-4 border-t border-neutral-800/70">
          <div className="flex items-center gap-3.5">
            <Ring value={70} label="2" />
            <div>
              <p className="text-[15px] font-bold text-white capitalize leading-tight">
                {routineB ? sessionFocus(routineB) : "Back + biceps + legs"}
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {routineB ? new Date(routineB.timestamp).toLocaleDateString("en-US", { weekday: "long" }) : "Mondays"}
              </p>
            </div>
          </div>
          <SlidersHorizontal className="w-4 h-4 text-neutral-600" />
        </div>
      </div>

      {/* Volume lifted */}
      <div className="bg-neutral-900 rounded-3xl p-5 mt-3.5 flex items-center justify-between">
        <div>
          <p className="text-[15px] font-bold text-white leading-tight">Volume lifted</p>
          <p className="text-xs text-neutral-500 mt-0.5">Last 7 days</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-3xl font-extrabold tracking-tight text-white">{volumeDisplay}</span>
            <span className="text-sm font-semibold text-neutral-500 ml-1">lbs</span>
          </div>
          <SlidersHorizontal className="w-4 h-4 text-neutral-600" />
        </div>
      </div>

      {/* Streak + start new */}
      <div className="grid grid-cols-2 gap-3.5 mt-3.5">
        <div className="bg-neutral-900 rounded-3xl p-5 flex flex-col justify-end h-[120px]">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white">30</span>
            <Flame className="w-6 h-6 text-amber-500 fill-amber-500" />
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">Day streak</p>
        </div>
        <div className="bg-neutral-900 rounded-3xl p-5 flex flex-col justify-end h-[120px]">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white">{userElo.lifetimeElo}</span>
            <Trophy className="w-5 h-5 text-violet-400" />
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">ELO rating</p>
        </div>
      </div>
    </div>
  );
}
