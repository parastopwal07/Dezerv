from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random
import time
import uvicorn

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

@app.get("/api/risk-assessment")
async def get_risk_assessment():
    # Simulate processing time (like an LLM thinking)
    time.sleep(1.5)
    
    # Generate a random risk score between 1 and 10
    risk_score = random.uniform(1.0, 10.0)
    
    # Return a JSON response with the risk score
    return {
        "riskScore": round(risk_score, 1),
        "message": "Risk assessment completed successfully with Python backend"
    }

if __name__ == "__main__":
    print("Starting Risk Assessment Python Server on http://localhost:5000")
    uvicorn.run(app, host="0.0.0.0", port=8080)
