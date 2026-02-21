'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wind, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  redBloodCellCount: z.number({ invalid_type_error: 'Enter red blood cell count' }).min(2).max(8).optional(),
  hemoglobinLevel: z.number({ invalid_type_error: 'Enter hemoglobin level' }).min(5).max(20),
  oxygenCapacity: z.number({ invalid_type_error: 'Enter oxygen capacity' }).min(10).max(30).optional(),
  age: z.number({ invalid_type_error: 'Enter age' }).min(1).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  redBloodCellCount: number;
  oxygenCapacity: number;
  oxygenPercentage: number;
  capacityScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter red blood cell count if measured (million cells/μL) from blood test.',
  'Enter hemoglobin level (g/dL) from blood test.',
  'Optionally enter oxygen capacity if measured (mL O2/dL blood).',
  'Enter your age (oxygen capacity can change with age).',
  'Review red blood cell count, oxygen capacity, and recommendations.',
];

const faqs = [
  {
    question: 'What is oxygen capacity?',
    answer:
      'Oxygen capacity is the maximum amount of oxygen that blood can carry. It depends on hemoglobin concentration and red blood cell count. Normal range is approximately 20-22 mL O2/dL blood.',
  },
  {
    question: 'How are red blood cells and oxygen capacity related?',
    answer:
      'Red blood cells contain hemoglobin, which binds and transports oxygen. Higher red blood cell count and hemoglobin levels increase oxygen-carrying capacity of the blood.',
  },
  {
    question: 'What are normal red blood cell counts?',
    answer:
      'Normal ranges vary by gender. Adult males: 4.5-5.9 million cells/μL, adult females: 4.1-5.1 million cells/μL. Values outside these ranges may indicate anemia or polycythemia.',
  },
  {
    question: 'What causes low oxygen capacity?',
    answer:
      'Low oxygen capacity can result from anemia (low red blood cell count or hemoglobin), iron deficiency, blood loss, chronic disease, or bone marrow problems.',
  },
  {
    question: 'What are symptoms of low oxygen capacity?',
    answer:
      'Symptoms include fatigue, shortness of breath, weakness, dizziness, rapid heartbeat, pale skin, and reduced exercise tolerance. Severe cases require medical attention.',
  },
  {
    question: 'How can I improve oxygen capacity?',
    answer:
      'Address underlying causes: ensure adequate iron intake, treat anemia, maintain healthy red blood cell production, and address any chronic conditions affecting blood health.',
  },
  {
    question: 'Does hemoglobin affect oxygen capacity?',
    answer:
      'Yes. Hemoglobin is the primary oxygen carrier. Each gram of hemoglobin can carry approximately 1.34 mL of oxygen. Higher hemoglobin increases oxygen capacity.',
  },
  {
    question: 'Can I track oxygen capacity at home?',
    answer:
      'Direct measurement requires lab tests. However, monitoring red blood cell count and hemoglobin through blood tests provides indirect assessment of oxygen capacity.',
  },
  {
    question: 'Does age affect oxygen capacity?',
    answer:
      'Yes. Oxygen capacity may decrease slightly with age due to changes in red blood cell production and hemoglobin levels. Regular monitoring is important for older adults.',
  },
  {
    question: 'What is the relationship with exercise?',
    answer:
      'Adequate oxygen capacity is essential for exercise performance. Low capacity limits endurance and performance. Athletes may have higher capacity due to training adaptations.',
  },
];

const relatedCalculators = [
  {
    name: 'Hemoglobin (Hb) Level Estimator',
    slug: 'hemoglobin-hb-level-estimator',
    description: 'Estimate hemoglobin levels alongside oxygen capacity.',
  },
  {
    name: 'Platelet Count Risk Analyzer',
    slug: 'platelet-count-risk-analyzer',
    description: 'Assess blood health comprehensively.',
  },
  {
    name: 'Iron Intake Calculator',
    slug: 'protein-intake-calculator',
    description: 'Track iron intake that affects red blood cells.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/red-blood-cell-count-to-oxygen-capacity-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Red Blood Cell Count to Oxygen Capacity Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Red Blood Cell Count to Oxygen Capacity Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate red blood cell count to oxygen capacity from red blood cell count, hemoglobin level, oxygen capacity, and age.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  let redBloodCellCount: number;
  let oxygenCapacity: number;
  
  if (values.oxygenCapacity) {
    // Use provided oxygen capacity
    oxygenCapacity = values.oxygenCapacity;
    // Estimate RBC from oxygen capacity (approximate: 1.34 mL O2 per g Hb, Hb ~15 g/dL = ~20 mL O2/dL)
    redBloodCellCount = values.redBloodCellCount || (oxygenCapacity / 4.0);
  } else {
    // Calculate oxygen capacity from hemoglobin
    // Each gram of hemoglobin can carry approximately 1.34 mL of oxygen
    oxygenCapacity = values.hemoglobinLevel * 1.34;
    
    // Estimate RBC count if not provided
    if (values.redBloodCellCount) {
      redBloodCellCount = values.redBloodCellCount;
    } else {
      // Estimate based on hemoglobin (rough correlation)
      redBloodCellCount = (values.hemoglobinLevel / 3.0) + 1.0;
    }
  }
  
  if (!values.redBloodCellCount && !values.oxygenCapacity) {
    redBloodCellCount = (values.hemoglobinLevel / 3.0) + 1.0;
  }
  
  // Normal oxygen capacity: ~20-22 mL O2/dL
  const normalCapacity = 21.0;
  const oxygenPercentage = (oxygenCapacity / normalCapacity) * 100;
  const capacityScore = clamp(oxygenPercentage, 0, 100);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your oxygen capacity appears optimal. Continue maintaining healthy red blood cell and hemoglobin levels.';

  if (oxygenCapacity < 15) {
    status = 'low';
    interpretation = 'Your oxygen capacity appears low. This may indicate anemia or low red blood cell count. Consult a healthcare provider for evaluation.';
  } else if (oxygenCapacity < 18) {
    status = 'moderate';
    interpretation = 'Your oxygen capacity is moderate. Focus on improving red blood cell health and hemoglobin levels.';
  } else if (oxygenCapacity < 20) {
    status = 'good';
    interpretation = 'Your oxygen capacity is good. Continue maintaining healthy blood parameters.';
  }

  const recommendations = [
    'Ensure adequate iron intake to support red blood cell production and hemoglobin synthesis (red meat, leafy greens, beans, fortified cereals).',
    'Include vitamin B12 and folate in your diet, as they are essential for red blood cell formation and oxygen transport.',
    'Address any underlying conditions that may affect red blood cell production or oxygen-carrying capacity.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Consult a healthcare provider for comprehensive blood work and evaluation if oxygen capacity remains low despite dietary changes.');
  }
  if (values.hemoglobinLevel < 12) {
    recommendations.push('Focus on increasing hemoglobin levels, as hemoglobin is the primary determinant of oxygen capacity.');
  }

  const plan = [
    { label: 'This Week', detail: 'Review blood test results for red blood cell count and hemoglobin. Calculate current oxygen capacity.' },
    { label: 'This Month', detail: 'Implement dietary changes to support red blood cell health: adequate iron, B12, and folate intake.' },
    { label: 'Ongoing', detail: 'Monitor blood parameters regularly. If oxygen capacity remains low, consult healthcare provider for diagnosis and treatment.' },
  ];

  return { redBloodCellCount, oxygenCapacity, oxygenPercentage, capacityScore, status, interpretation, recommendations, plan };
};

export default function RedBloodCellCountToOxygenCapacityCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      redBloodCellCount: undefined,
      hemoglobinLevel: undefined,
      oxygenCapacity: undefined,
      age: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="oxygen-capacity-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wind className="h-5 w-5" />
            Red Blood Cell Count to Oxygen Capacity Calculator
          </CardTitle>
          <CardDescription>Calculate red blood cell count to oxygen capacity from red blood cell count, hemoglobin level, oxygen capacity, and age.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your blood data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="redBloodCellCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Red blood cell count (million/μL) (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 4.8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hemoglobinLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hemoglobin level (g/dL)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 14.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="oxygenCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Oxygen capacity (mL O2/dL) (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 20.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                Calculate oxygen capacity
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
            <CardDescription>See red blood cell count, oxygen capacity, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Red blood cell count</p>
                <p className="text-2xl font-semibold text-primary">{result.redBloodCellCount.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Million cells/μL</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Oxygen capacity</p>
                <p className="text-2xl font-semibold text-primary">{result.oxygenCapacity.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">mL O2/dL blood</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Oxygen percentage</p>
                <p className="text-2xl font-semibold text-primary">{result.oxygenPercentage.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Of normal capacity</p>
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
            <strong>Oxygen capacity</strong> = hemoglobin level (g/dL) × 1.34 mL O2/g Hb.
          </p>
          <p>
            <strong>If oxygen capacity not provided</strong>: Calculated from hemoglobin level. Each gram of hemoglobin can carry approximately 1.34 mL of oxygen.
          </p>
          <p>
            <strong>Normal oxygen capacity</strong>: Approximately 20-22 mL O2/dL blood for healthy adults. This corresponds to hemoglobin levels of 15-16.5 g/dL.
          </p>
          <p>Oxygen capacity depends on red blood cell count, hemoglobin concentration, and blood volume. It is essential for oxygen transport to tissues.</p>
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
                <p className="text-sm text-muted-foreground">Target oxygen capacity</p>
                <p className="text-xl font-semibold text-primary">20-22 mL O2/dL</p>
                <p className="text-xs text-muted-foreground">Normal range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Capacity vs target</p>
                <p className="text-xl font-semibold text-primary">
                  {(() => {
                    const target = 21.0;
                    const diff = result.oxygenCapacity - target;
                    return diff >= 0 ? `+${diff.toFixed(1)} mL O2/dL` : `${diff.toFixed(1)} mL O2/dL`;
                  })()}
                </p>
                <p className="text-xs text-muted-foreground">Difference from target</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Capacity score</p>
                <p className="text-xl font-semibold text-primary">{result.capacityScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your blood data to see additional insights.</p>
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
          <p>Oxygen capacity is the maximum amount of oxygen that blood can carry, determined by hemoglobin concentration and red blood cell count. Normal capacity is approximately 20-22 mL O2/dL blood.</p>
          <p>Use this calculator to assess red blood cell count and oxygen capacity from red blood cell count (optional), hemoglobin level, oxygen capacity (optional), and age.</p>
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
          <p>This tool calculates red blood cell count to oxygen capacity from red blood cell count (optional), hemoglobin level, oxygen capacity (optional), and age.</p>
          <p>Outputs include red blood cell count, oxygen capacity, oxygen percentage, capacity score, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

