"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";

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
const SecondPage = lazyWithPreload(() => import("./duo-sponsor"));
const ThirdPage = lazyWithPreload(() => import("../livepages/thirdpage"));
const WormGraph = lazyWithPreload(() => import("./worm-graph"));
const Sponsor2 = lazyWithPreload(() => import("./sponsor2"));
const StatisticsDashboardClient = lazyWithPreload(() =>
  import("./statistics-dashboard-client")
);
const LiveLeaderboard = lazyWithPreload(() => import("./live-leaderboard"));
const Counter = lazyWithPreload(() => import("@/components/countdownpage"));

interface Screen {
  Component: PreloadableLazy<React.ComponentType<any>>;
  timeout: number;
}

const screens: Screen[] = [
  { Component: Sponsor, timeout: 5000 },
  { Component: SecondPage, timeout: 5000 },
  { Component: LiveLeaderboard, timeout: 5000 },
  { Component: Sponsor2, timeout: 5000 },
  { Component: Counter, timeout: 5000 },
  // { Component: StatisticsDashboardClient, timeout: 5000 },
  // { Component: ThirdPage, timeout: 5000 },
  // { Component: WormGraph, timeout: 5000 },
];

const RotatingLobby: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [fade, setFade] = useState<boolean>(true);

  useEffect(() => {
    screens.forEach(({ Component }) => {
      Component.preload();
    });
  }, []);

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        setFade(false);
        setTimeout(() => {
          setCurrentIndex((prevIndex) => {
            if (event.key === "ArrowRight") {
              return (prevIndex + 1) % screens.length;
            } else if (event.key === "ArrowLeft") {
              return (prevIndex - 1 + screens.length) % screens.length;
            }
            return prevIndex;
          });
          setFade(true);
        }, 500);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const ActiveComponent = screens[currentIndex].Component;

  return (
    <div className="relative h-screen w-screen">
      <Suspense fallback={<div>Loading...</div>}>
        <div className={`transition duration-500 ${fade ? "opacity-100" : "opacity-0"}`}>
          <ActiveComponent />
        </div>

        {!fade && (
          <div className="absolute inset-0">
            <Image
              src="/dashbg.png"
              alt="Transition Overlay"
              fill
              className="object-cover"
            />
          </div>
        )}
      </Suspense>
    </div>
  );
};

export default RotatingLobby;
