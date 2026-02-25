import type { Difficulty } from "@prisma/client"

export interface TeamSubmission {
  id: string
  createdAt: Date
  user: {
    name: string
  }
  problem: {
    title: string
    difficulty: Difficulty
  }
  testcasesPassed: number
  totalTestcases: number
  code: string
}

export interface TeamSubmissionProps {
  submissions: TeamSubmission[]
  teamName: string
}
