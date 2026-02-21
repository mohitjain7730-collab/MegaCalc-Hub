'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Droplet, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  bunLevel: z.number({ invalid_type_error: 'Enter BUN level' }).min(2).max(100),
  creatinineLevel: z.number({ invalid_type_error: 'Enter creatinine level' }).min(0.3).max(10),
  bunCreatinineRatio: z.number({ invalid_type_error: 'Enter BUN/creatinine ratio' }).min(5).max(30).optional(),
  age: z.number({ invalid_type_error: 'Enter age' }).min(1).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  bunLevel: number;
  creatinineLevel: number;
  bunCreatinineRatio: number;
  ratioScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter BUN (blood urea nitrogen) level (mg/dL) from blood test.',
  'Enter creatinine level (mg/dL) from blood test.',
  'Optionally enter BUN/creatinine ratio if calculated.',
  'Enter your age (BUN ranges can vary by age).',
  'Review BUN/creatinine ratio, kidney function status, and recommendations.',
];

const faqs = [
  {
    question: 'What is BUN?',
    answer:
      'BUN (blood urea nitrogen) is a waste product from protein metabolism that is filtered by the kidneys. Elevated BUN may indicate kidney dysfunction, dehydration, or high protein intake.',
  },
  {
    question: 'What are normal BUN levels?',
    answer:
      'Normal BUN ranges from 7-20 mg/dL for adults. Values outside this range may indicate kidney dysfunction, dehydration, high protein intake, or other conditions.',
  },
  {
    question: 'What is the BUN/creatinine ratio?',
    answer:
      'The BUN/creatinine ratio helps distinguish between different causes of elevated BUN. Normal ratio is typically 10-20:1. Higher ratios may indicate dehydration or prerenal causes.',
  },
  {
    question: 'What causes elevated BUN?',
    answer:
      'Elevated BUN can result from kidney dysfunction, dehydration, high protein intake, gastrointestinal bleeding, heart failure, or medications affecting kidney function.',
  },
  {
    question: 'What causes low BUN?',
    answer:
      'Low BUN can result from low protein intake, liver disease, malnutrition, overhydration, or pregnancy. It is less common than elevated BUN.',
  },
  {
    question: 'What does a high BUN/creatinine ratio mean?',
    answer:
      'A ratio greater than 20:1 may suggest dehydration, prerenal azotemia, gastrointestinal bleeding, or high protein intake. It helps distinguish prerenal from renal causes.',
  },
  {
    question: 'What does a low BUN/creatinine ratio mean?',
    answer:
      'A ratio less than 10:1 may suggest low protein intake, liver disease, malnutrition, or overhydration. It is less common and may indicate different underlying conditions.',
  },
  {
    question: 'Does age affect BUN?',
    answer:
      'BUN levels can vary slightly with age. Older adults may have slightly different normal ranges. Age-specific reference ranges are important for accurate interpretation.',
  },
  {
    question: 'Can I track BUN at home?',
    answer:
      'Home BUN tests are limited. Blood tests through healthcare providers provide accurate BUN measurements. Regular monitoring is important for kidney health.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if BUN is elevated, if BUN/creatinine ratio is abnormal, if you have symptoms (fatigue, swelling, changes in urination), or if you have risk factors for kidney disease.',
  },
];

const relatedCalculators = [
  {
    name: 'Kidney Function Creatinine Clearance (CrCl) Calculator',
    slug: 'kidney-function-creatinine-clearance-crcl-calculator',
    description: 'Assess kidney function comprehensively.',
  },
  {
    name: 'Liver Enzyme (ALT/AST Ratio) Calculator',
    slug: 'liver-enzyme-alt-ast-ratio-calculator',
    description: 'Monitor organ function together.',
  },
  {
    name: 'Hemoglobin (Hb) Level Estimator',
    slug: 'hemoglobin-hb-level-estimator',
    description: 'Evaluate metabolic health components.',
  },
  {
    name: 'Iron Deficiency Anemia Risk Calculator',
    slug: 'iron-deficiency-anemia-risk-calculator',
    description: 'Track nutrition that affects organ health.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/blood-urea-nitrogen-bun-ratio-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Blood Urea Nitrogen (BUN) Ratio Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Blood Urea Nitrogen (BUN) Ratio Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate blood urea nitrogen BUN ratio from BUN level, creatinine level, BUN/creatinine ratio, and age.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const bunLevel = values.bunLevel;
  const creatinineLevel = values.creatinineLevel;
  
  let bunCreatinineRatio: number;
  
  if (values.bunCreatinineRatio) {
    // Use provided ratio
    bunCreatinineRatio = values.bunCreatinineRatio;
  } else {
    // Calculate from levels
    bunCreatinineRatio = creatinineLevel > 0 ? bunLevel / creatinineLevel : 0;
  }
  
  // Normal ratio is typically 10-20:1
  // Calculate ratio score (0-100)
  let ratioScore = 50;
  
  // BUN level component
  if (bunLevel >= 7 && bunLevel <= 20) {
    ratioScore += 25; // Normal range
  } else if (bunLevel >= 5 && bunLevel <= 25) {
    ratioScore += 10; // Slightly outside normal
  } else {
    ratioScore -= 20; // Significantly abnormal
  }
  
  // Creatinine level component
  if (creatinineLevel >= 0.6 && creatinineLevel <= 1.2) {
    ratioScore += 15; // Normal range
  } else if (creatinineLevel >= 0.4 && creatinineLevel <= 1.5) {
    ratioScore += 5; // Slightly outside normal
  } else {
    ratioScore -= 15; // Significantly abnormal
  }
  
  // Ratio component
  if (bunCreatinineRatio >= 10 && bunCreatinineRatio <= 20) {
    ratioScore += 20; // Optimal ratio range
  } else if (bunCreatinineRatio > 20 && bunCreatinineRatio <= 25) {
    ratioScore -= 10; // Elevated but not critical
  } else if (bunCreatinineRatio > 25) {
    ratioScore -= 30; // Very high ratio
  } else if (bunCreatinineRatio < 10 && bunCreatinineRatio >= 5) {
    ratioScore -= 5; // Slightly low
  } else if (bunCreatinineRatio < 5) {
    ratioScore -= 20; // Very low ratio
  }
  
  ratioScore = clamp(ratioScore, 0, 100);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your BUN/creatinine ratio and levels appear optimal. Continue maintaining healthy kidney function.';

  if (bunLevel > 30 || bunCreatinineRatio > 25 || ratioScore < 30) {
    status = 'low';
    interpretation = 'Your BUN level or ratio is significantly abnormal. Consult a healthcare provider immediately for evaluation and management.';
  } else if (bunLevel > 20 || bunCreatinineRatio > 20 || ratioScore < 50) {
    status = 'moderate';
    interpretation = 'Your BUN level or ratio is outside optimal range. Monitor closely and consult healthcare provider for guidance.';
  } else if (ratioScore < 70) {
    status = 'good';
    interpretation = 'Your BUN levels and ratio are good. Continue maintaining healthy lifestyle to support kidney function.';
  }

  const recommendations = [
    'Stay well-hydrated to support kidney function and prevent dehydration, which can elevate BUN and BUN/creatinine ratio.',
    'Review protein intake. Very high protein intake can elevate BUN. Moderate protein intake is generally recommended for kidney health.',
    'Manage underlying conditions that affect kidney function: blood pressure, diabetes, heart failure, and other chronic conditions.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Consult a healthcare provider for comprehensive kidney function evaluation, including additional tests and management strategies.');
  }
  if (bunLevel > 20 || bunCreatinineRatio > 20) {
    recommendations.push('Address dehydration if present. Ensure adequate fluid intake and avoid excessive diuretics unless medically indicated.');
  }

  const plan = [
    { label: 'This Week', detail: 'Review blood test results for BUN and creatinine levels. Calculate BUN/creatinine ratio and assess kidney function status.' },
    { label: 'This Month', detail: 'Implement lifestyle changes: maintain hydration, moderate protein intake, manage underlying conditions, and follow healthcare provider guidance.' },
    { label: 'Ongoing', detail: 'Monitor BUN and kidney function regularly through healthcare provider. Address any persistent abnormalities with medical guidance and appropriate treatment.' },
  ];

  return { bunLevel, creatinineLevel, bunCreatinineRatio, ratioScore, status, interpretation, recommendations, plan };
};

export default function BloodUreaNitrogenBunRatioCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bunLevel: undefined,
      creatinineLevel: undefined,
      bunCreatinineRatio: undefined,
      age: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="bun-ratio-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplet className="h-5 w-5" />
            Blood Urea Nitrogen (BUN) Ratio Calculator
          </CardTitle>
          <CardDescription>Calculate blood urea nitrogen BUN ratio from BUN level, creatinine level, BUN/creatinine ratio, and age.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your BUN data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bunLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BUN level (mg/dL)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="creatinineLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Creatinine level (mg/dL)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 1.0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bunCreatinineRatio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BUN/creatinine ratio (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                Calculate BUN ratio
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
            <CardDescription>See BUN/creatinine ratio, kidney function status, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">BUN level</p>
                <p className="text-2xl font-semibold text-primary">{result.bunLevel.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">mg/dL</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Creatinine level</p>
                <p className="text-2xl font-semibold text-primary">{result.creatinineLevel.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">mg/dL</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">BUN/creatinine ratio</p>
                <p className="text-2xl font-semibold text-primary">{result.bunCreatinineRatio.toFixed(1)}</p>
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
            <strong>BUN/creatinine ratio</strong> = BUN level (mg/dL) / creatinine level (mg/dL).
          </p>
          <p>
            <strong>If ratio not provided</strong>: Calculated from BUN and creatinine levels from blood tests.
          </p>
          <p>
            <strong>Normal ranges</strong>: BUN: 7-20 mg/dL, Creatinine: 0.6-1.2 mg/dL (men), 0.5-1.1 mg/dL (women). Normal BUN/creatinine ratio is typically 10-20:1.
          </p>
          <p>BUN/creatinine ratio helps distinguish between prerenal and renal causes of elevated BUN. Elevated ratios may indicate dehydration or prerenal azotemia.</p>
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
                <p className="text-sm text-muted-foreground">Target BUN/creatinine ratio</p>
                <p className="text-xl font-semibold text-primary">10-20:1</p>
                <p className="text-xs text-muted-foreground">Normal range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Ratio score</p>
                <p className="text-xl font-semibold text-primary">{result.ratioScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">BUN status</p>
                <p className="text-xl font-semibold text-primary">
                  {result.bunLevel >= 7 && result.bunLevel <= 20 ? 'Normal' : result.bunLevel > 20 ? 'Elevated' : 'Low'}
                </p>
                <p className="text-xs text-muted-foreground">Based on level</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your BUN data to see additional insights.</p>
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
          <p>BUN (blood urea nitrogen) is a waste product from protein metabolism filtered by the kidneys. The BUN/creatinine ratio helps distinguish between prerenal and renal causes of elevated BUN. Normal BUN: 7-20 mg/dL, normal ratio: 10-20:1.</p>
          <p>Use this calculator to assess BUN/creatinine ratio from BUN level, creatinine level, BUN/creatinine ratio (optional), and age.</p>
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
          <p>This tool calculates blood urea nitrogen BUN ratio from BUN level, creatinine level, BUN/creatinine ratio (optional), and age.</p>
          <p>Outputs include BUN level, creatinine level, BUN/creatinine ratio, ratio score, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


