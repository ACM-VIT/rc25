"use client";
import DashboardBox from "@/components/DashboardBox";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Instructions() {
  const instructions = [
    {
      title: "Introduction",
      description:
        "Welcome to the Future Portal. This platform allows you to revisit past Reverse Coding questions and explore detailed solutions at your own pace."
    },
    {
      title: "Try Out Questions",
      description:
        "Browse our collection of questions from the competition. Use the interactive editor to test your problem-solving skills and learn by doing."
    },
    {
      title: "View Solutions",
      description:
        "Access comprehensive solutions for every question. Understand various approaches and deepen your knowledge of problem-solving techniques."
    },
    {
      title: "Continuous Learning",
      description:
        "Leverage this portal as a resource for preparing for future contests. Review past challenges, refine your strategies, and keep learning."
    },
  ];

  return (
    <div
      className="min-h-screen relative flex flex-col items-center justify-center p-6"
      style={{
        backgroundImage: "url('./submissionsbg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <h1 className="text-5xl font-bold text-white mb-6 underline">
        Future Portal
      </h1>
      <DashboardBox className="shadow-lg w-[85vw] max-w-4xl h-[70vh] rounded-lg p-6 border text-white bg-opacity-80 backdrop-blur-md">
        <ScrollArea className="flex-grow h-full w-full rounded-lg">
          <ol className="list-decimal pl-6 space-y-6 text-lg">
            {instructions.map((instruction) => (
              <li key={instruction.title}>
                <h3 className="text-xl font-bold">
                  {instruction.title}
                </h3>
                <ul className="list-inside mt-2 text-sm leading-relaxed">
                  {instruction.description.split("\n").map((line, idx) => (
                    <li key={`${instruction.title}-${idx}`}>
                      {line}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </ScrollArea>
      </DashboardBox>
    </div>
  );
}
