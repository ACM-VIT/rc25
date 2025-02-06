"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";
import DashboardBox from "@/components/DashboardBox";

const data = [
    { time: "Round 1", TeamAlpha: 50, TeamBeta: 45, TeamGamma: 60, TeamDelta: 48, TeamEpsilon: 55 },
    { time: "Round 2", TeamAlpha: 80, TeamBeta: 70, TeamGamma: 90, TeamDelta: 75, TeamEpsilon: 85 },
    { time: "Round 3", TeamAlpha: 100, TeamBeta: 85, TeamGamma: 120, TeamDelta: 90, TeamEpsilon: 110 },
    { time: "Round 4", TeamAlpha: 120, TeamBeta: 95, TeamGamma: 150, TeamDelta: 110, TeamEpsilon: 130 },
];

export default function WormGraph() {
    return (
        <DashboardBox className="flex justify-center items-center w-full h-screen p-8">
            <div className="w-full h-full flex justify-center items-center bg-black rounded-lg shadow-lg p-6">
                <LineChart width={1000} height={550} data={data}>
                    <XAxis dataKey="time" stroke="white" />
                    <YAxis stroke="white" />
                    <Tooltip formatter={(value, name) => [`${value} Points`, `Team: ${name}`]} />
                    <Legend />
                    <Line type="monotone" dataKey="TeamAlpha" stroke="#FF5733" strokeWidth={3} />
                    <Line type="monotone" dataKey="TeamBeta" stroke="#33FF57" strokeWidth={3} />
                    <Line type="monotone" dataKey="TeamGamma" stroke="#3387FF" strokeWidth={3} />
                    <Line type="monotone" dataKey="TeamDelta" stroke="#F333FF" strokeWidth={3} />
                    <Line type="monotone" dataKey="TeamEpsilon" stroke="#FFD700" strokeWidth={3} />
                </LineChart>
            </div>
        </DashboardBox>
    );
}
