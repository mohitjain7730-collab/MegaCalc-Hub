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
import { Users, Activity, Calendar, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  weight: z.number().positive('Weight must be positive'),
  height: z.number().positive('Height must be positive'),
  age: z.number().positive('Age must be positive'),
  gender: z.enum(['male', 'female']),
  sittingHours: z.number().min(0, 'Hours cannot be negative').max(24, 'Hours cannot exceed 24'),
  standingHours: z.number().min(0, 'Hours cannot be negative').max(24, 'Hours cannot exceed 24'),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  standingType: z.enum(['static', 'fidgeting', 'walking_around', 'active_standing']),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  sittingCalories: number;
  standingCalories: number;
  calorieDifference: number;
  percentageIncrease: number;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  healthBenefits: string[];
  weeklyProjection: {
    sitting: number;
    standing: number;
    difference: number;
  };
};

const understandingInputs = [
  {
    label: 'Weight, Height, Age & Gender',
    description: 'Body composition and demographics affect basal metabolic rate, which determines baseline calorie burn for both sitting and standing.',
  },
  {
    label: 'Hours Spent Sitting',
    description: 'Total hours spent in seated position during the day. Most office workers sit 6-8 hours daily, which can negatively impact health.',
  },
  {
    label: 'Hours Spent Standing',
    description: 'Total hours spent standing during the day. Standing burns 10-60% more calories than sitting, depending on movement level.',
  },
  {
    label: 'Overall Activity Level',
    description: 'Your general activity level affects baseline metabolic rate and overall calorie burn throughout the day.',
  },
  {
    label: 'Type of Standing',
    description: 'Static standing burns about 10% more calories than sitting, while active standing with movement can burn 40-60% more.',
  },
];

const faqs: [string, string][] = [
  [
    'How many more calories do you burn standing vs sitting?',
    'Standing typically burns 10-60% more calories than sitting, depending on movement level. Static standing burns about 10% more, while active standing with movement can burn 40-60% more calories.',
  ],
  [
    'Is standing better for your health than sitting?',
    'Yes. Standing improves posture, circulation, blood sugar control, and reduces cardiovascular disease risk. However, prolonged standing can also cause issues, so balance is important.',
  ],
  [
    'How long should I stand each day?',
    'Aim for 2-4 hours of standing per day, ideally spread throughout the day. The ideal ratio is often 1:1 or 2:1 (sitting to standing), but listen to your body and adjust based on comfort.',
  ],
  [
    'Does standing at a desk help with weight loss?',
    'Standing can contribute to weight loss by increasing daily calorie burn. Standing for 3-4 hours daily can burn an extra 100-200 calories, which adds up over time when combined with a balanced diet.',
  ],
  [
    'What are the health risks of prolonged sitting?',
    'Prolonged sitting increases risk of cardiovascular disease, diabetes, poor posture, back/neck pain, reduced muscle strength, decreased bone density, impaired circulation, and reduced mental alertness.',
  ],
  [
    'Can standing too much be bad for you?',
    'Yes. Prolonged standing can cause foot pain, varicose veins, fatigue, and lower back issues. Balance is key—alternate between sitting, standing, and movement throughout the day.',
  ],
  [
    'What is the best standing desk setup?',
    'Monitor at eye level, keyboard and mouse at elbow height, use an anti-fatigue mat, wear supportive shoes, start with 30-60 minutes and gradually increase, and alternate between sitting and standing.',
  ],
  [
    'How does fidgeting while standing affect calorie burn?',
    'Fidgeting while standing increases calorie burn by about 20% compared to static standing. Small movements like shifting weight, tapping feet, or gentle stretching add up over time.',
  ],
  [
    'Should I stand during meetings or phone calls?',
    'Yes. Standing during meetings and phone calls is an excellent way to increase daily standing time without requiring special equipment. Walking meetings provide even more benefits.',
  ],
  [
    'How quickly will I see health benefits from standing more?',
    'Some benefits like improved energy and alertness can be noticed within days. Long-term benefits like reduced disease risk and improved posture develop over weeks and months of consistent practice.',
  ],
];

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Assess current sitting and standing time: track your daily patterns to establish baseline.' },
  { week: 2, focus: 'Start small: aim for 30-60 minutes of standing per day, using a standing desk or elevated surface.' },
  { week: 3, focus: 'Increase gradually: add 30 minutes of standing time each week until reaching 2-3 hours daily.' },
  { week: 4, focus: 'Add movement: incorporate fidgeting, shifting weight, and light stretching while standing.' },
  { week: 5, focus: 'Optimize setup: ensure proper ergonomics with monitor at eye level and anti-fatigue mat.' },
  { week: 6, focus: 'Build habits: stand during phone calls, meetings, and while watching TV to increase standing time.' },
  { week: 7, focus: 'Find balance: alternate between sitting and standing every 30-60 minutes for optimal comfort and health.' },
  { week: 8, focus: 'Maintain consistency: establish long-term habits that balance sitting, standing, and movement throughout the day.' },
];

const warningSigns = () => [
  'Prolonged standing can cause foot pain, varicose veins, and fatigue—balance standing with sitting and movement.',
  'If experiencing back pain or discomfort while standing, adjust your setup and consider consulting a healthcare provider.',
  'Extreme ratios (all sitting or all standing) are unhealthy—aim for a balanced mix of positions throughout the day.',
  'Rapid increases in standing time may cause discomfort—gradually increase duration over weeks to allow your body to adapt.',
];

export default function StandingVsSittingCalorieBurnCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weight: undefined,
      height: undefined,
      age: undefined,
      gender: undefined,
      sittingHours: undefined,
      standingHours: undefined,
      activityLevel: undefined,
      standingType: undefined,
    },
  });

  const calculateBMR = (weight: number, height: number, age: number, gender: string) => {
    if (gender === 'male') {
      return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
  };

  const getActivityMultiplier = (activityLevel: string) => {
    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    return multipliers[activityLevel as keyof typeof multipliers];
  };

  const getStandingMultiplier = (standingType: string) => {
    const multipliers = {
      static: 1.1, // 10% increase over sitting
      fidgeting: 1.2, // 20% increase
      walking_around: 1.4, // 40% increase
      active_standing: 1.6, // 60% increase
    };
    return multipliers[standingType as keyof typeof multipliers];
  };

  const calculateCalories = (values: FormValues) => {
    const bmr = calculateBMR(values.weight, values.height, values.age, values.gender);
    const activityMultiplier = getActivityMultiplier(values.activityLevel);
    const standingMultiplier = getStandingMultiplier(values.standingType);
    
    // Base calories per hour (BMR adjusted for activity level)
    const baseCaloriesPerHour = (bmr * activityMultiplier) / 24;
    
    // Sitting calories (base rate)
    const sittingCalories = values.sittingHours * baseCaloriesPerHour;
    
    // Standing calories (with multiplier)
    const standingCalories = values.standingHours * baseCaloriesPerHour * standingMultiplier;
    
    return {
      sitting: Math.round(sittingCalories * 100) / 100,
      standing: Math.round(standingCalories * 100) / 100,
    };
  };

  const onSubmit = (values: FormValues) => {
    const { sitting, standing } = calculateCalories(values);
    const calorieDifference = standing - sitting;
    const percentageIncrease = sitting > 0 ? ((standing - sitting) / sitting) * 100 : 0;

    let interpretation = '';
    let recommendations: string[] = [];
    let healthBenefits: string[] = [];

    if (calorieDifference < 10) {
      interpretation = 'Your current standing time provides minimal calorie burn difference. Consider increasing standing time or adding more movement while standing.';
      recommendations = [
        'Aim for at least 2-3 hours of standing per day',
        'Try standing during phone calls or meetings',
        'Use a standing desk if possible',
        'Take standing breaks every 30-60 minutes'
      ];
    } else if (calorieDifference < 50) {
      interpretation = 'You\'re getting a moderate calorie burn benefit from standing. This is a good start for improving your daily activity level.';
      recommendations = [
        'Gradually increase standing time to 4-6 hours daily',
        'Add gentle movement while standing (shifting weight, light stretching)',
        'Consider alternating between sitting and standing',
        'Track your progress to stay motivated'
      ];
    } else {
      interpretation = 'Excellent! You\'re significantly increasing your calorie burn through standing. This level of activity provides substantial health benefits.';
      recommendations = [
        'Maintain this level of standing activity',
        'Consider adding light exercises while standing',
        'Share your success to motivate others',
        'Monitor for any discomfort and adjust as needed'
      ];
    }

    healthBenefits = [
      'Improved posture and reduced back pain',
      'Better blood circulation and reduced swelling',
      'Increased energy levels and alertness',
      'Reduced risk of obesity and metabolic syndrome',
      'Lower risk of cardiovascular disease',
      'Improved muscle tone and core strength',
      'Better blood sugar control',
      'Reduced risk of certain cancers'
    ];

    // Weekly projection
    const weeklyProjection = {
      sitting: Math.round(sitting * 7 * 100) / 100,
      standing: Math.round(standing * 7 * 100) / 100,
      difference: Math.round(calorieDifference * 7 * 100) / 100,
    };

    setResult({
      sittingCalories: sitting,
      standingCalories: standing,
      calorieDifference,
      percentageIncrease,
      interpretation,
      recommendations,
      warningSigns: warningSigns(),
      plan: plan(),
      healthBenefits,
      weeklyProjection,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Standing vs Sitting Calorie Burn Calculator</CardTitle>
          <CardDescription>Compare calorie burn between sitting and standing to understand the health and metabolic benefits of increasing standing time.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="weight" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
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
                <FormField control={form.control} name="height" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
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
                <FormField control={form.control} name="sittingHours" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours Spent Sitting</FormLabel>
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
                <FormField control={form.control} name="standingHours" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours Spent Standing</FormLabel>
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
                <FormField control={form.control} name="activityLevel" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overall Activity Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                        <SelectItem value="light">Light (light exercise 1-3 days/week)</SelectItem>
                        <SelectItem value="moderate">Moderate (moderate exercise 3-5 days/week)</SelectItem>
                        <SelectItem value="active">Active (hard exercise 6-7 days/week)</SelectItem>
                        <SelectItem value="very_active">Very Active (very hard exercise, physical job)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="standingType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type of Standing</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select standing type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="static">Static Standing (minimal movement)</SelectItem>
                        <SelectItem value="fidgeting">Fidgeting (shifting weight, small movements)</SelectItem>
                        <SelectItem value="walking_around">Walking Around (moving between areas)</SelectItem>
                        <SelectItem value="active_standing">Active Standing (exercises, stretching)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate Calorie Difference</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Activity className="h-8 w-8 text-primary" /><CardTitle>Standing vs Sitting Calorie Burn</CardTitle></div>
              <CardDescription>Your calorie burn comparison and health impact analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded">
                  <p className="text-2xl font-bold text-red-500">{result.sittingCalories}</p>
                  <p className="text-sm text-muted-foreground">Sitting Calories</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <p className="text-2xl font-bold text-green-500">{result.standingCalories}</p>
                  <p className="text-sm text-muted-foreground">Standing Calories</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <p className="text-2xl font-bold text-primary">+{result.calorieDifference}</p>
                  <p className="text-sm text-muted-foreground">Extra Calories</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <p className="text-2xl font-bold text-primary">+{result.percentageIncrease.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">Increase</p>
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
                  <p className="text-2xl font-bold text-red-500">{result.weeklyProjection.sitting}</p>
                  <p className="text-sm text-muted-foreground">Weekly Sitting Calories</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <p className="text-2xl font-bold text-green-500">{result.weeklyProjection.standing}</p>
                  <p className="text-sm text-muted-foreground">Weekly Standing Calories</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <p className="text-2xl font-bold text-primary">+{result.weeklyProjection.difference}</p>
                  <p className="text-sm text-muted-foreground">Weekly Extra Calories</p>
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
                <p className="text-muted-foreground mb-4">{result.interpretation}</p>
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
              <CardTitle>Health Benefits of Standing</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.healthBenefits.map((item, index) => (
                  <li key={index} className="text-sm text-muted-foreground">{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Standing Time Improvement Plan</CardTitle>
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
          <CardDescription>Build a comprehensive activity tracking assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/step-to-calorie-converter" className="text-primary hover:underline">
                  Step-to-Calorie Converter
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Convert steps to calories to complement standing activity tracking.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/daily-activity-points-calculator" className="text-primary hover:underline">
                  Daily Activity Points Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Track comprehensive daily activity including standing time.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/calorie-burn-calculator" className="text-primary hover:underline">
                  Calorie Burn Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Calculate calories burned for various activities and positions.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/bmr-calculator" className="text-primary hover:underline">
                  BMR Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Calculate basal metabolic rate to understand baseline calorie needs.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Guide: Understanding Standing vs Sitting</CardTitle>
          <CardDescription>Evidence-based information about the health benefits of standing</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            Research shows that standing burns more calories than sitting because it engages more muscle groups, particularly in the legs, core, and back. Standing typically burns 10-60% more calories than sitting, depending on factors like body weight, standing posture, and amount of movement while standing.
          </p>
          <p>
            Health benefits of standing include improved posture, better blood circulation, increased energy levels, reduced risk of obesity and metabolic syndrome, lower cardiovascular disease risk, improved muscle tone, better blood sugar control, and reduced risk of certain cancers. However, prolonged standing can also cause issues like foot pain and varicose veins, so balance is important.
          </p>
          <p>
            The ideal approach is to alternate between sitting, standing, and movement throughout the day. Aim for 2-4 hours of standing per day, ideally spread throughout the day. Use standing desks, stand during meetings and phone calls, and take standing breaks every 30-60 minutes.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Common questions about standing vs sitting and calorie burn</CardDescription>
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
