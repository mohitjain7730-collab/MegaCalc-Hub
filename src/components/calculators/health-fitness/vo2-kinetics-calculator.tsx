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
  initialVO2: z.number({ invalid_type_error: 'Enter initial VO2' }).min(5).max(50),
  finalVO2: z.number({ invalid_type_error: 'Enter final VO2' }).min(10).max(80),
  timeToSteadyState: z.number({ invalid_type_error: 'Enter time to steady state' }).min(10).max(300),
  age: z.number({ invalid_type_error: 'Enter age' }).min(1).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  initialVO2: number;
  finalVO2: number;
  timeToSteadyState: number;
  kineticsIndex: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter initial VO2 (mL/kg/min) at exercise onset.',
  'Enter final VO2 (mL/kg/min) at steady state.',
  'Enter time to reach steady state (seconds).',
  'Enter your age (VO2 kinetics can change with age).',
  'Review VO2 kinetics index, cardiovascular status, and recommendations.',
];

const faqs = [
  {
    question: 'What are VO2 kinetics?',
    answer:
      'VO2 kinetics describe how quickly oxygen uptake (VO2) increases from rest to steady state during exercise. Faster kinetics indicate better cardiovascular fitness and oxygen delivery efficiency.',
  },
  {
    question: 'How are VO2 kinetics measured?',
    answer:
      'VO2 kinetics are measured during exercise testing by monitoring the rate of VO2 increase from rest to steady state. The time constant (tau) describes how quickly VO2 reaches steady state.',
  },
  {
    question: 'What are normal VO2 kinetics?',
    answer:
      'Normal time to steady state: 30-60 seconds for moderate exercise in healthy individuals. Faster kinetics (shorter time) indicate better cardiovascular fitness. Slower kinetics may indicate reduced fitness or cardiovascular issues.',
  },
  {
    question: 'What affects VO2 kinetics?',
    answer:
      'VO2 kinetics are affected by cardiovascular fitness, age, training status, exercise intensity, oxygen delivery capacity, and cardiovascular health. Better fitness and training improve kinetics.',
  },
  {
    question: 'What does fast VO2 kinetics mean?',
    answer:
      'Fast VO2 kinetics (short time to steady state) indicate good cardiovascular fitness, efficient oxygen delivery, and rapid adaptation to exercise demands. This is associated with better exercise performance.',
  },
  {
    question: 'What does slow VO2 kinetics mean?',
    answer:
      'Slow VO2 kinetics (long time to steady state) may indicate reduced cardiovascular fitness, slower oxygen delivery, or cardiovascular limitations. This can improve with regular exercise training.',
  },
  {
    question: 'How does exercise training affect VO2 kinetics?',
    answer:
      'Regular exercise training improves VO2 kinetics by enhancing cardiovascular function, increasing stroke volume, improving oxygen delivery, and optimizing metabolic adaptations. Trained individuals have faster kinetics.',
  },
  {
    question: 'Does age affect VO2 kinetics?',
    answer:
      'Yes. VO2 kinetics typically slow with age due to reduced cardiovascular function, decreased stroke volume, and age-related changes in oxygen delivery. Regular exercise can help maintain kinetics.',
  },
  {
    question: 'Can I measure VO2 kinetics at home?',
    answer:
      'Home measurement is limited. Accurate VO2 kinetics require exercise testing with gas analysis equipment. Heart rate response and perceived exertion can provide indirect indicators of kinetics.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if VO2 kinetics are significantly slow, if you have cardiovascular symptoms during exercise, or if you have concerns about cardiovascular fitness or exercise capacity.',
  },
];

const relatedCalculators = [
  {
    name: 'Oxygen Pulse Efficiency Calculator',
    slug: 'oxygen-pulse-efficiency-calculator',
    description: 'Assess oxygen utilization comprehensively.',
  },
  {
    name: 'Cardiac Output (Q) Calculator',
    slug: 'cardiac-output-q-calculator',
    description: 'Evaluate complete cardiovascular parameters.',
  },
  {
    name: 'Stroke Index (Cardiac Function) Calculator',
    slug: 'stroke-index-cardiac-function-calculator',
    description: 'Monitor cardiac function together.',
  },
  {
    name: 'Heart Workload (Rate Pressure Product) Calculator',
    slug: 'heart-workload-rate-pressure-product-calculator',
    description: 'Assess cardiovascular health comprehensively.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/vo2-kinetics-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'VO2 Kinetics Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'VO2 Kinetics Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate VO2 kinetics from initial VO2, final VO2, time to steady state, and age.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const initialVO2 = values.initialVO2;
  const finalVO2 = values.finalVO2;
  const timeToSteadyState = values.timeToSteadyState;
  
  // Calculate VO2 kinetics index (0-100, higher = faster/better)
  // Faster kinetics (shorter time) = better
  let kineticsIndex = 50;
  
  // Time to steady state component
  if (timeToSteadyState <= 30) {
    kineticsIndex += 30; // Very fast
  } else if (timeToSteadyState <= 45) {
    kineticsIndex += 20; // Fast
  } else if (timeToSteadyState <= 60) {
    kineticsIndex += 10; // Normal
  } else if (timeToSteadyState <= 90) {
    kineticsIndex -= 10; // Slow
  } else {
    kineticsIndex -= 30; // Very slow
  }
  
  // VO2 increase component
  const vo2Increase = finalVO2 - initialVO2;
  if (vo2Increase >= 20 && vo2Increase <= 40) {
    kineticsIndex += 10; // Good increase
  } else if (vo2Increase > 40) {
    kineticsIndex += 15; // Excellent increase
  } else if (vo2Increase < 10) {
    kineticsIndex -= 15; // Small increase
  }
  
  // Age adjustment
  if (values.age < 40) {
    kineticsIndex += 5; // Younger = better baseline
  } else if (values.age >= 60) {
    kineticsIndex -= 10; // Older = slower kinetics
  }
  
  kineticsIndex = clamp(kineticsIndex, 0, 100);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your VO2 kinetics appear optimal. Continue maintaining healthy cardiovascular fitness.';

  if (timeToSteadyState > 90 || kineticsIndex < 30) {
    status = 'low';
    interpretation = 'Your VO2 kinetics are slow. This may indicate reduced cardiovascular fitness or limitations. Consult a healthcare provider and consider cardiovascular training.';
  } else if (timeToSteadyState > 60 || kineticsIndex < 50) {
    status = 'moderate';
    interpretation = 'Your VO2 kinetics are moderate. Regular cardiovascular exercise can help improve kinetics and cardiovascular fitness.';
  } else if (kineticsIndex < 70) {
    status = 'good';
    interpretation = 'Your VO2 kinetics are good. Continue maintaining healthy lifestyle and regular exercise to support cardiovascular fitness.';
  }

  const recommendations = [
    'Engage in regular cardiovascular exercise to improve VO2 kinetics. Aerobic training enhances oxygen delivery and cardiovascular function, leading to faster kinetics.',
    'Include interval training in your exercise routine, as it can specifically improve VO2 kinetics and cardiovascular adaptations to exercise.',
    'Maintain consistent exercise training, as improvements in VO2 kinetics require regular cardiovascular training over time.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Consult a healthcare provider for comprehensive cardiovascular evaluation, including exercise testing if needed, to assess VO2 kinetics and cardiovascular fitness.');
  }
  if (timeToSteadyState > 60) {
    recommendations.push('Focus on improving cardiovascular fitness through regular aerobic exercise, which can help speed up VO2 kinetics and improve exercise capacity.');
  }

  const plan = [
    { label: 'This Week', detail: 'Review VO2 kinetics measurements if available from exercise testing. Assess current cardiovascular fitness and exercise capacity.' },
    { label: 'This Month', detail: 'Implement cardiovascular training: regular aerobic exercise, interval training, and consistent training to improve VO2 kinetics.' },
    { label: 'Ongoing', detail: 'Monitor VO2 kinetics through regular exercise and cardiovascular assessments. Address any persistent limitations with medical guidance and appropriate training.' },
  ];

  return { initialVO2, finalVO2, timeToSteadyState, kineticsIndex, status, interpretation, recommendations, plan };
};

export default function Vo2KineticsCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      initialVO2: undefined,
      finalVO2: undefined,
      timeToSteadyState: undefined,
      age: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="vo2-kinetics-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            VO2 Kinetics Calculator
          </CardTitle>
          <CardDescription>Calculate VO2 kinetics from initial VO2, final VO2, time to steady state, and age.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your VO2 kinetics data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="initialVO2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial VO2 (mL/kg/min)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="finalVO2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Final VO2 (mL/kg/min)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 35" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timeToSteadyState"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time to steady state (seconds)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 45" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                        <Input type="number" step="1" placeholder="e.g., 35" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate VO2 kinetics
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
            <CardDescription>See VO2 kinetics index, cardiovascular status, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Initial VO2</p>
                <p className="text-2xl font-semibold text-primary">{result.initialVO2.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">mL/kg/min</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Final VO2</p>
                <p className="text-2xl font-semibold text-primary">{result.finalVO2.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">mL/kg/min</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Time to steady state</p>
                <p className="text-2xl font-semibold text-primary">{result.timeToSteadyState.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">seconds</p>
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
            <strong>VO2 kinetics</strong> = assessed from time to reach steady state and VO2 increase from initial to final values.
          </p>
          <p>
            <strong>Time constant (tau)</strong> = time for VO2 to reach 63% of steady state increase. Faster kinetics (shorter time) indicate better cardiovascular fitness.
          </p>
          <p>
            <strong>Normal ranges</strong>: Time to steady state: 30-60 seconds for moderate exercise. Faster kinetics (â‰¤30 seconds) indicate better fitness. Slower kinetics (&gt;60 seconds) may indicate reduced fitness.
          </p>
          <p>VO2 kinetics are affected by cardiovascular fitness, age, training status, exercise intensity, and cardiovascular health. Regular exercise improves kinetics.</p>
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
                <p className="text-sm text-muted-foreground">Target time to steady state</p>
                <p className="text-xl font-semibold text-primary">30-60 seconds</p>
                <p className="text-xs text-muted-foreground">Normal range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Kinetics index</p>
                <p className="text-xl font-semibold text-primary">{result.kineticsIndex.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">VO2 increase</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.finalVO2 - result.initialVO2).toFixed(1)} mL/kg/min
                </p>
                <p className="text-xs text-muted-foreground">From initial to final</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your VO2 kinetics data to see additional insights.</p>
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
          <p>VO2 kinetics describe how quickly oxygen uptake increases from rest to steady state during exercise. Faster kinetics (30-60 seconds to steady state) indicate better cardiovascular fitness and oxygen delivery efficiency.</p>
          <p>Use this calculator to assess VO2 kinetics from initial VO2, final VO2, time to steady state, and age.</p>
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
          <p>This tool calculates VO2 kinetics from initial VO2, final VO2, time to steady state, and age.</p>
          <p>Outputs include initial VO2, final VO2, time to steady state, kinetics index, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

