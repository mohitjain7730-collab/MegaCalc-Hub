'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  age: z.number().positive('Age must be positive'),
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  exerciseType: z.enum(['strength', 'cardio', 'hiit', 'endurance', 'flexibility']),
  exerciseIntensity: z.enum(['low', 'moderate', 'high', 'very_high']),
  exerciseDuration: z.number().positive('Duration must be positive'),
  sorenessLevel: z.enum(['mild', 'moderate', 'severe']),
  hoursSinceExercise: z.number().positive('Hours since exercise must be positive'),
  sleepQuality: z.enum(['poor', 'fair', 'good', 'excellent']),
  hydrationLevel: z.enum(['poor', 'fair', 'good', 'excellent']),
});

type FormValues = z.infer<typeof formSchema>;

export default function MuscleSorenessRecoveryEstimator() {
  const [result, setResult] = useState<{
    estimatedRecoveryTime: number;
    recoveryPhase: string;
    interpretation: string;
    recommendations: string[];
    preventionTips: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      fitnessLevel: undefined,
      exerciseType: undefined,
      exerciseIntensity: undefined,
      exerciseDuration: undefined,
      sorenessLevel: undefined,
      hoursSinceExercise: undefined,
      sleepQuality: undefined,
      hydrationLevel: undefined,
    },
  });

  const calculateRecoveryTime = (values: FormValues) => {
    let baseRecoveryTime = 24; // Base 24 hours

    // Age factor (older = longer recovery)
    if (values.age > 50) baseRecoveryTime += 12;
    else if (values.age > 40) baseRecoveryTime += 6;
    else if (values.age < 25) baseRecoveryTime -= 6;

    // Fitness level factor
    const fitnessMultipliers = {
      beginner: 1.5,
      intermediate: 1.0,
      advanced: 0.7,
    };
    baseRecoveryTime *= fitnessMultipliers[values.fitnessLevel];

    // Exercise type factor
    const exerciseTypeMultipliers = {
      strength: 1.3,
      cardio: 0.8,
      hiit: 1.4,
      endurance: 1.1,
      flexibility: 0.6,
    };
    baseRecoveryTime *= exerciseTypeMultipliers[values.exerciseType];

    // Intensity factor
    const intensityMultipliers = {
      low: 0.7,
      moderate: 1.0,
      high: 1.3,
      very_high: 1.6,
    };
    baseRecoveryTime *= intensityMultipliers[values.exerciseIntensity];

    // Duration factor
    if (values.exerciseDuration > 90) baseRecoveryTime += 12;
    else if (values.exerciseDuration > 60) baseRecoveryTime += 6;
    else if (values.exerciseDuration < 30) baseRecoveryTime -= 6;

    // Soreness level factor
    const sorenessMultipliers = {
      mild: 0.8,
      moderate: 1.2,
      severe: 1.8,
    };
    baseRecoveryTime *= sorenessMultipliers[values.sorenessLevel];

    // Recovery factors
    const sleepMultipliers = {
      poor: 1.3,
      fair: 1.1,
      good: 0.9,
      excellent: 0.7,
    };
    baseRecoveryTime *= sleepMultipliers[values.sleepQuality];

    const hydrationMultipliers = {
      poor: 1.2,
      fair: 1.1,
      good: 0.9,
      excellent: 0.8,
    };
    baseRecoveryTime *= hydrationMultipliers[values.hydrationLevel];

    return Math.max(6, Math.round(baseRecoveryTime)); // Minimum 6 hours
  };

  const getRecoveryPhase = (hoursSinceExercise: number, estimatedRecovery: number) => {
    const progress = (hoursSinceExercise / estimatedRecovery) * 100;
    
    if (progress < 25) return 'Acute Phase';
    if (progress < 50) return 'Inflammatory Phase';
    if (progress < 75) return 'Repair Phase';
    if (progress < 100) return 'Remodeling Phase';
    return 'Recovery Complete';
  };

  const onSubmit = (values: FormValues) => {
    const estimatedRecoveryTime = calculateRecoveryTime(values);
    const recoveryPhase = getRecoveryPhase(values.hoursSinceExercise, estimatedRecoveryTime);
    
    let interpretation = '';
    let recommendations: string[] = [];
    let preventionTips: string[] = [];

    if (estimatedRecoveryTime <= 24) {
      interpretation = 'Your estimated recovery time is relatively short, indicating good fitness adaptation and recovery factors.';
      recommendations = [
        'Continue light movement and stretching',
        'Focus on hydration and nutrition',
        'Get adequate sleep',
        'Consider active recovery activities'
      ];
    } else if (estimatedRecoveryTime <= 48) {
      interpretation = 'Your recovery time is moderate, which is normal for intense or new exercise routines.';
      recommendations = [
        'Prioritize rest and recovery',
        'Use ice or heat therapy as needed',
        'Consider gentle stretching or yoga',
        'Ensure proper nutrition and hydration'
      ];
    } else {
      interpretation = 'Your estimated recovery time is longer, suggesting you may need more rest or have factors affecting recovery.';
      recommendations = [
        'Take complete rest from intense exercise',
        'Focus on sleep and stress management',
        'Consider consulting a healthcare provider',
        'Evaluate your training program for overtraining'
      ];
    }

    preventionTips = [
      'Gradually increase exercise intensity and duration',
      'Include proper warm-up and cool-down routines',
      'Maintain consistent hydration throughout the day',
      'Prioritize 7-9 hours of quality sleep',
      'Include rest days in your training schedule',
      'Consider massage or foam rolling for muscle maintenance'
    ];

    setResult({
      estimatedRecoveryTime,
      recoveryPhase,
      interpretation,
      recommendations,
      preventionTips,
    });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      value={field.value ?? ''} 
                      onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fitness level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner (0-6 months)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (6 months - 2 years)</SelectItem>
                      <SelectItem value="advanced">Advanced (2+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <FormField 
              control={form.control} 
              name="exerciseType" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exercise Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select exercise type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="strength">Strength Training</SelectItem>
                      <SelectItem value="cardio">Cardio</SelectItem>
                      <SelectItem value="hiit">HIIT</SelectItem>
                      <SelectItem value="endurance">Endurance</SelectItem>
                      <SelectItem value="flexibility">Flexibility/Stretching</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <FormField 
              control={form.control} 
              name="exerciseIntensity" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exercise Intensity</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select intensity level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low (50-60% max effort)</SelectItem>
                      <SelectItem value="moderate">Moderate (60-70% max effort)</SelectItem>
                      <SelectItem value="high">High (70-85% max effort)</SelectItem>
                      <SelectItem value="very_high">Very High (85%+ max effort)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <FormField 
              control={form.control} 
              name="exerciseDuration" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exercise Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter duration in minutes"
                      {...field} 
                      value={field.value ?? ''} 
                      onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <FormField 
              control={form.control} 
              name="sorenessLevel" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Soreness Level</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select soreness level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="mild">Mild (slight discomfort)</SelectItem>
                      <SelectItem value="moderate">Moderate (noticeable stiffness)</SelectItem>
                      <SelectItem value="severe">Severe (significant pain/movement limitation)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <FormField 
              control={form.control} 
              name="hoursSinceExercise" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hours Since Exercise</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter hours since exercise"
                      {...field} 
                      value={field.value ?? ''} 
                      onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <FormField 
              control={form.control} 
              name="sleepQuality" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sleep Quality Last Night</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sleep quality" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="poor">Poor (fragmented, restless)</SelectItem>
                      <SelectItem value="fair">Fair (some interruptions)</SelectItem>
                      <SelectItem value="good">Good (mostly uninterrupted)</SelectItem>
                      <SelectItem value="excellent">Excellent (deep, restorative)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <FormField 
              control={form.control} 
              name="hydrationLevel" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hydration Level</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select hydration level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="poor">Poor (dehydrated)</SelectItem>
                      <SelectItem value="fair">Fair (slightly dehydrated)</SelectItem>
                      <SelectItem value="good">Good (well hydrated)</SelectItem>
                      <SelectItem value="excellent">Excellent (optimally hydrated)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} 
            />
          </div>
          <Button type="submit">Estimate Recovery Time</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Activity className="h-8 w-8 text-primary" />
                <CardTitle>Recovery Estimation</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{result.estimatedRecoveryTime}h</p>
                  <p className="text-sm text-muted-foreground">Estimated Recovery Time</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{result.recoveryPhase}</p>
                  <p className="text-sm text-muted-foreground">Current Recovery Phase</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recovery Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{result.interpretation}</p>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Current Recommendations:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {result.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Future Prevention Tips:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {result.preventionTips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>
              This calculator estimates muscle soreness recovery time by analyzing multiple factors that influence 
              the body's healing process. It considers your age, fitness level, exercise characteristics, and 
              recovery factors like sleep and hydration to provide personalized recovery estimates.
            </p>
            <p>
              The algorithm accounts for the different phases of muscle recovery: acute response, inflammation, 
              repair, and remodeling. Each factor is weighted based on scientific research on exercise recovery.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="guide">
          <AccordionTrigger>Complete Guide to Muscle Recovery</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Understanding Muscle Soreness</h4>
              <p>
                Delayed Onset Muscle Soreness (DOMS) typically occurs 24-72 hours after exercise and is caused by 
                microscopic damage to muscle fibers. This is a normal part of the adaptation process that leads to 
                increased strength and endurance.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Recovery Phases</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Acute Phase (0-6 hours):</strong> Initial inflammatory response and energy depletion</li>
                <li><strong>Inflammatory Phase (6-24 hours):</strong> Swelling, pain, and immune response activation</li>
                <li><strong>Repair Phase (24-72 hours):</strong> Protein synthesis and tissue regeneration</li>
                <li><strong>Remodeling Phase (3-7 days):</strong> Tissue strengthening and adaptation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Factors Affecting Recovery</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Age:</strong> Recovery time increases with age due to slower protein synthesis</li>
                <li><strong>Fitness Level:</strong> Trained individuals recover faster due to better adaptation</li>
                <li><strong>Exercise Type:</strong> Eccentric exercises cause more muscle damage</li>
                <li><strong>Intensity & Duration:</strong> Higher intensity and longer duration increase recovery needs</li>
                <li><strong>Sleep:</strong> Growth hormone release during sleep is crucial for recovery</li>
                <li><strong>Nutrition:</strong> Protein and carbohydrates support muscle repair</li>
                <li><strong>Hydration:</strong> Proper fluid balance supports metabolic processes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Recovery Strategies</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Active Recovery:</strong> Light movement improves blood flow and reduces stiffness</li>
                <li><strong>Sleep:</strong> Aim for 7-9 hours of quality sleep for optimal recovery</li>
                <li><strong>Nutrition:</strong> Consume protein and carbohydrates within 2 hours post-exercise</li>
                <li><strong>Hydration:</strong> Drink water consistently throughout the day</li>
                <li><strong>Stress Management:</strong> High stress levels can impair recovery</li>
                <li><strong>Massage/Foam Rolling:</strong> Can help reduce muscle tension and improve circulation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">When to Seek Medical Attention</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Severe pain that doesn't improve after 7 days</li>
                <li>Significant swelling or bruising</li>
                <li>Loss of range of motion</li>
                <li>Dark urine (possible rhabdomyolysis)</li>
                <li>Fever or signs of infection</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related-calculators">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Fitness & Training</h4>
                <ul className="space-y-1">
                  <li><a href="/category/health-fitness/one-rep-max-calculator" className="text-primary underline">One Rep Max Calculator</a></li>
                  <li><a href="/category/health-fitness/calorie-burn-calculator" className="text-primary underline">Calorie Burn Calculator</a></li>
                  <li><a href="/category/health-fitness/heart-rate-zones-calculator" className="text-primary underline">Heart Rate Zones Calculator</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Recovery & Health</h4>
                <ul className="space-y-1">
                  <li><a href="/category/health-fitness/sleep-quality-calculator" className="text-primary underline">Sleep Quality Calculator</a></li>
                  <li><a href="/category/health-fitness/hydration-calculator" className="text-primary underline">Hydration Calculator</a></li>
                  <li><a href="/category/health-fitness/stress-level-calculator" className="text-primary underline">Stress Level Calculator</a></li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
