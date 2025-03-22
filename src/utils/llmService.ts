/**
 * This file handles communication with the Python backend service
 * which simulates a Large Language Model (LLM) risk assessment
 */

import { calculatePortfolioAllocation } from './riskCalculator';

// URL of the Python backend service
const PYTHON_API_URL = 'http://localhost:8080';

/**
 * Communicates with the Python backend to get a risk assessment
 * @returns A promise that resolves to a risk score between 1-10
 */
export async function getLLMRiskAssessment(): Promise<number> {
  try {
    console.log('Calling Python backend for risk assessment...');
    const response = await fetch(`${PYTHON_API_URL}/api/risk-assessment`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Python backend response:', data);
    
    return data.riskScore;
  } catch (error) {
    console.error('Error calling Python risk assessment service:', error);
    
    // Fallback to a random score if the API call fails
    console.warn('Falling back to local random risk score generation');
    return Math.floor(Math.random() * 10) + 1;
  }
}

/**
 * Gets the recommended portfolio allocation based on a risk score
 * @param riskScore The risk score (1-10)
 * @returns An object with recommended allocation percentages
 */
export function getAllocationFromRiskScore(riskScore: number) {
  // Use the existing calculation function from riskCalculator.ts
  const allocation = calculatePortfolioAllocation(riskScore);
  
  return {
    equities: allocation.stocks + allocation.mutualFunds,
    bonds: allocation.bonds,
    commodities: allocation.gold,
    realEstate: 0,
    cash: allocation.fd,
  };
}
