"use client";
import Link from "next/link";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import switchAdminMode from "../actions/switch-admin-mode";

const DashboardCard = ({
    title,
    description,
    href,
    onClick
}: {
    title: string;
    description: string;
    href?: string;
    onClick?: () => void;
}) => (
    <Card className="transition-all duration-300 hover:shadow-lg hover:border-primary/50">
        <CardHeader className="space-y-2">
            <CardTitle className="text-xl">
                {href && (
                    <Link 
                        href={href} 
                        className="hover:text-primary transition-colors duration-200 flex items-center"
                    >
                        {title}
                    </Link>
                )}
                {onClick && (
                    <button 
                        type="button"
                        onClick={onClick} 
                        className="hover:text-primary transition-colors duration-200 flex items-center w-full text-left" 
                    >
                        {title}
                    </button>
                )}
                {!href && !onClick && title}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
                {description}
            </CardDescription>
        </CardHeader>
    </Card>
);

const Page = () => {
    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                <DashboardCard
                    title="Submissions"
                    description="Manage teams"
                    href="/submissions"
                />
                <DashboardCard
                    title="News"
                    description="Manage participant news"
                    href="/news"
                />
                <DashboardCard
                    title="Flag Management"
                    description="Manage feature flags"
                    href="/flags"
                />
                <DashboardCard
                    title="Participant Portal"
                    description="Switch to participant view"
                    onClick={() => switchAdminMode('user')}
                />
            </div>
        </div>
    );
};

export default Page;
