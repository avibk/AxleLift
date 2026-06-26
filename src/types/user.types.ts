export enum GymRank {
  NOVICE = "Novice",
  INTERMEDIATE = "Intermediate",
  ADVANCED = "Advanced",
  ELITE = "Elite",
  MONSTER = "Evidence-Based Monster",
}

export interface EloProfile {
  lifetimeElo: number;
  seasonalElo: number;
  components: {
    strength: number;
    progress: number;
    consistency: number;
    scienceScore: number;
  };
  rank: GymRank;
  seasonName: string;
  weekOfSeason: number;
}

export interface LeaderboardUser {
  id: string;
  username: string;
  avatarUrl?: string;
  score: number;
  rankName: GymRank;
  badges: string[];
  metaValue?: string;
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
  timestamp: number;
}
