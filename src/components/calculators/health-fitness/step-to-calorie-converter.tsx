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
import { Footprints, Activity, Calendar, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  steps: z.number().positive('Steps must be positive'),
  weight: z.number().positive('Weight must be positive'),
  height: z.number().positive('Height must be positive'),
  age: z.number().positive('Age must be positive'),
  gender: z.enum(['male', 'female']),
  walkingSpeed: z.enum(['slow', 'moderate', 'brisk', 'fast']),
  terrain: z.enum(['flat', 'hilly', 'stairs', 'mixed']),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  caloriesBurned: number;
  distance: number;
  duration: number;
  pace: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  dailyGoals: {
    steps: number;
    calories: number;
    distance: number;
  };
};

const understandingInputs = [
  {
    label: 'Number of Steps',
    description: 'Total steps taken during your activity. Use a pedometer, fitness tracker, or smartphone app for accurate counting.',
  },
  {
    label: 'Weight',
    description: 'Body weight affects calorie burn—heavier individuals burn more calories per step due to greater energy expenditure.',
  },
  {
    label: 'Height',
    description: 'Height determines step length, which affects distance calculations and overall calorie burn estimates.',
  },
  {
    label: 'Walking Speed',
    description: 'Faster walking increases calorie burn per step. Brisk walking (6 km/h) burns significantly more than slow walking (3 km/h).',
  },
  {
    label: 'Terrain Type',
    description: 'Hilly terrain and stairs require more energy than flat surfaces, increasing calorie burn per step.',
  },
  {
    label: 'Age & Gender',
    description: 'Metabolic rate varies with age and gender, affecting baseline calorie burn calculations.',
  },
];

const faqs: [string, string][] = [
  [
    'How many calories do I burn per step?',
    'Calories per step vary based on body weight, walking speed, and terrain. On average, a 70kg person burns approximately 0.04-0.05 calories per step at moderate pace on flat terrain.',
  ],
  [
    'How accurate are step-to-calorie conversions?',
    'Step-to-calorie conversions provide estimates based on average metabolic rates. Accuracy depends on accurate step counting, body weight, and activity intensity. Individual variations may occur.',
  ],
  [
    'Does walking speed affect calorie burn?',
    'Yes. Faster walking significantly increases calorie burn. Brisk walking (6 km/h) burns about 50% more calories per step than slow walking (3 km/h) due to higher intensity.',
  ],
  [
    'How does terrain affect calorie burn?',
    'Hilly terrain and stairs require more energy than flat surfaces, increasing calorie burn by 30-60% per step. Mixed terrain provides moderate calorie burn benefits.',
  ],
  [
    'What is the recommended daily step count?',
    'The popular 10,000 steps per day goal is a good target for general health. However, any increase from your current level provides benefits. Aim for at least 5,000-7,500 steps daily.',
  ],
  [
    'Can I lose weight by increasing my steps?',
    'Yes. Increasing daily steps can contribute to weight loss when combined with a balanced diet. Walking 10,000 steps daily can burn 300-500 calories, supporting a calorie deficit.',
  ],
  [
    'How do I accurately count my steps?',
    'Use a pedometer, fitness tracker, or smartphone app. Wear devices consistently and calibrate them for your stride length for best accuracy.',
  ],
  [
    'Does body weight affect calories burned per step?',
    'Yes. Heavier individuals burn more calories per step because they require more energy to move their body mass. A 90kg person burns more per step than a 60kg person.',
  ],
  [
    'What is the difference between steps and distance?',
    'Steps count individual footfalls, while distance measures total travel. Distance is calculated from step count using average step length, which varies by height and walking speed.',
  ],
  [
    'How can I increase my daily step count?',
    'Take the stairs, park farther away, take walking breaks, walk during phone calls, get off transit one stop early, take post-meal walks, and use a pedometer for motivation.',
  ],
];

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Establish baseline: track your current daily step count and calculate current calorie burn.' },
  { week: 2, focus: 'Increase gradually: add 500-1,000 steps per day to your baseline to build consistency.' },
  { week: 3, focus: 'Optimize walking speed: work toward brisk walking pace (6 km/h) to maximize calorie burn per step.' },
  { week: 4, focus: 'Add variety: incorporate different terrains (hills, stairs) to increase calorie burn and challenge.' },
  { week: 5, focus: 'Set goals: aim for 10,000 steps daily and track progress with a pedometer or fitness tracker.' },
  { week: 6, focus: 'Build habits: incorporate walking into daily routines (commuting, breaks, errands).' },
  { week: 7, focus: 'Maintain consistency: focus on daily step goals and celebrate milestones to stay motivated.' },
  { week: 8, focus: 'Establish long-term habits: maintain increased step counts as part of your regular lifestyle.' },
];

const warningSigns = () => [
  'Step-to-calorie conversions are estimates and may not account for individual metabolic variations or health conditions.',
  'Very high step counts (15,000+) may indicate overtraining—ensure adequate rest and recovery.',
  'If experiencing pain or discomfort while walking, consult a healthcare provider before increasing activity.',
  'Rapid increases in step count may lead to overuse injuries—gradually increase activity over weeks.',
];

export default function StepToCalorieConverter() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      steps: undefined,
      weight: undefined,
      height: undefined,
      age: undefined,
      gender: undefined,
      walkingSpeed: undefined,
      terrain: undefined,
    },
  });

  const calculateCalories = (values: FormValues) => {
    // Base metabolic rate calculation (simplified)
    let bmr;
    if (values.gender === 'male') {
      bmr = 88.362 + (13.397 * values.weight) + (4.799 * values.height) - (5.677 * values.age);
    } else {
      bmr = 447.593 + (9.247 * values.weight) + (3.098 * values.height) - (4.330 * values.age);
    }

    // Calculate distance (average step length based on height)
    const stepLength = values.height * 0.43; // cm to step length ratio
    const distance = (values.steps * stepLength) / 100000; // Convert to km

    // Walking speed multipliers
    const speedMultipliers = {
      slow: 1.0,
      moderate: 1.2,
      brisk: 1.5,
      fast: 1.8,
    };

    // Terrain multipliers
    const terrainMultipliers = {
      flat: 1.0,
      hilly: 1.3,
      stairs: 1.6,
      mixed: 1.2,
    };

    // Calculate calories per step
    const baseCaloriesPerStep = (bmr / 24 / 60) * 0.05; // Base metabolic rate per minute * activity factor
    const speedMultiplier = speedMultipliers[values.walkingSpeed];
    const terrainMultiplier = terrainMultipliers[values.terrain];
    
    const caloriesPerStep = baseCaloriesPerStep * speedMultiplier * terrainMultiplier;
    const totalCalories = values.steps * caloriesPerStep;

    return {
      calories: Math.round(totalCalories * 100) / 100,
      distance: Math.round(distance * 100) / 100,
    };
  };

  const calculateDuration = (distance: number, speed: string) => {
    const speeds = {
      slow: 3, // km/h
      moderate: 4.5,
      brisk: 6,
      fast: 7.5,
    };
    
    const speedKmh = speeds[speed as keyof typeof speeds];
    const durationHours = distance / speedKmh;
    const durationMinutes = durationHours * 60;
    
    return Math.round(durationMinutes);
  };

  const getPace = (speed: string) => {
    const paces = {
      slow: '20+ min/km',
      moderate: '13-15 min/km',
      brisk: '10-12 min/km',
      fast: '8-10 min/km',
    };
    
    return paces[speed as keyof typeof paces];
  };

  const onSubmit = (values: FormValues) => {
    const { calories, distance } = calculateCalories(values);
    const duration = calculateDuration(distance, values.walkingSpeed);
    const pace = getPace(values.walkingSpeed);

    let interpretation = '';
    let recommendations: string[] = [];

    if (values.steps < 5000) {
      interpretation = 'Your step count is below the recommended daily minimum. Increasing your daily steps can significantly improve your health and fitness.';
      recommendations = [
        'Aim for at least 5,000 steps per day as a starting goal',
        'Take short walking breaks throughout the day',
        'Park farther away or take stairs when possible',
        'Consider a walking meeting or phone call'
      ];
    } else if (values.steps < 10000) {
      interpretation = 'You\'re making good progress with your daily steps! You\'re in the moderate activity range and burning a healthy amount of calories.';
      recommendations = [
        'Work toward the 10,000 steps per day goal',
        'Increase walking speed for more calorie burn',
        'Add variety with different terrains',
        'Track your progress to stay motivated'
      ];
    } else if (values.steps < 15000) {
      interpretation = 'Excellent! You\'re achieving the recommended daily step goal and burning substantial calories through walking.';
      recommendations = [
        'Maintain this level of activity',
        'Consider adding strength training',
        'Vary your walking routes for interest',
        'Share your success to motivate others'
      ];
    } else {
      interpretation = 'Outstanding! You\'re in the highly active range, burning significant calories and maintaining excellent cardiovascular health.';
      recommendations = [
        'You\'re exceeding recommendations - great job!',
        'Ensure you\'re getting adequate rest and recovery',
        'Consider cross-training to prevent overuse injuries',
        'Monitor for any signs of overtraining'
      ];
    }

    // Calculate daily goals
    const dailyGoals = {
      steps: 10000,
      calories: Math.round((calories / values.steps) * 10000),
      distance: Math.round((distance / values.steps) * 10000 * 100) / 100,
    };

    setResult({
      caloriesBurned: calories,
      distance,
      duration,
      pace,
      interpretation,
      recommendations,
      warningSigns: warningSigns(),
      plan: plan(),
      dailyGoals,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Footprints className="h-5 w-5" /> Step-to-Calorie Converter</CardTitle>
          <CardDescription>Convert your steps into calories burned based on body composition, walking speed, and terrain to track your daily activity.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="steps" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Steps</FormLabel>
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
                <FormField control={form.control} name="walkingSpeed" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Walking Speed</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select walking speed" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="slow">Slow (3 km/h)</SelectItem>
                        <SelectItem value="moderate">Moderate (4.5 km/h)</SelectItem>
                        <SelectItem value="brisk">Brisk (6 km/h)</SelectItem>
                        <SelectItem value="fast">Fast (7.5 km/h)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="terrain" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Terrain Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select terrain type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="flat">Flat (sidewalk, track)</SelectItem>
                        <SelectItem value="hilly">Hilly (rolling hills)</SelectItem>
                        <SelectItem value="stairs">Stairs (climbing)</SelectItem>
                        <SelectItem value="mixed">Mixed (various terrain)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Convert Steps to Calories</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Activity className="h-8 w-8 text-primary" /><CardTitle>Step-to-Calorie Conversion</CardTitle></div>
              <CardDescription>Your activity analysis and calorie burn estimate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded">
                  <p className="text-2xl font-bold text-primary">{result.caloriesBurned}</p>
                  <p className="text-sm text-muted-foreground">Calories Burned</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <p className="text-2xl font-bold text-primary">{result.distance} km</p>
                  <p className="text-sm text-muted-foreground">Distance Walked</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <p className="text-2xl font-bold text-primary">{result.duration} min</p>
                  <p className="text-sm text-muted-foreground">Duration</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <p className="text-2xl font-bold text-primary">{result.pace}</p>
                  <p className="text-sm text-muted-foreground">Pace</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily Goal Projection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded">
                  <p className="text-2xl font-bold text-primary">{result.dailyGoals.steps.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Steps (10K goal)</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <p className="text-2xl font-bold text-primary">{result.dailyGoals.calories}</p>
                  <p className="text-sm text-muted-foreground">Calories at 10K steps</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <p className="text-2xl font-bold text-primary">{result.dailyGoals.distance} km</p>
                  <p className="text-sm text-muted-foreground">Distance at 10K steps</p>
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
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Step Count Improvement Plan</CardTitle>
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
                <Link href="/category/health-fitness/daily-activity-points-calculator" className="text-primary hover:underline">
                  Daily Activity Points Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Track comprehensive daily activity including steps, exercise, sleep, and hydration.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/standing-vs-sitting-calorie-burn-calculator" className="text-primary hover:underline">
                  Standing vs Sitting Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Compare calorie burn between sitting and standing to optimize daily activity.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/calorie-burn-calculator" className="text-primary hover:underline">
                  Calorie Burn Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Calculate calories burned for various activities to complement step tracking.</p>
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
          <CardTitle>Complete Guide: Understanding Step Counting and Calorie Burn</CardTitle>
          <CardDescription>Evidence-based information about step counting and walking for health</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            Step counting is one of the most accessible ways to track physical activity. The popular 10,000 steps per day goal originated from a Japanese pedometer marketing campaign in the 1960s, but research has shown it's a reasonable target for general health benefits.
          </p>
          <p>
            Calories burned per step vary based on body weight, walking speed, and terrain. Heavier individuals burn more calories per step, and faster walking significantly increases calorie burn. Hilly terrain and stairs require more energy than flat surfaces.
          </p>
          <p>
            Health benefits of walking include improved cardiovascular health, better blood sugar control, enhanced mental health, stronger bones, better sleep quality, and weight management. Aim for at least 5,000-7,500 steps daily, with 10,000 steps as an excellent goal for most adults.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Common questions about step counting and calorie burn</CardDescription>
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
