import { WorkoutSession } from "../types";
import { calculateNextEloProfile } from "../store/userStore";
import { DEFAULT_WORKOUT_STATE, WORKOUT_STORAGE_KEYS, WorkoutState } from "../store/workoutStore";

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export const workoutService = {
  loadState(): WorkoutState {
    const sessions =
      readJson<WorkoutSession[]>(WORKOUT_STORAGE_KEYS.sessions) ??
      readJson<WorkoutSession[]>(WORKOUT_STORAGE_KEYS.legacySessions) ??
      DEFAULT_WORKOUT_STATE.sessions;

    const userElo =
      readJson<WorkoutState["userElo"]>(WORKOUT_STORAGE_KEYS.elo) ??
      readJson<WorkoutState["userElo"]>(WORKOUT_STORAGE_KEYS.legacyElo) ??
      DEFAULT_WORKOUT_STATE.userElo;

    const state = { sessions, userElo };
    this.persistState(state);
    return state;
  },

  persistState(state: WorkoutState) {
    writeJson(WORKOUT_STORAGE_KEYS.sessions, state.sessions);
    writeJson(WORKOUT_STORAGE_KEYS.elo, state.userElo);
  },

  appendSession(session: WorkoutSession, current: WorkoutState): WorkoutState {
    const nextState = {
      sessions: [session, ...current.sessions],
      userElo: calculateNextEloProfile(current.userElo, session),
    };

    this.persistState(nextState);
    return nextState;
  },
};
