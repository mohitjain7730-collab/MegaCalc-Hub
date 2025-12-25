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
    slug: 'conception-probability-per-cycle-calculator',
    description: 'Basic ovulation calculator to coordinate with mucus tracking.',
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
  let interpretation =
    'These observations point to mucus that is less typical of the higher‑fertility part of the cycle. Continuing to track can help you learn your own patterns over time.';

  if (fertilityScore >= 60 && (values.consistency === 'watery' || values.consistency === 'egg-white')) {
    status = 'fertile';
    interpretation =
      'Your entries look similar to what many people notice near their more fertile days. This is still just one sign, and every body is different.';
  } else if (fertilityScore >= 40 || values.consistency === 'creamy') {
    status = 'approaching-fertile';
    interpretation =
      'Your mucus pattern may be moving toward a more fertile phase. Gently watching how it shifts over the next days can offer more insight.';
  }

  const recommendations = [
    'If you choose to track, observing cervical mucus at about the same times each day can help you notice your own rhythm.',
    'Changes toward clearer, stretchier, or more abundant mucus often line up with more fertile days for many people, but not always for everyone.',
    'You can combine mucus notes with other signs (like OPKs or temperature) if you want a broader view of your cycle pattern.',
  ];
  if (status === 'fertile') {
    recommendations.push('If you are exploring conception, you might choose to pay extra attention to this part of your cycle while remembering timing is never guaranteed.');
  }
  if (status === 'approaching-fertile') {
    recommendations.push('If you like, this may be a time to begin or continue using OPKs or other methods you’re comfortable with, alongside mucus tracking.');
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
                <p className="text-xs text-muted-foreground">A 0–100 pattern score from this model, based on the mucus details you entered.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Ovulation proximity</p>
                <p className="text-2xl font-semibold text-primary">{result.ovulationProximity.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">A rough indication of how “ovulation‑like” this snapshot appears in the model.</p>
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
                <p className="text-xs text-muted-foreground">A simple label based on the consistency description you selected.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Optimal timing</p>
                <p className="text-xl font-semibold text-primary">
                  {result.status === 'fertile' ? 'Now' : result.status === 'approaching-fertile' ? '1-3 days' : 'Continue tracking'}
                </p>
                <p className="text-xs text-muted-foreground">An approximate window only—your body’s actual timing may differ.</p>
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
          <p>This tool summarizes your cervical mucus observations and cycle day into a simple pattern score and an estimated proximity to more fertile days.</p>
          <p>You can use these outputs as one lens on your cycle alongside your own tracking and any advice from reproductive health professionals.</p>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        Disclaimer: This tool provides general wellness and educational insights only. It is not a diagnostic, fertility, or
        contraceptive tool. For contraception, conception planning, or cycle concerns, please consult a qualified professional.
      </p>
    </div>
  );
}

