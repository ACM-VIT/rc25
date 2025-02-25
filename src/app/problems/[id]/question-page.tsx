"use client";
import { Prisma } from "@prisma/client";
import { SquareChevronLeft } from "lucide-react";
import CodeEditor, { StatusRibbonProps } from "./code-editor";
import QuestionDisplay from "./question-display";
import WebRunner from "./web-runner";
import { useRouter } from "next/navigation";
import SubmissionSection from "@/app/problems/[id]/submission-section";
import React, { useEffect, useState, useTransition } from "react";
import { getUserSubmissions } from "@/app/problems/[id]/actions";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase-service";

interface QuestionPageProps {
  problem: Prisma.ProblemGetPayload<{
    include: { Testcase: true; round: true; solution: true };
  }>;
  session: { user: { id: string } };
  questions: Array<{ id: string; slno: number }>;
  currentSlno: number;
  desc: React.ReactElement;
}

export default function QuestionPage({
  problem,
  session,
  questions,
  currentSlno,
  desc,
}: QuestionPageProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [statusRibbon, setStatusRibbon] = useState<StatusRibbonProps>(null);
  const [showSolution, setShowSolution] = useState(false);

  // Initial fetch: only get the current user's submissions
  useEffect(() => {
    startTransition(async () => {
      const data = await getUserSubmissions(session.user.id, problem.id);
      setSubmissions(data);
    });
  }, [problem.id, session.user.id]);

  // Real-time Firestore listener for the current user's submissions
  useEffect(() => {
    const q = query(
      collection(db, "submissions"),
      where("problemId", "==", problem.id),
      where("userId", "==", session.user.id)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedSubmissions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSubmissions(updatedSubmissions);
    });
    return () => unsubscribe();
  }, [problem.id, session.user.id]);

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
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        <div className="w-full rounded-lg p-4 text-white h-full overflow-y-auto">
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
                        submissions={submissions}
                        setSubmissions={setSubmissions}
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
