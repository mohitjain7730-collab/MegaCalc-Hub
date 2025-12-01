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
  cardiacOutput: z.number({ invalid_type_error: 'Enter cardiac output' }).min(1).max(15),
  bodySurfaceArea: z.number({ invalid_type_error: 'Enter BSA' }).min(0.5).max(3.5),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  cardiacOutput: number;
  bodySurfaceArea: number;
  cardiacIndex: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter measured cardiac output (L/min) from thermodilution, Fick, or echocardiography.',
  'Enter body surface area (BSA, m²), e.g., from the Du Bois calculator.',
  'Review the calculated cardiac index (CI = CO / BSA).',
  'Use the interpretation to guide hemodynamic management.',
];

const faqs = [
  {
    question: 'What is cardiac index?',
    answer:
      'Cardiac index (CI) normalizes cardiac output to body surface area to account for patient size. It is expressed in L/min/m².',
  },
  {
    question: 'What is the normal range?',
    answer:
      'Typical CI is 2.5–4.0 L/min/m². Values <2.2 indicate low cardiac output states, while >4.0 may occur in hyperdynamic conditions.',
  },
  {
    question: 'How do I obtain cardiac output?',
    answer:
      'Cardiac output can be measured via thermodilution (PAC), indirect Fick, echocardiography (LVOT VTI), or noninvasive monitors.',
  },
  {
    question: 'Why normalize by BSA?',
    answer:
      'BSA-adjustment allows comparison between patients of different sizes and is crucial when titrating inotropes or mechanical support.',
  },
  {
    question: 'How often should I recalc CI?',
    answer:
      'Recalculate whenever cardiac output or BSA changes (e.g., after titrating inotropes, fluid resuscitation, or major weight change).',
  },
];

const relatedCalculators = [
  {
    name: 'Body Surface Area by Du Bois Formula',
    slug: 'body-surface-area-du-bois-calculator',
    description: 'Obtain BSA for CI, drug dosing, and hemodynamic indexing.',
  },
  {
    name: 'Cardiac Output (Q) Calculator',
    slug: 'cardiac-output-q-calculator',
    description: 'Estimate cardiac output from stroke volume and heart rate.',
  },
  {
    name: 'Shock Index Calculator',
    slug: 'shock-index-calculator',
    description: 'Screen for hemodynamic instability using HR and SBP.',
  },
  {
    name: 'Corrected QT Interval by Bazett & Fridericia Calculator',
    slug: 'corrected-qt-interval-bazett-fridericia-calculator',
    description: 'Monitor repolarization when titrating cardioactive drugs.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/cardiac-index-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Cardiac Index Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Cardiac Index Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate cardiac index (CI) from cardiac output and body surface area.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const { cardiacOutput, bodySurfaceArea } = values;
  const cardiacIndex = bodySurfaceArea > 0 ? cardiacOutput / bodySurfaceArea : 0;

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Cardiac index is within the normal range (≈2.5–4.0 L/min/m²).';

  if (cardiacIndex < 2.2) {
    status = 'low';
    interpretation = 'Low CI (<2.2) suggests inadequate perfusion; evaluate preload, afterload, and contractility.';
  } else if (cardiacIndex < 2.5) {
    status = 'moderate';
    interpretation = 'CI is borderline; monitor closely and consider optimizing volume or inotropy.';
  } else if (cardiacIndex > 4.0) {
    status = 'good';
    interpretation = 'High CI (>4.0) indicates a hyperdynamic state (fever, sepsis, pregnancy) that needs context.';
  }

  const recommendations = [
    'Confirm cardiac output measurement method and ensure BSA calculation accuracy.',
    'Trend CI alongside blood pressure, lactate, and urine output to guide therapy.',
    'Document hemodynamic interventions (fluids, inotropes, vasopressors) when repeating CI.',
  ];

  const plan = [
    { label: 'This Week', detail: 'Use CI to evaluate perfusion goals in shock, heart failure, or perioperative settings.' },
    {
      label: 'This Month',
      detail: 'Reassess CI after major therapy adjustments or weight changes affecting BSA.',
    },
    {
      label: 'Ongoing',
      detail: 'Integrate CI with echocardiography and invasive pressures for comprehensive hemodynamic management.',
    },
  ];

  return { cardiacOutput, bodySurfaceArea, cardiacIndex, status, interpretation, recommendations, plan };
};

export default function CardiacIndexCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cardiacOutput: undefined,
      bodySurfaceArea: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script
        id="cardiac-index-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Cardiac Index Calculator
          </CardTitle>
          <CardDescription>Normalize cardiac output by body surface area.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input hemodynamic data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cardiacOutput"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cardiac output (L/min)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 5.2"
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
                  name="bodySurfaceArea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BSA (m²)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 1.85"
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
                Calculate cardiac index
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
            <CardDescription>CI value and qualitative assessment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Cardiac index</p>
                <p className="text-2xl font-semibold text-primary">{result.cardiacIndex.toFixed(2)} L/min/m²</p>
                <p className="text-xs text-muted-foreground">CI = CO / BSA</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Cardiac output</p>
                <p className="text-2xl font-semibold text-primary">{result.cardiacOutput.toFixed(1)} L/min</p>
                <p className="text-xs text-muted-foreground">Input value</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Body surface area</p>
                <p className="text-2xl font-semibold text-primary">{result.bodySurfaceArea.toFixed(2)} m²</p>
                <p className="text-xs text-muted-foreground">Input value</p>
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
            <strong>Cardiac Index (L/min/m²)</strong> = Cardiac Output (L/min) / Body Surface Area (m²)
          </p>
          <p>CI contextualizes cardiac output for patient size and is crucial when titrating inotropes or MCS devices.</p>
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
                <p className="text-sm text-muted-foreground">CI category</p>
                <p className="text-xl font-semibold text-primary">
                  {result.cardiacIndex < 2.2 ? 'Low' : result.cardiacIndex > 4 ? 'High' : 'Normal'}
                </p>
                <p className="text-xs text-muted-foreground">Quick qualitative label</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Perfusion tip</p>
                <p className="text-xl font-semibold text-primary">Check lactate</p>
                <p className="text-xs text-muted-foreground">Correlate CI with markers of perfusion (lactate, urine output)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">BSA reminder</p>
                <p className="text-xl font-semibold text-primary">Use latest weight</p>
                <p className="text-xs text-muted-foreground">Update BSA when body composition changes</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter cardiac output and BSA to view additional insights.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Guide: interpreting cardiac index</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Cardiac index normalizes flow for body size and is a central metric in shock and heart-failure management. It
            should be interpreted alongside blood pressure, lactate, mental status, and urine output.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr>
                  <th className="border-b p-2 font-semibold">CI (L/min/m²)</th>
                  <th className="border-b p-2 font-semibold">Category</th>
                  <th className="border-b p-2 font-semibold">Clinical note</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-b p-2">&lt; 2.2</td>
                  <td className="border-b p-2">Low</td>
                  <td className="border-b p-2">Linked to cardiogenic shock and poor perfusion; evaluate urgently.</td>
                </tr>
                <tr>
                  <td className="border-b p-2">2.2–2.5</td>
                  <td className="border-b p-2">Borderline</td>
                  <td className="border-b p-2">Monitor trends; optimize preload, afterload, and contractility.</td>
                </tr>
                <tr>
                  <td className="border-b p-2">2.5–4.0</td>
                  <td className="border-b p-2">Normal</td>
                  <td className="border-b p-2">Usual reference range in stable adults.</td>
                </tr>
                <tr>
                  <td className="border-b p-2">&gt; 4.0</td>
                  <td className="border-b p-2">High</td>
                  <td className="border-b p-2">Hyperdynamic states (sepsis, anemia, pregnancy) are common causes.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Measurement error (e.g., poor echo windows or thermodilution artifact) can significantly affect CI; repeat
            measurements and cross-check methods if values do not match the clinical picture.
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
          <p>This tool calculates cardiac index from cardiac output and body surface area.</p>
          <p>Outputs include the CI value, interpretation, recommendations, action plan, and supporting metrics.</p>
          <p>Use cardiac index to optimize perfusion targets in shock, heart failure, and perioperative care.</p>
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


