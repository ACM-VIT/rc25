"use client";
import {Prisma} from "@prisma/client";
import {SquareChevronLeft} from 'lucide-react';
// import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import CodeEditor, {StatusRibbonProps} from "./code-editor";
import QuestionDisplay from "./question-display";
import WebRunner from "./web-runner";
import {useRouter} from "next/navigation";
import SubmissionSection, {
    SubmissionWithUser,
} from "@/app/problems/[id]/submission-section";
import React, {useEffect, useState, useTransition} from "react";
import {getTeamSubmissions} from "@/app/problems/[id]/actions";
import getSubmissionResults from "@/app/actions/get-submission-results";

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import {doc, onSnapshot} from "@firebase/firestore";
import {db} from "@/lib/firebase-service";

type ProblemWithRelations = Prisma.ProblemGetPayload<{
    include: { Testcase: true; round: true };
}>;

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
                                         // questions,
                                         // currentSlno,
                                         desc,
                                     }: QuestionPageProps) {
    const router = useRouter();
    // const currentIndex = questions.findIndex((q) => q.slno === currentSlno);
    const [isPending, startTransition] = useTransition();
    const [submissions, setSubmissions] = useState<SubmissionWithUser[]>([]);
    const [statusRibbon, setStatusRibbon] = useState<StatusRibbonProps>(null);
    useEffect(() => {
        startTransition(async () => {
            const data = await getTeamSubmissions(session.user.id, problem.id);
            setSubmissions(data);
        });
    }, [problem.id, session.user.id]);

    // const handleNext = () => {
    //     if (currentIndex < questions.length - 1) {
    //         const nextQuestion = questions[currentIndex + 1];
    //         router.push(`/problems/${nextQuestion.id}`);
    //     }
    // };

    // const handlePrevious = () => {
    //     if (currentIndex > 0) {
    //         const prevQuestion = questions[currentIndex - 1];
    //         router.push(`/problems/${prevQuestion.id}`);
    //     }
    // };

    useEffect(() => {
        const subscribeToSubmission = (submissionId: string) => {
            return onSnapshot(
                doc(db, "submissions", submissionId),
                async (doc) => {
                    if (!doc.data()?.status) return;
                    const results = await getSubmissionResults(submissionId);
                    const passed = results.testcasespassed.filter((r) => r === true).length;
                    if (results.evaluationStatus === "ACCEPTED")
                        setStatusRibbon({
                            type: "evaluation",
                            passed,
                            total: results.testcasespassed.length,
                        })
                    else if (results.evaluationStatus === "COMPILE_ERROR")
                        setStatusRibbon({
                            type: "error",
                            message: "Compile Error",
                        })
                    else if (results.evaluationStatus === "RUNTIME_ERROR")
                        setStatusRibbon({
                            type: "error",
                            message: "Runtime Error",
                        })

                    setSubmissions((prev) =>
                        prev.map((submission) =>
                            submission.id === submissionId
                                ? results : submission
                        )
                    );
                }
            );
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
                backgroundImage: "url('../problembg.png')",
                backgroundSize: "cover",
            }}
        >
            <div className="rounded-[10px] flex flex-col items-center gap-2 w-full">
                <div className="relative w-full p-4 ">
                    <button className="absolute top-3 left-3" onClick={() => router.back()}>
                        <SquareChevronLeft size={48} color="white"/>
                    </button>
                    <h1 className="text-white text-4xl font-bold underline uppercase text-center w-full">
                        {problem.title}
                    </h1>

                    {/* <div className="flex gap-2 absolute right-2 items-center">
                        <button
                            type="button"
                            onClick={handlePrevious}
                            disabled={currentIndex === 0}
                            className={`px-3 py-1 rounded-md text-xs border-2 border-[#9B52E0] bg-black text-white mt-5 ${
                                currentIndex === 0
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-gray-700"
                            }`}
                        >
                            <FiChevronLeft className="inline" />
                            Previous
                        </button>
                        <div className="flex gap-2">
                            {questions
                                .slice(currentIndex, currentIndex + 4)
                                .map((q) => (
                                    <div
                                        key={q.id}
                                        className={`px-3 py-1 rounded-md text-xs border-2 text-white font-bold mt-5 ${
                                            q.slno === currentSlno
                                                ? "border-yellow-500"
                                                : "border-[#9B52E0]"
                                        }`}
                                    >
                                        {q.slno}
                                    </div>
                                ))}
                        </div>
                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={currentIndex === questions.length - 1}
                            className={`px-3 py-1 rounded-md text-xs font-semibold border-[#9B52E0] border-2 text-white mt-5 ${
                                currentIndex === questions.length - 1
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-gray-700"
                            }`}
                        >
                            Next
                            <FiChevronRight className="inline" />
                        </button>
                    </div> */}
                </div>
                <div className="w-[90%] h-[87vh] gap-1">
                    <ResizablePanelGroup
                        direction="horizontal"
                        className="gap-1"
                    >
                        {/* Left Resizable Section */}
                        <ResizablePanel
                            defaultSize={30}
                            minSize={20}
                            maxSize={70}
                        >
                            <div className="flex flex-col justify-evenly h-full">
                                <ResizablePanelGroup
                                    direction="vertical"
                                    className="gap-1"
                                >
                                    <ResizablePanel
                                        defaultSize={50}
                                        minSize={30}
                                        maxSize={70}
                                        // className="h-[50%]"
                                    >
                                        <QuestionDisplay
                                            problem={problem}
                                            desc={desc}
                                        />
                                    </ResizablePanel>
                                    <ResizableHandle/>
                                    <ResizablePanel
                                        defaultSize={50}
                                        minSize={30}
                                        maxSize={70}
                                        // className="h-[45%]"
                                    >
                                        <WebRunner problem={problem}/>
                                    </ResizablePanel>
                                </ResizablePanelGroup>
                            </div>
                        </ResizablePanel>

                        {/* Resizable Handle */}
                        <ResizableHandle/>

                        {/* Right Resizable Section */}
                        <ResizablePanel
                            defaultSize={50}
                            minSize={30}
                            maxSize={70}
                        >
                            <div className="flex flex-col justify-evenly h-full">
                                <ResizablePanelGroup
                                    direction="vertical"
                                    className="gap-1"
                                >
                                    <ResizablePanel
                                        defaultSize={50}
                                        minSize={30}
                                        maxSize={70}
                                        // className="h-[50%]"
                                    >
                                        <CodeEditor
                                            problem={problem}
                                            statusRibbon={statusRibbon}
                                            setStatusRibbon={setStatusRibbon}
                                            setSubmissions={setSubmissions}
                                            session={session}
                                        />
                                    </ResizablePanel>
                                    <ResizableHandle/>
                                    <ResizablePanel
                                        defaultSize={30}
                                        minSize={30}
                                        maxSize={70}
                                        // className="h-[45%]"
                                    >
                                        <SubmissionSection
                                            isPending={isPending}
                                            setSubmissions={setSubmissions}
                                            submissions={submissions}
                                        />
                                    </ResizablePanel>
                                </ResizablePanelGroup>
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </div>
            </div>
        </div>
    );
}
