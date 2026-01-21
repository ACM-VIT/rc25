import React from "react";
import type { Team, UniReg, User } from "@/db/schema";

type UserWithTeam = User & { Team?: Team | null };

export default function ExtraParticipant({
	participant: { user, unireg },
	add,
	override,
	checkedIn,
}: {
	participant: {
		user: UserWithTeam;
		unireg: UniReg | null;
	};
	override: (regNo: string) => void;
	add: (userId: string) => void;
	checkedIn: boolean;
}) {
	return (
		<div
			className={`table-row ${!unireg || !user.phone || !user.gender ? "bg-red-700" : "bg-amber-500"}`}
		>
			<div className="table-cell">{user.name?.slice(-9)}</div>
			<div className="table-cell">{user.name?.slice(0, -10)}</div>
			<div className="table-cell">{user.phone}</div>
			<div className="table-cell">{user.email}</div>
			<div className="table-cell">
				{user.teamId && user.Team ? user.Team.name : "Not in a team"}
			</div>
			<div className="table-cell">
				{unireg ? (unireg.injected ? "Overriden" : "Yes") : "No    "}
				{!unireg ? (
					<button
						type="button"
						disabled={checkedIn}
						className="underline cursor-pointer text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-500"
						onClick={() => override(user.name!.slice(-9))}
					>
						Override
					</button>
				) : null}
			</div>
			<div className="table-cell">
				<button
					type="button"
					disabled={checkedIn}
					className="underline cursor-pointer text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-500"
					onClick={() => add(user.id)}
				>
					Add
				</button>
			</div>
		</div>
	);
}
