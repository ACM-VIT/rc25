"use client";
import React, { useEffect, useState } from "react";
import { Orbitron } from "next/font/google";
import { getLatestRound, refreshRoundCache } from "@/app/actions/round-actions";

const orbitron = Orbitron({
    subsets: ["latin"],
    weight: ["400"],
    display: "swap",
});

const CountdownTimer: React.FC = () => {
    const [timer, setTimer] = useState<string>("00:00:00");
    const [roundNumber, setRoundNumber] = useState<number | null>(null);
    const [status, setStatus] = useState<string>("Fetching...");
    const [timeUntil, setTimeUntil] = useState<number | null>(null);

    const fetchRoundDetails = async () => {
        try {
            const round = await getLatestRound();
            // console.log("Fetched Round Data:", round);

            if (!round) {
                setStatus("No Active Round");
                return;
            }

            // ✅ Convert stored UTC time to user's local time
            const roundTimeUTC = new Date(round.timeUntil);
            const roundTimeLocal = roundTimeUTC.getTime() - new Date().getTimezoneOffset() * 60000;

            setRoundNumber(round.number);
            setStatus(round.status);
            setTimeUntil(roundTimeLocal);
        } catch (error) {
            console.error("Error fetching round details:", error);
            setStatus("Error Fetching Data");
        }
    };

    useEffect(() => {
        fetchRoundDetails();
    }, []);
    useEffect(() => {
        if (!timeUntil) return;
    
        const updateTimer = () => {
            const nowUTC = new Date().getTime(); // Current time in UTC
            const targetUTC = new Date(timeUntil).getTime(); // Stored UTC time
            const targetIST = targetUTC - (5.5 * 60 * 60 * 1000); // ✅ Convert from UTC to IST by subtracting 5.5 hours
    
            const total = targetIST - nowUTC; // Corrected difference
    
            if (total <= 0) {
                setTimer("00:00:00");
                refreshRoundCache().then(); // Auto-fetch next round when timer reaches 0
                return;
            }
    
            const hours = Math.floor(total / (1000 * 60 * 60));
            const minutes = Math.floor((total / (1000 * 60)) % 60);
            const seconds = Math.floor((total / 1000) % 60);
    
            setTimer(
                `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
            );
        };
    
        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [timeUntil]);
    

    return (
        <div className="flex flex-col items-center w-full">
            <div className="flex flex-col items-center space-y-1 gap-2 mb-4">
                <h1 className="text-white text-sm md:text-base lg:text-lg font-['Formula1-Bold'] tracking-wider uppercase">
                    {roundNumber !== null ? (
                        <>
                            <span className="text-[#F04D4E]">ROUND {roundNumber} </span> {status}
                        </>
                    ) : (
                        "No Active Round"
                    )}
                </h1>
            </div>

            <div className={`flex items-center justify-center gap-2 ${orbitron.className}`}>
                <span className="text-3xl text-white text-center">
                    {timer.split(":")[0]}
                </span>
                <span className="text-3xl text-white">:</span>
                <span className="text-3xl text-white text-center">
                    {timer.split(":")[1]}
                </span>
                <span className="text-3xl text-white">:</span>
                <span className="text-3xl text-white text-center">
                    {timer.split(":")[2]}
                </span>
            </div>
        </div>
    );
};

export default CountdownTimer;