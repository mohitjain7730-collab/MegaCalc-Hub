'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Zap, Target, AlertTriangle, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  lastScreenTime: z.number({ invalid_type_error: 'Enter last screen time' }).min(0).max(24),
  sleepQuality: z.number({ invalid_type_error: 'Select sleep quality' }).min(1).max(5),
  blueLightFilter: z.number({ invalid_type_error: 'Select blue light filter usage' }).min(0).max(100),
  screenBrightness: z.number({ invalid_type_error: 'Select screen brightness' }).min(1).max(5),
  bedroomLighting: z.number({ invalid_type_error: 'Select bedroom lighting' }).min(1).max(5),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  lastScreenTime: number;
  sleepQuality: number;
  blueLightFilter: number;
  screenBrightness: number;
  bedroomLighting: number;
  impactScore: number;
  impactPercent: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter hours since last screen use before sleep (0-24 hours).',
  'Rate your sleep quality last night (1=poor, 5=excellent).',
  'Enter blue light filter usage percentage (0-100%).',
  'Rate screen brightness when used (1=very dim, 5=very bright).',
  'Rate bedroom lighting after screen use (1=very dark, 5=very bright).',
  'Review impact score, status, and recommendations.',
];

const faqs = [
  {
    question: 'How does screen time before sleep affect sleep?',
    answer:
      'Screen use before sleep disrupts sleep through: blue light suppressing melatonin production (sleep hormone), mental stimulation preventing relaxation, delayed sleep onset, reduced sleep quality, and shorter sleep duration. Screens used within 1-2 hours of bedtime significantly impact sleep.',
  },
  {
    question: 'What is blue light and why does it matter?',
    answer:
      'Blue light is high-energy visible light emitted by screens. It suppresses melatonin production, which regulates sleep-wake cycles. Blue light exposure in evening delays sleep onset and reduces sleep quality. Filters, night mode, and avoiding screens help reduce impact.',
  },
  {
    question: 'How long before bed should I stop using screens?',
    answer:
      'Recommendation: stop screen use 1-2 hours before bedtime for optimal sleep. Even 30-60 minutes helps. The more time between last screen use and sleep, the better. This allows melatonin production to begin and mental stimulation to decrease.',
  },
  {
    question: 'Do blue light filters help?',
    answer:
      'Blue light filters help reduce but don\'t eliminate impact: they filter 30-60% of blue light, reducing melatonin suppression. However, mental stimulation and other factors still affect sleep. Filters are better than no protection but stopping screen use is best.',
  },
  {
    question: 'How does screen brightness affect sleep?',
    answer:
      'Brighter screens suppress more melatonin: very bright screens (5 rating) significantly suppress melatonin, while dim screens (1-2) have less impact. Dimming screens helps, but any screen use close to bedtime affects sleep. Lower brightness reduces but doesn\'t eliminate impact.',
  },
  {
    question: 'What about bedroom lighting?',
    answer:
      'Bedroom lighting matters: bright bedroom lighting after screen use further suppresses melatonin and delays sleep. Dark bedrooms (1-2 rating) support melatonin production and better sleep. Dim, warm lighting is better than bright, cool lighting for sleep.',
  },
  {
    question: 'What are signs of screen-related sleep disruption?',
    answer:
      'Signs include: difficulty falling asleep, delayed sleep onset, frequent nighttime awakenings, poor sleep quality, daytime fatigue, reduced sleep duration, and difficulty waking. If these improve when avoiding screens before bed, screen use is likely contributing.',
  },
  {
    question: 'How can I reduce screen impact on sleep?',
    answer:
      'Reduce impact by: stopping screen use 1-2 hours before bed, using blue light filters/night mode, dimming screen brightness, reading physical books instead, using sleep-friendly activities (meditation, gentle stretching), keeping bedroom dark, and establishing screen-free bedtime routine.',
  },
  {
    question: 'What about e-readers vs phones?',
    answer:
      'E-readers with front lighting still emit blue light and affect sleep, though less than bright phones/tablets. Physical books are best. If using e-readers, use warm light settings, dim brightness, and still allow time between reading and sleep for melatonin production.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult if you experience persistent sleep problems despite avoiding screens, chronic insomnia, excessive daytime sleepiness, sleep disorders, or sleep issues affecting daily functioning. Professional help can address underlying sleep issues beyond screen use.',
  },
];

const relatedCalculators = [
  {
    name: 'Digital Eye Strain Severity Index',
    slug: 'digital-eye-strain-severity-index',
    description: 'Calculate digital eye strain from screen use.',
  },
  {
    name: 'Daily Screen Time Impact Calculator',
    slug: 'daily-screen-time-impact-calculator',
    description: 'Assess overall screen time impact on health.',
  },
  {
    name: 'Blue Light Exposure Calculator',
    slug: 'blue-light-exposure-calculator',
    description: 'Calculate blue light exposure from screens.',
  },
  {
    name: 'Caffeine Half-Life Calculator (time-based)',
    slug: 'caffeine-half-life-calculator-time-based',
    description: 'Calculate caffeine half-life and clearance time.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/screen-to-sleep-time-impact-estimator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Screen-to-Sleep Time Impact Wellness Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Screen-to-Sleep Time Impact Wellness Estimator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate screen-to-sleep time impact on sleep quality from last screen time, sleep quality, blue light filter usage, screen brightness, and bedroom lighting.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const lastScreenTime = values.lastScreenTime;
  const sleepQuality = values.sleepQuality;
  const blueLightFilter = values.blueLightFilter;
  const screenBrightness = values.screenBrightness;
  const bedroomLighting = values.bedroomLighting;
  
  // Calculate impact score: screen time gap (more gap = better), sleep quality (lower = worse impact), blue light filter (higher = less impact), screen brightness (higher = more impact), bedroom lighting (brighter = worse)
  const timeGapFactor = lastScreenTime >= 2 ? 35 : lastScreenTime >= 1 ? 25 : lastScreenTime >= 0.5 ? 15 : 5; // 5-35 points (more gap = better)
  const sleepQualityFactor = (sleepQuality / 5) * 30; // 0-30 points (higher sleep quality = less negative impact)
  const filterFactor = (blueLightFilter / 100) * 15; // 0-15 points (more filter = less impact)
  const brightnessPenalty = ((screenBrightness - 1) / 4) * 10; // 0-10 points (penalty for bright screens)
  const lightingPenalty = ((bedroomLighting - 1) / 4) * 10; // 0-10 points (penalty for bright bedroom)
  
  // Calculate impact score (0-100 scale, higher = better/less negative impact)
  const impactScore = clamp(timeGapFactor + sleepQualityFactor + filterFactor - brightnessPenalty - lightingPenalty, 0, 100);
  const impactPercent = impactScore;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'This suggests a general lifestyle tendency where your screen-to-sleep time impact may appear minimal. Good time gap, sleep quality, blue light protection, and sleep-friendly environment may support healthy sleep patterns.';

  if (impactScore < 40 || lastScreenTime < 0.5 || sleepQuality <= 2 || screenBrightness >= 4) {
    status = 'low';
    interpretation = 'This suggests a general lifestyle tendency where your screen-to-sleep time impact may be high, indicating areas for improvement. Screens used very close to bedtime, poor sleep quality, bright screens, or inadequate blue light protection may be affecting sleep. You may consider prioritizing a 1-2 hour screen-free period before bed. This is a personal insight, not a medical evaluation.';
  } else if (impactScore < 60 || lastScreenTime < 1 || sleepQuality <= 3 || screenBrightness >= 3) {
    status = 'moderate';
    interpretation = 'This suggests a general lifestyle tendency where your screen-to-sleep time impact may be moderate. Screens used close to bedtime, suboptimal sleep quality, or screen settings may be affecting sleep. You may consider increasing time gap to 1-2 hours, using blue light filters, dimming screens, and optimizing bedroom lighting.';
  } else if (impactScore < 75) {
    status = 'good';
    interpretation = 'This suggests a general lifestyle tendency where your screen-to-sleep time impact may be acceptable but could be optimized. Some factors (time gap, blue light protection, or screen settings) may be affecting sleep quality. You may consider extending screen-free period and optimizing screen and bedroom settings.';
  } else {
    status = 'optimal';
    interpretation = 'This suggests a general lifestyle tendency where your screen-to-sleep time impact may be minimal. Good time gap between screen use and sleep, adequate blue light protection, appropriate screen settings, and sleep-friendly bedroom may support healthy sleep patterns.';
  }

  const recommendations = [
    'Stop screen use 1-2 hours before bed: create screen-free period before sleep. Use this time for relaxation: reading physical books, meditation, gentle stretching, listening to music, or calming activities. This allows melatonin production to begin and mental stimulation to decrease.',
    'Use blue light filters and night mode: enable blue light filters, night mode, or dark mode on all devices in evening hours. These reduce but don\'t eliminate blue light. Still aim for screen-free period, but filters help when screens are necessary.',
  ];
  
  if (screenBrightness >= 3) {
    recommendations.push('Dim screen brightness: reduce screen brightness in evening hours, especially before bed. Use lowest comfortable brightness level. Dimmer screens suppress less melatonin and have less impact on sleep.');
  }
  
  if (bedroomLighting >= 3) {
    recommendations.push('Optimize bedroom lighting: keep bedroom dark (1-2 rating) after screen use to support melatonin production. Use dim, warm lighting if needed. Avoid bright, cool lighting which further suppresses melatonin and delays sleep.');
  }
  
  if (lastScreenTime < 1) {
    recommendations.push('Increase time gap: screens used within 1 hour of bedtime significantly impact sleep. Aim for 1-2 hour screen-free period. Even 30 minutes helps. The more time between last screen use and sleep, the better for sleep quality.');
  }
  
  if (sleepQuality <= 3) {
    recommendations.push('Improve sleep hygiene: beyond screen use, optimize sleep: consistent sleep schedule, cool dark bedroom, comfortable mattress, regular exercise, stress management, and screen-free bedtime routine. Addressing screen use often improves sleep quality significantly.');
  }

  const plan = [
    { label: 'This Week', detail: `Establish screen-free period 1-2 hours before bed. Enable blue light filters and night mode on all devices. Begin dimming screens in evening. Start tracking sleep quality and screen-to-sleep timing.` },
    { label: 'This Month', detail: 'Maintain consistent screen-free bedtime routine. Optimize screen settings (brightness, filters). Keep bedroom dark after screen use. Replace screen time with sleep-friendly activities (reading, meditation). Monitor sleep quality improvements.' },
    { label: 'Ongoing', detail: 'Continue screen-free period and optimized settings. Maintain sleep-friendly bedtime routine. Monitor sleep quality and adjust as needed. Consider professional help if sleep issues persist despite screen management.' },
  ];

  return { lastScreenTime, sleepQuality, blueLightFilter, screenBrightness, bedroomLighting, impactScore, impactPercent, status, interpretation, recommendations, plan };
};

export default function ScreenToSleepTimeImpactEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lastScreenTime: undefined,
      sleepQuality: undefined,
      blueLightFilter: undefined,
      screenBrightness: undefined,
      bedroomLighting: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="screen-to-sleep-time-impact-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Screen-to-Sleep Time Impact Wellness Estimator
          </CardTitle>
          <CardDescription>Get general wellness insights about screen-to-sleep time impact on sleep quality from last screen time, sleep quality, blue light filter usage, screen brightness, and bedroom lighting. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your screen and sleep data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="lastScreenTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hours since last screen use before sleep (0-24)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 1.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Sleep quality last night (1-5: 1=poor, 5=excellent)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" min="1" max="5" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="blueLightFilter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blue light filter usage (0-100%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="5" placeholder="e.g., 50" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="screenBrightness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Screen brightness when used (1-5: 1=very dim, 5=very bright)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" min="1" max="5" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bedroomLighting"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedroom lighting after screen use (1-5: 1=very dark, 5=very bright)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" min="1" max="5" placeholder="e.g., 2" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate impact score
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
            <CardDescription>See impact score, status, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Impact score</p>
                <p className="text-2xl font-semibold text-primary">{result.impactScore.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Time gap</p>
                <p className="text-2xl font-semibold text-primary">{result.lastScreenTime.toFixed(1)}h</p>
                <p className="text-xs text-muted-foreground">Before sleep</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sleep quality</p>
                <p className="text-2xl font-semibold text-primary">{result.sleepQuality}/5</p>
                <p className="text-xs text-muted-foreground">Rating</p>
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
                    <AlertTriangle className="h-4 w-4" />
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
            <strong>Time gap factor</strong> = 35 if Last Screen Time â‰¥ 2 hours, 25 if â‰¥ 1 hour, 15 if â‰¥ 0.5 hours, else 5. Contributes 5-35 points. More time between screen use and sleep reduces impact. 1-2 hours is optimal.
          </p>
          <p>
            <strong>Sleep quality factor</strong> = (Sleep Quality / 5) Ã— 30. Contributes 0-30 points. Higher sleep quality indicates less negative impact. Poor sleep quality suggests screen use is affecting sleep.
          </p>
          <p>
            <strong>Filter factor</strong> = (Blue Light Filter / 100) Ã— 15. Contributes 0-15 points. Blue light filters reduce melatonin suppression. Higher filter usage reduces impact, though doesn't eliminate it.
          </p>
          <p>
            <strong>Brightness penalty</strong> = ((Screen Brightness - 1) / 4) Ã— 10. Penalty of 0-10 points. Brighter screens suppress more melatonin and have greater impact on sleep. Dimmer screens reduce but don't eliminate impact.
          </p>
          <p>
            <strong>Lighting penalty</strong> = ((Bedroom Lighting - 1) / 4) Ã— 10. Penalty of 0-10 points. Bright bedroom lighting after screen use further suppresses melatonin. Dark bedrooms (1-2) support better sleep.
          </p>
          <p>
            <strong>Impact score</strong> = Time Gap Factor + Sleep Quality Factor + Filter Factor - Brightness Penalty - Lighting Penalty, normalized to 0-100 scale. Higher scores indicate less negative impact from screen use on sleep. Lower scores indicate significant disruption.
          </p>
          <p>Screen use before sleep disrupts sleep through blue light suppression of melatonin, mental stimulation, and delayed sleep onset. Stopping screen use 1-2 hours before bed, using blue light filters, dimming screens, and keeping bedrooms dark support better sleep.</p>
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
                <p className="text-sm text-muted-foreground">Blue light filter</p>
                <p className="text-xl font-semibold text-primary">
                  {result.blueLightFilter.toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Usage</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Screen brightness</p>
                <p className="text-xl font-semibold text-primary">
                  {result.screenBrightness}/5
                </p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Bedroom lighting</p>
                <p className="text-xl font-semibold text-primary">
                  {result.bedroomLighting}/5
                </p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your screen and sleep data to see additional insights.</p>
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
                <Link href={`/health-fitness/${calc.slug}`} className="text-primary hover:underline">
                  {calc.name}
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">{calc.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemType="https://schema.org/MedicalWebPage">
    <meta itemProp="name" content="The Definitive Guide to Screen-to-Sleep Time: Understanding and Managing Screen Impact on Sleep" />
    <meta itemProp="description" content="An expert guide on screen-to-sleep time impact, how screens affect sleep, and strategies to minimize screen-related sleep disruption for better sleep quality." />
    <meta itemProp="keywords" content="screen to sleep time, screen impact on sleep, blue light sleep, screen time before bed, sleep quality, melatonin suppression" />
    <meta itemProp="author" content="[Your Site's Health Team]" />
    <meta itemProp="datePublished" content="2025-12-01" />
    <meta itemProp="url" content="/definitive-screen-sleep-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Screen-to-Sleep Time: Understanding and Managing Screen Impact on Sleep</h1>
    <p className="text-lg italic text-gray-700">Explore how screen use before sleep affects sleep quality, the science behind blue light and melatonin, and evidence-based strategies to minimize screen-related sleep disruption for better rest.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#how-screens-affect-sleep" className="hover:underline">How Screens Affect Sleep</a></li>
        <li><a href="#blue-light" className="hover:underline">Blue Light and Melatonin</a></li>
        <li><a href="#timing" className="hover:underline">Timing Recommendations</a></li>
        <li><a href="#reduction" className="hover:underline">Reducing Screen Impact</a></li>
        <li><a href="#sleep-hygiene" className="hover:underline">Sleep Hygiene</a></li>
    </ul>
<hr />

    <h2 id="how-screens-affect-sleep" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How Screens Affect Sleep</h2>
    <p>Screen use before sleep disrupts sleep through multiple mechanisms:</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Blue Light Suppression</h3>
<p>Screens emit blue light that:</p>
<ul>
    <li>Suppresses melatonin production (sleep hormone)</li>
    <li>Delays sleep onset</li>
    <li>Reduces sleep quality</li>
    <li>Disrupts circadian rhythms</li>
    <li>Affects REM sleep</li>
</ul>

<h3 className="text-xl font-semibold text-foreground mt-6">Mental Stimulation</h3>
<p>Screen content can:</p>
<ul>
    <li>Keep mind active and alert</li>
    <li>Increase stress and anxiety</li>
    <li>Prevent relaxation</li>
    <li>Delay sleep onset</li>
    <li>Reduce sleep quality</li>
</ul>

<hr />

    <h2 id="blue-light" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Blue Light and Melatonin</h2>
    <p>Understanding the blue light-melatonin connection:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Melatonin Production</h3>
    <ul>
        <li>Melatonin is the sleep hormone</li>
        <li>Production increases in evening</li>
        <li>Peaks during night</li>
        <li>Regulates sleep-wake cycles</li>
        <li>Light exposure suppresses production</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Blue Light Impact</h3>
    <ul>
        <li>Blue light is most effective at suppressing melatonin</li>
        <li>Screens emit significant blue light</li>
        <li>Suppression delays sleep onset</li>
        <li>Reduces sleep quality</li>
        <li>Filters help but don't eliminate impact</li>
    </ul>

<hr />

    <h2 id="timing" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Timing Recommendations</h2>
    <p>Optimal screen-to-sleep timing:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1-2 Hour Gap</h3>
    <ul>
        <li>Stop screen use 1-2 hours before bed</li>
        <li>Allows melatonin production to begin</li>
        <li>Reduces mental stimulation</li>
        <li>Supports better sleep onset</li>
        <li>Improves sleep quality</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Minimum 30-60 Minutes</h3>
    <ul>
        <li>Even 30-60 minutes helps</li>
        <li>Better than immediate sleep after screens</li>
        <li>More time is better</li>
        <li>Gradual reduction is beneficial</li>
    </ul>

<hr />

    <h2 id="reduction" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Reducing Screen Impact</h2>
    <p>Strategies to minimize screen impact on sleep:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Blue Light Filters</h3>
    <ul>
        <li>Enable night mode or filters</li>
        <li>Reduce blue light emission</li>
        <li>Help but don't eliminate impact</li>
        <li>Use in evening hours</li>
        <li>Still aim for screen-free period</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Dim Screen Brightness</h3>
    <ul>
        <li>Lower brightness in evening</li>
        <li>Reduces light intensity</li>
        <li>Less melatonin suppression</li>
        <li>Still affects sleep</li>
        <li>Combine with time gap</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Screen-Free Activities</h3>
    <ul>
        <li>Reading physical books</li>
        <li>Meditation or mindfulness</li>
        <li>Gentle stretching</li>
        <li>Listening to music</li>
        <li>Calming activities</li>
    </ul>

<hr />

    <h2 id="sleep-hygiene" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Sleep Hygiene</h2>
    <p>Beyond screen management, optimize sleep:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Bedroom Environment</h3>
    <ul>
        <li>Keep bedroom dark</li>
        <li>Cool temperature (65-68Â°F)</li>
        <li>Comfortable mattress and bedding</li>
        <li>Minimize noise</li>
        <li>Reserve bed for sleep only</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Sleep Routine</h3>
    <ul>
        <li>Consistent sleep schedule</li>
        <li>Relaxing bedtime routine</li>
        <li>Screen-free period</li>
        <li>Stress management</li>
        <li>Regular exercise (not before bed)</li>
    </ul>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Screen use before sleep significantly impacts sleep quality through blue light suppression of melatonin and mental stimulation. By stopping screen use 1-2 hours before bed, using blue light filters, dimming screens, and optimizing sleep hygiene, you can minimize screen impact and improve sleep. Use this calculator to assess your screen-to-sleep timing and identify areas for improvement. Remember: a screen-free period before bed is one of the most effective ways to improve sleep quality.</p>
</section>
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
          <p>This tool provides general wellness insights about screen-to-sleep time impact on sleep quality from last screen time, sleep quality, blue light filter usage, screen brightness, and bedroom lighting. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include impact score, status, recommendations, an action plan, and supporting metrics.</p>
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


