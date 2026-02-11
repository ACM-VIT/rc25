import Counter from "@/components/countdownpage";
import DetailsForm from "@/components/details-form";
import Disqualified from "@/components/disqualifed";
import EliminationScreen from "@/components/elimination-screen";
import TeamMembersAndLeaveButton from "@/components/team-dashboard/team-dashboard";
import React, {type ReactNode} from "react";
import {auth} from "./(auth)/auth";
import { db } from "@/db";
import { admins, rounds, teamRounds, teams, users } from "@/db/schema";
import "./globals.css";
import {Outfit} from "next/font/google";
import Navbar from "@/components/Navbar";
import Team from "@/components/createjoin";
import {cookies} from "next/headers";
import SwitchAdminModeButton from "@/components/switch-admin-mode-button";
import {SessionProvider} from "next-auth/react";
import type {Metadata} from "next";
import moment from "moment-timezone";
import {Toaster} from "@/components/ui/toaster";
import SmallViewportWrapper from "@/components/SmallViewportWrapper";
import ThankYouScreen from "@/components/Thankyou";
import { asc, eq, gte } from "drizzle-orm";
import { redirect } from "next/navigation";

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

const outfit = Outfit({subsets: ["latin"]});

interface LayoutProps {
    children: ReactNode;
    admin: ReactNode;
}

export default async function RootLayout({
                                             children,
                                             admin,
                                         }: LayoutProps) {
    const session = await auth();
    if (!session?.user?.email) {
        if (process.env.NODE_ENV === "production") {
            redirect(process.env.LANDING_URL ?? "https://rcpc.acmvit.in");
        }

        return (
            <html lang="en">
            <body className={outfit.className}>{children}</body>
            </html>
        );
    }

    const userRows = await db
        .select({ user: users, team: teams })
        .from(users)
        .leftJoin(teams, eq(users.teamId, teams.id))
        .where(eq(users.email, session.user.email))
        .limit(1);

    const user = userRows[0]?.user ?? null;
    const team = userRows[0]?.team ?? null;

    const adminRows = user
        ? await db
            .select({ id: admins.id })
            .from(admins)
            .where(eq(admins.userId, user.id))
            .limit(1)
        : [];

    const teamRoundRows = team
        ? await db
            .select()
            .from(teamRounds)
            .where(eq(teamRounds.teamId, team.id))
        : [];

    const curOrNextRoundRows = await db
        .select()
        .from(rounds)
        .where(gte(rounds.result, new Date()))
        .orderBy(asc(rounds.start))
        .limit(1);

    const curOrNextRound = curOrNextRoundRows[0] ?? null;

    const isAdmin = adminRows.length > 0;
    const detailsFilled = !!user?.phone && !!user?.gender && !!user?.phone.length;

    const cookieStore = await cookies();
    const mode = cookieStore.get("mode")?.value !== "user";

    if (isAdmin && mode) {
        return (
            <html lang="en">
            <body className={outfit.className}>
            {admin}
            <Toaster/>
            </body>
            </html>
        );
    }

    if (!detailsFilled && !isAdmin) {
        return (
            <html lang="en">
            <body>
            <div className="h-full w-full flex flex-col items-center justify-center">
                <SessionProvider>
                    <DetailsForm/>
                </SessionProvider>

                {isAdmin && <SwitchAdminModeButton/>}
            </div>
            </body>
            </html>
        );
    }

    if (!team) {
        return (
            <html lang="en">
            <body className={`${outfit.className}`}>
            <Team name={session.user.name ?? "User"}/>
            {isAdmin && <SwitchAdminModeButton/>}
            </body>
            </html>
        );
    }

    const teamCheckedIn = team.checkedIn;
    if (!teamCheckedIn && !isAdmin) {
        return (
            <html lang="en">
            <body>
            <TeamMembersAndLeaveButton/>
            {isAdmin && <SwitchAdminModeButton/>}
            </body>
            </html>
        );
    }

    const disqualified = Boolean(team.disqualify);

    if (disqualified && !isAdmin) {
        return (
            <html lang="en" className="overflow-hidden">
            <body className="overflow-hidden">
            <div className="bg-[radial-gradient(110.8%_70.71%_at_50%_50%,#0B0014_55.41%,#18181B_100%)] min-h-screen">
                <Disqualified/>
                {isAdmin && <SwitchAdminModeButton/>}
            </div>
            </body>
            </html>
        );
    }

    const winnerScreen = !curOrNextRound;

    if (winnerScreen && !isAdmin) {
        return (
            <html lang="en">
            <body>
            <Navbar name={session.user.name ?? "User"}/>
            <ThankYouScreen/>
            {/* todo */}
            {isAdmin && <SwitchAdminModeButton/>}
            </body>
            </html>
        );
    }

    const memberOfRound = teamRoundRows.find(
        (tr) => curOrNextRound && tr.roundId === curOrNextRound.id
    );

    if (!memberOfRound && !isAdmin) {
        return (
            <html lang="en">
            <body>
            <Navbar name={session.user.name ?? "User"}/>
            <EliminationScreen/>
            {isAdmin && <SwitchAdminModeButton/>}
            </body>
            </html>
        );
    }

    // todo round checked in condition

    const roundStarted =
        curOrNextRound && getISTTime(curOrNextRound.start) <= getCurrentISTTime();

    if (!roundStarted && !isAdmin) {
        return (
            <html lang="en">
            <body>
            <SmallViewportWrapper>
                <Counter/>
                {isAdmin && <SwitchAdminModeButton/>}
            </SmallViewportWrapper>
            </body>
            </html>
        );
    }

    const roundEnded =
        curOrNextRound && getISTTime(curOrNextRound.end) <= getCurrentISTTime();

    if (roundEnded && !isAdmin) {
        return (
            <html lang="en">
            <body>
            <SmallViewportWrapper>
                <Counter/>
                {isAdmin && <SwitchAdminModeButton/>}
            </SmallViewportWrapper>
            </body>
            </html>
        );
    }

    return (
        <html lang="en">
        <body
            className={`min-h-screen flex flex-col ${outfit.className}`}
            style={{
                backgroundImage: "url('/dashboard.png')",
                backgroundSize: "cover",
                backgroundAttachment: "fixed",
            }}
        >
        <SmallViewportWrapper>
            <div className="min-h-[80%] max-h-[80%]">
                {children}
                {isAdmin && <SwitchAdminModeButton/>}
            </div>
        </SmallViewportWrapper>
        </body>
        </html>
    );
}
