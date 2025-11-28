'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Zap, Target, Activity, AlertCircle } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  psaLevel: z.number({ invalid_type_error: 'Enter PSA level' }).min(0).max(20),
  age: z.number({ invalid_type_error: 'Enter age' }).min(40).max(100),
  freePSA: z.number({ invalid_type_error: 'Enter free PSA' }).min(0).max(5).optional(),
  familyHistory: z.boolean().optional(),
  symptoms: z.number({ invalid_type_error: 'Enter symptoms score' }).min(0).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  healthScore: number;
  riskLevel: number;
  status: 'normal' | 'elevated' | 'high-risk';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your PSA (prostate-specific antigen) level (ng/mL) from blood test.',
  'Enter your age (PSA levels increase with age, normal ranges vary).',
  'Optionally enter free PSA level if available (helps assess cancer risk).',
  'Indicate if you have family history of prostate cancer.',
  'Rate urinary symptoms (0 = none, 10 = severe).',
  'Review prostate health score, risk level, and recommendations.',
];

const faqs = [
  {
    question: 'What is PSA?',
    answer:
      'PSA (prostate-specific antigen) is a protein produced by the prostate. Elevated levels may indicate prostate issues, including cancer, but can also be caused by benign conditions.',
  },
  {
    question: 'What is a normal PSA level?',
    answer:
      'Normal ranges vary by age: 40-49: <2.5 ng/mL, 50-59: <3.5 ng/mL, 60-69: <4.5 ng/mL, 70+: <6.5 ng/mL. Levels above these may warrant further evaluation.',
  },
  {
    question: 'Does high PSA mean cancer?',
    answer:
      'Not necessarily. High PSA can indicate prostate cancer, but also benign prostatic hyperplasia (BPH), prostatitis, or other conditions. Further testing is needed.',
  },
  {
    question: 'What is free PSA?',
    answer:
      'Free PSA is unbound PSA. A lower free PSA percentage (<25%) may indicate higher cancer risk. Free PSA helps assess risk when total PSA is elevated.',
  },
  {
    question: 'How does age affect PSA?',
    answer:
      'PSA naturally increases with age as the prostate grows. Age-specific ranges account for this. Rapid increases or very high levels warrant attention regardless of age.',
  },
  {
    question: 'Does family history matter?',
    answer:
      'Yes. Family history of prostate cancer increases risk. Men with a first-degree relative (father, brother) with prostate cancer have 2-3x higher risk.',
  },
  {
    question: 'What about symptoms?',
    answer:
      'Urinary symptoms (frequency, urgency, weak stream) can indicate BPH or other prostate issues. However, early prostate cancer often has no symptoms.',
  },
  {
    question: 'When should I get tested?',
    answer:
      'Screening recommendations vary. Generally, men 50+ (or 40+ with risk factors) should discuss PSA testing with their healthcare provider.',
  },
  {
    question: 'Can I lower PSA naturally?',
    answer:
      'Some lifestyle changes (diet, exercise, avoiding certain medications) may modestly affect PSA, but elevated levels require medical evaluation.',
  },
  {
    question: 'What if my PSA is high?',
    answer:
      'High PSA requires further evaluation: repeat testing, free PSA ratio, digital rectal exam, and possibly imaging or biopsy. Consult a urologist.',
  },
];

const relatedCalculators = [
  {
    name: 'Testosterone Deficiency Risk Calculator',
    slug: 'testosterone-deficiency-risk-calculator',
    description: 'Assess testosterone levels that may relate to prostate health.',
  },
  {
    name: 'Andropause Onset Risk Estimator',
    slug: 'andropause-onset-risk-estimator',
    description: 'Track age-related hormonal changes that affect prostate health.',
  },
  {
    name: 'BMI Calculator',
    slug: 'bmi-calculator',
    description: 'Track BMI as obesity may affect prostate health.',
  },
  {
    name: 'Exercise Recovery Score (HRV + Sleep Integration)',
    slug: 'exercise-recovery-score-hrv-sleep-integration',
    description: 'Monitor overall health and recovery for prostate support.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/prostate-health-score-psa-based-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Prostate Health Score (PSA-based) Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Prostate Health Score (PSA-based) Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate prostate health score and risk level from PSA level, age, free PSA, family history, and symptoms.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  // Age-specific normal ranges
  const ageRanges: Record<string, number> = {
    '40-49': 2.5,
    '50-59': 3.5,
    '60-69': 4.5,
    '70+': 6.5,
  };
  
  let normalPSA = 4.0; // Default
  if (values.age >= 40 && values.age < 50) normalPSA = 2.5;
  else if (values.age >= 50 && values.age < 60) normalPSA = 3.5;
  else if (values.age >= 60 && values.age < 70) normalPSA = 4.5;
  else if (values.age >= 70) normalPSA = 6.5;
  
  // PSA score (lower is better, 0-50 points)
  const psaRatio = values.psaLevel / normalPSA;
  let psaScore = 0;
  if (psaRatio <= 1) {
    psaScore = 0; // Normal
  } else if (psaRatio <= 1.5) {
    psaScore = 15; // Slightly elevated
  } else if (psaRatio <= 2) {
    psaScore = 30; // Moderately elevated
  } else {
    psaScore = 50; // Highly elevated
  }
  
  // Free PSA factor (if provided, lower free PSA % = higher risk)
  let freePSAScore = 0;
  if (values.freePSA) {
    const freePSAPercentage = (values.freePSA / values.psaLevel) * 100;
    if (freePSAPercentage < 15) {
      freePSAScore = 20; // High risk
    } else if (freePSAPercentage < 25) {
      freePSAScore = 10; // Moderate risk
    }
  }
  
  // Family history factor
  const familyHistoryScore = values.familyHistory ? 15 : 0;
  
  // Symptoms factor (higher symptoms = higher score, but less weight)
  const symptomsScore = clamp((values.symptoms / 10) * 15, 0, 15);
  
  const riskLevel = clamp(psaScore + freePSAScore + familyHistoryScore + symptomsScore, 0, 100);
  const healthScore = 100 - riskLevel; // Invert for health score

  let status: ResultPayload['status'] = 'normal';
  let interpretation = 'Your PSA level appears within normal range for your age. Continue regular monitoring as recommended by your healthcare provider.';

  if (riskLevel >= 50) {
    status = 'high-risk';
    interpretation = 'PSA level and risk factors suggest high risk. Consult a urologist promptly for further evaluation (repeat PSA, free PSA, exam, imaging).';
  } else if (riskLevel >= 30) {
    status = 'elevated';
    interpretation = 'PSA level is elevated or risk factors are present. Discuss with your healthcare provider about repeat testing and further evaluation.';
  }

  const recommendations = [
    'Follow up with your healthcare provider or urologist to discuss PSA results and next steps.',
    'Consider repeat PSA testing in 3-6 months if levels are borderline, as PSA can fluctuate.',
    'Maintain healthy lifestyle: balanced diet, regular exercise, and avoid excessive alcohol.',
  ];
  if (status === 'elevated') {
    recommendations.push('Discuss free PSA testing, digital rectal exam, and possibly imaging (ultrasound, MRI) with your healthcare provider.');
  }
  if (status === 'high-risk') {
    recommendations.push('Seek prompt evaluation by a urologist. High PSA may require biopsy or other diagnostic procedures to rule out cancer.');
  }

  const plan = [
    { label: 'This Week', detail: 'Review PSA results with healthcare provider. Discuss age-specific normal ranges and risk factors.' },
    { label: 'Next 3-6 Months', detail: 'Follow up with repeat PSA testing and additional evaluations as recommended by your healthcare provider.' },
    { label: 'Ongoing', detail: 'Continue regular prostate health monitoring (PSA, exams) as recommended based on your risk level and age.' },
  ];

  return { healthScore, riskLevel, status, interpretation, recommendations, plan };
};

export default function ProstateHealthScorePSABasedCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      psaLevel: undefined,
      age: undefined,
      freePSA: undefined,
      familyHistory: undefined,
      symptoms: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="prostate-health-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Prostate Health Score (PSA-based) Calculator
          </CardTitle>
          <CardDescription>Calculate prostate health score and risk level from PSA level, age, free PSA, family history, and symptoms.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your PSA and risk factors</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="psaLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PSA level (ng/mL)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 3.2" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                        <Input type="number" step="1" placeholder="e.g., 55" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="freePSA"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Free PSA (ng/mL) - optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 0.8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="familyHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Family history of prostate cancer?</FormLabel>
                      <FormControl>
                        <select
                          value={field.value === undefined ? '' : field.value ? 'yes' : 'no'}
                          onChange={(e) => field.onChange(e.target.value === 'yes' ? true : e.target.value === 'no' ? false : undefined)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                          <option value="">Not specified</option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="symptoms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Urinary symptoms (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate health score
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
            <CardDescription>See prostate health score, risk level, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Health score</p>
                <p className="text-2xl font-semibold text-primary">{result.healthScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100 (higher is better)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Risk level</p>
                <p className="text-2xl font-semibold text-primary">{result.riskLevel.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100 (lower is better)</p>
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
            <AlertCircle className="h-5 w-5" />
            Formula
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p><strong>Age-specific normal PSA</strong>: 40-49: 2.5, 50-59: 3.5, 60-69: 4.5, 70+: 6.5 ng/mL.</p>
          <p><strong>Risk level</strong> = PSA score (0-50) + free PSA score (0-20) + family history (0-15) + symptoms (0-15), max 100.</p>
          <p><strong>Health score</strong> = 100 − risk level.</p>
          <p>Higher PSA relative to age-specific normal, lower free PSA %, family history, and more symptoms increase risk level.</p>
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
                <p className="text-sm text-muted-foreground">PSA vs normal</p>
                <p className="text-xl font-semibold text-primary">
                  {(() => {
                    const age = form.getValues().age ?? 50;
                    const normal = age < 50 ? 2.5 : age < 60 ? 3.5 : age < 70 ? 4.5 : 6.5;
                    const psa = form.getValues().psaLevel ?? 0;
                    return psa <= normal ? 'Normal' : psa <= normal * 1.5 ? 'Slightly elevated' : psa <= normal * 2 ? 'Elevated' : 'Highly elevated';
                  })()}
                </p>
                <p className="text-xs text-muted-foreground">For your age</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Free PSA %</p>
                <p className="text-xl font-semibold text-primary">
                  {form.getValues().freePSA && form.getValues().psaLevel
                    ? ((form.getValues().freePSA! / form.getValues().psaLevel!) * 100).toFixed(1) + '%'
                    : 'Not provided'}
                </p>
                <p className="text-xs text-muted-foreground">Target: ≥25%</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Follow-up priority</p>
                <p className="text-xl font-semibold text-primary">
                  {result.riskLevel >= 50 ? 'High' : result.riskLevel >= 30 ? 'Moderate' : 'Routine'}
                </p>
                <p className="text-xs text-muted-foreground">Based on risk level</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your PSA and risk factors to see additional insights.</p>
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
          <p>PSA (prostate-specific antigen) is a protein produced by the prostate. Elevated levels may indicate prostate issues, including cancer, but can also be caused by benign conditions.</p>
          <p>Use this calculator to assess prostate health score from PSA level, age, free PSA, family history, and symptoms to guide monitoring and follow-up care.</p>
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
            <AlertCircle className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>This tool calculates prostate health score and risk level from PSA level, age, free PSA (optional), family history, and urinary symptoms.</p>
          <p>Outputs include health score, risk level, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

