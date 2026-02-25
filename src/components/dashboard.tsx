"use client";

import React, { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import DashboardBox from "@/components/DashboardBox";
import type { DashboardProps } from "@/types/dashboard";
import Link from "next/link";
import FloatingDock from "./FloatingDock";
import News from "./news";
import CountdownTimer from "./countdown-timer";

const DashboardContent: React.FC<DashboardProps> = ({
  teamDetails,
  leaderboard,
  questions,
  leaderboardShow,
  roundInfo,
  news,
}) => {
  const [liveLeaderboard, setLiveLeaderboard] = useState(leaderboard);
  const [liveQuestions, setLiveQuestions] = useState(questions);

  useEffect(() => {
    setLiveLeaderboard(leaderboard);
  }, [leaderboard]);

  useEffect(() => {
    setLiveQuestions(questions);
  }, [questions]);

  const sortedLeaderboard = [...liveLeaderboard].sort((a, b) => b.score - a.score);

  const teamRank = sortedLeaderboard.findIndex((t) => t.id === teamDetails.id) + 1;
  const teamInLeaderboard = sortedLeaderboard.find((t) => t.id === teamDetails.id);
  const totalQuestions = liveQuestions.filter((q) => !q.isHidden).length;

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
    <div className="flex flex-col items-center h-screen overflow-hidden">
      <div
        className="fixed inset-0 w-full h-full bg-black"
        style={{
          backgroundImage: "url('/Dashboard.png')",
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          zIndex: -1,
        }}
      />

      <FloatingDock />

      <div className="flex w-full text-white p-4 pb-[90px] gap-3 h-full overflow-hidden">
        {/* LEFT COLUMN */}
        <div className="flex flex-col w-[22%] min-w-0 gap-3 h-full overflow-hidden">
          {/* Team Members — compact */}
          <div className="flex flex-col shrink-0">
            <ul className="space-y-1">
              {teamDetails.members.map((member) => (
                <li key={member.id} className="relative">
                  <div className="flex justify-between items-center bg-[#080A0D] py-2.5 px-3 border-b-[3px] border-[#A7282D]">
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src="/pokeball.svg"
                        alt=""
                        className="w-5 h-5 shrink-0 -mt-2"
                      />
                      <div className="flex flex-col min-w-0">
                        <p className="font-['Formula1-Bold'] text-xs truncate">
                          {(member.name?.slice(
                            0,
                            member.name.lastIndexOf(" "),
                          ) || "Anonymous").toUpperCase()}
                        </p>
                        <p className="text-[10px] text-gray-400 font-['Formula1-Regular'] truncate">
                          {teamDetails.name}
                        </p>
                      </div>
                    </div>
                    <p className="font-['Orbitron'] text-xl shrink-0 ml-2">
                      {member.score.toString().padStart(2, "0")}
                    </p>
                  </div>
                  <div className="h-1 bg-black" />
                  <div className="h-1.5 bg-[#222221]" />
                </li>
              ))}
            </ul>
          </div>

          {/* News — flexible */}
          <DashboardBox noGradient className="flex flex-col flex-1 min-h-0 overflow-hidden !border-[#A7282D] !rounded-none p-4">
            <p className="text-base font-['Formula1-Bold'] uppercase tracking-widest border-b border-white/30 pb-3 mb-3 text-center shrink-0">
              NEWS
            </p>
            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-3">
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

          {/* Countdown Timer */}
          <DashboardBox noGradient className="p-4 text-center shrink-0 !border-[#A7282D] !rounded-none">
            <CountdownTimer compact />
          </DashboardBox>
        </div>

        {/* CENTER COLUMN */}
        <div className="flex-1 min-w-0 h-full overflow-hidden">
          <DashboardBox noGradient className="h-full flex flex-col !border-[#A7282D] !rounded-none overflow-hidden">
            <p className="text-xl font-['Formula1-Bold'] uppercase border-b border-white/30 pb-3 mb-3 shrink-0">
              Questions
            </p>
            <div className="flex flex-row pb-3 w-full font-['Formula1-Bold'] shrink-0">
              <h1 className="w-1/6 text-sm text-center">SI No.</h1>
              <h1 className="w-2/6 text-sm text-center">Question</h1>
              <h1 className="w-1/6 text-sm text-center">Points</h1>
              <h1 className="w-2/6 text-sm text-center">Status</h1>
            </div>
            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-0.5">
                {liveQuestions
                  .filter((question) => !question.isHidden)
                  .map((question) => (
                    <Link
                      href={`/problems/${question.id}`}
                      key={question.id}
                      className="block"
                    >
                      <div className="flex flex-row items-center py-2 hover:bg-rcred/10 transition-colors font-['Formula1-Bold']">
                        <p className="w-1/6 text-center p-1 text-sm orbitron">
                          {question.slno}.
                        </p>
                        <p className="w-2/6 text-center p-1 text-sm uppercase tracking-wide font-['Formula1-Regular']">
                          {question.questionName}
                        </p>
                        <p className="w-1/6 text-center p-1 text-sm orbitron">
                          {question.points}
                        </p>
                        <p
                          className="w-2/6 text-center p-1 text-sm orbitron"
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

        {/* RIGHT COLUMN */}
        <div className="w-[24%] min-w-0 h-full overflow-hidden">
          <DashboardBox noGradient className="h-full flex flex-col !border-[#A7282D] !rounded-none overflow-hidden">
            <div className="border-b border-white/30 pb-2 mb-3 shrink-0">
              <p className="text-xl font-['Formula1-Bold'] uppercase">
                Leaderboard
              </p>
              {leaderboardShow && (
                <p className="text-xs text-white/70 font-['Formula1-Bold'] uppercase">
                  LAP {roundInfo.number}/{totalQuestions}
                </p>
              )}
            </div>
            {leaderboardShow ? (
              <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <ScrollArea className="flex-1 min-h-0">
                  <ul className="space-y-0.5">
                    {sortedLeaderboard.map((team, index) => (
                      <li
                        key={team.id}
                        className={`flex justify-between items-center py-1.5 border-b border-white/10 font-['Formula1-Bold'] ${
                          team.id === teamDetails.id ? "bg-white/5" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-white/50 w-5 text-center text-xs shrink-0">
                            {index + 1}
                          </span>
                          <span
                            className="text-xs w-3 shrink-0"
                            style={{
                              color:
                                index < 3
                                  ? "#27AE60"
                                  : index > sortedLeaderboard.length - 3
                                    ? "#EB5757"
                                    : "transparent",
                            }}
                          >
                            {index < 3
                              ? "▲"
                              : index > sortedLeaderboard.length - 3
                                ? "▼"
                                : ""}
                          </span>
                          <span className="font-medium truncate uppercase tracking-wide text-xs">
                            {team.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-white/70 text-xs">
                            +{index + 1}
                          </span>
                          <span className="font-semibold text-xs font-['Orbitron']">
                            {team.score}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>

                {/* Current team pinned at bottom */}
                {teamInLeaderboard && (
                  <div className="shrink-0 border-t border-[#A7282D] pt-2 mt-2">
                    <div className="flex justify-between items-center py-1.5 font-['Formula1-Bold'] bg-white/5 px-1">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-white/70 text-xs shrink-0">👤</span>
                        <span className="text-white/50 w-5 text-center text-xs shrink-0">
                          {teamRank}
                        </span>
                        <span className="font-semibold truncate uppercase tracking-wide text-xs">
                          {teamDetails.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-white/70 text-xs">
                          +{teamRank}
                        </span>
                        <span className="font-semibold text-xs font-['Orbitron']">
                          {teamInLeaderboard.score}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-center items-center flex-1">
                <p className="text-sm font-['Formula1-Bold'] text-center text-white/70">
                  Leaderboard hidden
                </p>
              </div>
            )}
          </DashboardBox>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = (props) => {
  return <DashboardContent {...props} />;
};

export default Dashboard;
