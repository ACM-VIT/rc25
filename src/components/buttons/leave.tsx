"use client";

import { useState, useTransition } from "react";
import { leaveTeam } from "@/app/actions/leave-team";

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
      className={`bg-transparent font-extrabold text-[#F0F1FA] px-4 py-2 rounded hover:scale-[1.05] border-2 border-[#CEB7FF] ${
        (isPending || isLoading) && "opacity-50 cursor-not-allowed"
      }`}
    >
      {isPending || isLoading ? "Leaving..." : "Depart Team"}
    </button>
  );
}
