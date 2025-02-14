import React, { type ReactNode } from "react";
import { prisma } from "@/utils/prisma";
import "./globals.css";
import { Outfit } from "next/font/google";
import Navbar from "@/components/Navbar";
// import SmallViewportWrapper from "@/components/SmallViewportWrapper";
import { Toaster } from "@/components/ui/toaster";
import moment from "moment-timezone";
import type { Metadata } from "next";

const getISTTime = (date: Date) => {
  return moment(date).tz("Asia/Kolkata");
};

const getCurrentISTTime = () => {
  return moment().tz("Asia/Kolkata");
};

export const metadata: Metadata = {
  title: "Reverse Coding | ACM-VIT",
  description: "ACM-VIT's premier competitive coding event",
  openGraph: {
    title: "Reverse Coding | ACM-VIT",
    description: "ACM-VIT's premier competitive coding event",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

const outfit = Outfit({ subsets: ["latin"] });

interface LayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: LayoutProps) {
  const roundInfo = await prisma.round.findFirst({
    where: {
      start: { lte: new Date() },
      end: { gte: new Date() },
    },
    select: { number: true, start: true, end: true, id: true },
  });

  if (!roundInfo) {
    return (
      <html lang="en">
        <body className={outfit.className}>
          <Navbar name="Dashboard" />
          <div className="flex h-screen items-center justify-center">
            <h1 className="text-4xl text-white">
              Thank you for your interest!
            </h1>
          </div>
          <Toaster />
        </body>
      </html>
    );
  }

  const problems = await prisma.problem.findMany({
    where: { roundId: roundInfo.id },
    orderBy: { id: "asc" },
    include: { submissions: true },
  });

  interface SubmissionType {
    testcasespassed: boolean[];
    createdAt: Date;
  }
  interface ProblemType {
    id: string;
    title: string;
    difficulty: string;
    roundId: string;
    submissions: SubmissionType[];
    isHidden: boolean;
  }
  const questions = problems.map((problem, index) => {
    const bestSubmission = problem.submissions.reduce(
      (best, current) => {
        const currentPassed = current.testcasespassed.filter(Boolean).length;
        const bestPassed = best ? best.testcasespassed.filter(Boolean).length : -1;
        return currentPassed > bestPassed ? current : best;
      },
      null as SubmissionType | null
    );

    const passedArray = bestSubmission?.testcasespassed || [];
    const passCount = passedArray.filter(Boolean).length;
    const total = passedArray.length;
    const status = total > 0 ? `${passCount}/${total}` : "Not Attempted";

    return {
      slno: index + 1,
      id: problem.id,
      questionName: problem.title,
      difficulty: problem.difficulty,
      status,
      isHidden: problem.isHidden,
    };
  });

  const news = await prisma.news.findMany({
    orderBy: { time: "desc" },
    select: { id: true, title: true, content: true, time: true },
  });

  return (
    <html lang="en">
      <body
        className={`min-h-screen flex flex-col ${outfit.className}`}
        style={{
          backgroundImage: "url('./dashbg.png')",
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
        }}
      >
        {/* <SmallViewportWrapper> */}
          {children}
          <Toaster />
        {/* </SmallViewportWrapper> */}
      </body>
    </html>
  );
}
