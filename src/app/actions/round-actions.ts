"use server";

import { db } from "@/db";
import { rounds } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, asc, desc, eq, gt, gte, lt, lte, ne } from "drizzle-orm";

export async function upsertRound(data: {
  number: number;
  start: Date;
  end: Date;
  result: Date;
}) {
  try {
    const start = new Date(data.start);
    const end = new Date(data.end);
    const result = new Date(data.result);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      Number.isNaN(result.getTime())
    ) {
      throw new Error("Invalid date format");
    }

    if (start >= end || end >= result) {
      throw new Error("Invalid time sequence. Start < End < Result required");
    }

    const existingRoundRows = await db
      .select()
      .from(rounds)
      .where(eq(rounds.number, data.number))
      .limit(1);
    const existingRound = existingRoundRows[0];

    if (!existingRound) {
      throw new Error("Round not found");
    }

    const conflictingRoundRows = await db
      .select()
      .from(rounds)
      .where(
        and(
          ne(rounds.number, data.number),
          lte(rounds.start, end),
          gte(rounds.end, start)
        )
      )
      .limit(1);
    const conflictingRound = conflictingRoundRows[0];

    if (conflictingRound) {
      throw new Error(`Time conflict with Round ${conflictingRound.number}`);
    }

    await db
      .update(rounds)
      .set({ start, end, result })
      .where(eq(rounds.number, data.number));

    revalidatePath("/rounds");
    return { success: true };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export async function deleteRound(number: number) {
  try {
    await db.delete(rounds).where(eq(rounds.number, number));
    revalidatePath("/rounds");
    return { success: true };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export async function getLatestRound() {
  try {
      const now = new Date();

      let roundRows = await db
          .select()
          .from(rounds)
          .where(and(lt(rounds.end, now), gt(rounds.result, now)))
          .orderBy(desc(rounds.number))
          .limit(1);
      let round = roundRows[0];

      if (round) {
          return {
              number: round.number,
              status: "RESULTS IN", 
              timeUntil: round.result.toISOString(), // ✅ No modification, use as stored in DB
          };
      }

      roundRows = await db
          .select()
          .from(rounds)
          .where(and(lte(rounds.start, now), gte(rounds.end, now)))
          .orderBy(desc(rounds.number))
          .limit(1);
      round = roundRows[0];

      if (round) {
          return {
              number: round.number,
              status: "ENDS IN",
              timeUntil: round.end.toISOString(), // ✅ No modification, use as stored in DB
          };
      }

      roundRows = await db
          .select()
          .from(rounds)
          .where(gt(rounds.start, now))
          .orderBy(asc(rounds.number))
          .limit(1);
      round = roundRows[0];

      if (round) {
          return {
              number: round.number,
              status: "STARTS IN",
              timeUntil: round.start.toISOString(), // ✅ No modification, use as stored in DB
          };
      }

      return null;
  } catch (error) {
      console.error("Error fetching latest round:", error);
      return null;
  }
}

export async function refreshRoundCache() {
  revalidatePath("/", "layout");
  return redirect("/");
}
