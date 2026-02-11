import { QuestionForm } from "./question-form";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { Problem as PrismaBaseProblem, Round, Testcase } from "@/db/schema";
import { DialogTitle } from "@radix-ui/react-dialog";

interface Problem extends PrismaBaseProblem {
    Testcase: Testcase[];
}

interface ProblemDialogProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: Problem | null;
    onSubmit: (formData: FormData) => Promise<void>;
    rounds: Round[];
}

export function ProblemDialog({
    isOpen,
    onClose,
    initialData,
    onSubmit,
    rounds,
}: ProblemDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto max-w-4xl">
                <DialogTitle>Edit Question</DialogTitle>
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
    );
}
