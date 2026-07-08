import { useCallback, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { avatarService, type PickedImage } from "@/services/avatarService";

export interface UserProfile {
  id: string;
  username: string;
  lifetimeElo: number;
  seasonalElo: number;
  rank: string;
  avatarUrl: string | null;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.id) {
      const localAvatar = await avatarService.getLocalAvatarUri();
      if (localAvatar) {
        setProfile({
          id: "local",
          username: "Guest",
          lifetimeElo: 1000,
          seasonalElo: 0,
          rank: "Novice",
          avatarUrl: localAvatar,
        });
      } else {
        setProfile(null);
      }
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      const localAvatar = await avatarService.getLocalAvatarUri();
      setProfile({
        id: user.id,
        username: user.email?.split("@")[0] ?? "Lifter",
        lifetimeElo: 1000,
        seasonalElo: 0,
        rank: "Novice",
        avatarUrl: localAvatar,
      });
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("profiles")
      .select("id, username, lifetime_elo, seasonal_elo, rank, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    setLoading(false);

    if (fetchError) {
      setError(fetchError.message);
      return;
    }

    if (data) {
      const localAvatar = await avatarService.getLocalAvatarUri();
      setProfile({
        id: data.id,
        username: data.username ?? user.email?.split("@")[0] ?? "Lifter",
        lifetimeElo: data.lifetime_elo,
        seasonalElo: data.seasonal_elo,
        rank: data.rank,
        avatarUrl: data.avatar_url ?? localAvatar,
      });
    }
  }, [user?.id, user?.email]);

  useEffect(() => {
    load();
  }, [load]);

  const updateUsername = async (username: string): Promise<string | null> => {
    if (!user?.id || !supabase) return "Not signed in.";

    const trimmed = username.trim();
    if (trimmed.length < 2) return "Username must be at least 2 characters.";

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ username: trimmed })
      .eq("id", user.id);

    if (updateError) return updateError.message;

    setProfile((prev) => (prev ? { ...prev, username: trimmed } : prev));
    return null;
  };

  const updatePassword = async (password: string): Promise<string | null> => {
    if (!supabase) return "Backend not configured.";
    if (password.length < 6) return "Password must be at least 6 characters.";

    const { error: updateError } = await supabase.auth.updateUser({ password });
    return updateError?.message ?? null;
  };

  const buildFallbackProfile = (avatarUrl: string | null): UserProfile => ({
    id: user?.id ?? "local",
    username: user?.email?.split("@")[0] ?? "Guest",
    lifetimeElo: 1000,
    seasonalElo: 0,
    rank: "Novice",
    avatarUrl,
  });

  const updateAvatar = async (): Promise<{
    url: string | null;
    error: string | null;
    canceled: boolean;
  }> => {
    let picked: PickedImage | null;
    try {
      picked = await avatarService.pickImage();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to open the photo library.";
      return { url: null, error: message, canceled: false };
    }

    if (!picked) return { url: null, error: null, canceled: true };
    const image = picked;

    const previousAvatar = profile?.avatarUrl ?? null;

    // Optimistic: show the selected photo immediately while it uploads.
    setProfile((prev) =>
      prev ? { ...prev, avatarUrl: image.uri } : buildFallbackProfile(image.uri)
    );

    try {
      let url = image.uri;
      if (user?.id) {
        url = await avatarService.uploadAvatar(user.id, image);
      } else {
        await avatarService.saveLocalAvatarUri(image.uri);
      }

      setProfile((prev) =>
        prev ? { ...prev, avatarUrl: url } : buildFallbackProfile(url)
      );
      return { url, error: null, canceled: false };
    } catch (err) {
      // Revert to the previous avatar if the upload fails.
      setProfile((prev) => (prev ? { ...prev, avatarUrl: previousAvatar } : prev));
      const message =
        err instanceof Error ? err.message : "Failed to update profile picture.";
      return { url: null, error: message, canceled: false };
    }
  };

  const removeAvatar = async (): Promise<{ error: string | null }> => {
    const previousAvatar = profile?.avatarUrl ?? null;
    if (!previousAvatar) return { error: null };

    // Optimistic clear.
    setProfile((prev) => (prev ? { ...prev, avatarUrl: null } : prev));

    try {
      await avatarService.removeAvatar(user?.id ?? null);
      return { error: null };
    } catch (err) {
      setProfile((prev) => (prev ? { ...prev, avatarUrl: previousAvatar } : prev));
      const message =
        err instanceof Error ? err.message : "Failed to remove profile picture.";
      return { error: message };
    }
  };

  return {
    profile,
    loading,
    error,
    reload: load,
    updateUsername,
    updatePassword,
    updateAvatar,
    removeAvatar,
  };
}
