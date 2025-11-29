'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Cloud, AlertTriangle, Target, Shield, Brain } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  mentalClarityLevel: z.number({ invalid_type_error: 'Enter clarity level' }).min(1).max(10),
  memoryDifficulties: z.number({ invalid_type_error: 'Enter frequency' }).min(0).max(10),
  concentrationProblems: z.number({ invalid_type_error: 'Enter frequency' }).min(0).max(10),
  wordFindingDifficulty: z.number({ invalid_type_error: 'Enter frequency' }).min(0).max(10),
  sleepQuality: z.number({ invalid_type_error: 'Enter sleep quality' }).min(1).max(10),
  stressLevel: z.number({ invalid_type_error: 'Enter stress level' }).min(1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  fogScore: number;
  severityLevel: string;
  status: 'minimal' | 'mild' | 'moderate' | 'severe';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Rate your mental clarity level (1-10, 10 = crystal clear, 1 = very foggy).',
  'Rate frequency of memory difficulties (0-10, 10 = constant problems, 0 = no issues).',
  'Rate frequency of concentration problems (0-10, 10 = constant problems, 0 = no issues).',
  'Rate frequency of word-finding difficulties (0-10, 10 = constant problems, 0 = no issues).',
  'Rate your sleep quality (1-10, 10 = excellent, 1 = very poor).',
  'Rate your current stress level (1-10, 10 = extreme stress, 1 = no stress).',
  'Review your brain fog severity score and recommendations for improvement.',
];

const faqs = [
  {
    question: 'What is brain fog?',
    answer:
      'Brain fog is a term describing cognitive dysfunction characterized by confusion, forgetfulness, lack of focus, and mental clarity issues. It feels like your brain is wrapped in fog, making thinking difficult.',
  },
  {
    question: 'What causes brain fog?',
    answer:
      'Common causes include: poor sleep, high stress, hormonal changes, medications, dehydration, nutritional deficiencies, chronic fatigue, inflammation, and underlying health conditions.',
  },
  {
    question: 'What is a good brain fog severity score?',
    answer:
      'Scores below 25 indicate minimal brain fog (excellent cognitive clarity). 25-40 is mild, 41-60 is moderate, and above 60 indicates severe brain fog requiring attention.',
  },
  {
    question: 'Can brain fog be cured?',
    answer:
      'Often yes, depending on the cause. Improving sleep, managing stress, addressing nutritional deficiencies, staying hydrated, and treating underlying conditions can significantly reduce or eliminate brain fog.',
  },
  {
    question: 'How long does it take to improve brain fog?',
    answer:
      'Improvement timeline varies. Simple causes (dehydration, poor sleep) may resolve in days. Chronic causes may require weeks to months of lifestyle changes and treatment.',
  },
  {
    question: 'Does diet affect brain fog?',
    answer:
      'Yes, significantly. Diets high in processed foods, sugar, and inflammatory foods worsen brain fog. Brain-healthy diets rich in omega-3s, antioxidants, and whole foods can improve clarity.',
  },
  {
    question: 'Can exercise help with brain fog?',
    answer:
      'Yes, regular exercise improves blood flow to the brain, reduces inflammation, enhances sleep quality, and reduces stress—all of which help clear brain fog.',
  },
  {
    question: 'When should I see a doctor about brain fog?',
    answer:
      'See a doctor if brain fog is severe, persistent, worsening, or accompanied by other concerning symptoms like headaches, memory loss, or neurological changes.',
  },
  {
    question: 'Does screen time worsen brain fog?',
    answer:
      'Yes, excessive screen time, especially before bed, can worsen brain fog by disrupting sleep, causing eye strain, and increasing cognitive load.',
  },
  {
    question: 'Can supplements help with brain fog?',
    answer:
      'Some supplements may help, including omega-3s, B vitamins, vitamin D, magnesium, and adaptogens. However, address root causes first and consult a healthcare provider.',
  },
];

const relatedCalculators = [
  {
    name: 'Mental Fatigue Index Calculator',
    slug: 'mental-fatigue-index-calculator',
    description: 'Assess overall mental fatigue contributing to brain fog.',
  },
  {
    name: 'Cognitive Focus Efficiency Calculator',
    slug: 'cognitive-focus-efficiency-calculator',
    description: 'Measure focus efficiency affected by brain fog.',
  },
  {
    name: 'Sleep Quality vs Screen Exposure Analyzer',
    slug: 'sleep-quality-vs-screen-exposure-analyzer',
    description: 'Evaluate sleep quality that affects brain fog.',
  },
  {
    name: 'Stress Hormone Balance Calculator',
    slug: 'stress-hormone-balance-calculator',
    description: 'Assess stress levels contributing to brain fog.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/brain-fog-severity-score-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Brain Fog Severity Score Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Brain Fog Severity Score Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Assess brain fog severity based on mental clarity, memory, concentration, word-finding, sleep quality, and stress to identify causes and improvement strategies.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  // Invert clarity and sleep (higher = better, so subtract from 10)
  const clarityContribution = (10 - values.mentalClarityLevel) * 3;
  const memoryContribution = values.memoryDifficulties * 3;
  const concentrationContribution = values.concentrationProblems * 3;
  const wordFindingContribution = values.wordFindingDifficulty * 2;
  const sleepContribution = (10 - values.sleepQuality) * 2;
  const stressContribution = values.stressLevel * 2;
  
  const fogScore = Math.round(clarityContribution + memoryContribution + concentrationContribution + wordFindingContribution + sleepContribution + stressContribution);
  const clampedScore = Math.max(0, Math.min(100, fogScore));
  
  let severityLevel: string;
  let interpretation: string;
  let status: ResultPayload['status'] = 'minimal';
  
  if (clampedScore < 25) {
    severityLevel = 'Minimal';
    interpretation = 'You have minimal brain fog with good cognitive clarity. Maintain healthy habits to keep your mind sharp.';
    status = 'minimal';
  } else if (clampedScore < 41) {
    severityLevel = 'Mild';
    interpretation = 'You are experiencing mild brain fog. Focus on improving sleep, managing stress, and maintaining hydration.';
    status = 'mild';
  } else if (clampedScore < 61) {
    severityLevel = 'Moderate';
    interpretation = 'You have moderate brain fog affecting your cognitive function. Address sleep, stress, nutrition, and consider medical evaluation.';
    status = 'moderate';
  } else {
    severityLevel = 'Severe';
    interpretation = 'You are experiencing severe brain fog. This significantly impacts daily function. Consult a healthcare provider and prioritize rest and recovery.';
    status = 'severe';
  }
  
  const recommendations = [
    'Prioritize 7-9 hours of quality sleep per night. Maintain consistent sleep schedule and create optimal sleep environment.',
    'Manage stress through meditation, deep breathing, yoga, or other relaxation techniques. Consider therapy if stress is chronic.',
    'Stay well-hydrated (aim for 8-10 glasses of water daily). Dehydration significantly contributes to brain fog.',
    'Adopt a brain-healthy diet: reduce processed foods and sugar, increase omega-3s, antioxidants, and whole foods.',
    'Engage in regular physical exercise to improve blood flow to the brain and reduce inflammation.',
    'Limit screen time, especially before bed. Take regular breaks from screens throughout the day.',
    'Consider underlying health conditions: thyroid issues, hormonal imbalances, chronic fatigue, or nutrient deficiencies.',
    'Address potential triggers: medications, allergies, food sensitivities, or environmental factors.',
  ];
  
  const plan = [
    { label: 'Immediate', detail: 'Improve sleep hygiene tonight. Reduce screen time 2 hours before bed. Increase water intake.' },
    { label: 'This Week', detail: 'Establish consistent sleep schedule. Start stress management practices. Evaluate diet and reduce processed foods.' },
    { label: 'This Month', detail: 'Maintain lifestyle changes. Track brain fog symptoms. Consider medical evaluation if symptoms persist.' },
  ];
  
  return {
    fogScore: clampedScore,
    severityLevel,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function BrainFogSeverityScoreCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mentalClarityLevel: undefined,
      memoryDifficulties: undefined,
      concentrationProblems: undefined,
      wordFindingDifficulty: undefined,
      sleepQuality: undefined,
      stressLevel: undefined,
    },
  });
  
  return (
    <div className="space-y-8">
      <Script id="bfss-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Brain Fog Severity Score Calculator
          </CardTitle>
          <CardDescription>Assess brain fog severity based on mental clarity, memory, concentration, word-finding, sleep quality, and stress to identify causes and improvement strategies.</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Input your symptoms and factors</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="mentalClarityLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mental clarity level (1-10, 10 = clear)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="memoryDifficulties"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Memory difficulties frequency (0-10, 0 = none)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="concentrationProblems"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Concentration problems frequency (0-10, 0 = none)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="wordFindingDifficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Word-finding difficulties frequency (0-10, 0 = none)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Sleep quality (1-10, 10 = excellent)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Stress level (1-10, 10 = extreme)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Brain Fog Severity
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Interactive results
            </CardTitle>
            <CardDescription>See your brain fog severity score and improvement strategies.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Brain Fog Score</p>
                <p className="text-2xl font-semibold text-primary">{result.fogScore}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Severity Level</p>
                <p className="text-2xl font-semibold text-primary">{result.severityLevel}</p>
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
                    <Brain className="h-4 w-4" />
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
            <strong>Brain Fog Severity Score</strong> = (Clarity Contribution + Memory Contribution + Concentration Contribution + Word-Finding Contribution + Sleep Contribution + Stress Contribution)
          </p>
          <p>
            <strong>Clarity Contribution</strong> = (10 - Mental Clarity Level) × 3
          </p>
          <p>
            <strong>Memory Contribution</strong> = Memory Difficulties Frequency × 3
          </p>
          <p>
            <strong>Concentration Contribution</strong> = Concentration Problems Frequency × 3
          </p>
          <p>
            <strong>Word-Finding Contribution</strong> = Word-Finding Difficulties × 2
          </p>
          <p>
            <strong>Sleep Contribution</strong> = (10 - Sleep Quality) × 2
          </p>
          <p>
            <strong>Stress Contribution</strong> = Stress Level × 2
          </p>
          <p>Score ranges from 0-100, with higher scores indicating more severe brain fog.</p>
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
            Brain fog is a common experience characterized by cognitive dysfunction, including confusion, forgetfulness, lack of mental clarity, and difficulty concentrating. It feels like your brain is wrapped in a fog, making clear thinking challenging. This calculator assesses the severity of your brain fog by evaluating mental clarity, memory difficulties, concentration problems, word-finding issues, sleep quality, and stress levels.
          </p>
          <p>
            Understanding your brain fog severity helps identify contributing factors and develop targeted strategies for improvement. Common causes include poor sleep, high stress, nutritional deficiencies, dehydration, hormonal imbalances, and underlying health conditions. By addressing root causes systematically, you can significantly improve cognitive clarity.
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
          <p>This tool assesses brain fog severity based on mental clarity, memory difficulties, concentration problems, word-finding issues, sleep quality, and stress levels.</p>
          <p>Outputs include a brain fog severity score, severity level, interpretation, recommendations, and an action plan.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
