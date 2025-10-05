
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const generateData = () => {
  const data = [];
  const principal = 1000;
  const rate = 0.10; // 10%

  for (let year = 0; year <= 20; year++) {
    const simpleInterest = principal + (principal * rate * year);
    const compoundInterest = principal * Math.pow(1 + rate, year);
    data.push({
      year: year,
      'Simple Interest': parseFloat(simpleInterest.toFixed(2)),
      'Compound Interest': parseFloat(compoundInterest.toFixed(2)),
    });
  }
  return data;
};

const data = generateData();

export function CompoundInterestChart() {
  return (
    <div className="h-80 w-full not-prose">
        <h3 className="text-center font-semibold mb-4">Growth of $1,000 at 10% Annual Return</h3>
        <ResponsiveContainer width="100%" height="100%">
            <LineChart
            data={data}
            margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
            }}
            >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
            <YAxis tickFormatter={(value) => `$${value}`} />
            <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
            <Legend />
            <Line type="monotone" dataKey="Simple Interest" stroke="hsl(var(--muted-foreground))" />
            <Line type="monotone" dataKey="Compound Interest" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
        </ResponsiveContainer>
    </div>
  );
}
