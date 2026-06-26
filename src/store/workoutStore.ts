import { EloProfile, WorkoutSession } from "../types";
import { INITIAL_ELO_PROFILE, INITIAL_WORKOUT_HISTORY } from "../utils/mockData";

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
  sessions: INITIAL_WORKOUT_HISTORY,
  userElo: INITIAL_ELO_PROFILE,
};
