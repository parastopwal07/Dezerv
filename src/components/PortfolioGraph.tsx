import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#a855f7', '#ef4444'];

interface PortfolioGraphProps {
  data: Record<string, number>;
}

const PortfolioGraph: React.FC<PortfolioGraphProps> = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-center text-gray-400">No portfolio data available</p>;
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
    <div className="w-full max-w-lg mx-auto p-6">
      <h2 className="text-xl font-semibold text-center mb-4 text-indigo-300">Portfolio Breakdown</h2>
      <PieChart width={400} height={350} className="mx-auto">
        <Pie 
          data={chartData} 
          dataKey="value" 
          nameKey="name" 
          cx="50%" 
          cy="50%" 
          outerRadius={120}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => `₹${value.toLocaleString()}`} 
          contentStyle={{ backgroundColor: '#242424', borderColor: '#333333', color: '#f3f4f6' }}
          itemStyle={{ color: '#f3f4f6' }}
          labelStyle={{ color: '#f3f4f6' }}
        />
        <Legend 
          formatter={(value) => <span style={{ color: '#f3f4f6' }}>{value}</span>}
        />
      </PieChart>
    </div>
  );
};

export default PortfolioGraph;
