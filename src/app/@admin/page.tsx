import Link from "next/link";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";

const DashboardCard = ({
	title,
	description,
	href,
}: { title: string; description: string; href: string }) => (
	<Card>
		<CardHeader>
			<CardTitle>
				<Link href={href} className="hover:underline">
					{title}
				</Link>
			</CardTitle>
			<CardDescription>{description}</CardDescription>
		</CardHeader>
	</Card>
);

const Page = () => {
	return (
		<div className="container mx-auto p-6">
			<h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
			<div className="grid gap-6 md:grid-cols-3">
				<DashboardCard
					title="Question Management"
					description="Manage and organize questions"
					href="/problems"
				/>
				<DashboardCard
					title="Blacklist"
					description="blacklist participants"
					href="/blacklist"
				/>
				<DashboardCard
					title="Check-in"
					description="User's check-in management"
					href="/check-in"
				/>
				<DashboardCard
					title="Promotion"
					description="Promote or demote teams"
					href="/promotion"
				/>
				<DashboardCard
					title="Rounds"
					description="Manage rounds"
					href="/rounds"
				/>
			</div>
		</div>
	);
};

export default Page;
