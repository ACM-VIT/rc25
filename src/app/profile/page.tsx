import React from "react";
import Image from "next/image";
import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import { auth } from "../(auth)/auth";
import FloatingDock from "@/components/FloatingDock";
import Header from "@/components/Header";
import SignOut from "@/app/(auth)/authactions/signout";

async function getQuestionsSolved(userIds: string[]) {
  const prisma = new PrismaClient();
  const submissions = await prisma.submission.findMany({
    where: {
      userId: { in: userIds },
    },
    select: {
      problemId: true,
      testcasespassed: true,
    },
  });
  const solvedSubmissions = submissions.filter(
    (sub) =>
      sub.testcasespassed.length === 10 &&
      sub.testcasespassed.every((passed) => passed === true),
  );
  const uniqueProblemIds = new Set(
    solvedSubmissions.map((sub) => sub.problemId),
  );
  await prisma.$disconnect();
  return uniqueProblemIds.size;
}

export default async function Page() {
  const session = await auth();
  if (!session?.user?.id) {
    notFound();
  }

  const prisma = new PrismaClient();
  const user = await prisma.user.findUnique({
    relationLoadStrategy: "join",
    where: { id: session.user.id },
    include: {
      Team: {
        include: {
          members: true,
        },
      },
    },
  });

  if (!user?.Team) {
    await prisma.$disconnect();
    notFound();
  }

  const team = user.Team;
  const memberIds = team.members.map((member) => member.id);
  const questionsSolved = await getQuestionsSolved(memberIds);
  const teamScore = team.score ?? 0;

  await prisma.$disconnect();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start bg-[#0C0C0C] text-white">
      {/* Background */}
      <div className="fixed inset-0 w-full h-full bg-[#0C0C0C]" />

      {/* Top Header */}
      <Header title={team.name} />

      {/* Content Container */}
      <div className="w-full max-w-[1400px] p-8 z-10 space-y-8 flex flex-col items-center">
        <div className="relative w-full space-y-8">
          {/* Team Members Grid - 2x2 */}
          <div
            className={`grid grid-cols-2 gap-x-80 gap-y-8 mb-12 ${team.members.length > 4 ? "max-h-[240px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" : ""}`}
          >
            {team.members.map((member) => (
              <div key={member.id} className="relative w-full mx-auto">
                <div className="flex justify-between items-center bg-[#080A0D] py-4 px-4 border-b-[3px] border-[#A7282D]">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/pokeball.svg"
                      alt="Pokeball"
                      width={28}
                      height={28}
                      className="w-7 h-7 flex-shrink-0 -mt-3"
                    />
                    <div className="flex flex-col">
                      <p className="font-['Formula1-Bold'] text-white">
                        {member.name?.slice(0, member.name.lastIndexOf(" ")) ||
                          member.name ||
                          "Anonymous"}
                      </p>
                      <p className="text-sm text-gray-400 font-['Formula1-Regular']">
                        {team.name}
                      </p>
                    </div>
                  </div>
                  <p className="font-['Orbitron'] text-4xl text-white opacity-45 ">
                    {Math.floor(Math.random() * 91) + 10}
                  </p>
                </div>
                <div className="h-[7px] bg-black"></div>
                <div className="h-[9px] bg-[#222221]"></div>
              </div>
            ))}
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 gap-24 max-w-5xl mx-auto">
            {/* Points Earned */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-3 mb-8">
                <Image
                  src="/cheqflag.svg"
                  alt="Checkered Flag"
                  width={50}
                  height={50}
                />
                <h3 className="text-xl font-['Formula1-Bold'] uppercase text-white">
                  Points<br />Earned
                </h3>
              </div>

              {/* Frame Structure */}
              <div className="w-full max-w-[400px] relative">
                <div className="absolute top-0 left-4 right-4 h-3 bg-[#A7282D] rounded-full z-10"></div>
                <div className="absolute top-1 left-[-24px] w-12 h-[63px] border-l-[5px] border-t-[5px] border-b-[5px] border-[#ADADAD]"></div>
                <div className="absolute top-1 right-[-24px] w-12 h-[63px] border-r-[5px] border-t-[5px] border-b-[5px] border-[#ADADAD]"></div>

                <div className="flex gap-4 justify-center pt-16 pb-6">
                  {String(teamScore).padStart(3, "0").split("").map((digit, index) => (
                    <div
                      key={index}
                      className="relative w-32 h-40 border-2 border-[#A7282D] outline outline-2 outline-[#A7282D] flex items-center justify-center bg-[#0C0C0C] overflow-hidden"
                    >
                      <span
                        className="text-8xl text-white font-bold relative z-10"
                        style={{ fontFamily: "Orbitron, monospace" }}
                      >
                        {digit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Questions Solved */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-3 mb-8">
                <Image
                  src="/cheqflag.svg"
                  alt="Checkered Flag"
                  width={50}
                  height={50}
                />
                <h3 className="text-xl font-['Formula1-Bold'] uppercase text-white">
                  Questions<br />Solved
                </h3>
              </div>

              <div className="w-full max-w-[320px] relative">
                <div className="absolute top-0 left-4 right-4 h-3 bg-[#A7282D] rounded-full z-10"></div>
                <div className="absolute top-1 left-0 w-6 h-[64px] border-l-[5px] border-t-[5px] border-b-[5px] border-[#ADADAD]"></div>
                <div className="absolute top-1 right-0 w-6 h-[64px] border-r-[5px] border-t-[5px] border-b-[5px] border-[#ADADAD]"></div>

                <div className="flex gap-4 justify-center pt-16 pb-6">
                  {String(questionsSolved).padStart(2, "0").split("").map((digit, index) => (
                    <div
                      key={index}
                      className="relative w-32 h-40 border-2 border-[#A7282D] outline outline-2 outline-[#A7282D] flex items-center justify-center bg-[#0C0C0C] overflow-hidden"
                    >
                      <span
                        className="text-8xl text-white font-bold relative z-10"
                        style={{ fontFamily: "Orbitron, monospace" }}
                      >
                        {digit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Log Out Button */}
      <button
        onClick={SignOut}
        type="button"
        className="fixed bottom-8 right-8 px-8 py-3 bg-[#A7282D] text-white font-['Formula1-Bold'] text-lg hover:bg-[#8a1f24] transition-colors z-50 rounded-full"
      >
        Log Out
      </button>

      {/* Floating Dock */}
      <FloatingDock />
    </div>
  );
}
