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
  naturalBedtime: z.string({ invalid_type_error: 'Enter natural bedtime' }),
  naturalWakeTime: z.string({ invalid_type_error: 'Enter natural wake time' }),
  socialBedtime: z.string({ invalid_type_error: 'Enter social bedtime' }),
  difficultyWaking: z.number({ invalid_type_error: 'Enter difficulty waking' }).min(1).max(10),
  sleepOnsetTime: z.number({ invalid_type_error: 'Enter sleep onset time' }).min(0).max(120),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  dspdRiskScore: number;
  riskLevel: string;
  phaseDelay: number;
  sleepMisalignment: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your natural bedtime (when you naturally feel sleepy without alarms).',
  'Enter your natural wake time (when you naturally wake without alarms).',
  'Enter your social bedtime (when you need to go to bed for work/school).',
  'Rate difficulty waking up in the morning (1 = easy, 10 = extremely difficult).',
  'Enter time it takes to fall asleep (minutes) after going to bed at natural time.',
  'Review DSPD risk score, phase delay, misalignment, and recommendations.',
];

const faqs = [
  {
    question: 'What is Delayed Sleep Phase Syndrome (DSPD)?',
    answer:
      'DSPD is a circadian rhythm sleep disorder where your natural sleep-wake cycle is delayed by 2+ hours compared to conventional times. People with DSPD naturally fall asleep very late (often after 2 AM) and wake up late when allowed to sleep naturally.',
  },
  {
    question: 'What causes DSPD?',
    answer:
      'DSPD is often linked to genetic factors affecting circadian rhythms, but can also be influenced by lifestyle, exposure to evening light, and certain medical conditions. It\'s more common in adolescents and young adults.',
  },
  {
    question: 'How is DSPD different from being a night owl?',
    answer:
      'While night owls prefer evening activities, people with DSPD have a biological delay that makes it extremely difficult or impossible to fall asleep earlier, even when exhausted. It causes significant impairment when trying to follow normal schedules.',
  },
  {
    question: 'Can DSPD be cured?',
    answer:
      'DSPD typically cannot be "cured" but can be managed through chronotherapy, light therapy, melatonin, and behavioral strategies. Some people maintain shifted schedules, while others work to gradually shift their rhythm earlier.',
  },
  {
    question: 'What is chronotherapy?',
    answer:
      'Chronotherapy involves gradually delaying bedtime by 2-3 hours every few days until you reach a desired bedtime, then stabilizing. This should be done under medical supervision as it requires careful management.',
  },
  {
    question: 'Does light therapy help?',
    answer:
      'Yes. Morning light exposure helps advance circadian rhythms, while avoiding evening light prevents further delay. Bright light therapy devices can be effective when used consistently in the morning.',
  },
  {
    question: 'Should I see a doctor if I have DSPD?',
    answer:
      'Yes. If you suspect DSPD, consult a sleep specialist. They can diagnose through sleep logs, actigraphy, or polysomnography. Proper diagnosis is important to rule out other sleep disorders and receive appropriate treatment.',
  },
  {
    question: 'Can medications help?',
    answer:
      'Melatonin supplements, taken 2-4 hours before desired bedtime, can help shift circadian rhythms. Prescription medications like ramelteon or light therapy devices may also be recommended by healthcare providers.',
  },
  {
    question: 'What about lifestyle accommodations?',
    answer:
      'Some people with DSPD find accommodations (flexible work hours, evening classes, remote work) more practical than trying to shift their natural rhythm. This can improve quality of life and reduce sleep-related stress.',
  },
  {
    question: 'Is DSPD related to depression?',
    answer:
      'DSPD and depression can co-occur, but DSPD is a distinct disorder. However, the social isolation and schedule conflicts from DSPD can contribute to mood issues. Treating DSPD often improves overall well-being.',
  },
];

const relatedCalculators = [
  {
    name: 'Optimal Bedtime by Chronotype Calculator',
    slug: 'optimal-bedtime-by-chronotype-calculator',
    description: 'Calculate optimal bedtime based on chronotype.',
  },
  {
    name: 'Sleep Cycle Alarm Time Optimizer',
    slug: 'sleep-cycle-alarm-time-optimizer',
    description: 'Optimize sleep timing for better alignment.',
  },
  {
    name: 'Sleep Restriction Adaptation Calculator',
    slug: 'sleep-restriction-adaptation-calculator',
    description: 'Improve sleep patterns with CBT-I techniques.',
  },
  {
    name: 'Jet Lag Recovery Duration Calculator',
    slug: 'jet-lag-recovery-duration-calculator',
    description: 'Manage circadian rhythm adjustments.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/sleep-phase-delay-syndrome-dspd-risk-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Sleep Phase Delay Syndrome (DSPD) Risk Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Sleep Phase Delay Syndrome (DSPD) Risk Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Assess risk of Delayed Sleep Phase Syndrome (DSPD) based on sleep patterns, bedtime preferences, and circadian rhythm indicators.',
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
  const naturalBedtime = parseTime(values.naturalBedtime);
  const naturalWakeTime = parseTime(values.naturalWakeTime);
  const socialBedtime = parseTime(values.socialBedtime);
  
  // Calculate sleep duration
  let sleepDuration = naturalWakeTime - naturalBedtime;
  if (sleepDuration < 0) sleepDuration += 24 * 60; // Handle next day
  
  // Calculate phase delay (how late natural bedtime is)
  const phaseDelay = naturalBedtime > 22 * 60 ? naturalBedtime - (22 * 60) : naturalBedtime + (24 * 60) - (22 * 60);
  const phaseDelayHours = phaseDelay / 60;
  
  // Calculate misalignment (difference between natural and social bedtime)
  let misalignment = naturalBedtime - socialBedtime;
  if (misalignment < 0) misalignment += 24 * 60;
  const misalignmentHours = misalignment / 60;
  
  // Calculate risk score (0-100)
  let riskScore = 0;
  
  // Phase delay contributes 0-40 points
  if (phaseDelayHours >= 4) {
    riskScore += 40; // 2 AM or later
  } else if (phaseDelayHours >= 2) {
    riskScore += 30; // 12 AM - 2 AM
  } else if (phaseDelayHours >= 1) {
    riskScore += 20; // 11 PM - 12 AM
  }
  
  // Misalignment contributes 0-30 points
  if (misalignmentHours >= 3) {
    riskScore += 30;
  } else if (misalignmentHours >= 2) {
    riskScore += 20;
  } else if (misalignmentHours >= 1) {
    riskScore += 10;
  }
  
  // Difficulty waking contributes 0-20 points
  riskScore += (values.difficultyWaking - 1) * 2.22; // Scale 1-10 to 0-20
  
  // Sleep onset time contributes 0-10 points
  if (values.sleepOnsetTime > 60) {
    riskScore += 10;
  } else if (values.sleepOnsetTime > 30) {
    riskScore += 5;
  }
  
  // Clamp to 0-100
  riskScore = Math.min(100, Math.max(0, riskScore));
  
  let riskLevel: string;
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your sleep patterns appear to be well-aligned with conventional schedules.';
  
  if (riskScore >= 70) {
    riskLevel = 'High';
    status = 'low';
    interpretation = 'You show strong indicators of DSPD. Your natural sleep time is significantly delayed, causing substantial misalignment with social schedules. Consultation with a sleep specialist is recommended.';
  } else if (riskScore >= 50) {
    riskLevel = 'Moderate-High';
    status = 'moderate';
    interpretation = 'You show moderate indicators of DSPD. Your sleep phase is delayed, and you may experience significant difficulty with conventional schedules. Consider consulting a healthcare provider.';
  } else if (riskScore >= 30) {
    riskLevel = 'Moderate';
    status = 'good';
    interpretation = 'You show some indicators of delayed sleep phase. Your natural bedtime may be later than ideal, but this may be manageable with lifestyle adjustments.';
  } else {
    riskLevel = 'Low';
    status = 'optimal';
    interpretation = 'Your sleep patterns are within normal ranges. You may have a slight evening preference, but it doesn\'t indicate DSPD.';
  }
  
  const recommendations = [
    `Your DSPD risk score is ${riskScore.toFixed(0)}/100 (${riskLevel} risk). Phase delay: ${phaseDelayHours.toFixed(1)} hours.`,
    'If you have DSPD symptoms, consider morning light therapy: expose yourself to bright light (natural or light box) within 1 hour of waking to help advance your circadian rhythm.',
    'Avoid evening light exposure, especially blue light from screens, 2-3 hours before your desired bedtime to prevent further phase delay.',
    'Consider melatonin supplementation: 0.5-3 mg taken 2-4 hours before desired bedtime may help shift your rhythm earlier (consult healthcare provider first).',
  ];
  
  if (riskScore >= 50) {
    recommendations.push('Consult a sleep specialist for proper diagnosis. DSPD requires specific treatment approaches that should be medically supervised.');
  }
  
  if (misalignmentHours >= 2) {
    recommendations.push('The gap between your natural and social bedtime is significant. Consider lifestyle accommodations (flexible hours, remote work) or gradual chronotherapy under medical supervision.');
  }
  
  const plan = [
    { label: 'This Week', detail: 'Keep a detailed sleep log tracking natural sleep times, social requirements, and difficulty waking. Note sleep quality and daytime functioning.' },
    { label: 'This Month', detail: 'If risk is moderate-high, consult a sleep specialist for evaluation. Begin light therapy and melatonin (if appropriate) under medical guidance.' },
    { label: 'Ongoing', detail: 'Work with healthcare providers to manage DSPD through appropriate treatments and lifestyle accommodations. Monitor improvements and adjust strategies as needed.' },
  ];
  
  return { dspdRiskScore: riskScore, riskLevel, phaseDelay: phaseDelayHours, sleepMisalignment: misalignmentHours, status, interpretation, recommendations, plan };
};

export default function SleepPhaseDelaySyndromeDSPDRiskCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      naturalBedtime: undefined,
      naturalWakeTime: undefined,
      socialBedtime: undefined,
      difficultyWaking: undefined,
      sleepOnsetTime: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="dspd-risk-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Sleep Phase Delay Syndrome (DSPD) Risk Calculator
          </CardTitle>
          <CardDescription>Assess risk of Delayed Sleep Phase Syndrome (DSPD) based on sleep patterns, bedtime preferences, and circadian rhythm indicators.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your sleep pattern data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="naturalBedtime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Natural bedtime</FormLabel>
                      <FormControl>
                        <Input type="time" placeholder="e.g., 02:00" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="naturalWakeTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Natural wake time</FormLabel>
                      <FormControl>
                        <Input type="time" placeholder="e.g., 10:00" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="socialBedtime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Social bedtime (required)</FormLabel>
                      <FormControl>
                        <Input type="time" placeholder="e.g., 23:00" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="difficultyWaking"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty waking (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sleepOnsetTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time to fall asleep (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" step="5" placeholder="e.g., 60" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate DSPD risk
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
            <CardDescription>See DSPD risk score, phase delay, misalignment, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">DSPD risk score</p>
                <p className="text-2xl font-semibold text-primary">{result.dspdRiskScore.toFixed(0)}/100</p>
                <p className="text-xs text-muted-foreground">{result.riskLevel} risk</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Phase delay</p>
                <p className="text-2xl font-semibold text-primary">{result.phaseDelay.toFixed(1)} hours</p>
                <p className="text-xs text-muted-foreground">From conventional</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sleep misalignment</p>
                <p className="text-2xl font-semibold text-primary">{result.sleepMisalignment.toFixed(1)} hours</p>
                <p className="text-xs text-muted-foreground">Natural vs social</p>
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
            <strong>DSPD Risk Score</strong> = Phase delay (0-40 points) + Sleep misalignment (0-30 points) + Difficulty waking (0-20 points) + Sleep onset time (0-10 points).
          </p>
          <p>
            <strong>Phase delay</strong> = Hours after 10 PM for natural bedtime (≥4 hours = 40 points, 2-4 hours = 30 points, 1-2 hours = 20 points).
          </p>
          <p>
            <strong>Sleep misalignment</strong> = Difference between natural and social bedtime (≥3 hours = 30 points, 2-3 hours = 20 points, 1-2 hours = 10 points).
          </p>
          <p>
            <strong>Difficulty waking</strong> = Scaled 1-10 to 0-20 points. <strong>Sleep onset time</strong> = &gt;60 min = 10 points, &gt;30 min = 5 points.
          </p>
          <p>Risk levels: 0-30 = Low, 30-50 = Moderate, 50-70 = Moderate-High, 70-100 = High. High scores indicate significant DSPD indicators requiring professional evaluation.</p>
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
                <p className="text-sm text-muted-foreground">Natural sleep duration</p>
                <p className="text-xl font-semibold text-primary">
                  {(() => {
                    const naturalBedtime = parseTime(form.getValues().naturalBedtime ?? '02:00');
                    const naturalWakeTime = parseTime(form.getValues().naturalWakeTime ?? '10:00');
                    let duration = naturalWakeTime - naturalBedtime;
                    if (duration < 0) duration += 24 * 60;
                    return `${(duration / 60).toFixed(1)} hours`;
                  })()}
                </p>
                <p className="text-xs text-muted-foreground">When sleeping naturally</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Diagnostic threshold</p>
                <p className="text-xl font-semibold text-primary">≥2 hours</p>
                <p className="text-xs text-muted-foreground">Phase delay for DSPD</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Treatment recommendation</p>
                <p className="text-xl font-semibold text-primary">
                  {result.dspdRiskScore >= 50 ? 'Medical evaluation needed' : 'Lifestyle adjustments'}
                </p>
                <p className="text-xs text-muted-foreground">Based on risk score</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your sleep pattern data to see additional insights.</p>
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
          <p>Delayed Sleep Phase Syndrome (DSPD) is a circadian rhythm disorder where natural sleep time is delayed by 2+ hours compared to conventional schedules. People with DSPD naturally fall asleep very late (often after 2 AM) and have extreme difficulty adjusting to earlier bedtimes.</p>
          <p>Use this calculator to assess your risk of DSPD based on sleep patterns, bedtime preferences, and circadian rhythm indicators. High risk scores warrant consultation with a sleep specialist.</p>
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
          <p>This tool assesses risk of Delayed Sleep Phase Syndrome (DSPD) based on sleep patterns, bedtime preferences, and circadian rhythm indicators.</p>
          <p>Outputs include DSPD risk score, risk level, phase delay hours, sleep misalignment, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


