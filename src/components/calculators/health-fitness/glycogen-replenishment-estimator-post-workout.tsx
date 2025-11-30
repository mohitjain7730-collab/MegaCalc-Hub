'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Zap, Target, AlertTriangle, Shield, Battery } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  workoutDuration: z.number({ invalid_type_error: 'Enter workout duration' }).min(15).max(300),
  workoutIntensity: z.number({ invalid_type_error: 'Enter workout intensity' }).min(1).max(10),
  workoutType: z.enum(['cardio', 'strength', 'hiit', 'endurance', 'mixed']),
  bodyWeight: z.number({ invalid_type_error: 'Enter body weight' }).min(80).max(400),
  currentGlycogen: z.number({ invalid_type_error: 'Enter current glycogen' }).min(0).max(100).optional(),
  carbIntakePostWorkout: z.number({ invalid_type_error: 'Enter post-workout carbs' }).min(0).max(500),
  timeSinceWorkout: z.number({ invalid_type_error: 'Enter time since workout' }).min(0).max(24),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  workoutDuration: number;
  workoutIntensity: number;
  workoutType: string;
  bodyWeight: number;
  currentGlycogen: number;
  carbIntakePostWorkout: number;
  timeSinceWorkout: number;
  glycogenDepleted: number;
  glycogenNeeded: number;
  replenishmentRate: number;
  hoursToReplenish: number;
  replenishmentPercent: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter workout duration (minutes).',
  'Enter workout intensity (1-10 scale).',
  'Select workout type.',
  'Enter your body weight (lbs).',
  'Enter estimated current glycogen level (0-100%, optional).',
  'Enter post-workout carbohydrate intake (grams).',
  'Enter hours since workout completion.',
  'Review glycogen replenishment estimates and recommendations.',
];

const faqs = [
  {
    question: 'What is glycogen?',
    answer:
      'Glycogen is stored glucose in muscles and liver, used as primary fuel during exercise. Replenishing glycogen after workouts is important for recovery, performance, and preventing muscle breakdown.',
  },
  {
    question: 'How much glycogen is depleted during exercise?',
    answer:
      'Depletion depends on intensity and duration. High-intensity training (HIIT, heavy lifting): 30-50% depletion. Moderate endurance (60-90 min): 40-60% depletion. Long endurance (2+ hours): 60-80% depletion. Full depletion is rare.',
  },
  {
    question: 'How much carbohydrate is needed to replenish glycogen?',
    answer:
      'Typically 1.2-1.5g carbs per kg body weight within 2 hours post-workout for optimal replenishment. For a 70kg person: 84-105g carbs. Total daily needs: 5-7g carbs per kg body weight for active individuals.',
  },
  {
    question: 'What is the glycogen replenishment window?',
    answer:
      'The "glycogen window" is the 30-60 minutes post-workout when glycogen synthesis is highest (up to 2x faster). However, adequate carbs within 2-4 hours post-workout still effectively replenish glycogen.',
  },
  {
    question: 'How long does glycogen replenishment take?',
    answer:
      'With adequate carbs: 20-24 hours for full replenishment after moderate exercise, 24-48 hours after intense/long exercise. Without adequate carbs: 3-5 days for full replenishment. Proper nutrition accelerates this significantly.',
  },
  {
    question: 'What foods are best for glycogen replenishment?',
    answer:
      'Fast-digesting carbs: white rice, potatoes, white bread, fruits, sports drinks. Include some protein (20-30g) to enhance glycogen synthesis. Avoid excessive fat/fiber immediately post-workout as it slows carb absorption.',
  },
  {
    question: 'Does protein help with glycogen replenishment?',
    answer:
      'Yes, protein (20-30g) consumed with carbs post-workout enhances glycogen synthesis by 20-30% compared to carbs alone. It also supports muscle repair. Aim for 3:1 or 4:1 carb-to-protein ratio post-workout.',
  },
  {
    question: 'What if I train again within 24 hours?',
    answer:
      'If training again within 24 hours, prioritize immediate post-workout nutrition (1.2-1.5g carbs/kg within 2 hours). Consider additional carbs throughout the day. Incomplete replenishment can affect next session performance.',
  },
];

const relatedCalculators = [
  {
    name: 'Metabolic Adaptation Rate Calculator',
    slug: 'metabolic-adaptation-rate-calculator',
    description: 'Assess metabolic health and recovery.',
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
    name: 'Fat Oxidation Percentage Calculator',
    slug: 'fat-oxidation-percentage-calculator',
    description: 'Understand fuel utilization during training.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/glycogen-replenishment-estimator-post-workout';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Glycogen Replenishment Estimator (post-workout)', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Glycogen Replenishment Estimator (post-workout)',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate glycogen replenishment needs from workout duration, intensity, type, body weight, current glycogen, post-workout carbs, and time since workout.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const workoutDuration = values.workoutDuration;
  const workoutIntensity = values.workoutIntensity;
  const workoutType = values.workoutType;
  const bodyWeight = values.bodyWeight;
  const currentGlycogen = values.currentGlycogen ?? 50; // Default estimate
  const carbIntakePostWorkout = values.carbIntakePostWorkout;
  const timeSinceWorkout = values.timeSinceWorkout;
  
  // Estimate glycogen depletion based on workout
  let glycogenDepleted = 0;
  
  if (workoutType === 'hiit' || workoutType === 'strength') {
    glycogenDepleted = 30 + (workoutIntensity - 5) * 5; // 30-50% for high intensity
  } else if (workoutType === 'cardio') {
    glycogenDepleted = 20 + (workoutDuration / 60) * 20; // 20-60% based on duration
  } else if (workoutType === 'endurance') {
    glycogenDepleted = 40 + (workoutDuration / 60) * 30; // 40-80% for long endurance
  } else {
    glycogenDepleted = 25 + (workoutIntensity - 3) * 8; // Mixed training
  }
  
  glycogenDepleted = clamp(glycogenDepleted, 10, 80);
  
  // Estimate glycogen needed (grams)
  // Muscle glycogen capacity: ~15g per kg muscle mass
  // Assume ~40% of body weight is muscle
  const muscleMass = bodyWeight * 0.4; // lbs
  const muscleMassKg = muscleMass / 2.2; // kg
  const totalGlycogenCapacity = muscleMassKg * 15; // grams
  const glycogenNeeded = (glycogenDepleted / 100) * totalGlycogenCapacity;
  
  // Replenishment rate: ~5-6g glycogen per hour with adequate carbs
  // Enhanced rate in first 2 hours: ~8-10g/hour
  let replenishmentRate = 6; // g/hour
  
  if (timeSinceWorkout < 2) {
    replenishmentRate = 9; // Enhanced rate in first 2 hours
  } else if (timeSinceWorkout < 4) {
    replenishmentRate = 7;
  } else {
    replenishmentRate = 5; // Slower rate after 4 hours
  }
  
  // Adjust for carb intake
  if (carbIntakePostWorkout > 100) {
    replenishmentRate += 2; // High carbs enhance rate
  } else if (carbIntakePostWorkout > 50) {
    replenishmentRate += 1;
  } else if (carbIntakePostWorkout < 25) {
    replenishmentRate -= 2; // Low carbs reduce rate
  }
  
  replenishmentRate = clamp(replenishmentRate, 2, 12);
  
  // Calculate hours to replenish
  const hoursToReplenish = glycogenNeeded > 0 ? glycogenNeeded / replenishmentRate : 0;
  
  // Calculate replenishment percentage based on carbs consumed
  const carbsNeeded = glycogenNeeded * 1.2; // ~1.2g carbs per 1g glycogen (not 1:1 due to efficiency)
  const replenishmentPercent = carbsNeeded > 0 ? Math.min(100, (carbIntakePostWorkout / carbsNeeded) * 100) : 0;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Glycogen replenishment appears adequate. Your post-workout nutrition and timing support optimal recovery and glycogen restoration.';
  
  if (replenishmentPercent < 50 || carbIntakePostWorkout < 30) {
    status = 'low';
    interpretation = 'Glycogen replenishment is insufficient. Low post-workout carbohydrate intake will slow recovery and may affect next training session performance. Increase post-workout carbs.';
  } else if (replenishmentPercent < 70 || carbIntakePostWorkout < 50) {
    status = 'moderate';
    interpretation = 'Glycogen replenishment is moderate. Increasing post-workout carbohydrate intake would improve recovery and glycogen restoration rates.';
  } else if (replenishmentPercent < 90) {
    status = 'good';
    interpretation = 'Glycogen replenishment is good. Your post-workout nutrition supports adequate recovery. Slight increases may further optimize replenishment.';
  } else {
    status = 'optimal';
    interpretation = 'Glycogen replenishment is optimal. Your post-workout nutrition and timing support excellent recovery and glycogen restoration.';
  }
  
  const recommendations: string[] = [];
  
  // Glycogen depletion recommendations
  if (glycogenDepleted > 60) {
    recommendations.push(`High glycogen depletion (${glycogenDepleted.toFixed(0)}%): significant depletion from ${workoutType} training. Prioritize immediate post-workout nutrition (1.2-1.5g carbs/kg body weight) within 2 hours for optimal replenishment.`);
  } else if (glycogenDepleted > 40) {
    recommendations.push(`Moderate-high glycogen depletion (${glycogenDepleted.toFixed(0)}%): substantial depletion from ${workoutType} training. Ensure adequate post-workout carbs (1.0-1.2g/kg) within 2-4 hours.`);
  } else if (glycogenDepleted > 25) {
    recommendations.push(`Moderate glycogen depletion (${glycogenDepleted.toFixed(0)}%): moderate depletion from ${workoutType} training. Post-workout carbs (0.8-1.0g/kg) within 2-4 hours support adequate replenishment.`);
  } else {
    recommendations.push(`Low glycogen depletion (${glycogenDepleted.toFixed(0)}%): minimal depletion from ${workoutType} training. Standard post-workout nutrition (0.5-0.8g/kg) is sufficient.`);
  }
  
  // Carb intake recommendations
  const carbsNeededKg = (bodyWeight / 2.2) * 1.2; // 1.2g/kg body weight
  if (carbIntakePostWorkout < carbsNeededKg * 0.5) {
    recommendations.push(`Insufficient post-workout carbs (${carbIntakePostWorkout}g): current intake is well below recommended ${carbsNeededKg.toFixed(0)}g. Increase to 1.2-1.5g/kg body weight (${carbsNeededKg.toFixed(0)}-${(carbsNeededKg * 1.25).toFixed(0)}g) for optimal glycogen replenishment.`);
  } else if (carbIntakePostWorkout < carbsNeededKg * 0.7) {
    recommendations.push(`Low post-workout carbs (${carbIntakePostWorkout}g): below recommended ${carbsNeededKg.toFixed(0)}g. Increase to 1.0-1.2g/kg body weight (${carbsNeededKg.toFixed(0)}g) to improve glycogen replenishment.`);
  } else if (carbIntakePostWorkout >= carbsNeededKg && carbIntakePostWorkout <= carbsNeededKg * 1.5) {
    recommendations.push(`Adequate post-workout carbs (${carbIntakePostWorkout}g): meets recommended ${carbsNeededKg.toFixed(0)}g. This supports good glycogen replenishment. Continue with this approach.`);
  } else {
    recommendations.push(`High post-workout carbs (${carbIntakePostWorkout}g): exceeds recommended ${carbsNeededKg.toFixed(0)}g. While not harmful, 1.2-1.5g/kg is typically sufficient. Monitor total daily carb intake.`);
  }
  
  // Timing recommendations
  if (timeSinceWorkout < 1) {
    recommendations.push(`Excellent timing (<1 hour post-workout): you're in the optimal glycogen window. Current carb intake (${carbIntakePostWorkout}g) will be maximally effective. Continue consuming carbs within this window.`);
  } else if (timeSinceWorkout < 2) {
    recommendations.push(`Good timing (${timeSinceWorkout.toFixed(1)} hours post-workout): still within the enhanced glycogen window. Current carb intake (${carbIntakePostWorkout}g) will be effective. Continue consuming carbs.`);
  } else if (timeSinceWorkout < 4) {
    recommendations.push(`Moderate timing (${timeSinceWorkout.toFixed(1)} hours post-workout): outside optimal window but still effective. Current carb intake (${carbIntakePostWorkout}g) will support replenishment. Consider consuming carbs sooner after future workouts.`);
  } else {
    recommendations.push(`Delayed timing (${timeSinceWorkout.toFixed(1)} hours post-workout): replenishment rate is slower. Current carb intake (${carbIntakePostWorkout}g) will still help but is less optimal. Prioritize consuming carbs within 2 hours after future workouts.`);
  }
  
  // Hours to replenish recommendations
  if (hoursToReplenish > 30) {
    recommendations.push(`Slow replenishment (${hoursToReplenish.toFixed(1)} hours): replenishment will take over a day. Increase post-workout carbs to 1.2-1.5g/kg and consume within 2 hours to accelerate replenishment.`);
  } else if (hoursToReplenish > 20) {
    recommendations.push(`Moderate replenishment (${hoursToReplenish.toFixed(1)} hours): will take most of a day. Ensure adequate daily carb intake (5-7g/kg) and optimize post-workout nutrition for faster replenishment.`);
  } else if (hoursToReplenish > 12) {
    recommendations.push(`Good replenishment (${hoursToReplenish.toFixed(1)} hours): will replenish within 12-24 hours. Current approach supports adequate recovery. Continue with post-workout nutrition strategy.`);
  } else {
    recommendations.push(`Fast replenishment (${hoursToReplenish.toFixed(1)} hours): will replenish quickly. Excellent post-workout nutrition and timing. Continue this approach for optimal recovery.`);
  }
  
  // Workout type recommendations
  if (workoutType === 'endurance' || workoutType === 'hiit') {
    recommendations.push(`High-intensity/long-duration training (${workoutType}): prioritizes immediate post-workout nutrition. Consume 1.2-1.5g carbs/kg within 30-60 minutes, plus 20-30g protein to enhance glycogen synthesis.`);
  } else if (workoutType === 'strength') {
    recommendations.push(`Strength training (${workoutType}): post-workout nutrition supports recovery and glycogen replenishment. Consume 0.8-1.2g carbs/kg plus 20-30g protein within 2 hours.`);
  } else {
    recommendations.push(`Moderate training (${workoutType}): standard post-workout nutrition (0.8-1.0g carbs/kg plus 20-30g protein) within 2-4 hours supports adequate replenishment.`);
  }
  
  // Replenishment percentage recommendations
  if (replenishmentPercent < 50) {
    recommendations.push(`Low replenishment coverage (${replenishmentPercent.toFixed(0)}%): current carbs cover less than half of glycogen needs. Significantly increase post-workout carbs to improve recovery and next-session performance.`);
  } else if (replenishmentPercent < 70) {
    recommendations.push(`Moderate replenishment coverage (${replenishmentPercent.toFixed(0)}%): current carbs cover most but not all glycogen needs. Increase post-workout carbs to optimize replenishment.`);
  } else if (replenishmentPercent < 90) {
    recommendations.push(`Good replenishment coverage (${replenishmentPercent.toFixed(0)}%): current carbs cover most glycogen needs. Slight increases may further optimize, but current approach is adequate.`);
  } else {
    recommendations.push(`Excellent replenishment coverage (${replenishmentPercent.toFixed(0)}%): current carbs adequately cover glycogen needs. Continue this post-workout nutrition strategy.`);
  }
  
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Optimize post-workout nutrition: consume 1.2-1.5g carbs/kg body weight plus 20-30g protein within 2 hours post-workout. Include fast-digesting carbs (rice, potatoes, fruits) for optimal glycogen synthesis.');
  }
  
  const plan = [
    { label: 'Immediate (0-2 hours)', detail: `Post-workout nutrition: consume ${((bodyWeight / 2.2) * 1.2).toFixed(0)}-${((bodyWeight / 2.2) * 1.5).toFixed(0)}g carbs plus 20-30g protein. Fast-digesting carbs (rice, potatoes, fruits) maximize glycogen synthesis in this window.` },
    { label: 'Short-term (2-24 hours)', detail: `Continue adequate carb intake: aim for 5-7g carbs/kg body weight daily (${((bodyWeight / 2.2) * 5).toFixed(0)}-${((bodyWeight / 2.2) * 7).toFixed(0)}g total). Glycogen will replenish over ${hoursToReplenish.toFixed(0)} hours with current approach.` },
    { label: 'Ongoing', detail: `Maintain post-workout nutrition strategy: consume 1.2-1.5g carbs/kg within 2 hours after intense/long workouts, or 0.8-1.0g/kg after moderate workouts. Include protein (20-30g) to enhance glycogen synthesis and muscle repair for optimal recovery.` },
  ];
  
  return { workoutDuration, workoutIntensity, workoutType, bodyWeight, currentGlycogen, carbIntakePostWorkout, timeSinceWorkout, glycogenDepleted, glycogenNeeded, replenishmentRate, hoursToReplenish, replenishmentPercent, status, interpretation, recommendations, plan };
};

export default function GlycogenReplenishmentEstimatorPostWorkout() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workoutDuration: undefined,
      workoutIntensity: undefined,
      workoutType: undefined,
      bodyWeight: undefined,
      currentGlycogen: undefined,
      carbIntakePostWorkout: undefined,
      timeSinceWorkout: undefined,
    },
  });
  
  return (
    <div className="space-y-8">
      <Script id="glycogen-replenishment-estimator-post-workout-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Battery className="h-5 w-5" />
            Glycogen Replenishment Estimator (post-workout)
          </CardTitle>
          <CardDescription>Estimate glycogen replenishment needs from workout duration, intensity, type, body weight, current glycogen, post-workout carbs, and time since workout.</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Input your post-workout data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="workoutDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workout duration (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 60" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="workoutIntensity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workout intensity (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="workoutType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workout type</FormLabel>
                      <FormControl>
                        <select
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value as FormValues['workoutType'])}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select workout type</option>
                          <option value="cardio">Cardio</option>
                          <option value="strength">Strength</option>
                          <option value="hiit">HIIT</option>
                          <option value="endurance">Endurance</option>
                          <option value="mixed">Mixed</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bodyWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body weight (lbs)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 150" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentGlycogen"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current glycogen level (%, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 50" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="carbIntakePostWorkout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Post-workout carbs (grams)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 80" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timeSinceWorkout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time since workout (hours)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 1" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Estimate glycogen replenishment
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
            <CardDescription>See glycogen replenishment estimates and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Glycogen depleted</p>
                <p className="text-2xl font-semibold text-primary">{result.glycogenDepleted.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Depletion level</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Glycogen needed</p>
                <p className="text-2xl font-semibold text-primary">{result.glycogenNeeded.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">grams</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Hours to replenish</p>
                <p className="text-2xl font-semibold text-primary">{result.hoursToReplenish.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">hours</p>
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
            <strong>Glycogen depletion</strong> = estimated from workout duration, intensity, and type. High-intensity and longer-duration workouts deplete more glycogen (up to 40-50% of total stores).
          </p>
          <p>
            <strong>Glycogen needed</strong> = (body weight in kg × glycogen depletion %) × 15-20g per kg bodyweight. Total body glycogen stores are approximately 400-600g in trained individuals.
          </p>
          <p>
            <strong>Hours to replenish</strong> = glycogen needed / (carb intake per hour × 0.7). Glycogen synthesis rate is approximately 5-7% per hour with adequate carb intake.
          </p>
          <p>Glycogen replenishment is fastest in the first 2 hours post-workout (the "glycogen window"). Consuming 1-1.2g carbs per kg bodyweight within 2 hours optimizes recovery.</p>
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
                <p className="text-sm text-muted-foreground">Replenishment coverage</p>
                <p className="text-xl font-semibold text-primary">{result.replenishmentPercent.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Coverage level</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recovery status</p>
                <p className="text-xl font-semibold text-primary">{result.replenishmentPercent >= 100 ? 'Complete' : result.replenishmentPercent >= 75 ? 'Good' : result.replenishmentPercent >= 50 ? 'Moderate' : 'Incomplete'}</p>
                <p className="text-xs text-muted-foreground">Based on coverage</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Optimal timing</p>
                <p className="text-xl font-semibold text-primary">{result.hoursToReplenish <= 4 ? 'Within 4 hours' : result.hoursToReplenish <= 8 ? 'Within 8 hours' : 'Extended recovery'}</p>
                <p className="text-xs text-muted-foreground">Recovery window</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your workout data to see additional insights.</p>
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
                <Link href={`/category/health-fitness/${calc.slug}`} className="text-primary hover:underline">
                  {calc.name}
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">{calc.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope={true} itemType="https://schema.org/MedicalWebPage">
        <meta itemProp="name" content="The Definitive Guide to Glycogen Replenishment: Post-Workout Recovery Nutrition" />
        <meta itemProp="description" content="An in-depth, authoritative guide on glycogen replenishment after exercise, detailing optimal carb intake, timing, and strategies to restore muscle and liver glycogen stores for optimal recovery." />
        <meta itemProp="keywords" content="glycogen replenishment calculator, post-workout nutrition, glycogen window, recovery carbs, muscle glycogen" />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-02" />
        <meta itemProp="url" content="/definitive-glycogen-replenishment-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Glycogen Replenishment: Post-Workout Recovery Nutrition</h1>
        <p className="text-lg italic text-gray-700">Explore how to optimally replenish muscle and liver glycogen stores after exercise to support recovery, performance, and metabolic health.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li><a href="#what-is" className="hover:underline">What is Glycogen?</a></li>
          <li><a href="#depletion" className="hover:underline">Glycogen Depletion During Exercise</a></li>
          <li><a href="#replenishment" className="hover:underline">Glycogen Replenishment Process</a></li>
          <li><a href="#timing" className="hover:underline">Optimal Timing and Amount</a></li>
          <li><a href="#strategies" className="hover:underline">Replenishment Strategies</a></li>
        </ul>
        <hr />

        <h2 id="what-is" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Glycogen?</h2>
        <p>Glycogen is the stored form of glucose in the body, primarily found in muscles (~400-500g) and liver (~100-150g). It serves as the primary fuel source during moderate to high-intensity exercise and is essential for maintaining blood glucose levels during fasting.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Muscle vs. Liver Glycogen</h3>
        <p>There are two main glycogen stores:</p>
        <ul>
          <li><b>Muscle Glycogen:</b> Used directly by muscles during exercise. Cannot be released into bloodstream. Depleted by exercise.</li>
          <li><b>Liver Glycogen:</b> Maintains blood glucose levels. Can be released into bloodstream. Depleted by fasting and exercise.</li>
        </ul>

        <h2 id="depletion" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Glycogen Depletion During Exercise</h2>
        <p>Exercise intensity and duration determine glycogen depletion:</p>
        <ul>
          <li><b>High-Intensity Exercise:</b> Depletes glycogen rapidly (up to 25-40% per hour) due to reliance on anaerobic glycolysis.</li>
          <li><b>Moderate-Intensity Exercise:</b> Depletes glycogen at moderate rates (15-25% per hour) with mixed fuel use.</li>
          <li><b>Low-Intensity Exercise:</b> Minimal glycogen depletion (5-10% per hour) as fat oxidation dominates.</li>
          <li><b>Duration:</b> Longer workouts deplete more glycogen, with 90+ minute sessions potentially depleting 50-70% of stores.</li>
        </ul>

        <h2 id="replenishment" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Glycogen Replenishment Process</h2>
        <p>Glycogen synthesis occurs after exercise when carbohydrates are consumed:</p>
        <ul>
          <li><b>Rate:</b> Glycogen synthesis is fastest in the first 2 hours post-workout (5-7% per hour), then slows to 2-3% per hour.</li>
          <li><b>Capacity:</b> Maximum synthesis rate is approximately 5-7g glycogen per hour with optimal carb intake.</li>
          <li><b>Timing:</b> The "glycogen window" is the first 2 hours post-workout when synthesis is maximized.</li>
          <li><b>Complete Replenishment:</b> Takes 20-24 hours with adequate carb intake, or 48+ hours with low carb intake.</li>
        </ul>

        <h2 id="timing" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Optimal Timing and Amount</h2>
        <p>For optimal glycogen replenishment:</p>
        <ul>
          <li><b>Immediate (0-2 hours):</b> Consume 1-1.2g carbs per kg bodyweight to maximize synthesis rate.</li>
          <li><b>Extended (2-6 hours):</b> Continue consuming 0.8-1g carbs per kg bodyweight every 2 hours.</li>
          <li><b>Total Daily:</b> For complete replenishment, consume 5-7g carbs per kg bodyweight over 24 hours.</li>
          <li><b>Carb Type:</b> High-glycemic carbs (glucose, maltodextrin) are most effective for rapid replenishment.</li>
        </ul>

        <h2 id="strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Replenishment Strategies</h2>
        <p>Different strategies based on training schedule:</p>
        <ul>
          <li><b>Same-Day Training:</b> Prioritize rapid replenishment with high-glycemic carbs immediately post-workout.</li>
          <li><b>Next-Day Training:</b> Can use slower replenishment with whole foods and lower-glycemic carbs.</li>
          <li><b>Multiple Sessions:</b> For 2+ sessions per day, maximize immediate post-workout intake and continue frequent feedings.</li>
          <li><b>Low-Carb Diets:</b> Glycogen replenishment is slower but still occurs. May take 48-72 hours for complete restoration.</li>
        </ul>

        <hr />
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Glycogen replenishment is essential for recovery and subsequent performance. Consuming 1-1.2g carbs per kg bodyweight within 2 hours post-workout maximizes synthesis rate. Complete replenishment takes 20-24 hours with adequate intake. Understanding your glycogen needs based on workout type, duration, and intensity helps optimize recovery nutrition.</p>
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
          <p>This tool estimates glycogen replenishment needs from workout duration, intensity, type, body weight, current glycogen, post-workout carbs, and time since workout.</p>
          <p>Outputs include glycogen depletion, glycogen needed, hours to replenish, replenishment coverage, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


