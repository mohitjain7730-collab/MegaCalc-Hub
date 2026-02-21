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
  altLevel: z.number({ invalid_type_error: 'Enter ALT level' }).min(5).max(500),
  astLevel: z.number({ invalid_type_error: 'Enter AST level' }).min(5).max(500),
  altAstRatio: z.number({ invalid_type_error: 'Enter ALT/AST ratio' }).min(0.1).max(5).optional(),
  age: z.number({ invalid_type_error: 'Enter age' }).min(1).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  altLevel: number;
  astLevel: number;
  altAstRatio: number;
  ratioScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter ALT (alanine aminotransferase) level (U/L) from liver function test.',
  'Enter AST (aspartate aminotransferase) level (U/L) from liver function test.',
  'Optionally enter ALT/AST ratio if calculated.',
  'Enter your age (liver enzyme ranges can vary by age).',
  'Review ALT/AST ratio, liver health status, and recommendations.',
];

const faqs = [
  {
    question: 'What are ALT and AST?',
    answer:
      'ALT (alanine aminotransferase) and AST (aspartate aminotransferase) are liver enzymes that indicate liver health. Elevated levels may indicate liver damage or disease.',
  },
  {
    question: 'What are normal ALT and AST levels?',
    answer:
      'Normal ALT: 7-56 U/L for men, 5-36 U/L for women. Normal AST: 10-40 U/L for men, 9-32 U/L for women. Ranges may vary by lab and individual factors.',
  },
  {
    question: 'What is the ALT/AST ratio?',
    answer:
      'The ALT/AST ratio helps distinguish between different types of liver disease. Normal ratio is typically less than 1.0. Higher ratios may indicate specific liver conditions.',
  },
  {
    question: 'What causes elevated liver enzymes?',
    answer:
      'Elevated ALT/AST can result from alcohol use, medications, viral hepatitis, fatty liver disease, autoimmune conditions, or other liver disorders. Non-liver causes include muscle injury.',
  },
  {
    question: 'What does a high ALT/AST ratio mean?',
    answer:
      'A ratio greater than 1.0 (ALT > AST) may suggest alcoholic liver disease, non-alcoholic fatty liver disease, or viral hepatitis. Interpretation depends on absolute levels and clinical context.',
  },
  {
    question: 'What does a low ALT/AST ratio mean?',
    answer:
      'A ratio less than 1.0 (AST > ALT) may suggest cirrhosis, alcoholic hepatitis, or other advanced liver disease. However, interpretation requires clinical correlation.',
  },
  {
    question: 'Does age affect liver enzymes?',
    answer:
      'Liver enzyme levels can vary slightly with age. Older adults may have slightly different normal ranges. Age-specific reference ranges are important for accurate interpretation.',
  },
  {
    question: 'Can I track liver enzymes at home?',
    answer:
      'Home liver enzyme tests are limited. Liver function tests (LFTs) through healthcare providers provide accurate ALT/AST measurements. Regular monitoring is important for liver health.',
  },
  {
    question: 'What about lifestyle factors?',
    answer:
      'Alcohol consumption, medications, obesity, and diet can affect liver enzymes. Reducing alcohol, maintaining healthy weight, and avoiding hepatotoxic substances support liver health.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if liver enzymes are elevated, if you have symptoms (jaundice, fatigue, abdominal pain), or if you have concerns about liver health or liver disease risk.',
  },
];

const relatedCalculators = [
  {
    name: 'Hemoglobin (Hb) Level Estimator',
    slug: 'hemoglobin-hb-level-estimator',
    description: 'Monitor complete metabolic panel components.',
  },
  {
    name: 'Kidney Function Creatinine Clearance (CrCl) Calculator',
    slug: 'kidney-function-creatinine-clearance-crcl-calculator',
    description: 'Assess organ function comprehensively.',
  },
  {
    name: 'Blood Urea Nitrogen (BUN) Ratio Calculator',
    slug: 'blood-urea-nitrogen-bun-ratio-calculator',
    description: 'Evaluate metabolic health together.',
  },
  {
    name: 'Iron Deficiency Anemia Risk Calculator',
    slug: 'iron-deficiency-anemia-risk-calculator',
    description: 'Track nutrition that affects organ health.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/liver-enzyme-alt-ast-ratio-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Liver Enzyme (ALT/AST Ratio) Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Liver Enzyme (ALT/AST Ratio) Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate liver enzyme ALT/AST ratio from ALT level, AST level, ALT/AST ratio, and age.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const altLevel = values.altLevel;
  const astLevel = values.astLevel;
  
  let altAstRatio: number;
  
  if (values.altAstRatio) {
    // Use provided ratio
    altAstRatio = values.altAstRatio;
  } else {
    // Calculate from levels
    altAstRatio = astLevel > 0 ? altLevel / astLevel : 0;
  }
  
  // Normal ratio is typically < 1.0
  // Calculate ratio score (0-100)
  let ratioScore = 50;
  
  // Both enzymes in normal range
  const altNormal = altLevel <= 56; // Upper limit for men
  const astNormal = astLevel <= 40; // Upper limit for men
  
  if (altNormal && astNormal) {
    ratioScore += 30;
  } else if (altLevel <= 100 && astLevel <= 80) {
    ratioScore += 15;
  } else {
    ratioScore -= 20;
  }
  
  // Ratio component
  if (altAstRatio >= 0.5 && altAstRatio <= 1.0) {
    ratioScore += 20; // Optimal ratio range
  } else if (altAstRatio > 1.0 && altAstRatio <= 2.0) {
    ratioScore -= 10; // Elevated but not critical
  } else if (altAstRatio > 2.0) {
    ratioScore -= 30; // Very high ratio
  } else if (altAstRatio < 0.5) {
    ratioScore -= 15; // Low ratio
  }
  
  ratioScore = clamp(ratioScore, 0, 100);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your ALT/AST ratio and liver enzyme levels appear optimal. Continue maintaining healthy liver habits.';

  if (altLevel > 100 || astLevel > 80 || ratioScore < 30) {
    status = 'low';
    interpretation = 'Your liver enzymes are significantly elevated or ratio is concerning. Consult a healthcare provider immediately for evaluation and management.';
  } else if (altLevel > 56 || astLevel > 40 || ratioScore < 50) {
    status = 'moderate';
    interpretation = 'Your liver enzymes are elevated or ratio is outside optimal range. Monitor closely and consult healthcare provider for guidance.';
  } else if (ratioScore < 70) {
    status = 'good';
    interpretation = 'Your liver enzyme levels and ratio are good. Continue maintaining healthy lifestyle to support liver health.';
  }

  const recommendations = [
    'Reduce or eliminate alcohol consumption, as alcohol is a major cause of elevated liver enzymes and liver damage.',
    'Maintain healthy weight and diet. Obesity and poor nutrition can contribute to fatty liver disease and elevated enzymes.',
    'Review medications with healthcare provider, as some medications can cause liver enzyme elevation and require monitoring.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Consult a healthcare provider for comprehensive liver function evaluation, including additional tests and imaging if needed.');
  }
  if (altLevel > 56 || astLevel > 40) {
    recommendations.push('Avoid hepatotoxic substances and follow healthcare provider recommendations for liver health management.');
  }

  const plan = [
    { label: 'This Week', detail: 'Review liver function test results for ALT and AST levels. Calculate ALT/AST ratio and assess liver health status.' },
    { label: 'This Month', detail: 'Implement lifestyle changes: reduce alcohol, maintain healthy weight, review medications, and follow healthcare provider guidance.' },
    { label: 'Ongoing', detail: 'Monitor liver enzymes regularly through healthcare provider. Address any persistent elevations with medical guidance and appropriate treatment.' },
  ];

  return { altLevel, astLevel, altAstRatio, ratioScore, status, interpretation, recommendations, plan };
};

export default function LiverEnzymeAltAstRatioCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      altLevel: undefined,
      astLevel: undefined,
      altAstRatio: undefined,
      age: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="alt-ast-ratio-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Liver Enzyme (ALT/AST Ratio) Calculator
          </CardTitle>
          <CardDescription>Calculate liver enzyme ALT/AST ratio from ALT level, AST level, ALT/AST ratio, and age.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your liver enzyme data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="altLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ALT level (U/L)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 25" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="astLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AST level (U/L)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 30" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="altAstRatio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ALT/AST ratio (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 0.83" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                Calculate ALT/AST ratio
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
            <CardDescription>See ALT/AST ratio, liver health status, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">ALT level</p>
                <p className="text-2xl font-semibold text-primary">{result.altLevel.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">U/L</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">AST level</p>
                <p className="text-2xl font-semibold text-primary">{result.astLevel.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">U/L</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">ALT/AST ratio</p>
                <p className="text-2xl font-semibold text-primary">{result.altAstRatio.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Ratio</p>
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
            <strong>ALT/AST ratio</strong> = ALT level (U/L) / AST level (U/L).
          </p>
          <p>
            <strong>If ratio not provided</strong>: Calculated from ALT and AST levels from liver function tests.
          </p>
          <p>
            <strong>Normal ranges</strong>: ALT: 7-56 U/L (men), 5-36 U/L (women). AST: 10-40 U/L (men), 9-32 U/L (women). Normal ALT/AST ratio is typically &lt; 1.0.
          </p>
          <p>ALT/AST ratio helps distinguish between different types of liver disease. Elevated enzymes and abnormal ratios may indicate liver damage or disease.</p>
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
                <p className="text-sm text-muted-foreground">Target ALT/AST ratio</p>
                <p className="text-xl font-semibold text-primary">&lt; 1.0</p>
                <p className="text-xs text-muted-foreground">Normal range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Ratio score</p>
                <p className="text-xl font-semibold text-primary">{result.ratioScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Enzyme elevation</p>
                <p className="text-xl font-semibold text-primary">
                  {(() => {
                    const altElevated = result.altLevel > 56;
                    const astElevated = result.astLevel > 40;
                    if (altElevated && astElevated) return 'Both elevated';
                    if (altElevated) return 'ALT elevated';
                    if (astElevated) return 'AST elevated';
                    return 'Normal';
                  })()}
                </p>
                <p className="text-xs text-muted-foreground">Status</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your liver enzyme data to see additional insights.</p>
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
          <p>ALT and AST are liver enzymes that indicate liver health. The ALT/AST ratio helps distinguish between different types of liver disease. Normal ratio is typically less than 1.0, with normal ALT: 7-56 U/L (men) and AST: 10-40 U/L (men).</p>
          <p>Use this calculator to assess ALT/AST ratio from ALT level, AST level, ALT/AST ratio (optional), and age.</p>
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
          <p>This tool calculates liver enzyme ALT/AST ratio from ALT level, AST level, ALT/AST ratio (optional), and age.</p>
          <p>Outputs include ALT level, AST level, ALT/AST ratio, ratio score, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


