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
  sex: z.enum(['male', 'female'], { invalid_type_error: 'Select sex' }),
  heightCm: z.number({ invalid_type_error: 'Enter height' }).min(100).max(230),
  tidalPerKg: z.number({ invalid_type_error: 'Enter tidal volume per kg' }).min(4).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  sex: 'male' | 'female';
  heightCm: number;
  ibwKg: number;
  tidalPerKg: number;
  tidalVolumeMl: number;
  safeRangeLow: number;
  safeRangeHigh: number;
  interpretation: string;
  recommendations: string[];
};

const steps = [
  'Select patient sex (male or female).',
  'Enter height in centimeters.',
  'Enter desired tidal volume per kilogram of ideal body weight (e.g., 6 mL/kg for lung-protective ventilation).',
  'Review the calculated ideal body weight (IBW), tidal volume in milliliters, and recommended safe range.',
];

const faqs = [
  {
    question: 'What formula is used for Ideal Body Weight (IBW)?',
    answer:
      'This calculator uses the Devine formula: for males, IBW = 50 + 0.91 × (height in cm − 152.4); for females, IBW = 45.5 + 0.91 × (height in cm − 152.4).',
  },
  {
    question: 'Why is tidal volume based on ideal body weight instead of actual weight?',
    answer:
      'Lung size correlates more closely with height than actual body weight. Using ideal body weight helps avoid excessive tidal volumes in patients with obesity, which reduces the risk of ventilator-induced lung injury.',
  },
  {
    question: 'What tidal volume per kg is considered lung-protective?',
    answer:
      'Many ARDS and ICU protocols recommend 4–8 mL/kg of ideal body weight for lung-protective ventilation, commonly starting at 6 mL/kg and adjusting based on plateau pressure, compliance, and gas exchange.',
  },
  {
    question: 'Is this tool a substitute for clinical judgment?',
    answer:
      'No. It is an educational and planning tool. Ventilator settings must always be individualized and supervised by qualified clinicians.',
  },
];

const relatedCalculators = [
  {
    name: 'PaO2/FiO2 Ratio Calculator',
    slug: 'pao2-fio2-ratio-calculator',
    description: 'Assess oxygenation efficiency and ARDS severity using the P/F ratio.',
  },
  {
    name: 'Breathing Rate Efficiency Calculator',
    slug: 'breathing-rate-efficiency-calculator',
    description: 'Evaluate respiratory rate patterns and efficiency.',
  },
  {
    name: 'Oxygen Pulse Efficiency Calculator',
    slug: 'oxygen-pulse-efficiency-calculator',
    description: 'Estimate oxygen delivery per heartbeat.',
  },
  {
    name: 'Shock Index Calculator',
    slug: 'shock-index-calculator',
    description: 'Contextualize respiratory support within overall hemodynamic status.',
  },
];

const baseUrl =
  'https://mycalculating.com/category/health-fitness/tidal-volume-by-ideal-body-weight-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Health & Fitness',
          item: 'https://mycalculating.com/category/health-fitness',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Tidal Volume by Ideal Body Weight Calculator',
          item: baseUrl,
        },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Tidal Volume by Ideal Body Weight Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description:
        'Calculate ventilator tidal volume from ideal body weight using lung-protective ventilation targets.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateIBW = (sex: 'male' | 'female', heightCm: number): number => {
  const base = sex === 'male' ? 50 : 45.5;
  return Math.max(
    30,
    base + 0.91 * (heightCm - 152.4),
  );
};

const calculateResult = (values: FormValues): ResultPayload => {
  const { sex, heightCm, tidalPerKg } = values;
  const ibwKg = calculateIBW(sex, heightCm);
  const tidalVolumeMl = ibwKg * tidalPerKg;
  const safeRangeLow = ibwKg * 4;
  const safeRangeHigh = ibwKg * 8;

  let interpretation =
    'The calculated tidal volume is within the commonly used lung-protective range when interpreted with ideal body weight and clinical context.';

  if (tidalVolumeMl < safeRangeLow) {
    interpretation =
      'The selected tidal volume is below the typical 4–8 mL/kg lung-protective range. Very low volumes may cause hypoventilation if not balanced with sufficient respiratory rate and monitoring.';
  } else if (tidalVolumeMl > safeRangeHigh) {
    interpretation =
      'The selected tidal volume is above the typical 4–8 mL/kg lung-protective range. Higher tidal volumes may increase the risk of ventilator-induced lung injury.';
  }

  const recommendations: string[] = [
    'Confirm that ventilator settings also respect plateau pressure, driving pressure, and patient comfort.',
    'Reassess tidal volume when patient height, weight assumptions, or clinical status change.',
  ];

  if (tidalVolumeMl > safeRangeHigh) {
    recommendations.push(
      'Consider reducing tidal volume toward 6 mL/kg IBW and adjusting respiratory rate to maintain appropriate minute ventilation.',
    );
  }

  return {
    sex,
    heightCm,
    ibwKg,
    tidalPerKg,
    tidalVolumeMl,
    safeRangeLow,
    safeRangeHigh,
    interpretation,
    recommendations,
  };
};

export default function TidalVolumeIdealBodyWeightCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sex: undefined,
      heightCm: undefined,
      tidalPerKg: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script
        id="tidal-volume-ibw-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Tidal Volume by Ideal Body Weight Calculator
          </CardTitle>
          <CardDescription>
            Calculate ventilator tidal volume from ideal body weight using lung-protective ventilation targets.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input patient data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="sex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sex</FormLabel>
                      <FormControl>
                        <select
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === '' ? (undefined as unknown as 'male' | 'female') : (e.target.value as 'male' | 'female'),
                            )
                          }
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="">Select sex</option>
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
                  name="heightCm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 170"
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
                  name="tidalPerKg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tidal volume (mL/kg IBW)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="e.g., 6"
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
                Calculate tidal volume
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
              Results
            </CardTitle>
            <CardDescription>Review ideal body weight and calculated tidal volume.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Ideal body weight</p>
                <p className="text-2xl font-semibold text-primary">{result.ibwKg.toFixed(1)} kg</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Tidal volume setting</p>
                <p className="text-2xl font-semibold text-primary">
                  {result.tidalPerKg.toFixed(1)} mL/kg
                </p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Calculated tidal volume</p>
                <p className="text-2xl font-semibold text-primary">{result.tidalVolumeMl.toFixed(0)} mL</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Suggested range (4–8 mL/kg)</p>
                <p className="text-2xl font-semibold text-primary">
                  {result.safeRangeLow.toFixed(0)}–{result.safeRangeHigh.toFixed(0)} mL
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Interpretation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{result.interpretation}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
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
            <strong>Devine IBW (male)</strong> = 50 + 0.91 × (height in cm − 152.4)
          </p>
          <p>
            <strong>Devine IBW (female)</strong> = 45.5 + 0.91 × (height in cm − 152.4)
          </p>
          <p>
            <strong>Tidal volume</strong> = IBW (kg) × chosen tidal volume per kg (mL/kg)
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
                <p className="text-sm text-muted-foreground">Tidal volume at 4 mL/kg</p>
                <p className="text-xl font-semibold text-primary">
                  {result.safeRangeLow.toFixed(0)} mL
                </p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Tidal volume at 8 mL/kg</p>
                <p className="text-xl font-semibold text-primary">
                  {result.safeRangeHigh.toFixed(0)} mL
                </p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Difference from 6 mL/kg</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.tidalVolumeMl - result.ibwKg * 6).toFixed(0)} mL
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Enter patient data to see additional tidal volume comparisons.
            </p>
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

      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg"
        itemType="https://schema.org/MedicalWebPage"
      >
        <meta
          itemProp="name"
          content="Tidal Volume by Ideal Body Weight: Lung-Protective Ventilation Guide"
        />
        <meta
          itemProp="description"
          content="A practical guide to calculating tidal volume from ideal body weight (IBW), using lung-protective ventilation strategies in critical care and anesthesia."
        />
        <meta
          itemProp="keywords"
          content="tidal volume calculator, ideal body weight ventilation, lung protective ventilation, ARDS protocol, devine formula"
        />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/tidal-volume-ideal-body-weight-guide" />

        <h1
          className="text-3xl md:text-4xl font-extrabold text-foreground mb-4"
          itemProp="headline"
        >
          Tidal Volume by Ideal Body Weight: Understanding Lung-Protective Ventilation
        </h1>
        <p className="text-lg italic text-gray-700">
          Learn why tidal volume is calculated from ideal rather than actual body weight, how to apply the Devine
          formula, and how to use 4–8 mL/kg IBW targets in lung-protective ventilator strategies.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">
          Table of Contents: Jump to a Section
        </h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li>
            <a href="#ibw-basics" className="hover:underline">
              Why Ideal Body Weight Matters for Tidal Volume
            </a>
          </li>
          <li>
            <a href="#ibw-formulas" className="hover:underline">
              Devine Formula for Ideal Body Weight
            </a>
          </li>
          <li>
            <a href="#lung-protective" className="hover:underline">
              Lung-Protective Tidal Volume Targets
            </a>
          </li>
          <li>
            <a href="#practical-tips" className="hover:underline">
              Practical Tips and Limitations
            </a>
          </li>
        </ul>
        <hr />

        <h2
          id="ibw-basics"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          Why Ideal Body Weight Matters for Tidal Volume
        </h2>
        <p>
          Tidal volume is the amount of air delivered to the lungs with each mechanical breath. Because lung size is
          more closely related to height than actual weight, especially in people with obesity, most critical care
          protocols base tidal volume on ideal body weight (IBW). This approach reduces the risk of over-distending
          the lungs and helps prevent ventilator-induced lung injury.
        </p>

        <h2
          id="ibw-formulas"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          Devine Formula for Ideal Body Weight
        </h2>
        <p>
          The Devine formula is widely used to estimate IBW in adults. It uses sex and height to approximate the body
          size that corresponds to average organ and lung dimensions. The same IBW estimate is then used to scale tidal
          volume in mL/kg IBW.
        </p>

        <h2
          id="lung-protective"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          Lung-Protective Tidal Volume Targets
        </h2>
        <p>
          Trials in ARDS and at-risk patients show that lower tidal volumes (4–8 mL/kg IBW) reduce lung stretch and
          improve outcomes compared with traditional higher volumes. Many ICUs aim for 6 mL/kg IBW initially, then
          adjust based on plateau pressures, driving pressure, and PaCO2 targets.
        </p>

        <h2
          id="practical-tips"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          Practical Tips and Limitations
        </h2>
        <p>
          While IBW-based tidal volumes are a cornerstone of lung-protective ventilation, they are only one part of
          ventilator management. Clinicians must also consider respiratory rate, PEEP, FiO2, compliance, patient
          comfort, and hemodynamics. The calculator should be used as an educational tool that complements, not
          replaces, bedside judgment.
        </p>
      </section>

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
          <p>This tool calculates ideal body weight and ventilator tidal volume using lung-protective targets.</p>
          <p>Outputs include IBW, chosen tidal volume in mL/kg, total tidal volume, safe ranges, interpretation, and recommendations.</p>
          <p>Formula, steps, guide content, related tools, and FAQs mirror the structure used in other advanced health calculators.</p>
        </CardContent>
      </Card>
    </div>
  );
}



