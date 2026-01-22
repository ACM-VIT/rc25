"use client"
import Image from "next/legacy/image"

export default function NotFound() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen relative overflow-hidden">
      {/* Background */}
      <div
        className="fixed inset-0 w-full h-full"
        style={{
          backgroundImage: `url('./submissionsbg.png')`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Left side with robots */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-8 lg:pl-24 lg:pb-16">
        <div className="relative">
          <Image
            src="/c3po.svg"
            alt="C-3PO"
            width={300}
            height={500}
            className="relative z-20 w-48 h-auto lg:w-auto lg:h-auto"
          />
          <Image
            src="/r2d2.svg"
            alt="R2-D2"
            width={200}
            height={300}
            className="absolute -right-8 lg:-right-16 bottom-[2vh] lg:bottom-15 z-10 w-32 h-auto lg:w-auto lg:h-auto"
          />
        </div>
      </div>

      {/* Right side with text */}
      <div className="relative z-20 flex-1 flex flex-col justify-center p-8 lg:pr-24">
        <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4 lg:mb-8 tracking-wide">C3PO TRANSLATES:</h1>
        <div className="relative">
          <p className="text-lg lg:text-xl text-blue-100 leading-relaxed">
            I am sorry sir, but R2 says something is not right here. I guess we should go back the way we came. Or maybe
            ask locals for directions?
          </p>
        </div>
      </div>

      {/* Animated stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random(),
            }}
          />
        ))}
      </div>
    </div>
  )
}

