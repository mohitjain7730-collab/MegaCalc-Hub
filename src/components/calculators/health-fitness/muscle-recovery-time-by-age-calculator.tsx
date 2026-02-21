'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Clock, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  age: z.number({ invalid_type_error: 'Enter age' }).min(18).max(100),
  trainingIntensity: z.number({ invalid_type_error: 'Enter training intensity' }).min(1).max(10),
  muscleGroup: z.enum(['small', 'medium', 'large']),
  trainingExperience: z.enum(['beginner', 'intermediate', 'advanced']),
  sleepHours: z.number({ invalid_type_error: 'Enter sleep hours' }).min(3).max(12),
  nutritionQuality: z.number({ invalid_type_error: 'Enter nutrition quality' }).min(1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  recoveryHours: number;
  recoveryDays: number;
  ageFactor: number;
  status: 'fast-recovery' | 'normal-recovery' | 'slow-recovery';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your age (recovery time increases with age).',
  'Rate training intensity (1 = light, 10 = very intense).',
  'Select muscle group size: small (biceps, triceps), medium (chest, back), or large (legs, full body).',
  'Select training experience level: beginner, intermediate, or advanced.',
  'Log average nightly sleep hours.',
  'Rate nutrition quality (1 = poor, 10 = excellent).',
  'Review estimated recovery time in hours and days.',
];

const faqs = [
  {
    question: 'How does age affect muscle recovery?',
    answer:
      'Recovery time increases with age. Younger adults (18-30) recover faster (24-48 hours), while older adults (50+) may need 48-72+ hours. Hormonal changes, slower protein synthesis, and reduced blood flow contribute.',
  },
  {
    question: 'What is normal recovery time?',
    answer:
      'Normal recovery varies: small muscle groups (24-48 hours), medium (48-72 hours), large (72-96 hours). Age, intensity, and individual factors affect this.',
  },
  {
    question: 'Can I speed up recovery?',
    answer:
      'Yes. Adequate sleep (7-9 hours), proper nutrition (protein, carbs), hydration, active recovery, and stress management can support faster recovery.',
  },
  {
    question: 'Does training experience matter?',
    answer:
      'Yes. Beginners may need more recovery time initially. Advanced trainees often recover faster due to better conditioning, but may train more frequently.',
  },
  {
    question: 'What about muscle group size?',
    answer:
      'Larger muscle groups (legs, full body) require more recovery time than smaller groups (biceps, triceps) due to greater muscle damage and energy expenditure.',
  },
  {
    question: 'How does sleep affect recovery?',
    answer:
      'Sleep is critical for recovery. Poor sleep (<7 hours) significantly slows recovery. Growth hormone and protein synthesis peak during deep sleep.',
  },
  {
    question: 'Does nutrition matter?',
    answer:
      'Yes. Adequate protein (1.6-2.2 g/kg), carbohydrates (for glycogen), and overall nutrition quality support muscle repair and recovery.',
  },
  {
    question: 'Can I train the same muscle group daily?',
    answer:
      'Generally no. Most muscle groups need 24-72 hours between sessions. However, some advanced programs use daily training with lower volume per session.',
  },
  {
    question: 'What are signs of incomplete recovery?',
    answer:
      'Signs include persistent soreness, reduced strength, fatigue, poor sleep, and decreased performance. Rest or light activity if these persist.',
  },
  {
    question: 'Should I train through soreness?',
    answer:
      'Light activity may help, but avoid intense training of the same muscle group if soreness is severe. Listen to your body and prioritize recovery.',
  },
];

const relatedCalculators = [
  {
    name: 'Exercise Recovery Score (HRV + Sleep Integration)',
    slug: 'exercise-recovery-score-hrv-sleep-integration',
    description: 'Track overall recovery metrics including HRV and sleep.',
  },
  {
    name: 'Sleep Quality vs Productivity Correlation Calculator',
    slug: 'sleep-quality-vs-productivity-correlation-calculator',
    description: 'Improve sleep to support muscle recovery.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/muscle-recovery-time-by-age-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Muscle Recovery Time Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Muscle Recovery Time Estimator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate muscle recovery time based on age, training intensity, muscle group size, experience, sleep, and nutrition.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  // Base recovery by muscle group (hours)
  const baseRecovery: Record<string, number> = {
    'small': 24,
    'medium': 48,
    'large': 72,
  };
  let recoveryHours = baseRecovery[values.muscleGroup] || 48;
  
  // Age factor (increases recovery time)
  const ageMultiplier = 1 + ((values.age - 25) / 100); // +1% per year over 25
  recoveryHours *= ageMultiplier;
  
  // Intensity factor
  const intensityMultiplier = 0.8 + (values.trainingIntensity / 10) * 0.4; // 0.8-1.2x
  recoveryHours *= intensityMultiplier;
  
  // Experience factor (advanced recover faster)
  const experienceMultipliers: Record<string, number> = {
    'beginner': 1.2,
    'intermediate': 1.0,
    'advanced': 0.9,
  };
  recoveryHours *= experienceMultipliers[values.trainingExperience] || 1.0;
  
  // Sleep factor (poor sleep increases recovery time)
  const sleepMultiplier = values.sleepHours >= 7 ? 1.0 : 1 + ((7 - values.sleepHours) / 7) * 0.3; // Up to +30% if sleep <7h
  recoveryHours *= sleepMultiplier;
  
  // Nutrition factor
  const nutritionMultiplier = 1 - ((10 - values.nutritionQuality) / 10) * 0.2; // Up to -20% if poor nutrition
  recoveryHours *= nutritionMultiplier;
  
  recoveryHours = clamp(recoveryHours, 12, 120); // Clamp to 12-120 hours
  const recoveryDays = recoveryHours / 24;
  const ageFactor = ((values.age - 25) / 100) * 100; // Percentage increase from baseline

  let status: ResultPayload['status'] = 'normal-recovery';
  let interpretation = 'Your estimated recovery time suggests a general tendency within typical ranges. This is a personal insight, not a medical evaluation. Plan training accordingly.';

  if (recoveryHours <= 36) {
    status = 'fast-recovery';
    interpretation = 'Your estimated recovery time suggests a relatively fast recovery tendency. This is a general wellness insight, not a medical evaluation.';
  } else if (recoveryHours >= 72) {
    status = 'slow-recovery';
    interpretation = 'Your estimated recovery time suggests a longer recovery tendency. You may consider prioritizing rest, sleep, and nutrition for general wellness support. This is a lifestyle insight, not a medical diagnosis.';
  }

  const recommendations = [
    'Prioritize sleep (7-9 hours) as it is critical for muscle recovery and growth hormone release.',
    'Ensure adequate protein intake (1.6-2.2 g/kg body weight) and overall nutrition quality to support muscle repair.',
    'Allow full recovery before training the same muscle group again to prevent overtraining and optimize gains.',
  ];
  if (status === 'slow-recovery') {
    recommendations.push('Consider active recovery (light movement, stretching) and ensure adequate rest between intense sessions.');
  }
  if (values.age >= 50) {
    recommendations.push('Older adults may need longer recovery. Consider training each muscle group 2x/week instead of 3x/week.');
  }

  const plan = [
    { label: 'Today', detail: `Allow ${recoveryDays.toFixed(1)} days for recovery before training this muscle group again.` },
    { label: 'This Week', detail: 'Plan training schedule to respect recovery times. Focus on sleep and nutrition to optimize recovery.' },
    { label: 'Ongoing', detail: 'Monitor recovery and adjust training frequency based on how you feel. Listen to your body and prioritize rest when needed.' },
  ];

  return { recoveryHours, recoveryDays, ageFactor, status, interpretation, recommendations, plan };
};

export default function MuscleRecoveryTimeByAgeCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      trainingIntensity: undefined,
      muscleGroup: 'medium',
      trainingExperience: 'intermediate',
      sleepHours: undefined,
      nutritionQuality: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="muscle-recovery-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Muscle Recovery Time Estimator
          </CardTitle>
          <CardDescription>Estimate muscle recovery time based on age, training intensity, muscle group size, experience, sleep, and nutrition. This is a general wellness insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your training and recovery factors</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (years)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 35" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Training intensity (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="muscleGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Muscle group</FormLabel>
                      <FormControl>
                        <select
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value as 'small' | 'medium' | 'large')}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                          <option value="small">Small (biceps, triceps)</option>
                          <option value="medium">Medium (chest, back)</option>
                          <option value="large">Large (legs, full body)</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="trainingExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Training experience</FormLabel>
                      <FormControl>
                        <select
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
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
                  name="nutritionQuality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nutrition quality (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate recovery time
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
            <CardDescription>See estimated recovery time in hours and days.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recovery time</p>
                <p className="text-2xl font-semibold text-primary">{result.recoveryHours.toFixed(0)} hours</p>
                <p className="text-xs text-muted-foreground">Estimated</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recovery days</p>
                <p className="text-2xl font-semibold text-primary">{result.recoveryDays.toFixed(1)} days</p>
                <p className="text-xs text-muted-foreground">Estimated</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Age factor</p>
                <p className="text-2xl font-semibold text-primary">+{result.ageFactor.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">vs age 25 baseline</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status.replace('-', ' ')}</p>
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
          <p><strong>Base recovery</strong>: Small muscles 24h, Medium 48h, Large 72h.</p>
          <p><strong>Recovery hours</strong> = base × age multiplier (1 + (age − 25) / 100) × intensity (0.8-1.2) × experience (0.9-1.2) × sleep (1.0-1.3) × nutrition (0.8-1.0), clamped to 12-120 hours.</p>
          <p><strong>Age factor</strong> = ((age − 25) / 100) × 100% (percentage increase from age 25 baseline).</p>
          <p>Older age, higher intensity, larger muscles, less experience, poor sleep, and poor nutrition increase recovery time.</p>
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
                <p className="text-sm text-muted-foreground">Training frequency</p>
                <p className="text-xl font-semibold text-primary">
                  {result.recoveryDays <= 2 ? '2-3x/week' : result.recoveryDays <= 3 ? '2x/week' : '1-2x/week'}
                </p>
                <p className="text-xs text-muted-foreground">Recommended per muscle group</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sleep support</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().sleepHours ?? 0) >= 7 ? 'Good' : 'Needs improvement')}
                </p>
                <p className="text-xs text-muted-foreground">Target: 7-9 hours</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recovery optimization</p>
                <p className="text-xl font-semibold text-primary">
                  {result.recoveryHours <= 48 ? 'Optimal' : 'Extended'}
                </p>
                <p className="text-xs text-muted-foreground">Based on factors</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your training and recovery factors to see additional insights.</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Complete guide snapshot</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Muscle recovery time increases with age due to slower protein synthesis, reduced blood flow, and hormonal changes. Training intensity, muscle group size, experience, sleep, and nutrition also affect recovery.</p>
          <p>Use this calculator to estimate recovery time and plan training frequency to optimize gains and prevent overtraining.</p>
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
          <p>This tool estimates muscle recovery time from age, training intensity, muscle group size, training experience, sleep hours, and nutrition quality.</p>
          <p>Outputs include recovery hours, recovery days, age factor, status, recommendations, an action plan, and supporting metrics.</p>
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

