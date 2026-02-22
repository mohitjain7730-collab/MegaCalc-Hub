'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  creatinineLevel: z.number({ invalid_type_error: 'Enter creatinine level' }).min(0.3).max(10),
  age: z.number({ invalid_type_error: 'Enter age' }).min(1).max(100),
  gender: z.enum(['male', 'female'], { invalid_type_error: 'Select gender' }),
  weight: z.number({ invalid_type_error: 'Enter weight' }).min(30).max(300),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  creatinineLevel: number;
  creatinineClearance: number;
  clearancePercentage: number;
  clearanceScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter creatinine level (mg/dL) from blood test.',
  'Enter your age (creatinine clearance decreases with age).',
  'Select gender (clearance formulas differ for males and females).',
  'Enter weight (kg) for clearance calculation.',
  'Review creatinine clearance, kidney function status, and recommendations.',
];

const faqs = [
  {
    question: 'What is creatinine clearance?',
    answer:
      'Creatinine clearance (CrCl) estimates how well the kidneys filter creatinine from the blood. It is a measure of kidney function and glomerular filtration rate (GFR).',
  },
  {
    question: 'What are normal creatinine clearance values?',
    answer:
      'Normal CrCl ranges from 90-130 mL/min for men and 80-120 mL/min for women. Values below 60 mL/min may indicate kidney dysfunction. Values below 15 mL/min indicate severe kidney failure.',
  },
  {
    question: 'What is creatinine?',
    answer:
      'Creatinine is a waste product from muscle metabolism that is filtered by the kidneys. Elevated blood creatinine levels may indicate reduced kidney function.',
  },
  {
    question: 'What causes low creatinine clearance?',
    answer:
      'Low CrCl can result from chronic kidney disease, acute kidney injury, dehydration, medications, diabetes, hypertension, or other conditions affecting kidney function.',
  },
  {
    question: 'How is creatinine clearance calculated?',
    answer:
      'CrCl is calculated using the Cockcroft-Gault equation: CrCl = ((140 - age) Ã— weight Ã— gender factor) / (72 Ã— creatinine). Gender factor: 1.0 for men, 0.85 for women.',
  },
  {
    question: 'Does age affect creatinine clearance?',
    answer:
      'Yes. Creatinine clearance naturally decreases with age. Normal CrCl decreases by approximately 1 mL/min per year after age 40. Age is a key factor in the calculation.',
  },
  {
    question: 'What about gender differences?',
    answer:
      'Men typically have higher muscle mass and creatinine production, resulting in higher normal CrCl ranges. Women have lower normal ranges due to lower average muscle mass.',
  },
  {
    question: 'Can I track creatinine clearance at home?',
    answer:
      'Home CrCl tests are limited. Blood creatinine and calculated CrCl through healthcare providers provide accurate kidney function assessment. Regular monitoring is important for kidney health.',
  },
  {
    question: 'What about kidney disease stages?',
    answer:
      'Kidney disease is staged by eGFR/CrCl: Stage 1 (â‰¥90), Stage 2 (60-89), Stage 3 (30-59), Stage 4 (15-29), Stage 5 (&lt;15). Lower stages indicate more severe disease.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if CrCl is below 60 mL/min, if creatinine is elevated, if you have symptoms (swelling, fatigue, changes in urination), or if you have risk factors for kidney disease.',
  },
];

const relatedCalculators = [
  {
    name: 'Blood Urea Nitrogen (BUN) Ratio Calculator',
    slug: 'blood-urea-nitrogen-bun-ratio-calculator',
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

const baseUrl = 'https://mycalculating.com/health-fitness/kidney-function-creatinine-clearance-crcl-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Kidney Function Creatinine Clearance (CrCl) Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Kidney Function Creatinine Clearance (CrCl) Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate kidney function creatinine clearance from creatinine level, age, gender, and weight.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const creatinineLevel = values.creatinineLevel;
  
  // Cockcroft-Gault equation for creatinine clearance
  const genderFactor = values.gender === 'male' ? 1.0 : 0.85;
  const creatinineClearance = ((140 - values.age) * values.weight * genderFactor) / (72 * creatinineLevel);
  
  // Normal ranges: Men 90-130 mL/min, Women 80-120 mL/min
  const minNormal = values.gender === 'male' ? 90 : 80;
  const maxNormal = values.gender === 'male' ? 130 : 120;
  const midNormal = (minNormal + maxNormal) / 2;
  
  const clearancePercentage = ((creatinineClearance - minNormal) / (maxNormal - minNormal)) * 100;
  const clearanceScore = clamp(clearancePercentage, 0, 100);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your creatinine clearance appears optimal. Continue maintaining healthy kidney function.';

  if (creatinineClearance < 15) {
    status = 'low';
    interpretation = 'Your creatinine clearance is very low (Stage 5 kidney disease). This requires immediate medical attention and may indicate severe kidney failure.';
  } else if (creatinineClearance < 30) {
    status = 'low';
    interpretation = 'Your creatinine clearance is low (Stage 4 kidney disease). Consult a healthcare provider immediately for evaluation and management.';
  } else if (creatinineClearance < 60) {
    status = 'moderate';
    interpretation = 'Your creatinine clearance is reduced (Stage 3 kidney disease). Monitor closely and consult healthcare provider for guidance.';
  } else if (creatinineClearance < minNormal) {
    status = 'moderate';
    interpretation = 'Your creatinine clearance is below normal. Monitor kidney function and consult healthcare provider if concerns persist.';
  } else if (clearanceScore < 70) {
    status = 'good';
    interpretation = 'Your creatinine clearance is good. Continue maintaining healthy lifestyle to support kidney function.';
  }

  const recommendations = [
    'Stay well-hydrated to support kidney function. Adequate fluid intake helps kidneys filter waste products effectively.',
    'Manage blood pressure and blood sugar, as hypertension and diabetes are major causes of kidney disease and reduced kidney function.',
    'Review medications with healthcare provider, as some medications can affect kidney function or require dose adjustment based on CrCl.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Consult a healthcare provider for comprehensive kidney function evaluation, including additional tests and management strategies.');
  }
  if (creatinineClearance < 60) {
    recommendations.push('Consider dietary modifications (reduced protein, sodium, potassium) as recommended by healthcare provider for kidney health.');
  }

  const plan = [
    { label: 'This Week', detail: 'Review blood test results for creatinine level. Calculate creatinine clearance and assess kidney function status.' },
    { label: 'This Month', detail: 'Implement lifestyle changes: maintain hydration, manage blood pressure and diabetes, review medications with healthcare provider.' },
    { label: 'Ongoing', detail: 'Monitor kidney function regularly through healthcare provider. Address any persistent abnormalities with medical guidance and appropriate treatment.' },
  ];

  return { creatinineLevel, creatinineClearance, clearancePercentage, clearanceScore, status, interpretation, recommendations, plan };
};

export default function KidneyFunctionCreatinineClearanceCrclCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      creatinineLevel: undefined,
      age: undefined,
      gender: undefined,
      weight: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="crcl-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Kidney Function Creatinine Clearance (CrCl) Calculator
          </CardTitle>
          <CardDescription>Calculate kidney function creatinine clearance from creatinine level, age, gender, and weight.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your kidney function data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <select
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value as 'male' | 'female')}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 70" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate creatinine clearance
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
            <CardDescription>See creatinine clearance, kidney function status, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Creatinine level</p>
                <p className="text-2xl font-semibold text-primary">{result.creatinineLevel.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">mg/dL</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Creatinine clearance</p>
                <p className="text-2xl font-semibold text-primary">{result.creatinineClearance.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">mL/min</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Clearance percentage</p>
                <p className="text-2xl font-semibold text-primary">{result.clearancePercentage.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Of normal range</p>
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
            <strong>Creatinine clearance (Cockcroft-Gault)</strong> = ((140 - age) Ã— weight Ã— gender factor) / (72 Ã— creatinine).
          </p>
          <p>
            <strong>Gender factor</strong>: 1.0 for males, 0.85 for females.
          </p>
          <p>
            <strong>Normal ranges</strong>: Men: 90-130 mL/min, Women: 80-120 mL/min. Values below 60 mL/min indicate reduced kidney function. Values below 15 mL/min indicate severe kidney failure.
          </p>
          <p>Creatinine clearance estimates glomerular filtration rate (GFR) and kidney function. It decreases with age and is affected by kidney disease, medications, and other factors.</p>
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
                <p className="text-sm text-muted-foreground">Target CrCl (gender-based)</p>
                <p className="text-xl font-semibold text-primary">
                  {(() => {
                    const gender = form.getValues().gender;
                    return gender === 'male' ? '90-130 mL/min' : '80-120 mL/min';
                  })()}
                </p>
                <p className="text-xs text-muted-foreground">Normal range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Kidney disease stage</p>
                <p className="text-xl font-semibold text-primary">
                  {(() => {
                    const crcl = result.creatinineClearance;
                    if (crcl >= 90) return 'Stage 1';
                    if (crcl >= 60) return 'Stage 2';
                    if (crcl >= 30) return 'Stage 3';
                    if (crcl >= 15) return 'Stage 4';
                    return 'Stage 5';
                  })()}
                </p>
                <p className="text-xs text-muted-foreground">Based on CrCl</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Clearance score</p>
                <p className="text-xl font-semibold text-primary">{result.clearanceScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your kidney function data to see additional insights.</p>
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
          <p>Creatinine clearance (CrCl) estimates how well the kidneys filter creatinine from the blood, providing a measure of kidney function. Normal CrCl ranges from 90-130 mL/min for men and 80-120 mL/min for women.</p>
          <p>Use this calculator to assess creatinine clearance from creatinine level, age, gender, and weight using the Cockcroft-Gault equation.</p>
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
          <p>This tool calculates kidney function creatinine clearance from creatinine level, age, gender, and weight.</p>
          <p>Outputs include creatinine level, creatinine clearance, clearance percentage, clearance score, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

