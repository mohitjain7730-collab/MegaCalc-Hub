'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Zap, Target, AlertTriangle, Shield, MoonStar } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  timeInBedHours: z.number({ invalid_type_error: 'Enter time in bed' }).min(0.1).max(24),
  totalSleepHours: z.number({ invalid_type_error: 'Enter total sleep' }).min(0).max(24),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  timeInBedHours: number;
  totalSleepHours: number;
  efficiency: number;
  efficiencyPercent: number;
  timeAwake: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter total time in bed (hours) from lying down to getting up.',
  'Enter estimated time actually asleep (hours).',
  'Review efficiency percentage, wellness status, and recommendations.',
];

const faqs = [
  {
    question: 'What is sleep efficiency?',
    answer:
      'Sleep efficiency is the percentage of time in bed that you actually spend sleeping. It is calculated as (Time Asleep / Time in Bed) × 100. Higher percentages indicate more time in bed is spent sleeping rather than awake.',
  },
  {
    question: 'What is a good sleep efficiency percentage?',
    answer:
      'Generally, sleep efficiency above 85% is considered good, with 90-95% being excellent. However, individual needs vary, and the goal is to find what feels restful for you rather than achieving a perfect number.',
  },
  {
    question: 'Why might my sleep efficiency be low?',
    answer:
      'Low sleep efficiency can result from spending too much time in bed before feeling sleepy, difficulty falling asleep, frequent nighttime awakenings, or waking up early and staying in bed. Lifestyle factors like stress, caffeine, screens before bed, or irregular schedules can also contribute.',
  },
  {
    question: 'How can I improve my sleep efficiency?',
    answer:
      'Improve efficiency by going to bed only when sleepy, maintaining consistent sleep-wake times, creating a relaxing pre-sleep routine, optimizing your sleep environment (dark, cool, quiet), limiting screens before bed, and avoiding caffeine and large meals close to bedtime.',
  },
  {
    question: 'Is very high sleep efficiency (95%+) always good?',
    answer:
      'Very high efficiency can indicate you are not spending enough time in bed for adequate sleep duration. If you consistently achieve 95%+ efficiency but feel tired, you may need more total sleep time. Balance efficiency with total sleep duration.',
  },
  {
    question: 'What is the difference between sleep efficiency and sleep quality?',
    answer:
      'Sleep efficiency measures time asleep versus time in bed (quantitative). Sleep quality refers to how restful and restorative your sleep feels (qualitative). You can have high efficiency but poor quality if sleep is fragmented or light.',
  },
  {
    question: 'Should I track sleep efficiency daily?',
    answer:
      'Daily tracking can help identify patterns, but focus on weekly trends rather than daily fluctuations. Sleep naturally varies, and obsessing over daily numbers can increase stress. Use efficiency as a general guide, not a strict target.',
  },
  {
    question: 'Can sleep efficiency calculators replace professional sleep evaluation?',
    answer:
      'No. This tool provides general wellness insights for personal reflection. It does not diagnose sleep disorders, evaluate sleep quality, or replace professional medical evaluation. If you have persistent sleep concerns, consult a healthcare provider or sleep specialist.',
  },
  {
    question: 'How does age affect sleep efficiency?',
    answer:
      'Sleep efficiency naturally decreases slightly with age due to changes in sleep architecture, more frequent awakenings, and changes in circadian rhythms. However, maintaining good sleep hygiene can support healthy efficiency at any age.',
  },
  {
    question: 'What if my sleep efficiency is consistently low?',
    answer:
      'If efficiency remains low despite lifestyle adjustments, consider consulting a healthcare provider or sleep specialist. Persistent low efficiency may indicate underlying sleep disorders, medical conditions, or the need for professional sleep evaluation and treatment.',
  },
];

const relatedCalculators = [
  {
    name: 'Sleep Balance Check-In',
    slug: 'habit-streak-tracker-calculator',
    description: 'Assess weekly sleep balance and patterns.',
  },
  {
    name: 'Circadian Rhythm Disruption Risk Calculator',
    slug: 'circadian-rhythm-disruption-risk-calculator',
    description: 'Evaluate sleep-wake cycle consistency.',
  },
  {
    name: 'Blue Light Exposure Wellness Calculator',
    slug: 'blue-light-exposure-calculator',
    description: 'Assess evening screen time impact on sleep.',
  },
  {
    name: 'Sleep Consistency Score Calculator',
    slug: 'sleep-consistency-score-calculator',
    description: 'Track sleep schedule regularity.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/sleep-efficiency-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Sleep Time in Bed Wellness Index', item: baseUrl },
      ],
    },
    {
      '@type': 'Article',
      headline: 'Sleep Time in Bed Wellness Index',
      description: 'Calculate sleep efficiency from time in bed and time asleep.',
      author: { '@type': 'Organization', name: 'Mycalculating.com' },
      publisher: { '@type': 'Organization', name: 'Mycalculating.com', logo: { '@type': 'ImageObject', url: 'https://mycalculating.com/logo.png' } },
      url: baseUrl,
      mainEntityOfPage: { '@type': 'WebPage', '@id': baseUrl },
      datePublished: '2024-01-01',
      dateModified: new Date().toISOString().split('T')[0],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Sleep Time in Bed Wellness Index',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate sleep efficiency from time in bed and time asleep.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
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
      name: 'How to Use Sleep Time in Bed Wellness Index Calculator',
      description: 'Step-by-step guide to calculate sleep efficiency',
      step: steps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        text: step,
      })),
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const efficiency = (values.totalSleepHours / values.timeInBedHours) * 100;
  const efficiencyPercent = efficiency;
  const timeAwake = values.timeInBedHours - values.totalSleepHours;

  let status: ResultPayload['status'] = 'optimal';
  let interpretation =
    'This suggests a general lifestyle tendency where your sleep efficiency may look quite strong based on the numbers you entered. You may consider continuing to lean on the habits that already feel good for your rest.';

  if (efficiency < 75) {
    status = 'low';
    interpretation =
      'This suggests a general lifestyle tendency where you may be spending a fair amount of time awake while in bed. You might experiment with getting into bed closer to when you naturally feel sleepy, or consider gentle adjustments to your evening routine. This is a personal insight, not a medical evaluation.';
  } else if (efficiency < 85) {
    status = 'moderate';
    interpretation =
      'This suggests a general lifestyle tendency where your sleep efficiency may be in a middle range. Small shifts—like a calmer wind-down, fewer screens close to bedtime, or adjusting when you get into bed—may help you drift off more smoothly.';
  } else if (efficiency < 95) {
    status = 'good';
    interpretation =
      'This suggests a general lifestyle tendency where most of your time in bed seems to be spent sleeping. You can keep the routines that already help you feel restored.';
  } else {
    status = 'optimal';
    interpretation =
      'This suggests a general lifestyle tendency where your sleep efficiency may look quite strong. Some people in this pattern choose to gently increase total sleep time if they would like even more rest.';
  }

  const recommendations = [
    'Keep your wake-up time fairly steady so your body learns a simple rhythm.',
    'Create a small pre-bed ritual that signals "time to unwind," such as reading, stretching, or quiet breathing.',
    'Make your sleep space as calm, dark, and quiet as feels comfortable for you.',
  ];

  if (efficiency < 85) {
    recommendations.push('Notice how much time you spend in bed before you actually feel sleepy and adjust that window gently.');
    recommendations.push('Try setting a gentle "wind-down alarm" 30-60 minutes before bed to begin slowing the day down.');
  }

  if (timeAwake > 1) {
    recommendations.push(
      'If you find yourself awake in bed for extended periods, you could experiment with getting up briefly for a calming activity and returning when you feel sleepy.'
    );
  }

  const plan = [
    {
      label: 'This Week',
      detail:
        'Notice your current sleep patterns: track time in bed versus time asleep, observe what helps you fall asleep, and identify any evening habits that may be affecting your rest.',
    },
    {
      label: 'This Month',
      detail:
        'Establish consistent sleep habits: maintain regular bed and wake times, create a relaxing pre-sleep routine, optimize your sleep environment, and limit screens and stimulating activities before bed.',
    },
    {
      label: 'Ongoing',
      detail:
        'Continue monitoring your sleep efficiency and adjust routines as needed. Remember that occasional variation is normal, and focus on overall trends rather than perfect daily consistency.',
    },
  ];

  return {
    timeInBedHours: values.timeInBedHours,
    totalSleepHours: values.totalSleepHours,
    efficiency,
    efficiencyPercent,
    timeAwake,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function SleepEfficiencyCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      timeInBedHours: undefined,
      totalSleepHours: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script
        id="sleep-efficiency-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MoonStar className="h-5 w-5" />
            Sleep Time in Bed Wellness Index
          </CardTitle>
          <CardDescription>
            Get general wellness insights about sleep efficiency from time in bed and time asleep. This is a personal lifestyle
            insight, not a medical evaluation.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your sleep data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="timeInBedHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time in bed (hours)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 8.5"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-muted-foreground">About how long you were in bed from lying down to getting up.</p>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalSleepHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated time asleep (hours)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 7.2"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-muted-foreground">Your best guess for how many of those hours you were actually asleep.</p>
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate sleep efficiency
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
            <CardDescription>See efficiency percentage, wellness status, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Efficiency</p>
                <p className="text-2xl font-semibold text-primary">{result.efficiency.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Percentage</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Time in Bed</p>
                <p className="text-2xl font-semibold text-primary">{result.timeInBedHours.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Hours</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Time Asleep</p>
                <p className="text-2xl font-semibold text-primary">{result.totalSleepHours.toFixed(1)}</p>
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
            <strong>Sleep Efficiency</strong> = (Time Asleep / Time in Bed) × 100. This percentage shows how much of your time in
            bed is spent actually sleeping.
          </p>
          <p>
            <strong>Time Awake</strong> = Time in Bed - Time Asleep. This represents time spent awake while in bed, including time
            to fall asleep and any nighttime awakenings.
          </p>
          <p>
            Higher efficiency percentages indicate more time in bed is spent sleeping. Efficiency above 85% is generally considered
            good, with 90-95% being excellent. However, individual needs vary, and the goal is finding what feels restful for you.
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
        {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
        <meta itemProp="name" content="The Definitive Guide to Sleep Efficiency: Understanding Time in Bed and Sleep Quality" />
        <meta
          itemProp="description"
          content="An expert, evidence-based guide on sleep efficiency, detailing how to calculate and improve sleep efficiency, factors affecting time in bed, and comprehensive strategies to optimize sleep patterns and rest quality."
        />
        <meta
          itemProp="keywords"
          content="sleep efficiency calculator, sleep time in bed, sleep quality, bedtime routine, sleep hygiene, time asleep vs time in bed, sleep optimization"
        />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/definitive-sleep-efficiency-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          The Definitive Guide to Sleep Efficiency: Understanding Time in Bed, Sleep Quality, and Rest Optimization
        </h1>
        <p className="text-lg italic text-gray-700">
          Explore the science of sleep efficiency, learn how to calculate and interpret your sleep patterns, understand factors
          affecting time in bed versus time asleep, and discover comprehensive strategies to optimize sleep efficiency and overall
          rest quality.
        </p>

        {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li>
            <a href="#understanding-efficiency" className="hover:underline">
              Understanding Sleep Efficiency and Its Importance
            </a>
          </li>
          <li>
            <a href="#calculating-efficiency" className="hover:underline">
              How to Calculate and Interpret Sleep Efficiency
            </a>
          </li>
          <li>
            <a href="#factors-affecting" className="hover:underline">
              Factors Affecting Sleep Efficiency
            </a>
          </li>
          <li>
            <a href="#improving-efficiency" className="hover:underline">
              Comprehensive Strategies to Improve Sleep Efficiency
            </a>
          </li>
          <li>
            <a href="#sleep-hygiene" className="hover:underline">
              Sleep Hygiene Practices for Optimal Efficiency
            </a>
          </li>
        </ul>
        <hr />

        {/* UNDERSTANDING EFFICIENCY */}
        <h2 id="understanding-efficiency" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Understanding Sleep Efficiency and Its Importance
        </h2>
        <p>
          Sleep efficiency is a measure of how much of your time in bed is actually spent sleeping. It is calculated as the
          percentage of time in bed that you are asleep, providing insight into how effectively you use your time in bed for rest.
          Unlike total sleep duration, efficiency focuses on the relationship between time in bed and time asleep.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why Sleep Efficiency Matters</h3>
        <p>
          Sleep efficiency matters because:
        </p>
        <ul>
          <li>
            <b>Quality indicator:</b> High efficiency suggests you fall asleep quickly and stay asleep, indicating good sleep
            quality
          </li>
          <li>
            <b>Time optimization:</b> Efficient sleep means you are not spending excessive time awake in bed, which can lead to
            frustration and anxiety about sleep
          </li>
          <li>
            <b>Sleep drive:</b> Spending too much time awake in bed can reduce sleep drive, making it harder to fall asleep
            over time
          </li>
          <li>
            <b>Circadian alignment:</b> Good efficiency often reflects alignment between your sleep schedule and natural circadian
            rhythms
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Sleep Efficiency vs. Sleep Quality</h3>
        <p>
          Sleep efficiency is quantitative (measuring time), while sleep quality is qualitative (measuring how restful sleep
          feels). You can have high efficiency but poor quality if sleep is light or fragmented, or low efficiency but good quality
          if you need more time to wind down. Both metrics are important for understanding your sleep patterns.
        </p>

        <hr />

        {/* CALCULATING EFFICIENCY */}
        <h2 id="calculating-efficiency" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          How to Calculate and Interpret Sleep Efficiency
        </h2>
        <p>
          Sleep efficiency is calculated using a simple formula: <strong>(Time Asleep / Time in Bed) × 100</strong>. This gives you
          a percentage representing how much of your time in bed is spent sleeping.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Example Calculations</h3>
        <p>
          <b>Example 1:</b> If you spend 8 hours in bed and sleep 7.2 hours, your efficiency is (7.2 / 8) × 100 = 90%. This is
          considered excellent efficiency.
        </p>
        <p>
          <b>Example 2:</b> If you spend 9 hours in bed but only sleep 6.5 hours, your efficiency is (6.5 / 9) × 100 = 72%. This
          suggests room for improvement.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Interpreting Efficiency Percentages</h3>
        <p>
          <b>95%+ (Excellent):</b> Very high efficiency. However, if you consistently achieve this but feel tired, you may need
          more total sleep time.
        </p>
        <p>
          <b>85-94% (Good):</b> Strong efficiency indicating effective use of time in bed for sleep.
        </p>
        <p>
          <b>75-84% (Moderate):</b> Acceptable efficiency with room for improvement. May benefit from sleep hygiene adjustments.
        </p>
        <p>
          <b>Below 75% (Low):</b> Low efficiency suggesting significant time awake in bed. May benefit from professional guidance or
          sleep restriction therapy.
        </p>

        <hr />

        {/* FACTORS AFFECTING */}
        <h2 id="factors-affecting" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Factors Affecting Sleep Efficiency
        </h2>
        <p>
          Multiple factors can influence sleep efficiency, affecting how much time you spend awake versus asleep while in bed.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Sleep Latency (Time to Fall Asleep)</h3>
        <p>
          The time it takes to fall asleep significantly impacts efficiency. Factors affecting sleep latency include:
        </p>
        <ul>
          <li>Going to bed before feeling sleepy</li>
          <li>Evening screen use and blue light exposure</li>
          <li>Caffeine or stimulant consumption close to bedtime</li>
          <li>Stress, anxiety, or racing thoughts</li>
          <li>Uncomfortable sleep environment (temperature, noise, light)</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Nighttime Awakenings</h3>
        <p>
          Frequent awakenings during the night reduce efficiency by increasing time awake in bed. Common causes include:
        </p>
        <ul>
          <li>Sleep disorders (sleep apnea, restless legs syndrome)</li>
          <li>Medical conditions or pain</li>
          <li>Environmental disruptions (noise, light, temperature changes)</li>
          <li>Alcohol consumption (can cause early morning awakenings)</li>
          <li>Stress or anxiety</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Time in Bed vs. Sleep Need</h3>
        <p>
          Spending more time in bed than your actual sleep need can reduce efficiency. If you only need 7 hours of sleep but spend
          9 hours in bed, efficiency will naturally be lower. Matching time in bed to your actual sleep need improves efficiency.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Circadian Misalignment</h3>
        <p>
          Going to bed or waking up at times that don't align with your natural circadian rhythm can reduce efficiency. Your body
          may not be ready for sleep, leading to longer sleep latency and more awakenings.
        </p>

        <hr />

        {/* IMPROVING EFFICIENCY */}
        <h2 id="improving-efficiency" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Comprehensive Strategies to Improve Sleep Efficiency
        </h2>
        <p>
          Improving sleep efficiency involves optimizing the relationship between time in bed and time asleep. Here are
          evidence-based strategies.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">1. Match Time in Bed to Sleep Need</h3>
        <ul>
          <li>
            <b>Identify your sleep need:</b> Determine how much sleep you actually need (typically 7-9 hours for adults)
          </li>
          <li>
            <b>Set appropriate bedtimes:</b> Calculate bedtime based on wake time and sleep need, accounting for 15-20 minutes to
            fall asleep
          </li>
          <li>
            <b>Avoid excessive time in bed:</b> Don't go to bed much earlier than needed, as this can reduce efficiency
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">2. Go to Bed Only When Sleepy</h3>
        <ul>
          <li>
            <b>Recognize sleepiness signals:</b> Pay attention to yawning, heavy eyelids, and natural drowsiness
          </li>
          <li>
            <b>Wait for sleepiness:</b> If you don't feel sleepy at your planned bedtime, wait until you do
          </li>
          <li>
            <b>Create sleep pressure:</b> Maintain consistent wake times to build sleep drive throughout the day
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">3. Optimize Sleep Environment</h3>
        <ul>
          <li>
            <b>Temperature:</b> Keep bedroom cool (around 65-68°F or 18-20°C)
          </li>
          <li>
            <b>Darkness:</b> Use blackout curtains or eye masks to block light
          </li>
          <li>
            <b>Quiet:</b> Minimize noise or use white noise machines to mask disruptions
          </li>
          <li>
            <b>Comfort:</b> Ensure comfortable mattress, pillows, and bedding
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">4. Establish Pre-Sleep Routine</h3>
        <ul>
          <li>
            <b>Wind-down period:</b> Create a 30-60 minute routine before bed to signal sleep time
          </li>
          <li>
            <b>Relaxing activities:</b> Read, listen to calming music, practice gentle stretching, or meditation
          </li>
          <li>
            <b>Avoid stimulation:</b> Limit screens, work, or stressful activities before bed
          </li>
          <li>
            <b>Consistency:</b> Perform the same routine each night to condition your body for sleep
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">5. Manage Time Awake in Bed</h3>
        <ul>
          <li>
            <b>20-minute rule:</b> If awake in bed for more than 20 minutes, get up and do something calming
          </li>
          <li>
            <b>Return when sleepy:</b> Only return to bed when you feel sleepy again
          </li>
          <li>
            <b>Avoid clock-watching:</b> Turn clocks away or cover them to reduce anxiety about time
          </li>
          <li>
            <b>Break the association:</b> Avoid using bed for activities other than sleep and intimacy
          </li>
        </ul>

        <hr />

        {/* SLEEP HYGIENE */}
        <h2 id="sleep-hygiene" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Sleep Hygiene Practices for Optimal Efficiency
        </h2>
        <p>
          Good sleep hygiene supports sleep efficiency by creating conditions conducive to falling asleep quickly and staying
          asleep.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Consistent Sleep Schedule</h3>
        <ul>
          <li>
            <b>Regular wake time:</b> Wake up at the same time every day, even on weekends (within 1 hour)
          </li>
          <li>
            <b>Consistent bedtime:</b> Go to bed at roughly the same time each night
          </li>
          <li>
            <b>Circadian alignment:</b> Align sleep schedule with natural light-dark cycles
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Limit Stimulants and Alcohol</h3>
        <ul>
          <li>
            <b>Caffeine:</b> Avoid caffeine 6-8 hours before bedtime
          </li>
          <li>
            <b>Nicotine:</b> Avoid nicotine close to bedtime, as it is a stimulant
          </li>
          <li>
            <b>Alcohol:</b> Limit alcohol, especially close to bedtime, as it can disrupt sleep later in the night
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Manage Evening Light Exposure</h3>
        <ul>
          <li>
            <b>Reduce screens:</b> Limit screen time 1-2 hours before bed
          </li>
          <li>
            <b>Use blue light filters:</b> Enable night mode or blue light filters on devices
          </li>
          <li>
            <b>Dim lights:</b> Use dim, warm lighting in the evening
          </li>
          <li>
            <b>Morning light:</b> Get bright light exposure in the morning to support circadian rhythms
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Physical Activity and Nutrition</h3>
        <ul>
          <li>
            <b>Regular exercise:</b> Engage in regular physical activity, but avoid intense exercise close to bedtime
          </li>
          <li>
            <b>Meal timing:</b> Avoid large meals 2-3 hours before bed
          </li>
          <li>
            <b>Hydration:</b> Stay hydrated but limit fluids close to bedtime to reduce nighttime awakenings
          </li>
        </ul>

        <hr />

        {/* CONCLUSION */}
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>
          Sleep efficiency is a valuable metric for understanding how effectively you use your time in bed for sleep. By
          understanding how to calculate efficiency, recognizing factors that affect it, and implementing strategies to improve it,
          you can optimize your sleep patterns and overall rest quality. Remember that efficiency is one piece of the sleep
          puzzle—total sleep duration, sleep quality, and how you feel during the day are equally important. Focus on creating
          sustainable sleep habits that support both efficiency and overall well-being. If you have persistent sleep concerns or
          low efficiency despite lifestyle adjustments, consider consulting a healthcare provider or sleep specialist who can
          provide personalized evaluation and guidance. This tool is designed for wellness reflection and is not a substitute for
          professional sleep evaluation or treatment.
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
            This tool offers a sleep efficiency percentage from time in bed and time asleep as a gentle, lifestyle-oriented
            snapshot. It is intended for personal reflection, not for diagnosis or treatment decisions.
          </p>
          <p>
            Outputs include efficiency percentage, wellness status, interpretation text, supportive recommendations, an action plan,
            and contextual information about the inputs and simple calculation approach.
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
