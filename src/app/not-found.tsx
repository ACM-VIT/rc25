"use client"

import Image from "next/image"
import { formula1Bold } from "@/lib/fonts"
import Header from "@/components/Header"

export default function NotFound() {
  return (
    <div
      className="h-screen relative flex flex-col items-center justify-start overflow-hidden"
      style={{
        backgroundImage: "url('/Dashboard.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <Header title="ERROR 404" />

      <Image
        src="/not_found.svg"
        alt="Not Found"
        width={600}
        height={400}
        className="w-[60%] sm:w-[60%] md:w-[50%] lg:w-[45%] h-auto px-2 sm:px-4 mt-2 sm:mt-4 md:mt-6 lg:mt-8"
      />
      
      <p className={`${formula1Bold.className} text-white text-center text-base sm:text-lg md:text-xl lg:text-2xl mt-4 sm:mt-5 md:mt-6 px-4`}>
        Maintenance mode: Race engineers at work
      </p>
    </div>
  )
}

