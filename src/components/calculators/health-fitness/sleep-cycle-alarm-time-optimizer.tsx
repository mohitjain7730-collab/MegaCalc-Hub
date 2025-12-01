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
  bedtime: z.string({ invalid_type_error: 'Enter bedtime' }),
  desiredWakeTime: z.string({ invalid_type_error: 'Enter desired wake time' }).optional(),
  cycleLength: z.number({ invalid_type_error: 'Enter cycle length' }).min(60).max(120).optional(),
  numberOfCycles: z.number({ invalid_type_error: 'Enter number of cycles' }).min(3).max(7).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  optimalWakeTime: string;
  totalSleepMinutes: number;
  totalSleepHours: number;
  numberOfCycles: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your bedtime (when you plan to fall asleep).',
  'Optionally enter desired wake time to see if it aligns with sleep cycles.',
  'Optionally adjust sleep cycle length (default is 90 minutes).',
  'Optionally specify number of sleep cycles desired (default calculates optimal).',
  'Review optimal wake time, total sleep duration, and recommendations.',
];

const faqs = [
  {
    question: 'What is a sleep cycle?',
    answer:
      'A sleep cycle is approximately 90 minutes long and includes all sleep stages: light sleep, deep sleep, and REM sleep. Waking up at the end of a complete cycle leaves you feeling more refreshed.',
  },
  {
    question: 'How many sleep cycles do I need?',
    answer:
      'Most adults need 4-6 complete sleep cycles per night (6-9 hours of sleep). Waking up in the middle of a cycle can leave you feeling groggy, while waking at the end of a cycle promotes alertness.',
  },
  {
    question: 'Why is 90 minutes the standard cycle length?',
    answer:
      'The average sleep cycle is approximately 90 minutes, though it can vary from 60-120 minutes depending on the individual. This calculator uses 90 minutes as the default.',
  },
  {
    question: 'What if my desired wake time doesn\'t align with a cycle?',
    answer:
      'If your desired wake time falls in the middle of a cycle, the calculator will suggest the nearest optimal wake time (end of a cycle) to help you wake up feeling more refreshed.',
  },
  {
    question: 'How long does it take to fall asleep?',
    answer:
      'Most people take 10-20 minutes to fall asleep. The calculator accounts for this by adding a buffer time (typically 15 minutes) to your bedtime.',
  },
  {
    question: 'Can I use this if I have irregular sleep patterns?',
    answer:
      'While this calculator works best with consistent sleep schedules, it can still help identify optimal wake times. For irregular patterns, try to establish a consistent bedtime first.',
  },
  {
    question: 'Does this account for sleep latency?',
    answer:
      'Yes. The calculator includes a sleep latency period (time to fall asleep) of approximately 15 minutes, which is added to your bedtime to calculate actual sleep start time.',
  },
  {
    question: 'What about sleep quality?',
    answer:
      'Waking at the end of a complete cycle improves sleep quality perception. However, factors like sleep disorders, stress, and environment also affect overall sleep quality.',
  },
  {
    question: 'Can I set multiple alarm times?',
    answer:
      'Some apps allow you to set a wake window (e.g., 7:00-7:30 AM) and wake you at the optimal point within that window. This is more effective than multiple alarms.',
  },
  {
    question: 'How accurate is this calculator?',
    answer:
      'Individual sleep cycles vary, but 90 minutes is a reliable average. For best results, track your actual sleep patterns and adjust the cycle length if needed based on how you feel upon waking.',
  },
];

const relatedCalculators = [
  {
    name: 'REM Sleep Balance Wellness Estimator',
    slug: 'rem-sleep-percentage-calculator',
    description: 'Estimate REM sleep balance alongside sleep cycle optimization.',
  },
  {
    name: 'Deep Sleep Comfort Range Estimator',
    slug: 'deep-sleep-requirement-estimator',
    description: 'Track deep sleep requirements for better sleep cycles.',
  },
  {
    name: 'Sleep Quality vs Productivity Correlation Calculator',
    slug: 'sleep-quality-vs-productivity-correlation-calculator',
    description: 'Monitor overall sleep quality and productivity.',
  },
  {
    name: 'Sleep Debt Calculator',
    slug: 'sleep-debt-calculator-hf',
    description: 'Calculate sleep debt to optimize alarm timing.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/sleep-cycle-alarm-time-optimizer';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Sleep Cycle Wake-Up Comfort Planner', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Sleep Cycle Wake-Up Comfort Planner',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate optimal alarm time based on sleep cycles, bedtime, and desired wake time to wake up feeling refreshed.',
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
  const cycleLength = values.cycleLength ?? 90; // Default 90 minutes
  const sleepLatency = 15; // Average time to fall asleep in minutes
  const bedtimeMinutes = parseTime(values.bedtime);
  const actualSleepStart = bedtimeMinutes + sleepLatency;
  
  let numberOfCycles: number;
  let optimalWakeMinutes: number;
  
  if (values.numberOfCycles) {
    // Use specified number of cycles
    numberOfCycles = values.numberOfCycles;
    optimalWakeMinutes = actualSleepStart + (numberOfCycles * cycleLength);
  } else if (values.desiredWakeTime) {
    // Find nearest cycle end to desired wake time
    const desiredWakeMinutes = parseTime(values.desiredWakeTime);
    const sleepDuration = desiredWakeMinutes > actualSleepStart 
      ? desiredWakeMinutes - actualSleepStart 
      : (24 * 60) - actualSleepStart + desiredWakeMinutes;
    
    // Find closest number of cycles
    const estimatedCycles = Math.round(sleepDuration / cycleLength);
    numberOfCycles = Math.max(3, Math.min(7, estimatedCycles));
    
    // Calculate optimal wake time at end of cycle
    optimalWakeMinutes = actualSleepStart + (numberOfCycles * cycleLength);
    
    // If desired time is closer to previous cycle, use that
    const prevCycleMinutes = actualSleepStart + ((numberOfCycles - 1) * cycleLength);
    const nextCycleMinutes = actualSleepStart + ((numberOfCycles + 1) * cycleLength);
    
    const distToPrev = Math.abs((desiredWakeMinutes - prevCycleMinutes + 24 * 60) % (24 * 60));
    const distToCurrent = Math.abs((desiredWakeMinutes - optimalWakeMinutes + 24 * 60) % (24 * 60));
    const distToNext = Math.abs((desiredWakeMinutes - nextCycleMinutes + 24 * 60) % (24 * 60));
    
    if (distToPrev < distToCurrent && numberOfCycles > 3) {
      numberOfCycles = numberOfCycles - 1;
      optimalWakeMinutes = prevCycleMinutes;
    } else if (distToNext < distToCurrent && numberOfCycles < 7) {
      numberOfCycles = numberOfCycles + 1;
      optimalWakeMinutes = nextCycleMinutes;
    }
  } else {
    // Default to 5 cycles (7.5 hours)
    numberOfCycles = 5;
    optimalWakeMinutes = actualSleepStart + (numberOfCycles * cycleLength);
  }
  
  // Normalize wake time to 24-hour format
  optimalWakeMinutes = optimalWakeMinutes % (24 * 60);
  const optimalWakeTime = formatTime(optimalWakeMinutes);
  
  const totalSleepMinutes = numberOfCycles * cycleLength;
  const totalSleepHours = totalSleepMinutes / 60;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your estimated sleep cycle comfort score suggests a general lifestyle tendency toward smoother wake-ups when you aim for these times. This is a personal insight, not a medical evaluation.';
  
  if (numberOfCycles < 4) {
    status = 'low';
    interpretation = 'Your estimated sleep cycle comfort score suggests you may feel better with more cycles. This is a general wellness insight, not a medical diagnosis.';
  } else if (numberOfCycles < 5) {
    status = 'moderate';
    interpretation = 'Your estimated sleep cycle comfort score suggests a moderate tendency. This is a personal insight, not a medical evaluation.';
  } else if (numberOfCycles === 5) {
    status = 'good';
    interpretation = 'Your estimated sleep cycle comfort score suggests a good lifestyle tendency. This is a lifestyle assessment, not a medical evaluation.';
  } else if (numberOfCycles === 6) {
    status = 'optimal';
    interpretation = 'Your estimated sleep cycle comfort score suggests a general lifestyle tendency that may support comfortable wake-ups. This is a personal insight, not a medical evaluation.';
  } else {
    status = 'moderate';
    interpretation = 'Your estimated sleep cycle comfort score suggests a moderate tendency. This is a general wellness insight, not a medical evaluation.';
  }
  
  const recommendations = [
    'You may consider setting your alarm for the calculated suggested wake time for general wellness support.',
    'You may consider allowing yourself 15 minutes to fall asleep after getting into bed when planning sleep times.',
    'You may consider maintaining a consistent sleep schedule (same bedtime and wake time) for overall wellness.',
  ];
  
  if (status === 'low' || status === 'moderate') {
    recommendations.push('You may consider going to bed earlier to allow for more complete sleep cycles. This is a general wellness suggestion, not medical advice.');
  }
  
  if (values.desiredWakeTime) {
    const desiredWakeMinutes = parseTime(values.desiredWakeTime);
    const diff = Math.abs((optimalWakeMinutes - desiredWakeMinutes + 24 * 60) % (24 * 60));
    if (diff > 30) {
      recommendations.push('You may consider adjusting your wake time by 15-30 minutes to align better with sleep cycles. This is a lifestyle suggestion, not a medical evaluation.');
    }
  }
  
  const plan = [
    { label: 'This Week', detail: 'Set your alarm for the calculated optimal wake time. Track how refreshed you feel compared to your usual wake time.' },
    { label: 'This Month', detail: 'Maintain consistent bedtime and wake time. Your body will adapt to the new schedule and sleep cycles will become more predictable.' },
    { label: 'Ongoing', detail: 'Monitor your energy levels upon waking. If you still feel groggy, try adjusting the cycle length or bedtime slightly to find your personal optimal timing.' },
  ];
  
  return { optimalWakeTime, totalSleepMinutes, totalSleepHours, numberOfCycles, status, interpretation, recommendations, plan };
};

export default function SleepCycleAlarmTimeOptimizer() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bedtime: undefined,
      desiredWakeTime: undefined,
      cycleLength: undefined,
      numberOfCycles: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="sleep-cycle-alarm-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Sleep Cycle Wake-Up Comfort Planner
          </CardTitle>
          <CardDescription>Estimate suggested wake-up windows for more comfortable sleep cycles based on your bedtime and preferences. This is a general wellness planning tool, not a medical evaluation.</CardDescription>
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
                  name="bedtime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedtime</FormLabel>
                      <FormControl>
                        <Input type="time" placeholder="e.g., 22:30" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="desiredWakeTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desired wake time (optional)</FormLabel>
                      <FormControl>
                        <Input type="time" placeholder="e.g., 07:00" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cycleLength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep cycle length (minutes, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="5" placeholder="e.g., 90" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="numberOfCycles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of cycles (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate optimal alarm time
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
            <CardDescription>See optimal wake time, total sleep duration, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Optimal wake time</p>
                <p className="text-2xl font-semibold text-primary">{result.optimalWakeTime}</p>
                <p className="text-xs text-muted-foreground">End of sleep cycle</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total sleep</p>
                <p className="text-2xl font-semibold text-primary">{result.totalSleepHours.toFixed(1)} hours</p>
                <p className="text-xs text-muted-foreground">{result.totalSleepMinutes.toFixed(0)} minutes</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sleep cycles</p>
                <p className="text-2xl font-semibold text-primary">{result.numberOfCycles}</p>
                <p className="text-xs text-muted-foreground">Complete cycles</p>
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
            <strong>Optimal wake time</strong> = Bedtime + Sleep latency (15 min) + (Number of cycles × Cycle length).
          </p>
          <p>
            <strong>Sleep cycle length</strong>: Default is 90 minutes (can range from 60-120 minutes depending on individual).
          </p>
          <p>
            <strong>Number of cycles</strong>: Most adults need 4-6 complete cycles (6-9 hours). Waking at the end of a cycle promotes alertness.
          </p>
          <p>Sleep latency (time to fall asleep) is typically 10-20 minutes. The calculator uses 15 minutes as an average.</p>
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
                <p className="text-sm text-muted-foreground">Sleep latency included</p>
                <p className="text-xl font-semibold text-primary">15 minutes</p>
                <p className="text-xs text-muted-foreground">Time to fall asleep</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Cycle length</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.totalSleepMinutes / result.numberOfCycles).toFixed(0)} minutes
                </p>
                <p className="text-xs text-muted-foreground">Per cycle</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sleep efficiency</p>
                <p className="text-xl font-semibold text-primary">Optimal</p>
                <p className="text-xs text-muted-foreground">Waking at cycle end</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your sleep data to see additional insights.</p>
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
          <p>Sleep cycles are approximately 90 minutes long and include all sleep stages: light sleep, deep sleep, and REM sleep. Waking up at the end of a complete cycle (rather than in the middle) leaves you feeling more refreshed and alert.</p>
          <p>Use this calculator to determine the optimal alarm time based on your bedtime and desired wake time, ensuring you wake at the end of a complete sleep cycle.</p>
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
          <p>This tool estimates suggested wake-up windows for more comfortable sleep cycles based on bedtime, desired wake time (optional), sleep cycle length (optional), and number of cycles (optional).</p>
          <p>Outputs include optimal wake time, total sleep duration, number of cycles, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
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
          <p>Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a medical or psychological diagnosis. For any health concerns, please consult a qualified professional.</p>
        </CardContent>
      </Card>
    </div>
  );
}

