import { prisma } from "@/utils/prisma";
import TeamSubmissions from "./team-submissions";
import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth"; // Import your auth
import { Metadata } from "next";

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
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { Team: true },
  });

  if (!user?.Team) {
    return <div>No team found</div>;
  }

  const submissions = await prisma.submission.findMany({
    where: {
      user: {
        teamId: user.Team.id,
      },
    },
    include: {
      user: {
        select: { name: true },
      },
      problem: {
        select: {
          title: true,
          difficulty: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedSubmissions = submissions.map((submission) => ({
    ...submission,
    user: {
      ...submission.user,
      name: submission.user.name || "Unknown",
    },
  }));

  return (
    <TeamSubmissions
      submissions={formattedSubmissions}
      teamName={user.Team.name}
    />
  );
}
