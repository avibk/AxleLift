import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { Camera, CircleUser } from "lucide-react-native";
import { colors } from "@/lib/colors";

interface UserAvatarProps {
  uri?: string | null;
  name?: string | null;
  size?: number;
  editable?: boolean;
  onPress?: () => void;
}

function getInitials(name?: string | null): string | null {
  const words = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (words.length === 0) return null;
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function UserAvatar({ uri, name, size = 44, editable = false, onPress }: UserAvatarProps) {
  const radius = size / 2;
  const iconSize = Math.round(size * 0.55);
  const initials = getInitials(name);
  const imageUri = uri?.trim() || null;
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUri]);

  const content = imageUri && !imageFailed ? (
    <Image
      source={{ uri: imageUri }}
      style={{ width: size, height: size, borderRadius: radius }}
      contentFit="cover"
      transition={200}
      onError={() => setImageFailed(true)}
    />
  ) : (
    <View
      className="items-center justify-center border border-brand-500/40 bg-brand-600"
      style={{ width: size, height: size, borderRadius: radius }}
    >
      {initials ? (
        <Text style={{ color: colors.white, fontSize: Math.max(11, Math.round(size * 0.38)), fontWeight: "700" }}>
          {initials}
        </Text>
      ) : (
        <CircleUser size={iconSize} color={colors.white} />
      )}
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
