export interface SubmissionType {
  id: string;
  code: string;
  score: number | null;
  createdAt: Date;
  problem: {
    title: string;
  };
  user: {
    Team: {
      name: string;
      shortCode: string;
    } | null;
  };
  testcasespassed: boolean[];
}

export interface GroupedTeamSubmissions {
  [teamName: string]: SubmissionType[];
}

export interface GroupedQuestionSubmissions {
  [questionName: string]: SubmissionType[];
}
