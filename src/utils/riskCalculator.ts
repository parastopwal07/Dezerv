/**
 * Utility functions for calculating risk scores and portfolio allocations
 */

// Point values for each answer option
const POINT_VALUES = {
  ageGroup: {
    '18-25': 5,
    '26-35': 4,
    '36-45': 3,
    '46-60': 2,
    '60+': 1
  },
  monthlyIncome: {
    'Below ₹30,000': 1,
    '₹30,000 - ₹50,000': 2,
    '₹50,000 - ₹1,00,000': 3,
    '₹1,00,000 - ₹2,00,000': 4,
    'Above ₹2,00,000': 5
  },
  savingsPercentage: {
    'Less than 10%': 1,
    '10% - 20%': 2,
    '20% - 30%': 3,
    '30% - 50%': 4,
    'More than 50%': 5
  },
  investmentExperience: {
    'Beginner': 1,
    'Intermediate': 3,
    'Advanced': 5
  },
  riskTolerance: {
    'I prefer safe investments with minimal risk, even if returns are low': 1,
    'I am okay with moderate risk for slightly better returns': 3,
    'I am willing to take high risks for higher potential returns': 5
  },
  marketDropReaction: {
    'I would sell immediately to prevent further losses': 1,
    'I would hold and wait for recovery': 3,
    'I would buy more, taking advantage of lower prices': 5
  },
  timeHorizon: {
    'Short-term (0-3 years)': 1,
    'Medium-term (3-7 years)': 3,
    'Long-term (7+ years)': 5
  },
  emergencyFund: {
    'Yes': 5,
    'No, I need to build one': 1
  }
};

// Weights for each factor in risk calculation
const WEIGHTS = {
  ageGroup: 0.1,
  monthlyIncome: 0.1,
  savingsPercentage: 0.1,
  loans: 0.05,
  investmentExperience: 0.15,
  riskTolerance: 0.15,
  marketDropReaction: 0.15,
  investmentOptions: 0.05,
  financialGoals: 0.05,
  timeHorizon: 0.05,
  emergencyFund: 0.05
};

export interface QuestionnaireResponse {
  ageGroup: keyof typeof POINT_VALUES.ageGroup;
  monthlyIncome: keyof typeof POINT_VALUES.monthlyIncome;
  savingsPercentage: keyof typeof POINT_VALUES.savingsPercentage;
  loans: string[];
  investmentExperience: keyof typeof POINT_VALUES.investmentExperience;
  riskTolerance: keyof typeof POINT_VALUES.riskTolerance;
  marketDropReaction: keyof typeof POINT_VALUES.marketDropReaction;
  investmentInterests: string[];
  primaryGoal: string;
  timeHorizon: keyof typeof POINT_VALUES.timeHorizon;
  emergencyFund: keyof typeof POINT_VALUES.emergencyFund;
}

export function calculateRiskScore(responses: QuestionnaireResponse): number {
  let rawScore = 0;

  // Calculate points for each response
  rawScore += POINT_VALUES.ageGroup[responses.ageGroup] * WEIGHTS.ageGroup;
  rawScore += POINT_VALUES.monthlyIncome[responses.monthlyIncome] * WEIGHTS.monthlyIncome;
  rawScore += POINT_VALUES.savingsPercentage[responses.savingsPercentage] * WEIGHTS.savingsPercentage;
  
  // Calculate loans score
  const loansScore = Math.max(5 - responses.loans.length, 1);
  rawScore += loansScore * WEIGHTS.loans;
  
  rawScore += POINT_VALUES.investmentExperience[responses.investmentExperience] * WEIGHTS.investmentExperience;
  rawScore += POINT_VALUES.riskTolerance[responses.riskTolerance] * WEIGHTS.riskTolerance;
  rawScore += POINT_VALUES.marketDropReaction[responses.marketDropReaction] * WEIGHTS.marketDropReaction;
  
  // Calculate investment options score
  const riskyCategoryCount = responses.investmentInterests.filter(interest => 
    ['Stocks & Equities', 'Cryptocurrency', 'Alternative Investments'].includes(interest)
  ).length;
  const investmentOptionsScore = Math.min(riskyCategoryCount + 1, 5);
  rawScore += investmentOptionsScore * WEIGHTS.investmentOptions;
  
  // Calculate financial goals score
  const goalScores = {
    'Tax Saving': 2,
    'Buying a House': 3,
    "Child's Education": 3,
    'Retirement Planning': 3,
    'Passive Income Generation': 4,
    'Wealth Creation': 5
  };
  rawScore += (goalScores[responses.primaryGoal as keyof typeof goalScores] || 3) * WEIGHTS.financialGoals;
  
  rawScore += POINT_VALUES.timeHorizon[responses.timeHorizon] * WEIGHTS.timeHorizon;
  rawScore += POINT_VALUES.emergencyFund[responses.emergencyFund] * WEIGHTS.emergencyFund;

  // Normalize to 1-10 scale
  return ((rawScore - 1) / 4) * 9 + 1;
}

export function calculatePortfolioAllocation(riskScore: number): {
  stocks: number;
  gold: number;
  fd: number;
  bonds: number;
  mutualFunds: number;
} {
  if (riskScore <= 3) {
    return {
      stocks: 20,
      gold: 15,
      fd: 30,
      bonds: 25,
      mutualFunds: 10
    };
  } else if (riskScore <= 7) {
    return {
      stocks: 40,
      gold: 10,
      fd: 10,
      bonds: 20,
      mutualFunds: 20
    };
  } else {
    return {
      stocks: 60,
      gold: 5,
      fd: 5,
      bonds: 10,
      mutualFunds: 20
    };
  }
}