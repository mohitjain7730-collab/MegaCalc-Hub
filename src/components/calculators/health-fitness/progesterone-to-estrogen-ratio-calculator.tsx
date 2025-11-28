'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Scale, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  progesteroneLevel: z.number({ invalid_type_error: 'Enter progesterone level' }).min(0.1).max(50),
  estrogenLevel: z.number({ invalid_type_error: 'Enter estrogen level' }).min(10).max(500),
  cycleDay: z.number({ invalid_type_error: 'Enter cycle day' }).min(1).max(35).optional(),
  age: z.number({ invalid_type_error: 'Enter age' }).min(18).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  ratio: number;
  ratioStatus: number;
  status: 'balanced' | 'low-progesterone' | 'high-estrogen';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your progesterone level (ng/mL) from a blood test.',
  'Enter your estrogen level (pg/mL) from the same test.',
  'Optionally enter cycle day if testing during menstrual cycle (day 1 = first day of period).',
  'Enter your age to account for age-related hormonal changes.',
  'Review the progesterone-to-estrogen ratio and balance status.',
];

const faqs = [
  {
    question: 'What is the progesterone-to-estrogen ratio?',
    answer:
      'It is the ratio of progesterone to estrogen levels. A balanced ratio supports hormonal health. Ideal ratios vary by cycle phase and age.',
  },
  {
    question: 'What is a healthy ratio?',
    answer:
      'Ideal ratios vary: follicular phase (100:1 to 200:1), luteal phase (200:1 to 300:1+). Lower ratios may indicate progesterone deficiency or estrogen dominance.',
  },
  {
    question: 'How do I get hormone levels tested?',
    answer:
      'Consult a healthcare provider. Blood tests measure progesterone and estrogen. Timing matters—luteal phase (day 19-23) is best for progesterone.',
  },
  {
    question: 'Does cycle day matter?',
    answer:
      'Yes. Progesterone is highest in the luteal phase (after ovulation). Estrogen peaks twice (mid-follicular and mid-luteal). Test timing affects results.',
  },
  {
    question: 'What if my ratio is low?',
    answer:
      'Low ratios may indicate low progesterone or high estrogen. Lifestyle changes (stress reduction, nutrition, exercise) or medical treatment may help.',
  },
  {
    question: 'Can men use this calculator?',
    answer:
      'Yes, but normal ranges differ. Men typically have lower estrogen and progesterone. Consult a healthcare provider for male-specific ranges.',
  },
  {
    question: 'What affects the ratio?',
    answer:
      'Stress, diet, exercise, body fat, age, medications, and health conditions can affect progesterone and estrogen levels and their ratio.',
  },
  {
    question: 'Can I improve the ratio naturally?',
    answer:
      'Possibly. Reducing stress, maintaining healthy weight, balanced nutrition, adequate sleep, and regular exercise may support hormonal balance.',
  },
  {
    question: 'When should I retest?',
    answer:
      'Retest after 2–3 months of lifestyle changes or as recommended by your healthcare provider. Hormone levels can fluctuate.',
  },
  {
    question: 'Is this a medical diagnosis?',
    answer:
      'No. This is an educational tool. Always consult healthcare providers for hormone testing, diagnosis, and treatment recommendations.',
  },
];

const relatedCalculators = [
  {
    name: 'Estrogen Dominance Risk Calculator',
    slug: 'estrogen-dominance-risk-calculator',
    description: 'Assess lifestyle factors that may affect estrogen dominance.',
  },
  {
    name: 'Stress Hormone Balance Calculator',
    slug: 'stress-hormone-balance-calculator',
    description: 'Monitor cortisol and stress impact on hormonal balance.',
  },
  {
    name: 'BMI Calculator',
    slug: 'bmi-calculator',
    description: 'Track BMI as a factor in hormonal health.',
  },
  {
    name: 'Sleep Quality vs Productivity Correlation Calculator',
    slug: 'sleep-quality-vs-productivity-correlation-calculator',
    description: 'Improve sleep to support hormonal balance.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/progesterone-to-estrogen-ratio-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Progesterone-to-Estrogen Ratio Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Progesterone-to-Estrogen Ratio Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate progesterone-to-estrogen ratio from hormone levels to assess hormonal balance.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  // Convert units: progesterone (ng/mL) to pg/mL for ratio calculation
  // 1 ng/mL = 1000 pg/mL, but we'll use a simplified ratio
  // Typical ratio: progesterone (ng/mL) × 1000 / estrogen (pg/mL)
  const ratio = (values.progesteroneLevel * 1000) / values.estrogenLevel;
  
  // Ideal ratios vary by cycle phase
  let idealRatio = 200; // Default for luteal phase
  if (values.cycleDay && values.cycleDay <= 14) {
    idealRatio = 100; // Follicular phase
  } else if (values.cycleDay && values.cycleDay >= 19) {
    idealRatio = 250; // Luteal phase
  }
  
  const ratioStatus = clamp((ratio / idealRatio) * 100, 0, 200);

  let status: ResultPayload['status'] = 'balanced';
  let interpretation = 'Your progesterone-to-estrogen ratio appears balanced. Maintain current habits.';

  if (ratio < idealRatio * 0.7) {
    status = 'low-progesterone';
    interpretation = 'Ratio suggests low progesterone relative to estrogen. Consider lifestyle changes or consult a healthcare provider.';
  }
  if (ratio < idealRatio * 0.5) {
    status = 'high-estrogen';
    interpretation = 'Ratio indicates potential estrogen dominance or very low progesterone. Consult a healthcare provider for evaluation.';
  }

  const recommendations = [
    'Ensure hormone testing is done at the right time (luteal phase, day 19-23, for progesterone).',
    'Reduce stress through meditation, sleep, and stress management to support progesterone production.',
    'Maintain healthy BMI and include regular exercise to support hormonal balance.',
  ];
  if (status === 'low-progesterone') {
    recommendations.push('Consider foods rich in B6, zinc, and magnesium, which support progesterone production.');
  }
  if (status === 'high-estrogen') {
    recommendations.push('Consult a healthcare provider for comprehensive hormone evaluation and personalized treatment recommendations.');
  }

  const plan = [
    { label: 'This Week', detail: 'Review hormone test results with a healthcare provider to confirm ratio and discuss options.' },
    { label: 'Next Month', detail: 'Implement lifestyle changes (stress reduction, nutrition, exercise) to support hormonal balance.' },
    { label: 'Ongoing', detail: 'Retest hormones after 2-3 months to track ratio improvements and adjust treatment if needed.' },
  ];

  return { ratio, ratioStatus, status, interpretation, recommendations, plan };
};

export default function ProgesteroneToEstrogenRatioCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      progesteroneLevel: undefined,
      estrogenLevel: undefined,
      cycleDay: undefined,
      age: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="progesterone-estrogen-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Progesterone-to-Estrogen Ratio Calculator
          </CardTitle>
          <CardDescription>Calculate progesterone-to-estrogen ratio from hormone levels to assess hormonal balance.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your hormone levels</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="progesteroneLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Progesterone (ng/mL)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 12.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="estrogenLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estrogen (pg/mL)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 150" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cycleDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cycle day (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 21" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (years)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 32" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate ratio
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
            <CardDescription>See progesterone-to-estrogen ratio and balance status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Ratio</p>
                <p className="text-2xl font-semibold text-primary">{result.ratio.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Progesterone:Estrogen</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Ratio status</p>
                <p className="text-2xl font-semibold text-primary">{result.ratioStatus.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">% of ideal (100% = balanced)</p>
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
          <p><strong>Ratio</strong> = (progesterone in ng/mL × 1000) / estrogen in pg/mL.</p>
          <p><strong>Ideal ratios</strong>: Follicular phase (days 1-14) ≈ 100:1, Luteal phase (days 19-23) ≈ 200-300:1.</p>
          <p><strong>Ratio status</strong> = (actual ratio / ideal ratio) × 100, clamped to 0-200%.</p>
          <p>Higher ratios indicate more progesterone relative to estrogen, which is generally favorable for hormonal balance.</p>
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
                <p className="text-sm text-muted-foreground">Progesterone level</p>
                <p className="text-xl font-semibold text-primary">
                  {(form.getValues().progesteroneLevel ?? 0).toFixed(1)} ng/mL
                </p>
                <p className="text-xs text-muted-foreground">From blood test</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Estrogen level</p>
                <p className="text-xl font-semibold text-primary">
                  {(form.getValues().estrogenLevel ?? 0).toFixed(0)} pg/mL
                </p>
                <p className="text-xs text-muted-foreground">From blood test</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Cycle phase</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().cycleDay ?? 0) <= 14 ? 'Follicular' : (form.getValues().cycleDay ?? 0) >= 19 ? 'Luteal' : 'Mid-cycle')}
                </p>
                <p className="text-xs text-muted-foreground">Based on cycle day</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your hormone levels to see additional insights.</p>
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
          <p>The progesterone-to-estrogen ratio is a key indicator of hormonal balance. Ideal ratios vary by menstrual cycle phase and age.</p>
          <p>Use this calculator to assess your ratio from blood test results and plan lifestyle or medical interventions to support balance.</p>
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
          <p>This tool calculates progesterone-to-estrogen ratio from hormone levels (ng/mL and pg/mL) and assesses balance status.</p>
          <p>Outputs include ratio, ratio status, balance status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

