'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  spermCount: z.number({ invalid_type_error: 'Enter sperm count' }).min(0).max(500),
  motility: z.number({ invalid_type_error: 'Enter motility' }).min(0).max(100),
  morphology: z.number({ invalid_type_error: 'Enter morphology' }).min(0).max(100),
  volume: z.number({ invalid_type_error: 'Enter volume' }).min(0).max(10),
  age: z.number({ invalid_type_error: 'Enter age' }).min(18).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  healthIndex: number;
  fertilityScore: number;
  status: 'excellent' | 'good' | 'moderate' | 'poor';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter sperm count (million/mL) from semen analysis.',
  'Enter motility percentage (% of sperm that move).',
  'Enter morphology percentage (% of normally shaped sperm).',
  'Enter semen volume (mL) from the test.',
  'Enter your age (fertility declines with age).',
  'Review sperm health index, fertility score, and recommendations.',
];

const faqs = [
  {
    question: 'What is a normal sperm count?',
    answer:
      'Normal sperm count is typically ≥15 million/mL, with ≥39 million total per ejaculate. Lower counts may reduce fertility but do not eliminate it.',
  },
  {
    question: 'What is good motility?',
    answer:
      'Good motility is typically ≥40% progressive motility (sperm moving forward). Higher motility increases chances of reaching and fertilizing the egg.',
  },
  {
    question: 'What is normal morphology?',
    answer:
      'Normal morphology is typically ≥4% normally shaped sperm (WHO criteria) or ≥14% (strict criteria). Higher percentages indicate better sperm quality.',
  },
  {
    question: 'How does age affect male fertility?',
    answer:
      'Male fertility declines gradually with age. Sperm quality, DNA integrity, and pregnancy rates decrease, especially after age 40-45.',
  },
  {
    question: 'Can I improve sperm health?',
    answer:
      'Yes. Lifestyle changes (healthy diet, exercise, avoiding smoking/alcohol, reducing stress, adequate sleep) can improve sperm parameters over 2-3 months.',
  },
  {
    question: 'How long does it take to see improvements?',
    answer:
      'Sperm production takes ~74 days. Lifestyle changes typically show results in 2-3 months. Be patient and consistent.',
  },
  {
    question: 'Does heat affect sperm?',
    answer:
      'Yes. Excessive heat (hot tubs, saunas, tight clothing, laptops on lap) can temporarily reduce sperm count and quality.',
  },
  {
    question: 'What about supplements?',
    answer:
      'Some supplements (zinc, folic acid, CoQ10, vitamin D) may support sperm health, but consult a healthcare provider before starting.',
  },
  {
    question: 'When should I see a doctor?',
    answer:
      'See a healthcare provider if you have been trying to conceive for 12+ months without success, or if semen analysis shows abnormalities.',
  },
  {
    question: 'Can low sperm count be treated?',
    answer:
      'Yes. Treatment options include lifestyle changes, medications, surgery (for varicoceles), or assisted reproductive technologies (IUI, IVF).',
  },
];

const relatedCalculators = [
  {
    name: 'Testosterone-to-Cortisol Ratio Calculator',
    slug: 'testosterone-to-cortisol-ratio-calculator',
    description: 'Check hormonal balance that impacts fertility.',
  },
  {
    name: 'BMI Calculator',
    slug: 'bmi-calculator',
    description: 'Track BMI as obesity can affect sperm quality.',
  },
  {
    name: 'Exercise Recovery Score (HRV + Sleep Integration)',
    slug: 'exercise-recovery-score-hrv-sleep-integration',
    description: 'Monitor recovery and avoid overtraining that can affect fertility.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/male-fertility-sperm-health-index-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Male Fertility Sperm Health Index Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Male Fertility Sperm Health Index Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate sperm health index and fertility score from sperm count, motility, morphology, volume, and age.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  // Sperm count score (0-30 points, optimal ≥15 million/mL)
  const countScore = clamp((values.spermCount / 50) * 30, 0, 30);
  
  // Motility score (0-30 points, optimal ≥40%)
  const motilityScore = clamp((values.motility / 100) * 30, 0, 30);
  
  // Morphology score (0-25 points, optimal ≥4%)
  const morphologyScore = clamp((values.morphology / 100) * 25, 0, 25);
  
  // Volume score (0-10 points, optimal ≥1.5 mL)
  const volumeScore = clamp((values.volume / 2) * 10, 0, 10);
  
  // Age factor (declines after 40)
  const agePenalty = values.age > 40 ? clamp((values.age - 40) / 30 * 5, 0, 5) : 0;
  
  const healthIndex = clamp(countScore + motilityScore + morphologyScore + volumeScore - agePenalty, 0, 100);
  const fertilityScore = healthIndex;

  let status: ResultPayload['status'] = 'excellent';
  let interpretation = 'Your sperm health parameters appear excellent. Maintain current lifestyle habits.';

  if (healthIndex < 40) {
    status = 'poor';
    interpretation = 'Sperm health parameters are below optimal. Consider lifestyle changes and consult a healthcare provider for evaluation.';
  } else if (healthIndex < 60) {
    status = 'moderate';
    interpretation = 'Sperm health parameters are moderate. Lifestyle improvements may help optimize fertility.';
  } else if (healthIndex < 80) {
    status = 'good';
    interpretation = 'Sperm health parameters are good. Minor improvements may further optimize fertility.';
  }

  const recommendations = [
    'Maintain healthy lifestyle: balanced diet, regular exercise, adequate sleep, and stress management.',
    'Avoid excessive heat (hot tubs, saunas, tight clothing) and limit alcohol/tobacco use.',
    'Consider supplements (zinc, folic acid, CoQ10) after consulting with a healthcare provider.',
  ];
  if (status === 'moderate' || status === 'poor') {
    recommendations.push('Consult a healthcare provider or fertility specialist for comprehensive evaluation and treatment options if trying to conceive.');
  }
  if (status === 'poor') {
    recommendations.push('Sperm production takes ~74 days. Be patient with lifestyle changes and retest after 2-3 months to track improvements.');
  }

  const plan = [
    { label: 'This Week', detail: 'Review semen analysis results with a healthcare provider. Identify areas for improvement.' },
    { label: 'Next 2-3 Months', detail: 'Implement lifestyle changes (diet, exercise, sleep, stress reduction) to support sperm health.' },
    { label: 'Ongoing', detail: 'Retest after 2-3 months to track improvements. Continue healthy habits for long-term fertility support.' },
  ];

  return { healthIndex, fertilityScore, status, interpretation, recommendations, plan };
};

export default function MaleFertilitySpermHealthIndexCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      spermCount: undefined,
      motility: undefined,
      morphology: undefined,
      volume: undefined,
      age: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="male-fertility-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Male Fertility Sperm Health Index Calculator
          </CardTitle>
          <CardDescription>Calculate sperm health index and fertility score from sperm count, motility, morphology, volume, and age.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your semen analysis results</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="spermCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sperm count (million/mL)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 45" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="motility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motility (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 55" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="morphology"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Morphology (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="volume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Volume (mL)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 2.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Age (years)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 32" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate health index
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
            <CardDescription>See sperm health index, fertility score, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Health index</p>
                <p className="text-2xl font-semibold text-primary">{result.healthIndex.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Fertility score</p>
                <p className="text-2xl font-semibold text-primary">{result.fertilityScore.toFixed(0)}</p>
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
                    <Activity className="h-4 w-4" />
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
          <p><strong>Health index</strong> = count score (0-30) + motility score (0-30) + morphology score (0-25) + volume score (0-10) − age penalty (0-5), max 100.</p>
          <p><strong>Fertility score</strong> = health index (same calculation).</p>
          <p><strong>Optimal values</strong>: Count ≥15 million/mL, Motility ≥40%, Morphology ≥4%, Volume ≥1.5 mL.</p>
          <p>Higher sperm count, motility, morphology, and volume increase health index. Age over 40 adds a small penalty.</p>
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
          <CardTitle>Additional calculations</CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Count adequacy</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().spermCount ?? 0) >= 15 ? 'Normal' : 'Low')}
                </p>
                <p className="text-xs text-muted-foreground">Target: ≥15 million/mL</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Motility adequacy</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().motility ?? 0) >= 40 ? 'Good' : 'Needs improvement')}
                </p>
                <p className="text-xs text-muted-foreground">Target: ≥40%</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total sperm</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().spermCount ?? 0) * (form.getValues().volume ?? 0)).toFixed(0)} million
                </p>
                <p className="text-xs text-muted-foreground">Count × Volume</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your semen analysis results to see additional insights.</p>
          )}
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
          <p>Male fertility depends on sperm count, motility (movement), morphology (shape), and volume. Optimal values: count ≥15 million/mL, motility ≥40%, morphology ≥4%, volume ≥1.5 mL.</p>
          <p>Use this calculator to assess sperm health index from semen analysis results and get recommendations for improving fertility.</p>
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
          <p>This tool calculates sperm health index and fertility score from sperm count, motility, morphology, volume, and age.</p>
          <p>Outputs include health index, fertility score, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

