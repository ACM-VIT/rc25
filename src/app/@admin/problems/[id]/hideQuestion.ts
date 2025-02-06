"use server";

import { prisma } from "@/utils/prisma";

export default async function hideQuestion(
    problemId: string,
    hide: boolean
): Promise<void> {
    await prisma.problem.update({
        where: {
            id: problemId,
        },
        data: {
            isHidden: hide,
        },
    });
}
