"use client";

import React, { useState, useEffect } from "react";
import Sponsor from "./sponsor";
import SecondPage from "./duo-sponsor";
import ThirdPage from "../livepages/thirdpage";
import WormGraph from "./worm-graph";
import Sponsor2 from "./sponsor2";

import LiveLeaderboard from "./live-leaderboard";

interface Screen {
  Component: React.ComponentType;
  timeout: number;
}

const screens: Screen[] = [
  { Component: Sponsor, timeout: 5000 },
  { Component: SecondPage, timeout: 1000 },
  { Component: LiveLeaderboard, timeout: 1000 },
  { Component: Sponsor2, timeout: 1000 },
  // { Component: ThirdPage, timeout: 5000 },
  // { Component: WormGraph, timeout: 5000 },
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
      className={`transition duration-1 ${fade ? "opacity-100" : "opacity-100"}`}
    >
      <ActiveComponent />
    </div>
  );
};

export default RotatingLobby;
