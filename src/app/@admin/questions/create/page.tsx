import { QuestionForm } from "../question-form"  
import { handleQuestionSubmit } from "@/app/actions/upsert-question"

export default function CreateQuestion() {
  return <QuestionForm onSubmit={handleQuestionSubmit} />
}
