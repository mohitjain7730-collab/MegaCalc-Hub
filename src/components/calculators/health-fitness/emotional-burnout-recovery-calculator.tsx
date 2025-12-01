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
  weeklyWorkHours: z.number({ invalid_type_error: 'Enter work hours' }).min(10).max(100),
  sleepHours: z.number({ invalid_type_error: 'Enter sleep hours' }).min(3).max(10),
  emotionalExhaustion: z.number({ invalid_type_error: 'Enter exhaustion score' }).min(0).max(10),
  recoveryPractices: z.number({ invalid_type_error: 'Enter recovery score' }).min(0).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  weeklyWorkHours: number;
  sleepHours: number;
  emotionalExhaustion: number;
  recoveryPractices: number;
  burnoutIndex: number;
  recoveryWeeks: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter average weekly work or caregiving hours (including unpaid labor).',
  'Add average sleep per night over the past two weeks.',
  'Rate emotional exhaustion from 0 (none) to 10 (maxed).',
  'Rate recovery practices (movement, therapy, boundaries) from 0-10.',
  'Review burnout index, projected recovery time, and tailored plan.',
];

const faqs = [
  {
    question: 'What is the Burnout Recovery Calculator?',
    answer:
      'It is a planning tool that evaluates workload, sleep, emotional exhaustion, and recovery habits to estimate burnout severity and the weeks needed to restore baseline energy.',
  },
  {
    question: 'Does this replace professional care?',
    answer:
      'No. This tool supports self-monitoring, but persistent burnout, depression, or anxiety warrants evaluation by a licensed clinician or healthcare provider.',
  },
  {
    question: 'How accurate is the recovery timeline?',
    answer:
      'Timelines are estimates based on workload, exhaustion, and recovery engagement. Adding structured rest, therapy, or workload adjustments can shorten the timeline; ignoring burnout extends it.',
  },
  {
    question: 'What counts as recovery practices?',
    answer:
      'Recovery includes quality sleep routines, therapy or coaching, exercise, breaks, time off, creative outlets, boundaries, social support, and nutrition—rate overall consistency.',
  },
  {
    question: 'Why is sleep included separately?',
    answer:
      'Sleep quality is one of the strongest predictors of burnout and recovery. Chronic sleep deficit amplifies emotional exhaustion even when workload is moderate.',
  },
  {
    question: 'Can I track progress over time?',
    answer:
      'Yes. Repeating the calculator weekly highlights improvements in exhaustion, sleep, and recovery habits, showing whether the plan is working.',
  },
  {
    question: 'What is considered a high burnout index?',
    answer:
      'Burnout indices below 40% are typically manageable, 40-65% indicate moderate strain, and above 65% signal critical burnout risk requiring aggressive recovery measures.',
  },
  {
    question: 'How can organizations use this?',
    answer:
      'Managers and HR teams can anonymize team inputs to spot chronic overwork, plan staffing, and provide wellbeing resources before burnout leads to turnover.',
  },
  {
    question: 'Does recovery mean quitting my job?',
    answer:
      'Not necessarily. Recovery may involve better boundaries, workload redistribution, sabbaticals, therapy, or micro-restorative habits. The point is regaining sustainable energy.',
  },
  {
    question: 'When should I seek medical attention?',
    answer:
      'If burnout symptoms include persistent depression, anxiety, physical pain, or functioning impairments, consult a physician or mental health professional immediately.',
  },
];

const relatedCalculators = [
  {
    name: 'Social Anxiety Score Estimator',
    slug: 'social-anxiety-score-estimator',
    description: 'Assess social stress markers alongside burnout indicators.',
  },
  {
    name: 'Cognitive Load Estimator',
    slug: 'cognitive-load-estimator',
    description: 'Quantify mental task saturation that contributes to burnout.',
  },
  {
    name: 'Phone Dependency Index',
    slug: 'phone-dependency-index',
    description: 'Audit smartphone habits that disrupt recovery and sleep.',
  },
  {
    name: 'Work Burnout Recovery Time Calculator',
    slug: 'work-burnout-recovery-time-calculator',
    description: 'Compare recovery timelines with occupational burnout metrics.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/emotional-burnout-recovery-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Emotional Burnout Recovery Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Emotional Burnout Recovery Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate burnout severity and recovery timelines from workload, sleep, exhaustion, and recovery habits.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const { weeklyWorkHours, sleepHours, emotionalExhaustion, recoveryPractices } = values;

  const workloadLoad = clamp((weeklyWorkHours / 60) * 35, 0, 35);
  const sleepLoad = clamp(((8 - sleepHours) / 5) * 20, 0, 20);
  const emotionalLoad = emotionalExhaustion * 3;
  const recoveryRelief = recoveryPractices * 2.5;

  const burnoutIndex = clamp(workloadLoad + sleepLoad + emotionalLoad - recoveryRelief, 0, 100);
  const recoveryWeeks = Math.ceil(clamp(burnoutIndex / 8, 2, 20));

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Burnout risk is low. Continue current recovery routines and workload boundaries.';

  if (burnoutIndex >= 75) {
    status = 'low';
    interpretation = 'Severe burnout risk detected. Immediate rest, workload reduction, and professional support are recommended.';
  } else if (burnoutIndex >= 55) {
    status = 'moderate';
    interpretation = 'Elevated burnout indicators observed. Plan recovery rituals, schedule time off, and renegotiate workload where possible.';
  } else if (burnoutIndex >= 35) {
    status = 'good';
    interpretation = 'Mild burnout signals present. Increase recovery practices before stress compounds further.';
  }

  const recommendations: string[] = [
    'Schedule protected recovery sessions (exercise, therapy, journaling, nature time) with the same priority as meetings.',
    'Audit workload for automation, delegation, or batching opportunities to free up energy.',
    'Establish non-negotiable sleep and shutdown routines (no screens 60 minutes before bed, consistent wake times).',
  ];

  if (sleepHours < 6) {
    recommendations.push('Prioritize sleep debt repayment: add 30-45 minutes nightly for the next two weeks and track energy shifts.');
  }

  if (weeklyWorkHours > 55) {
    recommendations.push('Address chronic overtime by renegotiating deliverables, adding headcount, or implementing meeting hygiene (agendas, shorter stand-ups).');
  }

  if (recoveryPractices <= 3) {
    recommendations.push('Introduce micro-recovery rituals (breathing breaks, walking meetings, creative hobbies) at least 3 times daily.');
  }

  const plan = [
    { label: 'This Week', detail: 'Identify one high-impact stressor to pause, delegate, or postpone. Book two 30-minute recovery blocks and honor them fully.' },
    { label: 'This Month', detail: 'Align calendar with energy peaks: cluster deep work, limit after-hours meetings, and include at least one full rest day weekly.' },
    { label: 'Ongoing', detail: 'Track burnout index monthly. If it stays above 55 for two cycles, seek professional support or structural workload changes.' },
  ];

  return {
    weeklyWorkHours,
    sleepHours,
    emotionalExhaustion,
    recoveryPractices,
    burnoutIndex: Number(burnoutIndex.toFixed(1)),
    recoveryWeeks,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function EmotionalBurnoutRecoveryCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weeklyWorkHours: undefined,
      sleepHours: undefined,
      emotionalExhaustion: undefined,
      recoveryPractices: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="emotional-burnout-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Emotional Burnout Recovery Calculator
          </CardTitle>
          <CardDescription>Estimate burnout severity and recovery timeline from workload, sleep, exhaustion, and recovery habits.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your burnout drivers</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="weeklyWorkHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weekly work / caregiving hours</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 55" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sleepHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep per night (hours)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 6.2" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emotionalExhaustion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emotional exhaustion (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 7.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="recoveryPractices"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recovery practices consistency (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate burnout recovery plan
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
            <CardDescription>See burnout index, recovery timeline, and plan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Burnout index</p>
                <p className="text-2xl font-semibold text-primary">{result.burnoutIndex}%</p>
                <p className="text-xs text-muted-foreground">0-100 scale</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recovery timeline</p>
                <p className="text-2xl font-semibold text-primary">{result.recoveryWeeks} weeks</p>
                <p className="text-xs text-muted-foreground">To baseline energy</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sleep debt</p>
                <p className="text-2xl font-semibold text-primary">{(Math.max(0, 8 - result.sleepHours) * 7).toFixed(0)} hrs</p>
                <p className="text-xs text-muted-foreground">Per week</p>
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
            <strong>Burnout index</strong> = Workload load (≤35) + Sleep load (≤20) + Emotional load (≤30) − Recovery relief (≤25). Each component is scaled to emphasize its contribution.
          </p>
          <p>
            <strong>Recovery weeks</strong> = Clamp(burnout index ÷ 8, 2-20). Higher burnout requires longer consistent recovery behaviors to restore baseline nervous system regulation.
          </p>
          <p>
            <strong>Sleep debt</strong> is calculated as (8 − sleep hours) × 7. Addressing sleep debt is one of the fastest levers for reducing the index.
          </p>
          <p>Use these formulas to monitor incremental improvements as you adjust workload, sleep, and recovery habits.</p>
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
                <p className="text-sm text-muted-foreground">Workload pressure</p>
                <p className="text-xl font-semibold text-primary">{Math.round((result.weeklyWorkHours / 60) * 100)}%</p>
                <p className="text-xs text-muted-foreground">Relative to sustainable 60h max</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recovery sufficiency</p>
                <p className="text-xl font-semibold text-primary">{Math.round((result.recoveryPractices / 10) * 100)}%</p>
                <p className="text-xs text-muted-foreground">Consistency score</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Emotional load</p>
                <p className="text-xl font-semibold text-primary">{Math.round(result.emotionalExhaustion * 10)}%</p>
                <p className="text-xs text-muted-foreground">Subjective strain</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Provide your inputs to unlock additional insights.</p>
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

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/MedicalWebPage">
        <meta itemProp="name" content="Emotional Burnout Field Guide: Recovery Timelines, Tactics, and Leader Playbooks" />
        <meta itemProp="description" content="Deep dive into emotional burnout science, from stress physiology to calendar design, workplace conversations, and sustainable recovery tactics." />
        <meta itemProp="keywords" content="burnout recovery calculator, emotional exhaustion, workload audit, rest planning, leadership wellbeing, nervous system regulation" />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/definitive-burnout-recovery-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Comprehensive Guide to Emotional Burnout Recovery and Prevention</h1>
        <p className="text-lg italic text-gray-700">Learn how to map burnout drivers, renegotiate workloads, rebuild circadian rhythms, and design a recovery roadmap you can actually follow.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li><a href="#physiology" className="hover:underline">Burnout Physiology and the Stress Response</a></li>
          <li><a href="#drivers" className="hover:underline">Hidden Drivers: Workload, Context Switching, Values Conflict</a></li>
          <li><a href="#rest" className="hover:underline">Seven Types of Rest and How to Schedule Them</a></li>
          <li><a href="#conversation" className="hover:underline">Scripts for Workload and Boundary Conversations</a></li>
          <li><a href="#tracking" className="hover:underline">Tracking Recovery Metrics and Preventing Relapse</a></li>
        </ul>
        <hr />

        <h2 id="physiology" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Burnout Physiology and the Stress Response</h2>
        <p>Burnout occurs when chronic stress keeps the sympathetic nervous system activated, flattening cortisol rhythms and degrading executive function. Symptoms include emotional exhaustion, cynicism, and reduced efficacy. Recovery requires reintroducing safety cues (sleep, nourishment, connection) so the parasympathetic system can reassert balance.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Energy Battery Model</h3>
        <p>Imagine energy as a battery drained by workload, context switching, and emotional labor. Sleep and intentional rest recharge it; doom-scrolling, multitasking, and unresolved conflict keep it depleted. The calculator quantifies these drains and charges to make adjustments obvious.</p>

        <h2 id="drivers" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Hidden Drivers</h2>
        <p>Beyond hours worked, burnout accelerates when values clash, recognition is missing, psychological safety is low, or support systems erode. Leaders should review role clarity, decision rights, and resource access, not just individual resilience.</p>

        <h2 id="rest" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Seven Types of Rest</h2>
        <p>Dr. Saundra Dalton-Smith’s framework highlights physical, mental, sensory, creative, emotional, social, and spiritual rest. Audit which types you regularly practice and schedule the missing ones. For example, sensory rest = silent walks; creative rest = art, music, nature immersion.</p>

        <h2 id="conversation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Boundaries and Conversations</h2>
        <p>Scripts help: “I can keep this timeline if we pause Project B or add support.” Practice boundary statements ahead of time and align requests with team outcomes to reduce guilt.</p>

        <h2 id="tracking" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Tracking Metrics</h2>
        <p>Key indicators: burnout index, sleep hours, HRV, mood ratings, and number of true recovery blocks per week. If any two trend downward for more than 14 days, intervene early.</p>

        <hr />
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Burnout recovery blends structural change and compassionate self-management. Use this calculator weekly to validate progress, support conversations with leaders, and keep wellbeing non-negotiable.</p>
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
          <p>This tool estimates burnout severity and recovery timeline from key lifestyle levers.</p>
          <p>Outputs include burnout index, recovery weeks, sleep debt, status, recommendations, action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs give humans or AI assistants instant context for decision-making.</p>
        </CardContent>
      </Card>
    </div>
  );
}


