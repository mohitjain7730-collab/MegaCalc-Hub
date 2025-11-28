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
  weeksPostpartum: z.number({ invalid_type_error: 'Enter weeks postpartum' }).min(1).max(104),
  breastfeeding: z.boolean().optional(),
  sleepHours: z.number({ invalid_type_error: 'Enter sleep hours' }).min(3).max(12),
  energyLevel: z.number({ invalid_type_error: 'Enter energy level' }).min(1).max(10),
  moodStability: z.number({ invalid_type_error: 'Enter mood stability' }).min(1).max(10),
  periodReturned: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  recoveryScore: number;
  hormonalBalance: number;
  monthsToFullRecovery: number;
  status: 'early-recovery' | 'mid-recovery' | 'late-recovery' | 'recovered';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter weeks since delivery (1-104 weeks, ~2 years).',
  'Indicate if you are currently breastfeeding (affects hormone recovery timeline).',
  'Log average nightly sleep hours and rate energy level (1-10).',
  'Rate mood stability (1 = very unstable, 10 = very stable).',
  'Indicate if your period has returned (hormonal milestone).',
  'Review recovery score, hormonal balance, and estimated time to full recovery.',
];

const faqs = [
  {
    question: 'How long does postpartum hormonal recovery take?',
    answer:
      'Hormonal recovery typically takes 6-12 months, but can vary. Breastfeeding, sleep, stress, and individual factors affect the timeline. Full recovery may take 12-24 months.',
  },
  {
    question: 'How does breastfeeding affect recovery?',
    answer:
      'Breastfeeding maintains elevated prolactin and suppresses estrogen, which can delay period return and extend hormonal recovery. This is normal and expected.',
  },
  {
    question: 'When should my period return?',
    answer:
      'Non-breastfeeding: typically 6-12 weeks. Breastfeeding: can be delayed 6+ months or until weaning. Both timelines are normal.',
  },
  {
    question: 'What hormones are involved?',
    answer:
      'Estrogen, progesterone, prolactin (if breastfeeding), cortisol, and thyroid hormones all fluctuate postpartum and gradually return to pre-pregnancy levels.',
  },
  {
    question: 'Is mood instability normal?',
    answer:
      'Yes. Postpartum mood changes (baby blues, postpartum depression) are common due to hormonal shifts, sleep deprivation, and stress. Seek support if severe.',
  },
  {
    question: 'How does sleep affect recovery?',
    answer:
      'Sleep is critical for hormonal recovery. Chronic sleep deprivation can delay recovery, affect mood, and impact energy levels. Prioritize rest when possible.',
  },
  {
    question: 'Can I speed up recovery?',
    answer:
      'Support recovery with adequate sleep, nutrition, stress management, and gentle exercise. However, hormonal recovery follows its own timeline and cannot be rushed.',
  },
  {
    question: 'What about postpartum thyroid issues?',
    answer:
      'Postpartum thyroiditis affects 5-10% of women. Symptoms include fatigue, mood changes, and weight fluctuations. Consult a healthcare provider if concerned.',
  },
  {
    question: 'When should I be concerned?',
    answer:
      'Seek medical attention if you have severe mood changes, persistent fatigue, thyroid symptoms, or if recovery seems significantly delayed beyond 12-18 months.',
  },
  {
    question: 'Does exercise help?',
    answer:
      'Gentle exercise can support recovery, but avoid intense workouts too early. Focus on rest, nutrition, and gradual return to activity as energy allows.',
  },
];

const relatedCalculators = [
  {
    name: 'Progesterone-to-Estrogen Ratio Calculator',
    slug: 'progesterone-to-estrogen-ratio-calculator',
    description: 'Track hormone ratios during postpartum recovery.',
  },
  {
    name: 'Sleep Quality vs Productivity Correlation Calculator',
    slug: 'sleep-quality-vs-productivity-correlation-calculator',
    description: 'Manage sleep to support postpartum hormonal recovery.',
  },
  {
    name: 'Stress Hormone Balance Calculator',
    slug: 'stress-hormone-balance-calculator',
    description: 'Monitor cortisol and stress during postpartum period.',
  },
  {
    name: 'Exercise Recovery Score (HRV + Sleep Integration)',
    slug: 'exercise-recovery-score-hrv-sleep-integration',
    description: 'Track recovery if returning to exercise postpartum.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/postpartum-hormonal-recovery-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Postpartum Hormonal Recovery Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Postpartum Hormonal Recovery Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate postpartum hormonal recovery score, balance, and timeline based on weeks postpartum, breastfeeding, sleep, and symptoms.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  // Time factor: more weeks = higher recovery score
  const timeScore = clamp((values.weeksPostpartum / 52) * 40, 0, 40); // 0-40 points (1 year = 40)
  
  // Breastfeeding adjustment (delays recovery)
  const breastfeedingPenalty = values.breastfeeding ? -15 : 0;
  
  // Sleep support (7-9 hours optimal)
  const sleepScore = clamp((values.sleepHours / 9) * 20, 0, 20); // 0-20 points
  
  // Energy level
  const energyScore = clamp((values.energyLevel / 10) * 15, 0, 15); // 0-15 points
  
  // Mood stability
  const moodScore = clamp((values.moodStability / 10) * 15, 0, 15); // 0-15 points
  
  // Period returned bonus
  const periodBonus = values.periodReturned ? 10 : 0;
  
  const recoveryScore = clamp(timeScore + breastfeedingPenalty + sleepScore + energyScore + moodScore + periodBonus, 0, 100);
  const hormonalBalance = recoveryScore;
  
  // Estimate months to full recovery
  let monthsToFullRecovery = 12;
  if (recoveryScore >= 80) {
    monthsToFullRecovery = 0; // Already recovered
  } else if (recoveryScore >= 60) {
    monthsToFullRecovery = 3;
  } else if (recoveryScore >= 40) {
    monthsToFullRecovery = 6;
  } else if (recoveryScore >= 20) {
    monthsToFullRecovery = 9;
  }
  
  // Adjust for breastfeeding
  if (values.breastfeeding && monthsToFullRecovery < 12) {
    monthsToFullRecovery += 6; // Breastfeeding extends recovery
  }

  let status: ResultPayload['status'] = 'early-recovery';
  let interpretation = 'You are in early recovery. Hormones are still stabilizing. Focus on rest, nutrition, and self-care.';

  if (recoveryScore >= 80) {
    status = 'recovered';
    interpretation = 'Your hormonal recovery appears complete. Continue maintaining healthy habits for long-term wellness.';
  } else if (recoveryScore >= 60) {
    status = 'late-recovery';
    interpretation = 'You are in late recovery. Most hormones have stabilized, with minor adjustments remaining.';
  } else if (recoveryScore >= 40) {
    status = 'mid-recovery';
    interpretation = 'You are in mid-recovery. Hormones are stabilizing, but full recovery may take several more months.';
  }

  const recommendations = [
    'Prioritize sleep whenever possible. Sleep is critical for hormonal recovery and overall postpartum healing.',
    'Eat nutrient-dense foods to support hormone production and energy levels. Include protein, healthy fats, and complex carbs.',
    'Manage stress through gentle movement, meditation, or support groups. High stress can delay hormonal recovery.',
  ];
  if (values.breastfeeding) {
    recommendations.push('Breastfeeding delays period return and hormonal recovery—this is normal. Recovery will progress after weaning.');
  }
  if (status === 'early-recovery' || status === 'mid-recovery') {
    recommendations.push('Be patient with recovery. Hormonal shifts take time. Focus on self-care and gradual return to activities.');
  }

  const plan = [
    { label: 'This Month', detail: 'Track symptoms, sleep, and energy. Focus on rest and nutrition to support recovery.' },
    { label: 'Next 3 Months', detail: 'Continue monitoring recovery progress. Gradually increase activity as energy allows.' },
    { label: 'Ongoing', detail: 'Maintain healthy habits. Consult healthcare provider if recovery seems delayed or symptoms are severe.' },
  ];

  return { recoveryScore, hormonalBalance, monthsToFullRecovery, status, interpretation, recommendations, plan };
};

export default function PostpartumHormonalRecoveryCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weeksPostpartum: undefined,
      breastfeeding: undefined,
      sleepHours: undefined,
      energyLevel: undefined,
      moodStability: undefined,
      periodReturned: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="postpartum-recovery-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Postpartum Hormonal Recovery Calculator
          </CardTitle>
          <CardDescription>Estimate postpartum hormonal recovery score, balance, and timeline based on weeks postpartum, breastfeeding, sleep, and symptoms.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your postpartum recovery data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="weeksPostpartum"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weeks postpartum</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 12" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="breastfeeding"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currently breastfeeding?</FormLabel>
                      <FormControl>
                        <select
                          value={field.value === undefined ? '' : field.value ? 'yes' : 'no'}
                          onChange={(e) => field.onChange(e.target.value === 'yes' ? true : e.target.value === 'no' ? false : undefined)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                          <option value="">Not specified</option>
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
                  name="sleepHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep hours per night</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 6.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="energyLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Energy level (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="moodStability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mood stability (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="periodReturned"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Period returned?</FormLabel>
                      <FormControl>
                        <select
                          value={field.value === undefined ? '' : field.value ? 'yes' : 'no'}
                          onChange={(e) => field.onChange(e.target.value === 'yes' ? true : e.target.value === 'no' ? false : undefined)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                          <option value="">Not specified</option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate recovery score
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
            <CardDescription>See recovery score, hormonal balance, and estimated time to full recovery.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recovery score</p>
                <p className="text-2xl font-semibold text-primary">{result.recoveryScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Hormonal balance</p>
                <p className="text-2xl font-semibold text-primary">{result.hormonalBalance.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Months to recovery</p>
                <p className="text-2xl font-semibold text-primary">{result.monthsToFullRecovery}</p>
                <p className="text-xs text-muted-foreground">Estimated</p>
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
          <p><strong>Recovery score</strong> = time score (0-40) − breastfeeding penalty (0-15) + sleep score (0-20) + energy score (0-15) + mood score (0-15) + period bonus (0-10), clamped to 0-100.</p>
          <p><strong>Hormonal balance</strong> = recovery score (same calculation).</p>
          <p><strong>Months to full recovery</strong>: Based on recovery score and breastfeeding status. Breastfeeding extends recovery timeline by ~6 months.</p>
          <p>More time postpartum, better sleep, higher energy, stable mood, and period return increase recovery score.</p>
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
                <p className="text-sm text-muted-foreground">Time factor</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().weeksPostpartum ?? 0) / 52 * 100).toFixed(0)}% of year
                </p>
                <p className="text-xs text-muted-foreground">Postpartum duration</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sleep adequacy</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().sleepHours ?? 0) >= 7 ? 'Good' : 'Needs improvement')}
                </p>
                <p className="text-xs text-muted-foreground">Target: 7-9 hours</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recovery progress</p>
                <p className="text-xl font-semibold text-primary">
                  {result.recoveryScore >= 80 ? 'Complete' : result.recoveryScore >= 60 ? 'Advanced' : result.recoveryScore >= 40 ? 'Moderate' : 'Early'}
                </p>
                <p className="text-xs text-muted-foreground">Based on score</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your postpartum recovery data to see additional insights.</p>
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
          <p>Postpartum hormonal recovery typically takes 6-12 months, but can extend to 12-24 months, especially with breastfeeding. Hormones gradually return to pre-pregnancy levels.</p>
          <p>Use this calculator to assess recovery progress, estimate time to full recovery, and get recommendations for supporting hormonal balance during the postpartum period.</p>
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
          <p>This tool estimates postpartum hormonal recovery score, balance, and timeline from weeks postpartum, breastfeeding status, sleep, energy, mood stability, and period return.</p>
          <p>Outputs include recovery score, hormonal balance, months to full recovery, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

