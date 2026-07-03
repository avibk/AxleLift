import { EloProfile, GymRank } from "@/src/types";

export const DEFAULT_ELO_PROFILE: EloProfile = {
  lifetimeElo: 1000,
  seasonalElo: 0,
  components: {
    strength: 40,
    progress: 30,
    consistency: 50,
    scienceScore: 35,
  },
  rank: GymRank.NOVICE,
  seasonName: "Season 1",
  weekOfSeason: 1,
};
