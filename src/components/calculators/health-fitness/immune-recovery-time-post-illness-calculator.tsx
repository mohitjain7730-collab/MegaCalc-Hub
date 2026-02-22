'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Zap, Target, Activity, HeartPulse } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  illnessSeverity: z.number({ invalid_type_error: 'Enter illness severity' }).min(1).max(10),
  daysSinceOnset: z.number({ invalid_type_error: 'Enter days since onset' }).min(0).max(30),
  sleepHours: z.number({ invalid_type_error: 'Enter average sleep' }).min(4).max(12),
  nutritionScore: z.number({ invalid_type_error: 'Enter nutrition score' }).min(1).max(10),
  stressLevel: z.number({ invalid_type_error: 'Enter stress level' }).min(1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  recoveryDays: number;
  immuneStrength: number;
  status: 'recovering-well' | 'needs-support' | 'seek-guidance';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Rate your illness severity from 1 (mild) to 10 (severe) at peak symptoms.',
  'Count days since symptom onset or diagnosis.',
  'Log average nightly sleep hours over the past few days.',
  'Score nutrition quality (1 = poor, 10 = excellent whole foods, hydration).',
  'Rate current stress level (1 = calm, 10 = very stressed).',
  'Review estimated recovery timeline and immune support recommendations.',
];

const faqs = [
  {
    question: 'What does the recovery time estimate represent?',
    answer:
      'It is a heuristic estimate of days until you may feel fully recovered, based on severity, time elapsed, sleep, nutrition, and stress factors.',
  },
  {
    question: 'Is this a medical diagnosis?',
    answer:
      'No. This is an educational tool. Always consult healthcare providers for actual illness management and recovery guidance.',
  },
  {
    question: 'How does sleep affect recovery?',
    answer:
      'Sleep is critical for immune function. Aim for 7â€“9 hours nightly. Poor sleep can extend recovery time significantly.',
  },
  {
    question: 'What nutrition score should I target?',
    answer:
      'Aim for 7â€“10: whole foods, adequate protein, fruits/vegetables, hydration, and minimal processed foods or excess sugar.',
  },
  {
    question: 'Can stress delay recovery?',
    answer:
      'Yes. Chronic stress suppresses immune function. Managing stress through rest, meditation, or light movement can support healing.',
  },
  {
    question: 'When should I return to exercise?',
    answer:
      'Gradually resume light activity once symptoms clear. Avoid intense training until fully recovered to prevent relapse.',
  },
  {
    question: 'Does age affect the estimate?',
    answer:
      'Yes, but this calculator uses general factors. Older adults or those with chronic conditions may need longer recovery.',
  },
  {
    question: 'What if symptoms worsen?',
    answer:
      'Seek immediate medical attention. This tool is for planning, not emergency care.',
  },
  {
    question: 'Can supplements help?',
    answer:
      'Some (vitamin D, zinc, vitamin C) may support immune function, but prioritize sleep, nutrition, and rest first.',
  },
  {
    question: 'How accurate is the timeline?',
    answer:
      'It is a rough estimate. Individual recovery varies based on many factors not captured here. Use it as a planning guide.',
  },
];

const relatedCalculators = [
  {
    name: 'Hydration Recovery After Workout Calculator',
    slug: 'hydration-recovery-after-workout-calculator',
    description: 'Track fluid replacement during and after illness.',
  },
  {
    name: 'Electrolyte Balance Restoration Calculator',
    slug: 'electrolyte-balance-restoration-calculator',
    description: 'Restore sodium, potassium, and magnesium after illness.',
  },
  {
    name: 'Vitamin Deficiency Risk Estimator',
    slug: 'vitamin-deficiency-risk-estimator',
    description: 'Assess nutrient gaps that may slow recovery.',
  },
  {
    name: 'Stress Hormone Balance Calculator',
    slug: 'stress-hormone-balance-calculator',
    description: 'Monitor cortisol and melatonin during recovery.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/immune-recovery-time-post-illness-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Immune Recovery Time Post-Illness Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Immune Recovery Time Post-Illness Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate recovery timeline, immune strength, and get support recommendations after illness.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const baseRecovery = values.illnessSeverity * 2; // 2-20 days base
  const timeElapsed = values.daysSinceOnset;
  const sleepBonus = clamp((values.sleepHours - 6) / 2 * -1, -3, 2); // -3 to +2 days
  const nutritionBonus = clamp((values.nutritionScore - 5) / 5 * -2, -2, 2); // -2 to +2 days
  const stressPenalty = clamp((values.stressLevel - 3) / 7 * 3, 0, 3); // 0 to +3 days
  const recoveryDays = clamp(baseRecovery - timeElapsed + sleepBonus + nutritionBonus + stressPenalty, 0, 30);
  
  const immuneStrength = clamp(
    100 - (values.illnessSeverity * 8) + (values.sleepHours - 6) * 5 + (values.nutritionScore - 5) * 4 - (values.stressLevel - 3) * 3,
    0,
    100
  );

  let status: ResultPayload['status'] = 'recovering-well';
  let interpretation =
    'In this simple check-in, your current rest, food, and stress patterns look fairly supportive of your recovery so far.';

  if (immuneStrength < 60 || recoveryDays > 10) {
    status = 'needs-support';
    interpretation =
      'This snapshot suggests your body might appreciate some extra careâ€”like a bit more sleep, easier days, or simple, nourishing meals.';
  }
  if (immuneStrength < 40 || recoveryDays > 20) {
    status = 'seek-guidance';
    interpretation =
      'These numbers hint that your recovery may be feeling slower or heavier right now. It could be a good moment to check in with a healthcare professional you trust.';
  }

  const recommendations = [
    'When you can, give yourself permission for more and better-quality sleep, as it often supports how your body recovers.',
    'Simple, easy-to-digest whole foods and regular fluids can feel kinder on your system than heavy or highly processed options.',
    'Gentle activitiesâ€”like light stretching, calm music, or a quiet walk if toleratedâ€”can sometimes help with stress while you recover.',
  ];
  if (status === 'needs-support') {
    recommendations.push('You might add small things that feel soothing to youâ€”such as broths, warm drinks, or a bit more colorful produceâ€”while easing back on ultraâ€‘processed foods if possible.');
  }
  if (status === 'seek-guidance') {
    recommendations.push('If your symptoms are lingering or worrying you, consider reaching out to a healthcare provider for specific advice for your situation.');
  }

  const plan = [
    { label: 'Today', detail: 'Prioritize rest, gentle hydration, and simple meals, and let yourself step back from intense activities where you can.' },
    { label: 'This Week', detail: 'Keep an eye on your sleep, food, and stress, making small, compassionate adjustments instead of big changes.' },
    { label: 'Ongoing', detail: 'As you start to feel better, you can slowly reintroduce usual activities at a pace that feels safe and sustainable.' },
  ];

  return { recoveryDays, immuneStrength, status, interpretation, recommendations, plan };
};

export default function ImmuneRecoveryTimePostIllnessCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      illnessSeverity: undefined,
      daysSinceOnset: undefined,
      sleepHours: undefined,
      nutritionScore: undefined,
      stressLevel: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="immune-recovery-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Immune Recovery Time Post-Illness Calculator
          </CardTitle>
          <CardDescription>Estimate recovery timeline, immune strength, and get support recommendations.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your recovery snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="illnessSeverity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Illness severity (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="daysSinceOnset"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Days since symptom onset</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Average sleep (hrs/night)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.25" placeholder="e.g., 7.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nutritionScore"
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
                <FormField
                  control={form.control}
                  name="stressLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current stress level (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
            <CardDescription>See estimated recovery timeline and immune strength.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Estimated recovery</p>
                <p className="text-2xl font-semibold text-primary">{result.recoveryDays.toFixed(0)} days</p>
                <p className="text-xs text-muted-foreground">A very rough time window from this model, not a medical prediction.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Immune strength</p>
                <p className="text-2xl font-semibold text-primary">{result.immuneStrength.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">A 0â€“100 pattern score based on the inputs you shared.</p>
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
            <HeartPulse className="h-5 w-5" />
            Formula
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p><strong>Recovery days</strong> = baseRecovery (severity Ã— 2) âˆ’ daysElapsed + sleepBonus + nutritionBonus + stressPenalty, clamped to 0-30.</p>
          <p><strong>Immune strength</strong> = 100 âˆ’ (severity Ã— 8) + (sleep âˆ’ 6) Ã— 5 + (nutrition âˆ’ 5) Ã— 4 âˆ’ (stress âˆ’ 3) Ã— 3, clamped to 0-100.</p>
          <p>Better sleep, nutrition, and lower stress support faster recovery and higher immune strength.</p>
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
                <p className="text-sm text-muted-foreground">Recovery progress</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().daysSinceOnset ?? 0) / ((form.getValues().daysSinceOnset ?? 0) + result.recoveryDays) * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Estimated completion</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sleep support</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().sleepHours ?? 0) >= 7 ? 'Good' : 'Needs improvement')}
                </p>
                <p className="text-xs text-muted-foreground">Target: 7-9 hours</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Nutrition support</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().nutritionScore ?? 0) >= 7 ? 'Good' : 'Needs improvement')}
                </p>
                <p className="text-xs text-muted-foreground">Target: 7-10 score</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your recovery snapshot to see additional metrics.</p>
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
          <p>Recovery from illness depends on severity, time elapsed, sleep quality, nutrition, and stress management.</p>
          <p>Use this calculator to estimate recovery timelines and identify factors that may support or delay healing.</p>
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
            <HeartPulse className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>This tool combines illness severity, time since onset, sleep, nutrition, and stress into a single snapshot of how your recovery pattern looks in this model.</p>
          <p>The estimates and suggestions are there to support gentle reflection and small lifestyle adjustments, alongside care from qualified professionals.</p>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a
        medical or psychological diagnosis. For any health concerns, please consult a qualified professional.
      </p>
    </div>
  );
}

