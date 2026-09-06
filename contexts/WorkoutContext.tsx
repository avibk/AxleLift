import { createContext, useContext, type ReactNode } from "react";
import { useWorkoutSession } from "@/hooks/useWorkoutSession";

type WorkoutContextValue = ReturnType<typeof useWorkoutSession>;

const WorkoutContext = createContext<WorkoutContextValue | undefined>(undefined);

/** Shares one workout/ELO state across every tab so saves reflect everywhere. */
export function WorkoutProvider({ children }: { children: ReactNode }) {
  const value = useWorkoutSession();
  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
}

export function useWorkout(): WorkoutContextValue {
  const ctx = useContext(WorkoutContext);
  if (!ctx) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return ctx;
}
