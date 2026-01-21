import { db } from "@/db";
import { rounds } from "@/db/schema";
import RoundClient from "./RoundClient";
import { asc } from "drizzle-orm";

async function getRounds() {
  try {
    return await db.select().from(rounds).orderBy(asc(rounds.number));
  } catch (error) {
    console.error("Error fetching rounds:", error);
    return [];
  }
}

export default async function Page() {
  const rounds = await getRounds();
  return <RoundClient initialRounds={rounds} />;
}
