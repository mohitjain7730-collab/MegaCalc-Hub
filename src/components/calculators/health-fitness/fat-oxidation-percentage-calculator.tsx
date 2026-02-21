'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Zap, Target, AlertTriangle, Shield, Flame } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  heartRate: z.number({ invalid_type_error: 'Enter heart rate' }).min(50).max(220),
  maxHeartRate: z.number({ invalid_type_error: 'Enter max heart rate' }).min(150).max(220),
  exerciseIntensity: z.number({ invalid_type_error: 'Enter exercise intensity' }).min(1).max(10),
  carbIntake: z.number({ invalid_type_error: 'Enter carb intake' }).min(0).max(500),
  trainingDuration: z.number({ invalid_type_error: 'Enter training duration' }).min(10).max(300),
  bodyFatPercent: z.number({ invalid_type_error: 'Enter body fat percent' }).min(5).max(50),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  heartRate: number;
  maxHeartRate: number;
  exerciseIntensity: number;
  carbIntake: number;
  trainingDuration: number;
  bodyFatPercent: number;
  fatOxidationPercent: number;
  fatCaloriesPerHour: number;
  carbOxidationPercent: number;
  optimalZone: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your heart rate during exercise (bpm).',
  'Enter your maximum heart rate (bpm).',
  'Enter exercise intensity (1-10 scale).',
  'Enter your recent carbohydrate intake (grams).',
  'Enter training duration (minutes).',
  'Enter your body fat percentage.',
  'Review fat oxidation percentage and recommendations.',
];

const faqs = [
  {
    question: 'What is fat oxidation?',
    answer:
      'Fat oxidation is the process of burning fat for energy during exercise. The percentage indicates what proportion of your energy comes from fat versus carbohydrates. Higher fat oxidation is beneficial for endurance and fat loss.',
  },
  {
    question: 'What is a good fat oxidation percentage?',
    answer:
      'Fat oxidation varies by intensity. At low intensity (50-65% max HR): 60-80% from fat. At moderate intensity (65-75% max HR): 40-60% from fat. At high intensity (75%+ max HR): 20-40% from fat. Higher percentages at moderate intensities indicate better metabolic flexibility.',
  },
  {
    question: 'How does heart rate affect fat oxidation?',
    answer:
      'Fat oxidation is highest at lower heart rates (50-70% max HR). As heart rate increases, the body shifts to more carbohydrate oxidation. Training at moderate intensities (65-75% max HR) can improve fat oxidation capacity.',
  },
  {
    question: 'How does carb intake affect fat oxidation?',
    answer:
      'Higher carbohydrate intake before/during exercise reduces fat oxidation as the body prefers readily available carbs. Lower carb intake or fasted training increases fat oxidation. This is why fasted cardio can enhance fat burning.',
  },
  {
    question: 'Can I improve my fat oxidation?',
    answer:
      'Yes, through: 1) Low-intensity steady-state training (LISS) at 60-70% max HR, 2) Fasted cardio, 3) Low-carb training periods, 4) Endurance training adaptations, 5) Improving metabolic flexibility through varied training intensities.',
  },
  {
    question: 'Is higher fat oxidation always better?',
    answer:
      'Not necessarily. High-intensity training (lower fat oxidation) is important for performance, power, and metabolic benefits. Balance is key: include both low-intensity (high fat oxidation) and high-intensity (lower fat oxidation) training.',
  },
  {
    question: 'How long does it take to improve fat oxidation?',
    answer:
      'Improvements in fat oxidation capacity typically occur over 4-12 weeks of consistent training. Endurance athletes often have superior fat oxidation due to training adaptations. Regular low-intensity training is key.',
  },
  {
    question: 'Should I train fasted to increase fat oxidation?',
    answer:
      'Fasted training can increase fat oxidation during that session, but total fat loss depends on overall calorie balance. Fasted training works well for some but may reduce performance. Experiment to find what works for you.',
  },
];

const relatedCalculators = [
  {
    name: 'Metabolic Adaptation Rate Calculator',
    slug: 'metabolic-adaptation-rate-calculator',
    description: 'Assess metabolic health and adaptation.',
  },
  {
    name: 'Reverse Dieting Calorie Increase Planner',
    slug: 'reverse-dieting-calorie-increase-planner',
    description: 'Plan reverse dieting after metabolic adaptation.',
  },
  {
    name: 'Carb Refeed Timing Calculator',
    slug: 'carb-refeed-timing-calculator',
    description: 'Plan carb intake around training.',
  },
  {
    name: 'Glycogen Replenishment Estimator (post-workout)',
    slug: 'glycogen-replenishment-estimator-post-workout',
    description: 'Estimate glycogen needs after training.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/fat-oxidation-percentage-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Fat Oxidation Percentage Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Fat Oxidation Percentage Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate fat oxidation percentage from heart rate, max heart rate, exercise intensity, carb intake, training duration, and body fat percent.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const heartRate = values.heartRate;
  const maxHeartRate = values.maxHeartRate;
  const exerciseIntensity = values.exerciseIntensity;
  const carbIntake = values.carbIntake;
  const trainingDuration = values.trainingDuration;
  const bodyFatPercent = values.bodyFatPercent;
  
  // Calculate heart rate percentage
  const hrPercent = (heartRate / maxHeartRate) * 100;
  
  // Base fat oxidation percentage based on heart rate
  // Higher HR = lower fat oxidation
  let fatOxidationPercent = 0;
  
  if (hrPercent < 60) {
    fatOxidationPercent = 75; // Very low intensity
  } else if (hrPercent < 65) {
    fatOxidationPercent = 70;
  } else if (hrPercent < 70) {
    fatOxidationPercent = 60;
  } else if (hrPercent < 75) {
    fatOxidationPercent = 50;
  } else if (hrPercent < 80) {
    fatOxidationPercent = 35;
  } else if (hrPercent < 85) {
    fatOxidationPercent = 25;
  } else if (hrPercent < 90) {
    fatOxidationPercent = 15;
  } else {
    fatOxidationPercent = 10; // Very high intensity
  }
  
  // Adjust for carb intake (higher carbs = lower fat oxidation)
  if (carbIntake > 100) {
    fatOxidationPercent -= 15;
  } else if (carbIntake > 50) {
    fatOxidationPercent -= 10;
  } else if (carbIntake > 25) {
    fatOxidationPercent -= 5;
  } else if (carbIntake < 10) {
    fatOxidationPercent += 10; // Fasted/low carb
  }
  
  // Adjust for body fat (higher body fat can slightly increase fat oxidation capacity)
  if (bodyFatPercent > 25) {
    fatOxidationPercent += 5;
  } else if (bodyFatPercent < 12) {
    fatOxidationPercent -= 3; // Very lean may have lower fat oxidation
  }
  
  // Adjust for exercise intensity scale
  if (exerciseIntensity <= 3) {
    fatOxidationPercent += 10; // Low intensity
  } else if (exerciseIntensity >= 8) {
    fatOxidationPercent -= 15; // High intensity
  }
  
  fatOxidationPercent = clamp(fatOxidationPercent, 5, 85);
  const carbOxidationPercent = 100 - fatOxidationPercent;
  
  // Estimate calories burned (rough estimate: 10-15 cal/min depending on intensity)
  const caloriesPerMinute = 8 + (exerciseIntensity * 0.7);
  const totalCalories = caloriesPerMinute * trainingDuration;
  const fatCaloriesPerHour = (fatOxidationPercent / 100) * (caloriesPerMinute * 60);
  
  // Determine optimal zone
  let optimalZone = 'High intensity zone';
  if (fatOxidationPercent >= 60) {
    optimalZone = 'Optimal fat burning zone';
  } else if (fatOxidationPercent >= 40) {
    optimalZone = 'Moderate fat burning zone';
  } else if (fatOxidationPercent >= 25) {
    optimalZone = 'Mixed fuel zone';
  } else {
    optimalZone = 'Carbohydrate dominant zone';
  }
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your fat oxidation percentage is optimal for your current training intensity. This indicates good metabolic flexibility and efficient fat utilization.';
  
  if (fatOxidationPercent < 20 && hrPercent < 75) {
    status = 'low';
    interpretation = 'Fat oxidation is lower than expected for this intensity. This may indicate poor metabolic flexibility, high carb availability, or need for low-intensity training adaptations.';
  } else if (fatOxidationPercent < 30 && hrPercent < 70) {
    status = 'moderate';
    interpretation = 'Fat oxidation is moderate but could be improved. Consider training at lower intensities, reducing pre-workout carbs, or including more low-intensity steady-state training.';
  } else if (fatOxidationPercent >= 40 && hrPercent < 75) {
    status = 'good';
    interpretation = 'Fat oxidation is good for this intensity. You are efficiently utilizing fat as a fuel source, indicating good metabolic flexibility.';
  } else if (fatOxidationPercent >= 60) {
    status = 'optimal';
    interpretation = 'Fat oxidation is excellent. You are in an optimal fat-burning zone, efficiently utilizing fat for energy. This is ideal for endurance and fat loss goals.';
  } else if (hrPercent >= 85) {
    status = 'good';
    interpretation = 'At high intensities, lower fat oxidation is normal as the body shifts to carbohydrates. This is expected and appropriate for high-intensity training.';
  }
  
  const recommendations: string[] = [];
  
  // Fat oxidation percentage recommendations
  if (fatOxidationPercent >= 60) {
    recommendations.push(`Excellent fat oxidation (${fatOxidationPercent.toFixed(1)}%): you're in an optimal fat-burning zone. At ${hrPercent.toFixed(0)}% max HR, this indicates excellent metabolic flexibility. Continue this intensity for fat loss and endurance benefits.`);
  } else if (fatOxidationPercent >= 40) {
    recommendations.push(`Good fat oxidation (${fatOxidationPercent.toFixed(1)}%): efficient fat utilization at ${hrPercent.toFixed(0)}% max HR. This is a good balance for fat loss and performance. Consider maintaining this intensity or slightly reducing for higher fat oxidation.`);
  } else if (fatOxidationPercent >= 25) {
    recommendations.push(`Moderate fat oxidation (${fatOxidationPercent.toFixed(1)}%): mixed fuel utilization at ${hrPercent.toFixed(0)}% max HR. For higher fat oxidation, reduce intensity to 60-70% max HR or reduce pre-workout carb intake.`);
  } else {
    recommendations.push(`Low fat oxidation (${fatOxidationPercent.toFixed(1)}%): primarily carbohydrate utilization at ${hrPercent.toFixed(0)}% max HR. ${hrPercent >= 80 ? 'This is normal at high intensities.' : 'To increase fat oxidation, reduce intensity to 60-70% max HR, reduce carb intake before training, or try fasted training.'}`);
  }
  
  // Heart rate recommendations
  if (hrPercent < 60) {
    recommendations.push(`Very low intensity (${hrPercent.toFixed(0)}% max HR): excellent for fat oxidation but may be too easy for fitness gains. Consider increasing to 60-70% max HR for optimal fat burning with fitness benefits.`);
  } else if (hrPercent >= 60 && hrPercent < 70) {
    recommendations.push(`Low-moderate intensity (${hrPercent.toFixed(0)}% max HR): optimal zone for fat oxidation. This intensity maximizes fat burning while maintaining training benefits. Continue training in this zone for fat loss goals.`);
  } else if (hrPercent >= 70 && hrPercent < 75) {
    recommendations.push(`Moderate intensity (${hrPercent.toFixed(0)}% max HR): good balance between fat and carb oxidation. This zone supports both fat loss and fitness improvements.`);
  } else if (hrPercent >= 75 && hrPercent < 80) {
    recommendations.push(`Moderate-high intensity (${hrPercent.toFixed(0)}% max HR): primarily carbohydrate utilization. This is appropriate for performance training but less optimal for fat oxidation. Include lower intensity sessions for fat burning.`);
  } else {
    recommendations.push(`High intensity (${hrPercent.toFixed(0)}% max HR): primarily carbohydrate utilization, which is normal at high intensities. This zone is important for performance but should be balanced with lower intensity training for fat oxidation.`);
  }
  
  // Carb intake recommendations
  if (carbIntake > 100) {
    recommendations.push(`High carb intake (${carbIntake}g): this significantly reduces fat oxidation. For higher fat oxidation, reduce to <50g before training or try fasted/low-carb training. Current intake prioritizes performance over fat oxidation.`);
  } else if (carbIntake > 50) {
    recommendations.push(`Moderate carb intake (${carbIntake}g): this reduces fat oxidation somewhat. For higher fat oxidation, reduce to <25g or train fasted. Current intake balances performance and fat oxidation.`);
  } else if (carbIntake > 25) {
    recommendations.push(`Low-moderate carb intake (${carbIntake}g): good for fat oxidation while maintaining some performance. This level supports both fat burning and training quality.`);
  } else if (carbIntake > 0) {
    recommendations.push(`Very low carb intake (${carbIntake}g): excellent for maximizing fat oxidation. This level significantly enhances fat burning during training.`);
  } else {
    recommendations.push(`Fasted training: optimal for fat oxidation. Training in a fasted state maximizes fat burning. Ensure adequate hydration and consider post-workout nutrition.`);
  }
  
  // Training duration recommendations
  if (trainingDuration < 30) {
    recommendations.push(`Short training duration (${trainingDuration} min): for fat oxidation benefits, consider extending to 45-60 minutes at low-moderate intensity (60-70% max HR) to maximize fat burning.`);
  } else if (trainingDuration >= 30 && trainingDuration < 60) {
    recommendations.push(`Moderate training duration (${trainingDuration} min): good for fat oxidation. This duration allows for significant fat burning, especially at 60-70% max HR.`);
  } else if (trainingDuration >= 60 && trainingDuration < 90) {
    recommendations.push(`Long training duration (${trainingDuration} min): excellent for fat oxidation. Longer durations at low-moderate intensity maximize total fat calories burned.`);
  } else {
    recommendations.push(`Very long training duration (${trainingDuration} min): excellent for fat oxidation but ensure adequate fueling and recovery. At this duration, fat becomes increasingly important as fuel.`);
  }
  
  // Body fat recommendations
  if (bodyFatPercent > 25) {
    recommendations.push(`Higher body fat (${bodyFatPercent.toFixed(1)}%): focus on low-moderate intensity training (60-70% max HR) for optimal fat oxidation and fat loss. Include 3-5 sessions per week of 45-60 minutes.`);
  } else if (bodyFatPercent >= 15 && bodyFatPercent <= 25) {
    recommendations.push(`Moderate body fat (${bodyFatPercent.toFixed(1)}%): good balance. Include both low-intensity (high fat oxidation) and high-intensity training for comprehensive fitness and fat loss.`);
  } else {
    recommendations.push(`Low body fat (${bodyFatPercent.toFixed(1)}%): at this level, focus shifts to performance and maintenance. Fat oxidation is still important but balance with high-intensity training for metabolic benefits.`);
  }
  
  // Exercise intensity recommendations
  if (exerciseIntensity <= 3) {
    recommendations.push(`Low exercise intensity (${exerciseIntensity}/10): excellent for fat oxidation. This intensity maximizes fat burning. Consider increasing slightly to 4-5/10 for better fitness gains while maintaining high fat oxidation.`);
  } else if (exerciseIntensity >= 4 && exerciseIntensity <= 6) {
    recommendations.push(`Moderate exercise intensity (${exerciseIntensity}/10): good balance for fat oxidation and fitness. This zone supports both fat loss and performance improvements.`);
  } else if (exerciseIntensity >= 7 && exerciseIntensity <= 8) {
    recommendations.push(`High exercise intensity (${exerciseIntensity}/10): primarily carbohydrate utilization, which is appropriate for performance training. Balance with lower intensity sessions for fat oxidation.`);
  } else {
    recommendations.push(`Very high exercise intensity (${exerciseIntensity}/10): primarily carbohydrate utilization, which is normal. This intensity is important for performance but should be balanced with low-intensity training for fat oxidation.`);
  }
  
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Improve fat oxidation: include 2-3 weekly sessions of low-intensity steady-state training (60-70% max HR) for 45-60 minutes. Consider fasted training or reducing pre-workout carbs to enhance fat oxidation capacity.');
  }
  
  const plan = [
    { label: 'This Week', detail: `Based on current fat oxidation (${fatOxidationPercent.toFixed(1)}%), include 2-3 sessions at 60-70% max HR for 45-60 minutes to improve fat oxidation. ${carbIntake > 50 ? 'Reduce pre-workout carbs to <25g or try fasted training.' : 'Continue current approach.'}` },
    { label: 'This Month', detail: `Build fat oxidation capacity: include regular low-intensity training (60-70% max HR), reduce pre-workout carbs when possible, and consider fasted training 1-2x per week. Monitor improvements in fat oxidation at moderate intensities.` },
    { label: 'Ongoing', detail: `Maintain metabolic flexibility: balance low-intensity (high fat oxidation) and high-intensity (performance) training. Aim for 40-60% fat oxidation at 65-75% max HR. Regular low-intensity training maintains and improves fat oxidation capacity for long-term metabolic health.` },
  ];
  
  return { heartRate, maxHeartRate, exerciseIntensity, carbIntake, trainingDuration, bodyFatPercent, fatOxidationPercent, fatCaloriesPerHour, carbOxidationPercent, optimalZone, status, interpretation, recommendations, plan };
};

export default function FatOxidationPercentageCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      heartRate: undefined,
      maxHeartRate: undefined,
      exerciseIntensity: undefined,
      carbIntake: undefined,
      trainingDuration: undefined,
      bodyFatPercent: undefined,
    },
  });
  
  return (
    <div className="space-y-8">
      <Script id="fat-oxidation-percentage-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            Fat Oxidation Percentage Calculator
          </CardTitle>
          <CardDescription>Calculate fat oxidation percentage from heart rate, max heart rate, exercise intensity, carb intake, training duration, and body fat percent.</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Input your training data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="heartRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Heart rate (bpm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 140" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxHeartRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max heart rate (bpm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 190" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="exerciseIntensity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exercise intensity (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="carbIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carb intake (grams)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 50" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="trainingDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Training duration (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 45" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bodyFatPercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body fat percent (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 18" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate fat oxidation percentage
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Interactive results
            </CardTitle>
            <CardDescription>See fat oxidation percentage and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Fat oxidation</p>
                <p className="text-2xl font-semibold text-primary">{result.fatOxidationPercent.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Of total energy</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Carb oxidation</p>
                <p className="text-2xl font-semibold text-primary">{result.carbOxidationPercent.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Of total energy</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Fat calories/hour</p>
                <p className="text-2xl font-semibold text-primary">{result.fatCaloriesPerHour.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">cal/hr</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                    {result.recommendations.map((rec) => (
                      <li key={rec}>{rec}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Action plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {result.plan.map((step) => (
                      <li key={step.label}>
                        <span className="font-semibold">{step.label}:</span> {step.detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Formula
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Fat oxidation percentage</strong> = calculated from heart rate, exercise intensity, carb intake, training duration, and body fat. Higher intensities and carb intake reduce fat oxidation, while lower intensities and fasted states increase it.
          </p>
          <p>
            <strong>Optimal fat oxidation zone</strong> = typically 60-75% of max heart rate, where fat oxidation is maximized while maintaining sustainable exercise intensity.
          </p>
          <p>
            <strong>Fat calories per hour</strong> = estimated from fat oxidation percentage and total energy expenditure during exercise.
          </p>
          <p>Fat oxidation is the process of burning fat for energy during exercise. Understanding your fat oxidation rate helps optimize training zones for fat loss and endurance performance.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional calculations</CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Optimal zone</p>
                <p className="text-xl font-semibold text-primary">{result.optimalZone}</p>
                <p className="text-xs text-muted-foreground">Training zone</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Exercise intensity</p>
                <p className="text-xl font-semibold text-primary">{result.interpretation.includes('moderate') ? 'Moderate' : result.interpretation.includes('high') ? 'High' : 'Low'}</p>
                <p className="text-xs text-muted-foreground">Intensity level</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Fuel utilization</p>
                <p className="text-xl font-semibold text-primary">{result.fatOxidationPercent > 50 ? 'Fat Dominant' : 'Carb Dominant'}</p>
                <p className="text-xs text-muted-foreground">Primary fuel</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your exercise data to see additional insights.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related calculators</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relatedCalculators.map((calc) => (
            <div key={calc.slug} className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href={`/health-fitness/${calc.slug}`} className="text-primary hover:underline">
                  {calc.name}
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">{calc.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope={true} itemType="https://schema.org/MedicalWebPage">
        <meta itemProp="name" content="The Definitive Guide to Fat Oxidation: Understanding Fuel Utilization During Exercise" />
        <meta itemProp="description" content="An in-depth, authoritative guide on fat oxidation during exercise, detailing how exercise intensity, heart rate, carb intake, and body composition affect fat burning rates." />
        <meta itemProp="keywords" content="fat oxidation calculator, fat burning zone, exercise intensity, heart rate zones, fuel utilization" />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-02" />
        <meta itemProp="url" content="/definitive-fat-oxidation-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Fat Oxidation: Understanding Fuel Utilization During Exercise</h1>
        <p className="text-lg italic text-gray-700">Explore how exercise intensity, heart rate, carbohydrate intake, and body composition affect fat oxidation rates and optimize your training for maximum fat burning.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li><a href="#what-is" className="hover:underline">What is Fat Oxidation?</a></li>
          <li><a href="#factors" className="hover:underline">Factors Affecting Fat Oxidation</a></li>
          <li><a href="#zones" className="hover:underline">Fat Burning Zones</a></li>
          <li><a href="#optimization" className="hover:underline">Optimizing Fat Oxidation</a></li>
        </ul>
        <hr />

        <h2 id="what-is" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Fat Oxidation?</h2>
        <p>Fat oxidation is the metabolic process of breaking down stored fat (triglycerides) into fatty acids and glycerol to produce energy (ATP) during exercise. The body uses both fat and carbohydrates as fuel sources, with the ratio depending on exercise intensity, duration, and nutritional status.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Fat vs. Carbohydrate Oxidation</h3>
        <p>During exercise, the body uses both fat and carbohydrates:</p>
        <ul>
          <li><b>Fat Oxidation:</b> Slower process, provides more energy per gram, but requires more oxygen. Dominant at lower intensities.</li>
          <li><b>Carbohydrate Oxidation:</b> Faster process, provides quick energy. Dominant at higher intensities.</li>
          <li><b>Crossover Point:</b> The exercise intensity where fat and carb oxidation are equal. Above this point, carb oxidation dominates.</li>
        </ul>

        <h2 id="factors" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Factors Affecting Fat Oxidation</h2>
        <p>Several factors influence fat oxidation rates:</p>
        <ul>
          <li><b>Exercise Intensity:</b> Lower intensities (50-65% VO2max) maximize fat oxidation. Higher intensities shift to carb oxidation.</li>
          <li><b>Heart Rate:</b> Fat oxidation is highest at 60-75% of max heart rate (the "fat burning zone").</li>
          <li><b>Carbohydrate Intake:</b> Higher carb intake before/during exercise reduces fat oxidation by providing readily available glucose.</li>
          <li><b>Training Duration:</b> Longer duration exercise increases fat oxidation as glycogen stores deplete.</li>
          <li><b>Body Fat Percentage:</b> Higher body fat may increase fat oxidation capacity, but fitness level matters more.</li>
          <li><b>Training Status:</b> Endurance-trained individuals have higher fat oxidation rates at all intensities.</li>
        </ul>

        <h2 id="zones" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Fat Burning Zones</h2>
        <p>Exercise intensity zones affect fuel utilization:</p>
        <ul>
          <li><b>Zone 1 (50-60% max HR):</b> Very light, primarily fat oxidation, sustainable for hours.</li>
          <li><b>Zone 2 (60-70% max HR):</b> Light, optimal fat oxidation zone, sustainable for extended periods.</li>
          <li><b>Zone 3 (70-80% max HR):</b> Moderate, mixed fuel use, good for endurance training.</li>
          <li><b>Zone 4 (80-90% max HR):</b> Hard, primarily carb oxidation, shorter duration.</li>
          <li><b>Zone 5 (90-100% max HR):</b> Very hard, almost entirely carb oxidation, very short duration.</li>
        </ul>

        <h2 id="optimization" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Optimizing Fat Oxidation</h2>
        <p>To maximize fat oxidation:</p>
        <ul>
          <li><b>Train in Zone 2:</b> 60-75% max heart rate for optimal fat burning.</li>
          <li><b>Fasted Cardio:</b> Exercising in a fasted state (after overnight fast) can increase fat oxidation.</li>
          <li><b>Low-Carb Training:</b> Training with low carb availability can enhance fat oxidation capacity.</li>
          <li><b>Endurance Training:</b> Regular endurance training improves fat oxidation at all intensities.</li>
          <li><b>Longer Duration:</b> Extended exercise sessions (60+ minutes) increase fat oxidation as glycogen depletes.</li>
        </ul>

        <hr />
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Fat oxidation is maximized at moderate exercise intensities (60-75% max heart rate) with lower carbohydrate availability. Understanding your fat oxidation percentage helps optimize training zones for fat loss goals while balancing performance needs. Both high-intensity and low-intensity training have benefits, but for maximizing fat oxidation, moderate-intensity, longer-duration exercise is optimal.</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>FAQs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.question}>
              <h4 className="font-semibold">{faq.question}</h4>
              <p className="text-sm text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>This tool calculates fat oxidation percentage from heart rate, max heart rate, exercise intensity, carb intake, training duration, and body fat percent.</p>
          <p>Outputs include fat oxidation percentage, carb oxidation percentage, fat calories per hour, optimal zone, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


