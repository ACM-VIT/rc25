import type { DashboardProps, TeamDetails, LeaderboardTeam, RoundInfo, Questions } from "@/types/dashboard"

const teamDetails: TeamDetails = {
    id: "team123",
    name: "Code Ninjas",
    shortCode: "CN",
    score: 450,
    members: [
        { id: "1", name: "Alice Cooper", score: 150 },
        { id: "2", name: "Bob Wilson", score: 120 },
        { id: "3", name: "Charlie Brown", score: 100 },
        { id: "4", name: "David Smith", score: 80 },
    ]
}

const leaderboard: LeaderboardTeam[] = [
    { id: "team123", name: "Code Ninjas", score: 450 },
    { id: "team456", name: "Binary Beasts", score: 420 },
    { id: "team789", name: "Syntax Error", score: 380 },
    { id: "team101", name: "Debug Dragons", score: 350 },
    { id: "team102", name: "Algorithm Aces", score: 320 },
]

const roundInfo: RoundInfo = {
    number: 1,
    end: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now
}

const questions: Questions[] = [
    { slno: 1, id: "q1", questionName: "What is 2+2?", difficulty: "Easy", status: "Answered" },
    { slno: 2, id: "q2", questionName: "What is 3+3?", difficulty: "Medium", status: "Answered" },
    { slno: 3, id: "q3", questionName: "What is 4+4?", difficulty: "Hard", status: "Not Answered" },
    { slno: 4, id: "q4", questionName: "What is 5+5?", difficulty: "Easy", status: "Not Answered" },
    { slno: 5, id: "q5", questionName: "What is 6+6?", difficulty: "Medium", status: "Not Answered" },
]

export const dashboardDummyData: DashboardProps = {
    teamDetails,
    leaderboard,
    roundInfo,
    questions
}
