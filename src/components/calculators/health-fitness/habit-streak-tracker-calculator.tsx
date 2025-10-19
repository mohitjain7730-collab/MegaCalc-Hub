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
import { Target } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  habitType: z.enum(['exercise', 'nutrition', 'sleep', 'hydration', 'meditation', 'reading', 'other']),
  currentStreak: z.number().min(0, 'Current streak cannot be negative'),
  longestStreak: z.number().min(0, 'Longest streak cannot be negative'),
  habitFrequency: z.enum(['daily', 'weekly', 'monthly']),
  habitDifficulty: z.enum(['easy', 'moderate', 'hard', 'very_hard']),
  habitDuration: z.number().min(1, 'Habit duration must be at least 1 minute'),
  consistency: z.enum(['poor', 'fair', 'good', 'excellent']),
  motivation: z.enum(['low', 'moderate', 'high', 'very_high']),
  supportSystem: z.enum(['none', 'family', 'friends', 'professional', 'community']),
  habitAge: z.number().min(0, 'Habit age cannot be negative'),
});

type FormValues = z.infer<typeof formSchema>;

export default function HabitStreakTrackerCalculator() {
  const [result, setResult] = useState<{
    habitScore: number;
    streakAnalysis: string;
    consistencyRating: string;
    recommendations: string[];
    milestones: string[];
    habitStrength: number;
    projectedSuccess: string;
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      habitType: undefined,
      currentStreak: undefined,
      longestStreak: undefined,
      habitFrequency: undefined,
      habitDifficulty: undefined,
      habitDuration: undefined,
      consistency: undefined,
      motivation: undefined,
      supportSystem: undefined,
      habitAge: undefined,
    },
  });

  const calculateHabitScore = (values: FormValues) => {
    let score = 0;
    
    // Current streak impact (exponential growth)
    if (values.currentStreak >= 365) score += 40;
    else if (values.currentStreak >= 100) score += 30;
    else if (values.currentStreak >= 30) score += 20;
    else if (values.currentStreak >= 7) score += 10;
    else score += values.currentStreak * 1.5;

    // Longest streak impact
    if (values.longestStreak >= 365) score += 20;
    else if (values.longestStreak >= 100) score += 15;
    else if (values.longestStreak >= 30) score += 10;
    else score += values.longestStreak * 0.5;

    // Frequency impact
    const frequencyMultiplier = {
      daily: 1.0,
      weekly: 0.7,
      monthly: 0.4,
    };
    score *= frequencyMultiplier[values.habitFrequency];

    // Difficulty impact (harder habits get more points)
    const difficultyMultiplier = {
      easy: 0.8,
      moderate: 1.0,
      hard: 1.2,
      very_hard: 1.5,
    };
    score *= difficultyMultiplier[values.habitDifficulty];

    // Consistency impact
    const consistencyBonus = {
      poor: 0,
      fair: 5,
      good: 10,
      excellent: 15,
    };
    score += consistencyBonus[values.consistency];

    // Motivation impact
    const motivationBonus = {
      low: 0,
      moderate: 5,
      high: 10,
      very_high: 15,
    };
    score += motivationBonus[values.motivation];

    // Support system impact
    const supportBonus = {
      none: 0,
      family: 5,
      friends: 8,
      professional: 10,
      community: 12,
    };
    score += supportBonus[values.supportSystem];

    // Habit age impact (older habits are more established)
    if (values.habitAge >= 2) score += 10;
    else if (values.habitAge >= 1) score += 5;
    else score += values.habitAge * 2;

    return Math.min(100, Math.max(0, score));
  };

  const getStreakAnalysis = (currentStreak: number, longestStreak: number) => {
    if (currentStreak === longestStreak && currentStreak >= 30) {
      return 'Excellent! You\'re maintaining your best streak and building strong momentum.';
    } else if (currentStreak >= 21) {
      return 'Great progress! You\'ve established a solid habit foundation.';
    } else if (currentStreak >= 7) {
      return 'Good start! You\'re building consistency and forming the habit.';
    } else if (currentStreak >= 3) {
      return 'Early stage! Keep going to build momentum and establish the routine.';
    } else {
      return 'Getting started! Every day counts toward building this healthy habit.';
    }
  };

  const getConsistencyRating = (consistency: string, currentStreak: number) => {
    if (consistency === 'excellent' && currentStreak >= 30) return 'Habit Master';
    if (consistency === 'good' && currentStreak >= 21) return 'Consistent Performer';
    if (consistency === 'fair' && currentStreak >= 7) return 'Building Momentum';
    if (currentStreak >= 3) return 'Getting Started';
    return 'Habit Beginner';
  };

  const getHabitStrength = (values: FormValues) => {
    let strength = 0;
    
    // Streak strength
    strength += Math.min(values.currentStreak * 2, 40);
    
    // Consistency strength
    const consistencyStrength = {
      poor: 0,
      fair: 10,
      good: 20,
      excellent: 30,
    };
    strength += consistencyStrength[values.consistency];
    
    // Age strength
    strength += Math.min(values.habitAge * 5, 20);
    
    // Support strength
    const supportStrength = {
      none: 0,
      family: 5,
      friends: 8,
      professional: 10,
      community: 12,
    };
    strength += supportStrength[values.supportSystem];
    
    return Math.min(100, strength);
  };

  const onSubmit = (values: FormValues) => {
    const habitScore = calculateHabitScore(values);
    const streakAnalysis = getStreakAnalysis(values.currentStreak, values.longestStreak);
    const consistencyRating = getConsistencyRating(values.consistency, values.currentStreak);
    const habitStrength = getHabitStrength(values);

    let recommendations: string[] = [];
    let milestones: string[] = [];
    let projectedSuccess = '';

    if (habitScore >= 80) {
      recommendations = [
        'Maintain your excellent habit consistency',
        'Consider adding related habits to build a comprehensive routine',
        'Share your success to inspire others',
        'Set new challenges to keep the habit engaging'
      ];
      milestones = [
        '🎯 1 Year Streak (365 days)',
        '🏆 2 Year Streak (730 days)',
        '💪 Add a complementary habit',
        '🌟 Mentor someone else starting this habit'
      ];
      projectedSuccess = 'Excellent! You have a very strong habit with high likelihood of long-term success.';
    } else if (habitScore >= 60) {
      recommendations = [
        'Focus on maintaining consistency during challenging periods',
        'Identify and address any obstacles to your habit',
        'Celebrate your progress and stay motivated',
        'Consider joining a community for additional support'
      ];
      milestones = [
        '🎯 30 Day Streak',
        '🏆 100 Day Streak',
        '💪 1 Year Streak (365 days)',
        '🌟 Improve consistency to excellent level'
      ];
      projectedSuccess = 'Good! You have a solid habit with good potential for long-term success.';
    } else if (habitScore >= 40) {
      recommendations = [
        'Focus on building consistency before increasing difficulty',
        'Set smaller, achievable daily goals',
        'Find an accountability partner or support group',
        'Remove obstacles that make the habit harder to maintain'
      ];
      milestones = [
        '🎯 7 Day Streak',
        '🏆 21 Day Streak',
        '💪 30 Day Streak',
        '🌟 Improve consistency rating'
      ];
      projectedSuccess = 'Moderate potential for success. Focus on consistency and removing barriers.';
    } else {
      recommendations = [
        'Start with very small, manageable goals',
        'Focus on just showing up daily, even for 2-5 minutes',
        'Build a strong support system',
        'Consider if the habit is the right fit for your current lifestyle'
      ];
      milestones = [
        '🎯 3 Day Streak',
        '🏆 7 Day Streak',
        '💪 21 Day Streak',
        '🌟 Build consistency and motivation'
      ];
      projectedSuccess = 'Early stage habit. Success depends on building strong foundations and consistency.';
    }

    setResult({
      habitScore,
      streakAnalysis,
      consistencyRating,
      recommendations,
      milestones,
      habitStrength,
      projectedSuccess,
    });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField 
              control={form.control} 
              name="habitType" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Habit Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select habit type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="exercise">Exercise</SelectItem>
                      <SelectItem value="nutrition">Nutrition</SelectItem>
                      <SelectItem value="sleep">Sleep</SelectItem>
                      <SelectItem value="hydration">Hydration</SelectItem>
                      <SelectItem value="meditation">Meditation</SelectItem>
                      <SelectItem value="reading">Reading</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <FormField 
              control={form.control} 
              name="currentStreak" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Streak (days)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter current streak"
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
              name="longestStreak" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longest Streak (days)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter longest streak"
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
              name="habitFrequency" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Habit Frequency</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <FormField 
              control={form.control} 
              name="habitDifficulty" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Habit Difficulty</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                      <SelectItem value="very_hard">Very Hard</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <FormField 
              control={form.control} 
              name="habitDuration" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Habit Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter duration in minutes"
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
              name="consistency" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Consistency Level</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select consistency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="poor">Poor (frequently missed)</SelectItem>
                      <SelectItem value="fair">Fair (occasionally missed)</SelectItem>
                      <SelectItem value="good">Good (rarely missed)</SelectItem>
                      <SelectItem value="excellent">Excellent (never missed)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <FormField 
              control={form.control} 
              name="motivation" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivation Level</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select motivation" />
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
            <FormField 
              control={form.control} 
              name="supportSystem" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Support System</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select support system" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="friends">Friends</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="community">Community</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <FormField 
              control={form.control} 
              name="habitAge" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Habit Age (months)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.5"
                      placeholder="Enter habit age in months"
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
          <Button type="submit">Analyze Habit Streak</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Target className="h-8 w-8 text-primary" />
                <CardTitle>Habit Streak Analysis</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{result.habitScore}/100</p>
                  <p className="text-sm text-muted-foreground">Habit Score</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{result.consistencyRating}</p>
                  <p className="text-sm text-muted-foreground">Consistency Rating</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{result.habitStrength}/100</p>
                  <p className="text-sm text-muted-foreground">Habit Strength</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Streak Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{result.streakAnalysis}</p>
              <p className="text-muted-foreground">{result.projectedSuccess}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommendations & Milestones</CardTitle>
            </CardHeader>
            <CardContent>
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
                  <h4 className="font-semibold mb-2">Next Milestones:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {result.milestones.map((milestone, index) => (
                      <li key={index}>{milestone}</li>
                    ))}
                  </ul>
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
              This calculator analyzes your habit formation progress by evaluating multiple factors including 
              current streak, consistency, motivation, support system, and habit characteristics. It provides 
              insights into your habit strength and likelihood of long-term success.
            </p>
            <p>
              The algorithm considers the psychological and behavioral aspects of habit formation, including 
              the exponential benefits of longer streaks and the importance of consistency over perfection.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="guide">
          <AccordionTrigger>Complete Guide to Building Healthy Habits</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">The Science of Habit Formation</h4>
              <p>
                Habits are automatic behaviors that require minimal conscious thought. Research shows that 
                it takes an average of 66 days to form a new habit, but this varies widely depending on 
                the complexity of the behavior and individual factors.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">The Habit Loop</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Cue:</strong> The trigger that initiates the habit</li>
                <li><strong>Routine:</strong> The behavior itself</li>
                <li><strong>Reward:</strong> The benefit or satisfaction gained</li>
                <li><strong>Craving:</strong> The desire for the reward that drives the habit</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Key Milestones in Habit Formation</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Days 1-3:</strong> Initial commitment and motivation</li>
                <li><strong>Days 4-7:</strong> Building momentum and routine</li>
                <li><strong>Days 8-21:</strong> Establishing consistency</li>
                <li><strong>Days 22-66:</strong> Habit becomes more automatic</li>
                <li><strong>Days 67+:</strong> Habit is fully formed and integrated</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Strategies for Building Strong Habits</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Start Small:</strong> Begin with 2-minute versions of your desired habit</li>
                <li><strong>Stack Habits:</strong> Attach new habits to existing ones</li>
                <li><strong>Make It Obvious:</strong> Use visual cues and reminders</li>
                <li><strong>Make It Attractive:</strong> Pair habits with things you enjoy</li>
                <li><strong>Make It Easy:</strong> Remove friction and obstacles</li>
                <li><strong>Make It Satisfying:</strong> Celebrate small wins and progress</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Common Habit Formation Mistakes</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Setting goals that are too ambitious initially</li>
                <li>Not having a clear plan for obstacles</li>
                <li>Focusing on perfection instead of consistency</li>
                <li>Not tracking progress or celebrating wins</li>
                <li>Lacking accountability or support</li>
                <li>Not understanding the underlying motivation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Building a Support System</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Accountability Partner:</strong> Find someone to check in with regularly</li>
                <li><strong>Community:</strong> Join groups with similar goals</li>
                <li><strong>Professional Support:</strong> Consider coaches or therapists</li>
                <li><strong>Family Support:</strong> Involve family members in your journey</li>
                <li><strong>Technology:</strong> Use apps and tools for tracking and reminders</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Maintaining Habits Long-Term</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Focus on systems rather than goals</li>
                <li>Embrace the "never miss twice" rule</li>
                <li>Regularly review and adjust your approach</li>
                <li>Celebrate milestones and progress</li>
                <li>Prepare for challenging periods and setbacks</li>
                <li>Continuously learn and improve your methods</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related-calculators">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Health & Wellness</h4>
                <ul className="space-y-1">
                  <li><a href="/category/health-fitness/daily-activity-points-calculator" className="text-primary underline">Daily Activity Points Calculator</a></li>
                  <li><a href="/category/health-fitness/sleep-quality-calculator" className="text-primary underline">Sleep Quality Calculator</a></li>
                  <li><a href="/category/health-fitness/hydration-calculator" className="text-primary underline">Hydration Calculator</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Fitness & Training</h4>
                <ul className="space-y-1">
                  <li><a href="/category/health-fitness/training-volume-calculator" className="text-primary underline">Training Volume Calculator</a></li>
                  <li><a href="/category/health-fitness/progressive-overload-calculator" className="text-primary underline">Progressive Overload Calculator</a></li>
                  <li><a href="/category/health-fitness/calorie-burn-calculator" className="text-primary underline">Calorie Burn Calculator</a></li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

