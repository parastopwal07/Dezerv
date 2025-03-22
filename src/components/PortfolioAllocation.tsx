import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setRiskProfile } from '../store/slices/riskProfileSlice';
import { getLLMRiskAssessment, getAllocationFromRiskScore } from '../utils/llmService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Annual growth rates for different asset classes
const DEFAULT_GROWTH_RATES = {
  stocks: 0.12, // 12% annual return
  gold: 0.08,   // 8% annual return
  fd: 0.06,     // 6% annual return
  bonds: 0.07,  // 7% annual return
  mutualFunds: 0.10 // 10% annual return
};

interface AllocationSlider {
  label: string;
  key: keyof typeof DEFAULT_GROWTH_RATES;
  value: number;
  color: string;
}

const PortfolioAllocation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const recalculated = location.state?.recalculated || false;
  const dispatch = useDispatch();
  const riskProfile = useSelector((state: RootState) => state.riskProfile.currentProfile);
  const portfolio = useSelector((state: RootState) => state.portfolio.currentPortfolio);
  
  const [allocation, setAllocation] = useState<AllocationSlider[]>([
    { label: 'Stocks', key: 'stocks', value: 0, color: 'rgb(59, 130, 246)' },
    { label: 'Gold', key: 'gold', value: 0, color: 'rgb(234, 179, 8)' },
    { label: 'Fixed Deposits', key: 'fd', value: 0, color: 'rgb(34, 197, 94)' },
    { label: 'Bonds', key: 'bonds', value: 0, color: 'rgb(168, 85, 247)' },
    { label: 'Mutual Funds', key: 'mutualFunds', value: 0, color: 'rgb(239, 68, 68)' }
  ]);
  const [growthRates] = useState(DEFAULT_GROWTH_RATES);
  const [initialInvestment, setInitialInvestment] = useState(100000);
  const [years] = useState(10);
  const [riskScore, setRiskScore] = useState(0);
  const [isAutoUpdate, setIsAutoUpdate] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [llmMessage, setLlmMessage] = useState('');
  const [isPythonConnected, setIsPythonConnected] = useState(true);
  const [showImportedPortfolio, setShowImportedPortfolio] = useState(false);

  useEffect(() => {
    // Check if there's a portfolio risk message in localStorage
    const portfolioRiskMessage = localStorage.getItem('portfolioRiskMessage');
    if (portfolioRiskMessage) {
      setLlmMessage(portfolioRiskMessage);
      localStorage.removeItem('portfolioRiskMessage'); // Clear it after reading
    }
    
    // Calculate risk score (simplified implementation)
    const calculateRiskScore = () => {
      // This is a simplified version just to display the score
      // In a real implementation, you would use the full calculation from your Python code
      const defaultScore = riskProfile?.riskScore || 5.5;
      setRiskScore(defaultScore);
    };
    
    calculateRiskScore();
    
    // Only apply automatic allocation updates if auto update is enabled
    if (isAutoUpdate && riskProfile?.allocationStrategy) {
      updateAllocationFromProfile();
    }
    
    // Set initial investment amount from portfolio if available
    if (portfolio?.data?.totalValue) {
      setInitialInvestment(portfolio.data.totalValue);
      
      // Check if we've come from portfolio import
      const hasImportedData = portfolio.data.assets && portfolio.data.assets.length > 0;
      if (hasImportedData) {
        setShowImportedPortfolio(true);
        
        // Map imported portfolio data to allocation structure
        const newAllocation = [...allocation];
        portfolio.data.assets.forEach(asset => {
          const percentage = (asset.value / portfolio.data.totalValue) * 100;
          
          if (asset.type === 'Stocks') {
            newAllocation[0].value = percentage;
          } else if (asset.type === 'Gold') {
            newAllocation[1].value = percentage;
          } else if (asset.type === 'Fixed Deposit') {
            newAllocation[2].value = percentage;
          } else if (asset.type === 'Bonds') {
            newAllocation[3].value = percentage;
          } else if (asset.type === 'Mutual Funds') {
            newAllocation[4].value = percentage;
          }
        });
        
        setAllocation(newAllocation);
      }
    }
    
    // If returning from a recalculation, show a notification
    if (recalculated) {
      // You could display a success toast or notification here
      console.log('Risk profile successfully recalculated!');
    }
  }, [riskProfile, isAutoUpdate, recalculated, portfolio]);

  // Function to update allocation based on risk profile
  const updateAllocationFromProfile = () => {
    if (riskProfile?.allocationStrategy) {
      const newAllocation = [...allocation];
      newAllocation[0].value = riskProfile.allocationStrategy.equities * 0.75; // 75% of equities to stocks
      newAllocation[1].value = riskProfile.allocationStrategy.commodities;
      newAllocation[2].value = riskProfile.allocationStrategy.cash;
      newAllocation[3].value = riskProfile.allocationStrategy.bonds;
      newAllocation[4].value = riskProfile.allocationStrategy.equities * 0.25; // 25% of equities to mutual funds
      setAllocation(newAllocation);
    }
  };

  // Function to handle Auto Update button click
  const handleAutoUpdate = async () => {
    setIsLoading(true);
    setLlmMessage('Analyzing market conditions and your portfolio with AI...');
    
    try {
      // Call the Python backend to get a new risk score and message
      const { riskScore: newRiskScore, message } = await getLLMRiskAssessment(riskScore);
      setLlmMessage(message); // Use the message returned from the backend
      setIsPythonConnected(true);
      
      // Update the risk score state
      setRiskScore(newRiskScore);
      
      // Update the risk profile in the Redux store
      if (riskProfile) {
        dispatch(
          setRiskProfile({
            ...riskProfile,
            riskScore: newRiskScore,
            allocationStrategy: getAllocationFromRiskScore(newRiskScore),
          })
        );
      }
      
      setIsAutoUpdate(true);
      
      const newAllocationStrategy = getAllocationFromRiskScore(newRiskScore);
      const newAllocation = [...allocation];
      newAllocation[0].value = newAllocationStrategy.equities * 0.75;
      newAllocation[1].value = newAllocationStrategy.commodities;
      newAllocation[2].value = newAllocationStrategy.cash;
      newAllocation[3].value = newAllocationStrategy.bonds;
      newAllocation[4].value = newAllocationStrategy.equities * 0.25;
      setAllocation(newAllocation);
    } catch (error) {
      console.error('Error updating risk profile:', error);
      setLlmMessage('An error occurred while connecting to our AI service. Using fallback calculation instead.');
      setIsPythonConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle Manual Update button click
  const handleManualUpdate = () => {
    setIsAutoUpdate(false);
    
    // Store current state in localStorage before navigating
    localStorage.setItem('manualUpdateMode', 'true');
    
    // Navigate to risk assessment
    navigate('/risk-assessment');
  };

  const handleSliderChange = (index: number, value: number) => {
    const newAllocation = [...allocation];
    const oldValue = newAllocation[index].value;
    const difference = value - oldValue;
    
    // Adjust other allocations proportionally
    const totalOthers = newAllocation.reduce((sum, item, i) => 
      i !== index ? sum + item.value : sum, 0
    );
    
    newAllocation.forEach((item, i) => {
      if (i === index) {
        item.value = value;
      } else if (totalOthers > 0) {
        item.value = Math.max(0, item.value - (difference * (item.value / totalOthers)));
      }
    });
    
    setAllocation(newAllocation);
  };

  const calculateProjectedGrowth = () => {
    const years = Array.from({ length: 11 }, (_, i) => i);
    const projectedValues = years.map(year => {
      let totalValue = initialInvestment;
      allocation.forEach(asset => {
        const assetAmount = initialInvestment * (asset.value / 100);
        const growthRate = growthRates[asset.key];
        totalValue += assetAmount * (Math.pow(1 + growthRate, year) - 1);
      });
      return Math.round(totalValue);
    });

    return {
      labels: years,
      datasets: [{
        label: 'Portfolio Value',
        data: projectedValues,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true
      }]
    };
  };

  // Function to get risk category based on score
  const getRiskCategory = (score: number) => {
    if (score <= 3) return 'Conservative';
    if (score <= 6) return 'Moderate';
    return 'Aggressive';
  };

  // Function to get color for risk score display
  const getRiskScoreColor = (score: number) => {
    if (score <= 3) return 'bg-green-500';
    if (score <= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Add a function to handle risk slider change
  const handleRiskSliderChange = (newScore: number) => {
    console.log("Risk score changed to:", newScore);
    setRiskScore(newScore);
    
    // Set to manual mode when user directly adjusts risk
    setIsAutoUpdate(false);
    
    // Generate a new allocation based on risk score
    const conservativeAllocation = { stocks: 20, gold: 15, fd: 40, bonds: 20, mutualFunds: 5 };
    const moderateAllocation = { stocks: 40, gold: 10, fd: 20, bonds: 15, mutualFunds: 15 };
    const aggressiveAllocation = { stocks: 60, gold: 5, fd: 5, bonds: 10, mutualFunds: 20 };
    
    // Apply gradient transitions between allocation profiles based on score position
    const newAllocation = [...allocation];
    
    if (newScore <= 3) {
      // Gradient between min risk (1) and max conservative (3)
      const factor = (newScore - 1) / 2; // 0 to 1 scale within conservative range
      const minRiskAllocation = { stocks: 10, gold: 20, fd: 50, bonds: 20, mutualFunds: 0 };
      
      Object.keys(minRiskAllocation).forEach((key, index) => {
        if (index < newAllocation.length) {
          const minValue = minRiskAllocation[key as keyof typeof minRiskAllocation];
          const maxValue = conservativeAllocation[key as keyof typeof conservativeAllocation];
          newAllocation[index].value = minValue + factor * (maxValue - minValue);
        }
      });
    } else if (newScore <= 6) {
      // Gradient between conservative (3) and moderate (6)
      const factor = (newScore - 3) / 3; // 0 to 1 scale within moderate range
      
      Object.keys(conservativeAllocation).forEach((key, index) => {
        if (index < newAllocation.length) {
          const minValue = conservativeAllocation[key as keyof typeof conservativeAllocation];
          const maxValue = moderateAllocation[key as keyof typeof moderateAllocation];
          newAllocation[index].value = minValue + factor * (maxValue - minValue);
        }
      });
    } else {
      // Gradient between moderate (6) and aggressive (10)
      const factor = (newScore - 6) / 4; // 0 to 1 scale within aggressive range
      
      Object.keys(moderateAllocation).forEach((key, index) => {
        if (index < newAllocation.length) {
          const minValue = moderateAllocation[key as keyof typeof moderateAllocation];
          const maxValue = aggressiveAllocation[key as keyof typeof aggressiveAllocation];
          newAllocation[index].value = minValue + factor * (maxValue - minValue);
        }
      });
    }
    
    // Ensure values are rounded to 1 decimal place for display
    newAllocation.forEach(item => {
      item.value = Math.round(item.value * 10) / 10;
    });
    
    setAllocation(newAllocation);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Portfolio Allocation</h2>
      
      {/* Add a notification for recalculation */}
      {recalculated && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
          <p className="font-bold">Profile Updated</p>
          <p>Your risk profile has been recalculated and your portfolio allocation has been updated.</p>
        </div>
      )}
      
      {/* Add a notification for imported portfolio */}
      {showImportedPortfolio && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6">
          <p className="font-bold">Portfolio Imported</p>
          <p>Your portfolio has been successfully imported. We've used your current asset allocation as a starting point.</p>
          <p className="mt-2">Total Portfolio Value: ₹{portfolio?.data.totalValue.toLocaleString()}</p>
        </div>
      )}
      
      {/* Python Backend Status */}
      {!isPythonConnected && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p className="font-bold">Backend Connection Issue</p>
          <p>Could not connect to the Python AI service. Make sure the Python server is running at http://localhost:5000</p>
          <p className="text-sm mt-2">Run the Python server with: <code className="bg-gray-200 px-2 py-1 rounded">python python_service/risk_assessment_server.py</code></p>
        </div>
      )}
      
      {/* LLM Analysis Message */}
      {llmMessage && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6">
          <p className="font-bold">{isLoading ? 'AI Analysis in Progress' : 'AI Analysis Complete'}</p>
          <p>{llmMessage}</p>
          {isLoading && (
            <div className="mt-2 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
              <span>Processing...</span>
            </div>
          )}
        </div>
      )}
      
      {/* Risk Score Display */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Your Risk Profile</h3>
        
        {/* Update Mode Buttons */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={handleAutoUpdate}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md ${
              isLoading 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : isAutoUpdate 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
            }`}
          >
            {isLoading ? 'Analyzing...' : 'Auto Update'}
          </button>
          <button
            onClick={handleManualUpdate}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md ${
              isLoading
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : !isAutoUpdate 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
            }`}
          >
            Manual Update
          </button>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-600">Risk Tolerance</span>
            <span className="text-sm font-medium">{riskScore.toFixed(1)}/10</span>
          </div>
          
          <div className="relative">
            <div 
              className="absolute top-0 left-0 h-4 rounded-full pointer-events-none"
              style={{
                width: '100%',
                background: `linear-gradient(to right, 
                  #10B981 0%, #10B981 30%,
                  #F59E0B 30%, #F59E0B 60%,
                  #EF4444 60%, #EF4444 100%)`
              }}
            ></div>
            <input
              type="range"
              min="1"
              max="10"
              step="0.1"
              value={riskScore}
              onChange={(e) => handleRiskSliderChange(parseFloat(e.target.value))}
              className="w-full h-4 appearance-none bg-transparent rounded-full cursor-pointer relative z-10"
              disabled={isAutoUpdate}
            />
          </div>
          
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>Conservative</span>
            <span>Moderate</span>
            <span>Aggressive</span>
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="font-bold text-lg">{getRiskCategory(riskScore)} Investor</h4>
          <p className="text-gray-700">
            {riskScore <= 3 
              ? 'Focus on capital preservation with minimal risk. Suitable for short-term goals.'
              : riskScore <= 6 
                ? 'Balanced approach with moderate risk for steady growth. Suitable for medium-term goals.'
                : 'Growth-oriented strategy with higher risk for potentially higher returns. Suitable for long-term goals.'
            }
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-green-100 p-2 rounded">
            <p className="font-medium">Conservative</p>
            <p className="text-sm text-gray-600">1-3</p>
          </div>
          <div className="bg-yellow-100 p-2 rounded">
            <p className="font-medium">Moderate</p>
            <p className="text-sm text-gray-600">4-6</p>
          </div>
          <div className="bg-red-100 p-2 rounded">
            <p className="font-medium">Aggressive</p>
            <p className="text-sm text-gray-600">7-10</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Customize Your Allocation</h3>
        
        {allocation.map((asset, index) => (
          <div key={asset.key} className="mb-4">
            <div className="flex justify-between mb-2">
              <label className="font-medium">{asset.label}</label>
              <span className="text-gray-600">{asset.value.toFixed(1)}%</span>
            </div>
            <div 
              className="w-full h-3 bg-gray-200 rounded-full overflow-hidden"
            >
              <div 
                className="h-full rounded-full" 
                style={{
                  width: `${asset.value}%`,
                  backgroundColor: asset.color
                }}
              ></div>
            </div>
          </div>
        ))}

        <div className="mt-6">
          <label className="block font-medium mb-2">Initial Investment (₹)</label>
          <input
            type="number"
            value={initialInvestment}
            onChange={(e) => setInitialInvestment(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Projected Growth Over Time</h3>
        <Line
          data={calculateProjectedGrowth()}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top' as const,
              },
              title: {
                display: true,
                text: 'Portfolio Value Projection'
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: (value) => `₹${value.toLocaleString()}`
                }
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default PortfolioAllocation;
