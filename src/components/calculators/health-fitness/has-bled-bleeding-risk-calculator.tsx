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

const formSchema = z.object({
  hypertension: z.boolean().default(false),
  abnormalRenalFunction: z.boolean().default(false),
  abnormalLiverFunction: z.boolean().default(false),
  strokeHistory: z.boolean().default(false),
  bleedingHistoryOrPredisposition: z.boolean().default(false),
  labileInr: z.boolean().default(false),
  elderlyAge65OrMore: z.boolean().default(false),
  drugsPredisposingToBleeding: z.boolean().default(false),
  alcoholUse: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  totalScore: number;
  riskCategory: 'low' | 'moderate' | 'high';
  annualMajorBleedingPercent: number;
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Confirm that the patient is on, or being considered for, long-term anticoagulation (e.g., for atrial fibrillation).',
  'Check each HAS-BLED risk factor and indicate whether it is present.',
  'Sum the points to obtain a HAS-BLED score from 0–9.',
  'Interpret the score as a flag for bleeding risk and an opportunity to modify reversible risk factors.',
  'Do not use the score alone to deny anticoagulation when stroke risk is high; instead, use it to guide closer follow-up and risk mitigation.',
];

const faqs = [
  {
    question: 'What does HAS-BLED stand for?',
    answer:
      'HAS-BLED is an acronym for Hypertension, Abnormal renal/liver function, Stroke, Bleeding history or predisposition, Labile INR, Elderly (age ≥ 65), and Drugs/alcohol that predispose to bleeding. Each component contributes 1 point.',
  },
  {
    question: 'What is the purpose of the HAS-BLED score?',
    answer:
      'The HAS-BLED score estimates the risk of major bleeding in patients on oral anticoagulation, particularly those with atrial fibrillation. It is primarily intended to highlight modifiable bleeding risk factors and identify patients needing closer monitoring.',
  },
  {
    question: 'How are HAS-BLED scores interpreted?',
    answer:
      'A score of 0–1 is generally considered low risk, 2 moderate risk, and ≥3 high risk. Higher scores indicate greater annual bleeding risk and a need for careful follow-up and optimization of modifiable factors.',
  },
  {
    question: 'Should a high HAS-BLED score prevent anticoagulation?',
    answer:
      'A high HAS-BLED score should not automatically lead to withholding anticoagulation in a patient with substantial stroke risk. Instead, clinicians should address modifiable bleeding risks, choose agents carefully, and arrange closer follow-up.',
  },
  {
    question: 'What are examples of modifiable bleeding risk factors?',
    answer:
      'Examples include uncontrolled hypertension, concomitant use of antiplatelet drugs or NSAIDs, excessive alcohol intake, poorly controlled INR on warfarin, and reversible causes of renal or liver dysfunction when possible.',
  },
  {
    question: 'Can HAS-BLED be used in patients not on anticoagulation?',
    answer:
      'It is most useful when considering or monitoring oral anticoagulation, but it can also be informative when estimating baseline bleeding risk in high-risk patients before starting therapy.',
  },
  {
    question: 'Is HAS-BLED validated for direct oral anticoagulants (DOACs)?',
    answer:
      'HAS-BLED was initially developed in warfarin-treated patients but has also been studied in cohorts using DOACs. It still helps identify patients at higher bleeding risk, though absolute rates may differ between agents.',
  },
  {
    question: 'How often should HAS-BLED be reassessed?',
    answer:
      'Bleeding risk can change over time as blood pressure, renal and liver function, medications, and age evolve. Reassessing HAS-BLED periodically, such as annually or when clinical status changes, is reasonable.',
  },
  {
    question: 'Is there a “safe” HAS-BLED score?',
    answer:
      'No score guarantees absence of bleeding. Even low-risk patients can experience events, and high-risk patients may never bleed. The score is a tool for relative risk stratification and management planning.',
  },
];

const relatedCalculators = [
  {
    name: 'CHA2DS2-VASc Stroke Risk Score Calculator',
    slug: 'cha2ds2-vasc-stroke-risk-score-calculator',
    description: 'Estimate stroke risk in atrial fibrillation to balance against bleeding risk.',
  },
  {
    name: 'Wells Score for DVT Probability Calculator',
    slug: 'wells-score-for-dvt-probability-calculator',
    description: 'Assess pre-test probability of deep vein thrombosis and guide imaging decisions.',
  },
  {
    name: 'CURB-65 Pneumonia Severity Score Calculator',
    slug: 'curb-65-pneumonia-severity-score-calculator',
    description: 'Classify pneumonia severity and short-term mortality risk for disposition planning.',
  },
  {
    name: 'Ranson’s Criteria Pancreatitis Severity Calculator',
    slug: 'ransons-criteria-pancreatitis-severity-calculator',
    description: 'Estimate acute pancreatitis severity and monitor early clinical trajectory.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/has-bled-bleeding-risk-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'HAS-BLED Bleeding Risk Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'HAS-BLED Bleeding Risk Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate major bleeding risk in anticoagulated patients using the HAS-BLED score.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const estimateAnnualBleedingRisk = (score: number): number => {
  if (score <= 0) return 1;
  if (score === 1) return 1.5;
  if (score === 2) return 2.5;
  if (score === 3) return 4;
  if (score === 4) return 6;
  if (score === 5) return 8;
  return 10;
};

const calculateResult = (values: FormValues): ResultPayload => {
  const totalScore = [
    values.hypertension,
    values.abnormalRenalFunction,
    values.abnormalLiverFunction,
    values.strokeHistory,
    values.bleedingHistoryOrPredisposition,
    values.labileInr,
    values.elderlyAge65OrMore,
    values.drugsPredisposingToBleeding,
    values.alcoholUse,
  ].filter(Boolean).length;

  const annualMajorBleedingPercent = clamp(estimateAnnualBleedingRisk(totalScore), 0, 100);

  let riskCategory: ResultPayload['riskCategory'] = 'low';
  let interpretation =
    'Low estimated annual major bleeding risk. Standard anticoagulation monitoring and periodic reassessment are usually sufficient.';

  if (totalScore === 2) {
    riskCategory = 'moderate';
    interpretation =
      'Moderate bleeding risk. Anticoagulation can still provide net benefit in many patients but warrants attention to modifiable risk factors and closer follow-up.';
  } else if (totalScore >= 3) {
    riskCategory = 'high';
    interpretation =
      'High bleeding risk. This should trigger careful review of modifiable factors, closer monitoring, and shared decision-making, but does not automatically preclude anticoagulation when stroke risk is high.';
  }

  const recommendations: string[] = [];

  if (riskCategory === 'low') {
    recommendations.push('Continue routine anticoagulation monitoring and reinforce adherence and safety education.');
  } else if (riskCategory === 'moderate') {
    recommendations.push(
      'Identify and address modifiable bleeding risk factors such as uncontrolled blood pressure or interacting medications.',
    );
  } else {
    recommendations.push(
      'Consider more frequent follow-up, tighter blood pressure control, medication review, and patient education about bleeding warning signs.',
    );
  }

  recommendations.push(
    'Use HAS-BLED together with CHA2DS2-VASc so that stroke and bleeding risks are considered side by side.',
  );
  recommendations.push(
    'Educate patients about when to seek urgent care (e.g., major bleeding, head injury, black or bloody stools, vomiting blood).',
  );

  const plan = [
    {
      label: 'Today',
      detail:
        'Review HAS-BLED score with the patient, highlight modifiable risks, and confirm that anticoagulation decisions align with stroke risk and preferences.',
    },
    {
      label: 'Next Visits',
      detail:
        'Monitor blood pressure, renal and liver function, and medication list; adjust therapy to minimize bleeding risk without sacrificing stroke prevention.',
    },
    {
      label: 'Ongoing',
      detail:
        'Recalculate HAS-BLED periodically and update the care plan as risk factors change over time, maintaining open communication with the patient.',
    },
  ];

  return {
    totalScore,
    riskCategory,
    annualMajorBleedingPercent,
    interpretation,
    recommendations,
    plan,
  };
};

export default function HASBLEDBleedingRiskCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hypertension: false,
      abnormalRenalFunction: false,
      abnormalLiverFunction: false,
      strokeHistory: false,
      bleedingHistoryOrPredisposition: false,
      labileInr: false,
      elderlyAge65OrMore: false,
      drugsPredisposingToBleeding: false,
      alcoholUse: false,
    },
  });

  return (
    <div className="space-y-8">
      <Script
        id="has-bled-bleeding-risk-calculator-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            HAS-BLED Bleeding Risk Calculator
          </CardTitle>
          <CardDescription>
            Estimate major bleeding risk in anticoagulated patients using the HAS-BLED score.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input HAS-BLED factors</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(
                  [
                    {
                      name: 'hypertension',
                      label: 'Uncontrolled hypertension (e.g., systolic BP &gt; 160 mmHg)',
                    },
                    {
                      name: 'abnormalRenalFunction',
                      label: 'Abnormal renal function (dialysis, transplant, or creatinine markedly elevated)',
                    },
                    {
                      name: 'abnormalLiverFunction',
                      label: 'Abnormal liver function (cirrhosis, bilirubin/enzymes significantly elevated)',
                    },
                    {
                      name: 'strokeHistory',
                      label: 'History of stroke',
                    },
                    {
                      name: 'bleedingHistoryOrPredisposition',
                      label: 'History of major bleeding or bleeding predisposition',
                    },
                    {
                      name: 'labileInr',
                      label: 'Labile INR (on warfarin) with time in therapeutic range &lt; 60%',
                    },
                    {
                      name: 'elderlyAge65OrMore',
                      label: 'Elderly (age ≥ 65 years)',
                    },
                    {
                      name: 'drugsPredisposingToBleeding',
                      label: 'Concomitant drugs predisposing to bleeding (e.g., antiplatelets, NSAIDs)',
                    },
                    {
                      name: 'alcoholUse',
                      label: 'Excess alcohol use (e.g., ≥ 8 drinks/week or alcohol abuse)',
                    },
                  ] as const
                ).map((fieldConfig) => (
                  <FormField
                    key={fieldConfig.name}
                    control={form.control}
                    name={fieldConfig.name as keyof FormValues}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 border rounded p-3">
                        <FormControl>
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel className="font-normal">{fieldConfig.label}</FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate HAS-BLED score
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
            <CardDescription>See total HAS-BLED score, bleeding risk category, and guidance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total HAS-BLED score</p>
                <p className="text-2xl font-semibold text-primary">{result.totalScore}</p>
                <p className="text-xs text-muted-foreground">Points (0–9)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Risk category</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.riskCategory}</p>
                <p className="text-xs text-muted-foreground">Low / Moderate / High</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Annual major bleeding risk</p>
                <p className="text-2xl font-semibold text-primary">
                  {result.annualMajorBleedingPercent.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Approximate per year</p>
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
            <strong>HAS-BLED total score</strong> = sum of 1 point for each risk factor: uncontrolled Hypertension,
            Abnormal renal function, Abnormal liver function, prior Stroke, Bleeding history or predisposition, Labile
            INR, Elderly (age ≥ 65), Drugs predisposing to bleeding, and Alcohol use.
          </p>
          <p>
            <strong>Risk interpretation (simplified)</strong>: 0–1 points = low risk, 2 points = moderate risk, ≥3
            points = high risk of major bleeding on oral anticoagulation.
          </p>
          <p>
            The score is intended as a flag to highlight modifiable bleeding risk and guide monitoring, not as a reason
            by itself to withhold anticoagulation when stroke risk is high.
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
                <p className="text-sm text-muted-foreground">Relative bleeding tier</p>
                <p className="text-xl font-semibold text-primary capitalize">{result.riskCategory}</p>
                <p className="text-xs text-muted-foreground">Compared with baseline</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Monitoring intensity</p>
                <p className="text-xs text-muted-foreground">
                  Higher scores call for more frequent review, lab checks, and medication reconciliation.
                </p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Risk-benefit framing</p>
                <p className="text-xs text-muted-foreground">
                  Use bleeding and stroke scores side by side when explaining net benefits of anticoagulation.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Complete the HAS-BLED checklist to see estimated annual bleeding risk and practical management guidance.
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
          content="Guide to the HAS-BLED Score: Assessing Bleeding Risk on Anticoagulation"
        />
        <meta
          itemProp="description"
          content="A concise guide to the HAS-BLED bleeding risk score, explaining each component, how to interpret total scores, and how to use the result to modify risk factors and plan monitoring while balancing stroke prevention."
        />
        <meta
          itemProp="keywords"
          content="HAS-BLED calculator, bleeding risk score, anticoagulation safety, atrial fibrillation bleeding risk"
        />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/has-bled-bleeding-risk-score-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          HAS-BLED Bleeding Risk Score: Making Anticoagulation Safer Through Structured Risk Assessment
        </h1>
        <p className="text-lg italic text-gray-700">
          Learn how the HAS-BLED score identifies bleeding risk factors in anticoagulated patients and how to use it to
          reduce risk without denying effective stroke prevention.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li>
            <a href="#overview-hasbled" className="hover:underline">
              What is the HAS-BLED Score?
            </a>
          </li>
          <li>
            <a href="#components-hasbled" className="hover:underline">
              Components and Point Structure
            </a>
          </li>
          <li>
            <a href="#interpretation-hasbled" className="hover:underline">
              Interpreting Scores and Managing Risk
            </a>
          </li>
          <li>
            <a href="#balancing-risk-hasbled" className="hover:underline">
              Balancing Bleeding Risk with Stroke Prevention
            </a>
          </li>
        </ul>
        <hr />

        <h2 id="overview-hasbled" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          What is the HAS-BLED Score?
        </h2>
        <p>
          The HAS-BLED score was developed to provide a simple framework for estimating major bleeding risk in patients
          receiving oral anticoagulation, especially those with atrial fibrillation. Rather than serving as a
          gatekeeper to therapy, it is meant to flag patients who require more cautious management, targeted risk
          reduction, and structured follow-up. It complements, rather than competes with, stroke risk scores such as
          CHA2DS2-VASc.
        </p>

        <h2 id="components-hasbled" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Components and Point Structure
        </h2>
        <p>
          Each letter of HAS-BLED corresponds to a risk factor: uncontrolled hypertension, abnormal renal or liver
          function, prior stroke, history of bleeding or bleeding predisposition, labile INR, age ≥ 65 years, and drugs
          or alcohol that increase bleeding risk. Each item contributes one point, yielding a total score from 0 to 9.
          Several are modifiable; for example, blood pressure can be more tightly controlled, interacting drugs can be
          deprescribed, and alcohol intake can be reduced.
        </p>

        <h2 id="interpretation-hasbled" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Interpreting Scores and Managing Risk
        </h2>
        <p>
          Higher scores correlate with higher average annual major bleeding rates. A score of 0–1 suggests relatively
          low risk, 2 indicates moderate risk, and scores of 3 or more denote high risk. For patients with elevated
          scores, clinicians should prioritize addressing reversible causes, review all medications for potential
          interactions, optimize INR management for warfarin users, and plan more frequent monitoring. Our calculator
          displays an approximate annual risk percentage to support patient-centered discussions.
        </p>

        <h2 id="balancing-risk-hasbled" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Balancing Bleeding Risk with Stroke Prevention
        </h2>
        <p>
          In practice, the goal is not to avoid all bleeding at the cost of leaving patients unprotected from
          stroke. Instead, clinicians weigh stroke risk (CHA2DS2-VASc) against bleeding risk (HAS-BLED) and apply
          strategies to tip the balance in favor of benefit: choosing appropriate agents and doses, treating
          hypertension, limiting concurrent antiplatelets and NSAIDs, and counselling about alcohol moderation. By
          making risk factors explicit, HAS-BLED turns anticoagulation safety into a structured, proactive process
          rather than a passive hope.
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
            This tool calculates the HAS-BLED score to estimate major bleeding risk in patients receiving or
            considering anticoagulation.
          </p>
          <p>
            It outputs a total score, risk category, approximate annual bleeding risk, narrative interpretation,
            recommendations, and an action plan.
          </p>
          <p>
            The layout, expanded guide section, related calculators, and 8–10 FAQs mirror the UV exposure calculator to
            keep the user experience consistent.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


