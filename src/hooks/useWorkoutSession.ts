import { useCallback, useEffect, useState } from "react";
import { WorkoutSession } from "../types";
import { workoutService } from "../services/workoutService";
import { DEFAULT_WORKOUT_STATE, WorkoutState } from "../store/workoutStore";

export function useWorkoutSession() {
  const [state, setState] = useState<WorkoutState>(DEFAULT_WORKOUT_STATE);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setState(workoutService.loadState());
    setIsReady(true);
  }, []);

  const saveSession = useCallback((session: WorkoutSession) => {
    setState((current) => workoutService.appendSession(session, current));
  }, []);

  return {
    sessions: state.sessions,
    userElo: state.userElo,
    saveSession,
    isReady,
  };
}
