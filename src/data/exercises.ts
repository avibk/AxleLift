import { Exercise, TargetMuscle } from "@/src/types";

export const EXERCISE_DATABASE: Exercise[] = [
  {
    id: "ex-bench-press",
    name: "Barbell Bench Press",
    primaryMuscles: [TargetMuscle.CHEST],
    secondaryMuscles: [TargetMuscle.TRICEPS, TargetMuscle.SHOULDERS],
    category: "Chest",
    explanation:
      "A classic compound chest-builder emphasizing the sternocostatal head of the pectoralis major. Standard biomechanics suggest keeping elbows at a 45-75 degree angle relative to the torso to reduce subacromial impingement risk.",
    tips: [
      "Avoid flaring elbows 90 degrees; tuck them slightly to protect front delts.",
      "Control the eccentric (lowering) phase for 2-3 seconds for maximum stretch-mediated hypertrophy.",
      "Maintain a slight arch in the lower back and keep shoulder blades fully retracted.",
    ],
  },
  {
    id: "ex-incline-db",
    name: "Incline Dumbbell Fly-Press",
    primaryMuscles: [TargetMuscle.CHEST],
    secondaryMuscles: [TargetMuscle.SHOULDERS, TargetMuscle.TRICEPS],
    category: "Chest",
    explanation:
      "This hybrid movement targets the clavicular head (upper chest) under long muscle lengths. Research shows that training muscles at longer lengths leads to greater muscle growth compared to shorter lengths.",
    tips: [
      "Use an incline bench set to 15-30 degrees; higher angles shift tension to the anterior deltoid.",
      "Flares out dumbbells slightly on the way down, then brings them together at the top in a pressing motion.",
      "Pause for 1 second at the deep stretch position.",
    ],
  },
  {
    id: "ex-lat-pulldown",
    name: "Pronated Lat Pulldown",
    primaryMuscles: [TargetMuscle.BACK],
    secondaryMuscles: [TargetMuscle.BICEPS],
    category: "Back",
    explanation:
      "Primary driver of shoulder adduction, focusing heavily on the lower and mid latissimus dorsi. Optimal stretch is achieved when the arms are fully extended at the top phase.",
    tips: [
      "Drive down with the elbows, not your hands.",
      "Keep the chest proud and lean back very slightly (~10-15 degrees) to allow barbell clearance and optimal scapular retraction.",
      "Avoid using momentum to yank the bar down.",
    ],
  },
  {
    id: "ex-barbell-row",
    name: "Chest-Supported Row",
    primaryMuscles: [TargetMuscle.BACK],
    secondaryMuscles: [TargetMuscle.BICEPS],
    category: "Back",
    explanation:
      "Eliminates lower-back stability constraints, allowing complete mechanical tension overload on the upper back, rhomboids, trap middle fibers, and latissimus dorsi.",
    tips: [
      "Let individual shoulder blades spread out fully at the bottom range for a deep stretch.",
      "Squeeze shoulder blades together firmly at the top concentric phase.",
      "Keep spinal alignment strictly neutral; do not lift neck up.",
    ],
  },
  {
    id: "ex-hack-squat",
    name: "Hack Squat",
    primaryMuscles: [TargetMuscle.QUADS],
    secondaryMuscles: [TargetMuscle.GLUTES, TargetMuscle.CALVES],
    category: "Legs",
    explanation:
      "An exceptional exercise for isolating the quadriceps under stable conditions. Stability allows high neurological drive and safe progression to absolute mechanical failure (0-1 RIR).",
    tips: [
      "Place feet lower on the platform to maximize knee flexion (and thus quad hypertrophy), while ensuring your heels do not lift.",
      "Go as deep as pelvic stability allows without 'butt-wink' curving your lower spine.",
      "Exert a controlled eccentric of 3 seconds, pushing hard through the midfoot.",
    ],
  },
  {
    id: "ex-romanian-deadlift",
    name: "Dumbbell Romanian Deadlift",
    primaryMuscles: [TargetMuscle.HAMSTRINGS, TargetMuscle.GLUTES],
    secondaryMuscles: [TargetMuscle.BACK],
    category: "Legs",
    explanation:
      "Targets the hamstrings in their hip-extension function under loaded stretch. A premier exercise for eccentric-induced hypertrophy.",
    tips: [
      "Hinge at the hips: push your hips backwards as if trying to press a wall button with your glutes.",
      "Stop descending when your hips can no longer travel backwards, regardless of bar depth.",
      "Keep weights closely hugging your legs throughout the descent to protect the lumbar spine.",
    ],
  },
  {
    id: "ex-cable-lateral-raise",
    name: "Behind-the-Back Cable Lateral Raise",
    primaryMuscles: [TargetMuscle.SHOULDERS],
    secondaryMuscles: [],
    category: "Shoulders",
    explanation:
      "Unlike dumbbells, cables provide a flat, continuous resistance curve. Crucially, they place greatest tension at the bottom of the movement where the lateral medial deltoid is stretched.",
    tips: [
      "Set the pulley height to wrist height when the arm is resting by your side to align the line of pulls.",
      "Place cable behind your back to allow uninterrupted shoulder abduction.",
      "Think about pushing your hands outwards towards the walls, rather than throwing them up.",
    ],
  },
  {
    id: "ex-tricep-overhead",
    name: "Dual Rope Overhead Cable Extension",
    primaryMuscles: [TargetMuscle.TRICEPS],
    secondaryMuscles: [],
    category: "Arms",
    explanation:
      "Anatomically, the long head of the triceps crosses the shoulder joint. Thus, overhead exercises place it under loaded stretch, yielding significantly more growth according to empirical MRI studies.",
    tips: [
      "Use two ropes for full shoulder-width clearance and maximal elbow extension range.",
      "Keep elbows tucked near your head; do not let them flare wide.",
      "Accentuate the stretch at the bottom with a 1-second dynamic hold.",
    ],
  },
  {
    id: "ex-back-squat",
    name: "Barbell Back Squat",
    primaryMuscles: [TargetMuscle.QUADS],
    secondaryMuscles: [TargetMuscle.GLUTES, TargetMuscle.HAMSTRINGS],
    category: "Legs",
    explanation:
      "The king of lower-body compounds, loading the quads and glutes through a deep knee and hip flexion under heavy axial load.",
    tips: [
      "Brace your core hard before descending.",
      "Drive through mid-foot and keep knees tracking over toes.",
    ],
  },
  {
    id: "ex-deadlift",
    name: "Conventional Deadlift",
    primaryMuscles: [TargetMuscle.BACK, TargetMuscle.HAMSTRINGS],
    secondaryMuscles: [TargetMuscle.GLUTES, TargetMuscle.QUADS],
    category: "Back",
    explanation:
      "A full-body hip-hinge that builds the posterior chain, spinal erectors, and grip under maximal load.",
    tips: [
      "Keep the bar pinned against your shins and legs.",
      "Push the floor away rather than yanking the bar up.",
    ],
  },
  {
    id: "ex-ohp",
    name: "Barbell Overhead Press",
    primaryMuscles: [TargetMuscle.SHOULDERS],
    secondaryMuscles: [TargetMuscle.TRICEPS],
    category: "Shoulders",
    explanation:
      "A standing vertical press that overloads the anterior and lateral deltoids while demanding full-body stability.",
    tips: [
      "Squeeze glutes to prevent lower-back arch.",
      "Shrug slightly at lockout to finish the rep.",
    ],
  },
  {
    id: "ex-pullup",
    name: "Pull-Up",
    primaryMuscles: [TargetMuscle.BACK],
    secondaryMuscles: [TargetMuscle.BICEPS],
    category: "Back",
    explanation:
      "A bodyweight vertical pull emphasizing the lats through a full overhead stretch to a chest-high contraction.",
    tips: [
      "Initiate by depressing the shoulder blades.",
      "Control the negative; avoid kipping for hypertrophy.",
    ],
  },
  {
    id: "ex-bent-row",
    name: "Barbell Bent-Over Row",
    primaryMuscles: [TargetMuscle.BACK],
    secondaryMuscles: [TargetMuscle.BICEPS],
    category: "Back",
    explanation:
      "A horizontal pull that thickens the mid-back, rhomboids, and lats with heavy loading.",
    tips: [
      "Hinge to ~45 degrees and keep a neutral spine.",
      "Pull to the lower ribcage, not the chest.",
    ],
  },
  {
    id: "ex-seated-row",
    name: "Seated Cable Row",
    primaryMuscles: [TargetMuscle.BACK],
    secondaryMuscles: [TargetMuscle.BICEPS],
    category: "Back",
    explanation:
      "A controlled horizontal pull with constant cable tension, ideal for mid-back contraction and a full stretch.",
    tips: [
      "Let the shoulder blades protract on the stretch.",
      "Avoid using torso momentum to move the weight.",
    ],
  },
  {
    id: "ex-leg-press",
    name: "Leg Press",
    primaryMuscles: [TargetMuscle.QUADS],
    secondaryMuscles: [TargetMuscle.GLUTES],
    category: "Legs",
    explanation:
      "A machine-stabilized quad builder allowing safe progression to near-failure with high loads.",
    tips: [
      "Use a full range without rounding the lower back.",
      "Keep heels planted throughout the press.",
    ],
  },
  {
    id: "ex-leg-extension",
    name: "Leg Extension",
    primaryMuscles: [TargetMuscle.QUADS],
    secondaryMuscles: [],
    category: "Legs",
    explanation:
      "An isolation movement loading the quadriceps, especially the rectus femoris, in a shortened position.",
    tips: ["Pause briefly at full extension.", "Control the eccentric for a deeper stretch."],
  },
  {
    id: "ex-leg-curl",
    name: "Lying Leg Curl",
    primaryMuscles: [TargetMuscle.HAMSTRINGS],
    secondaryMuscles: [],
    category: "Legs",
    explanation: "Isolates the hamstrings via knee flexion with minimal hip involvement.",
    tips: ["Avoid lifting the hips off the pad.", "Squeeze hard at peak contraction."],
  },
  {
    id: "ex-hip-thrust",
    name: "Barbell Hip Thrust",
    primaryMuscles: [TargetMuscle.GLUTES],
    secondaryMuscles: [TargetMuscle.HAMSTRINGS],
    category: "Legs",
    explanation:
      "The premier glute isolation, peaking tension at full hip extension where the glutes are strongest.",
    tips: ["Tuck the chin and keep ribs down.", "Pause and squeeze glutes at the top."],
  },
  {
    id: "ex-db-shoulder-press",
    name: "Dumbbell Shoulder Press",
    primaryMuscles: [TargetMuscle.SHOULDERS],
    secondaryMuscles: [TargetMuscle.TRICEPS],
    category: "Shoulders",
    explanation:
      "A seated vertical press allowing a greater range of motion and independent shoulder loading.",
    tips: [
      "Lower until elbows are just below shoulder height.",
      "Avoid clashing dumbbells at the top.",
    ],
  },
  {
    id: "ex-db-lateral-raise",
    name: "Dumbbell Lateral Raise",
    primaryMuscles: [TargetMuscle.SHOULDERS],
    secondaryMuscles: [],
    category: "Shoulders",
    explanation: "Isolates the lateral deltoid for shoulder width via pure abduction.",
    tips: ["Lead with the elbows, not the hands.", "Use a slow tempo and avoid swinging."],
  },
  {
    id: "ex-face-pull",
    name: "Cable Face Pull",
    primaryMuscles: [TargetMuscle.SHOULDERS],
    secondaryMuscles: [TargetMuscle.BACK],
    category: "Shoulders",
    explanation:
      "Targets the rear delts and upper-back rotators, improving posture and shoulder health.",
    tips: [
      "Pull toward the forehead with high elbows.",
      "Externally rotate at the end range.",
    ],
  },
  {
    id: "ex-bicep-curl",
    name: "Dumbbell Bicep Curl",
    primaryMuscles: [TargetMuscle.BICEPS],
    secondaryMuscles: [],
    category: "Arms",
    explanation: "A classic isolation loading the biceps through elbow flexion and supination.",
    tips: ["Keep elbows pinned at your sides.", "Supinate the wrist as you curl up."],
  },
  {
    id: "ex-hammer-curl",
    name: "Hammer Curl",
    primaryMuscles: [TargetMuscle.BICEPS],
    secondaryMuscles: [],
    category: "Arms",
    explanation:
      "A neutral-grip curl emphasizing the brachialis and brachioradialis for arm thickness.",
    tips: ["Maintain a neutral grip throughout.", "Avoid swinging the torso for momentum."],
  },
  {
    id: "ex-tricep-pushdown",
    name: "Tricep Cable Pushdown",
    primaryMuscles: [TargetMuscle.TRICEPS],
    secondaryMuscles: [],
    category: "Arms",
    explanation:
      "An isolation for the triceps lateral and medial heads under constant cable tension.",
    tips: ["Keep elbows tucked and still.", "Fully extend and squeeze at the bottom."],
  },
  {
    id: "ex-calf-raise",
    name: "Standing Calf Raise",
    primaryMuscles: [TargetMuscle.CALVES],
    secondaryMuscles: [],
    category: "Legs",
    explanation: "Loads the gastrocnemius through a full stretch-to-contraction ankle range.",
    tips: ["Pause at the bottom stretch.", "Rise onto the big toe at the top."],
  },
  {
    id: "ex-cable-crunch",
    name: "Cable Crunch",
    primaryMuscles: [TargetMuscle.ABS],
    secondaryMuscles: [],
    category: "Core",
    explanation:
      "A loadable ab flexion movement allowing progressive overload of the rectus abdominis.",
    tips: [
      "Flex the spine by crunching ribs to pelvis.",
      "Keep hips fixed; move only the torso.",
    ],
  },
];

export function getExerciseName(id: string): string {
  if (id.startsWith("custom:")) return id.slice(7);
  return EXERCISE_DATABASE.find((e) => e.id === id)?.name || "Exercise";
}
