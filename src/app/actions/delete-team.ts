'use server'

import { prisma } from '@/utils/prisma';

export default async function DeleteTeam(teamId: string): Promise<boolean> {
  try {
    await prisma.team.delete({
      where: { id: teamId }
    });
    return true;
  } catch (error) {
    console.error('Failed to delete team:', error);
    return false;
  }
}