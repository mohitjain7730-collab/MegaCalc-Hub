'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  cycleLength: z.number({ invalid_type_error: 'Enter cycle length' }).min(21).max(35),
  lastPeriodStart: z.string().optional(),
  lhSurgeDetected: z.boolean().optional(),
  basalBodyTemp: z.number({ invalid_type_error: 'Enter BBT' }).min(96).max(100).optional(),
  cervicalMucusScore: z.number({ invalid_type_error: 'Enter mucus score' }).min(1).max(5).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  ovulationDay: number;
  fertileWindowStart: number;
  fertileWindowEnd: number;
  probabilityScore: number;
  status: 'high-probability' | 'moderate-probability' | 'low-probability';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your average cycle length (days from period start to next period start).',
  'Optionally enter the start date of your last period for calendar-based prediction.',
  'Log if you detected an LH surge (luteinizing hormone peak).',
  'Enter basal body temperature (BBT) if tracking (typically 97-98°F pre-ovulation, 97.5-99°F post-ovulation).',
  'Rate cervical mucus quality (1 = dry, 5 = egg-white consistency).',
  'Review ovulation day estimate, fertile window, and probability score.',
];

const faqs = [
  {
    question: 'What is the fertile window?',
    answer:
      'The fertile window is typically 5-6 days: 3-5 days before ovulation (sperm can survive) and the day of ovulation. Ovulation usually occurs 12-16 days before the next period.',
  },
  {
    question: 'How accurate is calendar-based prediction?',
    answer:
      'Calendar method alone is ~70-80% accurate. Combining multiple signs (LH surge, BBT, cervical mucus) increases accuracy to 90%+.',
  },
  {
    question: 'What is an LH surge?',
    answer:
      'Luteinizing hormone surge triggers ovulation 24-36 hours later. Ovulation predictor kits (OPKs) detect this surge in urine.',
  },
  {
    question: 'How does BBT help?',
    answer:
      'Basal body temperature rises 0.5-1°F after ovulation due to progesterone. Tracking BBT confirms ovulation occurred but does not predict it.',
  },
  {
    question: 'What is fertile cervical mucus?',
    answer:
      'Fertile mucus is clear, stretchy, and egg-white-like (score 4-5). It helps sperm travel and indicates approaching ovulation.',
  },
  {
    question: 'Can I ovulate on different days?',
    answer:
      'Yes. Cycle length and ovulation timing can vary. Stress, illness, or lifestyle changes can shift ovulation by several days.',
  },
  {
    question: 'What if my cycle is irregular?',
    answer:
      'Irregular cycles make prediction harder. Use multiple tracking methods (OPKs, BBT, mucus) and consider consulting a fertility specialist.',
  },
  {
    question: 'How long does ovulation last?',
    answer:
      'Ovulation itself lasts 12-24 hours, but the egg is viable for about 12-24 hours. Sperm can survive 3-5 days in fertile cervical mucus.',
  },
  {
    question: 'Do apps help?',
    answer:
      'Apps can help track data, but accuracy depends on input quality. Combining app tracking with physical signs (OPKs, BBT) improves reliability.',
  },
  {
    question: 'When should I test for pregnancy?',
    answer:
      'Test 10-14 days after suspected ovulation. Testing too early may give false negatives. Use first-morning urine for best results.',
  },
];

const relatedCalculators = [
  {
    name: 'Fertile Cervical Mucus Tracking Calculator',
    slug: 'fertile-cervical-mucus-tracking-calculator',
    description: 'Track cervical mucus quality to identify fertile days.',
  },
  {
    name: 'Fertility Ovulation Calculator',
    slug: 'conception-probability-per-cycle-calculator',
    description: 'Basic ovulation calculator for cycle tracking.',
  },
  {
    name: 'Follicular vs Luteal Phase Nutrition Planner Calculator',
    slug: 'follicular-vs-luteal-phase-nutrition-planner-calculator',
    description: 'Plan nutrition around ovulation and cycle phases.',
  },
  {
    name: 'Menstrual Phase Workout Intensity Planner',
    slug: 'menstrual-phase-workout-intensity-planner',
    description: 'Coordinate workouts with ovulation timing.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/ovulation-window-probability-advanced-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Ovulation Window Probability (Advanced) Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Ovulation Window Probability (Advanced) Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate ovulation day, fertile window, and probability score using cycle length, LH surge, BBT, and cervical mucus.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  // Standard calculation: ovulation typically occurs 14 days before next period
  // But can vary: 12-16 days before next period
  const averageOvulationDay = values.cycleLength - 14;
  const ovulationDay = clamp(averageOvulationDay, 10, 20);
  
  // Fertile window: 5 days before ovulation to day of ovulation
  const fertileWindowStart = Math.max(1, ovulationDay - 5);
  const fertileWindowEnd = ovulationDay;
  
  // Probability score based on multiple factors
  let probabilityScore = 60; // Base score from calendar method
  
  if (values.lhSurgeDetected) {
    probabilityScore += 25; // LH surge is strong indicator
  }
  
  if (values.basalBodyTemp && values.basalBodyTemp > 97.5) {
    probabilityScore += 10; // Elevated BBT suggests post-ovulation or approaching
  }
  
  if (values.cervicalMucusScore && values.cervicalMucusScore >= 4) {
    probabilityScore += 15; // Fertile mucus indicates approaching ovulation
  }
  
  const finalProbability = clamp(probabilityScore, 0, 100);

  let status: ResultPayload['status'] = 'moderate-probability';
  let interpretation =
    'Based on your entries, this model suggests a moderate level of confidence in the estimated ovulation window—adding more tracking signals can clarify the picture.';

  if (finalProbability >= 80) {
    status = 'high-probability';
    interpretation =
      'Multiple signs you entered line up, so this estimate may be a relatively stronger candidate for your likely ovulation window—still as an approximation, not a guarantee.';
  }
  if (finalProbability < 50) {
    status = 'low-probability';
    interpretation =
      'There is limited or mixed input data here, so this estimate should be treated as very rough—more tracking over several cycles can make patterns clearer.';
  }

  const recommendations = [
    'If you enjoy tracking, you can use ovulation predictor kits (OPKs) to notice LH changes around your expected mid‑cycle days.',
    'Daily basal body temperature and cervical mucus notes, if you choose to track them, can help you understand your own patterns over time.',
    'Remember that cycles can shift from month to month; treat any single estimate as one reference point rather than a precise prediction.',
  ];
  if (status === 'moderate-probability') {
    recommendations.push('Combining calendar estimates with at least one body sign you’re comfortable tracking can make your personal pattern feel more visible.');
  }
  if (status === 'low-probability') {
    recommendations.push('If it feels helpful, you could log a few different signs (OPKs, BBT, mucus) across several cycles to gently learn how your body tends to behave.');
  }

  const plan = [
    { label: 'This Cycle', detail: `Track fertile window (days ${fertileWindowStart}-${fertileWindowEnd}). Use OPKs starting day ${fertileWindowStart - 2}.` },
    { label: 'Next Cycle', detail: 'Add BBT tracking and cervical mucus monitoring to improve accuracy.' },
    { label: 'Ongoing', detail: 'Continue tracking multiple signs to refine ovulation predictions and identify patterns.' },
  ];

  return { ovulationDay, fertileWindowStart, fertileWindowEnd, probabilityScore: finalProbability, status, interpretation, recommendations, plan };
};

export default function OvulationWindowProbabilityAdvancedCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cycleLength: undefined,
      lastPeriodStart: undefined,
      lhSurgeDetected: undefined,
      basalBodyTemp: undefined,
      cervicalMucusScore: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="ovulation-window-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Ovulation Window Probability (Advanced) Calculator
          </CardTitle>
          <CardDescription>Estimate ovulation day, fertile window, and probability score using cycle length, LH surge, BBT, and cervical mucus.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your cycle and tracking data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cycleLength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cycle length (days)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 28" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lhSurgeDetected"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LH surge detected?</FormLabel>
                      <FormControl>
                        <select
                          value={field.value === undefined ? '' : field.value ? 'yes' : 'no'}
                          onChange={(e) => field.onChange(e.target.value === 'yes' ? true : e.target.value === 'no' ? false : undefined)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                          <option value="">Not tracked</option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="basalBodyTemp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Basal body temp (°F)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 97.8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cervicalMucusScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cervical mucus score (1-5)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate ovulation window
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
            <CardDescription>See ovulation day, fertile window, and probability score.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Ovulation day</p>
                <p className="text-2xl font-semibold text-primary">Day {result.ovulationDay}</p>
                <p className="text-xs text-muted-foreground">A model-based estimate, not a confirmed date.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Fertile window</p>
                <p className="text-2xl font-semibold text-primary">Days {result.fertileWindowStart}-{result.fertileWindowEnd}</p>
                <p className="text-xs text-muted-foreground">A typical 5–6 day span often considered more likely to be fertile.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Probability score</p>
                <p className="text-2xl font-semibold text-primary">{result.probabilityScore}</p>
                <p className="text-xs text-muted-foreground">A 0–100 confidence-style score from this model only.</p>
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
          <p><strong>Ovulation day</strong> ≈ cycle length − 14 days (range: 12-16 days before next period).</p>
          <p><strong>Fertile window</strong> = ovulation day − 5 to ovulation day (5-6 days total).</p>
          <p><strong>Probability score</strong> = 60 (calendar base) + 25 (LH surge) + 10 (elevated BBT) + 15 (fertile mucus), max 100.</p>
          <p>Combining multiple tracking methods (OPKs, BBT, mucus) increases accuracy significantly.</p>
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
                <p className="text-sm text-muted-foreground">Days until ovulation</p>
                <p className="text-xl font-semibold text-primary">
                  {result.ovulationDay - (form.getValues().cycleLength ? Math.floor(form.getValues().cycleLength / 2) : 14)} days
                </p>
                <p className="text-xs text-muted-foreground">From mid-cycle estimate</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Fertile window length</p>
                <p className="text-xl font-semibold text-primary">
                  {result.fertileWindowEnd - result.fertileWindowStart + 1} days
                </p>
                <p className="text-xs text-muted-foreground">Optimal conception window</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Tracking methods used</p>
                <p className="text-xl font-semibold text-primary">
                  {[form.getValues().lhSurgeDetected !== undefined, form.getValues().basalBodyTemp !== undefined, form.getValues().cervicalMucusScore !== undefined].filter(Boolean).length} / 3
                </p>
                <p className="text-xs text-muted-foreground">More methods = higher accuracy</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your cycle and tracking data to see additional insights.</p>
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
          <p>Ovulation typically occurs 12-16 days before the next period. The fertile window spans 5-6 days: 3-5 days before ovulation and the day of ovulation.</p>
          <p>Use this calculator to estimate ovulation timing using cycle length and multiple tracking methods (LH surge, BBT, cervical mucus) for higher accuracy.</p>
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
          <p>This tool offers an estimated ovulation window and confidence score based on cycle length and any body signs you choose to log.</p>
          <p>You can use it as one informational lens alongside your own tracking, preferences, and any guidance from reproductive health professionals.</p>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a
        medical or psychological diagnosis, fertility prediction, or contraceptive method. For any health or family planning
        concerns, please consult a qualified professional.
      </p>
    </div>
  );
}

