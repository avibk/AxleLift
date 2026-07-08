import { useEffect, useState } from "react";
import {
  Alert,
  type AlertButton,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { AtSign, ChevronLeft, Lock, LogOut, Mail, Trophy } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useWorkout } from "@/contexts/WorkoutContext";
import { UserAvatar } from "@/components/features/UserAvatar";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Loader } from "@/components/ui/Loader";
import { colors } from "@/lib/colors";

export default function SettingsScreen() {
  const { user, signOut, isConfigured } = useAuth();
  const { profile, loading, updateUsername, updatePassword, updateAvatar, removeAvatar } =
    useProfile();
  const { userElo } = useWorkout();

  const [username, setUsername] = useState("");
  const [usernameInitialized, setUsernameInitialized] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingUsername, setSavingUsername] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile && !usernameInitialized) {
      setUsername(profile.username);
      setUsernameInitialized(true);
    }
  }, [profile, usernameInitialized]);

  const displayRank = profile?.rank ?? userElo.rank;
  const displayElo = profile?.lifetimeElo ?? userElo.lifetimeElo;
  const email = user?.email ?? "Not available";

  const onSaveUsername = async () => {
    setError(null);
    setMessage(null);
    setSavingUsername(true);
    const err = await updateUsername(username);
    setSavingUsername(false);
    if (err) setError(err);
    else setMessage("Username updated.");
  };

  const onChangePassword = async () => {
    setError(null);
    setMessage(null);
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSavingPassword(true);
    const err = await updatePassword(newPassword);
    setSavingPassword(false);
    if (err) setError(err);
    else {
      setMessage("Password updated.");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const onChangeAvatar = async () => {
    setError(null);
    setMessage(null);
    setUploadingAvatar(true);
    const result = await updateAvatar();
    setUploadingAvatar(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.url) {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
      setMessage("Profile picture updated.");
    }
  };

  const onRemoveAvatar = async () => {
    setError(null);
    setMessage(null);
    setUploadingAvatar(true);
    const result = await removeAvatar();
    setUploadingAvatar(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    setMessage("Profile picture removed.");
  };

  const onPressAvatar = () => {
    if (uploadingAvatar) return;

    const buttons: AlertButton[] = [
      { text: "Choose from library", onPress: onChangeAvatar },
    ];
    if (profile?.avatarUrl) {
      buttons.push({ text: "Remove photo", style: "destructive", onPress: onRemoveAvatar });
    }
    buttons.push({ text: "Cancel", style: "cancel" });

    Alert.alert("Profile picture", undefined, buttons);
  };

  const confirmSignOut = () =>
    Alert.alert("Sign out", "Sign out of AxleLift?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/sign-in");
        },
      },
    ]);

  return (
    <SafeAreaView className="flex-1 bg-neutral-950">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="flex-row items-center gap-3 border-b border-neutral-800 px-4 py-4">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-neutral-900 active:opacity-80"
          >
            <ChevronLeft size={22} color={colors.textMuted} />
          </Pressable>
          <Text className="text-xl font-bold text-white">Settings</Text>
        </View>

        {loading && isConfigured ? (
          <Loader />
        ) : (
          <ScrollView
            contentContainerClassName="gap-6 px-5 py-6"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="items-center gap-3 py-2">
              <UserAvatar
                uri={profile?.avatarUrl}
                size={80}
                editable
                onPress={uploadingAvatar ? undefined : onPressAvatar}
              />
              <Text className="text-xs text-neutral-500">
                {uploadingAvatar ? "Saving…" : "Tap to change or remove"}
              </Text>
            </View>

            <View className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
              <View className="flex-row items-center gap-2">
                <Trophy size={18} color={colors.brand400} />
                <Text className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Your rank
                </Text>
              </View>
              <Text className="mt-2 text-2xl font-bold text-white">{displayRank}</Text>
              <Text className="mt-1 text-sm text-neutral-400">{displayElo} lifetime ELO</Text>
            </View>

            <View className="gap-3">
              <Text className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Account
              </Text>
              <TextField
                icon={<Mail size={18} color={colors.textFaint} />}
                value={email}
                editable={false}
                placeholder="Email"
              />
              <TextField
                icon={<AtSign size={18} color={colors.textFaint} />}
                value={username}
                onChangeText={setUsername}
                placeholder="Username"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {isConfigured ? (
                <Button
                  label="Save username"
                  onPress={onSaveUsername}
                  loading={savingUsername}
                  variant="secondary"
                />
              ) : null}
            </View>

            {isConfigured ? (
              <View className="gap-3">
                <Text className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Change password
                </Text>
                <TextField
                  icon={<Lock size={18} color={colors.textFaint} />}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="New password"
                  secureTextEntry
                  autoCapitalize="none"
                />
                <TextField
                  icon={<Lock size={18} color={colors.textFaint} />}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  secureTextEntry
                  autoCapitalize="none"
                />
                <Button
                  label="Update password"
                  onPress={onChangePassword}
                  loading={savingPassword}
                  variant="secondary"
                />
              </View>
            ) : null}

            {error ? (
              <View className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                <Text className="text-xs text-red-300">{error}</Text>
              </View>
            ) : null}

            {message ? (
              <View className="rounded-2xl border border-brand-500/20 bg-brand-500/10 px-4 py-3">
                <Text className="text-xs text-brand-300">{message}</Text>
              </View>
            ) : null}

            <Button
              label="Sign out"
              onPress={confirmSignOut}
              variant="ghost"
              icon={<LogOut size={16} color={colors.textMuted} />}
              className="mt-2"
            />
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
