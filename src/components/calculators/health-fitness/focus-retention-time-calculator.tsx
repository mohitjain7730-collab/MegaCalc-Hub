'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Brain, Zap, Target, Shield, Clock } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  focusedTime: z.number({ invalid_type_error: 'Enter focused time' }).min(1).max(480),
  distractionCount: z.number({ invalid_type_error: 'Enter distraction count' }).min(0).max(100).optional(),
  taskComplexity: z.number({ invalid_type_error: 'Enter task complexity' }).min(1).max(10).optional(),
  sleepHours: z.number({ invalid_type_error: 'Enter sleep hours' }).min(3).max(12).optional(),
  stressLevel: z.number({ invalid_type_error: 'Enter stress level' }).min(1).max(10).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  retentionScore: number;
  retentionLevel: string;
  efficiencyRatio: number;
  status: 'excellent' | 'good' | 'moderate' | 'poor';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter total focused time on task (minutes).',
  'Optionally enter number of distractions during this period.',
  'Optionally enter task complexity level (1 = simple, 10 = very complex).',
  'Optionally enter sleep hours and stress level (1-10).',
  'Review focus retention score, efficiency ratio, and recommendations.',
];

const faqs = [
  {
    question: 'What is focus retention time?',
    answer:
      'Focus retention time measures your ability to maintain sustained attention and concentration on a task without losing focus. It reflects cognitive control, attention span, and mental endurance for focused work.',
  },
  {
    question: 'What is a good focus retention time?',
    answer:
      'Focus retention varies: Excellent (90+ minutes continuous), Good (60-90 minutes), Moderate (30-60 minutes), Poor (below 30 minutes). Most people can maintain deep focus for 25-45 minutes before needing breaks.',
  },
  {
    question: 'How do distractions affect focus retention?',
    answer:
      'Distractions significantly reduce focus retention. Each distraction requires cognitive effort to refocus. Frequent distractions (more than 3-4 per hour) indicate poor focus retention and reduce overall productivity.',
  },
  {
    question: 'What factors affect focus retention?',
    answer:
      'Factors include: sleep quality and duration, stress levels, task complexity, interest level, environment (noise, interruptions), nutrition, hydration, physical activity, and mental fatigue. Optimal conditions improve retention.',
  },
  {
    question: 'How can I improve focus retention?',
    answer:
      'Improve through: eliminating distractions (phone, notifications), using time-blocking techniques (Pomodoro method), improving sleep (7-9 hours), managing stress, regular breaks, optimizing environment, and building focus stamina gradually.',
  },
  {
    question: 'What is the Pomodoro Technique?',
    answer:
      'Pomodoro Technique involves 25-minute focused work sessions followed by 5-minute breaks. After 4 sessions, take a longer break (15-30 minutes). This method helps maintain focus and prevents mental fatigue.',
  },
  {
    question: 'How does sleep affect focus?',
    answer:
      'Sleep is critical for focus retention. Poor sleep (less than 6-7 hours) significantly reduces attention span, cognitive control, and focus ability. Aim for 7-9 hours of quality sleep for optimal focus.',
  },
  {
    question: 'Can I train to improve focus retention?',
    answer:
      'Yes. Focus is like a muscle—it improves with practice. Start with shorter focused sessions (20-30 minutes) and gradually increase duration. Meditation, mindfulness, and concentration exercises can enhance focus retention.',
  },
  {
    question: 'What about task complexity?',
    answer:
      'Complex tasks require more cognitive resources and may reduce focus retention time. Very simple tasks can maintain focus longer, while complex tasks may require more frequent breaks. Adjust expectations based on complexity.',
  },
  {
    question: 'How does stress affect focus?',
    answer:
      'High stress significantly impairs focus retention. Stress activates fight-or-flight response, reducing prefrontal cortex function (responsible for focus). Stress management (meditation, exercise, breaks) improves focus retention.',
  },
];

const relatedCalculators = [
  {
    name: 'Attention Span Index Calculator',
    slug: 'attention-span-index-calculator',
    description: 'Assess attention span related to focus retention.',
  },
  {
    name: 'Working Memory Capacity Estimator',
    slug: 'working-memory-capacity-estimator',
    description: 'Evaluate working memory that supports focus retention.',
  },
  {
    name: 'HRV Recovery Optimization Score Calculator',
    slug: 'hrv-recovery-optimization-score-calculator',
    description: 'Assess recovery status affecting focus and cognitive function.',
  },
  {
    name: 'Training Fatigue Index Calculator',
    slug: 'training-fatigue-index-calculator',
    description: 'Manage physical fatigue that impacts mental focus.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/focus-retention-time-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Focus Retention Time Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Focus Retention Time Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate focus retention time and efficiency based on focused work duration, distractions, task complexity, sleep, and stress to assess cognitive focus capacity.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  // Base retention score from focused time
  let retentionScore = values.focusedTime;
  
  // Penalty for distractions
  if (values.distractionCount) {
    const distractionPenalty = values.distractionCount * 5; // -5 minutes per distraction
    retentionScore = retentionScore - distractionPenalty;
  }
  
  // Adjust for task complexity (complex tasks are harder to maintain focus)
  if (values.taskComplexity) {
    const complexityAdjustment = (values.taskComplexity - 5) / 5 * 0.15; // -15% to +15%
    retentionScore = retentionScore * (1 - complexityAdjustment);
  }
  
  // Adjust for sleep
  if (values.sleepHours) {
    if (values.sleepHours < 6) {
      retentionScore *= 0.7; // Poor sleep reduces focus by 30%
    } else if (values.sleepHours < 7) {
      retentionScore *= 0.85; // Moderate sleep reduces by 15%
    } else if (values.sleepHours >= 8) {
      retentionScore *= 1.1; // Good sleep improves by 10%
    }
  }
  
  // Adjust for stress
  if (values.stressLevel) {
    const stressPenalty = ((values.stressLevel - 5) / 5) * 0.2; // Up to 20% reduction
    retentionScore = retentionScore * (1 - stressPenalty);
  }
  
  retentionScore = clamp(retentionScore, 0, 120);
  
  // Calculate efficiency ratio (actual focus time vs potential)
  const efficiencyRatio = values.distractionCount && values.distractionCount > 0 
    ? (values.focusedTime / (values.focusedTime + values.distractionCount * 5)) * 100
    : 100;
  
  let status: ResultPayload['status'] = 'good';
  let retentionLevel = 'Good';
  let interpretation = 'Your focus retention is good. You can maintain focus for decent periods.';
  
  if (retentionScore >= 75) {
    status = 'excellent';
    retentionLevel = 'Excellent';
    interpretation = 'Your focus retention is excellent. You can maintain deep focus for extended periods, indicating strong cognitive control and attention span.';
  } else if (retentionScore >= 45) {
    status = 'good';
    retentionLevel = 'Good';
  } else if (retentionScore >= 25) {
    status = 'moderate';
    retentionLevel = 'Moderate';
    interpretation = 'Your focus retention is moderate. There is room for improvement through better environment, sleep, stress management, and focus training.';
  } else {
    status = 'poor';
    retentionLevel = 'Poor';
    interpretation = 'Your focus retention is poor. Significant improvements needed in sleep, stress management, distraction elimination, and focus training techniques.';
  }
  
  const recommendations = [
    'Eliminate distractions: turn off notifications, close unnecessary tabs/apps, create distraction-free environment, use focus apps or website blockers.',
    'Use time-blocking techniques: Pomodoro method (25 min focus + 5 min break) or similar structured focus sessions with scheduled breaks.',
    'Improve sleep quality and duration: aim for 7-9 hours of quality sleep. Poor sleep significantly reduces focus retention and cognitive function.',
  ];
  if (values.distractionCount && values.distractionCount > 3) {
    recommendations.push(`High distraction count (${values.distractionCount}) significantly reduces focus retention. Create a more controlled environment and remove distractions proactively.`);
  }
  if (values.sleepHours && values.sleepHours < 7) {
    recommendations.push('Inadequate sleep is impairing your focus retention. Prioritize sleep hygiene and aim for 7-9 hours per night for optimal cognitive function.');
  }
  if (values.stressLevel && values.stressLevel > 7) {
    recommendations.push('High stress levels are reducing focus retention. Implement stress management techniques (meditation, exercise, breaks) to improve cognitive function.');
  }
  
  const plan = [
    { label: 'This Week', detail: 'Track focus retention time during work sessions. Note distractions, sleep quality, and stress levels affecting focus.' },
    { label: 'This Month', detail: 'Implement focus improvement strategies: eliminate distractions, use Pomodoro technique, improve sleep, manage stress. Gradually increase focus duration.' },
    { label: 'Ongoing', detail: 'Maintain focus optimization habits. Continue tracking and improving focus retention. Build focus stamina through consistent practice and optimal conditions.' },
  ];
  
  return { retentionScore, retentionLevel, efficiencyRatio, status, interpretation, recommendations, plan };
};

export default function FocusRetentionTimeCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      focusedTime: undefined,
      distractionCount: undefined,
      taskComplexity: undefined,
      sleepHours: undefined,
      stressLevel: undefined,
    },
  });
  
  return (
    <div className="space-y-8">
      <Script id="focus-retention-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Focus Retention Time Calculator
          </CardTitle>
          <CardDescription>Calculate focus retention time and efficiency based on focused work duration, distractions, task complexity, sleep, and stress to assess cognitive focus capacity.</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Input your focus data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="focusedTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Focused time (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 45" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="distractionCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Distraction count (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="taskComplexity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task complexity (1-10, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Sleep hours (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 7.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stressLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stress level (1-10, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate retention score
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
            <CardDescription>See focus retention score, efficiency ratio, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Retention score</p>
                <p className="text-2xl font-semibold text-primary">{result.retentionScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Minutes</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Retention level</p>
                <p className="text-2xl font-semibold text-primary">{result.retentionLevel}</p>
                <p className="text-xs text-muted-foreground">{result.status}</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Efficiency ratio</p>
                <p className="text-2xl font-semibold text-primary">{result.efficiencyRatio.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Focus efficiency</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status}</p>
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
                    <Clock className="h-4 w-4" />
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
          <p>
            <strong>Base retention score</strong> = Focused time (minutes).
          </p>
          <p>
            <strong>Distraction penalty</strong> = -5 minutes per distraction.
          </p>
          <p>
            <strong>Task complexity adjustment</strong> = Base score × (1 - ((Complexity - 5) / 5) × 0.15).
          </p>
          <p>
            <strong>Sleep adjustment</strong> = &lt;6 hours: ×0.7, 6-7 hours: ×0.85, ≥8 hours: ×1.1.
          </p>
          <p>
            <strong>Stress adjustment</strong> = Base score × (1 - ((Stress level - 5) / 5) × 0.2).
          </p>
          <p>
            <strong>Efficiency ratio</strong> = (Focused time / (Focused time + Distractions × 5)) × 100%.
          </p>
          <p>Focus retention reflects ability to maintain sustained attention. Scores above 75 minutes indicate excellent focus, while scores below 25 minutes indicate need for improvement in environment, sleep, and focus training.</p>
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
          <p>Focus retention time measures your ability to maintain sustained attention and concentration on tasks. Better focus retention improves productivity, work quality, and cognitive performance.</p>
          <p>Use this calculator to assess focus retention based on focused work duration, distractions, task complexity, sleep quality, and stress levels to identify factors affecting focus and optimize cognitive performance.</p>
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
          <p>This tool calculates focus retention time and efficiency based on focused work duration, distraction count, task complexity, sleep hours, and stress level.</p>
          <p>Outputs include retention score (minutes), retention level, efficiency ratio (%), status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


