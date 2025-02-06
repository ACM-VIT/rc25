import Counter from "@/components/countdownpage";
import DetailsForm from "@/components/details-formnew";
import Disqualified from "@/components/disqualifed";
import EliminationScreen from "@/components/elimination-screen";
import TeamMembersAndLeaveButton from "@/components/team-dashboard/team-dashboard";
import Winners from "@/components/winners";
import React, { type ReactNode } from "react";
import { auth } from "./(auth)/auth";
import { prisma } from "@/utils/prisma";
import "./globals.css";
import { Outfit } from "next/font/google";
// import Dashboard from "@/components/dashboard";
import Navbar from "@/components/Navbar";
import Team from "@/components/createjoin";
import { cookies } from "next/headers";
import SwitchAdminModeButton from "@/components/switch-admin-mode-button";
import { SessionProvider } from "next-auth/react";
import type { Metadata } from "next";
import FloatingDock from "@/components/FloatingDock";
import moment from "moment-timezone";
import { Toaster } from "@/components/ui/toaster";

const getISTTime = (date: Date) => {
    return moment(date).tz("Asia/Kolkata");
};

const getCurrentISTTime = () => {
    return moment().tz("Asia/Kolkata");
};

// import SwitchAdminModeButton from "@/components/switch-admin-mode-button";
// import TeamSubmissions from "@/components/team-submissions";

export const metadata: Metadata = {
    title: "Reverse Coding | ACM-VIT",
    description: "ACM-VIT's premier competitive coding event",
    openGraph: {
        title: "Reverse Coding | ACM-VIT",
        description: "ACM-VIT's premier competitive coding event",
        type: "website",
    },
    robots: {
        index: true,
        follow: true,
    },
    icons: {
        icon: "/favicon.ico",
    },
};

const outfit = Outfit({ subsets: ["latin"] });

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
        relationLoadStrategy: "join",
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
        relationLoadStrategy: "join",
        where: {
            result: {
                gte: new Date(),
            },
        },
        orderBy: {
            start: "asc",
        },
    });

    const isAdmin = !!user?.Admin;
    const detailsFilled =
        !!user?.phone && !!user?.gender && !!user?.phone.length;

    const cookieStore = await cookies();
    const mode = cookieStore.get("mode")?.value !== "user";

    if (isAdmin && mode) {
        return (
            <html lang="en">
                <body className={outfit.className}>
                    {admin}
                    <Toaster />
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
                    <Team name={session.user.name ?? "User"} />
                    {isAdmin && <SwitchAdminModeButton />}
                </body>
            </html>
        );
    }

    const teamCheckedIn = user.Team.checkedIn;
    console.log(user.Team);
    if (!teamCheckedIn) {
        return (
            <html lang="en">
                <body>
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
                    {/* todo */}
                    {isAdmin && <SwitchAdminModeButton />}
                </body>
            </html>
        );
    }

    const memberOfRound = user.Team.TeamRound.find(
        (tr) => tr.roundId === curOrNextRound.id
    );

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

    const roundStarted =
        getISTTime(curOrNextRound.start) <= getCurrentISTTime();

    if (!roundStarted) {
        return (
            <html lang="en">
                <body>
                    <Counter />
                    {/*todo*/}
                    <FloatingDock />
                    {isAdmin && <SwitchAdminModeButton />}
                </body>
            </html>
        );
    }

    const roundEnded = getISTTime(curOrNextRound.end) <= getCurrentISTTime();

    if (roundEnded) {
        return (
            <html lang="en">
                <body>
                    <Counter />
                    {/*todo*/}
                    <FloatingDock />
                    {isAdmin && <SwitchAdminModeButton />}
                </body>
            </html>
        );
    }

    return (
        <html lang="en">
            <body
                className={`min-h-screen flex flex-col ${outfit.className}`}
                style={{
                    backgroundImage: "url('https://rc25-assets.acmvit.in/dashbg.png')",
                    backgroundSize: "cover",
                    backgroundAttachment: "fixed",
                }}
            >
                <div className="min-h-[80%] max-h-[80%]">
                    {children}
                    {isAdmin && <SwitchAdminModeButton />}
                </div>
            </body>
        </html>
    );
}
