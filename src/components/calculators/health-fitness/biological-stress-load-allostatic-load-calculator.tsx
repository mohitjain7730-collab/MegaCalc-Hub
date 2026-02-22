'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  stressLevel: z.number({ invalid_type_error: 'Enter stress level' }).min(1).max(10),
  sleepQuality: z.number({ invalid_type_error: 'Enter sleep quality' }).min(1).max(10),
  cortisolLevel: z.number({ invalid_type_error: 'Enter cortisol level' }).min(5).max(50).optional(),
  chronicDisease: z.number({ invalid_type_error: 'Enter chronic disease burden' }).min(0).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  stressLevel: number;
  sleepQuality: number;
  cortisolLevel: number;
  allostaticLoad: number;
  loadIndex: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter stress level (1 = low, 10 = high) from self-assessment.',
  'Enter sleep quality (1 = poor, 10 = excellent) from sleep assessment.',
  'Optionally enter cortisol level if measured (Î¼g/dL) from blood test.',
  'Enter chronic disease burden (0 = none, 10 = severe) from health assessment.',
  'Review allostatic load, biological stress status, and recommendations.',
];

const faqs = [
  {
    question: 'What is allostatic load?',
    answer:
      'Allostatic load is the cumulative wear and tear on the body from chronic stress and repeated adaptation. It reflects the biological cost of stress and is associated with increased disease risk and accelerated aging.',
  },
  {
    question: 'How is allostatic load measured?',
    answer:
      'Allostatic load is measured using multiple biomarkers including cortisol, blood pressure, heart rate variability, inflammatory markers, metabolic markers, and other stress-related physiological parameters.',
  },
  {
    question: 'What are normal allostatic load values?',
    answer:
      'Allostatic load is typically scored on a scale (0-10 or similar), with lower scores indicating lower stress burden. There is no single "normal" value, but lower scores are generally better for long-term health.',
  },
  {
    question: 'What causes high allostatic load?',
    answer:
      'High allostatic load results from chronic stress, poor sleep, chronic diseases, unhealthy lifestyle, social isolation, financial stress, work stress, and other factors causing repeated physiological stress responses.',
  },
  {
    question: 'What are consequences of high allostatic load?',
    answer:
      'High allostatic load is associated with increased risk of cardiovascular disease, diabetes, depression, cognitive decline, immune dysfunction, and premature aging. It reflects cumulative biological stress burden.',
  },
  {
    question: 'How can I reduce allostatic load?',
    answer:
      'Reduce allostatic load through stress management, adequate sleep, regular exercise, healthy diet, social support, mindfulness practices, and addressing chronic health conditions.',
  },
  {
    question: 'Does sleep affect allostatic load?',
    answer:
      'Yes. Poor sleep quality and insufficient sleep increase allostatic load by disrupting stress hormone regulation, immune function, and metabolic processes. Good sleep is essential for stress recovery.',
  },
  {
    question: 'What about chronic diseases?',
    answer:
      'Chronic diseases contribute to allostatic load by creating ongoing physiological stress and adaptation demands. Managing chronic conditions effectively can help reduce allostatic load.',
  },
  {
    question: 'Can I track allostatic load at home?',
    answer:
      'Home tracking is limited. Allostatic load requires multiple biomarker measurements. However, monitoring stress levels, sleep quality, and health indicators can provide insights into stress burden.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if allostatic load is high, if you have chronic stress or health concerns, or if you need help developing strategies to reduce biological stress burden.',
  },
];

const relatedCalculators = [
  {
    name: 'Resilience Score Calculator',
    slug: 'resilience-score-calculator',
    description: 'Assess resilience alongside allostatic load.',
  },
  {
    name: 'Stress Hormone Balance Calculator (Cortisol vs Melatonin)',
    slug: 'stress-hormone-balance-calculator',
    description: 'Monitor stress hormones comprehensively.',
  },
  {
    name: 'Oxidative Stress Index Calculator',
    slug: 'oxidative-stress-index-calculator',
    description: 'Evaluate complete stress indicators.',
  },
  {
    name: 'Cellular Hydration Score Calculator',
    slug: 'cellular-hydration-score-calculator',
    description: 'Assess cellular health together.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/biological-stress-load-allostatic-load-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Biological Stress Load (Allostatic Load) Wellness Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Biological Stress Load (Allostatic Load) Wellness Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate biological stress load allostatic load from stress level, sleep quality, cortisol level, and chronic disease burden.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const stressLevel = values.stressLevel;
  const sleepQuality = values.sleepQuality;
  const chronicDisease = values.chronicDisease;
  
  let cortisolLevel: number;
  
  if (values.cortisolLevel) {
    cortisolLevel = values.cortisolLevel;
  } else {
    // Estimate based on stress and sleep
    // Normal morning cortisol: 10-20 Î¼g/dL
    let baseline = 15;
    baseline += (stressLevel - 5) * 2; // Stress increases cortisol
    baseline -= (sleepQuality - 5) * 1.5; // Poor sleep increases cortisol
    cortisolLevel = clamp(baseline, 5, 50);
  }
  
  // Calculate allostatic load (0-10, higher = higher load)
  let allostaticLoad = 0;
  
  // Stress component (0-3 points)
  allostaticLoad += (stressLevel - 1) / 3;
  
  // Sleep quality component (0-3 points, inverted)
  allostaticLoad += (10 - sleepQuality) / 3;
  
  // Cortisol component (0-2 points)
  // Normal: 10-20 Î¼g/dL, elevated: >20
  if (cortisolLevel > 20) {
    allostaticLoad += 1.5;
  } else if (cortisolLevel > 15) {
    allostaticLoad += 0.5;
  }
  
  // Chronic disease component (0-2 points)
  allostaticLoad += chronicDisease / 5;
  
  allostaticLoad = clamp(allostaticLoad, 0, 10);
  const loadIndex = (10 - allostaticLoad) * 10; // Invert for index (0-100, higher = better)

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'This suggests a general lifestyle tendency where your allostatic load may appear low. You may consider continuing to maintain healthy stress management and lifestyle habits.';

  if (allostaticLoad > 7 || loadIndex < 30) {
    status = 'low';
    interpretation = 'This suggests a general lifestyle tendency where your allostatic load may be high. This may indicate significant biological stress burden. You may consider focusing on stress reduction, sleep improvement, and seeking professional guidance if needed. This is a personal insight, not a medical evaluation.';
  } else if (allostaticLoad > 5 || loadIndex < 50) {
    status = 'moderate';
    interpretation = 'This suggests a general lifestyle tendency where your allostatic load may be moderate. You may consider focusing on improving stress management, sleep quality, and addressing contributing factors to reduce biological stress burden.';
  } else if (loadIndex < 70) {
    status = 'good';
    interpretation = 'This suggests a general lifestyle tendency where your allostatic load may be manageable. You may consider continuing to maintain healthy lifestyle and stress management practices.';
  }

  const recommendations = [
    'Prioritize stress management through mindfulness, meditation, relaxation techniques, and activities that promote calm and recovery.',
    'Improve sleep quality and duration. Aim for 7-9 hours of quality sleep per night to support stress recovery and reduce allostatic load.',
    'Engage in regular physical activity, which can help buffer stress responses and improve resilience to biological stress.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('You may consider seeking professional guidance for stress management, including therapy, counseling, or stress reduction programs to address high allostatic load. This is a personal insight, not a medical evaluation.');
  }
  if (chronicDisease > 5) {
    recommendations.push('Work with healthcare providers to effectively manage chronic diseases, as uncontrolled conditions contribute significantly to allostatic load.');
  }
  if (cortisolLevel > 20) {
    recommendations.push('Address elevated cortisol levels through stress reduction, sleep improvement, and potentially medical evaluation if levels remain high.');
  }

  const plan = [
    { label: 'This Week', detail: 'Assess current stress levels, sleep quality, and health status. Calculate allostatic load and identify contributing factors.' },
    { label: 'This Month', detail: 'Implement stress reduction strategies: improve sleep, practice stress management techniques, and address chronic health conditions.' },
    { label: 'Ongoing', detail: 'Monitor allostatic load through regular assessment of stress, sleep, and health indicators. Maintain healthy lifestyle to minimize biological stress burden.' },
  ];

  return { stressLevel, sleepQuality, cortisolLevel, allostaticLoad, loadIndex, status, interpretation, recommendations, plan };
};

export default function BiologicalStressLoadAllostaticLoadCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stressLevel: undefined,
      sleepQuality: undefined,
      cortisolLevel: undefined,
      chronicDisease: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="allostatic-load-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Biological Stress Load (Allostatic Load) Wellness Calculator
          </CardTitle>
          <CardDescription>Get general wellness insights about biological stress load (allostatic load) from stress level, sleep quality, cortisol level, and chronic disease burden. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your allostatic load data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="stressLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stress level (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sleepQuality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep quality (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cortisolLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cortisol level (Î¼g/dL) (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="chronicDisease"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chronic disease burden (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 2" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate allostatic load
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
            <CardDescription>See allostatic load, biological stress status, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Stress level</p>
                <p className="text-2xl font-semibold text-primary">{result.stressLevel.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 10</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sleep quality</p>
                <p className="text-2xl font-semibold text-primary">{result.sleepQuality.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 10</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Allostatic load</p>
                <p className="text-2xl font-semibold text-primary">{result.allostaticLoad.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Out of 10 (lower = better)</p>
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
          <p>
            <strong>Allostatic load</strong> = calculated from stress level (0-3 points), sleep quality (0-3 points, inverted), cortisol level (0-2 points), and chronic disease burden (0-2 points).
          </p>
          <p>
            <strong>If cortisol not provided</strong>: Estimated from stress level and sleep quality. Normal morning cortisol: 10-20 Î¼g/dL.
          </p>
          <p>
            <strong>Allostatic load scale</strong>: 0-10, with lower values indicating lower biological stress burden. Higher values indicate increased cumulative stress and health risk.
          </p>
          <p>Allostatic load reflects cumulative biological stress from chronic stress, poor sleep, elevated stress hormones, and chronic diseases. Lower load is associated with better long-term health.</p>
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
                <p className="text-sm text-muted-foreground">Target allostatic load</p>
                <p className="text-xl font-semibold text-primary">&lt; 5</p>
                <p className="text-xs text-muted-foreground">Optimal range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Load index</p>
                <p className="text-xl font-semibold text-primary">{result.loadIndex.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100 (higher = better)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Cortisol level</p>
                <p className="text-xl font-semibold text-primary">{result.cortisolLevel.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Î¼g/dL</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your allostatic load data to see additional insights.</p>
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
          <p>Allostatic load is the cumulative wear and tear on the body from chronic stress and repeated adaptation. It reflects biological stress burden and is associated with increased disease risk. Lower allostatic load is better for long-term health.</p>
          <p>Use this calculator to assess allostatic load from stress level, sleep quality, cortisol level (optional), and chronic disease burden.</p>
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
          <p>This tool provides general wellness insights about biological stress load (allostatic load) from stress level, sleep quality, cortisol level (optional), and chronic disease burden. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include stress level, sleep quality, cortisol level, allostatic load, load index, status, recommendations, an action plan, and supporting metrics.</p>
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

