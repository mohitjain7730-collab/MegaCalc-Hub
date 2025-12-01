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
  urineUrea: z.number({ invalid_type_error: 'Enter urine urea' }).min(1).max(1000),
  plasmaUrea: z.number({ invalid_type_error: 'Enter plasma urea' }).min(1).max(150),
  urineCreatinine: z.number({ invalid_type_error: 'Enter urine creatinine' }).min(1).max(300),
  plasmaCreatinine: z.number({ invalid_type_error: 'Enter plasma creatinine' }).min(0.1).max(15),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  urineUrea: number;
  plasmaUrea: number;
  urineCreatinine: number;
  plasmaCreatinine: number;
  feurea: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter urine urea nitrogen (mg/dL or mmol/L converted to mg/dL).',
  'Enter plasma urea nitrogen (mg/dL).',
  'Enter urine creatinine (mg/dL) and plasma creatinine (mg/dL).',
  'Review FeUrea to differentiate prerenal vs intrinsic AKI when diuretics confound FeNa.',
];

const faqs = [
  {
    question: 'What is FeUrea?',
    answer:
      'Fractional excretion of urea (FeUrea) estimates the percentage of filtered urea excreted in urine. Because urea handling is less affected by loop and thiazide diuretics, FeUrea is useful when FeNa is unreliable.',
  },
  {
    question: 'How do I calculate FeUrea?',
    answer:
      'FeUrea (%) = (Urine Urea × Plasma Creatinine) / (Plasma Urea × Urine Creatinine) × 100. The structure mirrors FeNa but substitutes urea values.',
  },
  {
    question: 'What thresholds are used?',
    answer:
      '<35% supports a prerenal process, 35–50% is indeterminate, and >50% suggests intrinsic renal injury such as ATN.',
  },
  {
    question: 'When should I prefer FeUrea over FeNa?',
    answer:
      'Use FeUrea when patients recently received diuretics or have underlying conditions that alter sodium handling, making FeNa unreliable.',
  },
  {
    question: 'Can FeUrea replace full evaluation?',
    answer:
      'No. Always interpret FeUrea with clinical exam, ultrasound, urinalysis, and hemodynamics to determine the cause of AKI.',
  },
];

const relatedCalculators = [
  {
    name: 'Fractional Excretion of Sodium (FeNa)',
    slug: 'fractional-excretion-of-sodium-fena-calculator',
    description: 'Classic FeNa calculator for AKI evaluation.',
  },
  {
    name: 'Kidney Function eGFR Calculator',
    slug: 'kidney-function-egfr-calculator',
    description: 'Estimate baseline renal function.',
  },
  {
    name: 'Hydration Balance with Alcohol Intake Calculator',
    slug: 'hydration-balance-with-alcohol-intake-calculator',
    description: 'Track hydration status impacting renal perfusion.',
  },
  {
    name: 'Body Surface Area by Du Bois Formula',
    slug: 'body-surface-area-du-bois-calculator',
    description: 'Normalize hemodynamic metrics to BSA.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/fractional-excretion-of-urea-feurea-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Fractional Excretion of Urea (FeUrea)', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Fractional Excretion of Urea (FeUrea)',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Compute FeUrea to help evaluate acute kidney injury, especially in diuretic-treated patients.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const { urineUrea, plasmaUrea, urineCreatinine, plasmaCreatinine } = values;
  const denominator = plasmaUrea * urineCreatinine;
  const feurea = denominator > 0 ? (urineUrea * plasmaCreatinine) / denominator * 100 : 0;

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'FeUrea <35% aligns with prerenal physiology.';

  if (feurea < 35) {
    status = 'good';
    interpretation = 'FeUrea <35% supports a prerenal state (e.g., hypovolemia), particularly when FeNa is unreliable.';
  } else if (feurea <= 50) {
    status = 'moderate';
    interpretation = 'FeUrea 35–50% is indeterminate. Re-evaluate after volume resuscitation or review other markers.';
  } else {
    status = 'low';
    interpretation = 'FeUrea >50% suggests intrinsic renal injury such as acute tubular necrosis.';
  }

  const recommendations = [
    'Use FeUrea when diuretics or CKD make FeNa less reliable.',
    'Pair FeUrea with urinalysis, imaging, and hemodynamic data before finalizing the diagnosis.',
    'Trend FeUrea along with creatinine during therapy to gauge renal recovery.',
  ];

  const plan = [
    { label: 'This Week', detail: 'Apply FeUrea to ongoing AKI evaluations, especially in diuretic-treated patients.' },
    {
      label: 'This Month',
      detail: 'Repeat FeUrea or FeNa if renal status changes or new therapies are initiated.',
    },
    {
      label: 'Ongoing',
      detail: 'Document renal assessments and adjust fluids, medications, and monitoring per clinician guidance.',
    },
  ];

  return { urineUrea, plasmaUrea, urineCreatinine, plasmaCreatinine, feurea, status, interpretation, recommendations, plan };
};

export default function FractionalExcretionOfUreaCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      urineUrea: undefined,
      plasmaUrea: undefined,
      urineCreatinine: undefined,
      plasmaCreatinine: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script
        id="feurea-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Fractional Excretion of Urea (FeUrea)
          </CardTitle>
          <CardDescription>Assess AKI etiology when diuretics confound FeNa.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input lab values</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="urineUrea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Urine urea nitrogen (mg/dL)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 350"
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
                  name="plasmaUrea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plasma urea nitrogen (mg/dL)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 40"
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
                  name="urineCreatinine"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Urine creatinine (mg/dL)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 80"
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
                  name="plasmaCreatinine"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plasma creatinine (mg/dL)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 1.4"
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
                Calculate FeUrea
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
            <CardDescription>FeUrea percentage and interpretation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">FeUrea</p>
                <p className="text-2xl font-semibold text-primary">{result.feurea.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">(UrUrea × PlCr)/(PlUrea × UrCr) × 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Urine urea</p>
                <p className="text-2xl font-semibold text-primary">{result.urineUrea.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">mg/dL</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Plasma urea</p>
                <p className="text-2xl font-semibold text-primary">{result.plasmaUrea.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">mg/dL</p>
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
            <strong>FeUrea (%)</strong> = (Urine Urea × Plasma Creatinine) / (Plasma Urea × Urine Creatinine) × 100
          </p>
          <p>FeUrea retains diagnostic value in patients on diuretics and should be paired with FeNa when possible.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Guide: FeUrea thresholds and caveats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            FeUrea is especially useful when loop or thiazide diuretics make FeNa less reliable. Like FeNa, it should be
            interpreted together with exam findings, imaging, and other labs.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr>
                  <th className="border-b p-2 font-semibold">FeUrea (%)</th>
                  <th className="border-b p-2 font-semibold">Pattern</th>
                  <th className="border-b p-2 font-semibold">Usual interpretation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-b p-2">&lt; 35%</td>
                  <td className="border-b p-2">Prerenal</td>
                  <td className="border-b p-2">Supports hypoperfusion (volume loss, low effective circulating volume).</td>
                </tr>
                <tr>
                  <td className="border-b p-2">35–50%</td>
                  <td className="border-b p-2">Indeterminate</td>
                  <td className="border-b p-2">Requires additional data and often repeat testing.</td>
                </tr>
                <tr>
                  <td className="border-b p-2">&gt; 50%</td>
                  <td className="border-b p-2">Intrinsic</td>
                  <td className="border-b p-2">More consistent with intrinsic tubular injury or ATN.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Remember that severe CKD, sepsis, and chronic diuretic exposure can still alter FeUrea behavior; always
            correlate with the overall clinical picture.
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
                <p className="text-sm text-muted-foreground">FeUrea category</p>
                <p className="text-xl font-semibold text-primary">
                  {result.feurea < 35 ? 'Prerenal' : result.feurea <= 50 ? 'Indeterminate' : 'Intrinsic'}
                </p>
                <p className="text-xs text-muted-foreground">Qualitative label</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Urine/serum Cr ratio</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.urineCreatinine / result.plasmaCreatinine).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Helps evaluate concentrating ability</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Clinical tip</p>
                <p className="text-xl font-semibold text-primary">Combine with FeNa</p>
                <p className="text-xs text-muted-foreground">Concordant values strengthen diagnostic confidence</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter lab values to see supplemental metrics.</p>
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
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>This tool calculates fractional excretion of urea (FeUrea) to complement FeNa.</p>
          <p>Outputs include FeUrea %, interpretation, targeted recommendations, and an action plan.</p>
          <p>Leverage FeUrea when diuretics or CKD limit FeNa accuracy.</p>
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


