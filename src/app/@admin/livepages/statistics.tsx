// import { PrismaClient, Difficulty } from '@prisma/client'
// import StatisticsDashboardClient from '../components/statistics-dashboard-client'

// export default async function StatisticsDashboard() {
//   const prisma = new PrismaClient()

//   const totalSubmissions = await prisma.submission.count()
//   const correctSubmissions = await prisma.submission.count({
//     where: {
//       score: { gt: 0 },
//     },
//   })

//   const difficulties: Difficulty[] = [Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD]
//   const solvedPercentages: Record<string, number> = {}
//   for (const diff of difficulties) {
//     const totalForDiff = await prisma.submission.count({
//       where: { problem: { difficulty: diff } },
//     })
//     const correctForDiff = await prisma.submission.count({
//       where: {
//         problem: { difficulty: diff },
//         score: { gt: 0 },
//       },
//     })
//     solvedPercentages[diff] =
//       totalForDiff > 0 ? (correctForDiff / totalForDiff) * 100 : 0
//   }

//   const today = new Date()
//   today.setHours(0, 0, 0, 0)
//   const submissionCounts: number[] = []
//   const accuracyPercentages: number[] = []
//   for (let hour = 8; hour <= 20; hour++) {
//     const start = new Date(today)
//     start.setHours(hour, 0, 0, 0)
//     const end = new Date(today)
//     end.setHours(hour + 1, 0, 0, 0)
//     const hourTotal = await prisma.submission.count({
//       where: { createdAt: { gte: start, lt: end } },
//     })
//     const hourCorrect = await prisma.submission.count({
//       where: {
//         createdAt: { gte: start, lt: end },
//         score: { gt: 0 },
//       },
//     })
//     submissionCounts.push(hourTotal)
//     accuracyPercentages.push(hourTotal > 0 ? (hourCorrect / hourTotal) * 100 : 0)
//   }

//   const teams = await prisma.team.findMany({
//     include: {
//       members: {
//         include: {
//           Submission: true,
//         },
//       },
//     },
//   })

//   const teamSubmissions = teams.map((team) => {
//     const count = team.members.reduce(
//       (sum, member) => sum + member.Submission.length,
//       0
//     )
//     return { name: team.name, count }
//   })

//   teamSubmissions.sort((a, b) => b.count - a.count)
//   const topTeamLabels = teamSubmissions.map((ts) => ts.name)
//   const topTeamData = teamSubmissions.map((ts) => ts.count)

//   await prisma.$disconnect()

//   const stats = {
//     totalSubmissions,
//     correctSubmissions,
//     solvedPercentages,
//     submissionCounts,
//     accuracyPercentages,
//     topTeamLabels,
//     topTeamData,
//   }

//   return <StatisticsDashboardClient stats={stats} />
// }
