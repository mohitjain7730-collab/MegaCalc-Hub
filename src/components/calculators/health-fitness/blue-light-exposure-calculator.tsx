'use client';

import { useMemo, useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sun, Moon, Eye, ShieldCheck, Lightbulb } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { EmbedWidget } from '@/components/embed-widget';

const formSchema = z
  .object({
    screenHours: z
      .number({ invalid_type_error: 'Enter total daily screen hours' })
      .min(0, 'Screen time cannot be negative')
      .max(18, 'Cap entries at 18 hours'),
    nightHours: z
      .number({ invalid_type_error: 'Enter evening/night usage' })
      .min(0)
      .max(12, 'Keep within realistic night usage'),
    screenBrightness: z
      .number({ invalid_type_error: 'Enter average brightness' })
      .min(10)
      .max(100),
    filterReduction: z
      .number({ invalid_type_error: 'Enter blue-light filter %' })
      .min(0)
      .max(100),
    ambientLux: z
      .number({ invalid_type_error: 'Enter ambient lux' })
      .min(0)
      .max(2000),
    distance: z
      .number({ invalid_type_error: 'Enter viewing distance' })
      .min(20)
      .max(120),
  })
  .refine(
    ({ screenHours, nightHours }) => nightHours <= screenHours,
    { path: ['nightHours'], message: 'Night usage cannot exceed total screen hours' },
  );

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  totalDose: number;
  safeRange: [number, number];
  riskLevel: 'managed' | 'elevated' | 'high';
  interpretation: string;
  circadianImpact: number;
  melatoninDelay: number;
  filterBenefit: number;
  recommendations: string[];
  actionPlan: { label: string; detail: string }[];
};

const steps = [
  'Gather your average daily screen hours and note how many happen after sunset.',
  'Estimate average screen brightness (most phones list the exact percentage).',
  'Enter the strength of any blue-light filter or night shift mode you use.',
  'Add approximate ambient light (lux) from lamps or room lighting.',
  'Record how far your eyes typically are from the display.',
  'Run the calculation and adjust one variable at a time to test mitigation ideas.',
];

const faqs = [
  {
    question: 'What does the Blue Light Exposure Calculator measure?',
    answer:
      'It estimates your cumulative daily blue-light dose (in lux-hours) based on screen brightness, duration, filters, ambient lighting, and viewing distance.',
  },
  {
    question: 'Is blue light always harmful?',
    answer:
      'Moderate exposure during daytime aids alertness, but excessive nighttime exposure can delay melatonin release, interfere with circadian rhythm, and contribute to digital eye strain.',
  },
  {
    question: 'How accurate is the exposure score?',
    answer:
      'It uses evidence-based heuristics and relative intensity factors. Results are intended for awareness, not as a medical device or diagnostic metric.',
  },
  {
    question: 'What lux level should I aim for?',
    answer:
      'Keeping total daily blue-light dose below ~1,000 lux-hours and limiting nighttime share to under 30% supports circadian balance for most adults.',
  },
  {
    question: 'Do blue-light glasses count as filter reduction?',
    answer:
      'Yes. Input the manufacturer’s advertised blue-light blocking percentage as the filter value to estimate benefit.',
  },
  {
    question: 'How far should my screen be from my eyes?',
    answer:
      'A neutral baseline of ~40 cm (16 inches) keeps intensity manageable. Increasing distance lowers direct eye exposure appreciably.',
  },
  {
    question: 'Can ambient light offset blue light exposure?',
    answer:
      'Brighter ambient light reduces contrast between screen and environment, which can mitigate strain, but it still adds to total light dose, so balance is important.',
  },
  {
    question: 'How many breaks should I take?',
    answer:
      'Follow the 20-20-20 rule: every 20 minutes, look 20 feet away for 20 seconds. Entering slightly shorter screen sessions in the calculator helps model break patterns.',
  },
  {
    question: 'Does dark mode reduce blue light?',
    answer:
      'It lowers total luminance, especially on OLED displays, indirectly reducing blue-light dose. Combine dark mode with filters for the greatest effect.',
  },
  {
    question: 'Should kids use a different threshold?',
    answer:
      'Pediatric sleep specialists often recommend tighter limits. Use lower safe range values (<700 lux-hours) and prioritize daylight exposure over evening screen time.',
  },
];

const relatedCalculators = [
  {
    name: 'Screen Time vs Sleep Impact Calculator',
    slug: 'screen-time-vs-sleep-impact-calculator',
    description: 'Model how evening scrolling shifts your sleep onset and quality.',
  },
  {
    name: 'Sleep Debt Calculator',
    slug: 'sleep-debt-calculator-hf',
    description: 'Quantify short sleep patterns so you can build restorative habits.',
  },
  {
    name: 'Habit Streak Tracker Calculator',
    slug: 'habit-streak-tracker-calculator',
    description: 'Create streaks for reducing late-night scrolling and other routines.',
  },
  {
    name: 'Hydration Needs Calculator',
    slug: 'hydration-needs-calculator',
    description: 'Support eye comfort and metabolic health with personalized hydration goals.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/blue-light-exposure-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Blue Light Exposure Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'Article',
      headline: 'Blue Light Exposure Calculator',
      description: 'Estimate your daily blue-light dose, interpret risk levels, and get action steps to protect eye comfort and circadian health.',
      author: { '@type': 'Organization', name: 'Mycalculating.com' },
      publisher: { '@type': 'Organization', name: 'Mycalculating.com' },
      url: baseUrl,
      mainEntityOfPage: baseUrl,
      datePublished: '2024-01-01',
      dateModified: new Date().toISOString().split('T')[0],
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${baseUrl}#calculator`,
      name: 'Blue Light Exposure Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: ['Blue-light dose score', 'Circadian impact scoring', 'Melatonin delay estimate'],
      url: baseUrl,
      description: 'Interactive calculator that models blue-light exposure using brightness, duration, filters, and ambient lighting.',
    },
  ],
};

const calculateExposure = (values: FormValues): ResultPayload => {
  const brightnessFactor = values.screenBrightness / 100;
  const filterFactor = 1 - values.filterReduction / 100;
  const distanceFactor = Math.max(0.25, 40 / values.distance);
  const baselineLux = 500 * brightnessFactor;
  const directExposure = baselineLux * values.screenHours * filterFactor * distanceFactor;
  const ambientExposure = values.ambientLux * values.screenHours * 0.05;
  const totalDose = directExposure + ambientExposure;

  const safeRange: [number, number] = [500, 1000];
  const circadianImpact = values.screenHours === 0 ? 0 : (values.nightHours / values.screenHours) * 100;
  const melatoninDelay = values.nightHours * 12 * filterFactor;
  const filterBenefit = baselineLux * values.screenHours * (1 - filterFactor) * distanceFactor;

  let riskLevel: ResultPayload['riskLevel'] = 'managed';
  let interpretation =
    'Your blue-light dose sits within commonly recommended limits. Maintain daytime usage and short evening sessions.';

  if (totalDose > safeRange[1] || circadianImpact > 40) {
    riskLevel = 'elevated';
    interpretation =
      'Your exposure is trending high. Tighten evening limits, increase distance, or strengthen filters to protect sleep and comfort.';
  }
  if (totalDose > 1500 || circadianImpact > 60) {
    riskLevel = 'high';
    interpretation =
      'Exposure is well above ergonomic guidance. Prioritize proactive controls—warmer color temperature, darker rooms, and longer screen breaks.';
  }

  const baseRecommendations = [
    'Enable night-shift modes two hours before bedtime and keep brightness under 50% after sunset.',
    'Blink consciously and follow the 20-20-20 break rule to ease eye strain.',
    'Layer solutions: filters, dark mode, warmer color temperature, and ambient bias lighting.',
  ];

  const riskSpecific: Record<ResultPayload['riskLevel'], string[]> = {
    managed: [
      'Sustain periodic digital detox blocks so exposure never creeps upward.',
      'Log screen hours for a week to confirm the calculator aligns with your habits.',
    ],
    elevated: [
      'Move devices 10–15 cm farther away or prop them on a stand to drop dose instantly.',
      'Shift deep work or binge sessions earlier in the day to reduce circadian conflict.',
    ],
    high: [
      'Adopt amber filters or glasses blocking 60%+ blue light in the evening.',
      'Cap night sessions at 30 minutes and replace late scrolling with audio content.',
    ],
  };

  const actionPlan = [
    { label: 'Today', detail: 'Enable night shift / warm color profiles across every device.' },
    { label: 'This Week', detail: 'Batch late tasks earlier and insert two non-screen wind-down anchors.' },
    { label: 'Next 30 Days', detail: 'Audit workspace lighting and upgrade to indirect, dimmable lamps.' },
  ];

  return {
    totalDose,
    safeRange,
    riskLevel,
    interpretation,
    circadianImpact,
    melatoninDelay,
    filterBenefit,
    recommendations: [...baseRecommendations, ...riskSpecific[riskLevel]],
    actionPlan,
  };
};

export default function BlueLightExposureCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      screenHours: undefined,
      nightHours: undefined,
      screenBrightness: undefined,
      filterReduction: undefined,
      ambientLux: undefined,
      distance: undefined,
    },
  });

  const nightUsageHelper = useMemo(
    () => 'Aim to keep evening usage below 30% of total screen time to preserve melatonin production.',
    [],
  );

  const handleSubmit = (values: FormValues) => {
    setResult(calculateExposure(values));
  };

  return (
    <div className="space-y-8">
      <Script
        id="blue-light-exposure-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Blue Light Exposure Calculator
          </CardTitle>
          <CardDescription>
            Estimate daily blue-light dose from screens and lighting, then see how simple tweaks can lower eye strain and keep
            circadian rhythms on track.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your routine</CardTitle>
          <CardDescription>Leave fields blank until you are ready—everything is customized once you submit.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="screenHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total screen time (hours)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.25"
                          placeholder="e.g., 7.5"
                          value={field.value ?? ''}
                          onChange={(event) =>
                            field.onChange(event.target.value === '' ? undefined : Number(event.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nightHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Evening / night usage (hours)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.25"
                          placeholder="e.g., 2"
                          value={field.value ?? ''}
                          onChange={(event) =>
                            field.onChange(event.target.value === '' ? undefined : Number(event.target.value))
                          }
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">{nightUsageHelper}</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="screenBrightness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average brightness (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 65"
                          value={field.value ?? ''}
                          onChange={(event) =>
                            field.onChange(event.target.value === '' ? undefined : Number(event.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="filterReduction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blue-light filter strength (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 30"
                          value={field.value ?? ''}
                          onChange={(event) =>
                            field.onChange(event.target.value === '' ? undefined : Number(event.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ambientLux"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room / ambient light (lux)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="10"
                          placeholder="e.g., 300"
                          value={field.value ?? ''}
                          onChange={(event) =>
                            field.onChange(event.target.value === '' ? undefined : Number(event.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="distance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Viewing distance (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 40"
                          value={field.value ?? ''}
                          onChange={(event) =>
                            field.onChange(event.target.value === '' ? undefined : Number(event.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate exposure
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-primary" />
              Interactive result & interpretation
            </CardTitle>
            <CardDescription>Compare your dose with ergonomic guidance and get immediate context.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total dose (lux-hours)</p>
                <p className="text-2xl font-semibold text-primary">{Math.round(result.totalDose)}</p>
                <p className="text-xs text-muted-foreground">
                  Target range: {result.safeRange[0]}–{result.safeRange[1]} lux-hours
                </p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Nighttime share</p>
                <p className="text-2xl font-semibold text-primary">{result.circadianImpact.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Keep below 30% to minimize melatonin disruption.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Melatonin delay estimate</p>
                <p className="text-2xl font-semibold text-primary">{Math.round(result.melatoninDelay)} min</p>
                <p className="text-xs text-muted-foreground">Filter + shorter nights reduce this delay.</p>
              </div>
            </div>
            <div className="rounded border p-4 bg-muted/50">
              <p className="text-sm uppercase tracking-wide text-muted-foreground mb-1">Status</p>
              <p className="text-lg font-semibold capitalize">{result.riskLevel} exposure</p>
              <p className="text-sm text-muted-foreground">{result.interpretation}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded">
                <h4 className="font-semibold mb-2">Recommendations</h4>
                <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                  {result.recommendations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="p-4 border rounded">
                <h4 className="font-semibold mb-2">Action plan</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {result.actionPlan.map((plan) => (
                    <li key={plan.label}>
                      <span className="font-semibold">{plan.label}:</span> {plan.detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Formula breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Total Blue-Light Dose</strong> = (Screen Brightness × 500 lux) × Daily Screen Hours × (1 − Filter %) × Distance
            Factor + (Ambient Lux × Screen Hours × 0.05)
          </p>
          <p>
            Distance factor assumes 40 cm as neutral. Moving farther away lowers direct intensity. Filter percentage accounts for
            night shift software or glasses. Ambient light adds to overall light load even if it eases contrast.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Steps to use the calculator</CardTitle>
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
          <CardTitle>Additional calculation insights</CardTitle>
          <CardDescription>See how mitigation tactics influence specific metrics.</CardDescription>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Filter benefit</p>
                <p className="text-xl font-semibold text-primary">{Math.round(result.filterBenefit)} lux-hours avoided</p>
                <p className="text-xs text-muted-foreground">Upgrade filters to raise this savings number.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Dose vs safe max</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.totalDose / result.safeRange[1] * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Strive for ≤100% to stay inside ergonomic advice.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Circadian recovery gap</p>
                <p className="text-xl font-semibold text-primary">
                  {Math.max(0, result.circadianImpact - 30).toFixed(0)}% above target
                </p>
                <p className="text-xs text-muted-foreground">Move late sessions earlier until this hits zero.</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Run the calculator to unlock filter savings, safe-range comparisons, and circadian gap metrics.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related calculators</CardTitle>
          <CardDescription>Round out your healthy screen-time toolkit.</CardDescription>
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
          <CardDescription>Use these placeholder lines until you add the full deep dive.</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            Blue light is not inherently bad, but timing, intensity, and proximity matter. Consistent midday exposure combined with
            low evening exposure keeps circadian rhythms entrained while reducing eye strain.
          </p>
          <p>
            Layer technology fixes (filters, night shift, dark mode) with behavior shifts (breaks, distance, wind-down routines) for
            the most reliable relief. Mix in daylight walks to anchor your internal clock.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently asked questions</CardTitle>
          <CardDescription>SEO-ready answers users search for most often.</CardDescription>
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
            <ShieldCheck className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            This Blue Light Exposure Calculator uses the heuristic formula: total dose = screen luminance × hours × (1 − filter %) ×
            distance factor + ambient contribution.
          </p>
          <p>
            Outputs include total blue-light dose in lux-hours, circadian impact percentage, melatonin delay estimate, filter savings,
            and status-based recommendations.
          </p>
          <p>
            The page also delivers a formula explainer, step-by-step usage, related tools, and real-world mitigation examples so AI
            agents or accessibility bots can summarize the workflow instantly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


