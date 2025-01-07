"use client";

import {
	blacklistTeam,
	searchTeams,
	ReverseblacklistTeam,
} from "@/app/actions/blacklist-team";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Shield, ShieldAlert, SearchIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { Team } from "@prisma/client";
import { useState } from "react";

export default function TeamSearch() {
	const [query, setQuery] = useState("");
	const [teams, setTeams] = useState<Team[]>([]);
	const [loading, setLoading] = useState(false);
	const { toast } = useToast();

	const handleSearch = async () => {
		if (!query.trim()) return;

		setLoading(true);
		const result = await searchTeams(query);
		setLoading(false);

		if (result.success) {
			setTeams(result.data || []);
			if (!result.data || result.data.length === 0) {
				toast({
					description: "No teams found",
					variant: "default",
				});
			}
		} else {
			toast({
				title: "Error",
				description: "Failed to search teams",
				variant: "destructive",
			});
		}
	};

	const handleDisqualify = async (teamId: string) => {
		const confirm = window.confirm(
			"Are you sure you want to disqualify this team?",
		);
		if (!confirm) return;

		const result = await blacklistTeam(teamId);
		if (result.success) {
			setTeams(
				teams.map((team) =>
					team.id === teamId ? { ...team, disqualify: true } : team,
				),
			);
			toast({
				title: "Team Disqualified",
				description: "The team has been successfully disqualified",
				variant: "destructive",
			});
		} else {
			toast({
				title: "Error",
				description: "Failed to disqualify team",
				variant: "destructive",
			});
		}
	};

	const handleReverseDisqualify = async (teamId: string) => {
		const confirm = window.confirm(
			"Are you sure you want to reverse the disqualification of this team?",
		);
		if (!confirm) return;

		const result = await ReverseblacklistTeam(teamId);
		if (result.success) {
			setTeams(
				teams.map((team) =>
					team.id === teamId ? { ...team, disqualify: false } : team,
				),
			);
			toast({
				title: "Team Reinstated",
				description: "The team has been successfully reinstated",
				variant: "default",
			});
		} else {
			toast({
				title: "Error",
				description: "Failed to reinstate team",
				variant: "destructive",
			});
		}
	};

	return (
		<Card className="max-w-4xl mx-auto">
			<CardHeader className="space-y-6">
				<div className="flex items-center gap-4">
					<div className="relative flex-1">
						<SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search teams..."
							className="pl-9"
							onKeyDown={(e) => e.key === "Enter" && handleSearch()}
						/>
					</div>
					<Button
						onClick={handleSearch}
						disabled={loading}
						className="min-w-[100px]"
					>
						{loading ? "Searching..." : "Search"}
					</Button>
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				{teams.map((team) => (
					<Card
						key={team.id}
						className={`border border-gray-200 hover:border-gray-300 transition-colors ${
							team.disqualify ? "bg-red-50/50" : "bg-white"
						}`}
					>
						<CardContent className="flex items-center justify-between p-6">
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<h3 className="text-lg font-semibold">{team.name}</h3>
									<Badge
										variant={team.disqualify ? "destructive" : "secondary"}
										className={`text-xs px-2 py-0.5 rounded-md ${
											team.disqualify
												? "bg-red-100 text-red-700 hover:bg-red-200"
												: "bg-green-100 text-green-700 hover:bg-green-200"
										}`}
									>
										{team.disqualify ? "Disqualified" : "Active"}
									</Badge>
								</div>
								<p className="text-sm text-muted-foreground">
									ShortCode: {team.shortCode}
								</p>
							</div>
							<Button
								variant={team.disqualify ? "outline" : "destructive"}
								size="sm"
								onClick={() =>
									team.disqualify
										? handleReverseDisqualify(team.id)
										: handleDisqualify(team.id)
								}
								className={`min-w-[100px] rounded-md ${
									team.disqualify
										? "border-green-600 text-green-600 hover:bg-green-50"
										: "hover:bg-red-700"
								}`}
							>
								{team.disqualify ? (
									<>
										<Shield className="mr-2 h-4 w-4 text-green-600" />
										Reinstate
									</>
								) : (
									<>
										<ShieldAlert className="mr-2 h-4 w-4" />
										Disqualify
									</>
								)}
							</Button>
						</CardContent>
					</Card>
				))}
			</CardContent>
		</Card>
	);
}
