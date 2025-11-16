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
import { RotateCcw, TrendingUp, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  joint: z.enum(['shoulder', 'elbow', 'wrist', 'hip', 'knee', 'ankle', 'spine', 'neck']),
  initialROM: z.number().positive('Initial ROM must be positive'),
  currentROM: z.number().positive('Current ROM must be positive'),
  targetROM: z.number().positive('Target ROM must be positive'),
  timePeriod: z.number().positive('Time period must be positive'),
  injuryType: z.enum(['acute', 'chronic', 'post_surgical', 'overuse', 'none']),
  therapySessions: z.number().min(0, 'Therapy sessions cannot be negative'),
});

type FormValues = z.infer<typeof formSchema>;

const understandingInputs = [
  { label: 'Joint', description: 'Select the joint being measured so the calculator can compare against typical ROM standards.' },
  { label: 'Initial ROM', description: 'Starting measurement after injury or before rehab; use a goniometer or trusted tool.' },
  { label: 'Current ROM', description: 'Latest measurement taken with the same method for accuracy.' },
  { label: 'Target ROM', description: 'Desired end range, often the normal range for the selected joint.' },
  { label: 'Time Period', description: 'Days between initial and current measurements to gauge weekly progress.' },
  { label: 'Injury Type', description: 'Healing expectations vary based on acute, chronic, surgical, or overuse origins.' },
  { label: 'Therapy Sessions', description: 'Number of supervised sessions completed within the time period.' },
];

const faqs: [string, string][] = [
  ['How often should I measure ROM?', 'Weekly measurements provide enough data to spot trends without daily fluctuations confusing progress.'],
  ['What tool should I use?', 'A goniometer or digital inclinometer offers the best accuracy. Track with the same tool each session.'],
  ['How much progress is normal per week?', '0.5–5° per week is typical depending on injury severity, adherence, and tissue involved.'],
  ['Can ROM improve without pain?', 'Yes. Gentle stretching and mobility work should stay below 4/10 discomfort to avoid setbacks.'],
  ['Does swelling affect ROM?', 'Inflammation limits range. Use compression, elevation, and prescribed modalities to manage swelling.'],
  ['How do I know if I\'m plateauing?', 'If progress is less than 1° per week for two consecutive weeks, revisit your program with a therapist.'],
  ['Why track therapy sessions?', 'More supervised visits usually correlate with faster skill acquisition and homework adherence.'],
  ['Can I compare joints?', 'Yes, but remember dominant limbs may naturally have slightly different ranges.'],
  ['When should I stop increasing ROM?', 'Once you reach functional goals (e.g., overhead reach pain-free) and match normal ranges, maintain instead of chasing more.'],
  ['Do I need to warm up before measuring?', 'Always measure after light warm-up to avoid underestimating true capability.'],
];

const relatedCalculators = [
  { title: 'Injury Recovery Timeline Calculator', href: '/category/health-fitness/injury-recovery-timeline-calculator', description: 'Align ROM gains with expected tissue healing windows.' },
  { title: 'Physical Therapy Session Intensity Calculator', href: '/category/health-fitness/physical-therapy-session-intensity-calculator', description: 'Match session load with your current recovery stage.' },
  { title: 'Strength to Weight Ratio Calculator', href: '/category/health-fitness/strength-to-weight-ratio-calculator', description: 'Track strength improvements that support functional ROM.' },
  { title: 'Training Volume Calculator', href: '/category/health-fitness/training-volume-calculator', description: 'Balance total workload to avoid overtraining stiff joints.' },
];

const completeGuideSections = [
  {
    title: 'Normal ROM Benchmarks',
    bullets: [
      'Shoulder flexion: 180° · extension: 60°',
      'Elbow flexion: 150° · extension: 0°',
      'Hip flexion: 120° · extension: 30°',
      'Knee flexion: 135° · extension: 0°',
    ],
  },
  {
    title: 'Variables That Influence ROM',
    bullets: ['Scar tissue and adhesions', 'Joint capsule tightness', 'Neuromuscular control', 'Pain and muscle guarding'],
  },
  {
    title: 'Improvement Methods',
    bullets: ['Low-load long-duration stretching', 'Joint mobilizations', 'PNF (contract-relax) stretching', 'Consistent daily home exercise programs'],
  },
];

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Baseline measurements, pain management, and protected motion within tolerance.' },
  { week: 2, focus: 'Introduce active-assisted ROM and low-load, long-duration stretching.' },
  { week: 3, focus: 'Add light resistance bands to reinforce new range.' },
  { week: 4, focus: 'Incorporate closed-chain mobility and proprioception drills.' },
  { week: 5, focus: 'Increase stretching frequency, layer eccentric control exercises.' },
  { week: 6, focus: 'Begin functional patterns that mimic daily tasks or sport positions.' },
  { week: 7, focus: 'Progress to end-range isometrics and faster tempo movements.' },
  { week: 8, focus: 'Reassess goals, maintain gains, and transition to a prevention routine.' },
];

const warningSigns = () => [
  'ROM regresses for two consecutive measurements despite adherence.',
  'Swelling, redness, or warmth increases after stretching sessions.',
  'Sharp pain, catching, or locking occurs near end range.',
  'Night pain or neurological symptoms (numbness/tingling) develop.',
];

const getJointInfo = (joint: string) => {
  const jointData = {
    shoulder: { name: 'Shoulder', normalROM: 180, unit: 'degrees' },
    elbow: { name: 'Elbow', normalROM: 150, unit: 'degrees' },
    wrist: { name: 'Wrist', normalROM: 80, unit: 'degrees' },
    hip: { name: 'Hip', normalROM: 120, unit: 'degrees' },
    knee: { name: 'Knee', normalROM: 135, unit: 'degrees' },
    ankle: { name: 'Ankle', normalROM: 50, unit: 'degrees' },
    spine: { name: 'Spine', normalROM: 60, unit: 'degrees' },
    neck: { name: 'Neck', normalROM: 45, unit: 'degrees' },
  };
  return jointData[joint as keyof typeof jointData];
};

const getProgressInterpretation = (progressPercentage: number, timePeriod: number) => {
  const weeklyProgress = progressPercentage / (timePeriod / 7);

  if (weeklyProgress > 5) {
    return {
      category: 'Excellent Progress',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      border: 'border-green-200',
      icon: CheckCircle,
      description: 'You are recovering faster than expected. Maintain your current routines with caution.',
      recommendations: [
        'Keep the same stretching frequency and monitor for irritation.',
        'Add light strengthening at new end ranges.',
        'Include active recovery days to protect gains.',
        'Schedule reassessment with your therapist to update goals.',
      ],
    };
  }

  if (weeklyProgress > 2) {
    return {
      category: 'On Track',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      border: 'border-blue-200',
      icon: TrendingUp,
      description: 'Your ROM is improving at a sustainable rate. Stay consistent.',
      recommendations: [
        'Maintain therapy frequency and home exercise.',
        'Document pain, stiffness, and fatigue each week.',
        'Introduce light functional drills as tolerated.',
        'Re-test at the same time of day for accuracy.',
      ],
    };
  }

  if (weeklyProgress > 0) {
    return {
      category: 'Slow Progress',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: TrendingUp,
      description: 'ROM is improving slowly. Review mobility dosage and recovery habits.',
      recommendations: [
        'Increase stretching duration or frequency slightly.',
        'Address swelling and pain before attempting end range.',
        'Ensure you are measuring accurately and consistently.',
        'Discuss adjunct therapies (manual therapy, heat) with your provider.',
      ],
    };
  }

  return {
    category: 'No Progress',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    border: 'border-red-200',
    icon: AlertTriangle,
    description: 'No measurable gains yet. Adjust your plan and consult your therapist promptly.',
    recommendations: [
      'Pause aggressive stretching and focus on pain modulation.',
      'Seek imaging or further evaluation if stiffness persists.',
      'Check for compensations or poor measurement technique.',
      'Emphasize consistent daily movement rather than intensity.',
    ],
  };
};

const calculateRecoveryTimeline = (currentROM: number, targetROM: number, weeklyProgress: number) => {
  if (weeklyProgress <= 0) return null;

  const remainingROM = targetROM - currentROM;
  const weeksToTarget = remainingROM / weeklyProgress;

  return {
    weeksToTarget: Math.ceil(weeksToTarget),
    monthsToTarget: Math.ceil(weeksToTarget / 4),
    progressRate: weeklyProgress,
  };
};

type ResultPayload = {
  progressPercentage: number;
  weeklyProgress: number;
  interpretation: ReturnType<typeof getProgressInterpretation>;
  recoveryTimeline: ReturnType<typeof calculateRecoveryTimeline>;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
};

export default function RangeOfMotionProgressCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      joint: undefined,
      initialROM: undefined,
      currentROM: undefined,
      targetROM: undefined,
      timePeriod: undefined,
      injuryType: undefined,
      therapySessions: undefined,
    },
  });

  const onSubmit = (data: FormValues) => {
    const progressPercentage = ((data.currentROM - data.initialROM) / (data.targetROM - data.initialROM)) * 100;
    const weeklyProgress = (data.currentROM - data.initialROM) / (data.timePeriod / 7);
    const interpretation = getProgressInterpretation(progressPercentage, data.timePeriod);
    const recoveryTimeline = calculateRecoveryTimeline(data.currentROM, data.targetROM, weeklyProgress);

    setResult({
      progressPercentage,
      weeklyProgress,
      interpretation,
      recoveryTimeline,
      recommendations: interpretation.recommendations,
      warningSigns: warningSigns(),
      plan: plan(),
    });
  };

  const resetCalculator = () => {
    form.reset();
    setResult(null);
  };

  const numberInputProps = (handler: (value: number | undefined) => void, value: number | undefined, step = '0.1') => ({
    value: value ?? '',
    step,
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      const parsed = event.target.value === '' ? undefined : Number(event.target.value);
      handler(Number.isNaN(parsed as number) ? undefined : parsed);
    },
  });

  const selectedJoint = form.watch('joint') ?? 'shoulder';
  const jointInfo = getJointInfo(selectedJoint);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-primary" />
            Range of Motion Progress Calculator
          </CardTitle>
          <CardDescription>Track mobility gains, forecast time to target range, and customize your rehab action plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="joint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Joint</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select joint" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {['shoulder', 'elbow', 'wrist', 'hip', 'knee', 'ankle', 'spine', 'neck'].map((joint) => (
                            <SelectItem key={joint} value={joint}>
                              {joint.charAt(0).toUpperCase() + joint.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="injuryType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Injury Type</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select injury type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No Injury</SelectItem>
                          <SelectItem value="acute">Acute Injury</SelectItem>
                          <SelectItem value="chronic">Chronic Condition</SelectItem>
                          <SelectItem value="post_surgical">Post-surgical</SelectItem>
                          <SelectItem value="overuse">Overuse Injury</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="initialROM"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial ROM ({jointInfo.unit})</FormLabel>
                      <FormControl>
                        <Input type="number" {...numberInputProps(field.onChange, field.value)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentROM"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current ROM ({jointInfo.unit})</FormLabel>
                      <FormControl>
                        <Input type="number" {...numberInputProps(field.onChange, field.value)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetROM"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target ROM ({jointInfo.unit})</FormLabel>
                      <FormControl>
                        <Input type="number" {...numberInputProps(field.onChange, field.value)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timePeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Period (days)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" {...numberInputProps(field.onChange, field.value, '1')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="therapySessions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Therapy Sessions Completed</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" {...numberInputProps(field.onChange, field.value, '1')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="submit" className="w-full sm:flex-1 bg-gradient-to-r from-purple-600 to-pink-600">
                  Calculate Progress
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
                <p className="text-2xl font-bold text-primary">{result.progressPercentage.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Progress to Target</p>
              </div>
              <div className="rounded border bg-white p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{result.weeklyProgress.toFixed(1)}°</p>
                <p className="text-sm text-muted-foreground">Weekly Progress</p>
              </div>
              <div className="rounded border bg-white p-4 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {result.recoveryTimeline ? `${result.recoveryTimeline.weeksToTarget}` : 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground">Weeks to Target</p>
              </div>
            </CardContent>
          </Card>

          {result.recoveryTimeline && (
            <Card>
              <CardHeader>
                <CardTitle>Recovery Timeline</CardTitle>
                <CardDescription>Estimated time to reach your target ROM based on current progress rate.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded border bg-blue-50 p-4 text-center">
                  <p className="text-xl font-bold text-blue-600">{result.recoveryTimeline.weeksToTarget}</p>
                  <p className="text-sm text-muted-foreground">Weeks to Target ROM</p>
                </div>
                <div className="rounded border bg-green-50 p-4 text-center">
                  <p className="text-xl font-bold text-green-600">{result.recoveryTimeline.monthsToTarget}</p>
                  <p className="text-sm text-muted-foreground">Months to Target ROM</p>
                </div>
                <div className="col-span-2 rounded border bg-purple-50 p-4 text-center">
                  <p className="text-lg font-semibold text-purple-600">{result.recoveryTimeline.progressRate.toFixed(1)}° per week</p>
                  <p className="text-sm text-muted-foreground">Current Progress Rate</p>
                </div>
              </CardContent>
            </Card>
          )}

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
                8‑Week ROM Improvement Plan
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
          <CardDescription>Why each measurement matters for accurate progress tracking.</CardDescription>
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
          <CardTitle>Complete Guide: Understanding Range of Motion Progress</CardTitle>
          <CardDescription>Evidence-based insights to interpret your results and optimize recovery.</CardDescription>
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
          <CardDescription>SEO-ready answers to common ROM tracking concerns.</CardDescription>
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

