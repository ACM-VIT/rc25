"use client";
import { Prisma } from "@prisma/client";
import { SquareChevronLeft } from "lucide-react";
// import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import CodeEditor, { StatusRibbonProps } from "./code-editor";
import QuestionDisplay from "./question-display";
import WebRunner from "./web-runner";
import { useRouter } from "next/navigation";
import SubmissionSection, {
  SubmissionWithUser,
} from "@/app/problems/[id]/submission-section";
import React, { useEffect, useState, useTransition } from "react";
import { getTeamSubmissions } from "@/app/problems/[id]/actions";
import getSubmissionResults from "@/app/actions/get-submission-results";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { doc, onSnapshot } from "@firebase/firestore";
import { db } from "@/lib/firebase-service";

// Update type to include 'solution'
type ProblemWithRelations = Prisma.ProblemGetPayload<{
  include: { Testcase: true; round: true; solution: true };
}>;

interface QuestionPageProps {
  problem: ProblemWithRelations;
  session: {
    user: {
      id: string;
      name: string;
    };
  };
  questions: Array<{ id: string; slno: number }>;
  currentSlno: number;
  desc: React.ReactElement;
}

export default function QuestionPage({
  problem,
  session,
  // questions,
  // currentSlno,
  desc,
}: QuestionPageProps) {
  const router = useRouter();
  // const currentIndex = questions.findIndex((q) => q.slno === currentSlno);
  const [isPending, startTransition] = useTransition();
  const [submissions, setSubmissions] = useState<SubmissionWithUser[]>([]);
  const [statusRibbon, setStatusRibbon] = useState<StatusRibbonProps>(null);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    startTransition(async () => {
      const data = await getTeamSubmissions(session.user.id, problem.id);
      setSubmissions(data);
    });
  }, [problem.id, session.user.id]);

  useEffect(() => {
    const subscribeToSubmission = (submissionId: string) => {
      return onSnapshot(
        doc(db, "submissions", submissionId),
        async (docSnapshot) => {
          if (!docSnapshot.data()?.status) return;
          const results = await getSubmissionResults(submissionId);
          const passed = results.testcasespassed.filter((r) => r === true).length;
          if (results.evaluationStatus === "ACCEPTED")
            setStatusRibbon({
              type: "evaluation",
              passed,
              total: results.testcasespassed.length,
            });
          else if (results.evaluationStatus === "COMPILE_ERROR")
            setStatusRibbon({
              type: "error",
              message: "Compile Error",
            });
          else if (results.evaluationStatus === "RUNTIME_ERROR")
            setStatusRibbon({
              type: "error",
              message: "Runtime Error",
            });

          setSubmissions((prev) =>
            prev.map((submission) =>
              submission.id === submissionId
                ? { ...results, user: submission.user }
                : submission
            )
          );
        }
      );
    };

    const unsub = submissions
      .filter((submission) => !submission.evaluated)
      .map((submission) => subscribeToSubmission(submission.id));
    return () => {
      unsub.forEach((u) => u());
    };
  }, [problem.id, session.user.id, submissions]);

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: "url('../problembg.png')",
        backgroundSize: "cover",
      }}
    >
      <div className="rounded-[10px] flex flex-col items-center gap-2 w-full">
        <div className="relative w-full p-4">
          <button className="absolute top-3 left-3" onClick={() => router.back()}>
            <SquareChevronLeft size={48} color="white" />
          </button>
          <h1 className="text-white text-4xl font-bold underline uppercase text-center w-full">
            {problem.title}
          </h1>
        </div>
        <div className="w-[90%] h-[87vh] gap-1">
          <ResizablePanelGroup direction="horizontal" className="gap-1">
            {/* Left Resizable Section */}
            <ResizablePanel defaultSize={30} minSize={20} maxSize={70}>
              <div className="flex flex-col justify-evenly h-full">
                <ResizablePanelGroup direction="vertical" className="gap-1">
                  <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
                    <QuestionDisplay
                      problem={problem}
                      desc={desc}
                      showSolution={showSolution}
                      setShowSolution={setShowSolution}
                    />
                  </ResizablePanel>
                  <ResizableHandle />
                  <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
                    <WebRunner problem={problem} />
                  </ResizablePanel>
                </ResizablePanelGroup>
              </div>
            </ResizablePanel>

            {/* Resizable Handle */}
            <ResizableHandle />

            {/* Right Resizable Section */}
            <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
              <div className="flex flex-col justify-evenly h-full">
                <ResizablePanelGroup direction="vertical" className="gap-1">
                  <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
                    <CodeEditor
                      problem={problem}
                      statusRibbon={statusRibbon}
                      setStatusRibbon={setStatusRibbon}
                      setSubmissions={setSubmissions}
                      session={session}
                      showSolution={showSolution}
                      solutionCode={problem.solution?.code || ""}
                    />
                  </ResizablePanel>
                  <ResizableHandle />
                  <ResizablePanel defaultSize={30} minSize={30} maxSize={70}>
                    {showSolution ? (
                      <div
                        className="rounded-lg flex flex-col h-full bg-black/50 border-2 border-weirdPurple hover:border-primary"
                        style={{
                          borderRadius: "8px",
                          backdropFilter: "blur(2.5px)",
                          WebkitBackdropFilter: "blur(2.5px)",
                          whiteSpace: "pre-wrap", // Preserve newlines and formatting
                        }}
                      >
                        <div
                          className="w-full rounded-lg p-4 text-white h-full overflow-y-auto hide-scrollbar"
                        >
                          <h2 className="text-xl font-bold mb-2">
                            Solution Explanation
                          </h2>
                          <p>
                            {(problem.solution && problem.solution.explanation) ||
                              "No explanation provided."}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <SubmissionSection
                        isPending={isPending}
                        setSubmissions={setSubmissions}
                        submissions={submissions}
                        currentUserId={session.user.id}
                      />
                    )}
                  </ResizablePanel>
                </ResizablePanelGroup>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
