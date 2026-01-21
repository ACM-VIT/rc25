import React from "react";
import { notFound } from "next/navigation";
import CheckIn from "@/components/check-in";
import { db } from "@/db";
import { teamRounds, teams, uniRegs, users } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

interface PageParams {
	params: Promise<{
	  id: string;
	}>;
  }

export default async function Page({ params }: PageParams) {
	const param = await params;
	const teamRows = await db
		.select()
		.from(teams)
		.where(eq(teams.id, param.id))
		.limit(1);
	const team = teamRows[0];

	if (!team) {
		return notFound();
	}

	const members = await db
		.select()
		.from(users)
		.where(eq(users.teamId, team.id));
	const teamRoundRows = await db
		.select()
		.from(teamRounds)
		.where(eq(teamRounds.teamId, team.id));

	const regNos = members
		.filter((member) => member.name)
		.map((member) => member.name?.split(" ").pop() || "")
		.filter(Boolean);

	const uniregs = regNos.length
		? await db
				.select()
				.from(uniRegs)
				.where(inArray(uniRegs.regNo, regNos))
		: [];

	return <CheckIn uniReg={uniregs} team={{ ...team, members, TeamRound: teamRoundRows }} />;
}
