import CountdownTimer from "@/components/countdown-timer";
import DetailsForm from "@/components/details-form";
import Disqualified from "@/components/disqualifed";
import EliminationScreen from "@/components/elimination-screen";
import TeamMembersAndLeaveButton from "@/components/team-dashboard/team-dashboard";
import Winners from "@/components/winners";
import React, {type ReactNode} from "react";
import {auth} from "./(auth)/auth";
import {prisma} from "@/utils/prisma";
import "./globals.css";
import {Plus_Jakarta_Sans} from "next/font/google";
import Image from "next/image";
import rock from "@/app/assets/rock.svg";
import curveline from "@/app/assets/curveline.svg";
import bracket from "@/app/assets/bracket.svg";
// import Dashboard from "@/components/dashboard";
import Navbar from "@/components/Navbar";
import SignOutButton from "@/components/buttons/sign-out";
import Team from "@/components/createjoin";
// import TeamSubmissions from "@/components/team-submissions";

const plus_jakarta_sans = Plus_Jakarta_Sans({subsets: ["latin"]});

// const roundIsActive = true; // true --> portal
// const memberOfActiveRound = true; // false --> elimination
// const winnersAnnounced = true;
// const noPendingRound = true;
// const disqualified = false;

async function getUserStatus(email: string) {
    const user = await prisma.user.findUnique({
        where: {email},
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

const BackgroundTemplate = ({children}: { children: ReactNode }) => (
    <div className="relative w-[100vw] h-dvh bg-[#222]">
        <div className="absolute inset-0 flex flex-row h-full z-0 overflow-hidden">
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
                                             // team,
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
            <SignOutButton/>
            </body>
            </html>
        );
    }

    const {detailsFilled, teamId} = await getUserStatus(session.user.email);
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
                <DetailsForm/>
            </div>
            </body>
            </html>
        );
    }
    if (!teamId) {
        return (
            <html lang="en">
            <body>
            <BackgroundTemplate><Team/></BackgroundTemplate>
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
                <TeamMembersAndLeaveButton/>
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
            <div className="bg-[radial-gradient(110.8%_70.71%_at_50%_50%,_#0B0014_55.41%,_#18181B_100%)] min-h-screen">
                <Navbar name={session.user.name ?? "User"}/>
                <Disqualified/>
            </div>
            </body>
            </html>
        );
    }

    const curOrNextRound = await prisma.round.findFirst({
        where: {
            result: {
                gte: new Date(),
            },
        },
        orderBy: {
            start: "asc",
        },
        include:{
            teams: {
                where: {
                    id: teamId
                },
            },
        }
    });

    const winnerScreen = !curOrNextRound;

    if (winnerScreen) {
        return (
            <html lang="en">
            <body>
            <Winners/>
            </body>
            </html>
        );
    }

    const memberOfRound = !!curOrNextRound.teams.length;

    if (!memberOfRound){
        return (
            <html lang="en">
            <body>
            <EliminationScreen/>
            </body>
            </html>
        );
    }

    // todo round checked in condition

    const roundStarted = curOrNextRound.start <= new Date();

    if (!roundStarted){
        return (
            <html lang="en">
            <body>
            <CountdownTimer getTimeUntil={curOrNextRound.start.toISOString()}/> {/* todo Time until round start */}
            </body>
            </html>
        );
    }

    const roundEnded = curOrNextRound.end <= new Date();

    if (roundEnded){
        return (
            <html lang="en">
            <body>
            <CountdownTimer getTimeUntil={curOrNextRound.result.toISOString()}/> {/* todo Time until result */}
            </body>
            </html>
        );
    }

    return (
        <html lang="en">
        <body>
        <BackgroundTemplate>
            <Navbar name={session.user.name ?? "User"}/>
            {children}
        </BackgroundTemplate>
        </body>
        </html>
    );
}
