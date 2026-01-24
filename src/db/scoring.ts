import type { Problem, Solve } from "./schema";

// ============================================================================
// Dynamic Pricing with Partial Solves (Squared Decay Formula)
// ============================================================================
// Formula:
//
//   effectiveSolves = SUM(testcasesPassed / 10) for all solves on a problem
//   currentPoints = MAX(minimum, initial - (initial - minimum) * (effectiveSolves² / decay²))
//
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
 * Uses squared decay formula
 * @param problem Problem with initial, minimum, decay
 * @param effectiveSolves The computed effective solves for this problem
 * @returns Current point value (integer)
 */
export function calculateCurrentPoints(
  problem: Pick<Problem, "initial" | "minimum" | "decay" | "effectiveSolves">,
): number {
  const { initial, minimum, decay, effectiveSolves } = problem;

  // Squared decay formula: (effectiveSolves² / decay²)
  const decayRatio = effectiveSolves ** 2 / decay ** 2;
  const pointReduction = (initial - minimum) * decayRatio;
  const points = initial - pointReduction;

  // Clamp to minimum and round to integer
  return Math.max(minimum, Math.round(points));
}

/**
 * Calculate points earned by a submission based on their testcases passed
 * Points are proportional to testcases passed using squared decay
 * @param problem Problem with initial, minimum, decay
 * @param testcasesPassed Number of testcases passed by the submission (0-10)
 * @returns Object containing submissionScore, currentPoints, and newEffectiveSolves
 */
export function calculateSubmissionScore(
  problem: Pick<Problem, "initial" | "minimum" | "decay" | "effectiveSolves">,
  testcasesPassed: number,
): {
  submissionScore: number;
  currentPoints: number;
  newEffectiveSolves: number;
} {
  const { initial, minimum, decay, effectiveSolves } = problem;

  // Include this submission's contribution in effective solves
  const newEffectiveSolves =
    effectiveSolves + testcasesPassed / TOTAL_TESTCASES;

  // Squared decay formula
  const decayRatio = newEffectiveSolves ** 2 / decay ** 2;
  const pointReduction = (initial - minimum) * decayRatio;
  const currentPoints = Math.max(minimum, initial - pointReduction);

  // Score is proportional to testcases passed
  const submissionScore = Math.round(
    currentPoints * (testcasesPassed / TOTAL_TESTCASES),
  );
  return { submissionScore, currentPoints, newEffectiveSolves };
}

// ============================================================================
// SQL Helpers for Database Queries
// ============================================================================

/**
 * CTE to calculate effective solves per problem
 * effectiveSolves = SUM(testcasesPassed / 10.0) for all solves on a problem
 */
export const EFFECTIVE_SOLVES_CTE = `
  "ProblemEffectiveSolves" AS (
    SELECT
      "problemId",
      COALESCE(SUM("testcasesPassed" / 10.0), 0) AS "effectiveSolves"
    FROM "Solve"
    GROUP BY "problemId"
  )
`;

/**
 * SQL expression for calculating current points using squared decay
 * Requires effective_solves to be available (from CTE or subquery)
 *
 * Formula: GREATEST(minimum, initial - (initial - minimum) * (effectiveSolves² / decay²))
 */
export const CURRENT_POINTS_EXPR = (
  effectiveSolvesExpr: string,
  prefix = "p",
) => `
  GREATEST(
    ${prefix}."minimum",
    ${prefix}."initial" - (${prefix}."initial" - ${prefix}."minimum") *
      (POWER(COALESCE(${effectiveSolvesExpr}, 0), 2) / POWER(${prefix}."decay", 2))
  )
`;

// ============================================================================
// Leaderboard Query Helpers
// ============================================================================

/**
 * Get team leaderboard SQL for a round
 * Uses CTE for effective solves calculation, then computes scores
 * Groups by team, sums scores, orders by total score then earliest solve time
 *
 * Parameters: $1 = roundId
 */
export const TEAM_LEADERBOARD_SQL = `
  WITH ${EFFECTIVE_SOLVES_CTE},
  "ProblemCurrentPoints" AS (
    SELECT
      p.id AS "problemId",
      p."roundId",
      ${CURRENT_POINTS_EXPR('pes."effectiveSolves"', "p")} AS "currentPoints"
    FROM "Problem" p
    LEFT JOIN "ProblemEffectiveSolves" pes ON pes."problemId" = p.id
    WHERE p."roundId" = $1
  )
  SELECT
    t.id AS "teamId",
    t.name AS "teamName",
    COALESCE(SUM(
      ROUND(pcp."currentPoints" * (s."testcasesPassed" / 10.0))
    ), 0)::int AS "totalScore",
    COUNT(DISTINCT CASE WHEN s."testcasesPassed" = 10 THEN s."problemId" END)::int AS "fullSolves",
    COUNT(DISTINCT CASE WHEN s."testcasesPassed" > 0 THEN s."problemId" END)::int AS "partialSolves"
  FROM "Team" t
  LEFT JOIN "Solve" s ON s."teamId" = t.id
  LEFT JOIN "ProblemCurrentPoints" pcp ON pcp."problemId" = s."problemId"
  WHERE t.hidden = false
    AND t.disqualify = false
  GROUP BY t.id, t.name
  HAVING COALESCE(SUM(
    CASE WHEN pcp."problemId" IS NOT NULL
    THEN ROUND(pcp."currentPoints" * (s."testcasesPassed" / 10.0))
    ELSE 0 END
  ), 0) > 0
  ORDER BY "totalScore" DESC, t.name ASC
`;

/**
 * Get detailed problem scores for a specific team in a round
 * Shows each problem with current points and team's score
 *
 * Parameters: $1 = roundId, $2 = teamId
 */
export const TEAM_PROBLEM_SCORES_SQL = `
  WITH ${EFFECTIVE_SOLVES_CTE}
  SELECT
    p.id AS "problemId",
    p.title,
    p.difficulty,
    ROUND(${CURRENT_POINTS_EXPR('pes."effectiveSolves"', "p")})::int AS "currentPoints",
    COALESCE(s."testcasesPassed", 0)::int AS "testcasesPassed",
    ROUND(
      ${CURRENT_POINTS_EXPR('pes."effectiveSolves"', "p")} * (COALESCE(s."testcasesPassed", 0) / 10.0)
    )::int AS score
  FROM "Problem" p
  LEFT JOIN "ProblemEffectiveSolves" pes ON pes."problemId" = p.id
  LEFT JOIN "Solve" s ON s."problemId" = p.id AND s."teamId" = $2
  WHERE p."roundId" = $1 AND p."isHidden" = false
  ORDER BY
    CASE p.difficulty
      WHEN 'EASY' THEN 1
      WHEN 'MEDIUM' THEN 2
      WHEN 'HARD' THEN 3
    END,
    p.title
`;

/**
 * Get current points for all problems in a round
 *
 * Parameters: $1 = roundId
 */
export const PROBLEM_CURRENT_POINTS_SQL = `
  WITH ${EFFECTIVE_SOLVES_CTE}
  SELECT
    p.id AS "problemId",
    p.title,
    p.difficulty,
    p.initial,
    p.minimum,
    p.decay,
    COALESCE(pes."effectiveSolves", 0) AS "effectiveSolves",
    ROUND(${CURRENT_POINTS_EXPR('pes."effectiveSolves"', "p")})::int AS "currentPoints"
  FROM "Problem" p
  LEFT JOIN "ProblemEffectiveSolves" pes ON pes."problemId" = p.id
  WHERE p."roundId" = $1 AND p."isHidden" = false
  ORDER BY
    CASE p.difficulty
      WHEN 'EASY' THEN 1
      WHEN 'MEDIUM' THEN 2
      WHEN 'HARD' THEN 3
    END,
    p.title
`;

/**
 * Get current points for a single problem
 *
 * Parameters: $1 = problemId
 */
export const SINGLE_PROBLEM_POINTS_SQL = `
  SELECT
    p.id AS "problemId",
    p.initial,
    p.minimum,
    p.decay,
    COALESCE(SUM(s."testcasesPassed" / 10.0), 0) AS "effectiveSolves",
    ROUND(
      GREATEST(
        p."minimum",
        p."initial" - (p."initial" - p."minimum") *
          (POWER(COALESCE(SUM(s."testcasesPassed" / 10.0), 0), 2) / POWER(p."decay", 2))
      )
    )::int AS "currentPoints"
  FROM "Problem" p
  LEFT JOIN "Solve" s ON s."problemId" = p.id
  WHERE p.id = $1
  GROUP BY p.id, p.initial, p.minimum, p.decay
`;

/**
 * Get team's total score for a round
 *
 * Parameters: $1 = roundId, $2 = teamId
 */
export const TEAM_TOTAL_SCORE_SQL = `
  WITH ${EFFECTIVE_SOLVES_CTE}
  SELECT
    COALESCE(SUM(
      ROUND(
        ${CURRENT_POINTS_EXPR('pes."effectiveSolves"', "p")} * (s."testcasesPassed" / 10.0)
      )
    ), 0)::int AS "totalScore"
  FROM "Solve" s
  JOIN "Problem" p ON p.id = s."problemId"
  LEFT JOIN "ProblemEffectiveSolves" pes ON pes."problemId" = p.id
  WHERE p."roundId" = $1 AND s."teamId" = $2
`;
