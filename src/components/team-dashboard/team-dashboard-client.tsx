"use client";
import type { User } from "@/db/schema";
import { LeaveButton } from "@/components/buttons/leave";
import { formula1Bold, formula1Regular, formula1Wide } from "@/lib/fonts";
import { useEffect, useMemo, useState } from "react";

interface TeamMembersProps {
  teamMembers: User[];
  teamName: string | "";
  code: string;
  min_team_size: number;
}

function getDisplayName(raw: string | null | undefined): string {
  const base = (raw ?? "").trim();
  if (!base) return "RACER";

  // Preserve existing RC25 behavior: drop the last token when the name includes
  // a trailing identifier (common pattern for this event).
  const tokens = base.split(/\s+/).filter(Boolean);
  const withoutLast = tokens.slice(0, -1).join(" ").trim();
  return (withoutLast || base).toUpperCase();
}

const BASE_W = 1420;
const BASE_H = 1024;

type SlotKey = "tl" | "tr" | "bl" | "br";
type SlotLayout = {
  key: SlotKey;
  cardBgPos: string;
  cardBarPos: string;
  cardLinePos: string;
  namePos: string;
  labelPos: string;
  wheelInset: string;
  numberPos: string;
};

const SLOTS: SlotLayout[] = [
  {
    key: "tl",
    cardBgPos: "left-[149px] top-[310px]",
    cardBarPos: "left-[149px] top-[414px]",
    cardLinePos: "left-[149px] top-[401.5px]",
    namePos: "left-[calc(50%-505.79px)] top-[331px]",
    labelPos: "left-[calc(50%-506px)] top-[366px]",
    wheelInset: "inset-[32.13%_85.96%_64.64%_11.74%]",
    numberPos: "left-[490px] top-[310px]",
  },
  {
    key: "tr",
    cardBgPos: "left-[808px] top-[310px]",
    cardBarPos: "left-[808px] top-[414px]",
    cardLinePos: "left-[808px] top-[401.5px]",
    namePos: "left-[calc(50%+153.21px)] top-[331px]",
    labelPos: "left-[calc(50%+153px)] top-[366px]",
    wheelInset: "inset-[32.13%_40.19%_64.64%_57.5%]",
    numberPos: "left-[1149px] top-[310px]",
  },
  {
    key: "bl",
    cardBgPos: "left-[149px] top-[465px]",
    cardBarPos: "left-[149px] top-[569px]",
    cardLinePos: "left-[149px] top-[556.5px]",
    namePos: "left-[calc(50%-505.79px)] top-[486px]",
    labelPos: "left-[calc(50%-506px)] top-[521px]",
    wheelInset: "inset-[47.27%_85.96%_49.5%_11.74%]",
    numberPos: "left-[490px] top-[465px]",
  },
  {
    key: "br",
    cardBgPos: "left-[808px] top-[465px]",
    cardBarPos: "left-[808px] top-[569px]",
    cardLinePos: "left-[808px] top-[556.5px]",
    namePos: "left-[calc(50%+153.21px)] top-[486px]",
    labelPos: "left-[calc(50%+153px)] top-[521px]",
    wheelInset: "inset-[47.27%_40.19%_49.5%_57.5%]",
    numberPos: "left-[1149px] top-[465px]",
  },
];

export function TeamMembers({
  teamMembers,
  teamName,
  code,
  min_team_size,
}: TeamMembersProps) {
  const [scale, setScale] = useState(1);

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const displayTeamName = useMemo(
    () => getDisplayName(teamName || undefined),
    [teamName],
  );

  const slotMembers = useMemo(
    () => teamMembers.slice(0, 4),
    [teamMembers],
  );

  useEffect(() => {
    const update = () => {
      // Fit the 1420x1024 Figma frame into the viewport (downscale only).
      const s = Math.min(
        1,
        window.innerWidth / BASE_W,
        window.innerHeight / BASE_H,
      );
      setScale(Number.isFinite(s) && s > 0 ? s : 1);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <main className="relative h-screen w-full overflow-hidden bg-[#0c0c0c]">
      <div
        className="absolute left-1/2 top-1/2 h-[1024px] w-[1420px] origin-center"
        style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        {/* Background atmosphere */}
        <div className="absolute inset-0 bg-[#0c0c0c]" />
        <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_40%,rgba(255,255,255,0.08)_0%,rgba(12,12,12,0.92)_55%,rgba(12,12,12,1)_100%)]" />

        {/* Front road */}
        <div className="-translate-x-1/2 absolute h-[416px] left-[calc(50%-0.5px)] top-[608px] w-[1847px]">
          <div className="absolute inset-[-2.4%_-0.54%]">
            <img
              alt=""
              aria-hidden="true"
              className="block h-full w-full max-w-none"
              src="/TeamDash/Front_road.svg"
            />
          </div>
        </div>

        {/* Header */}
        <div className="-translate-x-1/2 absolute h-[88.015px] left-[calc(50%+93.33px)] top-[41.66px] w-[1199.33px]">
          <img
            alt=""
            aria-hidden="true"
            className="block h-full w-full max-w-none"
            src="/TeamDash/topbar-lines.svg"
          />
        </div>
        <p
          className={`${formula1Wide.className} absolute left-[calc(50%+21.27px)] top-[calc(50%-444.23px)] text-[30.95px] leading-[normal] text-white uppercase`}
        >
          HELLO {displayTeamName}
        </p>
        <div
          className="absolute inset-[7%_75.61%_86.39%_1.88%]"
          aria-hidden="true"
        >
          <img
            alt=""
            className="block h-full w-full max-w-none"
            src="/TeamDash/topbar-car.svg"
          />
        </div>

        {/* Title */}
        <p
          className={`${formula1Bold.className} -translate-x-1/2 absolute left-[calc(50%+0.5px)] top-[213px] w-[257px] whitespace-pre-wrap text-[30px] leading-[normal] text-center text-white`}
        >
          SQUADMATES
        </p>

        {/* Squadmate slots */}
        {SLOTS.map((slot, idx) => {
          const member = slotMembers[idx];
          const memberName = member ? getDisplayName(member.name) : "";

          return (
            <div key={slot.key}>
              <div
                className={`absolute bg-[#080a0d] h-[104px] w-[463px] ${slot.cardBgPos}`}
              />
              <div
                className={`absolute bg-[#222221] h-[11px] w-[463px] ${slot.cardBarPos}`}
              />
              <div
                className={`absolute h-0 w-[462.5px] ${slot.cardLinePos}`}
                aria-hidden="true"
              >
                <div className="absolute inset-[-2px_0]">
                  <img
                    alt=""
                    className="block h-full w-full max-w-none"
                    src="/TeamDash/underline.svg"
                  />
                </div>
              </div>

              <p
                className={`${formula1Regular.className} absolute ${slot.labelPos} text-[16px] leading-[normal] text-white`}
              >
                Team Name
              </p>

              <div className={`absolute ${slot.wheelInset}`} aria-hidden="true">
                <img
                  alt=""
                  className="block h-full w-full max-w-none"
                  src="/TeamDash/usernameCardWheel.svg"
                />
              </div>

              {memberName ? (
                <p
                  className={`${formula1Bold.className} absolute ${slot.namePos} text-[24px] leading-[normal] text-white`}
                  title={memberName}
                >
                  {memberName}
                </p>
              ) : null}

              <p
                className={`absolute ${slot.numberPos} font-['Orbitron'] font-normal leading-[1.5] text-[60px] text-[rgba(255,255,255,0.45)]`}
                aria-hidden="true"
              >
                99
              </p>
            </div>
          );
        })}

        {/* Squad code (copy) */}
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy squad code"
          className="-translate-x-1/2 absolute left-[calc(50%+9.5px)] top-[768px] h-[100px] w-[489px] rounded-[13.158px] border-[7.895px] border-[#a7282d] shadow-[0px_0px_35.512px_0px_#9f242d,0px_0px_20.293px_0px_#9f242d,0px_0px_11.837px_0px_#9f242d,0px_0px_5.919px_0px_#9f242d,0px_0px_1.691px_0px_#9f242d,0px_0px_0.846px_0px_#9f242d]"
          style={{
            backgroundImage:
              "linear-gradient(180.00804764123595deg, rgba(0, 0, 0, 0.93) 0%, rgba(42, 42, 42, 0.93) 176.23%)",
          }}
        />
        <p
          className={`${formula1Regular.className} -translate-x-1/2 pointer-events-none absolute left-[calc(50%-10px)] top-[797px] text-[30px] leading-[1.5] text-center text-white`}
        >
          SQUAD CODE: {code}
        </p>
        <div
          className="pointer-events-none absolute left-[912px] top-[803px] h-[20.377px] w-[20.377px] overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute inset-[37.5%_8.33%_8.33%_37.5%]">
            <div className="absolute inset-[-7.15%]">
              <img
                alt=""
                className="block h-full w-full max-w-none"
                src="/TeamDash/copy-a.svg"
              />
            </div>
          </div>
          <div className="absolute inset-[8.33%_37.5%_37.5%_8.33%]">
            <div className="absolute inset-[-7.15%]">
              <img
                alt=""
                className="block h-full w-full max-w-none"
                src="/TeamDash/copy-b.svg"
              />
            </div>
          </div>
        </div>

        {/* Leave */}
        <div className="absolute left-[1087.35px] top-[906px]">
          <LeaveButton />
        </div>
      </div>
    </main>
  );
}

export default TeamMembers;
