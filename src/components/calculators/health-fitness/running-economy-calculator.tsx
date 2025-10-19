'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Footprints } from 'lucide-react';

export default function RunningEconomyCalculator() {
  const [result, setResult] = useState<{oxygenCost: number, energyCost: number, efficiency: number} | null>(null);
  const [weight, setWeight] = useState<string>('');
  const [pace, setPace] = useState<string>('');
  const [vo2Max, setVo2Max] = useState<string>('');

  const calculateEconomy = () => {
    const w = parseFloat(weight);
    const p = parseFloat(pace);
    const vo2 = parseFloat(vo2Max);
    
    if (!w || !p) return;
    
    const paceMs = 1000 / (p * 60);
    let oxygenCost;
    
    if (vo2) {
      const paceVO2 = (paceMs * 3.5) / 0.2;
      oxygenCost = (paceVO2 / vo2) * 200;
    } else {
      oxygenCost = 200 + (p * 2);
    }
    
    const energyCost = oxygenCost * 0.005;
    const efficiency = Math.max(0, Math.min(100, 100 - (oxygenCost - 150) / 2));
    
    setResult({ oxygenCost, energyCost, efficiency });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <CardDescription>
          Calculate your running economy to understand how efficiently you use oxygen and energy while running.
        </CardDescription>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Weight (kg)</label>
            <Input 
              type="number" 
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="70"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Pace (min/km)</label>
            <Input 
              type="number" 
              step="0.1"
              value={pace}
              onChange={(e) => setPace(e.target.value)}
              placeholder="5.0"
            />
          </div>
          <div>
            <label className="text-sm font-medium">VO2 Max (ml/kg/min) - Optional</label>
            <Input 
              type="number" 
              step="0.1"
              value={vo2Max}
              onChange={(e) => setVo2Max(e.target.value)}
              placeholder="50"
            />
          </div>
        </div>
        <Button onClick={calculateEconomy}>Calculate Running Economy</Button>
      </div>

      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Footprints className="h-8 w-8 text-primary" />
              <CardTitle>Running Economy Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-4xl font-bold">{result.oxygenCost.toFixed(1)}</p>
                <p className="text-lg font-semibold">Oxygen Cost</p>
                <p className="text-sm text-muted-foreground">ml O₂/kg/km</p>
              </div>
              <div className="text-center space-y-2">
                <p className="text-4xl font-bold">{result.energyCost.toFixed(2)}</p>
                <p className="text-lg font-semibold">Energy Cost</p>
                <p className="text-sm text-muted-foreground">kcal/kg/km</p>
              </div>
              <div className="text-center space-y-2">
                <p className="text-4xl font-bold">{result.efficiency.toFixed(1)}%</p>
                <p className="text-lg font-semibold">Running Efficiency</p>
                <p className="text-sm text-muted-foreground">efficiency rating</p>
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
              const oxygenCost = result.oxygenCost;
              const efficiency = result.efficiency;
              
              return (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">Running Economy Analysis</h3>
                    <div className="space-y-2">
                      {oxygenCost < 180 ? (
                        <p className="text-blue-700 text-sm">
                          <strong>Excellent Economy:</strong> Your oxygen cost is very low, indicating highly efficient running mechanics and strong aerobic capacity.
                        </p>
                      ) : oxygenCost < 200 ? (
                        <p className="text-blue-700 text-sm">
                          <strong>Good Economy:</strong> Your oxygen cost is below average, showing efficient running form and good aerobic fitness.
                        </p>
                      ) : oxygenCost < 220 ? (
                        <p className="text-blue-700 text-sm">
                          <strong>Average Economy:</strong> Your oxygen cost is typical for recreational runners. Room for improvement with training.
                        </p>
                      ) : (
                        <p className="text-blue-700 text-sm">
                          <strong>Poor Economy:</strong> Your oxygen cost is high, indicating inefficient running mechanics or low aerobic fitness.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">Efficiency Rating Analysis</h3>
                    <div className="space-y-2">
                      {efficiency > 90 ? (
                        <p className="text-green-700 text-sm">
                          <strong>Elite Efficiency:</strong> Your running efficiency is exceptional. You're using energy very efficiently.
                        </p>
                      ) : efficiency > 80 ? (
                        <p className="text-green-700 text-sm">
                          <strong>High Efficiency:</strong> Your running efficiency is very good. Minor improvements possible.
                        </p>
                      ) : efficiency > 70 ? (
                        <p className="text-green-700 text-sm">
                          <strong>Good Efficiency:</strong> Your running efficiency is solid. Focus on technique and training.
                        </p>
                      ) : (
                        <p className="text-green-700 text-sm">
                          <strong>Needs Improvement:</strong> Your running efficiency is below average. Focus on form and fitness.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-2">Improvement Recommendations</h3>
                    <ul className="text-yellow-700 text-sm list-disc ml-4 space-y-1">
                      <li><strong>Running Form:</strong> Focus on midfoot strike, upright posture, and relaxed arm swing</li>
                      <li><strong>Cadence:</strong> Aim for 170-180 steps per minute to improve efficiency</li>
                      <li><strong>Strength Training:</strong> Include plyometrics and single-leg exercises</li>
                      <li><strong>Endurance Base:</strong> Build aerobic capacity with long, easy runs</li>
                      <li><strong>Hill Training:</strong> Include hill repeats to improve running economy</li>
                      <li><strong>Stride Length:</strong> Avoid overstriding; let cadence increase naturally</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-2">Training Focus Areas</h3>
                    <ul className="text-purple-700 text-sm list-disc ml-4 space-y-1">
                      <li><strong>Technique Drills:</strong> Include A-skips, B-skips, and high knees</li>
                      <li><strong>Tempo Runs:</strong> Run at comfortably hard pace to improve economy</li>
                      <li><strong>Fartlek Training:</strong> Vary pace during runs to improve efficiency</li>
                      <li><strong>Core Strength:</strong> Strong core improves running posture and efficiency</li>
                      <li><strong>Flexibility:</strong> Regular stretching improves range of motion</li>
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