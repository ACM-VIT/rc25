'use server'

import {PrismaClient} from '@prisma/client';

export default async function getSubmissionResults(submissionId: string) {
    const prisma = new PrismaClient();
    return prisma.submission.findUniqueOrThrow({
        where: {
            id: submissionId
        },
        include: {
            user: {
                select: {
                    name: true
                }
            }
        }
    });
}