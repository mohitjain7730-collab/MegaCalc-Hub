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
  waterTemperatureC: z.number({ invalid_type_error: 'Enter temperature' }).min(2).max(25),
  sessionsPerWeek: z.number({ invalid_type_error: 'Enter sessions' }).min(1).max(14),
  coldToleranceLevel: z.number({ invalid_type_error: 'Enter tolerance' }).min(1).max(10),
  cardiovascularRiskFlag: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  waterTemperatureC: number;
  sessionsPerWeek: number;
  coldToleranceLevel: number;
  cardiovascularRiskFlag: boolean;
  recommendedMinutesPerSession: number;
  totalWeeklyMinutes: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter approximate water temperature in Â°C (for ice baths, cold plunges, or cold showers).',
  'Enter how many sessions per week you intend to do.',
  'Rate your current cold tolerance level from 1 (very low/new) to 10 (very experienced).',
  'Toggle cardiovascular risk if you have known heart disease, uncontrolled blood pressure, or other risk factors (requires medical clearance).',
  'Review suggested session duration, weekly exposure, and safety guidance.',
];

const faqs = [
  {
    question: 'Is cold exposure safe for everyone?',
    answer:
      'No. People with cardiovascular disease, uncontrolled blood pressure, Raynaudâ€™s, or other conditions should consult a physician before cold exposure.',
  },
  {
    question: 'What is the purpose of cold exposure?',
    answer:
      'Some people use it for mood, stress resilience, or recovery. Evidence is still developing; this tool focuses on safety-conscious planning, not promises.',
  },
  {
    question: 'What temperatures are considered â€œcoldâ€ here?',
    answer:
      'Most protocols use water between about 2â€“15 Â°C. This calculator assumes that range.',
  },
  {
    question: 'Why limit total weekly minutes?',
    answer:
      'Excessive cold stress can be harmful; research often uses cumulative exposures like 11 minutes per week spread across sessions. This tool uses similar reference points.',
  },
  {
    question: 'Does this apply to whole-body cryotherapy chambers?',
    answer:
      'No. Cryotherapy chambers differ from water immersion; follow chamber-specific guidelines.',
  },
  {
    question: 'Can cold exposure replace exercise or medical treatment?',
    answer:
      'No. Treat it as one optional tool, not a substitute for medical care or core health behaviors.',
  },
  {
    question: 'How should beginners approach cold exposure?',
    answer:
      'Start with milder temperatures and very short durations, focusing on calm breathing, and progress slowly.',
  },
  {
    question: 'Should I submerge my head?',
    answer:
      'Head and neck immersion can increase risk; many protocols focus on body immersion while keeping the head above water unless supervised by experts.',
  },
  {
    question: 'What about after intense exercise?',
    answer:
      'Cold exposure immediately after strength training may blunt hypertrophy signals; timing and context matter.',
  },
  {
    question: 'When should I stop a session?',
    answer:
      'Stop immediately if you feel chest pain, dizziness, confusion, severe numbness, or any concerning symptoms, and seek medical help if needed.',
  },
];

const relatedCalculators = [
  {
    name: 'Intermittent Cold Exposure Calorie Burn Estimator',
    slug: 'intermittent-cold-exposure-calorie-burn-estimator',
    description: 'Estimate potential calorie impact of cold exposure.',
  },
  {
    name: 'Sauna Session Detox Score Calculator',
    slug: 'sauna-session-detox-score-calculator',
    description: 'Balance heat and cold recovery strategies.',
  },
  {
    name: 'Daily Energy & Mood Synchronization Tracker',
    slug: 'daily-energy-mood-synchronization-tracker',
    description: 'See where cold exposure best fits your daily rhythm.',
  },
  {
    name: 'Stress Hormone Balance Calculator',
    slug: 'stress-hormone-balance-calculator',
    description: 'Explore broader stress responses around cold exposure.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/cold-exposure-duration-estimator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Cold Exposure Wellness Duration Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Cold Exposure Wellness Duration Estimator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description:
        'Get general wellness insights about cold exposure session duration and weekly totals based on water temperature, tolerance, and risk flags. This is a personal lifestyle insight, not a medical evaluation.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const { waterTemperatureC, sessionsPerWeek, coldToleranceLevel, cardiovascularRiskFlag } = values;

  const tempFactor = clamp((15 - waterTemperatureC) / 13, 0, 1.5); // colder water => higher factor
  const toleranceFactor = clamp(coldToleranceLevel / 10, 0.2, 1.2);

  const baseMinutes = 3; // reference of ~11 minutes/week split into ~3â€“4 min sets
  const recommendedMinutesPerSession = clamp(baseMinutes / tempFactor * toleranceFactor, 1, 15);

  const totalWeeklyMinutes = recommendedMinutesPerSession * sessionsPerWeek;

  let status: ResultPayload['status'] = 'good';
  let interpretation =
    'This suggests a general lifestyle tendency where suggested durations may fall within conservative ranges for many healthy adults in this simple model.';

  if (cardiovascularRiskFlag) {
    status = 'low';
    interpretation =
      'This suggests a general lifestyle tendency where added care is important because of cardiovascular factors. You may wish to talk with a health professional before using cold exposure as part of your routine. This is a personal insight, not a medical evaluation.';
  } else if (totalWeeklyMinutes > 30) {
    status = 'moderate';
    interpretation =
      'This suggests a general lifestyle tendency where total weekly exposure may feel on the higher side. You may consider monitoring how you feel and gently adjusting frequency or minutes if needed.';
  } else if (waterTemperatureC <= 5 && recommendedMinutesPerSession > 5) {
    status = 'moderate';
    interpretation =
      'This suggests a general lifestyle tendency where very cold water calls for extra caution. Shorter sessions or slightly warmer temperatures may feel more comfortable and sustainable.';
  } else if (totalWeeklyMinutes >= 8 && totalWeeklyMinutes <= 15 && !cardiovascularRiskFlag) {
    status = 'optimal';
    interpretation =
      'This suggests a general lifestyle tendency where your estimated protocol may be broadly similar to commonly discussed guidelines (for example, around 11 minutes per week).';
  }

  const recommendations: string[] = [
    'Warm up gradually before and after sessions; avoid alcohol or heavy meals right beforehand.',
    'Use calm, controlled breathing and exit the water if you feel unsafe or overwhelmed.',
    'Have a warm environment, dry clothes, and a plan for rewarming prepared before starting.',
  ];

  if (cardiovascularRiskFlag) {
    recommendations.push('Do not begin or continue cold exposure without discussing it with a qualified healthcare professional.');
  }

  if (sessionsPerWeek > 5) {
    recommendations.push('Consider alternating days or mixing cold showers with shorter plunges to avoid excessive stress.');
  }

  const plan = [
    { label: 'This Week', detail: 'If cleared, start with shorter, tolerable exposures and track how you feel for several hours afterward.' },
    { label: 'This Month', detail: 'Adjust temperature, duration, or frequency based on your response and guidance from trusted sources.' },
    { label: 'Ongoing', detail: 'Reassess cold exposure whenever health status, medications, or training loads change.' },
  ];

  return {
    waterTemperatureC,
    sessionsPerWeek,
    coldToleranceLevel,
    cardiovascularRiskFlag,
    recommendedMinutesPerSession: Number(recommendedMinutesPerSession.toFixed(1)),
    totalWeeklyMinutes: Number(totalWeeklyMinutes.toFixed(1)),
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function ColdExposureDurationEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      waterTemperatureC: undefined,
      sessionsPerWeek: undefined,
      coldToleranceLevel: undefined,
      cardiovascularRiskFlag: false,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="cold-exposure-duration-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Cold Exposure Wellness Duration Estimator
          </CardTitle>
          <CardDescription>
            Get general wellness insights about conservative cold exposure durations and weekly totals. This is a
            personal lifestyle insight, not a medical evaluation.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your cold protocol</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="waterTemperatureC"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Water temperature (Â°C)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 10" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sessionsPerWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sessions per week</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="coldToleranceLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cold tolerance (1â€“10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cardiovascularRiskFlag"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 mt-6">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="h-4 w-4"
                        />
                      </FormControl>
                      <FormLabel>Cardiovascular risk present (needs clearance)</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Estimate cold exposure duration
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
            <CardDescription>See per-session minutes, weekly totals, and caution flags.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Minutes per session</p>
                <p className="text-2xl font-semibold text-primary">{result.recommendedMinutesPerSession}</p>
                <p className="text-xs text-muted-foreground">Approximate</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total weekly minutes</p>
                <p className="text-2xl font-semibold text-primary">{result.totalWeeklyMinutes}</p>
                <p className="text-xs text-muted-foreground">All sessions combined</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Temperature factor</p>
                <p className="text-2xl font-semibold text-primary">
                  {((15 - result.waterTemperatureC) / 13).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Colder = higher factor</p>
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
            <strong>Temperature factor</strong> scales session time based on how far water temperature is below a 15 Â°C reference.
          </p>
          <p>
            <strong>Recommended minutes</strong> start from a modest baseline and are shortened for very cold water or low tolerance, while slightly lengthened for milder water and higher tolerance.
          </p>
          <p>
            <strong>Total weekly minutes</strong> simply multiply per-session time by session count and are compared with commonly referenced ranges like ~11 minutes/week.
          </p>
          <p>This is a conservative, educational model and must not replace individualized medical guidance.</p>
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
                <p className="text-sm text-muted-foreground">Minutes per Â°C</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.recommendedMinutesPerSession / result.waterTemperatureC).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Rough stress density</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Tolerance factor</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.coldToleranceLevel / 10).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Higher = experienced</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Risk flag</p>
                <p className="text-xl font-semibold text-primary">
                  {result.cardiovascularRiskFlag ? 'Yes' : 'No'}
                </p>
                <p className="text-xs text-muted-foreground">Medical clearance needed</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your protocol to see additional metrics.</p>
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

      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/MedicalWebPage"
      >
        <meta
          itemProp="name"
          content="Cold Exposure Duration: Using Science to Stay on the Right Side of Hormesis"
        />
        <meta
          itemProp="description"
          content="Discover how to think about cold exposure dose, why safety and medical clearance matter, and how to integrate cold with other recovery tools."
        />
        <meta
          itemProp="keywords"
          content="cold exposure duration estimator, ice bath safety, hormesis, cold plunge, cold shower minutes"
        />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/definitive-cold-exposure-duration-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          Cold Exposure Duration: Finding the Sweet Spot Between Stimulus and Safety
        </h1>
        <p className="text-lg italic text-gray-700">
          Cold exposure is a strong stimulus. This guide helps you approach it with respect, curiosity, and a solid safety framework.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. The Appealâ€”and Riskâ€”of Cold Exposure</h2>
        <p>
          From mood boosts to recovery routines, cold has become trendy. But strong cardiovascular and nervous system responses mean it is essential to respect individual differences and medical history.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. Hormesis: Why More Is Not Always Better</h2>
        <p>
          Hormesis describes beneficial effects of small, controlled stressors that would be harmful at high doses. With cold, too much or too intense exposure can backfire or cause injury.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. Interpreting Research Benchmarks</h2>
        <p>
          Some popular guidelines suggest around 11 minutes per week in cold water for certain benefits, but protocols vary widely. Use them as loose reference points rather than rigid rules.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4. Listening to Your Body</h2>
        <p>
          Shivering, numbness, confusion, or chest discomfort are warning signs. Ending a session early is a success, not a failure, if it protects your health.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">5. Integrating Cold with Life and Training</h2>
        <p>
          Consider your training load, sleep, and stress when deciding how much cold exposure is reasonable. In some seasons, the best dose may be zero.
        </p>

        <hr />
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Conclusion
        </h2>
        <p>
          Cold exposure can be a powerful experience, but it is optionalâ€”not requiredâ€”for health. Use this estimator and guide to keep experiments within conservative bounds and to know when to seek professional input.
        </p>
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
          <p>
            This tool provides general wellness insights by estimating cold exposure session durations and weekly totals
            from temperature, frequency, tolerance, and risk flags. This is a personal lifestyle insight, not a medical
            evaluation.
          </p>
          <p>It outputs perâ€‘session minutes, weekly minutes, qualitative status, recommendations, an action plan, and extra metrics.</p>
          <p>An enhanced guide and FAQs emphasize harm reduction and collaboration with healthcare professionals.</p>
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
          <p>
            Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is
            not a medical or psychological diagnosis. For any health concerns, please consult a qualified professional.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


