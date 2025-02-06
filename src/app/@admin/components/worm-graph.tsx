"use client";

import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";
import DashboardBox from "@/components/DashboardBox"; // Your container component for styling
import { db } from "@/lib/firebase-service";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

interface HistorySnapshot {
  time: string;
  teams: Array<{
    id: string;
    name: string;
    score: number;
  }>;
  createdAt: any;
}

interface ChartData {
  time: string;
  [teamName: string]: number | string;
}

export default function WormGraph() {
  const [data, setData] = useState<ChartData[]>([]);

  useEffect(() => {
    const q = query(collection(db, "leaderboardHistory"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const historySnapshots: HistorySnapshot[] = snapshot.docs.map(doc => doc.data() as HistorySnapshot);
      const chartData: ChartData[] = historySnapshots.map(snapshot => {
        const obj: ChartData = { time: snapshot.time };
        snapshot.teams.forEach(team => {
          obj[team.name] = team.score;
        });
        return obj;
      });
      setData(chartData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <DashboardBox className="flex justify-center items-center w-full h-screen p-8">
      <div className="w-full h-full flex justify-center items-center bg-black rounded-lg shadow-lg p-6">
        <LineChart width={1000} height={550} data={data}>
          <XAxis dataKey="time" stroke="white" />
          <YAxis stroke="white" />
          <Tooltip formatter={(value, name) => [`${value} Points`, `Team: ${name}`]} />
          <Legend />
          {data.length > 0 &&
            Object.keys(data[0])
              .filter(key => key !== "time")
              .map((teamName, index) => {
                const colors = ["#FF5733", "#33FF57", "#3387FF", "#F333FF", "#FFD700", "#33FFF3", "#FF33A8", "#A833FF"];
                return (
                  <Line
                    key={teamName}
                    type="monotone"
                    dataKey={teamName}
                    stroke={colors[index % colors.length]}
                    strokeWidth={3}
                  />
                );
              })}
        </LineChart>
      </div>
    </DashboardBox>
  );
}
