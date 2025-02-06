import React from "react";
import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import CheckIn from "@/components/check-in";

interface PageParams {
	params: Promise<{
	  id: string;
	}>;
  }

export default async function Page({ params }: PageParams) {
	const prisma = new PrismaClient();
	const param = await params;
	const team = await prisma.team.findUnique({
		relationLoadStrategy: 'join',
		where: {
			id: param.id,
		},
		include: {
			members: true,
			TeamRound: true,
		},
	});

	if (!team) {
		return notFound();
	}

	const uniregs = await prisma.uniReg.findMany({
		relationLoadStrategy: 'join',
		where: {
			regNo: {
				in: team.members
					.filter((member): member is typeof team.members[number] => member.name !== null && member.name !== undefined)
					.map((member) => member.name?.split(" ").pop() || ''),
			},
		},
	});
	await prisma.$disconnect();

	return <CheckIn uniReg={uniregs} team={team} />;
}
