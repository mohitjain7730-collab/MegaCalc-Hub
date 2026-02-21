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
  sleepQuality: z.number({ invalid_type_error: 'Select sleep quality' }).min(1).max(5),
  stressLevel: z.number({ invalid_type_error: 'Select stress level' }).min(1).max(5),
  workHours: z.number({ invalid_type_error: 'Enter work hours' }).min(0).max(16),
  decisionCount: z.number({ invalid_type_error: 'Enter decision count' }).min(0).max(200),
  restBreaks: z.number({ invalid_type_error: 'Enter rest breaks' }).min(0).max(20),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  sleepQuality: number;
  stressLevel: number;
  workHours: number;
  decisionCount: number;
  restBreaks: number;
  energyBudget: number;
  energyPercent: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Rate your sleep quality last night (1=poor, 5=excellent).',
  'Rate your current stress level (1=low, 5=very high).',
  'Enter expected work hours today (0-16).',
  'Estimate number of decisions you\'ll make today (0-200).',
  'Enter number of planned rest breaks (0-20).',
  'Review energy budget, status, and recommendations.',
];

const faqs = [
  {
    question: 'What is mental energy budget?',
    answer:
      'Mental energy budget represents your cognitive capacity for the day, based on factors like sleep quality, stress level, work demands, decision-making load, and rest opportunities. It helps you understand and manage your cognitive resources effectively.',
  },
  {
    question: 'What factors affect mental energy?',
    answer:
      'Mental energy is affected by: sleep quality and duration, stress levels, work hours and intensity, number of decisions (decision fatigue), rest breaks, nutrition, physical activity, hydration, and mental health. Poor sleep, high stress, and excessive decisions deplete energy.',
  },
  {
    question: 'How does sleep quality affect mental energy?',
    answer:
      'Sleep quality is fundamental: poor sleep (1-2 rating) significantly reduces cognitive capacity, attention, and decision-making ability. Good sleep (4-5 rating) restores mental energy, improves focus, and supports cognitive performance. Sleep debt accumulates and reduces daily energy budget.',
  },
  {
    question: 'What is decision fatigue?',
    answer:
      'Decision fatigue occurs when making many decisions depletes mental energy and reduces decision quality. Research shows that making 50+ decisions daily significantly depletes cognitive resources. Important decisions made late in the day suffer from reduced energy and willpower.',
  },
  {
    question: 'How do rest breaks affect mental energy?',
    answer:
      'Rest breaks restore mental energy: short breaks (5-15 minutes) allow cognitive recovery, reduce mental fatigue, and improve focus. More breaks (10+ daily) support sustained performance. Without breaks, mental energy depletes rapidly, leading to decreased productivity and decision quality.',
  },
  {
    question: 'How does stress affect mental energy?',
    answer:
      'High stress depletes mental energy: chronic stress consumes cognitive resources, impairs focus, reduces decision-making capacity, and leads to mental exhaustion. Low stress (1-2) preserves energy, while high stress (4-5) significantly reduces available mental energy budget.',
  },
  {
    question: 'What are signs of depleted mental energy?',
    answer:
      'Signs include: difficulty concentrating, poor decision-making, increased irritability, reduced productivity, mental fatigue, procrastination, difficulty problem-solving, and feeling overwhelmed. These indicate your mental energy budget is depleted and needs restoration.',
  },
  {
    question: 'How can I improve my mental energy budget?',
    answer:
      'Improve through: prioritizing quality sleep (7-9 hours), managing stress through relaxation and breaks, taking regular rest breaks (every 60-90 minutes), reducing unnecessary decisions (routines, automation), maintaining nutrition and hydration, and protecting time for recovery.',
  },
  {
    question: 'What about work hours?',
    answer:
      'Work hours directly impact mental energy: 8-10 hours depletes energy moderately, 10+ hours significantly reduces available capacity. Long work hours combined with high stress and many decisions quickly deplete mental energy. Balance work demands with rest and recovery.',
  },
  {
    question: 'When should I rest?',
    answer:
      'Rest before depletion: take breaks every 60-90 minutes of focused work, before important decisions, when feeling mentally fatigued, and regularly throughout the day. Short breaks (5-15 min) restore energy. Waiting until completely depleted makes recovery more difficult.',
  },
];

const relatedCalculators = [
  {
    name: 'Work Stress Fatigue Index',
    slug: 'work-stress-fatigue-index',
    description: 'Assess work stress impact on recovery.',
  },
  {
    name: 'Resting Recovery Day Estimator',
    slug: 'resting-recovery-day-estimator',
    description: 'Assess recovery needs and rest requirements.',
  },
  {
    name: 'Screen-to-Sleep Time Impact Estimator',
    slug: 'screen-to-sleep-time-impact-estimator',
    description: 'Assess screen use impact on sleep.',
  },
  {
    name: 'Caffeine Half-Life Calculator (time-based)',
    slug: 'caffeine-half-life-calculator-time-based',
    description: 'Calculate caffeine half-life and clearance time.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/daily-mental-energy-budget-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Daily Mental Energy Budget Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Daily Mental Energy Budget Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate daily mental energy budget from sleep quality, stress level, work hours, decision count, and rest breaks.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const sleepQuality = values.sleepQuality;
  const stressLevel = values.stressLevel;
  const workHours = values.workHours;
  const decisionCount = values.decisionCount;
  const restBreaks = values.restBreaks;
  
  // Calculate energy budget: sleep quality (base), reduced by stress, work hours, decision count, increased by rest breaks
  const sleepBase = (sleepQuality / 5) * 40; // 0-40 points (foundation)
  const stressPenalty = ((stressLevel - 1) / 4) * 20; // 0-20 points (penalty)
  const workPenalty = (workHours / 16) * 20; // 0-20 points (penalty)
  const decisionPenalty = (decisionCount / 200) * 15; // 0-15 points (penalty)
  const restBonus = (restBreaks / 20) * 5; // 0-5 points (bonus)
  
  // Calculate energy budget (0-100 scale, higher = more energy)
  const energyBudget = clamp(sleepBase - stressPenalty - workPenalty - decisionPenalty + restBonus, 0, 100);
  const energyPercent = energyBudget;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your mental energy budget appears excellent. Good sleep, low stress, manageable work demands, and adequate rest support high cognitive capacity.';

  if (energyBudget < 30 || sleepQuality <= 2 || stressLevel >= 4 || workHours >= 12) {
    status = 'low';
    interpretation = 'Your mental energy budget is low. Poor sleep, high stress, excessive work hours, or too many decisions are depleting your cognitive resources. Prioritize sleep, stress management, breaks, and reduce demands where possible.';
  } else if (energyBudget < 50 || sleepQuality <= 3 || stressLevel >= 3 || workHours >= 10) {
    status = 'moderate';
    interpretation = 'Your mental energy budget is moderate. Some factors (sleep quality, stress, work hours, or decision count) are challenging your cognitive capacity. Focus on improving sleep, managing stress, taking breaks, and reducing unnecessary decisions.';
  } else if (energyBudget < 70) {
    status = 'good';
    interpretation = 'Your mental energy budget is good but could be optimized. Most factors support cognitive capacity, but improving sleep quality, stress management, or break frequency may enhance your mental energy.';
  } else {
    status = 'optimal';
    interpretation = 'Your mental energy budget is excellent. Good sleep, manageable stress, reasonable work demands, and adequate rest support high cognitive capacity. Continue these practices to maintain mental energy.';
  }

  const recommendations = [
    'Prioritize sleep quality: good sleep (7-9 hours, 4-5 quality rating) is the foundation of mental energy. Poor sleep significantly depletes cognitive capacity. Establish consistent sleep schedule, optimize sleep environment, and address sleep issues.',
    'Take regular rest breaks: schedule breaks every 60-90 minutes of focused work. Short breaks (5-15 minutes) restore mental energy, reduce fatigue, and improve focus. More breaks (10+ daily) support sustained performance.',
  ];
  
  if (stressLevel >= 3) {
    recommendations.push('Manage stress: high stress depletes mental energy. Use stress management techniques: meditation, deep breathing, exercise, time in nature, social support, and relaxation. Reduce stressors where possible and build resilience.');
  }
  
  if (decisionCount >= 100) {
    recommendations.push('Reduce decision fatigue: making many decisions depletes mental energy. Automate routine decisions (meals, clothing, routines), batch similar decisions, prioritize important decisions when energy is high, and limit options for less critical choices.');
  }
  
  if (workHours >= 10) {
    recommendations.push('Balance work hours: 10+ hours daily significantly depletes mental energy. Set boundaries, prioritize tasks, delegate when possible, and protect time for rest and recovery. Long hours combined with stress and many decisions quickly deplete energy.');
  }
  
  if (sleepQuality <= 3) {
    recommendations.push('Improve sleep quality: poor sleep is the biggest drain on mental energy. Address sleep issues: establish routine, optimize environment (dark, cool, quiet), limit screens before bed, manage stress, and consider professional help if needed.');
  }

  const plan = [
    { label: 'This Week', detail: `Assess your current sleep quality and stress levels. Begin tracking work hours and decision count. Schedule regular breaks (every 60-90 minutes). Start implementing stress management techniques (meditation, breathing, exercise).` },
    { label: 'This Month', detail: 'Establish consistent sleep routine and optimize sleep environment. Develop stress management practices. Create systems to reduce decision fatigue (routines, automation). Set boundaries around work hours. Build regular break schedule into daily routine.' },
    { label: 'Ongoing', detail: 'Maintain healthy sleep, stress management, and work-life balance. Continue taking regular breaks and managing decision load. Monitor mental energy levels and adjust habits as needed. Protect time for recovery and restoration.' },
  ];

  return { sleepQuality, stressLevel, workHours, decisionCount, restBreaks, energyBudget, energyPercent, status, interpretation, recommendations, plan };
};

export default function DailyMentalEnergyBudgetCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sleepQuality: undefined,
      stressLevel: undefined,
      workHours: undefined,
      decisionCount: undefined,
      restBreaks: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="daily-mental-energy-budget-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Daily Mental Energy Budget Calculator
          </CardTitle>
          <CardDescription>Calculate daily mental energy budget from sleep quality, stress level, work hours, decision count, and rest breaks.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your mental energy factors</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sleepQuality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep quality (1-5: 1=poor, 5=excellent)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" min="1" max="5" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stressLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stress level (1-5: 1=low, 5=very high)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" min="1" max="5" placeholder="e.g., 2" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="workHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work hours today (0-16)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="decisionCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Decision count today (0-200)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 50" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="restBreaks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rest breaks planned (0-20)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate energy budget
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
            <CardDescription>See energy budget, status, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Energy budget</p>
                <p className="text-2xl font-semibold text-primary">{result.energyBudget.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sleep quality</p>
                <p className="text-2xl font-semibold text-primary">{result.sleepQuality}/5</p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Work hours</p>
                <p className="text-2xl font-semibold text-primary">{result.workHours.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Hours</p>
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
            <strong>Sleep base</strong> = (Sleep Quality / 5) × 40. Contributes 0-40 points. Good sleep quality (4-5) provides foundation for mental energy. Poor sleep significantly depletes capacity.
          </p>
          <p>
            <strong>Stress penalty</strong> = ((Stress Level - 1) / 4) × 20. Penalty of 0-20 points. High stress (4-5) depletes mental energy significantly. Low stress (1-2) preserves energy.
          </p>
          <p>
            <strong>Work penalty</strong> = (Work Hours / 16) × 20. Penalty of 0-20 points. More work hours deplete mental energy. 10+ hours significantly reduces available capacity.
          </p>
          <p>
            <strong>Decision penalty</strong> = (Decision Count / 200) × 15. Penalty of 0-15 points. Decision fatigue depletes mental energy. Making 100+ decisions daily significantly reduces capacity.
          </p>
          <p>
            <strong>Rest bonus</strong> = (Rest Breaks / 20) × 5. Bonus of 0-5 points. Regular breaks restore mental energy and improve sustained performance. More breaks support higher capacity.
          </p>
          <p>
            <strong>Energy budget</strong> = Sleep Base - Stress Penalty - Work Penalty - Decision Penalty + Rest Bonus, normalized to 0-100 scale. Higher scores indicate greater available mental energy based on sleep quality, stress management, work demands, decision load, and rest opportunities.
          </p>
          <p>Mental energy is a finite resource that depletes throughout the day. Good sleep, low stress, manageable work demands, reduced decision fatigue, and regular breaks support higher cognitive capacity and better decision-making.</p>
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
                <p className="text-sm text-muted-foreground">Stress level</p>
                <p className="text-xl font-semibold text-primary">
                  {result.stressLevel}/5
                </p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Decisions</p>
                <p className="text-xl font-semibold text-primary">
                  {result.decisionCount.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">Today</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Rest breaks</p>
                <p className="text-xl font-semibold text-primary">
                  {result.restBreaks.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">Planned</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your mental energy factors to see additional insights.</p>
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

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemType="https://schema.org/MedicalWebPage">
    <meta itemProp="name" content="The Definitive Guide to Mental Energy: Understanding and Managing Your Cognitive Capacity" />
    <meta itemProp="description" content="An expert guide on mental energy, factors affecting cognitive capacity, decision fatigue, and strategies to optimize mental energy budget for better performance and well-being." />
    <meta itemProp="keywords" content="mental energy budget, cognitive capacity, decision fatigue, mental energy calculator, cognitive performance, stress management" />
    <meta itemProp="author" content="[Your Site's Health Team]" />
    <meta itemProp="datePublished" content="2025-12-01" />
    <meta itemProp="url" content="/definitive-mental-energy-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Mental Energy: Understanding and Managing Your Cognitive Capacity</h1>
    <p className="text-lg italic text-gray-700">Explore mental energy, factors affecting cognitive capacity, decision fatigue, and evidence-based strategies to optimize your mental energy budget for better performance and well-being.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#what-is-mental-energy" className="hover:underline">What Is Mental Energy</a></li>
        <li><a href="#factors" className="hover:underline">Factors Affecting Mental Energy</a></li>
        <li><a href="#decision-fatigue" className="hover:underline">Decision Fatigue</a></li>
        <li><a href="#optimization" className="hover:underline">Optimizing Mental Energy</a></li>
        <li><a href="#rest" className="hover:underline">Rest and Recovery</a></li>
    </ul>
<hr />

    <h2 id="what-is-mental-energy" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Is Mental Energy</h2>
    <p>**Mental energy** represents your cognitive capacity for focused attention, decision-making, problem-solving, and mental tasks. Like physical energy, mental energy is a finite resource that depletes throughout the day and needs restoration through rest and recovery.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Characteristics of Mental Energy</h3>
<p>Mental energy includes:</p>
<ul>
    <li><b>Cognitive capacity:</b> Ability to focus and concentrate</li>
    <li><b>Decision-making:</b> Quality and speed of decisions</li>
    <li><b>Problem-solving:</b> Creative and analytical thinking</li>
    <li><b>Willpower:</b> Self-control and resistance to temptation</li>
    <li><b>Emotional regulation:</b> Managing emotions and stress</li>
</ul>

<hr />

    <h2 id="factors" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Factors Affecting Mental Energy</h2>
    <p>Multiple factors influence mental energy:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Sleep Quality</h3>
    <ul>
        <li>Foundation of mental energy</li>
        <li>Poor sleep significantly reduces capacity</li>
        <li>Good sleep restores cognitive resources</li>
        <li>Sleep debt accumulates over time</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Stress Level</h3>
    <ul>
        <li>High stress depletes mental energy</li>
        <li>Chronic stress consumes resources</li>
        <li>Low stress preserves capacity</li>
        <li>Stress management is essential</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Work Demands</h3>
    <ul>
        <li>Long hours deplete energy</li>
        <li>Intensive work reduces capacity</li>
        <li>Balance is important</li>
        <li>Protect time for recovery</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Decision Making</h3>
    <ul>
        <li>Decision fatigue depletes energy</li>
        <li>Many decisions reduce capacity</li>
        <li>Important decisions need high energy</li>
        <li>Reduce unnecessary decisions</li>
    </ul>

<hr />

    <h2 id="decision-fatigue" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Decision Fatigue</h2>
    <p>Decision fatigue occurs when making many decisions depletes mental energy and reduces decision quality:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Understanding Decision Fatigue</h3>
    <ul>
        <li>Making 50+ decisions daily depletes resources</li>
        <li>Decision quality declines with fatigue</li>
        <li>Important decisions made late suffer</li>
        <li>Each decision consumes mental energy</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Reducing Decision Fatigue</h3>
    <ul>
        <li>Automate routine decisions</li>
        <li>Create routines and habits</li>
        <li>Batch similar decisions</li>
        <li>Limit options for less critical choices</li>
        <li>Make important decisions when energy is high</li>
    </ul>

<hr />

    <h2 id="optimization" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Optimizing Mental Energy</h2>
    <p>Strategies to optimize mental energy:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Sleep</h3>
    <ul>
        <li>Prioritize quality sleep (7-9 hours)</li>
        <li>Establish consistent schedule</li>
        <li>Optimize sleep environment</li>
        <li>Address sleep issues</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Stress Management</h3>
    <ul>
        <li>Use relaxation techniques</li>
        <li>Exercise regularly</li>
        <li>Time in nature</li>
        <li>Social support</li>
        <li>Reduce stressors</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Work-Life Balance</h3>
    <ul>
        <li>Set boundaries around work</li>
        <li>Prioritize important tasks</li>
        <li>Delegate when possible</li>
        <li>Protect recovery time</li>
    </ul>

<hr />

    <h2 id="rest" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Rest and Recovery</h2>
    <p>Rest is essential for restoring mental energy:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Regular Breaks</h3>
    <ul>
        <li>Take breaks every 60-90 minutes</li>
        <li>Short breaks (5-15 minutes) restore energy</li>
        <li>More breaks support sustained performance</li>
        <li>Rest before depletion</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Recovery Activities</h3>
    <ul>
        <li>Meditation and mindfulness</li>
        <li>Light physical activity</li>
        <li>Nature exposure</li>
        <li>Social connection</li>
        <li>Creative activities</li>
    </ul>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Mental energy is a finite resource that requires management. By prioritizing sleep, managing stress, balancing work demands, reducing decision fatigue, and taking regular breaks, you can optimize your mental energy budget. Use this calculator to assess your mental energy capacity and identify areas for improvement. Remember: mental energy, like physical energy, needs restoration through rest and recovery for sustained performance and well-being.</p>
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
          <p>This tool calculates daily mental energy budget from sleep quality, stress level, work hours, decision count, and rest breaks.</p>
          <p>Outputs include energy budget, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


