'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Layers, Zap, Target, Shield, TrendingDown } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  concurrentTasks: z.number({ invalid_type_error: 'Enter number of tasks' }).min(1).max(10),
  taskSwitchFrequency: z.number({ invalid_type_error: 'Enter frequency' }).min(0).max(60),
  singleTaskAccuracy: z.number({ invalid_type_error: 'Enter accuracy' }).min(0).max(100),
  multitaskAccuracy: z.number({ invalid_type_error: 'Enter accuracy' }).min(0).max(100),
  completionTimeMultiplier: z.number({ invalid_type_error: 'Enter multiplier' }).min(0.5).max(5),
  errorRate: z.number({ invalid_type_error: 'Enter error rate' }).min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  efficiencyScore: number;
  efficiencyLevel: string;
  productivityLoss: number;
  status: 'efficient' | 'moderate' | 'inefficient' | 'counterproductive';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Count number of tasks you attempt to do simultaneously (concurrent tasks).',
  'Estimate task switching frequency (number of switches per hour).',
  'Enter your typical accuracy on single tasks (0-100%).',
  'Enter your accuracy when multitasking (0-100%).',
  'Estimate completion time multiplier (e.g., 1.5 = tasks take 50% longer when multitasking).',
  'Enter error rate when multitasking (0-100%).',
  'Review your multitasking efficiency score and recommendations.',
];

const faqs = [
  {
    question: 'Is multitasking actually possible?',
    answer:
      'True multitasking (doing multiple complex tasks simultaneously) is a myth. The brain switches rapidly between tasks, which causes attention residue, increases errors, and reduces efficiency. Most "multitasking" is actually rapid task-switching.',
  },
  {
    question: 'Why is multitasking inefficient?',
    answer:
      'Task-switching requires cognitive resources to disengage from one task and engage with another. This "switching cost" leads to increased time, errors, reduced quality, and mental fatigue. Productivity typically decreases 20-40% when multitasking.',
  },
  {
    question: 'What is a good multitasking efficiency score?',
    answer:
      'Scores above 70 indicate relatively efficient task-switching (though still less efficient than single-tasking). 50-70 is moderate efficiency. Below 50 indicates significant productivity loss. Below 30 suggests multitasking is counterproductive.',
  },
  {
    question: 'When is multitasking acceptable?',
    answer:
      'Multitasking works best when one task is automatic/habitual (like walking while talking) or requires minimal attention. Combining complex cognitive tasks significantly reduces efficiency and quality.',
  },
  {
    question: 'How does multitasking affect memory?',
    answer:
      'Multitasking impairs memory formation and retrieval. Divided attention prevents deep encoding of information, making it harder to remember details and learn effectively. Quality of learning decreases significantly.',
  },
  {
    question: 'Can you improve multitasking efficiency?',
    answer:
      'While you can slightly improve task-switching speed through practice, you cannot eliminate switching costs. Better strategy: minimize multitasking, batch similar tasks, use time-blocking, and focus on one task at a time for optimal results.',
  },
  {
    question: 'Does age affect multitasking ability?',
    answer:
      'Yes, multitasking efficiency typically declines with age due to reduced working memory capacity and slower cognitive processing. Older adults experience larger performance deficits when multitasking compared to younger adults.',
  },
  {
    question: 'How does multitasking affect stress?',
    answer:
      'Multitasking increases stress levels and mental fatigue. Constant task-switching activates stress responses, reduces sense of control, and creates feelings of being overwhelmed. Single-tasking reduces stress.',
  },
  {
    question: 'What about technology and multitasking?',
    answer:
      'Digital multitasking (checking email, social media, messages while working) creates significant productivity loss. Each switch disrupts focus and creates attention residue. "Digital minimalism" (reducing tech interruptions) improves focus.',
  },
  {
    question: 'How do I measure multitasking efficiency?',
    answer:
      'Measure by comparing: accuracy on single tasks vs. multitasking, completion time for tasks done alone vs. together, error rates, mental fatigue levels, and overall quality of work. This calculator combines these factors.',
  },
];

const relatedCalculators = [
  {
    name: 'Cognitive Load Balance Calculator',
    slug: 'cognitive-load-balance-calculator',
    description: 'Assess cognitive load affected by multitasking.',
  },
  {
    name: 'Decision Fatigue Index Calculator',
    slug: 'decision-fatigue-index-calculator',
    description: 'Measure decision fatigue worsened by multitasking.',
  },
  {
    name: 'Cognitive Focus Efficiency Calculator',
    slug: 'cognitive-focus-efficiency-calculator',
    description: 'Evaluate focus efficiency improved by single-tasking.',
  },
  {
    name: 'Mental Fatigue Index Calculator',
    slug: 'mental-fatigue-index-calculator',
    description: 'Track mental fatigue increased by multitasking.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/multitasking-efficiency-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Multitasking Efficiency Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Multitasking Efficiency Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Evaluate multitasking efficiency by comparing single-task vs multitask performance, accuracy, completion time, and error rates to optimize productivity.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  // Calculate accuracy loss
  const accuracyLoss = values.singleTaskAccuracy - values.multitaskAccuracy;
  const accuracyScore = Math.max(0, values.multitaskAccuracy - (accuracyLoss * 0.5));
  
  // Calculate time efficiency (lower multiplier = better)
  const timeEfficiency = (1 / values.completionTimeMultiplier) * 100;
  
  // Calculate error penalty
  const errorPenalty = values.errorRate * 0.5;
  
  // Calculate task-switching penalty
  const switchPenalty = Math.min(values.taskSwitchFrequency / 10, 20);
  
  // Combine factors (accuracy weighted more heavily)
  const efficiencyScore = Math.round(Math.max(0, Math.min(100, accuracyScore * 0.4 + timeEfficiency * 0.3 + (100 - errorPenalty) * 0.2 + (100 - switchPenalty) * 0.1)));
  
  // Calculate productivity loss percentage
  const productivityLoss = Math.round(accuracyLoss + ((values.completionTimeMultiplier - 1) * 50) + (values.errorRate * 0.3));
  
  let efficiencyLevel: string;
  let interpretation: string;
  let status: ResultPayload['status'] = 'efficient';
  
  if (efficiencyScore >= 70) {
    efficiencyLevel = 'Relatively Efficient';
    interpretation = 'Your multitasking shows relatively efficient task-switching, though single-tasking would likely still be more productive.';
    status = 'efficient';
  } else if (efficiencyScore >= 50) {
    efficiencyLevel = 'Moderate Efficiency';
    interpretation = 'Multitasking is moderately efficient but causes productivity loss. Consider reducing concurrent tasks and focusing more on single-tasking.';
    status = 'moderate';
  } else if (efficiencyScore >= 30) {
    efficiencyLevel = 'Inefficient';
    interpretation = 'Multitasking is significantly reducing your productivity. Errors, time delays, and accuracy loss indicate you should prioritize single-tasking.';
    status = 'inefficient';
  } else {
    efficiencyLevel = 'Counterproductive';
    interpretation = 'Multitasking is counterproductive. Significant productivity loss, high error rates, and time delays indicate you should eliminate multitasking and focus on one task at a time.';
    status = 'counterproductive';
  }
  
  const recommendations = [
    'Eliminate or minimize multitasking: Focus on one task at a time for optimal productivity and quality.',
    'Use time-blocking: Schedule dedicated blocks for single tasks rather than attempting multiple tasks simultaneously.',
    'Batch similar tasks: Group similar activities together (e.g., all emails at once) to reduce task-switching costs.',
    'Minimize distractions: Turn off notifications, close unnecessary tabs/apps, and create focus environments.',
    `Your accuracy drops ${accuracyLoss.toFixed(1)}% when multitasking. Prioritize accuracy by single-tasking important work.`,
    `Tasks take ${((values.completionTimeMultiplier - 1) * 100).toFixed(0)}% longer when multitasking. Single-tasking saves time overall.`,
    'Implement "deep work" periods: Extended single-tasking sessions (90+ minutes) for important, complex tasks.',
    'Practice attention training: Meditation and mindfulness improve focus and reduce the urge to multitask.',
  ];
  
  const plan = [
    { label: 'Immediate', detail: 'Stop multitasking during important tasks. Close distractions and focus on one task at a time.' },
    { label: 'This Week', detail: 'Implement time-blocking for key tasks. Track single-task vs multitask productivity to see improvements.' },
    { label: 'This Month', detail: 'Develop single-tasking habits. Use techniques like Pomodoro method and create distraction-free work environments.' },
  ];
  
  return {
    efficiencyScore,
    efficiencyLevel,
    productivityLoss,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function MultitaskingEfficiencyCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      concurrentTasks: undefined,
      taskSwitchFrequency: undefined,
      singleTaskAccuracy: undefined,
      multitaskAccuracy: undefined,
      completionTimeMultiplier: undefined,
      errorRate: undefined,
    },
  });
  
  return (
    <div className="space-y-8">
      <Script id="mte-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Multitasking Efficiency Calculator
          </CardTitle>
          <CardDescription>Evaluate multitasking efficiency by comparing single-task vs multitask performance, accuracy, completion time, and error rates to optimize productivity.</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Input your multitasking metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="concurrentTasks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of concurrent tasks</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="taskSwitchFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task switching frequency (per hour)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="singleTaskAccuracy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Single-task accuracy (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 95" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="multitaskAccuracy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Multitask accuracy (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 80" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="completionTimeMultiplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Completion time multiplier (e.g., 1.5 = 50% longer)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 1.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="errorRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Error rate when multitasking (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 12" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Multitasking Efficiency
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
            <CardDescription>See your multitasking efficiency score and productivity optimization strategies.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Efficiency Score</p>
                <p className="text-2xl font-semibold text-primary">{result.efficiencyScore}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Efficiency Level</p>
                <p className="text-2xl font-semibold text-primary">{result.efficiencyLevel}</p>
                <p className="text-xs text-muted-foreground">Performance level</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Productivity Loss</p>
                <p className="text-2xl font-semibold text-primary">{result.productivityLoss}%</p>
                <p className="text-xs text-muted-foreground">Compared to single-tasking</p>
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
                    <TrendingDown className="h-4 w-4" />
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
            <strong>Efficiency Score</strong> = (Accuracy Score × 0.4) + (Time Efficiency × 0.3) + ((100 - Error Penalty) × 0.2) + ((100 - Switch Penalty) × 0.1)
          </p>
          <p>
            <strong>Accuracy Score</strong> = Multitask Accuracy - (Accuracy Loss × 0.5)
          </p>
          <p>
            <strong>Time Efficiency</strong> = (1 / Completion Time Multiplier) × 100
          </p>
          <p>
            <strong>Error Penalty</strong> = Error Rate × 0.5
          </p>
          <p>
            <strong>Switch Penalty</strong> = Min(Task Switch Frequency / 10, 20)
          </p>
          <p>
            <strong>Productivity Loss</strong> = Accuracy Loss + ((Completion Time Multiplier - 1) × 50) + (Error Rate × 0.3)
          </p>
          <p>Efficiency score ranges from 0-100, with higher scores indicating more efficient task-switching (though still less efficient than single-tasking).</p>
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
          <p>
            Multitasking, or more accurately "task-switching," involves rapidly alternating attention between multiple tasks. Research consistently shows that multitasking reduces productivity, increases errors, slows completion time, and impairs learning. The brain cannot truly focus on multiple complex tasks simultaneously—it switches between them, creating "switching costs" that reduce efficiency.
          </p>
          <p>
            This calculator evaluates your multitasking efficiency by comparing single-task performance (accuracy, completion time) with multitask performance. Understanding your multitasking efficiency helps you make informed decisions about when to focus on one task versus attempting multiple tasks, ultimately improving productivity and work quality.
          </p>
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
          <p>This tool evaluates multitasking efficiency by comparing single-task vs multitask performance, accuracy, completion time, and error rates.</p>
          <p>Outputs include an efficiency score, efficiency level, productivity loss percentage, interpretation, recommendations, and an action plan.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
