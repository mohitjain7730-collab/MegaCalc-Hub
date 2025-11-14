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
import { Target, Activity, Calendar, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

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

type ResultPayload = {
  habitScore: number;
  streakAnalysis: string;
  consistencyRating: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  milestones: string[];
  habitStrength: number;
  projectedSuccess: string;
};

const understandingInputs = [
  {
    label: 'Habit Type',
    description: 'The category of habit you\'re tracking (exercise, nutrition, sleep, etc.) helps contextualize your progress and recommendations.',
  },
  {
    label: 'Current Streak',
    description: 'The number of consecutive days you\'ve maintained this habit. Longer streaks indicate stronger habit formation and higher likelihood of long-term success.',
  },
  {
    label: 'Longest Streak',
    description: 'Your personal best streak length. Comparing current to longest streak helps assess consistency and identify patterns in habit maintenance.',
  },
  {
    label: 'Habit Frequency',
    description: 'How often you perform the habit (daily, weekly, monthly). Daily habits typically form faster and become more automatic than less frequent ones.',
  },
  {
    label: 'Habit Difficulty',
    description: 'The perceived difficulty level of maintaining the habit. Harder habits require more willpower and support but can provide greater rewards when established.',
  },
  {
    label: 'Habit Duration',
    description: 'The time spent on the habit per session (in minutes). Longer durations may be harder to maintain but can provide greater benefits.',
  },
  {
    label: 'Consistency Level',
    description: 'How consistently you perform the habit without missing sessions. Excellent consistency indicates strong habit formation and automaticity.',
  },
  {
    label: 'Motivation Level',
    description: 'Your current motivation to maintain the habit. High motivation helps in early stages, but habits should become automatic and less dependent on motivation over time.',
  },
  {
    label: 'Support System',
    description: 'The type of support you have (family, friends, professional, community). Strong support systems significantly increase habit success rates.',
  },
  {
    label: 'Habit Age',
    description: 'How long you\'ve been working on this habit (in months). Older habits are more established and require less conscious effort to maintain.',
  },
];

const faqs: [string, string][] = [
  [
    'How long does it take to form a habit?',
    'Research suggests it takes an average of 66 days to form a habit, but this varies widely (18-254 days) depending on the complexity of the behavior, individual factors, and consistency.',
  ],
  [
    'What is the best way to build a habit streak?',
    'Start small (2-minute rule), attach the new habit to an existing routine (habit stacking), remove obstacles, make it obvious with visual cues, and focus on consistency over perfection.',
  ],
  [
    'What should I do if I break my streak?',
    'Don\'t let one missed day become two. Use the "never miss twice" rule—get back on track immediately. Analyze what caused the break and adjust your approach to prevent it.',
  ],
  [
    'How important is motivation for habit formation?',
    'Motivation helps in the early stages, but habits should become automatic and less dependent on motivation over time. Focus on systems and environment rather than willpower alone.',
  ],
  [
    'What is the difference between a habit and a routine?',
    'A habit is an automatic behavior triggered by a cue, while a routine is a sequence of actions. Habits require minimal conscious thought, while routines may require more planning.',
  ],
  [
    'Can I work on multiple habits at once?',
    'It\'s generally better to focus on one habit at a time until it becomes automatic (about 2 months). Once established, you can add new habits using habit stacking techniques.',
  ],
  [
    'How does habit difficulty affect success?',
    'Harder habits require more willpower and support but can provide greater rewards. Start with easier versions and gradually increase difficulty as the habit becomes established.',
  ],
  [
    'What role does a support system play in habit formation?',
    'Support systems significantly increase habit success rates. Accountability partners, communities, and professional support provide motivation, encouragement, and help overcome obstacles.',
  ],
  [
    'How do I maintain a habit long-term?',
    'Focus on systems rather than goals, embrace the "never miss twice" rule, regularly review and adjust your approach, celebrate milestones, and prepare for challenging periods.',
  ],
  [
    'What are common mistakes in habit formation?',
    'Setting goals too ambitious initially, not having a plan for obstacles, focusing on perfection instead of consistency, not tracking progress, lacking accountability, and not understanding underlying motivation.',
  ],
];

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Establish baseline: track your current habit performance and identify your starting point. Set a clear, specific goal for the habit.' },
  { week: 2, focus: 'Start small: begin with a 2-minute version of your habit. Focus on just showing up daily, even if it\'s minimal.' },
  { week: 3, focus: 'Build the habit loop: identify your cue (trigger), routine (habit), and reward. Make the cue obvious and the reward satisfying.' },
  { week: 4, focus: 'Habit stacking: attach your new habit to an existing routine. This creates automatic triggers and reduces the need for willpower.' },
  { week: 5, focus: 'Remove obstacles: identify and eliminate barriers that make the habit harder. Make it as easy as possible to perform.' },
  { week: 6, focus: 'Build accountability: share your progress with a support system (family, friends, or community). Track your streak visibly.' },
  { week: 7, focus: 'Reassess and adjust: review what\'s working and what isn\'t. Adjust your approach based on obstacles and patterns you\'ve identified.' },
  { week: 8, focus: 'Establish long-term maintenance: the habit should feel more automatic. Focus on systems and consistency rather than motivation or perfection.' },
];

const warningSigns = () => [
  'Extreme focus on maintaining streaks may lead to unhealthy behaviors or obsessive patterns—maintain balance and flexibility.',
  'Breaking a streak doesn\'t mean failure. Avoid all-or-nothing thinking. One missed day doesn\'t erase weeks or months of progress.',
  'If a habit consistently causes stress, anxiety, or negative impacts on your life, reconsider whether it\'s the right habit or approach for you.',
];

const calculateHabitScore = (values: FormValues) => {
  let score = 0;
  
  if (values.currentStreak >= 365) score += 40;
  else if (values.currentStreak >= 100) score += 30;
  else if (values.currentStreak >= 30) score += 20;
  else if (values.currentStreak >= 7) score += 10;
  else score += values.currentStreak * 1.5;

  if (values.longestStreak >= 365) score += 20;
  else if (values.longestStreak >= 100) score += 15;
  else if (values.longestStreak >= 30) score += 10;
  else score += values.longestStreak * 0.5;

  const frequencyMultiplier = {
    daily: 1.0,
    weekly: 0.7,
    monthly: 0.4,
  };
  score *= frequencyMultiplier[values.habitFrequency];

  const difficultyMultiplier = {
    easy: 0.8,
    moderate: 1.0,
    hard: 1.2,
    very_hard: 1.5,
  };
  score *= difficultyMultiplier[values.habitDifficulty];

  const consistencyBonus = {
    poor: 0,
    fair: 5,
    good: 10,
    excellent: 15,
  };
  score += consistencyBonus[values.consistency];

  const motivationBonus = {
    low: 0,
    moderate: 5,
    high: 10,
    very_high: 15,
  };
  score += motivationBonus[values.motivation];

  const supportBonus = {
    none: 0,
    family: 5,
    friends: 8,
    professional: 10,
    community: 12,
  };
  score += supportBonus[values.supportSystem];

  if (values.habitAge >= 2) score += 10;
  else if (values.habitAge >= 1) score += 5;
  else score += values.habitAge * 2;

  return Math.min(100, Math.max(0, score));
};

const getStreakAnalysis = (currentStreak: number, longestStreak: number) => {
  if (currentStreak === longestStreak && currentStreak >= 30) {
    return 'Excellent! You\'re maintaining your best streak and building strong momentum. This indicates strong habit formation and high likelihood of long-term success.';
  } else if (currentStreak >= 21) {
    return 'Great progress! You\'ve established a solid habit foundation. The 21-day mark is significant, but continue building to reach full automaticity (around 66 days).';
  } else if (currentStreak >= 7) {
    return 'Good start! You\'re building consistency and forming the habit. Focus on maintaining momentum and addressing any obstacles that arise.';
  } else if (currentStreak >= 3) {
    return 'Early stage! Keep going to build momentum and establish the routine. Every day counts toward making this habit automatic.';
  } else {
    return 'Getting started! Every day counts toward building this healthy habit. Focus on consistency and making it as easy as possible to perform.';
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
  strength += Math.min(values.currentStreak * 2, 40);
  
  const consistencyStrength = {
    poor: 0,
    fair: 10,
    good: 20,
    excellent: 30,
  };
  strength += consistencyStrength[values.consistency];
  strength += Math.min(values.habitAge * 5, 20);
  
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

const getRecommendations = (habitScore: number, consistency: string, supportSystem: string) => {
  if (habitScore >= 80) {
    return [
      'Maintain your excellent habit consistency and celebrate your success',
      'Consider adding related habits to build a comprehensive routine using habit stacking',
      'Share your success to inspire others and strengthen your commitment',
      'Set new challenges or variations to keep the habit engaging and prevent boredom',
      'Focus on maintaining systems rather than relying on motivation',
    ];
  } else if (habitScore >= 60) {
    return [
      'Focus on maintaining consistency during challenging periods',
      'Identify and address any obstacles that make the habit harder to maintain',
      'Celebrate your progress regularly to maintain motivation',
      'Consider joining a community or finding an accountability partner for additional support',
      'Review and adjust your habit loop (cue, routine, reward) if needed',
    ];
  } else if (habitScore >= 40) {
    return [
      'Focus on building consistency before increasing difficulty or duration',
      'Set smaller, achievable daily goals to build momentum',
      'Find an accountability partner or support group to increase commitment',
      'Remove obstacles that make the habit harder to maintain',
      'Make the habit more obvious with visual cues and reminders',
    ];
  } else {
    return [
      'Start with very small, manageable goals (2-minute rule)',
      'Focus on just showing up daily, even for 2-5 minutes',
      'Build a strong support system (family, friends, or community)',
      'Consider if the habit is the right fit for your current lifestyle',
      'Attach the habit to an existing routine (habit stacking)',
    ];
  }
};

const getMilestones = (habitScore: number, currentStreak: number) => {
  if (habitScore >= 80) {
    return [
      '🎯 1 Year Streak (365 days)',
      '🏆 2 Year Streak (730 days)',
      '💪 Add a complementary habit using habit stacking',
      '🌟 Mentor someone else starting this habit',
    ];
  } else if (habitScore >= 60) {
    return [
      '🎯 30 Day Streak',
      '🏆 100 Day Streak',
      '💪 1 Year Streak (365 days)',
      '🌟 Improve consistency to excellent level',
    ];
  } else if (habitScore >= 40) {
    return [
      '🎯 7 Day Streak',
      '🏆 21 Day Streak',
      '💪 30 Day Streak',
      '🌟 Improve consistency rating',
    ];
  } else {
    return [
      '🎯 3 Day Streak',
      '🏆 7 Day Streak',
      '💪 21 Day Streak',
      '🌟 Build consistency and motivation',
    ];
  }
};

const getProjectedSuccess = (habitScore: number) => {
  if (habitScore >= 80) {
    return 'Excellent! You have a very strong habit with high likelihood of long-term success. Focus on maintaining your systems and consistency.';
  } else if (habitScore >= 60) {
    return 'Good! You have a solid habit with good potential for long-term success. Continue building consistency and addressing obstacles.';
  } else if (habitScore >= 40) {
    return 'Moderate potential for success. Focus on consistency, removing barriers, and building a strong support system.';
  } else {
    return 'Early stage habit. Success depends on building strong foundations, starting small, and maintaining consistency.';
  }
};

export default function HabitStreakTrackerCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

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

  const onSubmit = (values: FormValues) => {
    const habitScore = calculateHabitScore(values);
    const streakAnalysis = getStreakAnalysis(values.currentStreak, values.longestStreak);
    const consistencyRating = getConsistencyRating(values.consistency, values.currentStreak);
    const habitStrength = getHabitStrength(values);

    setResult({
      habitScore,
      streakAnalysis,
      consistencyRating,
      recommendations: getRecommendations(habitScore, values.consistency, values.supportSystem),
      warningSigns: warningSigns(),
      plan: plan(),
      milestones: getMilestones(habitScore, values.currentStreak),
      habitStrength,
      projectedSuccess: getProjectedSuccess(habitScore),
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" /> Habit Streak Tracker</CardTitle>
          <CardDescription>Analyze your habit formation progress by evaluating streak length, consistency, motivation, and support systems to assess habit strength and long-term success potential.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="habitType" render={({ field }) => (
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
                )} />
                <FormField control={form.control} name="currentStreak" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Streak (days)</FormLabel>
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
                <FormField control={form.control} name="longestStreak" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longest Streak (days)</FormLabel>
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
                <FormField control={form.control} name="habitFrequency" render={({ field }) => (
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
                )} />
                <FormField control={form.control} name="habitDifficulty" render={({ field }) => (
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
                )} />
                <FormField control={form.control} name="habitDuration" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Habit Duration (minutes)</FormLabel>
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
                <FormField control={form.control} name="consistency" render={({ field }) => (
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
                )} />
                <FormField control={form.control} name="motivation" render={({ field }) => (
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
                )} />
                <FormField control={form.control} name="supportSystem" render={({ field }) => (
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
                )} />
                <FormField control={form.control} name="habitAge" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Habit Age (months)</FormLabel>
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
              </div>
              <Button type="submit" className="w-full md:w-auto">Analyze Habit Streak</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Activity className="h-8 w-8 text-primary" /><CardTitle>Habit Streak Analysis</CardTitle></div>
              <CardDescription>Your habit formation assessment and success potential</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded">
                  <p className="text-3xl font-bold text-primary">{result.habitScore}/100</p>
                  <p className="text-sm text-muted-foreground">Habit Score</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <p className="text-2xl font-bold text-primary">{result.consistencyRating}</p>
                  <p className="text-sm text-muted-foreground">Consistency Rating</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <p className="text-3xl font-bold text-primary">{result.habitStrength}/100</p>
                  <p className="text-sm text-muted-foreground">Habit Strength</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{result.streakAnalysis}</p>
              <p className="text-sm text-muted-foreground">{result.projectedSuccess}</p>
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
              <CardTitle>Next Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.milestones.map((item, index) => (
                  <li key={index} className="text-sm text-muted-foreground">{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Habit Formation Plan</CardTitle>
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
          <CardDescription>Build a comprehensive health and wellness assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/daily-activity-points-calculator" className="text-primary hover:underline">
                  Daily Activity Points Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Track daily activity to support exercise habit formation.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/sleep-quality-calculator" className="text-primary hover:underline">
                  Sleep Quality Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Assess sleep habits and quality to improve sleep routines.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/hydration-calculator" className="text-primary hover:underline">
                  Hydration Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Calculate daily hydration needs to support hydration habits.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/mindful-minutes-tracking-calculator" className="text-primary hover:underline">
                  Mindful Minutes Tracking Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Track meditation and mindfulness practice to build consistency.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Guide: Understanding Habit Formation</CardTitle>
          <CardDescription>Evidence-based strategies for building lasting habits</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            Habits are automatic behaviors that require minimal conscious thought. Research shows that it takes an average of 66 days to form a new habit, but this varies widely (18-254 days) depending on the complexity of the behavior, individual factors, and consistency.
          </p>
          <p>
            The habit loop consists of four components: cue (trigger), routine (behavior), reward (benefit), and craving (desire). To build strong habits, make the cue obvious, the routine easy, the reward satisfying, and the craving strong. Focus on systems rather than goals, and embrace the "never miss twice" rule when setbacks occur.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Common questions about habit formation and streak tracking</CardDescription>
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
