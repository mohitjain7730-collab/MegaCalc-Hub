'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bike } from 'lucide-react';

export default function CyclingCadenceOptimizerCalculator() {
  const [result, setResult] = useState<{optimalCadence: number, powerRange: string, efficiency: number} | null>(null);
  const [power, setPower] = useState<string>('');
  const [currentCadence, setCurrentCadence] = useState<string>('');
  const [riderType, setRiderType] = useState<string>('endurance');

  const calculateOptimalCadence = () => {
    const p = parseFloat(power);
    const cadence = parseFloat(currentCadence);
    
    if (!p) return;
    
    let optimalCadence;
    let efficiency;
    
    if (riderType === 'sprinter') {
      optimalCadence = 90 + (p / 10);
    } else if (riderType === 'climber') {
      optimalCadence = 85 + (p / 15);
    } else {
      optimalCadence = 88 + (p / 12);
    }
    
    optimalCadence = Math.max(70, Math.min(120, optimalCadence));
    
    if (cadence) {
      const cadenceDiff = Math.abs(cadence - optimalCadence);
      efficiency = Math.max(0, 100 - (cadenceDiff * 2));
    } else {
      efficiency = 95;
    }
    
    let powerRange;
    if (p < 200) powerRange = 'Low Power';
    else if (p < 300) powerRange = 'Moderate Power';
    else if (p < 400) powerRange = 'High Power';
    else powerRange = 'Very High Power';
    
    setResult({ optimalCadence, powerRange, efficiency });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <CardDescription>
          Find your optimal cycling cadence based on power output and riding style for maximum efficiency.
        </CardDescription>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Power Output (watts)</label>
            <Input 
              type="number" 
              value={power}
              onChange={(e) => setPower(e.target.value)}
              placeholder="250"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Current Cadence (rpm) - Optional</label>
            <Input 
              type="number" 
              value={currentCadence}
              onChange={(e) => setCurrentCadence(e.target.value)}
              placeholder="90"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Rider Type</label>
            <select 
              value={riderType} 
              onChange={(e) => setRiderType(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="endurance">Endurance</option>
              <option value="sprinter">Sprinter</option>
              <option value="climber">Climber</option>
            </select>
          </div>
        </div>
        <Button onClick={calculateOptimalCadence}>Calculate Optimal Cadence</Button>
      </div>

      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Bike className="h-8 w-8 text-primary" />
              <CardTitle>Optimal Cadence Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-4xl font-bold">{result.optimalCadence.toFixed(0)}</p>
                <p className="text-lg font-semibold">Optimal Cadence</p>
                <p className="text-sm text-muted-foreground">rpm</p>
              </div>
              <div className="text-center space-y-2">
                <p className="text-2xl font-bold">{result.powerRange}</p>
                <p className="text-lg font-semibold">Power Category</p>
              </div>
              <div className="text-center space-y-2">
                <p className="text-4xl font-bold">{result.efficiency.toFixed(1)}%</p>
                <p className="text-lg font-semibold">Efficiency Rating</p>
                <p className="text-sm text-muted-foreground">based on current cadence</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {result !== null && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Results Interpretation & Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(() => {
              const optimalCadence = result.optimalCadence;
              const efficiency = result.efficiency;
              
              return (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">Optimal Cadence Analysis</h3>
                    <div className="space-y-2">
                      {optimalCadence < 80 ? (
                        <p className="text-blue-700 text-sm">
                          <strong>Low Cadence:</strong> Your optimal cadence is below typical range. Focus on spinning faster to reduce muscle fatigue.
                        </p>
                      ) : optimalCadence < 90 ? (
                        <p className="text-blue-700 text-sm">
                          <strong>Moderate Cadence:</strong> Your optimal cadence is in the lower range. Good for power output but may cause fatigue.
                        </p>
                      ) : optimalCadence < 100 ? (
                        <p className="text-blue-700 text-sm">
                          <strong>Optimal Cadence:</strong> Your cadence is in the ideal range for most cyclists. Balanced power and efficiency.
                        </p>
                      ) : (
                        <p className="text-blue-700 text-sm">
                          <strong>High Cadence:</strong> Your optimal cadence is high, great for endurance and reducing muscle fatigue.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">Efficiency Rating Analysis</h3>
                    <div className="space-y-2">
                      {efficiency > 90 ? (
                        <p className="text-green-700 text-sm">
                          <strong>Excellent Efficiency:</strong> Your current cadence is very close to optimal. Maintain this cadence.
                        </p>
                      ) : efficiency > 80 ? (
                        <p className="text-green-700 text-sm">
                          <strong>Good Efficiency:</strong> Your cadence is close to optimal. Minor adjustments recommended.
                        </p>
                      ) : efficiency > 70 ? (
                        <p className="text-green-700 text-sm">
                          <strong>Moderate Efficiency:</strong> Your cadence needs adjustment. Focus on cadence training.
                        </p>
                      ) : (
                        <p className="text-green-700 text-sm">
                          <strong>Poor Efficiency:</strong> Your cadence is far from optimal. Significant improvement needed.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-2">Improvement Recommendations</h3>
                    <ul className="text-yellow-700 text-sm list-disc ml-4 space-y-1">
                      <li><strong>Cadence Training:</strong> Practice spinning at your optimal cadence during easy rides</li>
                      <li><strong>Gear Selection:</strong> Use easier gears to maintain higher cadence</li>
                      <li><strong>Drill Work:</strong> Include single-leg drills and high-cadence intervals</li>
                      <li><strong>Pedal Technique:</strong> Focus on smooth, circular pedaling motion</li>
                      <li><strong>Core Strength:</strong> Strong core helps maintain efficient cadence</li>
                      <li><strong>Flexibility:</strong> Regular stretching improves pedaling efficiency</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-2">Training Applications</h3>
                    <ul className="text-purple-700 text-sm list-disc ml-4 space-y-1">
                      <li><strong>Endurance Rides:</strong> Use optimal cadence for long, steady efforts</li>
                      <li><strong>Climbing:</strong> Maintain higher cadence on climbs to reduce muscle fatigue</li>
                      <li><strong>Time Trials:</strong> Optimal cadence maximizes power output over time</li>
                      <li><strong>Recovery Rides:</strong> Practice cadence drills during easy rides</li>
                      <li><strong>Race Strategy:</strong> Use optimal cadence for sustained efforts</li>
                    </ul>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}