"use client";
import React, { useEffect, useState } from "react";

interface CountdownTimerProps {
    getTimeUntil: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ getTimeUntil }) => {
    const [timer, setTimer] = useState<string>("00:00:00");

    const getTimeRemaining = (end: string) => {
        const total = new Date(end).getTime() - new Date().getTime();
        if (total < 0) {
            return {
                total: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
            };
        }
        const seconds = Math.floor((total / 1000) % 60);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        const hours = Math.floor((total / 1000 / 60 / 60) % 24);
        return {
            total: total,
            hours: hours,
            minutes: minutes,
            seconds: seconds,
        };
    };

    useEffect(() => {
        if (isNaN(Date.parse(getTimeUntil))) {
            console.error(
                "Invalid date format for `getTimeUntil`:",
                getTimeUntil
            );
            console.log(Date.now());
        }
        const updateTimer = () => {
            const timeRemaining = getTimeRemaining(getTimeUntil);
            setTimer(
                `${String(timeRemaining.hours).padStart(2, "0")}:${String(
                    timeRemaining.minutes
                ).padStart(2, "0")}:${String(timeRemaining.seconds).padStart(
                    2,
                    "0"
                )}`
            );
        };
        setTimer(
            `${getTimeRemaining(getTimeUntil).hours}:${
                getTimeRemaining(getTimeUntil).minutes
            }:${getTimeRemaining(getTimeUntil).seconds}`
        );
        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [getTimeUntil]);
    return (
        <div>
            <div
                style={{
                    background: `linear-gradient(0deg, rgba(57, 35, 78, 0.25), rgba(57, 35, 78, 0.25)),
                 linear-gradient(0deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.03))`,
                }}
                className="flex items-center justify-center gap-1 md:gap-2 p-6 mt-2 shadow-lg rounded-lg text-white"
            >
                <div className="flex flex-col items-center">
                    <span className="text-base md:text-xl font-mono font-bold">
                        {timer[0] + timer[1]}
                    </span>
                    <span className="text-xs md:text-sm mt-1">Hours</span>
                </div>

                <span className="text-base font-bold mb-5">:</span>

                <div className="flex flex-col items-center">
                    <span className="text-base md:text-xl font-mono font-bold">
                        {timer[3] + timer[4]}
                    </span>
                    <span className="text-xs md:text-sm mt-1">Minutes</span>
                </div>

                <span className="text-base font-bold mb-5">:</span>

                <div className="flex flex-col items-center">
                    <span className="text-base md:text-xl font-mono font-bold">
                        {timer[6] + timer[7]}
                    </span>
                    <span className="text-xs md:text-sm mt-1">Seconds</span>
                </div>
            </div>
        </div>
    );
};

export default CountdownTimer;
