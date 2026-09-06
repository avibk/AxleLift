import { View, Text } from "react-native";
import { Dumbbell } from "lucide-react-native";
import { FadeInView } from "@/components/ui/FadeInView";
import { colors } from "@/lib/colors";

/** Branded startup screen — matches sign-in logo treatment. */
export function AppSplash() {
  return (
    <View className="flex-1 items-center justify-center bg-neutral-950">
      <FadeInView>
        <View className="items-center">
          <View className="mb-5 h-16 w-16 items-center justify-center rounded-3xl bg-brand-600">
            <Dumbbell size={30} color={colors.white} />
          </View>
          <Text className="text-3xl font-bold tracking-tight text-white">AxleLift</Text>
        </View>
      </FadeInView>
    </View>
  );
}
