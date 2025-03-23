from fastapi import FastAPI, Query, Body
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel
from llm_processor2 import RAGSystem , LLMProcessor

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG System
rag = RAGSystem()
rag.build_index()

# LLM Processor
my_llm = LLMProcessor()

# Extract JSON from LLM text response
def extract_json_from_text(text):
    """Extract JSON from LLM response using regex."""
    import re, json
    json_match = re.search(r'({.*})', text, re.DOTALL)
    if json_match:
        json_str = json_match.group(1)
        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            return None
    return None


# Define Portfolio Data Model
class PortfolioData(BaseModel):
    stocks: float
    gold: float
    fixedDeposit: float
    bonds: float
    mutualFunds: float
    totalValue: float


@app.get("/api/risk-assessment")
async def get_risk_assessment(risk_score: float = Query(None)):
    """Risk assessment endpoint with RAG context retrieval."""

    # Retrieve context from RAG
    query = "Financial behavior, spending, and risk factors"
    retrieved_docs = rag.retrieve(query, top_k=3)

    context = "\n\n".join([str(doc) for doc in retrieved_docs])

    prompt = f'''
    Pretend you are a financial advisor robot. Based on the user's financial history below, 
    rate their risk-taking capability on a scale of 1 to 10, with 1 decimal point precision.
    
    Context from NoSQL database:
    {context}

    Current risk score: {risk_score}

    Only return JSON format with keys: risk_score and reason. Be verbose and incorporate all financial knowledge and be human. 
    Do NOT hallucinate. Consider personal/emotional factors like family loss affecting risk-taking behavior.
    '''

    # Get LLM response
    raw_response = my_llm.get_response(prompt)
    print(raw_response)

    # Parse response
    response_data = extract_json_from_text(raw_response)

    if response_data and 'risk_score' in response_data and 'reason' in response_data:
        new_risk_score = float(response_data['risk_score'])
        reason = response_data['reason']
    else:
        new_risk_score = risk_score or 5.0  # Default score
        reason = "Unable to process risk assessment"

    return {
        "riskScore": round(new_risk_score, 1),
        "message": reason
    }


@app.post("/api/portfolio-risk-assessment")
async def analyze_portfolio(portfolio: PortfolioData):
    """Portfolio analysis endpoint using RAG-enhanced LLM."""

    # Retrieve RAG context
    query = "Portfolio investment, risk management, financial advice"
    retrieved_docs = rag.retrieve_context(query, top_k=3)

    context = "\n\n".join([str(doc) for doc in retrieved_docs])

    # Calculate percentages
    total = portfolio.totalValue
    percentages = {
        "stocks": (portfolio.stocks / total) * 100 if total > 0 else 0,
        "gold": (portfolio.gold / total) * 100 if total > 0 else 0,
        "fixedDeposit": (portfolio.fixedDeposit / total) * 100 if total > 0 else 0,
        "bonds": (portfolio.bonds / total) * 100 if total > 0 else 0,
        "mutualFunds": (portfolio.mutualFunds / total) * 100 if total > 0 else 0
    }

    prompt = f'''
    Pretend you are a financial advisor robot. Based on the portfolio allocation below and the financial history context, 
    assess the risk level of this portfolio on a scale of 1 to 10, with 1 decimal point precision.

    Portfolio:
    - Stocks: {percentages["stocks"]:.1f}%
    - Gold: {percentages["gold"]:.1f}%
    - Fixed Deposits: {percentages["fixedDeposit"]:.1f}%
    - Bonds: {percentages["bonds"]:.1f}%
    - Mutual Funds: {percentages["mutualFunds"]:.1f}%

    Context from NoSQL:
    {context}

    Only return JSON format with keys: risk_score and reason. Be verbose and accurate.
    '''

    # Get LLM response
    raw_response = my_llm.get_response(prompt)
    print(raw_response)

    # Parse response
    response_data = extract_json_from_text(raw_response)

    if response_data and 'risk_score' in response_data and 'reason' in response_data:
        risk_score = float(response_data['risk_score'])
        reason = response_data['reason']
    else:
        risk_score = 5.0
        reason = "Fallback risk assessment"

    return {
        "riskScore": round(risk_score, 1),
        "message": reason
    }


if __name__ == "__main__":
    print("Starting FastAPI Server on http://localhost:8080")
    uvicorn.run(app, host="0.0.0.0", port=8080)
