import { PrismaClient } from "@prisma/client";
import { auth } from "@/app/(auth)/auth";
import { TeamMembers } from "./team-dashboard-client";

async function getTeamMembers() {
	const session = await auth();
	if (!session?.user?.email) return [];

	const prisma = new PrismaClient();
	try {
		const user = await prisma.user.findUnique({
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

export default async function TeamMembersAndLeaveButton() {
	const teamMembers = await getTeamMembers();
	return <TeamMembers teamMembers={teamMembers} />;
} 