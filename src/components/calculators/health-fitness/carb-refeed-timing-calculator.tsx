'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Zap, Target, AlertTriangle, Shield, Clock } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  weeksInDeficit: z.number({ invalid_type_error: 'Enter weeks in deficit' }).min(1).max(104),
  currentCarbs: z.number({ invalid_type_error: 'Enter current carbs' }).min(0).max(500),
  trainingFrequency: z.number({ invalid_type_error: 'Enter training frequency' }).min(0).max(7),
  bodyFatPercent: z.number({ invalid_type_error: 'Enter body fat percent' }).min(5).max(50),
  refeedCarbs: z.number({ invalid_type_error: 'Enter refeed carbs' }).min(100).max(800).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  weeksInDeficit: number;
  currentCarbs: number;
  trainingFrequency: number;
  bodyFatPercent: number;
  refeedCarbs: number;
  optimalTiming: string;
  refeedFrequency: number;
  refeedScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter weeks you have been in a calorie deficit.',
  'Enter your current daily carbohydrate intake (grams).',
  'Enter your training frequency (days per week).',
  'Enter your body fat percentage.',
  'Enter desired refeed carbohydrate amount (optional).',
  'Review optimal carb refeed timing and recommendations.',
];

const faqs = [
  {
    question: 'What is a carb refeed?',
    answer:
      'A carb refeed is a planned increase in carbohydrate intake, typically to maintenance or slightly above, for 1-2 days. This helps replenish glycogen stores, boost leptin levels, and provide psychological relief during extended dieting.',
  },
  {
    question: 'When should I do a carb refeed?',
    answer:
      'Optimal timing: after 2-4 weeks of dieting, when body fat is low (under 15% for men, 20% for women), before intense training sessions, or when experiencing diet fatigue. Frequency typically ranges from weekly to bi-weekly.',
  },
  {
    question: 'How many carbs should I eat on a refeed?',
    answer:
      'Refeed carbs typically range from 300-600g depending on body size and activity level. Aim for 2-3x your normal carb intake, or eat at maintenance calories with carbs making up 60-70% of calories. Keep protein high and fat low.',
  },
  {
    question: 'How often should I refeed?',
    answer:
      'Frequency depends on body fat level and diet duration. Lower body fat (under 12% men, 18% women): weekly. Moderate body fat (12-18% men, 18-25% women): every 10-14 days. Higher body fat: less frequent or not needed.',
  },
  {
    question: 'Should I refeed on training days?',
    answer:
      'Yes, refeeding on or before intense training days maximizes glycogen replenishment and can improve workout performance. Some prefer refeeding the day before heavy training sessions.',
  },
  {
    question: 'Will refeeding cause fat gain?',
    answer:
      'Temporary weight gain (2-5 lbs) is normal from water and glycogen. Actual fat gain should be minimal if refeeds are properly timed and calories are controlled. Most weight returns to baseline within 2-3 days.',
  },
  {
    question: 'What foods should I eat on a refeed?',
    answer:
      'Focus on complex carbs (rice, potatoes, oats, fruits) and some simple carbs (post-workout). Keep protein high (1g/lb bodyweight) and fat moderate (30-50g). Avoid excessive processed foods or going too far over maintenance.',
  },
  {
    question: 'How long should a refeed last?',
    answer:
      'Most refeeds last 1-2 days. One day is sufficient for glycogen replenishment. Two days may be better for psychological benefits and leptin restoration, especially after extended dieting (8+ weeks).',
  },
];

const relatedCalculators = [
  {
    name: 'Metabolic Adaptation Rate Calculator',
    slug: 'metabolic-adaptation-rate-calculator',
    description: 'Assess metabolic adaptation before planning refeeds.',
  },
  {
    name: 'Reverse Dieting Calorie Increase Planner',
    slug: 'reverse-dieting-calorie-increase-planner',
    description: 'Plan reverse dieting after metabolic adaptation.',
  },
  {
    name: 'Fat Oxidation Percentage Calculator',
    slug: 'fat-oxidation-percentage-calculator',
    description: 'Understand fuel utilization during exercise.',
  },
  {
    name: 'Glycogen Replenishment Estimator (post-workout)',
    slug: 'glycogen-replenishment-estimator-post-workout',
    description: 'Estimate glycogen needs after training.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/carb-refeed-timing-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Carb Refeed Timing Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Carb Refeed Timing Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate optimal carb refeed timing from weeks in deficit, current carbs, training frequency, and body fat percent.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const weeksInDeficit = values.weeksInDeficit;
  const currentCarbs = values.currentCarbs;
  const trainingFrequency = values.trainingFrequency;
  const bodyFatPercent = values.bodyFatPercent;
  const refeedCarbs = values.refeedCarbs || (currentCarbs * 2.5);
  
  // Calculate refeed score (0-100)
  let refeedScore = 50;
  
  // Weeks in deficit component (0-25 points)
  if (weeksInDeficit >= 8) {
    refeedScore += 25; // High need
  } else if (weeksInDeficit >= 4) {
    refeedScore += 15; // Moderate need
  } else if (weeksInDeficit >= 2) {
    refeedScore += 5; // Low need
  }
  
  // Body fat component (0-25 points, inverted - lower = higher need)
  if (bodyFatPercent < 12) {
    refeedScore += 25; // Very low body fat, high refeed need
  } else if (bodyFatPercent < 15) {
    refeedScore += 20;
  } else if (bodyFatPercent < 18) {
    refeedScore += 15;
  } else if (bodyFatPercent < 22) {
    refeedScore += 10;
  } else {
    refeedScore += 5; // Higher body fat, lower refeed need
  }
  
  // Training frequency component (0-25 points)
  if (trainingFrequency >= 5) {
    refeedScore += 25; // High training, high refeed need
  } else if (trainingFrequency >= 3) {
    refeedScore += 15;
  } else if (trainingFrequency >= 1) {
    refeedScore += 10;
  }
  
  // Current carbs component (0-25 points, inverted - lower = higher need)
  if (currentCarbs < 50) {
    refeedScore += 25; // Very low carbs, high refeed need
  } else if (currentCarbs < 100) {
    refeedScore += 20;
  } else if (currentCarbs < 150) {
    refeedScore += 15;
  } else if (currentCarbs < 200) {
    refeedScore += 10;
  } else {
    refeedScore += 5; // Higher carbs, lower refeed need
  }
  
  refeedScore = clamp(refeedScore, 0, 100);
  
  // Determine optimal timing
  let optimalTiming = 'Not recommended at this time';
  let refeedFrequency = 0;
  
  if (refeedScore >= 75) {
    optimalTiming = 'Immediate - refeed this week';
    refeedFrequency = 1; // Weekly
  } else if (refeedScore >= 60) {
    optimalTiming = 'Soon - refeed within 7-10 days';
    refeedFrequency = 1.5; // Every 10 days
  } else if (refeedScore >= 50) {
    optimalTiming = 'Moderate timing - refeed every 10-14 days';
    refeedFrequency = 2; // Bi-weekly
  } else if (refeedScore >= 40) {
    optimalTiming = 'Low priority - refeed every 14-21 days';
    refeedFrequency = 3; // Every 3 weeks
  } else {
    optimalTiming = 'Not recommended - focus on diet adherence';
    refeedFrequency = 0;
  }
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Carb refeed timing is optimal. Your current dieting status suggests refeeds may be beneficial for metabolic and psychological benefits.';
  
  if (refeedScore < 40 || weeksInDeficit < 2) {
    status = 'low';
    interpretation = 'Carb refeeds are not recommended at this time. You are early in your diet or have higher body fat, making refeeds less necessary. Focus on diet adherence and consistency.';
  } else if (refeedScore < 50) {
    status = 'moderate';
    interpretation = 'Carb refeed timing is moderate. Refeeds may provide some benefit but are not urgent. Consider refeeding every 2-3 weeks if desired.';
  } else if (refeedScore < 75) {
    status = 'good';
    interpretation = 'Carb refeed timing is good. Regular refeeds (every 10-14 days) would be beneficial for glycogen replenishment, leptin restoration, and psychological relief.';
  } else {
    status = 'optimal';
    interpretation = 'Carb refeed timing is optimal. You would benefit from immediate or frequent refeeds to support metabolic health, glycogen stores, and diet sustainability.';
  }
  
  const recommendations: string[] = [];
  
  // Refeed score recommendations
  if (refeedScore >= 75) {
    recommendations.push(`High refeed priority (score: ${refeedScore}/100): immediate refeed recommended. With ${weeksInDeficit} weeks in deficit, ${bodyFatPercent.toFixed(1)}% body fat, and ${trainingFrequency} training days/week, refeeds are highly beneficial. Plan refeed this week.`);
  } else if (refeedScore >= 60) {
    recommendations.push(`Moderate-high refeed priority (score: ${refeedScore}/100): refeed within 7-10 days recommended. Current status suggests refeeds would support metabolic health and diet sustainability.`);
  } else if (refeedScore >= 50) {
    recommendations.push(`Moderate refeed priority (score: ${refeedScore}/100): refeed every 10-14 days would be beneficial. Current dieting status supports regular refeeds for optimal results.`);
  } else if (refeedScore >= 40) {
    recommendations.push(`Low refeed priority (score: ${refeedScore}/100): refeeds are optional. Consider refeeding every 2-3 weeks if desired, but focus primarily on diet adherence.`);
  } else {
    recommendations.push(`Very low refeed priority (score: ${refeedScore}/100): refeeds are not recommended at this time. You're early in your diet or have higher body fat. Focus on consistent diet adherence first.`);
  }
  
  // Weeks in deficit recommendations
  if (weeksInDeficit < 2) {
    recommendations.push(`Early dieting phase (${weeksInDeficit} weeks): refeeds are typically not needed yet. Focus on establishing diet consistency. Consider refeeds after 4+ weeks of dieting.`);
  } else if (weeksInDeficit >= 2 && weeksInDeficit < 4) {
    recommendations.push(`Moderate dieting duration (${weeksInDeficit} weeks): refeeds may be beneficial, especially if body fat is low or training is intense. Consider planning first refeed soon.`);
  } else if (weeksInDeficit >= 4 && weeksInDeficit < 8) {
    recommendations.push(`Extended dieting duration (${weeksInDeficit} weeks): refeeds are recommended. Plan regular refeeds every 7-14 days to support metabolic health and diet sustainability.`);
  } else {
    recommendations.push(`Long dieting duration (${weeksInDeficit} weeks): refeeds are highly recommended. Extended deficits increase refeed benefits. Plan frequent refeeds (weekly to bi-weekly) to prevent excessive metabolic adaptation.`);
  }
  
  // Body fat recommendations
  if (bodyFatPercent < 12) {
    recommendations.push(`Very low body fat (${bodyFatPercent.toFixed(1)}%): refeeds are highly recommended and should be frequent (weekly). Low body fat increases metabolic adaptation risk and refeed benefits.`);
  } else if (bodyFatPercent < 15) {
    recommendations.push(`Low body fat (${bodyFatPercent.toFixed(1)}%): refeeds are recommended every 7-10 days. Low body fat increases the importance of regular refeeds for metabolic health.`);
  } else if (bodyFatPercent < 18) {
    recommendations.push(`Moderate-low body fat (${bodyFatPercent.toFixed(1)}%): refeeds are beneficial every 10-14 days. Regular refeeds support metabolic function and diet sustainability.`);
  } else if (bodyFatPercent < 22) {
    recommendations.push(`Moderate body fat (${bodyFatPercent.toFixed(1)}%): refeeds are optional but can be beneficial every 14-21 days. Focus on diet adherence, with refeeds as a tool for sustainability.`);
  } else {
    recommendations.push(`Higher body fat (${bodyFatPercent.toFixed(1)}%): refeeds are less critical. Focus on consistent diet adherence. Refeeds may be beneficial every 2-3 weeks if desired for psychological benefits.`);
  }
  
  // Training frequency recommendations
  if (trainingFrequency >= 5) {
    recommendations.push(`High training frequency (${trainingFrequency} days/week): refeeds are highly beneficial for glycogen replenishment and recovery. Plan refeeds on or before intense training days.`);
  } else if (trainingFrequency >= 3) {
    recommendations.push(`Moderate training frequency (${trainingFrequency} days/week): refeeds support training performance and recovery. Time refeeds around training sessions when possible.`);
  } else if (trainingFrequency >= 1) {
    recommendations.push(`Low training frequency (${trainingFrequency} days/week): refeeds are still beneficial but less critical for performance. Focus on metabolic and psychological benefits.`);
  } else {
    recommendations.push(`No/minimal training (${trainingFrequency} days/week): refeeds are less critical for performance but can still provide metabolic and psychological benefits during extended dieting.`);
  }
  
  // Current carbs recommendations
  if (currentCarbs < 50) {
    recommendations.push(`Very low carb intake (${currentCarbs}g/day): refeeds are highly beneficial. Such low carb intake increases refeed importance for glycogen replenishment and metabolic function.`);
  } else if (currentCarbs < 100) {
    recommendations.push(`Low carb intake (${currentCarbs}g/day): refeeds are recommended. Low carb diets benefit from periodic refeeds for glycogen stores and metabolic health.`);
  } else if (currentCarbs < 150) {
    recommendations.push(`Moderate-low carb intake (${currentCarbs}g/day): refeeds can be beneficial. Consider refeeding to ${refeedCarbs.toFixed(0)}g on refeed days for optimal glycogen replenishment.`);
  } else if (currentCarbs < 200) {
    recommendations.push(`Moderate carb intake (${currentCarbs}g/day): refeeds are still beneficial but less critical. Consider refeeding to ${refeedCarbs.toFixed(0)}g on refeed days.`);
  } else {
    recommendations.push(`Higher carb intake (${currentCarbs}g/day): refeeds are less critical but can still provide benefits. If refeeding, aim for ${refeedCarbs.toFixed(0)}g on refeed days.`);
  }
  
  // Refeed carbs recommendations
  if (refeedCarbs < 200) {
    recommendations.push(`Low refeed carbs (${refeedCarbs.toFixed(0)}g): consider increasing to 300-500g for optimal glycogen replenishment and metabolic benefits, especially with high training frequency.`);
  } else if (refeedCarbs >= 200 && refeedCarbs <= 500) {
    recommendations.push(`Moderate refeed carbs (${refeedCarbs.toFixed(0)}g): good target for most individuals. This should provide adequate glycogen replenishment and metabolic benefits.`);
  } else if (refeedCarbs > 500) {
    recommendations.push(`High refeed carbs (${refeedCarbs.toFixed(0)}g): this is a large refeed. Ensure calories stay reasonable (maintenance or slightly above). Monitor weight response and adjust if needed.`);
  }
  
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Focus on diet adherence: if refeeds are not recommended, prioritize consistent diet adherence, adequate protein intake, and proper training to support your goals.');
  }
  
  const plan = [
    { label: 'This Week', detail: `Based on refeed score (${refeedScore}/100), ${optimalTiming.toLowerCase()}. If refeeding, plan for ${refeedCarbs.toFixed(0)}g carbs on refeed day(s), keep protein high (1g/lb), and moderate fat (30-50g). Time refeed around intense training if possible.` },
    { label: 'This Month', detail: `Plan refeed schedule: ${refeedFrequency > 0 ? `refeed every ${Math.round(14 / refeedFrequency)} days` : 'focus on diet adherence'}. Monitor body composition, energy levels, and training performance. Adjust frequency based on response.` },
    { label: 'Ongoing', detail: `Maintain refeed strategy: continue ${refeedFrequency > 0 ? `regular refeeds every ${Math.round(14 / refeedFrequency)} days` : 'focusing on diet adherence'} based on body fat, training, and diet duration. Refeeds support metabolic health, glycogen stores, and long-term diet sustainability.` },
  ];
  
  return { weeksInDeficit, currentCarbs, trainingFrequency, bodyFatPercent, refeedCarbs, optimalTiming, refeedFrequency, refeedScore, status, interpretation, recommendations, plan };
};

export default function CarbRefeedTimingCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weeksInDeficit: undefined,
      currentCarbs: undefined,
      trainingFrequency: undefined,
      bodyFatPercent: undefined,
      refeedCarbs: undefined,
    },
  });
  
  return (
    <div className="space-y-8">
      <Script id="carb-refeed-timing-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Carb Refeed Timing Calculator
          </CardTitle>
          <CardDescription>Calculate optimal carb refeed timing from weeks in deficit, current carbs, training frequency, and body fat percent.</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Input your refeed timing data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="weeksInDeficit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weeks in deficit</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentCarbs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current carbs (grams/day)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 100" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="trainingFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Training frequency (days/week)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                        <Input type="number" step="0.1" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="refeedCarbs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Refeed carbs (grams, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 400" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate refeed timing
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
            <CardDescription>See optimal refeed timing and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Refeed score</p>
                <p className="text-2xl font-semibold text-primary">{result.refeedScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Optimal timing</p>
                <p className="text-2xl font-semibold text-primary">{result.optimalTiming}</p>
                <p className="text-xs text-muted-foreground">Recommendation</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Refeed frequency</p>
                <p className="text-2xl font-semibold text-primary">{result.refeedFrequency > 0 ? `Every ${Math.round(14 / result.refeedFrequency)} days` : 'Not recommended'}</p>
                <p className="text-xs text-muted-foreground">Frequency</p>
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
            <strong>Refeed score</strong> = calculated from weeks in deficit (0-25 points), current carbs (0-25 points), training frequency (0-25 points), and body fat percentage (0-25 points). Higher scores indicate greater need for refeeds.
          </p>
          <p>
            <strong>Optimal timing</strong> = determined by refeed score. Scores &gt;75: refeed now, 50-75: refeed soon, 25-50: consider refeed, &lt;25: not needed.
          </p>
          <p>
            <strong>Refeed frequency</strong> = calculated based on weeks in deficit and body fat. Lower body fat and longer deficits require more frequent refeeds (every 7-10 days vs 14+ days).
          </p>
          <p>Carb refeeds help restore leptin, glycogen, and metabolic rate during extended dieting. Timing depends on diet duration, current carb intake, training volume, and body fat levels.</p>
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
                <p className="text-sm text-muted-foreground">Weeks in deficit</p>
                <p className="text-xl font-semibold text-primary">{result.weeksInDeficit}</p>
                <p className="text-xs text-muted-foreground">Diet duration</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Current carbs</p>
                <p className="text-xl font-semibold text-primary">{result.currentCarbs}g/day</p>
                <p className="text-xs text-muted-foreground">Daily intake</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Refeed carbs</p>
                <p className="text-xl font-semibold text-primary">{result.refeedCarbs}g</p>
                <p className="text-xs text-muted-foreground">Refeed amount</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your refeed data to see additional insights.</p>
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
        <meta itemProp="name" content="The Definitive Guide to Carb Refeed Timing: Optimizing Refuel Days During Dieting" />
        <meta itemProp="description" content="An in-depth, authoritative guide on carb refeed timing during calorie restriction, detailing when to refeed, how often, optimal carb amounts, and the metabolic benefits of strategic refeed days." />
        <meta itemProp="keywords" content="carb refeed calculator, refeed timing, refeed frequency, diet breaks, leptin restoration, glycogen replenishment" />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-02" />
        <meta itemProp="url" content="/definitive-carb-refeed-timing-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Carb Refeed Timing: Optimizing Refuel Days During Dieting</h1>
        <p className="text-lg italic text-gray-700">Explore when and how often to implement carb refeed days during extended dieting to restore leptin, replenish glycogen, and maintain metabolic rate.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li><a href="#what-is" className="hover:underline">What is a Carb Refeed?</a></li>
          <li><a href="#benefits" className="hover:underline">Benefits of Strategic Refeeds</a></li>
          <li><a href="#timing" className="hover:underline">When to Refeed</a></li>
          <li><a href="#frequency" className="hover:underline">How Often to Refeed</a></li>
          <li><a href="#amount" className="hover:underline">How Much to Refeed</a></li>
        </ul>
        <hr />

        <h2 id="what-is" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is a Carb Refeed?</h2>
        <p>A carb refeed is a planned day (or days) where you significantly increase carbohydrate intake while maintaining your calorie deficit or eating at maintenance. Refeeds are strategically timed to restore metabolic hormones, replenish muscle glycogen, and provide psychological relief during extended dieting periods.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Difference Between Refeed and Cheat Day</h3>
        <p>Unlike cheat days which often involve unrestricted eating, refeeds are structured increases in carbohydrates (typically 2-3x normal intake) while keeping protein high and fat moderate. Refeeds are planned and purposeful, not emotional eating.</p>

        <h2 id="benefits" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benefits of Strategic Refeeds</h2>
        <p>Carb refeeds offer several metabolic and psychological benefits:</p>
        <ul>
          <li><b>Leptin Restoration:</b> Increases leptin levels, which helps restore metabolic rate and reduce hunger signals.</li>
          <li><b>Glycogen Replenishment:</b> Restores muscle and liver glycogen stores, improving workout performance and energy.</li>
          <li><b>Metabolic Rate:</b> Temporary increase in metabolic rate and thyroid function.</li>
          <li><b>Psychological Relief:</b> Provides mental break from restriction, improving diet adherence.</li>
          <li><b>Hormone Optimization:</b> Helps restore cortisol, insulin sensitivity, and other metabolic hormones.</li>
        </ul>

        <h2 id="timing" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">When to Refeed</h2>
        <p>Optimal refeed timing depends on several factors:</p>
        <ul>
          <li><b>Weeks in Deficit:</b> After 4-6 weeks of dieting, refeeds become more beneficial. After 8+ weeks, they're often essential.</li>
          <li><b>Body Fat Level:</b> Lower body fat (&lt;15% men, &lt;22% women) requires more frequent refeeds.</li>
          <li><b>Training Volume:</b> Higher training frequency and volume increases refeed need.</li>
          <li><b>Current Carb Intake:</b> Very low carb diets (&lt;50g/day) benefit more from refeeds than moderate carb diets.</li>
          <li><b>Energy and Performance:</b> If energy, strength, or recovery are declining, a refeed may help.</li>
        </ul>

        <h2 id="frequency" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How Often to Refeed</h2>
        <p>Refeed frequency varies based on individual factors:</p>
        <ul>
          <li><b>Every 7-10 days:</b> For very lean individuals (&lt;10% body fat men, &lt;18% women) or after 12+ weeks of dieting.</li>
          <li><b>Every 10-14 days:</b> For moderately lean individuals (10-15% body fat men, 18-25% women) or after 8+ weeks of dieting.</li>
          <li><b>Every 14-21 days:</b> For higher body fat individuals or shorter diet durations.</li>
          <li><b>As needed:</b> Based on energy, performance, and metabolic adaptation signs.</li>
        </ul>

        <h2 id="amount" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How Much to Refeed</h2>
        <p>Typical refeed amounts:</p>
        <ul>
          <li><b>Carbohydrates:</b> 2-3x normal daily intake (e.g., if eating 150g/day, refeed with 300-450g).</li>
          <li><b>Protein:</b> Maintain high protein (1g/lb bodyweight) to preserve muscle.</li>
          <li><b>Fat:</b> Keep moderate (50-80g) to allow more room for carbs.</li>
          <li><b>Calories:</b> Can be at maintenance or slightly above, but not excessive.</li>
        </ul>

        <hr />
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Strategic carb refeeds are essential for maintaining metabolic rate, performance, and adherence during extended dieting. Timing refeeds based on diet duration, body fat, training volume, and current carb intake optimizes their benefits while minimizing fat gain. Use refeed days strategically to support long-term diet success.</p>
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
          <p>This tool calculates optimal carb refeed timing from weeks in deficit, current carbs, training frequency, and body fat percent.</p>
          <p>Outputs include refeed score, optimal timing, refeed frequency, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


