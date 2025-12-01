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
  urineSodium: z.number({ invalid_type_error: 'Enter urine sodium' }).min(1).max(300),
  plasmaSodium: z.number({ invalid_type_error: 'Enter plasma sodium' }).min(100).max(170),
  urineCreatinine: z.number({ invalid_type_error: 'Enter urine creatinine' }).min(1).max(300),
  plasmaCreatinine: z.number({ invalid_type_error: 'Enter plasma creatinine' }).min(0.1).max(15),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  urineSodium: number;
  plasmaSodium: number;
  urineCreatinine: number;
  plasmaCreatinine: number;
  fena: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter urine sodium (mEq/L) from a spot urine sample.',
  'Enter plasma sodium (mEq/L) from the basic metabolic panel.',
  'Enter urine creatinine (mg/dL) and plasma creatinine (mg/dL).',
  'Review the fractional excretion of sodium (FeNa) and apply the thresholds to your patient.',
];

const faqs = [
  {
    question: 'What is FeNa?',
    answer:
      'Fractional excretion of sodium (FeNa) estimates the percentage of filtered sodium excreted in the urine. It helps differentiate prerenal azotemia from intrinsic acute kidney injury (AKI).',
  },
  {
    question: 'How is FeNa calculated?',
    answer:
      'FeNa (%) = (Urine Na × Plasma Creatinine) / (Plasma Na × Urine Creatinine) × 100. Creatinine adjusts for urine flow so FeNa reflects tubular sodium handling rather than diuresis.',
  },
  {
    question: 'What thresholds are commonly used?',
    answer:
      '<1% supports a prerenal process, 1–2% is indeterminate, and >2% suggests intrinsic renal injury such as acute tubular necrosis.',
  },
  {
    question: 'When is FeNa unreliable?',
    answer:
      'Results can be misleading in chronic kidney disease, recent diuretic exposure, contrast nephropathy, or adrenal disorders. Consider FeUrea or clinical context in those cases.',
  },
  {
    question: 'How does FeNa complement other tests?',
    answer: 'Combine FeNa with FeUrea, urinalysis, renal ultrasound, and hemodynamic assessments for a complete AKI workup.',
  },
];

const relatedCalculators = [
  {
    name: 'Fractional Excretion of Urea (FeUrea)',
    slug: 'fractional-excretion-of-urea-feurea-calculator',
    description: 'Preferred when diuretics confound FeNa.',
  },
  {
    name: 'Kidney Function eGFR Calculator',
    slug: 'kidney-function-egfr-calculator',
    description: 'Estimate glomerular filtration rate from serum creatinine.',
  },
  {
    name: 'Body Surface Area by Du Bois Formula',
    slug: 'body-surface-area-du-bois-calculator',
    description: 'Normalize renal metrics to body surface area.',
  },
  {
    name: 'Hydration Balance with Alcohol Intake Calculator',
    slug: 'hydration-balance-with-alcohol-intake-calculator',
    description: 'Manage hydration strategies influencing renal perfusion.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/fractional-excretion-of-sodium-fena-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Fractional Excretion of Sodium (FeNa)', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Fractional Excretion of Sodium (FeNa)',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Compute FeNa to support evaluation of acute kidney injury.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const { urineSodium, plasmaSodium, urineCreatinine, plasmaCreatinine } = values;
  const denominator = plasmaSodium * urineCreatinine;
  const fena = denominator > 0 ? (urineSodium * plasmaCreatinine) / denominator * 100 : 0;

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'FeNa <1% favors prerenal physiology (e.g., hypovolemia).';

  if (fena < 1) {
    status = 'good';
    interpretation = 'FeNa <1% supports a prerenal etiology, but correlate with exam and ultrasound.';
  } else if (fena <= 2) {
    status = 'moderate';
    interpretation = 'FeNa 1–2% is equivocal. Review medications and repeat labs if needed.';
  } else {
    status = 'low';
    interpretation = 'FeNa >2% is more consistent with intrinsic renal injury such as acute tubular necrosis.';
  }

  const recommendations = [
    'Interpret FeNa alongside history, volume status, urinalysis, and renal imaging.',
    'Document recent diuretic exposure; if present, check FeUrea for corroboration.',
    'Trend FeNa during resuscitation or after medication adjustments to gauge response.',
  ];

  const plan = [
    { label: 'This Week', detail: 'Use FeNa to refine the differential for acute kidney injury or oliguria.' },
    {
      label: 'This Month',
      detail: 'If renal function remains unstable, repeat FeNa/FeUrea and consider nephrology consultation.',
    },
    {
      label: 'Ongoing',
      detail: 'Maintain hydration, blood pressure, and medication stewardship to protect kidney perfusion.',
    },
  ];

  return { urineSodium, plasmaSodium, urineCreatinine, plasmaCreatinine, fena, status, interpretation, recommendations, plan };
};

export default function FractionalExcretionOfSodiumCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      urineSodium: undefined,
      plasmaSodium: undefined,
      urineCreatinine: undefined,
      plasmaCreatinine: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script
        id="fena-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Fractional Excretion of Sodium (FeNa)
          </CardTitle>
          <CardDescription>Differentiate prerenal vs intrinsic AKI using FeNa.</CardDescription>
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
                  name="urineSodium"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Urine sodium (mEq/L)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 28"
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
                  name="plasmaSodium"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plasma sodium (mEq/L)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 140"
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
                          placeholder="e.g., 90"
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
                          placeholder="e.g., 1.2"
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
                Calculate FeNa
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
            <CardDescription>FeNa percentage and interpretation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">FeNa</p>
                <p className="text-2xl font-semibold text-primary">{result.fena.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">(UrNa × PlCr) / (PlNa × UrCr) × 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Urine sodium</p>
                <p className="text-2xl font-semibold text-primary">{result.urineSodium.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">mEq/L</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Plasma creatinine</p>
                <p className="text-2xl font-semibold text-primary">{result.plasmaCreatinine.toFixed(2)}</p>
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
            <strong>FeNa (%)</strong> = (Urine Na × Plasma Creatinine) / (Plasma Na × Urine Creatinine) × 100
          </p>
          <p>FeNa is most accurate in oliguric AKI without recent diuretics. Always interpret in the clinical setting.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Guide: using FeNa at the bedside</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            FeNa helps distinguish prerenal hypoperfusion from intrinsic renal injury in acute kidney injury. It should be
            calculated using simultaneous blood and urine samples before large fluid shifts when possible.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr>
                  <th className="border-b p-2 font-semibold">FeNa (%)</th>
                  <th className="border-b p-2 font-semibold">Pattern</th>
                  <th className="border-b p-2 font-semibold">Typical interpretation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-b p-2">&lt; 1%</td>
                  <td className="border-b p-2">Prerenal</td>
                  <td className="border-b p-2">Suggests sodium avid kidney from hypovolemia or low perfusion.</td>
                </tr>
                <tr>
                  <td className="border-b p-2">1–2%</td>
                  <td className="border-b p-2">Indeterminate</td>
                  <td className="border-b p-2">Borderline; correlate with exam, diuretic use, and FeUrea.</td>
                </tr>
                <tr>
                  <td className="border-b p-2">&gt; 2%</td>
                  <td className="border-b p-2">Intrinsic</td>
                  <td className="border-b p-2">More consistent with tubular injury such as acute tubular necrosis.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Diuretics, chronic kidney disease, and certain toxins can blunt FeNa reliability. In those settings, FeUrea
            and urine microscopy often provide better guidance.
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
                <p className="text-sm text-muted-foreground">FeNa category</p>
                <p className="text-xl font-semibold text-primary">
                  {result.fena < 1 ? 'Prerenal' : result.fena <= 2 ? 'Indeterminate' : 'Intrinsic'}
                </p>
                <p className="text-xs text-muted-foreground">Qualitative label</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Urine/serum Cr ratio</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.urineCreatinine / result.plasmaCreatinine).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Reflects concentrating ability</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Clinical tip</p>
                <p className="text-xl font-semibold text-primary">Trend FeNa</p>
                <p className="text-xs text-muted-foreground">Repeat after resuscitation or diuretic changes</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter lab inputs to reveal supplemental metrics.</p>
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
          <p>This calculator determines FeNa using paired urine and plasma sodium/creatinine values.</p>
          <p>Outputs include FeNa %, qualitative interpretation, recommendations, and an action plan.</p>
          <p>Use FeNa alongside FeUrea, urinalysis, and imaging to refine acute kidney injury evaluation.</p>
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


