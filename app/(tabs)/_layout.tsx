import { Tabs } from "expo-router";
import { Activity, BookOpen, Dumbbell, LayoutGrid, Trophy } from "lucide-react-native";
import { colors } from "@/lib/colors";

export default function TabsLayout() {
  return (
    <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.brand400,
          tabBarInactiveTintColor: colors.textFaint,
          tabBarStyle: {
            backgroundColor: "#0a0a0a",
            borderTopColor: "#262626",
            borderTopWidth: 1,
            height: 88,
            paddingTop: 8,
            paddingBottom: 30,
          },
          tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="logger"
          options={{
            title: "Log",
            tabBarIcon: ({ color, size }) => <Dumbbell color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="leaderboards"
          options={{
            title: "Ranks",
            tabBarIcon: ({ color, size }) => <Trophy color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="insights"
          options={{
            title: "Insights",
            tabBarIcon: ({ color, size }) => <Activity color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="feed"
          options={{
            title: "Feed",
            tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
          }}
        />
      </Tabs>
  );
}
