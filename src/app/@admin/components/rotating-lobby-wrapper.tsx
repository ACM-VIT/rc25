import RotatingLobby from "./rotating-lobby";
import { prisma } from "@/utils/prisma";

async function getLeaderBoardShowBoolean(): Promise<boolean> {
  const flag = await prisma.flags.findFirst({
    where: { name: "SCOREBOARD_VISIBLE" },
    select: { value: true },
  });
  return flag?.value ?? false;
}

export default async function RotatingLobbyWrapper() {
  const isScoreboardVisible = await getLeaderBoardShowBoolean();
  //console.log("Scoreboard visible:", isScoreboardVisible);
  return <RotatingLobby isScoreboardVisible={isScoreboardVisible} />;
}
