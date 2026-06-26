import { EloProfile, GymRank, WorkoutSession } from "../types";

export function getRankForElo(lifetimeElo: number): GymRank {
  if (lifetimeElo < 1000) return GymRank.NOVICE;
  if (lifetimeElo < 1500) return GymRank.INTERMEDIATE;
  if (lifetimeElo < 2000) return GymRank.ADVANCED;
  if (lifetimeElo < 2500) return GymRank.ELITE;
  return GymRank.MONSTER;
}

export function calculateNextEloProfile(userElo: EloProfile, newSession: WorkoutSession): EloProfile {
  const completedSetsCount = newSession.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);

  const averageStimulus =
    newSession.exercises.reduce((sumEx, ex) => {
      const avgSetStimulus =
        ex.sets.reduce((sumSet, set) => sumSet + (set.stimulusScore || 8), 0) / (ex.sets.length || 1);
      return sumEx + avgSetStimulus;
    }, 0) / (newSession.exercises.length || 1);

  const strengthIncrement = Math.round(completedSetsCount * 0.4);
  const progressIncrement = 4;
  const consistencyIncrement = 5;
  const scienceIncrement = Math.round(averageStimulus * 1.8);
  const totalIncrement = Math.round(
    (strengthIncrement + progressIncrement + consistencyIncrement + scienceIncrement) / 3
  );

  const lifetimeElo = userElo.lifetimeElo + totalIncrement;

  return {
    ...userElo,
    lifetimeElo,
    seasonalElo: userElo.seasonalElo + Math.round(totalIncrement * 1.2),
    rank: getRankForElo(lifetimeElo),
    components: {
      strength: Math.min(100, userElo.components.strength + Math.round(strengthIncrement / 1.5)),
      progress: Math.min(100, userElo.components.progress + progressIncrement),
      consistency: Math.min(100, userElo.components.consistency + consistencyIncrement),
      scienceScore: Math.min(100, userElo.components.scienceScore + Math.round(scienceIncrement / 2.5)),
    },
  };
}
