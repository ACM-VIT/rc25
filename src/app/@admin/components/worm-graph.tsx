"use client";

import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const data = [
  {
    time: "9 AM",
    team1: 8,
    team2: 30,
    team3: 5,
    team4: 0,
    team5: 2,
    team6: 10,
    team7: 15,
    team8: 5,
    team9: 8,
    team10: 3,
  },
  {
    time: "10",
    team1: 25,
    team2: 52,
    team3: 15,
    team4: 10,
    team5: 8,
    team6: 20,
    team7: 30,
    team8: 15,
    team9: 20,
    team10: 12,
  },
  {
    time: "11",
    team1: 28,
    team2: 60,
    team3: 50,
    team4: 15,
    team5: 20,
    team6: 35,
    team7: 40,
    team8: 20,
    team9: 45,
    team10: 15,
  },
  {
    time: "12",
    team1: 30,
    team2: 60,
    team3: 55,
    team4: 20,
    team5: 25,
    team6: 55,
    team7: 45,
    team8: 25,
    team9: 55,
    team10: 20,
  },
  {
    time: "1 PM",
    team1: 35,
    team2: 60,
    team3: 60,
    team4: 30,
    team5: 35,
    team6: 60,
    team7: 55,
    team8: 15,
    team9: 60,
    team10: 30,
  },
  {
    time: "4 PM",
    team1: 60,
    team2: 65,
    team3: 90,
    team4: 35,
    team5: 50,
    team6: 75,
    team7: 60,
    team8: 35,
    team9: 85,
    team10: 35,
  },
  {
    time: "5 PM",
    team1: 75,
    team2: 70,
    team3: 95,
    team4: 50,
    team5: 50,
    team6: 75,
    team7: 65,
    team8: 35,
    team9: 90,
    team10: 55,
  },
  {
    time: "6 PM",
    team1: 85,
    team2: 75,
    team3: 98,
    team4: 60,
    team5: 75,
    team6: 80,
    team7: 70,
    team8: 50,
    team9: 95,
    team10: 75,
  },
  {
    time: "7 PM",
    team1: 90,
    team2: 90,
    team3: 98,
    team4: 85,
    team5: 85,
    team6: 90,
    team7: 85,
    team8: 75,
    team9: 98,
    team10: 85,
  },
  {
    time: "8 PM",
    team1: 98,
    team2: 98,
    team3: 98,
    team4: 98,
    team5: 98,
    team6: 98,
    team7: 98,
    team8: 98,
    team9: 98,
    team10: 80,
  },
];

export default function WormGraph() {
  return (
    <div
      className="w-full min-h-screen bg-cover bg-center bg-no-repeat p-4"
      style={{
        backgroundImage: `url("/dashbg.png")`,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backgroundBlendMode: "multiply",
      }}
    >
      <Card className="w-full max-w-[1200px] mx-auto bg-transparent border-none">
        <CardHeader className="flex flex-row justify-between items-center space-y-0">
          <div className="text-white text-xl font-bold">REVERSE CODING</div>
          <CardTitle className="text-white text-2xl">WORM GRAPH</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              team1: { label: "Team 1", color: "hsl(217, 91%, 60%)" },
              team2: { label: "Team 2", color: "hsl(0, 91%, 71%)" },
              team3: { label: "Team 3", color: "hsl(47, 95%, 57%)" },
              team4: { label: "Team 4", color: "hsl(142, 71%, 45%)" },
              team5: { label: "Team 5", color: "hsl(24, 91%, 60%)" },
              team6: { label: "Team 6", color: "hsl(187, 71%, 73%)" },
              team7: { label: "Team 7", color: "hsl(199, 89%, 77%)" },
              team8: { label: "Team 8", color: "hsl(350, 89%, 77%)" },
              team9: { label: "Team 9", color: "hsl(47, 89%, 77%)" },
              team10: { label: "Team 10", color: "hsl(142, 89%, 77%)" },
            }}
            className="h-[600px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis dataKey="time" stroke="#fff" tick={{ fill: "#fff" }} />
                <YAxis domain={[0, 100]} stroke="#fff" tick={{ fill: "#fff" }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend
                  verticalAlign="middle"
                  align="right"
                  wrapperStyle={{ right: -10 }}
                />
                <Line type="monotone" dataKey="team1" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="team2" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="team3" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="team4" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="team5" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="team6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="team7" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="team8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="team9" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="team10" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
