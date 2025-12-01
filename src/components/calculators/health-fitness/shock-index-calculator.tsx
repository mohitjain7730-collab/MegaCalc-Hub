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
  heartRate: z.number({ invalid_type_error: 'Enter heart rate' }).min(30).max(220),
  systolicBp: z.number({ invalid_type_error: 'Enter systolic BP' }).min(40).max(250),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  heartRate: number;
  systolicBp: number;
  shockIndex: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter heart rate (beats per minute).',
  'Enter systolic blood pressure (mmHg).',
  'Review the shock index (SI = HR / SBP).',
  'Use SI to screen for hemodynamic instability and guide resuscitation.',
];

const faqs = [
  {
    question: 'What is the shock index?',
    answer:
      'Shock index (SI) is the ratio of heart rate to systolic blood pressure. It is a quick bedside screening tool for circulatory compromise.',
  },
  {
    question: 'What values are concerning?',
    answer:
      'SI <0.7 is considered normal in most adults. 0.7–0.9 is borderline, and SI ≥0.9 suggests increased risk of hemodynamic compromise. SI ≥1.0 is strongly associated with shock.',
  },
  {
    question: 'How is SI used clinically?',
    answer:
      'SI helps triage trauma, sepsis, GI bleed, and obstetric hemorrhage. It correlates with the need for transfusion, ICU admission, and mortality.',
  },
  {
    question: 'Does SI replace full assessment?',
    answer:
      'No. It complements vital signs, lactate, mental status, and ultrasound. Always interpret SI in clinical context.',
  },
  {
    question: 'Can SI be trended?',
    answer:
      'Yes. Serial SI measurements can track response to fluids, blood products, or vasopressors.',
  },
];

const relatedCalculators = [
  {
    name: 'Cardiac Index Calculator',
    slug: 'cardiac-index-calculator',
    description: 'Normalize cardiac output for patient size.',
  },
  {
    name: 'Body Surface Area by Du Bois Formula',
    slug: 'body-surface-area-du-bois-calculator',
    description: 'Compute BSA for indexed hemodynamic metrics.',
  },
  {
    name: 'Hydration Balance with Alcohol Intake Calculator',
    slug: 'hydration-balance-with-alcohol-intake-calculator',
    description: 'Track hydration status that influences perfusion.',
  },
  {
    name: 'Corrected QT Interval by Bazett & Fridericia Calculator',
    slug: 'corrected-qt-interval-bazett-fridericia-calculator',
    description: 'Monitor QTc when cardioactive drugs are used during resuscitation.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/shock-index-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Shock Index Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Shock Index Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Quickly compute the shock index (HR / SBP) to screen for hemodynamic instability.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const { heartRate, systolicBp } = values;
  const shockIndex = systolicBp > 0 ? heartRate / systolicBp : 0;

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Shock index is within the normal range (<0.7).';

  if (shockIndex >= 1.0) {
    status = 'low';
    interpretation = 'SI ≥1.0 strongly suggests shock; initiate aggressive evaluation and resuscitation.';
  } else if (shockIndex >= 0.9) {
    status = 'moderate';
    interpretation = 'SI 0.9–1.0 indicates increased risk. Assess perfusion and consider ICU-level monitoring.';
  } else if (shockIndex >= 0.7) {
    status = 'good';
    interpretation = 'SI 0.7–0.9 is borderline; monitor trends and correlate with other vitals.';
  }

  const recommendations = [
    'Correlate SI with mental status, capillary refill, urine output, lactate, and bedside ultrasound.',
    'Trend SI during resuscitation; a falling SI suggests improving hemodynamics.',
    'Combine SI with other scores (qSOFA, NEWS) for sepsis or trauma triage.',
  ];

  const plan = [
    { label: 'This Week', detail: 'Use SI to screen high-risk patients in triage, ED, ICU, or obstetric settings.' },
    {
      label: 'This Month',
      detail: 'Educate staff on SI thresholds and integrate into rapid response checklists.',
    },
    {
      label: 'Ongoing',
      detail: 'Trend SI alongside blood pressure and heart rate to evaluate therapy effectiveness.',
    },
  ];

  return { heartRate, systolicBp, shockIndex, status, interpretation, recommendations, plan };
};

export default function ShockIndexCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      heartRate: undefined,
      systolicBp: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script
        id="shock-index-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Shock Index Calculator
          </CardTitle>
          <CardDescription>Compute heart rate divided by systolic BP.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input vital signs</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="heartRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Heart rate (bpm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 110"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="systolicBp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Systolic BP (mmHg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 100"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate shock index
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
            <CardDescription>Shock index and interpretation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Shock index</p>
                <p className="text-2xl font-semibold text-primary">{result.shockIndex.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Heart rate / Systolic BP</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Heart rate</p>
                <p className="text-2xl font-semibold text-primary">{result.heartRate.toFixed(0)} bpm</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Systolic BP</p>
                <p className="text-2xl font-semibold text-primary">{result.systolicBp.toFixed(0)} mmHg</p>
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
            Formula details
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Shock Index</strong> = Heart Rate (bpm) / Systolic Blood Pressure (mmHg)
          </p>
          <p>It is dimensionless and provides a rapid assessment of cardiovascular compensation.</p>
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
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="text-xl font-semibold text-primary">
                  {result.shockIndex < 0.7 ? 'Normal' : result.shockIndex >= 1 ? 'High risk' : 'Borderline'}
                </p>
                <p className="text-xs text-muted-foreground">Quick interpretation</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Perfusion cue</p>
                <p className="text-xl font-semibold text-primary">Check lactate</p>
                <p className="text-xs text-muted-foreground">Pair SI with lactate/urine output</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Trend advice</p>
                <p className="text-xl font-semibold text-primary">Serial SI</p>
                <p className="text-xs text-muted-foreground">Repeat after interventions to gauge response</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter vital signs to see derived insights.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Guide: interpreting shock index</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Shock index is a simple ratio that can uncover early hemodynamic compromise even when blood pressure appears
            normal. It is especially useful in trauma, sepsis, GI bleed, and obstetric hemorrhage.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr>
                  <th className="border-b p-2 font-semibold">Shock index</th>
                  <th className="border-b p-2 font-semibold">Category</th>
                  <th className="border-b p-2 font-semibold">Clinical meaning</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-b p-2">&lt; 0.7</td>
                  <td className="border-b p-2">Normal</td>
                  <td className="border-b p-2">Generally reassuring, but trend with other vitals.</td>
                </tr>
                <tr>
                  <td className="border-b p-2">0.7–0.9</td>
                  <td className="border-b p-2">Borderline</td>
                  <td className="border-b p-2">May represent early compensation; monitor closely.</td>
                </tr>
                <tr>
                  <td className="border-b p-2">0.9–1.0</td>
                  <td className="border-b p-2">High risk</td>
                  <td className="border-b p-2">Associated with increased need for critical care and interventions.</td>
                </tr>
                <tr>
                  <td className="border-b p-2">&gt;= 1.0</td>
                  <td className="border-b p-2">Very high risk</td>
                  <td className="border-b p-2">Strongly suggests shock; rapid evaluation and resuscitation required.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Always interpret SI alongside mental status, skin perfusion, lactate, and urine output. Certain populations
            (athletes, beta-blocker users, pregnancy) may have different baselines.
          </p>
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
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>This tool calculates the shock index (heart rate / systolic blood pressure).</p>
          <p>Outputs include SI, qualitative status, recommendations, action plan, and supporting metrics.</p>
          <p>Use SI for rapid screening of hemodynamic instability in trauma, sepsis, obstetrics, and general medicine.</p>
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
    </div>
  );
}


