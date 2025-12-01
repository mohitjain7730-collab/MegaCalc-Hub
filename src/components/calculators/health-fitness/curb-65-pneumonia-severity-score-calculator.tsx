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
  confusion: z.boolean().default(false),
  ureaOver7: z.boolean().default(false),
  respiratoryRate30OrMore: z.boolean().default(false),
  lowBloodPressure: z.boolean().default(false),
  age65OrMore: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  totalScore: number;
  riskClass: 'low' | 'moderate' | 'high';
  estimatedMortalityPercent: number;
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Assess each CURB-65 criterion at initial evaluation of community-acquired pneumonia.',
  'Assign 1 point for each present item: new confusion, urea > 7 mmol/L, respiratory rate ≥ 30/min, low blood pressure, age ≥ 65 years.',
  'Sum the points to obtain the CURB-65 total score (0–5).',
  'Map the total score to low, moderate, or high risk groups with corresponding mortality estimates.',
  'Use risk group and overall clinical status to guide site-of-care decisions and monitoring intensity.',
];

const faqs = [
  {
    question: 'What is the CURB-65 score?',
    answer:
      'CURB-65 is a simple, validated clinical prediction rule used to assess severity and short-term mortality risk in adults with community-acquired pneumonia. It helps determine whether outpatient, inpatient, or intensive care management is appropriate.',
  },
  {
    question: 'What do the letters in CURB-65 stand for?',
    answer:
      'CURB-65 stands for Confusion, Urea > 7 mmol/L, Respiratory rate ≥ 30/min, low Blood pressure, and Age ≥ 65 years. Each present criterion contributes one point to the total score.',
  },
  {
    question: 'How are CURB-65 scores interpreted?',
    answer:
      'Typical interpretation: 0–1 points = low risk (often suitable for outpatient care), 2 points = moderate risk (consider short-stay or inpatient observation), and 3–5 points = high risk (usually warranting inpatient or intensive care evaluation).',
  },
  {
    question: 'Does CURB-65 replace clinical judgment?',
    answer:
      'No. CURB-65 supports but does not replace clinical judgment. Social factors, comorbidities, oxygenation, imaging, and laboratory data should all be integrated when making site-of-care decisions.',
  },
  {
    question: 'Can CURB-65 be used in younger patients?',
    answer:
      'Yes, but only the present criteria contribute to the score. Younger patients will not receive the age point but may have other severity markers such as tachypnea or hypotension.',
  },
  {
    question: 'Is CURB-65 valid in immunocompromised patients?',
    answer:
      'The score was primarily validated in immunocompetent adults with community-acquired pneumonia. In immunocompromised patients, risk may be underestimated and specialist input is often needed.',
  },
  {
    question: 'How does CURB-65 compare with PSI/PORT?',
    answer:
      'The Pneumonia Severity Index (PSI/PORT) uses more variables and may better discriminate low-risk patients, but CURB-65 is much simpler and easier to apply at the bedside. Many clinicians use both tools or choose one based on workflow.',
  },
  {
    question: 'Should CURB-65 guide antibiotic choice?',
    answer:
      'CURB-65 is primarily for risk stratification and disposition planning, not for selecting a specific antibiotic regimen. Local guidelines, resistance patterns, and patient factors should drive antibiotic selection.',
  },
  {
    question: 'Can patients use CURB-65 to decide whether to go to the hospital?',
    answer:
      'No. This calculator is intended for trained clinicians. Patients with suspected pneumonia should seek professional evaluation rather than relying on self-assessment tools.',
  },
];

const relatedCalculators = [
  {
    name: 'PaO2/FiO2 Ratio Calculator',
    slug: 'pao2-fio2-ratio-calculator',
    description: 'Evaluate oxygenation and ARDS severity from arterial blood gas and FiO2.',
  },
  {
    name: 'Tidal Volume by Ideal Body Weight Calculator',
    slug: 'tidal-volume-by-ideal-body-weight-calculator',
    description: 'Plan lung-protective ventilation using ideal body weight based tidal volumes.',
  },
  {
    name: 'CHA2DS2-VASc Stroke Risk Score Calculator',
    slug: 'cha2ds2-vasc-stroke-risk-score-calculator',
    description: 'Estimate thromboembolic risk in atrial fibrillation for long-term planning.',
  },
  {
    name: 'HAS-BLED Bleeding Risk Calculator',
    slug: 'has-bled-bleeding-risk-calculator',
    description: 'Assess bleeding risk in anticoagulated patients with atrial fibrillation.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/curb-65-pneumonia-severity-score-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'CURB-65 Pneumonia Severity Score Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'CURB-65 Pneumonia Severity Score Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate the CURB-65 score to assess community-acquired pneumonia severity and mortality risk.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const totalScore = [
    values.confusion,
    values.ureaOver7,
    values.respiratoryRate30OrMore,
    values.lowBloodPressure,
    values.age65OrMore,
  ].filter(Boolean).length;

  let riskClass: ResultPayload['riskClass'] = 'low';
  let estimatedMortalityPercent = 1;
  let interpretation =
    'Low-risk community-acquired pneumonia by CURB-65. Many patients in this group can be managed as outpatients if no other concerning features are present.';

  if (totalScore === 2) {
    riskClass = 'moderate';
    estimatedMortalityPercent = 9;
    interpretation =
      'Moderate-risk pneumonia. Short inpatient observation or hospital admission is often appropriate, especially if comorbidities or social factors are present.';
  } else if (totalScore >= 3) {
    riskClass = 'high';
    estimatedMortalityPercent = 20;
    interpretation =
      'High-risk pneumonia with substantial mortality risk. Hospital admission and consideration of higher-level care are usually warranted.';
  }

  const normalizedMortality = clamp(estimatedMortalityPercent, 0, 100);

  const recommendations: string[] = [];
  if (riskClass === 'low') {
    recommendations.push(
      'Evaluate for outpatient management with oral antibiotics, clear safety-net instructions, and reliable follow-up.',
    );
  } else if (riskClass === 'moderate') {
    recommendations.push(
      'Consider hospital admission or short-stay observation; monitor vitals, oxygenation, and response to therapy closely.',
    );
  } else {
    recommendations.push(
      'Admit to hospital, assess need for intensive care or step-down monitoring, and initiate guideline-concordant intravenous antibiotics promptly.',
    );
  }

  recommendations.push(
    'Incorporate oxygen saturation, radiographic findings, comorbidities, and social support into disposition decisions.',
  );
  recommendations.push('Use CURB-65 as a decision aid, not a substitute for comprehensive clinical assessment.');

  const plan = [
    {
      label: 'Initial Evaluation',
      detail:
        'Calculate CURB-65, obtain vital signs and oxygen saturation, review comorbidities, and start empiric antibiotics according to local guidelines.',
    },
    {
      label: 'Next 24–48 Hours',
      detail:
        'Monitor for clinical stability criteria (vitals, oxygen need, oral intake, mental status) to guide safe discharge or escalation of care.',
    },
    {
      label: 'Longer Term',
      detail:
        'Reassess vaccination status (influenza, pneumococcal), smoking cessation needs, and chronic lung disease management to reduce recurrence risk.',
    },
  ];

  return {
    totalScore,
    riskClass,
    estimatedMortalityPercent: normalizedMortality,
    interpretation,
    recommendations,
    plan,
  };
};

export default function CURB65PneumoniaSeverityScoreCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      confusion: false,
      ureaOver7: false,
      respiratoryRate30OrMore: false,
      lowBloodPressure: false,
      age65OrMore: false,
    },
  });

  return (
    <div className="space-y-8">
      <Script
        id="curb-65-pneumonia-severity-score-calculator-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            CURB-65 Pneumonia Severity Score Calculator
          </CardTitle>
          <CardDescription>
            Calculate the CURB-65 score to assess pneumonia severity and short-term mortality risk.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input CURB-65 criteria</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(
                  [
                    {
                      name: 'confusion',
                      label: 'New confusion (disorientation to person, place, or time)',
                    },
                    {
                      name: 'ureaOver7',
                      label: 'Blood urea nitrogen &gt; 7 mmol/L (or BUN &gt; 19 mg/dL)',
                    },
                    {
                      name: 'respiratoryRate30OrMore',
                      label: 'Respiratory rate ≥ 30 breaths per minute',
                    },
                    {
                      name: 'lowBloodPressure',
                      label: 'Systolic BP &lt; 90 mmHg or diastolic BP ≤ 60 mmHg',
                    },
                    {
                      name: 'age65OrMore',
                      label: 'Age ≥ 65 years',
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
                Calculate CURB-65 score
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
            <CardDescription>See total CURB-65 score, risk group, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total CURB-65 score</p>
                <p className="text-2xl font-semibold text-primary">{result.totalScore}</p>
                <p className="text-xs text-muted-foreground">Points</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Risk class</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.riskClass}</p>
                <p className="text-xs text-muted-foreground">Low / Moderate / High</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Estimated mortality</p>
                <p className="text-2xl font-semibold text-primary">{result.estimatedMortalityPercent}%</p>
                <p className="text-xs text-muted-foreground">Short-term risk</p>
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
            <strong>Total CURB-65 score</strong> = sum of present criteria: Confusion, Urea &gt; 7 mmol/L, Respiratory
            rate ≥ 30/min, low Blood pressure, Age ≥ 65 years (1 point each).
          </p>
          <p>
            <strong>Risk groups (typical)</strong>: 0–1 points = low risk; 2 points = moderate risk; 3–5 points = high
            risk of short-term mortality in community-acquired pneumonia.
          </p>
          <p>
            The score is used alongside clinical judgment and additional investigations to guide site-of-care and
            intensity of monitoring, not as a stand-alone decision rule.
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
                <p className="text-sm text-muted-foreground">Mortality band</p>
                <p className="text-xl font-semibold text-primary">
                  {result.riskClass === 'low' ? 'Low' : result.riskClass === 'moderate' ? 'Moderate' : 'High'}
                </p>
                <p className="text-xs text-muted-foreground">Relative short-term risk</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Disposition hint</p>
                <p className="text-xs text-muted-foreground">
                  Use together with oxygenation, comorbidities, and social factors to decide outpatient vs inpatient
                  care.
                </p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Clinical context</p>
                <p className="text-xs text-muted-foreground">
                  Integrate with PSI/PORT scores, radiographic findings, and local protocols where applicable.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Complete the CURB-65 checklist to see mortality estimates and suggested management tiers.
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
          content="Guide to the CURB-65 Pneumonia Severity Score: Risk Stratification and Site-of-Care Decisions"
        />
        <meta
          itemProp="description"
          content="An accessible guide to the CURB-65 pneumonia severity score, explaining each criterion, risk groups, and how the score supports decisions about outpatient vs inpatient management."
        />
        <meta
          itemProp="keywords"
          content="CURB-65 calculator, pneumonia severity score, community-acquired pneumonia risk, inpatient vs outpatient decision, mortality risk assessment"
        />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/curb-65-pneumonia-severity-score-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          CURB-65 Pneumonia Severity Score: Understanding Risk and Disposition in Community-Acquired Pneumonia
        </h1>
        <p className="text-lg italic text-gray-700">
          Discover how the CURB-65 score turns five bedside findings into an actionable severity classification that
          helps clinicians decide who can be safely treated at home and who needs hospital care.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li>
            <a href="#what-is-curb65" className="hover:underline">
              What is the CURB-65 Score?
            </a>
          </li>
          <li>
            <a href="#criteria-curb65" className="hover:underline">
              Criteria and Point Structure
            </a>
          </li>
          <li>
            <a href="#interpretation-curb65" className="hover:underline">
              Risk Groups, Mortality, and Disposition
            </a>
          </li>
          <li>
            <a href="#limitations-curb65" className="hover:underline">
              Limitations and Clinical Judgment
            </a>
          </li>
        </ul>
        <hr />

        <h2 id="what-is-curb65" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          What is the CURB-65 Score?
        </h2>
        <p>
          CURB-65 is a quick bedside tool for adults with community-acquired pneumonia. It was developed to help
          clinicians estimate short-term mortality risk and decide whether a patient can be safely managed as an
          outpatient, requires brief observation, or should be admitted to hospital or intensive care. Because it uses
          only five readily available variables, it is easy to apply in emergency departments, urgent care, and
          inpatient settings worldwide.
        </p>

        <h2 id="criteria-curb65" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          CURB-65 Criteria and Point Structure
        </h2>
        <p>
          The score assigns 1 point for each of the following: new confusion, blood urea &gt; 7 mmol/L (or BUN &gt; 19
          mg/dL), respiratory rate ≥ 30 per minute, low blood pressure (systolic &lt; 90 or diastolic ≤ 60 mmHg), and
          age ≥ 65 years. These variables capture both acute physiological derangement and baseline vulnerability. By
          summing them, clinicians obtain a total score from 0 to 5 that correlates with increasing mortality risk.
        </p>

        <h2 id="interpretation-curb65" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Interpreting Risk Groups, Mortality, and Disposition
        </h2>
        <p>
          Lower scores (0–1) are associated with low mortality and often support outpatient care when combined with
          stable vital signs, adequate oxygenation, and reliable follow-up. A score of 2 indicates moderate risk and
          commonly prompts inpatient observation or a brief hospital stay. Scores of 3 or more signal high risk and are
          typically indications for hospital admission, with consideration of intensive care in the sickest patients.
          Our calculator translates the score into an approximate mortality percentage and descriptive guidance to
          support transparent decision-making.
        </p>

        <h2 id="limitations-curb65" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Limitations and the Role of Clinical Judgment
        </h2>
        <p>
          CURB-65 does not incorporate all factors that may influence risk, such as immunosuppression, multilobar
          radiographic involvement, or social determinants of health. It should be interpreted alongside other tools
          like the Pneumonia Severity Index, as well as imaging, laboratory findings, and bedside reassessment. The
          score is a starting point for conversation rather than a rigid rule, helping clinicians communicate risk and
          rationalize decisions with patients and teams.
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
          <p>This tool calculates the CURB-65 pneumonia severity score from five simple clinical criteria.</p>
          <p>
            Outputs include the total score, risk class, estimated mortality, interpretation, recommendations, and a
            structured action plan.
          </p>
          <p>
            Consistent structure, guide content, related tools, and FAQs mirror the UV exposure calculator so humans or
            AI assistants can interpret the methodology instantly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}