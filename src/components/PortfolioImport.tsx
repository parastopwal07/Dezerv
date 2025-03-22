import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PortfolioGraph from './PortfolioGraph.tsx';
import { setPortfolio } from '../store/slices/portfolioSlice';
import { getPortfolioRiskAssessment } from '../utils/llmService';
import { setRiskProfile } from '../store/slices/riskProfileSlice';
import { RootState } from '../store';
import { DollarSign, CreditCard, Upload } from 'lucide-react';

const PortfolioImport: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const portfolio = useSelector((state: RootState) => state.portfolio.currentPortfolio);
  
  const [activeTab, setActiveTab] = useState('platforms');
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [platformFormData, setFormData] = useState({ clientId: '', panNumber: '' });
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [customFormData, setCustomFormData] = useState({
    Stocks: 0,
    Gold: 0,
    'Fixed Deposit': 0,
    Bonds: 0,
    'Mutual Funds': 0
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Add state to store risk assessment result
  const [riskAssessment, setRiskAssessment] = useState<{
    riskScore: number;
    message: string;
  } | null>(null);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedPlatform(null);
  };

  const handlePlatformSelect = (platform: string) => {
    setSelectedPlatform(platform);
  };

  const handlePlatformInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...platformFormData, [e.target.name]: e.target.value });
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const assetKey = id === 'fd' ? 'Fixed Deposit' : 
                     id === 'mf' ? 'Mutual Funds' : 
                     id === 'stocks' ? 'Stocks' :
                     id === 'gold' ? 'Gold' :
                     id === 'bonds' ? 'Bonds' : '';
    
    if (assetKey) {
      setCustomFormData({
        ...customFormData,
        [assetKey]: parseInt(value) || 0
      });
    }
  };

  const analyzePortfolio = async () => {
    setIsAnalyzing(true);
    
    // Calculate total portfolio value
    const totalValue = Object.values(customFormData).reduce((sum, value) => sum + value, 0);
    
    // Create portfolio assets array
    const assets = Object.entries(customFormData)
      .filter(([_, value]) => value > 0) // Only include assets with values > 0
      .map(([type, value]) => ({
        type,
        value,
        percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
      }));
    
    // Dispatch to Redux store
    dispatch(setPortfolio({
      id: crypto.randomUUID(),
      userId: 'temp-user-id',
      data: {
        assets,
        totalValue
      },
      importedAt: new Date().toISOString()
    }));
    
    // Send data to LLM for risk assessment
    try {
      const portfolioData = {
        stocks: customFormData['Stocks'],
        gold: customFormData['Gold'],
        fixedDeposit: customFormData['Fixed Deposit'],
        bonds: customFormData['Bonds'],
        mutualFunds: customFormData['Mutual Funds'],
        totalValue
      };
      
      // Call the LLM service to get a risk assessment
      const result = await getPortfolioRiskAssessment(portfolioData);
      
      // Store the risk assessment in state
      setRiskAssessment(result);
      
      // Update the risk profile in Redux
      dispatch(setRiskProfile({
        id: crypto.randomUUID(),
        userId: 'temp-user-id',
        riskScore: result.riskScore,
        allocationStrategy: {
          equities: (portfolioData.stocks + portfolioData.mutualFunds) / totalValue * 100,
          bonds: portfolioData.bonds / totalValue * 100,
          commodities: portfolioData.gold / totalValue * 100,
          realEstate: 0,
          cash: portfolioData.fixedDeposit / totalValue * 100
        },
        questionnaireResponses: {
          ageGroup: '',
          monthlyIncome: '',
          savingsPercentage: '',
          loans: [],
          investmentExperience: '',
          riskTolerance: '',
          marketDropReaction: '',
          investmentInterests: [],
          primaryGoal: '',
          timeHorizon: '',
          emergencyFund: ''
        },
        createdAt: new Date().toISOString()
      }));
      
      // Still store in localStorage for the allocation page
      localStorage.setItem('portfolioRiskMessage', result.message);
    } catch (error) {
      console.error('Error during portfolio risk assessment:', error);
    } finally {
      setIsAnalyzing(false);
      setShowPortfolio(true);
    }
  };

  if (showPortfolio && portfolio) {
    // Convert portfolio data structure to format expected by PortfolioGraph
    const graphData: Record<string, number> = {};
    portfolio.data.assets.forEach(asset => {
      graphData[asset.type] = asset.value;
    });
    
    // Get risk color based on score
    const getRiskColor = (score: number) => {
      if (score <= 3.5) return 'bg-green-900 bg-opacity-30 text-green-400 border-green-800';
      if (score <= 7) return 'bg-yellow-900 bg-opacity-30 text-yellow-400 border-yellow-800';
      return 'bg-red-900 bg-opacity-30 text-red-400 border-red-800';
    };
    
    // Get risk category based on score
    const getRiskCategory = (score: number) => {
      if (score <= 3.5) return 'Conservative';
      if (score <= 7) return 'Moderate';
      return 'Aggressive';
    };
    
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="dark-card p-6 mb-6">
          <h2 className="text-xl font-semibold text-center mb-4 text-indigo-300">Portfolio Analysis</h2>
          
          <PortfolioGraph data={graphData} />
          
          {/* Display Risk Assessment */}
          {riskAssessment && (
            <div className="mt-6 p-4 rounded-lg border-2 border-dashed border-indigo-800 bg-indigo-900 bg-opacity-20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-indigo-300">Risk Assessment</h3>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(riskAssessment.riskScore)}`}>
                  {getRiskCategory(riskAssessment.riskScore)}
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mr-4 bg-indigo-900 text-indigo-300 border border-indigo-700">
                  {riskAssessment.riskScore.toFixed(1)}
                </div>
                <div className="flex-1">
                  <div className="w-full bg-[#1a1a1a] rounded-full h-2.5">
                    <div 
                      className="h-2.5 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500" 
                      style={{ width: `${(riskAssessment.riskScore / 10) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Low Risk (1)</span>
                    <span>High Risk (10)</span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-300">{riskAssessment.message}</p>
            </div>
          )}
          
          <div className="mt-8 bg-indigo-900 bg-opacity-20 border border-indigo-800 p-4 rounded-lg">
            <p className="text-lg font-medium text-indigo-300 mb-2">Next Steps</p>
            <p className="text-gray-300 mb-4">
              Now that we've analyzed your current portfolio, let's see how it aligns with your risk profile and optimize it for better returns.
            </p>
            <button 
              onClick={() => navigate('/portfolio-allocation')} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition w-full"
            >
              View Optimized Portfolio Allocation
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="w-full dark-card overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white p-6">
          <h1 className="text-3xl font-bold tracking-tight">Import Portfolio</h1>
          <p className="text-indigo-200 text-lg mt-2">
            Import your existing portfolio for personalized analysis and recommendations
          </p>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-[#333333] px-6 pt-6">
          <div className="flex -mb-px">
            <button
              className={`py-2 px-4 font-medium text-sm mr-8 ${
                activeTab === 'platforms'
                  ? 'border-b-2 border-indigo-500 text-indigo-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => handleTabChange('platforms')}
            >
              Platform Import
            </button>
            <button
              className={`py-2 px-4 font-medium text-sm ${
                activeTab === 'custom'
                  ? 'border-b-2 border-indigo-500 text-indigo-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => handleTabChange('custom')}
            >
              Custom Import
            </button>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="p-6">
          {/* Platform Selection */}
          {activeTab === 'platforms' && !selectedPlatform && (
            <div>
              <div className="text-center mb-6">
                <p className="text-gray-300">Select your investment platform to import portfolio data</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  className="h-32 flex flex-col items-center justify-center gap-2 bg-[#1e1e1e] hover:bg-[#2a2a2a] text-indigo-400 border-2 border-[#333333] hover:border-indigo-500 rounded-lg shadow-sm transition"
                  onClick={() => handlePlatformSelect('Zerodha')}
                >
                  <DollarSign className="h-9 w-9" />
                  <span className="font-medium">Zerodha</span>
                </button>
                
                <button 
                  className="h-32 flex flex-col items-center justify-center gap-2 bg-[#1e1e1e] hover:bg-[#2a2a2a] text-green-400 border-2 border-[#333333] hover:border-green-500 rounded-lg shadow-sm transition"
                  onClick={() => handlePlatformSelect('Groww')}
                >
                  <CreditCard className="h-9 w-9" />
                  <span className="font-medium">Groww</span>
                </button>
                
                <button 
                  className="h-32 flex flex-col items-center justify-center gap-2 bg-[#1e1e1e] hover:bg-[#2a2a2a] text-purple-400 border-2 border-[#333333] hover:border-purple-500 rounded-lg shadow-sm transition"
                  onClick={() => handleTabChange('custom')}
                >
                  <Upload className="h-9 w-9" />
                  <span className="font-medium">Other Platform</span>
                </button>
              </div>
            </div>
          )}

          {/* Platform Forms */}
          {selectedPlatform && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-indigo-300">{selectedPlatform} Import</h2>
              <p className="text-gray-300 mb-6">Enter your {selectedPlatform} account details</p>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="clientId" className="block text-sm font-medium text-gray-300 mb-1">Client ID</label>
                  <input
                    id="clientId"
                    name="clientId"
                    type="text"
                    value={platformFormData.clientId}
                    onChange={handlePlatformInputChange}
                    className="w-full border border-[#333333] bg-[#1e1e1e] rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-200"
                    placeholder="Enter Client ID"
                  />
                </div>
                
                <div>
                  <label htmlFor="panNumber" className="block text-sm font-medium text-gray-300 mb-1">PAN Number</label>
                  <input
                    id="panNumber"
                    name="panNumber"
                    type="text"
                    value={platformFormData.panNumber}
                    onChange={handlePlatformInputChange}
                    className="w-full border border-[#333333] bg-[#1e1e1e] rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-200"
                    placeholder="Enter PAN Number"
                  />
                </div>
              </div>
              
              <div className="mt-6 text-right">
                <button 
                  className="text-gray-400 hover:text-gray-200 underline text-sm mr-4"
                  onClick={() => setSelectedPlatform(null)}
                >
                  Back to platforms
                </button>
              </div>
            </div>
          )}

          {/* Custom Import Form */}
          {activeTab === 'custom' && (
            <div>
              <h2 className="text-xl font-semibold mb-6 text-indigo-300">Manual Portfolio Entry</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="stocks" className="block text-sm font-medium text-gray-300">Stocks</label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400">₹</span>
                      </div>
                      <input
                        id="stocks"
                        type="number"
                        value={customFormData.Stocks || ''}
                        onChange={handleCustomInputChange}
                        className="pl-8 w-full border border-[#333333] bg-[#1e1e1e] rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-200"
                        placeholder="Amount invested"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="gold" className="block text-sm font-medium text-gray-300">Gold</label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400">₹</span>
                      </div>
                      <input
                        id="gold"
                        type="number"
                        value={customFormData.Gold || ''}
                        onChange={handleCustomInputChange}
                        className="pl-8 w-full border border-[#333333] bg-[#1e1e1e] rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-200"
                        placeholder="Amount invested"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="fd" className="block text-sm font-medium text-gray-300">Fixed Deposit</label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400">₹</span>
                      </div>
                      <input
                        id="fd"
                        type="number"
                        value={customFormData['Fixed Deposit'] || ''}
                        onChange={handleCustomInputChange}
                        className="pl-8 w-full border border-[#333333] bg-[#1e1e1e] rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-200"
                        placeholder="Amount invested"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="bonds" className="block text-sm font-medium text-gray-300">Bonds</label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400">₹</span>
                      </div>
                      <input
                        id="bonds"
                        type="number"
                        value={customFormData.Bonds || ''}
                        onChange={handleCustomInputChange}
                        className="pl-8 w-full border border-[#333333] bg-[#1e1e1e] rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-200"
                        placeholder="Amount invested"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="mf" className="block text-sm font-medium text-gray-300">Mutual Funds</label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400">₹</span>
                      </div>
                      <input
                        id="mf"
                        type="number"
                        value={customFormData['Mutual Funds'] || ''}
                        onChange={handleCustomInputChange}
                        className="pl-8 w-full border border-[#333333] bg-[#1e1e1e] rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-200"
                        placeholder="Amount invested"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-2 p-4 bg-[#1a1a1a] border border-[#333333] rounded-lg">
                    <p className="text-sm text-gray-300 font-medium">Total Portfolio Value</p>
                    <p className="text-xl font-bold text-white">
                      ₹{Object.values(customFormData).reduce((sum, value) => sum + value, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer with Action Button */}
        <div className="flex justify-end p-6 pt-0 border-t border-[#333333] mt-6">
          <button 
            onClick={analyzePortfolio}
            disabled={isAnalyzing}
            className={`px-8 py-3 rounded-lg transition font-medium flex items-center ${
              isAnalyzing 
                ? 'bg-indigo-800 text-indigo-300 cursor-wait' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              'Analyze Portfolio'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioImport;
