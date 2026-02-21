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
  stressEventIntensity: z.number({ invalid_type_error: 'Enter intensity' }).min(1).max(10),
  daysSinceEvent: z.number({ invalid_type_error: 'Enter days' }).min(0).max(365),
  dailyRecoveryMinutes: z.number({ invalid_type_error: 'Enter minutes' }).min(0).max(600),
  sleepHours: z.number({ invalid_type_error: 'Enter sleep hours' }).min(3).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  stressEventIntensity: number;
  daysSinceEvent: number;
  dailyRecoveryMinutes: number;
  sleepHours: number;
  recoveryPercent: number;
  estimatedDaysToBaseline: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Rate the intensity of a recent stressor (1â€“10), such as a work crunch, conflict, or health scare.',
  'Enter how many days have passed since the peak of that stressful period.',
  'Estimate the average number of minutes per day you dedicate to deliberate recovery (rest, hobbies, therapy, nature, etc.).',
  'Enter your average nightly sleep hours over the last 1â€“2 weeks.',
  'Review your recovery percentage and the estimated days remaining until baseline.',
];

const faqs = [
  {
    question: 'What does the Mental Recovery from Stress Estimator do?',
    answer:
      'It approximates how far along you are in recovering from a significant stressor, based on time elapsed, event intensity, sleep, and daily recovery practices.',
  },
  {
    question: 'Is this a medical or psychiatric tool?',
    answer:
      'No. It is an educational planning tool, not a diagnostic instrument. Persistent distress or functional impairment should be evaluated by a licensed professional.',
  },
  {
    question: 'What counts as a â€œstress eventâ€?',
    answer:
      'Anything that meaningfully strains your nervous systemâ€”major deadlines, caregiving spikes, grief, conflict, illness, or accumulated micro-stressors over weeks.',
  },
  {
    question: 'How is recovery percent calculated?',
    answer:
      'The model assumes more intense events take longer to clear and that consistent sleep and daily recovery practices accelerate healing. It scales these factors into a 0â€“100% estimate.',
  },
  {
    question: 'Why does sleep matter so much?',
    answer:
      'Sleep is when emotional processing and nervous system repair are most active. Chronic sleep restriction slows recovery and can intensify anxiety or low mood.',
  },
  {
    question: 'What are â€œrecovery minutesâ€?',
    answer:
      'Minutes spent in activities that lower arousal and restore you, such as walks, hobbies, therapy, journaling, time in nature, or mindful restâ€”not doomscrolling.',
  },
  {
    question: 'Can multiple stress events be tracked?',
    answer:
      'This estimator is designed for one major stress period at a time. For overlapping events, use it for the most recent or dominant stressor, then repeat later.',
  },
  {
    question: 'What if my recovery percent stays low?',
    answer:
      'That may signal insufficient rest, ongoing stressors, or underlying anxiety/depression. Consider increasing recovery behaviors and seeking professional support.',
  },
  {
    question: 'Is full recovery always possible?',
    answer:
      'Some events leave lasting changes, but nervous systems are highly plastic. Many people can significantly improve functioning and emotional stability over time.',
  },
  {
    question: 'How often should I re-check?',
    answer:
      'Weekly checks help you see whether recovery behaviors are working and when it is safe to ramp certain demands back up.',
  },
];

const relatedCalculators = [
  {
    name: 'Emotional Burnout Recovery Calculator',
    slug: 'emotional-burnout-recovery-calculator',
    description: 'Estimate burnout severity and broader recovery timelines.',
  },
  {
    name: 'Daily Energy & Mood Synchronization Tracker',
    slug: 'daily-energy-mood-synchronization-tracker',
    description: 'See whether your schedule supports post-stress recovery.',
  },
  {
    name: 'Resilience Score Calculator',
    slug: 'resilience-score-calculator',
    description: 'Assess resilience factors that speed recovery.',
  },
  {
    name: 'Sleep Quality vs Productivity Correlation Calculator',
    slug: 'sleep-quality-vs-productivity-correlation-calculator',
    description: 'Explore how better sleep supports healthier output.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/mental-recovery-from-stress-estimator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Mental Recovery from Stress Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Mental Recovery from Stress Estimator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate mental recovery progress after a stressful period using time, intensity, sleep, and recovery minutes.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const { stressEventIntensity, daysSinceEvent, dailyRecoveryMinutes, sleepHours } = values;

  const baseRecoveryDays = stressEventIntensity * 7; // one week per intensity point as a loose heuristic
  const sleepFactor = clamp((sleepHours - 5) / 3, 0, 1.2); // below 5h = 0, around 8h = 1
  const recoveryFactor = clamp(dailyRecoveryMinutes / 60, 0, 1.5); // up to ~1 hr+/day

  const effectiveRecoveryRate = clamp(1 + (sleepFactor + recoveryFactor - 1) * 0.5, 0.5, 1.5);
  const adjustedRecoveryDays = clamp(baseRecoveryDays / effectiveRecoveryRate, 3, 365);

  const recoveryPercent = clamp((daysSinceEvent / adjustedRecoveryDays) * 100, 0, 150);
  const remainingDays = Math.max(0, adjustedRecoveryDays - daysSinceEvent);

  let status: ResultPayload['status'] = 'good';
  let interpretation =
    'This suggests a general lifestyle tendency where you may feel like you are progressing through recovery at a reasonable pace given your current sleep and recovery habits.';

  if (recoveryPercent < 30) {
    status = 'low';
    interpretation =
      'This suggests a general lifestyle tendency where recovery around this stressor may feel like it is just beginning, or the situation may still feel quite intense. You may consider extra rest and gentle care while things feel heavier. This is a personal insight, not a medical evaluation.';
  } else if (recoveryPercent < 60) {
    status = 'moderate';
    interpretation =
      'This suggests a general lifestyle tendency where you may feel partway through your recovery process. Continuing supportive routinesâ€”such as sleep, movement, and calming activitiesâ€”may help you feel steadier over time.';
  } else if (recoveryPercent >= 100) {
    status = 'optimal';
    interpretation =
      'This suggests a general lifestyle tendency where you may feel closer to your usual baseline around this stressor, even though some residual feelings can still appear. You may consider maintaining gentle habits as you slowly increase demands.';
  }

  const recommendations: string[] = [
    'Protect 7â€“9 hours of sleep where possible; consistent sleep is one of the fastest ways to restore emotional balance.',
    'Schedule at least one deliberate recovery block per day (even 15â€“20 minutes) rather than waiting until you are exhausted.',
    'Notice signs of overloadâ€”irritability, rumination, zoning outâ€”and treat them as cues to pause rather than to push harder.',
  ];

  if (dailyRecoveryMinutes < 20) {
    recommendations.push('Increase intentional recovery time by 10â€“20 minutes per day for the next week and observe changes in tension and focus.');
  }

  if (sleepHours < 6) {
    recommendations.push('Experiment with moving your sleep window earlier by 15â€“30 minutes and reducing late-night screen use to improve quality.');
  }

  if (daysSinceEvent > adjustedRecoveryDays && status !== 'optimal') {
    recommendations.push('Because distress is lasting longer than expected, consider consulting a mental health professional for additional support.');
  }

  const plan = [
    { label: 'This Week', detail: 'Establish a simple wind-down routine and one daily recovery block. Avoid major new commitments if possible.' },
    { label: 'This Month', detail: 'Gradually reintroduce demanding tasks while monitoring energy, mood, and sleep. Adjust pace if symptoms flare up.' },
    { label: 'Ongoing', detail: 'Use regular check-ins after stressful periods to avoid stacking unprocessed stress on top of old events.' },
  ];

  return {
    stressEventIntensity,
    daysSinceEvent,
    dailyRecoveryMinutes,
    sleepHours,
    recoveryPercent: Number(recoveryPercent.toFixed(1)),
    estimatedDaysToBaseline: Math.round(remainingDays),
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function MentalRecoveryFromStressEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stressEventIntensity: undefined,
      daysSinceEvent: undefined,
      dailyRecoveryMinutes: undefined,
      sleepHours: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="mental-recovery-stress-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Mental Recovery from Stress Estimator
          </CardTitle>
          <CardDescription>Estimate your recovery progress after a stressful period using intensity, time, sleep, and recovery habits.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your stress and recovery data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="stressEventIntensity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stress event intensity (1â€“10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 8.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="daysSinceEvent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Days since peak stress</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 10" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dailyRecoveryMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recovery time per day (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" step="5" placeholder="e.g., 30" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Average sleep per night (hours)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 7.2" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Estimate mental recovery
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
            <CardDescription>See recovery percentage, days to baseline, and guidance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recovery progress</p>
                <p className="text-2xl font-semibold text-primary">{result.recoveryPercent}%</p>
                <p className="text-xs text-muted-foreground">Approximate</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Estimated days to baseline</p>
                <p className="text-2xl font-semibold text-primary">{result.estimatedDaysToBaseline}</p>
                <p className="text-xs text-muted-foreground">If conditions stay similar</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Event intensity</p>
                <p className="text-2xl font-semibold text-primary">{result.stressEventIntensity}</p>
                <p className="text-xs text-muted-foreground">1â€“10 scale</p>
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
            <strong>Base recovery days</strong> are set to roughly one week per intensity point (intensity Ã— 7), then adjusted by sleep and recovery habits.
          </p>
          <p>
            <strong>Effective recovery rate</strong> increases when you sleep more and practice more daily recovery, shortening estimated total recovery time.
          </p>
          <p>
            <strong>Recovery percent</strong> is days since event divided by adjusted recovery days, scaled to 0â€“100%. Values above 100% suggest you may already be beyond the rough baseline.
          </p>
          <p>This simplified model is meant for planning and reflection and cannot replace individualized medical or psychological assessment.</p>
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
                <p className="text-sm text-muted-foreground">Total recovery window</p>
                <p className="text-xl font-semibold text-primary">
                  {result.estimatedDaysToBaseline + result.daysSinceEvent}
                </p>
                <p className="text-xs text-muted-foreground">Estimated days from event to baseline</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total recovery minutes/week</p>
                <p className="text-xl font-semibold text-primary">{result.dailyRecoveryMinutes * 7}</p>
                <p className="text-xs text-muted-foreground">Deliberate rest minutes</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sleep sufficiency index</p>
                <p className="text-xl font-semibold text-primary">
                  {Math.round(clamp((result.sleepHours / 8) * 100, 0, 130))}%
                </p>
                <p className="text-xs text-muted-foreground">Relative to ~8 hours</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your data to see additional estimates.</p>
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
        <meta itemProp="name" content="Recovering from Stress: A Practical Guide to Mental Reset" />
        <meta itemProp="description" content="Learn how long stress recovery can take, which habits speed it up, and when it is time to ask for additional help." />
        <meta itemProp="keywords" content="stress recovery, nervous system reset, burnout healing, rest planning, mental health self-check" />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/definitive-mental-recovery-from-stress-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          Recovering from Stress: Estimating Healing Time and Designing Real Rest
        </h1>
        <p className="text-lg italic text-gray-700">
          Understand how stress affects your nervous system, why recovery takes time, and how to design daily habits that bring you back to baseline more safely.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li><a href="#stress-physiology" className="hover:underline">Stress Physiology 101</a></li>
          <li><a href="#time-course" className="hover:underline">Typical Time Course of Recovery</a></li>
          <li><a href="#recovery-habits" className="hover:underline">High-Impact Recovery Habits</a></li>
          <li><a href="#workload" className="hover:underline">Adjusting Workload and Expectations</a></li>
          <li><a href="#seek-help" className="hover:underline">When to Seek Professional Help</a></li>
        </ul>
        <hr />

        <h2 id="stress-physiology" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Stress Physiology 101
        </h2>
        <p>
          Acute stress temporarily ramps up heart rate, blood pressure, and alertness. When stress is chronic, these systems can stay elevated, leading to fatigue, irritability, and cognitive fog. Recovery is about giving your
          body enough safety cues to turn the alarm back down.
        </p>

        <h2 id="time-course" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Typical Time Course of Recovery
        </h2>
        <p>
          Mild stressors may fade in days; more intense or repeated events can take weeks or months to fully integrate. Recovery is rarely linearâ€”good days and bad days often alternate as your system recalibrates.
        </p>

        <h2 id="recovery-habits" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          High-Impact Recovery Habits
        </h2>
        <p>
          Sleep, movement, nutrition, social connection, and time in nature are powerful regulators. Even small, consistent doses (short walks, brief check-ins with friends) are more effective than occasional intense efforts.
        </p>

        <h2 id="workload" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Adjusting Workload and Expectations
        </h2>
        <p>
          During recovery, it is normal to temporarily lower output expectations. Communicating clearly with managers, colleagues, or family about your bandwidth prevents silent overload and supports sustainable healing.
        </p>

        <h2 id="seek-help" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          When to Seek Professional Help
        </h2>
        <p>
          If sleep remains disrupted, mood stays low, or you feel stuck in hypervigilance for weeks, it is wise to consult a clinician. Early support can prevent longer-term complications and accelerates healing.
        </p>

        <hr />
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Conclusion
        </h2>
        <p>
          Stress recovery is not a race. Use this estimator to gain a rough sense of where you are, to honor how much you have already endured, and to design the next simplest step toward feeling like yourself again.
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
            This estimator provides general wellness insights about mental recovery from a significant stressor using
            intensity, time, sleep, and recovery habit inputs. This is a personal lifestyle insight, not a medical evaluation.
          </p>
          <p>Outputs include recovery percent, estimated days to baseline, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs help humans and AI assistants interpret the results responsibly.</p>
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


