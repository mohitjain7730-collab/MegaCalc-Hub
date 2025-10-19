'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Waves } from 'lucide-react';

export default function SwimStrokeRateCalculator() {
  const [result, setResult] = useState<{strokeRate: number, efficiency: number, pace: number} | null>(null);
  const [stroke, setStroke] = useState<string>('freestyle');
  const [distance, setDistance] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [strokeCount, setStrokeCount] = useState<string>('');

  const calculateStrokeRate = () => {
    const d = parseFloat(distance);
    const t = parseFloat(time);
    const strokes = parseFloat(strokeCount);
    
    if (!d || !t || !strokes) return;
    
    const strokeRate = (strokes / t) * 60;
    const pace = t / d;
    
    let efficiency;
    if (stroke === 'freestyle') {
      efficiency = Math.max(0, 100 - (strokeRate - 50) / 2);
    } else if (stroke === 'backstroke') {
      efficiency = Math.max(0, 100 - (strokeRate - 45) / 2);
    } else if (stroke === 'breaststroke') {
      efficiency = Math.max(0, 100 - (strokeRate - 30) / 1.5);
    } else {
      efficiency = Math.max(0, 100 - (strokeRate - 40) / 2);
    }
    
    setResult({ strokeRate, efficiency, pace });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <CardDescription>
          Calculate your swimming stroke rate and efficiency to optimize your swimming technique and performance.
        </CardDescription>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Stroke Type</label>
            <select 
              value={stroke} 
              onChange={(e) => setStroke(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="freestyle">Freestyle</option>
              <option value="backstroke">Backstroke</option>
              <option value="breaststroke">Breaststroke</option>
              <option value="butterfly">Butterfly</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Distance (meters)</label>
            <Input 
              type="number" 
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              placeholder="100"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Time (seconds)</label>
            <Input 
              type="number" 
              step="0.1"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="60"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Total Stroke Count</label>
            <Input 
              type="number" 
              value={strokeCount}
              onChange={(e) => setStrokeCount(e.target.value)}
              placeholder="50"
            />
          </div>
        </div>
        <Button onClick={calculateStrokeRate}>Calculate Stroke Rate</Button>
      </div>

      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Waves className="h-8 w-8 text-primary" />
              <CardTitle>Swimming Stroke Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-4xl font-bold">{result.strokeRate.toFixed(1)}</p>
                <p className="text-lg font-semibold">Stroke Rate</p>
                <p className="text-sm text-muted-foreground">strokes per minute</p>
              </div>
              <div className="text-center space-y-2">
                <p className="text-4xl font-bold">{result.efficiency.toFixed(1)}%</p>
                <p className="text-lg font-semibold">Swimming Efficiency</p>
                <p className="text-sm text-muted-foreground">efficiency rating</p>
              </div>
              <div className="text-center space-y-2">
                <p className="text-4xl font-bold">{result.pace.toFixed(2)}</p>
                <p className="text-lg font-semibold">Pace</p>
                <p className="text-sm text-muted-foreground">seconds per meter</p>
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
              const strokeRate = result.strokeRate;
              const efficiency = result.efficiency;
              const pace = result.pace;
              
              return (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">Stroke Rate Analysis</h3>
                    <div className="space-y-2">
                      {strokeRate < 30 ? (
                        <p className="text-blue-700 text-sm">
                          <strong>Low Stroke Rate:</strong> Your stroke rate is below optimal. Focus on increasing tempo while maintaining technique.
                        </p>
                      ) : strokeRate < 40 ? (
                        <p className="text-blue-700 text-sm">
                          <strong>Moderate Stroke Rate:</strong> Your stroke rate is in the lower range. Good for endurance but may limit speed.
                        </p>
                      ) : strokeRate < 50 ? (
                        <p className="text-blue-700 text-sm">
                          <strong>Optimal Stroke Rate:</strong> Your stroke rate is in the ideal range for most swimmers. Balanced speed and efficiency.
                        </p>
                      ) : (
                        <p className="text-blue-700 text-sm">
                          <strong>High Stroke Rate:</strong> Your stroke rate is high, great for sprinting but may reduce efficiency over distance.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">Efficiency Rating Analysis</h3>
                    <div className="space-y-2">
                      {efficiency > 90 ? (
                        <p className="text-green-700 text-sm">
                          <strong>Excellent Efficiency:</strong> Your swimming technique is highly efficient. Maintain current form.
                        </p>
                      ) : efficiency > 80 ? (
                        <p className="text-green-700 text-sm">
                          <strong>Good Efficiency:</strong> Your swimming efficiency is solid. Minor technique improvements possible.
                        </p>
                      ) : efficiency > 70 ? (
                        <p className="text-green-700 text-sm">
                          <strong>Moderate Efficiency:</strong> Your swimming efficiency needs improvement. Focus on technique.
                        </p>
                      ) : (
                        <p className="text-green-700 text-sm">
                          <strong>Poor Efficiency:</strong> Your swimming efficiency is below average. Significant technique work needed.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-2">Improvement Recommendations</h3>
                    <ul className="text-yellow-700 text-sm list-disc ml-4 space-y-1">
                      <li><strong>Stroke Technique:</strong> Focus on proper catch, pull, and recovery phases</li>
                      <li><strong>Body Position:</strong> Maintain horizontal body position and streamline</li>
                      <li><strong>Breathing:</strong> Practice bilateral breathing and timing</li>
                      <li><strong>Kick Technique:</strong> Develop efficient kick rhythm and power</li>
                      <li><strong>Rotation:</strong> Use proper body rotation for power and efficiency</li>
                      <li><strong>Stroke Length:</strong> Balance stroke rate with stroke length</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-2">Training Applications</h3>
                    <ul className="text-purple-700 text-sm list-disc ml-4 space-y-1">
                      <li><strong>Technique Drills:</strong> Include catch-up, fist, and single-arm drills</li>
                      <li><strong>Stroke Rate Training:</strong> Practice maintaining optimal stroke rate</li>
                      <li><strong>Pace Training:</strong> Use your pace for interval and tempo training</li>
                      <li><strong>Endurance Sets:</strong> Focus on maintaining efficiency over distance</li>
                      <li><strong>Sprint Training:</strong> Develop higher stroke rates for short distances</li>
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