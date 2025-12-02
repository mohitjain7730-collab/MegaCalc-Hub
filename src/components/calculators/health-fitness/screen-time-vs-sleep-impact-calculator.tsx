'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Zap, Target, AlertTriangle, Shield, Monitor } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  age: z.number().positive('Age must be positive'),
  dailyScreenTime: z.number().min(0, 'Screen time cannot be negative').max(24, 'Screen time cannot exceed 24 hours'),
  sleepHours: z.number().min(0, 'Sleep hours cannot be negative').max(24, 'Sleep hours cannot exceed 24 hours'),
  screenTimeBeforeBed: z.number().min(0, 'Screen time before bed cannot be negative').max(8, 'Screen time before bed cannot exceed 8 hours'),
  deviceType: z.enum(['phone', 'tablet', 'computer', 'tv', 'mixed']),
  blueLightFilter: z.enum(['none', 'basic', 'advanced']),
  sleepQuality: z.enum(['poor', 'fair', 'good', 'excellent']),
  eyeStrain: z.enum(['none', 'mild', 'moderate', 'severe']),
  physicalActivity: z.number().min(0, 'Physical activity cannot be negative').max(8, 'Physical activity cannot exceed 8 hours'),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  sleepImpactScore: number;
  screenTimeRisk: string;
  sleepQualityScore: number;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  healthRisks: string[];
  weeklyProjection: {
    sleepDebt: number;
    screenTimeHours: number;
    recommendedScreenTime: number;
  };
};

const understandingInputs = [
  {
    label: 'Age',
    description:
      'Different ages can experience screen use and sleep differently; younger people may be more sensitive to late‑evening screens.',
  },
  {
    label: 'Daily Screen Time',
    description:
      'Total hours spent using screens (phones, tablets, computers, TV) throughout the day. Higher totals often mean less time for movement, rest, and offline activities.',
  },
  {
    label: 'Sleep Hours per Night',
    description:
      'Total hours of sleep per night. Many adults feel best with roughly 7–9 hours, but the exact amount is personal.',
  },
  {
    label: 'Screen Time Before Bed',
    description:
      'Hours of screen use in the 1–2 hours before bedtime. For many people, less screen time close to bed makes it easier to unwind.',
  },
  {
    label: 'Device Type',
    description:
      'Different devices are used at different distances and for different activities, which can change how stimulating they feel before bed.',
  },
  {
    label: 'Blue Light Filter Usage',
    description:
      'Blue light filters change the colour of the screen and may feel easier on the eyes in the evening for some people.',
  },
  {
    label: 'Sleep Quality',
    description:
      'Your own sense of how rested and restored your sleep feels, regardless of the exact number of hours.',
  },
  {
    label: 'Eye Strain Level',
    description:
      'Tired or uncomfortable eyes can be a sign that your eyes could benefit from breaks, different lighting, or more variety in your day.',
  },
  {
    label: 'Physical Activity',
    description:
      'Movement, whether light or vigorous, often helps people feel more settled and ready for rest later in the day.',
  },
];

const steps = [
  'Enter your age in years.',
  'Enter total daily screen time (hours) spent on all devices.',
  'Enter average sleep hours per night.',
  'Enter screen time in the 1-2 hours before bedtime.',
  'Select primary device type used most frequently.',
  'Select blue light filter usage level.',
  'Select your perceived sleep quality.',
  'Select eye strain level experienced.',
  'Enter daily physical activity hours.',
  'Review the impact score, recommendations, and action plan.',
];

const faqs: [string, string][] = [
  [
    'How does screen time affect sleep?',
    'For many people, screens close to bedtime can make it harder to wind down, especially if the content is stimulating or emotionally intense.',
  ],
  [
    'What is the recommended screen time before bed?',
    'Many sleep guides suggest easing away from screens for about an hour before bed and choosing calmer activities to help the body and mind slow down.',
  ],
  [
    'How much screen time is too much?',
    'There is no single “right” number, but when screens crowd out movement, rest, or offline connection, it can be a cue to explore small shifts.',
  ],
  [
    'Do blue light filters really help?',
    'Blue light filters can make screens feel gentler for some people, but they are usually most helpful when combined with regular breaks and calmer evening habits.',
  ],
  [
    'Can screen time cause insomnia?',
    'Screen habits can influence how easy or hard it feels to fall asleep, especially late‑night scrolling. If sleep difficulties persist or worry you, it can be helpful to talk with a health professional.',
  ],
  [
    'How does age affect screen time impact on sleep?',
    'Families often notice that children and teens may be more sensitive to late‑evening screens, so many caregivers choose earlier digital “wind‑down” times.',
  ],
  [
    'What are the health risks of excessive screen time?',
    'Very long periods on screens can crowd out movement, social connection, and rest, which over time may influence how you feel day to day.',
  ],
  [
    'Can physical activity offset screen time effects?',
    'Regular movement often helps people feel more settled and ready for rest, even if they also spend time on screens.',
  ],
  [
    'How do I reduce screen time before bed?',
    'You might experiment with setting a “screen pause” before bed, charging devices outside the bedroom, or swapping some scrolling time for reading, stretching, or quiet music.',
  ],
  [
    'What are signs I need to reduce screen time?',
    'You might consider small changes if you often feel wired at night, have tired eyes, or notice that screens are taking time away from things you care about.',
  ],
];

const relatedCalculators = [
  {
    name: 'Sleep Quality Calculator',
    slug: 'sleep-quality-calculator',
    description: 'Assess sleep quality to complement screen time impact analysis.',
  },
  {
    name: 'Sleep Balance Check-In',
    slug: 'sleep-debt-calculator-hf',
    description: 'Calculate sleep balance to understand cumulative sleep patterns.',
  },
  {
    name: 'Blue Light Exposure Wellness Calculator',
    slug: 'blue-light-exposure-calculator',
    description: 'Estimate blue light exposure and melatonin disruption from screens.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/screen-time-vs-sleep-impact-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Screen Time vs Sleep Impact Wellness Tracker', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Screen Time vs Sleep Impact Wellness Tracker',
      applicationCategory: 'HealthApplication',
      operatingSystem: 'Web Browser',
      description: 'Calculate screen time impact on sleep quality, sleep onset, and overall rest patterns.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Assess current habits: track daily screen time and screen time before bed to establish baseline.' },
  { week: 2, focus: 'Set digital curfew: implement a 2-hour screen-free period before bedtime to improve sleep onset.' },
  { week: 3, focus: 'Enable blue light filters: activate advanced blue light filters on all devices, especially in evening hours.' },
  { week: 4, focus: 'Reduce daily screen time: aim to reduce total daily screen time by 1-2 hours through alternative activities.' },
  { week: 5, focus: 'Create screen-free zones: keep bedrooms, dining areas, and bathrooms completely screen-free.' },
  { week: 6, focus: 'Increase physical activity: add 30-60 minutes of daily physical activity to improve sleep quality and reduce screen dependency.' },
  { week: 7, focus: 'Establish routines: create consistent bedtime routines without screens, such as reading or meditation.' },
  { week: 8, focus: 'Maintain balance: establish long-term habits that balance screen use with sleep, activity, and offline activities.' },
];

const warningSigns = () => [
  'If screen time regularly replaces movement, rest, or in‑person connection, it may be helpful to explore small changes.',
  'Using screens right before bed can make it harder for some people to feel sleepy; a short wind‑down window away from devices can help.',
  'If you feel concerned about your sleep, mood, or daytime energy, consider discussing your experience with a qualified professional.',
  'If screens feel difficult to put down or are creating tension in relationships or routines, gentle boundaries and support can be useful.',
];

export default function ScreenTimeVsSleepImpactCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      dailyScreenTime: undefined,
      sleepHours: undefined,
      screenTimeBeforeBed: undefined,
      deviceType: undefined,
      blueLightFilter: undefined,
      sleepQuality: undefined,
      eyeStrain: undefined,
      physicalActivity: undefined,
    },
  });

  const calculateSleepImpact = (values: FormValues) => {
    let impactScore = 0;
    
    // Age factor (younger people more affected by screen time)
    if (values.age < 18) impactScore += 20;
    else if (values.age < 30) impactScore += 15;
    else if (values.age < 50) impactScore += 10;
    else impactScore += 5;

    // Daily screen time impact
    if (values.dailyScreenTime > 8) impactScore += 25;
    else if (values.dailyScreenTime > 6) impactScore += 20;
    else if (values.dailyScreenTime > 4) impactScore += 15;
    else if (values.dailyScreenTime > 2) impactScore += 10;
    else impactScore += 5;

    // Screen time before bed impact
    if (values.screenTimeBeforeBed > 2) impactScore += 20;
    else if (values.screenTimeBeforeBed > 1) impactScore += 15;
    else if (values.screenTimeBeforeBed > 0.5) impactScore += 10;
    else impactScore += 5;

    // Device type impact
    const deviceImpact = {
      phone: 15,
      tablet: 12,
      computer: 10,
      tv: 8,
      mixed: 18,
    };
    impactScore += deviceImpact[values.deviceType];

    // Blue light filter impact
    const filterImpact = {
      none: 15,
      basic: 8,
      advanced: 3,
    };
    impactScore -= filterImpact[values.blueLightFilter];

    // Sleep quality impact
    const sleepQualityImpact = {
      poor: 20,
      fair: 15,
      good: 8,
      excellent: 3,
    };
    impactScore += sleepQualityImpact[values.sleepQuality];

    // Eye strain impact
    const eyeStrainImpact = {
      none: 0,
      mild: 5,
      moderate: 10,
      severe: 15,
    };
    impactScore += eyeStrainImpact[values.eyeStrain];

    // Physical activity benefit
    impactScore -= Math.min(values.physicalActivity * 2, 10);

    return Math.max(0, Math.min(100, impactScore));
  };

  const getScreenTimeRisk = (impactScore: number) => {
    if (impactScore >= 70) return 'Heavier screen load pattern';
    if (impactScore >= 50) return 'Moderate screen load pattern';
    if (impactScore >= 30) return 'Lighter screen load pattern';
    return 'Very light screen load pattern';
  };

  const calculateSleepQualityScore = (values: FormValues) => {
    let score = 100;
    
    // Sleep hours impact
    if (values.sleepHours < 6) score -= 30;
    else if (values.sleepHours < 7) score -= 20;
    else if (values.sleepHours > 9) score -= 15;
    else if (values.sleepHours >= 7 && values.sleepHours <= 9) score += 0;

    // Screen time before bed impact
    score -= values.screenTimeBeforeBed * 8;

    // Blue light filter benefit
    const filterBenefit = {
      none: 0,
      basic: 10,
      advanced: 20,
    };
    score += filterBenefit[values.blueLightFilter];

    return Math.max(0, Math.min(100, score));
  };

  const onSubmit = (values: FormValues) => {
    const sleepImpactScore = calculateSleepImpact(values);
    const screenTimeRisk = getScreenTimeRisk(sleepImpactScore);
    const sleepQualityScore = calculateSleepQualityScore(values);

    let recommendations: string[] = [];
    let healthRisks: string[] = [];

    if (sleepImpactScore >= 70) {
      recommendations = [
        'Experiment with shorter total screen time, especially on days when you would like more space for rest or movement.',
        'Try a longer screen‑free wind‑down before bedtime and notice how your body responds.',
        'Use night‑mode or blue‑shifted displays in the evening if they feel better on your eyes.',
        'Sprinkle more light movement or stretching breaks through your day to balance out sitting time.',
        'Pick one regular “low‑screen” block in your week to lean into offline activities you enjoy.',
      ];
      healthRisks = [
        'With very long screen days, it can be easy for movement, rest, or hobbies to get squeezed out.',
        'Some people notice more tired eyes or difficulty unwinding after many hours on devices.',
        'Checking in regularly with how your routines feel can help you decide which screen habits truly support you.',
      ];
    } else if (sleepImpactScore >= 50) {
      recommendations = [
        'Gently experiment with trimming a little screen time from parts of the day that feel most crowded.',
        'Create a simple, screen‑lighter buffer before bed and replace it with something calming.',
        'Use display settings or apps that make evening viewing feel softer or warmer to your eyes.',
        'Pair screen use with short movement breaks or standing intervals when it feels possible.',
        'Notice which types of content leave you feeling rested versus wired, and lean toward the former in the evening.',
      ];
      healthRisks = [
        'Moderate screen use can still feel intense if most of it happens late at night or without breaks.',
        'Pausing to ask how your screen habits make you feel can help you fine‑tune your routine.',
      ];
    } else if (sleepImpactScore >= 30) {
      recommendations = [
        'You may be close to a balance that works for you—continue noticing what helps you feel rested.',
        'If you like, keep a short buffer before bed where screens are set aside in favour of calm activities.',
        'Maintain movement and breaks throughout the day alongside your screen use.',
        'Check in with your sleep and energy from time to time and adjust if your needs change.',
      ];
      healthRisks = [
        'Your current pattern may already feel workable; small refinements can still be helpful if your life or work changes.',
      ];
    } else {
      recommendations = [
        'Your screen and sleep patterns appear relatively gentle—continue with what already supports you.',
        'You can share routines that work for you with friends or family who are exploring their own balance.',
        'Keep tuning in to how your sleep and focus feel, and adjust your habits if your situation changes.',
      ];
      healthRisks = [
        'At this level, many people feel that screens are fitting reasonably well into the rest of life.',
      ];
    }

    // Weekly projection
    const weeklyProjection = {
      sleepDebt: Math.max(0, (7 - values.sleepHours) * 7),
      screenTimeHours: values.dailyScreenTime * 7,
      recommendedScreenTime: Math.min(6, values.dailyScreenTime * 0.8),
    };

    setResult({
      sleepImpactScore,
      screenTimeRisk,
      sleepQualityScore,
      recommendations,
      warningSigns: warningSigns(),
      plan: plan(),
      healthRisks,
      weeklyProjection,
    });
  };

  return (
    <div className="space-y-8">
      <Script id="screen-sleep-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Screen Time vs Sleep Impact Wellness Tracker
          </CardTitle>
          <CardDescription>
            Reflect on how your screen habits relate to your wind‑down time and overall sense of rest, in a non‑diagnostic way.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your screen and sleep information</CardTitle>
          <CardDescription>Enter details about your screen time habits and sleep patterns to see personalized insights.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="age" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age (years)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="dailyScreenTime" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily Screen Time (hours)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.5"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="sleepHours" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sleep Hours per Night</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.5"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="screenTimeBeforeBed" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Screen Time Before Bed (hours)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.5"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="deviceType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Device Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select device type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="tablet">Tablet</SelectItem>
                        <SelectItem value="computer">Computer</SelectItem>
                        <SelectItem value="tv">TV</SelectItem>
                        <SelectItem value="mixed">Mixed Devices</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="blueLightFilter" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blue Light Filter Usage</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select filter usage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="basic">Basic (built-in)</SelectItem>
                        <SelectItem value="advanced">Advanced (third-party)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="sleepQuality" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sleep Quality</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sleep quality" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="poor">Poor (fragmented, restless)</SelectItem>
                        <SelectItem value="fair">Fair (some interruptions)</SelectItem>
                        <SelectItem value="good">Good (mostly uninterrupted)</SelectItem>
                        <SelectItem value="excellent">Excellent (deep, restorative)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="eyeStrain" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Eye Strain Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select eye strain level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="mild">Mild (occasional discomfort)</SelectItem>
                        <SelectItem value="moderate">Moderate (frequent discomfort)</SelectItem>
                        <SelectItem value="severe">Severe (constant discomfort)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="physicalActivity" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily Physical Activity (hours)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.5"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate Screen Time Impact</Button>
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
            <CardDescription>See screen-sleep balance score, sleep quality score, recommendations, and action plan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Impact Score</p>
                <p className="text-2xl font-semibold text-primary">{result.sleepImpactScore}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sleep Quality</p>
                <p className="text-2xl font-semibold text-primary">{result.sleepQualityScore}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Screen Pattern</p>
                <p className="text-2xl font-semibold text-primary text-sm">{result.screenTimeRisk}</p>
                <p className="text-xs text-muted-foreground">Risk level</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Weekly Screen</p>
                <p className="text-2xl font-semibold text-primary">{result.weeklyProjection.screenTimeHours}h</p>
                <p className="text-xs text-muted-foreground">Total per week</p>
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
                    {result.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
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
                      <li key={step.week}>
                        <span className="font-semibold">Week {step.week}:</span> {step.focus}
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
            <strong>Sleep Impact Score</strong> = Age Factor + Daily Screen Time Factor + Screen Time Before Bed Factor + Device
            Type Factor − Blue Light Filter Benefit + Sleep Quality Factor + Eye Strain Factor − Physical Activity Benefit. The
            score ranges from 0-100, with higher scores indicating greater potential impact on sleep.
          </p>
          <p>
            <strong>Sleep Quality Score</strong> = 100 − Sleep Hours Deficit − (Screen Time Before Bed × 8) + Blue Light Filter
            Benefit. This estimates sleep support based on sleep duration, evening screen exposure, and protective measures.
          </p>
          <p>
            Age factors: Younger individuals (&lt;18 years) receive higher impact scores due to increased sensitivity to screen
            exposure. Device types vary in impact (phones/tablets typically higher than TV). Blue light filters and physical
            activity reduce impact scores.
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

      <Card>
        <CardHeader>
          <CardTitle>Detailed Guide</CardTitle>
          <CardDescription>
            Comprehensive guide to screen time, sleep impact, blue light exposure, and strategies for digital wellness
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            The Definitive Guide to Screen Time and Sleep Impact: Understanding Digital Habits and Sleep Quality
          </h2>
          <p className="text-lg italic text-gray-700">
            Explore the science of screen time and sleep, learn how digital devices affect rest, understand blue light exposure,
            and discover comprehensive strategies to balance screen use with quality sleep.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
          <ul className="list-disc ml-6 space-y-2 text-blue-600">
            <li>
              <a href="#understanding-screen-sleep" className="hover:underline">
                Understanding Screen Time and Sleep Relationship
              </a>
            </li>
            <li>
              <a href="#blue-light-effects" className="hover:underline">
                Blue Light Effects on Sleep and Circadian Rhythms
              </a>
            </li>
            <li>
              <a href="#evening-exposure" className="hover:underline">
                Evening Screen Exposure and Sleep Onset
              </a>
            </li>
            <li>
              <a href="#reduction-strategies" className="hover:underline">
                Comprehensive Strategies to Reduce Screen Time Impact on Sleep
              </a>
            </li>
          </ul>
          <hr />

          <h2 id="understanding-screen-sleep" className="text-2xl font-bold text-foreground pt-8">
            Understanding Screen Time and Sleep Relationship
          </h2>
          <p>
            Screen time, especially in the evening, can significantly impact sleep quality, sleep onset latency, and overall
            rest patterns. Understanding this relationship helps create healthier digital habits.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-6">How Screens Affect Sleep</h3>
          <p>
            Screens can disrupt sleep through multiple mechanisms:
          </p>
          <ul>
            <li>
              <b>Blue light exposure:</b> Suppresses melatonin production, delaying sleep onset
            </li>
            <li>
              <b>Mental stimulation:</b> Engaging content increases alertness and makes relaxation difficult
            </li>
            <li>
              <b>Delayed bedtime:</b> Screen use can extend wake time, reducing total sleep duration
            </li>
            <li>
              <b>Sleep fragmentation:</b> Notifications and alerts can interrupt sleep throughout the night
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">Age-Related Sensitivity</h3>
          <p>
            Research suggests that children and adolescents may be more sensitive to evening screen exposure than adults. Their
            developing circadian systems and higher screen use make them particularly vulnerable to sleep disruption from digital
            devices.
          </p>

          <hr />

          <h2 id="blue-light-effects" className="text-2xl font-bold text-foreground pt-8">
            Blue Light Effects on Sleep and Circadian Rhythms
          </h2>
          <p>
            Blue light, particularly from LED screens, plays a significant role in sleep disruption by affecting melatonin
            production and circadian rhythms.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-6">How Blue Light Works</h3>
          <p>
            Blue light wavelengths (especially 460-480nm) are most effective at suppressing melatonin, the hormone that
            regulates sleep-wake cycles. Exposure to blue light in the evening signals the brain that it's still daytime,
            delaying sleep onset.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-6">Blue Light Filters</h3>
          <p>
            Blue light filters (night mode, blue light filters) reduce blue light emission:
          </p>
          <ul>
            <li>
              <b>Basic filters:</b> Built-in device settings that warm screen colors
            </li>
            <li>
              <b>Advanced filters:</b> Third-party apps with more sophisticated filtering
            </li>
            <li>
              <b>Effectiveness:</b> Can help but work best when combined with reduced evening screen time
            </li>
          </ul>

          <hr />

          <h2 id="evening-exposure" className="text-2xl font-bold text-foreground pt-8">
            Evening Screen Exposure and Sleep Onset
          </h2>
          <p>
            Screen time in the 1-2 hours before bedtime has the strongest impact on sleep quality and onset latency.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-6">Impact of Evening Screens</h3>
          <ul>
            <li>
              <b>Delayed sleep onset:</b> Can increase time to fall asleep by 30-60 minutes or more
            </li>
            <li>
              <b>Reduced sleep quality:</b> Less deep sleep and REM sleep
            </li>
            <li>
              <b>Increased awakenings:</b> More frequent nighttime wake-ups
            </li>
            <li>
              <b>Morning alertness:</b> Reduced alertness and cognitive performance the next day
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">Device Type Differences</h3>
          <p>
            Different devices have varying impacts:
          </p>
          <ul>
            <li>
              <b>Phones/tablets:</b> Higher impact due to close proximity and interactive content
            </li>
            <li>
              <b>Computers:</b> Moderate impact, often used for work which adds stress
            </li>
            <li>
              <b>TV:</b> Lower impact due to distance, but still affects sleep if used close to bedtime
            </li>
          </ul>

          <hr />

          <h2 id="reduction-strategies" className="text-2xl font-bold text-foreground pt-8">
            Comprehensive Strategies to Reduce Screen Time Impact on Sleep
          </h2>
          <p>
            Reducing screen time impact on sleep requires intentional boundaries, environmental adjustments, and alternative
            evening activities.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-6">1. Establish Screen-Free Wind-Down</h3>
          <ul>
            <li>
              <b>Set digital curfew:</b> Stop using screens 1-2 hours before bedtime
            </li>
            <li>
              <b>Create buffer zone:</b> Use this time for calming activities (reading, stretching, conversation)
            </li>
            <li>
              <b>Charge devices elsewhere:</b> Keep phones and devices out of the bedroom
            </li>
            <li>
              <b>Use alarm clock:</b> Replace phone alarm with traditional alarm clock
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">2. Optimize Screen Settings</h3>
          <ul>
            <li>
              <b>Enable blue light filters:</b> Use night mode or blue light filter apps in the evening
            </li>
            <li>
              <b>Reduce brightness:</b> Lower screen brightness in the evening
            </li>
            <li>
              <b>Use dark mode:</b> Switch to dark mode themes to reduce overall light emission
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">3. Manage Daily Screen Time</h3>
          <ul>
            <li>
              <b>Set limits:</b> Establish daily screen time goals
            </li>
            <li>
              <b>Take breaks:</b> Regular breaks from screens throughout the day
            </li>
            <li>
              <b>Screen-free zones:</b> Designate areas (bedroom, dining table) as screen-free
            </li>
            <li>
              <b>Alternative activities:</b> Replace some screen time with movement, hobbies, or social connection
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">4. Support Sleep with Lifestyle</h3>
          <ul>
            <li>
              <b>Regular exercise:</b> Physical activity supports better sleep quality
            </li>
            <li>
              <b>Consistent schedule:</b> Maintain regular sleep and wake times
            </li>
            <li>
              <b>Sleep environment:</b> Keep bedroom dark, cool, and quiet
            </li>
            <li>
              <b>Relaxation techniques:</b> Practice breathing exercises, meditation, or gentle stretching before bed
            </li>
          </ul>

          <hr />

          <h2 className="text-2xl font-bold text-foreground pt-8">Conclusion</h2>
          <p>
            Understanding how screen time affects sleep is essential for maintaining quality rest and overall well-being. By
            recognizing the impact of evening screen exposure, implementing screen-free wind-down periods, optimizing device
            settings, and creating healthy digital boundaries, you can improve sleep quality while still enjoying technology.
            Remember that small, consistent changes often have the biggest impact—start with one strategy, track your progress,
            and gradually build healthier habits. If sleep difficulties persist despite lifestyle changes, consider consulting a
            healthcare provider or sleep specialist who can provide personalized guidance. This tool is designed for wellness
            reflection and is not a substitute for professional medical evaluation or treatment.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>FAQs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map(([question, answer], index) => (
            <div key={index}>
              <h4 className="font-semibold">{question}</h4>
              <p className="text-sm text-muted-foreground">{answer}</p>
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
            This tool offers a screen-sleep impact score from age, daily screen time, sleep hours, evening screen exposure,
            device type, blue light filter usage, sleep quality, eye strain, and physical activity as a gentle,
            lifestyle-oriented snapshot. It is intended for personal reflection, not for diagnosis or treatment decisions.
          </p>
          <p>
            Outputs include impact score (0-100), sleep quality score, screen time risk pattern, weekly projections,
            interpretation text, supportive recommendations, warning signs, an action plan, and contextual information about
            the inputs and calculation approach.
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
