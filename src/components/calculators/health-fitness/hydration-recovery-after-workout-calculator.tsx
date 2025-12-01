'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Droplets, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  bodyWeightKg: z.number({ invalid_type_error: 'Enter body weight' }).min(30).max(200),
  workoutDurationMin: z.number({ invalid_type_error: 'Enter workout duration' }).min(10).max(300),
  sweatRate: z.number({ invalid_type_error: 'Enter sweat rate' }).min(0.5).max(3.0),
  preWorkoutHydration: z.number({ invalid_type_error: 'Enter pre-workout hydration' }).min(0).max(1000),
  postWorkoutHydration: z.number({ invalid_type_error: 'Enter post-workout hydration' }).min(0).max(2000),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  fluidLoss: number;
  hydrationGap: number;
  recoveryTime: number;
  status: 'well-hydrated' | 'needs-more' | 'dehydrated';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your body weight in kilograms.',
  'Log workout duration in minutes and estimate sweat rate (L/hour).',
  'Note how much fluid you consumed before and after the workout (ml).',
  'Review fluid loss, hydration gap, and recovery recommendations.',
  'Use the output to plan optimal hydration timing for future sessions.',
];

const faqs = [
  {
    question: 'What is sweat rate and how do I estimate it?',
    answer:
      'Sweat rate is liters lost per hour. Weigh yourself before and after exercise (nude, dry towel) to calculate: (pre-weight − post-weight + fluid consumed) / hours. Typical range: 0.5–2.5 L/hour.',
  },
  {
    question: 'How much should I drink during exercise?',
    answer:
      'Aim to replace 50–75% of fluid loss during activity. For sessions under 60 minutes, 200–400 ml every 15–20 minutes is a good starting point.',
  },
  {
    question: 'What if I feel thirsty after a workout?',
    answer:
      'Thirst indicates dehydration. Drink 150% of fluid loss over 2–4 hours post-workout to account for ongoing losses.',
  },
  {
    question: 'Does electrolyte replacement matter?',
    answer:
      'Yes, especially for sessions over 60 minutes or in heat. Include sodium (500–700 mg/L) and some potassium/magnesium.',
  },
  {
    question: 'Can I overhydrate?',
    answer:
      'Yes. Hyponatremia (low sodium) can occur from excessive water intake. Balance fluid with electrolytes, especially during long sessions.',
  },
  {
    question: 'How do I know if I am well-hydrated?',
    answer:
      'Check urine color: pale yellow is ideal. Dark yellow suggests dehydration. Clear may indicate overhydration.',
  },
  {
    question: 'Does caffeine affect hydration needs?',
    answer:
      'Moderate caffeine (1–2 cups) has minimal diuretic effect during exercise. Excessive caffeine can increase fluid needs slightly.',
  },
  {
    question: 'Should I drink before bed after evening workouts?',
    answer:
      'Yes, but finish most hydration 1–2 hours before sleep to avoid disrupting rest. Sip small amounts if still thirsty.',
  },
  {
    question: 'What about hydration for multiple daily sessions?',
    answer:
      'Track cumulative fluid loss and replace throughout the day. Monitor urine color and body weight to gauge status.',
  },
  {
    question: 'Can I use sports drinks instead of water?',
    answer:
      'Sports drinks help replace electrolytes and carbs for sessions over 60 minutes. For shorter sessions, water is usually sufficient.',
  },
];

const relatedCalculators = [
  {
    name: 'Electrolyte Balance Restoration Calculator',
    slug: 'electrolyte-balance-restoration-calculator',
    description: 'Balance sodium, potassium, and magnesium after sweating.',
  },
  {
    name: 'Sauna Session Detox Score Calculator',
    slug: 'sauna-session-detox-score-calculator',
    description: 'Track hydration needs after heat exposure.',
  },
  {
    name: 'Hydration Needs Calculator',
    slug: 'hydration-needs-calculator',
    description: 'Calculate daily baseline hydration requirements.',
  },
  {
    name: 'Immune Recovery Time Post-Illness Calculator',
    slug: 'immune-recovery-time-post-illness-calculator',
    description: 'Plan recovery hydration during illness recovery.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/hydration-recovery-after-workout-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Hydration Recovery After Workout Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Hydration Recovery After Workout Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate fluid loss, hydration gap, and recovery time after exercise to optimize rehydration.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const workoutHours = values.workoutDurationMin / 60;
  const fluidLoss = values.sweatRate * workoutHours * 1000; // ml
  const totalHydration = values.preWorkoutHydration + values.postWorkoutHydration;
  const hydrationGap = clamp(fluidLoss - totalHydration, -500, 2000);
  const recoveryTime = hydrationGap > 0 ? clamp(hydrationGap / 200, 0, 8) : 0; // hours to recover

  let status: ResultPayload['status'] = 'well-hydrated';
  let interpretation =
    'From this snapshot, your before-and-after fluids look fairly aligned with what this simple model suggests for your session.';

  if (hydrationGap > 200) {
    status = 'needs-more';
    interpretation =
      'It looks like you may have a bit of a fluid gap after this workout. Gently topping up fluids over the next little while could feel supportive.';
  }
  if (hydrationGap > 500) {
    status = 'dehydrated';
    interpretation =
      'This pattern suggests your body might be carrying a larger fluid gap after this session. It may help to prioritize rehydration, and to check in with how you feel overall.';
  }

  const recommendations = [
    'You can use this estimate to gently guide how much you sip over the next few hours, adjusting for what feels comfortable to you.',
    'For longer or hotter sessions, adding some electrolytes to fluids can help many people feel better supported.',
    'Checking in on thirst and urine color (aiming for a light straw shade) can give you an everyday sense of your hydration pattern.',
  ];
  if (status === 'needs-more') {
    recommendations.push('If you have a gap to close, sipping fluids gradually instead of drinking a lot at once often feels easier on the body.');
  }
  if (status === 'dehydrated') {
    recommendations.push('When the gap is larger or you feel off, options like oral rehydration drinks or balanced sports drinks may be worth considering.');
  }

  const plan = [
    { label: 'Immediate (0–30 min)', detail: 'Have a modest drink of water or a simple electrolyte beverage after finishing, especially if the session felt demanding.' },
    { label: 'Next 2–4 hours', detail: 'Keep sipping fluids at a relaxed pace, paying attention to how your body feels rather than chasing an exact number.' },
    { label: 'Ongoing', detail: 'Use everyday cues like thirst and urine color to tune your usual hydration pattern around workouts.' },
  ];

  return { fluidLoss, hydrationGap, recoveryTime, status, interpretation, recommendations, plan };
};

export default function HydrationRecoveryAfterWorkoutCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bodyWeightKg: undefined,
      workoutDurationMin: undefined,
      sweatRate: undefined,
      preWorkoutHydration: undefined,
      postWorkoutHydration: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="hydration-recovery-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5" />
            Hydration Recovery After Workout Calculator
          </CardTitle>
          <CardDescription>Estimate fluid loss, hydration gap, and recovery time to optimize rehydration.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your workout hydration</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bodyWeightKg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body weight (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 70" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="workoutDurationMin"
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
                  name="sweatRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sweat rate (L/hour)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 1.2" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="preWorkoutHydration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pre-workout hydration (ml)</FormLabel>
                      <FormControl>
                        <Input type="number" step="50" placeholder="e.g., 300" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="postWorkoutHydration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Post-workout hydration (ml)</FormLabel>
                      <FormControl>
                        <Input type="number" step="50" placeholder="e.g., 500" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate hydration recovery
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
            <CardDescription>See fluid loss, hydration gap, and recovery recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Fluid loss</p>
                <p className="text-2xl font-semibold text-primary">{result.fluidLoss.toFixed(0)} ml</p>
                <p className="text-xs text-muted-foreground">A rough estimate based on your sweat rate and workout length.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Hydration gap</p>
                <p className="text-2xl font-semibold text-primary">{result.hydrationGap.toFixed(0)} ml</p>
                <p className="text-xs text-muted-foreground">Positive values suggest extra fluid could be helpful; negative means you may have slightly overshot.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recovery time</p>
                <p className="text-2xl font-semibold text-primary">{result.recoveryTime.toFixed(1)} hrs</p>
                <p className="text-xs text-muted-foreground">A very rough time window this model uses for rehydration.</p>
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
          <p><strong>Fluid loss</strong> = sweatRate (L/hour) × workoutDuration (hours) × 1000 (ml).</p>
          <p><strong>Hydration gap</strong> = fluidLoss − (preWorkoutHydration + postWorkoutHydration), clamped to -500 to 2000 ml.</p>
          <p><strong>Recovery time</strong> = hydrationGap / 200 (ml/hour absorption rate), clamped to 0-8 hours.</p>
          <p>Aim to replace 150% of fluid loss over 2–4 hours post-workout to account for ongoing losses.</p>
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
                <p className="text-sm text-muted-foreground">Target rehydration</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.fluidLoss * 1.5).toFixed(0)} ml
                </p>
                <p className="text-xs text-muted-foreground">150% of fluid loss</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Hydration efficiency</p>
                <p className="text-xl font-semibold text-primary">
                  {(((form.getValues().preWorkoutHydration ?? 0) + (form.getValues().postWorkoutHydration ?? 0)) / result.fluidLoss * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Current replacement rate</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Remaining to drink</p>
                <p className="text-xl font-semibold text-primary">
                  {Math.max(0, (result.fluidLoss * 1.5) - ((form.getValues().preWorkoutHydration ?? 0) + (form.getValues().postWorkoutHydration ?? 0))).toFixed(0)} ml
                </p>
                <p className="text-xs text-muted-foreground">To reach 150% target</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your workout hydration data to see additional metrics.</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Complete guide snapshot</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Optimal hydration recovery after exercise requires replacing 150% of fluid loss over 2–4 hours, including electrolytes for longer sessions.</p>
          <p>Use this calculator to track fluid losses, identify hydration gaps, and plan rehydration strategies for better recovery.</p>
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
          <p>This tool offers a simple snapshot of possible fluid loss, hydration gaps, and a rough recovery window based on your workout and entries.</p>
          <p>You can use the numbers and suggestions as gentle guidance for adjusting how and when you drink around exercise, alongside your own cues and any professional advice.</p>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a
        medical or psychological diagnosis. For any health concerns, please consult a qualified professional.
      </p>
    </div>
  );
}

