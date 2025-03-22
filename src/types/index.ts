export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface RiskProfile {
  id: string;
  userId: string;
  riskScore: number;
  allocationStrategy: AllocationStrategy;
  questionnaireResponses: QuestionnaireResponses;
  createdAt: string;
}

export interface AllocationStrategy {
  equities: number;
  bonds: number;
  commodities: number;
  realEstate: number;
  cash: number;
}

export interface QuestionnaireResponses {
  ageGroup: string;
  monthlyIncome: string;
  savingsPercentage: string;
  loans: string[];
  investmentExperience: string;
  riskTolerance: string;
  marketDropReaction: string;
  investmentInterests: string[];
  primaryGoal: string;
  timeHorizon: string;
  emergencyFund: string;
}

export interface Portfolio {
  id: string;
  userId: string;
  data: PortfolioData;
  importedAt: string;
}

export interface PortfolioData {
  assets: {
    type: string;
    value: number;
    percentage: number;
  }[];
  totalValue: number;
}

export interface AlignmentResult {
  id: string;
  portfolioId: string;
  riskProfileId: string;
  alignmentScore: number;
  recommendations: Recommendation[];
  calculatedAt: string;
}

export interface Recommendation {
  assetType: string;
  action: 'increase' | 'decrease';
  percentage: number;
  reason: string;
}