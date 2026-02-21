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
  liverFunction: z.number({ invalid_type_error: 'Enter liver function score' }).min(1).max(10),
  kidneyFunction: z.number({ invalid_type_error: 'Enter kidney function score' }).min(1).max(10),
  hydrationLevel: z.number({ invalid_type_error: 'Enter hydration level' }).min(1).max(10),
  antioxidantIntake: z.number({ invalid_type_error: 'Enter antioxidant intake' }).min(0).max(20),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  liverFunction: number;
  kidneyFunction: number;
  hydrationLevel: number;
  antioxidantIntake: number;
  efficiencyIndex: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter liver function score (1-10) from health assessment or liver function tests.',
  'Enter kidney function score (1-10) from health assessment or kidney function tests.',
  'Enter hydration level (1 = dehydrated, 10 = well-hydrated) from self-assessment.',
  'Enter antioxidant intake score (0-20) from dietary assessment.',
  'Review detox pathway efficiency, organ function status, and recommendations.',
];

const faqs = [
  {
    question: 'What are detox pathways?',
    answer:
      'Detox pathways are biological processes that eliminate toxins and waste products from the body. The liver and kidneys are primary detox organs, processing and removing harmful substances through various metabolic pathways.',
  },
  {
    question: 'How do detox pathways work?',
    answer:
      'Detox pathways involve liver enzymes (phase I and II), kidney filtration, and elimination through urine, feces, sweat, and breath. These processes convert toxins into less harmful forms and remove them from the body.',
  },
  {
    question: 'What affects detox pathway efficiency?',
    answer:
      'Detox efficiency is affected by liver and kidney function, hydration status, antioxidant intake, nutrition, exercise, sleep, stress, and exposure to toxins. Healthy organs and adequate support nutrients optimize detox pathways.',
  },
  {
    question: 'How does liver function affect detox?',
    answer:
      'The liver is the primary detox organ, processing toxins through enzymatic reactions. Good liver function is essential for efficient detoxification. Liver damage or dysfunction impairs detox pathways.',
  },
  {
    question: 'How does kidney function affect detox?',
    answer:
      'The kidneys filter waste products and toxins from the blood, excreting them in urine. Good kidney function is essential for efficient elimination. Kidney dysfunction impairs toxin removal.',
  },
  {
    question: 'How does hydration affect detox?',
    answer:
      'Adequate hydration supports kidney function and helps flush toxins through urine. Dehydration can impair kidney function and reduce detox efficiency. Proper hydration is essential for optimal detox.',
  },
  {
    question: 'How do antioxidants affect detox?',
    answer:
      'Antioxidants support detox pathways by neutralizing free radicals produced during detoxification, protecting cells from damage, and supporting liver and kidney function. Adequate antioxidant intake optimizes detox efficiency.',
  },
  {
    question: 'Can I improve detox pathway efficiency?',
    answer:
      'Yes. Support detox pathways through adequate hydration, antioxidant-rich diet, regular exercise, good sleep, stress management, and avoiding excessive toxin exposure. Support liver and kidney health through healthy lifestyle.',
  },
  {
    question: 'What about detox diets or supplements?',
    answer:
      'While some detox diets and supplements may help, the body has natural detox pathways. Focus on supporting organ function through healthy lifestyle rather than extreme detox protocols. Consult healthcare provider before detox programs.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if you have concerns about liver or kidney function, if you have symptoms of organ dysfunction, or if you need guidance on supporting detox pathways safely.',
  },
];

const relatedCalculators = [
  {
    name: 'Kidney Function Creatinine Clearance (CrCl) Calculator',
    slug: 'kidney-function-creatinine-clearance-crcl-calculator',
    description: 'Assess kidney function alongside detox efficiency.',
  },
  {
    name: 'Liver Enzyme (ALT/AST Ratio) Calculator',
    slug: 'liver-enzyme-alt-ast-ratio-calculator',
    description: 'Evaluate liver function comprehensively.',
  },
  {
    name: 'Cellular Hydration Score Calculator',
    slug: 'cellular-hydration-score-calculator',
    description: 'Monitor hydration that supports detox.',
  },
  {
    name: 'Oxidative Stress Index Calculator',
    slug: 'oxidative-stress-index-calculator',
    description: 'Assess oxidative stress affecting detox.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/detox-pathway-efficiency-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Detox Pathway Efficiency Wellness Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Detox Pathway Efficiency Wellness Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate detox pathway efficiency from liver function, kidney function, hydration level, and antioxidant intake.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const liverFunction = values.liverFunction;
  const kidneyFunction = values.kidneyFunction;
  const hydrationLevel = values.hydrationLevel;
  const antioxidantIntake = values.antioxidantIntake;
  
  // Calculate efficiency index (0-100, higher = better)
  let efficiencyIndex = 50;
  
  // Liver function component (0-30 points)
  if (liverFunction >= 8) {
    efficiencyIndex += 25; // Excellent
  } else if (liverFunction >= 6) {
    efficiencyIndex += 15; // Good
  } else if (liverFunction < 4) {
    efficiencyIndex -= 20; // Poor
  } else {
    efficiencyIndex -= 5; // Moderate
  }
  
  // Kidney function component (0-30 points)
  if (kidneyFunction >= 8) {
    efficiencyIndex += 25; // Excellent
  } else if (kidneyFunction >= 6) {
    efficiencyIndex += 15; // Good
  } else if (kidneyFunction < 4) {
    efficiencyIndex -= 20; // Poor
  } else {
    efficiencyIndex -= 5; // Moderate
  }
  
  // Hydration component (0-20 points)
  if (hydrationLevel >= 8) {
    efficiencyIndex += 18; // Well-hydrated
  } else if (hydrationLevel >= 6) {
    efficiencyIndex += 10; // Adequate
  } else if (hydrationLevel < 4) {
    efficiencyIndex -= 15; // Dehydrated
  } else {
    efficiencyIndex -= 5; // Low hydration
  }
  
  // Antioxidant intake component (0-20 points)
  if (antioxidantIntake >= 15) {
    efficiencyIndex += 18; // High intake
  } else if (antioxidantIntake >= 10) {
    efficiencyIndex += 10; // Moderate intake
  } else if (antioxidantIntake < 5) {
    efficiencyIndex -= 15; // Low intake
  }
  
  efficiencyIndex = clamp(efficiencyIndex, 0, 100);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'This suggests a general lifestyle tendency where your detox pathway efficiency may appear optimal. You may consider continuing to maintain healthy organ function and lifestyle habits.';

  if (efficiencyIndex < 40 || liverFunction < 4 || kidneyFunction < 4) {
    status = 'low';
    interpretation = 'This suggests a general lifestyle tendency where your detox pathway efficiency may be low. This may indicate areas for improvement in organ function. You may consider focusing on supporting liver and kidney health and seeking professional guidance if needed. This is a personal insight, not a medical evaluation.';
  } else if (efficiencyIndex < 60 || liverFunction < 6 || kidneyFunction < 6) {
    status = 'moderate';
    interpretation = 'This suggests a general lifestyle tendency where your detox pathway efficiency may be moderate. You may consider focusing on improving organ function, hydration, and antioxidant intake to optimize detox pathways.';
  } else if (efficiencyIndex < 75) {
    status = 'good';
    interpretation = 'This suggests a general lifestyle tendency where your detox pathway efficiency may be good. You may consider continuing to maintain healthy lifestyle to support optimal organ function and detox pathways.';
  }

  const recommendations = [
    'Support liver function through healthy lifestyle: avoid excessive alcohol, maintain healthy weight, eat a balanced diet, and avoid unnecessary medications that may stress the liver.',
    'Support kidney function through adequate hydration (2-3 L/day), balanced diet, blood pressure management, and avoiding excessive protein or substances that stress the kidneys.',
    'Maintain adequate hydration to support kidney function and toxin elimination. Drink water regularly throughout the day to optimize detox pathways.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('You may consider seeking professional guidance for evaluation of liver and kidney function if scores are low. This is a personal insight, not a medical evaluation.');
  }
  if (antioxidantIntake < 10) {
    recommendations.push('Increase antioxidant intake through diet: consume fruits, vegetables, nuts, and whole grains to support detox pathways and protect organs from oxidative damage.');
  }
  if (hydrationLevel < 6) {
    recommendations.push('Improve hydration. Adequate water intake is essential for kidney function and efficient toxin elimination through urine.');
  }

  const plan = [
    { label: 'This Week', detail: 'Assess current liver function, kidney function, hydration, and antioxidant intake. Calculate detox pathway efficiency and identify areas for improvement.' },
    { label: 'This Month', detail: 'Implement lifestyle changes: support organ health, improve hydration, increase antioxidant intake, and maintain healthy habits to optimize detox pathways.' },
    { label: 'Ongoing', detail: 'Monitor detox pathway efficiency through regular assessment of organ function, hydration, and lifestyle factors. Maintain healthy habits to support optimal detoxification.' },
  ];

  return { liverFunction, kidneyFunction, hydrationLevel, antioxidantIntake, efficiencyIndex, status, interpretation, recommendations, plan };
};

export default function DetoxPathwayEfficiencyCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      liverFunction: undefined,
      kidneyFunction: undefined,
      hydrationLevel: undefined,
      antioxidantIntake: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="detox-pathway-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Detox Pathway Efficiency Wellness Calculator
          </CardTitle>
          <CardDescription>Get general wellness insights about detox pathway efficiency from liver function, kidney function, hydration level, and antioxidant intake. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your detox pathway data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="liverFunction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Liver function score (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="kidneyFunction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kidney function score (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hydrationLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hydration level (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="antioxidantIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Antioxidant intake score (0-20)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 12" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate detox efficiency
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
            <CardDescription>See detox pathway efficiency, organ function status, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Liver function</p>
                <p className="text-2xl font-semibold text-primary">{result.liverFunction.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 10</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Kidney function</p>
                <p className="text-2xl font-semibold text-primary">{result.kidneyFunction.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 10</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Efficiency index</p>
                <p className="text-2xl font-semibold text-primary">{result.efficiencyIndex.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
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
            <strong>Detox pathway efficiency</strong> = calculated from liver function (0-30 points), kidney function (0-30 points), hydration level (0-20 points), and antioxidant intake (0-20 points).
          </p>
          <p>
            <strong>Components</strong>: Liver and kidney function are primary detox organs. Hydration supports kidney filtration. Antioxidants protect organs and support detox pathways.
          </p>
          <p>
            <strong>Optimal ranges</strong>: Liver function: 8-10, Kidney function: 8-10, Hydration level: 8-10, Antioxidant intake: 15-20. Higher scores indicate better detox pathway efficiency.
          </p>
          <p>Detox pathway efficiency is affected by organ function, hydration, nutrition, lifestyle factors, and exposure to toxins. Supporting organ health optimizes detox pathways.</p>
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
                <p className="text-sm text-muted-foreground">Target efficiency</p>
                <p className="text-xl font-semibold text-primary">&gt; 75</p>
                <p className="text-xs text-muted-foreground">Optimal range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Organ function average</p>
                <p className="text-xl font-semibold text-primary">
                  {((result.liverFunction + result.kidneyFunction) / 2).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Out of 10</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Efficiency status</p>
                <p className="text-xl font-semibold text-primary">
                  {result.efficiencyIndex >= 75 ? 'Optimal' : result.efficiencyIndex >= 60 ? 'Good' : result.efficiencyIndex >= 40 ? 'Moderate' : 'Low'}
                </p>
                <p className="text-xs text-muted-foreground">Based on index</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your detox pathway data to see additional insights.</p>
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
          <p>Detox pathways are biological processes that eliminate toxins from the body. The liver and kidneys are primary detox organs. Optimal detox efficiency requires healthy organ function, adequate hydration, and antioxidant support.</p>
          <p>Use this calculator to assess detox pathway efficiency from liver function, kidney function, hydration level, and antioxidant intake.</p>
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
          <p>This tool provides general wellness insights about detox pathway efficiency from liver function, kidney function, hydration level, and antioxidant intake. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include liver function, kidney function, hydration level, antioxidant intake, efficiency index, status, recommendations, an action plan, and supporting metrics.</p>
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
