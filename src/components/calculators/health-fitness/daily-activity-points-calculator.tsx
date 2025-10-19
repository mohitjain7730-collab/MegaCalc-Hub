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
import { Trophy } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  age: z.number().positive('Age must be positive'),
  weight: z.number().positive('Weight must be positive'),
  gender: z.enum(['male', 'female']),
  activities: z.array(z.object({
    activity: z.string(),
    duration: z.number().positive('Duration must be positive'),
    intensity: z.enum(['low', 'moderate', 'high', 'very_high']),
  })).min(1, 'At least one activity is required'),
  steps: z.number().min(0, 'Steps cannot be negative'),
  sleepHours: z.number().min(0, 'Sleep hours cannot be negative').max(24, 'Sleep hours cannot exceed 24'),
  waterIntake: z.number().min(0, 'Water intake cannot be negative'),
});

type FormValues = z.infer<typeof formSchema>;

export default function DailyActivityPointsCalculator() {
  const [result, setResult] = useState<{
    totalPoints: number;
    activityPoints: number;
    stepsPoints: number;
    sleepPoints: number;
    hydrationPoints: number;
    level: string;
    interpretation: string;
    recommendations: string[];
    weeklyGoal: number;
    achievements: string[];
  } | null>(null);

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
      weeklyGoal: Math.round(weeklyGoal),
      achievements,
    });
  };

  const addActivity = () => {
    const currentActivities = form.getValues('activities');
    form.setValue('activities', [...currentActivities, { activity: '', duration: undefined, intensity: undefined }]);
  };

  const removeActivity = (index: number) => {
    const currentActivities = form.getValues('activities');
    if (currentActivities.length > 1) {
      form.setValue('activities', currentActivities.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField 
              control={form.control} 
              name="age" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age (years)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter your age"
                      {...field} 
                      value={field.value ?? ''} 
                      onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <FormField 
              control={form.control} 
              name="weight" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (kg)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter your weight"
                      {...field} 
                      value={field.value ?? ''} 
                      onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <FormField 
              control={form.control} 
              name="gender" 
              render={({ field }) => (
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
              )} 
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Daily Activities</h3>
              <Button type="button" variant="outline" onClick={addActivity}>
                Add Activity
              </Button>
            </div>
            {form.watch('activities').map((_, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
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
                          placeholder="Enter duration"
                          {...field} 
                          value={field.value ?? ''} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
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
                {form.watch('activities').length > 1 && (
                  <div className="flex items-end">
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="sm"
                      onClick={() => removeActivity(index)}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField 
              control={form.control} 
              name="steps" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Daily Steps</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter daily steps"
                      {...field} 
                      value={field.value ?? ''} 
                      onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <FormField 
              control={form.control} 
              name="sleepHours" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sleep Hours</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter sleep hours"
                      {...field} 
                      value={field.value ?? ''} 
                      onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <FormField 
              control={form.control} 
              name="waterIntake" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Water Intake (ml)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter water intake"
                      {...field} 
                      value={field.value ?? ''} 
                      onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
          </div>
          <Button type="submit">Calculate Activity Points</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Trophy className="h-8 w-8 text-primary" />
                <CardTitle>Daily Activity Score</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{result.totalPoints}</p>
                <p className="text-lg text-muted-foreground">Total Points</p>
                <p className="text-xl font-semibold text-primary">{result.level}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-500">{result.activityPoints}</p>
                  <p className="text-sm text-muted-foreground">Activity Points</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">{result.stepsPoints}</p>
                  <p className="text-sm text-muted-foreground">Steps Points</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-500">{result.sleepPoints}</p>
                  <p className="text-sm text-muted-foreground">Sleep Points</p>
                </div>
                <div className="text-center">
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

          <Card>
            <CardHeader>
              <CardTitle>Analysis & Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{result.interpretation}</p>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Recommendations:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {result.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Weekly Goal:</h4>
                  <p className="text-muted-foreground">
                    Aim for at least {result.weeklyGoal} points per day to maintain your current level of health and activity.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>
              This calculator assigns points based on your daily activities, steps, sleep quality, and hydration. 
              Each component is scored independently and contributes to your total daily activity score.
            </p>
            <p>
              The scoring system considers the intensity and duration of activities, with higher-intensity activities 
              earning more points per minute. Sleep and hydration are scored based on optimal health recommendations.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="guide">
          <AccordionTrigger>Complete Guide to Daily Activity Points</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Understanding the Point System</h4>
              <p>
                The daily activity points system provides a comprehensive way to track your overall health and 
                wellness. It goes beyond just exercise to include all aspects of a healthy lifestyle.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Activity Points Breakdown</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Low Intensity:</strong> 2-4 points per 15 minutes (walking, light yoga)</li>
                <li><strong>Moderate Intensity:</strong> 3-6 points per 15 minutes (brisk walking, cycling)</li>
                <li><strong>High Intensity:</strong> 4-8 points per 15 minutes (running, swimming)</li>
                <li><strong>Very High Intensity:</strong> 5-10 points per 15 minutes (HIIT, competitive sports)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Steps Points</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>15,000+ steps:</strong> 20 points (Elite level)</li>
                <li><strong>12,000-14,999 steps:</strong> 15 points (Excellent)</li>
                <li><strong>10,000-11,999 steps:</strong> 10 points (Good)</li>
                <li><strong>7,500-9,999 steps:</strong> 7 points (Fair)</li>
                <li><strong>5,000-7,499 steps:</strong> 5 points (Poor)</li>
                <li><strong>Below 5,000 steps:</strong> 1 point per 1,000 steps</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Sleep Points</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>8-9 hours:</strong> 10 points (Optimal)</li>
                <li><strong>7-10 hours:</strong> 7 points (Good)</li>
                <li><strong>6-11 hours:</strong> 4 points (Fair)</li>
                <li><strong>5-12 hours:</strong> 2 points (Poor)</li>
                <li><strong>Outside 5-12 hours:</strong> 0 points (Very poor)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Hydration Points</h4>
              <p>
                Based on 35ml of water per kg of body weight (recommended daily intake):
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>100%+ of recommended:</strong> 10 points</li>
                <li><strong>80-99%:</strong> 8 points</li>
                <li><strong>60-79%:</strong> 6 points</li>
                <li><strong>40-59%:</strong> 4 points</li>
                <li><strong>20-39%:</strong> 2 points</li>
                <li><strong>Below 20%:</strong> 0 points</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Activity Levels</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Elite (80+ points):</strong> Exceptional daily activity and health habits</li>
                <li><strong>Excellent (60-79 points):</strong> Very good activity level and health habits</li>
                <li><strong>Good (40-59 points):</strong> Solid activity level with room for improvement</li>
                <li><strong>Fair (25-39 points):</strong> Moderate activity, needs more consistency</li>
                <li><strong>Poor (15-24 points):</strong> Low activity level, significant improvement needed</li>
                <li><strong>Very Poor (Below 15 points):</strong> Minimal activity, major lifestyle changes needed</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Tips for Improving Your Score</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Start Small:</strong> Begin with 15-30 minutes of daily activity</li>
                <li><strong>Mix It Up:</strong> Combine different types of activities</li>
                <li><strong>Track Everything:</strong> Use apps or journals to monitor progress</li>
                <li><strong>Set Goals:</strong> Aim for specific point targets each week</li>
                <li><strong>Focus on Consistency:</strong> Better to do a little daily than a lot occasionally</li>
                <li><strong>Get Support:</strong> Find workout partners or join fitness groups</li>
                <li><strong>Celebrate Achievements:</strong> Acknowledge your progress and milestones</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related-calculators">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Activity Tracking</h4>
                <ul className="space-y-1">
                  <li><a href="/category/health-fitness/step-to-calorie-converter" className="text-primary underline">Step-to-Calorie Converter</a></li>
                  <li><a href="/category/health-fitness/standing-vs-sitting-calorie-burn-calculator" className="text-primary underline">Standing vs Sitting Calculator</a></li>
                  <li><a href="/category/health-fitness/calorie-burn-calculator" className="text-primary underline">Calorie Burn Calculator</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Health & Wellness</h4>
                <ul className="space-y-1">
                  <li><a href="/category/health-fitness/bmr-calculator" className="text-primary underline">BMR Calculator</a></li>
                  <li><a href="/category/health-fitness/sleep-quality-calculator" className="text-primary underline">Sleep Quality Calculator</a></li>
                  <li><a href="/category/health-fitness/hydration-calculator" className="text-primary underline">Hydration Calculator</a></li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
