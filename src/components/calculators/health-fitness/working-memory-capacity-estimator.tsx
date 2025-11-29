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
  digitSpanForward: z.number({ invalid_type_error: 'Enter digit span forward' }).min(3).max(12),
  digitSpanBackward: z.number({ invalid_type_error: 'Enter digit span backward' }).min(2).max(10),
  processingSpeed: z.number({ invalid_type_error: 'Enter processing speed' }).min(1).max(10).optional(),
  age: z.number({ invalid_type_error: 'Enter age' }).min(10).max(100).optional(),
  cognitiveLoad: z.number({ invalid_type_error: 'Enter cognitive load' }).min(1).max(10).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  memoryCapacity: number;
  capacityLevel: string;
  workingMemoryScore: number;
  status: 'excellent' | 'good' | 'moderate' | 'limited';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter digit span forward (number of digits recalled in sequence).',
  'Enter digit span backward (number of digits recalled in reverse).',
  'Optionally enter processing speed rating (1-10) and cognitive load (1-10).',
  'Optionally enter age for age-adjusted assessment.',
  'Review working memory capacity, level, score, and recommendations.',
];

const faqs = [
  {
    question: 'What is working memory?',
    answer:
      'Working memory is the cognitive system that temporarily holds and manipulates information needed for complex tasks like reasoning, learning, and comprehension. It\'s essential for problem-solving, decision-making, and learning.',
  },
  {
    question: 'What is digit span?',
    answer:
      'Digit span is a measure of working memory capacity. Forward span (recalling digits in order) measures storage capacity. Backward span (recalling digits in reverse) measures both storage and manipulation capacity, reflecting true working memory.',
  },
  {
    question: 'What is a good working memory capacity?',
    answer:
      'Average digit spans: Forward (7±2 digits), Backward (5-6 digits). Excellent: Forward 9+, Backward 7+. Good: Forward 7-8, Backward 5-6. Moderate: Forward 5-6, Backward 3-4. Limited: Forward &lt;5, Backward &lt;3.',
  },
  {
    question: 'How does age affect working memory?',
    answer:
      'Working memory peaks in early adulthood (20-30s), then gradually declines with age. Older adults typically have lower capacity. However, strategies and experience can compensate for some decline. Regular mental exercise helps maintain capacity.',
  },
  {
    question: 'What affects working memory capacity?',
    answer:
      'Factors include: age, sleep quality and duration, stress levels, cognitive load, physical exercise, nutrition, hydration, mental fatigue, underlying conditions (ADHD, anxiety), and training/practice.',
  },
  {
    question: 'Can working memory be improved?',
    answer:
      'Yes. Working memory can be improved through: brain training exercises, dual n-back tasks, meditation, aerobic exercise, adequate sleep, stress management, and practice with working memory tasks. Improvements are possible at any age.',
  },
  {
    question: 'What is the relationship between working memory and intelligence?',
    answer:
      'Working memory strongly correlates with fluid intelligence (reasoning, problem-solving). Higher working memory capacity enables better complex thinking, learning, and academic/professional performance. It\'s a key component of cognitive ability.',
  },
  {
    question: 'How does stress affect working memory?',
    answer:
      'High stress significantly reduces working memory capacity. Stress activates fight-or-flight response, impairing prefrontal cortex function (where working memory operates). Chronic stress can cause persistent reductions in working memory.',
  },
  {
    question: 'What about multitasking?',
    answer:
      'Multitasking overloads working memory. Dividing attention between tasks reduces working memory capacity for each task, leading to poorer performance. Single-tasking allows full working memory capacity for optimal performance.',
  },
  {
    question: 'How do I test my working memory?',
    answer:
      'Test using: digit span tests (forward and backward), n-back tasks, working memory span tests, online cognitive assessments, or neuropsychological testing. Regular testing can track improvements from training.',
  },
];

const relatedCalculators = [
  {
    name: 'Attention Span Index Calculator',
    slug: 'attention-span-index-calculator',
    description: 'Assess attention span related to working memory function.',
  },
  {
    name: 'Focus Retention Time Calculator',
    slug: 'focus-retention-time-calculator',
    description: 'Evaluate focus retention supported by working memory.',
  },
  {
    name: 'HRV Recovery Optimization Score Calculator',
    slug: 'hrv-recovery-optimization-score-calculator',
    description: 'Assess recovery status affecting cognitive function including working memory.',
  },
  {
    name: 'Training Fatigue Index Calculator',
    slug: 'training-fatigue-index-calculator',
    description: 'Manage physical fatigue that impacts cognitive capacity.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/working-memory-capacity-estimator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Working Memory Capacity Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Working Memory Capacity Estimator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate working memory capacity based on digit span forward, backward, processing speed, age, and cognitive load to assess cognitive working memory function.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  // Base working memory capacity (average of forward and backward span)
  let memoryCapacity = (values.digitSpanForward + values.digitSpanBackward) / 2;
  
  // Processing speed adjustment (faster processing = better capacity utilization)
  if (values.processingSpeed) {
    const speedAdjustment = ((values.processingSpeed - 5) / 5) * 0.15; // ±15% based on processing speed
    memoryCapacity = memoryCapacity * (1 + speedAdjustment);
  }
  
  // Age adjustment (working memory declines with age)
  if (values.age) {
    if (values.age >= 50) {
      const agePenalty = ((values.age - 50) / 10) * 0.1; // -10% per decade over 50
      memoryCapacity = memoryCapacity * (1 - agePenalty);
    } else if (values.age < 20) {
      memoryCapacity *= 0.95; // Slightly lower in teens/children
    }
  }
  
  // Cognitive load adjustment (high load reduces effective capacity)
  if (values.cognitiveLoad) {
    const loadPenalty = ((values.cognitiveLoad - 5) / 5) * 0.2; // Up to 20% reduction
    memoryCapacity = memoryCapacity * (1 - loadPenalty);
  }
  
  memoryCapacity = clamp(memoryCapacity, 2, 12);
  
  // Calculate working memory score (0-100 scale)
  let workingMemoryScore = (memoryCapacity / 8) * 100; // Normalize to 8 = 100
  workingMemoryScore = clamp(workingMemoryScore, 0, 100);
  
  let status: ResultPayload['status'] = 'good';
  let capacityLevel = 'Good';
  let interpretation = 'Your working memory capacity is good. You can hold and manipulate information effectively for cognitive tasks.';
  
  if (workingMemoryScore >= 85) {
    status = 'excellent';
    capacityLevel = 'Excellent';
    interpretation = 'Your working memory capacity is excellent. You have strong cognitive capacity for complex thinking, learning, and problem-solving tasks.';
  } else if (workingMemoryScore >= 70) {
    status = 'good';
    capacityLevel = 'Good';
  } else if (workingMemoryScore >= 50) {
    status = 'moderate';
    capacityLevel = 'Moderate';
    interpretation = 'Your working memory capacity is moderate. There is room for improvement through brain training, exercise, sleep optimization, and stress management.';
  } else {
    status = 'limited';
    capacityLevel = 'Limited';
    interpretation = 'Your working memory capacity is limited. Focus on brain training exercises, improving sleep, managing stress, and cognitive enhancement strategies to improve capacity.';
  }
  
  const recommendations = [
    'Engage in brain training: dual n-back tasks, working memory exercises, memory games, and cognitive training apps can improve working memory capacity.',
    'Improve sleep quality and duration: aim for 7-9 hours of quality sleep. Sleep is critical for working memory function and cognitive capacity.',
    'Manage stress levels: high stress significantly reduces working memory capacity. Practice stress management techniques (meditation, exercise, relaxation) to optimize cognitive function.',
  ];
  if (values.digitSpanBackward < 4) {
    recommendations.push('Backward digit span below 4 indicates limited working memory manipulation. Focus on working memory training exercises, especially tasks requiring mental manipulation.');
  }
  if (values.cognitiveLoad && values.cognitiveLoad > 7) {
    recommendations.push(`High cognitive load (${values.cognitiveLoad}) is reducing working memory capacity. Reduce multitasking and break complex tasks into smaller chunks to optimize working memory use.`);
  }
  if (values.age && values.age >= 60) {
    recommendations.push('Age-related working memory decline is normal. Regular mental exercise, physical activity, and cognitive training can help maintain and even improve capacity at any age.');
  }
  
  const plan = [
    { label: 'This Week', detail: 'Assess working memory capacity using digit span tests (forward and backward). Note baseline capacity and factors affecting performance.' },
    { label: 'This Month', detail: 'Implement working memory training: dual n-back tasks, memory exercises, brain training apps. Improve sleep, manage stress, and engage in regular physical exercise.' },
    { label: 'Ongoing', detail: 'Continue cognitive training and optimization. Monitor working memory capacity improvements. Maintain healthy habits (sleep, exercise, stress management) for optimal cognitive function.' },
  ];
  
  return { memoryCapacity, capacityLevel, workingMemoryScore, status, interpretation, recommendations, plan };
};

export default function WorkingMemoryCapacityEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      digitSpanForward: undefined,
      digitSpanBackward: undefined,
      processingSpeed: undefined,
      age: undefined,
      cognitiveLoad: undefined,
    },
  });
  
  return (
    <div className="space-y-8">
      <Script id="working-memory-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Working Memory Capacity Estimator
          </CardTitle>
          <CardDescription>Estimate working memory capacity based on digit span forward, backward, processing speed, age, and cognitive load to assess cognitive working memory function.</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Input your working memory data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="digitSpanForward"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Digit span forward (3-12)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="digitSpanBackward"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Digit span backward (2-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="processingSpeed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Processing speed (1-10, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                  name="cognitiveLoad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cognitive load (1-10, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Estimate memory capacity
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
            <CardDescription>See working memory capacity, level, score, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Memory capacity</p>
                <p className="text-2xl font-semibold text-primary">{result.memoryCapacity.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Digit span average</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Capacity level</p>
                <p className="text-2xl font-semibold text-primary">{result.capacityLevel}</p>
                <p className="text-xs text-muted-foreground">{result.status}</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Working memory score</p>
                <p className="text-2xl font-semibold text-primary">{result.workingMemoryScore.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
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
            <strong>Base memory capacity</strong> = (Digit span forward + Digit span backward) / 2.
          </p>
          <p>
            <strong>Processing speed adjustment</strong> = Capacity × (1 + ((Processing speed - 5) / 5) × 0.15).
          </p>
          <p>
            <strong>Age adjustment</strong> = Age ≥50: ×(1 - ((Age - 50) / 10) × 0.1), Age &lt;20: ×0.95.
          </p>
          <p>
            <strong>Cognitive load adjustment</strong> = Capacity × (1 - ((Cognitive load - 5) / 5) × 0.2).
          </p>
          <p>
            <strong>Working memory score</strong> = (Memory capacity / 8) × 100 (clamped 0-100).
          </p>
          <p>
            <strong>Score interpretation</strong>: 85-100 = Excellent, 70-85 = Good, 50-70 = Moderate, below 50 = Limited.
          </p>
          <p>Working memory capacity reflects ability to hold and manipulate information. Higher capacity enables better complex thinking, learning, and problem-solving. Digit span backward is particularly important as it requires manipulation.</p>
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
          <p>Working memory is the cognitive system that temporarily holds and manipulates information for complex tasks. It\'s essential for reasoning, learning, problem-solving, and comprehension.</p>
          <p>Use this calculator to estimate working memory capacity based on digit span tests (forward and backward), processing speed, age, and cognitive load to assess cognitive working memory function and guide improvement strategies.</p>
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
          <p>This tool estimates working memory capacity based on digit span forward, digit span backward, processing speed, age, and cognitive load.</p>
          <p>Outputs include memory capacity (digit span average), capacity level, working memory score (0-100), status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


