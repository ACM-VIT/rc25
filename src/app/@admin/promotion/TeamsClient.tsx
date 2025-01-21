'use client'

import { useState, useMemo } from 'react'
import { promoteTeams, demoteTeams } from '../../actions/round-team'

interface Team {
  id: string
  name: string
  points: number
  currentRound: string | undefined
}

interface TeamsClientProps {
  teams: Team[]
  nextRoundId: string | undefined
}

export default function TeamsClient({ teams, nextRoundId }: TeamsClientProps) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'points'>('points')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectionType, setSelectionType] = useState<'top' | 'bottom'>('top')
  const [selectionValue, setSelectionValue] = useState(40)
  const [selectionUnit, setSelectionUnit] = useState<'count' | 'percent'>('count')
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])

  const filteredAndSortedTeams = useMemo(() => {
    return teams
      .filter(team => 
        team.name.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        const modifier = sortOrder === 'asc' ? 1 : -1
        return sortBy === 'name' 
          ? a.name.localeCompare(b.name) * modifier
          : (a.points - b.points) * modifier
      })
  }, [teams, search, sortBy, sortOrder])

  const handleSelection = () => {
    const eligibleTeams = filteredAndSortedTeams.filter(team => team.currentRound !== undefined)
    const totalEligibleTeams = eligibleTeams.length
    const count = selectionUnit === 'count' 
      ? selectionValue 
      : Math.floor(totalEligibleTeams * (selectionValue / 100))
    
    let teamsToSelect = eligibleTeams
    if (selectionType === 'bottom') {
      teamsToSelect = [...eligibleTeams].reverse()
    }
    
    const selectedIds = teamsToSelect
      .slice(0, count)
      .map(team => team.id)
    
    setSelectedTeams(selectedIds)
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Search teams..."
          className="border p-2 rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'points')}
          className="border p-2 rounded"
        >
          <option value="name">Sort by Name</option>
          <option value="points">Sort by Points</option>
        </select>
        
        <select 
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
          className="border p-2 rounded"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      <div className="mb-4 flex gap-4">
        <select 
          value={selectionType}
          onChange={(e) => setSelectionType(e.target.value as 'top' | 'bottom')}
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
          onChange={(e) => setSelectionUnit(e.target.value as 'count' | 'percent')}
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
            console.log('Promoting teams:', selectedTeams);
            console.log('Next round:', nextRoundId);
            const result = await promoteTeams(selectedTeams, nextRoundId);
            console.log('Promotion result:', result);
            window.location.reload();
          }}
          className="bg-green-500 text-white px-4 py-2 rounded"
          disabled={selectedTeams.length === 0 || !nextRoundId}
        >
          Promote Selected Teams
        </button>
        
        <button 
          type="button"
          onClick={async () => {
            const result = await demoteTeams(selectedTeams, nextRoundId);
            console.log('Demotion result:', result);
            window.location.reload();
          }}
          className="bg-red-500 text-white px-4 py-2 rounded"
          disabled={selectedTeams.length === 0 || !nextRoundId}
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
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedTeams.map(team => (
            <tr key={team.id} className={team.currentRound === undefined ? 'opacity-50' : ''}>
              <td className="border p-2">
                <input 
                  type="checkbox"
                  checked={selectedTeams.includes(team.id)}
                  disabled={team.currentRound === '-1'}
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
              <td className="border p-2">{team.currentRound === '-1' ? 'Not checked in' : team.currentRound}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}