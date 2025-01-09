import CountdownTimer from "@/components/countdown-timer";
import DetailsForm from "@/components/details-form";
import Disqualified from "@/components/disqualifed";
import EliminationScreen from "@/components/elimination-screen";
import TeamMembersAndLeaveButton from "@/components/team-dashboard";
import Winners from "@/components/winners";
import React, { ReactNode } from 'react'
import { auth } from "./(auth)/auth";
import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import Image from "next/image";
import logo from "@/app/assets/RCLogo.svg";
import rock from "@/app/assets/rock.svg";
import curveline from "@/app/assets/curveline.svg";
import bracket from "@/app/assets/bracket.svg";

const plus_jakarta_sans = Plus_Jakarta_Sans({ subsets: ["latin"] });

// Configuration flags
const isAdmin = false;
const detailsFilled = true;
const teamJoined = false;
const teamCheckedIn = false;
const roundIsActive = false;
const memberOfActiveRound = false;
const winnersAnnounced = false;
const noPendingRound = false;
const disqualified = false;

interface LayoutProps {
  children: ReactNode;
  team: ReactNode;
  admin: ReactNode;
  landing: ReactNode;
}

const BackgroundTemplate = ({ children }: { children: ReactNode }) => (
  <div className="relative w-[100vw] h-dvh bg-[#222] overflow-hidden">
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
      <div className="w-full md:w-1/4 h-full flex justify-end overflow-y-auto">
        <Image
          className="h-[15vh] md:h-[15vh] place-self-end md:place-self-auto "
          src={bracket}
          alt="Right Top Bracket"
        />
      </div>
    </div>
    <div className="relative z-10">
      {children}
    </div>
  </div>
);

export default async function RootLayout({
  children,
  team,
  admin,
  landing,
}: LayoutProps) {
  const session = await auth();

  if (!session?.user?.email) {
    return (
      <html lang="en">
        <body>
          <BackgroundTemplate>{landing}</BackgroundTemplate>
        </body>
      </html>
    );
  }

  if (isAdmin) {
    return (
      <html lang="en">
        <body className={plus_jakarta_sans.className}>
          <BackgroundTemplate>{admin}</BackgroundTemplate>
        </body>
      </html>
    );
  }

  if (!detailsFilled) {
    return (
      <html lang="en">
        <body>
          <BackgroundTemplate>
            <DetailsForm />
          </BackgroundTemplate>
        </body>
      </html>
    );
  }

  if (!teamJoined) {
    return (
      <html lang="en">
        <body>
          <BackgroundTemplate>{team}</BackgroundTemplate>
        </body>
      </html>
    );
  }

	if (!teamCheckedIn) {
		return (
			<html lang="en">
			<body>
			<BackgroundTemplate>
				<TeamMembersAndLeaveButton/>
			</BackgroundTemplate>
			</body>
			</html>
		);
	}

	if (disqualified) {
		return (
			<html lang="en">
			<body>
			<Disqualified/>
			</body>
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
			<body>
			<EliminationScreen/>
			</body>
			</html>
		);
	}

	if (noPendingRound) {
		if (winnersAnnounced) {
			return (
				<html lang="en">
				<body>
				<Winners/>
				</body>
				</html>
			);
		}
		return (
			<html lang="en">
			<body>
			<CountdownTimer/>
			</body>
			</html>
		);
	}

	return (
		<html lang="en">
		<body>
		<CountdownTimer />
		</body>
		</html>
	);
}