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
import { Zap, Activity, Calendar, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  weight: z.number().positive('Weight must be positive'),
  bodyFatPercentage: z.number().min(0, 'Body fat percentage cannot be negative').max(50, 'Body fat percentage seems too high'),
  gender: z.enum(['male', 'female']),
  age: z.number().positive('Age must be positive'),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  unitSystem: z.enum(['metric', 'imperial']),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  muscleMassPercentage: number;
  muscleMass: number;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  comparison: {
    average: number;
    percentile: string;
  };
  muscleMassCategory: string;
};

const understandingInputs = [
  {
    label: 'Weight',
    description: 'Total body weight is used to calculate muscle mass percentage. Use the same scale and time of day for consistency.',
  },
  {
    label: 'Body Fat Percentage',
    description: 'Measured via DEXA, BIA, skinfold calipers, or other methods. Essential for calculating lean body mass and muscle mass.',
  },
  {
    label: 'Gender',
    description: 'Men typically have higher muscle mass percentages (35–45%) than women (30–40%) due to hormonal and structural differences.',
  },
  {
    label: 'Age',
    description: 'Muscle mass naturally declines with age (sarcopenia). Older adults may have lower percentages even with regular training.',
  },
  {
    label: 'Activity Level',
    description: 'Active individuals and athletes typically have higher muscle mass percentages due to regular resistance training.',
  },
];

const faqs: [string, string][] = [
  [
    'What is muscle mass percentage?',
    'Muscle mass percentage is the proportion of your total body weight that consists of muscle tissue. It provides insight into your body composition beyond just weight or BMI.',
  ],
  [
    'What is a good muscle mass percentage?',
    'For men, 35–45% is typical, with 40% being average. For women, 30–40% is typical, with 35% being average. Athletes often exceed these ranges by 5–10%.',
  ],
  [
    'How is muscle mass percentage calculated?',
    'It is estimated from lean body mass (total weight minus fat mass). Muscle mass is typically 40–50% of lean body mass, then expressed as a percentage of total weight.',
  ],
  [
    'Can I increase my muscle mass percentage?',
    'Yes, through progressive resistance training, adequate protein intake (1.6–2.2g per kg), sufficient calories, and proper recovery. Consistency is key.',
  ],
  [
    'Does age affect muscle mass percentage?',
    'Yes. Muscle mass peaks in the 20s–30s and declines with age (sarcopenia). Regular strength training can slow or partially reverse this decline.',
  ],
  [
    'What is the difference between muscle mass and lean body mass?',
    'Lean body mass includes muscle, bone, organs, and water. Muscle mass is a subset of lean body mass, typically representing 40–50% of it.',
  ],
  [
    'How often should I measure muscle mass percentage?',
    'Monthly measurements are sufficient. Daily fluctuations are normal. Focus on trends over weeks and months rather than day-to-day changes.',
  ],
  [
    'Can women build significant muscle mass?',
    'Yes, though women typically have lower absolute muscle mass than men due to hormonal differences. With proper training and nutrition, women can build substantial muscle.',
  ],
  [
    'What causes low muscle mass percentage?',
    'Sedentary lifestyle, inadequate protein intake, insufficient calories, aging, illness, or injury. Resistance training and proper nutrition can address most causes.',
  ],
  [
    'Is muscle mass percentage more important than body fat percentage?',
    'Both are important. Muscle mass indicates strength and metabolic health, while body fat percentage indicates overall body composition. Together they provide a complete picture.',
  ],
];

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Establish baseline: measure current muscle mass percentage and body fat percentage accurately.' },
  { week: 2, focus: 'Begin progressive resistance training 3–4 times per week, focusing on compound movements (squats, deadlifts, presses).' },
  { week: 3, focus: 'Optimize protein intake: aim for 1.6–2.2g per kg body weight daily, distributed across meals.' },
  { week: 4, focus: 'Ensure adequate caloric intake for muscle growth—slight surplus (200–500 calories) if not overweight.' },
  { week: 5, focus: 'Track training volume and intensity—aim for progressive overload each week (more weight, reps, or sets).' },
  { week: 6, focus: 'Prioritize recovery: 7–9 hours of sleep, stress management, and rest days between training sessions.' },
  { week: 7, focus: 'Reassess measurements and adjust training/nutrition based on progress toward muscle mass goals.' },
  { week: 8, focus: 'Establish long-term habits: maintain consistent training, nutrition, and recovery for sustained muscle development.' },
];

const warningSigns = () => [
  'Very low muscle mass percentage (<30% for men, <25% for women) may indicate sarcopenia or underlying health issues—consult a healthcare provider.',
  'Rapid muscle loss without intentional weight loss may signal illness, injury, or nutritional deficiencies requiring medical evaluation.',
  'Extremely high muscle mass percentages (>50%) are rare and may indicate measurement errors or the use of performance-enhancing substances.',
];

const calculateMuscleMass = (values: FormValues) => {
  let w = values.weight;
  if (values.unitSystem === 'imperial') {
    w = values.weight * 0.453592;
  }
  const fatMass = (values.bodyFatPercentage / 100) * w;
  const leanBodyMass = w - fatMass;
  const muscleMassPercentage = (leanBodyMass * 0.45) / w * 100;
  const muscleMass = leanBodyMass * 0.45;
  return {
    muscleMassPercentage: Math.round(muscleMassPercentage * 100) / 100,
    muscleMass: Math.round(muscleMass * 100) / 100,
  };
};

const getMuscleMassCategory = (muscleMassPercentage: number, gender: string, age: number) => {
  let average = gender === 'male' ? 40 : 35;
  let excellent = gender === 'male' ? 45 : 40;
  if (age > 50) {
    average -= 2;
    excellent -= 2;
  }
  if (muscleMassPercentage >= excellent) return 'Excellent';
  if (muscleMassPercentage >= average + 2) return 'Very Good';
  if (muscleMassPercentage >= average) return 'Good';
  if (muscleMassPercentage >= average - 3) return 'Average';
  return 'Below Average';
};

const getInterpretation = (muscleMassPercentage: number, gender: string, age: number, activityLevel: string) => {
  let average = gender === 'male' ? 40 : 35;
  if (age > 50) average -= 2;
  const difference = muscleMassPercentage - average;
  if (difference > 5) {
    return `Excellent muscle mass! You have significantly above-average muscle development, which indicates excellent training and nutrition habits.`;
  } else if (difference > 2) {
    return `Very good muscle mass! You're above average and have solid muscle development. Continue your current approach.`;
  } else if (difference > -2) {
    return `Good muscle mass! You're in the average to above-average range. There's room for improvement with focused training.`;
  } else if (difference > -5) {
    return `Below average muscle mass. Focus on progressive resistance training and adequate protein intake to build muscle.`;
  } else {
    return `Significantly below average muscle mass. Prioritize strength training, proper nutrition, and consider consulting a fitness professional.`;
  }
};

const getPercentile = (muscleMassPercentage: number, gender: string) => {
  let average = gender === 'male' ? 40 : 35;
  let stdDev = gender === 'male' ? 4 : 3.5;
  const zScore = (muscleMassPercentage - average) / stdDev;
  if (zScore > 2) return '95th+ percentile';
  if (zScore > 1.5) return '90th-95th percentile';
  if (zScore > 1) return '80th-90th percentile';
  if (zScore > 0.5) return '60th-80th percentile';
  if (zScore > 0) return '50th-60th percentile';
  if (zScore > -0.5) return '40th-50th percentile';
  if (zScore > -1) return '20th-40th percentile';
  if (zScore > -1.5) return '10th-20th percentile';
  if (zScore > -2) return '5th-10th percentile';
  return 'Below 5th percentile';
};

const getRecommendations = (muscleMassPercentage: number) => {
  if (muscleMassPercentage < 35) {
    return [
      'Start with progressive resistance training 3–4 times per week',
      'Consume 1.6–2.2g protein per kg body weight daily',
      'Focus on compound movements (squats, deadlifts, presses)',
      'Ensure adequate caloric intake for muscle growth',
      'Get 7–9 hours of quality sleep for recovery',
    ];
  } else if (muscleMassPercentage < 40) {
    return [
      'Continue progressive overload in your training',
      'Optimize protein timing around workouts',
      'Consider increasing training volume gradually',
      'Track your progress with measurements and photos',
      'Ensure proper recovery between sessions',
    ];
  } else if (muscleMassPercentage < 45) {
    return [
      'Fine-tune your training and nutrition for continued gains',
      'Consider advanced training techniques',
      'Focus on weak points and muscle imbalances',
      'Maintain consistency in your approach',
      'Consider periodization in your training',
    ];
  } else {
    return [
      'Maintain your excellent muscle development',
      'Focus on strength and performance improvements',
      'Consider competing or setting new challenges',
      'Share your knowledge with others',
      'Continue monitoring for long-term health',
    ];
  }
};

export default function MuscleMassPercentageCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weight: undefined,
      bodyFatPercentage: undefined,
      gender: undefined,
      age: undefined,
      activityLevel: undefined,
      unitSystem: 'metric',
    },
  });

  const onSubmit = (values: FormValues) => {
    const { muscleMassPercentage, muscleMass } = calculateMuscleMass(values);
    const muscleMassCategory = getMuscleMassCategory(muscleMassPercentage, values.gender, values.age);
    const interpretation = getInterpretation(muscleMassPercentage, values.gender, values.age, values.activityLevel);
    const percentile = getPercentile(muscleMassPercentage, values.gender);
    const average = values.gender === 'male' ? 40 : 35;

    setResult({
      muscleMassPercentage,
      muscleMass,
      interpretation,
      recommendations: getRecommendations(muscleMassPercentage),
      warningSigns: warningSigns(),
      plan: plan(),
      comparison: {
        average,
        percentile,
      },
      muscleMassCategory,
    });
  };

  const unit = form.watch('unitSystem');

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5" /> Muscle Mass Percentage Calculator</CardTitle>
          <CardDescription>Estimate your muscle mass percentage based on body weight and body fat percentage to assess body composition.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="unitSystem" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit System</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit system" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="metric">Metric (kg)</SelectItem>
                        <SelectItem value="imperial">Imperial (lbs)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="weight" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight ({unit === 'metric' ? 'kg' : 'lbs'})</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="bodyFatPercentage" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Body Fat Percentage (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
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
                <FormField control={form.control} name="activityLevel" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary</SelectItem>
                        <SelectItem value="light">Light Activity</SelectItem>
                        <SelectItem value="moderate">Moderate Activity</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="very_active">Very Active</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate Muscle Mass Percentage</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Activity className="h-8 w-8 text-primary" /><CardTitle>Muscle Mass Percentage Results</CardTitle></div>
              <CardDescription>Your body composition analysis and muscle development assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded">
                  <p className="text-3xl font-bold text-primary">{result.muscleMassPercentage}%</p>
                  <p className="text-sm text-muted-foreground">Muscle Mass Percentage</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <p className="text-3xl font-bold text-primary">{result.muscleMass} kg</p>
                  <p className="text-sm text-muted-foreground">Total Muscle Mass</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <p className="text-2xl font-bold text-primary">{result.muscleMassCategory}</p>
                  <p className="text-sm text-muted-foreground">Category</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded">
                  <p className="text-2xl font-bold text-blue-500">{result.comparison.average}%</p>
                  <p className="text-sm text-muted-foreground">Average for Your Gender</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <p className="text-2xl font-bold text-primary">{result.comparison.percentile}</p>
                  <p className="text-sm text-muted-foreground">Percentile Rank</p>
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
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Muscle Building Plan</CardTitle>
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
          <CardDescription>Collect accurate measurements for meaningful results</CardDescription>
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
          <CardDescription>Build a comprehensive body composition assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/body-fat-percentage-calculator" className="text-primary hover:underline">
                  Body Fat Percentage Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Measure body fat to calculate muscle mass percentage accurately.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/lean-body-mass-calculator" className="text-primary hover:underline">
                  Lean Body Mass Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Calculate lean body mass, which includes muscle, bone, and organs.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/fat-free-mass-index-calculator" className="text-primary hover:underline">
                  Fat-Free Mass Index Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Assess fat-free mass relative to height for body composition insights.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/protein-intake-calculator" className="text-primary hover:underline">
                  Protein Intake Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Determine optimal protein intake to support muscle growth and maintenance.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Guide: Understanding Muscle Mass Percentage</CardTitle>
          <CardDescription>Evidence-based strategies for muscle development</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            Muscle mass percentage represents the proportion of your total body weight that consists of muscle tissue. It's a key indicator of physical fitness, strength potential, and metabolic health. Higher muscle mass percentage is associated with better metabolic rate, insulin sensitivity, bone density, and functional capacity.
          </p>
          <p>
            To increase muscle mass percentage, focus on progressive resistance training (3–4 times per week), adequate protein intake (1.6–2.2g per kg), sufficient calories for growth, and proper recovery (7–9 hours of sleep). Compound movements like squats, deadlifts, and presses are most effective for building muscle.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Common questions about muscle mass percentage</CardDescription>
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
