import React, { useState } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Image from "next/image";
import windows from "../assets/windows.png";
import mac from "../assets/mac.png";
import linux from "../assets/linux.png";
import { Button } from "@/components/ui/button";
import DashboardBox from "../../../components/DashboardBox";
import { FaCircleExclamation } from "react-icons/fa6";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Problem {
  difficulty: string;
  maxScore: number;
  description: string;
  mac_dl: string;
  lin_dl: string;
  win_dl: string;
  solutionExplanation?: string;
}

export default function QuestionDisplay({
  problem,
  desc,
  showSolution,
  setShowSolution,
}: {
  problem: Problem;
  desc: React.ReactElement;
  showSolution: boolean;
  setShowSolution: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DashboardBox className="rounded-[10px] flex flex-col h-full w-full">
      <ScrollArea className="rounded-[10px] w-full min-h-0 flex-1">
        <div className="flex items-center justify-between m-4 flex-wrap">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-2xl text-white break-words">
              Problem Details
            </span>
            <Button
              onClick={() => setShowSolution(!showSolution)}
              title="Toggle Solution"
              className="px-2 py-1 rounded-md text-xs font-semibold text-white hover:bg-secondary disabled:opacity-50 border-primary border-2 bg-transparent"
            >
              {showSolution ? "Hide Solution" : "Show Solution"}
            </Button>
          </div>
          <span className="text-green-500 font-bold text-lg">
            {problem.difficulty} - {problem.maxScore} points
          </span>
        </div>
        <div className="ml-4 w-[60%] border border-purple-700 rounded-lg">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-xs text-[#A2A2A2] p-2 flex items-center gap-2 w-full justify-between bg-[#1E1E1E] rounded-lg"
          >
            <div className="flex items-center gap-2">
              <FaCircleExclamation />
              <span>IMPORTANT DETAIL</span>
            </div>
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {isOpen && (
            <div className="p-2 border-t border-purple-700 bg-[#121212] rounded-lg">
              <p className="text-[#A2A2A2] text-xs md:text-[60%] xl:text-xs">
                Use the I/O Runner below to experiment with inputs and uncover
                the logic behind the expected output. Once you've reverse-engineered the solution, write your code in the embedded editor, submit it, and view the results in the submissions pane.
              </p>
            </div>
          )}
        </div>
        <hr className="border-t border-gray-700 mx-4 my-2" />
        <div className="text-white m-4 font-medium max-h-fit">{desc}</div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <div className="flex flex-col w-full">
        <div className="p-1 flex flex-col md:flex-row items-center justify-between border-t border-gray-700 w-full">
          <div className="text-white text-xs font-bold">Run On Your Device:</div>
          <div className="flex gap-2">
            <Button
              onClick={() => window.open(problem.mac_dl, "_blank")}
              variant="outline"
              size="icon"
              className="bg-[#262626] rounded-[6px] border-0 hover:bg-[#000000] p-[2px] w-[28px] h-[28px]"
            >
              <Image src={mac} alt="Mac" className="w-[18px] h-[18px]" />
            </Button>
            <Button
              onClick={() => window.open(problem.lin_dl, "_blank")}
              variant="outline"
              size="icon"
              className="bg-[#262626] rounded-[6px] border-0 hover:bg-[#000000] p-[2px] w-[28px] h-[28px]"
            >
              <Image src={linux} alt="Linux" className="w-[18px] h-[18px]" />
            </Button>
            <Button
              onClick={() => window.open(problem.win_dl, "_blank")}
              variant="outline"
              size="icon"
              className="bg-[#262626] rounded-[6px] border-0 hover:bg-[#000000] p-[2px] w-[28px] h-[28px]"
            >
              <Image src={windows} alt="Windows" className="w-[18px] h-[18px]" />
            </Button>
          </div>
        </div>
      </div>
    </DashboardBox>
  );
}
