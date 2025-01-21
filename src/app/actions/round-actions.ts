"use server";

import { prisma } from "@/utils/prisma";
import { revalidatePath } from "next/cache";

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

    const formattedData = {
      number: data.number,
      start: start,
      end, 
      result,
    };


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

    console.log(formattedData);

    await prisma.round.upsert({
      where: { number: formattedData.number },
      create: formattedData,
      update: formattedData,
    });

    // Refresh page
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
