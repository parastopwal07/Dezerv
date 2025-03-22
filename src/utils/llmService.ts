/**
 * This file handles communication with the Python backend service
 * which simulates a Large Language Model (LLM) risk assessment
 */

import { calculatePortfolioAllocation } from './riskCalculator';

// URL of the Python backend service
const PYTHON_API_URL = 'http://localhost:8080';

/**
 * Communicates with the Python backend to get a risk assessment
 * @param currentRiskScore The current risk score to send to the backend
 * @returns A promise that resolves to a risk score between 1-10 and explanation message
 */
export async function getLLMRiskAssessment(currentRiskScore?: number): Promise<{ riskScore: number; message: string }> {
  try {
    console.log('Calling Python backend for risk assessment...');
    
    // Add the risk score as a query parameter if it exists
    const url = currentRiskScore !== undefined 
      ? `${PYTHON_API_URL}/api/risk-assessment?risk_score=${currentRiskScore}`
      : `${PYTHON_API_URL}/api/risk-assessment`;
    
    console.log(`Sending request to: ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Python backend response:', data);
    
    // Extract and log the message from the response
    console.log('Message from Python backend:', data.message);
    
    return {
      riskScore: data.riskScore,
      message: data.message
    };
  } catch (error) {
    console.error('Error calling Python risk assessment service:', error);
    
    // Fallback to a random score if the API call fails
    console.warn('Falling back to local random risk score generation');
    return {
      riskScore: Math.floor(Math.random() * 10) + 1,
      message: 'Could not connect to AI service. Using fallback random score.'
    };
  }
}

/**
 * Send portfolio data to the Python backend for risk assessment
 * @param portfolioData The user's portfolio allocation data
 * @returns A promise that resolves to a risk score and explanation
 */
export async function getPortfolioRiskAssessment(portfolioData: {
  stocks: number,
  gold: number,
  fixedDeposit: number,
  bonds: number,
  mutualFunds: number,
  totalValue: number
}): Promise<{ riskScore: number; message: string }> {
  try {
    console.log('Calling Python backend for portfolio risk assessment...');
    
    const response = await fetch(`${PYTHON_API_URL}/api/portfolio-risk-assessment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(portfolioData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Portfolio risk assessment response:', data);
    
    return {
      riskScore: data.riskScore,
      message: data.message
    };
  } catch (error) {
    console.error('Error calling portfolio risk assessment service:', error);
    
    // Fallback to a random score if the API call fails
    return {
      riskScore: Math.floor(Math.random() * 10) + 1,
      message: 'Could not connect to AI service. Using fallback portfolio risk assessment.'
    };
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
