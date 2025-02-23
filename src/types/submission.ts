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
  testcasespassed: boolean[]
  code: string
}

export interface TeamSubmissionProps {
  submissions: TeamSubmission[]
  teamName: string | null
}
