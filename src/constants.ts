
import { TeamSize, Industry, Challenge, Solution, Timeline, Budget, DepartmentLevel, BusinessDomain, AiStage } from './types';

export const TEAM_SIZE_OPTIONS: TeamSize[] = ["1", "2-10", "11-50", "51-200", "200+"];

export const INDUSTRY_OPTIONS: Industry[] = [
  "Accommodation and Food Services",
  "Administrative and Support Services",
  "Aerospace & Defense",
  "Agriculture, Forestry, Fishing and Hunting",
  "Arts, Entertainment, and Recreation",
  "Automotive",
  "Biotechnology",
  "Construction",
  "Consulting",
  "Cybersecurity",
  "E-commerce",
  "Educational Services",
  "Energy & Utilities",
  "Finance and Insurance",
  "Fintech",
  "Government & Public Administration",
  "Healthcare and Social Assistance",
  "Health Tech",
  "Information Technology (IT) Services",
  "Legal Services",
  "Logistics & Supply Chain",
  "Management of Companies and Enterprises",
  "Manufacturing",
  "Marketing & Advertising",
  "Media & Communications",
  "Mining, Quarrying, and Oil and Gas Extraction",
  "Non-profit",
  "Other Services (except Public Administration)",
  "Pharmaceuticals",
  "Professional, Scientific, and Technical Services",
  "Real Estate and Rental and Leasing",
  "Retail Trade",
  "Software as a Service (SaaS)",
  "Telecommunications",
  "Transportation and Warehousing",
  "Wholesale Trade",
].sort();


export const DEPARTMENT_LEVEL_OPTIONS: DepartmentLevel[] = ["Board", "Management", "Team Lead", "Staff"];

export const BUSINESS_DOMAIN_OPTIONS: BusinessDomain[] = ["Finance", "IT", "Risk", "Supply Chain", "HR", "Marketing", "Legal", "Operations"];

export const AI_STAGE_OPTIONS: AiStage[] = [
    "We have no experience with AI",
    "We are currently exploring possibilities",
    "We already have concrete ideas",
    "We have started implementation"
];

export const CHALLENGE_OPTIONS: Challenge[] = [
  "Too much admin work", "Unreliable reporting", "Staff shortages", "Poor lead generation",
  "Overwhelmed customer support", "Operational inefficiency", "Difficulty analyzing data", "Low marketing ROI"
];

export const SOLUTION_OPTIONS: Solution[] = [
  "Smart Assistant", "Process Automation", "Data Analytics", "AI-Powered CRM", "Marketing AI", "HR Automation"
];

export const TIMELINE_OPTIONS: Timeline[] = ["ASAP", "Within 3 months", "3-6 months", "6-12 months"];
