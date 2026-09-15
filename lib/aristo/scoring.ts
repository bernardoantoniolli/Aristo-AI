import { AnalysisScores } from "./types";

export function calculateScore(scores: AnalysisScores) {
  const score =
    scores.offer * 0.30 +
    scores.conversion * 0.25 +
    scores.acquisition * 0.25 +
    scores.economics * 0.20;

  return Math.round(score * 10);
}

export function getStatus(score: number) {
  if (score < 50) return "red";
  if (score < 75) return "yellow";
  return "green";
}
