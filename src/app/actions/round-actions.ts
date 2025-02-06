"use server";

import { prisma } from "@/utils/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

    const existingRound = await prisma.round.findUnique({
      where: { number: data.number },
    });

    if (!existingRound) {
      throw new Error("Round not found");
    }

    const conflictingRound = await prisma.round.findFirst({
      where: {
        NOT: { number: data.number },
        AND: [
          {
            start: { lte: end },
            end: { gte: start },
          },
        ],
      },
    });

    if (conflictingRound) {
      throw new Error(`Time conflict with Round ${conflictingRound.number}`);
    }

    await prisma.round.update({
      where: { number: data.number },
      data: {
        start,
        end,
        result,
      },
    });

    revalidatePath("/rounds");
    return { success: true };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export async function deleteRound(number: number) {
  try {
    await prisma.round.delete({ where: { number } });
    revalidatePath("/rounds");
    return { success: true };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export async function getLatestRound() {
  try {
      const now = new Date();

      let round = await prisma.round.findFirst({
          where: {
              end: { lt: now },   
              result: { gt: now } 
          },
          orderBy: { number: "desc" }, 
      });

      if (round) {
          return {
              number: round.number,
              status: "RESULTS IN", 
              timeUntil: round.result.toISOString(), // ✅ No modification, use as stored in DB
          };
      }

      round = await prisma.round.findFirst({
          where: {
              start: { lte: now },
              end: { gte: now },
          },
          orderBy: { number: "desc" },
      });

      if (round) {
          return {
              number: round.number,
              status: "ENDS IN",
              timeUntil: round.end.toISOString(), // ✅ No modification, use as stored in DB
          };
      }

      round = await prisma.round.findFirst({
          where: { start: { gt: now } },
          orderBy: { number: "asc" },
      });

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