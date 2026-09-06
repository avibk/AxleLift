import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { GymRank, LeaderboardUser } from "@/src/types";

export type LeaderboardId = "lifetime" | "seasonal" | "progress" | "consistency" | "science";

interface ProfileRow {
  id: string;
  username: string | null;
  avatar_url: string | null;
  lifetime_elo: number;
  seasonal_elo: number;
  rank: string;
  components: {
    strength?: number;
    progress?: number;
    consistency?: number;
    scienceScore?: number;
  } | null;
}

function parseRank(value: string | null | undefined): GymRank {
  const ranks = Object.values(GymRank) as string[];
  if (value && ranks.includes(value)) return value as GymRank;
  return GymRank.NOVICE;
}

function scoreForBoard(row: ProfileRow, board: LeaderboardId): number {
  const c = row.components ?? {};
  switch (board) {
    case "lifetime":
      return row.lifetime_elo;
    case "seasonal":
      return row.seasonal_elo;
    case "progress":
      return c.progress ?? 0;
    case "consistency":
      return c.consistency ?? 0;
    case "science":
      return c.scienceScore ?? 0;
  }
}

function metaForBoard(row: ProfileRow, board: LeaderboardId): string {
  switch (board) {
    case "lifetime":
      return `${row.lifetime_elo} ELO`;
    case "seasonal":
      return `${row.seasonal_elo} ELO`;
    case "progress":
      return `${row.components?.progress ?? 0}/100`;
    case "consistency":
      return `${row.components?.consistency ?? 0}/100`;
    case "science":
      return `${row.components?.scienceScore ?? 0}/100`;
  }
}

function rowToEntry(row: ProfileRow, board: LeaderboardId): LeaderboardUser {
  return {
    id: row.id,
    username: row.username || "Lifter",
    avatarUrl: row.avatar_url ?? undefined,
    score: scoreForBoard(row, board),
    rankName: parseRank(row.rank),
    badges: [],
    metaValue: metaForBoard(row, board),
  };
}

const ORDER_COLUMN: Record<LeaderboardId, string> = {
  lifetime: "lifetime_elo",
  seasonal: "seasonal_elo",
  progress: "lifetime_elo",
  consistency: "lifetime_elo",
  science: "lifetime_elo",
};

export const leaderboardService = {
  async fetchBoard(board: LeaderboardId): Promise<LeaderboardUser[]> {
    if (!isSupabaseConfigured || !supabase) return [];

    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, lifetime_elo, seasonal_elo, rank, components")
      .order(ORDER_COLUMN[board], { ascending: false })
      .limit(50);

    if (error) {
      if (__DEV__) console.warn("[leaderboard] fetch failed:", error.message);
      throw error;
    }

    const rows = (data ?? []) as ProfileRow[];
    return rows
      .map((row) => rowToEntry(row, board))
      .sort((a, b) => b.score - a.score);
  },
};
