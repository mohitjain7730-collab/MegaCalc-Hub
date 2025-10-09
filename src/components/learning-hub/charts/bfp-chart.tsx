
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { category: 'Essential Fat', men: 3, women: 11.5 },
  { category: 'Athletes', men: 10, women: 17.5 },
  { category: 'Fitness', men: 15.5, women: 22.5 },
  { category: 'Average', men: 21.5, women: 28.5 },
  { category: 'Obese', men: 25, women: 32 },
];

export function BfpChart() {
  return (
    <div className="h-80 w-full not-prose">
      <h3 className="text-center font-semibold mb-4">Body Fat Percentage Ranges</h3>
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
          <XAxis dataKey="category" />
          <YAxis unit="%" />
          <Tooltip formatter={(value: number, name) => [`${value}%`, name]} />
          <Legend />
          <Bar dataKey="men" name="Men" fill="hsl(var(--primary))" />
          <Bar dataKey="women" name="Women" fill="hsl(var(--chart-2))" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
