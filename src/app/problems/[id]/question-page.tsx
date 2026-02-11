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
import React, { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { getTeamSubmissions } from "@/app/problems/[id]/actions";
import getSubmissionResults from "@/app/actions/get-submission-results";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { doc, onSnapshot } from "@firebase/firestore";
import { db } from "@/lib/firebase-service";
import { formula1Bold } from "@/lib/fonts";

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

  // Track active Firestore subscriptions to avoid duplicates
  const activeSubsRef = useRef<Map<string, () => void>>(new Map());

  const subscribeToSubmission = useCallback((submissionId: string) => {
    // Don't subscribe if already listening
    if (activeSubsRef.current.has(submissionId)) return;

    const unsub = onSnapshot(doc(db, "submissions", submissionId), async (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      // Only fetch results once the submission is marked as processed
      if (!data?.processed) return;

      try {
        const results = await getSubmissionResults(submissionId);
        const evalStatus = results.evaluated
          ? (results.evaluationStatus as EvalEnum | null) ?? null
          : null;

        if (!results.evaluated) return;

        const passed = results.testcasesPassed ?? 0;
        const total = results.totalTestcases ?? 0;
        
        if (evalStatus === "ACCEPTED" || evalStatus === "WRONG_ANSWER")
          setStatusRibbon({ type: "evaluation", passed, total });
        else if (evalStatus === "COMPILATION_ERROR")
          setStatusRibbon({ type: "error", message: "Compile Error" });
        else if (evalStatus?.startsWith("RUNTIME_ERROR"))
          setStatusRibbon({ type: "error", message: "Runtime Error" });
        else if (evalStatus)
          setStatusRibbon({ type: "error", message: evalStatus });

        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === submissionId ? { ...s, ...results, evaluated: true, evaluationStatus: evalStatus } : s
          )
        );

        // Unsubscribe once processed
        unsub();
        activeSubsRef.current.delete(submissionId);
      } catch (err) {
        console.error("Error fetching submission results:", err);
      }
    });

    activeSubsRef.current.set(submissionId, unsub);
  }, []);

  // Subscribe to unevaluated submissions whenever the list changes
  useEffect(() => {
    const unevaluated = submissions.filter((s) => !s.evaluated);
    for (const sub of unevaluated) {
      subscribeToSubmission(sub.id);
    }
  }, [submissions, subscribeToSubmission]);

  // Cleanup all subscriptions on unmount
  useEffect(() => {
    return () => {
      activeSubsRef.current.forEach((unsub) => unsub());
      activeSubsRef.current.clear();
    };
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: "url('/Dashboard.png')",
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
          <h1 className={`text-white text-4xl font-bold underline uppercase text-center w-full ${formula1Bold.className}`}>
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