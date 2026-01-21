import { db } from "@/db";
import { teams, users } from "@/db/schema";
import BlacklistClient from "./BlacklistClient";
import { isNotNull } from "drizzle-orm";

export default async function TeamBlacklistPage() {
  const teamRows = await db.select().from(teams);
  const memberRows = await db
    .select()
    .from(users)
    .where(isNotNull(users.teamId));

  const membersByTeam = new Map<string, typeof memberRows>();
  for (const member of memberRows) {
    if (!member.teamId) continue;
    const list = membersByTeam.get(member.teamId) ?? [];
    list.push(member);
    membersByTeam.set(member.teamId, list);
  }

  const teamsWithMembers = teamRows
    .map((team) => ({
      ...team,
      members: membersByTeam.get(team.id) ?? [],
    }))
    .filter((team) => team.members.length > 0);

  return <BlacklistClient initialTeams={teamsWithMembers} />;
}
