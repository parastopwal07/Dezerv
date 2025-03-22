import React, { useState, useEffect } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setRiskProfile } from '../store/slices/riskProfileSlice';
import { getLLMRiskAssessment, getAllocationFromRiskScore } from '../utils/llmService';
import * as HistoricalService from '../utils/historicalDataService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Annual growth rates for different asset classes
const DEFAULT_GROWTH_RATES = {
  stocks: 0.12, // 12% annual return
  gold: 0.08,   // 8% annual return
  fd: 0.06,     // 6% annual return
  bonds: 0.07,  // 7% annual return
  mutualFunds: 0.10 // 10% annual return
};

// Update colors for the dark theme
const DARK_THEME_COLORS = [
  'rgb(99, 102, 241)', // Indigo
  'rgb(234, 179, 8)',  // Yellow/Gold
  'rgb(34, 197, 94)',  // Green
  'rgb(168, 85, 247)', // Purple
  'rgb(239, 68, 68)'   // Red
];

interface AllocationSlider {
  label: string;
  key: keyof typeof DEFAULT_GROWTH_RATES;
  value: number;
  color: string;
}

// Time range selector component
const TimeRangeSelector: React.FC<{ 
  value: number, 
  onChange: (value: number) => void, 
  options?: number[] 
}> = ({ 
  value, 
  onChange, 
  options = [0.5, 1, 5, 10] 
}) => {
  return (
    <div className="flex bg-gray-900 p-1 rounded-lg shadow-inner border border-gray-800">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            value === option 
              ? 'bg-indigo-600 text-white shadow-lg transform scale-105' 
              : 'bg-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800'
          }`}
        >
          {option === 0.5 ? '6m' : `${option}y`}
        </button>
      ))}
    </div>
  );
};

const PortfolioAllocation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const recalculated = location.state?.recalculated || false;
  const dispatch = useDispatch();
  const riskProfile = useSelector((state: RootState) => state.riskProfile.currentProfile);
  const portfolio = useSelector((state: RootState) => state.portfolio.currentPortfolio);
  
  const [allocation, setAllocation] = useState<AllocationSlider[]>([
    { label: 'Stocks', key: 'stocks', value: 0, color: DARK_THEME_COLORS[0] },
    { label: 'Gold', key: 'gold', value: 0, color: DARK_THEME_COLORS[1] },
    { label: 'Fixed Deposits', key: 'fd', value: 0, color: DARK_THEME_COLORS[2] },
    { label: 'Bonds', key: 'bonds', value: 0, color: DARK_THEME_COLORS[3] },
    { label: 'Mutual Funds', key: 'mutualFunds', value: 0, color: DARK_THEME_COLORS[4] }
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
  
  // Add state for historical performance data
  const [historicalReturns, setHistoricalReturns] = useState<HistoricalService.HistoricalReturn[]>([]);
  const [annualizedReturn, setAnnualizedReturn] = useState<number>(0);
  const [volatility, setVolatility] = useState<number>(0);

  // Add time range state variables
  const [projectionTimeRange, setProjectionTimeRange] = useState<number>(10);
  const [historicalTimeRange, setHistoricalTimeRange] = useState<number>(5);

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
      
      // Normalize to ensure sum is 100%
      const total = newAllocation.reduce((sum, item) => sum + item.value, 0);
      if (Math.abs(total - 100) > 0.1) {
        const scaleFactor = 100 / total;
        newAllocation.forEach(item => {
          item.value = Math.round(item.value * scaleFactor * 10) / 10;
        });
      }
      
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
    
    // Normalize to ensure sum is 100%
    const total = newAllocation.reduce((sum, item) => sum + item.value, 0);
    if (Math.abs(total - 100) > 0.1) {
      const scaleFactor = 100 / total;
      newAllocation.forEach(item => {
        item.value = Math.round(item.value * scaleFactor * 10) / 10;
      });
    }
    
    setAllocation(newAllocation);
  };

  const calculateProjectedGrowth = () => {
    const yearCount = projectionTimeRange;
    const years = Array.from({ length: yearCount + 1 }, (_, i) => i);
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

  // Update the chart options for dark theme
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#f3f4f6', // Light text for dark background
          boxWidth: 12,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.raw as number;
            return `${context.label}: ${value.toFixed(1)}%`;
          }
        },
        backgroundColor: '#333',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#555',
        borderWidth: 1
      }
    }
  };

  // Line chart options
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#f3f4f6'
        }
      },
      title: {
        display: true,
        text: 'Portfolio Value Projection',
        color: '#f3f4f6'
      },
      tooltip: {
        backgroundColor: '#333',
        titleColor: '#fff',
        bodyColor: '#fff'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => `₹${value.toLocaleString()}`,
          color: '#9ca3af'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      x: {
        ticks: {
          color: '#9ca3af'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  };

  // Calculate historical returns when allocation changes
  useEffect(() => {
    // Only calculate if we have a valid allocation
    const totalAllocation = allocation.reduce((sum, item) => sum + item.value, 0);
    if (totalAllocation > 0) {
      const fetchData = async () => {
        try {
          const returns = await HistoricalService.calculateHistoricalReturns(allocation, initialInvestment);
          setHistoricalReturns(returns);
          setAnnualizedReturn(HistoricalService.calculateAnnualizedReturn(returns));
          setVolatility(HistoricalService.calculateVolatility(returns));
        } catch (error) {
          console.error("Error calculating historical returns:", error);
        }
      };
      
      fetchData();
    }
  }, [allocation, initialInvestment]);

  // Configuration for historical chart
  const historicalChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#f3f4f6'
        }
      },
      title: {
        display: true,
        text: 'Historical Portfolio Performance',
        color: '#f3f4f6'
      },
      tooltip: {
        backgroundColor: '#333',
        titleColor: '#fff',
        bodyColor: '#fff',
        callbacks: {
          label: function(context: any) {
            return `Return: ${context.raw.toFixed(2)}%`;
          }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: (value: any) => `${value.toFixed(2)}%`,
          color: '#9ca3af'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      x: {
        ticks: {
          maxRotation: 90,
          minRotation: 45,
          color: '#9ca3af'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  };

  // Format historical data for chart
  const getHistoricalChartData = () => {
    // Calculate how many months to include based on selected time range
    const monthsToInclude = Math.round(historicalTimeRange * 12);
    
    // Get the most recent n months of data
    let dataToShow = [...historicalReturns];
    if (dataToShow.length > monthsToInclude) {
      dataToShow = dataToShow.slice(-monthsToInclude);
    }
    
    // Display frequency based on time range to avoid overcrowding
    const stepSize = historicalTimeRange <= 1 ? 1 : (historicalTimeRange <= 3 ? 2 : 3);
    const filteredReturns = dataToShow.filter((_, index) => index % stepSize === 0 || index === dataToShow.length - 1);
    
    // Calculate percentage returns instead of absolute values
    const initialValue = filteredReturns[0]?.value || initialInvestment;
    
    return {
      labels: filteredReturns.map(item => item.month),
      datasets: [{
        label: 'Return (%)',
        data: filteredReturns.map(item => ((item.value - initialValue) / initialValue) * 100),
        borderColor: 'rgb(129, 140, 248)',
        backgroundColor: 'rgba(129, 140, 248, 0.1)',
        fill: true
      }]
    };
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-indigo-300">Portfolio Allocation</h2>
      
      {/* Add a notification for recalculation */}
      {recalculated && (
        <div className="bg-indigo-900 border-l-4 border-indigo-500 text-indigo-100 p-4 mb-6">
          <p className="font-bold">Profile Updated</p>
          <p>Your risk profile has been recalculated and your portfolio allocation has been updated.</p>
        </div>
      )}
      
      {/* Add a notification for imported portfolio */}
      {showImportedPortfolio && (
        <div className="bg-indigo-900 border-l-4 border-indigo-500 text-indigo-100 p-4 mb-6">
          <p className="font-bold">Portfolio Imported</p>
          <p>Your portfolio has been successfully imported. We've used your current asset allocation as a starting point.</p>
          <p className="mt-2">Total Portfolio Value: ₹{portfolio?.data.totalValue.toLocaleString()}</p>
        </div>
      )}
      
      {/* Python Backend Status */}
      {!isPythonConnected && (
        <div className="bg-yellow-900 border-l-4 border-yellow-500 text-yellow-100 p-4 mb-6">
          <p className="font-bold">Backend Connection Issue</p>
          <p>Could not connect to the Python AI service. Make sure the Python server is running at http://localhost:5000</p>
          <p className="text-sm mt-2">Run the Python server with: <code className="bg-gray-800 px-2 py-1 rounded">python python_service/risk_assessment_server.py</code></p>
        </div>
      )}
      
      {/* LLM Analysis Message */}
      {llmMessage && (
        <div className="bg-indigo-900 border-l-4 border-indigo-500 text-indigo-100 p-4 mb-6">
          <p className="font-bold">{isLoading ? 'AI Analysis in Progress' : 'AI Analysis Complete'}</p>
          <p>{llmMessage}</p>
          {isLoading && (
            <div className="mt-2 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-300 mr-2"></div>
              <span>Processing...</span>
            </div>
          )}
        </div>
      )}
      
      {/* Risk Score Display */}
      <div className="dark-card p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4 text-indigo-300">Your Risk Profile</h3>
        
        {/* Update Mode Buttons */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={handleAutoUpdate}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md transition ${
              isLoading 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : isAutoUpdate 
                  ? 'accent-button' 
                  : 'secondary-button'
            }`}
          >
            {isLoading ? 'Analyzing...' : 'Auto Update'}
          </button>
          <button
            onClick={handleManualUpdate}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md transition ${
              isLoading
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : !isAutoUpdate 
                  ? 'accent-button' 
                  : 'secondary-button'
            }`}
          >
            Manual Update
          </button>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-300">Risk Tolerance</span>
            <span className="text-sm font-medium text-gray-200">{riskScore.toFixed(1)}/10</span>
          </div>
          
          <div className="relative h-12 mb-2">
            {/* Background gradient for the slider */}
            <div 
              className="absolute top-4 left-0 h-4 w-full rounded-full overflow-hidden"
              style={{
                background: 'linear-gradient(to right, #10B981 0%, #F59E0B 50%, #EF4444 100%)'
              }}
            ></div>
            
            {/* Custom marker showing current position */}
            <div 
              className="absolute top-1 z-20 transform -translate-x-1/2"
              style={{ 
                left: `${((riskScore - 1) / 9) * 100}%`,
                transition: 'left 0.3s ease-out'
              }}
            >
              <div className="flex flex-col items-center">
                <div className="bg-white w-2 h-10 rounded-full shadow-lg"></div>
                <div className="bg-white text-gray-800 font-bold text-xs rounded-full w-6 h-6 flex items-center justify-center mt-1 shadow-lg">
                  {riskScore.toFixed(1)}
                </div>
              </div>
            </div>
            
            {/* The actual slider input */}
            <input
              type="range"
              min="1"
              max="10"
              step="0.1"
              value={riskScore}
              onChange={(e) => handleRiskSliderChange(parseFloat(e.target.value))}
              className="absolute top-4 w-full h-4 appearance-none bg-transparent rounded-full cursor-pointer z-10 opacity-0"
              disabled={isAutoUpdate}
            />
          </div>
          
          <div className="flex justify-between mt-4 text-xs text-gray-400">
            <span className="flex flex-col items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mb-1"></span>
              Conservative
            </span>
            <span className="flex flex-col items-center">
              <span className="w-2 h-2 rounded-full bg-yellow-500 mb-1"></span>
              Moderate
            </span>
            <span className="flex flex-col items-center">
              <span className="w-2 h-2 rounded-full bg-red-500 mb-1"></span>
              Aggressive
            </span>
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="font-bold text-lg text-indigo-300">{getRiskCategory(riskScore)} Investor</h4>
          <p className="text-gray-300">
            {riskScore <= 3 
              ? 'Focus on capital preservation with minimal risk. Suitable for short-term goals.'
              : riskScore <= 6 
                ? 'Balanced approach with moderate risk for steady growth. Suitable for medium-term goals.'
                : 'Growth-oriented strategy with higher risk for potentially higher returns. Suitable for long-term goals.'
            }
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-opacity-20 bg-green-800 p-2 rounded border border-green-700">
            <p className="font-medium text-green-400">Conservative</p>
            <p className="text-sm text-gray-300">1-3</p>
          </div>
          <div className="bg-opacity-20 bg-yellow-800 p-2 rounded border border-yellow-700">
            <p className="font-medium text-yellow-400">Moderate</p>
            <p className="text-sm text-gray-300">4-6</p>
          </div>
          <div className="bg-opacity-20 bg-red-800 p-2 rounded border border-red-700">
            <p className="font-medium text-red-400">Aggressive</p>
            <p className="text-sm text-gray-300">7-10</p>
          </div>
        </div>
      </div>
      
      <div className="dark-card p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4 text-indigo-300">Customize Your Allocation</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {allocation.map((asset) => (
              <div key={asset.key} className="mb-4">
                <div className="flex justify-between mb-2">
                  <label className="font-medium text-gray-200">{asset.label}</label>
                  <span className="text-gray-300">{asset.value.toFixed(1)}%</span>
                </div>
                <div className="w-full h-3 progress-bar-bg rounded-full overflow-hidden">
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
              <label className="block font-medium mb-2 text-gray-200">Initial Investment (₹)</label>
              <input
                type="number"
                value={initialInvestment}
                onChange={(e) => setInitialInvestment(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center">
            <h4 className="text-md font-medium mb-4 text-indigo-300">Asset Allocation</h4>
            <div className="w-full max-w-xs">
              <Pie 
                data={{
                  labels: allocation.map(a => a.label),
                  datasets: [
                    {
                      data: allocation.map(a => a.value),
                      backgroundColor: allocation.map(a => a.color),
                      borderWidth: 1,
                      borderColor: '#242424'
                    }
                  ]
                }}
                options={chartOptions}
              />
            </div>
            <p className="text-sm text-gray-400 mt-4">
              Total: {
                (() => {
                  const total = allocation.reduce((sum, item) => sum + item.value, 0);
                  return (total > 100) ? "100.0" : total.toFixed(1);
                })()
              }%
            </p>
          </div>
        </div>
      </div>

      {/* Add Historical Performance Card before Projected Growth */}
      <div className="dark-card p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-lg font-semibold text-indigo-300">Historical Performance</h3>
          <div className="flex flex-col items-end">
            <span className="text-sm text-gray-400 mb-2">Select Time Range</span>
            <TimeRangeSelector 
              value={historicalTimeRange} 
              onChange={setHistoricalTimeRange} 
            />
          </div>
        </div>
        
        {historicalReturns.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-[#1e1e1e] border border-[#333333] p-4 rounded">
                <h4 className="text-sm font-medium text-gray-400">Initial Investment</h4>
                <p className="text-xl font-bold text-white">₹{initialInvestment.toLocaleString()}</p>
              </div>
              
              <div className="bg-[#1e1e1e] border border-[#333333] p-4 rounded">
                <h4 className="text-sm font-medium text-gray-400">Annualized Return</h4>
                <p className={`text-xl font-bold ${annualizedReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {annualizedReturn.toFixed(2)}%
                </p>
              </div>
              
              <div className="bg-[#1e1e1e] border border-[#333333] p-4 rounded">
                <h4 className="text-sm font-medium text-gray-400">Volatility</h4>
                <p className="text-xl font-bold text-amber-400">
                  {volatility.toFixed(2)}%
                </p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-4">
              This chart shows how your current allocation would have performed over the past {historicalTimeRange === 0.5 ? '6 months' : `${historicalTimeRange} years`} based on historical market data.
            </p>
            
            <Line
              data={getHistoricalChartData()}
              options={historicalChartOptions}
            />
            
            <p className="text-xs text-gray-400 mt-4">
              Note: Past performance is not indicative of future results. This simulation is based on historical data and your current allocation strategy.
            </p>
          </>
        ) : (
          <div className="flex justify-center items-center h-64 bg-[#1a1a1a] rounded-lg">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-300 mr-2"></div>
            <p className="text-gray-400">Calculating historical performance...</p>
          </div>
        )}
      </div>
      
      <div className="dark-card p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-lg font-semibold text-indigo-300">Projected Growth Over Time</h3>
          <div className="flex flex-col items-end">
            <span className="text-sm text-gray-400 mb-2">Select Time Range</span>
            <TimeRangeSelector 
              value={projectionTimeRange} 
              onChange={setProjectionTimeRange} 
            />
          </div>
        </div>
        <Line
          data={calculateProjectedGrowth()}
          options={lineChartOptions}
        />
      </div>
    </div>
  );
};

export default PortfolioAllocation;
