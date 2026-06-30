import { useMemo, useState } from "react";
import { MOCK_LEADERBOARDS } from "@/src/utils/mockData";

export type LeaderboardId = keyof typeof MOCK_LEADERBOARDS;

export function useLeaderboard(initialBoard: LeaderboardId = "bench") {
  const [activeBoard, setActiveBoard] = useState<LeaderboardId>(initialBoard);

  const entries = useMemo(() => MOCK_LEADERBOARDS[activeBoard], [activeBoard]);

  return {
    activeBoard,
    setActiveBoard,
    entries,
  };
}
