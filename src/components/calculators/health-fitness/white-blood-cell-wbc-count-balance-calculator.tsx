'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Zap, Target, Activity, Heart } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  whiteBloodCellCount: z.number({ invalid_type_error: 'Enter white blood cell count' }).min(1).max(50),
  neutrophilCount: z.number({ invalid_type_error: 'Enter neutrophil count' }).min(0).max(30).optional(),
  lymphocyteCount: z.number({ invalid_type_error: 'Enter lymphocyte count' }).min(0).max(20).optional(),
  age: z.number({ invalid_type_error: 'Enter age' }).min(1).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  whiteBloodCellCount: number;
  neutrophilPercentage: number;
  lymphocytePercentage: number;
  balanceScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter white blood cell count (thousand cells/μL) from blood test.',
  'Optionally enter neutrophil count (thousand cells/μL) from differential.',
  'Optionally enter lymphocyte count (thousand cells/μL) from differential.',
  'Enter your age (WBC ranges can vary by age).',
  'Review white blood cell count, balance, and recommendations.',
];

const faqs = [
  {
    question: 'What are white blood cells?',
    answer:
      'White blood cells (WBCs) are immune system cells that defend the body against infections, foreign invaders, and disease. They include neutrophils, lymphocytes, monocytes, eosinophils, and basophils.',
  },
  {
    question: 'What are normal white blood cell counts?',
    answer:
      'Normal WBC count ranges from 4,000 to 11,000 cells/μL (4-11 thousand/μL) for adults. Values outside this range may indicate infection, inflammation, or other conditions.',
  },
  {
    question: 'What causes high white blood cell count?',
    answer:
      'High WBC count (leukocytosis) can result from infections, inflammation, stress, exercise, medications, or blood disorders. It indicates immune system activation.',
  },
  {
    question: 'What causes low white blood cell count?',
    answer:
      'Low WBC count (leukopenia) can result from viral infections, autoimmune disorders, medications, bone marrow problems, or nutritional deficiencies. It increases infection risk.',
  },
  {
    question: 'What is the neutrophil to lymphocyte ratio?',
    answer:
      'The neutrophil to lymphocyte ratio (NLR) is a marker of inflammation and immune status. Normal ratio is approximately 1-3. Elevated ratios may indicate inflammation or stress.',
  },
  {
    question: 'How do neutrophils and lymphocytes differ?',
    answer:
      'Neutrophils are the most abundant WBCs and fight bacterial infections. Lymphocytes include T-cells and B-cells and are crucial for adaptive immunity and viral defense.',
  },
  {
    question: 'Does age affect white blood cell count?',
    answer:
      'Yes. WBC counts can vary by age. Infants and children may have higher counts. Older adults may have slightly different normal ranges. Age-specific reference ranges are important.',
  },
  {
    question: 'Can I track white blood cell count at home?',
    answer:
      'Home WBC tests are limited. Complete blood count (CBC) through healthcare providers provides accurate WBC counts and differentials. Regular monitoring is important for health conditions.',
  },
  {
    question: 'What about immune system health?',
    answer:
      'WBC count and balance reflect immune system status. Optimal counts and balanced differentials support effective immune function. Lifestyle factors like sleep, nutrition, and stress affect WBC health.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if WBC count is significantly outside normal range, if you have persistent symptoms, or if you have concerns about immune function or infection risk.',
  },
];

const relatedCalculators = [
  {
    name: 'Hemoglobin (Hb) Level Estimator',
    slug: 'hemoglobin-hb-level-estimator',
    description: 'Monitor complete blood count components.',
  },
  {
    name: 'Red Blood Cell Count to Oxygen Capacity Calculator',
    slug: 'red-blood-cell-count-to-oxygen-capacity-calculator',
    description: 'Assess blood health comprehensively.',
  },
  {
    name: 'Platelet Count Risk Analyzer',
    slug: 'platelet-count-risk-analyzer',
    description: 'Evaluate complete blood count together.',
  },
  {
    name: 'Iron Intake Calculator',
    slug: 'iron-intake-calculator',
    description: 'Track nutrition that affects blood health.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/white-blood-cell-wbc-count-balance-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'White Blood Cell (WBC) Count Balance Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'White Blood Cell (WBC) Count Balance Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate white blood cell count balance from white blood cell count, neutrophil count, lymphocyte count, and age.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const whiteBloodCellCount = values.whiteBloodCellCount;
  
  // Estimate percentages if differential counts not provided
  let neutrophilPercentage: number;
  let lymphocytePercentage: number;
  
  if (values.neutrophilCount && values.lymphocyteCount) {
    // Use provided counts
    neutrophilPercentage = (values.neutrophilCount / whiteBloodCellCount) * 100;
    lymphocytePercentage = (values.lymphocyteCount / whiteBloodCellCount) * 100;
  } else {
    // Estimate based on typical distributions
    // Normal: Neutrophils 50-70%, Lymphocytes 20-40%
    neutrophilPercentage = 60; // Typical percentage
    lymphocytePercentage = 30; // Typical percentage
  }
  
  // Calculate balance score (0-100)
  // Optimal: WBC 4-11, Neutrophils 50-70%, Lymphocytes 20-40%
  let balanceScore = 50;
  
  // WBC count component (0-40 points)
  if (whiteBloodCellCount >= 4 && whiteBloodCellCount <= 11) {
    balanceScore += 30;
  } else if (whiteBloodCellCount >= 3 && whiteBloodCellCount <= 12) {
    balanceScore += 15;
  }
  
  // Neutrophil percentage component (0-30 points)
  if (neutrophilPercentage >= 50 && neutrophilPercentage <= 70) {
    balanceScore += 25;
  } else if (neutrophilPercentage >= 40 && neutrophilPercentage <= 75) {
    balanceScore += 10;
  }
  
  // Lymphocyte percentage component (0-30 points)
  if (lymphocytePercentage >= 20 && lymphocytePercentage <= 40) {
    balanceScore += 25;
  } else if (lymphocytePercentage >= 15 && lymphocytePercentage <= 45) {
    balanceScore += 10;
  }
  
  balanceScore = clamp(balanceScore, 0, 100);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your white blood cell count and balance appear optimal. Continue maintaining healthy immune function.';

  if (whiteBloodCellCount < 3 || whiteBloodCellCount > 12) {
    status = 'low';
    interpretation = 'Your white blood cell count is outside normal range. Consult a healthcare provider for evaluation and appropriate management.';
  } else if (whiteBloodCellCount < 4 || whiteBloodCellCount > 11) {
    status = 'moderate';
    interpretation = 'Your white blood cell count is slightly outside optimal range. Monitor and consult healthcare provider if concerns persist.';
  } else if (balanceScore < 70) {
    status = 'moderate';
    interpretation = 'Your white blood cell balance may need attention. Consider factors affecting immune health and consult healthcare provider if needed.';
  } else if (balanceScore < 85) {
    status = 'good';
    interpretation = 'Your white blood cell count and balance are good. Continue maintaining healthy lifestyle to support immune function.';
  }

  const recommendations = [
    'Maintain healthy lifestyle: adequate sleep, balanced nutrition, regular exercise, and stress management to support optimal white blood cell function.',
    'Support immune health with adequate vitamin C, vitamin D, zinc, and other essential nutrients that influence white blood cell production and function.',
    'Practice good hygiene and infection prevention, especially if white blood cell count is low, to reduce infection risk.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Consult a healthcare provider for comprehensive evaluation if white blood cell count remains outside normal range or if you have symptoms.');
  }
  if (whiteBloodCellCount < 4) {
    recommendations.push('Take extra precautions to avoid infections if white blood cell count is low. Consider discussing immune support strategies with healthcare provider.');
  }

  const plan = [
    { label: 'This Week', detail: 'Review blood test results for white blood cell count and differential. Assess current immune health status.' },
    { label: 'This Month', detail: 'Implement lifestyle changes to support immune health: improve sleep, nutrition, exercise, and stress management.' },
    { label: 'Ongoing', detail: 'Monitor white blood cell counts regularly through healthcare provider. Address any persistent abnormalities with medical guidance.' },
  ];

  return { whiteBloodCellCount, neutrophilPercentage, lymphocytePercentage, balanceScore, status, interpretation, recommendations, plan };
};

export default function WhiteBloodCellWbcCountBalanceCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      whiteBloodCellCount: undefined,
      neutrophilCount: undefined,
      lymphocyteCount: undefined,
      age: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="wbc-balance-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            White Blood Cell (WBC) Count Balance Calculator
          </CardTitle>
          <CardDescription>Calculate white blood cell count balance from white blood cell count, neutrophil count, lymphocyte count, and age.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your white blood cell data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="whiteBloodCellCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>White blood cell count (thousand/μL)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 7.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="neutrophilCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Neutrophil count (thousand/μL) (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 4.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lymphocyteCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lymphocyte count (thousand/μL) (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 2.3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                Calculate WBC balance
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
            <CardDescription>See white blood cell count, balance, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">WBC count</p>
                <p className="text-2xl font-semibold text-primary">{result.whiteBloodCellCount.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Thousand cells/μL</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Neutrophil percentage</p>
                <p className="text-2xl font-semibold text-primary">{result.neutrophilPercentage.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Of WBC count</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Lymphocyte percentage</p>
                <p className="text-2xl font-semibold text-primary">{result.lymphocytePercentage.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Of WBC count</p>
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
            <strong>Neutrophil percentage</strong> = (neutrophil count / white blood cell count) × 100.
          </p>
          <p>
            <strong>Lymphocyte percentage</strong> = (lymphocyte count / white blood cell count) × 100.
          </p>
          <p>
            <strong>Normal ranges</strong>: WBC count: 4-11 thousand/μL, Neutrophils: 50-70%, Lymphocytes: 20-40%. Ranges vary by age and individual factors.
          </p>
          <p>White blood cell balance is affected by infections, inflammation, immune status, medications, and underlying health conditions.</p>
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
                <p className="text-sm text-muted-foreground">Target WBC count</p>
                <p className="text-xl font-semibold text-primary">4-11 thousand/μL</p>
                <p className="text-xs text-muted-foreground">Normal range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Balance score</p>
                <p className="text-xl font-semibold text-primary">{result.balanceScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Neutrophil:Lymphocyte ratio</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.neutrophilPercentage / result.lymphocytePercentage).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">NLR (normal: 1-3)</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your white blood cell data to see additional insights.</p>
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
          <p>White blood cells are immune system cells that defend against infections and disease. Normal WBC count ranges from 4,000 to 11,000 cells/μL, with neutrophils (50-70%) and lymphocytes (20-40%) being the most abundant types.</p>
          <p>Use this calculator to assess white blood cell count balance from white blood cell count, neutrophil count (optional), lymphocyte count (optional), and age.</p>
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
          <p>This tool calculates white blood cell count balance from white blood cell count, neutrophil count (optional), lymphocyte count (optional), and age.</p>
          <p>Outputs include white blood cell count, neutrophil percentage, lymphocyte percentage, balance score, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

