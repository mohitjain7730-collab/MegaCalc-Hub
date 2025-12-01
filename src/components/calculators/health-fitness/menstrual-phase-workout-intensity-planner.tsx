'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dumbbell, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  cycleDay: z.number({ invalid_type_error: 'Enter cycle day' }).min(1).max(35),
  phase: z.enum(['menstrual', 'follicular', 'ovulation', 'luteal']),
  energyLevel: z.number({ invalid_type_error: 'Enter energy level' }).min(1).max(10),
  painLevel: z.number({ invalid_type_error: 'Enter pain level' }).min(0).max(10),
  fitnessGoal: z.enum(['strength', 'endurance', 'flexibility', 'general']),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  recommendedIntensity: number;
  workoutType: string;
  durationMinutes: number;
  status: 'high-intensity' | 'moderate-intensity' | 'low-intensity' | 'rest';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your current cycle day (day 1 = first day of period).',
  'Select your current phase: menstrual (days 1-5), follicular (days 6-13), ovulation (days 14-16), or luteal (days 17-28+).',
  'Rate your current energy level (1 = very low, 10 = very high).',
  'Rate any pain or discomfort (0 = none, 10 = severe).',
  'Choose your fitness goal: strength, endurance, flexibility, or general fitness.',
  'Review recommended workout intensity, type, duration, and phase-specific guidance.',
];

const faqs = [
  {
    question: 'How does the menstrual cycle affect workouts?',
    answer:
      'Hormone levels fluctuate throughout the cycle, affecting energy, strength, and recovery. Menstrual phase typically has lower energy; follicular and ovulation phases often have higher energy and strength.',
  },
  {
    question: 'Can I exercise during my period?',
    answer:
      'Yes. Light to moderate exercise can help reduce cramps and improve mood. Avoid high-intensity workouts if you have severe pain or heavy bleeding.',
  },
  {
    question: 'When is the best time to exercise?',
    answer:
      'Follicular phase (days 6-13) and ovulation (days 14-16) often have the highest energy and strength. Luteal phase (days 17-28+) may require lighter intensity.',
  },
  {
    question: 'Should I skip workouts during my period?',
    answer:
      'Not necessarily. Light movement (walking, yoga, stretching) can be beneficial. Skip intense workouts only if you have severe pain or feel unwell.',
  },
  {
    question: 'How does energy change during the cycle?',
    answer:
      'Energy is typically lowest during menstrual phase (days 1-5) and early luteal. It increases during follicular phase and peaks around ovulation.',
  },
  {
    question: 'Can I do strength training during my period?',
    answer:
      'Yes, but intensity should match your energy and pain levels. Some women feel stronger during follicular/ovulation phases and weaker during menstrual/luteal phases.',
  },
  {
    question: 'What about endurance training?',
    answer:
      'Endurance capacity may be slightly lower during menstrual phase but can be higher during follicular and ovulation phases. Adjust intensity based on how you feel.',
  },
  {
    question: 'Does exercise help with PMS?',
    answer:
      'Yes. Regular exercise, especially during luteal phase, can help reduce PMS symptoms like mood swings, bloating, and fatigue.',
  },
  {
    question: 'How do I adjust workouts for pain?',
    answer:
      'If pain is moderate to severe (6+), opt for rest or very light activity (walking, gentle stretching). Low pain (0-3) allows for normal workouts adjusted for energy.',
  },
  {
    question: 'Can I maintain my routine throughout the cycle?',
    answer:
      'Yes, but adjusting intensity and type based on phase and how you feel can optimize performance and reduce injury risk. Listen to your body.',
  },
];

const relatedCalculators = [
  {
    name: 'Follicular vs Luteal Phase Nutrition Planner Calculator',
    slug: 'follicular-vs-luteal-phase-nutrition-planner-calculator',
    description: 'Coordinate nutrition with workout intensity by cycle phase.',
  },
  {
    name: 'Exercise Recovery Score (HRV + Sleep Integration)',
    slug: 'exercise-recovery-score-hrv-sleep-integration',
    description: 'Track recovery to optimize workout timing and intensity.',
  },
  {
    name: 'Sleep Quality vs Productivity Correlation Calculator',
    slug: 'sleep-quality-vs-productivity-correlation-calculator',
    description: 'Improve sleep to support workout performance and recovery.',
  },
  {
    name: 'Stress Hormone Balance Calculator',
    slug: 'stress-hormone-balance-calculator',
    description: 'Monitor stress and hormones that affect workout capacity.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/menstrual-phase-workout-intensity-planner';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Menstrual Phase Workout Intensity Planner', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Menstrual Phase Workout Intensity Planner',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Plan workout intensity and type based on menstrual cycle phase, energy level, and pain to optimize performance.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  // Phase-based intensity adjustments
  const phaseIntensities: Record<string, number> = {
    'menstrual': 3, // Lower intensity
    'follicular': 7, // Higher intensity
    'ovulation': 8, // Highest intensity
    'luteal': 5, // Moderate intensity
  };
  const baseIntensity = phaseIntensities[values.phase] || 5;
  
  // Energy adjustment (-2 to +2)
  const energyAdjustment = (values.energyLevel - 5.5) * 0.4;
  
  // Pain penalty (-3 to 0)
  const painPenalty = -Math.min(values.painLevel * 0.3, 3);
  
  const recommendedIntensity = clamp(baseIntensity + energyAdjustment + painPenalty, 1, 10);
  
  // Workout type based on phase and goal
  let workoutType = 'General fitness';
  if (values.fitnessGoal === 'strength' && recommendedIntensity >= 6) {
    workoutType = 'Strength training (moderate to high intensity)';
  } else if (values.fitnessGoal === 'strength' && recommendedIntensity < 6) {
    workoutType = 'Light strength or bodyweight exercises';
  } else if (values.fitnessGoal === 'endurance' && recommendedIntensity >= 6) {
    workoutType = 'Cardio/endurance training (moderate to high intensity)';
  } else if (values.fitnessGoal === 'endurance' && recommendedIntensity < 6) {
    workoutType = 'Light cardio or walking';
  } else if (values.fitnessGoal === 'flexibility') {
    workoutType = 'Yoga, stretching, or mobility work';
  } else if (recommendedIntensity < 4) {
    workoutType = 'Rest, gentle movement, or light stretching';
  }
  
  // Duration based on intensity
  const durationMinutes = recommendedIntensity >= 7 ? 60 : recommendedIntensity >= 5 ? 45 : recommendedIntensity >= 3 ? 30 : 20;
  
  let status: ResultPayload['status'] = 'moderate-intensity';
  let interpretation =
    'This combination of inputs points toward a moderate workout option today, but your own comfort and cues always come first.';
  
  if (recommendedIntensity >= 7) {
    status = 'high-intensity';
    interpretation =
      'Your entries suggest today might suit a higher‑energy session, if that feels good in your body. It is also okay to scale back if it does not.';
  } else if (recommendedIntensity >= 4) {
    status = 'moderate-intensity';
    interpretation =
      'A moderate session could be a reasonable middle ground today, offering some challenge while leaving space for recovery.';
  } else if (recommendedIntensity >= 2) {
    status = 'low-intensity';
    interpretation =
      'A lighter‑intensity day may feel more supportive right now, focusing on gentle movement and recovery rather than pushing hard.';
  } else {
    status = 'rest';
    interpretation =
      'Today could be a good candidate for rest or very gentle movement, if that aligns with how you actually feel and what your life allows.';
  }

  const recommendations = [
    values.phase === 'menstrual'
      ? 'During menstrual days, many people find that light movement (walking, yoga, stretching) feels kinder on the body and can sometimes ease cramps and mood.'
      : values.phase === 'follicular' || values.phase === 'ovulation'
      ? 'Follicular and ovulation phases often come with more natural energy; if that fits your experience, you can explore somewhat higher‑intensity sessions here.'
      : 'In the luteal phase, some people prefer to soften intensity or build in more recovery—listening to your own signals is more important than following a fixed plan.',
    values.painLevel >= 6
      ? 'If pain feels high, it may be kinder to favor rest or only very light movement until things ease.'
      : 'If pain feels low and manageable, you can try today’s suggestion but always pause or stop if discomfort grows.',
    'Noticing how different kinds of movement feel in each phase over time can help you design a routine that truly fits you.',
  ];
  
  if (status === 'rest') {
    recommendations.push('On days that lean toward rest, you might lean into non-exercise supports like extra sleep, nourishing food, or calming time if possible.');
  }

  const plan = [
    { label: 'Today', detail: `Use this suggestion as a starting idea: ${workoutType} for around ${durationMinutes} minutes, then freely shorten, lengthen, or swap based on how you feel.` },
    { label: 'This Week', detail: 'Gently notice how your energy, pain, and mood shift across the week and let that inform when you go harder or softer.' },
    { label: 'Ongoing', detail: 'Over time, shape a cycle-aware movement routine that feels sustainable, kind, and genuinely helpful for you.' },
  ];

  return { recommendedIntensity, workoutType, durationMinutes, status, interpretation, recommendations, plan };
};

export default function MenstrualPhaseWorkoutIntensityPlanner() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cycleDay: undefined,
      phase: 'menstrual',
      energyLevel: undefined,
      painLevel: undefined,
      fitnessGoal: 'general',
    },
  });

  return (
    <div className="space-y-8">
      <Script id="menstrual-workout-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            Menstrual Phase Workout Intensity Planner
          </CardTitle>
          <CardDescription>Plan workout intensity and type based on menstrual cycle phase, energy level, and pain to optimize performance.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your cycle and energy data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cycleDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cycle day</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phase</FormLabel>
                      <FormControl>
                        <select
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value as FormValues['phase'])}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                          <option value="menstrual">Menstrual (days 1-5)</option>
                          <option value="follicular">Follicular (days 6-13)</option>
                          <option value="ovulation">Ovulation (days 14-16)</option>
                          <option value="luteal">Luteal (days 17-28+)</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="energyLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Energy level (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="painLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pain level (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 2" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fitnessGoal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fitness goal</FormLabel>
                      <FormControl>
                        <select
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value as FormValues['fitnessGoal'])}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                          <option value="strength">Strength</option>
                          <option value="endurance">Endurance</option>
                          <option value="flexibility">Flexibility</option>
                          <option value="general">General fitness</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate workout plan
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
            <CardDescription>See recommended workout intensity, type, duration, and phase-specific guidance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recommended intensity</p>
                <p className="text-2xl font-semibold text-primary">{result.recommendedIntensity.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">A 1–10 suggestion from this model—your own comfort is more important.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Workout type</p>
                <p className="text-lg font-semibold text-primary">{result.workoutType}</p>
                <p className="text-xs text-muted-foreground">Recommended</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-2xl font-semibold text-primary">{result.durationMinutes} min</p>
                <p className="text-xs text-muted-foreground">Recommended</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status.replace('-', ' ')}</p>
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
          <p><strong>Base intensity</strong> by phase: Menstrual 3, Follicular 7, Ovulation 8, Luteal 5 (out of 10).</p>
          <p><strong>Recommended intensity</strong> = base intensity + energy adjustment ((energy − 5.5) × 0.4) − pain penalty (pain × 0.3), clamped to 1-10.</p>
          <p><strong>Duration</strong>: High intensity (≥7) = 60 min, Moderate (5-6) = 45 min, Low (3-4) = 30 min, Rest (&lt;3) = 20 min.</p>
          <p>Follicular and ovulation phases typically support higher intensity; menstrual and luteal phases may require lighter workouts.</p>
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
                <p className="text-sm text-muted-foreground">Phase support</p>
                <p className="text-xl font-semibold text-primary">
                  {form.getValues().phase === 'ovulation' || form.getValues().phase === 'follicular' ? 'High' : form.getValues().phase === 'luteal' ? 'Moderate' : 'Low'}
                </p>
                <p className="text-xs text-muted-foreground">For workout intensity</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Energy adequacy</p>
                <p className="text-xl font-semibold text-primary">
                  {(form.getValues().energyLevel ?? 0) >= 7 ? 'Good' : (form.getValues().energyLevel ?? 0) >= 5 ? 'Moderate' : 'Low'}
                </p>
                <p className="text-xs text-muted-foreground">For recommended intensity</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Pain impact</p>
                <p className="text-xl font-semibold text-primary">
                  {(form.getValues().painLevel ?? 0) >= 6 ? 'High' : (form.getValues().painLevel ?? 0) >= 3 ? 'Moderate' : 'Low'}
                </p>
                <p className="text-xs text-muted-foreground">May require rest if high</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your cycle and energy data to see additional insights.</p>
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
          <p>Workout performance varies throughout the menstrual cycle due to hormonal fluctuations. Follicular and ovulation phases often support higher intensity, while menstrual and luteal phases may require lighter workouts.</p>
          <p>Use this calculator to plan workout intensity and type based on cycle phase, energy level, pain, and fitness goals to optimize performance and recovery.</p>
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
          <p>This tool suggests a workout intensity, type, and rough duration based on your cycle phase, energy, pain level, and goals in this simple model.</p>
          <p>Treat the outputs as flexible ideas—not rules—and adapt them to what feels safe and supportive for your body, ideally alongside any guidance from your care team.</p>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        Disclaimer: This tool provides general wellness and lifestyle insights only. It is not a medical or training
        prescription. For pain, injury, or specific health conditions, please consult a qualified professional before
        changing your exercise routine.
      </p>
    </div>
  );
}

