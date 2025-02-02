import React from 'react';
import Image from 'next/image';
import dark from "../../../public/teamdash.png"
import stormtrooper from "../../../public/stormtrooper.png"
const TeamMembers = ({
  teamMembers = [
    { id: 1, name: "Member 1" },
    { id: 2, name: "Member 2" },
    { id: 3, name: "Member 1" },
    { id: 4, name: "Member 2" },
  ],
  teamName = "Team Alpha",
}) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center text-white p-2 sm:p-4 md:p-5 lg:p-6 xl:p-8">
      <div className="absolute inset-0 z-0">
        <Image
          alt="background"
          src={dark}
          fill
          className="object-center transform"
          priority
        />
      </div>
      <div className="fixed inset-0 w-full h-full bg-black bg-opacity-50" />

      <div className="fixed top-0 w-full p-2 sm:p-3 md:p-4 lg:p-5 xl:p-6 flex justify-end">
        <button className="px-3 sm:px-4 md:px-5 lg:px-6 xl:px-7 py-1 sm:py-2 md:py-2 lg:py-3 xl:py-4 border border-purple-500 text-white hover:bg-white/20 bg-black/50 backdrop-blur-lg text-xs sm:text-sm md:text-base lg:text-lg xl:text-lg">
          LOGOUT
        </button>
      </div>

      <div className="fixed bottom-2 left-2">
        <Image src="/RCLogo.svg" alt="rclogo" width={100} height={50} className="w-[80px] sm:w-[100px] md:w-[110px] lg:w-[120px] xl:w-[130px]" />
      </div>

      <div className="w-full max-w-4xl px-2 py-4 sm:py-6 md:py-7 lg:py-8 xl:py-10">
        <div className="relative w-full p-2 sm:p-4 md:p-5 lg:p-6 xl:p-8">
          <div className="w-full bg-black/50 border-2 border-purple-500 p-2 sm:p-4 md:p-5 lg:p-6 xl:p-8">
            <div className="mb-4 space-y-2 sm:space-y-3 md:space-y-3 lg:space-y-4 xl:space-y-5">
              <div className="flex items-center gap-1">
                <div className="border border-purple-500 flex-1 h-1 sm:h-1.5 md:h-1.5 lg:h-2 xl:h-2" />
                <h4 className="text-purple-500 text-xs sm:text-sm md:text-sm lg:text-base xl:text-lg whitespace-nowrap">
                  A MESSAGE FROM ACM
                </h4>
              </div>

              <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-purple-300 text-center text-lg sm:text-2xl md:text-2xl lg:text-3xl xl:text-4xl how-it-works-heading">
                HELLO {teamName}!
              </h1>

              <div className="flex items-center gap-1">
                <h4 className="text-purple-500 text-xs sm:text-sm md:text-sm lg:text-base xl:text-lg whitespace-nowrap">
                  A MESSAGE FROM ACM
                </h4>
                <div className="border border-purple-500 flex-1 h-1 sm:h-1.5 md:h-1.5 lg:h-2 xl:h-2" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4 md:gap-5 lg:gap-6 xl:gap-7">
              <div className="flex-1">
                <div className="text-base sm:text-xl md:text-xl lg:text-2xl xl:text-3xl text-purple-500 mb-2 md:mb-2 lg:mb-3 xl:mb-4 text-center">SQUADMATES</div>
                <div className="border border-purple-500 w-full h-1 sm:h-1.5 md:h-1.5 lg:h-2 xl:h-2 mb-2 md:mb-2 lg:mb-3 xl:mb-4" />
                <div className="space-y-2 sm:space-y-3 md:space-y-3 lg:space-y-4 xl:space-y-5">
  {teamMembers.map((member) => (
    <div key={member.id}>
      <div className="flex items-center justify-between">
        <p className="text-xs sm:text-sm md:text-sm lg:text-base xl:text-lg flex-1 text-center how-it-works-heading">
          {member.name}
        </p>
        <Image
          src={stormtrooper}
          alt="Stormtrooper"
          width={30}
          height={30}
          className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10"
        />
      </div>
      <div className="border border-purple-500 w-full h-1 sm:h-1.5 md:h-1.5 lg:h-2 xl:h-2 mt-2" />
    </div>
  ))}
</div>

              </div>

              <div className="flex-1 space-y-2 md:space-y-2 lg:space-y-3 xl:space-y-4">
                <div className="bg-black/30 border border-purple-500 p-2 sm:p-3 md:p-3 lg:p-4 xl:p-5 text-center">
                  <div className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl xl:text-5xl font-bold">96</div>
                  <div className="text-xs sm:text-sm md:text-sm lg:text-base xl:text-lg text-purple-300">QUESTIONS SOLVED</div>
                </div>
                <div className="bg-black/30 border border-purple-500 p-2 sm:p-3 md:p-3 lg:p-4 xl:p-5 text-center">
                  <div className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl xl:text-5xl font-bold">96</div>
                  <div className="text-xs sm:text-sm md:text-sm lg:text-base xl:text-lg text-purple-300">POINTS ACQUIRED</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMembers; 