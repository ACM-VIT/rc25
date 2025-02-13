import React from "react";
import Link from "next/link";

const ThankYouScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative">
      {/* Background matching dashboard */}
      <div
        className="fixed inset-0 w-full h-full bg-black"
        style={{
          backgroundImage: `url('./dashbg.png')`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          zIndex: -1,
        }}
      />
      
      {/* Main content */}
      <div className="text-center z-10 space-y-8">
        <h1 className="text-5xl font-bold text-white mb-4 tracking-wide" style={{ fontFamily: 'Death Star, sans-serif' }}>
          Thank You for Participating!
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto" style={{ fontFamily: 'Death Star, sans-serif' }}>
          Your dedication and hard work have been recorded. The results will be 
          announced shortly. Stay tuned!
        </p>
        
        <Link
          href="/"
          className="inline-block bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-semibold text-lg py-4 px-12 rounded-xl 
          transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl" style={{ fontFamily: 'Death Star, sans-serif' }}
        >
          Go to Home Screen
        </Link>
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `twinkle ${2 + Math.random() * 3}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ThankYouScreen;