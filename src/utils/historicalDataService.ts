// Type definitions
export interface HistoricalDataPoint {
  month: string;
  stocks: number;
  gold: number;
  fixedDeposits: number;
  bonds: number;
  mutualFunds: number;
}

export interface AllocationData {
  label: string;
  key: 'stocks' | 'gold' | 'fd' | 'bonds' | 'mutualFunds';
  value: number;
}

export interface HistoricalReturn {
  month: string;
  value: number;
  changePercentage: number;
}

// Sample historical data (first 24 months)
const SAMPLE_DATA: HistoricalDataPoint[] = [
  { month: 'Mar 2015', stocks: -1.254599, gold: 1.844641, fixedDeposits: 0.970229, bonds: 0.704621, mutualFunds: 2.293986 },
  { month: 'Apr 2015', stocks: 4.507143, gold: 2.376548, fixedDeposits: 0.976964, bonds: 1.036275, mutualFunds: 2.957487 },
  { month: 'May 2015', stocks: 2.319939, gold: -1.091979, fixedDeposits: 0.957432, bonds: 0.795729, mutualFunds: 0.545411 },
  { month: 'Jun 2015', stocks: 0.28635, gold: -1.940611, fixedDeposits: 0.825148, bonds: 1.008992, mutualFunds: -3.747043 },
  { month: 'Jul 2015', stocks: -2.663061, gold: 1.871288, fixedDeposits: 0.751267, bonds: 0.670156, mutualFunds: 4.486158 },
  { month: 'Aug 2015', stocks: -2.35693, gold: 1.330488, fixedDeposits: 0.830827, bonds: 0.863803, mutualFunds: 1.320501 },
  { month: 'Sep 2015', stocks: -0.469987, gold: -2.359235, fixedDeposits: 0.777652, bonds: 0.974952, mutualFunds: 1.221418 },
  { month: 'Oct 2015', stocks: 2.030264, gold: -1.027689, fixedDeposits: 0.887855, bonds: 1.038549, mutualFunds: 3.62461 },
  { month: 'Nov 2015', stocks: -1.205079, gold: 2.658356, fixedDeposits: 0.730676, bonds: 0.898654, mutualFunds: 2.492328 },
  { month: 'Dec 2015', stocks: 3.462879, gold: -2.63616, fixedDeposits: 0.953663, bonds: 0.950862, mutualFunds: 1.044724 },
  { month: 'Jan 2016', stocks: -1.724918, gold: 2.292699, fixedDeposits: 0.829642, bonds: 0.993076, mutualFunds: 5.740524 },
  { month: 'Feb 2016', stocks: 3.866626, gold: 1.362823, fixedDeposits: 0.857922, bonds: 0.956205, mutualFunds: 0.121432 },
  { month: 'Mar 2016', stocks: 0.275437, gold: 1.932538, fixedDeposits: 0.816887, bonds: 0.943748, mutualFunds: 2.828461 },
  { month: 'Apr 2016', stocks: 1.166105, gold: -0.326021, fixedDeposits: 0.84532, bonds: 0.99698, mutualFunds: 5.886726 },
  { month: 'May 2016', stocks: -1.636379, gold: -0.639604, fixedDeposits: 0.679702, bonds: 0.995966, mutualFunds: 2.930007 },
  { month: 'Jun 2016', stocks: 4.839209, gold: -1.166921, fixedDeposits: 0.810955, bonds: 0.766192, mutualFunds: 1.146165 },
  { month: 'Jul 2016', stocks: -2.796955, gold: 2.523755, fixedDeposits: 0.94574, bonds: 0.921443, mutualFunds: -1.456357 },
  { month: 'Aug 2016', stocks: 2.143908, gold: -1.340722, fixedDeposits: 0.930909, bonds: 1.032542, mutualFunds: 0.211883 },
  { month: 'Sep 2016', stocks: -2.185136, gold: 2.292481, fixedDeposits: 0.928635, bonds: 0.975068, mutualFunds: 1.214766 },
  { month: 'Oct 2016', stocks: 2.99336, gold: -2.005785, fixedDeposits: 0.947915, bonds: 0.860738, mutualFunds: 1.117396 },
  { month: 'Nov 2016', stocks: -2.021374, gold: 0.301254, fixedDeposits: 0.897125, bonds: 0.976496, mutualFunds: 3.518898 },
  { month: 'Dec 2016', stocks: 1.861629, gold: -1.390214, fixedDeposits: 0.876806, bonds: 1.146526, mutualFunds: 4.968281 },
  { month: 'Jan 2017', stocks: -0.339325, gold: -1.171655, fixedDeposits: 0.9738, bonds: 0.842257, mutualFunds: 1.711669 },
  { month: 'Feb 2017', stocks: 4.608969, gold: -0.189291, fixedDeposits: 0.731222, bonds: 1.121432, mutualFunds: 2.548821 }
];

// Generate more data to extend to 10 years (120 months)
const generateExtendedData = (): HistoricalDataPoint[] => {
  const result: HistoricalDataPoint[] = [...SAMPLE_DATA];
  
  // We already have 24 months, need 96 more to reach 120 months (10 years)
  for (let i = 0; i < 96; i++) {
    const sourceIndex = i % SAMPLE_DATA.length;
    const sourceData = SAMPLE_DATA[sourceIndex];
    
    // Add small variations to make the data look more realistic
    const variation = () => (Math.random() - 0.5) * 3; // Random variation between -1.5 and 1.5
    
    const newMonth = new Date(2017, 2 + Math.floor(i / 12), 1);
    const monthStr = newMonth.toLocaleString('default', { month: 'short', year: 'numeric' });
    
    result.push({
      month: monthStr,
      stocks: sourceData.stocks + variation(),
      gold: sourceData.gold + variation(),
      fixedDeposits: Math.abs(sourceData.fixedDeposits + variation() * 0.1), // Keep FD positive but with smaller variations
      bonds: Math.abs(sourceData.bonds + variation() * 0.2), // Keep bonds positive but with smaller variations
      mutualFunds: sourceData.mutualFunds + variation()
    });
  }
  
  return result;
};

// Cache for the parsed data to avoid repeated processing
let cachedData: HistoricalDataPoint[] | null = null;

// Return historical data (using generated data)
export async function parseHistoricalData(): Promise<HistoricalDataPoint[]> {
  if (cachedData) return cachedData;
  
  // Use the generated data
  cachedData = generateExtendedData();
  return cachedData;
}

// Map allocation keys to historical data fields
const keyToPropertyMap = {
  'stocks': 'stocks',
  'gold': 'gold',
  'fd': 'fixedDeposits',
  'bonds': 'bonds',
  'mutualFunds': 'mutualFunds'
};

// Calculate historical returns based on allocation
export async function calculateHistoricalReturns(
  allocation: AllocationData[],
  initialInvestment: number = 100000
): Promise<HistoricalReturn[]> {
  const historicalData = await parseHistoricalData();
  
  // Calculate monthly returns based on allocation
  let cumulativeValue = initialInvestment;
  let previousValue = initialInvestment;
  
  return historicalData.map(month => {
    let monthlyReturn = 0;
    
    // Calculate weighted return for the month based on allocation
    allocation.forEach(asset => {
      const propertyName = keyToPropertyMap[asset.key];
      const monthlyAssetReturn = month[propertyName as keyof HistoricalDataPoint] as number;
      monthlyReturn += (asset.value / 100) * monthlyAssetReturn;
    });
    
    // Apply monthly return to the cumulative value
    cumulativeValue = cumulativeValue * (1 + monthlyReturn / 100);
    
    // Calculate month-over-month percentage change
    const changePercentage = ((cumulativeValue - previousValue) / previousValue) * 100;
    previousValue = cumulativeValue;
    
    return {
      month: month.month,
      value: cumulativeValue,
      changePercentage
    };
  });
}

// Calculate annualized return
export function calculateAnnualizedReturn(returns: HistoricalReturn[]): number {
  if (returns.length < 2) return 0;
  
  const firstValue = returns[0].value;
  const lastValue = returns[returns.length - 1].value;
  const years = returns.length / 12; // Assuming monthly data
  
  // Formula: (Final Value / Initial Value)^(1/years) - 1
  return (Math.pow(lastValue / firstValue, 1 / years) - 1) * 100;
}

// Calculate volatility (standard deviation of returns)
export function calculateVolatility(returns: HistoricalReturn[]): number {
  const monthlyReturns = returns.map(r => r.changePercentage);
  const mean = monthlyReturns.reduce((sum, r) => sum + r, 0) / monthlyReturns.length;
  
  const squaredDiffs = monthlyReturns.map(r => Math.pow(r - mean, 2));
  const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / squaredDiffs.length;
  
  return Math.sqrt(variance);
}
