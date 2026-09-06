import { Redirect } from "expo-router";

// The auth guard in app/_layout.tsx redirects to sign-in when needed.
export default function Index() {
  return <Redirect href="/(tabs)" />;
}
