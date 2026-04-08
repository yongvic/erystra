export type ReportSummaryData = {
  totalPosts: number;
  published: number;
  scheduled: number;
  byProvider: Record<string, number>;
  generatedAt: string;
};

export type PremiumChannelInsight = {
  provider: string;
  score: number;
  status: "fort" | "stable" | "fragile";
  recommendation: string;
};

export type PremiumReportAnalysis = {
  mode: "premium";
  overallScore: number;
  executiveSummary: string;
  boardSummary: string;
  keyWins: string[];
  watchouts: string[];
  channelRecommendations: PremiumChannelInsight[];
  nextActions: string[];
  rawText: string;
};
