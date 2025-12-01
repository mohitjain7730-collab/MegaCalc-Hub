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
  etiology: z.enum(['gallstone', 'non-gallstone'], {
    required_error: 'Select etiology',
    invalid_type_error: 'Select etiology',
  }),
  criteriaAtAdmissionMet: z
    .number({ invalid_type_error: 'Enter criteria at admission' })
    .min(0)
    .max(5),
  criteriaAt48hMet: z
    .number({ invalid_type_error: 'Enter criteria at 48h' })
    .min(0)
    .max(6),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  totalCriteria: number;
  mortalityRiskPercent: number;
  severityCategory: 'mild' | 'moderate' | 'severe';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Identify whether acute pancreatitis is gallstone-related or non-gallstone (e.g., alcohol, hypertriglyceridemia).',
  'Count how many Ranson criteria are present at admission (up to 5).',
  'After 48 hours, count how many additional Ranson criteria are met (up to 6).',
  'Enter the counts in the calculator to obtain total Ranson’s score and corresponding mortality risk band.',
  'Use severity category and clinical trajectory (vitals, organ failure, imaging) to guide level of care and monitoring.',
];

const faqs = [
  {
    question: 'What are Ranson’s criteria?',
    answer:
      'Ranson’s criteria are a set of 11 clinical and laboratory measurements taken at admission and at 48 hours to estimate the severity and mortality risk of acute pancreatitis.',
  },
  {
    question: 'Why are there separate criteria for admission and 48 hours?',
    answer:
      'Severity of pancreatitis often evolves over the first 48 hours. Early measurements capture initial insult, while 48-hour changes (e.g., hematocrit fall, BUN rise, base deficit, fluid sequestration) reflect evolving organ dysfunction and third-spacing.',
  },
  {
    question: 'How is the total Ranson’s score interpreted?',
    answer:
      'Typical interpretation: 0–2 criteria suggest mild disease with low mortality, 3–4 indicate moderate severity, and 5 or more criteria indicate severe disease with substantially higher mortality risk.',
  },
  {
    question: 'What is the difference between gallstone and non-gallstone Ranson’s criteria?',
    answer:
      'Slightly different thresholds and variables were originally proposed for gallstone versus non-gallstone pancreatitis (e.g., age and lab cutoffs). This calculator simplifies to the total count, which many clinicians use in practice.',
  },
  {
    question: 'Are Ranson’s criteria still used today?',
    answer:
      'Yes, but they are now complemented by other scores such as APACHE II, BISAP, and bedside assessments like the presence of organ failure and persistent SIRS. Many centers use multiple tools together.',
  },
  {
    question: 'Can Ranson’s criteria be calculated before 48 hours?',
    answer:
      'Only the admission portion can be assessed on day 0. The full prognostic value requires reassessment at 48 hours to see how the patient is evolving.',
  },
  {
    question: 'Do Ranson’s criteria guide specific treatments?',
    answer:
      'They primarily inform level of care, monitoring intensity, and prognosis discussions. Core management—aggressive fluid resuscitation, pain control, early enteral nutrition, and treatment of the underlying cause—remains standard regardless of score.',
  },
  {
    question: 'Is imaging required to use Ranson’s criteria?',
    answer:
      'No. Ranson’s criteria are based on age, vital signs, and laboratory data. However, imaging (such as contrast CT) is often used when diagnosis is uncertain or complications are suspected.',
  },
  {
    question: 'Can patients use this calculator to self-assess?',
    answer:
      'No. Acute pancreatitis can be life-threatening and requires in-person medical evaluation. This tool is intended for clinicians and learners, not for self-diagnosis or home management.',
  },
];

const relatedCalculators = [
  {
    name: 'CURB-65 Pneumonia Severity Score Calculator',
    slug: 'curb-65-pneumonia-severity-score-calculator',
    description: 'Assess severity of community-acquired pneumonia and short-term mortality risk.',
  },
  {
    name: 'PaO2/FiO2 Ratio Calculator',
    slug: 'pao2-fio2-ratio-calculator',
    description: 'Quantify oxygenation impairment and ARDS severity using blood gas and FiO2.',
  },
  {
    name: 'CHA2DS2-VASc Stroke Risk Score Calculator',
    slug: 'cha2ds2-vasc-stroke-risk-score-calculator',
    description: 'Estimate stroke risk in atrial fibrillation to support anticoagulation decisions.',
  },
  {
    name: 'HAS-BLED Bleeding Risk Calculator',
    slug: 'has-bled-bleeding-risk-calculator',
    description: 'Evaluate bleeding risk in patients receiving oral anticoagulants.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/ransons-criteria-pancreatitis-severity-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Ranson’s Criteria Pancreatitis Severity Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Ranson’s Criteria Pancreatitis Severity Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate acute pancreatitis severity and mortality risk using Ranson’s criteria.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const estimateMortalityRisk = (totalCriteria: number): number => {
  if (totalCriteria <= 2) return 1;
  if (totalCriteria <= 4) return 15;
  if (totalCriteria <= 6) return 40;
  return 100;
};

const calculateResult = (values: FormValues): ResultPayload => {
  const { criteriaAtAdmissionMet, criteriaAt48hMet } = values;
  const totalCriteria = criteriaAtAdmissionMet + criteriaAt48hMet;

  const mortalityRiskPercent = clamp(estimateMortalityRisk(totalCriteria), 0, 100);

  let severityCategory: ResultPayload['severityCategory'] = 'mild';
  let interpretation =
    'Mild acute pancreatitis by Ranson’s criteria with low estimated mortality. Most patients recover with supportive care, but close monitoring is still important.';

  if (totalCriteria >= 3 && totalCriteria <= 4) {
    severityCategory = 'moderate';
    interpretation =
      'Moderately severe pancreatitis. There is a meaningful risk of complications and higher mortality; inpatient care with vigilant monitoring is recommended.';
  } else if (totalCriteria >= 5) {
    severityCategory = 'severe';
    interpretation =
      'Severe pancreatitis with high estimated mortality. Intensive monitoring, aggressive support, and early recognition of organ failure are critical.';
  }

  const recommendations: string[] = [];

  if (severityCategory === 'mild') {
    recommendations.push(
      'Provide aggressive intravenous fluids, pain control, early oral or enteral nutrition as tolerated, and monitor for early signs of deterioration.',
    );
  } else if (severityCategory === 'moderate') {
    recommendations.push(
      'Admit to a monitored setting, reassess volume status frequently, support organ function, and evaluate for complications such as necrosis or fluid collections.',
    );
  } else {
    recommendations.push(
      'Consider ICU or high-dependency unit admission, continuous hemodynamic monitoring, early consultation with gastroenterology and surgery, and multidisciplinary care.',
    );
  }

  recommendations.push(
    'Address the underlying etiology (e.g., gallstone extraction, alcohol cessation counseling, triglyceride lowering, medication review).',
  );
  recommendations.push(
    'Use other severity tools (APACHE II, BISAP) and bedside clinical assessment alongside Ranson’s criteria to guide management.',
  );

  const plan = [
    {
      label: 'First 24 Hours',
      detail:
        'Secure diagnosis of acute pancreatitis, start aggressive fluid resuscitation, control pain, and monitor vital signs and urine output closely.',
    },
    {
      label: 'At 48 Hours',
      detail:
        'Reassess Ranson’s criteria, evaluate for organ failure or persistent SIRS, and adjust level of care (ward vs ICU) based on clinical trajectory.',
    },
    {
      label: 'Ongoing Course',
      detail:
        'Optimize nutrition, treat complications promptly, and arrange follow-up to address etiologic factors and prevent recurrence.',
    },
  ];

  return {
    totalCriteria,
    mortalityRiskPercent,
    severityCategory,
    interpretation,
    recommendations,
    plan,
  };
};

export default function RansonsCriteriaPancreatitisSeverityCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      etiology: 'non-gallstone',
      criteriaAtAdmissionMet: undefined,
      criteriaAt48hMet: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script
        id="ransons-criteria-pancreatitis-severity-calculator-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Ranson’s Criteria Pancreatitis Severity Calculator
          </CardTitle>
          <CardDescription>
            Estimate acute pancreatitis severity and mortality risk using Ranson’s criteria.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input Ranson’s criteria summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="etiology"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Etiology of acute pancreatitis</FormLabel>
                      <FormControl>
                        <select
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value as FormValues['etiology'])}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="non-gallstone">Non-gallstone (e.g., alcohol, triglycerides, other)</option>
                          <option value="gallstone">Gallstone pancreatitis</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="criteriaAtAdmissionMet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of admission criteria met (0–5)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 2"
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
                  name="criteriaAt48hMet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of 48-hour criteria met (0–6)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 1"
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
                Calculate Ranson’s severity
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
            <CardDescription>See total Ranson’s criteria count, severity category, and guidance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total criteria met</p>
                <p className="text-2xl font-semibold text-primary">{result.totalCriteria}</p>
                <p className="text-xs text-muted-foreground">Out of 11 possible</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Severity category</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.severityCategory}</p>
                <p className="text-xs text-muted-foreground">Mild / Moderate / Severe</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Estimated mortality risk</p>
                <p className="text-2xl font-semibold text-primary">
                  {result.mortalityRiskPercent.toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Approximate in-hospital</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Summary</p>
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
            <strong>Total Ranson’s score</strong> = number of criteria present at admission (0–5) + number of criteria
            present at 48 hours (0–6).
          </p>
          <p>
            <strong>Risk interpretation (simplified)</strong>: 0–2 criteria ≈ mild disease with low mortality; 3–4
            criteria ≈ moderately severe disease with intermediate mortality; ≥5 criteria ≈ severe disease with high
            mortality.
          </p>
          <p>
            Original Ranson’s criteria use slightly different variables and thresholds for gallstone versus non-gallstone
            pancreatitis; this tool focuses on the total count and typical risk bands for clarity.
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
                <p className="text-sm text-muted-foreground">Risk band</p>
                <p className="text-xl font-semibold text-primary capitalize">{result.severityCategory}</p>
                <p className="text-xs text-muted-foreground">Relative severity</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Monitoring level</p>
                <p className="text-xs text-muted-foreground">
                  Higher scores suggest need for high-dependency or intensive care and frequent reassessment.
                </p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Clinical focus</p>
                <p className="text-xs text-muted-foreground">
                  Emphasize early fluid resuscitation, organ support, and etiologic treatment regardless of score.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Enter admission and 48-hour criteria counts to see total Ranson’s score, severity band, and suggested
              management approach.
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
          content="Guide to Ranson’s Criteria: Assessing Severity in Acute Pancreatitis"
        />
        <meta
          itemProp="description"
          content="An overview of Ranson’s criteria for acute pancreatitis, explaining admission and 48-hour components, how to interpret total scores, and how to integrate the score with modern severity tools and bedside assessment."
        />
        <meta
          itemProp="keywords"
          content="Ranson’s criteria calculator, acute pancreatitis severity score, pancreatitis mortality risk, pancreatitis ICU triage"
        />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/ransons-criteria-pancreatitis-severity-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          Ranson’s Criteria for Acute Pancreatitis: From Bedside Score to Severity Strategy
        </h1>
        <p className="text-lg italic text-gray-700">
          Learn how Ranson’s criteria summarize early clinical and laboratory changes in acute pancreatitis, and how to
          use the score alongside modern tools to plan monitoring and care.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li>
            <a href="#overview-ranson" className="hover:underline">
              What are Ranson’s Criteria?
            </a>
          </li>
          <li>
            <a href="#admission-criteria-ranson" className="hover:underline">
              Admission Criteria and Early Assessment
            </a>
          </li>
          <li>
            <a href="#48h-criteria-ranson" className="hover:underline">
              48-Hour Criteria and Evolution of Severity
            </a>
          </li>
          <li>
            <a href="#modern-context-ranson" className="hover:underline">
              Using Ranson’s Criteria in the Modern Clinical Context
            </a>
          </li>
        </ul>
        <hr />

        <h2 id="overview-ranson" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          What are Ranson’s Criteria?
        </h2>
        <p>
          Ranson’s criteria are one of the earliest and most widely known severity scores for acute pancreatitis. They
          combine demographic, clinical, and laboratory variables measured at admission and at 48 hours to estimate the
          risk of local and systemic complications and in-hospital mortality. Despite being developed decades ago, the
          framework remains useful for teaching and for rough risk stratification, especially when combined with modern
          assessment tools.
        </p>

        <h2
          id="admission-criteria-ranson"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          Admission Criteria and Early Assessment
        </h2>
        <p>
          Admission criteria include age, white blood cell count, blood glucose, LDH, and AST, with slightly different
          thresholds depending on whether the pancreatitis is gallstone-related or not. These factors reflect the
          initial systemic response to pancreatic inflammation and help flag patients who may be at greater risk of
          deterioration. Our calculator lets you summarize how many admission criteria are met so you can quickly see
          whether the early picture is reassuring or worrisome.
        </p>

        <h2 id="48h-criteria-ranson" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          48-Hour Criteria and Evolution of Severity
        </h2>
        <p>
          The 48-hour criteria—changes in hematocrit and BUN, base deficit, serum calcium, arterial PO2, and estimated
          fluid sequestration—capture how the disease evolves after initial resuscitation. Worsening labs over this
          time frame signal ongoing third-spacing, inflammation, and potential organ dysfunction. Counting how many of
          these later criteria are met and adding them to the admission count yields the total Ranson’s score and
          corresponding mortality bands used in clinical practice and in this calculator.
        </p>

        <h2 id="modern-context-ranson" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Using Ranson’s Criteria in the Modern Clinical Context
        </h2>
        <p>
          Today, clinicians often complement Ranson’s criteria with simpler scores like BISAP, comprehensive systems
          like APACHE II, and bedside measures such as persistent organ failure or SIRS. Imaging, particularly contrast
          CT, is used selectively to clarify etiology or detect complications. Rather than relying on a single score,
          best practice is to integrate multiple data points and to reassess frequently during the first few days,
          especially in patients with high Ranson’s scores or clinical instability.
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
          <p>
            This tool summarizes Ranson’s criteria into a total score, severity category, and approximate mortality risk
            for acute pancreatitis.
          </p>
          <p>
            It follows the same structure as the UV exposure calculator, with input, interactive results, formula,
            steps, additional calculations, related calculators, an expanded guide section, and 8–10 FAQs.
          </p>
          <p>
            Use it as an educational and decision-support aid alongside bedside clinical assessment and modern severity
            scoring systems.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


