"use client"

import type React from "react"
import Image from "next/image"
import R2d2 from "../../../../public/r2d2.png"

const NullPointException1: React.FC = () => {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#1a1a2e]">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image alt="background" src="/NullPointBackground.png" fill className="object-cover object-center" priority />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex h-full w-full items-center justify-between px-4 md:px-8">
        {/* Text Content */}
        <div className="w-full lg:max-w-3xl md:max-w-2xl sm:max-w-lg max-w-md">
          <div>
            <div className="space-y-4 text-white text-[15px] sm:text-[15px] md:text-[20px] lg:text-[15px] xl:text-[20px] tracking-widest">
              <div className="flex gap-4">
                <span>I.</span>
                <p>
                  Participants are given runnable files that display input-output test cases. After deciphering the
                  logic based on these input-output patterns, they need to come up with a code that will fulfill some
                  hidden test cases.
                </p>
              </div>

              <div className="flex gap-4">
                <span>M.</span>
                <p>
                  The fifteen best-performing teams of Round One advance to Round Two. Participants are given runnable
                  files that display input-output test cases.
                </p>
              </div>

              <div className="flex gap-4">
                <span>N.</span>
                <p>
                  After deciphering the logic based on these input-output patterns, they need to come up with a code
                  that will fulfill some hidden test cases.
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* R2D2 Image */}
        <div className="relative h-full w-1/3">
          <div className="absolute bottom-10 right-0 w-full">
            <Image alt="R2D2" src={R2d2 || "/placeholder.svg"} className="scale-125 transform fix" priority />
          </div>
        </div>

        {/* Vertical "works?" Text */}
        <div className="fixed right-0 top-1/2 -translate-y-1/2 transform">
          <div className="flex h-screen items-center">
            <p className="rotate-180 text-[8vw] text-glow how-it-works-heading font-bold text-white/70 [writing-mode:vertical-lr]">works?</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NullPointException1

