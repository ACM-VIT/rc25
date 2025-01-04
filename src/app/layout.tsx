import CountdownTimer from "@/components/countdown-timer";
import DetailsForm from "@/components/details-form";
import Disqualified from "@/components/disqualifed";
import EliminationScreen from "@/components/elimination-screen";
import TeamMembersAndLeaveButton from "@/components/team-dashboard";
import Winners from "@/components/winners";
import type React from "react";
import { auth } from "./(auth)/auth";
import {prisma} from "@/utils/prisma";
import './globals.css';


// till auth is implemeneted basic routing for now
const detailsFilled = true;
const teamJoined = false;
const teamCheckedIn = true;
const roundIsActive = true; // true --> portal
const memberOfActiveRound = true; // false --> elimination
const winnersAnnounced = true;
const noPendingRound = true;
const disqualified = false;

export default async function RootLayout({
  children,
  team,
  admin,
  landing,
}: {
  children: React.ReactNode;
  team: React.ReactNode;
  admin: React.ReactNode;
  landing: React.ReactNode;
}) {
  const session = await auth();
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
        email: session.user.email
      }
    }
  });

  if (adminUser) {
    return (
      <html lang="en">
        <body>{admin}</body>
      </html>
    );
  }

  if (!detailsFilled) {
    return (
      <html lang="en">
        <body><DetailsForm/></body>
      </html>
    );
  }
  if(!teamJoined) {
    return (
      <html lang="en">
        <body>{team}</body>
      </html>
    );
  }

  if (!teamCheckedIn) {
    return (
      <html lang="en">
        <body><TeamMembersAndLeaveButton/></body>
      </html>
    );
  }

  if (disqualified) {
    return (
      <html lang="en">
        <body><Disqualified/></body>
      </html>
    );
  }
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
        <body><EliminationScreen/></body>
      </html>
    );
  }

  if (noPendingRound) {
    if (winnersAnnounced) {
      return (
        <html lang="en">
          <body><Winners /></body>
        </html>
      );
    }
    return (
      <html lang="en">
        <body><CountdownTimer/></body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body><CountdownTimer/></body>
    </html>
  );
}
