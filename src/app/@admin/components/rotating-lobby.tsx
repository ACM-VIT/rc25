// "use client";

// import React, { useState, useEffect, Suspense, ComponentType } from "react";

// export interface Screen {
//   Component: PreloadableLazy<ComponentType<Record<string, never>>>;
//   timeout: number;
//   id: string;
// }

// type PreloadableLazy<T extends ComponentType<Record<string, never>>> =
//   React.LazyExoticComponent<T> & {
//     preload: () => Promise<{ default: T }>;
//   };

// function lazyWithPreload<T extends ComponentType<Record<string, never>>>(
//   factory: () => Promise<{ default: T }>
// ): PreloadableLazy<T> {
//   const Component = React.lazy(factory) as PreloadableLazy<T>;
//   Component.preload = factory;
//   return Component;
// }

// const Sponsor = lazyWithPreload(() => import("./sponsor"));
// const DuoSponsor = lazyWithPreload(() => import("./duo-sponsor"));
// const Sponsor2 = lazyWithPreload(() => import("./sponsor2"));
// const LiveLeaderboard = lazyWithPreload(() => import("./live-leaderboard"));
// const Counter = lazyWithPreload(() => import("./lobby-counter"));

// const baseScreens: Screen[] = [
//   { Component: Sponsor, timeout: 20000, id: "sponsor1" },
//   { Component: DuoSponsor, timeout: 20000, id: "duoSponsor" },
//   { Component: LiveLeaderboard, timeout: 45000, id: "leaderboard" },
//   { Component: Sponsor2, timeout: 20000, id: "sponsor2" },
//   { Component: Counter, timeout: 30000, id: "counter" },
// ];

// interface RotatingLobbyProps {
//   isScoreboardVisible: boolean;
// }

// const RotatingLobby: React.FC<RotatingLobbyProps> = ({ isScoreboardVisible }) => {
//   const [screensState, setScreensState] = useState<Screen[]>(
//     isScoreboardVisible
//       ? baseScreens
//       : baseScreens.filter((screen) => screen.id !== "leaderboard")
//   );
//   const [currentIndex, setCurrentIndex] = useState<number>(0);

//   useEffect(() => {
//     setScreensState(
//       isScoreboardVisible
//         ? baseScreens
//         : baseScreens.filter((screen) => screen.id !== "leaderboard")
//     );
//     setCurrentIndex(0);
//   }, [isScoreboardVisible]);

//   useEffect(() => {
//     screensState.forEach((screen) => {
//       screen.Component.preload();
//     });
//   }, [screensState]);

//   useEffect(() => {
//     const { timeout } = screensState[currentIndex];
//     const timer = setTimeout(() => {
//       setCurrentIndex((prevIndex) => (prevIndex + 1) % screensState.length);
//     }, timeout);

//     return () => clearTimeout(timer);
//   }, [currentIndex, screensState]);

//   useEffect(() => {
//     const handleKeyDown = (event: KeyboardEvent) => {
//       if (event.key === "ArrowRight") {
//         setCurrentIndex((prevIndex) => (prevIndex + 1) % screensState.length);
//       } else if (event.key === "ArrowLeft") {
//         setCurrentIndex(
//           (prevIndex) => (prevIndex - 1 + screensState.length) % screensState.length
//         );
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [screensState.length]);

//   const ActiveComponent = screensState[currentIndex].Component;

//   return (
//     <div className="relative h-screen w-screen overflow-hidden bg-black">
//       <Suspense fallback={null}>
//         <ActiveComponent />
//       </Suspense>
//     </div>
//   );
// };

// export default RotatingLobby;
