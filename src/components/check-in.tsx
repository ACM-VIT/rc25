"use client";

import React, { useState, useTransition } from "react";
import type { Team, TeamRound, UniReg, User } from "@/db/schema";
import { useRouter } from "next/navigation";
import { useToast } from "./ui/use-toast";
import GetParicipant from "@/app/actions/get-participant";
import AddToTeam from "@/app/actions/add-to-team";
import Override from "@/app/actions/override";
import CheckInTeam from "@/app/actions/check-in-team";
import ReverseCheckIn from "@/app/actions/reverse-check-in";
import InputCatcher from "./input-catcher";
import TeamParticipant from "./team-participant";
import ExtraParticipant from "./extra-participant";
import RemoveFromTeam from "@/app/actions/remove-from-team";

type TeamWithMembers = Team & { members: User[]; TeamRound: TeamRound[] };
type UserWithTeam = User & { Team?: Team | null };

function CheckIn({
	uniReg,
	team,
}: {
	uniReg: UniReg[];
	team: TeamWithMembers;
}) {
	const { toast } = useToast();

	const router = useRouter();

	const [pending, startTransition] = useTransition();
	const [input, setInput] = useState("");

	const [checkedIn, setCheckedIn] = useState<string[]>(
		team.TeamRound.length > 0 ? team.members.map((i) => i.name?.slice(-9) ?? '') : [],
	);

	const [extra, setExtra] = useState<UserWithTeam[]>([]);
	const [extraUniReg, setExtraUniReg] = useState<UniReg[]>([]);

	function lookup() {
		const participant = team.members.find((i) => i.name?.slice(-9) === input);

		if (participant) {
			if (checkedIn.includes(input)) {
				setInput("");
				toast({ description: "Already Checked In" });
				return;
			}

			if (!uniReg.find((i) => i?.regNo === input)) {
				setInput("");
				toast({
					description: "VTOP Registration not found",
					variant: "destructive",
				});
				return;
			}

			if (!participant.phone || !participant.gender) {
				setInput("");
				toast({
					description: "Participant onboarding data not found",
					variant: "destructive",
				});
				return;
			}

			setInput("");

			return setCheckedIn((prev) => [...prev, input]);
		}

		if (extra.find((i) => i.name?.slice(-9) === input)) {
			setInput("");
			toast({
				description: "Add person to the team from extras before checking in.",
			});
			return;
		}

		startTransition(async () => {
			const res = await GetParicipant(input);
			if (!res || (!res.user && !res.uniReg)) {
				setInput("");
				toast({ description: "Participant not found", variant: "destructive" });
				return;
			}
			if (!res.user) {
				setInput("");
				toast({
					description: "Participant not logged in to RSVP.",
					variant: "destructive",
				});
				return;
			}
			setExtra((prev) => [
				...prev,
				res.user as UserWithTeam,
			]);
			setTimeout(() => {
				if (res.uniReg)
					setExtraUniReg((prev) => [...prev, res.uniReg as UniReg]);
			}, 300);
			setInput("");
		});
	}

	function removeParticipant(userId: string) {
		startTransition(async () => {
			const user = team.members.find((i) => i.id === userId);
			if (!user) {
				toast({
					description: "User not found in team.",
					variant: "destructive",
				});
				return;
			}
			const res = await RemoveFromTeam(userId, team.id);

			if (!res) {
				toast({
					description: "Error in removing person.",
					variant: "destructive",
				});
				return;
			}

			setCheckedIn((prev) => prev.filter((i) => i !== (user.name?.slice(-9) ?? '')));
			setExtraUniReg((prev) => {
				const foundReg = uniReg.find((i) => i?.regNo === user.name?.slice(-9));
				return foundReg ? [...prev, foundReg] : prev;
			});
			setExtra((prev) => [...prev, { ...user, teamId: null, Team: null }]);
		});
	}

	function addParticipant(userId: string) {
		startTransition(async () => {
			const user = extra.find((i) => i.id === userId);
			if (!user) return;
			const res = await AddToTeam(userId, team.id);

			if (res === false) {
				toast({ description: "Team is full.", variant: "destructive" });
				return;
			}
			if (!res) {
				toast({
					description: "Error in adding person.",
					variant: "destructive",
				});
				return;
			}

			setExtra((prev) => prev.filter((i) => i.id !== userId));
			setExtraUniReg((prev) =>
				prev.filter((i) => i?.regNo !== (user.name?.slice(-9) ?? '')),
			);
		});
	}

	function overrideParticipant(regNo: string) {
		startTransition(() => {
			const res = Override(regNo, team.id);

			if (!res) {
				toast({
					description: "Error in adding person.",
					variant: "destructive",
				});
				return;
			}
		});
	}

	function checkInTeam() {
		startTransition(async () => {
			if (
				team.members.length < Number.parseInt(process.env.MIN_TEAM_CAPACITY || "2")
			) {
				toast({
					description: "Insufficient members in team.",
					variant: "destructive",
				});
				return;
			}

			if (team.members.length !== checkedIn.length) {
				toast({
					description: "All members are not checked in.",
					variant: "destructive",
				});
				return;
			}

			if (
				team.members
					.map((i) => checkedIn.includes(i.name?.slice(-9) ?? ''))
					.includes(false)
			) {
				toast({
					description: "All members are not checked in.",
					variant: "destructive",
				});
				return;
			}

			const res = await CheckInTeam(team.id);

			if (res.success === false) {
				toast({
					description: "Insufficient members in team.",
					variant: "destructive",
				});
				return;
			}
			if (!res) {
				toast({
					description: "Error in checking in team.",
					variant: "destructive",
				});
				return;
			}
		});
	}

	function reverseCheckIn() {
		startTransition(async () => {
			await ReverseCheckIn(team.id);
		});
	}

	return (
		<div className="w-full">
			<div className="flex flex-row justify-between">
				<button
					type="button"
					className="underline cursor-pointer text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-500"
					onClick={() => router.push("/check-in")}
				>
					Back
				</button>
				{team.TeamRound?.length > 0 ? (
					<button
						type="button"
						className="underline cursor-pointer text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-500"
						onClick={reverseCheckIn}
					>
						Reverse Check In
					</button>
				) : (
					<button
						type="button"
						className="underline cursor-pointer text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-500"
						onClick={checkInTeam}
					>
						Check In Team
					</button>
				)}
			</div>
			<InputCatcher input={input} setInput={setInput} lookup={lookup} />
			<h1 className="text-4xl text-center font-bold">Check In</h1>
			<h3 className="text-2xl font-mono inline">Registration Number: </h3>
			<div className="text-2xl font-mono inline-block bg-violet-600 tracking-[10px] p-2 w-[225px]">
				{input}&nbsp;
			</div>

			<div className="text-xl font-mono inline-block">
				{pending ? "Loading..." : " "}
			</div>
			<div className="text-xl font-mono flex flex-row justify-between">
				<span>
					<h5>Team Name:</h5>
					<h1>{team.name}</h1>
				</span>
				<span>
					<h5>{team.TeamRound.length > 0 ? "CHECKED IN" : "NOT CHECKED IN"}</h5>
				</span>
			</div>
			<div className="table w-full text-xl">
				<div className="table-row font-extrabold bg-blue-950">
					<div className="table-cell">Reg No</div>
					<div className="table-cell">Name</div>
					<div className="table-cell">Phone</div>
					<div className="table-cell">Email</div>
					<div className="table-cell">VTOP Registered</div>
					<div className="table-cell">Remove from Team</div>
				</div>
				{team
					? team.members.map((member) => (
							<TeamParticipant
								participant={{
									unireg:
										uniReg?.find((i) => i?.regNo === member.name?.slice(-9)) ??
										null,
									user: member,
								}}
								remove={removeParticipant}
								override={overrideParticipant}
								teamCheckedIn={team.TeamRound.length > 0}
								checkedIn={checkedIn.includes(member.name?.slice(-9) ?? '')}
								key={member.id}
							/>
						))
					: null}
			</div>
			<div>
				<h1 className="text-2xl font-bold">Extras</h1>
				<div className="table w-full text-xl">
					<div className="table-row font-extrabold bg-blue-950">
						<div className="table-cell">Reg No</div>
						<div className="table-cell">Name</div>
						<div className="table-cell">Phone</div>
						<div className="table-cell">Email</div>
						<div className="table-cell">Team</div>
						<div className="table-cell">VTOP Registered</div>
						<div className="table-cell">Add to Team</div>
					</div>
					{extra.map((member) => (
						<ExtraParticipant
							participant={{
								unireg:
									extraUniReg?.find(
										(i) => i?.regNo === (member.name?.slice(-9) ?? ''),
									) ?? null,
								user: member,
							}}
							override={overrideParticipant}
							add={addParticipant}
							checkedIn={team.TeamRound.length > 0}
							key={member.id}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

export default CheckIn;
