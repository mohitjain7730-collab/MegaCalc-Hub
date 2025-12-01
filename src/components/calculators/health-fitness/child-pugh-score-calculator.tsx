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
  bilirubin: z.number({ invalid_type_error: 'Enter bilirubin' }).min(0.1).max(20),
  albumin: z.number({ invalid_type_error: 'Enter albumin' }).min(1).max(6),
  inr: z.number({ invalid_type_error: 'Enter INR' }).min(0.8).max(5),
  ascites: z.enum(['none', 'mild', 'moderate'], { invalid_type_error: 'Select ascites severity' }),
  encephalopathy: z.enum(['none', 'grade1-2', 'grade3-4'], {
    invalid_type_error: 'Select encephalopathy severity',
  }),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  bilirubin: number;
  albumin: number;
  inr: number;
  ascites: 'none' | 'mild' | 'moderate';
  encephalopathy: 'none' | 'grade1-2' | 'grade3-4';
  score: number;
  classLabel: 'A' | 'B' | 'C';
  interpretation: string;
  recommendations: string[];
};

const steps = [
  'Enter serum bilirubin (mg/dL), albumin (g/dL), and INR.',
  'Select ascites severity (none, mild, or moderate/severe).',
  'Select hepatic encephalopathy severity (none, grade I–II, or grade III–IV).',
  'Review the Child-Pugh score, class (A–C), interpretation, and recommendations.',
];

const faqs = [
  {
    question: 'What does the Child-Pugh score measure?',
    answer:
      'The Child-Pugh score combines laboratory and clinical features—bilirubin, albumin, INR (or prothrombin time), ascites, and encephalopathy—to stage chronic liver disease into class A, B, or C.',
  },
  {
    question: 'How are Child-Pugh classes defined?',
    answer:
      'Total scores of 5–6 indicate Child-Pugh class A (well-compensated disease), 7–9 class B (significant functional compromise), and 10–15 class C (decompensated disease with higher mortality risk).',
  },
  {
    question: 'Is Child-Pugh still used if MELD-Na is available?',
    answer:
      'Yes. While MELD-Na is widely used for transplant priority, the Child-Pugh score remains useful for prognostic discussions, treatment selection, and surgical risk stratification.',
  },
  {
    question: 'Can this calculator drive independent clinical decisions?',
    answer:
      'No. It is an educational tool. Management decisions must be made by qualified clinicians considering the full clinical picture and local guidelines.',
  },
];

const relatedCalculators = [
  {
    name: 'MELD Score (Liver Disease Severity) Calculator',
    slug: 'meld-score-liver-disease-severity-calculator',
    description: 'Estimate liver disease severity using an educational MELD-Na approximation.',
  },
  {
    name: 'Liver Enzyme ALT/AST Ratio Calculator',
    slug: 'liver-enzyme-alt-ast-ratio-calculator',
    description: 'Evaluate liver enzyme patterns with the ALT/AST ratio.',
  },
  {
    name: 'Detox Pathway Efficiency Calculator',
    slug: 'detox-pathway-efficiency-calculator',
    description: 'Assess detoxification-related organ function including the liver.',
  },
  {
    name: 'Serum Osmolar Gap Calculator',
    slug: 'serum-osmolar-gap-calculator',
    description: 'Explore metabolic disturbances that can accompany advanced liver disease.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/child-pugh-score-calculator';

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
          name: 'Child-Pugh Score Calculator',
          item: baseUrl,
        },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Child-Pugh Score Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description:
        'Calculate the Child-Pugh score and class for chronic liver disease using bilirubin, albumin, INR, ascites, and encephalopathy.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const scoreBilirubin = (bilirubin: number): 1 | 2 | 3 => {
  if (bilirubin < 2) return 1;
  if (bilirubin <= 3) return 2;
  return 3;
};

const scoreAlbumin = (albumin: number): 1 | 2 | 3 => {
  if (albumin > 3.5) return 1;
  if (albumin >= 2.8) return 2;
  return 3;
};

const scoreINR = (inr: number): 1 | 2 | 3 => {
  if (inr < 1.7) return 1;
  if (inr <= 2.3) return 2;
  return 3;
};

const scoreAscites = (ascites: FormValues['ascites']): 1 | 2 | 3 => {
  if (ascites === 'none') return 1;
  if (ascites === 'mild') return 2;
  return 3;
};

const scoreEncephalopathy = (encephalopathy: FormValues['encephalopathy']): 1 | 2 | 3 => {
  if (encephalopathy === 'none') return 1;
  if (encephalopathy === 'grade1-2') return 2;
  return 3;
};

const calculateResult = (values: FormValues): ResultPayload => {
  const { bilirubin, albumin, inr, ascites, encephalopathy } = values;
  const totalScore =
    scoreBilirubin(bilirubin) +
    scoreAlbumin(albumin) +
    scoreINR(inr) +
    scoreAscites(ascites) +
    scoreEncephalopathy(encephalopathy);

  let classLabel: ResultPayload['classLabel'] = 'A';
  let interpretation =
    'Child-Pugh class A (5–6 points) is generally associated with well-compensated chronic liver disease and relatively better prognosis compared with classes B and C.';

  if (totalScore >= 10) {
    classLabel = 'C';
    interpretation =
      'Child-Pugh class C (10–15 points) indicates decompensated cirrhosis with high risk of complications and increased short-term mortality.';
  } else if (totalScore >= 7) {
    classLabel = 'B';
    interpretation =
      'Child-Pugh class B (7–9 points) reflects significant hepatic functional compromise with moderate risk of decompensation and complications.';
  }

  const recommendations: string[] = [
    'Discuss the Child-Pugh class with a hepatology specialist who can integrate this staging with imaging, endoscopy, and clinical findings.',
    'Monitor for complications such as ascites, variceal bleeding, and encephalopathy, especially in classes B and C.',
  ];

  if (classLabel !== 'A') {
    recommendations.push(
      'For class B or C, clinicians may consider evaluation for transplant eligibility and intensified surveillance for decompensation events.',
    );
  }

  return {
    bilirubin,
    albumin,
    inr,
    ascites,
    encephalopathy,
    score: totalScore,
    classLabel,
    interpretation,
    recommendations,
  };
};

export default function ChildPughScoreCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bilirubin: undefined,
      albumin: undefined,
      inr: undefined,
      ascites: undefined,
      encephalopathy: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script
        id="child-pugh-score-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Child-Pugh Score Calculator
          </CardTitle>
          <CardDescription>
            Calculate the Child-Pugh score and class for chronic liver disease.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input clinical and laboratory data</CardTitle>
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
                  name="albumin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Albumin (g/dL)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 3.2"
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
                  name="ascites"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ascites</FormLabel>
                      <FormControl>
                        <select
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ''
                                ? (undefined as unknown as FormValues['ascites'])
                                : (e.target.value as FormValues['ascites']),
                            )
                          }
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="">Select ascites severity</option>
                          <option value="none">None</option>
                          <option value="mild">Mild (controlled)</option>
                          <option value="moderate">Moderate/severe (poorly controlled)</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="encephalopathy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Encephalopathy</FormLabel>
                      <FormControl>
                        <select
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ''
                                ? (undefined as unknown as FormValues['encephalopathy'])
                                : (e.target.value as FormValues['encephalopathy']),
                            )
                          }
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="">Select encephalopathy severity</option>
                          <option value="none">None</option>
                          <option value="grade1-2">Grade I–II</option>
                          <option value="grade3-4">Grade III–IV</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Child-Pugh score
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
            <CardDescription>Review Child-Pugh score and class.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Child-Pugh score</p>
                <p className="text-2xl font-semibold text-primary">{result.score}</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Class</p>
                <p className="text-2xl font-semibold text-primary">Class {result.classLabel}</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Ascites</p>
                <p className="text-2xl font-semibold text-primary capitalize">
                  {result.ascites === 'none' ? 'None' : result.ascites}
                </p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Encephalopathy</p>
                <p className="text-2xl font-semibold text-primary">
                  {result.encephalopathy === 'none'
                    ? 'None'
                    : result.encephalopathy === 'grade1-2'
                    ? 'Grade I–II'
                    : 'Grade III–IV'}
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
            Child-Pugh score is calculated by assigning 1–3 points for each of five parameters—bilirubin, albumin, INR,
            ascites, and encephalopathy—then summing the total (5–15 points).
          </p>
          <p>
            Child-Pugh class A: 5–6 points; class B: 7–9 points; class C: 10–15 points.
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
                <p className="text-sm text-muted-foreground">Distance from class B threshold</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.score - 7).toFixed(0)} points
                </p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Distance from class C threshold</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.score - 10).toFixed(0)} points
                </p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Score as % of maximum (15)</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.score / 15 * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Enter data to see Child-Pugh score position relative to class thresholds.
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
          content="Child-Pugh Score Guide: Staging Chronic Liver Disease"
        />
        <meta
          itemProp="description"
          content="Understand how the Child-Pugh score is constructed, how classes A, B, and C are defined, and how they guide prognosis and management in chronic liver disease."
        />
        <meta
          itemProp="keywords"
          content="Child-Pugh score calculator, liver cirrhosis staging, chronic liver disease prognosis, Child A B C"
        />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/child-pugh-score-guide" />

        <h1
          className="text-3xl md:text-4xl font-extrabold text-foreground mb-4"
          itemProp="headline"
        >
          Child-Pugh Score: Staging Chronic Liver Disease
        </h1>
        <p className="text-lg italic text-gray-700">
          Learn how laboratory and clinical features combine to form the Child-Pugh score, how classes A, B, and C
          differ, and how this staging system is used in chronic liver disease.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">
          Table of Contents: Jump to a Section
        </h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li>
            <a href="#cp-basics" className="hover:underline">
              What Is the Child-Pugh Score?
            </a>
          </li>
          <li>
            <a href="#cp-parameters" className="hover:underline">
              Parameters and Scoring System
            </a>
          </li>
          <li>
            <a href="#cp-classes" className="hover:underline">
              Interpreting Child-Pugh Classes A, B, and C
            </a>
          </li>
          <li>
            <a href="#cp-use-limitations" className="hover:underline">
              Clinical Uses and Limitations
            </a>
          </li>
        </ul>
        <hr />

        <h2
          id="cp-basics"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          What Is the Child-Pugh Score?
        </h2>
        <p>
          The Child-Pugh score is a long-standing tool for summarizing the severity of chronic liver disease. It
          combines laboratory measurements of liver synthetic function with clinical observations of complications to
          categorize patients into three prognostic classes, which can help guide treatment choices and risk
          discussions.
        </p>

        <h2
          id="cp-parameters"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          Parameters and Scoring System
        </h2>
        <p>
          Five parameters make up the Child-Pugh score: serum bilirubin, serum albumin, INR (or prothrombin time),
          presence and control of ascites, and severity of hepatic encephalopathy. Each parameter is assigned 1, 2, or
          3 points based on defined clinical cutoffs, resulting in a total score between 5 and 15.
        </p>

        <h2
          id="cp-classes"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          Interpreting Child-Pugh Classes A, B, and C
        </h2>
        <p>
          Class A (5–6 points) generally reflects compensated cirrhosis, class B (7–9 points) indicates significant
          functional impairment with higher risk of complications, and class C (10–15 points) represents decompensated
          disease with the highest mortality risk. These classes can inform choices such as beta-blocker use, timing of
          endoscopy, and perioperative risk in non-hepatic surgery.
        </p>

        <h2
          id="cp-use-limitations"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          Clinical Uses and Limitations
        </h2>
        <p>
          While still widely cited, the Child-Pugh score has limitations: ascites and encephalopathy grading are
          somewhat subjective, and the score does not capture all dimensions of liver disease such as renal function or
          sodium balance (which are reflected in MELD-Na). Therefore, Child-Pugh staging is best used alongside MELD-Na
          and detailed clinical evaluation rather than as a stand-alone decision tool.
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
          <p>This tool calculates the Child-Pugh score and class from bilirubin, albumin, INR, ascites, and encephalopathy.</p>
          <p>Outputs include total score, class, interpretation, and recommendations for clinical follow-up discussions.</p>
          <p>Formula, steps, guide content, related tools, and FAQs mirror the rich structure used in other advanced liver calculators.</p>
        </CardContent>
      </Card>
    </div>
  );
}



