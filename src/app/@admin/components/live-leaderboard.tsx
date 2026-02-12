"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";

import { db } from "@/lib/firebase-service";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

export interface Team {
  id: string;
  name: string;
  score: number;
}

const ROW_HEIGHT = 48; // px per row for position calculation

const LiveLeaderboard: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const prevRanksRef = useRef<Map<string, number>>(new Map());
  const [rankChanges, setRankChanges] = useState<Map<string, number>>(new Map());
  const [flashIds, setFlashIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const q = query(collection(db, "leaderboard"), orderBy("score", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const teamsData: Team[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Team[];

      // Calculate rank changes
      const prevRanks = prevRanksRef.current;
      const newRankChanges = new Map<string, number>();
      const newFlashIds = new Set<string>();

      teamsData.forEach((team, index) => {
        const currentRank = index + 1;
        const prevRank = prevRanks.get(team.id);
        if (prevRank !== undefined && prevRank !== currentRank) {
          // positive = moved up, negative = moved down
          newRankChanges.set(team.id, prevRank - currentRank);
          newFlashIds.add(team.id);
        }
      });

      // Update prev ranks for next comparison
      const newPrevRanks = new Map<string, number>();
      teamsData.forEach((team, index) => {
        newPrevRanks.set(team.id, index + 1);
      });
      prevRanksRef.current = newPrevRanks;

      setTeams(teamsData);
      setRankChanges(newRankChanges);
      setFlashIds(newFlashIds);

      // Clear flash after animation
      if (newFlashIds.size > 0) {
        setTimeout(() => {
          setFlashIds(new Set());
          setRankChanges(new Map());
        }, 1500);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="h-screen w-full relative flex items-center justify-center">
      <Image
        src="/dashboard.png"
        alt="Background"
        fill
        className="object-cover"
        priority
      />

      <div className="relative z-10 w-full max-w-3xl h-[92vh] mx-auto border-2 border-[#A7282D] bg-black flex flex-col p-6 overflow-hidden">
        {/* Header */}
        <div className="border-b border-white/30 pb-3 mb-4 shrink-0">
          <p className="text-4xl text-white font-['Formula1-Bold'] uppercase text-center">
            Leaderboard
          </p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <p className="text-sm text-white/70 font-['Formula1-Bold'] uppercase">
              LIVE
            </p>
          </div>
        </div>

        {/* Column Headers */}
        <div className="flex items-center text-white/50 font-['Formula1-Bold'] text-xs uppercase tracking-wider pb-3 border-b border-white/10 shrink-0 px-2">
          <span className="w-12 text-center">Rank</span>
          <span className="w-8" />
          <span className="flex-1">Team</span>
          <span className="w-16 text-center">Change</span>
          <span className="w-20 text-right">Score</span>
        </div>

        {/* Leaderboard Rows */}
        <ScrollArea className="flex-1 min-h-0 mt-2">
          <ul className="space-y-0.5">
            {teams.map((team, index) => {
              const change = rankChanges.get(team.id) ?? 0;
              const isFlashing = flashIds.has(team.id);
              const movedUp = change > 0;
              const movedDown = change < 0;

              return (
                <li
                  key={team.id}
                  className={`flex items-center py-3 px-2 border-b border-white/10 font-['Formula1-Bold'] text-white transition-all duration-700 ease-in-out ${
                    isFlashing && movedUp
                      ? "bg-green-500/10 border-green-500/30"
                      : isFlashing && movedDown
                        ? "bg-red-500/10 border-red-500/30"
                        : "hover:bg-white/5"
                  }`}
                >
                  {/* Rank */}
                  <span className="w-12 text-center text-base text-white/60 shrink-0 font-['Orbitron']">
                    {index + 1}
                  </span>

                  {/* Position arrow */}
                  <span className="w-8 text-center text-sm shrink-0">
                    {index < 3 ? (
                      <span style={{ color: "#27AE60" }}>▲</span>
                    ) : index >= teams.length - 2 && teams.length > 5 ? (
                      <span style={{ color: "#EB5757" }}>▼</span>
                    ) : null}
                  </span>

                  {/* Team name */}
                  <span className="flex-1 truncate uppercase tracking-wide text-sm">
                    {team.name}
                  </span>

                  {/* Rank change indicator */}
                  <span className="w-16 text-center text-xs shrink-0 font-['Orbitron']">
                    {isFlashing && movedUp && (
                      <span className="text-green-400 animate-pulse">
                        ↑ {Math.abs(change)}
                      </span>
                    )}
                    {isFlashing && movedDown && (
                      <span className="text-red-400 animate-pulse">
                        ↓ {Math.abs(change)}
                      </span>
                    )}
                  </span>

                  {/* Score */}
                  <span className="w-20 text-right font-semibold text-base font-['Orbitron'] shrink-0">
                    {team.score}
                  </span>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </div>
    </div>
  );
};

export default LiveLeaderboard;