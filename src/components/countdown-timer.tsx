"use client";
import React, { useEffect, useState } from "react";
import { getLatestRound, refreshRoundCache } from "@/app/actions/round-actions";
import { formula1Wide } from "@/lib/fonts";

interface CountdownTimerProps {
    compact?: boolean;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ compact = false }) => {
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
        <div className="flex h-full w-full flex-col items-center justify-center">
            {!compact && (
                <div className="mb-4 flex flex-col items-center gap-1">
                    <h1 className={`${formula1Wide.className} text-center text-[18px] leading-[1.5] text-white`}>
                        {roundNumber !== null ? (
                            <>
                                <span className="text-[#F04D4E]">ROUND {roundNumber} </span> {status}
                            </>
                        ) : (
                            "No Active Round"
                        )}
                    </h1>
                </div>
            )}

            <p className="font-['Orbitron'] text-[48px] leading-none text-white tabular-nums">
                {timer}
            </p>
        </div>
    );
};

export default CountdownTimer;
