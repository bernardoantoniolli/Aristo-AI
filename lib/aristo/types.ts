export interface PageContent {
  url: string;
  title: string;
  description: string;
  headings: string[];
  ctas: string[];
  prices: string[];
  bodyText: string;
  faq: string[];
  testimonials: string[];
}

export interface AnalysisInput {
  url: string;
  product: string;
  audience: string;
  problem: string;
  promise: string;
  price: number;
  channel: string;
  monthlyBudget?: number;
  pageContent?: PageContent;
}

export interface AnalysisScores {
  offer: number;
  conversion: number;
  acquisition: number;
  economics: number;
}

export interface CreativeTest {
  title: string;
  hypothesis: string;
  action: string;
  metric: string;
}

export interface AnalysisResult {
  score: number;
  scores: AnalysisScores;
  status: "red" | "yellow" | "green";

  mainBottleneck: {
    category: string;
    severity: "low" | "medium" | "high";
    explanation: string;
  };

  decision: string;
  recommendation: string;

  creativeAngles: string[];
  tests: CreativeTest[];

  pageContent?: PageContent;

  paidReport?: PaidReport;
}

export interface ActionPlanItem {
  priority: number;
  action: string;
  reason: string;
  metric: string;
  successCriteria: string;
}

export interface CreativePackage {
  hooks: string[];
  angles: string[];
  adCopies: string[];
  creatives: string[];
}

export interface ExecutiveDiagnosis {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  opportunity: string;
}

export interface PaidReport {
  executiveDiagnosis: ExecutiveDiagnosis;
  topProblems: string[];
  actionPlan: ActionPlanItem[];
  creativePackage: CreativePackage;
  whatNotToDo: string[];
  finalVerdict: string;
}
