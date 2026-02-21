'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, Zap as ZapIcon, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  tshLevel: z.number({ invalid_type_error: 'Enter TSH level' }).min(0.1).max(50),
  t3Level: z.number({ invalid_type_error: 'Enter T3 level' }).min(0.5).max(5).optional(),
  t4Level: z.number({ invalid_type_error: 'Enter T4 level' }).min(2).max(20).optional(),
  age: z.number({ invalid_type_error: 'Enter age' }).min(1).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  tshLevel: number;
  t3Level: number;
  t4Level: number;
  balanceScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter TSH (thyroid-stimulating hormone) level (mIU/L) from thyroid function test.',
  'Optionally enter T3 (triiodothyronine) level (ng/dL) from thyroid function test.',
  'Optionally enter T4 (thyroxine) level (Î¼g/dL) from thyroid function test.',
  'Enter your age (thyroid function can change with age).',
  'Review TSH/T3/T4 balance, thyroid function status, and recommendations.',
];

const faqs = [
  {
    question: 'What are TSH, T3, and T4?',
    answer:
      'TSH (thyroid-stimulating hormone) is produced by the pituitary to stimulate the thyroid. T3 (triiodothyronine) and T4 (thyroxine) are thyroid hormones that regulate metabolism. Balance between these indicates thyroid function.',
  },
  {
    question: 'What are normal thyroid hormone levels?',
    answer:
      'Normal TSH: 0.4-4.0 mIU/L. Normal T3: 80-200 ng/dL. Normal T4: 5-12 Î¼g/dL. Ranges may vary by lab and individual factors. Optimal TSH is often 1.0-2.5 mIU/L.',
  },
  {
    question: 'What is hypothyroidism?',
    answer:
      'Hypothyroidism (underactive thyroid) is characterized by elevated TSH and low T3/T4. Symptoms include fatigue, weight gain, cold intolerance, and depression. It requires thyroid hormone replacement.',
  },
  {
    question: 'What is hyperthyroidism?',
    answer:
      'Hyperthyroidism (overactive thyroid) is characterized by low TSH and elevated T3/T4. Symptoms include weight loss, rapid heartbeat, anxiety, and heat intolerance. It requires treatment to reduce thyroid function.',
  },
  {
    question: 'How do TSH, T3, and T4 work together?',
    answer:
      'TSH stimulates the thyroid to produce T4 and T3. T4 is converted to the more active T3. High TSH indicates low thyroid function (hypothyroidism), while low TSH indicates high function (hyperthyroidism).',
  },
  {
    question: 'What causes thyroid imbalance?',
    answer:
      'Thyroid imbalance can result from autoimmune disease (Hashimoto\'s, Graves\'), iodine deficiency, medications, radiation, surgery, or other conditions affecting thyroid or pituitary function.',
  },
  {
    question: 'Does age affect thyroid function?',
    answer:
      'Yes. Thyroid function can change with age. Older adults may have slightly different normal ranges. Subclinical hypothyroidism is more common in older adults.',
  },
  {
    question: 'Can I track thyroid function at home?',
    answer:
      'Home thyroid tests are limited. Thyroid function tests (TFTs) through healthcare providers provide accurate TSH, T3, and T4 measurements. Regular monitoring is important for thyroid health.',
  },
  {
    question: 'What about subclinical thyroid disease?',
    answer:
      'Subclinical hypothyroidism (elevated TSH, normal T3/T4) or hyperthyroidism (low TSH, normal T3/T4) may not cause symptoms but can progress. Treatment decisions depend on individual factors.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if TSH is outside normal range, if you have thyroid symptoms, if you have risk factors for thyroid disease, or if you need thyroid medication adjustment.',
  },
];

const relatedCalculators = [
  {
    name: 'Hemoglobin (Hb) Level Estimator',
    slug: 'hemoglobin-hb-level-estimator',
    description: 'Monitor metabolic health components.',
  },
  {
    name: 'Iron Deficiency Anemia Risk Calculator',
    slug: 'iron-deficiency-anemia-risk-calculator',
    description: 'Assess nutrition that affects thyroid function.',
  },
  {
    name: 'Liver Enzyme (ALT/AST Ratio) Calculator',
    slug: 'liver-enzyme-alt-ast-ratio-calculator',
    description: 'Evaluate organ function together.',
  },
  {
    name: 'Kidney Function Creatinine Clearance (CrCl) Calculator',
    slug: 'kidney-function-creatinine-clearance-crcl-calculator',
    description: 'Monitor complete metabolic panel.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/thyroid-function-tsh-t3-t4-balance-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Thyroid Function TSH/T3/T4 Balance Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Thyroid Function TSH/T3/T4 Balance Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate thyroid function TSH/T3/T4 balance from TSH level, T3 level, T4 level, and age.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const tshLevel = values.tshLevel;
  
  // Estimate T3 and T4 if not provided
  let t3Level: number;
  let t4Level: number;
  
  if (values.t3Level && values.t4Level) {
    t3Level = values.t3Level;
    t4Level = values.t4Level;
  } else {
    // Estimate based on TSH (inverse relationship)
    // Normal TSH: 0.4-4.0, optimal: 1.0-2.5
    // Normal T3: 80-200 ng/dL, T4: 5-12 Î¼g/dL
    if (tshLevel < 0.4) {
      // Hyperthyroidism - high T3/T4
      t3Level = values.t3Level || 180;
      t4Level = values.t4Level || 11;
    } else if (tshLevel > 4.0) {
      // Hypothyroidism - low T3/T4
      t3Level = values.t3Level || 100;
      t4Level = values.t4Level || 6;
    } else {
      // Normal range
      t3Level = values.t3Level || 140;
      t4Level = values.t4Level || 8.5;
    }
  }
  
  // Calculate balance score (0-100)
  let balanceScore = 50;
  
  // TSH component (0-40 points)
  if (tshLevel >= 1.0 && tshLevel <= 2.5) {
    balanceScore += 30; // Optimal range
  } else if (tshLevel >= 0.4 && tshLevel <= 4.0) {
    balanceScore += 15; // Normal range
  } else if (tshLevel < 0.4) {
    balanceScore -= 20; // Hyperthyroidism
  } else if (tshLevel > 4.0 && tshLevel <= 10) {
    balanceScore -= 15; // Hypothyroidism
  } else {
    balanceScore -= 30; // Severe imbalance
  }
  
  // T3 component (0-30 points)
  if (t3Level >= 80 && t3Level <= 200) {
    balanceScore += 25; // Normal range
  } else if (t3Level >= 70 && t3Level <= 220) {
    balanceScore += 10; // Slightly outside normal
  } else {
    balanceScore -= 15; // Abnormal
  }
  
  // T4 component (0-30 points)
  if (t4Level >= 5 && t4Level <= 12) {
    balanceScore += 25; // Normal range
  } else if (t4Level >= 4 && t4Level <= 13) {
    balanceScore += 10; // Slightly outside normal
  } else {
    balanceScore -= 15; // Abnormal
  }
  
  balanceScore = clamp(balanceScore, 0, 100);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your thyroid function appears optimal. Continue maintaining healthy thyroid function.';

  if (tshLevel < 0.1 || tshLevel > 10 || balanceScore < 30) {
    status = 'low';
    interpretation = 'Your thyroid function is significantly imbalanced. Consult a healthcare provider immediately for evaluation and management.';
  } else if (tshLevel < 0.4 || tshLevel > 4.0 || balanceScore < 50) {
    status = 'moderate';
    interpretation = 'Your thyroid function is outside optimal range. Monitor closely and consult healthcare provider for guidance.';
  } else if (balanceScore < 70) {
    status = 'good';
    interpretation = 'Your thyroid function is good. Continue maintaining healthy lifestyle to support thyroid health.';
  }

  const recommendations = [
    'Ensure adequate iodine intake through diet (seafood, iodized salt, dairy) or supplements as recommended, as iodine is essential for thyroid hormone production.',
    'Manage stress and maintain healthy lifestyle, as stress and other factors can affect thyroid function and hormone balance.',
    'Follow healthcare provider recommendations for thyroid medication if prescribed, and have regular thyroid function monitoring.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Consult a healthcare provider for comprehensive thyroid function evaluation, including additional tests and appropriate treatment if needed.');
  }
  if (tshLevel > 4.0) {
    recommendations.push('If hypothyroidism is diagnosed, thyroid hormone replacement therapy may be needed. Follow healthcare provider guidance for treatment.');
  }
  if (tshLevel < 0.4) {
    recommendations.push('If hyperthyroidism is diagnosed, treatment to reduce thyroid function may be needed. Follow healthcare provider guidance for management.');
  }

  const plan = [
    { label: 'This Week', detail: 'Review thyroid function test results for TSH, T3, and T4 levels. Assess thyroid function balance and status.' },
    { label: 'This Month', detail: 'Implement lifestyle changes: ensure adequate iodine intake, manage stress, and follow healthcare provider recommendations for thyroid health.' },
    { label: 'Ongoing', detail: 'Monitor thyroid function regularly through healthcare provider. Address any persistent imbalances with medical guidance and appropriate treatment.' },
  ];

  return { tshLevel, t3Level, t4Level, balanceScore, status, interpretation, recommendations, plan };
};

export default function ThyroidFunctionTshT3T4BalanceCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tshLevel: undefined,
      t3Level: undefined,
      t4Level: undefined,
      age: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="thyroid-balance-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ZapIcon className="h-5 w-5" />
            Thyroid Function TSH/T3/T4 Balance Calculator
          </CardTitle>
          <CardDescription>Calculate thyroid function TSH/T3/T4 balance from TSH level, T3 level, T4 level, and age.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your thyroid function data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tshLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>TSH level (mIU/L)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 2.0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="t3Level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>T3 level (ng/dL) (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 140" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="t4Level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>T4 level (Î¼g/dL) (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 8.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                Calculate thyroid balance
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
            <CardDescription>See TSH/T3/T4 balance, thyroid function status, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">TSH level</p>
                <p className="text-2xl font-semibold text-primary">{result.tshLevel.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">mIU/L</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">T3 level</p>
                <p className="text-2xl font-semibold text-primary">{result.t3Level.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">ng/dL</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">T4 level</p>
                <p className="text-2xl font-semibold text-primary">{result.t4Level.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Î¼g/dL</p>
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
            <strong>Thyroid balance</strong> = assessed from TSH, T3, and T4 levels and their relationships.
          </p>
          <p>
            <strong>Normal ranges</strong>: TSH: 0.4-4.0 mIU/L (optimal: 1.0-2.5), T3: 80-200 ng/dL, T4: 5-12 Î¼g/dL. Ranges may vary by lab and individual factors.
          </p>
          <p>
            <strong>Thyroid function</strong>: High TSH indicates hypothyroidism (low function), low TSH indicates hyperthyroidism (high function). T3 and T4 levels reflect actual thyroid hormone production.
          </p>
          <p>Thyroid function balance is affected by autoimmune disease, iodine intake, medications, age, and other factors affecting thyroid or pituitary function.</p>
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
                <p className="text-sm text-muted-foreground">Target TSH</p>
                <p className="text-xl font-semibold text-primary">1.0-2.5 mIU/L</p>
                <p className="text-xs text-muted-foreground">Optimal range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Balance score</p>
                <p className="text-xl font-semibold text-primary">{result.balanceScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Thyroid status</p>
                <p className="text-xl font-semibold text-primary">
                  {(() => {
                    if (result.tshLevel < 0.4) return 'Hyperthyroid';
                    if (result.tshLevel > 4.0) return 'Hypothyroid';
                    return 'Normal';
                  })()}
                </p>
                <p className="text-xs text-muted-foreground">Based on TSH</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your thyroid function data to see additional insights.</p>
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
          <p>TSH, T3, and T4 are key thyroid hormones that regulate metabolism. TSH stimulates thyroid hormone production. High TSH indicates hypothyroidism, low TSH indicates hyperthyroidism. Normal TSH: 0.4-4.0 mIU/L, T3: 80-200 ng/dL, T4: 5-12 Î¼g/dL.</p>
          <p>Use this calculator to assess thyroid function TSH/T3/T4 balance from TSH level, T3 level (optional), T4 level (optional), and age.</p>
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
          <p>This tool calculates thyroid function TSH/T3/T4 balance from TSH level, T3 level (optional), T4 level (optional), and age.</p>
          <p>Outputs include TSH level, T3 level, T4 level, balance score, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


