'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

export default function RowingDragFactorCalculator() {
  const [result, setResult] = useState<{dragFactor: number, resistance: number, recommendation: string} | null>(null);
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [experience, setExperience] = useState<string>('beginner');
  const [target, setTarget] = useState<string>('fitness');

  const calculateDragFactor = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    
    if (!w || !h) return;
    
    const bmi = w / ((h / 100) ** 2);
    
    let baseDragFactor;
    if (experience === 'beginner') {
      baseDragFactor = 100 + (bmi * 2);
    } else if (experience === 'intermediate') {
      baseDragFactor = 120 + (bmi * 2.5);
    } else {
      baseDragFactor = 140 + (bmi * 3);
    }
    
    if (target === 'endurance') {
      baseDragFactor *= 0.8;
    } else if (target === 'power') {
      baseDragFactor *= 1.2;
    }
    
    const dragFactor = Math.max(80, Math.min(200, baseDragFactor));
    const resistance = dragFactor * 0.1;
    
    let recommendation;
    if (dragFactor < 100) recommendation = 'Light resistance - good for endurance training';
    else if (dragFactor < 130) recommendation = 'Moderate resistance - balanced training';
    else if (dragFactor < 160) recommendation = 'Heavy resistance - power and strength focus';
    else recommendation = 'Very heavy resistance - advanced power training';
    
    setResult({ dragFactor, resistance, recommendation });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <CardDescription>
          Calculate the optimal drag factor for your rowing machine based on your body composition and training goals.
        </CardDescription>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <label className="text-sm font-medium">Height (cm)</label>
            <Input 
              type="number" 
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="175"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Experience Level</label>
            <select 
              value={experience} 
              onChange={(e) => setExperience(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Training Goal</label>
            <select 
              value={target} 
              onChange={(e) => setTarget(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="fitness">General Fitness</option>
              <option value="endurance">Endurance</option>
              <option value="power">Power</option>
            </select>
          </div>
        </div>
        <Button onClick={calculateDragFactor}>Calculate Drag Factor</Button>
      </div>

      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Activity className="h-8 w-8 text-primary" />
              <CardTitle>Rowing Drag Factor Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-4xl font-bold">{result.dragFactor.toFixed(0)}</p>
                <p className="text-lg font-semibold">Recommended Drag Factor</p>
                <p className="text-sm text-muted-foreground">drag factor setting</p>
              </div>
              <div className="text-center space-y-2">
                <p className="text-4xl font-bold">{result.resistance.toFixed(1)}</p>
                <p className="text-lg font-semibold">Resistance Level</p>
                <p className="text-sm text-muted-foreground">relative resistance</p>
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold text-center">{result.recommendation}</p>
                <p className="text-sm text-muted-foreground">training recommendation</p>
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
              const dragFactor = result.dragFactor;
              const resistance = result.resistance;
              
              return (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">Drag Factor Analysis</h3>
                    <div className="space-y-2">
                      {dragFactor < 100 ? (
                        <p className="text-blue-700 text-sm">
                          <strong>Light Resistance:</strong> Your recommended drag factor is low, ideal for endurance training and technique development.
                        </p>
                      ) : dragFactor < 130 ? (
                        <p className="text-blue-700 text-sm">
                          <strong>Moderate Resistance:</strong> Your recommended drag factor provides balanced training for most rowers.
                        </p>
                      ) : dragFactor < 160 ? (
                        <p className="text-blue-700 text-sm">
                          <strong>Heavy Resistance:</strong> Your recommended drag factor is high, good for power and strength development.
                        </p>
                      ) : (
                        <p className="text-blue-700 text-sm">
                          <strong>Very Heavy Resistance:</strong> Your recommended drag factor is very high, suitable for advanced power training.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">Resistance Level Analysis</h3>
                    <div className="space-y-2">
                      {resistance < 10 ? (
                        <p className="text-green-700 text-sm">
                          <strong>Low Resistance:</strong> Easy to maintain technique and endurance. Good for beginners and recovery.
                        </p>
                      ) : resistance < 15 ? (
                        <p className="text-green-700 text-sm">
                          <strong>Moderate Resistance:</strong> Balanced challenge for technique and fitness development.
                        </p>
                      ) : resistance < 20 ? (
                        <p className="text-green-700 text-sm">
                          <strong>High Resistance:</strong> Challenging but manageable for strength and power development.
                        </p>
                      ) : (
                        <p className="text-green-700 text-sm">
                          <strong>Very High Resistance:</strong> Maximum challenge for advanced athletes and power training.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-2">Improvement Recommendations</h3>
                    <ul className="text-yellow-700 text-sm list-disc ml-4 space-y-1">
                      <li><strong>Technique Focus:</strong> Start with lower drag factors to perfect form</li>
                      <li><strong>Progressive Overload:</strong> Gradually increase drag factor as you improve</li>
                      <li><strong>Varied Training:</strong> Use different drag factors for different training goals</li>
                      <li><strong>Strength Training:</strong> Include off-erg strength work to handle higher resistance</li>
                      <li><strong>Recovery:</strong> Use lower drag factors for recovery sessions</li>
                      <li><strong>Monitoring:</strong> Track performance at different drag factors</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-2">Training Applications</h3>
                    <ul className="text-purple-700 text-sm list-disc ml-4 space-y-1">
                      <li><strong>Endurance Training:</strong> Use lower drag factors (100-120) for long steady rows</li>
                      <li><strong>Power Training:</strong> Use higher drag factors (140-160) for short intervals</li>
                      <li><strong>Technique Work:</strong> Use low drag factors (80-100) to focus on form</li>
                      <li><strong>Race Preparation:</strong> Practice at race-specific drag factors</li>
                      <li><strong>Recovery Sessions:</strong> Use very low drag factors (70-90) for active recovery</li>
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