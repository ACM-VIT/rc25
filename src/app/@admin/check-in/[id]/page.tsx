import React from "react";
import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import CheckIn from "@/components/check-in";

async function Page({ params }: { params: { id: string } }) {
	const prisma = new PrismaClient();
	const param = await params;
	const team = await prisma.team.findUnique({
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
		where: {
			regNo: {
				in: team.members.map((member) => member.name!.split(" ").pop()!),
			},
		},
	});
	await prisma.$disconnect();

	return <CheckIn uniReg={uniregs} team={team} />;
}

export default Page;
