import type { Problem, Solve } from "./schema";

// ============================================================================
// Dynamic Pricing with Partial Solves
// ============================================================================
// Formula (CTFd linear decay style adapted for partial solves):
//
//   effectiveSolves = SUM(testcasesPassed / 10) for all solves on a problem
//   currentPoints = MAX(minimum, initial - (initial - minimum) * (effectiveSolves / decay))
//
// Example:
//   initial = 500, minimum = 100, decay = 20
//   If 5 users solved 10/10 and 10 users solved 5/10:
//   effectiveSolves = 5 * (10/10) + 10 * (5/10) = 5 + 5 = 10
//   currentPoints = MAX(100, 500 - (500 - 100) * (10 / 20))
//                 = MAX(100, 500 - 400 * 0.5)
//                 = MAX(100, 300) = 300
// ============================================================================

const TOTAL_TESTCASES = 10;

/**
 * Calculate the effective solve contribution for a single solve
 * @param testcasesPassed Number of testcases passed (0-10)
 * @returns Decimal solve contribution (0.0 - 1.0)
 */
export function calculateSolveContribution(testcasesPassed: number): number {
  return testcasesPassed / TOTAL_TESTCASES;
}

/**
 * Calculate effective solves for a problem from an array of solves
 * @param solves Array of solve records
 * @returns Total effective solves as a decimal
 */
export function calculateEffectiveSolves(
  solves: Pick<Solve, "testcasesPassed">[],
): number {
  return solves.reduce(
    (sum, solve) => sum + calculateSolveContribution(solve.testcasesPassed),
    0,
  );
}

/**
 * Calculate current points for a problem based on effective solves
 * Uses CTFd linear decay formula
 * @param problem Problem with initial, minimum, decay, and effectiveSolves
 * @returns Current point value (integer)
 */
export function calculateCurrentPoints(
  problem: Pick<Problem, "initial" | "minimum" | "decay">,
  noOfSolves: number,
): number {
  const { initial, minimum, decay } = problem;

  // Avoid division by zero
  if (decay <= 0) {
    return minimum;
  }

  // CTFd linear decay formula
  const decayRatio = noOfSolves / decay;
  const pointReduction = (initial - minimum) * decayRatio;
  const points = initial - pointReduction;

  // Clamp to minimum and round to integer
  return Math.max(minimum, Math.round(points));
}

/**
 * Calculate points earned by a user based on their testcases passed
 * Points are proportional to testcases passed
 * @param currentPoints Current point value of the problem
 * @param testcasesPassed Number of testcases passed by the user (0-10)
 * @returns Points earned (integer)
 */
export function calculateUserScore(
  currentPoints: number,
  testcasesPassed: number,
): number {
  const proportion = testcasesPassed / TOTAL_TESTCASES;
  return Math.round(currentPoints * proportion);
}

/**
 * Calculate the new effective solves after a solve is updated
 * @param currentEffectiveSolves Current effective solves on the problem
 * @param oldTestcasesPassed Previous testcases passed (0 if new solve)
 * @param newTestcasesPassed New testcases passed
 * @returns Updated effective solves
 */
export function updateEffectiveSolves(
  currentEffectiveSolves: number,
  oldTestcasesPassed: number,
  newTestcasesPassed: number,
): number {
  const oldContribution = calculateSolveContribution(oldTestcasesPassed);
  const newContribution = calculateSolveContribution(newTestcasesPassed);
  return currentEffectiveSolves - oldContribution + newContribution;
}

/**
 * Recalculate cached scores for all solves on a problem
 * Call this after effectiveSolves changes on a problem
 * @param problem The problem with updated effectiveSolves
 * @param solves All solves for this problem
 * @returns Array of solve IDs with their new cached scores
 */
export function recalculateSolveScores(
  problem: Pick<Problem, "initial" | "minimum" | "decay">,
  solves: Pick<Solve, "id" | "testcasesPassed">[],
  noOfSolves: number,
): { id: string; cachedScore: number }[] {
  const currentPoints = calculateCurrentPoints(problem, noOfSolves);

  return solves.map((solve) => ({
    id: solve.id,
    cachedScore: calculateUserScore(currentPoints, solve.testcasesPassed),
  }));
}

// ============================================================================
// SQL Helpers for Database Queries
// ============================================================================

/**
 * SQL expression for calculating current points directly in the database
 * Use this in raw SQL queries for leaderboards
 *
 * @example
 * ```sql
 * SELECT
 *   p.id,
 *   p.title,
 *   GREATEST(p.minimum, p.initial - (p.initial - p.minimum) * (p."effectiveSolves" / p.decay)) as current_points
 * FROM "Problem" p
 * WHERE p."roundId" = $1
 * ```
 */
export const CURRENT_POINTS_SQL = `
  GREATEST(
    "minimum",
    "initial" - ("initial" - "minimum") * ("effectiveSolves" / NULLIF("decay", 0))
  )
`;

/**
 * SQL expression for calculating a user's score from their solve
 *
 * @example
 * ```sql
 * SELECT
 *   s.id,
 *   s."userId",
 *   s."testcasesPassed",
 *   ROUND(
 *     GREATEST(p.minimum, p.initial - (p.initial - p.minimum) * (p."effectiveSolves" / p.decay))
 *     * (s."testcasesPassed" / 10.0)
 *   ) as score
 * FROM "Solve" s
 * JOIN "Problem" p ON s."problemId" = p.id
 * ```
 */
export const USER_SCORE_SQL = `
  ROUND(
    GREATEST(
      p."minimum",
      p."initial" - (p."initial" - p."minimum") * (p."effectiveSolves" / NULLIF(p."decay", 0))
    ) * (s."testcasesPassed" / 10.0)
  )
`;

// ============================================================================
// Leaderboard Query Helpers
// ============================================================================

/**
 * Get leaderboard SQL for a round
 * Groups by team, sums scores, orders by total score then earliest solve time
 */
export const TEAM_LEADERBOARD_SQL = `
  SELECT
    t.id as "teamId",
    t.name as "teamName",
    COALESCE(SUM(
      ROUND(
        GREATEST(
          p."minimum",
          p."initial" - (p."initial" - p."minimum") * (p."effectiveSolves" / NULLIF(p."decay", 0))
        ) * (s."testcasesPassed" / 10.0)
      )
    ), 0) as "totalScore",
    COUNT(DISTINCT CASE WHEN s."testcasesPassed" = 10 THEN s."problemId" END) as "fullSolves",
    COUNT(DISTINCT CASE WHEN s."testcasesPassed" > 0 THEN s."problemId" END) as "partialSolves",
    MIN(s."firstSolveAt") as "earliestSolve"
  FROM "Team" t
  LEFT JOIN "Solve" s ON s."teamId" = t.id
  LEFT JOIN "Problem" p ON s."problemId" = p.id
  LEFT JOIN "Round" r ON p."roundId" = r.id
  WHERE r.id = $1
    AND t.hidden = false
    AND t.disqualify = false
  GROUP BY t.id, t.name
  ORDER BY "totalScore" DESC, "earliestSolve" ASC NULLS LAST
`;

/**
 * Get detailed problem scores for a specific team in a round
 */
export const TEAM_PROBLEM_SCORES_SQL = `
  SELECT
    p.id as "problemId",
    p.title,
    p.difficulty,
    GREATEST(
      p."minimum",
      p."initial" - (p."initial" - p."minimum") * (p."effectiveSolves" / NULLIF(p."decay", 0))
    ) as "currentPoints",
    COALESCE(s."testcasesPassed", 0) as "testcasesPassed",
    ROUND(
      GREATEST(
        p."minimum",
        p."initial" - (p."initial" - p."minimum") * (p."effectiveSolves" / NULLIF(p."decay", 0))
      ) * (COALESCE(s."testcasesPassed", 0) / 10.0)
    ) as score,
    s."firstSolveAt",
    s."lastImprovedAt"
  FROM "Problem" p
  LEFT JOIN "Solve" s ON s."problemId" = p.id AND s."teamId" = $2
  WHERE p."roundId" = $1 AND p."isHidden" = false
  ORDER BY p.difficulty, p.title
`;
