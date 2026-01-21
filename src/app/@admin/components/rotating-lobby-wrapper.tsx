import RotatingLobby from "./rotating-lobby";
import { db } from "@/db";
import { flags } from "@/db/schema";
import { eq } from "drizzle-orm";

async function getLeaderBoardShowBoolean(): Promise<boolean> {
  const flagRows = await db
    .select({ value: flags.value })
    .from(flags)
    .where(eq(flags.name, "SCOREBOARD_VISIBLE"))
    .limit(1);
  return flagRows[0]?.value ?? false;
}

export default async function RotatingLobbyWrapper() {
  const isScoreboardVisible = await getLeaderBoardShowBoolean();
  //console.log("Scoreboard visible:", isScoreboardVisible);
  return <RotatingLobby isScoreboardVisible={isScoreboardVisible} />;
}
