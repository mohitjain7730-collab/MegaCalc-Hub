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
  congestiveHeartFailure: z.boolean().default(false),
  hypertension: z.boolean().default(false),
  age75OrMore: z.boolean().default(false),
  diabetes: z.boolean().default(false),
  priorStrokeOrTiaOrThromboembolism: z.boolean().default(false),
  vascularDisease: z.boolean().default(false),
  age65To74: z.boolean().default(false),
  femaleSex: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  totalScore: number;
  annualStrokeRiskPercent: number;
  riskCategory: 'low' | 'intermediate' | 'high';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Confirm that the patient has non-valvular atrial fibrillation or atrial flutter (intended population).',
  'Check each CHA2DS2-VASc risk factor and mark whether it is present for the patient.',
  'Sum the points to obtain a CHA2DS2-VASc score from 0–9.',
  'Map the score to an approximate annual stroke risk and risk category.',
  'Use the score, bleeding risk, and patient preferences to guide discussion about anticoagulation.',
];

const faqs = [
  {
    question: 'What is the CHA2DS2-VASc score used for?',
    answer:
      'The CHA2DS2-VASc score estimates the annual risk of stroke or systemic embolism in patients with non-valvular atrial fibrillation or atrial flutter. It helps clinicians decide whether oral anticoagulation is recommended.',
  },
  {
    question: 'How are points assigned in CHA2DS2-VASc?',
    answer:
      'One point is assigned for Congestive heart failure, Hypertension, Diabetes, Vascular disease, Age 65–74 years, and Sex category female. Two points are assigned for Age ≥ 75 years and prior Stroke/TIA/systemic embolism.',
  },
  {
    question: 'What is considered a low CHA2DS2-VASc score?',
    answer:
      'In many guidelines, a score of 0 in men or 1 in women is considered low risk, where anticoagulation may not be routinely recommended. However, thresholds differ slightly across guidelines and regions.',
  },
  {
    question: 'At what CHA2DS2-VASc score is anticoagulation generally recommended?',
    answer:
      'For most patients, oral anticoagulation is recommended for scores ≥ 2 in men and ≥ 3 in women, assuming acceptable bleeding risk. Scores of 1 in men or 2 in women warrant individualized discussion.',
  },
  {
    question: 'Can CHA2DS2-VASc be used without atrial fibrillation?',
    answer:
      'The score was derived in patients with atrial fibrillation and should not be applied to patients without AF for stroke risk estimation. Other tools or risk factors are used for different populations.',
  },
  {
    question: 'How accurate is CHA2DS2-VASc?',
    answer:
      'CHA2DS2-VASc provides a reasonably good ranking of relative risk, especially at lower scores, but absolute risk can vary by population and comorbidities. It should be viewed as a guide rather than an exact prediction.',
  },
  {
    question: 'What is the role of bleeding risk scores like HAS-BLED?',
    answer:
      'Bleeding risk scores, such as HAS-BLED, help identify modifiable bleeding risk factors and inform monitoring intensity. They are not intended to withhold anticoagulation in high-stroke-risk patients by themselves.',
  },
  {
    question: 'Should patients self-calculate their CHA2DS2-VASc score?',
    answer:
      'Patients may use tools like this for education, but treatment decisions must be made in consultation with a clinician who can interpret the score in context and weigh benefits and risks of anticoagulation.',
  },
  {
    question: 'Does a high CHA2DS2-VASc score guarantee a stroke will occur?',
    answer:
      'No. The score represents average risk in populations over one year, not a guarantee of outcome for an individual patient. Anticoagulation substantially reduces, but does not eliminate, stroke risk.',
  },
];

const relatedCalculators = [
  {
    name: 'HAS-BLED Bleeding Risk Calculator',
    slug: 'has-bled-bleeding-risk-calculator',
    description: 'Estimate major bleeding risk in patients on anticoagulation for atrial fibrillation.',
  },
  {
    name: 'Wells Score for DVT Probability Calculator',
    slug: 'wells-score-for-dvt-probability-calculator',
    description: 'Assess pre-test probability of lower-extremity deep vein thrombosis using the Wells rule.',
  },
  {
    name: 'CURB-65 Pneumonia Severity Score Calculator',
    slug: 'curb-65-pneumonia-severity-score-calculator',
    description: 'Stratify pneumonia severity and short-term mortality risk in adults.',
  },
  {
    name: 'Ranson’s Criteria Pancreatitis Severity Calculator',
    slug: 'ransons-criteria-pancreatitis-severity-calculator',
    description: 'Estimate severity and mortality risk in acute pancreatitis using Ranson’s criteria.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/cha2ds2-vasc-stroke-risk-score-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'CHA2DS2-VASc Stroke Risk Score Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'CHA2DS2-VASc Stroke Risk Score Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate annual stroke risk in atrial fibrillation using the CHA2DS2-VASc clinical risk score.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const estimateAnnualRisk = (score: number): number => {
  // Approximate annual stroke risk percentages from published cohorts (simplified)
  const table: Record<number, number> = {
    0: 0.2,
    1: 0.6,
    2: 2.2,
    3: 3.2,
    4: 4.8,
    5: 7.2,
    6: 9.7,
    7: 11.2,
    8: 12.5,
    9: 15.2,
  };
  return table[score] ?? 15.0;
};

const calculateResult = (values: FormValues): ResultPayload => {
  let totalScore = 0;

  if (values.congestiveHeartFailure) totalScore += 1;
  if (values.hypertension) totalScore += 1;
  if (values.age75OrMore) totalScore += 2;
  if (values.diabetes) totalScore += 1;
  if (values.priorStrokeOrTiaOrThromboembolism) totalScore += 2;
  if (values.vascularDisease) totalScore += 1;
  if (values.age65To74) totalScore += 1;
  if (values.femaleSex) totalScore += 1;

  if (totalScore > 9) totalScore = 9;

  const annualStrokeRiskPercent = clamp(estimateAnnualRisk(totalScore), 0, 100);

  let riskCategory: ResultPayload['riskCategory'] = 'low';
  let interpretation =
    'Low annual stroke risk by CHA2DS2-VASc. Anticoagulation may not be routinely recommended, depending on guideline and sex-specific thresholds.';

  if (totalScore >= 2 && totalScore <= 3) {
    riskCategory = 'intermediate';
    interpretation =
      'Intermediate annual stroke risk. Oral anticoagulation is usually recommended in most guidelines for scores at or above this level.';
  } else if (totalScore >= 4) {
    riskCategory = 'high';
    interpretation =
      'High annual stroke risk. Strong consideration for long-term oral anticoagulation is warranted, unless bleeding risk or preferences dictate otherwise.';
  }

  const recommendations: string[] = [];

  if (riskCategory === 'low') {
    recommendations.push(
      'Discuss the relatively low estimated stroke risk and consider withholding anticoagulation, especially in men with score 0 and women with score 1, per guideline thresholds.',
    );
  } else if (riskCategory === 'intermediate') {
    recommendations.push(
      'Discuss initiation of oral anticoagulation, reviewing absolute stroke risk reduction, bleeding risk, and patient values.',
    );
  } else {
    recommendations.push(
      'Recommend oral anticoagulation in the absence of contraindications, with shared decision-making about agent choice and monitoring.',
    );
  }

  recommendations.push(
    'Evaluate bleeding risk using a tool such as HAS-BLED, focusing on modifiable factors like uncontrolled blood pressure, concomitant medications, and alcohol use.',
  );
  recommendations.push(
    'Reassess stroke and bleeding risk periodically, especially if new comorbidities develop or age thresholds are crossed.',
  );

  const plan = [
    {
      label: 'Today',
      detail:
        'Confirm AF diagnosis, calculate CHA2DS2-VASc and HAS-BLED, and begin a shared decision-making conversation about anticoagulation.',
    },
    {
      label: 'Next Few Months',
      detail:
        'If anticoagulation is started, monitor adherence, tolerance, and bleeding; adjust therapy or address modifiable risk factors as needed.',
    },
    {
      label: 'Long Term',
      detail:
        'Reevaluate risk scores annually or when clinical status changes, ensuring that anticoagulation remains aligned with current risk-benefit balance.',
    },
  ];

  return {
    totalScore,
    annualStrokeRiskPercent,
    riskCategory,
    interpretation,
    recommendations,
    plan,
  };
};

export default function CHA2DS2VASCStrokeRiskScoreCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      congestiveHeartFailure: false,
      hypertension: false,
      age75OrMore: false,
      diabetes: false,
      priorStrokeOrTiaOrThromboembolism: false,
      vascularDisease: false,
      age65To74: false,
      femaleSex: false,
    },
  });

  return (
    <div className="space-y-8">
      <Script
        id="cha2ds2-vasc-stroke-risk-score-calculator-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            CHA2DS2-VASc Stroke Risk Score Calculator
          </CardTitle>
          <CardDescription>
            Estimate annual stroke risk in atrial fibrillation using the CHA2DS2-VASc clinical risk score.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input CHA2DS2-VASc factors</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(
                  [
                    {
                      name: 'congestiveHeartFailure',
                      label: 'Congestive heart failure or left ventricular dysfunction',
                    },
                    {
                      name: 'hypertension',
                      label: 'Hypertension (treated or untreated)',
                    },
                    {
                      name: 'age75OrMore',
                      label: 'Age ≥ 75 years',
                    },
                    {
                      name: 'diabetes',
                      label: 'Diabetes mellitus',
                    },
                    {
                      name: 'priorStrokeOrTiaOrThromboembolism',
                      label: 'Prior stroke, TIA, or systemic thromboembolism',
                    },
                    {
                      name: 'vascularDisease',
                      label: 'Vascular disease (MI, PAD, or aortic plaque)',
                    },
                    {
                      name: 'age65To74',
                      label: 'Age 65–74 years',
                    },
                    {
                      name: 'femaleSex',
                      label: 'Sex category: female',
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
                Calculate CHA2DS2-VASc score
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
            <CardDescription>See total CHA2DS2-VASc score, estimated stroke risk, and guidance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total CHA2DS2-VASc score</p>
                <p className="text-2xl font-semibold text-primary">{result.totalScore}</p>
                <p className="text-xs text-muted-foreground">Points (0–9)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Annual stroke risk</p>
                <p className="text-2xl font-semibold text-primary">
                  {result.annualStrokeRiskPercent.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Approximate per year</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Risk category</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.riskCategory}</p>
                <p className="text-xs text-muted-foreground">Low / Intermediate / High</p>
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
            <strong>CHA2DS2-VASc total score</strong> = 1 point each for congestive heart failure, hypertension,
            diabetes, vascular disease, age 65–74 years, and female sex, plus 2 points each for age ≥ 75 years and
            prior stroke/TIA/systemic embolism.
          </p>
          <p>
            <strong>Risk interpretation (simplified)</strong>: 0–1 points = low risk, 2–3 points = intermediate risk,
            ≥4 points = high risk, with rising annual stroke percentages across the range.
          </p>
          <p>
            The score is designed for non-valvular atrial fibrillation and should be combined with bleeding risk tools
            and clinical judgment when making anticoagulation decisions.
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
                <p className="text-sm text-muted-foreground">Relative risk tier</p>
                <p className="text-xl font-semibold text-primary capitalize">{result.riskCategory}</p>
                <p className="text-xs text-muted-foreground">Compared to baseline</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Anticoagulation signal</p>
                <p className="text-xs text-muted-foreground">
                  Higher scores generally strengthen the recommendation for long-term anticoagulation.
                </p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Counseling focus</p>
                <p className="text-xs text-muted-foreground">
                  Use the absolute risk percentage to explain potential benefit of anticoagulation in plain language.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Complete the CHA2DS2-VASc checklist to see estimated annual stroke risk and decision-support details.
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
          content="Guide to the CHA2DS2-VASc Stroke Risk Score: Anticoagulation Decisions in Atrial Fibrillation"
        />
        <meta
          itemProp="description"
          content="A practical guide to the CHA2DS2-VASc score, explaining each component, how to interpret total scores, and how to integrate the result with bleeding risk and patient preferences when choosing anticoagulation."
        />
        <meta
          itemProp="keywords"
          content="CHA2DS2-VASc calculator, atrial fibrillation stroke risk, anticoagulation decision tool, AFib risk stratification"
        />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/cha2ds2-vasc-stroke-risk-score-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          CHA2DS2-VASc Stroke Risk Score: Turning Atrial Fibrillation Risk Factors into Actionable Decisions
        </h1>
        <p className="text-lg italic text-gray-700">
          Understand how the CHA2DS2-VASc score combines age, comorbidities, and prior events into a simple numerical
          estimate of stroke risk that supports transparent anticoagulation decisions.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li>
            <a href="#overview-cha2ds2" className="hover:underline">
              Overview of the CHA2DS2-VASc Score
            </a>
          </li>
          <li>
            <a href="#components-cha2ds2" className="hover:underline">
              Components and Point Values
            </a>
          </li>
          <li>
            <a href="#interpretation-cha2ds2" className="hover:underline">
              Interpreting Scores and Risk Categories
            </a>
          </li>
          <li>
            <a href="#using-with-bleeding-risk" className="hover:underline">
              Using CHA2DS2-VASc with Bleeding Risk Scores
            </a>
          </li>
        </ul>
        <hr />

        <h2 id="overview-cha2ds2" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Overview of the CHA2DS2-VASc Score
        </h2>
        <p>
          The CHA2DS2-VASc score evolved from earlier stroke risk models to provide a more granular estimate of
          thromboembolic risk in patients with non-valvular atrial fibrillation. By including intermediate age bands
          and vascular disease, it better identifies truly low-risk patients and prevents under-treatment of those with
          multiple risk factors. The score is widely endorsed in major international guidelines and has become the
          standard framework for AF stroke prevention discussions.
        </p>

        <h2 id="components-cha2ds2" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Components and Point Values
        </h2>
        <p>
          Each letter of CHA2DS2-VASc corresponds to a risk factor: Congestive heart failure, Hypertension, Age
          thresholds, Diabetes, prior Stroke/TIA, Vascular disease, and Sex category. Higher age and prior
          stroke/TIA/systemic embolism receive double weight (2 points each) because they are especially powerful
          predictors of future stroke. Our calculator exposes each component as a separate checkbox so that learners can
          see how individual factors drive the total score.
        </p>

        <h2 id="interpretation-cha2ds2" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Interpreting Scores and Risk Categories
        </h2>
        <p>
          Scores at the lower end (0 in men, 1 in women) correspond to very low annual stroke risk, where the net
          benefit of anticoagulation is often small. Intermediate scores (2–3) mark patients where guidelines generally
          recommend anticoagulation, though the exact threshold can vary by region and sex. At higher scores (4 or
          more), stroke risk rises steeply and the benefit of anticoagulation is usually substantial, even when bleeding
          risk is non-trivial. The numeric percentage displayed by the calculator is a helpful conversation starter but
          should be interpreted in the context of contemporary cohort data and individual patient factors.
        </p>

        <h2 id="using-with-bleeding-risk" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Using CHA2DS2-VASc Alongside Bleeding Risk Scores
        </h2>
        <p>
          Stroke risk is only one side of the decision. Bleeding risk scores like HAS-BLED highlight factors such as
          uncontrolled hypertension, abnormal renal or liver function, prior bleeding, labile INR, age, and concomitant
          drugs or alcohol use. Rather than using high HAS-BLED scores to deny anticoagulation, guidelines emphasize
          addressing modifiable risks and closely monitoring vulnerable patients. Presenting CHA2DS2-VASc and HAS-BLED
          together allows clinicians to frame anticoagulation as a risk trade-off that can be actively managed rather
          than a binary yes/no choice.
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
            This tool calculates the CHA2DS2-VASc score from key clinical variables and estimates annual stroke risk in
            atrial fibrillation.
          </p>
          <p>
            It outputs a total score, risk percentage, risk tier, narrative interpretation, recommendations, and an
            action plan aligned with guideline-based decision-making.
          </p>
          <p>
            The structure, expanded guide, related calculators, and FAQs mirror the UV exposure calculator to keep the
            experience and documentation consistent.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


