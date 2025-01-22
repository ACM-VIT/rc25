'use server'

import { PrismaClient } from '@prisma/client';

export default async function getSubmissionResults(submissionId: string) {
    const prisma = new PrismaClient();
    const submission = await prisma.submission.findUnique({
        where: {
        id: submissionId
        },
        select: {
        testcasespassed: true
        }
    });

  return submission?.testcasespassed || [];
}