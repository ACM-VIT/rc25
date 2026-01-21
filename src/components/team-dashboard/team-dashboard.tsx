import { auth } from "@/app/(auth)/auth";
import { TeamMembers } from "./team-dashboard-client";
import { db } from "@/db";
import { teams, users } from "@/db/schema";
import { eq } from "drizzle-orm";

async function getTeamMembers() {
  const session = await auth();
  if (!session?.user?.email) return [];

  try {
    const userRows = await db
      .select({ teamId: users.teamId })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    const teamId = userRows[0]?.teamId;
    if (!teamId) return [];

    const members = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        gender: users.gender,
        emailVerified: users.emailVerified,
        image: users.image,
        teamId: users.teamId,
      })
      .from(users)
      .where(eq(users.teamId, teamId));

    return members;
  } catch (error) {
    console.error("Error fetching team members:", error);
    return [];
  }
}
async function getTeamName() {
  const session = await auth();
  if (!session?.user?.email) throw "No session found";

  try {
    const userRows = await db
      .select({ teamId: users.teamId })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);
    const teamId = userRows[0]?.teamId;
    if (!teamId) return "";

    const teamRows = await db
      .select({ name: teams.name })
      .from(teams)
      .where(eq(teams.id, teamId))
      .limit(1);

    return teamRows[0]?.name ?? "";
  } catch (error) {
    console.error("Error fetching team name:", error);
    return "";
  }
}
async function getTeamCode() {
  const session = await auth();
  if (!session?.user?.email) return "";

  try {
    const userRows = await db
      .select({ teamId: users.teamId })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);
    const teamId = userRows[0]?.teamId;
    if (!teamId) return "";

    const teamRows = await db
      .select({ shortCode: teams.shortCode })
      .from(teams)
      .where(eq(teams.id, teamId))
      .limit(1);

    return teamRows[0]?.shortCode ?? "";
  } catch (error) {
    console.error("Error fetching team members:", error);
    return "";
  }
}
export default async function TeamMembersAndLeaveButton() {
  const teamMembers = await getTeamMembers();
  const teamName = await getTeamName();
  const code = await getTeamCode();
  return (
    <TeamMembers teamMembers={teamMembers} teamName={teamName} code={code} min_team_size={Number.parseInt(process.env.MIN_TEAM_CAPACITY || "2")} />
  );
}
