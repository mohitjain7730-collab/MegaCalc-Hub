'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Scale, Brain, Target, Shield, TrendingUp } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  intrinsicLoad: z.number({ invalid_type_error: 'Enter intrinsic load' }).min(1).max(10),
  extraneousLoad: z.number({ invalid_type_error: 'Enter extraneous load' }).min(1).max(10),
  germaneLoad: z.number({ invalid_type_error: 'Enter germane load' }).min(1).max(10),
  cognitiveCapacity: z.number({ invalid_type_error: 'Enter cognitive capacity' }).min(1).max(10),
  taskComplexity: z.number({ invalid_type_error: 'Enter task complexity' }).min(1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  totalLoad: number;
  balanceIndex: number;
  loadStatus: string;
  status: 'balanced' | 'overloaded' | 'underloaded' | 'critical';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Rate intrinsic load (inherent difficulty of the material/task itself, 1-10).',
  'Rate extraneous load (unnecessary cognitive load from poor design or distractions, 1-10).',
  'Rate germane load (productive cognitive load for schema construction and learning, 1-10).',
  'Rate your current cognitive capacity (mental energy/resources available, 1-10).',
  'Rate overall task complexity (1-10, 10 = very complex).',
  'Review your cognitive load balance index and optimization strategies.',
];

const faqs = [
  {
    question: 'What is cognitive load theory?',
    answer:
      'Cognitive load theory describes how the human brain processes information. It distinguishes between intrinsic load (task difficulty), extraneous load (poor design), and germane load (productive learning effort). Optimal learning occurs when total load matches cognitive capacity.',
  },
  {
    question: 'What is intrinsic cognitive load?',
    answer:
      'Intrinsic load is the inherent difficulty of the material being learned. Complex topics have higher intrinsic load. This cannot be changed but can be managed through chunking and sequencing.',
  },
  {
    question: 'What is extraneous cognitive load?',
    answer:
      'Extraneous load is unnecessary cognitive effort caused by poor instructional design, distractions, or inefficient presentation. This should be minimized to free up cognitive resources.',
  },
  {
    question: 'What is germane cognitive load?',
    answer:
      'Germane load is productive cognitive effort used to build mental schemas and understanding. This is desirable and should be maximized within available cognitive capacity.',
  },
  {
    question: 'What is a good cognitive load balance?',
    answer:
      'Balance index of 60-80 suggests a general lifestyle tendency where load may be optimal. Below 60 suggests underloaded (wasted capacity). Above 80 suggests elevated load tendency (reduced learning). Above 90 suggests high load tendency. This is a personal insight, not a medical evaluation.',
  },
  {
    question: 'How can I reduce extraneous load?',
    answer:
      'Reduce through: eliminating distractions, simplifying instructions, using clear visuals, organizing information logically, removing redundant information, and improving interface design.',
  },
  {
    question: 'How can I increase germane load?',
    answer:
      'Increase through: active learning strategies, problem-solving exercises, reflection activities, connecting new information to existing knowledge, and encouraging schema building.',
  },
  {
    question: 'Does cognitive capacity vary?',
    answer:
      'Yes, cognitive capacity varies based on fatigue, stress, sleep quality, time of day, nutrition, and individual differences. It decreases throughout the day and with mental fatigue.',
  },
  {
    question: 'How does multitasking affect cognitive load?',
    answer:
      'Multitasking significantly increases extraneous load by dividing attention and requiring task-switching. This reduces available capacity for intrinsic and germane load, impairing learning and performance.',
  },
  {
    question: 'Can cognitive load be measured?',
    answer:
      'Cognitive load is typically assessed through self-report ratings, performance measures, physiological indicators (heart rate variability), and subjective workload scales. This calculator uses self-report ratings.',
  },
];

const relatedCalculators = [
  {
    name: 'Decision Fatigue Wellness Index',
    slug: 'decision-fatigue-index-calculator',
    description: 'Get wellness insights about decision fatigue that may affect cognitive capacity.',
  },
  {
    name: 'Mental Fatigue Wellness Index',
    slug: 'daily-activity-points-calculator',
    description: 'Get wellness insights about mental fatigue that may impact cognitive load balance.',
  },
  {
    name: 'Multitasking Efficiency Wellness Calculator',
    slug: 'multitasking-efficiency-calculator',
    description: 'Get wellness insights about multitasking impact on cognitive load.',
  },
  {
    name: 'Brain Fog Wellness Score',
    slug: 'brain-fog-severity-score-calculator',
    description: 'Get wellness insights about brain fog that may affect cognitive capacity.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/cognitive-load-balance-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Cognitive Load Balance Wellness Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Cognitive Load Balance Wellness Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Get general wellness insights about cognitive load balance by evaluating intrinsic, extraneous, and germane load relative to cognitive capacity. This is a personal lifestyle insight, not a medical evaluation.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  // Calculate total cognitive load
  const totalLoad = values.intrinsicLoad + values.extraneousLoad + values.germaneLoad;
  
  // Calculate balance index (total load vs capacity, with optimal range 18-24)
  const capacityScore = values.cognitiveCapacity * 3; // Scale to match load range
  const loadRatio = (totalLoad / capacityScore) * 100;
  const balanceIndex = Math.round(Math.max(0, Math.min(100, loadRatio)));
  
  // Determine load status
  let loadStatus: string;
  let interpretation: string;
  let status: ResultPayload['status'] = 'balanced';
  
  if (balanceIndex >= 90) {
    loadStatus = 'High Load Tendency';
    interpretation = 'This suggests a general lifestyle tendency where cognitive load may be high. You may consider reducing extraneous load and breaking tasks into smaller chunks. This is a personal insight, not a medical evaluation.';
    status = 'critical';
  } else if (balanceIndex >= 80) {
    loadStatus = 'Elevated Load Tendency';
    interpretation = 'This suggests a general lifestyle tendency where cognitive load may exceed optimal capacity. You may consider reducing extraneous load and simplifying tasks.';
    status = 'overloaded';
  } else if (balanceIndex >= 60) {
    loadStatus = 'Balanced';
    interpretation = 'This suggests a general lifestyle tendency where cognitive load is well-balanced within your capacity. Optimal conditions for learning and performance.';
    status = 'balanced';
  } else {
    loadStatus = 'Underloaded';
    interpretation = 'This suggests a general lifestyle tendency where cognitive load is below optimal. You may have unused cognitive capacity. You may consider increasing task complexity or germane load.';
    status = 'underloaded';
  }
  
  const recommendations = [
    'You may consider reducing extraneous load: eliminate distractions, simplify instructions, improve organization, remove redundant information. This is a personal insight, not a medical evaluation.',
    'You may consider optimizing intrinsic load: break complex tasks into chunks, sequence material logically, use worked examples for complex topics.',
    'You may consider maximizing germane load: engage in active learning, problem-solving, reflection, and connecting new to existing knowledge.',
    'You may consider managing cognitive capacity: ensure adequate rest, minimize stress, optimize sleep, schedule cognitively demanding tasks during peak hours.',
    'You may consider monitoring load throughout tasks: take breaks when needed, adjust difficulty based on capacity, avoid multitasking during complex tasks.',
    `Current extraneous load is ${values.extraneousLoad}/10. You may consider aiming to reduce this to 3-4/10 to free cognitive resources.`,
    `Current germane load is ${values.germaneLoad}/10. If below 7/10, you may consider increasing productive learning activities.`,
  ];
  
  const plan = [
    { label: 'Immediate', detail: 'You may consider reducing extraneous load by eliminating distractions and simplifying the current task environment.' },
    { label: 'This Week', detail: 'You may consider optimizing task structure to balance intrinsic, extraneous, and germane load. Schedule demanding tasks during peak cognitive capacity hours.' },
    { label: 'This Month', detail: 'You may consider developing strategies to maintain optimal cognitive load balance. Monitor capacity and adjust tasks accordingly.' },
  ];
  
  return {
    totalLoad,
    balanceIndex,
    loadStatus,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function CognitiveLoadBalanceCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      intrinsicLoad: undefined,
      extraneousLoad: undefined,
      germaneLoad: undefined,
      cognitiveCapacity: undefined,
      taskComplexity: undefined,
    },
  });
  
  return (
    <div className="space-y-8">
      <Script id="clb-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Cognitive Load Balance Wellness Calculator
          </CardTitle>
          <CardDescription>Get general wellness insights about cognitive load balance by evaluating intrinsic, extraneous, and germane load relative to cognitive capacity. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Input your cognitive load metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="intrinsicLoad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intrinsic load (task difficulty, 1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="extraneousLoad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Extraneous load (distractions/poor design, 1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="germaneLoad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Germane load (productive learning, 1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cognitiveCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cognitive capacity (available mental resources, 1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Task complexity (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Cognitive Load Balance
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Interactive results
            </CardTitle>
            <CardDescription>See your cognitive load balance index and optimization strategies.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total Load</p>
                <p className="text-2xl font-semibold text-primary">{result.totalLoad}</p>
                <p className="text-xs text-muted-foreground">Out of 30</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Balance Index</p>
                <p className="text-2xl font-semibold text-primary">{result.balanceIndex}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Load Status</p>
                <p className="text-2xl font-semibold text-primary">{result.loadStatus}</p>
                <p className="text-xs text-muted-foreground">Current status</p>
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
            <strong>Total Cognitive Load</strong> = Intrinsic Load + Extraneous Load + Germane Load
          </p>
          <p>
            <strong>Balance Index</strong> = (Total Load / (Cognitive Capacity Ã— 3)) Ã— 100
          </p>
          <p>
            <strong>Intrinsic Load</strong> = Inherent difficulty of the material (1-10 scale)
          </p>
          <p>
            <strong>Extraneous Load</strong> = Unnecessary cognitive effort from poor design/distractions (1-10 scale)
          </p>
          <p>
            <strong>Germane Load</strong> = Productive cognitive effort for learning (1-10 scale)
          </p>
          <p>
            <strong>Cognitive Capacity</strong> = Available mental resources (1-10 scale)
          </p>
          <p>Balance index: 60-80 = Optimal, 80-90 = Elevated Load Tendency, 90+ = High Load Tendency, below 60 = Underloaded. This is a personal insight, not a medical evaluation.</p>
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
          <p>
            Cognitive load theory may explain how the human brain processes information during learning and task performance. It identifies three types of cognitive load: intrinsic (inherent task difficulty), extraneous (unnecessary load from poor design), and germane (productive learning effort). Optimal performance may occur when total cognitive load matches available cognitive capacity. This tool provides general wellness insights, not a medical evaluation.
          </p>
          <p>
            This tool helps you get general wellness insights about the balance between these load types relative to your cognitive capacity. By understanding your cognitive load balance, you may optimize learning environments, reduce extraneous load, maximize germane load, and schedule tasks to match your cognitive capacity.
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
          <p>This tool provides general wellness insights about cognitive load balance by evaluating intrinsic, extraneous, and germane load relative to cognitive capacity. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include total cognitive load, balance index, load status, interpretation, recommendations, and an action plan.</p>
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
