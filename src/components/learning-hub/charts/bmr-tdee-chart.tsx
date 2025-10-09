
'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'BMR (Resting)', calories: 1500 },
  { name: 'Sedentary', calories: 1800 },
  { name: 'Light Activity', calories: 2062 },
  { name: 'Moderate Activity', calories: 2325 },
  { name: 'Very Active', calories: 2587 },
];

export function BmrTdeeChart() {
  return (
    <div className="h-80 w-full not-prose">
      <h3 className="text-center font-semibold mb-4">Sample Daily Energy Expenditure (for a BMR of 1500)</h3>
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
          <YAxis unit=" kcal" />
          <Tooltip formatter={(value: number) => [value.toLocaleString(), 'Calories']} />
          <Legend />
          <Bar dataKey="calories" name="Total Calories Burned" fill="hsl(var(--primary))" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
