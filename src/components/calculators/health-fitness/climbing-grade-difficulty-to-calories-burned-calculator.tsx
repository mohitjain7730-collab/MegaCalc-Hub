'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mountain } from 'lucide-react';

export default function ClimbingGradeDifficultyToCaloriesBurnedCalculator() {
  const [result, setResult] = useState<{caloriesPerHour: number, totalCalories: number, intensity: string} | null>(null);
  const [weight, setWeight] = useState<string>('');
  const [grade, setGrade] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [climbingType, setClimbingType] = useState<string>('indoor');

  const calculateCalories = () => {
    const w = parseFloat(weight);
    const g = parseFloat(grade);
    const d = parseFloat(duration);
    
    if (!w || !g || !d) return;
    
    let baseMET;
    if (climbingType === 'indoor') {
      baseMET = 5.8 + (g * 0.3);
    } else if (climbingType === 'bouldering') {
      baseMET = 6.5 + (g * 0.4);
    } else {
      baseMET = 7.2 + (g * 0.5);
    }
    
    const caloriesPerHour = (baseMET * w * 3.5) / 200;
    const totalCalories = caloriesPerHour * (d / 60);
    
    let intensity;
    if (baseMET < 6) intensity = 'Light';
    else if (baseMET < 8) intensity = 'Moderate';
    else if (baseMET < 10) intensity = 'Vigorous';
    else intensity = 'Very Vigorous';
    
    setResult({ caloriesPerHour, totalCalories, intensity });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <CardDescription>
          Calculate calories burned during climbing based on grade difficulty, climbing type, and duration.
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
            <label className="text-sm font-medium">Climbing Grade (5.0-5.15)</label>
            <Input 
              type="number" 
              step="0.1"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="5.10"
            />
          </div>
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
            <label className="text-sm font-medium">Climbing Type</label>
            <select 
              value={climbingType} 
              onChange={(e) => setClimbingType(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="indoor">Indoor Climbing</option>
              <option value="bouldering">Bouldering</option>
              <option value="outdoor">Outdoor Climbing</option>
            </select>
          </div>
        </div>
        <Button onClick={calculateCalories}>Calculate Calories Burned</Button>
      </div>

      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Mountain className="h-8 w-8 text-primary" />
              <CardTitle>Climbing Calorie Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-4xl font-bold">{result.caloriesPerHour.toFixed(0)}</p>
                <p className="text-lg font-semibold">Calories per Hour</p>
                <p className="text-sm text-muted-foreground">kcal/hour</p>
              </div>
              <div className="text-center space-y-2">
                <p className="text-4xl font-bold">{result.totalCalories.toFixed(0)}</p>
                <p className="text-lg font-semibold">Total Calories Burned</p>
                <p className="text-sm text-muted-foreground">kcal</p>
              </div>
              <div className="text-center space-y-2">
                <p className="text-2xl font-bold">{result.intensity}</p>
                <p className="text-lg font-semibold">Exercise Intensity</p>
                <p className="text-sm text-muted-foreground">based on MET value</p>
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
              const caloriesPerHour = result.caloriesPerHour;
              const totalCalories = result.totalCalories;
              const intensity = result.intensity;
              
              return (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">Calorie Burn Analysis</h3>
                    <div className="space-y-2">
                      {caloriesPerHour < 300 ? (
                        <p className="text-blue-700 text-sm">
                          <strong>Low Calorie Burn:</strong> Your climbing session burned fewer calories. Consider increasing intensity or duration.
                        </p>
                      ) : caloriesPerHour < 500 ? (
                        <p className="text-blue-700 text-sm">
                          <strong>Moderate Calorie Burn:</strong> Your climbing session provided good calorie burn. Balanced workout intensity.
                        </p>
                      ) : caloriesPerHour < 700 ? (
                        <p className="text-blue-700 text-sm">
                          <strong>High Calorie Burn:</strong> Your climbing session burned many calories. Excellent workout intensity.
                        </p>
                      ) : (
                        <p className="text-blue-700 text-sm">
                          <strong>Very High Calorie Burn:</strong> Your climbing session burned exceptionally high calories. Intense workout!
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">Exercise Intensity Analysis</h3>
                    <div className="space-y-2">
                      {intensity === 'Light' ? (
                        <p className="text-green-700 text-sm">
                          <strong>Light Intensity:</strong> Your climbing was at a light intensity. Good for recovery or beginners.
                        </p>
                      ) : intensity === 'Moderate' ? (
                        <p className="text-green-700 text-sm">
                          <strong>Moderate Intensity:</strong> Your climbing was at moderate intensity. Good for fitness and endurance.
                        </p>
                      ) : intensity === 'Vigorous' ? (
                        <p className="text-green-700 text-sm">
                          <strong>Vigorous Intensity:</strong> Your climbing was vigorous. Excellent for fitness gains and strength building.
                        </p>
                      ) : (
                        <p className="text-green-700 text-sm">
                          <strong>Very Vigorous Intensity:</strong> Your climbing was very vigorous. Maximum fitness benefits but requires recovery.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-2">Improvement Recommendations</h3>
                    <ul className="text-yellow-700 text-sm list-disc ml-4 space-y-1">
                      <li><strong>Increase Duration:</strong> Climb for longer periods to burn more calories</li>
                      <li><strong>Higher Grades:</strong> Attempt more difficult routes to increase intensity</li>
                      <li><strong>Reduce Rest:</strong> Minimize rest time between climbs</li>
                      <li><strong>Circuit Training:</strong> Combine climbing with other exercises</li>
                      <li><strong>Technique Focus:</strong> Improve efficiency to climb harder routes</li>
                      <li><strong>Strength Training:</strong> Build climbing-specific strength</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-2">Training Applications</h3>
                    <ul className="text-purple-700 text-sm list-disc ml-4 space-y-1">
                      <li><strong>Weight Management:</strong> Use climbing for calorie deficit goals</li>
                      <li><strong>Fitness Tracking:</strong> Monitor calorie burn for training load</li>
                      <li><strong>Nutrition Planning:</strong> Fuel appropriately for climbing sessions</li>
                      <li><strong>Recovery:</strong> Allow adequate rest between intense sessions</li>
                      <li><strong>Progression:</strong> Gradually increase difficulty and duration</li>
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