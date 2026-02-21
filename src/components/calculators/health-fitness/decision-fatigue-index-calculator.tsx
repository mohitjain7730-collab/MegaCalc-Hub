'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle, Clock, Target, Shield, Brain } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  decisionsPerDay: z.number({ invalid_type_error: 'Enter number of decisions' }).min(1).max(500),
  complexDecisions: z.number({ invalid_type_error: 'Enter number of complex decisions' }).min(0).max(50),
  decisionTimeMinutes: z.number({ invalid_type_error: 'Enter time in minutes' }).min(0).max(480),
  mentalExhaustionLevel: z.number({ invalid_type_error: 'Enter level 1-10' }).min(1).max(10),
  willpowerDepletion: z.number({ invalid_type_error: 'Enter level 1-10' }).min(1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  fatigueIndex: number;
  fatigueLevel: string;
  wellnessTendency: string;
  status: 'low' | 'moderate' | 'high' | 'critical';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Count the number of decisions you make in a typical day (small and large).',
  'Identify how many are complex decisions requiring significant mental effort.',
  'Estimate total time spent making decisions throughout the day in minutes.',
  'Rate your mental exhaustion level at end of day (1-10 scale, 10 = completely exhausted).',
  'Rate your willpower depletion level (1-10 scale, 10 = no willpower left).',
  'Review your decision fatigue index, risk level, and strategies to reduce cognitive load.',
];

const faqs = [
  {
    question: 'What is decision fatigue?',
    answer:
      'Decision fatigue may refer to changes in the quality of decisions made after a long session of decision-making. It may occur when mental energy is depleted from making too many choices, which may lead to changes in judgment. This tool provides general wellness insights, not a medical evaluation.',
  },
  {
    question: 'Why does decision fatigue happen?',
    answer:
      'Every decision may use mental energy. As you make more decisions throughout the day, your willpower and cognitive resources may deplete, making subsequent decisions harder. This is general wellness information, not a medical diagnosis.',
  },
  {
    question: 'What is a good decision fatigue index?',
    answer:
      'Scores below 30 suggest a general lifestyle tendency where fatigue may be low (manageable decision load). 30-50 is moderate, 51-70 is high, and above 70 suggests areas for improvement. This is a personal insight, not a medical evaluation.',
  },
  {
    question: 'How can I reduce decision fatigue?',
    answer:
      'You may consider: automating routine decisions, reducing daily choices, batching similar decisions, eating regular meals to maintain glucose, and scheduling important decisions for morning when willpower may be highest. This is a personal insight, not a medical evaluation.',
  },
  {
    question: 'Does decision fatigue affect everyone equally?',
    answer:
      'Lifestyle factors (sleep, stress, nutrition) may impact how quickly decision fatigue sets in. This is general wellness information, not a medical diagnosis.',
  },
  {
    question: 'What are signs of decision fatigue?',
    answer:
      'Signs may include: avoiding decisions, making impulsive choices, increased procrastination, feeling mentally drained, irritability, and changes in judgment on complex matters. This is general wellness information, not a medical diagnosis.',
  },
  {
    question: 'Can decision fatigue be prevented?',
    answer:
      'You may consider decision automation, habit formation, reducing trivial choices, maintaining steady glucose levels, adequate sleep, and reserving high-stakes decisions for peak mental times. This is a personal insight, not a medical evaluation.',
  },
  {
    question: 'How does decision fatigue affect productivity?',
    answer:
      'High decision fatigue may reduce productivity by causing procrastination, poor prioritization, decreased motivation, and increased time spent on simple choices. This is general wellness information, not a medical diagnosis.',
  },
  {
    question: 'Does multitasking increase decision fatigue?',
    answer:
      'Multitasking may require constant decision-making about task switching, which may deplete mental energy and accelerate decision fatigue. This is general wellness information, not a medical diagnosis.',
  },
  {
    question: 'What is the best time to make important decisions?',
    answer:
      'Morning may be best when willpower and cognitive resources may be at peak levels. You may consider avoiding making important decisions late in the day when decision fatigue may be highest. This is a personal insight, not a medical evaluation.',
  },
];

const relatedCalculators = [
  {
    name: 'Mental Fatigue Wellness Index',
    slug: 'daily-activity-points-calculator',
    description: 'Get wellness insights about overall mental fatigue that may contribute to decision fatigue.',
  },
  {
    name: 'Cognitive Focus Efficiency Wellness Calculator',
    slug: 'cognitive-focus-efficiency-calculator',
    description: 'Get wellness insights about focus efficiency that may affect decision quality.',
  },
  {
    name: 'Multitasking Efficiency Wellness Calculator',
    slug: 'multitasking-efficiency-calculator',
    description: 'Get wellness insights about multitasking impact on cognitive resources.',
  },
  {
    name: 'Brain Fog Wellness Score',
    slug: 'brain-fog-severity-score-calculator',
    description: 'Get wellness insights about brain fog that may affect decision fatigue.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/decision-fatigue-index-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Decision Fatigue Wellness Index', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Decision Fatigue Wellness Index',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Get general wellness insights about decision fatigue based on daily decision volume, complexity, time spent, and mental exhaustion. This is a personal lifestyle insight, not a medical evaluation.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  // Calculate decision density (decisions per hour)
  const decisionDensity = values.decisionsPerDay / (values.decisionTimeMinutes / 60);
  
  // Weight complex decisions more heavily
  const complexityFactor = (values.complexDecisions / values.decisionsPerDay) * 100;
  
  // Combine factors
  const decisionLoad = (values.decisionsPerDay / 100) * 30;
  const complexityLoad = complexityFactor * 1.5;
  const timeLoad = (values.decisionTimeMinutes / 60) * 10;
  const exhaustionLoad = (values.mentalExhaustionLevel / 10) * 20;
  const willpowerLoad = (values.willpowerDepletion / 10) * 20;
  
  const fatigueIndex = Math.round(decisionLoad + complexityLoad + timeLoad + exhaustionLoad + willpowerLoad);
  const clampedIndex = Math.max(0, Math.min(100, fatigueIndex));
  
  let fatigueLevel: string;
  let wellnessTendency: string;
  let interpretation: string;
  let status: ResultPayload['status'] = 'low';
  
  if (clampedIndex < 30) {
    fatigueLevel = 'Low';
    wellnessTendency = 'Minimal Tendency';
    interpretation = 'This suggests a general lifestyle tendency where your decision load is manageable. You may have sufficient mental energy reserves for quality decision-making.';
    status = 'low';
  } else if (clampedIndex < 50) {
    fatigueLevel = 'Moderate';
    wellnessTendency = 'Elevated Tendency';
    interpretation = 'This suggests a general lifestyle tendency where you may be experiencing moderate decision fatigue. You may consider reducing decision load or implementing decision automation strategies.';
    status = 'moderate';
  } else if (clampedIndex < 70) {
    fatigueLevel = 'High';
    wellnessTendency = 'High Tendency';
    interpretation = 'This suggests a general lifestyle tendency where you may have high decision fatigue. Decision quality may be affected. You may consider taking action to reduce cognitive load.';
    status = 'high';
  } else {
    fatigueLevel = 'Critical';
    wellnessTendency = 'Critical Tendency';
    interpretation = 'This suggests a general lifestyle tendency where decision fatigue may be high. You may consider prioritizing rest and reducing decisions. This is a personal insight, not a medical evaluation.';
    status = 'critical';
  }
  
  const recommendations = [
    'You may consider automating routine decisions: establish routines, use defaults, and reduce trivial choices (e.g., meal prep, wardrobe decisions). This is a personal insight, not a medical evaluation.',
    'You may consider batching similar decisions together rather than spreading them throughout the day.',
    'You may consider scheduling important decisions for morning hours when willpower and cognitive resources may be highest.',
    'You may consider maintaining steady glucose levels with regular meals and healthy snacks to preserve decision-making capacity.',
    'You may consider eliminating unnecessary decisions by creating habits, using checklists, and establishing clear processes.',
    'You may consider practicing decision-making frameworks to streamline complex choices and reduce mental effort.',
    'You may consider taking breaks between decision-heavy periods to restore mental energy.',
    'You may consider delegating decisions when possible to reduce your personal decision load.',
  ];
  
  const plan = [
    { label: 'Immediate', detail: 'You may consider identifying top 3 decision drains and automating or eliminating them. Schedule important decisions for morning.' },
    { label: 'This Week', detail: 'You may consider creating routines for routine decisions (meals, clothing, routines). Batch similar decisions together.' },
    { label: 'This Month', detail: 'You may consider establishing decision-making frameworks. Monitor fatigue index weekly to track improvements.' },
  ];
  
  return {
    fatigueIndex: clampedIndex,
    fatigueLevel,
    wellnessTendency,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function DecisionFatigueIndexCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      decisionsPerDay: undefined,
      complexDecisions: undefined,
      decisionTimeMinutes: undefined,
      mentalExhaustionLevel: undefined,
      willpowerDepletion: undefined,
    },
  });
  
  return (
    <div className="space-y-8">
      <Script id="dfi-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Decision Fatigue Wellness Index
          </CardTitle>
          <CardDescription>Get general wellness insights about decision fatigue based on daily decision volume, complexity, time spent, and mental exhaustion. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Input your decision-making metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="decisionsPerDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of decisions per day</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 75" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="complexDecisions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complex decisions (requiring significant thought)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 10" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="decisionTimeMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total time spent on decisions (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 120" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mentalExhaustionLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mental exhaustion level (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="willpowerDepletion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Willpower depletion level (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Decision Fatigue Wellness Index
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
            <CardDescription>See your decision fatigue wellness index, wellness tendency, and optimization strategies.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Fatigue Index</p>
                <p className="text-2xl font-semibold text-primary">{result.fatigueIndex}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Fatigue Level</p>
                <p className="text-2xl font-semibold text-primary">{result.fatigueLevel}</p>
                <p className="text-xs text-muted-foreground">Current status</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Wellness Tendency</p>
                <p className="text-2xl font-semibold text-primary">{result.wellnessTendency}</p>
                <p className="text-xs text-muted-foreground">Decision quality tendency</p>
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
            <strong>Decision Fatigue Index</strong> = Decision Load + Complexity Load + Time Load + Exhaustion Load + Willpower Load
          </p>
          <p>
            <strong>Decision Load</strong> = (Decisions per Day / 100) × 30
          </p>
          <p>
            <strong>Complexity Load</strong> = (Complex Decisions / Total Decisions) × 100 × 1.5
          </p>
          <p>
            <strong>Time Load</strong> = (Decision Time Minutes / 60) × 10
          </p>
          <p>
            <strong>Exhaustion Load</strong> = (Mental Exhaustion Level / 10) × 20
          </p>
          <p>
            <strong>Willpower Load</strong> = (Willpower Depletion / 10) × 20
          </p>
          <p>Index ranges from 0-100, with higher scores suggesting a general lifestyle tendency where decision fatigue may be greater. This is a personal insight, not a medical evaluation.</p>
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
                <Link href={`/health-fitness/${calc.slug}`} className="text-primary hover:underline">
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
            Decision fatigue may occur when the quality of your decisions changes after making many choices throughout the day. Every decision may consume mental energy, and as this energy depletes, your ability to make thoughtful, high-quality decisions may decrease. This tool provides general wellness insights about decision fatigue by analyzing decision volume, complexity, time investment, and mental exhaustion. This is a personal lifestyle insight, not a medical evaluation.
          </p>
          <p>
            Understanding your decision fatigue wellness index may help you optimize when and how you make important decisions, automate routine choices, and preserve mental energy for critical matters. By reducing unnecessary decisions and managing your cognitive load, you may maintain better decision quality throughout the day.
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
          <p>This tool provides general wellness insights about decision fatigue based on daily decision volume, complexity, time spent, mental exhaustion, and willpower depletion. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include a decision fatigue wellness index, fatigue level, wellness tendency, interpretation, recommendations, and an action plan.</p>
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
