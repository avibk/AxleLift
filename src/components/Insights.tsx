import React from "react";
import { WorkoutSession, EloProfile } from "../types";
import { EXERCISE_DATABASE } from "../data";
import { getMuscleVolumeStats, getProgressionRecommendation, calculateStimulusScore } from "../utils";
import {
  Activity,
  Target,
  TrendingUp,
  ArrowUp,
  Minus,
  RotateCcw,
  Flame,
  AlertTriangle,
  Gauge,
  CalendarDays,
  ChevronRight,
} from "lucide-react";

interface InsightsProps {
  sessions: WorkoutSession[];
  userElo: EloProfile;
}

const KG_TO_LBS = 2.20462;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const STATUS_BAR: Record<string, string> = {
  Undertrained: "bg-amber-400",
  Optimal: "bg-emerald-400",
  Overreaching: "bg-rose-400",
};

const REC_STYLE: Record<string, { Icon: any; text: string; bg: string; border: string }> = {
  increase_weight: { Icon: ArrowUp, text: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/20" },
  increase_reps: { Icon: TrendingUp, text: "text-violet-400", bg: "bg-violet-500/5", border: "border-violet-500/20" },
  maintain: { Icon: Minus, text: "text-neutral-300", bg: "bg-neutral-800/40", border: "border-neutral-700" },
  deload: { Icon: RotateCcw, text: "text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/20" },
};

export default function Insights({ sessions, userElo }: InsightsProps) {
  const now = Date.now();
  const recent = sessions.filter((s) => now - s.timestamp <= WEEK_MS);

  // Weekly aggregates derived directly from logged sets
  let totalSets = 0;
  let stimSum = 0;
  let stimCount = 0;
  let tonnage = 0;
  recent.forEach((s) =>
    s.exercises.forEach((ex) =>
      ex.sets.forEach((set) => {
        if (set.reps > 0) {
          totalSets++;
          stimSum += set.stimulusScore ?? calculateStimulusScore(set.rir, set.reps);
          stimCount++;
          tonnage += set.weight * set.reps;
        }
      })
    )
  );
  const avgStim = stimCount ? (stimSum / stimCount).toFixed(1) : "0.0";
  const volumeLbs = Math.round(tonnage * KG_TO_LBS).toLocaleString("en-US");

  const muscleStats = getMuscleVolumeStats(sessions);
  const statusOrder: Record<string, number> = { Undertrained: 0, Overreaching: 1, Optimal: 2 };
  const sortedMuscles = [...muscleStats].sort(
    (a, b) => statusOrder[a.status] - statusOrder[b.status] || b.effectiveSets - a.effectiveSets
  );
  const weakPoints = muscleStats.filter((m) => m.status === "Undertrained" && m.effectiveSets < m.targetRange.min);

  // Progression targets for the most recently trained lifts
  const sorted = [...sessions].sort((a, b) => b.timestamp - a.timestamp);
  const recentExerciseIds = Array.from(
    new Set(sorted.slice(0, 2).flatMap((s) => s.exercises.map((e) => e.exerciseId)))
  ).slice(0, 5);
  const recs = recentExerciseIds.map((id) => ({
    id,
    name: EXERCISE_DATABASE.find((e) => e.id === id)?.name ?? "Exercise",
    rec: getProgressionRecommendation(id, sessions),
  }));

  const stats = [
    { label: "Sessions", value: `${recent.length}`, hint: "this week", Icon: CalendarDays },
    { label: "Work sets", value: `${totalSets}`, hint: "logged", Icon: Activity },
    { label: "Avg stimulus", value: avgStim, hint: "/10", Icon: Gauge },
    { label: "Volume", value: volumeLbs, hint: "lbs", Icon: Flame },
  ];

  const eloComponents = [
    { label: "Strength", value: userElo.components.strength },
    { label: "Progress", value: userElo.components.progress },
    { label: "Consistency", value: userElo.components.consistency },
    { label: "Science", value: userElo.components.scienceScore },
  ];

  return (
    <div className="pt-1 pb-2 animate-fade-in">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Insights</h1>
        <p className="text-xs text-neutral-500 mt-1">Computed from your logged training — no guesswork.</p>
      </div>

      {/* Weekly snapshot */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ label, value, hint, Icon }) => (
          <div key={label} className="bg-neutral-900 rounded-3xl p-4">
            <Icon className="w-5 h-5 text-violet-400 mb-3" />
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold tracking-tight text-white">{value}</span>
              <span className="text-[11px] font-semibold text-neutral-500">{hint}</span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Lifting score breakdown */}
      <div className="mt-3 bg-neutral-900 rounded-3xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Gauge className="w-4 h-4 text-violet-400" />
            Lifting score
          </h2>
          <span className="text-[11px] font-mono text-violet-400 font-bold">
            {userElo.lifetimeElo} ELO · {userElo.rank}
          </span>
        </div>
        <div className="space-y-3">
          {eloComponents.map((c) => (
            <div key={c.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-neutral-200">{c.label}</span>
                <span className="text-[11px] font-mono text-neutral-400">{c.value}/100</span>
              </div>
              <div className="h-2 rounded-full bg-neutral-800 overflow-hidden">
                <div className="h-full rounded-full bg-violet-500" style={{ width: `${Math.min(100, c.value)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weak point callout */}
      {weakPoints.length > 0 && (
        <div className="mt-3 bg-amber-500/5 border border-amber-500/20 rounded-3xl p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-white">Focus this week</p>
            <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
              {weakPoints.map((m) => m.muscle).join(", ")} {weakPoints.length === 1 ? "is" : "are"} below the weekly
              volume target. Add 1–2 high-effort sets to drive growth.
            </p>
          </div>
        </div>
      )}

      {/* Muscle volume dashboard */}
      <div className="mt-3 bg-neutral-900 rounded-3xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-violet-400" />
            Weekly muscle volume
          </h2>
          <span className="text-[10px] font-mono text-neutral-500 uppercase">Eff. sets</span>
        </div>
        <div className="space-y-3">
          {sortedMuscles.map((m) => {
            const pct = Math.min(100, (m.effectiveSets / m.targetRange.max) * 100);
            return (
              <div key={m.muscle}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-neutral-200">{m.muscle}</span>
                  <span className="text-[11px] font-mono text-neutral-400">
                    {m.effectiveSets}{" "}
                    <span className="text-neutral-600">
                      / {m.targetRange.min}-{m.targetRange.max}
                    </span>
                  </span>
                </div>
                <div className="h-2 rounded-full bg-neutral-800 overflow-hidden">
                  <div className={`h-full rounded-full ${STATUS_BAR[m.status]}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-neutral-800/70">
          <span className="flex items-center gap-1.5 text-[10px] text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> Under
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Optimal
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-rose-400" /> Over
          </span>
        </div>
      </div>

      {/* Progression engine */}
      <div className="mt-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-3 px-1">
          <TrendingUp className="w-4 h-4 text-violet-400" />
          Next-session targets
        </h2>
        {recs.length === 0 ? (
          <div className="bg-neutral-900 rounded-3xl p-6 text-center">
            <p className="text-xs text-neutral-500">Log a workout to unlock progression targets.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recs.map(({ id, name, rec }) => {
              const style = REC_STYLE[rec.type];
              const Icon = style.Icon;
              return (
                <div key={id} className={`rounded-3xl p-4 border ${style.bg} ${style.border}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">{name}</p>
                      <p className={`text-[11px] font-mono font-bold uppercase mt-0.5 ${style.text}`}>{rec.title}</p>
                    </div>
                    <span
                      className={`flex-shrink-0 w-8 h-8 rounded-full bg-neutral-950/60 flex items-center justify-center ${style.text}`}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed mt-2">{rec.explanation}</p>
                  {rec.originalWeight > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-[11px] font-mono">
                      <span className="px-2 py-1 rounded-lg bg-neutral-950/60 text-neutral-400">
                        {rec.originalWeight}kg × {rec.originalReps}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
                      <span className={`px-2 py-1 rounded-lg bg-neutral-950/60 font-bold ${style.text}`}>
                        {rec.targetWeight}kg × {rec.targetRepsRange}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
