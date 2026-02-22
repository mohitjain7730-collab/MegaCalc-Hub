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
  caffeineAmount: z.number({ invalid_type_error: 'Enter caffeine amount' }).min(0).max(1000),
  consumptionTime: z.string({ invalid_type_error: 'Enter consumption time' }),
  age: z.number({ invalid_type_error: 'Enter age' }).min(10).max(100),
  hasLiverIssues: z.enum(['no', 'yes'], {
    invalid_type_error: 'Select liver issues status',
  }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  caffeineAmount: number;
  consumptionTime: string;
  age: number;
  hasLiverIssues: string | undefined;
  halfLife: number;
  quarterLife: number;
  eliminationTime: number;
  currentLevel: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter caffeine amount consumed (mg).',
  'Enter consumption time (HH:MM format, e.g., 14:30).',
  'Enter your age (years).',
  'Select if you have liver issues (optional, affects metabolism).',
  'Review half-life, elimination time, current caffeine level, and recommendations.',
];

const faqs = [
  {
    question: 'What is caffeine half-life?',
    answer:
      'Caffeine half-life is the time it takes for half of the caffeine in your body to be eliminated. Average half-life is 3-5 hours in healthy adults, meaning if you consume 200mg, after 3-5 hours you\'ll have 100mg remaining. Half-life varies by individual factors.',
  },
  {
    question: 'How is caffeine eliminated from the body?',
    answer:
      'Caffeine is primarily metabolized by the liver enzyme CYP1A2, which breaks it down into metabolites that are then excreted in urine. The rate of metabolism determines how quickly caffeine is eliminated, affecting half-life and duration of effects.',
  },
  {
    question: 'What factors affect caffeine half-life?',
    answer:
      'Factors include: age (older = longer half-life), liver function (impaired = longer), pregnancy (longer), medications (some increase/decrease), genetics (CYP1A2 enzyme variants), smoking (decreases half-life), and oral contraceptives (increases half-life).',
  },
  {
    question: 'How does age affect caffeine metabolism?',
    answer:
      'Older adults (65+) have longer caffeine half-lives (5-10 hours) compared to younger adults (3-5 hours). This is due to decreased liver enzyme activity and reduced metabolic rate. Older adults should be more cautious with caffeine timing.',
  },
  {
    question: 'What is a safe caffeine cutoff time for sleep?',
    answer:
      'To avoid sleep disruption, stop consuming caffeine 6-8 hours before bedtime. With average half-life of 3-5 hours, caffeine consumed 6 hours before bed may still have 25-50% remaining, which can disrupt sleep. Individual sensitivity varies.',
  },
  {
    question: 'How much caffeine is in common beverages?',
    answer:
      'Typical amounts: coffee (8oz) = 95mg, espresso (1oz) = 64mg, black tea (8oz) = 47mg, green tea (8oz) = 28mg, energy drinks (8oz) = 80-200mg, cola (12oz) = 34-46mg. Actual amounts vary by brand and preparation.',
  },
  {
    question: 'Can I speed up caffeine elimination?',
    answer:
      'No, you cannot significantly speed up caffeine elimination. Hydration helps with excretion but doesn\'t change metabolism rate. Time is the only factorâ€”you must wait for your body to metabolize and eliminate caffeine naturally.',
  },
  {
    question: 'What are symptoms of too much caffeine?',
    answer:
      'Symptoms include: anxiety, jitteriness, rapid heart rate, insomnia, headaches, digestive issues, and in severe cases, caffeine toxicity. If experiencing symptoms, reduce intake and allow time for elimination.',
  },
  {
    question: 'How does pregnancy affect caffeine half-life?',
    answer:
      'During pregnancy, caffeine half-life increases significantly (9-11 hours in third trimester) due to reduced CYP1A2 activity. This is why pregnant women are advised to limit caffeine intake and consume it earlier in the day.',
  },
  {
    question: 'What about caffeine and medications?',
    answer:
      'Some medications affect caffeine metabolism: oral contraceptives increase half-life, some antibiotics increase effects, and certain medications may interact. Consult healthcare provider about caffeine interactions with your medications.',
  },
];

const relatedCalculators = [
  {
    name: 'Caffeine Intake Calculator',
    slug: 'caffeine-intake-calculator',
    description: 'Track daily caffeine consumption.',
  },
  {
    name: 'Caffeine Cutoff Sleep Impact Calculator',
    slug: 'caffeine-cutoff-sleep-impact-calculator',
    description: 'Assess caffeine impact on sleep timing.',
  },
  {
    name: 'Sleep Debt Calculator',
    slug: 'habit-streak-tracker-calculator',
    description: 'Evaluate sleep quality and recovery.',
  },
  {
    name: 'Circadian Rhythm Disruption Risk Calculator',
    slug: 'circadian-rhythm-disruption-risk-calculator',
    description: 'Assess sleep-wake cycle health.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/caffeine-half-life-calculator-time-based';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Caffeine Half-Life Calculator (time-based)', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Caffeine Half-Life Calculator (time-based)',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate caffeine half-life and elimination time based on consumption amount, time, age, and liver function.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const caffeineAmount = values.caffeineAmount;
  const consumptionTime = values.consumptionTime;
  const age = values.age;
  const hasLiverIssues = values.hasLiverIssues;
  
  // Calculate half-life based on age and liver function
  let baseHalfLife = 4; // Average 4 hours for healthy adults
  
  // Age adjustment
  if (age >= 65) {
    baseHalfLife = 6; // Older adults have longer half-life
  } else if (age >= 50) {
    baseHalfLife = 5;
  } else if (age < 18) {
    baseHalfLife = 3; // Adolescents may metabolize faster
  }
  
  // Liver issues adjustment
  if (hasLiverIssues === 'yes') {
    baseHalfLife *= 1.5; // Impaired liver function increases half-life
  }
  
  const halfLife = baseHalfLife;
  const quarterLife = halfLife * 2; // Time to 25% remaining
  const eliminationTime = halfLife * 5; // Time to ~3% remaining (essentially eliminated)
  
  // Calculate current caffeine level based on time elapsed
  const now = new Date();
  const [hours, minutes] = consumptionTime.split(':').map(Number);
  const consumptionDate = new Date();
  consumptionDate.setHours(hours, minutes, 0, 0);
  
  // If consumption time is later today, assume it's tomorrow
  if (consumptionDate > now) {
    consumptionDate.setDate(consumptionDate.getDate() - 1);
  }
  
  const hoursElapsed = (now.getTime() - consumptionDate.getTime()) / (1000 * 60 * 60);
  const halfLivesElapsed = hoursElapsed / halfLife;
  const currentLevel = caffeineAmount * Math.pow(0.5, halfLivesElapsed);
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your caffeine level appears manageable. Continue monitoring timing to avoid sleep disruption.';

  const currentHour = now.getHours();
  const bedtime = 22; // Assume 10pm bedtime
  const hoursUntilBed = currentHour < bedtime ? bedtime - currentHour : (24 - currentHour) + bedtime;
  
  if (currentLevel > 100 || (hoursUntilBed < 6 && currentLevel > 50)) {
    status = 'low';
    interpretation = 'Your current caffeine level is high, and elimination time may interfere with sleep. Avoid additional caffeine and allow time for elimination before bedtime.';
  } else if (currentLevel > 50 || (hoursUntilBed < 8 && currentLevel > 25)) {
    status = 'moderate';
    interpretation = 'Your current caffeine level is moderate. Be cautious about additional caffeine, especially if bedtime is within 6-8 hours. Monitor sleep quality.';
  } else if (currentLevel > 25) {
    status = 'good';
    interpretation = 'Your current caffeine level is declining. Continue monitoring, and avoid additional caffeine close to bedtime to ensure good sleep quality.';
  } else {
    status = 'optimal';
    interpretation = 'Your current caffeine level is low. Caffeine should not significantly affect sleep if consumed at appropriate times.';
  }

  const recommendations = [
    `Caffeine half-life: ${halfLife.toFixed(1)} hours. This means half of the caffeine will be eliminated in ${halfLife.toFixed(1)} hours. Plan consumption timing accordingly to avoid sleep disruption.`,
    'Caffeine cutoff: stop consuming caffeine 6-8 hours before bedtime to avoid sleep disruption. With your half-life, caffeine consumed within this window may still affect sleep quality.',
  ];
  
  if (age >= 65) {
    recommendations.push('Age consideration: older adults have longer caffeine half-lives. Be more cautious with caffeine timing, and consider earlier cutoff times (8-10 hours before bed) to protect sleep.');
  }
  
  if (hasLiverIssues === 'yes') {
    recommendations.push('Liver function: impaired liver function increases caffeine half-life. Be extra cautious with timing and amounts, and consult healthcare provider about safe caffeine consumption.');
  }
  
  if (currentLevel > 50 && hoursUntilBed < 8) {
    recommendations.push('Sleep protection: with significant caffeine remaining and bedtime approaching, avoid additional caffeine. Consider delaying bedtime if possible, or accept that sleep may be affected.');
  }

  const plan = [
    { label: 'This Week', detail: `Track caffeine consumption timing and sleep quality. Note how caffeine timing affects your sleep. Adjust consumption times to ensure 6-8 hour cutoff before bedtime.` },
    { label: 'This Month', detail: 'Establish caffeine timing guidelines based on your half-life. Plan last caffeine consumption to allow adequate elimination before bedtime. Monitor sleep quality and adjust as needed.' },
    { label: 'Ongoing', detail: 'Continue monitoring caffeine timing and sleep quality. Adjust consumption patterns based on your individual response. Remember that caffeine effects can last longer than you feel them, so plan accordingly.' },
  ];

  return { caffeineAmount, consumptionTime, age, hasLiverIssues, halfLife, quarterLife, eliminationTime, currentLevel, status, interpretation, recommendations, plan };
};

export default function CaffeineHalfLifeCalculatorTimeBased() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      caffeineAmount: undefined,
      consumptionTime: undefined,
      age: undefined,
      hasLiverIssues: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="caffeine-half-life-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Caffeine Half-Life Calculator (time-based)
          </CardTitle>
          <CardDescription>Calculate caffeine half-life and elimination time based on consumption amount, time, age, and liver function.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your caffeine consumption data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="caffeineAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Caffeine amount (mg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="10" placeholder="e.g., 200" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="consumptionTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consumption time (HH:MM)</FormLabel>
                      <FormControl>
                        <Input type="time" placeholder="e.g., 14:30" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value)} />
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
                        <Input type="number" step="1" placeholder="e.g., 35" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hasLiverIssues"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Liver issues (optional)</FormLabel>
                      <FormControl>
                        <select
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value as FormValues['hasLiverIssues'])}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select</option>
                          <option value="no">No</option>
                          <option value="yes">Yes</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate caffeine half-life
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
            <CardDescription>See half-life, elimination time, current caffeine level, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Half-life</p>
                <p className="text-2xl font-semibold text-primary">{result.halfLife.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">hours</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Current level</p>
                <p className="text-2xl font-semibold text-primary">{result.currentLevel.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">mg remaining</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Elimination time</p>
                <p className="text-2xl font-semibold text-primary">{result.eliminationTime.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">hours (to ~3%)</p>
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
            <strong>Caffeine half-life</strong> varies by age and liver function: healthy adults (18-50) = 3-5 hours, older adults (65+) = 5-10 hours, adolescents = 2-3 hours. Liver issues increase half-life by ~50%.
          </p>
          <p>
            <strong>Current caffeine level</strong> = Initial Amount Ã— (0.5 ^ (Hours Elapsed / Half-Life)). This exponential decay model shows how caffeine decreases over time.
          </p>
          <p>
            <strong>Elimination time</strong> = Half-Life Ã— 5. After 5 half-lives, approximately 3% of original caffeine remains, which is considered essentially eliminated.
          </p>
          <p>Caffeine elimination follows exponential decay. To avoid sleep disruption, stop consuming caffeine 6-8 hours before bedtime, accounting for your individual half-life. Older adults and those with liver issues may need longer cutoff times.</p>
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
                <p className="text-sm text-muted-foreground">Quarter-life</p>
                <p className="text-xl font-semibold text-primary">
                  {result.quarterLife.toFixed(1)} hours
                </p>
                <p className="text-xs text-muted-foreground">To 25% remaining</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Percentage remaining</p>
                <p className="text-xl font-semibold text-primary">
                  {((result.currentLevel / result.caffeineAmount) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Of original amount</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Half-life category</p>
                <p className="text-xl font-semibold text-primary">
                  {result.halfLife >= 6 ? 'Long' : result.halfLife >= 4 ? 'Average' : 'Short'}
                </p>
                <p className="text-xs text-muted-foreground">Based on calculation</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your caffeine consumption data to see additional insights.</p>
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

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemType="https://schema.org/MedicalWebPage">
    <meta itemProp="name" content="The Definitive Guide to Caffeine Half-Life: Understanding Elimination and Sleep Impact" />
    <meta itemProp="description" content="An expert guide on caffeine half-life, how it varies by individual factors, and strategies to time caffeine consumption to avoid sleep disruption." />
    <meta itemProp="keywords" content="caffeine half-life calculator, caffeine elimination time, caffeine sleep impact, caffeine metabolism, caffeine cutoff time" />
    <meta itemProp="author" content="[Your Site's Health Team]" />
    <meta itemProp="datePublished" content="2025-12-01" />
    <meta itemProp="url" content="/definitive-caffeine-half-life-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Caffeine Half-Life: Understanding Elimination and Sleep Impact</h1>
    <p className="text-lg italic text-gray-700">Explore how caffeine is metabolized and eliminated, understand factors affecting half-life, and learn to time caffeine consumption to optimize alertness while protecting sleep.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#what-is-half-life" className="hover:underline">What Is Caffeine Half-Life</a></li>
        <li><a href="#metabolism" className="hover:underline">How Caffeine Is Metabolized</a></li>
        <li><a href="#factors-affecting" className="hover:underline">Factors Affecting Half-Life</a></li>
        <li><a href="#sleep-impact" className="hover:underline">Caffeine and Sleep Impact</a></li>
        <li><a href="#timing-strategies" className="hover:underline">Timing Strategies</a></li>
    </ul>
<hr />

    <h2 id="what-is-half-life" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Is Caffeine Half-Life</h2>
    <p>**Caffeine half-life** is the time it takes for your body to eliminate half of the caffeine you've consumed. Understanding half-life helps you time caffeine consumption to maximize alertness benefits while minimizing sleep disruption.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Average Half-Life</h3>
<p>In healthy adults, average caffeine half-life is <b>3-5 hours</b>:</p>
<ul>
    <li>After 3-5 hours: 50% of caffeine remains</li>
    <li>After 6-10 hours: 25% remains</li>
    <li>After 15-25 hours: ~3% remains (essentially eliminated)</li>
</ul>
<p>However, individual half-lives vary significantly based on multiple factors.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Why Half-Life Matters</h3>
<p>Understanding your caffeine half-life helps you:</p>
<ul>
    <li>Time consumption for optimal alertness</li>
    <li>Avoid sleep disruption</li>
    <li>Plan caffeine cutoff times</li>
    <li>Understand why you may feel effects longer than expected</li>
    <li>Make informed decisions about afternoon/evening caffeine</li>
</ul>

<hr />

    <h2 id="metabolism" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How Caffeine Is Metabolized</h2>
    <p>Caffeine metabolism occurs primarily in the liver through the enzyme <b>CYP1A2</b>:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Metabolic Process</h3>
    <ol>
        <li><b>Absorption:</b> Caffeine is rapidly absorbed from the stomach and small intestine (peak blood levels in 30-60 minutes)</li>
        <li><b>Distribution:</b> Caffeine distributes throughout the body, including the brain</li>
        <li><b>Metabolism:</b> Liver enzyme CYP1A2 breaks down caffeine into metabolites (paraxanthine, theobromine, theophylline)</li>
        <li><b>Elimination:</b> Metabolites are excreted in urine</li>
    </ol>

    <h3 className="text-xl font-semibold text-foreground mt-6">Exponential Decay</h3>
    <p>Caffeine elimination follows <b>exponential decay</b>: the rate of elimination is proportional to the amount present. This means caffeine decreases by half each half-life period, not at a constant rate.</p>

<hr />

    <h2 id="factors-affecting" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Factors Affecting Caffeine Half-Life</h2>
    <p>Multiple factors influence how quickly your body eliminates caffeine:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Age</h3>
    <ul>
        <li><b>Young adults (18-50):</b> 3-5 hours (average)</li>
        <li><b>Older adults (65+):</b> 5-10 hours (slower metabolism)</li>
        <li><b>Adolescents:</b> 2-3 hours (may metabolize faster)</li>
    </ul>
    <p>Older adults should be more cautious with caffeine timing due to longer half-lives.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Liver Function</h3>
    <p>Impaired liver function (hepatitis, cirrhosis, etc.) significantly increases half-life because caffeine metabolism occurs in the liver. Those with liver issues should be very cautious with caffeine.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Pregnancy</h3>
    <p>During pregnancy, especially third trimester, half-life increases to 9-11 hours due to reduced CYP1A2 activity. This is why pregnant women are advised to limit caffeine and consume it early in the day.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">4. Medications</h3>
    <ul>
        <li><b>Oral contraceptives:</b> Increase half-life to 5-10 hours</li>
        <li><b>Some antibiotics:</b> May increase effects</li>
        <li><b>Other medications:</b> May interact with caffeine metabolism</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">5. Genetics</h3>
    <p>Genetic variants of CYP1A2 enzyme affect metabolism speed. "Fast metabolizers" have shorter half-lives, while "slow metabolizers" have longer half-lives.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">6. Smoking</h3>
    <p>Smoking decreases caffeine half-life (2-3 hours) by inducing CYP1A2 enzyme activity. However, this is not a reason to smoke!</p>

<hr />

    <h2 id="sleep-impact" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Caffeine and Sleep Impact</h2>
    <p>Caffeine can significantly disrupt sleep even when you don't feel its effects:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Sleep Disruption Mechanisms</h3>
    <ul>
        <li><b>Adenosine blockade:</b> Caffeine blocks adenosine receptors, preventing sleepiness</li>
        <li><b>Delayed sleep onset:</b> Even low levels can delay falling asleep</li>
        <li><b>Reduced sleep quality:</b> Less deep sleep and REM sleep</li>
        <li><b>Fragmented sleep:</b> More awakenings during the night</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Safe Caffeine Cutoff</h3>
    <p>To avoid sleep disruption, stop consuming caffeine <b>6-8 hours before bedtime</b>:</p>
    <ul>
        <li>With average half-life (4 hours), caffeine consumed 6 hours before bed may still have 25-50% remaining</li>
        <li>This remaining caffeine can disrupt sleep even if you don't feel alert</li>
        <li>Older adults or those with longer half-lives may need 8-10 hour cutoffs</li>
    </ul>

<hr />

    <h2 id="timing-strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Timing Strategies</h2>
    <p>Optimal caffeine timing balances alertness benefits with sleep protection:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Morning Caffeine</h3>
    <p>Consuming caffeine in the morning (before 10am) allows elimination before evening, minimizing sleep impact while maximizing alertness benefits.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Afternoon Considerations</h3>
    <p>If consuming caffeine in the afternoon:</p>
    <ul>
        <li>Calculate elimination time based on your half-life</li>
        <li>Ensure 6-8 hour cutoff before bedtime</li>
        <li>Consider lower amounts or decaf alternatives</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Individual Response</h3>
    <p>Monitor your individual response:</p>
    <ul>
        <li>Track caffeine timing and sleep quality</li>
        <li>Adjust cutoff times based on your experience</li>
        <li>Some people are more sensitive and need longer cutoffs</li>
    </ul>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Caffeine half-life varies significantly by individual factors like age, liver function, and genetics. Understanding your half-life helps you time caffeine consumption to maximize alertness benefits while protecting sleep. Use this calculator to estimate your elimination time, and remember: caffeine effects can last longer than you feel them, so plan your cutoff times accordingly. For most people, stopping caffeine 6-8 hours before bedtime is essential for good sleep quality.</p>
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
          <p>This tool calculates caffeine half-life and elimination time based on consumption amount, time, age, and liver function.</p>
          <p>Outputs include half-life, current caffeine level, elimination time, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

