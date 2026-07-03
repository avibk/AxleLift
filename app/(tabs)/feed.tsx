import { Linking, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";
import { BookOpen, ExternalLink, Quote, Search } from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Loader } from "@/components/ui/Loader";
import { useResearchFeed } from "@/hooks/useResearchFeed";
import type { FeedCategory } from "@/src/types/research.types";
import { colors } from "@/lib/colors";

const CATEGORIES: FeedCategory[] = [
  "All",
  "Hypertrophy",
  "Biomechanics",
  "Recovery",
  "Nutrition",
  "Myths",
];

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

export default function FeedScreen() {
  const {
    category,
    setCategory,
    searchQuery,
    setSearchQuery,
    articles,
    loading,
    refreshing,
    error,
    refresh,
  } = useResearchFeed();

  return (
    <Screen
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brand400} />
      }
    >
      <View className="mb-5">
        <View className="flex-row items-center gap-2">
          <BookOpen size={22} color={colors.brand400} />
          <Text className="text-2xl font-bold tracking-tight text-white">Fitness Feed</Text>
        </View>
        <Text className="mt-1 text-xs text-neutral-400">
          Peer-reviewed research from Europe PMC and PubMed.
        </Text>
      </View>

      <View className="mb-4 flex-row items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900 px-4">
        <Search size={16} color={colors.textFaint} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search fitness literature..."
          placeholderTextColor={colors.textFaint}
          className="flex-1 py-3 text-xs text-white"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-5"
        contentContainerClassName="gap-2 pr-5"
      >
        {CATEGORIES.map((cat) => {
          const active = category === cat;
          return (
            <Pressable
              key={cat}
              onPress={() => setCategory(cat)}
              className={`rounded-xl border px-3 py-1.5 ${
                active
                  ? "border-brand-500/30 bg-brand-500/10"
                  : "border-neutral-800 bg-neutral-900"
              }`}
            >
              <Text
                className={`text-[11px] font-semibold ${active ? "text-brand-400" : "text-neutral-400"}`}
              >
                {cat.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {loading && !refreshing ? (
        <Loader />
      ) : error ? (
        <View className="items-center rounded-2xl border border-red-500/20 bg-red-500/10 py-16 px-6">
          <Text className="text-center text-xs text-red-300">{error}</Text>
          <Pressable onPress={refresh} className="mt-4 rounded-xl bg-neutral-900 px-4 py-2">
            <Text className="text-xs font-semibold text-brand-400">Retry</Text>
          </Pressable>
        </View>
      ) : articles.length === 0 ? (
        <View className="items-center rounded-2xl border border-neutral-800 bg-neutral-900 py-16">
          <Text className="text-xs text-neutral-500">No research matches your search.</Text>
        </View>
      ) : (
        <View className="gap-4">
          {articles.map((article) => (
            <View
              key={`${article.source}-${article.id}`}
              className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5"
            >
              <View className="flex-row items-center justify-between gap-2">
                <View className="rounded-full border border-neutral-800 bg-neutral-950 px-2.5 py-0.5">
                  <Text className="text-[10px] font-semibold uppercase text-neutral-400">
                    {article.source === "europepmc" ? "Europe PMC" : "PubMed"}
                  </Text>
                </View>
                {article.citationCount != null ? (
                  <Text className="text-[10px] text-neutral-500">
                    {article.citationCount.toLocaleString()} citations
                  </Text>
                ) : null}
              </View>

              <Text className="mt-3 text-base font-bold leading-snug text-white">{article.title}</Text>

              <Text className="mt-2 text-[11px] text-neutral-400">
                {article.authors} · {article.journal} ({article.year})
              </Text>

              <View className="mt-3 rounded-2xl border border-neutral-800 bg-neutral-950 p-3.5">
                <View className="mb-1.5 flex-row items-center gap-1.5">
                  <Quote size={12} color={colors.textDim} />
                  <Text className="text-[10px] font-bold uppercase text-neutral-400">Abstract</Text>
                </View>
                <Text className="text-xs leading-relaxed text-neutral-300">
                  {truncate(article.abstract, 480)}
                </Text>
              </View>

              <Pressable
                onPress={() => Linking.openURL(article.sourceUrl)}
                className="mt-4 flex-row items-center justify-center gap-2 rounded-xl border border-brand-500/20 bg-brand-500/10 py-2.5 active:opacity-80"
              >
                <ExternalLink size={14} color={colors.brand400} />
                <Text className="text-xs font-bold text-brand-400">Open paper</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}
