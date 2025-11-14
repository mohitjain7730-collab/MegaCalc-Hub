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
    description: 'Younger individuals, especially children and teens, are more sensitive to screen time effects on sleep due to developing circadian rhythms.',
  },
  {
    label: 'Daily Screen Time',
    description: 'Total hours spent using screens (phones, tablets, computers, TV) throughout the day. Excessive screen time (>6-8 hours) significantly impacts sleep.',
  },
  {
    label: 'Sleep Hours per Night',
    description: 'Total hours of sleep per night. Optimal sleep is 7-9 hours for adults. Too little or too much sleep can indicate screen time-related issues.',
  },
  {
    label: 'Screen Time Before Bed',
    description: 'Hours of screen use in the 1-2 hours before bedtime. This is particularly harmful as blue light suppresses melatonin production needed for sleep.',
  },
  {
    label: 'Device Type',
    description: 'Different devices emit varying amounts of blue light. Phones and tablets held close to the face have greater impact than TVs viewed from distance.',
  },
  {
    label: 'Blue Light Filter Usage',
    description: 'Blue light filters reduce melatonin suppression. Advanced filters are more effective than basic built-in filters at protecting sleep.',
  },
  {
    label: 'Sleep Quality',
    description: 'Subjective assessment of sleep quality. Poor sleep quality often correlates with excessive screen time, especially before bed.',
  },
  {
    label: 'Eye Strain Level',
    description: 'Digital eye strain indicates excessive screen use and may correlate with sleep disruption. Severe strain suggests need for screen time reduction.',
  },
  {
    label: 'Physical Activity',
    description: 'Regular physical activity can partially offset screen time effects on sleep by improving sleep quality and reducing screen time dependency.',
  },
];

const faqs: [string, string][] = [
  [
    'How does screen time affect sleep?',
    'Screen time, especially before bed, suppresses melatonin production through blue light exposure, delays sleep onset by 30-60 minutes, reduces REM sleep, and disrupts circadian rhythms.',
  ],
  [
    'What is the recommended screen time before bed?',
    'Experts recommend avoiding screens for 1-2 hours before bedtime. If you must use screens, use advanced blue light filters and keep devices at least 20 inches away.',
  ],
  [
    'How much screen time is too much?',
    'For adults, 6-8 hours daily is considered high. More than 8 hours daily significantly impacts sleep and health. Children and teens should have even less screen time.',
  ],
  [
    'Do blue light filters really help?',
    'Yes. Blue light filters reduce melatonin suppression, but they don\'t eliminate all negative effects. Advanced filters are more effective than basic ones, but avoiding screens before bed is best.',
  ],
  [
    'Can screen time cause insomnia?',
    'Yes. Excessive screen time, especially before bed, is a major contributor to insomnia and sleep disorders. Blue light exposure and stimulating content both disrupt sleep.',
  ],
  [
    'How does age affect screen time impact on sleep?',
    'Younger individuals, especially children and teens, are more sensitive to screen time effects due to developing circadian rhythms and higher sensitivity to blue light.',
  ],
  [
    'What are the health risks of excessive screen time?',
    'Risks include sleep disorders, eye strain, increased anxiety and depression, reduced physical activity, poor posture, metabolic issues, and reduced cognitive performance.',
  ],
  [
    'Can physical activity offset screen time effects?',
    'Regular physical activity can partially offset screen time effects by improving sleep quality and reducing dependency on screens. However, it doesn\'t eliminate the need for screen time limits.',
  ],
  [
    'How do I reduce screen time before bed?',
    'Set a digital curfew 1-2 hours before bed, use screen time tracking apps, charge devices outside the bedroom, replace screen time with reading or relaxation, and establish a consistent bedtime routine.',
  ],
  [
    'What are signs I need to reduce screen time?',
    'Signs include difficulty falling or staying asleep, frequent eye strain or headaches, increased anxiety or mood changes, reduced physical activity, poor posture, and difficulty concentrating.',
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
  'Excessive screen time (>8 hours daily) significantly increases risk of sleep disorders, eye strain, and mental health issues.',
  'Screen time within 1 hour of bedtime can delay sleep onset by 30-60 minutes and reduce sleep quality—avoid screens before bed.',
  'Severe eye strain or persistent sleep problems may indicate underlying health issues—consult a healthcare provider if concerned.',
  'If screen time is interfering with daily activities, relationships, or causing withdrawal symptoms, consider professional support.',
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
    if (impactScore >= 70) return 'High Risk';
    if (impactScore >= 50) return 'Moderate Risk';
    if (impactScore >= 30) return 'Low Risk';
    return 'Minimal Risk';
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
        'Reduce daily screen time to under 4 hours',
        'Implement a 2-hour screen-free period before bedtime',
        'Use advanced blue light filters on all devices',
        'Increase physical activity to at least 1 hour daily',
        'Consider digital detox weekends'
      ];
      healthRisks = [
        'Increased risk of insomnia and sleep disorders',
        'Higher likelihood of eye strain and digital eye syndrome',
        'Potential impact on mental health and mood',
        'Reduced cognitive performance and focus',
        'Increased risk of obesity and metabolic issues'
      ];
    } else if (sleepImpactScore >= 50) {
      recommendations = [
        'Limit screen time to 6 hours or less daily',
        'Create a 1-hour screen-free buffer before bed',
        'Use blue light filters on all devices',
        'Increase physical activity to 30-45 minutes daily',
        'Practice good sleep hygiene'
      ];
      healthRisks = [
        'Moderate risk of sleep quality issues',
        'Potential eye strain and fatigue',
        'Possible impact on mood and energy levels',
        'Risk of developing unhealthy screen habits'
      ];
    } else if (sleepImpactScore >= 30) {
      recommendations = [
        'Maintain current screen time levels',
        'Continue using blue light filters',
        'Keep 30-minute screen-free period before bed',
        'Maintain regular physical activity',
        'Monitor sleep quality regularly'
      ];
      healthRisks = [
        'Low risk of sleep-related issues',
        'Minimal impact on overall health'
      ];
    } else {
      recommendations = [
        'Excellent screen time and sleep balance',
        'Continue current healthy habits',
        'Share your strategies with others',
        'Maintain regular sleep schedule'
      ];
      healthRisks = [
        'Minimal health risks from screen time',
        'Good sleep quality and overall health'
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
          <CardTitle className="flex items-center gap-2"><Monitor className="h-5 w-5" /> Screen Time vs Sleep Impact Calculator</CardTitle>
          <CardDescription>Analyze how your screen time habits affect sleep quality and overall health to optimize your digital wellness.</CardDescription>
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
              <div className="flex items-center gap-4"><Activity className="h-8 w-8 text-primary" /><CardTitle>Screen Time vs Sleep Impact Analysis</CardTitle></div>
              <CardDescription>Your digital wellness assessment and sleep impact evaluation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded">
                  <p className="text-3xl font-bold text-primary">{result.sleepImpactScore}/100</p>
                  <p className="text-sm text-muted-foreground">Sleep Impact Score</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <p className="text-2xl font-bold text-primary">{result.screenTimeRisk}</p>
                  <p className="text-sm text-muted-foreground">Screen Time Risk Level</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <p className="text-3xl font-bold text-primary">{result.sleepQualityScore}/100</p>
                  <p className="text-sm text-muted-foreground">Sleep Quality Score</p>
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
                  <p className="text-sm text-muted-foreground">Weekly Sleep Debt</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <p className="text-2xl font-bold text-blue-500">{result.weeklyProjection.screenTimeHours}h</p>
                  <p className="text-sm text-muted-foreground">Weekly Screen Time</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <p className="text-2xl font-bold text-green-500">{result.weeklyProjection.recommendedScreenTime}h</p>
                  <p className="text-sm text-muted-foreground">Recommended Daily Screen Time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
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
                <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Warning Signs & Precautions</CardTitle>
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
              <CardTitle>Health Risks</CardTitle>
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
          <CardTitle>Complete Guide: Understanding Screen Time and Sleep Health</CardTitle>
          <CardDescription>Evidence-based information about digital wellness and sleep</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            Excessive screen time, especially before bedtime, can significantly disrupt sleep patterns. Blue light from screens suppresses melatonin production, making it harder to fall asleep and stay asleep. The content we consume can also increase mental stimulation and stress levels.
          </p>
          <p>
            Blue light blocks melatonin production for up to 2 hours, disrupts circadian rhythms, delays sleep onset by 30-60 minutes, and reduces restorative REM sleep. Health risks include sleep disorders, eye strain, increased anxiety and depression, reduced physical activity, poor posture, metabolic issues, and reduced cognitive performance.
          </p>
          <p>
            Optimal screen time guidelines: Adults should limit to 6-8 hours maximum daily with 2-hour breaks every 2 hours, and maintain a 1-2 hour screen-free period before bedtime. Use blue light filters, maintain 20-26 inches distance from screens, follow the 20-20-20 rule (every 20 minutes, look at something 20 feet away for 20 seconds), and create screen-free zones in bedrooms and dining areas.
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
    </div>
  );
}
