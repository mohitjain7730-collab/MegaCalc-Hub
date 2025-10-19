'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';

export default function CriticalPowerCalculator() {
  const [result, setResult] = useState<{cp: number, wPrime: number} | null>(null);
  const [power1, setPower1] = useState<string>('');
  const [duration1, setDuration1] = useState<string>('');
  const [power2, setPower2] = useState<string>('');
  const [duration2, setDuration2] = useState<string>('');

  const calculateCP = () => {
    const p1 = parseFloat(power1);
    const d1 = parseFloat(duration1);
    const p2 = parseFloat(power2);
    const d2 = parseFloat(duration2);
    
    if (!p1 || !d1 || !p2 || !d2) return;
    
    const t1 = d1 * 60;
    const t2 = d2 * 60;
    const w1 = p1 * t1;
    const w2 = p2 * t2;
    
    const cp = (w2 - w1) / (t2 - t1);
    const wPrime = w1 - cp * t1;
    
    setResult({ cp, wPrime });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <CardDescription>
          Calculate your Critical Power (CP) and W' to determine sustainable power output and anaerobic work capacity.
        </CardDescription>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Power 1 (watts)</label>
            <Input 
              type="number" 
              value={power1}
              onChange={(e) => setPower1(e.target.value)}
              placeholder="300"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Duration 1 (minutes)</label>
            <Input 
              type="number" 
              step="0.1"
              value={duration1}
              onChange={(e) => setDuration1(e.target.value)}
              placeholder="5"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Power 2 (watts)</label>
            <Input 
              type="number" 
              value={power2}
              onChange={(e) => setPower2(e.target.value)}
              placeholder="250"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Duration 2 (minutes)</label>
            <Input 
              type="number" 
              step="0.1"
              value={duration2}
              onChange={(e) => setDuration2(e.target.value)}
              placeholder="20"
            />
          </div>
        </div>
        <Button onClick={calculateCP}>Calculate Critical Power</Button>
      </div>

      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Zap className="h-8 w-8 text-primary" />
              <CardTitle>Critical Power Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-4xl font-bold">{result.cp.toFixed(1)}</p>
                <p className="text-lg font-semibold">Critical Power (CP)</p>
                <p className="text-sm text-muted-foreground">watts</p>
              </div>
              <div className="text-center space-y-2">
                <p className="text-4xl font-bold">{result.wPrime.toFixed(0)}</p>
                <p className="text-lg font-semibold">W' (Anaerobic Work Capacity)</p>
                <p className="text-sm text-muted-foreground">joules</p>
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
              const cp = result.cp;
              const wPrime = result.wPrime;
              
              return (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">Critical Power Analysis</h3>
                    <div className="space-y-2">
                      {cp < 200 ? (
                        <p className="text-blue-700 text-sm">
                          <strong>Low Critical Power:</strong> Your sustainable power output is below average. Focus on building aerobic base and endurance.
                        </p>
                      ) : cp < 300 ? (
                        <p className="text-blue-700 text-sm">
                          <strong>Moderate Critical Power:</strong> Your sustainable power output is good for recreational athletes. Room for improvement with structured training.
                        </p>
                      ) : cp < 400 ? (
                        <p className="text-blue-700 text-sm">
                          <strong>High Critical Power:</strong> Your sustainable power output is excellent. You're well-trained with strong aerobic capacity.
                        </p>
                      ) : (
                        <p className="text-blue-700 text-sm">
                          <strong>Very High Critical Power:</strong> Your sustainable power output is exceptional. Elite-level aerobic capacity.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">Anaerobic Work Capacity (W') Analysis</h3>
                    <div className="space-y-2">
                      {wPrime < 10000 ? (
                        <p className="text-green-700 text-sm">
                          <strong>Low W':</strong> Limited anaerobic capacity. Focus on high-intensity interval training and sprint work.
                        </p>
                      ) : wPrime < 20000 ? (
                        <p className="text-green-700 text-sm">
                          <strong>Moderate W':</strong> Good anaerobic capacity. Include both endurance and power training.
                        </p>
                      ) : wPrime < 30000 ? (
                        <p className="text-green-700 text-sm">
                          <strong>High W':</strong> Excellent anaerobic capacity. Strong ability to sustain high power outputs.
                        </p>
                      ) : (
                        <p className="text-green-700 text-sm">
                          <strong>Very High W':</strong> Exceptional anaerobic capacity. Elite-level power endurance.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-2">Training Recommendations</h3>
                    <ul className="text-yellow-700 text-sm list-disc ml-4 space-y-1">
                      <li><strong>For CP Improvement:</strong> Focus on tempo rides at 85-95% of CP, long endurance rides, and threshold intervals</li>
                      <li><strong>For W' Improvement:</strong> Include high-intensity intervals (30s-5min), sprint training, and VO2 max intervals</li>
                      <li><strong>Balanced Training:</strong> Combine 80% endurance work with 20% high-intensity training</li>
                      <li><strong>Recovery:</strong> Allow 24-48 hours between high-intensity sessions</li>
                      <li><strong>Progression:</strong> Increase training load by 5-10% weekly</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-2">Performance Applications</h3>
                    <ul className="text-purple-700 text-sm list-disc ml-4 space-y-1">
                      <li><strong>Time Trials:</strong> Your CP represents sustainable power for 30-60 minute efforts</li>
                      <li><strong>Road Racing:</strong> Use CP for breakaway efforts and sustained climbs</li>
                      <li><strong>Track Racing:</strong> W' determines your ability to recover between high-power efforts</li>
                      <li><strong>Training Zones:</strong> Use CP to set accurate training zones and power targets</li>
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