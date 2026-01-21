export type TeamMember = {
    id: string;
    name: string | null;
    score: number;
};

export type TeamDetails = {
    id: string;
    name: string;
    shortCode: string;
    score: number;
    members: TeamMember[];
};

export type LeaderboardTeam = {
    id: string;
    name: string;
    score: number;
};

export type RoundInfo = {
    number: number;
    end: Date;
};

export interface Question {
    id: string;
    slno: number;
    questionName: string;
    difficulty: string;
    status: string;
}

export type Questions = {
    slno: number;
    id: string;
    questionName: string;
    difficulty: string;
    status: string;
    isHidden: boolean;
};

export interface NewsItem {
    id: string;
    title: string;
    content: string;
    time: Date;
}

export type DashboardProps = {
    teamDetails: TeamDetails
    leaderboard: LeaderboardTeam[]
    questions: Questions[]
    leaderboardShow: boolean
    news: NewsItem[];
};
