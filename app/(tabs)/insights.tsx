import { Text, View } from "react-native";
import {
  Activity,
  AlertTriangle,
  ArrowUp,
  CalendarDays,
  ChevronRight,
  Flame,
  Gauge,
  Minus,
  RotateCcw,
  Target,
  TrendingUp,
  type LucideIcon,
} from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Loader } from "@/components/ui/Loader";
import { useWorkout } from "@/contexts/WorkoutContext";
import { EXERCISE_DATABASE } from "@/src/data/exercises";
import {
  calculateStimulusScore,
  getMuscleVolumeStats,
  getProgressionRecommendation,
} from "@/src/utils/workoutMetrics";
import { colors } from "@/lib/colors";

const KG_TO_LBS = 2.20462;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const STATUS_BAR: Record<string, string> = {
  Undertrained: "bg-brand-500",
  Optimal: "bg-brand-400",
  Overreaching: "bg-brand-300",
};

const REC_STYLE: Record<string, { Icon: LucideIcon; color: string; wrap: string }> = {
  increase_weight: { Icon: ArrowUp, color: colors.brand400, wrap: "border-brand-500/20 bg-brand-500/5" },
  increase_reps: { Icon: TrendingUp, color: colors.brand400, wrap: "border-brand-500/20 bg-brand-500/5" },
  maintain: { Icon: Minus, color: colors.textMuted, wrap: "border-neutral-700 bg-neutral-800/40" },
  deload: { Icon: RotateCcw, color: colors.brand400, wrap: "border-brand-500/20 bg-brand-500/5" },
};

export default function InsightsScreen() {
  const { sessions, userElo, isReady, error: workoutError, reload } = useWorkout();

  if (!isReady) return <Loader />;

  const now = Date.now();
  const recent = sessions.filter((s) => now - s.timestamp <= WEEK_MS);

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
  const weakPoints = muscleStats.filter(
    (m) => m.status === "Undertrained" && m.effectiveSets < m.targetRange.min
  );

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
    <Screen onRefresh={reload}>
      <View className="mb-5">
        <Text className="text-3xl font-bold tracking-tight text-white">Insights</Text>
        <Text className="mt-1 text-xs text-neutral-500">
          Computed from your logged training — no guesswork.
        </Text>
      </View>

      {workoutError ? (
        <Text className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {workoutError}
        </Text>
      ) : null}

      {/* Weekly snapshot */}
      <View className="flex-row flex-wrap justify-between">
        {stats.map(({ label, value, hint, Icon }) => (
          <View key={label} className="mb-3 w-[48%] rounded-2xl bg-neutral-900 p-4">
            <Icon size={20} color={colors.brand400} />
            <View className="mt-3 flex-row items-baseline gap-1">
              <Text className="text-2xl font-bold tracking-tight text-white">{value}</Text>
              <Text className="text-[11px] font-semibold text-neutral-500">{hint}</Text>
            </View>
            <Text className="mt-0.5 text-xs text-neutral-400">{label}</Text>
          </View>
        ))}
      </View>

      {/* Lifting score */}
      <View className="mt-1 rounded-2xl bg-neutral-900 p-5">
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Gauge size={16} color={colors.brand400} />
            <Text className="text-sm font-bold text-white">Lifting score</Text>
          </View>
          <Text className="text-[11px] font-bold text-brand-400">
            {userElo.lifetimeElo} ELO / {userElo.rank}
          </Text>
        </View>
        <View className="gap-3">
          {eloComponents.map((c) => (
            <View key={c.label}>
              <View className="mb-1 flex-row items-center justify-between">
                <Text className="text-xs font-semibold text-neutral-200">{c.label}</Text>
                <Text className="text-[11px] text-neutral-400">{c.value}/100</Text>
              </View>
              <View className="h-2 overflow-hidden rounded-full bg-neutral-800">
                <View
                  className="h-full rounded-full bg-brand-500"
                  style={{ width: `${Math.min(100, c.value)}%` }}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Weak point callout */}
      {weakPoints.length > 0 ? (
        <View className="mt-3 flex-row gap-3 rounded-2xl border border-brand-500/20 bg-brand-500/5 p-4">
          <AlertTriangle size={20} color={colors.brand400} />
          <View className="flex-1">
            <Text className="text-sm font-bold text-white">Focus this week</Text>
            <Text className="mt-1 text-xs leading-relaxed text-neutral-300">
              {weakPoints.map((m) => m.muscle).join(", ")} {weakPoints.length === 1 ? "is" : "are"} below
              the weekly volume target. Add 1-2 high-effort sets to drive growth.
            </Text>
          </View>
        </View>
      ) : null}

      {/* Muscle volume */}
      <View className="mt-3 rounded-2xl bg-neutral-900 p-5">
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Target size={16} color={colors.brand400} />
            <Text className="text-sm font-bold text-white">Weekly muscle volume</Text>
          </View>
          <Text className="text-[10px] uppercase text-neutral-500">Eff. sets</Text>
        </View>
        <View className="gap-3">
          {sortedMuscles.map((m) => {
            const pct = Math.min(100, (m.effectiveSets / m.targetRange.max) * 100);
            return (
              <View key={m.muscle}>
                <View className="mb-1 flex-row items-center justify-between">
                  <Text className="text-xs font-semibold text-neutral-200">{m.muscle}</Text>
                  <Text className="text-[11px] text-neutral-400">
                    {m.effectiveSets}{" "}
                    <Text className="text-neutral-600">
                      / {m.targetRange.min}-{m.targetRange.max}
                    </Text>
                  </Text>
                </View>
                <View className="h-2 overflow-hidden rounded-full bg-neutral-800">
                  <View className={`h-full rounded-full ${STATUS_BAR[m.status]}`} style={{ width: `${pct}%` }} />
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Progression engine */}
      <View className="mt-3">
        <View className="mb-3 flex-row items-center gap-2 px-1">
          <TrendingUp size={16} color={colors.brand400} />
          <Text className="text-sm font-bold text-white">Next-session targets</Text>
        </View>
        {recs.length === 0 ? (
          <View className="items-center rounded-2xl bg-neutral-900 p-6">
            <Text className="text-xs text-neutral-500">Log a workout to unlock progression targets.</Text>
          </View>
        ) : (
          <View className="gap-3">
            {recs.map(({ id, name, rec }) => {
              const style = REC_STYLE[rec.type];
              const Icon = style.Icon;
              return (
                <View key={id} className={`rounded-2xl border p-4 ${style.wrap}`}>
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-white">{name}</Text>
                      <Text className="mt-0.5 text-[11px] font-bold uppercase" style={{ color: style.color }}>
                        {rec.title}
                      </Text>
                    </View>
                    <View className="h-8 w-8 items-center justify-center rounded-full bg-neutral-950/60">
                      <Icon size={16} color={style.color} />
                    </View>
                  </View>
                  <Text className="mt-2 text-xs leading-relaxed text-neutral-300">{rec.explanation}</Text>
                  {rec.originalWeight > 0 ? (
                    <View className="mt-3 flex-row items-center gap-2">
                      <View className="rounded-lg bg-neutral-950/60 px-2 py-1">
                        <Text className="text-[11px] text-neutral-400">
                          {rec.originalWeight}kg x {rec.originalReps}
                        </Text>
                      </View>
                      <ChevronRight size={14} color={colors.textDim} />
                      <View className="rounded-lg bg-neutral-950/60 px-2 py-1">
                        <Text className="text-[11px] font-bold" style={{ color: style.color }}>
                          {rec.targetWeight}kg x {rec.targetRepsRange}
                        </Text>
                      </View>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}
      </View>
    </Screen>
  );
}
