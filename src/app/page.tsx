import { db } from "@/db";
import Dashboard from "@/components/dashboard";
// import SignOutButton from "@/components/buttons/sign-out";
// import type { TeamRound } from "@prisma/client"
import { getTeamRound } from "@/hooks/useTeamRound";
import type { Metadata } from "next";
import { FLAGS } from "@/types/flags"
import { auth } from "./(auth)/auth";
import { flags, news as newsTable, problems, rounds, submissions, teams, users, solve } from "@/db/schema";
import { calculateCurrentPoints, calculateSolveContribution } from "@/db/scoring";
import { and, asc, desc, eq, inArray, ne } from "drizzle-orm";
// import { use } from "react";

async function getLeaderBoardShowBoolean(): Promise<boolean> {
  const showBoolRows = await db
    .select({ value: flags.value })
    .from(flags)
    .where(eq(flags.name, FLAGS.SCOREBOARD_VISIBLE))
    .limit(1);

  return showBoolRows[0]?.value ?? false;
}

export async function generateMetadata(): Promise<Metadata> {
  const teamRound = await getTeamRound();
  const roundInfo = teamRound?.roundId
    ? await db
        .select({ numbcer: rounds.number })
        .from(rounds)
        .where(eq(rounds.id, teamRound.roundId))
        .limit(1)
    : null;

  if (!roundInfo?.[0]?.numbcer) {
    return {
      title: "Reverse Coding | ACM-VIT",
      description: "Join Reverse Coding competition",
      openGraph: {
        title: "Reverse Coding | ACM-VIT",
        description: "Join ACM-VIT's premier coding competition",
        type: "website",
      },
      robots: {
        index: false,
        follow: false,
      },
      icons: {
        icon: "/favicon.ico",
      },
    };
  }

  return {
    title: `Round ${roundInfo[0].numbcer} Dashboard`,
    description:
      "View your team's progress, leaderboard and available problems",
    openGraph: {
      title: `Round ${roundInfo[0].numbcer}`,
      description: "Track your team's progress in real-time",
    },
    robots: {
      index: false,
      follow: false,
    },
    icons: {
      icon: "/favicon.ico",
    },
  };
}
export default async function Page() {
  const teamRound = await getTeamRound();

  const session = await auth();
  if (!session?.user?.email) {
    return <div>Please sign in to continue</div>;
  }

  const userRows = await db
    .select({ user: users, team: teams })
    .from(users)
    .leftJoin(teams, eq(users.teamId, teams.id))
    .where(eq(users.email, session.user.email))
    .limit(1);
  const user = userRows[0]?.user ?? null;
  const userTeam = userRows[0]?.team ?? null;

  if (!user) {
      return <div>User not found</div>;
  }

  const isAdminTeam = userTeam?.id === process.env.ADMIN_TEAM_ID;


  if (!isAdminTeam) {
    if (!teamRound?.roundId) {
      return <div>No active round found</div>;
    }
  }

  // Round info
  const roundInfoRows = teamRound?.roundId
    ? await db
        .select({ number: rounds.number, end: rounds.end, id: rounds.id })
        .from(rounds)
        .where(eq(rounds.id, teamRound.roundId))
        .limit(1)
    : [];
  const roundInfo = roundInfoRows[0] ?? null;

  interface SubmissionType {
    testcasesPassed: number;
    totalTestcases: number;
    createdAt: Date;
  }

  interface ProblemType {
    id: string;
    title: string;
    difficulty: string;
    roundId: string;
    submissions: SubmissionType[];
    isHidden: boolean;
  }

  const buildTeamData = (rows: { team: typeof teams.$inferSelect; member: typeof users.$inferSelect | null; }[]) => {
    const team = rows[0]?.team ?? null;
    if (!team) return null;
    const members = rows
      .map((row) => row.member)
      .filter((member): member is typeof users.$inferSelect => Boolean(member));
    return {
      id: team.id,
      name: team.name,
      shortCode: team.shortCode,
      score: 0,
      members: members.map((member) => ({
        id: member.id,
        name: member.name,
      })),
    };
  };

  let teamData = teamRound
    ? buildTeamData(
        await db
          .select({ team: teams, member: users })
          .from(teams)
          .leftJoin(users, eq(users.teamId, teams.id))
          .where(eq(teams.id, teamRound.teamId))
      )
    : null;

  if (isAdminTeam){
    teamData = user.teamId
      ? buildTeamData(
          await db
            .select({ team: teams, member: users })
            .from(teams)
            .leftJoin(users, eq(users.teamId, teams.id))
            .where(eq(teams.id, user.teamId))
        )
      : null;
  }

  let problemsList: (typeof problems.$inferSelect)[];
  if (!isAdminTeam) {
    problemsList = roundInfo
      ? await db
          .select()
          .from(problems)
          .where(eq(problems.roundId, roundInfo.id))
          .orderBy(asc(problems.id))
      : [];
  } else {
    problemsList = await db.select().from(problems).orderBy(asc(problems.id));
  }

  const totalTestcasesByProblem = new Map(
    problemsList.map((problem) => [
      problem.id,
      (problem.normal_cases ?? 0) + (problem.edge_cases ?? 0),
    ])
  );

  const problemIds = problemsList.map((problem) => problem.id);
  const problemScoreRows = problemsList.map((problem) => ({
    id: problem.id,
    initial: problem.initial,
    minimum: problem.minimum,
    decay: problem.decay,
  }));

  const solveRows = problemIds.length
    ? await db
        .select({
          problemId: solve.problemId,
          teamId: solve.teamId,
          testcasesPassed: solve.testcasesPassed,
        })
        .from(solve)
        .where(inArray(solve.problemId, problemIds))
    : [];

  const effectiveSolvesByProblem = new Map<string, number>();
  const teamSolvesByTeam = new Map<string, Map<string, number>>();

  for (const row of solveRows) {
    const contribution = calculateSolveContribution(row.testcasesPassed);
    effectiveSolvesByProblem.set(
      row.problemId,
      (effectiveSolvesByProblem.get(row.problemId) ?? 0) + contribution
    );

    if (!row.teamId) continue;
    const teamMap = teamSolvesByTeam.get(row.teamId) ?? new Map<string, number>();
    teamMap.set(row.problemId, row.testcasesPassed);
    teamSolvesByTeam.set(row.teamId, teamMap);
  }

  const calculateTeamScore = (teamId: string) => {
    const teamSolves = teamSolvesByTeam.get(teamId) ?? new Map<string, number>();
    let totalScore = 0;
    for (const problem of problemScoreRows) {
      const effectiveSolves = effectiveSolvesByProblem.get(problem.id) ?? 0;
      const currentPoints = calculateCurrentPoints({
        ...problem,
        effectiveSolves,
      });
      const passed = teamSolves.get(problem.id) ?? 0;
      if (passed > 0) {
        totalScore += Math.round(currentPoints * (passed / 10));
      }
    }
    return totalScore;
  };

  const memberIds = teamData?.members.map((member) => member.id) ?? [];
  const submissionsRows =
    memberIds.length && problemIds.length
      ? await db
          .select({
            problemId: submissions.problemId,
            testcasesPassed: submissions.testcasesPassed,
            createdAt: submissions.createdAt,
          })
          .from(submissions)
          .where(
            and(
              inArray(submissions.userId, memberIds),
              inArray(submissions.problemId, problemIds)
            )
          )
          .orderBy(desc(submissions.createdAt))
      : [];

  const submissionsByProblem = new Map<string, SubmissionType[]>();
  for (const submission of submissionsRows) {
    const list = submissionsByProblem.get(submission.problemId) ?? [];
    const totalTestcases =
      totalTestcasesByProblem.get(submission.problemId) ?? 0;
    list.push({
      testcasesPassed: submission.testcasesPassed,
      totalTestcases,
      createdAt: submission.createdAt,
    });
    submissionsByProblem.set(submission.problemId, list);
  }

  const problemCards: ProblemType[] = problemsList.map((problem) => ({
    id: problem.id,
    title: problem.title,
    difficulty: problem.difficulty,
    roundId: problem.roundId,
    submissions: submissionsByProblem.get(problem.id) ?? [],
    isHidden: problem.isHidden,
  }));

  const questions = problemCards.map((problem, index) => {
    // Find submission with maximum passed test cases
    const bestSubmission = problem.submissions.reduce((best, current) => {
      const currentPassed = current.testcasesPassed;
      const bestPassed = best ? best.testcasesPassed : -1;
      return currentPassed > bestPassed ? current : best;
    }, null as SubmissionType | null);

    const passCount = bestSubmission?.testcasesPassed ?? 0;
    const total =
      bestSubmission?.totalTestcases ??
      totalTestcasesByProblem.get(problem.id) ??
      0;
    const status = total > 0 ? `${passCount}/${total}` : "Not Attempted";
    const isHidden = problem.isHidden;

    return {
      slno: index + 1,
      id: problem.id,
      questionName: problem.title,
      difficulty: problem.difficulty,
      status,
      isHidden,
    };
  });

  const teamScore = teamData ? calculateTeamScore(teamData.id) : 0;
  const teamDetails = teamData
    ? {
        id: teamData.id,
        name: teamData.name,
        shortCode: teamData.shortCode,
        score: teamScore,
        members: teamData.members.map((member: { id: string; name: string | null; }) => ({
          id: member.id,
          name: member.name ?? '',
          score: 0,
        })),
      }
    : {
        id: "",
        name: "",
        shortCode: "",
        score: 0,
        members: [],
      };

  // Leaderboard
  const leaderboardTeams = await db
    .select({ id: teams.id, name: teams.name, hidden: teams.hidden, disqualify: teams.disqualify })
    .from(teams);

  const adminTeamId = process.env.ADMIN_TEAM_ID ?? "";
  const leaderboard = leaderboardTeams
    .filter((team) => !team.hidden && !team.disqualify && team.id !== adminTeamId)
    .map((team) => ({
      id: team.id,
      name: team.name,
      score: calculateTeamScore(team.id),
    }));

  const showLeaderboard = await getLeaderBoardShowBoolean();

  // Fetch news
  const news = await db
    .select({
      id: newsTable.id,
      title: newsTable.title,
      content: newsTable.content,
      time: newsTable.time,
    })
    .from(newsTable)
    .orderBy(desc(newsTable.time));

  return (
    <>
      <Dashboard
        teamDetails={teamDetails}
        leaderboard={leaderboard}
        leaderboardShow={showLeaderboard}
        questions={questions}
        roundInfo={{
          number: roundInfo?.number ?? 0,
          end: roundInfo?.end ?? new Date(),
        }}
        news={news}
      />
    </>
  );
}
