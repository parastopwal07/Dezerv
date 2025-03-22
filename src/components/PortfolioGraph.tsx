import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#d0ed57'];

interface PortfolioGraphProps {
  data: Record<string, number>;
}

const PortfolioGraph: React.FC<PortfolioGraphProps> = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return <p>No portfolio data available</p>;
  }

  // Calculate total value for percentages
  const totalInvestment = Object.values(data).reduce((sum, value) => sum + value, 0);

  const chartData = Object.entries(data).map(([name, value], index) => ({
    name,
    value,
    percentage: ((value / totalInvestment) * 100).toFixed(2),
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="w-full max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-center mb-4">Portfolio Breakdown</h2>
      <PieChart width={400} height={400}>
        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `₹${value}`} />
        <Legend />
      </PieChart>
    </div>
  );
};

export default PortfolioGraph;
