"use client";
import type {
  EvalEnum,
  Problem as ProblemType,
  Round,
  Testcase,
} from "@/db/schema";
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

type ProblemWithRelations = ProblemType & {
  Testcase: Testcase[];
  round: Round;
};

interface QuestionPageProps {
  problem: ProblemWithRelations;
  session: {
    user: {
      id: string;
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
  
  useEffect(() => {
    startTransition(async () => {
      const data = await getTeamSubmissions(session.user.id, problem.id);
      setSubmissions(data);
    });
  }, [problem.id, session.user.id]);

  useEffect(() => {
    const subscribeToSubmission = (submissionId: string) => {
      return onSnapshot(doc(db, "submissions", submissionId), async (doc) => {
        if (!doc.data()?.status) return;
        const evaluationStatus =
          (doc.data()?.status as EvalEnum | null) ?? null;
        const results = await getSubmissionResults(submissionId);
        const passed = results.testcasesPassed;
        if (
          evaluationStatus === "ACCEPTED" ||
          evaluationStatus === "WRONG_ANSWER"
        )
          setStatusRibbon({
            type: "evaluation",
            passed,
            total: results.totalTestcases,
          });
        else if (evaluationStatus === "COMPILATION_ERROR")
          setStatusRibbon({
            type: "error",
            message: "Compile Error",
          });
        else if (evaluationStatus?.startsWith("RUNTIME_ERROR"))
          setStatusRibbon({
            type: "error",
            message: "Runtime Error",
          });

        setSubmissions((prev) =>
          prev.map((submission) =>
            submission.id === submissionId
              ? { ...results, evaluationStatus }
              : submission
          )
        );
      });
    };

    const unsub = submissions
      .filter((submission) => !submission.evaluated)
      .map((submission) => {
        const submissionId = submission.id;
        return subscribeToSubmission(submissionId);
      });
    return () => {
      unsub.forEach((u) => u());
    };
  }, [problem.id, session.user.id, submissions]);

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: "url('../Dashboard.png')",
        backgroundSize: "cover",
      }}
    >
      <div className="rounded-[10px] flex flex-col items-center gap-2 w-full ">
        <div className="relative w-full p-4 ">
          <button
            className="absolute top-3 left-3"
            onClick={() => router.back()}
          >
            <SquareChevronLeft size={48} color="white" />
          </button>
          <h1 className="text-white text-4xl font-bold underline uppercase text-center w-full">
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
            orientation="horizontal"
            className="gap-2 w-full h-full"
          >
            {/* LEFT SECTION */}
            <ResizablePanel defaultSize="40%" minSize="20%" className="h-full">
              {/* Nested Vertical Group - Direct child of ResizablePanel */}
              <ResizablePanelGroup
                orientation="vertical"
                className=" w-full gap-2 h-full"
              >
                <ResizablePanel defaultSize="50%" minSize="30%">
                  <QuestionDisplay problem={problem} desc={desc} />
                </ResizablePanel>

                <ResizableHandle className="w-full" />

                <ResizablePanel defaultSize="50%" minSize="30%">
                  <WebRunner problem={problem} />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>

            <ResizableHandle />

            {/* RIGHT SECTION */}
            <ResizablePanel defaultSize="60%" minSize="30%" className="h-full">
              {/* Nested Vertical Group - Direct child of ResizablePanel */}
              <ResizablePanelGroup
                orientation="vertical"
                className="h-full w-full gap-2"
              >
                <ResizablePanel defaultSize="50%" minSize="30%">
                  <CodeEditor
                    problem={problem}
                    statusRibbon={statusRibbon}
                    setStatusRibbon={setStatusRibbon}
                    setSubmissions={setSubmissions}
                    session={session}
                  />
                </ResizablePanel>

                <ResizableHandle className="w-full" />

                <ResizablePanel defaultSize="50%" minSize="30%">
                  <SubmissionSection
                    isPending={isPending}
                    setSubmissions={setSubmissions}
                    submissions={submissions}
                  />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  );
}