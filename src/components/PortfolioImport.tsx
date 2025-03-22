// import React from 'react';

// const PortfolioImport: React.FC = () => {
//   return (
//     <div className="max-w-4xl mx-auto">
//       <h1 className="text-3xl font-bold mb-6">Import Portfolio</h1>
//       <p className="text-gray-600 mb-8">
//         Import your existing portfolio for analysis and recommendations.
//       </p>
//       {/* Portfolio import interface will be implemented in the next phase */}
//     </div>
//   );
// };

// export default PortfolioImport;

import React, { useState } from 'react';

const PortfolioImport: React.FC = () => {
  const [activeTab, setActiveTab] = useState('platforms');
  const [customImport, setCustomImport] = useState(false);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'custom') {
      setCustomImport(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
          <h1 className="text-3xl font-bold tracking-tight">Import Portfolio</h1>
          <p className="text-blue-100 text-lg mt-2">
            Import your existing portfolio for personalized analysis and recommendations
          </p>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex -mb-px">
              <button
                className={`py-2 px-4 font-medium text-sm mr-8 ${
                  activeTab === 'platforms'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => handleTabChange('platforms')}
              >
                Platform Import
              </button>
              <button
                className={`py-2 px-4 font-medium text-sm ${
                  activeTab === 'custom'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => handleTabChange('custom')}
              >
                Custom Import
              </button>
            </div>
          </div>

          {/* Platform Import Tab */}
          {activeTab === 'platforms' && (
            <div>
              <div className="text-center mb-6">
                <p className="text-gray-600">Select your investment platform to import portfolio data</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="h-32 flex flex-col items-center justify-center gap-2 bg-white hover:bg-blue-50 text-blue-700 border-2 border-blue-200 hover:border-blue-500 rounded-lg shadow-sm transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
                    <path d="M12 18V6"/>
                  </svg>
                  <span className="font-medium">Zerodha</span>
                </button>
                
                <button className="h-32 flex flex-col items-center justify-center gap-2 bg-white hover:bg-green-50 text-green-700 border-2 border-green-200 hover:border-green-500 rounded-lg shadow-sm transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                  <span className="font-medium">Groww</span>
                </button>
                
                <button className="h-32 flex flex-col items-center justify-center gap-2 bg-white hover:bg-purple-50 text-purple-700 border-2 border-purple-200 hover:border-purple-500 rounded-lg shadow-sm transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="14" x="2" y="5" rx="2"/>
                    <line x1="2" x2="22" y1="10" y2="10"/>
                  </svg>
                  <span className="font-medium">Other Platform</span>
                </button>
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500 mb-4">Having trouble connecting? Try custom import instead</p>
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                  onClick={() => handleTabChange('custom')}
                >
                  Switch to Manual Entry
                </button>
              </div>
            </div>
          )}

          {/* Custom Import Tab */}
          {activeTab === 'custom' && (
            <div className="bg-white rounded-lg">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Enter Your Investment Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="stocks" className="block text-sm font-medium text-gray-700">Stocks</label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">₹</span>
                      </div>
                      <input
                        id="stocks"
                        type="number"
                        className="pl-8 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Amount invested"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="gold" className="block text-sm font-medium text-gray-700">Gold</label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">₹</span>
                      </div>
                      <input
                        id="gold"
                        type="number"
                        className="pl-8 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Amount invested"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="fd" className="block text-sm font-medium text-gray-700">Fixed Deposit</label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">₹</span>
                      </div>
                      <input
                        id="fd"
                        type="number"
                        className="pl-8 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Amount invested"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="bonds" className="block text-sm font-medium text-gray-700">Bonds</label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">₹</span>
                      </div>
                      <input
                        id="bonds"
                        type="number"
                        className="pl-8 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Amount invested"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="mf" className="block text-sm font-medium text-gray-700">Mutual Funds</label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">₹</span>
                      </div>
                      <input
                        id="mf"
                        type="number"
                        className="pl-8 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Amount invested"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="others" className="block text-sm font-medium text-gray-700">Other Investments</label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">₹</span>
                      </div>
                      <input
                        id="others"
                        type="number"
                        className="pl-8 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Amount invested"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex justify-end p-6 pt-0">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg transition font-medium">
            Analyze Portfolio
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioImport;
