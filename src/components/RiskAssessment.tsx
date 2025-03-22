import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { setRiskProfile } from '../store/slices/riskProfileSlice';
import { calculateRiskScore, calculatePortfolioAllocation, type QuestionnaireResponse } from '../utils/riskCalculator';

const questions = [
  {
    id: 'ageGroup',
    question: 'What is your age group?',
    options: ['18-25', '26-35', '36-45', '46-60', '60+'],
    type: 'radio',
  },
  {
    id: 'monthlyIncome',
    question: 'What is your current monthly income?',
    options: [
      'Below ₹30,000',
      '₹30,000 - ₹50,000',
      '₹50,000 - ₹1,00,000',
      '₹1,00,000 - ₹2,00,000',
      'Above ₹2,00,000',
    ],
    type: 'radio',
  },
  {
    id: 'savingsPercentage',
    question: 'How much do you save or invest from your income each month?',
    options: [
      'Less than 10%',
      '10% - 20%',
      '20% - 30%',
      '30% - 50%',
      'More than 50%',
    ],
    type: 'radio',
  },
  {
    id: 'loans',
    question: 'Do you have any existing loans or liabilities? (Select all that apply)',
    options: ['Home Loan', 'Car Loan', 'Personal Loan', 'Credit Card Debt', 'No Loans'],
    type: 'checkbox',
  },
  {
    id: 'investmentExperience',
    question: 'What is your level of investment experience?',
    options: ['Beginner', 'Intermediate', 'Advanced'],
    type: 'radio',
  },
  {
    id: 'riskTolerance',
    question: 'What is your risk tolerance?',
    options: ['Low', 'Medium', 'High'],
    type: 'radio',
  },
  {
    id: 'marketDropReaction',
    question: 'How would you react if the market dropped 20% in a week?',
    options: [
      'Sell everything to prevent further loss',
      'Do nothing and wait for recovery',
      'Invest more to buy at lower prices',
    ],
    type: 'radio',
  },
  {
    id: 'investmentInterests',
    question: 'What types of investments are you interested in? (Select all that apply)',
    options: ['Stocks', 'Bonds', 'Mutual Funds', 'Real Estate', 'Gold'],
    type: 'checkbox',
  },
  {
    id: 'primaryGoal',
    question: 'What is your primary financial goal?',
    options: [
      'Wealth accumulation',
      'Saving for retirement',
      'Buying a house',
      'Generating passive income',
      'Saving for education',
    ],
    type: 'radio',
  },
  {
    id: 'timeHorizon',
    question: 'What is your investment time horizon?',
    options: ['Less than 1 year', '1-3 years', '3-5 years', '5+ years'],
    type: 'radio',
  },
  {
    id: 'emergencyFund',
    question: 'Do you have an emergency fund?',
    options: [
      'Yes, covering 6+ months of expenses',
      'Yes, covering 3-6 months of expenses',
      'No, I do not have an emergency fund',
    ],
    type: 'radio',
  },
];

const RiskAssessment: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isManualUpdateMode, setIsManualUpdateMode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<QuestionnaireResponse>({
    ageGroup: '18-25',
    monthlyIncome: 'Below ₹30,000',
    savingsPercentage: 'Less than 10%',
    loans: [],
    investmentExperience: 'Beginner',
    riskTolerance: 'I prefer safe investments with minimal risk, even if returns are low',
    marketDropReaction: 'I would sell immediately to prevent further losses',
    investmentInterests: [],
    primaryGoal: 'Wealth accumulation',
    timeHorizon: 'Short-term (0-3 years)',
    emergencyFund: 'No, I need to build one',
  });

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    // Check if the user is coming from manual update
    const manualUpdateMode = localStorage.getItem('manualUpdateMode') === 'true';
    setIsManualUpdateMode(manualUpdateMode);
    
    // Clear the flag from localStorage
    if (manualUpdateMode) {
      localStorage.removeItem('manualUpdateMode');
    }
  }, []);

  const handleInputChange = (field: keyof QuestionnaireResponse, value: any) => {
    setResponses((prev) => ({ ...prev, [field]: value }));
  };

  const handleMultiSelect = (field: 'loans' | 'investmentInterests', value: string) => {
    setResponses((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    const riskScore = calculateRiskScore(responses);
    const allocation = calculatePortfolioAllocation(riskScore);

    dispatch(
      setRiskProfile({
        id: crypto.randomUUID(),
        userId: 'temp-user-id',
        riskScore,
        allocationStrategy: {
          equities: allocation.stocks + allocation.mutualFunds,
          bonds: allocation.bonds,
          commodities: allocation.gold,
          realEstate: 0,
          cash: allocation.fd,
        },
        questionnaireResponses: responses,
        createdAt: new Date().toISOString(),
      })
    );

    // If coming from manual update, return to portfolio allocation
    if (isManualUpdateMode) {
      navigate('/portfolio-allocation', { state: { recalculated: true } });
    } else {
      navigate('/portfolio-allocation');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      {/* Display a message if coming from manual update */}
      {isManualUpdateMode && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 w-full max-w-3xl">
          <p className="font-bold">Manual Update Mode</p>
          <p>Answer the questions to recalculate your risk profile and optimize your portfolio allocation.</p>
        </div>
      )}
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5 }}
          className="bg-white w-full max-w-3xl p-8 rounded-lg shadow-lg"
        >
          <h2 className="text-xl font-bold mb-6 text-center">
            {currentQuestion.question}
          </h2>
          <div className="space-y-4">
            {currentQuestion.type === 'radio' &&
              currentQuestion.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleInputChange(currentQuestion.id as keyof QuestionnaireResponse, option)}
                  className={`block w-full p-4 text-lg text-left border rounded-lg ${
                    responses[currentQuestion.id as keyof QuestionnaireResponse] === option
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-100 hover:bg-indigo-100'
                  }`}
                >
                  {option}
                </button>
              ))}

            {currentQuestion.type === 'checkbox' &&
              currentQuestion.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleMultiSelect(currentQuestion.id as 'loans' | 'investmentInterests', option)}
                  className={`block w-full p-4 text-lg text-left border rounded-lg ${
                    responses[currentQuestion.id as keyof QuestionnaireResponse]?.includes(option)
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-100 hover:bg-indigo-100'
                  }`}
                >
                  {option}
                </button>
              ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between w-full max-w-3xl mt-6">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="px-6 py-3 bg-gray-300 text-gray-600 rounded-lg hover:bg-gray-400 disabled:bg-gray-200"
        >
          Previous
        </button>

        {currentQuestionIndex < questions.length - 1 ? (
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
};

export default RiskAssessment;
