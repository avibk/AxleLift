import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const LOCAL_AVATAR_KEY = "axlelift_avatar_uri";
const AVATAR_BUCKET = "avatars";

function avatarPath(userId: string): string {
  return `${userId}/avatar.jpg`;
}

export const avatarService = {
  async getLocalAvatarUri(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(LOCAL_AVATAR_KEY);
    } catch {
      return null;
    }
  },

  async saveLocalAvatarUri(uri: string): Promise<void> {
    await AsyncStorage.setItem(LOCAL_AVATAR_KEY, uri);
  },

  async pickFromGallery(): Promise<string | null> {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      throw new Error("Photo library permission is required to set your profile picture.");
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]?.uri) return null;
    return result.assets[0].uri;
  },

  async uploadAvatar(userId: string, localUri: string): Promise<string> {
    if (!isSupabaseConfigured || !supabase) {
      await this.saveLocalAvatarUri(localUri);
      return localUri;
    }

    const response = await fetch(localUri);
    const blob = await response.blob();
    const path = avatarPath(userId);

    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(path, blob, {
        upsert: true,
        contentType: "image/jpeg",
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
    const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", userId);

    if (profileError) throw profileError;

    await this.saveLocalAvatarUri(publicUrl);
    return publicUrl;
  },

  async pickAndUpload(userId: string | null): Promise<string | null> {
    const localUri = await this.pickFromGallery();
    if (!localUri) return null;

    if (!userId) {
      await this.saveLocalAvatarUri(localUri);
      return localUri;
    }

    return this.uploadAvatar(userId, localUri);
  },
};
