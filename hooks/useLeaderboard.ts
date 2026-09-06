import { useCallback, useEffect, useState } from "react";
import { leaderboardService, type LeaderboardId } from "@/services/leaderboardService";
import { LeaderboardUser } from "@/src/types";
import { useAuth } from "@/contexts/AuthContext";
import { isSupabaseConfigured } from "@/lib/supabase";

export type { LeaderboardId };

export function useLeaderboard(initialBoard: LeaderboardId = "lifetime") {
  const { user } = useAuth();
  const [activeBoard, setActiveBoard] = useState<LeaderboardId>(initialBoard);
  const [entries, setEntries] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setEntries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await leaderboardService.fetchBoard(activeBoard);
      setEntries(data);
    } catch {
      setError("Could not load leaderboard.");
    } finally {
      setLoading(false);
    }
  }, [activeBoard]);

  useEffect(() => {
    load();
  }, [load]);

  const entriesWithSelf = entries.map((entry) => ({
    ...entry,
    username:
      entry.id === user?.id && !entry.username.endsWith("(You)")
        ? `${entry.username} (You)`
        : entry.username,
  }));

  return {
    activeBoard,
    setActiveBoard,
    entries: entriesWithSelf,
    loading,
    error,
    reload: load,
  };
}
