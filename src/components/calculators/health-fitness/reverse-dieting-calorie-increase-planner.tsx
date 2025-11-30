'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Zap, Target, AlertTriangle, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  currentCalories: z.number({ invalid_type_error: 'Enter current calories' }).min(800).max(5000),
  targetCalories: z.number({ invalid_type_error: 'Enter target calories' }).min(1000).max(6000),
  weeklyIncrease: z.number({ invalid_type_error: 'Enter weekly increase' }).min(50).max(300),
  currentWeight: z.number({ invalid_type_error: 'Enter current weight' }).min(80).max(500),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  currentCalories: number;
  targetCalories: number;
  weeklyIncrease: number;
  currentWeight: number;
  totalIncrease: number;
  weeksNeeded: number;
  weeklyCaloriePlan: { week: number; calories: number }[];
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your current daily calorie intake.',
  'Enter your target maintenance calories (or desired intake).',
  'Enter weekly calorie increase amount (typically 50-150 calories).',
  'Enter your current weight (lbs).',
  'Review reverse dieting plan and weekly calorie schedule.',
];

const faqs = [
  {
    question: 'What is reverse dieting?',
    answer:
      'Reverse dieting is gradually increasing calories back to maintenance or above after a period of calorie restriction. This helps restore metabolic rate, minimize fat regain, and transition from dieting to maintenance or bulking phases.',
  },
  {
    question: 'How much should I increase calories per week?',
    answer:
      'Typical weekly increases range from 50-150 calories per week. Start with 50-100 calories if coming from a large deficit, or 100-150 calories if from a moderate deficit. Monitor weight and adjust based on response.',
  },
  {
    question: 'How long does reverse dieting take?',
    answer:
      'Reverse dieting typically takes 8-16 weeks depending on the calorie gap. If you need to increase by 500 calories, at 100 calories/week, it takes 5 weeks. Plan for gradual increases to allow metabolism to adapt.',
  },
  {
    question: 'Will I gain weight during reverse dieting?',
    answer:
      'Some weight gain is normal and expected, primarily from increased glycogen, water, and food volume. Fat gain should be minimal if done correctly. Monitor body composition and adjust if fat gain exceeds expectations.',
  },
  {
    question: 'When should I start reverse dieting?',
    answer:
      'Start reverse dieting after extended dieting (12+ weeks), when metabolic adaptation is high, weight loss has stalled despite adherence, or you\'ve reached your goal weight and want to transition to maintenance.',
  },
  {
    question: 'How do I know if reverse dieting is working?',
    answer:
      'Signs of success: weight stabilizes or increases slightly, energy levels improve, strength increases, hunger decreases, and metabolic rate improves. If weight increases rapidly, slow the calorie increases.',
  },
  {
    question: 'Can I exercise during reverse dieting?',
    answer:
      'Yes, continue exercising. Reverse dieting can improve workout performance and recovery. You may need to adjust calories further if activity increases significantly during the process.',
  },
  {
    question: 'What if I gain too much weight?',
    answer:
      'If weight gain exceeds 1-2 lbs per week (beyond initial water/glycogen gain), slow the calorie increases to 50 calories/week or pause increases for 1-2 weeks to allow metabolism to catch up.',
  },
];

const relatedCalculators = [
  {
    name: 'Metabolic Adaptation Rate Calculator',
    slug: 'metabolic-adaptation-rate-calculator',
    description: 'Assess metabolic adaptation before reverse dieting.',
  },
  {
    name: 'Carb Refeed Timing Calculator',
    slug: 'carb-refeed-timing-calculator',
    description: 'Plan carb refeed timing during dieting.',
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

const baseUrl = 'https://mycalculating.com/category/health-fitness/reverse-dieting-calorie-increase-planner';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Reverse Dieting Calorie Increase Planner', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Reverse Dieting Calorie Increase Planner',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Plan reverse dieting calorie increases from current calories, target calories, weekly increase, and current weight.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const currentCalories = values.currentCalories;
  const targetCalories = values.targetCalories;
  const weeklyIncrease = values.weeklyIncrease;
  const currentWeight = values.currentWeight;
  
  const totalIncrease = targetCalories - currentCalories;
  const weeksNeeded = totalIncrease > 0 ? Math.ceil(totalIncrease / weeklyIncrease) : 0;
  
  // Generate weekly plan
  const weeklyCaloriePlan: { week: number; calories: number }[] = [];
  let currentWeekCalories = currentCalories;
  
  for (let week = 1; week <= weeksNeeded; week++) {
    currentWeekCalories = Math.min(currentWeekCalories + weeklyIncrease, targetCalories);
    weeklyCaloriePlan.push({ week, calories: Math.round(currentWeekCalories) });
    if (currentWeekCalories >= targetCalories) break;
  }
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your reverse dieting plan appears well-structured. Gradual calorie increases will help restore metabolic rate while minimizing fat regain.';
  
  if (totalIncrease < 0) {
    status = 'low';
    interpretation = 'Target calories are below current calories. Reverse dieting involves increasing calories, not decreasing. Adjust your target to be above current intake.';
  } else if (totalIncrease > 1000) {
    status = 'moderate';
    interpretation = 'Large calorie gap detected. This reverse dieting process will take time. Consider if target is appropriate, or plan for an extended reverse dieting period with careful monitoring.';
  } else if (weeklyIncrease > 200) {
    status = 'moderate';
    interpretation = 'Weekly increase is high. Large weekly increases may cause rapid weight gain. Consider reducing to 50-150 calories/week for better metabolic adaptation and minimal fat gain.';
  } else if (weeklyIncrease < 50) {
    status = 'good';
    interpretation = 'Conservative weekly increase. This very gradual approach minimizes fat gain risk but extends the reverse dieting timeline. Monitor progress and adjust if needed.';
  } else if (weeksNeeded > 16) {
    status = 'moderate';
    interpretation = 'Extended reverse dieting timeline. This will take many weeks. Consider slightly larger weekly increases (100-150 cal) to shorten timeline while still being gradual.';
  } else {
    status = 'optimal';
    interpretation = 'Your reverse dieting plan is well-structured. Gradual increases over a reasonable timeframe will help restore metabolic rate while minimizing fat regain.';
  }
  
  const recommendations: string[] = [];
  
  // Total increase recommendations
  if (totalIncrease < 0) {
    recommendations.push(`Invalid target: target calories (${targetCalories} cal) is below current (${currentCalories} cal). Reverse dieting requires increasing calories. Set target above current intake.`);
  } else if (totalIncrease > 1000) {
    recommendations.push(`Large calorie gap (${totalIncrease} cal): this is a significant increase. Ensure target is appropriate for your goals. This will take ${weeksNeeded} weeks at current rate. Consider if target should be adjusted or if you need a longer timeline.`);
  } else if (totalIncrease >= 500 && totalIncrease <= 1000) {
    recommendations.push(`Moderate calorie gap (${totalIncrease} cal): reasonable increase that will take ${weeksNeeded} weeks. Continue with planned approach.`);
  } else {
    recommendations.push(`Small calorie gap (${totalIncrease} cal): minimal increase needed. This will take ${weeksNeeded} weeks. Consider if slightly larger weekly increases (100-150 cal) would be appropriate.`);
  }
  
  // Weekly increase recommendations
  if (weeklyIncrease > 200) {
    recommendations.push(`High weekly increase (${weeklyIncrease} cal/week): this may cause rapid weight gain and poor metabolic adaptation. Reduce to 50-150 calories/week for better results. Current rate may lead to excessive fat gain.`);
  } else if (weeklyIncrease > 150) {
    recommendations.push(`Moderate-high weekly increase (${weeklyIncrease} cal/week): monitor weight closely. If weight gain exceeds 1-2 lbs/week (beyond initial water/glycogen), reduce to 50-100 cal/week.`);
  } else if (weeklyIncrease >= 100 && weeklyIncrease <= 150) {
    recommendations.push(`Optimal weekly increase (${weeklyIncrease} cal/week): good balance between progress and metabolic adaptation. Continue with this rate and monitor weight response.`);
  } else if (weeklyIncrease >= 50 && weeklyIncrease < 100) {
    recommendations.push(`Conservative weekly increase (${weeklyIncrease} cal/week): very gradual approach minimizes fat gain risk. This is appropriate if coming from a large deficit or if you're very weight-sensitive.`);
  } else {
    recommendations.push(`Very small weekly increase (${weeklyIncrease} cal/week): extremely gradual. This will take a long time. Consider increasing to 50-100 cal/week unless you have specific reasons for this slow rate.`);
  }
  
  // Weeks needed recommendations
  if (weeksNeeded > 20) {
    recommendations.push(`Extended timeline (${weeksNeeded} weeks): this reverse dieting process will take many months. Consider increasing weekly increment to 100-150 cal to shorten timeline while remaining gradual.`);
  } else if (weeksNeeded > 12) {
    recommendations.push(`Long timeline (${weeksNeeded} weeks): plan for a 3-4 month reverse dieting period. This is reasonable for large calorie gaps. Monitor progress and adjust as needed.`);
  } else if (weeksNeeded >= 8 && weeksNeeded <= 12) {
    recommendations.push(`Moderate timeline (${weeksNeeded} weeks): good balance. This 2-3 month period allows for proper metabolic adaptation. Continue with planned approach.`);
  } else if (weeksNeeded >= 4 && weeksNeeded < 8) {
    recommendations.push(`Short timeline (${weeksNeeded} weeks): relatively quick reverse dieting. Monitor weight closely to ensure minimal fat gain. This timeline works well for smaller calorie gaps.`);
  } else {
    recommendations.push(`Very short timeline (${weeksNeeded} weeks): quick transition. Ensure weekly increases aren't too aggressive. Monitor weight response carefully.`);
  }
  
  // Current calories recommendations
  if (currentCalories < 1200) {
    recommendations.push(`Very low current calories (${currentCalories} cal): this is extremely low and may indicate severe restriction. Reverse dieting is important, but consider consulting a healthcare provider. Start with 50-100 cal/week increases.`);
  } else if (currentCalories < 1500) {
    recommendations.push(`Low current calories (${currentCalories} cal): coming from a significant deficit. Start conservatively with 50-100 cal/week increases and monitor closely.`);
  } else if (currentCalories >= 1500 && currentCalories <= 2000) {
    recommendations.push(`Moderate current calories (${currentCalories} cal): reasonable starting point. Weekly increases of 100-150 cal are typically appropriate.`);
  } else {
    recommendations.push(`Higher current calories (${currentCalories} cal): you're already at a reasonable intake. Ensure target is appropriate and weekly increases are gradual.`);
  }
  
  // Weight-based recommendations
  const caloriesPerPound = currentCalories / currentWeight;
  if (caloriesPerPound < 10) {
    recommendations.push(`Very low calories per pound (${caloriesPerPound.toFixed(1)} cal/lb): indicates significant restriction relative to body weight. Reverse dieting is important to restore metabolic health.`);
  } else if (caloriesPerPound < 12) {
    recommendations.push(`Low calories per pound (${caloriesPerPound.toFixed(1)} cal/lb): suggests moderate restriction. Reverse dieting will help restore metabolic function.`);
  } else if (caloriesPerPound >= 12 && caloriesPerPound <= 16) {
    recommendations.push(`Reasonable calories per pound (${caloriesPerPound.toFixed(1)} cal/lb): current intake is reasonable relative to weight. Continue with planned reverse dieting approach.`);
  } else {
    recommendations.push(`Higher calories per pound (${caloriesPerPound.toFixed(1)} cal/lb): current intake is relatively high. Ensure target is appropriate for your goals.`);
  }
  
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Adjust plan: review calorie targets and weekly increases. Ensure increases are gradual (50-150 cal/week) and timeline is reasonable (8-16 weeks for typical gaps).');
  }
  
  const plan = [
    { label: 'This Week', detail: `Start reverse dieting: increase from ${currentCalories} to ${weeklyCaloriePlan[0]?.calories || currentCalories} calories. Monitor weight, energy, and hunger. Expect initial water/glycogen weight gain (2-5 lbs).` },
    { label: 'This Month', detail: `Continue gradual increases: follow weekly plan to reach ${weeklyCaloriePlan[Math.min(3, weeksNeeded - 1)]?.calories || targetCalories} calories by week 4. Monitor weight trends (should stabilize after initial gain) and adjust if fat gain exceeds expectations.` },
    { label: 'Ongoing', detail: `Complete reverse dieting: reach target of ${targetCalories} calories over ${weeksNeeded} weeks. Once at target, maintain for 2-4 weeks to allow metabolism to stabilize. Then decide on next phase (maintenance, slight surplus, or continue reverse dieting if needed).` },
  ];
  
  return { currentCalories, targetCalories, weeklyIncrease, currentWeight, totalIncrease, weeksNeeded, weeklyCaloriePlan, status, interpretation, recommendations, plan };
};

export default function ReverseDietingCalorieIncreasePlanner() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentCalories: undefined,
      targetCalories: undefined,
      weeklyIncrease: undefined,
      currentWeight: undefined,
    },
  });
  
  return (
    <div className="space-y-8">
      <Script id="reverse-dieting-calorie-increase-planner-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Reverse Dieting Calorie Increase Planner
          </CardTitle>
          <CardDescription>Plan reverse dieting calorie increases from current calories, target calories, weekly increase, and current weight.</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Input your reverse dieting data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="currentCalories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current calories (calories/day)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 1500" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetCalories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target calories (calories/day)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 2200" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="weeklyIncrease"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weekly increase (calories/week)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 100" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current weight (lbs)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 150" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate reverse dieting plan
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
            <CardDescription>See reverse dieting plan and weekly schedule.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total increase</p>
                <p className="text-2xl font-semibold text-primary">{result.totalIncrease}</p>
                <p className="text-xs text-muted-foreground">calories</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Weeks needed</p>
                <p className="text-2xl font-semibold text-primary">{result.weeksNeeded}</p>
                <p className="text-xs text-muted-foreground">weeks</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Weekly increase</p>
                <p className="text-2xl font-semibold text-primary">{result.weeklyIncrease}</p>
                <p className="text-xs text-muted-foreground">cal/week</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
            </div>
            {result.weeklyCaloriePlan.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-3">Weekly Calorie Schedule</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {result.weeklyCaloriePlan.map((week) => (
                    <div key={week.week} className="p-3 border rounded text-center">
                      <p className="text-xs text-muted-foreground">Week {week.week}</p>
                      <p className="text-sm font-semibold">{week.calories} cal</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
            <strong>Total increase needed</strong> = target calories - current calories. This represents the calorie gap to close during reverse dieting.
          </p>
          <p>
            <strong>Weeks needed</strong> = total increase / weekly increase. This calculates how many weeks it will take to reach target calories at the specified weekly increase rate.
          </p>
          <p>
            <strong>Weekly calorie plan</strong> = current calories + (weekly increase × week number). Each week, calories increase by the specified amount until reaching target.
          </p>
          <p>Reverse dieting gradually increases calories to restore metabolic rate after dieting. Typical increases are 50-150 calories per week, allowing metabolism to adapt without excessive fat gain.</p>
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
                <p className="text-sm text-muted-foreground">Current calories</p>
                <p className="text-xl font-semibold text-primary">{result.currentCalories} cal/day</p>
                <p className="text-xs text-muted-foreground">Starting point</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Target calories</p>
                <p className="text-xl font-semibold text-primary">{result.targetCalories} cal/day</p>
                <p className="text-xs text-muted-foreground">Goal intake</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Calorie gap</p>
                <p className="text-xl font-semibold text-primary">{result.totalIncrease} cal</p>
                <p className="text-xs text-muted-foreground">To close</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your reverse dieting data to see additional insights.</p>
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

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/MedicalWebPage">
        <meta itemProp="name" content="The Definitive Guide to Reverse Dieting: Restoring Metabolic Rate After Calorie Restriction" />
        <meta itemProp="description" content="An in-depth, authoritative guide on reverse dieting, detailing how to gradually increase calories after dieting, restore metabolic rate, minimize fat regain, and transition to maintenance or bulking phases." />
        <meta itemProp="keywords" content="reverse dieting calculator, metabolic restoration, calorie increase planner, post-diet transition, metabolic rate recovery" />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-02" />
        <meta itemProp="url" content="/definitive-reverse-dieting-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Reverse Dieting: Restoring Metabolic Rate After Calorie Restriction</h1>
        <p className="text-lg italic text-gray-700">Explore how to gradually increase calories after dieting, restore metabolic function, and transition successfully to maintenance or bulking phases while minimizing fat regain.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li><a href="#what-is" className="hover:underline">What is Reverse Dieting?</a></li>
          <li><a href="#benefits" className="hover:underline">Benefits of Reverse Dieting</a></li>
          <li><a href="#how-to" className="hover:underline">How to Reverse Diet</a></li>
          <li><a href="#timing" className="hover:underline">When to Start Reverse Dieting</a></li>
          <li><a href="#monitoring" className="hover:underline">Monitoring Progress</a></li>
        </ul>
        <hr />

        <h2 id="what-is" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Reverse Dieting?</h2>
        <p>Reverse dieting is the gradual process of increasing calorie intake after a period of calorie restriction. Instead of jumping immediately to maintenance calories, you slowly increase calories week by week, typically by 50-150 calories per week, allowing your metabolism to adapt and restore metabolic rate.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why Reverse Diet Instead of Jumping to Maintenance?</h3>
        <p>After extended dieting, your metabolism has adapted to lower calorie intake. Suddenly increasing to maintenance can cause rapid fat gain as your body isn't ready to handle the increased calories. Reverse dieting allows gradual adaptation, minimizing fat regain while restoring metabolic function.</p>

        <h2 id="benefits" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benefits of Reverse Dieting</h2>
        <p>Reverse dieting offers several key benefits:</p>
        <ul>
          <li><b>Metabolic Restoration:</b> Gradually increases metabolic rate back toward baseline levels.</li>
          <li><b>Minimal Fat Regain:</b> Slow calorie increases minimize fat gain compared to sudden increases.</li>
          <li><b>Improved Energy:</b> Higher calories improve energy levels, workout performance, and recovery.</li>
          <li><b>Sustainable Transition:</b> Provides a structured approach to moving from dieting to maintenance or bulking.</li>
          <li><b>Psychological Benefits:</b> Reduces fear of weight gain and helps build confidence with higher calorie intake.</li>
        </ul>

        <h2 id="how-to" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How to Reverse Diet</h2>
        <p>The reverse dieting process involves gradual weekly calorie increases:</p>
        <ul>
          <li><b>Start with 50-100 calories/week:</b> If coming from a large deficit or extended dieting period.</li>
          <li><b>Increase to 100-150 calories/week:</b> As metabolism adapts and you feel comfortable with increases.</li>
          <li><b>Monitor weight and body composition:</b> Track changes to ensure fat gain stays minimal.</li>
          <li><b>Adjust as needed:</b> Slow increases if weight gain is too rapid, or increase faster if weight is stable.</li>
          <li><b>Continue until reaching target:</b> Maintain increases until reaching maintenance or desired calorie level.</li>
        </ul>

        <h2 id="timing" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">When to Start Reverse Dieting</h2>
        <p>Consider starting reverse dieting when:</p>
        <ul>
          <li>You've been dieting for 12+ weeks and metabolic adaptation is significant.</li>
          <li>Weight loss has stalled despite adherence to your diet plan.</li>
          <li>You've reached your goal weight and want to transition to maintenance.</li>
          <li>Energy levels, performance, or recovery have significantly declined.</li>
          <li>You want to transition from cutting to bulking phase.</li>
        </ul>

        <h2 id="monitoring" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Monitoring Progress</h2>
        <p>Key metrics to monitor during reverse dieting:</p>
        <ul>
          <li><b>Weight:</b> Expect 1-3 lbs initial gain from water/glycogen, then minimal increases.</li>
          <li><b>Body Composition:</b> Track body fat percentage to ensure fat gain is minimal.</li>
          <li><b>Energy Levels:</b> Should improve as calories increase.</li>
          <li><b>Performance:</b> Strength and workout performance should improve.</li>
          <li><b>Hunger:</b> Should decrease as calories increase toward maintenance.</li>
        </ul>

        <hr />
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Reverse dieting is an essential strategy for transitioning from calorie restriction to maintenance or bulking. By gradually increasing calories, you can restore metabolic rate, minimize fat regain, and successfully maintain your results long-term. Plan your reverse dieting approach based on your current calories, target calories, and metabolic adaptation level.</p>
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
          <p>This tool calculates reverse dieting calorie increase plan from current calories, target calories, weekly increase, and current weight.</p>
          <p>Outputs include total increase needed, weeks needed, weekly calorie schedule, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

