import { db } from "@/db";
import { problems, submissions, teams, users } from "@/db/schema";
import TeamSubmissions from "./team-submissions";
import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth"; // Import your auth
import FloatingDock from "@/components/FloatingDock";
import FallbackPage from "@/components/fallback-page";
import { Metadata } from "next";
import { desc, eq } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Team Submissions",
  description: "View your team's submission history and progress",
  openGraph: {
    title: "Team Submissions",
    description: "Track your team's submission history and performance",
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

export default async function SubmissionsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin?callbackUrl=/submissions");
  }

  const userId = session.user.id;
  if (!userId) {
    redirect("/signin?callbackUrl=/submissions");
  }

  const userRows = await db
    .select({ user: users, team: teams })
    .from(users)
    .leftJoin(teams, eq(users.teamId, teams.id))
    .where(eq(users.id, userId))
    .limit(1);

  const user = userRows[0]?.user;
  const team = userRows[0]?.team;

  if (!team || !user) {
    return (
      <FallbackPage
        headerTitle="PIT STOP"
        title="No Team Found"
        message="You don't appear to be part of a team yet. Join or create a team to view submissions."
      />
    );
  }

  const submissionRows = await db
    .select({
      submission: submissions,
      user: users,
      problem: problems,
    })
    .from(submissions)
    .innerJoin(users, eq(submissions.userId, users.id))
    .innerJoin(problems, eq(submissions.problemId, problems.id))
    .where(eq(users.teamId, team.id))
    .orderBy(desc(submissions.createdAt));

  const formattedSubmissions = submissionRows.map((row) => ({
    ...row.submission,
    user: {
      ...row.user,
      name: row.user.name || "Unknown",
    },
    problem: {
      title: row.problem.title,
      difficulty: row.problem.difficulty,
    },
    totalTestcases: (row.problem.normal_cases ?? 0) + (row.problem.edge_cases ?? 0),
  }));

  return (
    <>
      <TeamSubmissions
        submissions={formattedSubmissions}
        teamName={team.name}
      />
      <FloatingDock />
    </>
  );
}
