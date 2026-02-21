'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Zap, Target, AlertTriangle, Shield, Compass } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  plannedTasks: z.number({ invalid_type_error: 'Enter number of tasks' }).min(1).max(20),
  completedTasks: z.number({ invalid_type_error: 'Enter number of tasks' }).min(0).max(20),
  majorDistractions: z.number({ invalid_type_error: 'Enter interruptions' }).min(0).max(40),
  flowMinutes: z.number({ invalid_type_error: 'Enter minutes' }).min(0).max(360),
  multitaskPercent: z.number({ invalid_type_error: 'Enter percent' }).min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  efficiencyScore: number;
  completionRate: number;
  flowConsistency: number;
  state: 'focused' | 'fragile' | 'fragmented';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'List how many meaningful tasks you planned today (no micro tasks).',
  'Log how many you actually finished or advanced substantially.',
  'Count major distractions (Slack fire drills, unexpected calls, urgent requests).',
  'Track flow minutesâ€”time you felt immersed and productive.',
  'Estimate the percentage of time you were multitasking or context switching.',
  'Use the output to tighten boundaries and improve tomorrowâ€™s game plan.',
];

const faqs = [
  {
    question: 'What is the Cognitive Focus Efficiency score?',
    answer: 'It blends task completion, flow time, distractions, and multitasking to show how efficiently you convert time into meaningful output.',
  },
  {
    question: 'How accurate is â€œflow minutesâ€?',
    answer: 'Itâ€™s subjective. Use journaling, wearable focus modes, or apps like RescueTime to refine the estimate.',
  },
  {
    question: 'Can I include meetings as tasks?',
    answer: 'Only if they directly advance your goals. Otherwise treat them as constraints when interpreting the score.',
  },
  {
    question: 'How often should I run this?',
    answer: 'Daily during sprints or once per week to ensure your systems support deep work.',
  },
  {
    question: 'What if I overplan tasks?',
    answer: 'The completion rate will dip, revealing an opportunity to plan fewer but bigger outcomes.',
  },
  {
    question: 'Does multitasking ever help?',
    answer: 'Rarely. This tool penalizes multitasking to nudge single-tasking, especially for creative work.',
  },
  {
    question: 'How can I raise flow minutes?',
    answer: 'Protect a 90-minute block with notifications off, full-screen apps, and a clear objective.',
  },
  {
    question: 'Is a high score sustainable?',
    answer: 'Yes if you also monitor the Mental Fatigue Index and recovery habits so you donâ€™t overextend.',
  },
  {
    question: 'Whatâ€™s a good benchmark?',
    answer: 'Scores â‰¥70 signal strong focus. 50â€“69 is fragileâ€”tighten boundaries. Under 50 indicates fragmentation.',
  },
  {
    question: 'Can teams use this?',
    answer: 'Absolutelyâ€”compare averages to identify process bottlenecks or meeting overload.',
  },
];

const relatedCalculators = [
  { name: 'Habit Streak Tracker Calculator', slug: 'habit-streak-tracker-calculator', description: 'Keep daily focus rituals consistent.' },
  { name: 'Screen Time vs Sleep Impact Calculator', slug: 'screen-time-vs-sleep-impact-calculator', description: 'See how evening screens affect next-day focus.' },
  { name: 'Caffeine Cutoff Sleep Impact Calculator', slug: 'caffeine-cutoff-sleep-impact-calculator', description: 'Dial in stimulant timing to boost next-day clarity.' },
];

const baseUrl = 'https://mycalculating.com/health-fitness/cognitive-focus-efficiency-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Cognitive Focus Efficiency Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'Article',
      headline: 'Cognitive Focus Efficiency Calculator',
      description: 'Measure how well you convert planned tasks and flow minutes into meaningful output.',
      author: { '@type': 'Organization', name: 'Mycalculating.com' },
      publisher: { '@type': 'Organization', name: 'Mycalculating.com', logo: { '@type': 'ImageObject', url: 'https://mycalculating.com/logo.png' } },
      url: baseUrl,
      mainEntityOfPage: { '@type': 'WebPage', '@id': baseUrl },
      datePublished: '2024-01-01',
      dateModified: new Date().toISOString().split('T')[0],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Cognitive Focus Efficiency Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: ['Efficiency score', 'Flow consistency', 'Action plan'],
      url: baseUrl,
      description: 'Blend tasks, distractions, flow, and multitasking into a single focus efficiency metric.',
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    },
    {
      '@type': 'HowTo',
      name: 'How to Use Cognitive Focus Efficiency Calculator',
      description: 'Step-by-step guide to calculate cognitive focus efficiency',
      step: steps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        text: step,
      })),
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const completionRate = clamp(Math.round((values.completedTasks / values.plannedTasks) * 100), 0, 150);
  const distractionPenalty = values.majorDistractions * 2 + values.multitaskPercent * 0.6;
  const flowBonus = values.flowMinutes / 2;
  const rawScore = completionRate + flowBonus - distractionPenalty;
  const efficiencyScore = clamp(Math.round(rawScore / 1.2), 0, 100);
  const flowConsistency = clamp(Math.round((values.flowMinutes / (values.plannedTasks * 30)) * 100), 0, 120);

  let state: ResultPayload['state'] = 'focused';
  let interpretation =
    'Your entries suggest todayâ€™s focus and follow-through felt relatively smooth overall. You can keep leaning on the habits that supported that.';

  if (efficiencyScore < 70) {
    state = 'fragile';
    interpretation =
      'Youâ€™re getting meaningful things done, and there also seems to be room to soften interruptions or multitasking a bit.';
  }
  if (efficiencyScore < 50) {
    state = 'fragmented';
    interpretation =
      'The pattern you entered looks quite scattered today. It may help to experiment with fewer priorities or gentler boundaries around focus time.';
  }

  const recommendations = [
    'Try choosing a small number of â€œnice-to-finishâ€ tasks so your day feels more realistic and spacious.',
    'When possible, soften nonâ€‘essential notifications during focus moments so you can stay with one thing at a time.',
    'Noting distractions as they happen can gently highlight patterns you might want to adjust later.',
  ];
  if (state === 'fragile') {
    recommendations.push('You might experiment with turning one recurring meeting or checkâ€‘in into a written update instead.');
  }
  if (state === 'fragmented') {
    recommendations.push('A short weekly review to look at commitments and pick one simple guiding priority can make future days feel lighter.');
  }

  const plan = [
    { label: 'Pre-focus moment', detail: 'Take a few minutes to outline what would feel good to complete and gently tidy your workspace or tabs.' },
    { label: 'Midday checkâ€‘in', detail: 'Pause around the middle of the day to notice what helped or pulled your attention away.' },
    { label: 'End-of-day windâ€‘down', detail: 'Note a few wins, park loose ideas for tomorrow, and pick one or two priorities for next time.' },
  ];

  return { efficiencyScore, completionRate, flowConsistency, state, interpretation, recommendations, plan };
};

export default function CognitiveFocusEfficiencyCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plannedTasks: undefined,
      completedTasks: undefined,
      majorDistractions: undefined,
      flowMinutes: undefined,
      multitaskPercent: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="focus-efficiency-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items.center gap-2">
            <Target className="h-5 w-5" />
            Cognitive Focus Efficiency Calculator
          </CardTitle>
          <CardDescription>Measure how effectively you convert time into meaningful work.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your day</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="plannedTasks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Planned tasks</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step={1}
                          placeholder="e.g., 5"
                          value={field.value ?? ''}
                          onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="completedTasks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Completed tasks</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step={1}
                          placeholder="e.g., 4"
                          value={field.value ?? ''}
                          onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="majorDistractions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Major distractions</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step={1}
                          placeholder="e.g., 6"
                          value={field.value ?? ''}
                          onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="flowMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Flow minutes</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step={5}
                          placeholder="e.g., 120"
                          value={field.value ?? ''}
                          onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="multitaskPercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time spent multitasking (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step={1}
                          placeholder="e.g., 25"
                          value={field.value ?? ''}
                          onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate efficiency
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
            <CardDescription>See efficiency score, completion rate, flow consistency, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Efficiency Score</p>
                <p className="text-2xl font-semibold text-primary">{result.efficiencyScore}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-semibold text-primary">{result.completionRate}%</p>
                <p className="text-xs text-muted-foreground">Tasks completed</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Flow Consistency</p>
                <p className="text-2xl font-semibold text-primary">{result.flowConsistency}%</p>
                <p className="text-xs text-muted-foreground">Flow time ratio</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.state}</p>
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
            <strong>Completion Rate</strong> = clamp(Completed Tasks Ã· Planned Tasks Ã— 100, 0, 150%). Values above 100% indicate
            completing more than planned; values below 100% suggest over-planning.
          </p>
          <p>
            <strong>Efficiency Score</strong> = clamp((Completion Rate + Flow Minutes Ã· 2 âˆ’ Major Distractions Ã— 2 âˆ’ Multitask
            Percent Ã— 0.6) Ã· 1.2, 0, 100). Higher completion rates and flow time increase efficiency; distractions and multitasking
            reduce it.
          </p>
          <p>
            <strong>Flow Consistency</strong> = clamp(Flow Minutes Ã· (Planned Tasks Ã— 30) Ã— 100, 0, 200%). This measures how much
            flow time you achieved relative to a target of 30 minutes per planned task.
          </p>
          <p>
            The calculator accounts for task completion, flow state duration, interruptions, and multitasking to provide a
            comprehensive view of focus efficiency.
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
          <CardTitle>Additional calculation</CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            (() => {
              const values = form.getValues();
              const taskGap = (values.plannedTasks ?? 0) - (values.completedTasks ?? 0);
              const flowHours = Math.max((values.flowMinutes ?? 0) / 60, 0.5);
              const interruptionsPerHour = (values.majorDistractions ?? 0) / flowHours;
              const multitaskDrag = (values.multitaskPercent ?? 0) * 0.6;
              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded">
                    <p className="text-sm text-muted-foreground">Task realism gap</p>
                    <p className="text-xl font-semibold text-primary">{taskGap}</p>
                    <p className="text-xs text-muted-foreground">Positive numbers mean you planned more than you finished.</p>
                  </div>
                  <div className="p-4 border rounded">
                    <p className="text-sm text-muted-foreground">Interruptions/hr</p>
                    <p className="text-xl font-semibold text-primary">{interruptionsPerHour.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">Keep this below 4 whenever possible.</p>
                  </div>
                  <div className="p-4 border rounded">
                    <p className="text-sm text-muted-foreground">Multitask drag</p>
                    <p className="text-xl font-semibold text-primary">{multitaskDrag.toFixed(1)} pts</p>
                    <p className="text-xs text-muted-foreground">Penalty applied to the score.</p>
                  </div>
                </div>
              );
            })()
          ) : (
            <p className="text-sm text-muted-foreground">Run the calculator to reveal task realism, interruptions per hour, and multitask drag.</p>
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
        itemType="https://schema.org/MedicalWebPage"
      >
        {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
        <meta itemProp="name" content="The Definitive Guide to Cognitive Focus Efficiency: Optimizing Attention and Productivity" />
        <meta
          itemProp="description"
          content="An expert, evidence-based guide on cognitive focus efficiency, attention management, flow state, distraction reduction, and comprehensive strategies to improve focus and productivity."
        />
        <meta
          itemProp="keywords"
          content="cognitive focus efficiency, attention management, flow state, productivity, distraction management, focus improvement, cognitive performance"
        />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/definitive-cognitive-focus-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          The Definitive Guide to Cognitive Focus Efficiency: Optimizing Attention, Flow State, and Productivity
        </h1>
        <p className="text-lg italic text-gray-700">
          Explore the science of cognitive focus, learn how attention works, understand factors affecting focus efficiency, and
          discover comprehensive strategies to improve focus, reduce distractions, and enhance productivity.
        </p>

        {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li>
            <a href="#understanding-focus" className="hover:underline">
              Understanding Cognitive Focus and Attention
            </a>
          </li>
          <li>
            <a href="#flow-state" className="hover:underline">
              Flow State and Deep Work
            </a>
          </li>
          <li>
            <a href="#distractions" className="hover:underline">
              Distractions and Attention Fragmentation
            </a>
          </li>
          <li>
            <a href="#improvement-strategies" className="hover:underline">
              Comprehensive Strategies to Improve Focus Efficiency
            </a>
          </li>
        </ul>
        <hr />

        {/* UNDERSTANDING FOCUS */}
        <h2 id="understanding-focus" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Understanding Cognitive Focus and Attention
        </h2>
        <p>
          Cognitive focus refers to the ability to direct and sustain attention on a specific task or goal. Focus efficiency
          measures how effectively you convert time and effort into meaningful output.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Types of Attention</h3>
        <ul>
          <li>
            <b>Sustained attention:</b> Maintaining focus over extended periods
          </li>
          <li>
            <b>Selective attention:</b> Focusing on relevant information while ignoring distractions
          </li>
          <li>
            <b>Divided attention:</b> Attempting to focus on multiple tasks simultaneously (multitasking)
          </li>
          <li>
            <b>Executive attention:</b> Managing and coordinating multiple cognitive processes
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Factors Affecting Focus</h3>
        <ul>
          <li>
            <b>Task complexity:</b> More complex tasks require greater cognitive resources
          </li>
          <li>
            <b>Environmental factors:</b> Noise, interruptions, and visual distractions
          </li>
          <li>
            <b>Internal state:</b> Sleep, stress, hydration, and energy levels
          </li>
          <li>
            <b>Motivation:</b> Interest, relevance, and perceived importance
          </li>
        </ul>

        <hr />

        {/* FLOW STATE */}
        <h2 id="flow-state" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Flow State and Deep Work
        </h2>
        <p>
          Flow state, or "being in the zone," is a mental state of complete immersion and focused concentration on an activity.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Characteristics of Flow</h3>
        <ul>
          <li>Complete absorption in the task</li>
          <li>Loss of self-consciousness</li>
          <li>Distorted sense of time</li>
          <li>Intrinsic motivation and enjoyment</li>
          <li>Optimal performance and creativity</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Conditions for Flow</h3>
        <ul>
          <li>
            <b>Clear goals:</b> Understanding what you're trying to achieve
          </li>
          <li>
            <b>Immediate feedback:</b> Knowing how well you're performing
          </li>
          <li>
            <b>Balance challenge and skill:</b> Task difficulty matches your abilities
          </li>
          <li>
            <b>Minimal distractions:</b> Protected time and environment
          </li>
        </ul>

        <hr />

        {/* DISTRACTIONS */}
        <h2 id="distractions" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Distractions and Attention Fragmentation
        </h2>
        <p>
          Distractions interrupt focus and fragment attention, reducing productivity and preventing flow state.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Types of Distractions</h3>
        <ul>
          <li>
            <b>External:</b> Notifications, noise, interruptions, visual stimuli
          </li>
          <li>
            <b>Internal:</b> Thoughts, worries, hunger, fatigue, emotional states
          </li>
          <li>
            <b>Digital:</b> Social media, emails, messages, app notifications
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Cost of Multitasking</h3>
        <p>
          Multitasking reduces focus efficiency by:
        </p>
        <ul>
          <li>Requiring constant context switching</li>
          <li>Increasing errors and mistakes</li>
          <li>Reducing quality of work</li>
          <li>Depleting mental energy faster</li>
          <li>Preventing deep work and flow state</li>
        </ul>

        <hr />

        {/* IMPROVEMENT STRATEGIES */}
        <h2 id="improvement-strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Comprehensive Strategies to Improve Focus Efficiency
        </h2>
        <p>
          Improving focus efficiency requires optimizing environment, managing distractions, and developing focus skills.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">1. Optimize Environment</h3>
        <ul>
          <li>
            <b>Minimize distractions:</b> Remove visual clutter, reduce noise, turn off notifications
          </li>
          <li>
            <b>Create dedicated space:</b> Designate a specific area for focused work
          </li>
          <li>
            <b>Control lighting:</b> Ensure adequate, comfortable lighting
          </li>
          <li>
            <b>Comfortable setup:</b> Ergonomic furniture and equipment
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">2. Manage Time and Tasks</h3>
        <ul>
          <li>
            <b>Time blocking:</b> Schedule dedicated blocks for focused work
          </li>
          <li>
            <b>Prioritize:</b> Focus on high-value tasks first
          </li>
          <li>
            <b>Break down tasks:</b> Divide large projects into manageable chunks
          </li>
          <li>
            <b>Set realistic goals:</b> Plan achievable amounts of work
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">3. Reduce Distractions</h3>
        <ul>
          <li>
            <b>Digital boundaries:</b> Use apps to block distracting websites
          </li>
          <li>
            <b>Notification management:</b> Turn off non-essential notifications
          </li>
          <li>
            <b>Communication windows:</b> Check email and messages at scheduled times
          </li>
          <li>
            <b>Single-tasking:</b> Focus on one task at a time
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">4. Develop Focus Skills</h3>
        <ul>
          <li>
            <b>Practice mindfulness:</b> Meditation improves attention control
          </li>
          <li>
            <b>Gradual improvement:</b> Start with shorter focus sessions and extend gradually
          </li>
          <li>
            <b>Regular breaks:</b> Take quality breaks to restore attention
          </li>
          <li>
            <b>Track progress:</b> Monitor focus efficiency and identify patterns
          </li>
        </ul>

        <hr />

        {/* CONCLUSION */}
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>
          Improving cognitive focus efficiency is essential for productivity, creativity, and overall performance. By understanding
          how attention works, creating conditions for flow state, managing distractions, and developing focus skills, you can
          enhance your ability to concentrate and produce meaningful work. Remember that focus is a skill that improves with
          practiceâ€”start with small changes, protect focused work time, and gradually build your capacity for sustained attention.
          Track your progress, experiment with different strategies, and adjust based on what works for your unique situation. If
          focus difficulties significantly impact your work or daily functioning, consider consulting a healthcare provider or
          mental health professional who can provide personalized support. This tool is designed for wellness reflection and is
          not a substitute for professional medical or mental health evaluation or treatment.
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
            This tool offers a cognitive focus efficiency score from planned tasks, completed tasks, major distractions, flow
            minutes, and multitasking percentage as a gentle, lifestyle-oriented snapshot. It is intended for personal reflection,
            not for diagnosis or treatment decisions.
          </p>
          <p>
            Outputs include efficiency score (0-100), completion rate, flow consistency, wellness status, interpretation text,
            supportive recommendations, an action plan, and contextual information about the inputs and calculation approach.
          </p>
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
            Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a
            medical or psychological diagnosis, evaluation, or treatment plan. For any health concerns, please consult a qualified
            professional who can review your full situation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


