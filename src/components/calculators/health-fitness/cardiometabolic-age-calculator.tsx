'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Zap, Heart, Calendar, Scale, Ruler, Gauge, Droplet } from 'lucide-react';

// Wellness‑style input: no lab values or diagnoses, just routines and feelings
const formSchema = z.object({
  age: z.number().min(18).max(120).optional(),
  gender: z.enum(['male', 'female']).optional(),
  weight: z.number().positive().optional(),
  height: z.number().positive().optional(),
  unit: z.enum(['metric', 'imperial']).optional(),
  weeklyMovementDays: z.number().min(0).max(7).optional(),
  vigorousMinutesPerWeek: z.number().min(0).max(600).optional(),
  sittingHoursPerDay: z.number().min(0).max(16).optional(),
  fruitVegServingsPerDay: z.number().min(0).max(12).optional(),
  sugaryDrinksPerWeek: z.number().min(0).max(40).optional(),
  sleepHoursPerNight: z.number().min(0).max(16).optional(),
  perceivedEnergy: z.number().min(1).max(10).optional(),
  stressBalance: z.number().min(1).max(10).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  reflectionPrompts: string[];
  plan: { week: number; focus: string }[];
  wellnessIndex: number;
  chronologicalAge: number;
  movementIndex: number;
  ageFeelingDifference: number;
  patternLabel: string;
  metabolicAge: number;
  ageDifference: number;
  bmi: number;
  riskStatus: string;
  warningSigns: string[];
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Notice your current routines: movement, meals, sitting time, sleep, and daily energy.' },
  { week: 2, focus: 'Add one extra movement block (walk, stretch, light exercise) on 1–2 days.' },
  { week: 3, focus: 'Include one more fruit or vegetable serving on most days.' },
  { week: 4, focus: 'Experiment with a steadier sleep and wake time that feels realistic.' },
  { week: 5, focus: 'Add a short strength or body‑weight routine 1–2 times per week if it feels comfortable.' },
  { week: 6, focus: 'Create small breaks in longer sitting periods with standing or walking.' },
  { week: 7, focus: 'Add one brief stress‑relief ritual (breathing, journaling, or similar) most days.' },
  { week: 8, focus: 'Reflect on which new habits felt most supportive and keep the ones that fit your life.' },
];

const faqs: [string, string][] = [
  [
    'What is the goal of this cardiometabolic wellness check‑in?',
    'This tool invites you to reflect on how your current movement, eating, sitting, sleep, and stress‑balance habits line up with how you would like to feel over time. It is a personal wellness snapshot, not a medical age or diagnosis.',
  ],
  [
    'What does the wellness index actually represent?',
    'The index is a simple score that combines your answers about activity, sitting time, food patterns, sleep, and how your body feels. Higher scores usually mean your routines align more closely with commonly suggested heart‑supportive habits.',
  ],
  [
    'Can this calculator tell me my disease risk or “true” metabolic age?',
    'No. It cannot predict, diagnose, or rule out any condition. Only a qualified health professional, using appropriate tests and your full medical history, can evaluate health risks.',
  ],
  [
    'How can I use these results in a helpful way?',
    'You might pick one or two gentle ideas from the suggestions section and try them for a few weeks. Notice how your energy, mood, and everyday life feel, and keep what actually supports you.',
  ],
  [
    'How often should I revisit this tool?',
    'Some people like to check in monthly or after a routine change. Others use it once to brainstorm ideas. You can return whenever you want a structured reflection on your habits.',
  ],
  [
    'What if I feel worried about my heart or metabolic health?',
    'If you ever feel concerned about chest discomfort, breathlessness, unusual fatigue, or any health issue, please consult a qualified professional promptly. This tool cannot assess or treat medical problems.',
  ],
];

const understandingInputs = [
  { label: 'Age (years)', description: 'Your current age in years, which the tool uses only as a reference point.' },
  {
    label: 'Movement & activity',
    description: 'How often you are on your feet or moving in ways that feel good to you during the week.',
  },
  {
    label: 'Sitting time',
    description: 'Roughly how many hours you spend mostly sitting each day, which the calculator uses to suggest breaks.',
  },
  {
    label: 'Food pattern',
    description: 'How often your days include fruits, vegetables, and other foods that tend to be part of heart‑supportive eating patterns.',
  },
  {
    label: 'Sleep and energy',
    description: 'Your sense of how much you are sleeping and how your energy feels on a typical day.',
  },
  {
    label: 'Stress balance',
    description: 'How balanced or overwhelmed your days feel right now, which can influence how sustainable habits feel.',
  },
];

const calculateCardiometabolicWellness = (values: FormValues) => {
  if (!values.age || !values.weight || !values.height || !values.unit) return null;

  // BMI as a neutral context number only
  let bmi;
  if (values.unit === 'metric') {
    bmi = values.weight / (values.height / 100) ** 2;
  } else {
    bmi = (values.weight / values.height ** 2) * 703;
  }

  let index = 50;

  const movementDays = values.weeklyMovementDays ?? 0;
  const vigorousMinutes = values.vigorousMinutesPerWeek ?? 0;
  const sitting = values.sittingHoursPerDay ?? 0;
  const fruitVeg = values.fruitVegServingsPerDay ?? 0;
  const sugaryDrinks = values.sugaryDrinksPerWeek ?? 0;
  const sleep = values.sleepHoursPerNight ?? 0;
  const energy = values.perceivedEnergy ?? 5;
  const stress = values.stressBalance ?? 5;

  index += Math.min(movementDays * 3, 15);
  index += Math.min(vigorousMinutes / 30, 10);
  index -= Math.max(0, sitting - 4) * 2;
  index += Math.min(fruitVeg * 2, 12);
  index -= Math.min(sugaryDrinks, 10);

  if (sleep >= 7 && sleep <= 9) index += 8;
  else if (sleep >= 6 && sleep < 7) index += 4;
  else if (sleep < 6) index -= 6;

  index += (energy - 5) * 2;
  index += (stress - 5) * -1.5;

  const wellnessIndex = Math.max(0, Math.min(100, Math.round(index)));

  let patternLabel = 'Mixed cardiometabolic‑supportive habits';
  if (wellnessIndex >= 75) patternLabel = 'Strong cardiometabolic‑supportive routine';
  else if (wellnessIndex < 50) patternLabel = 'Plenty of room to gently support heart‑health habits';

  const ageFeelingDifference = wellnessIndex >= 75 ? -3 : wellnessIndex <= 40 ? 3 : 0;

  return {
    wellnessIndex,
    movementIndex: Math.max(0, Math.min(100, Math.round((movementDays / 7) * 100))),
    patternLabel,
    ageFeelingDifference,
    bmi: Math.round(bmi * 10) / 10,
  };
};

const interpret = (patternLabel: string) => {
  if (patternLabel === 'Strong cardiometabolic‑supportive routine') {
    return 'Your answers suggest many of your routines are already aligned with heart‑supportive habits like regular movement, nourishing meals, and steady sleep.';
  }
  if (patternLabel === 'Plenty of room to gently support heart‑health habits') {
    return 'This snapshot simply shows that there is space to experiment with small, realistic changes that might support your long‑term energy and heart health.';
  }
  return 'You appear to have a mix of supportive habits and areas you may want to focus on. Even one or two gentle changes can be meaningful over time.';
};

const recommendations = (wellnessIndex: number) => {
  const ideas: string[] = [
    'Look for one or two short movement windows you can realistically add or keep most days.',
    'Include colourful fruits or vegetables with at least one main meal whenever it feels feasible.',
    'Experiment with a regular wind‑down routine and sleep window that feels sustainable for your life.',
  ];

  if (wellnessIndex < 50) {
    ideas.push(
      'If your days feel very full, start with the tiniest change that feels achievable—for example, a 5‑minute walk or one extra glass of water.'
    );
  } else if (wellnessIndex >= 75) {
    ideas.push('Notice which habits feel most supportive so you can prioritise them when life gets busy.');
  }

  return ideas;
};

const reflectionPrompts = () => [
  'Which small change from the suggestions feels the most realistic and kind to try first?',
  'What times of day do you feel most energised, and how might you gently protect that time?',
  'Are there any routines you already enjoy that you could do slightly more often rather than adding something brand‑new?',
];

export default function CardiometabolicAgeCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      gender: undefined,
      weight: undefined,
      height: undefined,
      unit: 'metric',
      weeklyMovementDays: undefined,
      vigorousMinutesPerWeek: undefined,
      sittingHoursPerDay: undefined,
      fruitVegServingsPerDay: undefined,
      sugaryDrinksPerWeek: undefined,
      sleepHoursPerNight: undefined,
      perceivedEnergy: undefined,
      stressBalance: undefined,
    },
  });

  const unit = form.watch('unit');

  const onSubmit = (values: FormValues) => {
    const calc = calculateCardiometabolicWellness(values);
    if (!calc || !values.age) {
      setResult(null);
      return;
    }

    const interpretationText = interpret(calc.patternLabel);

    const metabolicAge = values.age + calc.ageFeelingDifference;
    const ageDifference = calc.ageFeelingDifference;
    const riskStatus = calc.wellnessIndex >= 75 ? 'Low Risk' : calc.wellnessIndex >= 50 ? 'Moderate Risk' : 'Higher Risk';
    const warningSignsList = calc.wellnessIndex < 50 ? [
      'Consider increasing physical activity gradually',
      'Focus on improving sleep quality',
      'Reduce sedentary time when possible',
    ] : [];
    
    setResult({
      status: 'Calculated',
      interpretation: interpretationText,
      recommendations: recommendations(calc.wellnessIndex),
      reflectionPrompts: reflectionPrompts(),
      plan: plan(),
      chronologicalAge: values.age,
      wellnessIndex: calc.wellnessIndex,
      movementIndex: calc.movementIndex,
      ageFeelingDifference: calc.ageFeelingDifference,
      patternLabel: calc.patternLabel,
      metabolicAge,
      ageDifference,
      bmi: calc.bmi,
      riskStatus,
      warningSigns: warningSignsList,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" /> Cardiometabolic Wellness Age Check‑In
          </CardTitle>
          <CardDescription>
            Reflect on everyday habits that can gently support your heart, movement, and long‑term energy. This is a personal
            wellness insight, not a medical age or diagnosis.
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
                      <Input type="number" step="1" placeholder="e.g., 45" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Body context</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="unit" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Units</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                          <SelectItem value="imperial">Imperial (lbs, in)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="weight" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Scale className="h-4 w-4" /> Weight ({unit === 'metric' ? 'kg' : 'lbs'})</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 70" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="height" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Ruler className="h-4 w-4" /> Height ({unit === 'metric' ? 'cm' : 'in'})</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 175" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <p className="text-xs text-muted-foreground">
                  These numbers are only used to provide context (like BMI); they are not interpreted as a diagnosis.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Movement & sitting</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="weeklyMovementDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Days per week you do intentional movement</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="1"
                            placeholder="e.g., 3"
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vigorousMinutesPerWeek"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minutes per week of more lively activity (optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="10"
                            placeholder="e.g., 60"
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sittingHoursPerDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Approximate hours per day mostly sitting</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.5"
                            placeholder="e.g., 8"
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Food, sleep, and how you feel</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fruitVegServingsPerDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fruit/vegetable servings on most days</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="1"
                            placeholder="e.g., 3"
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sugaryDrinksPerWeek"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sweetened drinks per week (if any)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="1"
                            placeholder="e.g., 4"
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sleepHoursPerNight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Average hours of sleep per night</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.5"
                            placeholder="e.g., 7.5"
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="perceivedEnergy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How is your energy on a typical day? (1–10)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={10}
                            step="1"
                            placeholder="e.g., 6"
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="stressBalance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How balanced or stressed do your days feel? (1–10)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={10}
                            step="1"
                            placeholder="e.g., 5"
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full md:w-auto">
                See my cardiometabolic wellness insight
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Zap className="h-8 w-8 text-primary" /><CardTitle>Cardiometabolic Age Summary</CardTitle></div>
              <CardDescription>Metabolic age vs. chronological age comparison</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Chronological Age</h4><p className="text-2xl font-bold text-primary">{result.chronologicalAge}</p></div>
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Metabolic Age</h4><p className="text-2xl font-bold text-primary">{result.metabolicAge}</p></div>
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Age Difference</h4><p className="text-2xl font-bold text-primary">{result.ageDifference > 0 ? '+' : ''}{result.ageDifference}</p></div>
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">BMI</h4><p className="text-2xl font-bold text-primary">{result.bmi}</p></div>
              </div>
              <div className="p-4 border rounded">
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">Risk Status</h4>
                <p className="text-lg font-bold text-primary">{result.riskStatus}</p>
              </div>
              <p className="text-sm text-muted-foreground">{result.interpretation}</p>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Recommendations</CardTitle></CardHeader>
              <CardContent><ul className="space-y-2">{result.recommendations.map((r,i)=>(<li key={i} className="text-sm text-muted-foreground">{r}</li>))}</ul></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Warning Signs</CardTitle></CardHeader>
              <CardContent><ul className="space-y-2">{result.warningSigns.map((w,i)=>(<li key={i} className="text-sm text-muted-foreground">{w}</li>))}</ul></CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Metabolic Health Plan</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b"><th className="text-left p-2">Week</th><th className="text-left p-2">Focus</th></tr></thead>
                  <tbody>{plan().map(p=>(<tr key={p.week} className="border-b"><td className="p-2">{p.week}</td><td className="p-2">{p.focus}</td></tr>))}</tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Understanding the inputs</CardTitle>
          <CardDescription>These questions are for reflection only and are not a medical screening.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">{understandingInputs.map((it,i)=>(<li key={i}><span className="font-semibold text-foreground">{it.label}:</span><span className="text-sm text-muted-foreground"> {it.description}</span></li>))}</ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete guide: Thinking about cardiometabolic wellness</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            Many everyday habits—like how often you move, what you tend to eat, how long you sit, and how you rest—can, over
            time, influence how your heart and metabolism feel. This tool does not measure or predict disease; instead, it
            offers a gentle snapshot of how your current routines line up with broadly supportive patterns.
          </p>
          <p>
            You can treat your results as an invitation to choose one or two changes that feel kind and realistic, rather
            than a verdict. Small and sustainable shifts often matter more than drastic overhauls. If you ever feel concerned
            about your health, a qualified professional can help you interpret any medical tests and design a plan that fits
            your life.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently asked questions</CardTitle>
          <CardDescription>How to use this tool in a balanced, wellness‑oriented way</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">{faqs.map(([q,a],i)=>(<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}</CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a
        medical or psychological diagnosis. For any health concerns, please consult a qualified professional.
      </p>
    </div>
  );
}
