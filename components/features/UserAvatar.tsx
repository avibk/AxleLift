import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { Camera, CircleUser } from "lucide-react-native";
import { colors } from "@/lib/colors";

interface UserAvatarProps {
  uri?: string | null;
  size?: number;
  editable?: boolean;
  onPress?: () => void;
}

export function UserAvatar({ uri, size = 44, editable = false, onPress }: UserAvatarProps) {
  const radius = size / 2;
  const iconSize = Math.round(size * 0.55);

  const content = uri ? (
    <Image
      source={{ uri }}
      style={{ width: size, height: size, borderRadius: radius }}
      contentFit="cover"
      transition={200}
    />
  ) : (
    <View
      className="items-center justify-center bg-neutral-800"
      style={{ width: size, height: size, borderRadius: radius }}
    >
      <CircleUser size={iconSize} color={colors.textMuted} />
    </View>
  );

  const avatar = (
    <View style={{ width: size, height: size }}>
      {content}
      {editable ? (
        <View
          className="absolute bottom-0 right-0 items-center justify-center rounded-full border border-neutral-800 bg-brand-600"
          style={{ width: size * 0.32, height: size * 0.32 }}
        >
          <Camera size={Math.max(10, size * 0.16)} color={colors.white} />
        </View>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} className="active:opacity-80">
        {avatar}
      </Pressable>
    );
  }

  return avatar;
}
