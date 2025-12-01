'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Monitor, Activity, Calendar, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" /> Screen Time vs Sleep Impact Calculator
          </CardTitle>
          <CardDescription>
            Reflect on how your screen habits relate to your wind‑down time and overall sense of rest, in a non‑diagnostic way.
          </CardDescription>
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
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Activity className="h-8 w-8 text-primary" />
                <CardTitle>Screen–Sleep Balance Insight</CardTitle>
              </div>
              <CardDescription>A gentle, wellness‑focused look at your current routines.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded">
                  <p className="text-3xl font-bold text-primary">{result.sleepImpactScore}/100</p>
                  <p className="text-sm text-muted-foreground">Screen–sleep balance score</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <p className="text-2xl font-bold text-primary">{result.screenTimeRisk}</p>
                  <p className="text-sm text-muted-foreground">Screen time pattern</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <p className="text-3xl font-bold text-primary">{result.sleepQualityScore}/100</p>
                  <p className="text-sm text-muted-foreground">Sleep support score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Projection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded">
                  <p className="text-2xl font-bold text-red-500">{result.weeklyProjection.sleepDebt}h</p>
                  <p className="text-sm text-muted-foreground">Weekly gap from 7‑hour reference</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <p className="text-2xl font-bold text-blue-500">{result.weeklyProjection.screenTimeHours}h</p>
                  <p className="text-sm text-muted-foreground">Weekly Screen Time</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <p className="text-2xl font-bold text-green-500">{result.weeklyProjection.recommendedScreenTime}h</p>
                  <p className="text-sm text-muted-foreground">Example daily screen target</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Gentle ideas to experiment with</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.recommendations.map((item, index) => (
                    <li key={index} className="text-sm text-muted-foreground">{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Things to pay attention to
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.warningSigns.map((item, index) => (
                    <li key={index} className="text-sm text-muted-foreground">{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Reflections about long screen days</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.healthRisks.map((item, index) => (
                  <li key={index} className="text-sm text-muted-foreground">{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Digital Wellness Improvement Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Week</th>
                      <th className="text-left p-2">Focus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.plan.map(({ week, focus }) => (
                      <tr key={week} className="border-b">
                        <td className="p-2">{week}</td>
                        <td className="p-2">{focus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Understanding the Inputs</CardTitle>
          <CardDescription>Collect accurate information for meaningful results</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {understandingInputs.map((item, index) => (
              <li key={index}>
                <span className="font-semibold text-foreground">{item.label}:</span>
                <span className="text-sm text-muted-foreground"> {item.description}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Build a comprehensive sleep and wellness assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/sleep-quality-calculator" className="text-primary hover:underline">
                  Sleep Quality Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Assess sleep quality to complement screen time impact analysis.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/sleep-debt-calculator" className="text-primary hover:underline">
                  Sleep Debt Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Calculate sleep debt to understand cumulative sleep impact.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/daily-activity-points-calculator" className="text-primary hover:underline">
                  Daily Activity Points Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Track comprehensive daily activity including screen time management.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/stress-level-calculator" className="text-primary hover:underline">
                  Stress Level Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Assess stress levels that may be affected by screen time and sleep quality.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Guide: Screen Time, Wind‑Down, and Rest</CardTitle>
          <CardDescription>Context for thinking about digital habits in a gentle, wellness‑focused way</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            Many people find that long or late‑night screen sessions make it harder to feel calm and sleepy, especially if the
            content is fast‑moving or emotional. Others notice that a bit of structure—like setting a time to put devices down
            and choosing a quieter activity—helps the transition to sleep feel smoother.
          </p>
          <p>
            Rather than focusing on strict rules, you can use this tool as a starting point to notice how your own energy,
            focus, and mood respond to different patterns of screen use. Short experiment periods—such as one or two weeks with
            a slightly earlier digital “curfew” or a few more movement breaks—often give useful feedback about what genuinely
            feels better for you.
          </p>
          <p>
            If you ever feel worried about your sleep, mental health, or overall well‑being, consider talking with a qualified
            health professional. They can look at your full situation, including but not limited to screen use, and offer
            personalised guidance.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Common questions about screen time and sleep impact</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map(([question, answer], index) => (
            <div key={index}>
              <h4 className="font-semibold mb-1">{question}</h4>
              <p className="text-sm text-muted-foreground">{answer}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a
        medical or psychological diagnosis. For any health concerns, please consult a qualified professional.
      </p>
    </div>
  );
}
