'use client';

import { useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  injuryType: z.enum(['sprain', 'strain', 'fracture', 'tendonitis', 'bursitis', 'muscle_tear', 'ligament_tear', 'post_surgical', 'chronic_pain']),
  recoveryStage: z.enum(['acute', 'subacute', 'chronic', 'return_to_sport']),
  painLevel: z.number().min(0).max(10, 'Pain level must be between 0 and 10'),
  age: z.number().min(1).max(120, 'Age must be between 1 and 120'),
  fitnessLevel: z.enum(['poor', 'average', 'good', 'excellent']),
  sessionFrequency: z.enum(['daily', 'every_other_day', '3x_week', '2x_week', 'weekly']),
  treatmentGoals: z.enum(['pain_relief', 'range_of_motion', 'strength', 'function', 'sport_return']),
  previousPT: z.enum(['none', 'same_condition', 'different_condition', 'multiple']),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  intensity: number;
  interpretation: ReturnType<typeof getIntensityInterpretation>;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  sessionComponents: {
    warmup: { duration: number; intensity: number };
    main: { duration: number; intensity: number };
    cooldown: { duration: number; intensity: number };
  };
};

const understandingInputs = [
  { label: 'Injury or Condition Type', description: 'Different tissues tolerate loading differently. Select the diagnosis guiding your rehab plan.' },
  { label: 'Recovery Stage', description: 'Acute, subacute, chronic, or return-to-sport phases dictate safe intensity ranges.' },
  { label: 'Pain Level', description: 'Higher pain requires gentler sessions and longer rest between exercises.' },
  { label: 'Age', description: 'Older adults generally need lower session intensity and more recovery time.' },
  { label: 'Fitness Level', description: 'Baseline conditioning influences how quickly you can progress loads.' },
  { label: 'Session Frequency', description: 'Daily visits require lower intensity than once-weekly therapy.' },
  { label: 'Primary Goal', description: 'Pain relief, ROM, strength, function, or sport return each demand different workloads.' },
  { label: 'Previous PT Experience', description: 'Experience improves motor control and exercise familiarity, supporting higher intensity.' },
];

const faqs: [string, string][] = [
  ['What intensity is best during the acute stage?', 'Most acute sessions stay below 4/10 intensity. Focus on pain control, swelling reduction, and gentle isometrics.'],
  ['Can physical therapy hurt?', 'Mild discomfort is acceptable, but sharp or lasting pain suggests the session was too intense and needs adjustment.'],
  ['How often should I change intensity?', 'Reassess weekly or whenever symptoms, recovery stage, or goals change.'],
  ['Do athletes always train harder in PT?', 'No. Intensity must match tissue healing status, not competitive drive.'],
  ['Why does frequency matter?', 'Frequent sessions accumulate fatigue; lowering per-session intensity prevents setbacks.'],
  ['How do different goals affect loading?', 'Strength and sport-return plans need higher intensity than pain-relief or ROM programs.'],
  ['Can I combine PT with other workouts?', 'Yes, but coordinate with your therapist to avoid overloading the injured area.'],
  ['Does age reduce intensity?', 'Often. Aging tissues regenerate slower, so intensity typically scales back slightly for safety.'],
  ['What if I skip my home program?', 'Inconsistent adherence slows progress, meaning clinic sessions may need to stay conservative.'],
  ['When should I see my therapist again?', 'If pain spikes above 6/10, swelling increases, or function regresses, schedule a review before progressing.'],
];

const relatedCalculators = [
  { title: 'Injury Recovery Timeline Calculator', href: '/health-fitness/injury-recovery-timeline-calculator', description: 'Estimate overall healing windows before advancing intensity.' },
  { title: 'Range of Motion Progress Calculator', href: '/health-fitness/range-of-motion-progress-calculator', description: 'Track mobility improvements to justify greater loading.' },
  { title: 'Strength to Weight Ratio Calculator', href: '/health-fitness/strength-to-weight-ratio-calculator', description: 'Measure readiness for higher-level functional drills.' },
  { title: 'Training Volume Calculator', href: '/health-fitness/training-volume-calculator', description: 'Balance workload across therapy, sport practice, and strength training.' },
];

const completeGuideSections = [
  {
    title: 'Session Components',
    bullets: [
      'Warm-up: tissue prep, breath work, and mobility at ~30% target intensity.',
      'Main block: neuromuscular or strength work at calculated intensity.',
      'Cool-down: mobility, stretching, and nervous-system downregulation.',
      'Recovery: sleep, hydration, and protein support adaptations.',
    ],
  },
  {
    title: 'Factors That Raise Intensity',
    bullets: ['Later recovery stages', 'Low daily pain (<3/10)', 'Higher baseline fitness', 'Less frequent therapy sessions'],
  },
  {
    title: 'Factors That Lower Intensity',
    bullets: ['Acute inflammation or swelling', 'High pain days', 'Age > 60', 'Daily therapy visits or poor sleep/nutrition'],
  },
];

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Set goals, baseline pain scores, and gentle neuromuscular activation.' },
  { week: 2, focus: 'Introduce breath work, light mobility circuits, and supported isometrics.' },
  { week: 3, focus: 'Add core stability, unilateral balance drills, and tempo control.' },
  { week: 4, focus: 'Layer moderate resistance, proprioceptive drills, and walking intervals.' },
  { week: 5, focus: 'Integrate strength supersets, sled pushes, or aquatic therapy if cleared.' },
  { week: 6, focus: 'Begin functional patterns, deceleration, or light plyometrics as tolerated.' },
  { week: 7, focus: 'Advance to sport-specific drills and objective readiness testing.' },
  { week: 8, focus: 'Complete return-to-activity assessment and create a maintenance plan.' },
];

const warningSigns = () => [
  'Pain that rises above 6/10 during or after the session.',
  'Swelling, warmth, or instability within 24 hours of therapy.',
  'New numbness, tingling, or weakness.',
  'Fatigue that lingers longer than 48 hours despite good sleep.',
];

const getIntensityInterpretation = (intensity: number) => {
  if (intensity > 8) {
    return {
      category: 'High Intensity',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      border: 'border-red-200',
      icon: AlertTriangle,
      description: 'Advanced loading suitable for late-stage rehab or athletic return—monitor symptoms closely.',
      recommendations: [
        'Confirm tissues are cleared for high load and velocity.',
        'Schedule at least one lighter day between intense sessions.',
        'Track soreness and joint reaction 24 hours post-session.',
        'Use objective tests to justify the workload.',
      ],
    };
  }

  if (intensity > 6) {
    return {
      category: 'Moderate-High Intensity',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      border: 'border-orange-200',
      icon: TrendingUp,
      description: 'Challenging workload that advances strength and function when symptoms are stable.',
      recommendations: [
        'Pair sessions with adequate protein and hydration.',
        'Log RPE (perceived exertion) to ensure consistency.',
        'Schedule active recovery to limit inflammation.',
        'Adjust sets/reps if soreness lingers beyond 24 hours.',
      ],
    };
  }

  if (intensity > 4) {
    return {
      category: 'Moderate Intensity',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      border: 'border-blue-200',
      icon: Activity,
      description: 'Balanced sessions that build motor control, endurance, and progressive load tolerance.',
      recommendations: [
        'Emphasize impeccable technique and tempo control.',
        'Progress resistance every 1–2 weeks if pain stays low.',
        'Blend bilateral and unilateral patterns.',
        'Track fatigue, sleep, and stress to guide adjustments.',
      ],
    };
  }

  return {
    category: 'Low Intensity',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    border: 'border-green-200',
    icon: CheckCircle,
    description: 'Protective loading ideal for early rehab, high-pain days, or reintroduction after layoffs.',
    recommendations: [
      'Focus on breath work, mobility, and gentle activation.',
      'Use short bouts (10–15 minutes) spread throughout the day.',
      'Increase difficulty once symptoms remain calm for 48 hours.',
      'Coordinate with your therapist before adding external load.',
    ],
  };
};

const calculateSessionIntensity = (data: FormValues) => {
  let score = 5;

  const stageMultipliers = { acute: 0.4, subacute: 0.7, chronic: 1, return_to_sport: 1.3 };
  score *= stageMultipliers[data.recoveryStage];

  score *= (10 - data.painLevel) / 10;

  if (data.age > 65) score *= 0.8;
  else if (data.age > 50) score *= 0.9;
  else if (data.age < 18) score *= 1.1;

  const fitnessMultipliers = { poor: 0.7, average: 1, good: 1.2, excellent: 1.35 };
  score *= fitnessMultipliers[data.fitnessLevel];

  const frequencyMultipliers = { daily: 0.6, every_other_day: 0.8, '3x_week': 1, '2x_week': 1.15, weekly: 1.3 };
  score *= frequencyMultipliers[data.sessionFrequency];

  const goalMultipliers = { pain_relief: 0.6, range_of_motion: 0.8, strength: 1.2, function: 1, sport_return: 1.3 };
  score *= goalMultipliers[data.treatmentGoals];

  const experienceMultipliers = { none: 0.85, same_condition: 1, different_condition: 0.95, multiple: 1.1 };
  score *= experienceMultipliers[data.previousPT];

  return Math.max(1, Math.min(10, score));
};

export default function PhysicalTherapySessionIntensityCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      injuryType: undefined,
      recoveryStage: undefined,
      painLevel: undefined,
      age: undefined,
      fitnessLevel: undefined,
      sessionFrequency: undefined,
      treatmentGoals: undefined,
      previousPT: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const intensity = calculateSessionIntensity(values);
    const interpretation = getIntensityInterpretation(intensity);
    const sessionComponents = {
      warmup: { duration: Math.round(10 + intensity * 1.5), intensity: Math.max(1, intensity * 0.35) },
      main: { duration: Math.round(25 + intensity * 4), intensity },
      cooldown: { duration: Math.round(8 + intensity * 0.8), intensity: Math.max(1, intensity * 0.25) },
    };

    setResult({
      intensity,
      interpretation,
      recommendations: interpretation.recommendations,
      warningSigns: warningSigns(),
      plan: plan(),
      sessionComponents,
    });
  };

  const resetCalculator = () => {
    form.reset();
    setResult(null);
  };

  const numberInputProps = (handler: (value: number | undefined) => void, value: number | undefined, options?: { min?: number; max?: number }) => ({
    value: value ?? '',
    min: options?.min,
    max: options?.max,
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      const parsed = event.target.value === '' ? undefined : Number(event.target.value);
      handler(Number.isNaN(parsed as number) ? undefined : parsed);
    },
  });

  const selectFields: {
    name: keyof Pick<FormValues, 'injuryType' | 'recoveryStage' | 'fitnessLevel' | 'sessionFrequency' | 'treatmentGoals' | 'previousPT'>;
    label: string;
    options: { value: string; label: string }[];
  }[] = [
    {
      name: 'injuryType',
      label: 'Injury or Condition Type',
      options: [
        { value: 'sprain', label: 'Sprain' },
        { value: 'strain', label: 'Strain' },
        { value: 'fracture', label: 'Fracture' },
        { value: 'tendonitis', label: 'Tendonitis' },
        { value: 'bursitis', label: 'Bursitis' },
        { value: 'muscle_tear', label: 'Muscle Tear' },
        { value: 'ligament_tear', label: 'Ligament Tear' },
        { value: 'post_surgical', label: 'Post-surgical' },
        { value: 'chronic_pain', label: 'Chronic Pain' },
      ],
    },
    {
      name: 'recoveryStage',
      label: 'Recovery Stage',
      options: [
        { value: 'acute', label: 'Acute (0–2 weeks)' },
        { value: 'subacute', label: 'Subacute (2–6 weeks)' },
        { value: 'chronic', label: 'Chronic (6+ weeks)' },
        { value: 'return_to_sport', label: 'Return to Sport' },
      ],
    },
    {
      name: 'fitnessLevel',
      label: 'Fitness Level',
      options: [
        { value: 'poor', label: 'Poor' },
        { value: 'average', label: 'Average' },
        { value: 'good', label: 'Good' },
        { value: 'excellent', label: 'Excellent' },
      ],
    },
    {
      name: 'sessionFrequency',
      label: 'Session Frequency',
      options: [
        { value: 'daily', label: 'Daily' },
        { value: 'every_other_day', label: 'Every Other Day' },
        { value: '3x_week', label: '3× per Week' },
        { value: '2x_week', label: '2× per Week' },
        { value: 'weekly', label: 'Weekly' },
      ],
    },
    {
      name: 'treatmentGoals',
      label: 'Primary Treatment Goal',
      options: [
        { value: 'pain_relief', label: 'Pain Relief' },
        { value: 'range_of_motion', label: 'Range of Motion' },
        { value: 'strength', label: 'Strength' },
        { value: 'function', label: 'Function' },
        { value: 'sport_return', label: 'Return to Sport' },
      ],
    },
    {
      name: 'previousPT',
      label: 'Previous Physical Therapy Experience',
      options: [
        { value: 'none', label: 'None' },
        { value: 'same_condition', label: 'Same Condition' },
        { value: 'different_condition', label: 'Different Condition' },
        { value: 'multiple', label: 'Multiple Courses' },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Physical Therapy Session Intensity Calculator
          </CardTitle>
          <CardDescription>Align therapy loads with recovery stage, pain tolerance, and rehab goals.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {selectFields.map(({ name, label, options }) => (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {options.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                <FormField
                  control={form.control}
                  name="painLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pain Level (0–10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" {...numberInputProps(field.onChange, field.value, { min: 0, max: 10 })} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (years)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" {...numberInputProps(field.onChange, field.value, { min: 1 })} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="submit" className="w-full sm:flex-1 bg-gradient-to-r from-indigo-600 to-purple-600">
                  Calculate Intensity
                </Button>
                <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={resetCalculator}>
                  Reset
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card className={`${result.interpretation.bgColor} border ${result.interpretation.border}`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${result.interpretation.color}`}>
                <result.interpretation.icon className="h-5 w-5" />
                {result.interpretation.category}
              </CardTitle>
              <CardDescription>{result.interpretation.description}</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded border bg-white p-4 text-center">
                <p className="text-3xl font-bold text-primary">{result.intensity.toFixed(1)}/10</p>
                <p className="text-sm text-muted-foreground">Recommended Session Intensity</p>
              </div>
              <div className="rounded border bg-white p-4 text-center">
                <p className="text-3xl font-bold text-primary">{result.sessionComponents.main.duration} min</p>
                <p className="text-sm text-muted-foreground">Main Block Duration</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Structure Blueprint</CardTitle>
              <CardDescription>Distribute intensity across warm-up, work sets, and cool-down.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(result.sessionComponents).map(([section, info]) => (
                <div key={section}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="capitalize">
                      {section} · {info.duration} minutes
                    </span>
                    <span>Intensity {info.intensity.toFixed(1)}/10</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(100, (info.intensity / 10) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Actionable Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {result.recommendations.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Warning Signs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {result.warningSigns.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                8‑Week Intensity Progression Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-2 py-2 text-left">Week</th>
                    <th className="px-2 py-2 text-left">Focus</th>
                  </tr>
                </thead>
                <tbody>
                  {result.plan.map(({ week, focus }) => (
                    <tr key={week} className="border-b">
                      <td className="px-2 py-2 font-semibold">Week {week}</td>
                      <td className="px-2 py-2 text-muted-foreground">{focus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Understanding the Inputs</CardTitle>
          <CardDescription>Why each data point changes your training prescription.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {understandingInputs.map((item) => (
              <li key={item.label}>
                <span className="font-semibold text-foreground">{item.label}:</span> {item.description}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Layer multiple tools for a complete rehab dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {relatedCalculators.map((item) => (
            <div key={item.title} className="rounded border p-4">
              <h4 className="font-semibold">
                <Link href={item.href} className="text-primary hover:underline">
                  {item.title}
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Guide: Structuring PT Sessions</CardTitle>
          <CardDescription>Use these pillars to interpret your intensity score.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          {completeGuideSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-base font-semibold text-foreground">{section.title}</h3>
              <ul className="list-disc space-y-1 pl-5">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>SEO-ready answers for clinicians and patients.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          {faqs.map(([question, answer]) => (
            <div key={question}>
              <h4 className="font-semibold text-foreground">{question}</h4>
              <p>{answer}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

