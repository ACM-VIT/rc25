"use client";
import { LeaveButton } from "@/components/buttons/leave";
import type { User } from "@prisma/client";
import Image from "next/image";
import SignOut from "@/app/(auth)/authactions/signout";
import { Copy } from "lucide-react";
import { useState } from "react";

interface TeamMembersProps {
  teamMembers: User[];
  teamName: string | "";
  code: string;
  min_team_size: number;
}

export function TeamMembers({
  teamMembers,
  teamName,
  code,
  min_team_size,
}: TeamMembersProps) {
  const [showToast, setShowToast] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center text-white">
      {/* Toast Notification */}
      <div
        className={`fixed top-4 flex justify-center bg-black/80 backdrop-blur-sm border border-weirdPurple text-white px-4 py-2 rounded 
          transform transition-all duration-300 z-50 font-custom
          ${
            showToast
              ? "translate-y-0 opacity-100"
              : "-translate-y-4 opacity-0 pointer-events-none"
          }`}
      >
        Copied to clipboard
      </div>

      <div
        className="fixed inset-0 w-full h-full bg-black"
        style={{
          backgroundImage: `url(https://rc25-assets.acmvit.in/backgrounds/createTeamBg.png)`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          zIndex: -1,
        }}
      />

      {/* Header with logout button */}
      <div className="fixed top-0 w-full p-4 flex justify-end">
        <button
          type="button"
          onClick={SignOut}
          className="transition-colors duration-150 px-4 py-2 border border-primary 
            text-text hover:bg-white/20 bg-black/50 backdrop-blur-lg"
        >
          LOGOUT
        </button>
      </div>

      {/* Logo */}
      <Image
        src="/RCLogo.svg"
        alt="rclogo"
        width={190}
        height={100}
        className="fixed bottom-4 left-4"
      />

      {/* Main content container */}
      <div className="w-full max-w-7xl px-4 py-8 md:px-8">
        <div className="relative w-full p-4 md:p-8 lg:p-16">
          {/* Frame decorations */}
          <Image
            src="https://rc25-assets.acmvit.in/frameDecoration.svg"
            alt="frame"
            width={190}
            height={100}
            className="absolute w-auto top-0 left-0 h-[60px] md:h-[100px] z-50"
          />
          <Image
            src="https://rc25-assets.acmvit.in/frameDecoration.svg"
            alt="frame"
            width={190}
            height={100}
            className="rotate-180 absolute w-auto bottom-0 right-0 h-[60px] md:h-[100px] z-50"
          />

          {/* Content box */}
          <div
            className="w-full bg-black/50 border-4 border-weirdPurple 
            p-4 md:p-8 lg:p-16"
          >
            {/* Header section */}
            <div className="mb-8 space-y-4">
              <div className="flex items-center gap-2">
                <div className="border border-weirdPurple flex-1 h-2 md:h-3" />
                <h4 className="font-custom text-weirdPurple text-xs md:text-base whitespace-nowrap">
                  A MESSAGE FROM ACM
                </h4>
              </div>

              <h1
                className="font-custom border-weirdPurple text-center text-transparent text-hollow
                text-2xl sm:text-3xl md:text-5xl lg:text-[58px]"
              >
                HELLO {teamName} !
              </h1>

              <div className="flex items-center gap-2">
                <h4 className="font-custom text-weirdPurple text-xs md:text-base whitespace-nowrap">
                  A MESSAGE FROM ACM
                </h4>
                <div className="border border-weirdPurple flex-1 h-2 md:h-3" />
              </div>

              <h3 className="text-center text-lg md:text-xl text-[#EB5757] font-bold">
                {teamMembers.length < min_team_size
                  ? "A BIT LONELY, IT FEELS. A SQUAD OF AT LEAST TWO, YOU MUST GATHER!"
                  : null}
              </h3>
            </div>
            <div className="w-full flex flex-col item-center justify-center text-2xl md:text-4xl text-weirdPurple font-custom">
              <div className="mx-auto pb-6">SQUADMATES</div>
              <div className="border mx-auto border-weirdPurple w-full max-w-md h-2 md:h-3 mb-4" />
            </div>

            {/* Team members list */}
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col items-center space-y-4 px-4"
                >
                  <div className="flex flex-col items-center gap-4 w-full">
                    <p className="font-custom text-base md:text-lg tracking-wider">
                      {(member.name ?? "").split(" ").slice(0, -1).join(" ")}
                    </p>
                    <div className="border border-weirdPurple w-full max-w-md h-2 md:h-2" />
                  </div>
                </div>
              ))}
            </div>

            {/* Squad code section */}
            <div className="mt-8 w-full flex items-center justify-center">
              <button onClick={handleCopy}>
                <div
                  className="bg-[#9B51E080] flex flex-col sm:flex-row items-center justify-center p-3 sm:p-4 
                text-center backdrop-blur-sm border border-white 
                w-full sm:w-auto min-w-[200px] sm:min-w-[300px] md:min-w-[350px] 
                gap-2 sm:gap-4"
                >
                  <p className="text-white text-lg sm:text-xl md:text-2xl font-custom whitespace-nowrap">
                    SQUAD CODE
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg sm:text-xl md:text-2xl font-bold whitespace-nowrap">
                      {code}
                    </p>
                    <Copy className="w-5 h-5" />
                  </div>
                </div>
              </button>
            </div>

            {/* Leave button */}
            <div className="flex justify-end w-full pt-4">
              <LeaveButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeamMembers;
