'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Activity, TrendingUp, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

const formSchema = z.object({
  age: z.number().min(1).max(120, 'Age must be between 1 and 120'),
  altitude: z.number().min(0).max(10000, 'Altitude must be between 0 and 10000 meters'),
  activityLevel: z.enum(['rest', 'light', 'moderate', 'vigorous', 'maximal']),
  healthConditions: z.enum(['none', 'asthma', 'copd', 'heart_disease', 'anemia', 'smoking']),
  temperature: z.number().min(-20).max(50, 'Temperature must be between -20°C and 50°C'),
  humidity: z.number().min(0).max(100, 'Humidity must be between 0% and 100%'),
  fitnessLevel: z.enum(['poor', 'average', 'good', 'excellent']),
});

type FormValues = z.infer<typeof formSchema>;

const getSpO2Interpretation = (spo2: number, age: number, healthConditions: string) => {
  const ageAdjustment = age > 65 ? -2 : age > 50 ? -1 : 0;
  const adjustedSpO2 = spo2 + ageAdjustment;
  
  if (adjustedSpO2 >= 98) {
    return {
      category: 'Excellent Oxygen Saturation',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: CheckCircle,
      description: 'Excellent oxygen saturation! Your blood is well-oxygenated and your respiratory system is functioning optimally.',
      recommendations: [
        'Maintain current fitness and health habits',
        'Continue regular exercise and physical activity',
        'Monitor during high-altitude activities',
        'Stay hydrated and maintain good nutrition'
      ]
    };
  } else if (adjustedSpO2 >= 95) {
    return {
      category: 'Normal Oxygen Saturation',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      icon: TrendingUp,
      description: 'Normal oxygen saturation. Your blood oxygen levels are within healthy ranges.',
      recommendations: [
        'Continue regular physical activity',
        'Monitor during exercise and altitude exposure',
        'Maintain good respiratory health',
        'Consider regular health checkups'
      ]
    };
  } else if (adjustedSpO2 >= 90) {
    return {
      category: 'Mild Hypoxemia',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      icon: Activity,
      description: 'Mild hypoxemia detected. Oxygen saturation is below normal but may be acceptable depending on circumstances.',
      recommendations: [
        'Monitor symptoms and oxygen levels',
        'Consider consulting a healthcare provider',
        'Avoid high-altitude activities',
        'Focus on improving cardiovascular fitness'
      ]
    };
  } else {
    return {
      category: 'Significant Hypoxemia',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: AlertTriangle,
      description: 'Significant hypoxemia detected. Oxygen saturation is concerning and requires medical attention.',
      recommendations: [
        'Seek immediate medical attention',
        'Avoid strenuous activities',
        'Monitor symptoms closely',
        'Consider supplemental oxygen if prescribed'
      ]
    };
  }
};

const calculateSpO2 = (data: FormValues) => {
  // Base SpO2 calculation
  let baseSpO2 = 98;
  
  // Altitude adjustment (decreases SpO2 with altitude)
  const altitudeAdjustment = Math.min(data.altitude * 0.0008, 8); // Max 8% decrease
  baseSpO2 -= altitudeAdjustment;
  
  // Activity level adjustment
  const activityAdjustments = {
    rest: 0,
    light: -0.5,
    moderate: -1.5,
    vigorous: -3,
    maximal: -5,
  };
  baseSpO2 += activityAdjustments[data.activityLevel as keyof typeof activityAdjustments];
  
  // Health condition adjustments
  const healthAdjustments = {
    none: 0,
    asthma: -2,
    copd: -4,
    heart_disease: -2,
    anemia: -3,
    smoking: -2,
  };
  baseSpO2 += healthAdjustments[data.healthConditions as keyof typeof healthAdjustments];
  
  // Environmental adjustments
  if (data.temperature > 30) baseSpO2 -= 0.5; // High temperature
  if (data.humidity > 80) baseSpO2 -= 0.3; // High humidity
  
  // Fitness level adjustment
  const fitnessAdjustments = {
    poor: -1,
    average: 0,
    good: 0.5,
    excellent: 1,
  };
  baseSpO2 += fitnessAdjustments[data.fitnessLevel as keyof typeof fitnessAdjustments];
  
  return Math.max(75, Math.min(100, baseSpO2)); // Clamp between 75-100%
};

export default function BloodOxygenSaturationEstimator() {
  const [result, setResult] = useState<{
    spo2: number;
    interpretation: ReturnType<typeof getSpO2Interpretation>;
    recommendations: string[];
    riskFactors: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: 0,
      altitude: 0,
      activityLevel: 'rest',
      healthConditions: 'none',
      temperature: 20,
      humidity: 50,
      fitnessLevel: 'average',
    },
  });

  const onSubmit = (data: FormValues) => {
    const spo2 = calculateSpO2(data);
    const interpretation = getSpO2Interpretation(spo2, data.age, data.healthConditions);
    
    // Identify risk factors
    const riskFactors = [];
    if (data.altitude > 2000) riskFactors.push('High altitude exposure');
    if (data.healthConditions !== 'none') riskFactors.push('Underlying health condition');
    if (data.activityLevel === 'maximal') riskFactors.push('High-intensity activity');
    if (data.temperature > 35) riskFactors.push('High environmental temperature');
    if (data.fitnessLevel === 'poor') riskFactors.push('Poor fitness level');
    
    setResult({
      spo2,
      interpretation,
      recommendations: interpretation.recommendations,
      riskFactors,
    });
  };

  const resetCalculator = () => {
    form.reset();
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Heart className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Blood Oxygen Saturation Estimator</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Estimate your blood oxygen saturation based on altitude, activity level, and health conditions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            SpO2 Estimation
          </CardTitle>
          <CardDescription>
            Enter your current conditions to estimate your blood oxygen saturation level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (years)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter your age"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="altitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Altitude (meters)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter current altitude"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="activityLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activity Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select activity level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="rest">Rest</SelectItem>
                          <SelectItem value="light">Light Activity</SelectItem>
                          <SelectItem value="moderate">Moderate Activity</SelectItem>
                          <SelectItem value="vigorous">Vigorous Activity</SelectItem>
                          <SelectItem value="maximal">Maximal Activity</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="healthConditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Health Conditions</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select health condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="asthma">Asthma</SelectItem>
                          <SelectItem value="copd">COPD</SelectItem>
                          <SelectItem value="heart_disease">Heart Disease</SelectItem>
                          <SelectItem value="anemia">Anemia</SelectItem>
                          <SelectItem value="smoking">Smoking</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="temperature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temperature (°C)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Enter temperature"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="humidity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Humidity (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Enter humidity percentage"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fitnessLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fitness Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select fitness level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="poor">Poor</SelectItem>
                          <SelectItem value="average">Average</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="excellent">Excellent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700">
                  Estimate SpO2
                </Button>
                <Button type="button" variant="outline" onClick={resetCalculator}>
                  Reset
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card className={`${result.interpretation.bgColor} ${result.interpretation.borderColor} border-2`}>
            <CardHeader>
              <CardTitle className={`${result.interpretation.color} flex items-center gap-2`}>
                <result.interpretation.icon className="h-5 w-5" />
                {result.interpretation.category}
              </CardTitle>
              <CardDescription className="text-gray-700">
                {result.interpretation.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-4xl font-bold text-primary">{result.spo2.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Estimated SpO2</div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Recommendations:</h4>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {result.riskFactors.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Risk Factors Identified:</h4>
                  <ul className="space-y-2">
                    {result.riskFactors.map((risk, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding">
          <AccordionTrigger className="text-left">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Understanding Blood Oxygen Saturation
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>For more detailed information on blood oxygen saturation and respiratory health, consult these authoritative sources:</p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li><a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3133579/" target="_blank" rel="noopener noreferrer" className="text-primary underline">National Center for Biotechnology Information – Oxygen Saturation</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <section
        className="space-y-4 text-muted-foreground leading-relaxed"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="headline" content="Blood Oxygen Saturation Estimator – Monitor Respiratory Health" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="How to estimate blood oxygen saturation, understand SpO2 levels, and monitor respiratory health." />

        <h2 itemProp="name" className="text-xl font-bold text-foreground">Understanding Blood Oxygen Saturation</h2>
        <p itemProp="description">Blood oxygen saturation (SpO2) measures the percentage of hemoglobin molecules carrying oxygen in your blood, indicating how well your lungs are functioning.</p>

        <h3 className="font-semibold text-foreground mt-6">Normal SpO2 Ranges</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>98-100%:</strong> Excellent oxygen saturation</li>
          <li><strong>95-97%:</strong> Normal oxygen saturation</li>
          <li><strong>90-94%:</strong> Mild hypoxemia (low oxygen)</li>
          <li><strong>&lt;90%:</strong> Significant hypoxemia (requires medical attention)</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Factors Affecting SpO2</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Altitude:</strong> Higher altitudes have less oxygen available</li>
          <li><strong>Activity Level:</strong> Exercise can temporarily lower SpO2</li>
          <li><strong>Health Conditions:</strong> Respiratory and cardiovascular diseases affect oxygen levels</li>
          <li><strong>Age:</strong> SpO2 may decrease slightly with age</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">When to Monitor SpO2</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>High Altitude:</strong> Monitor during mountain climbing or high-altitude travel</li>
          <li><strong>Exercise:</strong> Check during intense physical activity</li>
          <li><strong>Health Conditions:</strong> Regular monitoring for respiratory conditions</li>
          <li><strong>Recovery:</strong> Track improvement during illness recovery</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
        <div className="space-y-2">
          <p><Link href="/category/health-fitness/vo2-max-calculator" className="text-primary underline">VO2 Max Calculator</Link></p>
          <p><Link href="/category/health-fitness/heart-rate-zone-training-calculator" className="text-primary underline">Heart Rate Zone Training Calculator</Link></p>
          <p><Link href="/category/health-fitness/cardiovascular-disease-risk-calculator" className="text-primary underline">Cardiovascular Disease Risk Calculator</Link></p>
          <p><Link href="/category/health-fitness/breathing-exercise-timer" className="text-primary underline">Breathing Exercise Timer</Link></p>
        </div>
      </section>
    </div>
  );
}