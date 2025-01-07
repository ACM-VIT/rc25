import CountdownTimer from "@/components/countdown-timer";
import DetailsForm from "@/components/details-form";
import Disqualified from "@/components/disqualifed";
import EliminationScreen from "@/components/elimination-screen";
import Winners from "@/components/winners";
import React, { type ReactNode } from 'react'
import { auth } from "./(auth)/auth";
import { prisma } from "@/utils/prisma";
import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import Image from "next/image";
import logo from "@/app/assets/RCLogo.svg";
import rock from "@/app/assets/rock.svg";
import curveline from "@/app/assets/curveline.svg";
import bracket from "@/app/assets/bracket.svg";
import Dashboard from "@/components/team-dashboard";
import Navbar from "@/components/Navbar";

const plus_jakarta_sans = Plus_Jakarta_Sans({ subsets: ["latin"] });


const teamCheckedIn = true;
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
      teamId: true
    }
  });

  return {
    detailsFilled: Boolean(user?.phone && user?.gender),
    teamJoined: Boolean(user?.teamId)
  };
}

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
      <div className="w-1/4 h-full flex fixed right-3 top-0 md:static overflow-y-auto">
        <Image
          className="h-[15vh] md:h-[15vh] place-self-auto "
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
				<body className={plus_jakarta_sans.className}>{admin}</body>
			</html>
		);
	}

  const { detailsFilled, teamJoined } = await getUserStatus(session.user.email);

  if (!detailsFilled) {
    return (
      <html lang="en">
        <body>
			<Navbar name={session.user.name!}/>
          <Dashboard/>
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
				<Dashboard/>
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
					<CountdownTimer getTimeUntil="" />  
				</body>

			</html>
			// Add the time until the next round
		);
	}

	return (
		<html lang="en">

			<body>
				<CountdownTimer getTimeUntil=""/>
			</body>

		</html>
		// Add the time until the next round
	);
}