'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export default function ChronicTrainingLoadCalculator() {
  const [result, setResult] = useState<number | null>(null);
  const [currentCTL, setCurrentCTL] = useState<string>('');
  const [dailyTSS, setDailyTSS] = useState<string>('');
  const [timeConstant, setTimeConstant] = useState<string>('42');

  const calculateCTL = () => {
    const ctl = parseFloat(currentCTL) || 0;
    const tss = parseFloat(dailyTSS);
    const tc = parseFloat(timeConstant);
    
    if (!tss || !tc) return;
    
    const decayFactor = Math.exp(-1 / tc);
    const newCTL = ctl * decayFactor + tss * (1 - decayFactor);
    setResult(newCTL);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <CardDescription>
          Calculate your Chronic Training Load (CTL) to track long-term fitness and training stress. 
          CTL represents your average training load over the past several weeks.
        </CardDescription>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Current CTL (optional)</label>
            <Input 
              type="number" 
              step="0.1"
              value={currentCTL}
              onChange={(e) => setCurrentCTL(e.target.value)}
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
              placeholder="42"
            />
          </div>
        </div>
        <Button onClick={calculateCTL}>Calculate CTL</Button>
      </div>

      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <TrendingUp className="h-8 w-8 text-primary" />
              <CardTitle>Chronic Training Load (CTL)</CardTitle>
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
              if (result < 30) {
                return (
                  <div className="space-y-3">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="font-semibold text-blue-800 mb-2">Low Training Load (0-30 TSS)</h3>
                      <p className="text-blue-700 text-sm mb-2">
                        Your CTL indicates a base building or recovery phase. This is ideal for:
                      </p>
                      <ul className="text-blue-700 text-sm list-disc ml-4 space-y-1">
                        <li>Building aerobic foundation</li>
                        <li>Recovery from intense training</li>
                        <li>Injury prevention and rehabilitation</li>
                        <li>Maintaining fitness during off-season</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h3 className="font-semibold text-green-800 mb-2">Recommendations for Improvement:</h3>
                      <ul className="text-green-700 text-sm list-disc ml-4 space-y-1">
                        <li>Gradually increase training volume by 5-10% weekly</li>
                        <li>Focus on consistent, moderate-intensity sessions</li>
                        <li>Include 2-3 longer endurance sessions per week</li>
                        <li>Monitor recovery and adjust based on how you feel</li>
                      </ul>
                    </div>
                  </div>
                );
              } else if (result < 50) {
                return (
                  <div className="space-y-3">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h3 className="font-semibold text-green-800 mb-2">Moderate Training Load (30-50 TSS)</h3>
                      <p className="text-green-700 text-sm mb-2">
                        Your CTL shows steady endurance development. This level is perfect for:
                      </p>
                      <ul className="text-green-700 text-sm list-disc ml-4 space-y-1">
                        <li>Sustainable training progression</li>
                        <li>Building aerobic capacity</li>
                        <li>Maintaining work-life balance</li>
                        <li>Long-term fitness development</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="font-semibold text-blue-800 mb-2">Recommendations for Improvement:</h3>
                      <ul className="text-blue-700 text-sm list-disc ml-4 space-y-1">
                        <li>Add 1-2 higher intensity sessions per week</li>
                        <li>Include tempo and threshold training</li>
                        <li>Gradually increase weekly training volume</li>
                        <li>Focus on technique and efficiency</li>
                      </ul>
                    </div>
                  </div>
                );
              } else if (result < 70) {
                return (
                  <div className="space-y-3">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h3 className="font-semibold text-yellow-800 mb-2">High Training Load (50-70 TSS)</h3>
                      <p className="text-yellow-700 text-sm mb-2">
                        Your CTL indicates intense training phase. Monitor recovery closely:
                      </p>
                      <ul className="text-yellow-700 text-sm list-disc ml-4 space-y-1">
                        <li>Significant fitness gains possible</li>
                        <li>Higher injury risk if not managed properly</li>
                        <li>Requires excellent recovery practices</li>
                        <li>Good for race preparation phases</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <h3 className="font-semibold text-orange-800 mb-2">Recommendations for Improvement:</h3>
                      <ul className="text-orange-700 text-sm list-disc ml-4 space-y-1">
                        <li>Prioritize sleep (8+ hours nightly)</li>
                        <li>Include active recovery sessions</li>
                        <li>Monitor heart rate variability</li>
                        <li>Plan recovery weeks every 3-4 weeks</li>
                        <li>Consider nutrition and hydration optimization</li>
                      </ul>
                    </div>
                  </div>
                );
              } else if (result < 90) {
                return (
                  <div className="space-y-3">
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <h3 className="font-semibold text-orange-800 mb-2">Very High Training Load (70-90 TSS)</h3>
                      <p className="text-orange-700 text-sm mb-2">
                        Your CTL shows peak training load. Ensure adequate recovery:
                      </p>
                      <ul className="text-orange-700 text-sm list-disc ml-4 space-y-1">
                        <li>Maximum training stress for elite athletes</li>
                        <li>High risk of overtraining if sustained</li>
                        <li>Requires professional monitoring</li>
                        <li>Short-term peak performance phase</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h3 className="font-semibold text-red-800 mb-2">Critical Recommendations:</h3>
                      <ul className="text-red-700 text-sm list-disc ml-4 space-y-1">
                        <li>Schedule immediate recovery period</li>
                        <li>Reduce training intensity by 20-30%</li>
                        <li>Increase sleep to 9+ hours</li>
                        <li>Consider professional coaching guidance</li>
                        <li>Monitor for signs of overtraining syndrome</li>
                      </ul>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div className="space-y-3">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h3 className="font-semibold text-red-800 mb-2">Extreme Training Load (90+ TSS)</h3>
                      <p className="text-red-700 text-sm mb-2">
                        Your CTL indicates maximum training stress with high injury risk:
                      </p>
                      <ul className="text-red-700 text-sm list-disc ml-4 space-y-1">
                        <li>Dangerous levels of training stress</li>
                        <li>Very high risk of overtraining</li>
                        <li>Increased injury and illness risk</li>
                        <li>Performance decline likely</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                      <h3 className="font-semibold text-red-900 mb-2">Immediate Action Required:</h3>
                      <ul className="text-red-800 text-sm list-disc ml-4 space-y-1">
                        <li>Stop intense training immediately</li>
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
