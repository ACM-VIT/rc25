import { prisma } from "@/utils/prisma";
import TeamSubmissions from "./team-submissions";
import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth"; 
import FloatingDock from "@/components/FloatingDock";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team Submissions",
  description: "View your submission history and progress",
  openGraph: {
    title: "Team Submissions",
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

  // Get the user by id (no team checks)
  const user = await prisma.user.findUnique({
    relationLoadStrategy: "join",
    where: { id: session.user.id },
  });

  if (!user) {
    return <div>User not found</div>;
  }

  // Query submissions for this user only
  const submissions = await prisma.submission.findMany({
    relationLoadStrategy: "join",
    where: {
      userId: user.id,
    },
    include: {
      user: { select: { name: true } },
      problem: { select: { title: true, difficulty: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Ensure a valid name is always available
  const formattedSubmissions = submissions.map((submission) => ({
    ...submission,
    user: {
      ...submission.user,
      name: submission.user.name || "Unknown",
    },
  }));

  return (
    <>
      <TeamSubmissions
        submissions={formattedSubmissions}
        // Pass the user's name as the header instead of a team name
        teamName={user.name}
      />
      <FloatingDock />
    </>
  );
}
