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
  monthlyCost: z.number({ invalid_type_error: 'Enter monthly cost' }).min(0).max(2000),
  numberOfSupplements: z.number({ invalid_type_error: 'Enter count' }).min(0).max(40),
  perceivedBenefitScore: z.number({ invalid_type_error: 'Enter benefit score' }).min(0).max(10),
  evidenceQualityScore: z.number({ invalid_type_error: 'Enter evidence quality score' }).min(0).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  monthlyCost: number;
  numberOfSupplements: number;
  perceivedBenefitScore: number;
  evidenceQualityScore: number;
  roiScore: number;
  costPerBenefitPoint: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your total monthly cost for supplements in your stack.',
  'Enter how many distinct supplement products you use regularly.',
  'Rate your perceived benefit from the stack on a 0â€“10 scale.',
  'Rate the average evidence quality of your stack on a 0â€“10 scale (based on research and clinician guidance).',
  'Review your ROI score, cost-per-benefit, and practical recommendations.',
];

const faqs = [
  {
    question: 'What does the Supplement Stack ROI score actually represent?',
    answer:
      'The score is a simplified index that blends cost, perceived benefit, and evidence quality into one number. It is meant to help you compare relative value, not to provide a clinical verdict on any specific supplement.',
  },
  {
    question: 'Does a low ROI score mean my supplements are useless?',
    answer:
      'Not necessarily. A lower score can mean costs are high, benefits are modest, or evidence is limited. It is a prompt to review your stack, not an instruction to immediately stop any product.',
  },
  {
    question: 'How should I rate evidence quality for my stack?',
    answer:
      'Consider whether the supplements you use are supported by randomized trials, systematic reviews, clinical guidelines, and expert supervision, versus anecdotal reports or marketing claims. When in doubt, rate more conservatively.',
  },
  {
    question: 'Can this calculator replace professional medical or nutrition advice?',
    answer:
      'No. It is an educational tool. Supplement decisions should be made with a qualified clinician or dietitian who understands your labs, medications, and health history.',
  },
  {
    question: 'Why does perceived benefit matter if evidence is weak?',
    answer:
      'Perceived benefit may include placebo effects, lifestyle changes, or real benefits not yet fully quantified in research. It still matters to you personally, but strong evidence helps ensure benefits are reliable and safe.',
  },
  {
    question: 'Are expensive stacks always less efficient?',
    answer:
      'Not always, but high cost with low perceived benefit and low evidence quality typically reduces ROI. Strategic, well-supported core supplements often beat large, unfocused stacks.',
  },
  {
    question: 'How often should I reassess my supplement stack?',
    answer:
      'Revisit your stack every 3â€“6 months, or whenever your health goals, lab results, medications, or budget change. Use this calculator to track trends over time.',
  },
  {
    question: 'Can I use this tool for a single supplement instead of a full stack?',
    answer:
      'Yes. You can treat â€œnumber of supplementsâ€ as 1 and focus your ratings on that product alone. The score then reflects that individual item.',
  },
  {
    question: 'What if my clinician recommends something with low evidence?',
    answer:
      'There are times when clinicians use emerging or off-label strategies. Always prioritize the reasoning and safety guidance of your clinician over a generic scoring tool.',
  },
  {
    question: 'How do I improve my stack ROI without sacrificing health?',
    answer:
      'Focus on a few high-impact supplements matched to your lab markers and diagnoses, remove redundant or low-value items, and invest more in sleep, nutrition, and movement, which often provide higher long-term returns.',
  },
];

const relatedCalculators = [
  {
    name: 'Mitochondrial Health Index',
    slug: 'mitochondrial-health-index',
    description: 'Evaluate cellular energy status alongside your supplement strategy.',
  },
  {
    name: 'Longevity Score Estimator',
    slug: 'longevity-score-estimator',
    description: 'See how your habits and interventions align with long-term healthspan.',
  },
  {
    name: 'Fasting Benefits Progress Tracker',
    slug: 'fasting-benefits-progress-tracker',
    description: 'Track non-supplement lifestyle inputs that support metabolic health.',
  },
  {
    name: 'Sleep Optimization Routine Score',
    slug: 'sleep-optimization-routine-score',
    description: 'Compare supplement investments against foundational sleep habits.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/supplement-stack-roi-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Supplement Stack ROI Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Supplement Stack ROI Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description:
        'Estimate the return on investment of your supplement stack by balancing cost, perceived benefit, and evidence quality.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const { monthlyCost, numberOfSupplements, perceivedBenefitScore, evidenceQualityScore } = values;

  const benefitFactor = (perceivedBenefitScore / 10) * (0.6 + 0.4 * (evidenceQualityScore / 10));
  const normalizedCost = monthlyCost <= 0 ? 1 : monthlyCost;
  const stackComplexityPenalty = numberOfSupplements > 10 ? (numberOfSupplements - 10) * 0.03 : 0;

  const rawRoi = benefitFactor * 100 - Math.log10(normalizedCost + 1) * 18 - stackComplexityPenalty * 100;
  const roiScore = clamp(rawRoi, 0, 100);

  const costPerBenefitPoint =
    perceivedBenefitScore > 0 ? Number((monthlyCost / perceivedBenefitScore).toFixed(2)) : monthlyCost;

  let status: ResultPayload['status'] = 'moderate';
  let interpretation =
    'Your supplement ROI appears mixed. Some elements may be useful, but there may be opportunities to simplify or re-target your stack.';

  if (roiScore >= 75 && costPerBenefitPoint < 20) {
    status = 'optimal';
    interpretation =
      'Your stack appears relatively efficient: reasonable cost, meaningful perceived benefit, and moderate-to-strong evidence support.';
  } else if (roiScore >= 55) {
    status = 'good';
    interpretation =
      'Your stack provides fair value. You may be able to refine certain items to free budget while preserving benefits.';
  } else if (roiScore < 35 || costPerBenefitPoint > 50) {
    status = 'low';
    interpretation =
      'Your stack looks cost-heavy relative to perceived benefits and/or evidence. It may be worth a thorough review with a qualified professional.';
  }

  const recommendations: string[] = [
    'List every supplement you take, including dose, cost, and reason for use. Clarify which health goals each item supports.',
    'Group supplements into essentials (clinically indicated), experiments, and â€œnice to haveâ€ items to visualize priorities.',
    'Consider reallocating a portion of your supplement budget to sleep quality, whole foods, and movement, which often yield higher marginal gains.',
  ];

  if (numberOfSupplements > 12) {
    recommendations.push(
      'Your stack is relatively complex. Reducing overlap (multiple products doing the same job) can lower cost and improve adherence.'
    );
  }

  if (evidenceQualityScore < 5) {
    recommendations.push(
      'Evidence quality appears modest. Review systematic reviews, guidelines, or speak with an evidence-focused clinician to validate key items.'
    );
  }

  if (monthlyCost > 300) {
    recommendations.push(
      'High monthly spend suggests significant opportunity cost. Ensure these funds align with your highest health and financial priorities.'
    );
  }

  const plan = [
    {
      label: 'This Week',
      detail:
        'Create a supplement inventory with costs and reasons for use. Flag any items you cannot clearly justify.',
    },
    {
      label: 'This Month',
      detail:
        'Trial a simplified stack under professional supervision, focusing on the highest-evidence, highest-impact items while monitoring symptoms and labs.',
    },
    {
      label: 'Ongoing',
      detail:
        'Reassess your stack every 3â€“6 months, updating costs, benefits, and evidence as new research or life changes arise.',
    },
  ];

  return {
    monthlyCost,
    numberOfSupplements,
    perceivedBenefitScore,
    evidenceQualityScore,
    roiScore: Number(roiScore.toFixed(1)),
    costPerBenefitPoint,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function SupplementStackROICalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlyCost: undefined,
      numberOfSupplements: undefined,
      perceivedBenefitScore: undefined,
      evidenceQualityScore: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script
        id="supplement-stack-roi-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Supplement Stack ROI Calculator
          </CardTitle>
          <CardDescription>
            Estimate the return on investment of your current supplement stack by balancing cost, benefit, and evidence
            quality.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your supplement stack details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="monthlyCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total monthly cost (USD)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 150"
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
                  name="numberOfSupplements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of supplements in stack</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 8"
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
                  name="perceivedBenefitScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Perceived benefit (0â€“10)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="e.g., 7.5"
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
                  name="evidenceQualityScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Evidence quality (0â€“10)</FormLabel>
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
                Calculate supplement ROI
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
            <CardDescription>See ROI score, cost-per-benefit, and stack guidance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">ROI score</p>
                <p className="text-2xl font-semibold text-primary">{result.roiScore.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">0â€“100 scale</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Cost per benefit point</p>
                <p className="text-2xl font-semibold text-primary">${result.costPerBenefitPoint}</p>
                <p className="text-xs text-muted-foreground">Lower is better</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Supplements in stack</p>
                <p className="text-2xl font-semibold text-primary">{result.numberOfSupplements}</p>
                <p className="text-xs text-muted-foreground">Total active products</p>
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
            Formula
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Benefit factor</strong> combines your perceived benefit score (0â€“10) with an evidence-weighted
            modifier, giving more weight to stacks supported by higher-quality data.
          </p>
          <p>
            <strong>ROI score</strong> is scaled from 0â€“100 by rewarding higher benefit and evidence, while applying
            logarithmic penalties for higher monthly cost and additional penalties for very large stacks.
          </p>
          <p>
            <strong>Cost per benefit point</strong> helps you see how many dollars you spend for each point of perceived
            benefit, making it easier to compare alternative stacks or lifestyle investments.
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
                <p className="text-sm text-muted-foreground">Monthly cost</p>
                <p className="text-xl font-semibold text-primary">${result.monthlyCost.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Total spend</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Perceived benefit</p>
                <p className="text-xl font-semibold text-primary">{result.perceivedBenefitScore.toFixed(1)}/10</p>
                <p className="text-xs text-muted-foreground">Self-rated</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Evidence quality</p>
                <p className="text-xl font-semibold text-primary">{result.evidenceQualityScore.toFixed(1)}/10</p>
                <p className="text-xs text-muted-foreground">Higher = stronger data</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Enter your stack details to unlock additional financial and benefit insights.
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
                <Link href={`/${calc.slug}`} className="text-primary hover:underline">
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
        itemScope
        itemType="https://schema.org/MedicalWebPage"
      >
        <meta
          itemProp="name"
          content="Supplement Stack ROI: How to Evaluate the Real Value of Your Supplements"
        />
        <meta
          itemProp="description"
          content="Learn how to evaluate the financial, experiential, and scientific return on investment (ROI) of your supplement stack using structured questions and evidence-informed thinking."
        />
        <meta
          itemProp="keywords"
          content="supplement stack ROI calculator, supplement cost benefit analysis, evidence-based supplements, health investment, nutrition optimization"
        />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/supplement-stack-roi-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          Supplement Stack ROI: A Practical Guide to Evaluating the Real Value of Your Supplements
        </h1>
        <p className="text-lg italic text-gray-700">
          This guide walks you through a structured way to think about supplement costs, benefits, evidence quality, and
          opportunity cost so you can build a smarter, leaner, and more effective stack.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li>
            <a href="#why-roi-matters" className="hover:underline">
              Why Supplement ROI Matters for Long-Term Health and Finances
            </a>
          </li>
          <li>
            <a href="#cost-structure" className="hover:underline">
              Understanding the True Cost Structure of a Supplement Stack
            </a>
          </li>
          <li>
            <a href="#benefit-assessment" className="hover:underline">
              How to Honestly Assess Perceived Benefits
            </a>
          </li>
          <li>
            <a href="#evidence-quality" className="hover:underline">
              Evidence Quality: Sorting Hype from High-Confidence Interventions
            </a>
          </li>
          <li>
            <a href="#stack-design" className="hover:underline">
              Designing a Lean, High-Impact Stack with Professional Support
            </a>
          </li>
          <li>
            <a href="#tracking-adjusting" className="hover:underline">
              Tracking, Adjusting, and Avoiding Common Pitfalls
            </a>
          </li>
        </ul>

        <hr />

        <h2 id="why-roi-matters" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Why Supplement ROI Matters for Long-Term Health and Finances
        </h2>
        <p>
          Supplements can be powerful tools when they are targeted, evidence-informed, and integrated with medical care.
          However, many people accumulate large stacks over time that are expensive, redundant, or misaligned with their
          core health priorities. Evaluating return on investment (ROI) helps you redirect resources toward
          interventions that actually move the needle: high-quality sleep, nutrition, stress management, medical
          follow-up, and a few strategic supplements that fit your context.
        </p>
        <p>
          Thinking in ROI terms does not mean reducing health to moneyâ€”it means recognizing that every dollar and unit of
          attention you spend on a supplement is a dollar and unit of attention you cannot spend elsewhere. A thoughtful
          ROI framework encourages you to ask, â€œIs this product still earning its place in my routine?â€
        </p>

        <h2 id="cost-structure" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Understanding the True Cost Structure of a Supplement Stack
        </h2>
        <p>
          The most obvious cost is the monthly subscription or bottle price, but the true cost of a stack includes:
          direct spend, time spent ordering and organizing, mental overhead, and potential side effects or interactions.
          When you add opportunity costâ€”what you could have done with those funds insteadâ€”the picture becomes clearer.
        </p>
        <p>
          A simple way to begin is to calculate your monthly spend across all products and compare it to other health
          investments: a session with a dietitian, lab work, therapy, gym access, or sleep environment upgrades. Many
          people find that even small reductions in stack size free up resources to address root causes rather than
          symptoms.
        </p>

        <h2 id="benefit-assessment" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          How to Honestly Assess Perceived Benefits
        </h2>
        <p>
          Perceived benefit is subjective, but it is still meaningful. Start by tying each supplement to a specific,
          observable outcome: improved sleep onset, fewer migraines, energy consistency, or lab changes recommended by
          your clinician. Then, rate how strongly you believe the supplement is contributing to that outcome and whether
          the effect persists over time.
        </p>
        <p>
          Journaling or using simple tracking tools makes this process more objective. Rather than chasing short-term
          placebo spikes, look for patterns across weeks and months. If a supplement does not clearly justify its place
          after a fair trial and professional input, it may be a candidate for de-escalation.
        </p>

        <h2 id="evidence-quality" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Evidence Quality: Sorting Hype from High-Confidence Interventions
        </h2>
        <p>
          Evidence quality exists on a spectrum: from mechanistic plausibility and animal data, to small pilot trials,
          to large randomized controlled trials and guidelines. Higher-quality evidence does not guarantee an
          intervention is right for you, but it increases the probability that benefits outweigh risks for people
          similar to you.
        </p>
        <p>
          When scoring evidence, consider whether products are recommended in reputable clinical guidelines, supported by
          meta-analyses, and compatible with your diagnoses and medications. Be cautious of claims based solely on
          testimonials, influencer marketing, or â€œmiracle cureâ€ language. When in doubt, ask a clinician or clinical
          pharmacist to review your stack.
        </p>

        <h2 id="stack-design" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Designing a Lean, High-Impact Stack with Professional Support
        </h2>
        <p>
          A high-ROI stack is typically smaller and more focused than many people expect. For example, a core set might
          include nutrient repletion (deficiencies verified by labs), a targeted product for a diagnosed condition, and
          a few longevity or performance candidates vetted by your care team. Everything else is optional and should be
          treated as an experiment with clear start and stop criteria.
        </p>
        <p>
          Working with a clinician allows you to map each supplement to lab values, diagnoses, and medication lists.
          This approach reduces duplication, avoids risky interactions, and ensures that your supplement budget is
          contributing meaningfully to your broader treatment plan rather than operating in isolation.
        </p>

        <h2 id="tracking-adjusting" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Tracking, Adjusting, and Avoiding Common Pitfalls
        </h2>
        <p>
          A key principle of evidence-based self-care is iteration. Use this calculator as a snapshot, then track how
          your ROI score changes as you simplify or optimize your stack. Combine quantitative metrics (symptom scores,
          lab markers, HRV, sleep data) with qualitative notes (how you feel day-to-day) for a complete picture.
        </p>
        <p>
          Common pitfalls include adding new products without removing old ones, chasing every new trend, ignoring
          interactions, and letting marketing override clinical reasoning. A deliberate, ROI-focused approach helps you
          sidestep these traps while preserving the genuine advantages that good supplementation can offer.
        </p>

        <hr />
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Conclusion
        </h2>
        <p>
          Supplements can be valuable tools, but only when integrated thoughtfully into a broader health strategy. By
          examining cost, benefit, and evidence quality together, you can build a stack that respects both your biology
          and your budget. Use this calculator and guide as a conversation starter with your healthcare team, not as a
          replacement for individualized medical advice.
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
            This tool calculates a supplement stack ROI score from monthly cost, number of supplements, perceived
            benefit, and evidence quality.
          </p>
          <p>
            It provides ROI classification, cost-per-benefit metrics, practical recommendations, and an action plan so
            you can refine your stack more intelligently.
          </p>
          <p>
            Use it as an educational, budgeting, and conversation tool alongside guidance from qualified healthcare
            professionals.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}



