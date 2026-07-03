import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { EloProfile, GymRank, WorkoutExercise, WorkoutSession } from "@/src/types";
import { calculateNextEloProfile } from "@/src/store/userStore";
import { DEFAULT_WORKOUT_STATE, WorkoutState } from "@/src/store/workoutStore";

const SESSIONS_KEY = "axlelift_sessions";
const ELO_KEY = "axlelift_elo";

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // best effort; storage failures shouldn't crash the app
  }
}

function rowToSession(row: any): WorkoutSession {
  return {
    id: row.id,
    name: row.name,
    timestamp: Number(row.performed_at),
    durationMinutes: row.duration_minutes ?? 0,
    notes: row.notes ?? undefined,
    exercises: (row.exercises ?? []) as WorkoutExercise[],
  };
}

function sessionToRow(session: WorkoutSession, userId: string) {
  return {
    id: session.id,
    user_id: userId,
    name: session.name,
    performed_at: session.timestamp,
    duration_minutes: session.durationMinutes,
    notes: session.notes ?? null,
    exercises: session.exercises,
  };
}

function profileToElo(row: any): EloProfile {
  return {
    ...DEFAULT_WORKOUT_STATE.userElo,
    lifetimeElo: row.lifetime_elo ?? DEFAULT_WORKOUT_STATE.userElo.lifetimeElo,
    seasonalElo: row.seasonal_elo ?? DEFAULT_WORKOUT_STATE.userElo.seasonalElo,
    rank: (row.rank as GymRank) ?? DEFAULT_WORKOUT_STATE.userElo.rank,
    components: row.components ?? DEFAULT_WORKOUT_STATE.userElo.components,
  };
}

export const workoutService = {
  async loadLocal(): Promise<WorkoutState> {
    const [sessions, userElo] = await Promise.all([
      readJson<WorkoutSession[]>(SESSIONS_KEY, DEFAULT_WORKOUT_STATE.sessions),
      readJson<EloProfile>(ELO_KEY, DEFAULT_WORKOUT_STATE.userElo),
    ]);
    return { sessions, userElo };
  },

  async saveLocal(state: WorkoutState): Promise<void> {
    await Promise.all([
      writeJson(SESSIONS_KEY, state.sessions),
      writeJson(ELO_KEY, state.userElo),
    ]);
  },

  async loadRemote(userId: string): Promise<WorkoutState> {
    if (!supabase) throw new Error("Supabase not configured");

    const { data: rows, error } = await supabase
      .from("workout_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("performed_at", { ascending: false });
    if (error) throw error;

    const { data: profile } = await supabase
      .from("profiles")
      .select("lifetime_elo, seasonal_elo, rank, components")
      .eq("id", userId)
      .maybeSingle();

    return {
      sessions: (rows ?? []).map(rowToSession),
      userElo: profile ? profileToElo(profile) : DEFAULT_WORKOUT_STATE.userElo,
    };
  },

  async appendRemote(session: WorkoutSession, nextElo: EloProfile, userId: string): Promise<void> {
    if (!supabase) return;

    const { error: insertError } = await supabase
      .from("workout_sessions")
      .insert(sessionToRow(session, userId));
    if (insertError) throw insertError;

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        lifetime_elo: nextElo.lifetimeElo,
        seasonal_elo: nextElo.seasonalElo,
        rank: nextElo.rank,
        components: nextElo.components,
      })
      .eq("id", userId);
    if (profileError) throw profileError;
  },

  /** Source of truth is Supabase when authed; otherwise local AsyncStorage. */
  async loadState(userId?: string | null): Promise<WorkoutState> {
    if (isSupabaseConfigured && supabase && userId) {
      try {
        const remote = await this.loadRemote(userId);
        await this.saveLocal(remote);
        return remote;
      } catch (err) {
        if (__DEV__) console.warn("[workoutService] remote load failed, using local:", err);
        return this.loadLocal();
      }
    }
    return this.loadLocal();
  },

  async appendSession(
    session: WorkoutSession,
    current: WorkoutState,
    userId?: string | null
  ): Promise<WorkoutState> {
    const next: WorkoutState = {
      sessions: [session, ...current.sessions],
      userElo: calculateNextEloProfile(current.userElo, session),
    };

    await this.saveLocal(next);

    if (isSupabaseConfigured && supabase && userId) {
      try {
        await this.appendRemote(session, next.userElo, userId);
      } catch (err) {
        if (__DEV__) console.warn("[workoutService] remote sync failed:", err);
      }
    }

    return next;
  },
};
