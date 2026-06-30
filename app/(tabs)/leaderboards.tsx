import { ScrollView, Text, View, Pressable } from "react-native";
import {
  Award,
  Brain,
  Calendar,
  Dumbbell,
  Flame,
  Medal,
  Star,
  TrendingUp,
  Trophy,
  type LucideIcon,
} from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { useLeaderboard, type LeaderboardId } from "@/hooks/useLeaderboard";
import { CURATED_HALL_OF_FAME } from "@/src/utils/mockData";
import { colors } from "@/lib/colors";

const RANK_TIERS = [
  { title: "Novice", eloRange: "0 - 1000", muted: true },
  { title: "Intermediate", eloRange: "1000 - 1500", muted: false },
  { title: "Advanced", eloRange: "1500 - 2000", muted: false },
  { title: "Elite", eloRange: "2000 - 2500", muted: false },
  { title: "Evidence-Based Monster", eloRange: "2500+", muted: false },
];

const BOARDS: { id: LeaderboardId; label: string; Icon: LucideIcon }[] = [
  { id: "bench", label: "Bench", Icon: Dumbbell },
  { id: "relative", label: "Relative", Icon: Award },
  { id: "progress", label: "Improved", Icon: TrendingUp },
  { id: "consistency", label: "Attendance", Icon: Flame },
  { id: "science", label: "Science", Icon: Brain },
];

const SUBTITLES: Record<LeaderboardId, string> = {
  bench: "Standard absolute bench press max logged inside active mesocycles.",
  relative: "Bench press max divided by bodyweight. Promotes general athleticism.",
  progress: "Highest rate of estimated 1RM development in the last 90 days.",
  consistency: "Attendance and scheduled-log compliance across 24 seasonal workouts.",
  science: "Awarded for logging accuracy, RIR precision, and weekly volume goals.",
};

export default function LeaderboardsScreen() {
  const { activeBoard, setActiveBoard, entries } = useLeaderboard("bench");

  return (
    <Screen>
      {/* Season banner */}
      <View className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <View className="mb-2 flex-row items-center gap-2">
          <View className="rounded-md border border-brand-500/20 bg-brand-500/10 p-1">
            <Calendar size={16} color={colors.brand400} />
          </View>
          <Text className="text-xs font-bold uppercase tracking-wider text-neutral-300">
            Mesocycle Competition
          </Text>
        </View>
        <Text className="text-2xl font-bold tracking-tight text-white">
          Season 1: Chest Specialization
        </Text>
        <Text className="mt-2 text-xs leading-relaxed text-neutral-400">
          Seasonal ELO resets every 12-week mesocycle. Week 5 of 12 — chest compound lifts earn a 1.2x
          ELO booster.
        </Text>
        <View className="mt-5 flex-row flex-wrap items-center gap-2 border-t border-neutral-800/80 pt-4">
          {["Top 1% Bench", "Science Master", "30-Day Streak"].map((badge) => (
            <View
              key={badge}
              className="rounded-lg border border-brand-500/20 bg-brand-500/5 px-2 py-1"
            >
              <Text className="text-[10px] font-bold text-brand-400">{badge}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Rank calibration */}
      <View className="mt-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <View className="mb-4 flex-row items-center gap-1.5">
          <Trophy size={14} color={colors.brand400} />
          <Text className="text-xs font-bold uppercase tracking-wider text-neutral-300">
            Rank Calibration
          </Text>
        </View>
        <View className="gap-2">
          {RANK_TIERS.map((tier) => (
            <View
              key={tier.title}
              className={`flex-row items-center justify-between rounded-lg border p-2.5 ${
                tier.muted
                  ? "border-neutral-700 bg-neutral-800/40"
                  : "border-brand-500/20 bg-brand-500/10"
              }`}
            >
              <Text
                className={`text-[11px] font-bold ${tier.muted ? "text-neutral-400" : "text-brand-400"}`}
              >
                {tier.title}
              </Text>
              <Text className="text-[11px] text-neutral-400">{tier.eloRange} Elo</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Board selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-4"
        contentContainerClassName="gap-2 pr-5"
      >
        {BOARDS.map(({ id, label, Icon }) => {
          const active = activeBoard === id;
          return (
            <Pressable
              key={id}
              onPress={() => setActiveBoard(id)}
              className={`flex-row items-center gap-2 rounded-xl border px-3.5 py-2 ${
                active ? "border-brand-500/30 bg-brand-500/10" : "border-neutral-800 bg-neutral-900"
              }`}
            >
              <Icon size={16} color={active ? colors.brand400 : colors.textMuted} />
              <Text
                className={`text-xs font-semibold ${active ? "text-brand-400" : "text-neutral-400"}`}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Board panel */}
      <View className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <Text className="mb-1 border-b border-neutral-800 pb-3 text-base font-bold capitalize text-white">
          {activeBoard} rankings
        </Text>
        <Text className="mb-5 mt-3 text-xs leading-normal text-neutral-400">{SUBTITLES[activeBoard]}</Text>

        <View className="gap-2">
          {entries.map((item, idx) => {
            const isSelf = item.id === "user-self";
            const medalColor =
              idx === 0 ? colors.brand400 : idx === 2 ? colors.brand500 : colors.textMuted;
            return (
              <View
                key={item.id}
                className={`flex-row items-center justify-between overflow-hidden rounded-xl border p-4 ${
                  isSelf ? "border-brand-500/35 bg-brand-500/10" : "border-neutral-800 bg-neutral-950"
                }`}
              >
                {isSelf ? <View className="absolute bottom-0 left-0 top-0 w-1 bg-brand-400" /> : null}
                <View className="flex-1 flex-row items-center gap-4">
                  <View className="w-6 items-center">
                    {idx <= 2 ? (
                      <Medal size={20} color={medalColor} />
                    ) : (
                      <Text className="text-xs font-bold text-neutral-400">{idx + 1}</Text>
                    )}
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className={`text-xs font-bold ${isSelf ? "text-brand-400" : "text-white"}`}>
                        {item.username}
                      </Text>
                      <View className="rounded border border-neutral-800 bg-neutral-900 px-1.5 py-0.5">
                        <Text className="text-[9px] uppercase text-neutral-500">{item.rankName}</Text>
                      </View>
                    </View>
                    {item.badges.length > 0 ? (
                      <View className="mt-1 flex-row flex-wrap gap-1">
                        {item.badges.map((b) => (
                          <View
                            key={b}
                            className="rounded border border-neutral-800/60 bg-neutral-900 px-1 py-0.5"
                          >
                            <Text className="text-[8px] text-neutral-400">{b}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </View>
                </View>
                <Text className="text-xs font-bold uppercase text-white">{item.metaValue}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Hall of Fame */}
      <View className="mt-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <View className="mb-4 flex-row items-center gap-2">
          <Star size={18} color={colors.brand500} />
          <Text className="text-base font-bold tracking-tight text-white">Hall of Fame</Text>
        </View>
        <View className="gap-3">
          {CURATED_HALL_OF_FAME.map((fame) => (
            <View key={fame.season} className="gap-3 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
              <View>
                <Text className="text-[9px] uppercase text-neutral-500">Historic Meso Season</Text>
                <Text className="text-xs font-bold text-white">{fame.season}</Text>
              </View>
              <View>
                <Text className="text-[9px] uppercase text-neutral-500">Bench Overload Champ</Text>
                <Text className="text-xs font-semibold text-neutral-300">{fame.benchChamp}</Text>
              </View>
              <View>
                <Text className="text-[9px] uppercase text-neutral-500">Lifting Science Champ</Text>
                <Text className="text-xs font-semibold text-neutral-300">{fame.scienceChamp}</Text>
              </View>
              <View>
                <Text className="text-[9px] uppercase text-neutral-500">Consistency Champ</Text>
                <Text className="text-xs font-semibold text-neutral-300">{fame.consistencyChamp}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}
