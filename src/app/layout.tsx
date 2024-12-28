import CountdownTimer from "@/components/countdown-timer";
import DetailsForm from "@/components/details-form";
import Disqualified from "@/components/disqualifed";
import EliminationScreen from "@/components/elimination-screen";
import TeamMembersAndLeaveButton from "@/components/team-dashboard";
import Winners from "@/components/winners";
import type React from "react";

// till auth is implemeneted basic routing for now
const isAuthenticated = true; // false -->landing
const isAdmin = false; // true --> admin
const detailsFilled = true;
const teamJoined = true;
const teamCheckedIn = true;
const roundIsActive = true; // true --> portal
const memberOfActiveRound = true; // false --> elimination
const winnersAnnounced = true;
const noPendingRound = true;
const disqualified = false;

export default async function RootLayout({
  children,
  portal,
  team,
  admin,
  landing,
}: {
  children: React.ReactNode;
  portal: React.ReactNode;
  team: React.ReactNode;
  admin: React.ReactNode;
  landing: React.ReactNode;
}) {
  if (!isAuthenticated) {
    return (
      <html lang="en">
        <body>{landing}</body>
      </html>
    );
  }

  if (isAdmin) {
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
