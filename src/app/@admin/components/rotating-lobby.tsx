"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Dashboard from "./dashboard";
import SecondPage from "./duo-sponsor";

import LiveLeaderboard from "./live-leaderboard";

interface Screen {
  Component: React.ComponentType;
  timeout: number;
}

const screens: Screen[] = [
  { Component: Dashboard, timeout: 5000 },
  { Component: SecondPage, timeout: 5000 },
  { Component: LiveLeaderboard, timeout: 5000 },
];

const RotatingLobby: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [fade, setFade] = useState<boolean>(true);

  useEffect(() => {
    const { timeout } = screens[currentIndex];

    const timer = setTimeout(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % screens.length);
        setFade(true);
      }, 500);
    }, timeout);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  const ActiveComponent = screens[currentIndex].Component;

  return (
    <div
      className={`transition-opacity duration-500 ${fade ? "opacity-100" : "opacity-0"}`}
    >
      <ActiveComponent />
    </div>
  );
};

export default RotatingLobby;
