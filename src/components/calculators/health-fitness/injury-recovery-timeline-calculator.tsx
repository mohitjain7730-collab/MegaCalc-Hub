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
import { Heart, TrendingUp, CheckCircle, Activity, AlertTriangle, Calendar } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  injuryType: z.enum(['sprain', 'strain', 'fracture', 'tendonitis', 'bursitis', 'muscle_tear', 'ligament_tear', 'dislocation', 'contusion']),
  severity: z.enum(['mild', 'moderate', 'severe']),
  age: z.number().min(1).max(120, 'Age must be between 1 and 120'),
  fitnessLevel: z.enum(['poor', 'average', 'good', 'excellent']),
  previousInjuries: z.enum(['none', 'same_area', 'different_area', 'multiple']),
  treatmentCompliance: z.enum(['poor', 'fair', 'good', 'excellent']),
  nutrition: z.enum(['poor', 'average', 'good', 'excellent']),
  sleep: z.enum(['poor', 'average', 'good', 'excellent']),
});

type FormValues = z.infer<typeof formSchema>;

type RecoveryPhases = {
  acute: { duration: number; description: string };
  subacute: { duration: number; description: string };
  chronic: { duration: number; description: string };
};

type ResultPayload = {
  recoveryTime: number;
  interpretation: ReturnType<typeof getInjuryRecoveryInterpretation>;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  phases: RecoveryPhases;
};

const understandingInputs = [
  { label: 'Injury Type', description: 'Different tissues heal at different speeds. A ligament tear recovers slower than a contusion.' },
  { label: 'Severity', description: 'Mild injuries typically involve micro-tears, while severe injuries may require surgical repair.' },
  { label: 'Age', description: 'Older adults heal more slowly due to changes in tissue elasticity and circulation.' },
  { label: 'Fitness Level', description: 'Higher baseline fitness improves circulation and neuromuscular control, speeding recovery.' },
  { label: 'Previous Injuries', description: 'Re-injured tissues often need more time and care compared to first-time injuries.' },
  { label: 'Treatment Compliance', description: 'Adherence to prescribed therapy sessions, home exercises, and restrictions drives outcomes.' },
  { label: 'Nutrition', description: 'Protein, vitamins C and D, and minerals such as zinc support tissue repair.' },
  { label: 'Sleep', description: 'Deep sleep releases growth hormone and supports immune function critical for healing.' },
];

const faqs: [string, string][] = [
  ['How accurate is this recovery timeline?', 'It provides an evidence-informed estimate. Actual recovery depends on adherence to medical advice, overall health, and follow-up care.'],
  ['Can I speed up my recovery?', 'Optimizing sleep, protein intake, hydration, and therapy compliance can accelerate healing, but tissues still need sufficient time.'],
  ['When should I see a doctor?', 'Consult a clinician if pain worsens, swelling increases, symptoms plateau for 2+ weeks, or new neurological symptoms (numbness, tingling) appear.'],
  ['Do age and fitness really matter?', 'Yes. Younger, fitter individuals typically deliver more oxygen and nutrients to healing tissues, shortening timelines.'],
  ['Why does sleep quality matter?', 'Growth hormone release peaks during deep sleep and drives collagen synthesis. Aim for 7-9 hours nightly.'],
  ['What is the “acute phase”?', 'It is the first 30% of recovery where inflammation control, protection, and gentle mobility are prioritized.'],
  ['How often should I reassess progress?', 'Weekly check-ins with your therapist or self-assessments help confirm that ROM, strength, and pain markers are improving.'],
  ['Is swelling normal during recovery?', 'Mild swelling is common, but sudden increases may signal overuse. Use compression, elevation, and rest when needed.'],
  ['Can I exercise other body parts?', 'Usually yes, as long as movements do not stress the injured area. Cross-training maintains conditioning during rehab.'],
  ['What nutrients support healing?', 'Protein (1.6g/kg body weight), vitamin C, vitamin D, omega-3 fats, and zinc all aid connective tissue repair.'],
];

const relatedCalculators = [
  { title: 'Range of Motion Progress Calculator', href: '/health-fitness/range-of-motion-progress-calculator', description: 'Track joint mobility gains as you heal.' },
  { title: 'Physical Therapy Session Intensity Calculator', href: '/health-fitness/physical-therapy-session-intensity-calculator', description: 'Match rehab intensity with your recovery stage.' },
  { title: 'Strength to Weight Ratio Calculator', href: '/health-fitness/strength-to-weight-ratio-calculator', description: 'Assess readiness to progress back to sport.' },
  { title: 'Training Volume Calculator', href: '/health-fitness/training-volume-calculator', description: 'Plan gradual workload increases to avoid setbacks.' },
];

const completeGuideSections = [
  {
    title: 'Understanding Recovery Phases',
    bullets: [
      'Acute (0-30%): inflammation control, protection, pain management, gentle range of motion.',
      'Subacute (30-70%): tissue repair, neuromuscular re-education, progressive loading.',
      'Chronic (70-100%): remodeling, advanced strength, sport-specific drills.',
    ],
  },
  {
    title: 'Key Drivers of Healing',
    bullets: [
      'Adequate protein and micronutrients for collagen formation.',
      'Consistent physical therapy and adherence to restrictions.',
      'Quality sleep for hormone release and immune balance.',
      'Stress management to reduce cortisol-related delays.',
    ],
  },
  {
    title: 'When to Seek Medical Review',
    bullets: [
      'Pain increases instead of decreases after two weeks.',
      'Swelling, redness, or warmth worsens rapidly.',
      'Joint instability, locking, or giving way appears.',
      'You experience fever or signs of infection post-surgery.',
    ],
  },
];

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Control swelling and pain with RICE principles and prescribed medications.' },
  { week: 2, focus: 'Begin gentle mobility drills, diaphragmatic breathing, and isometric activation.' },
  { week: 3, focus: 'Increase range of motion exercises and introduce light resistance as tolerated.' },
  { week: 4, focus: 'Add balance drills, proprioceptive work, and cross-training for cardiovascular health.' },
  { week: 5, focus: 'Progress to compound movements, monitor gait mechanics, and reassess goals.' },
  { week: 6, focus: 'Introduce sport-specific or functional patterns at moderate intensity.' },
  { week: 7, focus: 'Advance loading, emphasize unilateral strength, and track fatigue markers.' },
  { week: 8, focus: 'Perform return-to-activity testing and finalize a maintenance/prevention plan.' },
];

const warningSigns = () => [
  'Pain that intensifies or changes character after initially improving.',
  'Loss of mobility or strength compared to the previous week.',
  'Increased swelling, redness, or warmth around the injury site.',
  'Night pain, numbness, or tingling that was not present before.',
];

const getInjuryRecoveryInterpretation = (recoveryTime: number, injuryType: string, severity: string) => {
  const baseRecoveryTimes = {
    sprain: { mild: 7, moderate: 21, severe: 42 },
    strain: { mild: 7, moderate: 21, severe: 42 },
    fracture: { mild: 28, moderate: 56, severe: 84 },
    tendonitis: { mild: 14, moderate: 42, severe: 84 },
    bursitis: { mild: 7, moderate: 21, severe: 42 },
    muscle_tear: { mild: 14, moderate: 42, severe: 84 },
    ligament_tear: { mild: 21, moderate: 56, severe: 112 },
    dislocation: { mild: 14, moderate: 28, severe: 56 },
    contusion: { mild: 7, moderate: 14, severe: 28 },
  };

  const expected = baseRecoveryTimes[injuryType as keyof typeof baseRecoveryTimes]?.[severity as keyof typeof baseRecoveryTimes['sprain']];
  const delta = recoveryTime - expected;

  if (delta < -7) {
    return {
      category: 'Ahead of Schedule',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      border: 'border-green-200',
      icon: CheckCircle,
      description: 'You are progressing faster than the average timeline for this injury.',
      recommendations: [
        'Keep following clinician guidance to avoid premature loading.',
        'Maintain balanced nutrition and hydration.',
        'Monitor for any signs of overconfidence-related setbacks.',
        'Plan a gradual return-to-activity test with your therapist.',
      ],
    };
  }

  if (delta < 7) {
    return {
      category: 'On Track',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      border: 'border-blue-200',
      icon: TrendingUp,
      description: 'Healing is progressing at the expected rate. Stay consistent.',
      recommendations: [
        'Continue prescribed therapy frequency and home exercise program.',
        'Update your provider on weekly wins or concerns.',
        'Introduce low-impact cardio if cleared.',
        'Track sleep, stress, and nutrition to maintain momentum.',
      ],
    };
  }

  if (delta < 21) {
    return {
      category: 'Slightly Delayed',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: Activity,
      description: 'Progress is slower than typical. Reassess recovery habits and loading.',
      recommendations: [
        'Review adherence with your therapist and adjust exercise volume.',
        'Address controllable lifestyle factors (sleep, nutrition, stress).',
        'Consider adjunct therapies such as manual therapy or blood-flow restriction.',
        'Schedule a follow-up assessment if the delay persists.',
      ],
    };
  }

  return {
    category: 'Significantly Delayed',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    border: 'border-red-200',
    icon: AlertTriangle,
    description: 'Healing is behind schedule. Engage your healthcare team for deeper evaluation.',
    recommendations: [
      'Book a medical review to rule out complications.',
      'Request imaging or differential diagnostics if symptoms warrant.',
      'Pause high-intensity rehab work until guided adjustments are made.',
      'Address pain, inflammation, or biomechanical issues immediately.',
    ],
  };
};

const calculateRecoveryTime = (data: FormValues) => {
  const baseRecoveryTimes = {
    sprain: { mild: 7, moderate: 21, severe: 42 },
    strain: { mild: 7, moderate: 21, severe: 42 },
    fracture: { mild: 28, moderate: 56, severe: 84 },
    tendonitis: { mild: 14, moderate: 42, severe: 84 },
    bursitis: { mild: 7, moderate: 21, severe: 42 },
    muscle_tear: { mild: 14, moderate: 42, severe: 84 },
    ligament_tear: { mild: 21, moderate: 56, severe: 112 },
    dislocation: { mild: 14, moderate: 28, severe: 56 },
    contusion: { mild: 7, moderate: 14, severe: 28 },
  };

  let timeline = baseRecoveryTimes[data.injuryType][data.severity];

  if (data.age > 65) timeline *= 1.3;
  else if (data.age > 50) timeline *= 1.15;
  else if (data.age < 18) timeline *= 0.85;

  const fitnessMultipliers = { poor: 1.2, average: 1, good: 0.9, excellent: 0.8 };
  timeline *= fitnessMultipliers[data.fitnessLevel];

  const previousInjuryMultipliers = { none: 1, same_area: 1.3, different_area: 1.1, multiple: 1.4 };
  timeline *= previousInjuryMultipliers[data.previousInjuries];

  const complianceMultipliers = { poor: 1.4, fair: 1.2, good: 1, excellent: 0.85 };
  timeline *= complianceMultipliers[data.treatmentCompliance];

  const lifestyleMultipliers = { poor: 1.2, average: 1, good: 0.9, excellent: 0.85 };
  timeline *= lifestyleMultipliers[data.nutrition];
  timeline *= lifestyleMultipliers[data.sleep];

  return Math.round(timeline);
};

export default function InjuryRecoveryTimelineCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      injuryType: undefined,
      severity: undefined,
      age: undefined,
      fitnessLevel: undefined,
      previousInjuries: undefined,
      treatmentCompliance: undefined,
      nutrition: undefined,
      sleep: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const recoveryTime = calculateRecoveryTime(values);
    const interpretation = getInjuryRecoveryInterpretation(recoveryTime, values.injuryType, values.severity);
    const phases: RecoveryPhases = {
      acute: { duration: Math.round(recoveryTime * 0.3), description: 'Inflammation control & protection' },
      subacute: { duration: Math.round(recoveryTime * 0.4), description: 'Tissue repair & progressive loading' },
      chronic: { duration: Math.round(recoveryTime * 0.3), description: 'Remodeling & return to activity' },
    };

    setResult({
      recoveryTime,
      interpretation,
      recommendations: interpretation.recommendations,
      warningSigns: warningSigns(),
      plan: plan(),
      phases,
    });
  };

  const resetCalculator = () => {
    form.reset();
    setResult(null);
  };

  const numberInputProps = (handler: (value: number | undefined) => void, value: number | undefined) => ({
    value: value ?? '',
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      const parsed = event.target.value === '' ? undefined : Number(event.target.value);
      handler(Number.isNaN(parsed as number) ? undefined : parsed);
    },
  });

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Injury Recovery Timeline Calculator
          </CardTitle>
          <CardDescription>Estimate evidence-based healing timelines and manage expectations through every rehab phase.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="injuryType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Injury Type</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select injury" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sprain">Sprain</SelectItem>
                          <SelectItem value="strain">Strain</SelectItem>
                          <SelectItem value="fracture">Fracture</SelectItem>
                          <SelectItem value="tendonitis">Tendonitis</SelectItem>
                          <SelectItem value="bursitis">Bursitis</SelectItem>
                          <SelectItem value="muscle_tear">Muscle Tear</SelectItem>
                          <SelectItem value="ligament_tear">Ligament Tear</SelectItem>
                          <SelectItem value="dislocation">Dislocation</SelectItem>
                          <SelectItem value="contusion">Contusion</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="severity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Severity</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select severity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="mild">Mild</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="severe">Severe</SelectItem>
                        </SelectContent>
                      </Select>
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
                        <Input type="number" min="1" {...numberInputProps(field.onChange, field.value)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fitnessLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fitness Level</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select fitness level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="poor">Poor</SelectItem>
                          <SelectItem value="average">Average</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="excellent">Excellent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="previousInjuries"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Previous Injuries</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select history" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="same_area">Same Area</SelectItem>
                          <SelectItem value="different_area">Different Area</SelectItem>
                          <SelectItem value="multiple">Multiple Sites</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="treatmentCompliance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Treatment Compliance</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select compliance" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="poor">Poor</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="excellent">Excellent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nutrition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nutrition Status</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="poor">Poor</SelectItem>
                          <SelectItem value="average">Average</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="excellent">Excellent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sleep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep Quality</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select sleep quality" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="poor">Poor</SelectItem>
                          <SelectItem value="average">Average</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="excellent">Excellent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="submit" className="w-full sm:flex-1 bg-gradient-to-r from-purple-600 to-indigo-600">
                  Calculate Recovery Time
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
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded border bg-white p-4 text-center">
                <p className="text-3xl font-bold text-primary">{result.recoveryTime}</p>
                <p className="text-sm text-muted-foreground">Estimated Recovery Days</p>
              </div>
              <div className="rounded border bg-white p-4 text-center">
                <p className="text-3xl font-bold text-primary">{result.phases.acute.duration}</p>
                <p className="text-sm text-muted-foreground">Acute Phase Days</p>
              </div>
              <div className="rounded border bg-white p-4 text-center">
                <p className="text-3xl font-bold text-primary">{result.phases.chronic.duration}</p>
                <p className="text-sm text-muted-foreground">Chronic Phase Days</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recovery Phase Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(result.phases).map(([key, value]) => (
                <div key={key}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-semibold capitalize">{key} phase</span>
                    <span>{value.duration} days · {value.description}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(100, (value.duration / result.recoveryTime) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Action Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {result.recommendations.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
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
                8‑Week Recovery Management Plan
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
          <CardDescription>Collect accurate data to generate realistic timelines.</CardDescription>
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
          <CardDescription>Build a complete rehab dashboard with these tools.</CardDescription>
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
          <CardTitle>Complete Guide: Navigating Injury Recovery</CardTitle>
          <CardDescription>Evidence-backed insights to interpret your timeline.</CardDescription>
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
          <CardDescription>SEO-focused answers for common rehab questions.</CardDescription>
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
