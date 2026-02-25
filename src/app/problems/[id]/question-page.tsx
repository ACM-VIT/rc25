"use client";
import { Prisma } from "@prisma/client";
import { SquareChevronLeft } from "lucide-react";
import CodeEditor, { StatusRibbonProps } from "./code-editor";
import QuestionDisplay from "./question-display";
import WebRunner from "./web-runner";
import { useRouter } from "next/navigation";
import SubmissionSection, {
  SubmissionWithUser,
} from "@/app/problems/[id]/submission-section";
import React, { useEffect, useState, useTransition } from "react";
import { getUserSubmissions } from "@/app/problems/[id]/actions";
import getSubmissionResults from "@/app/actions/get-submission-results";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { doc, onSnapshot } from "@firebase/firestore";
import { db } from "@/lib/firebase-service";
import { formula1Bold } from "@/lib/fonts";

// Updated type to include 'solution'
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
  desc,
}: QuestionPageProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submissions, setSubmissions] = useState<SubmissionWithUser[]>([]);
  const [statusRibbon, setStatusRibbon] = useState<StatusRibbonProps>(null);
  const [showSolution, setShowSolution] = useState(false);

  // Fetch the current user's submissions for this problem.
  useEffect(() => {
    startTransition(async () => {
      const data = await getUserSubmissions(session.user.id, problem.id);
      setSubmissions(data);
    });
  }, [problem.id, session.user.id]);

  // Subscribe to real-time updates for pending submissions.
  useEffect(() => {
    const subscribeToSubmission = (submissionId: string) => {
      return onSnapshot(
        doc(db, "submissions", submissionId),
        async (docSnapshot) => {
          if (!docSnapshot.data()?.status) return;
          const results = await getSubmissionResults(submissionId);
          const passed = results.testcasespassed?.filter((r) => r === true).length ?? 0;
          const total = results.testcasespassed?.length ?? 0;
          if (results.evaluationStatus === "ACCEPTED")
            setStatusRibbon({
              type: "evaluation",
              passed,
              total,
            });
          else if (results.evaluationStatus === "COMPILE_ERROR")
            setStatusRibbon({
              type: "error",
              message: "Compile Error",
            });
          else if (results.evaluationStatus?.startsWith("RUNTIME_ERROR"))
            setStatusRibbon({
              type: "error",
              message: "Runtime Error",
            });

          setSubmissions((prev) =>
            prev.map((submission) =>
              submission.id === submissionId
                ? { ...results, user: submission.user }
                : submission,
            ),
          );
        },
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
      className="h-screen overflow-hidden"
      style={{
        backgroundImage: "url('/Dashboard.png')",
        backgroundSize: "cover",
      }}
    >
      <div className="rounded-[10px] flex flex-col items-center gap-2 w-full">
        <div className="relative w-full p-4">
          <button
            className="absolute top-3 left-3"
            onClick={() => router.back()}
          >
            <SquareChevronLeft size={48} color="white" />
          </button>
          <h1
            className={`text-white text-4xl font-bold underline uppercase text-center w-full ${formula1Bold.className}`}
          >
            {problem.title}
          </h1>
        </div>

        {/* Main Content - Desktop Layout (lg and up) */}
        <div
          className="hidden lg:block w-full max-w-[98vw] px-2 xl:px-4"
          style={{ height: "calc(100vh - 120px)" }}
        >
          {/* Main Horizontal Group */}
          <ResizablePanelGroup
            direction="horizontal"
            className="gap-2 w-full h-full"
          >
            {/* LEFT SECTION */}
            <ResizablePanel defaultSize={40} minSize={20} className="h-full">
              {/* Nested Vertical Group - Direct child of ResizablePanel */}
              <ResizablePanelGroup
                direction="vertical"
                className=" w-full gap-2 h-full"
              >
                <ResizablePanel defaultSize={50} minSize={30}>
                  <QuestionDisplay
                    problem={problem}
                    desc={desc}
                    showSolution={showSolution}
                    setShowSolution={setShowSolution}
                  />
                </ResizablePanel>

                <ResizableHandle className="w-full" />

                <ResizablePanel defaultSize={50} minSize={30}>
                  <WebRunner problem={problem} />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>

            <ResizableHandle />

            {/* RIGHT SECTION */}
            <ResizablePanel defaultSize={60} minSize={30} className="h-full">
              {/* Nested Vertical Group - Direct child of ResizablePanel */}
              <ResizablePanelGroup
                direction="vertical"
                className="h-full w-full gap-2"
              >
                <ResizablePanel defaultSize={50} minSize={30}>
                  <CodeEditor
                    problem={problem}
                    statusRibbon={statusRibbon}
                    setStatusRibbon={setStatusRibbon}
                    setSubmissions={setSubmissions}
                    submissions={submissions}
                    session={session}
                    showSolution={showSolution}
                    solutionCode={problem.solution?.code || ""}
                  />
                </ResizablePanel>

                <ResizableHandle className="w-full" />

                <ResizablePanel defaultSize={50} minSize={30}>
                  {showSolution ? (
                    <div
                      className="rounded-lg flex flex-col h-full bg-black/50 border-2 border-[#A7282D]"
                      style={{
                        borderRadius: "8px",
                        backdropFilter: "blur(2.5px)",
                        WebkitBackdropFilter: "blur(2.5px)",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      <div className="w-full rounded-lg p-4 text-white h-full overflow-y-auto hide-scrollbar">
                        <h2 className="text-xl font-bold mb-2">Solution Explanation</h2>
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
                    />
                  )}
                </ResizablePanel>
              </ResizablePanelGroup>
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
