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
  dailyScreenTime: z.number({ invalid_type_error: 'Enter screen time' }).min(0).max(18),
  pickupsPerDay: z.number({ invalid_type_error: 'Enter pickups' }).min(0).max(500),
  anxietyWithoutPhone: z.number({ invalid_type_error: 'Enter anxiety score' }).min(0).max(10),
  purposefulUsePercent: z.number({ invalid_type_error: 'Enter purposeful %' }).min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  dailyScreenTime: number;
  pickupsPerDay: number;
  anxietyWithoutPhone: number;
  purposefulUsePercent: number;
  dependencyIndex: number;
  digitalBalanceScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your average daily smartphone screen time in hours.',
  'Enter estimated phone pickups/unlocks per day (from Screen Time/Digital Wellbeing).',
  'Rate anxiety/discomfort when separated from your phone (0-10).',
  'Estimate the percentage of usage that is purposeful or value-aligned.',
  'Review your Phone Dependency Index, digital balance score, and suggested boundaries.',
];

const faqs = [
  {
    question: 'What is the Phone Dependency Index?',
    answer:
      'It is a composite score that measures how dependent you are on your smartphone by combining usage time, pickups, anxiety, and purposeful use percentages.',
  },
  {
    question: 'Is high screen time always bad?',
    answer:
      'Not necessarily. High purposeful use (learning, work, creativity) offsets some risk. The index focuses on compulsive checks, anxiety, and low intentionality.',
  },
  {
    question: 'Where do I find my pickups per day?',
    answer:
      'iOS Screen Time and Android Digital Wellbeing dashboards show daily pickups/unlocks. If unavailable, estimate based on observation.',
  },
  {
    question: 'What counts as purposeful use?',
    answer:
      'Purposeful use aligns with your goals (work, education, creativity, meaningful social connection). Doomscrolling or reflexive app cycling is non-purposeful.',
  },
  {
    question: 'What score is considered problematic?',
    answer:
      'Dependency indices below 40 are low, 40-60 moderate, 60-80 high risk, and 80+ indicates severe dependency that may affect sleep, focus, or relationships.',
  },
  {
    question: 'How often should I recalculate?',
    answer:
      'Weekly or monthly tracking shows whether habit changes (app limits, downtime) are working. Pair with digital detox experiments for feedback.',
  },
  {
    question: 'Can this be used with teens or teams?',
    answer:
      'Yes. Educators and parents can adapt the questions to discuss healthy tech boundaries. Teams can use aggregated scores to justify focus-time policies.',
  },
  {
    question: 'Does this replace clinical assessment?',
    answer:
      'No. It is a self-awareness tool. If phone use significantly impairs life areas or co-occurs with anxiety/depression, consult a healthcare professional.',
  },
  {
    question: 'How can I lower my dependency score?',
    answer:
      'Use app timers, grayscale mode, notification batching, physical distance (dock phone elsewhere), and substitute analog activities during downtime.',
  },
  {
    question: 'How does anxiety influence the score?',
    answer:
      'High anxiety when away from your phone signals psychological attachment beyond utility, increasing the dependency score even with moderate screen time.',
  },
];

const relatedCalculators = [
  {
    name: 'Cognitive Load Estimator',
    slug: 'cognitive-load-estimator',
    description: 'Reveal how phone interruptions impact mental workload.',
  },
  {
    name: 'Gratitude & Mood Correlation Tracker',
    slug: 'gratitude-mood-correlation-tracker',
    description: 'Swap doomscrolling for reflective practices.',
  },
  {
    name: 'Emotional Burnout Recovery Calculator',
    slug: 'emotional-burnout-recovery-calculator',
    description: 'Understand how phone habits affect recovery.',
  },
  {
    name: 'Daily Screen Exposure Stress Index',
    slug: 'daily-screen-exposure-stress-index-calculator',
    description: 'Measure how cumulative screen time impacts stress.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/phone-dependency-index';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Phone Dependency Index', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Phone Dependency Index',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Measure smartphone dependency from screen time, pickups, anxiety, and purposeful use.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const { dailyScreenTime, pickupsPerDay, anxietyWithoutPhone, purposefulUsePercent } = values;

  const screenLoad = clamp((dailyScreenTime / 8) * 30, 0, 40);
  const pickupLoad = clamp((pickupsPerDay / 120) * 30, 0, 30);
  const anxietyLoad = anxietyWithoutPhone * 3;
  const purposeRelief = clamp((purposefulUsePercent / 100) * 25, 0, 25);

  const dependencyIndex = clamp(screenLoad + pickupLoad + anxietyLoad - purposeRelief, 0, 100);
  const digitalBalanceScore = clamp(100 - dependencyIndex, 0, 100);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation =
    'This suggests a general lifestyle tendency where your current phone use may feel relatively balanced. You may find that intentional routines and gentle app limits help keep things feeling workable.';

  if (dependencyIndex >= 80) {
    status = 'low';
    interpretation =
      'This suggests a general lifestyle tendency where your phone use may feel very strong in your day-to-day life. You might notice sleep, focus, or calm feeling more strained when usage is high. You may consider experimenting with softer boundaries or screen-free pockets of time. This is a personal insight, not a medical evaluation.';
  } else if (dependencyIndex >= 60) {
    status = 'moderate';
    interpretation =
      'This suggests a general lifestyle tendency where phone use may sometimes feel a bit heavy. You may find that adding gentle boundaries—especially around mornings, evenings, or deep-focus blocks—helps you feel more settled.';
  } else if (dependencyIndex >= 40) {
    status = 'good';
    interpretation =
      'This suggests a general lifestyle tendency where your phone use may feel moderate overall. A few small tweaks, such as batching notifications or leaning into offline hobbies, may support even more focus and ease.';
  }

  const recommendations: string[] = [
    'Create a phone-free morning or evening routine (30-60 minutes) to reset dopamine sensitivity.',
    'Batch notifications using Focus/Do Not Disturb modes to prevent constant pickups.',
    'Track purpose vs. autopilot use weekly. Celebrate meaningful sessions, cut low-value loops.',
  ];

  if (dailyScreenTime > 6) {
    recommendations.push('Set app limits for the three most time-consuming platforms and replace that block with analog activities.');
  }

  if (pickupsPerDay > 120) {
    recommendations.push('Store your phone in a different room during deep work; use wearables or desktop apps for critical messages only.');
  }

  if (purposefulUsePercent < 50) {
    recommendations.push('Define “purposeful” categories and move distracting apps off the home screen or uninstall them during weekdays.');
  }

  const plan = [
    { label: 'This Week', detail: 'Establish two phone-free zones (e.g., dining table, bedroom) and track compliance daily.' },
    { label: 'This Month', detail: 'Run a 24-hour digital sabbath or weekend focus retreat to reset habits and observe cravings.' },
    { label: 'Ongoing', detail: 'Review dependency index monthly. If it exceeds 60 for two months, escalate interventions (accountability partner, dumbphone blocks).' },
  ];

  return {
    dailyScreenTime,
    pickupsPerDay,
    anxietyWithoutPhone,
    purposefulUsePercent,
    dependencyIndex: Number(dependencyIndex.toFixed(1)),
    digitalBalanceScore: Number(digitalBalanceScore.toFixed(1)),
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function PhoneDependencyIndex() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dailyScreenTime: undefined,
      pickupsPerDay: undefined,
      anxietyWithoutPhone: undefined,
      purposefulUsePercent: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="phone-dependency-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Phone Dependency Index
          </CardTitle>
          <CardDescription>Measure smartphone reliance from screen time, pickups, anxiety, and purposefulness.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your phone usage data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dailyScreenTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily screen time (hours)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 5.8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pickupsPerDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pickups / unlocks per day</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 95" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="anxietyWithoutPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anxiety without phone (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="purposefulUsePercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purposeful usage (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 60" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate phone dependency
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
            <CardDescription>See dependency index, balance score, and habit plan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Dependency index</p>
                <p className="text-2xl font-semibold text-primary">{result.dependencyIndex}</p>
                <p className="text-xs text-muted-foreground">0-100 scale</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Balance score</p>
                <p className="text-2xl font-semibold text-primary">{result.digitalBalanceScore}%</p>
                <p className="text-xs text-muted-foreground">Higher = healthier</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Pickups/day</p>
                <p className="text-2xl font-semibold text-primary">{result.pickupsPerDay}</p>
                <p className="text-xs text-muted-foreground">Interruptions metric</p>
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
            <strong>Dependency index</strong> = Screen load (≤40) + Pickup load (≤30) + Anxiety load (≤30) − Purposeful relief (≤25). Each component is scaled to highlight its contribution to compulsive use.
          </p>
          <p>
            <strong>Digital balance score</strong> = 100 − Dependency index. Use it as a quick indicator of how balanced your digital life feels.
          </p>
          <p>
            <strong>Screen load</strong> uses 8 hours as a saturation point; pickup load uses 120 unlocks as a high-interruption baseline.
          </p>
          <p>Adjusting any single variable (time, pickups, anxiety, or purpose) visibly shifts the score, helping you prioritize interventions.</p>
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
                <p className="text-sm text-muted-foreground">Annual hours</p>
                <p className="text-xl font-semibold text-primary">{Math.round(result.dailyScreenTime * 365)}</p>
                <p className="text-xs text-muted-foreground">Hours/year on phone</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Weekly pickups</p>
                <p className="text-xl font-semibold text-primary">{result.pickupsPerDay * 7}</p>
                <p className="text-xs text-muted-foreground">Interruptions per week</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Purpose ratio</p>
                <p className="text-xl font-semibold text-primary">{result.purposefulUsePercent}%</p>
                <p className="text-xs text-muted-foreground">Intentional use share</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your data to reveal supporting calculations.</p>
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
        <meta itemProp="name" content="Phone Dependency Playbook: Reclaim Focus, Sleep, and Real-Life Moments" />
        <meta itemProp="description" content="Learn how to audit phone use, lower compulsive pickups, build digital boundaries, and design tech that serves your goals." />
        <meta itemProp="keywords" content="phone addiction calculator, digital wellbeing, screen time audit, smartphone boundaries, dopamine detox" />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/definitive-phone-dependency-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Resetting Your Relationship with Your Phone</h1>
        <p className="text-lg italic text-gray-700">Audit your digital habits, calm compulsive urges, and reclaim deep focus with practical, science-backed rituals.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li><a href="#dopamine" className="hover:underline">Dopamine Loops and Habit Formation</a></li>
          <li><a href="#assessment" className="hover:underline">Assessing Your Digital Environment</a></li>
          <li><a href="#boundaries" className="hover:underline">Creating Boundaries that Stick</a></li>
          <li><a href="#replacement" className="hover:underline">Replacing Doomscrolling with Intentional Activities</a></li>
          <li><a href="#team" className="hover:underline">Team and Family Agreements</a></li>
        </ul>
        <hr />

        <h2 id="dopamine" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Dopamine Loops</h2>
        <p>Notifications, infinite scroll, and variable rewards train the brain to seek constant novelty. Breaking loops requires friction (logouts, grayscale, timeboxing) and healthier dopamine sources (movement, creativity).</p>

        <h2 id="assessment" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Assessment</h2>
        <p>Map app categories, note peak cravings, and identify red-flag behaviors (phantom vibrations, panic when phone is misplaced). Awareness precedes change.</p>

        <h2 id="boundaries" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Boundaries</h2>
        <p>Implement guardrails: device curfews, charging stations outside bedrooms, weekend detox windows, and accountability partners. Use automation (Focus modes) to enforce rules.</p>

        <h2 id="replacement" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Replacement Habits</h2>
        <p>Swap autopilot scrolling with books, analog hobbies, journaling, or walks. Pair replacements with the same cues (e.g., reach for a notebook instead of a phone during commutes).</p>

        <h2 id="team" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Collective Agreements</h2>
        <p>Families or teams can create shared rules (no phones at meals, async updates before meetings) to normalize healthier norms and reduce FOMO.</p>

        <hr />
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Smartphones are powerful tools when used intentionally. This index keeps habits honest, helps you experiment with digital boundaries, and ensures tech supports your goals instead of hijacking them.</p>
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
            This calculator provides general wellness insights about smartphone use patterns using four behavioral signals.
            This is a personal lifestyle insight, not a medical evaluation.
          </p>
          <p>Outputs include dependency index, balance score, status, recommendations, action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs make the framework transparent for humans and AI co-pilots.</p>
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


