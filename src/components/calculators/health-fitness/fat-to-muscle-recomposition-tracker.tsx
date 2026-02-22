'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TrendingDown, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  currentWeight: z.number({ invalid_type_error: 'Enter current weight' }).min(30).max(300),
  bodyFatPercentage: z.number({ invalid_type_error: 'Enter body fat percentage' }).min(5).max(50),
  targetBodyFatPercentage: z.number({ invalid_type_error: 'Enter target body fat percentage' }).min(5).max(50),
  muscleMassPercentage: z.number({ invalid_type_error: 'Enter muscle mass percentage' }).min(20).max(60).optional(),
  timeframe: z.number({ invalid_type_error: 'Enter timeframe' }).min(1).max(52),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  currentFatMass: number;
  currentMuscleMass: number;
  targetFatMass: number;
  targetMuscleMass: number;
  fatToLose: number;
  muscleToGain: number;
  recompositionScore: number;
  status: 'excellent' | 'good' | 'moderate' | 'challenging';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter current weight in kilograms (or convert from pounds: lbs Ã· 2.2).',
  'Enter current body fat percentage (from DEXA, BodPod, or estimate).',
  'Enter target body fat percentage (realistic goals: Men 10-15%, Women 18-25%).',
  'Optionally enter current muscle mass percentage if known.',
  'Enter timeframe in weeks for recomposition goal.',
  'Review fat to lose, muscle to gain, recomposition score, and recommendations.',
];

const faqs = [
  {
    question: 'What is body recomposition?',
    answer:
      'Body recomposition is simultaneously losing fat and gaining muscle. This is more challenging than losing weight or gaining muscle alone, but achievable with proper training and nutrition.',
  },
  {
    question: 'Is recomposition possible?',
    answer:
      'Yes, especially for beginners, those returning to training, or those with higher body fat. Advanced trainees may find it more challenging but still possible with careful planning.',
  },
  {
    question: 'How long does recomposition take?',
    answer:
      'Recomposition is slower than pure fat loss or muscle gain. Realistic timeline: 0.5-1% body fat loss per month while gaining 0.25-0.5 lbs muscle per month. Patience is key.',
  },
  {
    question: 'What is a realistic body fat percentage?',
    answer:
      'Realistic ranges: Men 10-15% (lean), 15-20% (fit), Women 18-25% (lean), 25-30% (fit). Very low body fat (<10% men, <18% women) is difficult to maintain.',
  },
  {
    question: 'How do I track recomposition?',
    answer:
      'Track body fat percentage (DEXA, BodPod, or calipers), muscle mass, measurements, photos, and strength progress. Weight alone is not sufficient.',
  },
  {
    question: 'What about calories?',
    answer:
      'Recomposition typically requires a slight calorie deficit (200-500 kcal/day) or maintenance calories. Too large a deficit prevents muscle gain. Adequate protein is critical.',
  },
  {
    question: 'How much protein do I need?',
    answer:
      'Aim for 1.6-2.2 g/kg body weight daily. Higher protein supports muscle building while in a calorie deficit. Distribute protein across meals.',
  },
  {
    question: 'What type of training?',
    answer:
      'Resistance training 3-5 days/week is essential. Focus on progressive overload. Moderate cardio supports fat loss but avoid excessive cardio that interferes with recovery.',
  },
  {
    question: 'Can I do it naturally?',
    answer:
      'Yes, natural recomposition is possible with proper training, nutrition, sleep, and consistency. It takes longer than with performance-enhancing substances, but is sustainable.',
  },
  {
    question: 'What if I\'m not making progress?',
    answer:
      'If progress stalls, reassess: increase protein, adjust calories slightly, ensure adequate sleep/recovery, and consider deload weeks. Track multiple metrics, not just weight.',
  },
];

const relatedCalculators = [
  {
    name: 'Metabolic Wellness Estimator',
    slug: 'bmr-adjustment-for-age-muscle-loss-calculator',
    description: 'Calculate adjusted BMR to support recomposition.',
  },
  {
    name: 'Muscle Recovery Time by Age Calculator',
    slug: 'muscle-recovery-time-by-age-calculator',
    description: 'Plan recovery to optimize muscle gain during recomposition.',
  },
  {
    name: 'Hormone Support Lifestyle Score Calculator',
    slug: 'daily-testosterone-boosting-habits-score-calculator',
    description: 'Support hormones that affect muscle gain and fat loss.',
  },
  {
    name: 'BMI Calculator',
    slug: 'bmi-calculator',
    description: 'Track overall body composition changes.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/fat-to-muscle-recomposition-tracker';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Body Composition Lifestyle Progress Tracker', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Body Composition Lifestyle Progress Tracker',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Track fat-to-muscle recomposition goals: calculate fat to lose, muscle to gain, and recomposition score.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  // Calculate current body composition
  const currentFatMass = (values.currentWeight * values.bodyFatPercentage) / 100;
  const currentLeanMass = values.currentWeight - currentFatMass;
  
  // Estimate current muscle mass if not provided
  let currentMuscleMass: number;
  if (values.muscleMassPercentage) {
    currentMuscleMass = (values.currentWeight * values.muscleMassPercentage) / 100;
  } else {
    // Rough estimate: muscle is ~50-60% of lean mass
    currentMuscleMass = currentLeanMass * 0.55;
  }
  
  // Calculate target body composition
  // Assume weight stays similar (recomposition) or adjust slightly
  // For recomposition, we'll assume weight stays roughly the same or decreases slightly
  const targetWeight = values.currentWeight * 0.98; // Slight decrease (2%) for recomposition
  const targetFatMass = (targetWeight * values.targetBodyFatPercentage) / 100;
  const targetLeanMass = targetWeight - targetFatMass;
  const targetMuscleMass = targetLeanMass * 0.55; // Estimate muscle as 55% of lean mass
  
  const fatToLose = currentFatMass - targetFatMass;
  const muscleToGain = targetMuscleMass - currentMuscleMass;
  
  // Recomposition score: feasibility based on timeframe and changes needed
  const fatLossRate = (fatToLose / values.timeframe) * 4; // kg per month
  const muscleGainRate = (muscleToGain / values.timeframe) * 4; // kg per month
  
  // Realistic rates: 0.5-1% body fat loss/month, 0.25-0.5 kg muscle/month
  let recompositionScore = 100;
  if (fatLossRate > 1 || muscleGainRate > 0.5) {
    recompositionScore = 60; // Challenging
  } else if (fatLossRate > 0.7 || muscleGainRate > 0.4) {
    recompositionScore = 75; // Moderate
  } else if (fatLossRate > 0.5 || muscleGainRate > 0.3) {
    recompositionScore = 85; // Good
  }
  
  // Adjust score based on body fat difference
  const bodyFatChange = values.bodyFatPercentage - values.targetBodyFatPercentage;
  if (bodyFatChange > 10) {
    recompositionScore -= 10; // Large change is more challenging
  } else if (bodyFatChange > 5) {
    recompositionScore -= 5;
  }

  let status: ResultPayload['status'] = 'excellent';
  let interpretation = 'Your estimated body composition lifestyle score suggests a general tendency toward realistic goals. This is a personal insight, not a medical evaluation.';

  if (recompositionScore < 60) {
    status = 'challenging';
    interpretation = 'Your estimated body composition lifestyle score suggests this goal may be more challenging. You may consider extending the timeframe or adjusting targets. This is a general wellness insight, not a medical diagnosis.';
  } else if (recompositionScore < 75) {
    status = 'moderate';
    interpretation = 'Your estimated body composition lifestyle score suggests a moderate tendency. This is a personal insight, not a medical evaluation.';
  } else if (recompositionScore < 85) {
    status = 'good';
    interpretation = 'Your estimated body composition lifestyle score suggests good goal feasibility. This is a lifestyle assessment, not a medical evaluation.';
  }

  const recommendations = [
    'You may consider maintaining a slight calorie deficit (200-500 kcal/day) or eating at maintenance for general wellness support.',
    'You may consider prioritizing protein intake (1.6-2.2 g/kg body weight daily) for overall wellness.',
    'You may consider engaging in resistance training 3-5 days/week for general wellness support.',
  ];
  if (status === 'challenging') {
    recommendations.push('You may consider extending your timeframe or breaking the goal into smaller milestones. This is a lifestyle insight, not medical advice.');
  }
  if (fatToLose > 10) {
    recommendations.push('You may consider a phased approach for larger goals. This is a general wellness suggestion, not a medical evaluation.');
  }

  const plan = [
    { label: 'This Week', detail: 'Establish baseline: measure body fat, take photos, record measurements. Set up training and nutrition plan.' },
    { label: 'This Month', detail: 'Track progress weekly. Adjust calories/protein as needed. Focus on consistency in training and nutrition.' },
    { label: 'Ongoing', detail: 'Reassess monthly. Recomposition is slowâ€”expect 0.5-1% body fat loss and 0.25-0.5 kg muscle gain per month with consistency.' },
  ];

  return { currentFatMass, currentMuscleMass, targetFatMass, targetMuscleMass, fatToLose, muscleToGain, recompositionScore, status, interpretation, recommendations, plan };
};

export default function FatToMuscleRecompositionTracker() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentWeight: undefined,
      bodyFatPercentage: undefined,
      targetBodyFatPercentage: undefined,
      muscleMassPercentage: undefined,
      timeframe: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="recomposition-tracker-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Body Composition Lifestyle Progress Tracker
          </CardTitle>
          <CardDescription>Estimate your body composition lifestyle score based on current and target body composition goals. This is a general wellness insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your current and target body composition</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="currentWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current weight (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 80" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bodyFatPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current body fat %</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 20" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetBodyFatPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target body fat %</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="muscleMassPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current muscle mass % (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 40" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timeframe"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timeframe (weeks)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 16" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate recomposition
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
            <CardDescription>See fat to lose, muscle to gain, recomposition score, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Fat to lose</p>
                <p className="text-2xl font-semibold text-primary">{result.fatToLose.toFixed(1)} kg</p>
                <p className="text-xs text-muted-foreground">Target reduction</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Muscle to gain</p>
                <p className="text-2xl font-semibold text-primary">+{result.muscleToGain.toFixed(1)} kg</p>
                <p className="text-xs text-muted-foreground">Target increase</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recomposition score</p>
                <p className="text-2xl font-semibold text-primary">{result.recompositionScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground mb-2">Current composition</p>
                <p className="text-sm">Fat: {result.currentFatMass.toFixed(1)} kg ({form.getValues().bodyFatPercentage?.toFixed(1)}%)</p>
                <p className="text-sm">Muscle: {result.currentMuscleMass.toFixed(1)} kg</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground mb-2">Target composition</p>
                <p className="text-sm">Fat: {result.targetFatMass.toFixed(1)} kg ({form.getValues().targetBodyFatPercentage?.toFixed(1)}%)</p>
                <p className="text-sm">Muscle: {result.targetMuscleMass.toFixed(1)} kg</p>
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
                    <Activity className="h-4 w-4" />
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
          <p><strong>Current fat mass</strong> = current weight Ã— body fat % / 100.</p>
          <p><strong>Current muscle mass</strong> = (current weight Ã— muscle mass %) / 100, or estimated as lean mass Ã— 0.55.</p>
          <p><strong>Target fat mass</strong> = target weight Ã— target body fat % / 100 (target weight â‰ˆ current weight Ã— 0.98 for recomposition).</p>
          <p><strong>Target muscle mass</strong> = target lean mass Ã— 0.55.</p>
          <p><strong>Fat to lose</strong> = current fat mass âˆ’ target fat mass.</p>
          <p><strong>Muscle to gain</strong> = target muscle mass âˆ’ current muscle mass.</p>
          <p><strong>Recomposition score</strong>: Based on realistic rates (0.5-1% body fat loss/month, 0.25-0.5 kg muscle/month). Higher scores indicate more achievable goals.</p>
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
                <p className="text-sm text-muted-foreground">Monthly fat loss rate</p>
                <p className="text-xl font-semibold text-primary">
                  {((result.fatToLose / (form.getValues().timeframe ?? 1)) * 4).toFixed(2)} kg/month
                </p>
                <p className="text-xs text-muted-foreground">Target rate</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Monthly muscle gain rate</p>
                <p className="text-xl font-semibold text-primary">
                  {((result.muscleToGain / (form.getValues().timeframe ?? 1)) * 4).toFixed(2)} kg/month
                </p>
                <p className="text-xs text-muted-foreground">Target rate</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Body fat change</p>
                <p className="text-xl font-semibold text-primary">
                  -{((form.getValues().bodyFatPercentage ?? 0) - (form.getValues().targetBodyFatPercentage ?? 0)).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Percentage points</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your current and target body composition to see additional insights.</p>
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
                <Link href={`/${calc.slug}`} className="text-primary hover:underline">
                  {calc.name}
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">{calc.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete guide snapshot</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Body recomposition is simultaneously losing fat and gaining muscle. This requires a slight calorie deficit or maintenance calories, adequate protein, and resistance training.</p>
          <p>Use this calculator to track fat-to-muscle recomposition goals, calculate changes needed, and assess feasibility based on realistic rates.</p>
        </CardContent>
      </Card>

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
          <p>This tool estimates body composition lifestyle score from current weight, body fat percentage, target body fat percentage, muscle mass percentage (optional), and timeframe.</p>
          <p>Outputs include fat to lose, muscle to gain, recomposition score, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Disclaimer
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a medical or psychological diagnosis. For any health concerns, please consult a qualified professional.</p>
        </CardContent>
      </Card>
    </div>
  );
}




