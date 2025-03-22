import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Shield, Upload } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleOption = (option: 'profile' | 'import') => {
    navigate(option === 'profile' ? '/risk-assessment' : '/portfolio-import');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#121212] to-[#1e1e1e]">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <PieChart className="h-16 w-16 text-indigo-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-indigo-200 mb-4">
            Smart Investment Guidance
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Get personalized investment recommendations based on your goals, risk tolerance, and market analysis.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          <button
            onClick={() => handleOption('profile')}
            className="bg-[#242424] p-6 rounded-xl border border-[#333333] shadow-lg hover:bg-[#2a2a2a] transition-all"
          >
            <Shield className="h-12 w-12 text-indigo-400 mb-4" />
            <h2 className="text-2xl font-semibold mb-2 text-indigo-300">Build My Profile</h2>
            <p className="text-gray-400">
              Take our comprehensive questionnaire to receive tailored investment advice.
            </p>
          </button>

          <button
            onClick={() => handleOption('import')}
            className="bg-[#242424] p-6 rounded-xl border border-[#333333] shadow-lg hover:bg-[#2a2a2a] transition-all"
          >
            <Upload className="h-12 w-12 text-indigo-400 mb-4" />
            <h2 className="text-2xl font-semibold mb-2 text-indigo-300">Import Portfolio</h2>
            <p className="text-gray-400">
              Upload your existing portfolio for analysis and optimization suggestions.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;