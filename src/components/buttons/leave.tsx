"use client";

import { useState, useTransition } from "react";
import { leaveTeam } from "@/app/actions/leave-team";
import { Poppins } from "next/font/google";

const poppinsBold = Poppins({ weight: ["700"], subsets: ["latin"], display: "swap" });

export function LeaveButton() {
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const handleLeaveTeam = () => {
    setIsLoading(true);
    startTransition(async () => {
      try {
        const result = await leaveTeam();

        if (!result.success) {
          alert(result.message);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An unexpected error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    });
  };

  return (
    <button
      onClick={handleLeaveTeam}
      disabled={isPending || isLoading}
      className={`${poppinsBold.className} flex h-[71.578px] w-[293.654px] items-center justify-center rounded-[14.683px] bg-[#a7282d] text-center text-[31.875px] leading-[normal] text-white transition-[filter,opacity] duration-200 hover:brightness-110 active:brightness-125 disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {isPending || isLoading ? "Leaving..." : "Leave Squad"}
    </button>
  );
}
