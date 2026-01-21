import React from "react";
import type { UniReg, User } from "@/db/schema";

export default function TeamParticipant({
	participant: { user, unireg },
	checkedIn,
	remove,
	override,
	teamCheckedIn,
}: {
	participant: { user: User; unireg: UniReg | null };
	checkedIn: boolean;
	remove: (userId: string) => void;
	override: (regNo: string) => void;
	teamCheckedIn: boolean;
}) {
	return (
		<div
			className={`table-row ${checkedIn ? "" : !unireg || !user.phone || !user.gender ? "bg-red-700" : "bg-amber-500"}`}
		>
			<div className="table-cell">{user.name?.slice(-9)}</div>
			<div className="table-cell">{user.name?.slice(0, -10)}</div>
			<div className="table-cell">{user.phone}</div>
			<div className="table-cell">{user.email}</div>
			<div className="table-cell">
				{unireg ? (unireg.injected ? "Overriden" : "Yes") : "No   "}
				{!unireg ? (
					<button
						type="button"
						disabled={teamCheckedIn}
						onClick={() => override(user.name!.slice(-9))}
						className="underline cursor-pointer text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-500"
					>
						Override
					</button>
				) : null}
			</div>
			<div className="table-cell">
				<button
					type="button"
					onClick={() => remove(user.id)}
					disabled={teamCheckedIn}
					className="underline cursor-pointer text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-500"
				>
					Remove
				</button>
			</div>
		</div>
	);
}
