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
  heightCm: z.number({ invalid_type_error: 'Enter height in cm' }).min(100).max(230),
  weightKg: z.number({ invalid_type_error: 'Enter weight in kg' }).min(20).max(250),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  heightCm: number;
  weightKg: number;
  bsa: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter body height in centimeters.',
  'Enter body weight in kilograms.',
  'Review the calculated body surface area (BSA) using the Du Bois formula.',
  'Use the interpretation to guide drug dosing, chemotherapy planning, or hemodynamic assessments.',
];

const faqs = [
  {
    question: 'What is the Du Bois formula?',
    answer:
      'The Du Bois & Du Bois formula (1916) estimates body surface area (BSA) using BSA = 0.007184 × height(cm)^0.725 × weight(kg)^0.425. Despite its age it remains widely used in clinical dosing.',
  },
  {
    question: 'Why is BSA important?',
    answer:
      'BSA is used to normalize physiological measurements (e.g., cardiac index) and to calculate safe doses for medications such as chemotherapy, anesthetics, and some antibiotics.',
  },
  {
    question: 'What is a typical adult BSA?',
    answer:
      'Average adult BSA is ~1.7 m². Values below 1.4 m² generally represent smaller individuals, whereas BSA above 2.2 m² is common in larger or very tall people.',
  },
  {
    question: 'Is Du Bois accurate for all patients?',
    answer:
      'It performs well for most adults but may be less accurate in extreme obesity, cachexia, or pediatric populations. Other formulas (Mosteller, Haycock) can be considered in those settings.',
  },
  {
    question: 'How often should I re-calculate BSA?',
    answer:
      'Recalculate whenever weight changes significantly (>5-10%) or before adjusting doses that depend on BSA, such as chemotherapy cycles.',
  },
];

const relatedCalculators = [
  {
    name: 'Cardiac Output (Q) Calculator',
    slug: 'cardiac-output-q-calculator',
    description: 'Calculate cardiac output for hemodynamic assessments.',
  },
  {
    name: 'Caloric Needs Calculator',
    slug: 'daily-calorie-needs-calculator',
    description: 'Estimate energy expenditure based on weight and activity.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/body-surface-area-du-bois-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Body Surface Area by Du Bois Formula', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Body Surface Area by Du Bois Formula',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate body surface area (BSA) using the classic Du Bois & Du Bois equation.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const { heightCm, weightKg } = values;

  const bsa = 0.007184 * Math.pow(heightCm, 0.725) * Math.pow(weightKg, 0.425);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'BSA is within the average adult range.';

  if (bsa < 1.4) {
    status = 'good';
    interpretation = 'BSA is on the lower side—doses based on BSA will scale accordingly. Verify weight entry for underweight individuals.';
  } else if (bsa > 2.2) {
    status = 'moderate';
    interpretation = 'BSA is elevated (common in tall/heavy individuals). Ensure dosing caps are respected, especially for chemotherapy.';
  }

  const recommendations = [
    'Confirm height and weight measurements before applying BSA to drug dosing or hemodynamic calculations.',
    'Document the formula used (Du Bois) so other clinicians can reproduce the value.',
    'Monitor for significant weight changes that would require a recalculation.',
  ];

  const plan = [
    {
      label: 'This Week',
      detail: 'Use this BSA value when normalizing cardiac output, medication doses, or fluid requirements.',
    },
    {
      label: 'This Month',
      detail: 'Reassess weight trends—5-10% changes warrant recalculating BSA for dosing accuracy.',
    },
    {
      label: 'Ongoing',
      detail: 'Track BSA alongside BMI and body composition when managing long-term therapies.',
    },
  ];

  return { heightCm, weightKg, bsa, status, interpretation, recommendations, plan };
};

export default function BodySurfaceAreaDuBoisCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      heightCm: undefined,
      weightKg: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script
        id="bsa-du-bois-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Body Surface Area by Du Bois Formula
          </CardTitle>
          <CardDescription>Estimate BSA for dosing and hemodynamic normalization.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input height and weight</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="heightCm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 175"
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
                  name="weightKg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 70"
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
                Calculate BSA
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
            <CardDescription>Body surface area estimate and interpretation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">BSA (Du Bois)</p>
                <p className="text-2xl font-semibold text-primary">{result.bsa.toFixed(2)} m²</p>
                <p className="text-xs text-muted-foreground">0.007184 × H^0.725 × W^0.425</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Height</p>
                <p className="text-2xl font-semibold text-primary">{result.heightCm.toFixed(1)} cm</p>
                <p className="text-xs text-muted-foreground">Entered value</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Weight</p>
                <p className="text-2xl font-semibold text-primary">{result.weightKg.toFixed(1)} kg</p>
                <p className="text-xs text-muted-foreground">Entered value</p>
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
            <strong>Du Bois BSA (m²)</strong> = 0.007184 × height(cm)<sup>0.725</sup> × weight(kg)<sup>0.425</sup>
          </p>
          <p>
            The exponents approximate the nonlinear relationship between body size and surface area. BSA is used to index
            cardiac output (cardiac index), renal function (GFR), and medication dosing.
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
          <CardTitle>Additional calculations</CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">BSA percentile guide</p>
                <p className="text-xl font-semibold text-primary">
                  {result.bsa < 1.4 ? 'Low' : result.bsa > 2.2 ? 'High' : 'Average'}
                </p>
                <p className="text-xs text-muted-foreground">Qualitative size category</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">BMI snapshot</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.weightKg / Math.pow(result.heightCm / 100, 2)).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Not a substitute for clinical BMI calculation</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Indexed CO tip</p>
                <p className="text-xl font-semibold text-primary">CI = CO / {result.bsa.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Use BSA to normalize cardiac output</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter height and weight to view derived metrics.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Guide: interpreting BSA values</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Body surface area is most often used to scale doses and normalize physiologic measurements. Average adult BSA
            is around 1.7 m², but there is wide normal variation by sex, height, and body composition.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr>
                  <th className="border-b p-2 font-semibold">BSA (m²)</th>
                  <th className="border-b p-2 font-semibold">Typical description</th>
                  <th className="border-b p-2 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-b p-2">&lt; 1.4</td>
                  <td className="border-b p-2">Small body size</td>
                  <td className="border-b p-2">Common in smaller adults; double-check dosing caps.</td>
                </tr>
                <tr>
                  <td className="border-b p-2">1.4–2.2</td>
                  <td className="border-b p-2">Typical adult</td>
                  <td className="border-b p-2">Most reference tables assume BSA in this range.</td>
                </tr>
                <tr>
                  <td className="border-b p-2">&gt; 2.2</td>
                  <td className="border-b p-2">Large/tall body size</td>
                  <td className="border-b p-2">Consider maximum dose limits, especially for chemotherapy.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Always pair BSA-based decisions with clinical judgement, renal/hepatic function, and institutional
            guidelines rather than relying on BSA alone.
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
          <p>This tool estimates body surface area (BSA) using the Du Bois & Du Bois formula.</p>
          <p>Outputs include BSA, qualitative interpretation, recommendations, an action plan, and derived metrics.</p>
          <p>Use BSA for medication dosing, fluid calculations, and normalizing physiologic measures such as cardiac output.</p>
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


