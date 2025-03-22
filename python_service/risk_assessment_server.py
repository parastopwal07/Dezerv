from fastapi import FastAPI, Query, Body
from fastapi.middleware.cors import CORSMiddleware
import random
import time
import uvicorn
import json
import re
from llm_processor import LLMProcessor
from pydantic import BaseModel

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

def extract_json_from_text(text):
    """Extract JSON from LLM response text using regex"""
    # Try to find JSON pattern in the text
    json_match = re.search(r'({.*})', text, re.DOTALL)
    if json_match:
        json_str = json_match.group(1)
        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            # If parsing fails, try more aggressive cleaning
            cleaned_str = re.sub(r'[^\x00-\x7F]+', '', json_str)  # Remove non-ASCII
            cleaned_str = re.sub(r'\s+', ' ', cleaned_str).strip()  # Normalize whitespace
            try:
                return json.loads(cleaned_str)
            except:
                return None
    return None

@app.get("/api/risk-assessment")
async def get_risk_assessment(risk_score: float = Query(None)):
    # Simulate processing time (like an LLM thinking)
    time.sleep(1.5)
    
    # Print the received risk score
    if risk_score is not None:
        print(f"Received risk score from frontend: {risk_score}")
    else:
        print("No risk score received from frontend")
        risk_score = 0

    # Read user data from a file
    with open('user_data.txt', 'r') as file:
        user_data = file.read()

    prompt = f'''
    Pretend that you are a financial advisor robot, I want you to rate my risk taking capability on a scale of 1 to 10, upto 1 decimal point
    This is user_data : {user_data} 
    This is my current risk_score : {risk_score}
    Only return a singular number in json format , with keys : risk_score and reason in that order. Be verbose in your reason please and incorporate all of your financial knowledge. Also do NOT HALLUCINATE
    '''
    
    raw_response = my_llm.get_response(prompt)
    print(raw_response)
    
    # Parse the LLM response
    response_data = extract_json_from_text(raw_response)
    
    if response_data and 'risk_score' in response_data and 'reason' in response_data:
        new_risk_score = float(response_data['risk_score'])
        reason = response_data['reason']
    else:
        # Fallback if parsing fails
        new_risk_score = risk_score or 5.0  # Use provided score or default
        reason = "Unable to process risk assessment"

    # Return a JSON response with the risk score and reason
    return {
        "riskScore": round(new_risk_score, 1),
        "message": reason
    }

# Define a model for portfolio data
class PortfolioData(BaseModel):
    stocks: float
    gold: float
    fixedDeposit: float
    bonds: float
    mutualFunds: float
    totalValue: float

@app.post("/api/portfolio-risk-assessment")
async def analyze_portfolio(portfolio: PortfolioData):
    # Simulate processing time
    time.sleep(1.5)
    
    print(f"Received portfolio data: {portfolio}")
    
    # Calculate percentages for each asset type
    total = portfolio.totalValue
    percentages = {
        "stocks": (portfolio.stocks / total) * 100 if total > 0 else 0,
        "gold": (portfolio.gold / total) * 100 if total > 0 else 0,
        "fixedDeposit": (portfolio.fixedDeposit / total) * 100 if total > 0 else 0,
        "bonds": (portfolio.bonds / total) * 100 if total > 0 else 0,
        "mutualFunds": (portfolio.mutualFunds / total) * 100 if total > 0 else 0
    }
    
    # Read user data for context
    with open('user_data.txt', 'r') as file:
        user_data = file.read()
    
    prompt = f'''
    Pretend that you are a financial advisor robot. Based on the portfolio allocation below, 
    assess the risk level of this portfolio on a scale of 1 to 10, with 1 decimal point precision.
    
    Portfolio allocation:
    - Stocks: {percentages["stocks"]:.1f}%
    - Gold: {percentages["gold"]:.1f}%
    - Fixed Deposits: {percentages["fixedDeposit"]:.1f}%
    - Bonds: {percentages["bonds"]:.1f}%
    - Mutual Funds: {percentages["mutualFunds"]:.1f}%
    
    Total portfolio value: ₹{portfolio.totalValue}
    
    Additional context:
    {user_data}
    
    Only return a response in JSON format with keys: risk_score and reason . Be verbose in your reason please and incorporate all of your financial knowledge. Also do NOT HALLUCINATE
    '''
    
    raw_response = my_llm.get_response(prompt)
    print(raw_response)
    
    # Parse the LLM response
    response_data = extract_json_from_text(raw_response)
    
    if response_data and 'risk_score' in response_data and 'reason' in response_data:
        risk_score = float(response_data['risk_score'])
        reason = response_data['reason']
    else:
        # Fallback if parsing fails - generate a score based on asset allocation
        # Higher equity (stocks+mutual funds) generally means higher risk
        equity_percentage = percentages["stocks"] + percentages["mutualFunds"]
        bond_percentage = percentages["bonds"]
        safe_assets = percentages["fixedDeposit"] + percentages["gold"]
        
        # Simple formula: more equity = higher risk, more safe assets = lower risk
        risk_score = min(10, max(1, (equity_percentage * 0.1) + (bond_percentage * 0.05) - (safe_assets * 0.02) + 3))
        reason = "Based on your portfolio allocation, particularly the balance between equity and safer assets."
    
    return {
        "riskScore": round(risk_score, 1),
        "message": reason
    }

if __name__ == "__main__":
    print("Starting Risk Assessment Python Server on http://localhost:8080")
    my_llm = LLMProcessor()
    uvicorn.run(app, host="0.0.0.0", port=8080)
