"use client";

import type React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import DashboardBox from "@/components/DashboardBox";
import type { DashboardProps } from "@/types/dashboard";
import Link from "next/link";
import FloatingDock from "./FloatingDock";
import News from "./news";
import CountdownTimer from "./countdown-timer";

const Dashboard: React.FC<DashboardProps> = ({
  teamDetails,
  leaderboard,
  questions,
  leaderboardShow,
  news,
}) => {
  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.score - a.score);

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
    <div className="flex flex-col justify-start p-8 items-center min-h-screen">
      <div
        className="fixed inset-0 w-full h-full bg-black"
        style={{
          backgroundImage: `url('/dashboard.png')`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          zIndex: -1,
        }}
      />

      <FloatingDock />

      <div className="flex flex-col items-center justify-between w-full h-[85vh] text-white">
        <div className="flex flex-row w-full justify-center gap-4 h-full">
          {/* Left Column - Team, News, and Timer */}
          <div className="flex flex-col w-1/5 gap-4 h-full">
            {/* Team Details Box */}
            <div className="flex flex-col h-fit max-h-60 flex-none overflow-auto">
              <ScrollArea className="h-full">
                <ul className="space-y-3 pt-4 px-1">
                  {teamDetails.members.map((member) => (
                    <li key={member.id} className="relative">
                      <div className="flex justify-between items-center bg-[#080A0D] py-4 px-4 border-b-[3px] border-[#A7282D]">
                        <div className="flex items-center gap-3">
                          <img
                            src="/pokeball.svg"
                            alt=""
                            className="w-7 h-7 shrink-0 -mt-3"
                          />
                          <div className="flex flex-col">
                            <p className="font-['Formula1-Bold']">
                              {member.name?.slice(
                                0,
                                member.name.lastIndexOf(" "),
                              ) || "Anonymous"}
                            </p>
                            <p className="text-sm text-gray-400 font-['Formula1-Regular']">
                              {teamDetails.name}
                            </p>
                          </div>
                        </div>
                        <p className="font-['Orbitron'] text-2xl">
                          {member.score.toString().padStart(2, "0")}
                        </p>
                      </div>
                      <div className="h-1.75 bg-black"></div>
                      <div className="h-2.25 bg-[#222221]"></div>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>

            {/* News Box - Expands to Fill Remaining Space */}
            <DashboardBox className="flex flex-col flex-1 overflow-auto bg-linear-to-b from-[#000000] to-[#2A2A2A] outline outline-[#A7282D] border-0! rounded-none items-justify-center">
              <p className="text-xl font-['Formula1-Bold'] uppercase tracking-widest border-b border-white/30 pb-4 mb-4 text-center">
                NEWS
              </p>
              {/* Scrollable News Section */}
              <ScrollArea className="max-h-100 overflow-y-auto">
                <div className="space-y-4">
                  {news.map((item) => (
                    <News
                      key={item.id}
                      title={item.title}
                      time={new Date(item.time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      content={item.content}
                    />
                  ))}
                </div>
              </ScrollArea>
            </DashboardBox>

            {/* Countdown Timer - Stays Fixed at Bottom */}
            <DashboardBox className="p-6 text-center h-fit mt-auto bg-linear-to-b from-[#000000] to-[#2A2A2A] outline outline-[#A7282D] border-0! rounded-none">
              <CountdownTimer />
            </DashboardBox>
          </div>

          {/* Middle Column - Questions */}
          <div className="w-1/2">
            <DashboardBox className="h-full bg-linear-to-b from-[#000000] to-[#2A2A2A] outline outline-[#A7282D] border-0! rounded-none">
              <p className="text-2xl font-['Formula1-Bold'] uppercase border-b border-white/30 pb-4 mb-4">
                Questions
              </p>
              <div className="flex flex-row pb-4 w-full font-['Formula1-Bold']">
                <h1 className="w-1/6 text-lg text-center">SI No.</h1>
                <h1 className="w-2/6 text-lg text-center">Question</h1>
                <h1 className="w-1/6 text-lg text-center">Difficulty</h1>
                <h1 className="w-2/6 text-lg text-center">Status</h1>
              </div>
              <ScrollArea className="h-[80%]">
                <div className="space-y-1">
                  {questions
                    .filter((question) => !question.isHidden)
                    .map((question) => (
                      <Link
                        href={`/problems/${question.id}`}
                        key={question.id}
                        className="block"
                      >
                        <div className="flex flex-row items-center py-2 hover:bg-rcred/10 transition-colors font-['Formula1-Bold']">
                          <p className="w-1/6 text-center p-2 text-sm orbitron">
                            {question.slno}.
                          </p>
                          <p className="w-2/6 text-center p-2 text-sm uppercase tracking-wide font-['Formula1-Regular']">
                            {question.questionName}
                          </p>
                          <p
                            className="w-1/6 text-center p-2 text-sm"
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
                            className="w-2/6 text-center p-2 text-sm orbitron"
                            style={{
                              color: getStatusColor(question.status),
                            }}
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

          {/* Right Column - Leaderboard */}
          <div className="w-1/4">
            <DashboardBox className="h-full bg-linear-to-b from-[#000000] to-[#2A2A2A] outline outline-[#A7282D] border-0! rounded-none">
              <div className="border-b border-white/30 pb-2 mb-4">
                <p className="text-2xl overflow-x-hidden font-['Formula1-Bold'] uppercase">
                  Leaderboard
                </p>
                {leaderboardShow && (
                  <p className="text-xs text-white/70 font-['Formula1-Bold']">
                    LIVE
                  </p>
                )}
              </div>
              {leaderboardShow ? (
                <ScrollArea className="h-[90%] overflow-y-auto">
                  <ul className="space-y-1">
                    {sortedLeaderboard.map((team, index) => (
                      <li
                        key={team.id}
                        className="flex justify-between items-center py-2 border-b border-white/10 font-['Formula1-Bold']"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-white/50 w-6 text-center text-sm">
                            {index + 1}
                          </span>
                          <span className="text-green-500 text-xs w-3">
                            {index < 3 ? "▲" : ""}
                          </span>
                          <span className="font-medium truncate uppercase tracking-wide text-sm">
                            {team.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-white/70 text-xs">
                            +{index + 1}
                          </span>
                          <span className="font-semibold text-sm">
                            {team.score}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              ) : (
                <div className="flex justify-center items-center h-[80%]">
                  <p className="text-sm font-['Formula1-Bold'] text-center text-white/70">
                    Leaderboard hidden
                  </p>
                </div>
              )}
            </DashboardBox>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
