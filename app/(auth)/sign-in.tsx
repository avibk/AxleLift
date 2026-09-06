import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { Dumbbell, Lock, Mail } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { colors } from "@/lib/colors";

export default function SignIn() {
  const { signIn, isConfigured } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (isConfigured && (!email.trim() || !password)) {
      setError("Enter your email and password to continue.");
      return;
    }
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    if (result.error) setError(result.error);
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-950">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-6 py-10"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-10 items-center">
            <View className="mb-5 h-16 w-16 items-center justify-center rounded-3xl bg-brand-600">
              <Dumbbell size={30} color={colors.white} />
            </View>
            <Text className="text-3xl font-bold tracking-tight text-white">AxleLift</Text>
            <Text className="mt-2 text-center text-sm text-neutral-400">
              The science-based lifting OS. Welcome back.
            </Text>
          </View>

          <View className="gap-3">
            <TextField
              icon={<Mail size={18} color={colors.textFaint} />}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
            />
            <TextField
              icon={<Lock size={18} color={colors.textFaint} />}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {error ? (
            <View className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3">
              <Text className="text-xs text-red-300">{error}</Text>
            </View>
          ) : null}

          {!isConfigured ? (
            <View className="mt-4 rounded-2xl border border-brand-500/20 bg-brand-500/10 px-4 py-3">
              <Text className="text-xs text-brand-300">
                No backend connected yet — you'll explore in local demo mode.
              </Text>
            </View>
          ) : null}

          <Button
            label={isConfigured ? "Sign in" : "Continue to demo"}
            onPress={onSubmit}
            loading={loading}
            className="mt-6"
          />

          <View className="mt-6 flex-row items-center justify-center gap-1">
            <Text className="text-sm text-neutral-500">New here?</Text>
            <Link href="/(auth)/sign-up" asChild>
              <Pressable hitSlop={8}>
                <Text className="text-sm font-semibold text-brand-400">Create an account</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
