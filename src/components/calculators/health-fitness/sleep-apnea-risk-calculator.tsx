'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon } from 'lucide-react';

export default function SleepApneaRiskCalculator() {
  const [result, setResult] = useState<{riskScore: number, riskLevel: string, recommendation: string} | null>(null);
  const [age, setAge] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [gender, setGender] = useState<string>('male');
  const [neckCircumference, setNeckCircumference] = useState<string>('');
  const [snoring, setSnoring] = useState<string>('never');
  const [daytimeSleepiness, setDaytimeSleepiness] = useState<string>('never');

  const calculateRisk = () => {
    const a = parseFloat(age);
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const neck = parseFloat(neckCircumference);
    
    if (!a || !w || !h || !neck) return;
    
    const bmi = w / ((h / 100) ** 2);
    let riskScore = 0;
    
    if (a >= 50) riskScore += 2;
    else if (a >= 40) riskScore += 1;
    
    if (bmi >= 30) riskScore += 3;
    else if (bmi >= 25) riskScore += 1;
    
    if (gender === 'male') riskScore += 1;
    
    if (neck >= 43) riskScore += 2;
    else if (neck >= 40) riskScore += 1;
    
    if (snoring === 'frequent') riskScore += 2;
    else if (snoring === 'occasional') riskScore += 1;
    
    if (daytimeSleepiness === 'frequent') riskScore += 2;
    else if (daytimeSleepiness === 'occasional') riskScore += 1;
    
    let riskLevel;
    let recommendation;
    
    if (riskScore <= 2) {
      riskLevel = 'Low Risk';
      recommendation = 'Continue healthy sleep habits and regular exercise';
    } else if (riskScore <= 5) {
      riskLevel = 'Moderate Risk';
      recommendation = 'Consider lifestyle changes and discuss with healthcare provider';
    } else if (riskScore <= 8) {
      riskLevel = 'High Risk';
      recommendation = 'Strongly recommend consultation with sleep specialist';
    } else {
      riskLevel = 'Very High Risk';
      recommendation = 'Immediate consultation with sleep specialist recommended';
    }
    
    setResult({ riskScore, riskLevel, recommendation });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <CardDescription>
          Assess your risk for sleep apnea based on common risk factors. This is a screening tool and not a medical diagnosis.
        </CardDescription>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Age (years)</label>
            <Input 
              type="number" 
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="35"
            />
          </div>
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
            <label className="text-sm font-medium">Neck Circumference (cm)</label>
            <Input 
              type="number" 
              step="0.1"
              value={neckCircumference}
              onChange={(e) => setNeckCircumference(e.target.value)}
              placeholder="40"
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
          <div>
            <label className="text-sm font-medium">Snoring Frequency</label>
            <select 
              value={snoring} 
              onChange={(e) => setSnoring(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="never">Never</option>
              <option value="occasional">Occasional</option>
              <option value="frequent">Frequent</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Daytime Sleepiness</label>
            <select 
              value={daytimeSleepiness} 
              onChange={(e) => setDaytimeSleepiness(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="never">Never</option>
              <option value="occasional">Occasional</option>
              <option value="frequent">Frequent</option>
            </select>
          </div>
        </div>
        <Button onClick={calculateRisk}>Calculate Sleep Apnea Risk</Button>
      </div>

      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Moon className="h-8 w-8 text-primary" />
              <CardTitle>Sleep Apnea Risk Assessment</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-4xl font-bold">{result.riskScore}</p>
                <p className="text-lg font-semibold">Risk Score</p>
                <p className="text-sm text-muted-foreground">out of 12</p>
              </div>
              <div className="text-center space-y-2">
                <p className="text-2xl font-bold">{result.riskLevel}</p>
                <p className="text-lg font-semibold">Risk Level</p>
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold text-center">{result.recommendation}</p>
                <p className="text-sm text-muted-foreground">recommendation</p>
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
              const riskScore = result.riskScore;
              const riskLevel = result.riskLevel;
              
              return (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">Risk Assessment Analysis</h3>
                    <div className="space-y-2">
                      {riskLevel === 'Low Risk' ? (
                        <p className="text-blue-700 text-sm">
                          <strong>Low Risk:</strong> Your risk factors for sleep apnea are minimal. Continue healthy sleep habits and lifestyle.
                        </p>
                      ) : riskLevel === 'Moderate Risk' ? (
                        <p className="text-blue-700 text-sm">
                          <strong>Moderate Risk:</strong> You have some risk factors for sleep apnea. Consider lifestyle modifications and monitoring.
                        </p>
                      ) : riskLevel === 'High Risk' ? (
                        <p className="text-blue-700 text-sm">
                          <strong>High Risk:</strong> You have multiple risk factors for sleep apnea. Professional evaluation recommended.
                        </p>
                      ) : (
                        <p className="text-blue-700 text-sm">
                          <strong>Very High Risk:</strong> You have significant risk factors for sleep apnea. Immediate professional consultation advised.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">Risk Factor Analysis</h3>
                    <div className="space-y-2">
                      <p className="text-green-700 text-sm">
                        <strong>Key Risk Factors:</strong> Age, weight, neck circumference, gender, snoring frequency, and daytime sleepiness all contribute to sleep apnea risk.
                      </p>
                      <p className="text-green-700 text-sm">
                        <strong>Modifiable Factors:</strong> Weight management, sleep position, and lifestyle changes can reduce risk.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-2">Improvement Recommendations</h3>
                    <ul className="text-yellow-700 text-sm list-disc ml-4 space-y-1">
                      <li><strong>Weight Management:</strong> Maintain healthy weight through diet and exercise</li>
                      <li><strong>Sleep Position:</strong> Sleep on your side instead of your back</li>
                      <li><strong>Avoid Alcohol:</strong> Limit alcohol consumption, especially before bedtime</li>
                      <li><strong>Quit Smoking:</strong> Smoking increases inflammation and airway obstruction</li>
                      <li><strong>Regular Exercise:</strong> Physical activity can improve sleep quality</li>
                      <li><strong>Sleep Hygiene:</strong> Maintain consistent sleep schedule and bedtime routine</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-2">When to Seek Professional Help</h3>
                    <ul className="text-purple-700 text-sm list-disc ml-4 space-y-1">
                      <li><strong>High Risk Score:</strong> If your score is 6 or higher, consult a sleep specialist</li>
                      <li><strong>Persistent Symptoms:</strong> Loud snoring, gasping, or choking during sleep</li>
                      <li><strong>Daytime Fatigue:</strong> Excessive sleepiness despite adequate sleep time</li>
                      <li><strong>Morning Headaches:</strong> Frequent headaches upon waking</li>
                      <li><strong>Mood Changes:</strong> Irritability, depression, or anxiety</li>
                      <li><strong>Partner Reports:</strong> Bed partner notices breathing pauses during sleep</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="font-semibold text-red-800 mb-2">Important Disclaimer</h3>
                    <p className="text-red-700 text-sm">
                      This calculator is a screening tool only and not a medical diagnosis. Sleep apnea is a serious medical condition that requires professional evaluation and treatment. If you have concerns about your sleep or suspect sleep apnea, please consult with a healthcare provider or sleep specialist.
                    </p>
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