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



// till auth is implemeneted basic routing for now
const isAdmin = false; // true --> admin
const detailsFilled = false;
const teamJoined = false;
const teamCheckedIn = false;
const roundIsActive = false; // true --> portal
const memberOfActiveRound = false; // false --> elimination
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
	// <div className="fixed top-0 h-[100vh] w-[100vw] bg-[#222222] -z-10 overflow-y-auto overflow-x-hidden">
	// 	<div className="aboslute mt-6 ml-8 phone:w-[20%]  ">
	// 		<Image
	// 			className=" object-cover object-center "
	// 			src={logo}
	// 			alt="logo"
	// 			width={200}
	// 			height={50}
	// 		/>
	// 	</div>
	// 	<div className="absolute hidden 2xl:ml-[-22%] mt-[5%] xl:ml-[-23%] lg:ml-[-28%]  lg:block">
	// 		<Image
	// 			className=" object-cover object-center "
	// 			src={rock}
	// 			alt="rock"
	// 			width={600}
	// 			height={50}
	// 		/>
	// 	</div>
	// 	<div className="absolute h-screen w-[100vw] ml-[5%] top-0">
	// 		<Image
	// 			className=" object-cover w-full h-screen "
	// 			src={curveline}
	// 			alt="curveline"
	// 			width={200}
	// 			height={50}
	// 		/>
	// 	</div>
	// 	<div className="absolute top-6 right-0 phone:w-[20%] md:w-[15%]">
	// 		<Image
	// 			className="object-cover object-center"
	// 			src={bracket}
	// 			alt="bracket"
	// 			width={200}
	// 			height={50}
	// 		/>
	// 	</div>
	<div className="relative w-[100vw] h-dvh bg-[#222] overflow-hidden ">
		<div className="absolute inset-0 flex flex-row h-full">
			<div className="md:w-1/4 h-full">
				<Image
					className="hidden lg:block h-[100vh] object-cover object-center"
					src={rock}
					alt="Left SVG Image"
				/>
			</div>
			<div className="w-3/4 md:w-1/2 h-full">
				<Image
					className="min-h-screen object-cover object-center"
					src={curveline}
					alt="Middle curve line"
				/>
			</div>
			<div className="w-1/4 h-full">
				<Image
					className="h-[15vh]  md:object-center"
					src={bracket}
					alt="Right Top Bracket"
				/>
			</div>
		</div>
		<div className="z-[10]">
			{children}
		</div>

	</div>
);

export default async function RootLayout({children, team, admin, landing}: LayoutProps) {
	const session = await auth();

	if (!session?.user?.email) {
		return (
			<html lang="en">
			<body>
			<BackgroundTemplate>
				{landing}
			</BackgroundTemplate>
			</body>
			</html>
		);
	}

	if (isAdmin) {
		return (
			<html lang="en">
			<body className={plus_jakarta_sans.className}>
			<BackgroundTemplate>
				{admin}
			</BackgroundTemplate>
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
			<BackgroundTemplate>
				{team}
			</BackgroundTemplate>
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