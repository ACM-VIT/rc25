// "use client"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"

// import { Switch } from "@/components/ui/switch"
// import { ArrowUpDown, Building2, Users, X, Search } from "lucide-react"

// import { Input } from "@/components/ui/input"
// import type { VenueTeam } from "./page"
// import { assignTeam, assignTeams, unassignTeam, unassignTeams } from "@/app/actions/venue-actions"
// import { Checkbox } from "@nextui-org/react"

// export default function TeamManagement({ teams: initialTeams }: { teams: VenueTeam[] }) {
//   const [teams, setTeams] = useState<VenueTeam[]>(initialTeams)
//   const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set())
//   const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc") // Default to descending
//   const [venueFilter, setVenueFilter] = useState<"ALL" | "CS" | "CHANNA" | "UNALLOCATED">("ALL")
//   const [showCheckedInOnly, setShowCheckedInOnly] = useState(false)
//   const [searchQuery, setSearchQuery] = useState<string>("")
//   const [memberLimit, setMemberLimit] = useState<number>(0)

//   const filteredTeams = teams.filter((team) => {
//     const matchesSearch =
//       team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       team.shortCode.toLowerCase().includes(searchQuery.toLowerCase())
//     const matchesVenue =
//       venueFilter === "ALL" ? true : venueFilter === "UNALLOCATED" ? !team.venue : team.venue === venueFilter
//     const matchesCheckedIn = showCheckedInOnly ? team.checkedIn : true
//     return matchesSearch && matchesVenue && matchesCheckedIn
//   })

//   // Calculate venue statistics
//   const venueStats = teams.reduce(
//     (stats, team) => {
//       if (team.venue === "CHANNA") {
//         stats.channaTeams++
//         stats.channaMembers += team.memberCount
//       } else if (team.venue === "CS") {
//         stats.csTeams++
//         stats.csMembers += team.memberCount
//       } else {
//         stats.unallocatedTeams++
//         stats.unallocatedMembers += team.memberCount
//       }
//       return stats
//     },
//     {
//       channaTeams: 0,
//       channaMembers: 0,
//       csTeams: 0,
//       csMembers: 0,
//       unallocatedTeams: 0,
//       unallocatedMembers: 0,
//     },
//   )

//   const toggleSort = () => {
//     const newOrder = sortOrder === "asc" ? "desc" : "asc"
//     setSortOrder(newOrder)

//     const sortedTeams = [...teams].sort((a, b) => {
//       return newOrder === "asc" ? a.memberCount - b.memberCount : b.memberCount - a.memberCount
//     })

//     setTeams(sortedTeams)
//   }

//   const toggleTeamSelection = (teamId: string) => {
//     const newSelected = new Set(selectedTeams)
//     if (newSelected.has(teamId)) {
//       newSelected.delete(teamId)
//     } else {
//       newSelected.add(teamId)
//     }
//     setSelectedTeams(newSelected)
//   }

//   const selectTeamsByMemberLimit = () => {
//     if (memberLimit <= 0) {
//       setSelectedTeams(new Set())
//       return
//     }

//     const newSelected = new Set<string>()
//     let totalMembers = 0

//     // Get unallocated teams and sort by member count (descending)
//     const unallocatedTeams = teams.filter((team) => !team.venue).sort((a, b) => b.memberCount - a.memberCount) // Always sort by descending for greedy selection

//     for (const team of unallocatedTeams) {
//       if (totalMembers + team.memberCount <= memberLimit) {
//         newSelected.add(team.id)
//         totalMembers += team.memberCount
//       }
//     }

//     setSelectedTeams(newSelected)
//   }

//   const handleVenueAssignment = async (venue: "CS" | "CHANNA") => {
//     const teamsToAssign = teams.filter((team) => selectedTeams.has(team.id))
//     if (teamsToAssign.length === 1) {
//       const result = await assignTeam(teamsToAssign[0], venue)
//       if (result) {
//         setTeams(teams.map((team) => (team.id === result.id ? { ...team, venue } : team)))
//       }
//     } else {
//       const results = await assignTeams(teamsToAssign, venue)
//       if (results.length > 0) {
//         const updatedTeams = teams.map((team) => {
//           const updated = results.find((r) => r?.id === team.id)
//           return updated ? { ...team, venue: updated.venue } : team
//         })
//         setTeams(updatedTeams)
//       }
//     }
//     setSelectedTeams(new Set())
//   }

//   const handleVenueUnassignment = async () => {
//     const teamsToUnassign = teams.filter((team) => selectedTeams.has(team.id))
//     if (teamsToUnassign.length === 1) {
//       const result = await unassignTeam(teamsToUnassign[0])
//       if (result) {
//         setTeams(teams.map((team) => (team.id === result.id ? { ...team, venue: null } : team)))
//       }
//     } else {
//       const results = await unassignTeams(teamsToUnassign)
//       if (results.length > 0) {
//         const updatedTeams = teams.map((team) => {
//           const updated = results.find((r) => r?.id === team.id)
//           return updated ? { ...team, venue: null } : team
//         })
//         setTeams(updatedTeams)
//       }
//     }
//     setSelectedTeams(new Set())
//   }

//   // Calculate total selected members
//   const totalSelectedMembers = Array.from(selectedTeams).reduce((total, teamId) => {
//     const team = teams.find((t) => t.id === teamId)
//     return total + (team?.memberCount || 0)
//   }, 0)

//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//         <div className="p-6">
//           <div className="flex flex-col gap-4">
//             <div className="flex justify-between items-center">
//               <h2 className="text-2xl font-bold text-gray-800">Team Management</h2>
//               <div className="flex items-center gap-4">
//                 <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-3 rounded-lg">
//                   <div className="border-r pr-4">
//                     <h3 className="font-semibold text-blue-600">CS</h3>
//                     <p>
//                       {venueStats.csTeams} teams, {venueStats.csMembers} members
//                     </p>
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-green-600">CHANNA</h3>
//                     <p>
//                       {venueStats.channaTeams} teams, {venueStats.channaMembers} members
//                     </p>
//                   </div>
//                   <div className="col-span-2 border-t pt-2 mt-1">
//                     <h3 className="font-semibold text-orange-600">Unallocated</h3>
//                     <p>
//                       {venueStats.unallocatedTeams} teams, {venueStats.unallocatedMembers} members
//                     </p>
//                   </div>
//                 </div>
//                 <Button variant="outline" onClick={toggleSort} className="flex items-center gap-2">
//                   <ArrowUpDown className="h-4 w-4" />
//                   Sort by Members ({sortOrder === "asc" ? "Ascending" : "Descending"})
//                 </Button>
//               </div>
//             </div>

//             <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
//               <div className="flex items-center gap-4">
//                 <div className="relative">
//                   <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
//                   <Input
//                     type="text"
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className="pl-9 w-64"
//                     placeholder="Search teams..."
//                   />
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Users className="h-5 w-5 text-gray-600" />
//                   <Input
//                     type="number"
//                     min="0"
//                     value={memberLimit}
//                     onChange={(e) => {
//                       const value = Number.parseInt(e.target.value) || 0
//                       setMemberLimit(value)
//                     }}
//                     className="w-32"
//                     placeholder="Member limit"
//                   />
//                   <Button onClick={selectTeamsByMemberLimit} variant="secondary">
//                     Select Teams
//                   </Button>
//                 </div>
//               </div>
//               <div className="text-sm text-gray-600 ml-4">
//                 Selected: {totalSelectedMembers} members from {selectedTeams.size} teams
//               </div>
//               {selectedTeams.size > 0 && (
//                 <div className="flex gap-2 ml-auto">
//                   <Button onClick={() => handleVenueAssignment("CS")} className="bg-blue-600 hover:bg-blue-700">
//                     <Building2 className="mr-2 h-4 w-4" />
//                     Assign to CS
//                   </Button>
//                   <Button onClick={() => handleVenueAssignment("CHANNA")} className="bg-green-600 hover:bg-green-700">
//                     <Building2 className="mr-2 h-4 w-4" />
//                     Assign to CHANNA
//                   </Button>
//                   <Button
//                     onClick={handleVenueUnassignment}
//                     variant="destructive"
//                     className="bg-red-600 hover:bg-red-700"
//                   >
//                     <X className="mr-2 h-4 w-4" />
//                     Unassign Venue
//                   </Button>
//                 </div>
//               )}
//             </div>

//             <div className="flex items-center gap-4 mb-4">
//               <div className="flex items-center gap-2">
//                 <span className="text-sm text-gray-600">Venue Filter:</span>
//                 <select
//                   value={venueFilter}
//                   onChange={(e) => setVenueFilter(e.target.value as "ALL" | "CS" | "CHANNA" | "UNALLOCATED")}
//                   className="border rounded p-1"
//                 >
//                   <option value="ALL">All</option>
//                   <option value="CS">CS</option>
//                   <option value="CHANNA">CHANNA</option>
//                   <option value="UNALLOCATED">Unallocated</option>
//                 </select>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="text-sm text-gray-600">Show Checked In Only</span>
//                 <Switch checked={showCheckedInOnly} onCheckedChange={setShowCheckedInOnly} />
//               </div>
//             </div>
//           </div>

//           <div className="overflow-x-auto mt-6">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="w-12 px-6 py-3">
//                     <Button
//                       onClick={() => {
//                         const allTeamIds = new Set(filteredTeams.map((team) => team.id))
//                         setSelectedTeams(selectedTeams.size === allTeamIds.size ? new Set() : allTeamIds)
//                       }}
//                       variant="outline"
//                       size="sm"
//                     >
//                       {selectedTeams.size === filteredTeams.length ? "Deselect All" : "Select All"}
//                     </Button>
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Team Name
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Short Code
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Members
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Current Venue
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Status
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredTeams.map((team) => (
//                   <tr key={team.id} className="hover:bg-gray-50">
//                     <td className="px-6 py-4">
//                       <Checkbox checked={selectedTeams.has(team.id)} onChange={() => toggleTeamSelection(team.id)} />
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm font-medium text-gray-900">{team.name}</div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-500">{team.shortCode}</div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-900">{team.memberCount}</div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-900">{team.venue || "Not Assigned"}</div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span
//                         className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                           team.checkedIn ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
//                         }`}
//                       >
//                         {team.checkedIn ? "Checked In" : "Not Checked In"}
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

