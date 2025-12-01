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
  bilirubin: z.number({ invalid_type_error: 'Enter bilirubin' }).min(0.1).max(50),
  inr: z.number({ invalid_type_error: 'Enter INR' }).min(0.8).max(10),
  creatinine: z.number({ invalid_type_error: 'Enter creatinine' }).min(0.1).max(10),
  sodium: z.number({ invalid_type_error: 'Enter sodium' }).min(110).max(180),
  onDialysis: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  bilirubin: number;
  inr: number;
  creatinine: number;
  sodium: number;
  onDialysis: boolean;
  meldNa: number;
  severity: 'low' | 'moderate' | 'high' | 'very-high';
  interpretation: string;
  recommendations: string[];
};

const steps = [
  'Enter serum bilirubin in mg/dL.',
  'Enter INR (International Normalized Ratio).',
  'Enter serum creatinine in mg/dL and indicate if the patient is on dialysis.',
  'Enter serum sodium in mEq/L.',
  'Review the calculated MELD-Na score, severity category, and interpretation.',
];

const faqs = [
  {
    question: 'What is the MELD-Na score?',
    answer:
      'The MELD-Na score is an updated version of the original MELD score that incorporates serum sodium along with bilirubin, INR, and creatinine to better predict mortality risk in advanced liver disease.',
  },
  {
    question: 'Which formula is used in this calculator?',
    answer:
      'This tool uses an educational approximation of the MELD-Na formula. Exact scoring and transplant prioritization should be performed using validated, institutionally approved tools.',
  },
  {
    question: 'How is creatinine handled in the MELD score?',
    answer:
      'In MELD-based scoring, creatinine is often bounded between 1.0 and 4.0 mg/dL, with dialysis treated as a creatinine of 4.0 for scoring purposes. This calculator applies similar capping to avoid extreme values.',
  },
  {
    question: 'Can this calculator replace transplant center tools?',
    answer:
      'No. It is for educational and general risk discussion only. Official transplant priority and prognostic decisions must rely on validated systems and clinician judgment.',
  },
];

const relatedCalculators = [
  {
    name: 'Child-Pugh Score Calculator',
    slug: 'child-pugh-score-calculator',
    description: 'Classify chronic liver disease severity using the Child-Pugh scoring system.',
  },
  {
    name: 'Liver Enzyme ALT/AST Ratio Calculator',
    slug: 'liver-enzyme-alt-ast-ratio-calculator',
    description: 'Evaluate liver enzyme patterns using the ALT/AST ratio.',
  },
  {
    name: 'Detox Pathway Efficiency Calculator',
    slug: 'detox-pathway-efficiency-calculator',
    description: 'Contextualize liver function within overall detoxification and organ health.',
  },
  {
    name: 'Serum Osmolar Gap Calculator',
    slug: 'serum-osmolar-gap-calculator',
    description: 'Evaluate metabolic disturbances that may coexist with advanced liver disease.',
  },
];

const baseUrl =
  'https://mycalculating.com/category/health-fitness/meld-score-liver-disease-severity-calculator';

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
          name: 'MELD Score (Liver Disease Severity)',
          item: baseUrl,
        },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'MELD Score (Liver Disease Severity) Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description:
        'Estimate liver disease severity using an educational MELD-Na score approximation based on bilirubin, INR, creatinine, and sodium.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const ln = (v: number) => Math.log(v);

const calculateResult = (values: FormValues): ResultPayload => {
  let { bilirubin, inr, creatinine, sodium, onDialysis } = values;

  bilirubin = Math.max(1, Math.min(50, bilirubin));
  inr = Math.max(1, Math.min(10, inr));
  creatinine = Math.max(1, Math.min(4, creatinine));
  if (onDialysis) {
    creatinine = 4;
  }

  const rawMeld = 10 * (0.957 * ln(creatinine) + 0.378 * ln(bilirubin) + 1.12 * ln(inr) + 0.643);
  const meldBase = Math.max(6, Math.min(40, rawMeld));
  const meldNa = Math.round(
    meldBase + 1.32 * (137 - Math.max(120, Math.min(135, sodium))) - 0.033 * meldBase * (137 - Math.max(120, Math.min(135, sodium))),
  );

  let severity: ResultPayload['severity'] = 'low';
  let interpretation =
    'This MELD-Na estimate suggests relatively lower short-term mortality risk compared with higher scores, but close clinical follow-up is still essential.';

  if (meldNa >= 30) {
    severity = 'very-high';
    interpretation =
      'This MELD-Na estimate falls in a very high severity range, often associated with substantial short-term mortality risk and potential transplant evaluation.';
  } else if (meldNa >= 20) {
    severity = 'high';
    interpretation =
      'This MELD-Na estimate reflects high liver disease severity with increased short-term mortality risk. Specialist hepatology care is crucial.';
  } else if (meldNa >= 10) {
    severity = 'moderate';
    interpretation =
      'This MELD-Na estimate indicates moderate liver disease severity. Complications may develop and should be monitored closely.';
  }

  const recommendations: string[] = [
    'Discuss the results with a hepatology specialist who can interpret the MELD-Na score in the context of symptoms, imaging, and comorbidities.',
    'Recalculate the score periodically as lab values change, especially during acute decompensation.',
  ];

  if (meldNa >= 20) {
    recommendations.push(
      'High or very high scores may prompt referral for transplant evaluation and advanced management of complications such as ascites, encephalopathy, and variceal bleeding.',
    );
  }

  return {
    bilirubin,
    inr,
    creatinine,
    sodium,
    onDialysis,
    meldNa,
    severity,
    interpretation,
    recommendations,
  };
};

export default function MELDScoreLiverDiseaseSeverityCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bilirubin: undefined,
      inr: undefined,
      creatinine: undefined,
      sodium: undefined,
      onDialysis: false,
    },
  });

  return (
    <div className="space-y-8">
      <Script
        id="meld-score-liver-disease-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            MELD Score (Liver Disease Severity)
          </CardTitle>
          <CardDescription>
            Estimate liver disease severity using an educational MELD-Na score approximation.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input laboratory data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="bilirubin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bilirubin (mg/dL)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 2.0"
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
                  name="inr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>INR</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 1.5"
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
                  name="creatinine"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Creatinine (mg/dL)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 1.0"
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
                  name="sodium"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sodium (mEq/L)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 135"
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
                  name="onDialysis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>On dialysis (2+ times last week)</FormLabel>
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="h-4 w-4 rounded border-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate MELD-Na score
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
            <CardDescription>Review MELD-Na estimate and severity category.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">MELD-Na estimate</p>
                <p className="text-2xl font-semibold text-primary">{result.meldNa}</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Severity</p>
                <p className="text-2xl font-semibold text-primary capitalize">
                  {result.severity.replace('-', ' ')}
                </p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Dialysis considered</p>
                <p className="text-2xl font-semibold text-primary">
                  {result.onDialysis ? 'Yes' : 'No'}
                </p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sodium (mEq/L)</p>
                <p className="text-2xl font-semibold text-primary">{result.sodium.toFixed(0)}</p>
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
            <strong>Educational MELD-Na approximation</strong> (values capped for stability):
          </p>
          <p>
            MELD = 10 × (0.957 × ln(creatinine) + 0.378 × ln(bilirubin) + 1.12 × ln(INR) + 0.643)
          </p>
          <p>
            MELD-Na ≈ MELD + 1.32 × (137 − Na) − 0.033 × MELD × (137 − Na)
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
                <p className="text-sm text-muted-foreground">Capped bilirubin</p>
                <p className="text-xl font-semibold text-primary">
                  {result.bilirubin.toFixed(1)} mg/dL
                </p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Capped creatinine</p>
                <p className="text-xl font-semibold text-primary">
                  {result.creatinine.toFixed(1)} mg/dL
                </p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Relative to MELD 20</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.meldNa / 20 * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Enter laboratory data to see additional MELD-Na context.
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
          content="MELD-Na Score Guide: Understanding Liver Disease Severity"
        />
        <meta
          itemProp="description"
          content="Learn how the MELD-Na score is constructed from bilirubin, INR, creatinine, and sodium, and how it is used to estimate mortality risk and liver disease severity."
        />
        <meta
          itemProp="keywords"
          content="MELD score calculator, MELD-Na, liver disease severity, cirrhosis mortality, liver transplant priority"
        />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/meld-score-liver-disease-guide" />

        <h1
          className="text-3xl md:text-4xl font-extrabold text-foreground mb-4"
          itemProp="headline"
        >
          MELD-Na Score: Interpreting Liver Disease Severity and Risk
        </h1>
        <p className="text-lg italic text-gray-700">
          Explore the components of the MELD-Na score, how it estimates short-term mortality in chronic liver disease,
          and how it fits into transplant evaluation and long-term care.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">
          Table of Contents: Jump to a Section
        </h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li>
            <a href="#meld-basics" className="hover:underline">
              What Is the MELD and MELD-Na Score?
            </a>
          </li>
          <li>
            <a href="#meld-components" className="hover:underline">
              Components of the MELD-Na Formula
            </a>
          </li>
          <li>
            <a href="#meld-interpretation" className="hover:underline">
              Interpreting Low, Moderate, and High Scores
            </a>
          </li>
          <li>
            <a href="#meld-limitations" className="hover:underline">
              Limitations and Clinical Context
            </a>
          </li>
        </ul>
        <hr />

        <h2
          id="meld-basics"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          What Is the MELD and MELD-Na Score?
        </h2>
        <p>
          The Model for End-Stage Liver Disease (MELD) score was originally developed to predict survival after
          transjugular intrahepatic portosystemic shunt (TIPS) and later adopted by transplant systems to prioritize
          liver transplant candidates. The MELD-Na variant incorporates serum sodium, which adds important prognostic
          information in patients with advanced cirrhosis and complications like ascites.
        </p>

        <h2
          id="meld-components"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          Components of the MELD-Na Formula
        </h2>
        <p>
          MELD-Na uses serum bilirubin, INR, creatinine, and sodium, with logarithmic transformations and caps on
          extreme values. These labs capture liver synthetic function, cholestasis, renal function, and systemic
          homeostasis, all of which influence short-term mortality in cirrhosis.
        </p>

        <h2
          id="meld-interpretation"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          Interpreting Low, Moderate, and High Scores
        </h2>
        <p>
          Higher MELD-Na scores generally indicate greater 90-day mortality risk and often correlate with more
          advanced portal hypertension and complications. While specific cutoffs and prognostic tables vary by region
          and center, scores above 20 commonly signal severe disease and prompt evaluation for transplant and
          aggressive management of complications.
        </p>

        <h2
          id="meld-limitations"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          Limitations and Clinical Context
        </h2>
        <p>
          The MELD-Na score does not capture every aspect of liver disease burden—factors like frailty, sarcopenia,
          encephalopathy severity, and patient preferences also matter. As a result, MELD-Na is best viewed as a
          quantitative anchor for risk discussions rather than a stand-alone decision-maker. Final management must
          always be determined by experienced clinicians and transplant teams.
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
          <p>This tool provides an educational MELD-Na score estimate from bilirubin, INR, creatinine, and sodium.</p>
          <p>Outputs include MELD-Na estimate, severity category, interpretation, and key follow-up recommendations.</p>
          <p>Formula, steps, guide content, related tools, and FAQs mirror the comprehensive structure used for other advanced medical calculators.</p>
        </CardContent>
      </Card>
    </div>
  );
}



