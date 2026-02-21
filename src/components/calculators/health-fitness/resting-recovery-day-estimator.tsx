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
  trainingDaysPerWeek: z.number({ invalid_type_error: 'Enter training days' }).min(1).max(7),
  trainingIntensity: z.enum(['low', 'moderate', 'high', 'very-high'], {
    invalid_type_error: 'Select training intensity',
  }),
  sleepHours: z.number({ invalid_type_error: 'Enter sleep hours' }).min(4).max(12),
  stressLevel: z.enum(['low', 'moderate', 'high'], {
    invalid_type_error: 'Select stress level',
  }),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  trainingDaysPerWeek: number;
  trainingIntensity: string;
  sleepHours: number;
  stressLevel: string;
  recoveryDaysNeeded: number;
  recoveryScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter training days per week (1-7).',
  'Select training intensity (low, moderate, high, very high).',
  'Enter average sleep hours per night (4-12).',
  'Select stress level (low, moderate, high).',
  'Review recovery days needed, recovery score, and recommendations.',
];

const faqs = [
  {
    question: 'What is a recovery day?',
    answer:
      'A recovery day is a day of rest or very light activity that allows your body to repair, adapt, and restore energy. Recovery days are essential for muscle repair, glycogen restoration, hormone balance, and preventing overtraining. They\'re as important as training days for progress.',
  },
  {
    question: 'How many recovery days do I need?',
    answer:
      'Recovery needs vary by training volume, intensity, fitness level, and individual factors. Generally: low intensity training may need 1-2 recovery days per week, moderate intensity needs 2-3 days, high intensity needs 3-4 days, and very high intensity may need 4-5 days. This calculator provides personalized estimates.',
  },
  {
    question: 'What is active recovery vs. complete rest?',
    answer:
      'Active recovery involves light activities (walking, yoga, stretching) that promote blood flow and recovery without adding stress. Complete rest involves minimal activity. Both have benefits: active recovery for light training weeks, complete rest for high-intensity periods or when feeling very fatigued.',
  },
  {
    question: 'How does sleep affect recovery?',
    answer:
      'Sleep is crucial for recovery: it promotes muscle repair, hormone production (growth hormone, testosterone), glycogen restoration, and mental recovery. Inadequate sleep (less than 7 hours) significantly impairs recovery, requiring more recovery days. Aim for 7-9 hours for optimal recovery.',
  },
  {
    question: 'How does stress affect recovery needs?',
    answer:
      'High stress (work, life, emotional) increases cortisol, impairs recovery, and requires more recovery time. Stress and training stress are cumulative—high life stress plus high training stress significantly increases recovery needs. Managing stress is essential for optimal recovery.',
  },
  {
    question: 'What are signs I need more recovery?',
    answer:
      'Signs include: persistent fatigue, decreased performance, increased resting heart rate, poor sleep, mood changes, frequent illness, persistent muscle soreness, and lack of motivation. If experiencing multiple signs, increase recovery days.',
  },
  {
    question: 'Can I train every day?',
    answer:
      'Some people can train daily with proper programming (varying intensity, body parts, or activity types), but most people need 1-3 complete rest days per week. Daily training requires excellent recovery (sleep, nutrition, stress management) and may not be optimal for most people.',
  },
  {
    question: 'What should I do on recovery days?',
    answer:
      'Recovery day activities: light walking, stretching, yoga, foam rolling, mobility work, or complete rest. Avoid intense exercise. Focus on sleep, nutrition, hydration, and stress management. Active recovery can be beneficial but should be truly light.',
  },
  {
    question: 'How does training intensity affect recovery?',
    answer:
      'Higher intensity training creates more muscle damage, metabolic stress, and nervous system fatigue, requiring more recovery time. Very high intensity sessions may need 48-72 hours before training the same muscle groups again. Lower intensity allows more frequent training.',
  },
  {
    question: 'Should recovery days be scheduled or as needed?',
    answer:
      'Both approaches work: scheduled recovery (planned rest days) ensures adequate recovery, while as-needed recovery (listening to body) allows flexibility. Most people benefit from a combination: scheduled recovery days with flexibility to add more if needed based on fatigue and performance.',
  },
];

const relatedCalculators = [
  {
    name: 'Sleep Debt Calculator',
    slug: 'habit-streak-tracker-calculator',
    description: 'Assess sleep quality and recovery needs.',
  },
  {
    name: 'Muscle Soreness Recovery Estimator',
    slug: 'muscle-soreness-recovery-estimator',
    description: 'Estimate recovery time from muscle soreness.',
  },
  {
    name: 'Work Stress Fatigue Index',
    slug: 'work-stress-fatigue-index',
    description: 'Assess work stress impact on recovery.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/resting-recovery-day-estimator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Resting Recovery Day Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Resting Recovery Day Estimator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate recovery days needed based on training volume, intensity, sleep, and stress levels.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// Intensity recovery multipliers
const intensityRecovery: Record<string, number> = {
  'low': 0.5, // Low intensity = less recovery needed
  'moderate': 1.0,
  'high': 1.5,
  'very-high': 2.0, // Very high = most recovery needed
};

const calculateResult = (values: FormValues): ResultPayload => {
  const trainingDaysPerWeek = values.trainingDaysPerWeek;
  const trainingIntensity = values.trainingIntensity;
  const sleepHours = values.sleepHours;
  const stressLevel = values.stressLevel;
  
  // Base recovery days: training days create need for recovery
  const intensityMultiplier = intensityRecovery[trainingIntensity] || 1.0;
  const baseRecoveryDays = trainingDaysPerWeek * intensityMultiplier * 0.4; // Rough estimate
  
  // Sleep adjustment (less sleep = more recovery needed)
  let sleepAdjustment = 0;
  if (sleepHours < 6) {
    sleepAdjustment = 1.5; // Very poor sleep
  } else if (sleepHours < 7) {
    sleepAdjustment = 1.0; // Poor sleep
  } else if (sleepHours < 8) {
    sleepAdjustment = 0.5; // Moderate sleep
  } else {
    sleepAdjustment = 0; // Good sleep
  }
  
  // Stress adjustment
  let stressAdjustment = 0;
  if (stressLevel === 'high') {
    stressAdjustment = 1.0;
  } else if (stressLevel === 'moderate') {
    stressAdjustment = 0.5;
  }
  
  // Total recovery days needed
  const recoveryDaysNeeded = Math.ceil(baseRecoveryDays + sleepAdjustment + stressAdjustment);
  const clampedRecoveryDays = clamp(recoveryDaysNeeded, 1, 6); // At least 1, max 6
  
  // Recovery score (0-100)
  const trainingDaysWithRecovery = trainingDaysPerWeek + clampedRecoveryDays;
  const recoveryRatio = clampedRecoveryDays / trainingDaysPerWeek;
  
  let recoveryScore = 100;
  if (recoveryRatio < 0.3) {
    recoveryScore = 30; // Very low recovery
  } else if (recoveryRatio < 0.5) {
    recoveryScore = 50; // Low recovery
  } else if (recoveryRatio < 0.7) {
    recoveryScore = 70; // Moderate recovery
  } else if (recoveryRatio < 1.0) {
    recoveryScore = 85; // Good recovery
  }
  
  // Adjust for sleep and stress
  if (sleepHours < 7) recoveryScore -= 15;
  if (stressLevel === 'high') recoveryScore -= 10;
  
  recoveryScore = clamp(recoveryScore, 0, 100);
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your recovery schedule appears adequate. Continue monitoring and adjust as needed based on performance and fatigue.';

  if (recoveryScore < 40 || clampedRecoveryDays < 2) {
    status = 'low';
    interpretation = 'Your recovery days are insufficient. Inadequate recovery increases risk of overtraining, injury, and stalled progress. Increase recovery days immediately and prioritize sleep and stress management.';
  } else if (recoveryScore < 60 || clampedRecoveryDays < 3) {
    status = 'moderate';
    interpretation = 'Your recovery days may be insufficient, especially with high training intensity or stress. Consider increasing recovery days and improving sleep quality to support better recovery.';
  } else if (recoveryScore < 80) {
    status = 'good';
    interpretation = 'Your recovery schedule is reasonable but could be optimized. Ensure you\'re getting adequate sleep and managing stress to maximize recovery quality.';
  } else {
    status = 'optimal';
    interpretation = 'Your recovery schedule appears well-balanced. Continue prioritizing sleep, stress management, and adequate rest to maintain optimal recovery and performance.';
  }

  const recommendations = [
    `Schedule ${clampedRecoveryDays} recovery days per week: plan rest or very light activity days to allow muscle repair, glycogen restoration, and nervous system recovery. Recovery is as important as training for progress.`,
    'Prioritize sleep: aim for 7-9 hours of quality sleep per night. Sleep is when most recovery occurs—muscle repair, hormone production, and glycogen restoration. Inadequate sleep significantly impairs recovery.',
  ];
  
  if (sleepHours < 7) {
    recommendations.push('Improve sleep quality: with less than 7 hours of sleep, recovery is significantly impaired. Prioritize sleep hygiene, consistent sleep schedule, and creating optimal sleep environment to improve recovery.');
  }
  
  if (stressLevel === 'high') {
    recommendations.push('Manage stress: high stress increases cortisol and impairs recovery. Implement stress management strategies (meditation, relaxation, time management) to support recovery and prevent overtraining.');
  }
  
  if (trainingIntensity === 'very-high' && clampedRecoveryDays < 4) {
    recommendations.push('Increase recovery for high intensity: very high intensity training requires more recovery. Consider 4-5 recovery days per week, with longer rest periods between intense sessions targeting the same muscle groups.');
  }

  const plan = [
    { label: 'This Week', detail: `Schedule ${clampedRecoveryDays} recovery days this week. Plan complete rest or very light activity (walking, stretching). Monitor fatigue, performance, and sleep quality.` },
    { label: 'This Month', detail: 'Establish consistent recovery schedule. Track training performance, fatigue levels, and recovery markers (sleep quality, resting heart rate, motivation). Adjust recovery days based on how you feel and perform.' },
    { label: 'Ongoing', detail: 'Continue prioritizing recovery as part of training. Maintain adequate sleep, manage stress, and listen to your body. Recovery needs may change with training phases, life stress, and fitness improvements.' },
  ];

  return { trainingDaysPerWeek, trainingIntensity, sleepHours, stressLevel, recoveryDaysNeeded: clampedRecoveryDays, recoveryScore, status, interpretation, recommendations, plan };
};

export default function RestingRecoveryDayEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trainingDaysPerWeek: undefined,
      trainingIntensity: undefined,
      sleepHours: undefined,
      stressLevel: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="resting-recovery-day-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Resting Recovery Day Estimator
          </CardTitle>
          <CardDescription>Estimate recovery days needed based on training volume, intensity, sleep, and stress levels.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your training and recovery data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="trainingDaysPerWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Training days per week</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="trainingIntensity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Training intensity</FormLabel>
                      <FormControl>
                        <select
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value as FormValues['trainingIntensity'])}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select intensity</option>
                          <option value="low">Low</option>
                          <option value="moderate">Moderate</option>
                          <option value="high">High</option>
                          <option value="very-high">Very High</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sleepHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep hours per night</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 7.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stressLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stress level</FormLabel>
                      <FormControl>
                        <select
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value as FormValues['stressLevel'])}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select level</option>
                          <option value="low">Low</option>
                          <option value="moderate">Moderate</option>
                          <option value="high">High</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Estimate recovery days
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
            <CardDescription>See recovery days needed, recovery score, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recovery days needed</p>
                <p className="text-2xl font-semibold text-primary">{result.recoveryDaysNeeded}</p>
                <p className="text-xs text-muted-foreground">Per week</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recovery score</p>
                <p className="text-2xl font-semibold text-primary">{result.recoveryScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Training:Recovery ratio</p>
                <p className="text-2xl font-semibold text-primary">1:{((result.recoveryDaysNeeded / result.trainingDaysPerWeek) * 10).toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Per 10 training days</p>
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
            <strong>Base recovery days</strong> = Training Days × Intensity Multiplier × 0.4. Intensity multipliers: low = 0.5, moderate = 1.0, high = 1.5, very high = 2.0. Higher intensity requires more recovery.
          </p>
          <p>
            <strong>Sleep adjustment</strong> adds recovery days: less than 6 hours = +1.5 days, 6-7 hours = +1.0 day, 7-8 hours = +0.5 days, 8+ hours = 0 days. Inadequate sleep significantly impairs recovery.
          </p>
          <p>
            <strong>Stress adjustment</strong> adds recovery days: high stress = +1.0 day, moderate = +0.5 days, low = 0 days. Stress and training stress are cumulative, increasing recovery needs.
          </p>
          <p>Recovery days are essential for muscle repair, glycogen restoration, hormone balance, and preventing overtraining. Adequate recovery is as important as training for progress and injury prevention.</p>
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
                <p className="text-sm text-muted-foreground">Total days</p>
                <p className="text-xl font-semibold text-primary">
                  {result.trainingDaysPerWeek + result.recoveryDaysNeeded}
                </p>
                <p className="text-xs text-muted-foreground">Training + Recovery</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recovery percentage</p>
                <p className="text-xl font-semibold text-primary">
                  {((result.recoveryDaysNeeded / (result.trainingDaysPerWeek + result.recoveryDaysNeeded)) * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Of total days</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recovery quality</p>
                <p className="text-xl font-semibold text-primary">
                  {result.recoveryScore >= 80 ? 'Optimal' : result.recoveryScore >= 60 ? 'Good' : result.recoveryScore >= 40 ? 'Moderate' : 'Insufficient'}
                </p>
                <p className="text-xs text-muted-foreground">Based on score</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your training and recovery data to see additional insights.</p>
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

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemType="https://schema.org/MedicalWebPage">
    <meta itemProp="name" content="The Definitive Guide to Recovery Days: Optimizing Rest for Training Progress" />
    <meta itemProp="description" content="An expert guide on recovery days, how many you need, factors affecting recovery, and strategies to optimize rest for better training progress and injury prevention." />
    <meta itemProp="keywords" content="recovery days calculator, rest days training, overtraining prevention, training recovery, sleep and recovery" />
    <meta itemProp="author" content="[Your Site's Health Team]" />
    <meta itemProp="datePublished" content="2025-12-01" />
    <meta itemProp="url" content="/definitive-recovery-days-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Recovery Days: Optimizing Rest for Training Progress</h1>
    <p className="text-lg italic text-gray-700">Explore the science of recovery, how many recovery days you need, factors affecting recovery, and strategies to optimize rest for better training progress and injury prevention.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#what-is-recovery" className="hover:underline">What Is Recovery and Why It Matters</a></li>
        <li><a href="#recovery-process" className="hover:underline">The Recovery Process</a></li>
        <li><a href="#factors-affecting" className="hover:underline">Factors Affecting Recovery Needs</a></li>
        <li><a href="#active-vs-rest" className="hover:underline">Active Recovery vs. Complete Rest</a></li>
        <li><a href="#optimizing-recovery" className="hover:underline">Optimizing Recovery</a></li>
    </ul>
<hr />

    <h2 id="what-is-recovery" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Is Recovery and Why It Matters</h2>
    <p>**Recovery** is the process by which your body repairs, adapts, and restores itself after training stress. Recovery days are periods of rest or very light activity that allow these processes to occur. Recovery is not the absence of training—it's an essential component of the training process itself.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Why Recovery Is Essential</h3>
<p>Recovery enables:</p>
<ul>
    <li><b>Muscle repair:</b> Repairing micro-tears from training</li>
    <li><b>Glycogen restoration:</b> Replenishing energy stores</li>
    <li><b>Hormone balance:</b> Restoring testosterone, growth hormone, cortisol balance</li>
    <li><b>Nervous system recovery:</b> Restoring central nervous system function</li>
    <li><b>Adaptation:</b> Making strength and fitness gains</li>
    <li><b>Injury prevention:</b> Allowing tissues to heal before next stress</li>
</ul>
<p>Without adequate recovery, training stress accumulates, leading to overtraining, injury, and stalled progress.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">The Recovery-Adaptation Cycle</h3>
<p>Training creates stress → Recovery allows repair → Adaptation occurs (strength/fitness gains) → Ready for next training session. This cycle requires adequate recovery time between sessions.</p>

<hr />

    <h2 id="recovery-process" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Recovery Process</h2>
    <p>Recovery involves multiple physiological processes:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Muscle Repair</h3>
    <p>Training creates micro-tears in muscle fibers. Recovery allows:</p>
    <ul>
        <li>Inflammation response (initial 24-48 hours)</li>
        <li>Muscle protein synthesis (repair and growth)</li>
        <li>Remodeling and strengthening</li>
    </ul>
    <p>This process typically takes 24-72 hours depending on training intensity and muscle groups.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Energy Restoration</h3>
    <p>Training depletes glycogen (stored carbohydrates). Recovery allows:</p>
    <ul>
        <li>Glycogen resynthesis (24-48 hours with adequate nutrition)</li>
        <li>ATP and creatine phosphate restoration (minutes to hours)</li>
        <li>Metabolic recovery</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Hormone Restoration</h3>
    <p>Training affects hormone levels. Recovery allows:</p>
    <ul>
        <li>Testosterone and growth hormone restoration</li>
        <li>Cortisol reduction</li>
        <li>Hormone balance restoration</li>
    </ul>
    <p>Sleep is particularly important for hormone restoration.</p>

<hr />

    <h2 id="factors-affecting" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Factors Affecting Recovery Needs</h2>
    <p>Recovery needs vary significantly based on multiple factors:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Training Volume and Intensity</h3>
    <p>Higher volume and intensity create more stress, requiring more recovery:</p>
    <ul>
        <li>Low intensity: 1-2 recovery days per week</li>
        <li>Moderate intensity: 2-3 recovery days</li>
        <li>High intensity: 3-4 recovery days</li>
        <li>Very high intensity: 4-5 recovery days</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Sleep</h3>
    <p>Sleep is when most recovery occurs:</p>
    <ul>
        <li>7-9 hours: Optimal recovery</li>
        <li>6-7 hours: Moderate recovery (may need more recovery days)</li>
        <li>Less than 6 hours: Poor recovery (significantly more recovery days needed)</li>
    </ul>
    <p>Inadequate sleep can double recovery needs.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Stress</h3>
    <p>Life stress and training stress are cumulative:</p>
    <ul>
        <li>High life stress + high training stress = significantly increased recovery needs</li>
        <li>Stress increases cortisol, impairing recovery</li>
        <li>Stress management is essential for optimal recovery</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">4. Nutrition</h3>
    <p>Adequate nutrition supports recovery:</p>
    <ul>
        <li>Protein: Essential for muscle repair</li>
        <li>Carbohydrates: Restore glycogen</li>
        <li>Hydration: Supports all recovery processes</li>
        <li>Micronutrients: Support metabolic processes</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">5. Age and Fitness Level</h3>
    <p>Older adults and less fit individuals may need more recovery time. More experienced athletes may recover faster but still need adequate rest.</p>

<hr />

    <h2 id="active-vs-rest" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Active Recovery vs. Complete Rest</h2>
    <p>Both active recovery and complete rest have benefits:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Active Recovery</h3>
    <p>Light activities that promote recovery without adding stress:</p>
    <ul>
        <li>Walking, light cycling, yoga, stretching</li>
        <li>Promotes blood flow and nutrient delivery</li>
        <li>Reduces muscle stiffness</li>
        <li>Good for light training weeks or when feeling good</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Complete Rest</h3>
    <p>Minimal activity, allowing maximum recovery:</p>
    <ul>
        <li>Essential for high-intensity periods</li>
        <li>Needed when feeling very fatigued</li>
        <li>Allows maximum energy conservation</li>
        <li>Important for nervous system recovery</li>
    </ul>
    <p>Most people benefit from a combination: some active recovery days and some complete rest days.</p>

<hr />

    <h2 id="optimizing-recovery" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Optimizing Recovery</h2>
    <p>Optimize recovery through multiple strategies:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Schedule Recovery Days</h3>
    <p>Plan recovery days as part of your training program. Don't wait until you're exhausted—proactive recovery prevents problems.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Prioritize Sleep</h3>
    <p>Aim for 7-9 hours of quality sleep. Sleep is when most recovery occurs—muscle repair, hormone production, and glycogen restoration.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Manage Stress</h3>
    <p>Implement stress management strategies. High stress impairs recovery and increases recovery needs.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">4. Optimize Nutrition</h3>
    <p>Ensure adequate protein, carbohydrates, and hydration to support recovery processes.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">5. Listen to Your Body</h3>
    <p>Monitor fatigue, performance, and recovery markers. Adjust recovery days based on how you feel and perform.</p>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Recovery days are essential for training progress, injury prevention, and long-term health. Understanding your recovery needs based on training volume, intensity, sleep, and stress helps you optimize your training program. Use this calculator to estimate your recovery needs, and remember: recovery is not optional—it's an essential part of the training process. Prioritize adequate rest, sleep, and stress management to maximize your training results.</p>
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
          <p>This tool estimates recovery days needed based on training volume, intensity, sleep hours, and stress levels.</p>
          <p>Outputs include recovery days needed, recovery score, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

