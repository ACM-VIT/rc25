import Image from "next/image"
import Link from "next/link"
import React from "react"
import { Audiowide } from "next/font/google"

const audiowide = Audiowide({
    subsets: ['latin'],
    weight: ['400'],
    display: 'swap',
})

export default function SponsorsSection() {
  const sponsors = [
    { id: 1, name: "Sponsor 1", url: "#" },
    { id: 2, name: "Sponsor 2", url: "#" },
    { id: 3, name: "Sponsor 3", url: "#" },
    { id: 4, name: "Sponsor 4", url: "#" },
    { id: 5, name: "Sponsor 5", url: "#" },
    { id: 6, name: "Sponsor 6", url: "#" },
  ]

  return (
    <section className="bg-[#0a0a0a] py-16 px-4 md:py-20 overflow-hidden">
      <div className="container mx-auto">
        <h2 className={`text-[2.2rem] ml-[-11%] xs:ml-[0] xs:text-[3.5rem] sm:text-[4rem] md:text-[4rem] lg:text-[5rem] text-center text-white mb-16 tracking-[0.15em] ${audiowide.className}`}>
          SPONSORS
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 lg:gap-16 max-w-full mx-auto ">
          {sponsors.map((sponsor) => (
            <Link
              key={sponsor.id}
              href={sponsor.url}
              className="block bg-[#1a1a1a] rounded-lg aspect-square transition-transform hover:scale-105 hover:shadow-lg w-full max-w-full mx-auto"
            >
              <div className="relative w-full h-full">
                <Image
                  src="/placeholder.svg"
                  alt={sponsor.name}
                  fill
                  className="object-contain p-6"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}