'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Droplets, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  cycleDay: z.number({ invalid_type_error: 'Enter cycle day' }).min(1).max(35),
  mucusScore: z.number({ invalid_type_error: 'Enter mucus score' }).min(1).max(5),
  consistency: z.enum(['dry', 'sticky', 'creamy', 'watery', 'egg-white']),
  amount: z.enum(['none', 'scant', 'moderate', 'abundant']),
  stretchiness: z.number({ invalid_type_error: 'Enter stretchiness' }).min(0).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  fertilityScore: number;
  ovulationProximity: number;
  status: 'fertile' | 'approaching-fertile' | 'not-fertile';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your current cycle day (day 1 = first day of period).',
  'Rate cervical mucus quality on a 1-5 scale (1 = dry, 5 = egg-white).',
  'Select consistency: dry, sticky, creamy, watery, or egg-white.',
  'Note amount: none, scant, moderate, or abundant.',
  'Rate stretchiness (0 = no stretch, 10 = very stretchy, like raw egg white).',
  'Review fertility score and ovulation proximity to plan conception timing.',
];

const faqs = [
  {
    question: 'What is fertile cervical mucus?',
    answer:
      'Fertile mucus is clear, stretchy, and abundant (like raw egg white). It helps sperm travel and survive, indicating approaching ovulation.',
  },
  {
    question: 'How do I check cervical mucus?',
    answer:
      'Wash hands, insert clean finger into vagina, or check toilet paper after wiping. Observe color, consistency, stretchiness, and amount.',
  },
  {
    question: 'What does each type mean?',
    answer:
      'Dry/sticky (days 1-5): not fertile. Creamy (days 6-10): approaching fertile. Watery (days 11-13): getting fertile. Egg-white (days 13-15): most fertile, ovulation near.',
  },
  {
    question: 'How long does fertile mucus last?',
    answer:
      'Fertile mucus typically appears 2-3 days before ovulation and peaks on ovulation day. It may last 1-3 days total.',
  },
  {
    question: 'Can I have fertile mucus without ovulating?',
    answer:
      'Rarely. Fertile mucus is a strong indicator of approaching ovulation, but confirm with OPKs or BBT if trying to conceive.',
  },
  {
    question: 'What if I do not see fertile mucus?',
    answer:
      'Some women produce less mucus. Hydration, medications, or hormonal issues can affect production. Consider OPKs or BBT tracking.',
  },
  {
    question: 'Does age affect mucus?',
    answer:
      'Yes. Mucus production may decrease with age or hormonal changes. Perimenopause can reduce fertile mucus quality and amount.',
  },
  {
    question: 'Can medications affect it?',
    answer:
      'Yes. Antihistamines, some medications, and hormonal contraceptives can reduce or alter cervical mucus production.',
  },
  {
    question: 'How accurate is mucus tracking?',
    answer:
      'When combined with other methods (OPKs, BBT), mucus tracking is 90%+ accurate. Alone, it is ~70-80% accurate for predicting fertile days.',
  },
  {
    question: 'What if mucus is always the same?',
    answer:
      'If mucus does not change throughout the cycle, consult a healthcare provider. It may indicate hormonal imbalances or other issues.',
  },
];

const relatedCalculators = [
  {
    name: 'Ovulation Window Probability (Advanced) Calculator',
    slug: 'ovulation-window-probability-advanced-calculator',
    description: 'Combine mucus tracking with other ovulation signs for accuracy.',
  },
  {
    name: 'Fertility Ovulation Calculator',
    slug: 'fertility-ovulation-calculator',
    description: 'Basic ovulation calculator to coordinate with mucus tracking.',
  },
  {
    name: 'Progesterone-to-Estrogen Ratio Calculator',
    slug: 'progesterone-to-estrogen-ratio-calculator',
    description: 'Check hormone balance that affects cervical mucus quality.',
  },
  {
    name: 'Follicular vs Luteal Phase Nutrition Planner Calculator',
    slug: 'follicular-vs-luteal-phase-nutrition-planner-calculator',
    description: 'Plan nutrition to support healthy cervical mucus production.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/fertile-cervical-mucus-tracking-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Fertile Cervical Mucus Tracking Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Fertile Cervical Mucus Tracking Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Track cervical mucus quality to assess fertility score and ovulation proximity for conception planning.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  // Mucus score (1-5) contributes 40 points
  const mucusScorePoints = (values.mucusScore / 5) * 40;
  
  // Consistency scoring
  const consistencyScores: Record<string, number> = {
    'dry': 0,
    'sticky': 10,
    'creamy': 20,
    'watery': 30,
    'egg-white': 40,
  };
  const consistencyPoints = consistencyScores[values.consistency] || 0;
  
  // Amount scoring
  const amountScores: Record<string, number> = {
    'none': 0,
    'scant': 5,
    'moderate': 10,
    'abundant': 15,
  };
  const amountPoints = amountScores[values.amount] || 0;
  
  // Stretchiness scoring (0-10 scale, contributes 5 points max)
  const stretchinessPoints = (values.stretchiness / 10) * 5;
  
  const fertilityScore = clamp(mucusScorePoints + consistencyPoints + amountPoints + stretchinessPoints, 0, 100);
  
  // Ovulation proximity: higher score = closer to ovulation
  // Cycle day 13-15 typically peak fertility
  const dayProximity = values.cycleDay >= 11 && values.cycleDay <= 16 ? 30 : Math.max(0, 30 - Math.abs(values.cycleDay - 13.5) * 2);
  const ovulationProximity = clamp((fertilityScore * 0.7) + (dayProximity * 0.3), 0, 100);

  let status: ResultPayload['status'] = 'not-fertile';
  let interpretation = 'Cervical mucus indicates low fertility. Continue tracking daily to identify fertile window.';

  if (fertilityScore >= 60 && (values.consistency === 'watery' || values.consistency === 'egg-white')) {
    status = 'fertile';
    interpretation = 'Fertile cervical mucus detected! This is the optimal time for conception. Ovulation is likely within 1-2 days.';
  } else if (fertilityScore >= 40 || values.consistency === 'creamy') {
    status = 'approaching-fertile';
    interpretation = 'Mucus indicates approaching fertile window. Continue daily tracking—fertile mucus may appear soon.';
  }

  const recommendations = [
    'Check cervical mucus daily, especially around days 10-16 of your cycle when ovulation typically occurs.',
    'Look for egg-white consistency (clear, stretchy, abundant) as the strongest sign of peak fertility.',
    'Combine mucus tracking with OPKs (ovulation predictor kits) or BBT for highest accuracy.',
  ];
  if (status === 'fertile') {
    recommendations.push('This is the optimal time for conception. Fertile mucus helps sperm survive and travel to the egg.');
  }
  if (status === 'approaching-fertile') {
    recommendations.push('Start using OPKs if available. Fertile mucus should appear within 1-3 days if ovulation is approaching.');
  }

  const plan = [
    { label: 'Today', detail: `Record mucus quality (score ${values.mucusScore}, ${values.consistency}). Track daily.` },
    { label: 'This Week', detail: 'Continue daily mucus checks. Watch for transition from creamy to watery to egg-white.' },
    { label: 'Ongoing', detail: 'Track mucus patterns over 2-3 cycles to identify your personal fertile window timing.' },
  ];

  return { fertilityScore, ovulationProximity, status, interpretation, recommendations, plan };
};

export default function FertileCervicalMucusTrackingCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cycleDay: undefined,
      mucusScore: undefined,
      consistency: 'dry',
      amount: 'none',
      stretchiness: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="cervical-mucus-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5" />
            Fertile Cervical Mucus Tracking Calculator
          </CardTitle>
          <CardDescription>Track cervical mucus quality to assess fertility score and ovulation proximity for conception planning.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your mucus observations</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cycleDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cycle day</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 13" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mucusScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mucus score (1-5)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="consistency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consistency</FormLabel>
                      <FormControl>
                        <select
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value as FormValues['consistency'])}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                          <option value="dry">Dry</option>
                          <option value="sticky">Sticky</option>
                          <option value="creamy">Creamy</option>
                          <option value="watery">Watery</option>
                          <option value="egg-white">Egg-white</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <select
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value as FormValues['amount'])}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                          <option value="none">None</option>
                          <option value="scant">Scant</option>
                          <option value="moderate">Moderate</option>
                          <option value="abundant">Abundant</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stretchiness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stretchiness (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate fertility score
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
            <CardDescription>See fertility score, ovulation proximity, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Fertility score</p>
                <p className="text-2xl font-semibold text-primary">{result.fertilityScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Ovulation proximity</p>
                <p className="text-2xl font-semibold text-primary">{result.ovulationProximity.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status.replace('-', ' ')}</p>
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
          <p><strong>Fertility score</strong> = mucus score (0-40) + consistency points (0-40) + amount points (0-15) + stretchiness points (0-5), max 100.</p>
          <p><strong>Ovulation proximity</strong> = (fertility score × 0.7) + (day proximity × 0.3), clamped to 0-100.</p>
          <p>Egg-white consistency, abundant amount, and high stretchiness (8-10) indicate peak fertility and approaching ovulation.</p>
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
                <p className="text-sm text-muted-foreground">Mucus quality</p>
                <p className="text-xl font-semibold text-primary">
                  {form.getValues().consistency === 'egg-white' ? 'Peak fertile' : form.getValues().consistency === 'watery' ? 'Fertile' : form.getValues().consistency === 'creamy' ? 'Approaching' : 'Not fertile'}
                </p>
                <p className="text-xs text-muted-foreground">Based on consistency</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Optimal timing</p>
                <p className="text-xl font-semibold text-primary">
                  {result.status === 'fertile' ? 'Now' : result.status === 'approaching-fertile' ? '1-3 days' : 'Continue tracking'}
                </p>
                <p className="text-xs text-muted-foreground">For conception</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Tracking accuracy</p>
                <p className="text-xl font-semibold text-primary">
                  {result.fertilityScore >= 60 ? 'High' : result.fertilityScore >= 40 ? 'Moderate' : 'Low'}
                </p>
                <p className="text-xs text-muted-foreground">Based on current data</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your mucus observations to see additional insights.</p>
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
          <p>Cervical mucus changes throughout the menstrual cycle. Fertile mucus (clear, stretchy, egg-white-like) indicates approaching ovulation and optimal conception timing.</p>
          <p>Use this calculator to track mucus quality, assess fertility score, and plan conception timing based on cervical mucus observations.</p>
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
          <p>This tool calculates fertility score and ovulation proximity from cervical mucus observations (score, consistency, amount, stretchiness) and cycle day.</p>
          <p>Outputs include fertility score, ovulation proximity, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

