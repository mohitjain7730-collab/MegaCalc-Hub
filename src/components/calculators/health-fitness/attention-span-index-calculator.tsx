'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Brain, Zap, Target, Shield, TrendingUp } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  sustainedAttentionTime: z.number({ invalid_type_error: 'Enter sustained attention time' }).min(1).max(240),
  distractionFrequency: z.number({ invalid_type_error: 'Enter distraction frequency' }).min(0).max(60).optional(),
  taskSwitchCount: z.number({ invalid_type_error: 'Enter task switch count' }).min(0).max(50).optional(),
  age: z.number({ invalid_type_error: 'Enter age' }).min(10).max(100).optional(),
  sleepQuality: z.number({ invalid_type_error: 'Enter sleep quality' }).min(1).max(10).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  attentionIndex: number;
  attentionLevel: string;
  attentionSpan: number;
  status: 'excellent' | 'good' | 'moderate' | 'poor';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter sustained attention time (minutes of focused attention).',
  'Optionally enter distraction frequency (number per hour).',
  'Optionally enter task switch count (number of task switches).',
  'Optionally enter age and sleep quality (1-10).',
  'Review attention span index, level, and recommendations.',
];

const faqs = [
  {
    question: 'What is attention span?',
    answer:
      'Attention span is the length of time a person can concentrate on a task or stimulus without becoming distracted. It reflects cognitive control, executive function, and ability to maintain focus despite competing stimuli.',
  },
  {
    question: 'What is a normal attention span?',
    answer:
      'Normal attention spans vary by age and task: Children (5-7 years: 5-15 min), Adolescents (15-30 min), Adults (30-45 min), Older adults (20-30 min). Complex tasks may have shorter spans than simple tasks.',
  },
  {
    question: 'How does age affect attention span?',
    answer:
      'Attention span develops through childhood, peaks in young adulthood (20-30s), then gradually declines with age. Older adults typically have shorter spans due to cognitive changes. However, experience can compensate for some decline.',
  },
  {
    question: 'What affects attention span?',
    answer:
      'Factors include: sleep quality and duration, stress levels, task interest and complexity, environment (noise, interruptions), nutrition, hydration, physical activity, screen time, and underlying health conditions (ADHD, anxiety).',
  },
  {
    question: 'How can I improve my attention span?',
    answer:
      'Improve through: reducing distractions, practicing mindfulness and meditation, getting adequate sleep (7-9 hours), managing stress, regular exercise, limiting screen time, taking breaks, and gradually extending focus periods.',
  },
  {
    question: 'Does screen time affect attention span?',
    answer:
      'Yes. Excessive screen time, especially on social media and fast-paced content, can shorten attention span. The constant stimulation and rapid content switching trains the brain for shorter attention. Limiting screen time improves attention span.',
  },
  {
    question: 'What about multitasking?',
    answer:
      'Multitasking reduces attention span. Switching between tasks requires cognitive resources and reduces focus quality. Single-tasking and deep work improve attention span and productivity more than multitasking.',
  },
  {
    question: 'How does sleep affect attention?',
    answer:
      'Sleep is critical for attention span. Poor sleep quality or insufficient duration significantly reduces attention span, focus, and cognitive control. Aim for 7-9 hours of quality sleep for optimal attention function.',
  },
  {
    question: 'Can attention span be trained?',
    answer:
      'Yes. Attention span improves with practice. Techniques include: meditation, mindfulness exercises, reading (especially longer texts), concentration games, limiting distractions, and gradually increasing focus duration.',
  },
  {
    question: 'What is the difference between attention span and focus retention?',
    answer:
      'Attention span is the maximum duration one can maintain attention. Focus retention is the actual sustained focus achieved, accounting for distractions. Both are related but attention span is the capacity while retention is the realized performance.',
  },
];

const relatedCalculators = [
  {
    name: 'Focus Retention Wellness Score',
    slug: 'focus-retention-time-calculator',
    description: 'Get wellness insights about focus retention related to attention span.',
  },
  {
    name: 'Working Memory Capacity Wellness Estimator',
    slug: 'working-memory-capacity-estimator',
    description: 'Get wellness insights about working memory supporting attention span.',
  },
  {
    name: 'HRV Recovery Optimization Wellness Score',
    slug: 'hrv-recovery-optimization-score-calculator',
    description: 'Get wellness insights about recovery status affecting attention and cognition.',
  },
  {
    name: 'Training Fatigue Wellness Index',
    slug: 'training-fatigue-index-calculator',
    description: 'Get wellness insights about physical fatigue impacting mental attention.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/attention-span-index-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Attention Span Wellness Index', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Attention Span Wellness Index',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Get general wellness insights about attention span index based on sustained attention time, distraction frequency, task switches, age, and sleep quality. This is a personal lifestyle insight, not a medical evaluation.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  // Base attention span from sustained attention time
  let attentionSpan = values.sustainedAttentionTime;
  
  // Penalty for distractions
  if (values.distractionFrequency) {
    const distractionPenalty = (values.distractionFrequency / 10) * 5; // -5 min per 10 distractions per hour
    attentionSpan = attentionSpan - distractionPenalty;
  }
  
  // Penalty for task switching
  if (values.taskSwitchCount) {
    const switchPenalty = values.taskSwitchCount * 2; // -2 min per task switch
    attentionSpan = attentionSpan - switchPenalty;
  }
  
  // Age adjustment (attention span declines with age)
  if (values.age) {
    if (values.age < 20) {
      attentionSpan *= 0.9; // Slightly lower in teens
    } else if (values.age >= 50) {
      const agePenalty = ((values.age - 50) / 10) * 0.05; // -5% per decade over 50
      attentionSpan = attentionSpan * (1 - agePenalty);
    }
  }
  
  // Sleep quality adjustment
  if (values.sleepQuality) {
    if (values.sleepQuality < 5) {
      attentionSpan *= 0.7; // Poor sleep reduces by 30%
    } else if (values.sleepQuality < 7) {
      attentionSpan *= 0.85; // Moderate sleep reduces by 15%
    } else if (values.sleepQuality >= 8) {
      attentionSpan *= 1.1; // Good sleep improves by 10%
    }
  }
  
  attentionSpan = clamp(attentionSpan, 5, 120);
  
  // Calculate attention index (0-100 scale)
  let attentionIndex = (attentionSpan / 60) * 100; // Normalize to 60 minutes = 100
  attentionIndex = clamp(attentionIndex, 0, 100);
  
  let status: ResultPayload['status'] = 'good';
  let attentionLevel = 'Good';
  let interpretation = 'This suggests a general lifestyle tendency where your attention span index may be good. You may be able to maintain attention for reasonable periods.';
  
  if (attentionIndex >= 80) {
    status = 'excellent';
    attentionLevel = 'Excellent';
    interpretation = 'This suggests a general lifestyle tendency where your attention span index is excellent. You may have strong cognitive control and can maintain attention for extended periods.';
  } else if (attentionIndex >= 60) {
    status = 'good';
    attentionLevel = 'Good';
  } else if (attentionIndex >= 40) {
    status = 'moderate';
    attentionLevel = 'Moderate';
    interpretation = 'This suggests a general lifestyle tendency where your attention span index is moderate. You may consider improving through reducing distractions, improving sleep, and attention training.';
  } else {
    status = 'poor';
    attentionLevel = 'Poor';
    interpretation = 'This suggests a general lifestyle tendency where your attention span index may be lower. You may consider improvements in sleep, stress management, distraction reduction, and attention training techniques.';
  }
  
  const recommendations = [
    'You may consider reducing distractions: eliminate interruptions, create quiet environment, turn off notifications, limit screen time, and use focus techniques (Pomodoro, time-blocking). This is a personal insight, not a medical evaluation.',
    'You may consider improving sleep quality: aim for 7-9 hours of quality sleep. Poor sleep may reduce attention span and cognitive function.',
    'You may consider practicing attention training: meditation, mindfulness exercises, reading longer texts, concentration games, and gradually extending focus periods.',
  ];
  if (values.distractionFrequency && values.distractionFrequency > 10) {
    recommendations.push(`High distraction frequency (${values.distractionFrequency}/hour) may be reducing attention span. You may consider creating a more controlled environment and proactively eliminating distractions.`);
  }
  if (values.taskSwitchCount && values.taskSwitchCount > 5) {
    recommendations.push(`Excessive task switching (${values.taskSwitchCount}) may fragment attention. You may consider practicing single-tasking and batching similar activities to improve attention span.`);
  }
  if (values.sleepQuality && values.sleepQuality < 6) {
    recommendations.push('Poor sleep quality may be impairing attention span. You may consider prioritizing sleep hygiene and aiming for 7-9 hours of quality sleep for optimal cognitive function.');
  }
  
  const plan = [
    { label: 'This Week', detail: 'You may consider tracking attention span during different activities. Note distraction frequency, task switches, and factors affecting attention (sleep, stress, environment).' },
    { label: 'This Month', detail: 'You may consider implementing attention improvement strategies: reduce distractions, improve sleep, practice mindfulness, limit screen time, and gradually extend focus periods.' },
    { label: 'Ongoing', detail: 'You may consider maintaining attention optimization habits. Continue attention training, monitor attention span, and adjust strategies based on what works best for you.' },
  ];
  
  return { attentionIndex, attentionLevel, attentionSpan, status, interpretation, recommendations, plan };
};

export default function AttentionSpanIndexCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sustainedAttentionTime: undefined,
      distractionFrequency: undefined,
      taskSwitchCount: undefined,
      age: undefined,
      sleepQuality: undefined,
    },
  });
  
  return (
    <div className="space-y-8">
      <Script id="attention-span-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Attention Span Wellness Index
          </CardTitle>
          <CardDescription>Get general wellness insights about attention span index based on sustained attention time, distraction frequency, task switches, age, and sleep quality. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Input your attention data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sustainedAttentionTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sustained attention time (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 30" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="distractionFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Distraction frequency (per hour, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="taskSwitchCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task switch count (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (years, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 35" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sleepQuality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep quality (1-10, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate attention index
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
            <CardDescription>See attention span index, level, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Attention index</p>
                <p className="text-2xl font-semibold text-primary">{result.attentionIndex.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Attention level</p>
                <p className="text-2xl font-semibold text-primary">{result.attentionLevel}</p>
                <p className="text-xs text-muted-foreground">{result.status}</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Attention span</p>
                <p className="text-2xl font-semibold text-primary">{result.attentionSpan.toFixed(0)} min</p>
                <p className="text-xs text-muted-foreground">Estimated</p>
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
                    <TrendingUp className="h-4 w-4" />
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
            <strong>Base attention span</strong> = Sustained attention time (minutes).
          </p>
          <p>
            <strong>Distraction penalty</strong> = -(Distraction frequency / 10) Ã— 5 minutes.
          </p>
          <p>
            <strong>Task switch penalty</strong> = -Task switch count Ã— 2 minutes.
          </p>
          <p>
            <strong>Age adjustment</strong> = Age &lt;20: Ã—0.9, Age â‰¥50: Ã—(1 - ((Age - 50) / 10) Ã— 0.05).
          </p>
          <p>
            <strong>Sleep quality adjustment</strong> = Quality &lt;5: Ã—0.7, 5-7: Ã—0.85, â‰¥8: Ã—1.1.
          </p>
          <p>
            <strong>Attention index</strong> = (Attention span / 60) Ã— 100 (clamped 0-100).
          </p>
          <p>Attention span reflects cognitive ability to maintain focus. Higher attention spans (40+ minutes) indicate better cognitive control and attention capacity. Factors like distractions, task switching, sleep, and age significantly affect attention span.</p>
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
                <Link href={`/${calc.slug}`} className="text-primary hover:underline">
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
          <p>Attention span is the length of time you can maintain focus on a task. It reflects cognitive control and executive function. Better attention span improves productivity, learning, and cognitive performance.</p>
          <p>Use this calculator to assess attention span index based on sustained attention time, distraction frequency, task switches, age, and sleep quality to identify factors affecting attention and optimize cognitive capacity.</p>
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
          <p>This tool provides general wellness insights about attention span index based on sustained attention time, distraction frequency, task switch count, age, and sleep quality. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include attention index (0-100), attention level, attention span (minutes), status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Disclaimer
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a medical or psychological diagnosis. For any health concerns, please consult a qualified professional.</p>
        </CardContent>
      </Card>
    </div>
  );
}


