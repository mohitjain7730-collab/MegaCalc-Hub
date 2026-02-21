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
  fastingHoursPerDay: z.number({ invalid_type_error: 'Enter hours' }).min(0).max(24),
  fastingDaysPerWeek: z.number({ invalid_type_error: 'Enter days' }).min(0).max(7),
  weeksOnProtocol: z.number({ invalid_type_error: 'Enter weeks' }).min(0).max(52),
  metabolicHealthScore: z.number({ invalid_type_error: 'Enter metabolic score' }).min(0).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  fastingHoursPerDay: number;
  fastingDaysPerWeek: number;
  weeksOnProtocol: number;
  metabolicHealthScore: number;
  benefitsProgressScore: number;
  adaptationStageScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your average fasting window length per day (hours).',
  'Enter how many days per week you follow this fasting pattern.',
  'Enter how many weeks you have been on this protocol.',
  'Rate your current metabolic health or lab trends (weight, glucose, lipids, etc.) from 0–10.',
  'Review your fasting benefits progress and adaptation stage.',
];

const faqs = [
  {
    question: 'What does the Fasting Benefits Progress Tracker measure?',
    answer:
      'It estimates how far along you may be in realizing fasting-related benefits based on schedule, consistency, duration, and perceived metabolic improvements.',
  },
  {
    question: 'Is fasting safe for everyone?',
    answer:
      'No. People who are pregnant, have a history of eating disorders, diabetes on medications, or certain medical conditions should only fast under medical supervision.',
  },
  {
    question: 'Does this tool prescribe fasting plans?',
    answer:
      'No. It assumes you are already on a plan and simply tracks potential benefit progression. It does not replace professional guidance.',
  },
  {
    question: 'What fasting patterns does this cover?',
    answer:
      'Daily time-restricted eating, 5:2 approaches, or other structured patterns where you have consistent fasting windows.',
  },
  {
    question: 'How long before benefits typically appear?',
    answer:
      'Some people notice changes in energy or appetite within weeks; measurable metabolic changes can take months and vary widely.',
  },
  {
    question: 'Does longer fasting always mean more benefit?',
    answer:
      'Not necessarily. Overshooting can impair hormones, sleep, or recovery. Sustainable, safe patterns are more important than extremes.',
  },
  {
    question: 'Should I combine fasting with intense training?',
    answer:
      'Possibly, but timing and context matter. Work with a professional to avoid under-fueling or over-stressing your system.',
  },
  {
    question: 'Can I use this if I change protocols often?',
    answer:
      'Frequent changes may reduce adaptation. The tracker assumes some consistency; large shifts should reset your expectations.',
  },
  {
    question: 'What if my metabolic health score is low?',
    answer:
      'That suggests other levers (diet quality, sleep, movement, medication) may need attention alongside or instead of fasting.',
  },
  {
    question: 'Should I stop fasting if I feel worse?',
    answer:
      'Yes—pause and consult a professional if fasting worsens mood, sleep, energy, or health markers.',
  },
];

const relatedCalculators = [
  {
    name: 'Intermittent Fasting Calculator',
    slug: 'intermittent-fasting-calculator',
    description: 'Plan your fasting and eating windows precisely.',
  },
  {
    name: 'Calorie Deficit Calculator',
    slug: 'calorie-deficit-calculator',
    description: 'Align fasting with total energy intake goals.',
  },
  {
    name: 'Insulin Response Estimator',
    slug: 'insulin-response-estimator',
    description: 'Explore potential glycemic impacts of meals.',
  },
  {
    name: 'Longevity Score Estimator',
    slug: 'longevity-score-estimator',
    description: 'View fasting in the context of overall longevity habits.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/fasting-benefits-progress-tracker';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Fasting Benefits Progress Tracker', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Fasting Benefits Progress Tracker',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Track your potential fasting benefits over time using window length, frequency, duration, and metabolic response.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const { fastingHoursPerDay, fastingDaysPerWeek, weeksOnProtocol, metabolicHealthScore } = values;

  const windowFactor = clamp((fastingHoursPerDay - 10) / 6, 0, 1.5); // moderate–long windows
  const frequencyFactor = clamp(fastingDaysPerWeek / 5, 0, 1.2); // 5+ days/wk as reference
  const durationFactor = clamp(weeksOnProtocol / 8, 0, 1.5); // 8 weeks as early adaptation
  const metabolicFactor = metabolicHealthScore / 10;

  const benefitsProgressScore = clamp(
    (windowFactor * 25 + frequencyFactor * 25 + durationFactor * 25 + metabolicFactor * 25),
    0,
    100,
  );

  const adaptationStageScore = clamp(durationFactor * 50 + windowFactor * 25 + frequencyFactor * 25, 0, 100);

  let status: ResultPayload['status'] = 'good';
  let interpretation = 'You appear to be progressing through early fasting adaptation with potential benefits accumulating.';

  if (benefitsProgressScore >= 80 && weeksOnProtocol >= 12) {
    status = 'optimal';
    interpretation = 'Your pattern suggests substantial adaptation; further benefits may depend more on diet quality, sleep, and stress.';
  } else if (benefitsProgressScore < 40 || weeksOnProtocol < 4) {
    status = 'moderate';
    interpretation = 'You may be in very early stages; benefits can take time and require safe, consistent practice.';
  }

  if (metabolicHealthScore <= 3 && weeksOnProtocol > 8) {
    status = 'low';
    interpretation = 'Despite sustained fasting, metabolic improvements seem limited. Reevaluate approach with a clinician or dietitian.';
  }

  const recommendations: string[] = [
    'Focus on overall diet quality and adequate protein, not just meal timing.',
    'Avoid extreme fasting durations unless medically supervised.',
    'Monitor energy, mood, menstrual cycles (if applicable), and performance to ensure fasting supports rather than harms health.',
  ];

  if (fastingHoursPerDay >= 18 && fastingDaysPerWeek >= 5) {
    recommendations.push('Very long daily fasts can be demanding; consider cycling phases or shortening windows under guidance.');
  }

  if (weeksOnProtocol < 4) {
    recommendations.push('Give your body time to adapt before expecting large changes in markers or weight.');
  }

  if (metabolicHealthScore < 5) {
    recommendations.push('Collaborate with a clinician on labs (lipids, glucose, thyroid, etc.) and consider structured nutrition or activity changes.');
  }

  const plan = [
    { label: 'This Month', detail: 'Track fasting windows, energy, hunger, mood, and (if available) basic labs to see early patterns.' },
    { label: 'Next 3–6 Months', detail: 'Refine fasting schedule and nutrition with professional input, avoiding yo-yo patterns.' },
    { label: 'Ongoing', detail: 'Revisit fasting regularly as life stage, goals, and medical context evolve; fasting may not be needed indefinitely.' },
  ];

  return {
    fastingHoursPerDay,
    fastingDaysPerWeek,
    weeksOnProtocol,
    metabolicHealthScore,
    benefitsProgressScore: Number(benefitsProgressScore.toFixed(1)),
    adaptationStageScore: Number(adaptationStageScore.toFixed(1)),
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function FastingBenefitsProgressTracker() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fastingHoursPerDay: undefined,
      fastingDaysPerWeek: undefined,
      weeksOnProtocol: undefined,
      metabolicHealthScore: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="fasting-benefits-progress-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Fasting Benefits Progress Tracker
          </CardTitle>
          <CardDescription>Track how far along you may be in realizing fasting-related health benefits.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your fasting protocol</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fastingHoursPerDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fasting window per day (hours)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 16" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fastingDaysPerWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fasting days per week</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="weeksOnProtocol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weeks on this protocol</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 10" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="metabolicHealthScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Metabolic health / lab trend (0–10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 6.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Track fasting benefits progress
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
            <CardDescription>See benefits progress, adaptation stage, and strategic suggestions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Benefits progress</p>
                <p className="text-2xl font-semibold text-primary">{result.benefitsProgressScore}</p>
                <p className="text-xs text-muted-foreground">0–100 estimate</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Adaptation stage</p>
                <p className="text-2xl font-semibold text-primary">{result.adaptationStageScore}</p>
                <p className="text-xs text-muted-foreground">Higher = more adapted</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Weeks on protocol</p>
                <p className="text-2xl font-semibold text-primary">{result.weeksOnProtocol}</p>
                <p className="text-xs text-muted-foreground">Consistency marker</p>
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
            <strong>Benefits progress score</strong> blends four factors—window length, frequency, duration, and metabolic response—into a 0–100 index.
          </p>
          <p>
            <strong>Adaptation stage score</strong> emphasizes duration and schedule (how long and how often), indicating how established your fasting practice is.
          </p>
          <p>This is a conceptual model, not a guarantee of specific medical outcomes.</p>
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
                <p className="text-sm text-muted-foreground">Weekly fasting hours</p>
                <p className="text-xl font-semibold text-primary">
                  {result.fastingHoursPerDay * result.fastingDaysPerWeek}
                </p>
                <p className="text-xs text-muted-foreground">Total planned</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Window intensity factor</p>
                <p className="text-xl font-semibold text-primary">
                  {clamp((result.fastingHoursPerDay - 10) / 6, 0, 1.5).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Longer = higher</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Metabolic health contribution</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.metabolicHealthScore / 10 * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Of maximum score</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your protocol to see additional metrics.</p>
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

      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/MedicalWebPage"
      >
        <meta
          itemProp="name"
          content="Fasting Benefits Progress: How to Track Adaptation and When to Reassess"
        />
        <meta
          itemProp="description"
          content="Understand how fasting protocols may influence metabolic health, what adaptation stages look like, and how to track progress without obsessing over numbers."
        />
        <meta
          itemProp="keywords"
          content="fasting benefits progress tracker, intermittent fasting adaptation, time-restricted eating, metabolic health and fasting"
        />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/definitive-fasting-benefits-progress-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          Fasting Benefits Progress: Looking Beyond the Scale
        </h1>
        <p className="text-lg italic text-gray-700">
          Fasting can influence weight, insulin sensitivity, and subjective energy—but not always in simple, linear ways. This guide offers a balanced, safety-aware view.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. Types of Fasting and Their Goals</h2>
        <p>
          Time-restricted eating, alternate-day fasting, and periodic extended fasts each have different risk–benefit profiles. Clarifying your goals (e.g., glucose control vs. weight vs. schedule simplicity) helps you choose
          appropriate structures.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. How Adaptation Unfolds Over Time</h2>
        <p>
          Early weeks often involve hunger swings, energy variability, and habit friction. Over months, many people find hunger becomes more predictable and metabolic markers stabilize—if the protocol suits their physiology and
          lifestyle.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. Warning Signs to Watch For</h2>
        <p>
          Persistent fatigue, mood disturbances, menstrual cycle changes, binge–restrict cycles, or worsening labs signal that your fasting approach may be too aggressive or misaligned with your needs.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4. Combining Fasting with Other Interventions</h2>
        <p>
          Fasting works best as part of a whole system—paired with high-quality nutrition, movement, sleep, and appropriate medical care. Treat it as one tool in a toolkit, not the entire strategy.
        </p>

        <hr />
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Conclusion
        </h2>
        <p>
          The Fasting Benefits Progress Tracker helps you zoom out from daily fluctuations to see whether your approach seems to support your long-term health goals. Always integrate its insights with professional advice and your
          lived experience.
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
          <p>This tracker estimates fasting benefits progress and adaptation stage using fasting schedule, duration, and metabolic response inputs.</p>
          <p>It includes scores, qualitative interpretation, recommendations, a monthly/long-term plan, and extra calculations.</p>
          <p>The extended guide focuses on safety, evidence, and practical decision-making, supporting SEO and E‑E‑A‑T goals.</p>
        </CardContent>
      </Card>
    </div>
  );
}


