'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Battery, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  sweatLossLiters: z.number({ invalid_type_error: 'Enter sweat loss' }).min(0.5).max(5.0),
  sodiumIntakeMg: z.number({ invalid_type_error: 'Enter sodium intake' }).min(0).max(5000),
  potassiumIntakeMg: z.number({ invalid_type_error: 'Enter potassium intake' }).min(0).max(5000),
  magnesiumIntakeMg: z.number({ invalid_type_error: 'Enter magnesium intake' }).min(0).max(1000),
  hoursSinceLoss: z.number({ invalid_type_error: 'Enter hours since loss' }).min(0).max(24),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  balanceScore: number;
  sodiumGap: number;
  potassiumGap: number;
  magnesiumGap: number;
  status: 'balanced' | 'needs-sodium' | 'needs-multiple';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Estimate total sweat loss in liters from your workout or heat exposure.',
  'Log current sodium, potassium, and magnesium intake in milligrams.',
  'Enter hours since the sweat loss occurred.',
  'Review balance score, electrolyte gaps, and restoration recommendations.',
  'Use the output to plan targeted electrolyte replacement strategies.',
];

const faqs = [
  {
    question: 'What are typical electrolyte losses in sweat?',
    answer:
      'Sweat contains roughly 500â€“1000 mg/L sodium, 100â€“200 mg/L potassium, and 10â€“20 mg/L magnesium. Losses vary by individual and conditions.',
  },
  {
    question: 'How much sodium do I need after exercise?',
    answer:
      'Aim to replace 500â€“700 mg per liter of sweat lost. For intense or long sessions, include sodium in your recovery fluids.',
  },
  {
    question: 'Can I get electrolytes from food?',
    answer:
      'Yes. Foods like bananas (potassium), nuts/seeds (magnesium), and salted snacks (sodium) can help restore balance alongside fluids.',
  },
  {
    question: 'What if I only drink water?',
    answer:
      'Water alone can dilute electrolytes further, especially sodium. Include electrolyte sources for sessions over 60 minutes or in heat.',
  },
  {
    question: 'How quickly should I replace electrolytes?',
    answer:
      'Replace most losses within 2â€“4 hours post-exercise. Spread intake to avoid gastrointestinal upset.',
  },
  {
    question: 'Do I need supplements?',
    answer:
      'Not always. Whole foods and electrolyte drinks often suffice. Supplements can help if losses are very high or dietary intake is low.',
  },
  {
    question: 'What are signs of electrolyte imbalance?',
    answer:
      'Muscle cramps, fatigue, dizziness, nausea, or headache can indicate low sodium or other imbalances. Severe symptoms need medical attention.',
  },
  {
    question: 'Can I overdo electrolytes?',
    answer:
      'Excessive sodium can raise blood pressure in sensitive individuals. Very high potassium or magnesium can cause issues. Balance is key.',
  },
  {
    question: 'Does timing matter?',
    answer:
      'Yes. Replace electrolytes during and immediately after exercise for best absorption and recovery support.',
  },
  {
    question: 'What about for multiple daily sessions?',
    answer:
      'Track cumulative losses and replace throughout the day. Monitor symptoms and adjust intake based on individual needs.',
  },
];

const relatedCalculators = [
  {
    name: 'Hydration Recovery After Workout Calculator',
    slug: 'hydration-recovery-after-workout-calculator',
    description: 'Track fluid replacement alongside electrolyte balance.',
  },
  {
    name: 'Sauna Session Detox Score Calculator',
    slug: 'sauna-session-detox-score-calculator',
    description: 'Monitor electrolyte needs after heat exposure.',
  },
  {
    name: 'Vitamin Deficiency Risk Estimator',
    slug: 'vitamin-deficiency-risk-estimator',
    description: 'Assess overall nutrient status including electrolytes.',
  },
  {
    name: 'Hydration Needs Calculator',
    slug: 'hydration-needs-calculator',
    description: 'Calculate daily baseline hydration and electrolyte needs.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/electrolyte-balance-restoration-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Electrolyte Balance Restoration Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Electrolyte Balance Restoration Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate electrolyte gaps, balance score, and get restoration recommendations after sweat loss.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  // Typical sweat composition (mg per liter)
  const sodiumLossPerLiter = 750; // mg
  const potassiumLossPerLiter = 150; // mg
  const magnesiumLossPerLiter = 15; // mg

  const totalSodiumLoss = values.sweatLossLiters * sodiumLossPerLiter;
  const totalPotassiumLoss = values.sweatLossLiters * potassiumLossPerLiter;
  const totalMagnesiumLoss = values.sweatLossLiters * magnesiumLossPerLiter;

  const sodiumGap = clamp(totalSodiumLoss - values.sodiumIntakeMg, -500, 3000);
  const potassiumGap = clamp(totalPotassiumLoss - values.potassiumIntakeMg, -200, 1000);
  const magnesiumGap = clamp(totalMagnesiumLoss - values.magnesiumIntakeMg, -50, 200);

  // Balance score: 100 if all gaps are near zero, decreases with larger gaps
  const sodiumScore = clamp(100 - (Math.abs(sodiumGap) / 30), 0, 100);
  const potassiumScore = clamp(100 - (Math.abs(potassiumGap) / 10), 0, 100);
  const magnesiumScore = clamp(100 - (Math.abs(magnesiumGap) / 5), 0, 100);
  const balanceScore = (sodiumScore * 0.5 + potassiumScore * 0.3 + magnesiumScore * 0.2);

  let status: ResultPayload['status'] = 'balanced';
  let interpretation =
    'Based on these entries, your recent electrolyte pattern looks reasonably balanced within this simple model.';

  if (sodiumGap > 500 || potassiumGap > 200 || magnesiumGap > 50) {
    status = 'needs-sodium';
    interpretation =
      'This snapshot suggests you may have some room to gently top up sodium and perhaps other minerals after this sweat loss.';
  }
  if ((sodiumGap > 500 && potassiumGap > 200) || balanceScore < 60) {
    status = 'needs-multiple';
    interpretation =
      'Here, multiple electrolytes appear on the lower side in this model. It may help to explore more balanced sources of sodium, potassium, and magnesium in food or drinks.';
  }

  const recommendations = [
    'You can use this estimate as a loose guide for bringing in some sodium, potassium, and magnesium after heavier sweat days.',
    'Everyday foods and drinksâ€”like lightly salted meals, fruits, and nuts/seedsâ€”can often help nudge things back toward balance.',
    'If you use electrolyte drinks or mixes, you can choose options and amounts that feel comfortable for your body and context.',
  ];
  if (status === 'needs-sodium') {
    recommendations.push('Sodium is often lost in the largest amounts in sweat, so gently adding some through food or drinks may feel helpful.');
  }
  if (status === 'needs-multiple') {
    recommendations.push('You might choose more balanced electrolyte options or meals that include several minerals together, especially after longer or hotter sessions.');
  }

  const plan = [
    { label: 'Immediate (0â€“2 hours)', detail: 'After heavier sweating, consider pairing fluids with a bit of sodium and some naturally mineralâ€‘rich foods.' },
    { label: 'Next 2â€“4 hours', detail: 'Spread any extra electrolyte intake over time so it feels easy on your stomach and overall energy.' },
    { label: 'Ongoing', detail: 'Notice how your body feels (cramps, fatigue, general comfort) and gently adjust food and drink patterns around demanding days.' },
  ];

  return { balanceScore, sodiumGap, potassiumGap, magnesiumGap, status, interpretation, recommendations, plan };
};

export default function ElectrolyteBalanceRestorationCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sweatLossLiters: undefined,
      sodiumIntakeMg: undefined,
      potassiumIntakeMg: undefined,
      magnesiumIntakeMg: undefined,
      hoursSinceLoss: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="electrolyte-balance-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Battery className="h-5 w-5" />
            Electrolyte Balance Restoration Calculator
          </CardTitle>
          <CardDescription>Estimate electrolyte gaps, balance score, and get restoration recommendations.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your electrolyte status</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sweatLossLiters"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sweat loss (liters)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 1.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hoursSinceLoss"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hours since sweat loss</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 2" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sodiumIntakeMg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sodium intake (mg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="50" placeholder="e.g., 800" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="potassiumIntakeMg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Potassium intake (mg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="50" placeholder="e.g., 200" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="magnesiumIntakeMg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Magnesium intake (mg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="10" placeholder="e.g., 30" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate balance
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
            <CardDescription>See electrolyte gaps, balance score, and restoration recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Balance score</p>
                <p className="text-2xl font-semibold text-primary">{result.balanceScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">A 0â€“100 snapshot of how your current inputs fit this simple model.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sodium gap</p>
                <p className="text-2xl font-semibold text-primary">{result.sodiumGap.toFixed(0)} mg</p>
                <p className="text-xs text-muted-foreground">Positive values suggest you may want a bit more sodium after this sweat loss.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Potassium gap</p>
                <p className="text-2xl font-semibold text-primary">{result.potassiumGap.toFixed(0)} mg</p>
                <p className="text-xs text-muted-foreground">Positive values suggest extra potassium could be helpful.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Magnesium gap</p>
                <p className="text-2xl font-semibold text-primary">{result.magnesiumGap.toFixed(0)} mg</p>
                <p className="text-xs text-muted-foreground">Positive values suggest some additional magnesium might support you.</p>
              </div>
            </div>
            <div className="p-4 border rounded">
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-lg font-semibold text-primary capitalize">{result.status.replace('-', ' ')}</p>
              <p className="text-xs text-muted-foreground">{result.interpretation}</p>
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
          <p><strong>Sodium gap</strong> = (sweatLoss Ã— 750 mg/L) âˆ’ sodiumIntake, clamped to -500 to 3000 mg.</p>
          <p><strong>Potassium gap</strong> = (sweatLoss Ã— 150 mg/L) âˆ’ potassiumIntake, clamped to -200 to 1000 mg.</p>
          <p><strong>Magnesium gap</strong> = (sweatLoss Ã— 15 mg/L) âˆ’ magnesiumIntake, clamped to -50 to 200 mg.</p>
          <p><strong>Balance score</strong> = weighted average of individual electrolyte scores (sodium 50%, potassium 30%, magnesium 20%).</p>
          <p>Typical sweat contains ~750 mg/L sodium, ~150 mg/L potassium, and ~15 mg/L magnesium.</p>
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
                <p className="text-sm text-muted-foreground">Total electrolyte loss</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().sweatLossLiters ?? 0) * (750 + 150 + 15)).toFixed(0)} mg
                </p>
                <p className="text-xs text-muted-foreground">Sodium + potassium + magnesium</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Replacement needed</p>
                <p className="text-xl font-semibold text-primary">
                  {Math.max(0, result.sodiumGap) + Math.max(0, result.potassiumGap) + Math.max(0, result.magnesiumGap)} mg
                </p>
                <p className="text-xs text-muted-foreground">Total positive gaps</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Restoration urgency</p>
                <p className="text-xl font-semibold text-primary">
                  {(form.getValues().hoursSinceLoss ?? 0) > 4 ? 'High' : (form.getValues().hoursSinceLoss ?? 0) > 2 ? 'Moderate' : 'Low'}
                </p>
                <p className="text-xs text-muted-foreground">Based on time since loss</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your electrolyte status to see additional metrics.</p>
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
          <p>Electrolyte balance restoration after sweat loss requires replacing sodium (500â€“700 mg/L), potassium (100â€“200 mg/L), and magnesium (10â€“20 mg/L).</p>
          <p>Use this calculator to identify gaps, prioritize replacement, and optimize recovery through balanced electrolyte intake.</p>
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
          <p>This tool offers a simple view of possible electrolyte gaps and an overall balance score based on your sweat loss and the intake you enter.</p>
          <p>You can treat the outputs as gentle prompts for adjusting food and drink around demanding days, alongside your own signals and professional guidance.</p>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a
        medical or psychological diagnosis. For any health concerns, please consult a qualified professional.
      </p>
    </div>
  );
}

