'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  cycleIrregularity: z.number({ invalid_type_error: 'Enter irregularity score' }).min(0).max(10),
  hirsutismScore: z.number({ invalid_type_error: 'Enter hirsutism score' }).min(0).max(10),
  acneSeverity: z.number({ invalid_type_error: 'Enter acne severity' }).min(0).max(10),
  weightGain: z.number({ invalid_type_error: 'Enter weight gain' }).min(0).max(10),
  insulinResistance: z.number({ invalid_type_error: 'Enter insulin resistance' }).min(0).max(10),
  moodChanges: z.number({ invalid_type_error: 'Enter mood changes' }).min(0).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  severityScore: number;
  pcosRisk: number;
  status: 'mild' | 'moderate' | 'severe';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Rate cycle irregularity (0 = regular, 10 = very irregular or absent periods).',
  'Rate hirsutism (excess hair growth) severity (0 = none, 10 = severe).',
  'Rate acne severity (0 = none, 10 = severe).',
  'Rate weight gain difficulty (0 = no issue, 10 = significant difficulty).',
  'Rate insulin resistance symptoms (0 = none, 10 = severe).',
  'Rate mood changes or depression (0 = stable, 10 = severe).',
  'Review PCOS symptom severity score, risk level, and management recommendations.',
];

const faqs = [
  {
    question: 'What is PCOS?',
    answer:
      'Polycystic Ovary Syndrome (PCOS) is a hormonal disorder affecting 5-10% of women. Symptoms include irregular periods, excess androgen (hirsutism, acne), and often insulin resistance.',
  },
  {
    question: 'How is PCOS diagnosed?',
    answer:
      'Diagnosis requires 2 of 3 criteria: irregular/absent periods, high androgen levels (or symptoms), and polycystic ovaries on ultrasound. Blood tests and imaging are needed.',
  },
  {
    question: 'Is this a medical diagnosis?',
    answer:
      'No. This is an educational tool. Only healthcare providers can diagnose PCOS through medical evaluation, blood tests, and imaging.',
  },
  {
    question: 'What causes PCOS?',
    answer:
      'The exact cause is unknown, but genetics, insulin resistance, and hormonal imbalances play roles. Lifestyle factors can worsen symptoms.',
  },
  {
    question: 'Can PCOS be cured?',
    answer:
      'PCOS cannot be cured, but symptoms can be managed with lifestyle changes (diet, exercise), medications (metformin, birth control), and other treatments.',
  },
  {
    question: 'How does diet help?',
    answer:
      'A low-glycemic, anti-inflammatory diet can improve insulin resistance, support weight management, and reduce PCOS symptoms. Consult a dietitian for personalized plans.',
  },
  {
    question: 'Does exercise help?',
    answer:
      'Yes. Regular exercise improves insulin sensitivity, supports weight management, and can help regulate cycles. Aim for 150+ minutes/week of moderate activity.',
  },
  {
    question: 'Can I get pregnant with PCOS?',
    answer:
      'Yes, but it may be more challenging. Many women with PCOS conceive with lifestyle changes, medications (clomiphene, letrozole), or fertility treatments.',
  },
  {
    question: 'What about mental health?',
    answer:
      'PCOS is linked to higher rates of depression and anxiety. Mental health support, stress management, and treatment are important parts of PCOS care.',
  },
  {
    question: 'When should I see a doctor?',
    answer:
      'See a healthcare provider if you have irregular periods, excess hair growth, severe acne, unexplained weight gain, or other PCOS symptoms for evaluation and treatment.',
  },
];

const relatedCalculators = [
  {
    name: 'Estrogen Dominance Risk Calculator',
    slug: 'estrogen-dominance-risk-calculator',
    description: 'Assess hormonal balance factors that may relate to PCOS.',
  },
  {
    name: 'Progesterone-to-Estrogen Ratio Calculator',
    slug: 'progesterone-to-estrogen-ratio-calculator',
    description: 'Track hormone ratios that may be affected by PCOS.',
  },
  {
    name: 'BMI Calculator',
    slug: 'bmi-calculator',
    description: 'Track BMI as weight management is important for PCOS.',
  },
  {
    name: 'Stress Hormone Balance Calculator',
    slug: 'stress-hormone-balance-calculator',
    description: 'Monitor stress and cortisol that can affect PCOS symptoms.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/pcos-symptom-severity-score-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'PCOS Symptom Severity Score Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'PCOS Symptom Severity Score Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Assess PCOS symptom severity score and risk level from cycle irregularity, hirsutism, acne, weight, insulin resistance, and mood.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const cycleScore = (values.cycleIrregularity / 10) * 25; // 0-25 points
  const hirsutismScore = (values.hirsutismScore / 10) * 20; // 0-20 points
  const acneScore = (values.acneSeverity / 10) * 15; // 0-15 points
  const weightScore = (values.weightGain / 10) * 15; // 0-15 points
  const insulinScore = (values.insulinResistance / 10) * 15; // 0-15 points
  const moodScore = (values.moodChanges / 10) * 10; // 0-10 points
  
  const severityScore = clamp(cycleScore + hirsutismScore + acneScore + weightScore + insulinScore + moodScore, 0, 100);
  const pcosRisk = severityScore;

  let status: ResultPayload['status'] = 'mild';
  let interpretation = 'PCOS symptoms appear mild. Continue monitoring and maintain healthy lifestyle habits.';

  if (severityScore >= 60) {
    status = 'severe';
    interpretation = 'PCOS symptoms appear severe. Consult a healthcare provider for comprehensive evaluation and treatment plan.';
  } else if (severityScore >= 40) {
    status = 'moderate';
    interpretation = 'PCOS symptoms appear moderate. Consider lifestyle changes and discuss with a healthcare provider for management strategies.';
  }

  const recommendations = [
    'Consult a healthcare provider for proper PCOS diagnosis through blood tests, imaging, and medical evaluation.',
    'Adopt a low-glycemic, anti-inflammatory diet to improve insulin resistance and support weight management.',
    'Engage in regular exercise (150+ minutes/week) to improve insulin sensitivity and regulate cycles.',
  ];
  if (status === 'moderate' || status === 'severe') {
    recommendations.push('Consider medications (metformin, birth control) or other treatments as recommended by your healthcare provider.');
  }
  if (status === 'severe') {
    recommendations.push('Prioritize mental health support. PCOS is linked to higher rates of depression and anxiety—seek help if needed.');
  }

  const plan = [
    { label: 'This Week', detail: 'Document all symptoms and schedule an appointment with a healthcare provider for evaluation.' },
    { label: 'Next Month', detail: 'Implement lifestyle changes (diet, exercise) while working with healthcare provider on treatment plan.' },
    { label: 'Ongoing', detail: 'Continue monitoring symptoms, follow treatment plan, and adjust lifestyle habits as needed for long-term management.' },
  ];

  return { severityScore, pcosRisk, status, interpretation, recommendations, plan };
};

export default function PCOSSymptomSeverityScoreCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cycleIrregularity: undefined,
      hirsutismScore: undefined,
      acneSeverity: undefined,
      weightGain: undefined,
      insulinResistance: undefined,
      moodChanges: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="pcos-severity-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            PCOS Symptom Severity Score Calculator
          </CardTitle>
          <CardDescription>Assess PCOS symptom severity score and risk level from cycle irregularity, hirsutism, acne, weight, insulin resistance, and mood.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your PCOS symptoms</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cycleIrregularity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cycle irregularity (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hirsutismScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hirsutism (excess hair) (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="acneSeverity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Acne severity (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="weightGain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight gain difficulty (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="insulinResistance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insulin resistance (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="moodChanges"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mood changes (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate severity score
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
            <CardDescription>See PCOS symptom severity score, risk level, and management recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Severity score</p>
                <p className="text-2xl font-semibold text-primary">{result.severityScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">PCOS risk</p>
                <p className="text-2xl font-semibold text-primary">{result.pcosRisk.toFixed(0)}</p>
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
          <p><strong>Severity score</strong> = cycle irregularity (0-25) + hirsutism (0-20) + acne (0-15) + weight gain (0-15) + insulin resistance (0-15) + mood changes (0-10), max 100.</p>
          <p><strong>PCOS risk</strong> = severity score (same calculation).</p>
          <p><strong>Status</strong>: &lt;40 = mild, 40-60 = moderate, &gt;60 = severe.</p>
          <p>Higher scores across multiple symptoms indicate more severe PCOS presentation requiring medical evaluation and treatment.</p>
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
                <p className="text-sm text-muted-foreground">Primary symptoms</p>
                <p className="text-xl font-semibold text-primary">
                  {form.getValues().cycleIrregularity >= 7 ? 'Cycle issues' : form.getValues().hirsutismScore >= 7 ? 'Hirsutism' : form.getValues().acneSeverity >= 7 ? 'Acne' : 'Mixed'}
                </p>
                <p className="text-xs text-muted-foreground">Most prominent</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Metabolic factors</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().weightGain ?? 0) + (form.getValues().insulinResistance ?? 0)) >= 10 ? 'High' : 'Moderate'}
                </p>
                <p className="text-xs text-muted-foreground">Weight + insulin</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Management priority</p>
                <p className="text-xl font-semibold text-primary">
                  {result.severityScore >= 60 ? 'High' : result.severityScore >= 40 ? 'Moderate' : 'Low'}
                </p>
                <p className="text-xs text-muted-foreground">Based on severity</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your PCOS symptoms to see additional insights.</p>
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
          <p>PCOS (Polycystic Ovary Syndrome) is a hormonal disorder affecting 5-10% of women. Symptoms include irregular periods, excess androgen (hirsutism, acne), and often insulin resistance.</p>
          <p>Use this calculator to assess symptom severity, identify risk factors, and get recommendations for lifestyle changes and medical treatment.</p>
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
          <p>This tool calculates PCOS symptom severity score and risk level from cycle irregularity, hirsutism, acne, weight gain difficulty, insulin resistance, and mood changes.</p>
          <p>Outputs include severity score, PCOS risk, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

