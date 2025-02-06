// "use client";

// import getTeamVenueData from "@/app/actions/venue-actions";
// import { Prisma } from "@prisma/client";
// import { useEffect, useState } from "react";
// import VenueManagement from "./VenueManagementComponent";

// // Type-safe definition for VenueTeam based on the Prisma schema
// export type VenueTeam = Prisma.TeamGetPayload<{
//   include: {
//     members: true; // Include members count
//   };
// }> & { memberCount: number };

// export default function VenuePage() {
//   const [teams, setTeams] = useState<VenueTeam[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchTeams = async () => {
//       try {
//         const teamsData = await getTeamVenueData();
//         setTeams(teamsData);
//       } catch (error) {
//         console.error("Error fetching teams:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTeams();
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
//       </div>
//     );
//   }

//   return <VenueManagement teams={teams} />;
// }