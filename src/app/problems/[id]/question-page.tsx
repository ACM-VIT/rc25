"use client";
import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import CodeEditor from "./code-editor";
import QuestionDisplay from "./question-display";
import WebRunner from "./web-runner";
import type { Problem } from "./page";
import { useRouter } from "next/navigation";
import SubmissionSection from "@/app/problems/[id]/submission-section"

interface QuestionPageProps {
  problem: Problem;
  session: { user: { id: string } };
  questions: Array<{ id: string; slno: number }>;
  currentSlno: number;
}

export default function QuestionPage({ problem, session, questions, currentSlno }: QuestionPageProps) {
  const router = useRouter();
  const currentIndex = questions.findIndex(q => q.slno === currentSlno);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      const nextQuestion = questions[currentIndex + 1];
      router.push(`/problems/${nextQuestion.id}`);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevQuestion = questions[currentIndex - 1];
      router.push(`/problems/${prevQuestion.id}`);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundImage: "url('../problembg.png')", backgroundSize: "cover" }}
    >
      <div className="w-[90vw] h-[90vh] rounded-[10px] flex flex-col gap-2">
        <div className="flex ml-10">
          <h1 className="text-white text-4xl font-bold underline">{problem.title}</h1>

          <div className="flex gap-2 absolute right-2 items-center">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className={`px-3 py-1 rounded-md text-xs border-2 border-[#9B52E0] bg-black text-white mt-5 ${
                currentIndex === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-700"
              }`}
            >
              <FiChevronLeft className="inline" />
              Previous
            </button>
            <div className="flex gap-2">
              {questions.map(q => (
                <div
                  key={q.id}
                  className={`px-3 py-1 rounded-md text-xs border-2 text-white font-bold mt-5 ${
                    q.slno === currentSlno ? "border-yellow-500" : "border-[#9B52E0]"
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
                currentIndex === questions.length - 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-700"
              }`}
            >
              Next
              <FiChevronRight className="inline" />
            </button>
          </div>
        </div>

        <div className="flex gap-4 flex-grow">
          <div className="w-1/2 flex flex-col gap-1 ml-10">
            <div className="flex-grow">
              <QuestionDisplay problem={problem} />
            </div>
            <div className="h-[50%]">
              <WebRunner problem={problem} />
            </div>  
          </div>
          <div className="w-1/2 flex flex-col-reverse gap-1 ml-10">
            <div className="flex-grow">
              <CodeEditor problem={problem} session={session} />
            </div>
            <div className="h-[50%]">
              <SubmissionSection/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
