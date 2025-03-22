import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Shield, PieChart } from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const riskProfile = useSelector((state: RootState) => state.riskProfile.currentProfile);
  const portfolio = useSelector((state: RootState) => state.portfolio.currentPortfolio);
  
  // Default values
  const [riskScore, setRiskScore] = useState(5.5);
  const [totalInvested, setTotalInvested] = useState(100000);
  const [currentValue, setCurrentValue] = useState(108500);
  
  useEffect(() => {
    // Update values from the store if available
    if (riskProfile?.riskScore) {
      setRiskScore(riskProfile.riskScore);
    }
    
    if (portfolio?.data?.totalValue) {
      setTotalInvested(portfolio.data.totalValue);
      // Calculate a random growth for demonstration (5-10%)
      const growthRate = 1 + (Math.random() * 0.05 + 0.05);
      setCurrentValue(Math.round(portfolio.data.totalValue * growthRate));
    }
  }, [riskProfile, portfolio]);

  const handleUpdateRiskProfile = () => {
    navigate('/risk-assessment');
  };

  const handlePortfolioAnalysis = () => {
    navigate('/portfolio-allocation');
  };

  // Function to get risk category
  const getRiskCategory = (score: number) => {
    if (score <= 3) return 'Conservative';
    if (score <= 6) return 'Moderate';
    return 'Aggressive';
  };
  
  // Calculate return percentage
  const returnPercentage = ((currentValue - totalInvested) / totalInvested) * 100;

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-indigo-300">Investment Dashboard</h2>
      
      <div className="dark-card p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4 text-indigo-300">Account Overview</h3>
        <p className="text-gray-300 mb-4">
          Welcome to your investment dashboard. View your portfolio performance and recommendations.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-[#1e1e1e] border border-[#333333] p-4 rounded-lg">
            <h4 className="font-medium text-indigo-200 mb-2">Total Invested</h4>
            <p className="text-2xl font-bold text-white">₹{totalInvested.toLocaleString()}</p>
            <p className="text-xs text-green-400 mt-1">Initial Investment</p>
          </div>
          
          <div className="bg-[#1e1e1e] border border-[#333333] p-4 rounded-lg">
            <h4 className="font-medium text-indigo-200 mb-2">Current Value</h4>
            <p className="text-2xl font-bold text-white">₹{currentValue.toLocaleString()}</p>
            <p className="text-xs text-green-400 mt-1">+{returnPercentage.toFixed(1)}% total return</p>
          </div>
          
          <div className="bg-[#1e1e1e] border border-[#333333] p-4 rounded-lg">
            <h4 className="font-medium text-indigo-200 mb-2">Risk Score</h4>
            <p className="text-2xl font-bold text-white">{riskScore.toFixed(1)}</p>
            <p className="text-xs text-yellow-400 mt-1">{getRiskCategory(riskScore)}</p>
          </div>
        </div>
      </div>
      
      <div className="dark-card p-6">
        <h3 className="text-lg font-semibold mb-4 text-indigo-300">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={handleUpdateRiskProfile}
            className="bg-indigo-900 hover:bg-indigo-800 text-indigo-200 p-4 rounded-lg flex items-center transition"
          >
            <div className="mr-3 p-2 bg-indigo-800 rounded-full">
              <Shield className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="font-medium">Update Risk Profile</p>
              <p className="text-xs text-indigo-300">Recalculate your risk tolerance</p>
            </div>
          </button>
          
          <button
            onClick={handlePortfolioAnalysis}
            className="bg-indigo-900 hover:bg-indigo-800 text-indigo-200 p-4 rounded-lg flex items-center transition"
          >
            <div className="mr-3 p-2 bg-indigo-800 rounded-full">
              <PieChart className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="font-medium">Portfolio Analysis</p>
              <p className="text-xs text-indigo-300">Check your portfolio alignment</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;