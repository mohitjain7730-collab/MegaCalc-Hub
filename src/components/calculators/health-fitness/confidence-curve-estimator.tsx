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
  baselineConfidence: z.number({ invalid_type_error: 'Enter baseline confidence' }).min(0).max(10),
  currentConfidence: z.number({ invalid_type_error: 'Enter current confidence' }).min(0).max(10),
  challengeLevel: z.number({ invalid_type_error: 'Enter challenge level' }).min(0).max(10),
  supportLevel: z.number({ invalid_type_error: 'Enter support level' }).min(0).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  baselineConfidence: number;
  currentConfidence: number;
  challengeLevel: number;
  supportLevel: number;
  growthCurvePosition: number;
  projectedPeakConfidence: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Estimate a baseline confidence score (0â€“10) from an earlier stage in this area of life.',
  'Rate your current confidence (0â€“10) for the same area (work, study, relationships, etc.).',
  'Rate how challenging your current environment feels (0â€“10).',
  'Rate how supported you feel by people, tools, or resources (0â€“10).',
  'Review where you sit on the confidence curve and how to nudge it upward.',
];

const faqs = [
  {
    question: 'What is the â€œconfidence curveâ€?',
    answer:
      'The confidence curve represents how your confidence typically rises with practice and feedback, flattens, and sometimes dips under very high challenge or low support.',
  },
  {
    question: 'Why compare baseline and current confidence?',
    answer:
      'Seeing movement over time highlights growth you might overlook and reveals whether current challenges are stretching you or overwhelming you.',
  },
  {
    question: 'What does challenge level mean?',
    answer:
      'Challenge level captures how demanding the tasks or environment feel right nowâ€”high stakes, complexity, novelty, or pressure can all increase it.',
  },
  {
    question: 'What does support level mean?',
    answer:
      'Support includes mentors, friends, tools, training, and self-care that make handling challenges easier.',
  },
  {
    question: 'Is low confidence always bad?',
    answer:
      'No. Low confidence at the very beginning of a new skill or after a big change is normal; the important part is whether you have enough support to grow.',
  },
  {
    question: 'How can I use this estimator with coaching or therapy?',
    answer:
      'You can bring your curve position, challenge, and support ratings to sessions to design experiments that shift one variable at a time.',
  },
  {
    question: 'What is projected peak confidence?',
    answer:
      'It is an estimate of the confidence level you may reach if you maintain or slightly optimize current challenge and support for a period.',
  },
  {
    question: 'Can confidence drop even as skills grow?',
    answer:
      'Yes. Realizing how much there is to learn (the â€œvalley of competence awarenessâ€) can temporarily lower confidence before it rises again.',
  },
  {
    question: 'How often should I recalculate?',
    answer:
      'Monthly or after major changes in role, project, or environment. Seeing the curve move over time is more useful than focusing on a single reading.',
  },
  {
    question: 'Can I track multiple domains?',
    answer:
      'Yes. Run the calculator separately for different domains like work, relationships, or creative pursuits.',
  },
];

const relatedCalculators = [
  {
    name: 'Self-Esteem Growth Tracker',
    slug: 'self-esteem-growth-tracker',
    description: 'Track broader changes in self-esteem alongside confidence.',
  },
  {
    name: 'Motivation Momentum Calculator',
    slug: 'motivation-momentum-calculator',
    description: 'See how momentum interacts with confidence growth.',
  },
  {
    name: 'Resilience Score Calculator',
    slug: 'resilience-score-calculator',
    description: 'Assess resilience traits that buffer dips in confidence.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/confidence-curve-estimator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Confidence Curve Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Confidence Curve Estimator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate where you are on a confidence growth curve using baseline vs current ratings, challenge, and support.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const { baselineConfidence, currentConfidence, challengeLevel, supportLevel } = values;

  const normalizedChallenge = challengeLevel / 10;
  const normalizedSupport = supportLevel / 10;

  // Ideal zone: challenge ~0.6â€“0.8, support ~0.6â€“0.9
  const challengeDistance = Math.abs(normalizedChallenge - 0.7);
  const supportDistance = Math.abs(normalizedSupport - 0.75);

  const curveFit = clamp(1 - (challengeDistance + supportDistance) / 2, 0, 1); // 0â€“1
  const growthCurvePosition = clamp(curveFit * 100, 0, 100);

  const delta = currentConfidence - baselineConfidence;
  const projectedPeakConfidence = clamp(currentConfidence + curveFit * 2 - (challengeDistance > 0.4 ? 0.5 : 0), 0, 10);

  let status: ResultPayload['status'] = 'good';
  let interpretation =
    'This suggests a general lifestyle tendency where your confidence may feel reasonably supported by your current mix of challenge and support.';

  if (growthCurvePosition < 35 || currentConfidence <= 3) {
    status = 'low';
    interpretation =
      'This suggests a general lifestyle tendency where confidence around this area may feel lower right now. Tasks might feel big, support may feel thin, or both. You may consider smaller steps, extra guidance, or gentle practice to see what helps. This is a personal insight, not a medical evaluation.';
  } else if (growthCurvePosition < 60) {
    status = 'moderate';
    interpretation =
      'This suggests a general lifestyle tendency where you may feel on the growth curve but not yet in your most comfortable zone. Adjusting challenge or adding bits of support could help your confidence feel more steady.';
  } else if (growthCurvePosition >= 80 && currentConfidence >= baselineConfidence + 1) {
    status = 'optimal';
    interpretation =
      'This suggests a general lifestyle tendency where you may feel in a strong growth zone, with challenge and support feeling relatively balanced. Continuing realistic steps and occasional reflection on progress may feel encouraging.';
  }

  const recommendations: string[] = [
    'Clarify one specific skill or domain you are estimating; vague scopes make confidence harder to track.',
    'If challenge feels high, break tasks into smaller units or extend timelines rather than abandoning the goal.',
    'Deliberately increase support via feedback, mentorship, or better tools when you feel stuck.',
  ];

  if (challengeLevel > 8 && supportLevel < 5) {
    recommendations.push('You are likely in an over-challenge / under-support zone. Reduce demand or add support before expecting confidence to rise.');
  }

  if (currentConfidence < baselineConfidence - 1) {
    recommendations.push('Confidence has dipped compared to baseline. Reflect on what changed and whether expectations or comparisons shifted.');
  }

  const plan = [
    { label: 'This Week', detail: 'Name one specific domain and gather one piece of constructive feedback or support in that area.' },
    { label: 'This Month', detail: 'Run a small skills experiment that is slightly above your comfort zone while ensuring you have a safety net.' },
    { label: 'Ongoing', detail: 'Reassess confidence quarterly to see how adjustments to challenge and support reshape your curve.' },
  ];

  return {
    baselineConfidence,
    currentConfidence,
    challengeLevel,
    supportLevel,
    growthCurvePosition: Number(growthCurvePosition.toFixed(1)),
    projectedPeakConfidence: Number(projectedPeakConfidence.toFixed(1)),
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function ConfidenceCurveEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      baselineConfidence: undefined,
      currentConfidence: undefined,
      challengeLevel: undefined,
      supportLevel: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="confidence-curve-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Confidence Curve Estimator
          </CardTitle>
          <CardDescription>Estimate where you are on the confidence growth curve for a chosen domain.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your confidence data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="baselineConfidence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Baseline confidence (0â€“10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentConfidence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current confidence (0â€“10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 6.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="challengeLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Challenge level (0â€“10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="supportLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Support level (0â€“10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 5.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Estimate confidence curve
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
            <CardDescription>See curve position, projected peak confidence, and coaching prompts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Curve position</p>
                <p className="text-2xl font-semibold text-primary">{result.growthCurvePosition}</p>
                <p className="text-xs text-muted-foreground">0â€“100 scale</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Projected peak</p>
                <p className="text-2xl font-semibold text-primary">{result.projectedPeakConfidence}</p>
                <p className="text-xs text-muted-foreground">Confidence (0â€“10)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Delta vs baseline</p>
                <p className="text-2xl font-semibold text-primary">
                  {(result.currentConfidence - result.baselineConfidence).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Current âˆ’ baseline</p>
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
            <strong>Curve position</strong> is based on how close your challenge and support scores are to a â€œgrowth zoneâ€ (around 7/10 challenge and 7.5/10 support), scaled to 0â€“100.
          </p>
          <p>
            <strong>Projected peak confidence</strong> adjusts current confidence upward based on curve fit, with small penalties when challenge is far above the sweet spot.
          </p>
          <p>
            These calculations are rough heuristics for coaching and self-reflection, not a substitute for formal assessment or therapy.
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
                <p className="text-sm text-muted-foreground">Challenge distance</p>
                <p className="text-xl font-semibold text-primary">
                  {Math.abs(result.challengeLevel / 10 - 0.7).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">From sweet spot</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Support distance</p>
                <p className="text-xl font-semibold text-primary">
                  {Math.abs(result.supportLevel / 10 - 0.75).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">From sweet spot</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Confidence utilization</p>
                <p className="text-xl font-semibold text-primary">
                  {baselineConfidenceToPercent(result.baselineConfidence, result.currentConfidence)}
                </p>
                <p className="text-xs text-muted-foreground">Current vs potential</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your data to see additional metrics.</p>
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
                <Link href={`/health-fitness/${calc.slug}`} className="text-primary hover:underline">
                  {calc.name}
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">{calc.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/MedicalWebPage">
        <meta itemProp="name" content="Confidence Curves: How Challenge and Support Shape Growth" />
        <meta itemProp="description" content="Understand how your confidence evolves over time, how challenge and support interact, and how to design conditions for steady growth." />
        <meta itemProp="keywords" content="confidence curve, growth mindset, challenge support balance, skill development" />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/definitive-confidence-curve-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          Confidence Curves: Finding Your Personal Growth Zone
        </h1>
        <p className="text-lg italic text-gray-700">
          Learn why confidence naturally rises, dips, and plateausâ€”and how to calibrate challenge and support so that your curve keeps trending upward.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li><a href="#curve-basics" className="hover:underline">Confidence Curve Basics</a></li>
          <li><a href="#challenge-support" className="hover:underline">Challenge and Support: The Two Levers</a></li>
          <li><a href="#dips" className="hover:underline">When Confidence Dips During Growth</a></li>
          <li><a href="#design" className="hover:underline">Designing Your Growth Zone</a></li>
          <li><a href="#reflection" className="hover:underline">Reflection Prompts</a></li>
        </ul>
        <hr />

        <h2 id="curve-basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Confidence Curve Basics
        </h2>
        <p>
          Most people experience confidence growth as a curve, not a straight lineâ€”slow progress at first, faster gains with practice, and then plateaus or dips when facing new challenges.
        </p>

        <h2 id="challenge-support" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Challenge and Support: The Two Levers
        </h2>
        <p>
          Too little challenge leads to boredom and underconfidence; too much challenge without support leads to overwhelm. The art is keeping challenge slightly above comfort while increasing support whenever stakes rise.
        </p>

        <h2 id="dips" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          When Confidence Dips During Growth
        </h2>
        <p>
          Realizing how much you do not knowâ€”common after learning the basicsâ€”can trigger a temporary dip. Normalizing this phase prevents you from mislabeling growth as failure.
        </p>

        <h2 id="design" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Designing Your Growth Zone
        </h2>
        <p>
          Adjust timelines, task difficulty, collaboration, and feedback channels to keep yourself near your personal sweet spot instead of at the extremes.
        </p>

        <h2 id="reflection" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Reflection Prompts
        </h2>
        <p>
          Ask: â€œWhere do I feel stretched but not broken? What support would make this challenge feel 20% easier? What would a small win look like this week?â€
        </p>

        <hr />
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Conclusion
        </h2>
        <p>
          Confidence growth is a partnership between you and your environment. Use this estimator to understand your curve and adjust the levers you can control.
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
            This calculator provides general wellness insights about your position on a confidence growth curve using
            baseline/current ratings, challenge, and support. This is a personal lifestyle insight, not a medical evaluation.
          </p>
          <p>Outputs include curve position, projected peak, qualitative status, recommendations, an action plan, and additional metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs make its reasoning transparent for humans and AI assistants.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Disclaimer
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is
            not a medical or psychological diagnosis. For any health concerns, please consult a qualified professional.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper for additional calculations
function baselineConfidenceToPercent(baseline: number, current: number): string {
  if (baseline <= 0) {
    return 'â€”';
  }
  const pct = ((current - baseline) / baseline) * 100;
  return `${pct.toFixed(1)}%`;
}


