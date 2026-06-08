export enum TargetMuscle {
  CHEST = "Chest",
  BACK = "Back",
  QUADS = "Quads",
  HAMSTRINGS = "Hamstrings",
  GLUTES = "Glutes",
  SHOULDERS = "Shoulders",
  BICEPS = "Biceps",
  TRICEPS = "Triceps",
  ABS = "Abs",
  CALVES = "Calves",
}

export interface TrainingSet {
  id: string;
  weight: number;      // in kg
  reps: number;
  rir: number;         // Reps In Reserve (0 to 5+)
  restTime: number;    // in seconds
  stimulusScore?: number; // Calculated: 1-10
  effectiveReps?: number; // Calculated
  estimated1RM?: number;  // weight / (1.0278 - (0.0278 * reps))
}

export interface Exercise {
  id: string;
  name: string;
  primaryMuscles: TargetMuscle[];
  secondaryMuscles: TargetMuscle[];
  category: "Chest" | "Back" | "Legs" | "Shoulders" | "Arms" | "Core";
  explanation: string;
  tips: string[];
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  sets: TrainingSet[];
}

export interface WorkoutSession {
  id: string;
  name: string;
  timestamp: number; // unix ms
  exercises: WorkoutExercise[];
  notes?: string;
  durationMinutes: number;
}

export interface MuscleStatus {
  muscle: TargetMuscle;
  effectiveSets: number;
  targetRange: { min: number; max: number };
  status: "Undertrained" | "Optimal" | "Overreaching";
}

export enum GymRank {
  NOVICE = "Novice",
  INTERMEDIATE = "Intermediate",
  ADVANCED = "Advanced",
  ELITE = "Elite",
  MONSTER = "Evidence-Based Monster",
}

export interface EloProfile {
  lifetimeElo: number;
  seasonalElo: number; // 12-week season
  components: {
    strength: number;      // 30% ratio (0-100)
    progress: number;      // 30% ratio (0-100)
    consistency: number;   // 20% ratio (0-100)
    scienceScore: number;  // 20% ratio (0-100)
  };
  rank: GymRank;
  seasonName: string;
  weekOfSeason: number;
}

export interface LeaderboardUser {
  id: string;
  username: string;
  avatarUrl?: string;
  score: number; // Elo or metric
  rankName: GymRank;
  badges: string[];
  metaValue?: string; // "140kg", "+18%", "45 days"
}

export interface ScienceArticle {
  id: string;
  title: string;
  category: "Hypertrophy" | "Biomechanics" | "Nutrition" | "Recovery" | "Myths";
  myth: string;
  evidence: string;
  takeaway: string;
  author: string;
  citation: string;
  readCount: number;
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
  timestamp: number;
}
