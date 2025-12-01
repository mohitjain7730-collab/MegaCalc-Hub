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
  qtInterval: z.number({ invalid_type_error: 'Enter QT interval' }).min(200).max(800),
  rrInterval: z.number({ invalid_type_error: 'Enter RR interval' }).min(300).max(2000),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  qtInterval: number;
  rrInterval: number;
  qtcBazett: number;
  qtcFridericia: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter QT interval (ms) from your ECG/EKG results.',
  'Enter RR interval (ms) from your ECG/EKG results.',
  'Review corrected QT intervals (Bazett and Fridericia), status, and recommendations.',
];

const faqs = [
  {
    question: 'What is corrected QT interval (QTc)?',
    answer:
      'QTc adjusts the QT interval for heart rate. The QT interval varies with heart rate, so correction formulas (Bazett and Fridericia) normalize QT to a standard heart rate (typically 60 bpm) for accurate interpretation. QTc helps assess risk of dangerous arrhythmias.',
  },
  {
    question: 'What are normal QTc values?',
    answer:
      'Normal QTc is typically <440 ms for men and <460 ms for women. QTc 440-470 ms (men) or 460-480 ms (women) is borderline. QTc >470 ms (men) or >480 ms (women) is prolonged and increases risk of dangerous arrhythmias like torsades de pointes.',
  },
  {
    question: 'What is the difference between Bazett and Fridericia formulas?',
    answer:
      'Bazett formula: QTc = QT / sqrt(RR). Fridericia formula: QTc = QT / cbrt(RR). Bazett tends to over-correct at high heart rates and under-correct at low heart rates. Fridericia is more accurate across a wider range of heart rates, especially at extremes.',
  },
  {
    question: 'Why is QTc important?',
    answer:
      "Prolonged QTc increases risk of torsades de pointes, a life-threatening ventricular arrhythmia. QTc helps identify patients at risk, guide medication choices (some drugs prolong QTc), and monitor cardiac safety. It's essential for ECG interpretation.",
  },
  {
    question: 'What causes prolonged QTc?',
    answer:
      'Prolonged QTc can result from medications (antiarrhythmics, antibiotics, antipsychotics), electrolyte abnormalities (low potassium, magnesium, calcium), congenital long QT syndrome, heart disease, or other conditions affecting cardiac repolarization.',
  },
  {
    question: 'What are the risks of prolonged QTc?',
    answer:
      'Prolonged QTc significantly increases risk of torsades de pointes, a polymorphic ventricular tachycardia that can cause syncope, seizures, or sudden cardiac death. Risk increases further when QTc exceeds 500 ms.',
  },
  {
    question: 'Which formula should I use?',
    answer:
      'Both formulas are commonly used. Bazett is more traditional but less accurate at extreme heart rates. Fridericia is often preferred for accuracy, especially at high or low heart rates. Many clinicians consider the longer (more conservative) QTc value.',
  },
  {
    question: 'Can QTc be too short?',
    answer:
      'Yes, short QTc (<350 ms) can also be abnormal and may indicate short QT syndrome, which increases risk of atrial and ventricular arrhythmias. Short QTc should be evaluated by a healthcare provider, especially if symptoms are present.',
  },
  {
    question: 'How is QTc used in clinical practice?',
    answer:
      'QTc is used to assess cardiac safety before starting QT-prolonging drugs, to monitor patients on such medications, to evaluate syncope or palpitations, and to screen for congenital long QT syndrome. It is a standard part of ECG interpretation.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      "Consult a healthcare provider if QTc is prolonged, if you have symptoms like palpitations or fainting, if you're taking QT-prolonging medications, or if you have a family history of sudden cardiac death.",
  },
];

const relatedCalculators = [
  {
    name: 'Cardiac Output (Q) Calculator',
    slug: 'cardiac-output-q-calculator',
    description: 'Assess cardiac function and output.',
  },
  {
    name: 'Target Heart Rate Calculator',
    slug: 'target-heart-rate-calculator',
    description: 'Calculate your target heart rate zones.',
  },
  {
    name: 'Pulse Pressure Analyzer',
    slug: 'pulse-pressure-analyzer',
    description: 'Evaluate cardiovascular health with pulse pressure.',
  },
  {
    name: 'Blood Pressure Risk Calculator',
    slug: 'blood-pressure-risk-calculator',
    description: 'Assess your blood pressure related cardiovascular risk.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/corrected-qt-interval-bazett-fridericia-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Corrected QT Interval by Bazett & Fridericia Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Corrected QT Interval by Bazett & Fridericia Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description:
        'Calculate corrected QT interval (QTc) using Bazett and Fridericia formulas from QT and RR intervals to assess cardiac repolarization and arrhythmia risk.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const qtInterval = values.qtInterval; // ms
  const rrInterval = values.rrInterval; // ms

  const rrSeconds = rrInterval / 1000; // convert to seconds

  const qtcBazett = rrSeconds > 0 ? qtInterval / Math.sqrt(rrSeconds) : 0;
  const qtcFridericia = rrSeconds > 0 ? qtInterval / Math.cbrt(rrSeconds) : 0;

  const qtcMax = Math.max(qtcBazett, qtcFridericia);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation =
    'Your QTc is within the typical reference range. Continue maintaining cardiovascular health with appropriate lifestyle and follow-up.';

  if (qtcMax > 500) {
    status = 'low';
    interpretation =
      'Your QTc is severely prolonged (>500 ms). This significantly increases the risk of torsades de pointes and requires urgent medical attention.';
  } else if (qtcMax > 480) {
    status = 'moderate';
    interpretation =
      'Your QTc is clearly prolonged. This increases arrhythmia risk and should be evaluated by a clinician, including a review of medications and electrolytes.';
  } else if (qtcMax > 470) {
    status = 'moderate';
    interpretation =
      'Your QTc is borderline prolonged. Further evaluation and monitoring are recommended, especially if you are taking QT-prolonging medications.';
  } else if (qtcMax < 350) {
    status = 'good';
    interpretation =
      'Your QTc is shorter than usual (<350 ms). This can be normal in some people but may be associated with short QT syndrome in others, warranting medical review.';
  }

  const recommendations: string[] = [
    'Discuss these QTc values with a healthcare provider, especially if they are prolonged or if you have cardiac symptoms.',
    'Review all current medications (including over-the-counter and supplements) with a clinician to identify any that may prolong QT.',
    'Ensure adequate intake and monitoring of key electrolytes (potassium, magnesium, calcium) as imbalances can affect QTc.',
  ];

  if (qtcMax > 480) {
    recommendations.push(
      'Avoid starting new QT-prolonging medications unless clearly necessary and under close medical supervision.'
    );
  }

  if (qtcMax > 500) {
    recommendations.push('Seek urgent medical care if you develop fainting, palpitations, or seizures.');
  }

  if (qtcMax < 350) {
    recommendations.push(
      'If QTc is very short and you have a personal or family history of arrhythmias or sudden death, ask about evaluation for short QT syndrome.'
    );
  }

  const plan = [
    {
      label: 'This Week',
      detail:
        'If QTc is outside the usual range, arrange a consultation with your healthcare provider and bring a copy of your ECG and medication list.',
    },
    {
      label: 'This Month',
      detail:
        'Work with your clinician to adjust medications, correct electrolyte disturbances, and repeat an ECG if recommended.',
    },
    {
      label: 'Ongoing',
      detail:
        'Maintain regular cardiac follow-up if you have persistent QTc abnormalities or are on QT-prolonging drugs, and promptly report new symptoms.',
    },
  ];

  return { qtInterval, rrInterval, qtcBazett, qtcFridericia, status, interpretation, recommendations, plan };
};

export default function CorrectedQTIntervalBazettFridericiaCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      qtInterval: undefined,
      rrInterval: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script
        id="qtc-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Corrected QT Interval by Bazett & Fridericia Calculator
          </CardTitle>
          <CardDescription>
            Calculate corrected QT interval (QTc) using Bazett and Fridericia formulas from QT and RR intervals.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your ECG values</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="qtInterval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>QT Interval (ms)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 400"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rrInterval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RR Interval (ms)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 1000"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate QTc
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
            <CardDescription>See QTc values and interpretation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">QTc (Bazett)</p>
                <p className="text-2xl font-semibold text-primary">{result.qtcBazett.toFixed(1)} ms</p>
                <p className="text-xs text-muted-foreground">Bazett formula</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">QTc (Fridericia)</p>
                <p className="text-2xl font-semibold text-primary">{result.qtcFridericia.toFixed(1)} ms</p>
                <p className="text-xs text-muted-foreground">Fridericia formula</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">QT Interval</p>
                <p className="text-2xl font-semibold text-primary">{result.qtInterval} ms</p>
                <p className="text-xs text-muted-foreground">Measured</p>
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
            <strong>QTc (Bazett)</strong> = QT / sqrt(RR in seconds)
          </p>
          <p>
            <strong>QTc (Fridericia)</strong> = QT / cbrt(RR in seconds)
          </p>
          <p>
            These formulas correct the QT interval for heart rate so values can be compared across different heart
            rates. Prolonged QTc increases risk of torsades de pointes and other ventricular arrhythmias.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>QTc reference ranges & quick guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            QTc should always be interpreted in clinical context, but the table below gives commonly used reference
            ranges for adults.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr>
                  <th className="border-b p-2 font-semibold">QTc value (ms)</th>
                  <th className="border-b p-2 font-semibold">Typical label</th>
                  <th className="border-b p-2 font-semibold">Clinical comment</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-b p-2">&lt; 350</td>
                  <td className="border-b p-2">Short</td>
                  <td className="border-b p-2">Consider short QT syndrome if symptoms or family history are present.</td>
                </tr>
                <tr>
                  <td className="border-b p-2">350–440 (men)</td>
                  <td className="border-b p-2">Normal</td>
                  <td className="border-b p-2">Usual reference range for adult men.</td>
                </tr>
                <tr>
                  <td className="border-b p-2">350–460 (women)</td>
                  <td className="border-b p-2">Normal</td>
                  <td className="border-b p-2">Usual reference range for adult women.</td>
                </tr>
                <tr>
                  <td className="border-b p-2">440–470 (men)</td>
                  <td className="border-b p-2">Borderline</td>
                  <td className="border-b p-2">May be acceptable but warrants review, especially on QT-prolonging drugs.</td>
                </tr>
                <tr>
                  <td className="border-b p-2">460–480 (women)</td>
                  <td className="border-b p-2">Borderline</td>
                  <td className="border-b p-2">Slightly prolonged; interpret with symptoms, drugs and electrolytes.</td>
                </tr>
                <tr>
                  <td className="border-b p-2">&gt; 470 (men) / &gt; 480 (women)</td>
                  <td className="border-b p-2">Prolonged</td>
                  <td className="border-b p-2">Increased risk of torsades de pointes; evaluation recommended.</td>
                </tr>
                <tr>
                  <td className="border-b p-2">&gt; 500</td>
                  <td className="border-b p-2">Severely prolonged</td>
                  <td className="border-b p-2">High risk – urgent review and monitoring are usually required.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Heart rate, medications, electrolyte levels, congenital syndromes and structural heart disease all modify
            risk at a given QTc. This calculator provides an educational estimate and is not a substitute for formal ECG
            interpretation.
          </p>
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
          <p>
            This tool calculates corrected QT intervals (QTc) using Bazett and Fridericia formulas from QT and RR
            intervals.
          </p>
          <p>
            Outputs include QT interval, RR interval, both QTc values, a qualitative status, recommendations, and an
            action plan to support interpretation.
          </p>
          <p>
            The simplified layout mirrors other health calculators so humans or AI assistants can quickly understand the
            methodology.
          </p>
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


