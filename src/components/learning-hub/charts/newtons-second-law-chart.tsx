
'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const generateData = (mass: number) => {
  const data = [];
  for (let force = 0; force <= 50; force += 5) {
    const acceleration = force / mass;
    data.push({
      force,
      acceleration: parseFloat(acceleration.toFixed(2)),
    });
  }
  return data;
};

const data = generateData(10); // Assume a constant mass of 10kg

export function NewtonsSecondLawChart() {
  return (
    <div className="h-80 w-full not-prose">
      <h3 className="text-center font-semibold mb-4">F = ma (for a 10kg mass)</h3>
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
          <XAxis dataKey="force" unit=" N" name="Force" label={{ value: 'Force (Newtons)', position: 'insideBottom', offset: -5 }} />
          <YAxis dataKey="acceleration" unit=" m/s²" name="Acceleration" label={{ value: 'Acceleration (m/s²)', angle: -90, position: 'insideLeft' }}/>
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="acceleration" name="Acceleration vs. Force" stroke="hsl(var(--primary))" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
