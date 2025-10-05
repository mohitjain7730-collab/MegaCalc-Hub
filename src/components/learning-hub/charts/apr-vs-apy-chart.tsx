
'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  {
    name: 'Year 1',
    '5% APR': 1050.00,
    '5% APY (Monthly)': 1051.16,
  },
  {
    name: 'Year 5',
    '5% APR': 1250.00,
    '5% APY (Monthly)': 1283.36,
  },
  {
    name: 'Year 10',
    '5% APR': 1500.00,
    '5% APY (Monthly)': 1647.01,
  },
   {
    name: 'Year 20',
    '5% APR': 2000.00,
    '5% APY (Monthly)': 2712.64,
  },
];

export function AprVsApyChart() {
  return (
    <div className="h-80 w-full not-prose">
      <h3 className="text-center font-semibold mb-4">Growth of $1,000 at 5% Rate</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value) => `$${value}`} />
          <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
          <Legend />
          <Bar dataKey="5% APR" fill="hsl(var(--muted-foreground))" />
          <Bar dataKey="5% APY (Monthly)" fill="hsl(var(--primary))" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
