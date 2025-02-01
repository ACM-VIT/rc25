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
    title: string; description: string; href?: string; onClick?: () => void
}) => (
    <Card>
        <CardHeader>
            <CardTitle>
                {href &&
                    <Link href={href} className="hover:underline">
                        {title}
                    </Link>
                }
                {/*{!href && title}*/}
                {onClick &&
                    <div onClick={onClick} className="hover:underline hover:cursor-pointer">
                        {title}
                    </div>
                }
                {!href && !onClick && title}
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
                <DashboardCard
                    title="Submissions"
                    description="Manage teams"
                    href="/submissions"
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
