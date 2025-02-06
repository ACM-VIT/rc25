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
      console.log("Firestore snapshot:", snapshot.docs.map(doc => doc.data()));

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
        <p className="text-4xl text-white bg-transparent border-b-2 pb-4 mb-4 text-center h-[10vh]">
          Leaderboard
        </p>
        <div className="flex justify-center text-white mb-2 px-1 text-center w-[85vw] h-[8vh]">
          <span className="w-1/2 text-2xl font-bold text-center">Rank</span>
          <span className="w-1/4 text-2xl font-bold text-center">Team Name</span>
          <span className="w-1/2 text-2xl font-bold text-center">
            Questions Completed
          </span>
          <span className="w-1/4 text-2xl font-bold text-center">Score</span>
        </div>
        {teams.length === 0 ? (
          <div className="text-white text-center">No teams available</div>
        ) : (
          <ScrollArea className="justify-center h-[68vh]">
            <ScrollAreaViewport>
              <ul className="space-y-3 px-1">
                {teams.map((team, index) => (
                  <li
                    key={team.id}
                    className="flex w-3/4 mx-auto bg-slate-700 bg-opacity-50 rounded-lg justify-between text-white items-center h-[9.5vh]"
                  >
                    <div className="flex w-1/6 p-4 items-center justify-center">
                      {index === 0 && (
                        <FaCrown size={28} className="text-yellow-500" />
                      )}
                      {index === 1 && (
                        <FaCrown size={28} className="text-gray-400" />
                      )}
                      {index === 2 && (
                        <FaCrown size={28} className="text-[#CD7F32]" />
                      )}
                      {index > 2 && <span className="text-white">{index + 1}</span>}
                    </div>
                    <span className="w-1/3 font-medium truncate text-center uppercase">
                      {team.name}
                    </span>
                    <span className="w-1/3 text-center">
                      {team.questionsCompleted}/{team.totalQuestions}
                    </span>
                    <span className="w-1/6 text-center font-semibold">
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
        )}
      </div>
    </div>
  );
};

export default LiveLeaderboard;
