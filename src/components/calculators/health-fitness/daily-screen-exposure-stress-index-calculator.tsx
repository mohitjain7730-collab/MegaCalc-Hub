'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Zap, Target, AlertTriangle, Shield, Smartphone } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  workScreenHours: z.number({ invalid_type_error: 'Enter hours' }).min(0).max(14),
  personalScreenHours: z.number({ invalid_type_error: 'Enter hours' }).min(0).max(10),
  notificationsPerDay: z.number({ invalid_type_error: 'Enter notifications' }).min(0).max(400),
  meetingHours: z.number({ invalid_type_error: 'Enter meeting hours' }).min(0).max(10),
  microBreaksPerHour: z.number({ invalid_type_error: 'Enter breaks' }).min(0).max(12),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  stressIndex: number;
  status: 'steady' | 'strained' | 'overloaded';
  interpretation: string;
  totalScreen: number;
  attentionBudget: number;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Track your work screen hours for a typical day, including laptop, desktop, and tablets.',
  'Estimate personal/leisure screen hours (streaming, gaming, social apps).',
  'Pull your notification count from Screen Time, Digital Wellbeing, or wearable dashboards.',
  'Log synchronous meeting hours (video calls, webinars, live classes).',
  'Count how many intentional micro-breaks (≥30 seconds) you take per hour, such as stretches or breath resets.',
  'Plug the data into the calculator to benchmark your stress index and choose the easiest lever to adjust.',
];

const faqs = [
  {
    question: 'What is the Daily Screen Exposure Stress Index?',
    answer: 'It combines screen duration, notification load, meeting density, and break cadence into a single 0–100 score that reflects digital overstimulation risk.',
  },
  {
    question: 'How often should I recalculate?',
    answer: 'Weekly is ideal. Update sooner when workload spikes, you start a new project, or your sleep/recovery plummets.',
  },
  {
    question: 'What are micro-breaks?',
    answer: 'Micro-breaks are short, intentional pauses every 20–30 minutes (looking away, standing, breathing). They disrupt continuous focus before stress hormones spike.',
  },
  {
    question: 'Do audio-only calls count as screen time?',
    answer: 'Yes if you stare at a screen during them. If you can walk or glance away, reduce the meeting-hour input accordingly.',
  },
  {
    question: 'How many notifications are too many?',
    answer: 'Most people hit diminishing returns above ~150 pings/day. The calculator highlights the tipping point based on your other habits.',
  },
  {
    question: 'Can I apply this to teens or students?',
    answer: 'Absolutely—swap work hours for study/school hours and meetings for classes to guide healthier digital habits.',
  },
  {
    question: 'What if I work night shifts?',
    answer: 'Enter the same data; the index is time-agnostic. Consider adding natural light breaks to offset circadian strain.',
  },
  {
    question: 'How do I lower the score?',
    answer: 'Bundle notifications, schedule screen-free blocks, turn meetings into async updates, and insert enforced breaks.',
  },
  {
    question: 'Does blue light filtering change the score?',
    answer: 'Filters help eyes but not stress load. Pair them with reduced stimuli for the biggest payoff.',
  },
  {
    question: 'Is 0 stress realistic?',
    answer: 'Not really. The goal is to sit in the “steady” range where stress is productive, not overwhelming.',
  },
];

const relatedCalculators = [
  {
    name: 'Blue Light Exposure Calculator',
    slug: 'blue-light-exposure-calculator',
    description: 'Estimate light dose and melatonin disruption from screens.',
  },
  {
    name: 'Habit Streak Tracker Calculator',
    slug: 'habit-streak-tracker-calculator',
    description: 'Lock in distraction-free streaks with simple chains.',
  },
  {
    name: 'Stress Level Self-Assessment Calculator',
    slug: 'stress-level-self-assessment-calculator',
    description: 'Evaluate overall stress so you can compare it with digital load.',
  },
  {
    name: 'Sleep Efficiency Calculator',
    slug: 'sleep-efficiency-calculator',
    description: 'Confirm that screen detox efforts improve nightly recovery.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/daily-screen-exposure-stress-index-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Daily Screen Exposure Stress Index', item: baseUrl },
      ],
    },
    {
      '@type': 'Article',
      headline: 'Daily Screen Exposure Stress Index',
      description: 'Quantify digital overload from hours, notifications, and breaks. Get instant recommendations.',
      author: { '@type': 'Organization', name: 'Mycalculating.com' },
      publisher: { '@type': 'Organization', name: 'Mycalculating.com' },
      url: baseUrl,
      mainEntityOfPage: baseUrl,
      datePublished: '2024-01-01',
      dateModified: new Date().toISOString().split('T')[0],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Daily Screen Exposure Stress Index Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: ['Stress index score', 'Attention budget estimate', 'Actionable routines'],
      url: baseUrl,
      description: 'Calculate your stress index by blending screen time, notifications, meetings, and break cadence.',
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const totalScreen = values.workScreenHours + values.personalScreenHours;
  const notificationLoad = values.notificationsPerDay * 0.15;
  const meetingLoad = values.meetingHours * 6;
  const breakRelief = values.microBreaksPerHour * 12;
  const rawIndex = totalScreen * 7 + notificationLoad + meetingLoad - breakRelief;
  const stressIndex = clamp(Math.round(rawIndex), 0, 100);
  const attentionBudget = clamp(480 - totalScreen * 18 - values.notificationsPerDay * 0.4 + values.microBreaksPerHour * 10, 60, 480);

  let status: ResultPayload['status'] = 'steady';
  let interpretation =
    'Your current digital load looks relatively manageable based on these entries. You can keep leaning on the breaks and boundaries that already work for you.';

  if (stressIndex >= 45) {
    status = 'strained';
    interpretation =
      'Your responses point to a fairly full digital day. It may help to gently buffer notifications, batch some tasks, or add a few more small off‑screen pauses.';
  }
  if (stressIndex >= 70) {
    status = 'overloaded';
    interpretation =
      'These numbers suggest your day may feel quite packed with screens and pings. You might experiment with protected off‑screen windows, trimming notifications, or lightening meetings where possible.';
  }

  const recommendations = [
    'Try silencing non‑essential alerts for parts of the day so you can focus or rest more easily.',
    'Group similar tasks together when you can, instead of switching apps and contexts constantly.',
    'Add one or two short, screen‑free breaks in the middle of your day to reset your body and attention.',
  ];
  if (status === 'strained') {
    recommendations.push('Where possible, swap some live meetings for written updates to create more breathing room.');
  }
  if (status === 'overloaded') {
    recommendations.push('On a day that feels safe to do so, try longer stretches with most notifications off and notice how that feels.');
  }

  const plan = [
    { label: 'Morning block', detail: 'If it fits your life, begin the day with a short screen‑lighter period for sunlight, stretching, or planning on paper.' },
    { label: 'Midday reset', detail: 'Aim for at least one walking, stretching, or off‑screen break around the middle of your day.' },
    { label: 'Evening boundary', detail: 'Experiment with a simple “digital sunset” before bed that feels realistic for your schedule.' },
  ];

  return { stressIndex, status, interpretation, totalScreen, attentionBudget, recommendations, plan };
};

export default function DailyScreenExposureStressIndexCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workScreenHours: undefined,
      personalScreenHours: undefined,
      notificationsPerDay: undefined,
      meetingHours: undefined,
      microBreaksPerHour: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="screen-stress-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Daily Screen Exposure Stress Index
          </CardTitle>
          <CardDescription>Blend screen time, notifications, meetings, and breaks into a single stress score.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your data</CardTitle>
          <CardDescription>Leave blanks until you’re ready—everything customizes after submit.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'workScreenHours', label: 'Work / school screen hours', placeholder: 'e.g., 8.5', step: 0.25 },
                  { name: 'personalScreenHours', label: 'Personal screen hours', placeholder: 'e.g., 3', step: 0.25 },
                  { name: 'notificationsPerDay', label: 'Notifications per day', placeholder: 'e.g., 120', step: 1 },
                  { name: 'meetingHours', label: 'Live meeting hours', placeholder: 'e.g., 4', step: 0.25 },
                  { name: 'microBreaksPerHour', label: 'Micro-breaks each hour', placeholder: 'e.g., 2', step: 1 },
                ].map((fieldConfig) => (
                  <FormField
                    key={fieldConfig.name}
                    // @ts-expect-error dynamic access
                    name={fieldConfig.name}
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{fieldConfig.label}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step={fieldConfig.step}
                            placeholder={fieldConfig.placeholder}
                            value={field.value ?? ''}
                            onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate stress index
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
            <CardDescription>See stress index, total screen time, attention budget, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Stress Index</p>
                <p className="text-2xl font-semibold text-primary">{result.stressIndex}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total Screen</p>
                <p className="text-2xl font-semibold text-primary">{result.totalScreen.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Hours</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Attention Budget</p>
                <p className="text-2xl font-semibold text-primary">{result.attentionBudget}</p>
                <p className="text-xs text-muted-foreground">Minutes remaining</p>
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
            <strong>Stress Index</strong> = clamp((Work Hours + Personal Hours) × 7 + Notifications × 0.15 + Meeting Hours × 6 −
            Micro-breaks × 12, 0, 100). Higher screen time, notifications, and meetings increase stress; micro-breaks reduce it.
          </p>
          <p>
            <strong>Attention Budget</strong> = clamp(480 − Total Screen Hours × 18 − Notifications × 0.4 + Micro-breaks × 10, 0,
            480). This represents remaining mental capacity for focused work or recovery.
          </p>
          <p>
            Both metrics are normalized to realistic ranges (0-100 for stress index, 0-480 minutes for attention budget) to
            provide meaningful comparisons and track progress as habits evolve.
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
          <CardDescription>Spot your biggest lever.</CardDescription>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Digital load ratio</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.totalScreen / 24 * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Percent of the day spent in front of screens.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Boundary gap</p>
                <p className="text-xl font-semibold text-primary">
                  {(9 - result.totalScreen).toFixed(1)} hrs
                </p>
                <p className="text-xs text-muted-foreground">Hours above/below a 9-hour target.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Break coverage</p>
                <p className="text-xl font-semibold text-primary">
                  {(form.getValues().microBreaksPerHour ?? 0) * 5}%
                </p>
                <p className="text-xs text-muted-foreground">Percentage of working hour spent off-screen.</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Run the calculator to see load ratio, boundary gap, and break coverage.</p>
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
          <CardTitle>Detailed Guide</CardTitle>
          <CardDescription>
            Comprehensive guide to screen exposure stress, digital overload, and strategies for digital wellness
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            The Definitive Guide to Screen Exposure and Digital Stress: Managing Screen Time, Notifications, and Digital Overload
          </h2>
          <p className="text-lg italic text-gray-700">
            Explore the science of screen exposure stress, learn how digital overload affects well-being, understand factors
            contributing to digital stress, and discover comprehensive strategies to manage screen time, notifications, and support
            mental health in the digital age.
          </p>

          {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
          <ul className="list-disc ml-6 space-y-2 text-blue-600">
            <li>
              <a href="#understanding-digital-stress" className="hover:underline">
                Understanding Digital Stress and Screen Exposure
              </a>
            </li>
            <li>
              <a href="#screen-time-effects" className="hover:underline">
                Effects of Excessive Screen Time on Well-Being
              </a>
            </li>
            <li>
              <a href="#notification-overload" className="hover:underline">
                Notification Overload and Attention Fragmentation
              </a>
            </li>
            <li>
              <a href="#meeting-fatigue" className="hover:underline">
                Meeting Fatigue and Video Call Exhaustion
              </a>
            </li>
            <li>
              <a href="#reduction-strategies" className="hover:underline">
                Comprehensive Strategies to Reduce Screen Exposure Stress
              </a>
            </li>
          </ul>
          <hr />

          {/* UNDERSTANDING DIGITAL STRESS */}
          <h2 id="understanding-digital-stress" className="text-2xl font-bold text-foreground pt-8">
            Understanding Digital Stress and Screen Exposure
          </h2>
          <p>
            Digital stress refers to the psychological and physiological strain caused by excessive screen time, constant
            notifications, information overload, and the always-on nature of digital technology. As screen time has increased
            dramatically in recent years, understanding and managing digital stress has become essential for mental and physical
            well-being.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-6">Components of Digital Stress</h3>
          <p>
            Digital stress encompasses multiple factors:
          </p>
          <ul>
            <li>
              <b>Screen time duration:</b> Total hours spent looking at screens (work, personal, entertainment)
            </li>
            <li>
              <b>Notification load:</b> Frequency and volume of alerts, messages, and interruptions
            </li>
            <li>
              <b>Meeting density:</b> Time spent in video calls or synchronous digital interactions
            </li>
            <li>
              <b>Attention fragmentation:</b> Constant switching between tasks, apps, and information streams
            </li>
            <li>
              <b>Lack of breaks:</b> Insufficient recovery time away from screens
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">Why Digital Stress Matters</h3>
          <p>
            Chronic digital stress can lead to:
          </p>
          <ul>
            <li>Mental fatigue and cognitive overload</li>
            <li>Increased anxiety and stress levels</li>
            <li>Sleep disruption and circadian rhythm issues</li>
            <li>Eye strain and physical discomfort</li>
            <li>Reduced productivity and focus</li>
            <li>Social isolation despite constant connectivity</li>
          </ul>

          <hr />

          {/* SCREEN TIME EFFECTS */}
          <h2 id="screen-time-effects" className="text-2xl font-bold text-foreground pt-8">
            Effects of Excessive Screen Time on Well-Being
          </h2>
          <p>
            Excessive screen time affects multiple aspects of physical and mental health, creating cumulative stress over time.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-6">Physical Effects</h3>
          <ul>
            <li>
              <b>Eye strain:</b> Digital eye strain (computer vision syndrome) causes dry eyes, blurred vision, headaches
            </li>
            <li>
              <b>Posture problems:</b> Prolonged screen use leads to neck, shoulder, and back pain
            </li>
            <li>
              <b>Sleep disruption:</b> Blue light exposure suppresses melatonin and delays sleep
            </li>
            <li>
              <b>Sedentary behavior:</b> Extended screen time reduces physical activity
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">Mental and Emotional Effects</h3>
          <ul>
            <li>
              <b>Cognitive overload:</b> Information overload overwhelms working memory and decision-making
            </li>
            <li>
              <b>Attention deficits:</b> Constant switching reduces sustained attention and deep focus
            </li>
            <li>
              <b>Anxiety and stress:</b> Always-on culture creates pressure to respond immediately
            </li>
            <li>
              <b>Social comparison:</b> Social media exposure can increase anxiety and reduce self-esteem
            </li>
          </ul>

          <hr />

          {/* NOTIFICATION OVERLOAD */}
          <h2 id="notification-overload" className="text-2xl font-bold text-foreground pt-8">
            Notification Overload and Attention Fragmentation
          </h2>
          <p>
            Notifications are designed to capture attention, but excessive notifications fragment focus and create constant
            interruption stress.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-6">How Notifications Affect Focus</h3>
          <p>
            Each notification:
          </p>
          <ul>
            <li>Interrupts current task and breaks flow state</li>
            <li>Requires mental effort to refocus after interruption</li>
            <li>Creates decision fatigue (should I respond now or later?)</li>
            <li>Triggers stress response (fight-or-flight activation)</li>
            <li>Reduces productivity and increases errors</li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">The Cost of Multitasking</h3>
          <p>
            Constant notifications encourage multitasking, which research shows:
          </p>
          <ul>
            <li>Reduces efficiency by up to 40%</li>
            <li>Increases errors and mistakes</li>
            <li>Impairs memory formation and learning</li>
            <li>Increases stress hormones (cortisol)</li>
          </ul>

          <hr />

          {/* MEETING FATIGUE */}
          <h2 id="meeting-fatigue" className="text-2xl font-bold text-foreground pt-8">
            Meeting Fatigue and Video Call Exhaustion
          </h2>
          <p>
            Video calls require more cognitive effort than in-person meetings, leading to "Zoom fatigue" and increased digital
            stress.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-6">Why Video Calls Are Exhausting</h3>
          <ul>
            <li>
              <b>Increased cognitive load:</b> Processing visual cues, managing technology, and maintaining eye contact simultaneously
            </li>
            <li>
              <b>Self-consciousness:</b> Constant view of yourself increases self-monitoring
            </li>
            <li>
              <b>Reduced non-verbal cues:</b> Missing body language requires more mental effort to interpret
            </li>
            <li>
              <b>Technical stress:</b> Worrying about connection, audio, or video quality
            </li>
          </ul>

          <hr />

          {/* REDUCTION STRATEGIES */}
          <h2 id="reduction-strategies" className="text-2xl font-bold text-foreground pt-8">
            Comprehensive Strategies to Reduce Screen Exposure Stress
          </h2>
          <p>
            Reducing digital stress requires intentional boundaries, notification management, and regular breaks. Here are
            evidence-based strategies.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-6">1. Manage Notifications</h3>
          <ul>
            <li>
              <b>Batch notifications:</b> Turn off non-essential notifications and check messages at scheduled times
            </li>
            <li>
              <b>Use Do Not Disturb:</b> Enable focus modes during deep work periods
            </li>
            <li>
              <b>Prioritize channels:</b> Only allow urgent notifications from essential contacts
            </li>
            <li>
              <b>Silence non-essential apps:</b> Disable notifications from social media, games, or entertainment apps
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">2. Set Screen Time Boundaries</h3>
          <ul>
            <li>
              <b>Work hours:</b> Define clear work hours and avoid screens outside these times
            </li>
            <li>
              <b>Screen-free zones:</b> Designate areas (bedroom, dining table) as screen-free
            </li>
            <li>
              <b>Evening cutoff:</b> Stop using screens 1-2 hours before bedtime
            </li>
            <li>
              <b>Weekend limits:</b> Reduce personal screen time on weekends for recovery
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">3. Optimize Meeting Practices</h3>
          <ul>
            <li>
              <b>Shorter meetings:</b> Default to 25-30 minute meetings instead of hour-long sessions
            </li>
            <li>
              <b>Camera breaks:</b> Allow audio-only periods or camera-off options
            </li>
            <li>
              <b>Meeting-free blocks:</b> Schedule 2-3 hour blocks without meetings for deep work
            </li>
            <li>
              <b>Async alternatives:</b> Replace meetings with written updates or async communication when possible
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">4. Take Regular Micro-Breaks</h3>
          <ul>
            <li>
              <b>20-20-20 rule:</b> Every 20 minutes, look at something 20 feet away for 20 seconds
            </li>
            <li>
              <b>Hourly breaks:</b> Take 5-10 minute breaks every hour away from screens
            </li>
            <li>
              <b>Movement breaks:</b> Stand, stretch, or walk during breaks
            </li>
            <li>
              <b>Breathing exercises:</b> Use breaks for brief breathing or mindfulness practices
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">5. Create Digital Wellness Habits</h3>
          <ul>
            <li>
              <b>Morning routine:</b> Avoid screens for the first hour after waking
            </li>
            <li>
              <b>Evening wind-down:</b> Replace screen time with reading, conversation, or relaxation
            </li>
            <li>
              <b>Tech-free meals:</b> Eat without screens to support digestion and connection
            </li>
            <li>
              <b>Regular audits:</b> Weekly review of screen time and notification patterns
            </li>
          </ul>

          <hr />

          {/* CONCLUSION */}
          <h2 className="text-2xl font-bold text-foreground pt-8">Conclusion</h2>
          <p>
            Managing screen exposure stress is essential for maintaining mental well-being, productivity, and overall health in our
            digital age. By understanding how screen time, notifications, and meetings contribute to digital stress, and implementing
            comprehensive strategies to reduce exposure and create boundaries, you can enjoy technology's benefits while protecting
            your well-being. Remember that digital wellness is an ongoing practice—regular monitoring, boundary setting, and
            intentional breaks help maintain balance. Start with small changes, track your progress, and adjust strategies based on
            what works for your lifestyle. If digital stress significantly impacts your mental health or daily functioning, consider
            consulting a mental health professional who can provide personalized support. This tool is designed for wellness
            reflection and is not a substitute for professional mental health evaluation or treatment.
          </p>
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
          <p>
            This tool offers a screen exposure stress index from work hours, personal screen time, notifications, meetings, and
            micro-breaks as a gentle, lifestyle-oriented snapshot. It is intended for personal reflection, not for diagnosis or
            treatment decisions.
          </p>
          <p>
            Outputs include stress index (0-100), total screen time, attention budget, wellness status, interpretation text,
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


