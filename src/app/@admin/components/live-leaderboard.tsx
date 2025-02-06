"use client";

import React, { useEffect, useState } from "react";
import { FaCrown } from "react-icons/fa";
import {
  ScrollArea,
  ScrollAreaViewport,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
} from "@radix-ui/react-scroll-area";

import { db } from "@/lib/firebase-service";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

export interface Team {
  id: string;
  name: string;
  score: number;
  questionsCompleted: number;
  totalQuestions: number;
}

const LiveLeaderboard: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    const q = query(collection(db, "leaderboard"), orderBy("score", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const teamsData: Team[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Team[];
      setTeams(teamsData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat p-2"
      style={{ backgroundImage: 'url("/dashbg.png")' }}
    >
      <div className="h-full bg-transparent overflow-x-hidden justify-center m-2 backdrop-blur-md">
        <p className="text-4xl text-white bg-transparent border-b-2 pb-4 mb-4 text-center h-[10vh] font-['Orbitron']">
          Leaderboard
        </p>
        <ScrollArea className="justify-center h-[68vh]">
          <ScrollAreaViewport>
            {/* Sticky header */}
            <div className="sticky top-0 z-10 bg-opacity-50">
              <div className="flex justify-center text-white px-1 text-center w-full h-[8vh] font-['Orbitron']">
                <span className="w-2/4 text-2xl font-bold text-center">Rank</span>
                <span className="w-1/2 text-2xl font-bold text-center">Team Name</span>
                <span className="w-1/4 text-2xl font-bold text-center">Score</span>
              </div>
            </div>
            <ul className="space-y-3 px-1">
              {teams.map((team, index) => (
                <li
                  key={team.id}
                  className="flex w-3/4 mx-auto bg-slate-700 bg-opacity-50 rounded-lg justify-between text-white items-center h-[9.5vh] font-['Orbitron']"
                >
                  <div className="flex w-1/4 p-4 items-center justify-center">
                    {index === 0 && (
                      <FaCrown size={28} className="text-yellow-500" />
                    )}
                    {index === 1 && (
                      <FaCrown size={28} className="text-gray-400" />
                    )}
                    {index === 2 && (
                      <FaCrown size={28} className="text-[#CD7F32]" />
                    )}
                    {index > 2 && (
                      <span className="text-white">{index + 1}</span>
                    )}
                  </div>
                  <span className="w-1/2 truncate text-center uppercase">
                    {team.name}
                  </span>
                  <span className="w-1/4 text-center font-semibold">
                    {team.score} pts
                  </span>
                </li>
              ))}
            </ul>
          </ScrollAreaViewport>
          <ScrollAreaScrollbar orientation="vertical">
            <ScrollAreaThumb className="bg-gray-500 rounded-full" />
          </ScrollAreaScrollbar>
        </ScrollArea>
      </div>
    </div>
  );
};

export default LiveLeaderboard;
