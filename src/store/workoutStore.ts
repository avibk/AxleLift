import { EloProfile, WorkoutSession } from "../types";
import { DEFAULT_ELO_PROFILE } from "../constants/defaults";

export interface WorkoutState {
  sessions: WorkoutSession[];
  userElo: EloProfile;
}

export const WORKOUT_STORAGE_KEYS = {
  sessions: "axlelift_sessions",
  elo: "axlelift_elo",
  legacySessions: "science_lift_sessions",
  legacyElo: "science_lift_elo",
} as const;

export const DEFAULT_WORKOUT_STATE: WorkoutState = {
  sessions: [],
  userElo: DEFAULT_ELO_PROFILE,
};
