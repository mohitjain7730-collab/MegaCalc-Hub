
'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: '1 psi', pascals: 6895 },
  { name: '1 bar', pascals: 100000 },
  { name: '1 atm', pascals: 101325 },
];

export function PressureUnitsChart() {
  return (
    <div className="h-80 w-full not-prose">
      <h3 className="text-center font-semibold mb-4">Comparison of Pressure Units to Pascals (Pa)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" scale="log" domain={[1, 1000000]} tickFormatter={(tick) => tick.toLocaleString()} />
          <YAxis type="category" dataKey="name" width={60} />
          <Tooltip formatter={(value: number) => `${value.toLocaleString()} Pa`} />
          <Legend />
          <Bar dataKey="pascals" name="Pressure in Pascals (Log Scale)" fill="hsl(var(--primary))" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
