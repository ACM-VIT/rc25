import { PrismaClient } from "@prisma/client";
import { auth } from "@/app/(auth)/auth";
import { TeamMembers } from "./team-dashboard-client";

async function getTeamMembers() {
  const session = await auth();
  if (!session?.user?.email) return [];

  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({
      relationLoadStrategy: 'join',
      where: { email: session.user.email },
      include: {
        Team: {
          include: {
            members: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                gender: true,
                emailVerified: true,
                image: true,
                teamId: true,
              },
            },
          },
        },
      },
    });
    return user?.Team?.members ?? [];
  } catch (error) {
    console.error("Error fetching team members:", error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}
async function getTeamName() {
  const session = await auth();
  if (!session?.user?.email) throw "No session found";

  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({
      relationLoadStrategy: 'join',
      where: { email: session.user.email },
      include: {
        Team: {
          select: {
            name: true,
          },
        },
      },
    });
    return user?.Team?.name ?? "";
  } catch (error) {
    console.error("Error fetching team name:", error);
    return "";
  } finally {
    await prisma.$disconnect();
  }
}
async function getTeamCode() {
  const session = await auth();
  if (!session?.user?.email) return "";

  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({
      relationLoadStrategy: 'join',
      where: { email: session.user.email },
      include: {
        Team: {
          select: {
            shortCode: true,
          },
        },
      },
    });
    return user?.Team?.shortCode ?? "";
  } catch (error) {
    console.error("Error fetching team members:", error);
    return "";
  } finally {
    await prisma.$disconnect();
  }
}
export default async function TeamMembersAndLeaveButton() {
  const teamMembers = await getTeamMembers();
  const teamName = await getTeamName();
  const code = await getTeamCode();
  return (
    <TeamMembers teamMembers={teamMembers} teamName={teamName} code={code} min_team_size={parseInt(process.env.MIN_TEAM_CAPACITY || "2")} />
  );
}
