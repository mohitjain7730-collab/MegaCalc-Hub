'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';

export default function TrainingImpulseTRIMPCalculator() {
  const [result, setResult] = useState<number | null>(null);
  const [duration, setDuration] = useState<string>('');
  const [averageHR, setAverageHR] = useState<string>('');
  const [restingHR, setRestingHR] = useState<string>('');
  const [maxHR, setMaxHR] = useState<string>('');
  const [gender, setGender] = useState<string>('male');

  const calculateTRIMP = () => {
    const dur = parseFloat(duration);
    const avgHR = parseFloat(averageHR);
    const restHR = parseFloat(restingHR);
    const maxHRVal = parseFloat(maxHR);
    
    if (!dur || !avgHR || !restHR || !maxHRVal) return;
    
    const hrReserve = maxHRVal - restHR;
    const relativeHR = (avgHR - restHR) / hrReserve;
    const genderFactor = gender === 'male' ? 0.64 : 0.86;
    const trimp = dur * relativeHR * Math.exp(genderFactor * relativeHR);
    
    setResult(trimp);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <CardDescription>
          Calculate your Training Impulse (TRIMP) to quantify training load based on heart rate data. 
          TRIMP provides a more physiological approach to measuring training stress.
        </CardDescription>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Duration (minutes)</label>
            <Input 
              type="number" 
              step="0.1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="60"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Average Heart Rate (bpm)</label>
            <Input 
              type="number" 
              value={averageHR}
              onChange={(e) => setAverageHR(e.target.value)}
              placeholder="150"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Resting Heart Rate (bpm)</label>
            <Input 
              type="number" 
              value={restingHR}
              onChange={(e) => setRestingHR(e.target.value)}
              placeholder="60"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Maximum Heart Rate (bpm)</label>
            <Input 
              type="number" 
              value={maxHR}
              onChange={(e) => setMaxHR(e.target.value)}
              placeholder="190"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Gender</label>
            <select 
              value={gender} 
              onChange={(e) => setGender(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>
        <Button onClick={calculateTRIMP}>Calculate TRIMP</Button>
      </div>

      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Heart className="h-8 w-8 text-primary" />
              <CardTitle>Training Impulse (TRIMP)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-4xl font-bold">{result.toFixed(1)}</p>
              <CardDescription>TRIMP Units</CardDescription>
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
              if (result < 50) {
                return (
                  <div className="space-y-3">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="font-semibold text-blue-800 mb-2">Low Training Impulse (0-50 TRIMP)</h3>
                      <p className="text-blue-700 text-sm mb-2">
                        Your training session had low physiological stress. This indicates:
                      </p>
                      <ul className="text-blue-700 text-sm list-disc ml-4 space-y-1">
                        <li>Recovery or easy training session</li>
                        <li>Low to moderate intensity</li>
                        <li>Good for active recovery</li>
                        <li>Base building phase</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h3 className="font-semibold text-green-800 mb-2">Recommendations for Improvement:</h3>
                      <ul className="text-green-700 text-sm list-disc ml-4 space-y-1">
                        <li>Gradually increase training intensity</li>
                        <li>Add tempo and threshold sessions</li>
                        <li>Include 1-2 higher intensity workouts weekly</li>
                        <li>Focus on progressive overload</li>
                      </ul>
                    </div>
                  </div>
                );
              } else if (result < 100) {
                return (
                  <div className="space-y-3">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h3 className="font-semibold text-green-800 mb-2">Moderate Training Impulse (50-100 TRIMP)</h3>
                      <p className="text-green-700 text-sm mb-2">
                        Your training session had moderate physiological stress. This suggests:
                      </p>
                      <ul className="text-green-700 text-sm list-disc ml-4 space-y-1">
                        <li>Well-balanced training intensity</li>
                        <li>Good aerobic development</li>
                        <li>Sustainable training load</li>
                        <li>Optimal for fitness gains</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="font-semibold text-blue-800 mb-2">Recommendations for Improvement:</h3>
                      <ul className="text-blue-700 text-sm list-disc ml-4 space-y-1">
                        <li>Maintain current training consistency</li>
                        <li>Add interval training sessions</li>
                        <li>Focus on technique and efficiency</li>
                        <li>Monitor recovery between sessions</li>
                      </ul>
                    </div>
                  </div>
                );
              } else if (result < 150) {
                return (
                  <div className="space-y-3">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h3 className="font-semibold text-yellow-800 mb-2">High Training Impulse (100-150 TRIMP)</h3>
                      <p className="text-yellow-700 text-sm mb-2">
                        Your training session had high physiological stress. Monitor recovery:
                      </p>
                      <ul className="text-yellow-700 text-sm list-disc ml-4 space-y-1">
                        <li>Intense training session</li>
                        <li>Significant fitness stimulus</li>
                        <li>Requires adequate recovery</li>
                        <li>Good for performance gains</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <h3 className="font-semibold text-orange-800 mb-2">Recommendations for Improvement:</h3>
                      <ul className="text-orange-700 text-sm list-disc ml-4 space-y-1">
                        <li>Prioritize sleep and nutrition</li>
                        <li>Include active recovery sessions</li>
                        <li>Monitor heart rate variability</li>
                        <li>Plan easier days between hard sessions</li>
                        <li>Consider deload weeks</li>
                      </ul>
                    </div>
                  </div>
                );
              } else if (result < 200) {
                return (
                  <div className="space-y-3">
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <h3 className="font-semibold text-orange-800 mb-2">Very High Training Impulse (150-200 TRIMP)</h3>
                      <p className="text-orange-700 text-sm mb-2">
                        Your training session had very high physiological stress. Risk of overreaching:
                      </p>
                      <ul className="text-orange-700 text-sm list-disc ml-4 space-y-1">
                        <li>Maximum training intensity</li>
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
                        <li>Monitor for signs of overtraining</li>
                      </ul>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div className="space-y-3">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h3 className="font-semibold text-red-800 mb-2">Extreme Training Impulse (200+ TRIMP)</h3>
                      <p className="text-red-700 text-sm mb-2">
                        Your training session had dangerously high physiological stress:
                      </p>
                      <ul className="text-red-700 text-sm list-disc ml-4 space-y-1">
                        <li>Extreme training intensity</li>
                        <li>Very high risk of overtraining</li>
                        <li>Performance decline likely</li>
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