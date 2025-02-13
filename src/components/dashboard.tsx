"use client";
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import DashboardBox from "@/components/DashboardBox";
import type { DashboardProps } from "@/types/dashboard";
import Link from "next/link";
import FloatingDock from "./FloatingDock";

const Dashboard: React.FC<DashboardProps> = ({ questions }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "#27AE60";
      case "MEDIUM":
        return "#F2994A";
      case "HARD":
        return "#EB5757";
      default:
        return "#FF0000";
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "Not Attempted") return "#EB5757";
    const statusParts = status.split("/").map(Number);
    if (
      statusParts.length === 2 &&
      !Number.isNaN(statusParts[0]) &&
      !Number.isNaN(statusParts[1])
    ) {
      const [passed, total] = statusParts;
      const percentage = (passed / total) * 100;
      if (percentage <= 40) return "#EB5757";
      if (percentage < 100) return "#F2994A";
      return "#27AE60";
    }
    return "#FF0000";
  };

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div
        className="fixed inset-0 w-full h-full bg-black"
        style={{
          backgroundImage: "url('./dashbg.png')",
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          zIndex: -1,
        }}
      />

      <FloatingDock />

      <div className="w-full max-w-screen-xl mx-auto px-8 py-8">
        <div className="flex flex-col items-center justify-center w-full h-[85vh] text-white">
          <DashboardBox className="w-full h-full">
            <p className="text-2xl font-custom border-b border-rcgrey/20 pb-4 mb-4">
              Questions
            </p>
            <div className="flex flex-row pb-4 w-full">
              <h1 className="w-1/6 text-xl font-bold text-center">Q No.</h1>
              <h1 className="w-2/6 text-xl font-bold text-center">Question</h1>
              <h1 className="w-1/6 text-xl font-bold text-center">
                Difficulty
              </h1>
              <h1 className="w-2/6 text-xl font-bold text-center">Status</h1>
            </div>
            <ScrollArea className="h-[80%] rounded-md">
              <div className="space-y-4">
                {questions.map((question) => (
                  <Link
                    href={`/problems/${question.id}`}
                    key={question.id}
                    className="block"
                  >
                    <div className="flex flex-row items-center mt-4 rounded-lg hover:bg-weirdPurple/20 transition-colors">
                      <p className="w-1/6 text-center p-2">
                        {question.slno}
                      </p>
                      <p className="w-2/6 text-center p-2">
                        {question.questionName}
                      </p>
                      <p
                        className="w-1/6 text-center p-2"
                        style={{
                          color: getDifficultyColor(question.difficulty),
                        }}
                      >
                        {question.difficulty === "EASY"
                          ? "Easy"
                          : question.difficulty === "MEDIUM"
                          ? "Medium"
                          : "Hard"}
                      </p>
                      <p
                        className="w-2/6 text-center p-2"
                        style={{ color: getStatusColor(question.status) }}
                      >
                        {question.status}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          </DashboardBox>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
