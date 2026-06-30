import { ActivityIndicator, View } from "react-native";
import { colors } from "@/lib/colors";

export function Loader() {
  return (
    <View className="flex-1 items-center justify-center bg-neutral-950">
      <ActivityIndicator color={colors.brand400} size="large" />
    </View>
  );
}
