import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, PieChart, Shield, Upload } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; isBot: boolean }[]>([
    { text: "Hi! I'm your personal investment advisor. Would you like to build your investment profile or import an existing portfolio?", isBot: true }
  ]);

  const handleOption = (option: 'profile' | 'import') => {
    const newMessage = {
      text: option === 'profile' ? "I'd like to build my profile" : "I want to import my portfolio",
      isBot: false
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    setTimeout(() => {
      const botResponse = {
        text: option === 'profile' 
          ? "Great! I'll guide you through our risk assessment questionnaire to understand your investment goals and preferences."
          : "Perfect! I'll help you analyze your existing portfolio and provide personalized recommendations.",
        isBot: true
      };
      setMessages(prev => [...prev, botResponse]);
      
      setTimeout(() => {
        navigate(option === 'profile' ? '/risk-assessment' : '/portfolio-import');
      }, 2000);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <PieChart className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Smart Investment Guidance
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get personalized investment recommendations based on your goals, risk tolerance, and market analysis.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          <button
            onClick={() => handleOption('profile')}
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
          >
            <Shield className="h-12 w-12 text-indigo-600 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Build My Profile</h2>
            <p className="text-gray-600">
              Take our comprehensive questionnaire to receive tailored investment advice.
            </p>
          </button>

          <button
            onClick={() => handleOption('import')}
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
          >
            <Upload className="h-12 w-12 text-indigo-600 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Import Portfolio</h2>
            <p className="text-gray-600">
              Upload your existing portfolio for analysis and optimization suggestions.
            </p>
          </button>
        </div>

        <button
          onClick={() => setChatOpen(true)}
          className={`fixed bottom-4 right-4 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors ${
            chatOpen ? 'hidden' : ''
          }`}
        >
          <MessageSquare className="h-6 w-6" />
        </button>

        {chatOpen && (
          <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-xl">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold">Investment Advisor</h3>
              <button
                onClick={() => setChatOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.isBot ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg ${
                      message.isBot
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-indigo-600 text-white'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;