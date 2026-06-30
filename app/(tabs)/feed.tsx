import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { AlertCircle, Award, BookOpen, Eye, Quote, Search } from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { CURATED_SCIENCE_FEED } from "@/src/utils/mockData";
import { colors } from "@/lib/colors";

const CATEGORIES = ["All", "Hypertrophy", "Biomechanics", "Recovery", "Myths"];

export default function FeedScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return CURATED_SCIENCE_FEED.filter((article) => {
      const matchesCategory = activeCategory === "All" || article.category === activeCategory;
      const matchesSearch =
        article.title.toLowerCase().includes(q) ||
        article.myth.toLowerCase().includes(q) ||
        article.evidence.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  return (
    <Screen>
      <View className="mb-5">
        <View className="flex-row items-center gap-2">
          <BookOpen size={22} color={colors.brand400} />
          <Text className="text-2xl font-bold tracking-tight text-white">Hypertrophy Feed</Text>
        </View>
        <Text className="mt-1 text-xs text-neutral-400">
          Debunking bro-science with peer-reviewed research.
        </Text>
      </View>

      <View className="mb-4 flex-row items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900 px-4">
        <Search size={16} color={colors.textFaint} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search physiology literature..."
          placeholderTextColor={colors.textFaint}
          className="flex-1 py-3 text-xs text-white"
        />
      </View>

      <View className="mb-5 flex-row flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const active = activeCategory === cat;
          return (
            <Pressable
              key={cat}
              onPress={() => setActiveCategory(cat)}
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
      </View>

      {filtered.length === 0 ? (
        <View className="items-center rounded-2xl border border-neutral-800 bg-neutral-900 py-16">
          <Text className="text-xs text-neutral-500">No research matches your search.</Text>
        </View>
      ) : (
        <View className="gap-4">
          {filtered.map((article) => (
            <View
              key={article.id}
              className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5"
            >
              <View className="flex-row items-center justify-between">
                <View className="rounded-full border border-neutral-800 bg-neutral-950 px-2.5 py-0.5">
                  <Text className="text-[10px] font-semibold uppercase text-neutral-400">
                    {article.category}
                  </Text>
                </View>
                <Text className="text-[10px] text-neutral-500">BY {article.author.toUpperCase()}</Text>
              </View>

              <Text className="mt-3 text-base font-bold leading-snug text-white">
                {article.title}
              </Text>

              <View className="mt-4 gap-1 rounded-2xl border border-brand-500/10 bg-brand-500/5 p-3.5">
                <View className="flex-row items-center gap-1.5">
                  <AlertCircle size={13} color={colors.brand400} />
                  <Text className="text-[10px] font-bold uppercase text-brand-400">
                    Popular Gym Bro Myth
                  </Text>
                </View>
                <Text className="text-xs italic leading-relaxed text-neutral-300">
                  "{article.myth}"
                </Text>
              </View>

              <View className="mt-3 gap-1.5 rounded-2xl border border-neutral-800 bg-neutral-950 p-3.5">
                <Text className="text-[10px] font-bold uppercase text-neutral-400">
                  Peer-Reviewed Evidence
                </Text>
                <Text className="text-xs leading-relaxed text-neutral-300">{article.evidence}</Text>
              </View>

              <View className="mt-3 gap-1 rounded-2xl border border-brand-500/10 bg-brand-500/5 p-3.5">
                <View className="flex-row items-center gap-1.5">
                  <Award size={13} color={colors.brand400} />
                  <Text className="text-[10px] font-bold uppercase text-brand-400">
                    Direct Gym Takeaway
                  </Text>
                </View>
                <Text className="text-xs leading-relaxed text-neutral-300">{article.takeaway}</Text>
              </View>

              <View className="mt-4 flex-row items-center justify-between border-t border-neutral-800/80 pt-4">
                <View className="flex-1 flex-row gap-1.5 pr-3">
                  <Quote size={12} color={colors.textDim} />
                  <Text className="flex-1 text-[9px] leading-normal text-neutral-500">
                    {article.citation}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-1.5">
                  <Eye size={13} color={colors.textMuted} />
                  <Text className="text-[11px] font-bold text-neutral-400">
                    {article.readCount.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}
