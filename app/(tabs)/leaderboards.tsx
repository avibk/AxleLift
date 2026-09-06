import { ScrollView, Text, View, Pressable } from "react-native";
import {
  Award,
  Brain,
  Calendar,
  Flame,
  Medal,
  Star,
  TrendingUp,
  Trophy,
  type LucideIcon,
} from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Loader } from "@/components/ui/Loader";
import { UserAvatar } from "@/components/features/UserAvatar";
import { useLeaderboard, type LeaderboardId } from "@/hooks/useLeaderboard";
import { useAuth } from "@/contexts/AuthContext";
import { GymRank } from "@/src/types";
import { colors } from "@/lib/colors";

const RANK_TIERS = [
  { title: GymRank.ROOKIE, eloRange: "< 1000", muted: true },
  { title: GymRank.NOVICE, eloRange: "1000 – 1499", muted: false },
  { title: GymRank.PULSAR, eloRange: "1500 – 1999", muted: false },
  { title: GymRank.QUASAR, eloRange: "2000 – 2499", muted: false },
  { title: GymRank.SUPERNOVA, eloRange: "2500+", muted: false },
];

const BOARDS: { id: LeaderboardId; label: string; Icon: LucideIcon }[] = [
  { id: "lifetime", label: "Lifetime", Icon: Trophy },
  { id: "seasonal", label: "Seasonal", Icon: Award },
  { id: "progress", label: "Progress", Icon: TrendingUp },
  { id: "consistency", label: "Consistency", Icon: Flame },
  { id: "science", label: "Science", Icon: Brain },
];

const SUBTITLES: Record<LeaderboardId, string> = {
  lifetime: "Total lifetime ELO earned from logged training quality and volume.",
  seasonal: "Current mesocycle seasonal ELO — resets each 12-week season.",
  progress: "Progress component score (0–100) from your training trajectory.",
  consistency: "Consistency component score (0–100) from workout attendance.",
  science: "Science score component (0–100) from RIR accuracy and stimulus quality.",
};

export default function LeaderboardsScreen() {
  const { user, isConfigured } = useAuth();
  const { activeBoard, setActiveBoard, entries, loading, error, reload } = useLeaderboard("lifetime");

  return (
    <Screen onRefresh={reload}>
      <View className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <View className="mb-2 flex-row items-center gap-2">
          <View className="rounded-md border border-brand-500/20 bg-brand-500/10 p-1">
            <Calendar size={16} color={colors.brand400} />
          </View>
          <Text className="text-xs font-bold uppercase tracking-wider text-neutral-300">
            Mesocycle Competition
          </Text>
        </View>
        <Text className="text-2xl font-bold tracking-tight text-white">Season 1</Text>
        <Text className="mt-2 text-xs leading-relaxed text-neutral-400">
          Rankings reflect real athlete profiles. Log workouts to climb the boards.
        </Text>
      </View>

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
              <Text className="text-[11px] text-neutral-400">{tier.eloRange} ELO</Text>
            </View>
          ))}
        </View>
      </View>

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

      <View className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <Text className="mb-1 border-b border-neutral-800 pb-3 text-base font-bold capitalize text-white">
          {activeBoard} rankings
        </Text>
        <Text className="mb-5 mt-3 text-xs leading-normal text-neutral-400">{SUBTITLES[activeBoard]}</Text>

        {loading ? (
          <Loader />
        ) : error ? (
          <Text className="py-8 text-center text-xs text-neutral-500">{error}</Text>
        ) : !isConfigured ? (
          <Text className="py-8 text-center text-xs text-neutral-500">
            Connect Supabase to see live rankings.
          </Text>
        ) : entries.length === 0 ? (
          <Text className="py-8 text-center text-xs text-neutral-500">
            No lifters on this board yet. Be the first to log a workout.
          </Text>
        ) : (
          <View className="gap-2">
            {entries.map((item, idx) => {
              const isSelf = item.id === user?.id;
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
                  <UserAvatar uri={item.avatarUrl} name={item.username} size={32} />
                  <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className={`text-xs font-bold ${isSelf ? "text-brand-400" : "text-white"}`}>
                          {item.username}
                        </Text>
                        <View className="rounded border border-neutral-800 bg-neutral-900 px-1.5 py-0.5">
                          <Text className="text-[9px] uppercase text-neutral-500">{item.rankName}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <Text className="text-xs font-bold text-white">{item.metaValue}</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>

      <View className="mt-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <View className="mb-4 flex-row items-center gap-2">
          <Star size={18} color={colors.brand500} />
          <Text className="text-base font-bold tracking-tight text-white">Hall of Fame</Text>
        </View>
        <Text className="text-xs leading-relaxed text-neutral-500">
          Season champions will appear here after the first mesocycle completes.
        </Text>
      </View>
    </Screen>
  );
}
