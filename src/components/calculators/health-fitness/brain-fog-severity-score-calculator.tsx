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
  wellnessLevel: string;
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
      'Brain fog may be a term describing changes in cognitive function characterized by confusion, forgetfulness, lack of focus, and mental clarity issues. It may feel like your brain is wrapped in fog, making thinking difficult. This tool provides general wellness insights, not a medical evaluation.',
  },
  {
    question: 'What causes brain fog?',
    answer:
      'Lifestyle factors that may contribute include: poor sleep, high stress, dehydration, nutritional patterns, and other lifestyle factors. This is general wellness information, not a medical diagnosis.',
  },
  {
    question: 'What is a good brain fog wellness score?',
    answer:
      'Scores below 25 suggest a general lifestyle tendency where brain fog may be minimal (excellent cognitive clarity). 25-40 is mild, 41-60 is moderate, and above 60 suggests areas for improvement. This is a personal insight, not a medical evaluation.',
  },
  {
    question: 'Can brain fog be improved?',
    answer:
      'You may consider improving sleep, managing stress, addressing nutritional patterns, staying hydrated, and addressing lifestyle factors. This is a personal insight, not a medical evaluation.',
  },
  {
    question: 'How long does it take to improve brain fog?',
    answer:
      'Improvement timeline may vary. Simple lifestyle factors (dehydration, poor sleep) may resolve in days. Other lifestyle factors may require weeks to months of lifestyle changes.',
  },
  {
    question: 'Does diet affect brain fog?',
    answer:
      'Diet may affect brain fog. Diets high in processed foods, sugar, and inflammatory foods may worsen brain fog. Brain-healthy diets rich in omega-3s, antioxidants, and whole foods may improve clarity. This is general wellness information, not a medical diagnosis.',
  },
  {
    question: 'Can exercise help with brain fog?',
    answer:
      'Regular exercise may improve blood flow to the brain, reduce inflammation, enhance sleep quality, and reduce stressâ€”all of which may help clear brain fog. This is general wellness information, not a medical diagnosis.',
  },
  {
    question: 'When should I see a doctor about brain fog?',
    answer:
      'You may consider seeking professional guidance if brain fog is persistent, worsening, or accompanied by other concerning symptoms. This is general wellness information, not a medical diagnosis.',
  },
  {
    question: 'Does screen time worsen brain fog?',
    answer:
      'Excessive screen time, especially before bed, may worsen brain fog by disrupting sleep, causing eye strain, and increasing cognitive load. This is general wellness information, not a medical diagnosis.',
  },
  {
    question: 'Can supplements help with brain fog?',
    answer:
      'Some supplements may help, including omega-3s, B vitamins, vitamin D, magnesium, and adaptogens. However, you may consider addressing lifestyle factors first and consulting a healthcare provider. This is a personal insight, not a medical evaluation.',
  },
];

const relatedCalculators = [
  {
    name: 'Mental Fatigue Wellness Index',
    slug: 'daily-activity-points-calculator',
    description: 'Get wellness insights about overall mental fatigue that may contribute to brain fog.',
  },
  {
    name: 'Cognitive Focus Efficiency Wellness Calculator',
    slug: 'cognitive-focus-efficiency-calculator',
    description: 'Get wellness insights about focus efficiency that may be affected by brain fog.',
  },
  {
    name: 'Sleep & Screen Time Wellness Analyzer',
    slug: 'sleep-quality-vs-screen-exposure-analyzer',
    description: 'Get wellness insights about sleep quality that may affect brain fog.',
  },
  {
    name: 'Stress Hormone Balance Wellness Calculator',
    slug: 'stress-hormone-balance-calculator',
    description: 'Get wellness insights about stress levels that may contribute to brain fog.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/brain-fog-severity-score-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Brain Fog Wellness Score', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Brain Fog Wellness Score',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Get general wellness insights about brain fog based on mental clarity, memory, concentration, word-finding, sleep quality, and stress. This is a personal lifestyle insight, not a medical evaluation.',
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
  
  let wellnessLevel: string;
  let interpretation: string;
  let status: ResultPayload['status'] = 'minimal';
  
  if (clampedScore < 25) {
    wellnessLevel = 'Minimal';
    interpretation = 'This suggests a general lifestyle tendency where you may have minimal brain fog with good cognitive clarity. You may consider maintaining healthy habits to keep your mind sharp.';
    status = 'minimal';
  } else if (clampedScore < 41) {
    wellnessLevel = 'Mild';
    interpretation = 'This suggests a general lifestyle tendency where you may be experiencing mild brain fog. You may consider focusing on improving sleep, managing stress, and maintaining hydration.';
    status = 'mild';
  } else if (clampedScore < 61) {
    wellnessLevel = 'Moderate';
    interpretation = 'This suggests a general lifestyle tendency where you may have moderate brain fog affecting your cognitive function. You may consider addressing sleep, stress, nutrition, and seeking professional guidance if needed.';
    status = 'moderate';
  } else {
    wellnessLevel = 'Severe';
    interpretation = 'This suggests a general lifestyle tendency where you may be experiencing significant brain fog. You may consider prioritizing rest and recovery, and seeking professional guidance if needed. This is a personal insight, not a medical evaluation.';
    status = 'severe';
  }
  
  const recommendations = [
    'You may consider prioritizing 7-9 hours of quality sleep per night. Maintain consistent sleep schedule and create optimal sleep environment. This is a personal insight, not a medical evaluation.',
    'You may consider managing stress through meditation, deep breathing, yoga, or other relaxation techniques.',
    'You may consider staying well-hydrated (aim for 8-10 glasses of water daily). Dehydration may contribute to brain fog.',
    'You may consider adopting a brain-healthy diet: reduce processed foods and sugar, increase omega-3s, antioxidants, and whole foods.',
    'You may consider engaging in regular physical exercise to improve blood flow to the brain and reduce inflammation.',
    'You may consider limiting screen time, especially before bed. Take regular breaks from screens throughout the day.',
    'You may consider addressing potential lifestyle triggers: sleep patterns, stress levels, nutrition, or environmental factors.',
    'You may consider seeking professional guidance if symptoms persist or concern you.',
  ];
  
  const plan = [
    { label: 'Immediate', detail: 'You may consider improving sleep hygiene tonight. Reduce screen time 2 hours before bed. Increase water intake.' },
    { label: 'This Week', detail: 'You may consider establishing consistent sleep schedule. Start stress management practices. Evaluate diet and reduce processed foods.' },
    { label: 'This Month', detail: 'You may consider maintaining lifestyle changes. Track brain fog wellness patterns. Consider professional guidance if patterns persist.' },
  ];
  
  return {
    fogScore: clampedScore,
    wellnessLevel,
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
            Brain Fog Wellness Score
          </CardTitle>
          <CardDescription>Get general wellness insights about brain fog based on mental clarity, memory, concentration, word-finding, sleep quality, and stress. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Input your lifestyle factors</CardTitle>
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
                Calculate Brain Fog Wellness Score
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
            <CardDescription>See your brain fog wellness score and improvement strategies.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Brain Fog Score</p>
                <p className="text-2xl font-semibold text-primary">{result.fogScore}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Wellness Level</p>
                <p className="text-2xl font-semibold text-primary">{result.wellnessLevel}</p>
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
            <strong>Brain Fog Wellness Score</strong> = (Clarity Contribution + Memory Contribution + Concentration Contribution + Word-Finding Contribution + Sleep Contribution + Stress Contribution)
          </p>
          <p>
            <strong>Clarity Contribution</strong> = (10 - Mental Clarity Level) Ã— 3
          </p>
          <p>
            <strong>Memory Contribution</strong> = Memory Difficulties Frequency Ã— 3
          </p>
          <p>
            <strong>Concentration Contribution</strong> = Concentration Problems Frequency Ã— 3
          </p>
          <p>
            <strong>Word-Finding Contribution</strong> = Word-Finding Difficulties Ã— 2
          </p>
          <p>
            <strong>Sleep Contribution</strong> = (10 - Sleep Quality) Ã— 2
          </p>
          <p>
            <strong>Stress Contribution</strong> = Stress Level Ã— 2
          </p>
          <p>Score ranges from 0-100, with higher scores suggesting a general lifestyle tendency where brain fog may be more significant. This is a personal insight, not a medical evaluation.</p>
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
            Brain fog may be a common experience characterized by changes in cognitive function, including confusion, forgetfulness, lack of mental clarity, and difficulty concentrating. It may feel like your brain is wrapped in a fog, making clear thinking challenging. This tool provides general wellness insights about brain fog by evaluating mental clarity, memory difficulties, concentration problems, word-finding issues, sleep quality, and stress levels. This is a personal lifestyle insight, not a medical evaluation.
          </p>
          <p>
            Understanding your brain fog wellness score may help identify contributing lifestyle factors and develop targeted strategies for improvement. Lifestyle factors that may contribute include poor sleep, high stress, nutritional patterns, hydration, and other lifestyle factors. By addressing lifestyle factors systematically, you may improve cognitive clarity.
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
          <p>This tool provides general wellness insights about brain fog based on mental clarity, memory difficulties, concentration problems, word-finding issues, sleep quality, and stress levels. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include a brain fog wellness score, wellness level, interpretation, recommendations, and an action plan.</p>
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
