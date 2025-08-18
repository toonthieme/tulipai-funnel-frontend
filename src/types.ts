
export enum Step {
  BusinessInfo = 1,
  CompanyProfile = 2,
  Industry = 3,
  DepartmentDomain = 4,
  Challenges = 5,
  AiMaturity = 6,
  Solutions = 7,
  TimingBudget = 8,
  Summary = 9,
  Payment = 10,
  Confirmation = 11,
}

export const STEP_DESCRIPTIONS: Record<Step, { title: string; description: string }> = {
    [Step.BusinessInfo]: { title: 'Business Info', description: 'Tell us about your company' },
    [Step.CompanyProfile]: { title: 'Company Profile', description: 'Let us know who you are' },
    [Step.Industry]: { title: 'Industry', description: 'Your field of business' },
    [Step.DepartmentDomain]: { title: 'Your Role', description: 'Your position and focus' },
    [Step.Challenges]: { title: 'Challenges', description: 'Your current pain points' },
    [Step.AiMaturity]: { title: 'AI Readiness', description: 'Your current AI stage' },
    [Step.Solutions]: { title: 'Solutions', description: 'Potential AI opportunities' },
    [Step.TimingBudget]: { title: 'Timeline & Budget', description: 'Project scope and scale' },
    [Step.Summary]: { title: 'Summary', description: 'Final review and submission' },
    [Step.Payment]: { title: 'Payment', description: 'Finalize your request' },
    [Step.Confirmation]: { title: 'Confirmation', description: 'Request received' },
};


// Types are now strings to allow for dynamic, AI-generated options.
export type TeamSize = string;
export type Industry = string;
export type DepartmentLevel = string;
export type BusinessDomain = string;
export type Challenge = string;
export type AiStage = string;
export type Solution = string;
export type Timeline = string;
export type Budget = string;

export interface AiGuideResponse {
  guideText: string;
  suggestions?: string[];
}

export interface FormData {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  website: string;
  role: string;
  teamSize: TeamSize;
  companySummary: string;
  industries: Industry[];
  departmentLevel: DepartmentLevel;
  businessDomains: BusinessDomain[];
  otherBusinessDomain?: string;
  challenges: Challenge[];
  challengeClarification: string;
  aiStage: AiStage;
  aiUseCase: string;
  solutions: Solution[];
  timeline: Timeline;
  budget: Budget;
  websiteInsights?: string[];
  generatedQuote?: string;
  isQuoteLoading?: boolean;
  internalNotes?: string;
}

export type FormErrors = Partial<Record<keyof FormData, string>>;

export enum SubmissionStatus {
  New = 'new',
  InProgress = 'in_progress',
  ProposalSent = 'proposal_sent',
  Closed = 'closed'
}

export interface Submission extends FormData {
  id: string;
  submittedAt: string;
  status: SubmissionStatus;
  proposalSentAt?: string;
  notes?: string;
}
