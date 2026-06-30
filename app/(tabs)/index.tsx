import { Alert, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { CircleUser, Flame, SlidersHorizontal, Trophy } from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Loader } from "@/components/ui/Loader";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { useWorkout } from "@/contexts/WorkoutContext";
import { useAuth } from "@/contexts/AuthContext";
import { EXERCISE_DATABASE } from "@/src/utils/mockData";
import { WorkoutSession } from "@/src/types";
import { colors } from "@/lib/colors";

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const KG_TO_LBS = 2.20462;

function timeAgo(timestamp: number): string {
  const mins = Math.round((Date.now() - timestamp) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function tonnageKg(sessions: WorkoutSession[]): number {
  return sessions.reduce(
    (sum, s) =>
      sum + s.exercises.reduce((e, ex) => e + ex.sets.reduce((a, set) => a + set.weight * set.reps, 0), 0),
    0
  );
}

function sessionFocus(session: WorkoutSession): string {
  const muscles = new Set<string>();
  session.exercises.forEach((we) => {
    EXERCISE_DATABASE.find((e) => e.id === we.exerciseId)?.primaryMuscles.forEach((m) => muscles.add(m));
  });
  const list = Array.from(muscles);
  if (list.length === 0) return session.name;
  return list.slice(0, 2).join(" + ").toLowerCase();
}

export default function HomeScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { sessions, userElo, isReady } = useWorkout();

  if (!isReady) return <Loader />;

  const now = Date.now();
  const recent = sessions.filter((s) => now - s.timestamp <= ONE_WEEK_MS);
  const volumeDisplay = Math.round(tonnageKg(recent) * KG_TO_LBS).toLocaleString("en-US");

  const sorted = [...sessions].sort((a, b) => b.timestamp - a.timestamp);
  const lastSession = sorted[0];
  const routineA = sorted[0];
  const routineB = sorted[1];

  const sessionDays = new Set(sessions.map((s) => Math.floor(s.timestamp / DAY_MS)));
  const today = Math.floor(now / DAY_MS);
  const months = ["Jan", "Feb", "Mar"];

  const confirmSignOut = () =>
    Alert.alert("Account", "Sign out of AxleLift?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: () => signOut() },
    ]);

  return (
    <Screen>
      {/* Header */}
      <View className="flex-row items-center justify-between pb-6 pt-2">
        <Text className="text-4xl font-bold tracking-tight text-white">Workouts</Text>
        <Pressable
          onPress={confirmSignOut}
          className="h-11 w-11 items-center justify-center rounded-full bg-neutral-800 active:opacity-80"
        >
          <CircleUser size={24} color={colors.textMuted} />
        </Pressable>
      </View>

      {/* Routine + science score */}
      <View className="flex-row gap-3.5">
        <Pressable
          onPress={() => router.push("/logger")}
          className="h-40 flex-1 justify-between rounded-3xl bg-neutral-900 p-4 active:opacity-90"
        >
          <View className="flex-row items-start justify-between">
            <ProgressRing value={(userElo.weekOfSeason / 12) * 100} label="1" />
            <SlidersHorizontal size={16} color={colors.textDim} />
          </View>
          <View>
            <Text className="text-[15px] font-bold capitalize text-white" numberOfLines={1}>
              {routineA ? sessionFocus(routineA) : "Chest + triceps"}
            </Text>
            <Text className="mt-0.5 text-xs text-neutral-500">
              {routineA
                ? new Date(routineA.timestamp).toLocaleDateString("en-US", { weekday: "long" })
                : "Fridays"}
            </Text>
          </View>
        </Pressable>

        <View className="h-40 flex-1 justify-between rounded-3xl bg-neutral-900 p-4">
          <View className="flex-row items-start justify-end">
            <SlidersHorizontal size={16} color={colors.textDim} />
          </View>
          <View>
            <View className="flex-row items-baseline gap-1">
              <Text className="text-5xl font-bold tracking-tight text-white">
                {userElo.components.scienceScore}
              </Text>
              <Text className="text-sm font-semibold text-neutral-500">/100</Text>
            </View>
            <Text className="mt-1 text-[15px] font-bold text-white">Science score</Text>
            <Text className="mt-0.5 text-xs text-neutral-500">
              {lastSession ? timeAgo(lastSession.timestamp) : "no data yet"}
            </Text>
          </View>
        </View>
      </View>

      {/* Consistency heatmap */}
      <View className="mt-3.5 rounded-3xl bg-neutral-900 p-5">
        <View className="flex-row justify-between gap-4">
          {months.map((month, mIdx) => (
            <View key={month} className="flex-1">
              <Text className="mb-2.5 text-center text-xs font-semibold text-neutral-300">{month}</Text>
              <View className="gap-1">
                {Array.from({ length: 6 }).map((_, row) => (
                  <View key={row} className="flex-row justify-between">
                    {Array.from({ length: 6 }).map((__, col) => {
                      const dayIndex = today - (mIdx * 36 + row * 6 + col);
                      const active = sessionDays.has(dayIndex);
                      return (
                        <View
                          key={col}
                          className={`h-1.5 w-1.5 rounded-full ${active ? "bg-brand-400" : "bg-neutral-700"}`}
                        />
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        <View className="mt-5 flex-row items-center justify-between border-t border-neutral-800/70 pt-4">
          <View className="flex-row items-center gap-3.5">
            <ProgressRing value={70} label="2" />
            <View>
              <Text className="text-[15px] font-bold capitalize text-white" numberOfLines={1}>
                {routineB ? sessionFocus(routineB) : "Back + biceps"}
              </Text>
              <Text className="mt-0.5 text-xs text-neutral-500">
                {routineB
                  ? new Date(routineB.timestamp).toLocaleDateString("en-US", { weekday: "long" })
                  : "Mondays"}
              </Text>
            </View>
          </View>
          <SlidersHorizontal size={16} color={colors.textDim} />
        </View>
      </View>

      {/* Volume lifted */}
      <View className="mt-3.5 flex-row items-center justify-between rounded-3xl bg-neutral-900 p-5">
        <View>
          <Text className="text-[15px] font-bold text-white">Volume lifted</Text>
          <Text className="mt-0.5 text-xs text-neutral-500">Last 7 days</Text>
        </View>
        <View className="flex-row items-center gap-3">
          <View className="flex-row items-baseline">
            <Text className="text-3xl font-bold tracking-tight text-white">{volumeDisplay}</Text>
            <Text className="ml-1 text-sm font-semibold text-neutral-500">lbs</Text>
          </View>
          <SlidersHorizontal size={16} color={colors.textDim} />
        </View>
      </View>

      {/* Streak + ELO */}
      <View className="mt-3.5 flex-row gap-3.5">
        <View className="h-28 flex-1 justify-end rounded-3xl bg-neutral-900 p-5">
          <View className="flex-row items-center gap-2">
            <Text className="text-3xl font-bold tracking-tight text-white">30</Text>
            <Flame size={24} color={colors.brand500} fill={colors.brand500} />
          </View>
          <Text className="mt-0.5 text-xs text-neutral-500">Day streak</Text>
        </View>
        <View className="h-28 flex-1 justify-end rounded-3xl bg-neutral-900 p-5">
          <View className="flex-row items-center gap-2">
            <Text className="text-3xl font-bold tracking-tight text-white">{userElo.lifetimeElo}</Text>
            <Trophy size={20} color={colors.brand400} />
          </View>
          <Text className="mt-0.5 text-xs text-neutral-500">ELO rating</Text>
        </View>
      </View>
    </Screen>
  );
}
