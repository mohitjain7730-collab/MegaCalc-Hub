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
  activeCancer: z.boolean().default(false),
  paralysisOrImmobilization: z.boolean().default(false),
  bedriddenOrMajorSurgery: z.boolean().default(false),
  localizedTenderness: z.boolean().default(false),
  entireLegSwollen: z.boolean().default(false),
  calfSwelling: z.boolean().default(false),
  pittingEdema: z.boolean().default(false),
  collateralSuperficialVeins: z.boolean().default(false),
  alternativeDiagnosisMoreLikely: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  totalScore: number;
  probabilityCategory: 'low' | 'moderate' | 'high';
  approximateRiskPercent: number;
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Answer each Wells score item based on the patient’s presentation.',
  'Each present clinical feature scores +1 point; an alternative diagnosis more likely scores -2 points.',
  'Review the total Wells score and corresponding pre-test probability group.',
  'Use the probability group to guide further imaging, D-dimer testing, or observation.',
  'Always integrate clinical judgment and local protocols when acting on the score.',
];

const faqs = [
  {
    question: 'What is the Wells Score for DVT?',
    answer:
      'The Wells Score is a clinical prediction tool used to estimate the pre-test probability of deep vein thrombosis (DVT) based on simple bedside findings such as leg swelling, tenderness, recent surgery, and cancer history.',
  },
  {
    question: 'How is the Wells Score for DVT calculated?',
    answer:
      'Points are assigned for specific clinical features (such as active cancer, paralysis, localized tenderness, and unilateral calf swelling) and subtracted when an alternative diagnosis is more likely than DVT. The total score is then mapped to low, moderate, or high probability groups.',
  },
  {
    question: 'What are typical cutoffs for DVT probability?',
    answer:
      'Commonly, a Wells score of 0 or less suggests low probability, 1–2 suggests moderate probability, and 3 or more suggests high probability of DVT. Some institutions use a dichotomous model (≤1 low, ≥2 high) combined with D-dimer testing.',
  },
  {
    question: 'Can the Wells Score diagnose DVT on its own?',
    answer:
      'No. The Wells Score is a risk stratification tool that helps estimate probability, but DVT must be confirmed or excluded with objective imaging and/or laboratory testing according to clinical guidelines.',
  },
  {
    question: 'How does D-dimer testing fit with the Wells Score?',
    answer:
      'In low or moderate probability patients, a negative high-sensitivity D-dimer test can help safely exclude DVT without imaging in many protocols. In high probability patients, imaging is usually recommended regardless of D-dimer.',
  },
  {
    question: 'Can I use this calculator for upper-extremity DVT?',
    answer:
      'The original Wells Score was developed for lower-extremity DVT. Other tools and clinical considerations are recommended for suspected upper-extremity thrombosis.',
  },
  {
    question: 'Is the Wells Score reliable in all patient populations?',
    answer:
      'Performance may vary in special populations such as pregnant patients, postoperative patients, or those with recurrent DVT. Clinical judgment and local guidelines should always be applied.',
  },
  {
    question: 'Does anticoagulation start based only on the Wells Score?',
    answer:
      'Empiric anticoagulation may be started in high-probability patients when imaging is delayed, but decisions should follow institutional protocols, bleeding risk assessment, and physician judgment.',
  },
  {
    question: 'Should patients interpret their own Wells Score?',
    answer:
      'No. This calculator is for educational support and for use by clinicians. Patients should not self-diagnose or start or stop medications based on the Wells Score without consulting a healthcare professional.',
  },
];

const relatedCalculators = [
  {
    name: 'HAS-BLED Bleeding Risk Calculator',
    slug: 'has-bled-bleeding-risk-calculator',
    description: 'Estimate major bleeding risk in anticoagulated patients with atrial fibrillation.',
  },
  {
    name: 'CHA2DS2-VASc Stroke Risk Score Calculator',
    slug: 'cha2ds2-vasc-stroke-risk-score-calculator',
    description: 'Estimate stroke risk in atrial fibrillation to guide anticoagulation decisions.',
  },
  {
    name: 'Ranson’s Criteria Pancreatitis Severity Calculator',
    slug: 'ransons-criteria-pancreatitis-severity-calculator',
    description: 'Assess severity and mortality risk in acute pancreatitis using Ranson’s criteria.',
  },
  {
    name: 'CURB-65 Pneumonia Severity Score Calculator',
    slug: 'curb-65-pneumonia-severity-score-calculator',
    description: 'Stratify pneumonia severity and help guide disposition decisions.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/wells-score-for-dvt-probability-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Wells Score for DVT Probability Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Wells Score for DVT Probability Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate pre-test probability of deep vein thrombosis (DVT) using the Wells clinical prediction rule.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const positiveItems = [
    values.activeCancer,
    values.paralysisOrImmobilization,
    values.bedriddenOrMajorSurgery,
    values.localizedTenderness,
    values.entireLegSwollen,
    values.calfSwelling,
    values.pittingEdema,
    values.collateralSuperficialVeins,
  ].filter(Boolean).length;

  const negativeItems = values.alternativeDiagnosisMoreLikely ? -2 : 0;
  const totalScore = positiveItems + negativeItems;

  let probabilityCategory: ResultPayload['probabilityCategory'] = 'low';
  let approximateRiskPercent = 5;
  let interpretation =
    'Low pre-test probability of DVT by Wells criteria. Further evaluation may still be appropriate depending on symptoms and risk factors.';

  if (totalScore >= 3) {
    probabilityCategory = 'high';
    approximateRiskPercent = 60;
    interpretation =
      'High pre-test probability of DVT. Imaging and/or empiric anticoagulation should be considered according to guidelines and clinical judgment.';
  } else if (totalScore >= 1) {
    probabilityCategory = 'moderate';
    approximateRiskPercent = 20;
    interpretation =
      'Moderate pre-test probability of DVT. Further testing with D-dimer and/or compression ultrasonography is usually recommended.';
  }

  const normalizedRisk = clamp(approximateRiskPercent, 0, 100);

  const recommendations: string[] = [];

  if (probabilityCategory === 'low') {
    recommendations.push(
      'Consider high-sensitivity D-dimer testing in low-probability patients; a negative result may exclude DVT in many protocols.',
    );
  } else if (probabilityCategory === 'moderate') {
    recommendations.push(
      'Arrange appropriate imaging (e.g., compression ultrasound) and/or D-dimer testing based on local algorithms.',
    );
  } else {
    recommendations.push(
      'In high-probability patients, obtain urgent imaging. If imaging will be delayed and bleeding risk is acceptable, consider empiric anticoagulation.',
    );
  }

  recommendations.push(
    'Always incorporate bleeding risk, comorbidities, and patient preferences when deciding on anticoagulation.',
  );
  recommendations.push(
    'Use this score as a decision support tool, not a substitute for comprehensive clinical assessment.',
  );

  const plan = [
    {
      label: 'This Encounter',
      detail:
        'Use the Wells score category to stratify DVT risk, then follow your local diagnostic algorithm (D-dimer, ultrasound, or observation).',
    },
    {
      label: 'Short Term',
      detail:
        'If DVT is confirmed, initiate guideline-directed anticoagulation and evaluate for provoking factors or underlying thrombophilia as indicated.',
    },
    {
      label: 'Long Term',
      detail:
        'Reassess duration of anticoagulation based on whether the event was provoked or unprovoked, patient bleeding risk, and shared decision-making.',
    },
  ];

  return {
    totalScore,
    probabilityCategory,
    approximateRiskPercent: normalizedRisk,
    interpretation,
    recommendations,
    plan,
  };
};

export default function WellsScoreForDVTProbabilityCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      activeCancer: false,
      paralysisOrImmobilization: false,
      bedriddenOrMajorSurgery: false,
      localizedTenderness: false,
      entireLegSwollen: false,
      calfSwelling: false,
      pittingEdema: false,
      collateralSuperficialVeins: false,
      alternativeDiagnosisMoreLikely: false,
    },
  });

  return (
    <div className="space-y-8">
      <Script
        id="wells-score-for-dvt-probability-calculator-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Wells Score for DVT Probability Calculator
          </CardTitle>
          <CardDescription>
            Estimate pre-test probability of deep vein thrombosis (DVT) using the Wells clinical prediction rule.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input clinical features</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(
                  [
                    {
                      name: 'activeCancer',
                      label: 'Active cancer (treatment within 6 months or palliative)',
                    },
                    {
                      name: 'paralysisOrImmobilization',
                      label: 'Paralysis, paresis, or recent plaster immobilization of lower extremities',
                    },
                    {
                      name: 'bedriddenOrMajorSurgery',
                      label: 'Recently bedridden ≥3 days or major surgery within 12 weeks requiring anesthesia',
                    },
                    {
                      name: 'localizedTenderness',
                      label: 'Localized tenderness along distribution of deep venous system',
                    },
                    {
                      name: 'entireLegSwollen',
                      label: 'Entire leg swollen',
                    },
                    {
                      name: 'calfSwelling',
                      label: 'Calf swelling &gt; 3 cm compared with asymptomatic leg (10 cm below tibial tuberosity)',
                    },
                    {
                      name: 'pittingEdema',
                      label: 'Pitting edema confined to symptomatic leg',
                    },
                    {
                      name: 'collateralSuperficialVeins',
                      label: 'Collateral superficial (non-varicose) veins',
                    },
                    {
                      name: 'alternativeDiagnosisMoreLikely',
                      label: 'Alternative diagnosis at least as likely as DVT (scores -2)',
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
                Calculate Wells score
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
            <CardDescription>See total Wells score, probability category, and guidance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total Wells score</p>
                <p className="text-2xl font-semibold text-primary">{result.totalScore}</p>
                <p className="text-xs text-muted-foreground">Points</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Probability category</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.probabilityCategory}</p>
                <p className="text-xs text-muted-foreground">Low / Moderate / High</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Approximate risk</p>
                <p className="text-2xl font-semibold text-primary">{result.approximateRiskPercent}%</p>
                <p className="text-xs text-muted-foreground">Pre-test probability</p>
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
            <strong>Total Wells score</strong> = (number of present positive criteria × 1) - (2 points if an alternative diagnosis is at least as likely as DVT).
          </p>
          <p>
            <strong>Probability groups (typical cutoffs)</strong>: ≤0 points = low probability, 1–2 points = moderate probability, ≥3 points = high probability.
          </p>
          <p>
            The score is a structured way to quantify clinical suspicion and should be combined with D-dimer testing and imaging according to evidence-based
            guidelines.
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
                <p className="text-sm text-muted-foreground">Pre-test probability</p>
                <p className="text-xl font-semibold text-primary">{result.approximateRiskPercent}%</p>
                <p className="text-xs text-muted-foreground">Approximate risk of DVT</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Risk band</p>
                <p className="text-xl font-semibold text-primary capitalize">{result.probabilityCategory}</p>
                <p className="text-xs text-muted-foreground">Low / Moderate / High</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Clinical use</p>
                <p className="text-xs text-muted-foreground">
                  Use in combination with D-dimer testing and imaging pathways to safely rule in or rule out DVT.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Complete the Wells score checklist to see risk estimates and suggested next steps.
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
          content="The Definitive Guide to the Wells Score for DVT: Estimating Deep Vein Thrombosis Probability"
        />
        <meta
          itemProp="description"
          content="An evidence-based guide explaining the Wells Score for deep vein thrombosis (DVT), how to use the clinical criteria, interpret probability groups, and integrate the score with D-dimer testing and imaging pathways."
        />
        <meta
          itemProp="keywords"
          content="Wells score calculator, DVT probability tool, deep vein thrombosis clinical prediction rule, D-dimer decision pathway, venous thromboembolism risk"
        />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/definitive-wells-score-dvt-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          The Definitive Guide to the Wells Score for DVT: Estimating Deep Vein Thrombosis Probability
        </h1>
        <p className="text-lg italic text-gray-700">
          Learn how the Wells Score for deep vein thrombosis (DVT) combines simple bedside findings into a structured
          clinical prediction rule that supports safe, efficient diagnostic pathways.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li>
            <a href="#overview" className="hover:underline">
              What is the Wells Score for DVT?
            </a>
          </li>
          <li>
            <a href="#criteria" className="hover:underline">
              Wells Score Criteria and Point Values
            </a>
          </li>
          <li>
            <a href="#probability-groups" className="hover:underline">
              Probability Groups and Clinical Interpretation
            </a>
          </li>
          <li>
            <a href="#d-dimer" className="hover:underline">
              Integrating D-dimer Testing and Imaging
            </a>
          </li>
          <li>
            <a href="#limitations" className="hover:underline">
              Limitations, Special Populations, and Clinical Judgment
            </a>
          </li>
        </ul>
        <hr />

        <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          What is the Wells Score for Deep Vein Thrombosis?
        </h2>
        <p>
          The Wells Score for DVT is a validated clinical prediction rule that estimates a patient&apos;s pre-test
          probability of having a lower-extremity deep vein thrombosis. It was developed to reduce unnecessary imaging
          while maintaining safety by combining common clinical signs and risk factors into a simple point-based
          system. Rather than relying on gestalt alone, clinicians can use the Wells Score to categorize risk as low,
          moderate, or high and then apply evidence-based diagnostic algorithms.
        </p>

        <h2 id="criteria" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Wells Score Criteria and Point Values
        </h2>
        <p>
          Each Wells criterion reflects a clinical feature associated with increased DVT likelihood. In the original
          model, most items contribute +1 point, while an alternative diagnosis judged more likely than DVT subtracts 2
          points. Typical elements include recent cancer treatment, paralysis or immobilization, recent surgery or
          prolonged bed rest, localized tenderness along the deep venous system, unilateral leg swelling, and pitting
          edema. The checklist emphasizes reproducible bedside findings that can be quickly assessed in most care
          settings.
        </p>

        <h2 id="probability-groups" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Probability Groups and Clinical Interpretation
        </h2>
        <p>
          After summing the points, the total Wells score is mapped to probability bands. In a three-level system,
          scores of 0 or lower are considered low probability, 1–2 moderate probability, and 3 or more high probability
          for DVT. Some institutions use a dichotomous approach (≤1 low, ≥2 high). These categories correspond to
          approximate average risks and inform decisions about whether to obtain D-dimer testing, perform immediate
          ultrasound, or observe. The calculator in this page translates the score into a rough risk percentage and
          descriptive category to support interpretation.
        </p>

        <h2 id="d-dimer" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Integrating D-dimer Testing and Imaging
        </h2>
        <p>
          The greatest utility of the Wells Score emerges when combined with high-sensitivity D-dimer assays and
          compression ultrasonography. In low-probability patients, a negative D-dimer can safely exclude DVT in many
          protocols, avoiding unnecessary imaging. In moderate-risk patients, algorithms may call for D-dimer, serial
          ultrasound, or immediate imaging depending on clinical context. In high-risk patients, imaging is usually
          recommended regardless of D-dimer results, and empiric anticoagulation may be started if imaging is delayed
          and bleeding risk is acceptable.
        </p>

        <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Limitations, Special Populations, and Clinical Judgment
        </h2>
        <p>
          Like all clinical prediction rules, the Wells Score should not replace thoughtful clinical reasoning. Its
          performance may be different in populations that were underrepresented in derivation and validation studies,
          such as pregnant patients, those with recurrent thrombosis, or individuals with significant comorbidities.
          Local practice patterns, resource availability, and patient preferences must all be considered. The tool on
          this page is designed to make calculations transparent and reproducible so that clinicians and learners can
          focus on applying evidence-based pathways safely.
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
            This tool calculates the Wells Score for DVT from key clinical features and classifies risk into low,
            moderate, or high probability groups.
          </p>
          <p>
            Outputs include total score, approximate risk percentage, narrative interpretation, recommendations, and an
            action plan to support guideline-based care.
          </p>
          <p>
            Formula, steps, guide content, related tools, and FAQs ensure clinicians or AI assistants can interpret the
            methodology instantly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}