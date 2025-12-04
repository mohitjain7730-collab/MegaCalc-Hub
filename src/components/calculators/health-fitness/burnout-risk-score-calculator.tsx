'use client';

import { useState } from 'react';
import Script from 'next/script';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Zap, AlertTriangle, Clock, Moon, Users, Calendar, TrendingDown, Shield } from 'lucide-react';

const formSchema = z.object({
  weeklyWorkHours: z.number().min(0).max(168).optional(),
  stressLevel: z.number().min(1).max(10).optional(),
  sleepHoursPerNight: z.number().min(0).max(24).optional(),
  supportNetworkScore: z.number().min(1).max(10).optional(),
  workLifeBalanceScore: z.number().min(1).max(10).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  burnoutRiskScore: number;
  riskLevel: string;
};

const steps = [
  'Enter your approximate weekly work hours, current stress level, sleep hours, and quick 1–10 reflections on support and balance.',
  'Submit the form to see a workday strain score on a 0–100 scale with a simple pattern label.',
  'Read the interpretation text as a gentle snapshot of how demanding your current week may feel.',
  'Browse the recommendations and 8‑week plan for small ideas that might soften your load.',
  'Use this as an occasional reflection tool rather than a formal assessment or diagnosis.',
];

const baseUrl =
  'https://mycalculating.com/category/health-fitness/burnout-risk-score-calculator';

const faqs: [string, string][] = [
  ['What is burnout?', 'Burnout is a state of emotional, physical, and mental exhaustion caused by prolonged stress. It often results from chronic workplace stress and can impact performance and well-being.'],
  ['How is the burnout risk score calculated?', 'The score considers work hours, stress levels, sleep quality, social support, and work-life balance. Higher scores indicate greater risk.'],
  ['What is a high risk score?', 'Scores above 70 indicate high risk, 50–70 moderate risk, and below 50 lower risk. Context matters—individual resilience varies.'],
  ['Can I prevent burnout?', 'Yes. Setting boundaries, prioritizing sleep, maintaining social connections, and managing workload can help prevent burnout.'],
  ['How often should I reassess?', 'Reassess monthly or when work demands change significantly. Regular monitoring helps catch early warning signs.'],
  ['Does exercise help with burnout?', 'Yes, regular physical activity can reduce stress, improve sleep, and boost mood. Start with manageable intensity.'],
  ['What if my score is very high?', 'Consider professional support (therapist, counselor) and discuss workload with supervisors. Prioritize self-care immediately.'],
  ['Is burnout the same as depression?', 'No, but they can overlap. Burnout is typically work-related; depression is a medical condition requiring professional diagnosis.'],
  ['Can work-life balance improve my score?', 'Yes, improving work-life balance directly reduces burnout risk by creating separation between work and personal time.'],
  ['Should I tell my employer about burnout?', 'Consider discussing workload and boundaries with HR or management. Many employers have resources to support employee well-being.'],
];

const understandingInputs = [
  { label: 'Weekly Work Hours', description: 'Total hours worked per week, including overtime and work taken home.' },
  { label: 'Stress Level (1–10)', description: 'Self-reported stress level where 1 is minimal and 10 is extreme.' },
  { label: 'Sleep Hours Per Night', description: 'Average hours of sleep per night over the past week.' },
  { label: 'Support Network Score (1–10)', description: 'Quality of social support where 10 is excellent support and 1 is minimal.' },
  { label: 'Work-Life Balance Score (1–10)', description: 'How well work and personal life are balanced, where 10 is excellent balance.' },
];

const interpret = (score: number): { level: string; message: string } => {
  if (score >= 70) {
    return {
      level: 'Heavier strain pattern',
      message:
        'Your answers suggest your current routines may feel quite demanding right now. It could be a good time to explore gentler boundaries, more rest, and extra support where possible.',
    };
  }
  if (score >= 50) {
    return {
      level: 'Moderate strain pattern',
      message:
        'There are meaningful pressures in your week, and some simple tweaks to work, rest, and support may help things feel more sustainable.',
    };
  }
  return {
    level: 'Lighter strain pattern',
    message:
      'Your current pattern may feel more manageable, though it can still be helpful to keep checking in with your stress and energy over time.',
  };
};

const recommendations = (score: number) => {
  const base = [
    'Notice one or two times during the week when you can step away briefly to reset—such as a short walk or quiet break.',
    'Gently protect a basic sleep window that feels realistic most nights, even if it is not perfect.',
    'Stay connected with at least one person you feel comfortable sharing your experience with.',
  ];
  if (score >= 70) {
    return [
      ...base,
      'If it feels accessible, consider talking with a trusted professional or support person about how your days have been feeling.',
      'Look for small ways to soften your workload or say “not now” to lower‑priority tasks when possible.',
      'Experiment with short, regular pauses during work to breathe, stretch, or simply look away from screens.',
    ];
  }
  if (score >= 50) {
    return [
      ...base,
      'Try adding a few minutes of winding‑down time at the end of your workday before switching to personal time.',
      'Schedule one or two low‑pressure activities that feel nourishing (hobbies, time outdoors, or creative play).',
    ];
  }
  return [
    ...base,
    'Keep an eye on how your stress and energy change when your workload shifts, and adjust when you can.',
  ];
};

const warningSigns = () => [
  'If you feel persistently exhausted or overwhelmed, it can be a signal to pause and gently reassess your routines.',
  'Notice if work thoughts are crowding out most of your downtime or if you frequently feel detached from things you usually enjoy.',
  'If you experience ongoing changes in mood, sleep, or focus that worry you, consider talking with a qualified health professional.',
];

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Assess current workload and identify non-essential tasks to reduce' },
  { week: 2, focus: 'Establish boundaries: set work hours, limit after-hours communication' },
  { week: 3, focus: 'Prioritize sleep: aim for 7–9 hours with consistent bedtime routine' },
  { week: 4, focus: 'Build support network: schedule regular check-ins with friends/family' },
  { week: 5, focus: 'Introduce stress management: 10–15 minutes daily meditation or breathing' },
  { week: 6, focus: 'Take regular breaks: 5–10 minutes every 90 minutes during work' },
  { week: 7, focus: 'Reassess workload and delegate where possible' },
  { week: 8, focus: 'Maintain new routines and continue monitoring stress levels' },
];

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Health & Fitness',
          item: 'https://mycalculating.com/category/health-fitness',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Workday Balance & Overload Tendency Score',
          item: baseUrl,
        },
      ],
    },
    {
      '@type': 'Article',
      headline: 'Workday Balance & Overload Tendency Score',
      description: 'Reflect on how your work hours, sleep, stress, and support habits may influence feelings of workday overload in a gentle, wellness‑oriented way.',
      author: { '@type': 'Organization', name: 'Mycalculating.com' },
      publisher: { '@type': 'Organization', name: 'Mycalculating.com', logo: { '@type': 'ImageObject', url: 'https://mycalculating.com/logo.png' } },
      url: baseUrl,
      mainEntityOfPage: { '@type': 'WebPage', '@id': baseUrl },
      datePublished: '2024-01-01',
      dateModified: new Date().toISOString().split('T')[0],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Workday Balance & Overload Tendency Score',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description:
        'Reflect on how your work hours, sleep, stress, and support habits may influence feelings of workday overload in a gentle, wellness‑oriented way.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq[0],
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq[1],
        },
      })),
    },
    {
      '@type': 'HowTo',
      name: 'How to Use Workday Balance & Overload Tendency Score Calculator',
      description: 'Step-by-step guide to calculate workday balance and overload tendency',
      step: steps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        text: step,
      })),
    },
  ],
};

export default function BurnoutRiskScoreCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weeklyWorkHours: undefined,
      stressLevel: undefined,
      sleepHoursPerNight: undefined,
      supportNetworkScore: undefined,
      workLifeBalanceScore: undefined,
    },
  });

  const onSubmit = (v: FormValues) => {
    const { weeklyWorkHours, stressLevel, sleepHoursPerNight, supportNetworkScore, workLifeBalanceScore } = v;
    if (
      weeklyWorkHours == null ||
      stressLevel == null ||
      sleepHoursPerNight == null ||
      supportNetworkScore == null ||
      workLifeBalanceScore == null
    ) {
      setResult(null);
      return;
    }

    // Calculate risk score (0-100 scale)
    // Higher work hours, stress, and lower sleep/support/balance = higher risk
    const workHoursScore = Math.min((weeklyWorkHours / 60) * 30, 30); // Max 30 points for >60 hours
    const stressScore = (stressLevel / 10) * 25; // Max 25 points
    const sleepScore = sleepHoursPerNight < 7 ? (7 - sleepHoursPerNight) * 5 : 0; // Max 15 points for <4 hours
    const supportScore = ((11 - supportNetworkScore) / 10) * 15; // Reverse: lower support = higher risk
    const balanceScore = ((11 - workLifeBalanceScore) / 10) * 15; // Reverse: lower balance = higher risk

    const totalScore = Math.min(workHoursScore + stressScore + sleepScore + supportScore + balanceScore, 100);
    const { level, message } = interpret(totalScore);

    setResult({
      status: 'Calculated',
      interpretation: message,
      recommendations: recommendations(totalScore),
      warningSigns: warningSigns(),
      plan: plan(),
      burnoutRiskScore: Math.round(totalScore),
      riskLevel: level,
    });
  };

  return (
    <div className="space-y-8">
      <Script
        id="workday-balance-overload-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" /> Workday Balance & Overload Tendency Score
          </CardTitle>
          <CardDescription>
            Reflect on how your work, rest, and support patterns feel right now. This is a general wellness insight, not a
            diagnosis or clinical risk score.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="weeklyWorkHours" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Clock className="h-4 w-4" /> Weekly Work Hours</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 50" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="stressLevel" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><TrendingDown className="h-4 w-4" /> Stress Level (1–10)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min="1" max="10" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="sleepHoursPerNight" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Moon className="h-4 w-4" /> Sleep Hours Per Night</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.5" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="supportNetworkScore" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Users className="h-4 w-4" /> Support Network Score (1–10)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min="1" max="10" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="workLifeBalanceScore" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Clock className="h-4 w-4" /> Work-Life Balance Score (1–10)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min="1" max="10" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">See workday balance snapshot</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Burnout Strain Pattern Insight</CardTitle>
              </div>
              <CardDescription>A wellness‑focused look at how demanding your current week feels.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Strain score</h4>
                  <p className="text-2xl font-bold text-primary">{result.burnoutRiskScore}/100</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Pattern label</h4>
                  <p className="text-2xl font-bold text-primary">{result.riskLevel}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{result.interpretation}</p>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Recommendations</CardTitle></CardHeader>
              <CardContent><ul className="space-y-2">{result.recommendations.map((r,i)=>(<li key={i} className="text-sm text-muted-foreground">{r}</li>))}</ul></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Warning Signs</CardTitle></CardHeader>
              <CardContent><ul className="space-y-2">{result.warningSigns.map((w,i)=>(<li key={i} className="text-sm text-muted-foreground">{w}</li>))}</ul></CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Burnout Prevention Plan</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b"><th className="text-left p-2">Week</th><th className="text-left p-2">Focus</th></tr></thead>
                  <tbody>{plan().map(p=>(<tr key={p.week} className="border-b"><td className="p-2">{p.week}</td><td className="p-2">{p.focus}</td></tr>))}</tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Understanding the Inputs</CardTitle>
          <CardDescription>Use these questions as a self‑check, not as a formal assessment.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">{understandingInputs.map((it)=>(<li key={it.label}><span className="font-semibold text-foreground">{it.label}:</span><span className="text-sm text-muted-foreground"> {it.description}</span></li>))}</ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Complementary tools for well-being and stress management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/stress-level-self-assessment-calculator" className="text-primary hover:underline">Daily Stress Tendency Check-In</Link></h4><p className="text-sm text-muted-foreground">Evaluate stress levels and coping strategies.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/sleep-quality-score-calculator" className="text-primary hover:underline">Sleep Quality Score</Link></h4><p className="text-sm text-muted-foreground">Reflect on your sleep patterns and nightly rest.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/recovery-readiness-score-calculator" className="text-primary hover:underline">Recovery Readiness</Link></h4><p className="text-sm text-muted-foreground">Monitor how ready you feel for physical or mental demands.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/meditation-breathing-rate-calculator" className="text-primary hover:underline">Meditation Breathing Rhythm Helper</Link></h4><p className="text-sm text-muted-foreground">Explore simple breathing practices that may ease stress throughout the day.</p></div>
          </div>
        </CardContent>
      </Card>

      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg"
        itemType="https://schema.org/MedicalWebPage"
      >
        {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
        <meta itemProp="name" content="The Definitive Guide to Workday Balance: Preventing Overload and Supporting Sustainable Work Patterns" />
        <meta
          itemProp="description"
          content="An expert, evidence-based guide on workday balance and overload prevention, detailing work hours, stress management, sleep support, social connections, and comprehensive strategies to maintain sustainable work patterns and prevent burnout."
        />
        <meta
          itemProp="keywords"
          content="workday balance, burnout prevention, work overload, stress management, work-life balance, occupational wellness, sustainable work patterns"
        />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/definitive-workday-balance-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          The Definitive Guide to Workday Balance: Understanding Overload Patterns and Supporting Sustainable Work Life
        </h1>
        <p className="text-lg italic text-gray-700">
          Explore the science of workday balance, learn how work hours, stress, sleep, and support influence feelings of overload,
          understand burnout prevention strategies, and discover comprehensive approaches to maintain sustainable work patterns and
          overall well-being.
        </p>

        {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li>
            <a href="#understanding-overload" className="hover:underline">
              Understanding Workday Overload and Burnout Patterns
            </a>
          </li>
          <li>
            <a href="#contributing-factors" className="hover:underline">
              Factors Contributing to Workday Overload
            </a>
          </li>
          <li>
            <a href="#work-hours" className="hover:underline">
              Work Hours, Boundaries, and Sustainable Schedules
            </a>
          </li>
          <li>
            <a href="#stress-management" className="hover:underline">
              Stress Management and Recovery Strategies
            </a>
          </li>
          <li>
            <a href="#prevention-strategies" className="hover:underline">
              Comprehensive Burnout Prevention Strategies
            </a>
          </li>
        </ul>
        <hr />

        {/* UNDERSTANDING OVERLOAD */}
        <h2 id="understanding-overload" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Understanding Workday Overload and Burnout Patterns
        </h2>
        <p>
          Workday overload refers to a state where work demands consistently exceed your capacity to recover, leading to feelings
          of exhaustion, reduced effectiveness, and emotional depletion. While occasional busy periods are normal, chronic overload
          can contribute to burnout—a state of physical, emotional, and mental exhaustion related to prolonged stress.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Recognizing Overload Patterns</h3>
        <p>
          Signs that your workday balance may be tipping toward overload include:
        </p>
        <ul>
          <li>
            <b>Persistent exhaustion:</b> Feeling tired even after rest or sleep
          </li>
          <li>
            <b>Reduced effectiveness:</b> Difficulty concentrating, making decisions, or completing tasks
          </li>
          <li>
            <b>Emotional changes:</b> Increased irritability, cynicism, or detachment from work
          </li>
          <li>
            <b>Physical symptoms:</b> Headaches, muscle tension, sleep disturbances, or frequent illness
          </li>
          <li>
            <b>Work-life imbalance:</b> Work thoughts crowding out personal time and relationships
          </li>
          <li>
            <b>Loss of motivation:</b> Decreased interest or satisfaction in work that was previously meaningful
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Spectrum of Workday Strain</h3>
        <p>
          Workday strain exists on a spectrum:
        </p>
        <ul>
          <li>
            <b>Lighter strain pattern:</b> Work demands feel manageable with occasional busy periods. Recovery happens naturally
            through rest and personal time.
          </li>
          <li>
            <b>Moderate strain pattern:</b> Work demands are meaningful but sustainable with conscious effort to maintain balance.
            Some adjustments may help things feel smoother.
          </li>
          <li>
            <b>Heavier strain pattern:</b> Work demands consistently feel overwhelming. Recovery is insufficient, and lifestyle
            adjustments or professional support may be beneficial.
          </li>
        </ul>

        <hr />

        {/* CONTRIBUTING FACTORS */}
        <h2 id="contributing-factors" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Factors Contributing to Workday Overload
        </h2>
        <p>
          Multiple factors interact to create workday overload. Understanding these factors helps you identify areas for
          improvement.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Work-Related Factors</h3>
        <ul>
          <li>
            <b>Excessive work hours:</b> Regularly working more than 40-50 hours per week can reduce recovery time
          </li>
          <li>
            <b>High workload:</b> Too many tasks, unrealistic deadlines, or constant pressure
          </li>
          <li>
            <b>Lack of control:</b> Limited autonomy over work tasks, schedule, or decision-making
          </li>
          <li>
            <b>Unclear expectations:</b> Ambiguous roles, conflicting priorities, or changing requirements
          </li>
          <li>
            <b>Poor work relationships:</b> Conflict, lack of support, or toxic workplace culture
          </li>
          <li>
            <b>Work-life boundary issues:</b> Difficulty disconnecting from work, constant availability expectations
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Personal Factors</h3>
        <ul>
          <li>
            <b>Inadequate sleep:</b> Insufficient or poor-quality sleep reduces capacity to handle work demands
          </li>
          <li>
            <b>High stress levels:</b> Personal or work-related stress that accumulates over time
          </li>
          <li>
            <b>Limited social support:</b> Insufficient connection with friends, family, or colleagues
          </li>
          <li>
            <b>Perfectionism:</b> Unrealistic standards that lead to overwork and self-criticism
          </li>
          <li>
            <b>Difficulty saying no:</b> Taking on more than you can handle due to people-pleasing or fear
          </li>
          <li>
            <b>Lack of recovery activities:</b> Insufficient time for hobbies, relaxation, or activities that restore energy
          </li>
        </ul>

        <hr />

        {/* WORK HOURS */}
        <h2 id="work-hours" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Work Hours, Boundaries, and Sustainable Schedules
        </h2>
        <p>
          Establishing healthy work boundaries is fundamental to preventing overload. This involves both setting limits and
          communicating them effectively.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Understanding Work Hour Limits</h3>
        <p>
          Research suggests that working more than 50-55 hours per week is associated with increased health risks and reduced
          productivity. While occasional longer weeks may be necessary, consistently exceeding these limits can lead to:
        </p>
        <ul>
          <li>Reduced sleep quality and duration</li>
          <li>Increased stress and anxiety</li>
          <li>Decreased work performance and creativity</li>
          <li>Strained personal relationships</li>
          <li>Higher risk of burnout and health problems</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Setting Work Boundaries</h3>
        <ul>
          <li>
            <b>Define work hours:</b> Establish clear start and end times for your workday
          </li>
          <li>
            <b>Limit after-hours work:</b> Avoid checking email or taking calls outside designated work hours
          </li>
          <li>
            <b>Create transition rituals:</b> Develop routines that help you shift from work to personal time
          </li>
          <li>
            <b>Communicate boundaries:</b> Let colleagues and supervisors know your availability limits
          </li>
          <li>
            <b>Protect personal time:</b> Treat personal time as non-negotiable, similar to important work commitments
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Managing Workload</h3>
        <ul>
          <li>
            <b>Prioritize tasks:</b> Focus on high-impact activities and delegate or defer lower-priority items
          </li>
          <li>
            <b>Learn to say no:</b> Decline additional commitments when your plate is full
          </li>
          <li>
            <b>Break large tasks:</b> Divide overwhelming projects into smaller, manageable steps
          </li>
          <li>
            <b>Set realistic deadlines:</b> Negotiate timelines that allow for quality work without excessive pressure
          </li>
          <li>
            <b>Take regular breaks:</b> Schedule short breaks throughout the day to maintain focus and energy
          </li>
        </ul>

        <hr />

        {/* STRESS MANAGEMENT */}
        <h2 id="stress-management" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Stress Management and Recovery Strategies
        </h2>
        <p>
          Effective stress management and recovery are essential for maintaining workday balance. These practices help you
          recharge and build resilience.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Sleep as a Foundation</h3>
        <p>
          Quality sleep is non-negotiable for workday balance. Aim for 7-9 hours per night and prioritize:
        </p>
        <ul>
          <li>Consistent sleep schedule, even on weekends</li>
          <li>Sleep-friendly environment (dark, quiet, cool)</li>
          <li>Pre-sleep wind-down routine</li>
          <li>Limiting screens and stimulating activities before bed</li>
          <li>Addressing sleep problems promptly</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Stress Reduction Practices</h3>
        <ul>
          <li>
            <b>Regular relaxation:</b> Practice meditation, breathing exercises, or progressive muscle relaxation daily
          </li>
          <li>
            <b>Physical activity:</b> Regular exercise reduces stress hormones and improves mood
          </li>
          <li>
            <b>Nature exposure:</b> Spend time outdoors or in natural settings to reduce stress
          </li>
          <li>
            <b>Hobbies and interests:</b> Engage in activities that bring joy and provide mental breaks from work
          </li>
          <li>
            <b>Mindfulness:</b> Practice present-moment awareness to reduce worry and rumination
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Building Social Support</h3>
        <ul>
          <li>
            <b>Maintain relationships:</b> Regularly connect with friends, family, and supportive colleagues
          </li>
          <li>
            <b>Seek professional support:</b> Consider therapy or counseling for work-related stress
          </li>
          <li>
            <b>Join communities:</b> Connect with others who share similar interests or challenges
          </li>
          <li>
            <b>Set boundaries in relationships:</b> Ensure relationships are supportive rather than draining
          </li>
        </ul>

        <hr />

        {/* PREVENTION STRATEGIES */}
        <h2 id="prevention-strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Comprehensive Burnout Prevention Strategies
        </h2>
        <p>
          Preventing workday overload requires a multi-faceted approach that addresses work patterns, personal habits, and
          environmental factors.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">1. Establish Work-Life Boundaries</h3>
        <ul>
          <li>
            <b>Set clear work hours:</b> Define when work starts and ends, and stick to these boundaries
          </li>
          <li>
            <b>Create physical separation:</b> Designate a specific workspace and avoid working in personal spaces
          </li>
          <li>
            <b>Use technology mindfully:</b> Turn off work notifications outside work hours
          </li>
          <li>
            <b>Take time off:</b> Use vacation days and take regular breaks from work
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">2. Prioritize Recovery and Rest</h3>
        <ul>
          <li>
            <b>Protect sleep:</b> Make sleep a priority, aiming for 7-9 hours per night
          </li>
          <li>
            <b>Schedule downtime:</b> Block time for rest, hobbies, and activities that restore energy
          </li>
          <li>
            <b>Take breaks:</b> Regular short breaks during work help maintain focus and prevent exhaustion
          </li>
          <li>
            <b>Practice relaxation:</b> Daily stress reduction practices support recovery
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">3. Manage Workload Effectively</h3>
        <ul>
          <li>
            <b>Set priorities:</b> Focus on high-impact tasks and learn to defer or delegate others
          </li>
          <li>
            <b>Communicate capacity:</b> Be honest with supervisors about workload and deadlines
          </li>
          <li>
            <b>Learn to delegate:</b> Share responsibilities when possible rather than taking everything on yourself
          </li>
          <li>
            <b>Avoid perfectionism:</b> Strive for excellence, but recognize when "good enough" is sufficient
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">4. Build Support Networks</h3>
        <ul>
          <li>
            <b>Maintain personal relationships:</b> Regularly connect with friends and family
          </li>
          <li>
            <b>Seek professional support:</b> Consider therapy, coaching, or employee assistance programs
          </li>
          <li>
            <b>Connect with colleagues:</b> Build positive relationships at work for mutual support
          </li>
          <li>
            <b>Join communities:</b> Connect with others who share similar interests or challenges
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">5. Develop Self-Awareness</h3>
        <ul>
          <li>
            <b>Notice warning signs:</b> Pay attention to early indicators of overload
          </li>
          <li>
            <b>Regular check-ins:</b> Periodically assess your work-life balance and stress levels
          </li>
          <li>
            <b>Adjust proactively:</b> Make changes before reaching a crisis point
          </li>
          <li>
            <b>Know your limits:</b> Understand your capacity and respect your boundaries
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">6. When to Seek Professional Help</h3>
        <p>
          Consider seeking professional support if:
        </p>
        <ul>
          <li>Work stress is significantly affecting your health, mood, or relationships</li>
          <li>You experience persistent anxiety, depression, or other mental health concerns</li>
          <li>You feel unable to make changes on your own</li>
          <li>You are considering leaving your job due to stress</li>
          <li>You are using substances to cope with work stress</li>
        </ul>
        <p>
          Professional support may include therapy, counseling, employee assistance programs, or occupational health services.
        </p>

        <hr />

        {/* CONCLUSION */}
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>
          Maintaining workday balance and preventing overload requires ongoing attention to work patterns, personal habits, and
          recovery practices. By understanding the factors that contribute to overload, establishing healthy boundaries, managing
          stress effectively, and building support networks, you can create more sustainable work patterns that support both
          professional success and personal well-being. Remember that workday balance is a dynamic process—what works at one time
          may need adjustment as circumstances change. Be proactive in recognizing signs of overload, make adjustments early, and
          seek support when needed. If work stress is significantly affecting your health, mood, or safety, consider consulting a
          qualified healthcare or mental health professional who can provide personalized guidance. This tool is designed for
          wellness reflection and is not a substitute for professional assessment or treatment.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Putting this workday balance snapshot in perspective</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">{faqs.map(([q,a],i)=>(<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Formula and approach</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Workload and stress:</strong> Higher work hours and higher self‑rated stress contribute more to the strain
            score, reflecting how demanding the week may feel.
          </p>
          <p>
            <strong>Sleep and support:</strong> Fewer sleep hours and lower support or balance ratings gently raise the score,
            since they can make heavy weeks feel even harder.
          </p>
          <p>
            The combined result is scaled to a 0–100 range and grouped into pattern labels like “Lighter strain pattern” or
            “Heavier strain pattern” to keep the tone focused on tendencies rather than labels.
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
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            This tool offers a Workday Balance & Overload Tendency Score as a wellness‑focused snapshot of how demanding your
            current routines may feel. It is meant to encourage reflection and small supportive changes, not to label or diagnose.
          </p>
          <p>
            Outputs include a 0–100 strain score, pattern label, interpretation text, recommendations, an 8‑week ideas plan, and
            contextual guide content so both humans and AI assistants can understand the intent of the numbers at a glance.
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
            medical, psychological, or occupational health diagnosis or treatment plan. For any concerns about your health, mood,
            or safety, please consult a qualified professional.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
