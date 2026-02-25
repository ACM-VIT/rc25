import { prisma } from "@/utils/prisma";
import TeamSubmissions from "./team-submissions";
import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth"; 
import FloatingDock from "@/components/FloatingDock";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submissions",
  description: "View your submission history and progress",
  openGraph: {
    title: "Submissions",
    description: "Track your submission history and performance",
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
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    relationLoadStrategy: "join",
    where: { id: session.user.id },
    include: { Team: true },
  });

  if (!user) {
    return <div>User not found</div>;
  }

  const submissions = await prisma.submission.findMany({
    relationLoadStrategy: "join",
    where: {
      userId: user.id,
    },
    include: {
      user: { select: { name: true } },
      problem: { select: { title: true, difficulty: true, normal_cases: true, edge_cases: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedSubmissions = submissions.map((submission) => ({
    ...submission,
    user: {
      ...submission.user,
      name: submission.user.name || "Unknown",
    },
    testcasesPassed: submission.testcasespassed?.filter(Boolean).length ?? 0,
    totalTestcases: (submission.problem.normal_cases ?? 0) + (submission.problem.edge_cases ?? 0),
  }));

  return (
    <>
      <TeamSubmissions
        submissions={formattedSubmissions}
        teamName={user.Team?.name ?? user.name ?? \"Team\"}
      />
      <FloatingDock />
    </>
  );
}
