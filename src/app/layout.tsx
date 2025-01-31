import CountdownTimer from "@/components/countdown-timer";
import DetailsForm from "@/components/details-formnew";
import Disqualified from "@/components/disqualifed";
import EliminationScreen from "@/components/elimination-screen";
import TeamMembersAndLeaveButton from "@/components/team-dashboard/team-dashboard";
import Winners from "@/components/winners";
import React, { type ReactNode } from "react";
import { auth } from "./(auth)/auth";
import { prisma } from "@/utils/prisma";
import "./globals.css";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
// import Dashboard from "@/components/dashboard";
import Navbar from "@/components/Navbar";
import SignOutButton from "@/components/buttons/sign-out";
import Team from "@/components/createjoin";
import { cookies } from "next/headers";
import SwitchAdminModeButton from "@/components/switch-admin-mode-button";
import { SessionProvider } from "next-auth/react";
// import SwitchAdminModeButton from "@/components/switch-admin-mode-button";
// import TeamSubmissions from "@/components/team-submissions";

const plus_jakarta_sans = Plus_Jakarta_Sans({ subsets: ["latin"] });
const outfit = Outfit({ subsets: ["latin"] });

// const roundIsActive = true; // true --> portal
// const memberOfActiveRound = true; // false --> elimination
// const winnersAnnounced = true;
// const noPendingRound = true;
// const disqualified = false;

// async function getUserStatus(email: string) {
//     const user = await prisma.user.findUnique({
//         where: {email},
//         select: {
//             phone: true,
//             gender: true,
//             teamId: true,
//         },
//     });
//
//     return {
//         detailsFilled: Boolean(user?.phone && user?.gender),
//         teamId: user?.teamId || null,
//     };
// }

interface LayoutProps {
    children: ReactNode;
    admin: ReactNode;
    landing: ReactNode;
}

export default async function RootLayout({
    children,
    admin,
    landing,
}: LayoutProps) {
    const session = await auth();
    if (!session?.user?.email) {
        return (
            <html lang="en">
                <body>{landing}</body>
            </html>
        );
    }

    const user = await prisma.user.findUnique({
        where: {
            email: session.user.email,
        },
        include: {
            Team: {
                include: { TeamRound: true },
            },
            Admin: {
                select: {
                    id: true,
                },
            },
        },
    });

    const curOrNextRound = await prisma.round.findFirst({
        where: {
            result: {
                gte: new Date(),
            },
        },
        orderBy: {
            start: "asc",
        },
        include: {
            teams: {
                where: {
                    teamId: user?.Team?.id,
                },
            },
        },
    });

    const isAdmin = !!user?.Admin;
    const detailsFilled =
        !!user?.phone && !!user?.gender && !!user?.phone.length;

    const cookieStore = await cookies();
    const mode = cookieStore.get("mode")?.value !== "user";
    console.log(mode);

    if (isAdmin && mode) {
        return (
            <html lang="en">
                <body className={plus_jakarta_sans.className}>
                    {admin}
                    <SignOutButton />
                </body>
            </html>
        );
    }

    if (!detailsFilled) {
        return (
            <html lang="en">
                <body>
                    <div className="h-full w-full flex flex-col items-center justify-center">
                        <SessionProvider>
                            <DetailsForm />
                            </SessionProvider>
                        
                        {isAdmin && <SwitchAdminModeButton />}
                    </div>
                </body>
            </html>
        );
    }

    if (!user?.Team) {
        return (
            <html lang="en">
                <body className={`${outfit.className}`}>
                    <Team name={session.user.name ?? "User"}/>
                    {isAdmin && <SwitchAdminModeButton />}
                </body>
            </html>
        );
    }

    const teamCheckedIn = user.Team.checkedIn;

    if (!teamCheckedIn) {
        return (
            <html lang="en">
                <body>
                    <Navbar name={session.user.name ?? "User"} />
                    <TeamMembersAndLeaveButton />
                    {isAdmin && <SwitchAdminModeButton />}
                </body>
            </html>
        );
    }

    const disqualified = Boolean(user.Team.disqualify);

    if (disqualified) {
        return (
            <html lang="en">
                <body>
                    <div className="bg-[radial-gradient(110.8%_70.71%_at_50%_50%,_#0B0014_55.41%,_#18181B_100%)] min-h-screen">
                        <Navbar name={session.user.name ?? "User"} />
                        <Disqualified />
                        {isAdmin && <SwitchAdminModeButton />}
                    </div>
                </body>
            </html>
        );
    }

    const winnerScreen = !curOrNextRound;

    if (winnerScreen) {
        return (
            <html lang="en">
                <body>
                    <Navbar name={session.user.name ?? "User"} />
                    <Winners />
                    {isAdmin && <SwitchAdminModeButton />}
                </body>
            </html>
        );
    }

    const memberOfRound = !!curOrNextRound.teams.length;

    if (!memberOfRound) {
        return (
            <html lang="en">
                <body>
                    <Navbar name={session.user.name ?? "User"} />
                    <EliminationScreen />
                    {isAdmin && <SwitchAdminModeButton />}
                </body>
            </html>
        );
    }

    // todo round checked in condition

    const roundStarted = curOrNextRound.start <= new Date();

    if (!roundStarted) {
        return (
            <html lang="en">
                <body>
                    <Navbar name={session.user.name ?? "User"} />
                    <CountdownTimer
                        getTimeUntil={curOrNextRound.start.toISOString()}
                    />{" "}
                    {/* todo Time until round start */}
                    {isAdmin && <SwitchAdminModeButton />}
                </body>
            </html>
        );
    }

    const roundEnded = curOrNextRound.end <= new Date();

    if (roundEnded) {
        return (
            <html lang="en">
                <body>
                    <Navbar name={session.user.name ?? "User"} />
                    <CountdownTimer
                        getTimeUntil={curOrNextRound.result.toISOString()}
                    />{" "}
                    {/* todo Time until result */}
                    {isAdmin && <SwitchAdminModeButton />}
                </body>
            </html>
        );
    }

    return (
        <html lang="en">
            <body
                className="min-h-screen flex flex-col"
                style={{
                    backgroundImage: "url('./dashbg.png')",
                    backgroundSize: "cover",
                    backgroundAttachment: "fixed",
                }}
            >
                <div className="min-h-[20%] max-h-[20%]">
                    <Navbar name={session.user.name ?? "User"} />
                </div>
                <div className="min-h-[80%] max-h-[80%]">
                    {children}
                    {isAdmin && <SwitchAdminModeButton />}
                </div>
            </body>
        </html>
    );
}
