// "use client";
// import type React from "react";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import DashboardBox from "@/components/DashboardBox";
// import type { DashboardProps } from "@/types/dashboard";
// import Link from "next/link";
// import { FaCrown } from "react-icons/fa";
// import FloatingDock from "./FloatingDock";
// import News from "./news";
// import CountdownTimer from "./countdown-timer";

// const Dashboard: React.FC<DashboardProps> = ({
//   teamDetails,
//   leaderboard,
//   questions,
//   leaderboardShow,
//   news,
// }) => {
//   const sortedLeaderboard = [...leaderboard].sort((a, b) => b.score - a.score);

//   const getDifficultyColor = (difficulty: string) => {
//     switch (difficulty) {
//       case "EASY":
//         return "#27AE60";
//       case "MEDIUM":
//         return "#F2994A";
//       case "HARD":
//         return "#EB5757";
//       default:
//         return "#FF0000";
//     }
//   };

//   const getStatusColor = (status: string) => {
//     if (status === "Not Attempted") return "#EB5757";
//     const statusParts = status.split("/").map(Number);
//     if (
//       statusParts.length === 2 &&
//       !Number.isNaN(statusParts[0]) &&
//       !Number.isNaN(statusParts[1])
//     ) {
//       const [passed, total] = statusParts;
//       const percentage = (passed / total) * 100;

//       if (percentage <= 40) return "#EB5757";
//       if (percentage < 100) return "#F2994A";
//       return "#27AE60";
//     }
//     return "#FF0000";
//   };

//   return (
//     <div className="flex flex-col justify-start p-8 items-center min-h-screen">
//       <div
//         className="fixed inset-0 w-full h-full bg-black"
//         style={{
//           backgroundImage: `url('./dashbg.png')`,
//           backgroundPosition: "center",
//           backgroundSize: "cover",
//           backgroundRepeat: "no-repeat",
//           zIndex: -1,
//         }}
//       />
//       <div className="flex md:hidden min-h-screen items-center justify-center">
//         <h1 className="text-white font-semibold text-lg w-[70%] text-center">
//           Oops! It looks like you&apos;re using a smaller screen.
//         </h1>
//       </div>

//       <FloatingDock />

//       <div className="hidden md:flex flex-col items-center justify-between w-full h-[85vh] text-white">
//         <div className="flex flex-row w-full justify-center gap-4 h-full">
//           {/* Left Column - Team, News, and Timer */}
//           <div className="flex flex-col w-1/5 gap-4 h-full">
//             {/* Team Details Box */}
//             <DashboardBox className="flex flex-col h-fit max-h-60 flex-none overflow-auto">
//               <p className="text-xl font-custom border-b border-rcgrey/20 pb-4 truncate">
//                 {teamDetails.name}
//               </p>
//               <ScrollArea className="h-full">
//                 <ul className="space-y-3 pt-4 px-1">
//                   {teamDetails.members.map((member) => (
//                     <li key={member.id} className="flex justify-between">
//                       <p className="flex">
//                         {member.name?.slice(0, member.name.lastIndexOf(" ")) ||
//                           "Anonymous"}
//                       </p>
//                       <p>{member.score}&nbsp;pts</p>
//                     </li>
//                   ))}
//                 </ul>
//               </ScrollArea>
//             </DashboardBox>
//             <DashboardBox className="flex flex-col h-fit max-h-[418px] space-y-4">
//               {/* Header */}
// <p className="text-xl font-semibold border-b-2 font-custom tracking-widest border-rcgrey/20 pb-4 mb-4">
//   NEWS
// </p>
// {/* Scrollable News Section */}
// <ScrollArea className="max-h-[400px] overflow-y-auto">
//   <div className="space-y-4">
//     {news.map((item) => (
//       <News
//         key={item.id}
//         title={item.title}
//         time={new Date(item.time).toLocaleTimeString([], {
//           hour: "2-digit",
//           minute: "2-digit",
//         })}
//         content={item.content}
//       />
//     ))}
//   </div>
//               </ScrollArea>
//             </DashboardBox>

//             <DashboardBox className="p-6 text-center py-4 h-fit flex-none">
//               <div>
//                 <CountdownTimer />
//               </div>
//             </DashboardBox>
//           </div>

//           {/* Middle Column - Questions */}
//           <div className="w-1/2">
//             <DashboardBox className="h-full">
//               <p className="text-2xl font-custom border-b border-rcgrey/20 pb-4 mb-4">
//                 Questions
//               </p>
//               <div className="flex flex-row pb-4 w-full">
//                 <h1 className="w-1/6 text-xl font-bold text-center">Sl No.</h1>
//                 <h1 className="w-2/6 text-xl font-bold text-center">
//                   Question
//                 </h1>
//                 <h1 className="w-1/6 text-xl font-bold text-center">
//                   Difficulty
//                 </h1>
//                 <h1 className="w-2/6 text-xl font-bold text-center">Status</h1>
//               </div>
//               <ScrollArea className="h-[60vh] rounded-md">
//                 <div className="space-y-4">
//                   {questions.map((question) => (
//                     <Link
//                       href={`/problems/${question.id}`}
//                       key={question.id}
//                       className="block"
//                     >
//                       <div className="flex flex-row items-center mt-4 rounded-lg hover:bg-weirdPurple/20 transition-colors">
//                         <p className="w-1/6 text-center p-2">{question.slno}</p>
//                         <p className="w-2/6 text-center p-2">
//                           {question.questionName}
//                         </p>
//                         <p
//                           className="w-1/6 text-center p-2"
//                           style={{
//                             color: getDifficultyColor(question.difficulty),
//                           }}
//                         >
//                           {question.difficulty === "EASY"
//                             ? "Easy"
//                             : question.difficulty === "MEDIUM"
//                             ? "Medium"
//                             : "Hard"}
//                         </p>
//                         <p
//                           className="w-2/6 text-center p-2"
//                           style={{ color: getStatusColor(question.status) }}
//                         >
//                           {question.status}
//                         </p>
//                       </div>
//                     </Link>
//                   ))}
//                 </div>
//               </ScrollArea>
//             </DashboardBox>
//           </div>

//           {/* Right Column - Leaderboard */}
//           <div className="w-1/4">
//             {leaderboardShow && (
//               <DashboardBox className="h-full overflow-auto">
//                 <p className="text-2xl font-custom border-b-2 border-rcgrey/20 pb-4 mb-4">
//                   Leaderboard
//                 </p>
//                 <ul className="space-y-3 px-1">
//                   {sortedLeaderboard.map((team, index) => (
//                     <li
//                       key={team.id}
//                       className="flex justify-between items-center"
//                     >
//                       <div className="flex w-2/3 items-center">
//                         <div className="w-8 flex justify-start items-center">
//                           {index === 0 && (
//                             <FaCrown className="text-yellow-500 mr-2" />
//                           )}
//                           {index === 1 && <FaCrown className="text-gray-400" />}
//                           {index === 2 && (
//                             <FaCrown className="text-[#CD7F32]" />
//                           )}
//                           {index > 2 && (
//                             <span className="text-white">{index + 1}</span>
//                           )}
//                         </div>
//                         <span className="font-medium truncate">
//                           {team.name}
//                         </span>
//                       </div>
//                       <div className="flex items-center justify-end w-1/3">
//                         <span className="font-semibold">{team.score} pts</span>
//                       </div>
//                     </li>
//                   ))}
//                 </ul>
//               </DashboardBox>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
"use client";
import type React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import DashboardBox from "@/components/DashboardBox";
import type { DashboardProps } from "@/types/dashboard";
import Link from "next/link";
import { FaCrown } from "react-icons/fa";
import FloatingDock from "./FloatingDock";
import News from "./news";
import CountdownTimer from "./countdown-timer";

const Dashboard: React.FC<DashboardProps> = ({
  teamDetails,
  leaderboard,
  questions,
  leaderboardShow,
  news,
}) => {
  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.score - a.score);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "#27AE60";
      case "MEDIUM":
        return "#F2994A";
      case "HARD":
        return "#EB5757";
      default:
        return "#FF0000";
    }
  };

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
    <div className="flex flex-col justify-start p-8 items-center min-h-screen">
      <div
        className="fixed inset-0 w-full h-full bg-black"
        style={{
          backgroundImage: `url('./dashbg.png')`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          zIndex: -1,
        }}
      />
      <div className="flex md:hidden min-h-screen items-center justify-center">
        <h1 className="text-white font-semibold text-lg w-[70%] text-center">
          Oops! It looks like you&apos;re using a smaller screen.
        </h1>
      </div>

      <FloatingDock />

      <div className="hidden md:flex flex-col items-center justify-between w-full h-[85vh] text-white">
        <div className="flex flex-row w-full justify-center gap-4 h-full">
          {/* Left Column - Team, News, and Timer */}
          <div className="flex flex-col w-1/5 gap-4 h-full">
            {/* Team Details Box */}
            <DashboardBox className="flex flex-col h-fit max-h-60 flex-none overflow-auto">
              <p className="text-xl font-custom border-b border-rcgrey/20 pb-4 truncate">
                {teamDetails.name}
              </p>
              <ScrollArea className="h-full">
                <ul className="space-y-3 pt-4 px-1">
                  {teamDetails.members.map((member) => (
                    <li key={member.id} className="flex justify-between">
                      <p className="flex">
                        {member.name?.slice(0, member.name.lastIndexOf(" ")) ||
                          "Anonymous"}
                      </p>
                      <p>{member.score}&nbsp;pts</p>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </DashboardBox>

            {/* News Box - Expands to Fill Remaining Space */}
            <DashboardBox className="flex flex-col flex-1 overflow-auto">
              <p className="text-xl font-semibold border-b-2 font-custom tracking-widest border-rcgrey/20 pb-4 mb-4">
                NEWS
              </p>
              {/* Scrollable News Section */}
              <ScrollArea className="max-h-[400px] overflow-y-auto">
                <div className="space-y-4">
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

            {/* Countdown Timer - Stays Fixed at Bottom */}
            <DashboardBox className="p-6 text-center h-fit mt-auto">
              <CountdownTimer />
            </DashboardBox>
          </div>

          {/* Middle Column - Questions */}
          <div className="w-1/2">
            <DashboardBox className="h-full">
              <p className="text-2xl font-custom border-b border-rcgrey/20 pb-4 mb-4">
                Questions
              </p>
              <div className="flex flex-row pb-4 w-full">
                <h1 className="w-1/6 text-xl font-bold text-center">Sl No.</h1>
                <h1 className="w-2/6 text-xl font-bold text-center">
                  Question
                </h1>
                <h1 className="w-1/6 text-xl font-bold text-center">
                  Difficulty
                </h1>
                <h1 className="w-2/6 text-xl font-bold text-center">Status</h1>
              </div>
              <ScrollArea className="h-[60vh] rounded-md">
                <div className="space-y-4">
                  {questions.map((question) => (
                    <Link
                      href={`/problems/${question.id}`}
                      key={question.id}
                      className="block"
                    >
                      <div className="flex flex-row items-center mt-4 rounded-lg hover:bg-weirdPurple/20 transition-colors">
                        <p className="w-1/6 text-center p-2">{question.slno}</p>
                        <p className="w-2/6 text-center p-2">
                          {question.questionName}
                        </p>
                        <p
                          className="w-1/6 text-center p-2"
                          style={{
                            color: getDifficultyColor(question.difficulty),
                          }}
                        >
                          {question.difficulty === "EASY"
                            ? "Easy"
                            : question.difficulty === "MEDIUM"
                            ? "Medium"
                            : "Hard"}
                        </p>
                        <p
                          className="w-2/6 text-center p-2"
                          style={{ color: getStatusColor(question.status) }}
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

          {/* Right Column - Leaderboard */}
          <div className="w-1/4">
            {leaderboardShow && (
              <DashboardBox className="h-full overflow-auto">
                <p className="text-2xl font-custom border-b-2 border-rcgrey/20 pb-4 mb-4">
                  Leaderboard
                </p>
                <ul className="space-y-3 px-1">
                  {sortedLeaderboard.map((team, index) => (
                    <li
                      key={team.id}
                      className="flex justify-between items-center"
                    >
                      <div className="flex w-2/3 items-center">
                        <div className="w-8 flex justify-start items-center">
                          {index === 0 && (
                            <FaCrown className="text-yellow-500 mr-2" />
                          )}
                          {index === 1 && <FaCrown className="text-gray-400" />}
                          {index === 2 && (
                            <FaCrown className="text-[#CD7F32]" />
                          )}
                          {index > 2 && (
                            <span className="text-white">{index + 1}</span>
                          )}
                        </div>
                        <span className="font-medium truncate">
                          {team.name}
                        </span>
                      </div>
                      <div className="flex items-center justify-end w-1/3">
                        <span className="font-semibold">{team.score} pts</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </DashboardBox>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
