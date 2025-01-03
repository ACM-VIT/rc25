"use client";

import { leaveTeam } from "@/app/actions/leave-team";

export function LeaveButton() {
  const handleLeaveTeam = async () => {
    try {
      const result = await leaveTeam();

      if (result.success) {
        alert(result.message);
        window.location.reload();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <button
      onClick={handleLeaveTeam}
      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
    >
      Leave Team
    </button>
  );
}
