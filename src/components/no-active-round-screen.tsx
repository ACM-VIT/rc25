import Image from "next/image";
import Header from "@/components/Header";
import { formula1Bold } from "@/lib/fonts";

export default function NoActiveRoundScreen() {
  return (
    <main className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#0c0c0c] text-white">
      <Header title="PIT STOP" />

      <section className="relative flex flex-1 items-center justify-center px-3 pb-10 pt-6 sm:px-5 sm:pb-14">
        <div className="relative h-[340px] w-full max-w-[980px] overflow-hidden sm:h-[470px] md:h-[560px]">
          <Image
            src="/no-active-round/2flags.png"
            alt=""
            aria-hidden
            width={2684}
            height={976}
            unoptimized
            className="absolute left-1/2 top-[9%] z-10 w-[340px] -translate-x-[50%] sm:w-[500px] md:w-[640px]"
          />

          <Image
            src="/no-active-round/poles.png"
            alt=""
            aria-hidden
            width={1320}
            height={1822}
            unoptimized
            className="absolute left-1/2 top-[13%] z-0 w-[170px] -translate-x-1/2 opacity-95 sm:top-[12%] sm:w-[272px] md:top-[11%] md:w-[332px]"
          />

          <Image
            src="/no-active-round/badge.png"
            alt=""
            aria-hidden
            width={1540}
            height={1540}
            unoptimized
            className="absolute left-1/2 top-[52%] w-[182px] -translate-x-1/2 -translate-y-1/2 sm:w-[282px] md:w-[350px]"
          />

          <h1
            className={`${formula1Bold.className} absolute left-1/2 top-[52%] w-full max-w-[760px] -translate-x-1/2 -translate-y-1/2 px-3 text-center text-[18px] uppercase leading-[1.08] tracking-[-0.012em] text-white sm:text-[30px] md:text-[40px]`}
          >
            WAITING FOR NEXT LAP...
          </h1>
        </div>
      </section>
    </main>
  );
}
