'use client'

import { useState, useMemo } from "react"
import { promoteTeams, demoteTeams } from "../../actions/round-team"

interface TeamRound {
  id: string
  teamId: string
  roundId: string
  round: {
    id: string
    number: number
    start: string
  }
}

interface Team {
  id: string
  name: string
  points: number
  teamRound?: TeamRound
}

interface Round {
  id: string
  start: string
  number: number
}

interface TeamsClientProps {
  teams: Team[]
  rounds: Round[]
}


const getLastRound = (rounds: Round[]): string => {
  const sortedRounds = [...rounds].sort((a, b) => 
    new Date(b.start).getTime() - new Date(a.start).getTime()
  )
  return sortedRounds[0]?.id || ""
}

const renderRoundInfo = (team: Team) => {
  if (!team.teamRound?.round) return "Not assigned"
  return `Round ${team.teamRound.round.number}`
}

export default function TeamsClient({ teams, rounds }: TeamsClientProps) {
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "points">("points")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [selectionType, setSelectionType] = useState<"top" | "bottom">("top")
  const [selectionValue, setSelectionValue] = useState(40)
  const [selectionUnit, setSelectionUnit] = useState<"count" | "percent">("count")
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])

  // Initialize filterRound to "all" and targetRound to last round
  const [filterRound, setFilterRound] = useState<string>("all")
  const [targetRound, setTargetRound] = useState<string>(getLastRound(rounds))

  // Update filteredAndSortedTeams
  const filteredAndSortedTeams = useMemo(() => {
    return teams
      .filter(team => 
        team.name.toLowerCase().includes(search.toLowerCase())
      )
      .filter(team => {
        if (filterRound === "all") return true
        return team.teamRound?.roundId === filterRound
      })
      .sort((a, b) => {
        const modifier = sortOrder === "asc" ? 1 : -1
        return sortBy === "name"
          ? a.name.localeCompare(b.name) * modifier
          : (a.points - b.points) * modifier
      })
  }, [teams, search, sortBy, sortOrder, filterRound])

  const handleSelection = () => {
    const eligibleTeams = filteredAndSortedTeams.filter(team => team.teamRound?.round !== undefined)
    const totalEligibleTeams = eligibleTeams.length
    const count =
      selectionUnit === "count"
        ? selectionValue
        : Math.floor(totalEligibleTeams * (selectionValue / 100))

    let teamsToSelect = eligibleTeams
    if (selectionType === "bottom") {
      teamsToSelect = [...eligibleTeams].reverse()
    }

    const selectedIds = teamsToSelect.slice(0, count).map(team => team.id)
    setSelectedTeams(selectedIds)
  }

  const roundOptions = useMemo(() => 
    rounds
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .map(round => (
        <option key={round.id} value={round.id}>
          Round {round.number} ({new Date(round.start).toLocaleDateString()} {new Date(round.start).toLocaleTimeString()})
        </option>
      ))
  , [rounds])

  return (
    <div className="p-4">
      <div className="mb-4 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search teams..."
          className="border p-2 rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "name" | "points")}
          className="border p-2 rounded"
        >
          <option value="name">Sort by Name</option>
          <option value="points">Sort by Points</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
          className="border p-2 rounded"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      {/* New filter: Filter teams by round */}
      <div className="mb-4 flex gap-4">
        <label className="flex items-center gap-2">
          Filter by Round:
          <select
            value={filterRound}
            onChange={(e) => setFilterRound(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="all">All</option>
            {roundOptions}
          </select>
        </label>
        <label className="flex items-center gap-2">
          Target Round:
          <select
            value={targetRound}
            onChange={(e) => setTargetRound(e.target.value)}
            className="border p-2 rounded"
          >
            {roundOptions}
          </select>
        </label>
      </div>

      <div className="mb-4 flex gap-4">
        <select
          value={selectionType}
          onChange={(e) => setSelectionType(e.target.value as "top" | "bottom")}
          className="border p-2 rounded"
        >
          <option value="top">Top</option>
          <option value="bottom">Bottom</option>
        </select>
        <input
          type="number"
          value={selectionValue}
          onChange={(e) => setSelectionValue(Number(e.target.value))}
          className="border p-2 rounded w-20"
        />
        <select
          value={selectionUnit}
          onChange={(e) => setSelectionUnit(e.target.value as "count" | "percent")}
          className="border p-2 rounded"
        >
          <option value="count">Teams</option>
          <option value="percent">Percent</option>
        </select>
        <button
          type="button"
          onClick={handleSelection}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Apply Selection
        </button>
      </div>

      <div className="mb-4 flex gap-4">
        <button
          type="button"
          onClick={async () => {
            console.log("Promoting teams:", selectedTeams)
            console.log("Target round:", targetRound)
            const result = await promoteTeams(selectedTeams, targetRound)
            console.log("Promotion result:", result)
            window.location.reload()
          }}
          className="bg-green-500 text-white px-4 py-2 rounded"
          disabled={selectedTeams.length === 0 || !targetRound}
        >
          Promote Selected Teams
        </button>

        <button
          type="button"
          onClick={async () => {
            if (selectedTeams.length === 0 || !targetRound) return;
            
            const result = await demoteTeams(selectedTeams, targetRound);
            if (result.success) {
              window.location.reload();
            } else {
              console.error("Failed to demote teams");
            }
          }}
          className="bg-red-500 text-white px-4 py-2 rounded"
          disabled={selectedTeams.length === 0 || !targetRound}
        >
          Demote Selected Teams
        </button>
      </div>

      <table className="w-full border-collapse border">
        <thead>
          <tr>
            <th className="border p-2">Selected</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Points</th>
            <th className="border p-2">Current Round</th>
            <th className="border p-2">Round Start Time</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedTeams.map(team => (
            <tr key={team.id} className={!team.teamRound?.round ? "opacity-50" : ""}>
              <td className="border p-2">
                <input
                  type="checkbox"
                  checked={selectedTeams.includes(team.id)}
                  disabled={!team.teamRound?.round}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTeams([...selectedTeams, team.id])
                    } else {
                      setSelectedTeams(selectedTeams.filter(id => id !== team.id))
                    }
                  }}
                />
              </td>
              <td className="border p-2">{team.name}</td>
              <td className="border p-2">{team.points}</td>
              <td className="border p-2">{renderRoundInfo(team)}</td>
              <td className="border p-2">
                {team.teamRound?.round ? new Date(team.teamRound.round.start).toLocaleString() : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}