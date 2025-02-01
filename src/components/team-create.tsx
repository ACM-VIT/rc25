"use client";

import {useState, useEffect, useTransition} from "react";
import { useToast } from "@/components/ui/use-toast";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createTeam, getAvailableUsers } from "@/app/actions/create-team";

interface TeamBuilderProps {
	onTeamCreated?: () => void;
	initialRegNo?: string;
}

interface User {
	id: string;
	name: string | null;
	email: string | null;
}

export default function TeamBuilder({
	onTeamCreated,
}: TeamBuilderProps) {
	const [availableUsers, setAvailableUsers] = useState<User[]>([]);
	const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
	const [isPending, startTransition] = useTransition();
	const [searchTerm, setSearchTerm] = useState("");
	const [teamName, setTeamName] = useState("");
	const { toast } = useToast();

	const MAX_TEAM_SIZE = process.env.MAX_TEAM_SIZE || "4";

	useEffect(() => {
		loadUsers();
	}, []);

	const loadUsers = () => {
		startTransition(async ()=> {
			const users = await getAvailableUsers();
			setAvailableUsers(users);
		})
	};

	const handleCreateTeam = async () => {
		if (!teamName.trim()) {
			toast({
				description: "Please enter a team name",
				variant: "destructive",
			});
			return;
		}

		if (selectedUsers.length < 2) {
			toast({
				description: "Please select at least 2 users for a team",
				variant: "destructive",
			});
			return;
		}

		startTransition(async ()=> {

			try {
				const team = await createTeam(selectedUsers, teamName);
				if (team) {
					setTeamName("");
					onTeamCreated?.();
				}
			} catch (error) {
				toast({
					description: `Failed to create team: ${error instanceof Error ? error.message : 'Unknown error'}`,
					variant: "destructive",
				});
			}
		})
	};

	const handleUserSelect = (userId: string) => {
		setSelectedUsers((prev) => {
			if (prev.includes(userId)) {
				return prev.filter((id) => id !== userId);
			}
			if (prev.length >= Number.parseInt(MAX_TEAM_SIZE)) {
				toast({
					description: `Maximum team size is ${MAX_TEAM_SIZE} members`,
					variant: "destructive",
				});
				return prev;
			}
			return [...prev, userId];
		});
	};

	const filteredUsers = availableUsers.filter(
		(user) =>
			user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	return (
		<Card className="w-full max-w-2xl mx-auto">
			<CardContent className="space-y-6">
				<div className="space-y-2">
					<Label htmlFor="teamName">Enter Team Name</Label>
					<Input
						id="teamName"
						value={teamName}
						onChange={(e) => setTeamName(e.target.value)}
						placeholder="Enter team name"
					/>
				</div>

				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Label>Search and select team members</Label>
						<span className="text-sm text-muted-foreground">
							Selected: {selectedUsers.length}/{MAX_TEAM_SIZE}
						</span>
					</div>

					<Command className="border rounded-lg">
						<CommandInput
							placeholder="Search users..."
							value={searchTerm}
							onValueChange={setSearchTerm}
						/>
						<CommandList>
							<CommandEmpty>No users found.</CommandEmpty>
							<CommandGroup>
								{filteredUsers.map((user) => (
									<CommandItem
										key={user.id}
										onSelect={() => handleUserSelect(user.id)}
										className={`flex items-center justify-between cursor-pointer transition-colors duration-200 ${
											selectedUsers.includes(user.id)
												? "bg-violet-100 hover:bg-violet-200"
												: "hover:bg-gray-100"
										}`}
									>
										<div className="flex items-center gap-2">
											<div
												className={`w-4 h-4 border rounded-sm flex items-center justify-center
                          ${
														selectedUsers.includes(user.id)
															? "bg-primary border-primary"
															: "border-input"
													}`}
											>
												{selectedUsers.includes(user.id) && (
													<span className="text-primary-foreground text-xs">
														✓
													</span>
												)}
											</div>
											<span>{user.name}</span>
										</div>
										<span className="text-sm text-muted-foreground">
											{user.email}
										</span>
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</div>

				<div className="flex justify-between items-center pt-2">
					<span className="text-sm text-muted-foreground">
						{selectedUsers.length < 2
							? "Select at least 2 members"
							: `${selectedUsers.length} members selected`}
					</span>
					<Button
						onClick={handleCreateTeam}
						disabled={isPending || selectedUsers.length < 2 || !teamName.trim()}
					>
						{isPending ? "Creating..." : "Create Team"}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
