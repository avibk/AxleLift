import { WorkoutSession, TargetMuscle, MuscleStatus } from "../types";
import { EXERCISE_DATABASE } from "../data/exercises";

/**
 * Calculates stimulus score based on Reps In Reserve (RIR).
 * High tension / low RIR yields the highest stimulus.
 */
export function calculateStimulusScore(rir: number, reps: number): number {
  if (reps === 0) return 0;
  // Standard scale optimized for muscle growth drive:
  // rir 0 -> 10.0
  // rir 1 -> 9.4
  // rir 2 -> 8.2
  // rir 3 -> 6.8
  // rir 4 -> 5.2
  // rir 5 -> 3.5
  // rir > 5 -> 2.0
  let base = 10.0;
  if (rir === 0) base = 10.0;
  else if (rir === 1) base = 9.4;
  else if (rir === 2) base = 8.2;
  else if (rir === 3) base = 6.8;
  else if (rir === 4) base = 5.2;
  else if (rir === 5) base = 3.5;
  else base = 2.0;

  // Tiny adjustment to promote optimal hypertrophic rep spectrum (5-15 reps)
  let factor = 1.0;
  if (reps >= 5 && reps <= 15) {
    factor = 1.0;
  } else if (reps > 15) {
    factor = 0.95; // slightly lower stimulus efficiency due to metabolic fatiguing factor
  } else if (reps < 5) {
    factor = 0.90; // slightly lower hypertrophy absolute volume efficiency
  }

  return parseFloat((base * factor).toFixed(1));
}

/**
 * Calculates effective reps. According to Beardsley,
 * the final 5 reps before mechanical failure (0 RIR) are effective.
 */
export function calculateEffectiveReps(rir: number, reps: number): number {
  if (reps === 0) return 0;
  return Math.max(0, Math.min(5, Math.min(reps, 5 - rir)));
}

/**
 * Estimates 1 Rep Max using the Epley formula:
 * 1RM = Weight * (1 + Reps / 30)
 */
export function calculateEstimated1RM(weight: number, reps: number): number {
  if (reps <= 0) return 0;
  if (reps === 1) return weight;
  return parseFloat((weight * (1 + reps / 30)).toFixed(1));
}

/**
 * Maps exercises and completed sets to muscle groups, supporting 0.5 secondary muscle volume allocation.
 */
export function getMuscleVolumeStats(sessions: WorkoutSession[]): MuscleStatus[] {
  // Initialize map for all target muscles
  const volumeMap: Record<TargetMuscle, number> = {} as any;
  Object.values(TargetMuscle).forEach((m) => {
    volumeMap[m] = 0;
  });

  // Target ranges based on weekly recommendations
  const TARGET_RANGES: Record<TargetMuscle, { min: number; max: number }> = {
    [TargetMuscle.CHEST]: { min: 10, max: 15 },
    [TargetMuscle.BACK]: { min: 10, max: 15 },
    [TargetMuscle.QUADS]: { min: 8, max: 12 },
    [TargetMuscle.HAMSTRINGS]: { min: 8, max: 12 },
    [TargetMuscle.GLUTES]: { min: 6, max: 10 },
    [TargetMuscle.SHOULDERS]: { min: 8, max: 14 },
    [TargetMuscle.BICEPS]: { min: 6, max: 10 },
    [TargetMuscle.TRICEPS]: { min: 6, max: 10 },
    [TargetMuscle.ABS]: { min: 4, max: 8 },
    [TargetMuscle.CALVES]: { min: 4, max: 8 },
  };

  // We filter to workouts in the last 7 days to simulate a weekly score
  const now = Date.now();
  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const recentSessions = sessions.filter((s) => now - s.timestamp <= ONE_WEEK_MS);

  recentSessions.forEach((session) => {
    session.exercises.forEach((workEx) => {
      const exerciseDef = EXERCISE_DATABASE.find((e) => e.id === workEx.exerciseId);
      if (!exerciseDef) return;

      const setList = workEx.sets;
      // Filter out empty sets
      const completedSets = setList.filter((s) => s.reps > 0);

      completedSets.forEach((set) => {
        // Effective sets: standard sets with sound intensity (RIR <= 3) count fully,
        // low intensity sets (RIR >= 4) count at half volume, as they produce minimal stimulus
        const setVolumeWeight = set.rir <= 3 ? 1.0 : 0.5;

        // Primary muscles get full credit
        exerciseDef.primaryMuscles.forEach((m) => {
          volumeMap[m] += setVolumeWeight;
        });

        // Secondary muscles get 0.5 indirect credit (evidence-based style)
        exerciseDef.secondaryMuscles.forEach((m) => {
          volumeMap[m] += setVolumeWeight * 0.5;
        });
      });
    });
  });

  return Object.values(TargetMuscle).map((m) => {
    const vol = parseFloat(volumeMap[m].toFixed(1));
    const range = TARGET_RANGES[m];
    let status: "Undertrained" | "Optimal" | "Overreaching" = "Undertrained";

    if (vol >= range.min && vol <= range.max) {
      status = "Optimal";
    } else if (vol > range.max) {
      status = "Overreaching";
    }

    return {
      muscle: m,
      effectiveSets: vol,
      targetRange: range,
      status,
    };
  });
}

export interface ProgressionRecommendation {
  type: "increase_weight" | "increase_reps" | "maintain" | "deload";
  title: string;
  explanation: string;
  targetWeight: number;
  targetRepsRange: string;
  originalWeight: number;
  originalReps: number;
}

/**
 * Analyzes exercise history to recommend progression for a specific exercise.
 * Rules:
 * - If last session had a set with 0 RIR or 1 RIR and hit target high reps, increase load by 2.5kg / 5%.
 * - If they hit all sets at lower RIR but under target reps, maintain load and aim for +1 rep.
 * - If they hit RIR >= 4, recommend increasing intensity (aim for higher load or focus on 0-2 RIR range).
 * - If strength has dropped over 3 sessions, recommend a deload week.
 */
export function getProgressionRecommendation(
  exerciseId: string,
  history: WorkoutSession[]
): ProgressionRecommendation {
  const exercise = EXERCISE_DATABASE.find((e) => e.id === exerciseId);
  const exerciseName = exercise ? exercise.name : "this exercise";

  // Filter history that contains this exercise, sorted by timestamp descending
  const relevantSessions = history
    .filter((s) => s.exercises.some((e) => e.exerciseId === exerciseId))
    .sort((a, b) => b.timestamp - a.timestamp);

  if (relevantSessions.length === 0) {
    return {
      type: "maintain",
      title: "Establish Baseline",
      explanation: `No prior history found. Perform a warm-up, select a weight where you can do 8-12 reps leaving 1-2 repetitions in reserve (RIR), and log it.`,
      targetWeight: 0,
      targetRepsRange: "8 - 12",
      originalWeight: 0,
      originalReps: 0,
    };
  }

  const lastSession = relevantSessions[0];
  const lastExercise = lastSession.exercises.find((e) => e.exerciseId === exerciseId);
  const lastSets = lastExercise ? lastExercise.sets.filter((s) => s.reps > 0) : [];

  if (lastSets.length === 0) {
    return {
      type: "maintain",
      title: "Establish Baseline",
      explanation: `No prior completed sets found. Start with a challenging weight for 8-10 reps.`,
      targetWeight: 0,
      targetRepsRange: "8 - 12",
      originalWeight: 0,
      originalReps: 0,
    };
  }

  // Find the highest performance set (highest weight)
  const bestSetByWeight = [...lastSets].sort((a, b) => b.weight - a.weight)[0];
  const maxWeight = bestSetByWeight.weight;
  const maxRepsVal = bestSetByWeight.reps;
  const maxRir = bestSetByWeight.rir;

  // Let's analyze.
  // Rule 1: High Effort hit high reps -> Overload!
  if (maxRir <= 1 && maxRepsVal >= 10) {
    const increment = maxWeight >= 100 ? 5 : maxWeight >= 40 ? 2.5 : 1;
    return {
      type: "increase_weight",
      title: "Double Progression Triggered!",
      explanation: `Awesome! You hit ${maxRepsVal} reps at a strong effort level of ${maxRir} RIR with ${maxWeight}kg in your previous session. Science recommends adding a micro-load and aiming for the lower rep band.`,
      targetWeight: maxWeight + increment,
      targetRepsRange: "6 - 8",
      originalWeight: maxWeight,
      originalReps: maxRepsVal,
    };
  }

  // Rule 2: Low Effort (high RIR) -> Encourage pushing harder (safer weights or just pushing to failure)
  if (maxRir >= 4) {
    return {
      type: "increase_reps",
      title: "Increase Effort Level",
      explanation: `In your last session, you stopped at ${maxRepsVal} reps with ${maxRir} RIR. At ${maxRir} RIR, muscle recruiting recruitment remains low. Keep weight at ${maxWeight}kg but focus on taking the sets closer to target failure (ideal: 1-2 RIR).`,
      targetWeight: maxWeight,
      targetRepsRange: `${maxRepsVal + 1} - ${maxRepsVal + 2}`,
      originalWeight: maxWeight,
      originalReps: maxRepsVal,
    };
  }

  // Rule 3: Check stagnation over multiple sessions. If 1RM has trended downwards for 3 consecutive workouts, trigger a deload.
  if (relevantSessions.length >= 3) {
    const getSessionMax1RM = (session: WorkoutSession) => {
      const ex = session.exercises.find((e) => e.exerciseId === exerciseId);
      const sts = ex ? ex.sets.filter((s) => s.reps > 0) : [];
      if (sts.length === 0) return 0;
      return Math.max(...sts.map((s) => calculateEstimated1RM(s.weight, s.reps)));
    };

    const oneRm1 = getSessionMax1RM(relevantSessions[0]); // Last session
    const oneRm2 = getSessionMax1RM(relevantSessions[1]); // Prev session
    const oneRm3 = getSessionMax1RM(relevantSessions[2]); // 3 sessions ago

    if (oneRm1 < oneRm2 && oneRm2 < oneRm3 && oneRm1 > 0 && oneRm2 > 0 && oneRm3 > 0) {
      return {
        type: "deload",
        title: "Fatigue Overload: Deload Diagnostic",
        explanation: `Your estimated 1RM strength on ${exerciseName} has steadily decreased across 3 consecutive sessions. Systemic fatigue has outpaced muscular recovery. Reduce weight by 20% and reps by 2 for one week to resensitizing fibers.`,
        targetWeight: Math.round(maxWeight * 0.8),
        targetRepsRange: `${Math.max(4, maxRepsVal - 2)}`,
        originalWeight: maxWeight,
        originalReps: maxRepsVal,
      };
    }
  }

  // Rule 4: Standard Rep progression. Keep weight, add 1 rep.
  return {
    type: "increase_reps",
    title: "Linear Volume Progression",
    explanation: `You did ${maxWeight}kg x ${maxRepsVal} at ${maxRir} RIR last time. Your intensity is in the hypertrophic sweet-spot (0-2 RIR). Retain ${maxWeight}kg but push to secure 1-2 more reps this workout before adding load.`,
    targetWeight: maxWeight,
    targetRepsRange: `${maxRepsVal + 1}`,
    originalWeight: maxWeight,
    originalReps: maxRepsVal,
  };
}
