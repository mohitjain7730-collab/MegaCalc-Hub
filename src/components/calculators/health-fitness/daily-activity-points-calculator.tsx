'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Activity, Calendar, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  age: z.number().positive('Age must be positive'),
  weight: z.number().positive('Weight must be positive'),
  gender: z.enum(['male', 'female']),
  activities: z.array(z.object({
    activity: z.string().min(1, 'Activity is required'),
    duration: z.number().positive('Duration must be positive'),
    intensity: z.enum(['low', 'moderate', 'high', 'very_high']),
  })).min(1, 'At least one activity is required'),
  steps: z.number().min(0, 'Steps cannot be negative'),
  sleepHours: z.number().min(0, 'Sleep hours cannot be negative').max(24, 'Sleep hours cannot exceed 24'),
  waterIntake: z.number().min(0, 'Water intake cannot be negative'),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  totalPoints: number;
  activityPoints: number;
  stepsPoints: number;
  sleepPoints: number;
  hydrationPoints: number;
  level: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  weeklyGoal: number;
  achievements: string[];
};

const understandingInputs = [
  {
    label: 'Age, Weight & Gender',
    description: 'Demographics affect baseline metabolic rate and activity point calculations. Older adults and different body compositions have varying calorie needs.',
  },
  {
    label: 'Daily Activities',
    description: 'Track all structured exercise and physical activities. Include type, duration, and intensity level. Higher intensity and longer duration earn more points.',
  },
  {
    label: 'Daily Steps',
    description: 'Total steps taken throughout the day from all activities. Steps contribute points based on daily totals, with 10,000+ steps earning maximum points.',
  },
  {
    label: 'Sleep Hours',
    description: 'Total hours of sleep per night. Optimal sleep (7-9 hours) earns maximum points, while too little or too much sleep reduces points.',
  },
  {
    label: 'Water Intake',
    description: 'Daily water consumption in milliliters. Points are based on meeting recommended intake (35ml per kg body weight).',
  },
];

const faqs: [string, string][] = [
  [
    'What are daily activity points?',
    'Daily activity points provide a comprehensive scoring system that tracks exercise, steps, sleep, and hydration. Higher scores indicate better overall health and activity levels.',
  ],
  [
    'How are activity points calculated?',
    'Activity points are based on exercise type, duration, and intensity. Points are awarded per 15-minute blocks, with higher intensity activities earning more points per minute.',
  ],
  [
    'What is a good daily activity points score?',
    'Scores of 40-59 points indicate good activity levels, 60-79 points are excellent, and 80+ points represent elite performance. Scores below 25 indicate need for improvement.',
  ],
  [
    'How do steps contribute to points?',
    'Steps earn points based on daily totals: 15,000+ steps = 20 points, 12,000-14,999 = 15 points, 10,000-11,999 = 10 points, with decreasing points for lower step counts.',
  ],
  [
    'Why is sleep included in activity points?',
    'Sleep is crucial for recovery, performance, and overall health. Optimal sleep (7-9 hours) earns maximum points because it supports all other activities and health goals.',
  ],
  [
    'How does hydration affect points?',
    'Hydration points are based on meeting recommended daily intake (35ml per kg body weight). Meeting 100% of recommended intake earns maximum hydration points.',
  ],
  [
    'Can I improve my activity points score?',
    'Yes. Increase exercise duration and intensity, aim for 10,000+ steps daily, prioritize 7-9 hours of sleep, and meet daily hydration goals to improve your score.',
  ],
  [
    'What if my score is very low?',
    'Start with small, achievable goals. Add 15-30 minutes of daily activity, aim for 5,000 steps, prioritize sleep, and drink water with meals. Gradually increase over weeks.',
  ],
  [
    'Should I track points every day?',
    'Daily tracking helps build consistency and awareness. However, focus on weekly averages and trends rather than day-to-day fluctuations for better perspective.',
  ],
  [
    'How do achievements work?',
    'Achievements are unlocked when you reach specific milestones in different categories (activity, steps, sleep, hydration) or achieve high total point scores.',
  ],
];

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Establish baseline: track all activities, steps, sleep, and hydration to calculate your current activity points score.' },
  { week: 2, focus: 'Set goals: aim to increase your score by 5-10 points through small improvements in each category.' },
  { week: 3, focus: 'Optimize sleep: prioritize 7-9 hours of quality sleep per night to maximize sleep points and support recovery.' },
  { week: 4, focus: 'Increase steps: aim for 10,000 steps daily by taking walking breaks, using stairs, and parking farther away.' },
  { week: 5, focus: 'Enhance activities: add 30 minutes of moderate exercise or increase intensity of existing activities.' },
  { week: 6, focus: 'Improve hydration: meet daily water intake goals (35ml per kg) by drinking water consistently throughout the day.' },
  { week: 7, focus: 'Build consistency: maintain improvements across all categories and track progress toward your goals.' },
  { week: 8, focus: 'Establish long-term habits: integrate activity points tracking into your regular lifestyle for sustained health benefits.' },
];

const warningSigns = () => [
  'Activity points are estimates and should not replace professional health advice or medical assessment.',
  'Very high activity levels (80+ points) may indicate overtraining—ensure adequate rest and recovery.',
  'If experiencing pain, fatigue, or health concerns, consult a healthcare provider before increasing activity.',
  'Rapid increases in activity may lead to injury—gradually increase exercise duration and intensity over weeks.',
];

export default function DailyActivityPointsCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      weight: undefined,
      gender: undefined,
      activities: [{ activity: '', duration: undefined, intensity: undefined }],
      steps: undefined,
      sleepHours: undefined,
      waterIntake: undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'activities',
  });

  const activityPointValues = {
    'walking': { low: 2, moderate: 3, high: 4, very_high: 5 },
    'running': { low: 4, moderate: 6, high: 8, very_high: 10 },
    'cycling': { low: 3, moderate: 5, high: 7, very_high: 9 },
    'swimming': { low: 4, moderate: 6, high: 8, very_high: 10 },
    'strength_training': { low: 3, moderate: 5, high: 7, very_high: 9 },
    'yoga': { low: 2, moderate: 3, high: 4, very_high: 5 },
    'dancing': { low: 3, moderate: 5, high: 7, very_high: 9 },
    'sports': { low: 4, moderate: 6, high: 8, very_high: 10 },
    'hiking': { low: 3, moderate: 5, high: 7, very_high: 9 },
    'housework': { low: 1, moderate: 2, high: 3, very_high: 4 },
    'gardening': { low: 2, moderate: 3, high: 4, very_high: 5 },
    'other': { low: 2, moderate: 4, high: 6, very_high: 8 },
  };

  const calculateActivityPoints = (activities: any[]) => {
    let totalPoints = 0;
    
    activities.forEach(activity => {
      if (activity.activity && activity.duration && activity.intensity) {
        const activityData = activityPointValues[activity.activity as keyof typeof activityPointValues] || activityPointValues.other;
        const pointsPerMinute = activityData[activity.intensity];
        const activityPoints = Math.round((activity.duration / 15) * pointsPerMinute); // Points per 15-minute block
        totalPoints += activityPoints;
      }
    });
    
    return totalPoints;
  };

  const calculateStepsPoints = (steps: number) => {
    if (steps >= 15000) return 20;
    if (steps >= 12000) return 15;
    if (steps >= 10000) return 10;
    if (steps >= 7500) return 7;
    if (steps >= 5000) return 5;
    return Math.floor(steps / 1000); // 1 point per 1000 steps
  };

  const calculateSleepPoints = (sleepHours: number) => {
    if (sleepHours >= 8 && sleepHours <= 9) return 10; // Optimal sleep
    if (sleepHours >= 7 && sleepHours <= 10) return 7; // Good sleep
    if (sleepHours >= 6 && sleepHours <= 11) return 4; // Fair sleep
    if (sleepHours >= 5 && sleepHours <= 12) return 2; // Poor sleep
    return 0; // Very poor sleep
  };

  const calculateHydrationPoints = (waterIntake: number, weight: number) => {
    const recommendedIntake = weight * 35; // 35ml per kg body weight
    const percentage = (waterIntake / recommendedIntake) * 100;
    
    if (percentage >= 100) return 10;
    if (percentage >= 80) return 8;
    if (percentage >= 60) return 6;
    if (percentage >= 40) return 4;
    if (percentage >= 20) return 2;
    return 0;
  };

  const getActivityLevel = (totalPoints: number) => {
    if (totalPoints >= 80) return 'Elite';
    if (totalPoints >= 60) return 'Excellent';
    if (totalPoints >= 40) return 'Good';
    if (totalPoints >= 25) return 'Fair';
    if (totalPoints >= 15) return 'Poor';
    return 'Very Poor';
  };

  const getAchievements = (points: any) => {
    const achievements = [];
    
    if (points.activity >= 30) achievements.push('🏃‍♂️ Activity Champion');
    if (points.steps >= 15) achievements.push('👟 Step Master');
    if (points.sleep >= 8) achievements.push('😴 Sleep Optimizer');
    if (points.hydration >= 8) achievements.push('💧 Hydration Hero');
    if (points.total >= 60) achievements.push('⭐ Daily Achiever');
    if (points.total >= 80) achievements.push('🏆 Elite Performer');
    
    return achievements;
  };

  const onSubmit = (values: FormValues) => {
    const activityPoints = calculateActivityPoints(values.activities);
    const stepsPoints = calculateStepsPoints(values.steps);
    const sleepPoints = calculateSleepPoints(values.sleepHours);
    const hydrationPoints = calculateHydrationPoints(values.waterIntake, values.weight);
    
    const totalPoints = activityPoints + stepsPoints + sleepPoints + hydrationPoints;
    const level = getActivityLevel(totalPoints);
    
    const points = {
      total: totalPoints,
      activity: activityPoints,
      steps: stepsPoints,
      sleep: sleepPoints,
      hydration: hydrationPoints,
    };
    
    const achievements = getAchievements(points);

    let interpretation = '';
    let recommendations: string[] = [];

    if (totalPoints >= 60) {
      interpretation = 'Outstanding! You\'re maintaining an excellent level of daily activity and healthy habits. Keep up the great work!';
      recommendations = [
        'Maintain your current activity level',
        'Consider adding variety to prevent boredom',
        'Share your success to motivate others',
        'Set new challenges to keep improving'
      ];
    } else if (totalPoints >= 40) {
      interpretation = 'Good job! You\'re doing well with your daily activities. There\'s room for improvement to reach optimal health.';
      recommendations = [
        'Aim for 10,000+ steps daily',
        'Add 30 minutes of moderate exercise',
        'Improve sleep quality and duration',
        'Increase water intake throughout the day'
      ];
    } else if (totalPoints >= 25) {
      interpretation = 'You\'re making progress but could benefit from more consistent activity. Focus on building healthy daily habits.';
      recommendations = [
        'Start with small, achievable goals',
        'Take walking breaks throughout the day',
        'Establish a regular sleep schedule',
        'Set reminders to drink water regularly'
      ];
    } else {
      interpretation = 'Your activity level needs improvement. Start with small changes and gradually build healthier habits.';
      recommendations = [
        'Begin with 5,000 steps per day',
        'Add 15 minutes of light activity',
        'Prioritize getting 7-8 hours of sleep',
        'Drink water with every meal',
        'Consider consulting a healthcare provider'
      ];
    }

    const weeklyGoal = Math.max(25, totalPoints * 0.8); // 80% of current score as minimum weekly goal

    setResult({
      totalPoints,
      activityPoints,
      stepsPoints,
      sleepPoints,
      hydrationPoints,
      level,
      interpretation,
      recommendations,
      warningSigns: warningSigns(),
      plan: plan(),
      weeklyGoal: Math.round(weeklyGoal),
      achievements,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5" /> Daily Activity Points Calculator</CardTitle>
          <CardDescription>Track comprehensive daily activity including exercise, steps, sleep, and hydration with a unified points system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Daily Activities</h3>
                  <Button type="button" variant="outline" onClick={() => append({ activity: '', duration: undefined, intensity: undefined })}>
                    Add Activity
                  </Button>
                </div>
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                    <FormField 
                      control={form.control} 
                      name={`activities.${index}.activity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Activity</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select activity" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="walking">Walking</SelectItem>
                              <SelectItem value="running">Running</SelectItem>
                              <SelectItem value="cycling">Cycling</SelectItem>
                              <SelectItem value="swimming">Swimming</SelectItem>
                              <SelectItem value="strength_training">Strength Training</SelectItem>
                              <SelectItem value="yoga">Yoga</SelectItem>
                              <SelectItem value="dancing">Dancing</SelectItem>
                              <SelectItem value="sports">Sports</SelectItem>
                              <SelectItem value="hiking">Hiking</SelectItem>
                              <SelectItem value="housework">Housework</SelectItem>
                              <SelectItem value="gardening">Gardening</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} 
                    />
                    <FormField 
                      control={form.control} 
                      name={`activities.${index}.duration`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (minutes)</FormLabel>
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
                      )} 
                    />
                    <FormField 
                      control={form.control} 
                      name={`activities.${index}.intensity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Intensity</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select intensity" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="moderate">Moderate</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="very_high">Very High</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} 
                    />
                    {fields.length > 1 && (
                      <div className="flex items-end">
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="steps" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily Steps</FormLabel>
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
                <FormField control={form.control} name="sleepHours" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sleep Hours</FormLabel>
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
                <FormField control={form.control} name="waterIntake" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Water Intake (ml)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="50"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate Activity Points</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Activity className="h-8 w-8 text-primary" /><CardTitle>Daily Activity Score</CardTitle></div>
              <CardDescription>Your comprehensive activity assessment and points breakdown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{result.totalPoints}</p>
                <p className="text-lg text-muted-foreground">Total Points</p>
                <p className="text-xl font-semibold text-primary">{result.level}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded">
                  <p className="text-2xl font-bold text-blue-500">{result.activityPoints}</p>
                  <p className="text-sm text-muted-foreground">Activity Points</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <p className="text-2xl font-bold text-green-500">{result.stepsPoints}</p>
                  <p className="text-sm text-muted-foreground">Steps Points</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <p className="text-2xl font-bold text-purple-500">{result.sleepPoints}</p>
                  <p className="text-sm text-muted-foreground">Sleep Points</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <p className="text-2xl font-bold text-cyan-500">{result.hydrationPoints}</p>
                  <p className="text-sm text-muted-foreground">Hydration Points</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {result.achievements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Achievements Unlocked</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.achievements.map((achievement, index) => (
                    <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      {achievement}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Weekly Goal:</h4>
                  <p className="text-sm text-muted-foreground">
                    Aim for at least {result.weeklyGoal} points per day to maintain your current level of health and activity.
                  </p>
                </div>
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
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Activity Points Improvement Plan</CardTitle>
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
          <CardDescription>Build a comprehensive health and fitness assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/step-to-calorie-converter" className="text-primary hover:underline">
                  Step-to-Calorie Converter
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Convert steps to calories to complement activity points tracking.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/standing-vs-sitting-calorie-burn-calculator" className="text-primary hover:underline">
                  Standing vs Sitting Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Compare calorie burn between positions to optimize daily activity.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/sleep-quality-calculator" className="text-primary hover:underline">
                  Sleep Quality Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Assess sleep quality to optimize sleep points and overall health.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/hydration-calculator" className="text-primary hover:underline">
                  Hydration Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Calculate optimal hydration needs to maximize hydration points.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Guide: Understanding Daily Activity Points</CardTitle>
          <CardDescription>Evidence-based information about comprehensive activity tracking</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            The daily activity points system provides a comprehensive way to track overall health and wellness by scoring exercise, steps, sleep, and hydration. It goes beyond just exercise to include all aspects of a healthy lifestyle.
          </p>
          <p>
            Activity points are based on exercise type, duration, and intensity, with higher-intensity activities earning more points per minute. Steps contribute points based on daily totals (10,000+ steps earn maximum points), sleep is scored based on optimal health recommendations (7-9 hours), and hydration points are based on meeting recommended intake (35ml per kg body weight).
          </p>
          <p>
            Activity levels range from Very Poor (below 15 points) to Elite (80+ points). Focus on consistency across all categories rather than excelling in just one area. Small improvements in each category can significantly increase your total score.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Common questions about daily activity points and tracking</CardDescription>
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
