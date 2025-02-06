// 'use client'

// import React from 'react'
// import { Line, Bar } from 'react-chartjs-2'
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
// } from 'chart.js'
// import Image from 'next/image'

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend
// )

// function formatNumber(num: number) {
//   if (num >= 1000) {
//     return (num / 1000).toFixed(2) + 'k'
//   }
//   return num.toString()
// }

// type Stats = {
//   totalSubmissions: number
//   correctSubmissions: number
//   solvedPercentages: Record<string, number>
//   submissionCounts: number[]
//   accuracyPercentages: number[]
//   topTeamLabels: string[]
//   topTeamData: number[]
// }

// type Props = {
//   stats: Stats
// }

// export default function StatisticsDashboardClient({ stats }: Props) {
//   const chartOptions = {
//     responsive: true,
//     plugins: {
//       legend: { display: false },
//     },
//     scales: {
//       x: {
//         grid: { color: 'rgba(255, 255, 255, 0.1)' },
//         ticks: { color: '#fff' },
//       },
//       y: {
//         grid: { color: 'rgba(255, 255, 255, 0.1)' },
//         ticks: { color: '#fff' },
//       },
//     },
//   }

//   const horizontalChartOptions = {
//     ...chartOptions,
//     indexAxis: 'y' as const,
//   }

//   const hourLabels = [
//     "8 AM", "9 AM", "10 AM", "11 AM", "12 PM",
//     "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM"
//   ];

//   const submissionData = {
//     labels: hourLabels,
//     datasets: [
//       {
//         data: stats.submissionCounts,
//         borderColor: 'rgba(147, 51, 234, 0.8)',
//         backgroundColor: 'rgba(147, 51, 234, 0.2)',
//         fill: true,
//         tension: 0.4,
//       },
//     ],
//   }

//   const accuracyData = {
//     labels: hourLabels,
//     datasets: [
//       {
//         data: stats.accuracyPercentages,
//         borderColor: 'rgba(147, 51, 234, 0.8)',
//         backgroundColor: 'rgba(147, 51, 234, 0.2)',
//         fill: true,
//         tension: 0.4,
//       },
//     ],
//   }

//   const teamData = {
//     labels: stats.topTeamLabels,
//     datasets: [
//       {
//         data: stats.topTeamData,
//         backgroundColor: 'rgba(147, 51, 234, 0.6)',
//         borderRadius: 4,
//       },
//     ],
//   }

//   return (
//     <div className="min-h-screen bg-[#1a1625] p-6 text-white">
//       <header className="mb-6 flex items-center justify-between">
//         <Image
//           src="RCLogo.svg"
//           alt="Reverse Coding Logo"
//           width={40}
//           height={40}
//           className="h-8 w-auto"
//         />
//         <h1 className="font-mono text-2xl tracking-[0.2em]">STATISTICS</h1>
//       </header>

//       <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
//         <div className="rounded-xl bg-[#2a2438] p-6">
//           <h2 className="mb-4 font-mono text-xl">Submissions Count</h2>
//           <div className="flex justify-between">
//             <div>
//               <div className="font-mono text-3xl font-bold text-purple-400">
//                 {formatNumber(stats.correctSubmissions)}
//               </div>
//               <div className="text-sm text-gray-400">Correct</div>
//             </div>
//             <div>
//               <div className="font-mono text-3xl font-bold">
//                 {formatNumber(stats.totalSubmissions)}
//               </div>
//               <div className="text-sm text-gray-400">Total</div>
//             </div>
//           </div>
//         </div>

//         <div className="rounded-xl bg-[#2a2438] p-6">
//           <h2 className="mb-4 font-mono text-xl">% Questions Solved</h2>
//           <div className="grid grid-cols-3 gap-4">
//             <div>
//               <div className="font-mono text-3xl font-bold text-green-400">
//                 {stats.solvedPercentages.EASY.toFixed(1)}%
//               </div>
//               <div className="text-sm text-gray-400">Easy</div>
//             </div>
//             <div>
//               <div className="font-mono text-3xl font-bold text-yellow-400">
//                 {stats.solvedPercentages.MEDIUM.toFixed(1)}%
//               </div>
//               <div className="text-sm text-gray-400">Medium</div>
//             </div>
//             <div>
//               <div className="font-mono text-3xl font-bold text-red-400">
//                 {stats.solvedPercentages.HARD.toFixed(1)}%
//               </div>
//               <div className="text-sm text-gray-400">Hard</div>
//             </div>
//           </div>
//         </div>

//         <div className="rounded-xl bg-[#2a2438] p-6">
//           <div className="flex h-full items-center justify-center">
//             <Image
//               src="RCLogo.svg"
//               alt="Reverse Coding Logo"
//               width={200}
//               height={80}
//               className="h-auto w-48"
//             />
//           </div>
//         </div>

//         <div className="rounded-xl bg-[#2a2438] p-6">
//           <h2 className="mb-4 font-mono text-xl">Question Submissions</h2>
//           <div className="h-[200px]">
//             <Line data={submissionData} options={chartOptions} />
//           </div>
//         </div>

//         <div className="rounded-xl bg-[#2a2438] p-6">
//           <h2 className="mb-4 font-mono text-xl">Question Accuracy</h2>
//           <div className="h-[200px]">
//             <Line data={accuracyData} options={chartOptions} />
//           </div>
//         </div>

//         <div className="rounded-xl bg-[#2a2438] p-6">
//           <h2 className="mb-4 font-mono text-xl">Top Team Submissions</h2>
//           <div className="h-[200px]">
//             <Bar data={teamData} options={horizontalChartOptions} />
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
