import { prisma } from "@/utils/prisma";

export default async function TeamLeaderboard() {
  const teams = await prisma.team.findMany({
    where: { checkedIn: true },
    orderBy: { score: "desc" },
    select: {
      name: true,
      score: true,
      members: {
        select: { name: true },
      },
    },
  });

  return (
    <div className="w-full max-w-2xl bg-[#1a1a1a] rounded-lg p-6">
      <h2 className="text-xl text-white mb-4">Team Rankings</h2>
      <div className="space-y-4">
        {teams.map((team, i) => (
          <div
            key={team.name}
            className="flex justify-between items-center p-3 bg-[#2a2a2a] rounded"
          >
            <div>
              <span className="text-white font-bold">
                #{i + 1} {team.name}
              </span>
            </div>
            <div className="text-white">{team.score} points</div>
          </div>
        ))}
      </div>
    </div>
  );
}
