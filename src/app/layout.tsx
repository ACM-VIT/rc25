import CountdownTimer from "@/components/countdown-timer";
import DetailsForm from "@/components/details-form";
import Disqualified from "@/components/disqualifed";
import EliminationScreen from "@/components/elimination-screen";
import TeamMembersAndLeaveButton from "@/components/team-dashboard/team-dashboard";
import Winners from "@/components/winners";
import React, { type ReactNode } from "react";
import { auth } from "./(auth)/auth";
import { prisma } from "@/utils/prisma";
import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import Image from "next/image";
//import logo from "@/app/assets/RCLogo.svg";
import rock from "@/app/assets/rock.svg";
import curveline from "@/app/assets/curveline.svg";
import bracket from "@/app/assets/bracket.svg";
import Dashboard from "@/components/dashboard";
import Navbar from "@/components/Navbar";
import SignOutButton from "@/components/buttons/sign-out";
import TeamSubmissions from "@/components/team-submissions";

const plus_jakarta_sans = Plus_Jakarta_Sans({ subsets: ["latin"] });

const roundIsActive = true; // true --> portal
const memberOfActiveRound = true; // false --> elimination
const winnersAnnounced = true;
const noPendingRound = true;
const disqualified = false;

async function getUserStatus(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      phone: true,
      gender: true,
      teamId: true,
    },
  });

  return {
    detailsFilled: Boolean(user?.phone && user?.gender),
    teamId: user?.teamId || null,
  };
}

interface LayoutProps {
  children: ReactNode;
  team: ReactNode;
  admin: ReactNode;
  landing: ReactNode;
}

const BackgroundTemplate = ({ children }: { children: ReactNode }) => (
  <div className="relative w-[100vw] h-dvh bg-[#222]">
    <div className="absolute inset-0 flex flex-row h-full z-0">
      <div className="md:w-1/4 h-full">
        <Image
          className="hidden md:block h-[100vh] object-cover object-center"
          src={rock}
          alt="Left SVG Image"
        />
      </div>
      <div className="min-w-full fixed md:static md:min-w-0 md:w-1/2 h-full">
        <Image
          className="min-h-screen object-cover object-center"
          src={curveline}
          alt="Middle curve line"
        />
      </div>
      <div className="w-1/4 h-full flex fixed right-3 top-0 md:static overflow-y-auto">
        <Image
          className="h-[15vh] md:h-[15vh] place-self-auto "
          src={bracket}
          alt="Right Top Bracket"
        />
      </div>
    </div>
    <div className="relative z-10">{children}</div>
  </div>
);

export default async function RootLayout({
    children,
    team,
    admin,
    landing,
}: LayoutProps) {

  const session = await auth()
  if (!session?.user?.email) {
    return (
      <html lang="en">
        <body>{landing}</body>
      </html>
    );
  }

  const adminUser = await prisma.admin.findFirst({
    where: {
      user: {
        email: session.user.email,
      },
    },
  });

  if (adminUser) {
    return (
      <html lang="en">
        <body className={plus_jakarta_sans.className}>
          {admin}
          <SignOutButton />
        </body>
      </html>
    );
  }

  const { detailsFilled, teamId } = await getUserStatus(session.user.email);
  const validTeamId = teamId ?? undefined;

  if (!detailsFilled) {
    return (
      <html lang="en">
        <body
          style={{
            background:
              "radial-gradient(50% 98.88% at 50% 50%, #0B0014 55.41%, #18181B 100%)",
          }}
          className="h-dvh"
        >
          <div className="h-full w-full flex flex-col items-center justify-center">
            {/* <Navbar name={session.user.name ?? "User"} />
            <Dashboard /> */}
            <DetailsForm />
          </div>
        </body>
      </html>
    );
  }
  if (!Boolean(teamId)) {
    return (
      <html lang="en">
        <body>
          <BackgroundTemplate>{team}</BackgroundTemplate>
        </body>
      </html>
    );
  }

  const teamIn = await prisma.team.findUnique({
    where: {
      id: validTeamId,
    },
  });
  const teamCheckedIn = Boolean(teamIn?.checkedIn);

  if (!teamCheckedIn) {
    return (
      <html lang="en">
        <body>
          <BackgroundTemplate>
            <TeamMembersAndLeaveButton />
            {/* <Dashboard /> */}
          </BackgroundTemplate>
        </body>
      </html>
    );
  }

  const disqualified = Boolean(teamIn?.disqualify);

  if (disqualified) {
    return (
      <html lang="en">
        <body>
          <Disqualified />
        </body>
      </html>
    );
  }

  const curRound = await prisma.round.findFirst({
    where: {
      start: {
        lte: new Date(),
      },
      end: {
        gte: new Date(),
      },
    },
    orderBy: {
      start: "asc",
    },
  });

  const roundIsActive = Boolean(curRound);

  const memberOfActiveRound = Boolean(
    await prisma.teamRound.findFirst({
      where: {
        teamId: validTeamId,
        roundId: curRound?.number,
      },
    })
  );

  if (roundIsActive) {
    if (memberOfActiveRound) {
      return (
        <html lang="en">
          <body>{children}</body>
        </html>
      );
    }
    return (
      <html lang="en">
        <body>
          <EliminationScreen />
        </body>
      </html>
    );
  }

  const noPendingRound = Boolean(
    await prisma.round.findFirst({
      where: {
        start: {
          gt: new Date(),
        },
      },
    })
  );

  const winnersAnnounced = Boolean(
    await prisma.round.findFirst({
      where: {
        result: {
          lte: new Date(),
        },
      },
      orderBy: {
        start: "desc",
      },
    })
  );

  const nextRound = await prisma.round.findFirst({
    where: {
      start: {
        gt: new Date(),
      },
    },
    orderBy: {
      start: "asc",
    },
  });

  if (noPendingRound) {
    if (winnersAnnounced) {
      return (
        <html lang="en">
          <body>
            <Winners />
          </body>
        </html>
      );
    }
    return (
      <html lang="en">
        <body>
          <CountdownTimer getTimeUntil={nextRound?.start.toISOString() ?? ""} />
        </body>
      </html>
      // Add the time until the next round
    );
  }

  if (!roundIsActive) {
    const hasNextRound = Boolean(nextRound);

    return (
      <html lang="en">
        <body>
          <BackgroundTemplate>
            {winnersAnnounced ? (
              <Winners />
            ) : hasNextRound ? (
              <div className="flex flex-col items-center gap-8 p-4">
                <Dashboard />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <h1 className="text-2xl text-white">
                  No upcoming rounds scheduled
                </h1>
              </div>
            )}
          </BackgroundTemplate>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body>
        <CountdownTimer getTimeUntil={nextRound?.start.toISOString() ?? ""} />
      </body>
    </html>
    // Add the time until the next round
  );
}
