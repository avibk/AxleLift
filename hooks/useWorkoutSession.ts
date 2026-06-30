import { useCallback, useEffect, useState } from "react";
import { WorkoutSession } from "@/src/types";
import { workoutService } from "@/services/workoutService";
import { DEFAULT_WORKOUT_STATE, WorkoutState } from "@/src/store/workoutStore";
import { useAuth } from "@/contexts/AuthContext";

export function useWorkoutSession() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [state, setState] = useState<WorkoutState>(DEFAULT_WORKOUT_STATE);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    setIsReady(false);

    workoutService.loadState(userId).then((loaded) => {
      if (!mounted) return;
      setState(loaded);
      setIsReady(true);
    });

    return () => {
      mounted = false;
    };
  }, [userId]);

  const saveSession = useCallback(
    async (session: WorkoutSession) => {
      const next = await workoutService.appendSession(session, state, userId);
      setState(next);
    },
    [state, userId]
  );

  return {
    sessions: state.sessions,
    userElo: state.userElo,
    saveSession,
    isReady,
  };
}
