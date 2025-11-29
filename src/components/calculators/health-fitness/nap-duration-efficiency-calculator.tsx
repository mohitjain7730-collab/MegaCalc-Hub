'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Moon, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  napTime: z.string({ invalid_type_error: 'Enter nap time' }),
  lastSleepEnd: z.string({ invalid_type_error: 'Enter last sleep end time' }),
  desiredAlertness: z.number({ invalid_type_error: 'Enter desired alertness' }).min(1).max(10),
  currentFatigue: z.number({ invalid_type_error: 'Enter current fatigue' }).min(1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  optimalNapDuration: number;
  optimalNapMinutes: number;
  napType: string;
  wakeTime: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter the time you plan to take a nap.',
  'Enter when you last woke up from sleep (morning wake time).',
  'Rate your desired alertness level after nap (1 = relaxed, 10 = highly alert).',
  'Rate your current fatigue level (1 = not tired, 10 = extremely tired).',
  'Review optimal nap duration, nap type, wake time, and recommendations.',
];

const faqs = [
  {
    question: 'What are the different types of naps?',
    answer:
      'Naps can be categorized as power naps (10-20 minutes for quick energy), standard naps (20-30 minutes to avoid grogginess), and recovery naps (90 minutes for a full sleep cycle).',
  },
  {
    question: 'Why avoid napping for 30-60 minutes?',
    answer:
      'Napping for 30-60 minutes can cause sleep inertia because you wake up during deep sleep. Shorter (10-20 min) or longer (90+ min) naps are generally more effective.',
  },
  {
    question: 'What is sleep inertia?',
    answer:
      'Sleep inertia is the groggy, disoriented feeling after waking from deep sleep. It can last 15-30 minutes and impair cognitive performance, which is why nap timing matters.',
  },
  {
    question: 'When is the best time to nap?',
    answer:
      'The best nap time is typically early afternoon (1-3 PM), when most people experience a natural dip in alertness. Avoid napping too late in the day to prevent interfering with nighttime sleep.',
  },
  {
    question: 'How does time since last sleep affect nap duration?',
    answer:
      'The longer it\'s been since your last sleep, the more restorative a longer nap can be. If you\'re well-rested, a short power nap may be sufficient.',
  },
  {
    question: 'Can napping replace nighttime sleep?',
    answer:
      'No. While naps can supplement sleep, they cannot fully replace the benefits of nighttime sleep. Naps are most effective when used to enhance, not substitute, regular sleep.',
  },
  {
    question: 'What if I can\'t fall asleep during a nap?',
    answer:
      'Even resting with eyes closed for 10-20 minutes can provide some benefits. The goal is relaxation and quiet, not necessarily sleep. Avoid forcing sleep which can create stress.',
  },
  {
    question: 'How does age affect nap duration?',
    answer:
      'Older adults may benefit from shorter naps (10-20 minutes), while younger adults might handle longer naps better. Adjust based on how you feel after different nap durations.',
  },
  {
    question: 'Should I use an alarm for naps?',
    answer:
      'Yes, especially for shorter naps. Set an alarm to avoid oversleeping and waking during deep sleep, which causes grogginess. For longer naps (90+ min), allow a full cycle to complete.',
  },
  {
    question: 'Can naps help with shift work?',
    answer:
      'Yes. Strategic napping can help shift workers manage fatigue and maintain alertness. Power naps before or during shifts can be especially effective for maintaining performance.',
  },
];

const relatedCalculators = [
  {
    name: 'Sleep Cycle Alarm Time Optimizer',
    slug: 'sleep-cycle-alarm-time-optimizer',
    description: 'Calculate optimal sleep timing for better rest.',
  },
  {
    name: 'Recovery Sleep Requirement After Sleep Debt Calculator',
    slug: 'recovery-sleep-requirement-after-sleep-debt-calculator',
    description: 'Calculate recovery sleep needs after sleep debt.',
  },
  {
    name: 'Sleep Quality vs Screen Exposure Analyzer',
    slug: 'sleep-quality-vs-screen-exposure-analyzer',
    description: 'Analyze screen time impact on sleep quality.',
  },
  {
    name: 'Sleep Debt Calculator',
    slug: 'sleep-debt-calculator-hf',
    description: 'Track sleep debt accumulation.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/nap-duration-efficiency-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Nap Duration Efficiency Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Nap Duration Efficiency Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate optimal nap duration based on time of day, sleep needs, and desired alertness level to maximize rest efficiency.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const parseTime = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const formatTime = (minutes: number): string => {
  const totalMinutes = minutes % (24 * 60);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

const calculateResult = (values: FormValues): ResultPayload => {
  const napTimeMinutes = parseTime(values.napTime);
  const lastSleepEndMinutes = parseTime(values.lastSleepEnd);
  
  // Calculate hours since last sleep
  let hoursSinceSleep = (napTimeMinutes - lastSleepEndMinutes) / 60;
  if (hoursSinceSleep < 0) hoursSinceSleep += 24; // Handle next day
  
  // Determine nap type and duration based on factors
  const fatigueLevel = values.currentFatigue;
  const alertnessNeed = values.desiredAlertness;
  const timeSinceSleep = hoursSinceSleep;
  
  let optimalNapMinutes: number;
  let napType: string;
  
  // High fatigue + long time since sleep = longer nap needed
  if (fatigueLevel >= 7 && timeSinceSleep >= 12) {
    // Recovery nap (full cycle)
    optimalNapMinutes = 90;
    napType = 'Recovery nap (full cycle)';
  } else if (alertnessNeed >= 7 && fatigueLevel <= 5) {
    // Quick power nap
    optimalNapMinutes = 15;
    napType = 'Power nap';
  } else if (alertnessNeed >= 7 || (fatigueLevel >= 6 && timeSinceSleep >= 8)) {
    // Standard restorative nap
    optimalNapMinutes = 20;
    napType = 'Standard restorative nap';
  } else if (fatigueLevel >= 7) {
    // Longer recovery nap
    optimalNapMinutes = 90;
    napType = 'Recovery nap (full cycle)';
  } else {
    // Default power nap
    optimalNapMinutes = 15;
    napType = 'Power nap';
  }
  
  const wakeTimeMinutes = napTimeMinutes + optimalNapMinutes;
  const wakeTime = formatTime(wakeTimeMinutes);
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your nap duration is optimally calculated to maximize alertness without causing grogginess.';
  
  if (optimalNapMinutes <= 20) {
    status = 'optimal';
    interpretation = 'A short power nap (10-20 minutes) is optimal for quick energy boost without sleep inertia.';
  } else if (optimalNapMinutes === 90) {
    status = 'good';
    interpretation = 'A full 90-minute sleep cycle nap allows complete rest and recovery, waking at the end of a cycle.';
  } else {
    status = 'moderate';
    interpretation = 'This nap duration may cause sleep inertia. Consider adjusting to either 15-20 minutes or 90 minutes for optimal results.';
  }
  
  const recommendations = [
    `Take a ${optimalNapMinutes}-minute ${napType.toLowerCase()} at ${values.napTime} and set alarm for ${wakeTime}.`,
    'Avoid napping for 30-60 minutes as this can cause sleep inertia by waking during deep sleep.',
    'Create a quiet, dark environment for your nap to maximize restorative benefits.',
  ];
  
  if (parseTime(values.napTime) >= parseTime('15:00')) {
    recommendations.push('Late afternoon naps may interfere with nighttime sleep. Consider napping earlier if possible.');
  }
  
  if (optimalNapMinutes === 90) {
    recommendations.push('Allow yourself time to fully wake up after a 90-minute nap. Avoid scheduling important tasks immediately after.');
  } else {
    recommendations.push('After a short nap, get up and move around to help shake off any residual grogginess.');
  }
  
  const plan = [
    { label: 'This Week', detail: 'Experiment with the calculated nap duration. Track how you feel upon waking and adjust based on your individual response.' },
    { label: 'This Month', detail: 'Establish a consistent nap routine if needed. Monitor how napping affects your nighttime sleep quality.' },
    { label: 'Ongoing', detail: 'Use strategic napping as a tool for energy management. Remember that naps supplement, but don\'t replace, adequate nighttime sleep.' },
  ];
  
  return { optimalNapDuration: optimalNapMinutes / 60, optimalNapMinutes, napType, wakeTime, status, interpretation, recommendations, plan };
};

export default function NapDurationEfficiencyCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      napTime: undefined,
      lastSleepEnd: undefined,
      desiredAlertness: undefined,
      currentFatigue: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="nap-duration-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Nap Duration Efficiency Calculator
          </CardTitle>
          <CardDescription>Calculate optimal nap duration based on time of day, sleep needs, and desired alertness level to maximize rest efficiency.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your nap data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="napTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nap time</FormLabel>
                      <FormControl>
                        <Input type="time" placeholder="e.g., 14:00" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastSleepEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last sleep end time</FormLabel>
                      <FormControl>
                        <Input type="time" placeholder="e.g., 07:00" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="desiredAlertness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desired alertness (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentFatigue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current fatigue (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate optimal nap duration
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
            <CardDescription>See optimal nap duration, wake time, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Optimal nap duration</p>
                <p className="text-2xl font-semibold text-primary">{result.optimalNapMinutes} min</p>
                <p className="text-xs text-muted-foreground">{result.optimalNapDuration.toFixed(1)} hours</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Nap type</p>
                <p className="text-2xl font-semibold text-primary">{result.napType}</p>
                <p className="text-xs text-muted-foreground">Recommended category</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Wake time</p>
                <p className="text-2xl font-semibold text-primary">{result.wakeTime}</p>
                <p className="text-xs text-muted-foreground">Set alarm for</p>
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
                    <Activity className="h-4 w-4" />
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
            <strong>Nap duration</strong> is calculated based on time since last sleep, current fatigue level, and desired alertness after nap.
          </p>
          <p>
            <strong>Power nap (10-20 min)</strong>: Quick energy boost without entering deep sleep, ideal for high alertness needs with low-moderate fatigue.
          </p>
          <p>
            <strong>Standard nap (20-30 min)</strong>: Restorative without full sleep cycle, avoids deep sleep and sleep inertia.
          </p>
          <p>
            <strong>Recovery nap (90 min)</strong>: Full sleep cycle for complete recovery, ideal for high fatigue and long time since last sleep.
          </p>
          <p>Avoid 30-60 minute naps as they often wake you during deep sleep, causing grogginess and sleep inertia.</p>
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
                <p className="text-sm text-muted-foreground">Time since last sleep</p>
                <p className="text-xl font-semibold text-primary">
                  {(() => {
                    const napTime = parseTime(form.getValues().napTime ?? '12:00');
                    const lastSleep = parseTime(form.getValues().lastSleepEnd ?? '07:00');
                    let hours = (napTime - lastSleep) / 60;
                    if (hours < 0) hours += 24;
                    return `${hours.toFixed(1)} hours`;
                  })()}
                </p>
                <p className="text-xs text-muted-foreground">Awake duration</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Nap efficiency</p>
                <p className="text-xl font-semibold text-primary">
                  {result.optimalNapMinutes <= 20 ? 'High' : result.optimalNapMinutes === 90 ? 'Optimal' : 'Moderate'}
                </p>
                <p className="text-xs text-muted-foreground">Based on duration</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sleep inertia risk</p>
                <p className="text-xl font-semibold text-primary">
                  {result.optimalNapMinutes <= 20 || result.optimalNapMinutes === 90 ? 'Low' : 'Moderate'}
                </p>
                <p className="text-xs text-muted-foreground">Grogginess risk</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your nap data to see additional insights.</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Complete guide snapshot</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Strategic napping can significantly boost alertness and performance when timed and duration are optimized. The key is avoiding sleep inertia by either taking very short naps (10-20 minutes) or complete sleep cycle naps (90 minutes).</p>
          <p>Use this calculator to determine the optimal nap duration based on your current fatigue level, time since last sleep, and desired alertness after the nap.</p>
        </CardContent>
      </Card>

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
          <p>This tool calculates optimal nap duration based on nap time, last sleep end time, desired alertness level, and current fatigue level.</p>
          <p>Outputs include optimal nap duration, nap type, wake time, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

