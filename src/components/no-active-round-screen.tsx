import Image from "next/image";
import Header from "@/components/Header";
import { formula1Bold } from "@/lib/fonts";

export default function NoActiveRoundScreen() {
  return (
    <main className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#0c0c0c] text-white">
      <Header title="PIT STOP" />

      <section className="relative flex flex-1 items-center justify-center px-4 pb-10 pt-6 sm:pb-14">
        <div className="relative flex w-full max-w-[980px] flex-col items-center">
          <div className="relative h-[320px] w-full sm:h-[430px]">
            <Image
              src="/cheqflag.svg"
              alt=""
              aria-hidden
              width={300}
              height={340}
              className="absolute left-1/2 top-[18%] w-[120px] -translate-x-[160px] -rotate-[22deg] opacity-95 sm:w-[190px] sm:-translate-x-[250px]"
            />
            <Image
              src="/cheqflag.svg"
              alt=""
              aria-hidden
              width={300}
              height={340}
              className="absolute left-1/2 top-[18%] w-[120px] -translate-x-[-40px] scale-x-[-1] rotate-[22deg] opacity-95 sm:w-[190px] sm:-translate-x-[-65px]"
            />

            <div className="absolute left-1/2 top-1/2 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70 bg-[#111217] sm:h-[280px] sm:w-[280px]">
              <div className="absolute left-1/2 top-1/2 h-[186px] w-[186px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#A7282D] sm:h-[250px] sm:w-[250px]" />
              <div className="absolute bottom-[-40px] left-1/2 h-16 w-[5px] -translate-x-[62px] rotate-[35deg] rounded-full bg-[#1f2228] sm:bottom-[-56px] sm:h-24" />
              <div className="absolute bottom-[-40px] left-1/2 h-16 w-[5px] -translate-x-[-68px] rotate-[-35deg] rounded-full bg-[#1f2228] sm:bottom-[-56px] sm:h-24" />
            </div>

            <h1
              className={`${formula1Bold.className} absolute left-1/2 top-1/2 w-full max-w-[760px] -translate-x-1/2 -translate-y-1/2 px-4 text-center text-[30px] uppercase leading-[1.15] text-white sm:text-[48px]`}
            >
              WAITING FOR NEXT LAP...
            </h1>
          </div>
        </div>
      </section>
    </main>
  );
}
