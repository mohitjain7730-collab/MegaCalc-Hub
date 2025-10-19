'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

export default function AcuteTrainingLoadCalculator() {
  const [result, setResult] = useState<number | null>(null);
  const [currentATL, setCurrentATL] = useState<string>('');
  const [dailyTSS, setDailyTSS] = useState<string>('');
  const [timeConstant, setTimeConstant] = useState<string>('7');

  const calculateATL = () => {
    const atl = parseFloat(currentATL) || 0;
    const tss = parseFloat(dailyTSS);
    const tc = parseFloat(timeConstant);
    
    if (!tss || !tc) return;
    
    const decayFactor = Math.exp(-1 / tc);
    const newATL = atl * decayFactor + tss * (1 - decayFactor);
    setResult(newATL);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <CardDescription>
          Calculate your Acute Training Load (ATL) to track recent training stress and fatigue levels. 
          ATL represents your average training load over the past week.
        </CardDescription>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Current ATL (optional)</label>
            <Input 
              type="number" 
              step="0.1"
              value={currentATL}
              onChange={(e) => setCurrentATL(e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Daily TSS</label>
            <Input 
              type="number" 
              step="0.1"
              value={dailyTSS}
              onChange={(e) => setDailyTSS(e.target.value)}
              placeholder="50"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Time Constant (days)</label>
            <Input 
              type="number" 
              value={timeConstant}
              onChange={(e) => setTimeConstant(e.target.value)}
              placeholder="7"
            />
          </div>
        </div>
        <Button onClick={calculateATL}>Calculate ATL</Button>
      </div>

      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Activity className="h-8 w-8 text-primary" />
              <CardTitle>Acute Training Load (ATL)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-4xl font-bold">{result.toFixed(1)}</p>
              <CardDescription>Training Stress Score (TSS)</CardDescription>
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
              if (result < 20) {
                return (
                  <div className="space-y-3">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="font-semibold text-blue-800 mb-2">Low Acute Load (0-20 TSS)</h3>
                      <p className="text-blue-700 text-sm mb-2">
                        Your recent training load is very light. This indicates:
                      </p>
                      <ul className="text-blue-700 text-sm list-disc ml-4 space-y-1">
                        <li>Recovery or rest period</li>
                        <li>Light training sessions</li>
                        <li>Possible undertraining</li>
                        <li>Good for active recovery</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h3 className="font-semibold text-green-800 mb-2">Recommendations for Improvement:</h3>
                      <ul className="text-green-700 text-sm list-disc ml-4 space-y-1">
                        <li>Gradually increase training intensity</li>
                        <li>Add moderate-intensity sessions</li>
                        <li>Include 1-2 challenging workouts per week</li>
                        <li>Focus on consistency over intensity</li>
                      </ul>
                    </div>
                  </div>
                );
              } else if (result < 40) {
                return (
                  <div className="space-y-3">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h3 className="font-semibold text-green-800 mb-2">Moderate Acute Load (20-40 TSS)</h3>
                      <p className="text-green-700 text-sm mb-2">
                        Your recent training load is well-balanced. This suggests:
                      </p>
                      <ul className="text-green-700 text-sm list-disc ml-4 space-y-1">
                        <li>Sustainable training approach</li>
                        <li>Good recovery between sessions</li>
                        <li>Steady fitness progression</li>
                        <li>Reduced injury risk</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="font-semibold text-blue-800 mb-2">Recommendations for Improvement:</h3>
                      <ul className="text-blue-700 text-sm list-disc ml-4 space-y-1">
                        <li>Maintain current training consistency</li>
                        <li>Add 1 high-intensity session weekly</li>
                        <li>Focus on progressive overload</li>
                        <li>Monitor long-term trends</li>
                      </ul>
                    </div>
                  </div>
                );
              } else if (result < 60) {
                return (
                  <div className="space-y-3">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h3 className="font-semibold text-yellow-800 mb-2">High Acute Load (40-60 TSS)</h3>
                      <p className="text-yellow-700 text-sm mb-2">
                        Your recent training load is high. Monitor closely:
                      </p>
                      <ul className="text-yellow-700 text-sm list-disc ml-4 space-y-1">
                        <li>Intense training phase</li>
                        <li>Higher fatigue levels</li>
                        <li>Good for fitness gains</li>
                        <li>Requires careful recovery</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <h3 className="font-semibold text-orange-800 mb-2">Recommendations for Improvement:</h3>
                      <ul className="text-orange-700 text-sm list-disc ml-4 space-y-1">
                        <li>Prioritize sleep and nutrition</li>
                        <li>Include active recovery sessions</li>
                        <li>Monitor for signs of overreaching</li>
                        <li>Plan easier days between hard sessions</li>
                        <li>Consider deload weeks</li>
                      </ul>
                    </div>
                  </div>
                );
              } else if (result < 80) {
                return (
                  <div className="space-y-3">
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <h3 className="font-semibold text-orange-800 mb-2">Very High Acute Load (60-80 TSS)</h3>
                      <p className="text-orange-700 text-sm mb-2">
                        Your recent training load is very high. Risk of overreaching:
                      </p>
                      <ul className="text-orange-700 text-sm list-disc ml-4 space-y-1">
                        <li>Peak training intensity</li>
                        <li>High fatigue accumulation</li>
                        <li>Increased injury risk</li>
                        <li>Short-term sustainable only</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h3 className="font-semibold text-red-800 mb-2">Critical Recommendations:</h3>
                      <ul className="text-red-700 text-sm list-disc ml-4 space-y-1">
                        <li>Schedule immediate recovery period</li>
                        <li>Reduce training intensity by 30-40%</li>
                        <li>Increase sleep to 9+ hours</li>
                        <li>Focus on nutrition and hydration</li>
                        <li>Monitor heart rate variability</li>
                      </ul>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div className="space-y-3">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h3 className="font-semibold text-red-800 mb-2">Extreme Acute Load (80+ TSS)</h3>
                      <p className="text-red-700 text-sm mb-2">
                        Your recent training load is dangerously high:
                      </p>
                      <ul className="text-red-700 text-sm list-disc ml-4 space-y-1">
                        <li>Very high risk of overtraining</li>
                        <li>Performance decline likely</li>
                        <li>Increased illness risk</li>
                        <li>Immediate rest required</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                      <h3 className="font-semibold text-red-900 mb-2">Immediate Action Required:</h3>
                      <ul className="text-red-800 text-sm list-disc ml-4 space-y-1">
                        <li>Stop all intense training immediately</li>
                        <li>Take 1-2 weeks complete rest</li>
                        <li>Consult with sports medicine professional</li>
                        <li>Focus on sleep, nutrition, and stress management</li>
                        <li>Gradually return to training after recovery</li>
                      </ul>
                    </div>
                  </div>
                );
              }
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}