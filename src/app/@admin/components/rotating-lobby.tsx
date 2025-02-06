"use client";

import React, { useState, useEffect, Suspense } from "react";

type PreloadableLazy<T extends React.ComponentType<any>> = React.LazyExoticComponent<T> & {
  preload: () => Promise<{ default: T }>;
};

function lazyWithPreload<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): PreloadableLazy<T> {
  const Component = React.lazy(factory) as PreloadableLazy<T>;
  Component.preload = factory;
  return Component;
}

const Sponsor = lazyWithPreload(() => import("./sponsor"));
const DuoSponsor = lazyWithPreload(() => import("./duo-sponsor"));
const Sponsor2 = lazyWithPreload(() => import("./sponsor2"));
const LiveLeaderboard = lazyWithPreload(() => import("./live-leaderboard"));
const Counter = lazyWithPreload(() => import("@/components/countdownpage"));

interface Screen {
  Component: PreloadableLazy<React.ComponentType<any>>;
  timeout: number;
}

const screens: Screen[] = [
  { Component: Sponsor, timeout: 5000 },
  { Component: DuoSponsor, timeout: 5000 },
  { Component: LiveLeaderboard, timeout: 5000 },
  { Component: Sponsor2, timeout: 5000 },
  { Component: Counter, timeout: 5000 },
];

const RotatingLobby: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    screens.forEach(({ Component }) => {
      Component.preload();
    });
  }, []);

  useEffect(() => {
    const { timeout } = screens[currentIndex];
    const timer = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % screens.length);
    }, timeout);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % screens.length);
      } else if (event.key === "ArrowLeft") {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + screens.length) % screens.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const ActiveComponent = screens[currentIndex].Component;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <Suspense fallback={null}>
        <ActiveComponent />
      </Suspense>
    </div>
  );
};

export default RotatingLobby;