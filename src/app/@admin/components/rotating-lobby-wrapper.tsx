import LiveLeaderboard from "./live-leaderboard";
import { db } from "@/db";
import { teams, solve, problems } from "@/db/schema";
import {
  calculateSolveContribution,
  calculateCurrentPoints,
} from "@/db/scoring";

export default async function RotatingLobbyWrapper() {
  // Fetch all solve rows
  const solveRows = await db
    .select({
      problemId: solve.problemId,
      teamId: solve.teamId,
      testcasesPassed: solve.testcasesPassed,
    })
    .from(solve);

  // Fetch all problems for point calculation
  const problemRows = await db
    .select({
      id: problems.id,
      initial: problems.initial,
      minimum: problems.minimum,
      decay: problems.decay,
      effectiveSolves: problems.effectiveSolves,
    })
    .from(problems);

  // Calculate current points per problem using official scoring
  const currentPointsByProblem = new Map<string, number>();
  for (const problem of problemRows) {
    // Sum effective solves from solve rows
    const problemSolves = solveRows.filter((r) => r.problemId === problem.id);
    const effectiveSolves = problemSolves.reduce(
      (sum, r) => sum + calculateSolveContribution(r.testcasesPassed),
      0,
    );
    const points = calculateCurrentPoints({
      initial: problem.initial,
      minimum: problem.minimum,
      decay: problem.decay,
      effectiveSolves,
    });
    currentPointsByProblem.set(problem.id, points);
  }

  // Calculate team scores
  const teamScoresMap = new Map<string, number>();
  for (const row of solveRows) {
    const currentPoints = currentPointsByProblem.get(row.problemId);
    if (currentPoints === undefined) continue;
    const contribution = calculateSolveContribution(row.testcasesPassed);
    const score = Math.round(currentPoints * contribution);
    teamScoresMap.set(row.teamId, (teamScoresMap.get(row.teamId) ?? 0) + score);
  }

  // Fetch teams and build leaderboard
  const adminTeamId = process.env.ADMIN_TEAM_ID ?? "";
  const teamRows = await db
    .select({ id: teams.id, name: teams.name, hidden: teams.hidden, disqualify: teams.disqualify })
    .from(teams);

  const leaderboard = teamRows
    .filter((team) => !team.hidden && !team.disqualify && team.id !== adminTeamId)
    .map((team) => ({
      id: team.id,
      name: team.name,
      score: teamScoresMap.get(team.id) ?? 0,
    }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="h-screen w-screen overflow-hidden bg-black">
      <LiveLeaderboard initialLeaderboard={leaderboard} />
    </div>
  );
}
