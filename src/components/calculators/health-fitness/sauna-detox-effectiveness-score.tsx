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
  sessionsPerWeek: z.number({ invalid_type_error: 'Enter sessions' }).min(0).max(14),
  minutesPerSession: z.number({ invalid_type_error: 'Enter minutes' }).min(0).max(90),
  averageTempC: z.number({ invalid_type_error: 'Enter temperature' }).min(40).max(110),
  hydrationScore: z.number({ invalid_type_error: 'Enter hydration score' }).min(0).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  sessionsPerWeek: number;
  minutesPerSession: number;
  averageTempC: number;
  hydrationScore: number;
  detoxEffectivenessScore: number;
  thermalLoadIndex: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter how many sauna sessions you do per week.',
  'Enter the typical minutes spent per session.',
  'Enter the average sauna temperature in °C.',
  'Rate your hydration and electrolyte practices around sessions (0–10).',
  'Review the detox effectiveness score, thermal load index, and guidance.',
];

const faqs = [
  {
    question: 'What does the Sauna Detox Effectiveness Score measure?',
    answer:
      'It estimates how sauna frequency, duration, intensity, and hydration practices may support detox-related processes like sweating and circulation.',
  },
  {
    question: 'Does this mean my body is “full of toxins”?',
    answer:
      'No. The term “detox” here focuses on supporting natural elimination routes (sweat, circulation) rather than implying a specific toxin burden.',
  },
  {
    question: 'Is sauna safe for everyone?',
    answer:
      'People with cardiovascular disease, low blood pressure, pregnancy, or certain medications should consult a clinician before using saunas.',
  },
  {
    question: 'What sauna types does this apply to?',
    answer:
      'The calculator is generic and can be used for traditional, infrared, or other saunas, but temperature ranges and recommendations may differ.',
  },
  {
    question: 'Is more sauna always better?',
    answer:
      'Not necessarily. Excessive heat or dehydration can be dangerous. Many benefits appear at modest frequencies and durations in research.',
  },
  {
    question: 'How important is hydration?',
    answer:
      'Very. Adequate water and electrolytes before and after sessions support cardiovascular stability and sweating efficiency.',
  },
  {
    question: 'Can sauna replace exercise or medical treatment?',
    answer:
      'No. It can complement a healthy lifestyle, but it is not a substitute for exercise, medication, or professional care.',
  },
  {
    question: 'How often should I adjust my protocol?',
    answer:
      'Change slowly—especially temperature and time—while monitoring how you feel during and after sessions.',
  },
  {
    question: 'Is there an ideal weekly dose?',
    answer:
      'Some observational studies suggest 3–7 sessions per week with moderate durations may support cardiovascular health; individual needs vary.',
  },
  {
    question: 'Should I fast before sauna?',
    answer:
      'Light meals are often better than heavy meals or alcohol beforehand; follow your clinician’s guidance for your situation.',
  },
];

const relatedCalculators = [
  {
    name: 'Cold Exposure Duration Estimator',
    slug: 'cold-exposure-duration-estimator',
    description: 'Coordinate sauna and cold exposure safely.',
  },
  {
    name: 'Hydration Recovery After Workout Calculator',
    slug: 'hydration-recovery-after-workout-calculator',
    description: 'Plan fluid and electrolyte intake after heat stress.',
  },
  {
    name: 'Mitochondrial Health Estimator',
    slug: 'mitochondrial-health-estimator',
    description: 'Explore cellular resilience alongside sauna practice.',
  },
  {
    name: 'Stress Hormone Balance Calculator',
    slug: 'stress-hormone-balance-calculator',
    description: 'Track stress load when adding thermal stressors.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/sauna-detox-effectiveness-score';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Sauna Detox Effectiveness Score', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Sauna Detox Effectiveness Score',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate how sauna frequency, duration, intensity, and hydration may support natural detox processes.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const { sessionsPerWeek, minutesPerSession, averageTempC, hydrationScore } = values;

  const sessionDose = sessionsPerWeek * minutesPerSession;
  const tempFactor = clamp((averageTempC - 50) / 30, 0, 1.5); // hotter => more intense
  const hydrationFactor = hydrationScore / 10;

  const thermalLoadIndex = clamp(sessionDose * tempFactor, 0, 1000);

  const baseEffectiveness = clamp((sessionDose / 120) * 40, 0, 40); // 120 min/week reference
  const tempEffectiveness = clamp(tempFactor * 30, 0, 30);
  const hydrationBonus = clamp(hydrationFactor * 30, 0, 30);

  const rawScore = baseEffectiveness + tempEffectiveness + hydrationBonus - clamp((sessionDose - 180) / 60 * 15, 0, 30);
  const detoxEffectivenessScore = clamp(rawScore, 0, 100);

  let status: ResultPayload['status'] = 'good';
  let interpretation = 'Your sauna pattern appears reasonably supportive while staying within moderate ranges.';

  if (detoxEffectivenessScore >= 80 && thermalLoadIndex <= 600) {
    status = 'optimal';
    interpretation = 'Your sessions balance frequency, duration, and hydration in a way likely to support detox-related benefits for many people.';
  } else if (thermalLoadIndex > 800) {
    status = 'low';
    interpretation = 'Thermal load appears high. This may strain your cardiovascular system or recovery if not carefully supervised.';
  } else if (detoxEffectivenessScore < 40) {
    status = 'moderate';
    interpretation = 'Effectiveness may be limited by low frequency, short duration, low temperature, or suboptimal hydration.';
  }

  const recommendations: string[] = [
    'Ensure you drink water (and electrolytes when appropriate) before and after sessions.',
    'Avoid alcohol before sauna and exit immediately if you feel lightheaded, nauseated, or unwell.',
    'Consider building up gradually rather than jumping to long, very hot sessions.',
  ];

  if (sessionsPerWeek === 0 || minutesPerSession === 0) {
    recommendations.push('If you are just starting, begin with 1–2 shorter sessions per week and listen to your body.');
  }

  if (averageTempC > 90 && minutesPerSession > 20) {
    recommendations.push('High temperatures and long durations combined can be risky; consider reducing one or both.');
  }

  if (hydrationScore < 5) {
    recommendations.push('Improve hydration routines: bring water to the sauna and consider a light electrolyte solution if you sweat heavily.');
  }

  const plan = [
    { label: 'This Week', detail: 'Track how you feel during and after sessions, including heart rate, dizziness, and sleep quality.' },
    { label: 'This Month', detail: 'Adjust frequency, duration, or temperature based on your response and professional input if available.' },
    { label: 'Ongoing', detail: 'Reassess sauna use when health status, medications, or climate change substantially.' },
  ];

  return {
    sessionsPerWeek,
    minutesPerSession,
    averageTempC,
    hydrationScore,
    detoxEffectivenessScore: Number(detoxEffectivenessScore.toFixed(1)),
    thermalLoadIndex: Number(thermalLoadIndex.toFixed(1)),
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function SaunaDetoxEffectivenessScore() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sessionsPerWeek: undefined,
      minutesPerSession: undefined,
      averageTempC: undefined,
      hydrationScore: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="sauna-detox-effectiveness-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Sauna Detox Effectiveness Score
          </CardTitle>
          <CardDescription>Estimate how your sauna routine may support natural detox and recovery processes.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your sauna routine</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  name="minutesPerSession"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minutes per session</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="averageTempC"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average temperature (°C)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 80" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hydrationScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hydration & electrolytes (0–10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 7.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate sauna detox score
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
            <CardDescription>See detox score, thermal load index, and key suggestions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Detox effectiveness</p>
                <p className="text-2xl font-semibold text-primary">{result.detoxEffectivenessScore}</p>
                <p className="text-xs text-muted-foreground">0–100 scale</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Thermal load index</p>
                <p className="text-2xl font-semibold text-primary">{result.thermalLoadIndex}</p>
                <p className="text-xs text-muted-foreground">Higher = more stress</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Weekly minutes</p>
                <p className="text-2xl font-semibold text-primary">
                  {result.sessionsPerWeek * result.minutesPerSession}
                </p>
                <p className="text-xs text-muted-foreground">Total sauna time</p>
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
            <strong>Thermal load index</strong> approximates total heat stress as (sessions × minutes) × temperature factor, giving a sense of cumulative exposure.
          </p>
          <p>
            <strong>Detox effectiveness score</strong> combines session dose, temperature, and hydration quality, then subtracts penalties for very high total time.
          </p>
          <p>
            The aim is not lab precision but to highlight when your routine is likely in a reasonable range versus when it might be too little or too intense.
          </p>
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
                <p className="text-sm text-muted-foreground">Minutes per week</p>
                <p className="text-xl font-semibold text-primary">
                  {result.sessionsPerWeek * result.minutesPerSession}
                </p>
                <p className="text-xs text-muted-foreground">Exposure volume</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Relative temp factor</p>
                <p className="text-xl font-semibold text-primary">
                  {clamp((result.averageTempC - 50) / 30, 0, 1.5).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Hotter = higher</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Hydration quality</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.hydrationScore / 10 * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Of maximum score</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your sauna routine to see additional metrics.</p>
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

      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/MedicalWebPage"
      >
        <meta
          itemProp="name"
          content="Sauna Detox and Heat Therapy: Evidence, Safety, and Practical Dosing"
        />
        <meta
          itemProp="description"
          content="Understand how sauna use interacts with cardiovascular health, detox pathways, and longevity, plus how to design safer, more effective protocols."
        />
        <meta
          itemProp="keywords"
          content="sauna detox effectiveness score, heat therapy dosing, cardiovascular risk, sweating and detoxification, sauna longevity benefits"
        />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/definitive-sauna-detox-effectiveness-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          Sauna Detox and Heat Therapy: How to Use Heat Wisely for Healthspan
        </h1>
        <p className="text-lg italic text-gray-700">
          Learn what current research says about sauna use, “detox,” cardiovascular benefits, and how to design a routine that fits your goals and medical context.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. What “Detox” Really Means in Sauna Context</h2>
        <p>
          Your liver, kidneys, lungs, gut, and skin continuously process and eliminate compounds. Sauna supports this system indirectly by increasing circulation, sweating, and sometimes influencing blood pressure and heart rate.
          It does not “flush out” specific toxins on its own, but it can be one helpful input in overall metabolic health.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. Evidence on Sauna and Cardiovascular/Longevity Outcomes</h2>
        <p>
          Large observational studies from Finland link regular sauna use with lower cardiovascular and all-cause mortality. These results are correlation, not proof of causation, but they are encouraging when combined with
          mechanistic data on blood pressure, endothelial function, and heart rate variability.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. Individual Risk and Contraindications</h2>
        <p>
          People with unstable cardiovascular disease, severe hypotension, pregnancy, or certain neurological or dermatologic conditions may face higher risk. Always discuss sauna use with a clinician familiar with your
          history—especially if you take medications that affect blood pressure, fluid balance, or thermoregulation.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4. Designing a Practical Sauna Routine</h2>
        <p>
          Many people do well starting with 1–2 sessions per week of 10–15 minutes at moderate temperatures, then adjusting based on tolerance. Hydration, cooling down gradually, and listening to fatigue signals are essential
          parts of a safe protocol.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">5. Integrating Sauna with Other Recovery Tools</h2>
        <p>
          Combining sauna with cold exposure, exercise, and sleep optimization may produce synergistic benefits, but total stress load matters. If you increase one stressor (like heat), it can help to protect recovery in other
          areas (sleep, nutrition, emotional load).
        </p>

        <hr />
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Conclusion
        </h2>
        <p>
          Sauna can be a powerful, enjoyable practice when used with respect for your body and medical context. Use this score as a guidepost for balancing effectiveness with safety, not as a replacement for professional advice.
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
          <p>This calculator estimates a sauna detox effectiveness score and thermal load index from simple routine inputs.</p>
          <p>It provides status, recommendations, an action plan, and expanded guide content grounded in current evidence and safety considerations.</p>
          <p>Use it as an educational tool alongside, not instead of, guidance from qualified health professionals.</p>
        </CardContent>
      </Card>
    </div>
  );
}


