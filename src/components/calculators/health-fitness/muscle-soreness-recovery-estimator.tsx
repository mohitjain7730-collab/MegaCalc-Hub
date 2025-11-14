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
import { Activity, Calendar, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  age: z.number().positive('Age must be positive'),
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  exerciseType: z.enum(['strength', 'cardio', 'hiit', 'endurance', 'flexibility']),
  exerciseIntensity: z.enum(['low', 'moderate', 'high', 'very_high']),
  exerciseDuration: z.number().positive('Duration must be positive'),
  sorenessLevel: z.enum(['mild', 'moderate', 'severe']),
  hoursSinceExercise: z.number().positive('Hours since exercise must be positive'),
  sleepQuality: z.enum(['poor', 'fair', 'good', 'excellent']),
  hydrationLevel: z.enum(['poor', 'fair', 'good', 'excellent']),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  estimatedRecoveryTime: number;
  recoveryPhase: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  preventionTips: string[];
};

const understandingInputs = [
  {
    label: 'Age',
    description: 'Recovery time increases with age due to slower protein synthesis and reduced hormonal response. Older adults typically need more recovery time.',
  },
  {
    label: 'Fitness Level',
    description: 'Trained individuals recover faster due to better adaptation and more efficient recovery mechanisms. Beginners need more recovery time.',
  },
  {
    label: 'Exercise Type',
    description: 'Different exercise types cause varying degrees of muscle damage. Eccentric exercises (strength training, HIIT) typically cause more soreness than concentric exercises.',
  },
  {
    label: 'Exercise Intensity',
    description: 'Higher intensity exercise causes more muscle damage and requires longer recovery. Very high intensity workouts may need 48-72 hours of recovery.',
  },
  {
    label: 'Exercise Duration',
    description: 'Longer exercise sessions increase total muscle damage and recovery needs. Sessions over 90 minutes typically require extended recovery.',
  },
  {
    label: 'Current Soreness Level',
    description: 'Severe soreness indicates significant muscle damage and may require complete rest. Mild soreness may allow for light activity.',
  },
  {
    label: 'Hours Since Exercise',
    description: 'DOMS typically peaks 24-48 hours after exercise. Tracking time since exercise helps determine recovery phase and appropriate activities.',
  },
  {
    label: 'Sleep Quality',
    description: 'Growth hormone release during deep sleep is crucial for muscle repair. Poor sleep significantly extends recovery time.',
  },
  {
    label: 'Hydration Level',
    description: 'Proper hydration supports metabolic processes, nutrient delivery, and waste removal essential for muscle recovery.',
  },
];

const faqs: [string, string][] = [
  [
    'What is Delayed Onset Muscle Soreness (DOMS)?',
    'DOMS is muscle pain and stiffness that typically occurs 24-72 hours after exercise, especially after unfamiliar or intense activities. It\'s caused by microscopic damage to muscle fibers and is a normal part of the adaptation process.',
  ],
  [
    'How long does muscle soreness typically last?',
    'Mild to moderate soreness usually resolves within 24-72 hours. Severe soreness may last 5-7 days. Recovery time depends on factors like age, fitness level, exercise intensity, and recovery practices.',
  ],
  [
    'Should I exercise when I\'m sore?',
    'Light activity and active recovery can help with mild soreness, but avoid intense exercise of the same muscle groups. If soreness is severe or limits movement, take complete rest.',
  ],
  [
    'What helps muscle soreness recover faster?',
    'Adequate sleep (7-9 hours), proper hydration, nutrition (protein and carbohydrates), light movement, gentle stretching, massage, foam rolling, and stress management all support faster recovery.',
  ],
  [
    'Does age affect recovery time?',
    'Yes. Recovery time increases with age due to slower protein synthesis, reduced growth hormone production, and decreased muscle mass. Older adults typically need 20-50% more recovery time than younger individuals.',
  ],
  [
    'What are the phases of muscle recovery?',
    'Recovery occurs in phases: Acute (0-6 hours) - initial response and energy depletion; Inflammatory (6-24 hours) - swelling and immune activation; Repair (24-72 hours) - protein synthesis and regeneration; Remodeling (3-7 days) - tissue strengthening.',
  ],
  [
    'Can I prevent muscle soreness?',
    'While some soreness is normal with new or intense exercise, you can minimize it by gradually increasing intensity, proper warm-up and cool-down, staying hydrated, getting adequate sleep, and including rest days.',
  ],
  [
    'When should I be concerned about muscle soreness?',
    'Seek medical attention if soreness is severe and doesn\'t improve after 7 days, if there\'s significant swelling or bruising, loss of range of motion, dark urine (possible rhabdomyolysis), or fever.',
  ],
  [
    'Does stretching help with muscle soreness?',
    'Gentle stretching can help with mild soreness by improving blood flow and reducing stiffness. However, avoid aggressive stretching of severely sore muscles as it may cause further damage.',
  ],
  [
    'How does nutrition affect muscle recovery?',
    'Consuming protein (20-30g) and carbohydrates within 2 hours post-exercise supports muscle repair and glycogen replenishment. Adequate overall nutrition and hydration are essential for optimal recovery.',
  ],
];

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Establish baseline: track your current recovery patterns and identify factors affecting recovery time.' },
  { week: 2, focus: 'Optimize sleep: aim for 7-9 hours of quality sleep per night to support muscle repair and recovery.' },
  { week: 3, focus: 'Improve hydration: maintain consistent hydration throughout the day, especially around workouts.' },
  { week: 4, focus: 'Enhance nutrition: consume protein and carbohydrates within 2 hours post-exercise to support recovery.' },
  { week: 5, focus: 'Add active recovery: incorporate light movement, stretching, and foam rolling on rest days.' },
  { week: 6, focus: 'Manage training load: ensure adequate rest days and avoid overtraining the same muscle groups.' },
  { week: 7, focus: 'Monitor progress: track recovery times and adjust training intensity based on how your body responds.' },
  { week: 8, focus: 'Establish long-term habits: maintain consistent sleep, nutrition, and recovery practices for optimal performance.' },
];

const warningSigns = () => [
  'Severe pain that doesn\'t improve after 7 days may indicate injury—consult a healthcare provider.',
  'Dark urine after intense exercise could indicate rhabdomyolysis, a serious condition requiring immediate medical attention.',
  'Significant swelling, bruising, or loss of range of motion may indicate injury rather than normal muscle soreness.',
  'Fever or signs of infection combined with muscle soreness warrant medical evaluation.',
  'If soreness prevents normal daily activities for more than 3-4 days, consider reducing training intensity.',
];

export default function MuscleSorenessRecoveryEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      fitnessLevel: undefined,
      exerciseType: undefined,
      exerciseIntensity: undefined,
      exerciseDuration: undefined,
      sorenessLevel: undefined,
      hoursSinceExercise: undefined,
      sleepQuality: undefined,
      hydrationLevel: undefined,
    },
  });

  const calculateRecoveryTime = (values: FormValues) => {
    let baseRecoveryTime = 24; // Base 24 hours

    // Age factor (older = longer recovery)
    if (values.age > 50) baseRecoveryTime += 12;
    else if (values.age > 40) baseRecoveryTime += 6;
    else if (values.age < 25) baseRecoveryTime -= 6;

    // Fitness level factor
    const fitnessMultipliers = {
      beginner: 1.5,
      intermediate: 1.0,
      advanced: 0.7,
    };
    baseRecoveryTime *= fitnessMultipliers[values.fitnessLevel];

    // Exercise type factor
    const exerciseTypeMultipliers = {
      strength: 1.3,
      cardio: 0.8,
      hiit: 1.4,
      endurance: 1.1,
      flexibility: 0.6,
    };
    baseRecoveryTime *= exerciseTypeMultipliers[values.exerciseType];

    // Intensity factor
    const intensityMultipliers = {
      low: 0.7,
      moderate: 1.0,
      high: 1.3,
      very_high: 1.6,
    };
    baseRecoveryTime *= intensityMultipliers[values.exerciseIntensity];

    // Duration factor
    if (values.exerciseDuration > 90) baseRecoveryTime += 12;
    else if (values.exerciseDuration > 60) baseRecoveryTime += 6;
    else if (values.exerciseDuration < 30) baseRecoveryTime -= 6;

    // Soreness level factor
    const sorenessMultipliers = {
      mild: 0.8,
      moderate: 1.2,
      severe: 1.8,
    };
    baseRecoveryTime *= sorenessMultipliers[values.sorenessLevel];

    // Recovery factors
    const sleepMultipliers = {
      poor: 1.3,
      fair: 1.1,
      good: 0.9,
      excellent: 0.7,
    };
    baseRecoveryTime *= sleepMultipliers[values.sleepQuality];

    const hydrationMultipliers = {
      poor: 1.2,
      fair: 1.1,
      good: 0.9,
      excellent: 0.8,
    };
    baseRecoveryTime *= hydrationMultipliers[values.hydrationLevel];

    return Math.max(6, Math.round(baseRecoveryTime)); // Minimum 6 hours
  };

  const getRecoveryPhase = (hoursSinceExercise: number, estimatedRecovery: number) => {
    const progress = (hoursSinceExercise / estimatedRecovery) * 100;
    
    if (progress < 25) return 'Acute Phase';
    if (progress < 50) return 'Inflammatory Phase';
    if (progress < 75) return 'Repair Phase';
    if (progress < 100) return 'Remodeling Phase';
    return 'Recovery Complete';
  };

  const onSubmit = (values: FormValues) => {
    const estimatedRecoveryTime = calculateRecoveryTime(values);
    const recoveryPhase = getRecoveryPhase(values.hoursSinceExercise, estimatedRecoveryTime);
    
    let interpretation = '';
    let recommendations: string[] = [];
    let preventionTips: string[] = [];

    if (estimatedRecoveryTime <= 24) {
      interpretation = 'Your estimated recovery time is relatively short, indicating good fitness adaptation and recovery factors.';
      recommendations = [
        'Continue light movement and stretching',
        'Focus on hydration and nutrition',
        'Get adequate sleep',
        'Consider active recovery activities'
      ];
    } else if (estimatedRecoveryTime <= 48) {
      interpretation = 'Your recovery time is moderate, which is normal for intense or new exercise routines.';
      recommendations = [
        'Prioritize rest and recovery',
        'Use ice or heat therapy as needed',
        'Consider gentle stretching or yoga',
        'Ensure proper nutrition and hydration'
      ];
    } else {
      interpretation = 'Your estimated recovery time is longer, suggesting you may need more rest or have factors affecting recovery.';
      recommendations = [
        'Take complete rest from intense exercise',
        'Focus on sleep and stress management',
        'Consider consulting a healthcare provider',
        'Evaluate your training program for overtraining'
      ];
    }

    preventionTips = [
      'Gradually increase exercise intensity and duration',
      'Include proper warm-up and cool-down routines',
      'Maintain consistent hydration throughout the day',
      'Prioritize 7-9 hours of quality sleep',
      'Include rest days in your training schedule',
      'Consider massage or foam rolling for muscle maintenance'
    ];

    setResult({
      estimatedRecoveryTime,
      recoveryPhase,
      interpretation,
      recommendations,
      warningSigns: warningSigns(),
      plan: plan(),
      preventionTips,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Muscle Soreness Recovery Estimator</CardTitle>
          <CardDescription>Estimate muscle recovery time based on exercise characteristics, fitness level, and recovery factors to optimize your training schedule.</CardDescription>
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
                <FormField control={form.control} name="fitnessLevel" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fitness Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fitness level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner (0-6 months)</SelectItem>
                        <SelectItem value="intermediate">Intermediate (6 months - 2 years)</SelectItem>
                        <SelectItem value="advanced">Advanced (2+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="exerciseType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exercise Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select exercise type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="strength">Strength Training</SelectItem>
                        <SelectItem value="cardio">Cardio</SelectItem>
                        <SelectItem value="hiit">HIIT</SelectItem>
                        <SelectItem value="endurance">Endurance</SelectItem>
                        <SelectItem value="flexibility">Flexibility/Stretching</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="exerciseIntensity" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exercise Intensity</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select intensity level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low (50-60% max effort)</SelectItem>
                        <SelectItem value="moderate">Moderate (60-70% max effort)</SelectItem>
                        <SelectItem value="high">High (70-85% max effort)</SelectItem>
                        <SelectItem value="very_high">Very High (85%+ max effort)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="exerciseDuration" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exercise Duration (minutes)</FormLabel>
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
                <FormField control={form.control} name="sorenessLevel" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Soreness Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select soreness level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="mild">Mild (slight discomfort)</SelectItem>
                        <SelectItem value="moderate">Moderate (noticeable stiffness)</SelectItem>
                        <SelectItem value="severe">Severe (significant pain/movement limitation)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="hoursSinceExercise" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours Since Exercise</FormLabel>
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
                <FormField control={form.control} name="sleepQuality" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sleep Quality Last Night</FormLabel>
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
                <FormField control={form.control} name="hydrationLevel" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hydration Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select hydration level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="poor">Poor (dehydrated)</SelectItem>
                        <SelectItem value="fair">Fair (slightly dehydrated)</SelectItem>
                        <SelectItem value="good">Good (well hydrated)</SelectItem>
                        <SelectItem value="excellent">Excellent (optimally hydrated)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Estimate Recovery Time</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Activity className="h-8 w-8 text-primary" /><CardTitle>Recovery Estimation</CardTitle></div>
              <CardDescription>Your personalized recovery assessment and recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded">
                  <p className="text-3xl font-bold text-primary">{result.estimatedRecoveryTime}h</p>
                  <p className="text-sm text-muted-foreground">Estimated Recovery Time</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <p className="text-2xl font-bold text-primary">{result.recoveryPhase}</p>
                  <p className="text-sm text-muted-foreground">Current Recovery Phase</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{result.interpretation}</p>
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
              <CardTitle>Prevention Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.preventionTips.map((item, index) => (
                  <li key={index} className="text-sm text-muted-foreground">{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Recovery Optimization Plan</CardTitle>
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
          <CardDescription>Build a comprehensive fitness and recovery assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/sleep-quality-calculator" className="text-primary hover:underline">
                  Sleep Quality Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Assess sleep quality to optimize recovery and muscle repair.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/hydration-calculator" className="text-primary hover:underline">
                  Hydration Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Calculate optimal hydration needs to support muscle recovery.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/training-stress-score-calculator" className="text-primary hover:underline">
                  Training Stress Score Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Monitor training load to prevent overtraining and optimize recovery.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/one-rep-max-strength-calculator" className="text-primary hover:underline">
                  One Rep Max Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Calculate training intensity to optimize recovery planning.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Guide: Understanding Muscle Recovery</CardTitle>
          <CardDescription>Evidence-based information about muscle soreness and recovery</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            Delayed Onset Muscle Soreness (DOMS) typically occurs 24-72 hours after exercise and is caused by microscopic damage to muscle fibers. This is a normal part of the adaptation process that leads to increased strength and endurance.
          </p>
          <p>
            Recovery occurs in phases: Acute (0-6 hours) involves initial inflammatory response and energy depletion; Inflammatory (6-24 hours) includes swelling and immune activation; Repair (24-72 hours) focuses on protein synthesis and tissue regeneration; Remodeling (3-7 days) involves tissue strengthening and adaptation.
          </p>
          <p>
            Factors affecting recovery include age (recovery time increases with age), fitness level (trained individuals recover faster), exercise type and intensity, sleep quality (growth hormone release is crucial), nutrition (protein and carbohydrates support repair), and hydration (proper fluid balance supports metabolic processes).
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Common questions about muscle soreness and recovery</CardDescription>
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
