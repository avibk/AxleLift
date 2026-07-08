import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const LOCAL_AVATAR_KEY = "axlelift_avatar_uri";
const AVATAR_BUCKET = "avatars";

export interface PickedImage {
  uri: string;
  base64: string | null;
  mimeType: string | null;
}

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

  async clearLocalAvatarUri(): Promise<void> {
    try {
      await AsyncStorage.removeItem(LOCAL_AVATAR_KEY);
    } catch {
      // Non-fatal: the local cache may already be empty.
    }
  },

  async pickImage(): Promise<PickedImage | null> {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      throw new Error("Photo library permission is required to set your profile picture.");
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    const asset = result.assets?.[0];
    if (result.canceled || !asset?.uri) return null;

    return {
      uri: asset.uri,
      base64: asset.base64 ?? null,
      mimeType: asset.mimeType ?? null,
    };
  },

  async uploadAvatar(userId: string, image: PickedImage): Promise<string> {
    if (!isSupabaseConfigured || !supabase) {
      await this.saveLocalAvatarUri(image.uri);
      return image.uri;
    }

    if (!image.base64) {
      throw new Error("Could not read the selected image. Please try another photo.");
    }

    const path = avatarPath(userId);
    const contentType = image.mimeType ?? "image/jpeg";

    // React Native cannot reliably upload a Blob to Supabase Storage (it writes a
    // 0-byte file), so decode the base64 payload to an ArrayBuffer and upload that.
    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(path, decode(image.base64), {
        upsert: true,
        contentType,
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

  async removeAvatar(userId: string | null): Promise<void> {
    await this.clearLocalAvatarUri();

    if (!userId || !isSupabaseConfigured || !supabase) return;

    const { error: removeError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .remove([avatarPath(userId)]);

    // A missing object is not a fatal error when removing.
    if (removeError && !/not found/i.test(removeError.message)) {
      throw removeError;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ avatar_url: null })
      .eq("id", userId);

    if (profileError) throw profileError;
  },
};
