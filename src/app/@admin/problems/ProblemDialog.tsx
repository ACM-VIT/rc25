import { QuestionForm } from "./question-form"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import type { Difficulty } from "@prisma/client"

interface Round {
  number: number
  start: Date
  end: Date
  result: Date
}

interface Problem {
  id: string
  title: string
  nickname: string
  description: string
  difficulty: Difficulty
  maxScore: number
  lin_dl: string
  win_dl: string
  mac_dl: string
  web_code: string
  normal_cases: number
  edge_cases: number
  roundNumber: number
}

interface ProblemDialogProps {
  isOpen: boolean
  onClose: () => void
  initialData: Problem | null
  onSubmit: (formData: FormData) => Promise<void>
  rounds: Round[]
}

export function ProblemDialog({
  isOpen,
  onClose,
  initialData,
  onSubmit,
  rounds
}: ProblemDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-4xl">
        <QuestionForm
          initialData={initialData}
          onSubmitAction={onSubmit}
          isDialog
          onClose={onClose}
          open={isOpen}
          rounds={rounds}
        />
      </DialogContent>
    </Dialog>
  )
}