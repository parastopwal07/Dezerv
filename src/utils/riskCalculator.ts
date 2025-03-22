/**
 * Advanced utility functions for calculating risk scores and portfolio allocations
 * using mathematical optimization techniques
 */
import * as math from 'mathjs';

// Fallback implementation of minimize function
function fallbackMinimize(
  func: (x: number[]) => number,
  initialGuess: number[],
  constraints: any[],
  bounds: any[]
): { solution: number[] } {
  const solution = [...initialGuess];
  
  // Simple gradient descent with constraints
  const iterations = 1000;
  const learningRate = 0.01;
  
  for (let i = 0; i < iterations; i++) {
    // Ensure sum constraint
    let sum = solution.reduce((a, b) => a + b, 0);
    for (let j = 0; j < solution.length; j++) {
      solution[j] = solution[j] / sum;
    }
    
    // Apply bounds
    for (let j = 0; j < solution.length; j++) {
      const bound = bounds.find(b => b.index === j);
      if (bound) {
        solution[j] = Math.max(bound.lower, Math.min(bound.upper, solution[j]));
      }
    }
    
    // Simple gradient computation
    const h = 0.0001;
    const gradient = [];
    for (let j = 0; j < solution.length; j++) {
      const solutionPlus = [...solution];
      solutionPlus[j] += h;
      const solutionMinus = [...solution];
      solutionMinus[j] -= h;
      gradient[j] = (func(solutionPlus) - func(solutionMinus)) / (2 * h);
    }
    
    // Update solution
    for (let j = 0; j < solution.length; j++) {
      solution[j] -= learningRate * gradient[j];
    }
  }
  
  // Final normalization and bounds check
  let sum = solution.reduce((a, b) => a + b, 0);
  for (let j = 0; j < solution.length; j++) {
    solution[j] = solution[j] / sum;
    const bound = bounds.find(b => b.index === j);
    if (bound) {
      solution[j] = Math.max(bound.lower, Math.min(bound.upper, solution[j]));
    }
  }
  
  return { solution };
}

// Use fallback implementation
const numericMinimize = fallbackMinimize;

// Default expected returns for asset classes (annual)
const DEFAULT_EXPECTED_RETURNS = [
  0.07, // Bonds
  0.03, // Cash/FD
  0.08, // Gold/Commodities
  0.12, // Equity/Stocks
  0.10  // Real Estate
];

// Default covariance matrix for asset classes (simplified)
const DEFAULT_COV_MATRIX = [
  [0.0004, 0.0001, 0.0002, 0.0003, 0.0002], // Bonds
  [0.0001, 0.0001, 0.0001, 0.0001, 0.0001], // Cash/FD
  [0.0002, 0.0001, 0.0009, 0.0005, 0.0003], // Gold/Commodities
  [0.0003, 0.0001, 0.0005, 0.0016, 0.0007], // Equity/Stocks
  [0.0002, 0.0001, 0.0003, 0.0007, 0.0010]  // Real Estate
];

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
    'Low': 1,
    'Medium': 3,
    'High': 5
  },
  marketDropReaction: {
    'Sell everything to prevent further loss': 1,
    'Do nothing and wait for recovery': 3,
    'Invest more to buy at lower prices': 5
  },
  timeHorizon: {
    'Less than 1 year': 1,
    '1-3 years': 2,
    '3-5 years': 3,
    '5+ years': 5
  },
  emergencyFund: {
    'Yes, covering 6+ months of expenses': 5,
    'Yes, covering 3-6 months of expenses': 3,
    'No, I do not have an emergency fund': 1
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
  const riskyCategoryCount = responses.investmentInterests.filter((interest) =>
    ['Stocks', 'Mutual Funds', 'Real Estate'].includes(interest)
  ).length;
  const investmentOptionsScore = Math.min(riskyCategoryCount + 1, 5);
  rawScore += investmentOptionsScore * WEIGHTS.investmentOptions;

  // Calculate financial goals score
  const goalScores: { [key: string]: number } = {
    'Wealth accumulation': 5,
    'Saving for retirement': 3,
    'Buying a house': 3,
    'Generating passive income': 4,
    'Saving for education': 3
  };
  rawScore += (goalScores[responses.primaryGoal] || 3) * WEIGHTS.financialGoals;

  rawScore += POINT_VALUES.timeHorizon[responses.timeHorizon] * WEIGHTS.timeHorizon;
  rawScore += POINT_VALUES.emergencyFund[responses.emergencyFund] * WEIGHTS.emergencyFund;

  // Normalize to 1-10 scale
  return ((rawScore - 1) / 4) * 9 + 1;
}

function minimize(
  portfolioVariance: (weights: number[]) => number,
  initialGuess: number[],
  options: { constraints: { eq: (weights: number[]) => boolean }; bounds: [number, number][] }
): { solution: number[] } {
  const constraints = [
    {
      type: 'eq',
      fun: options.constraints.eq
    }
  ];

  const bounds = options.bounds.map((bound, index) => ({
    lower: bound[0],
    upper: bound[1],
    index
  }));

  return numericMinimize(portfolioVariance, initialGuess, constraints, bounds);
}

function portfolioOptimization(
  expectedReturns: number[],
  covMatrix: number[][],
  riskScore: number
): number[] {
  const numAssets = expectedReturns.length;

  // Define bounds based on risk score
  let bounds: [number, number][];
  if (riskScore <= 3) {
    // Conservative allocation
    bounds = [
      [0.20, 0.40], // Bonds
      [0.20, 0.40], // Cash/FD
      [0.05, 0.15], // Gold/Commodities
      [0.10, 0.25], // Equity/Stocks
      [0.00, 0.10]  // Real Estate
    ];
  } else if (riskScore <= 6) {
    // Moderate allocation
    bounds = [
      [0.15, 0.30], // Bonds
      [0.10, 0.25], // Cash/FD
      [0.05, 0.15], // Gold/Commodities
      [0.30, 0.50], // Equity/Stocks
      [0.05, 0.15]  // Real Estate
    ];
  } else {
    // Aggressive allocation
    bounds = [
      [0.05, 0.15], // Bonds
      [0.05, 0.15], // Cash/FD
      [0.00, 0.10], // Gold/Commodities
      [0.50, 0.75], // Equity/Stocks
      [0.10, 0.20]  // Real Estate
    ];
  }

  // Define the variance function
  const portfolioVariance = (weights: number[]): number => {
    try {
      const weightsMatrix = math.matrix(weights);
      const covMatrixMatrix = math.matrix(covMatrix);
      
      // Calculate the variance
      const result = math.multiply(math.multiply(weightsMatrix, covMatrixMatrix), math.transpose(weightsMatrix));
      const value = result as any; // Handle possible matrix result
      
      // Extract the numeric value
      return typeof value === 'number' ? value : Number(value);
    } catch (error) {
      console.error('Error calculating portfolio variance:', error);
      return 1; // Default value in case of error
    }
  };

  // Constraints - ensure weights sum to 1
  const constraints = {
    eq: (weights: number[]): boolean => Math.abs(math.sum(weights) - 1) < 1e-6
  };

  // Minimize portfolio variance with initial guess of equal weights
  const initialGuess = new Array(numAssets).fill(1 / numAssets);
  
  try {
    const result = minimize(portfolioVariance, initialGuess, {
      constraints,
      bounds
    });
    
    // Round to 2 decimal places and ensure sum is 1
    const roundedSolution = result.solution.map(w => Math.round(w * 100) / 100);
    const sum = roundedSolution.reduce((a, b) => a + b, 0);
    
    // Adjust to ensure sum is 1
    if (Math.abs(sum - 1) > 0.01) {
      const adjustment = (1 - sum) / numAssets;
      return roundedSolution.map(w => Math.max(0, Math.min(1, w + adjustment)));
    }
    
    return roundedSolution;
  } catch (error) {
    console.error('Optimization error:', error);
    // Fallback to basic allocation
    return getDefaultAllocation(riskScore);
  }
}

// Fallback allocations in case optimization fails
function getDefaultAllocation(riskScore: number): number[] {
  if (riskScore <= 3) {
    return [0.30, 0.30, 0.10, 0.20, 0.10]; // Conservative
  } else if (riskScore <= 6) {
    return [0.20, 0.15, 0.10, 0.40, 0.15]; // Moderate
  } else {
    return [0.10, 0.05, 0.05, 0.65, 0.15]; // Aggressive
  }
}

// Convert raw allocation to the expected format for the application
function convertToAppAllocation(rawAllocation: number[]): {
  stocks: number;
  gold: number;
  fd: number;
  bonds: number;
  mutualFunds: number;
} {
  // Map from [bonds, cash/fd, gold, equity, real estate] to application format
  // Split equity between stocks and mutual funds
  const stocksPercentage = Math.round(rawAllocation[3] * 75); // 75% of equity to stocks
  const mutualFundsPercentage = Math.round(rawAllocation[3] * 25); // 25% of equity to mutual funds
  
  return {
    bonds: Math.round(rawAllocation[0] * 100),
    fd: Math.round(rawAllocation[1] * 100),
    gold: Math.round(rawAllocation[2] * 100),
    stocks: stocksPercentage,
    mutualFunds: mutualFundsPercentage
  };
}

export function calculatePortfolioAllocation(riskScore: number): {
  stocks: number;
  gold: number;
  fd: number;
  bonds: number;
  mutualFunds: number;
} {
  // Use default expected returns and covariance matrix
  const rawAllocation = portfolioOptimization(
    DEFAULT_EXPECTED_RETURNS,
    DEFAULT_COV_MATRIX,
    riskScore
  );
  
  // Convert to the application's expected format
  return convertToAppAllocation(rawAllocation);
}