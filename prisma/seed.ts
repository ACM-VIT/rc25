import { PrismaClient } from '@prisma/client';
import FLAGS from '../src/types/flags';

const prisma = new PrismaClient()

const DEFAULT_FLAGS = {
  [FLAGS.SCOREBOARD_VISIBLE]: true,
  [FLAGS.MAINTENANCE_MODE]: false,
} as const

async function main() {
  try {
    // Create admin team
    const adminTeamId = process.env.ADMIN_TEAM_ID;
    if (!adminTeamId) {
      throw new Error('ADMIN_TEAM_ID environment variable is required');
    }
    await prisma.team.create({
      data: {
        name: 'ADMIN TEAM',
        id: adminTeamId,
        shortCode: adminTeamId,
        checkedIn: true
      }
    })
    console.log('Admin team created successfully')

    // Reset and create flags
    await prisma.$transaction(async (tx) => {
      // Clear existing flags
      await tx.flags.deleteMany();
      console.log('Existing flags cleared successfully')

      // Create new flags
      const flagData = Object.entries(DEFAULT_FLAGS).map(([name, value]) => ({
        name,
        value
      }))

      await tx.flags.createMany({
        data: flagData,
        skipDuplicates: true
      })
      console.log('New flags created successfully')
    })

  } catch (error) {
    console.error('Error in seed script:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()