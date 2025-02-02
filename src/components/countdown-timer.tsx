"use client";
import React, { useEffect, useState } from "react";

interface CountdownTimerProps {
    getTimeUntil: string;
}

import { Orbitron } from "next/font/google";

const orbitron = Orbitron({
    subsets: ['latin']
})

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
            `${getTimeRemaining(getTimeUntil).hours}:${getTimeRemaining(getTimeUntil).minutes
            }:${getTimeRemaining(getTimeUntil).seconds}`
        );
        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [getTimeUntil]);
    return (
        <div
            className={`${orbitron.className} flex items-center justify-center p-6 rounded-lg text-text`}
        >
            <span className="text-base md:text-2xl  font-bold">
                {timer[0] + timer[1]} : {timer[3] + timer[4]} : {timer[6] + timer[7]}
            </span>
        </div>
    );
};

export default CountdownTimer;
