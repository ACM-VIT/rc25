"use client";

import React, { useCallback, useState, useTransition } from "react";
import GetTeam from "@/app/actions/get-team";
import { useToast } from "@/components/ui/use-toast";
import InputCatcher from "@/components/input-catcher";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import TeamBuilder from "@/components/team-create";

export default function Page() {
	const { toast } = useToast();
	const [input, setInput] = useState("");
	const [pending, startTransition] = useTransition();
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const enter = useCallback(() => {
		const regNo = input;
		startTransition(async () => {
			const res = await GetTeam(regNo);
			if (!res) {
				toast({
					description: "No Team Found with the given participant",
					variant: "destructive",
				});
				setInput("");
				return;
			}
		});
	}, [input, toast]);

	return (
		<div className="w-full">
			<InputCatcher input={input} setInput={setInput} lookup={enter} />
			<h1 className="text-4xl text-center font-bold">Check In</h1>

			<div className="space-y-4">
				<div className="flex items-center gap-2">
					<h3 className="text-2xl font-mono">Registration Number: </h3>
					<div className="text-2xl font-mono inline-block bg-violet-600 tracking-[10px] p-2 w-[225px]">
						{input}&nbsp;
					</div>
					<div className="text-xl font-mono inline-block">
						{pending ? "Loading..." : " "}
					</div>
				</div>

				<div>
					<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
						<DialogTrigger asChild>
							<button
								type="button"
								className="underline cursor-pointer text-blue-500 px-4 py-2 hover:text-blue-700"
							>
								Create Team
							</button>
						</DialogTrigger>
						<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
							<DialogHeader>
								<DialogTitle>Create New Team</DialogTitle>
							</DialogHeader>
							<div className="mt-4">
								<TeamBuilder
									onTeamCreated={() => {
										setIsDialogOpen(false);
										toast({
											description: "Team created successfully!",
										});
									}}
									initialRegNo={input}
								/>
							</div>
						</DialogContent>
					</Dialog>
				</div>
			</div>
		</div>
	);
}
