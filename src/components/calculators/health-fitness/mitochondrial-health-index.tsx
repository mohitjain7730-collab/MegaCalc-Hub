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
  fatigueLevel: z.number({ invalid_type_error: 'Enter fatigue level' }).min(0).max(10),
  exerciseTolerance: z.number({ invalid_type_error: 'Enter exercise tolerance' }).min(0).max(10),
  sleepQuality: z.number({ invalid_type_error: 'Enter sleep quality' }).min(0).max(10),
  metabolicMarkersScore: z.number({ invalid_type_error: 'Enter metabolic score' }).min(0).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  fatigueLevel: number;
  exerciseTolerance: number;
  sleepQuality: number;
  metabolicMarkersScore: number;
  mitochondrialHealthIndex: number;
  recoveryCapacityScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Rate your average daily fatigue on a 0â€“10 scale (0 = none, 10 = maximal exhaustion).',
  'Rate your current exercise tolerance on a 0â€“10 scale (0 = cannot exercise, 10 = excellent capacity).',
  'Rate your usual sleep quality on a 0â€“10 scale, considering depth, continuity, and refreshment.',
  'Rate how â€œin-rangeâ€ or optimized your key metabolic markers feel overall (labs + symptoms) on a 0â€“10 scale.',
  'Review your mitochondrial health index, recovery capacity score, and targeted guidance.',
];

const faqs = [
  {
    question: 'What is the Mitochondrial Health Index in this calculator?',
    answer:
      'It is an educational composite score built from self-ratings of fatigue, exercise tolerance, sleep quality, and metabolic markers. It is not a diagnostic test, but a structured way to reflect on cellular energy trends.',
  },
  {
    question: 'Can this tool diagnose mitochondrial disease or dysfunction?',
    answer:
      'No. Diagnosing mitochondrial disease requires specialized clinical evaluation, lab testing, and sometimes genetic workup. This tool is for self-reflection and education only.',
  },
  {
    question: 'How should I rate metabolic markers if I do not have recent labs?',
    answer:
      'Use your best estimate based on prior labs, clinician feedback, and symptoms like blood sugar swings, lipid issues, or blood pressure. For precise assessment, ask your clinician to review your current results.',
  },
  {
    question: 'Why are sleep and exercise tolerance included in a mitochondrial score?',
    answer:
      'Mitochondria affect energy production, recovery, and resilience. Sleep quality and exercise tolerance are practical, real-world signals that often track with underlying cellular energy health.',
  },
  {
    question: 'Can lifestyle changes improve mitochondrial health?',
    answer:
      'Emerging research suggests that movement, nutrient-dense foods, blood-sugar balance, stress management, and sleep support mitochondrial function. Always tailor interventions with your clinician.',
  },
  {
    question: 'How often should I repeat this assessment?',
    answer:
      'Many people check monthly while implementing new routines, then every 3â€“6 months as patterns stabilize. Use the same rating approach each time for better comparisons.',
  },
  {
    question: 'Does a low score mean my mitochondria are permanently damaged?',
    answer:
      'Not necessarily. A low score highlights that energy, recovery, or metabolic balance feel strained. It is a signal to investigate further, not a conclusion about irreversible damage.',
  },
  {
    question: 'Should I change or add supplements based on this score alone?',
    answer:
      'No. Supplement protocols for mitochondrial support (such as CoQ10, carnitine, or others) should be guided by a clinician who understands your diagnoses, medications, and labs.',
  },
  {
    question: 'How can I bring this information to my healthcare team?',
    answer:
      'You can share your scores, trends over time, and notes about fatigue, exercise tolerance, and sleep. This context can complement objective testing and help focus your visit.',
  },
];

const relatedCalculators = [
  {
    name: 'Fasting Benefits Progress Tracker',
    slug: 'fasting-benefits-progress-tracker',
    description: 'Track fasting-related adaptations that may interact with cellular energy.',
  },
  {
    name: 'Sauna Detox Effectiveness Score',
    slug: 'sauna-detox-effectiveness-score',
    description: 'Consider how heat exposure and recovery affect overall energy and resilience.',
  },
  {
    name: 'Cold Exposure Duration Estimator',
    slug: 'cold-exposure-duration-estimator',
    description: 'Plan cold exposure doses that respect your recovery capacity.',
  },
  {
    name: 'Sleep Optimization Routine Score',
    slug: 'sleep-optimization-routine-score',
    description: 'Align sleep routines with cellular recovery and repair.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/mitochondrial-health-index';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Mitochondrial Health Index', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Mitochondrial Health Index',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description:
        'Estimate a mitochondrial health index and recovery capacity score from fatigue, exercise tolerance, sleep quality, and metabolic balance.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const { fatigueLevel, exerciseTolerance, sleepQuality, metabolicMarkersScore } = values;

  const normalizedFatigue = 1 - fatigueLevel / 10;
  const performanceComponent = (exerciseTolerance + sleepQuality) / 20;
  const metabolicComponent = metabolicMarkersScore / 10;

  const mitochondrialHealthIndexRaw =
    normalizedFatigue * 0.35 * 100 + performanceComponent * 0.4 * 100 + metabolicComponent * 0.25 * 100;
  const mitochondrialHealthIndex = clamp(mitochondrialHealthIndexRaw, 0, 100);

  const recoveryCapacityScore = clamp(
    ((sleepQuality / 10) * 0.5 + (normalizedFatigue * 0.5)) * 100,
    0,
    100,
  );

  let status: ResultPayload['status'] = 'moderate';
  let interpretation =
    'Your mitochondrial health index suggests mixed energy and recovery patterns. There may be room to optimize lifestyle and work with your clinician.';

  if (mitochondrialHealthIndex >= 80 && recoveryCapacityScore >= 75) {
    status = 'optimal';
    interpretation =
      'Your scores suggest generally robust energy and recovery capacity for many people with similar ratings. Continue protecting these foundations.';
  } else if (mitochondrialHealthIndex >= 60) {
    status = 'good';
    interpretation =
      'Your mitochondrial profile looks reasonably supportive, though targeted adjustments could further improve resilience and day-to-day energy.';
  } else if (mitochondrialHealthIndex < 40 || recoveryCapacityScore < 40) {
    status = 'low';
    interpretation =
      'Your scores indicate that energy, recovery, or metabolic balance feel significantly strained. It may be helpful to review these concerns with a clinician.';
  }

  const recommendations: string[] = [
    'Track your fatigue, sleep quality, and exercise tolerance for at least 1â€“2 weeks to capture patterns rather than individual â€œoff days.â€',
    'Discuss your ratings and scores with a healthcare professional, especially if fatigue is persistent or progressive.',
    'Prioritize foundational inputs for mitochondria: nutrient-dense meals, adequate protein, hydration, movement, and restorative sleep.',
  ];

  if (fatigueLevel >= 7) {
    recommendations.push(
      'High fatigue scores warrant medical evaluation to rule out anemia, thyroid issues, sleep disorders, infections, or other underlying causes.',
    );
  }

  if (exerciseTolerance <= 3) {
    recommendations.push(
      'When exercise tolerance is low, consider lower-intensity movement (like walking) and paced progression under professional supervision.',
    );
  }

  if (sleepQuality <= 4) {
    recommendations.push(
      'Focus on sleep hygiene: consistent bed/wake times, dark and cool bedroom, reduced evening screens, and limiting caffeine and alcohol near bedtime.',
    );
  }

  const plan = [
    {
      label: 'This Week',
      detail:
        'Log daily fatigue, sleep quality, and movement, and note any triggers (meals, stress, screen time) that noticeably change your energy.',
    },
    {
      label: 'This Month',
      detail:
        'Share your log and index scores with your clinician. Explore targeted testing and gradual habit experiments that may improve energy and recovery.',
    },
    {
      label: 'Ongoing',
      detail:
        'Recalculate your mitochondrial health index every 1â€“3 months as you implement changes, watching for slow, sustainable improvements.',
    },
  ];

  return {
    fatigueLevel,
    exerciseTolerance,
    sleepQuality,
    metabolicMarkersScore,
    mitochondrialHealthIndex: Number(mitochondrialHealthIndex.toFixed(1)),
    recoveryCapacityScore: Number(recoveryCapacityScore.toFixed(1)),
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function MitochondrialHealthIndex() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fatigueLevel: undefined,
      exerciseTolerance: undefined,
      sleepQuality: undefined,
      metabolicMarkersScore: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script
        id="mitochondrial-health-index-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Mitochondrial Health Index
          </CardTitle>
          <CardDescription>
            Estimate a mitochondrial health index and recovery capacity score from simple energy and lifestyle ratings.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your energy and recovery profile</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fatigueLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average fatigue level (0â€“10)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="e.g., 6"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="exerciseTolerance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exercise tolerance (0â€“10)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="e.g., 5"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
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
                      <FormLabel>Sleep quality (0â€“10)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="e.g., 7"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="metabolicMarkersScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Metabolic markers & balance (0â€“10)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="e.g., 6.5"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate mitochondrial health index
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
            <CardDescription>See mitochondrial health, recovery capacity, and next steps.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Mitochondrial health index</p>
                <p className="text-2xl font-semibold text-primary">{result.mitochondrialHealthIndex}</p>
                <p className="text-xs text-muted-foreground">0â€“100 scale</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recovery capacity</p>
                <p className="text-2xl font-semibold text-primary">{result.recoveryCapacityScore}</p>
                <p className="text-xs text-muted-foreground">Higher = better</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Fatigue level</p>
                <p className="text-2xl font-semibold text-primary">{result.fatigueLevel.toFixed(1)}/10</p>
                <p className="text-xs text-muted-foreground">Self-rated exhaustion</p>
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
            <strong>Mitochondrial health index</strong> blends inverse fatigue, exercise tolerance, sleep quality, and
            metabolic balance into a 0â€“100 score. Higher values suggest more robust energy production and recovery in
            everyday life.
          </p>
          <p>
            <strong>Recovery capacity score</strong> focuses on sleep and fatigue to estimate how well you bounce back
            from daily stressors and activity.
          </p>
          <p>
            The model is intentionally simple and educational; it is designed to prompt reflection and conversation with
            your care team, not to replace formal diagnostics or lab testing.
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
                <p className="text-sm text-muted-foreground">Exercise tolerance</p>
                <p className="text-xl font-semibold text-primary">{result.exerciseTolerance.toFixed(1)}/10</p>
                <p className="text-xs text-muted-foreground">Perceived capacity</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sleep quality</p>
                <p className="text-xl font-semibold text-primary">{result.sleepQuality.toFixed(1)}/10</p>
                <p className="text-xs text-muted-foreground">Subjective depth & refreshment</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Metabolic balance score</p>
                <p className="text-xl font-semibold text-primary">{result.metabolicMarkersScore.toFixed(1)}/10</p>
                <p className="text-xs text-muted-foreground">Labs & symptoms overview</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Enter your ratings to view auxiliary breakdowns of energy and recovery.
            </p>
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
          content="Mitochondrial Health Index: Understanding Everyday Energy, Recovery, and Cellular Resilience"
        />
        <meta
          itemProp="description"
          content="Explore how fatigue, sleep, exercise tolerance, and metabolic balance can offer clues about mitochondrial health, and how to use those clues responsibly with your healthcare team."
        />
        <meta
          itemProp="keywords"
          content="mitochondrial health index, cellular energy calculator, fatigue and recovery score, metabolic resilience, mitochondrial dysfunction"
        />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/mitochondrial-health-index-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          Mitochondrial Health Index: A Practical, Patient-Friendly Guide to Everyday Energy
        </h1>
        <p className="text-lg italic text-gray-700">
          This guide explains why mitochondria matter, how everyday signals like fatigue and sleep can reflect cellular
          energy, and how to use this calculator as a conversation tool with your healthcare team.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li>
            <a href="#mitochondria-basics" className="hover:underline">
              1. Mitochondria 101: Why Cellular Powerhouses Matter
            </a>
          </li>
          <li>
            <a href="#signals" className="hover:underline">
              2. Everyday Signals of Energy and Recovery
            </a>
          </li>
          <li>
            <a href="#labs-metrics" className="hover:underline">
              3. Lab Markers and Objective Metrics that Inform Mitochondrial Health
            </a>
          </li>
          <li>
            <a href="#lifestyle" className="hover:underline">
              4. Lifestyle Inputs that Support or Strain Mitochondria
            </a>
          </li>
          <li>
            <a href="#working-with-clinicians" className="hover:underline">
              5. How to Use This Index with Your Healthcare Team
            </a>
          </li>
        </ul>

        <hr />

        <h2 id="mitochondria-basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          1. Mitochondria 101: Why Cellular Powerhouses Matter
        </h2>
        <p>
          Mitochondria are often described as the â€œpower plantsâ€ of your cells because they generate most of the
          adenosine triphosphate (ATP) used for cellular work. They are especially dense in tissues with high energy
          demand: brain, heart, skeletal muscle, and liver. When mitochondrial networks are stressed, fragmented, or
          under-supported, people may notice symptoms like fatigue, exercise intolerance, brain fog, and slower
          recovery.
        </p>
        <p>
          Clinical mitochondrial disease is rare and requires specialized evaluation, but milder mitochondrial
          dysfunction can show up across many chronic conditions, from metabolic syndrome to neurodegenerative
          disorders. This calculator does not attempt to diagnose those conditionsâ€”it simply organizes subjective
          signals that relate to energy and recovery.
        </p>

        <h2 id="signals" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          2. Everyday Signals of Energy and Recovery
        </h2>
        <p>
          Four broad symptom domains provide accessible clues about mitochondrial health: fatigue, exercise tolerance,
          sleep quality, and metabolic balance. While nonspecific, these domains capture the lived experience of
          cellular energy output and repair capacity in daily life.
        </p>
        <p>
          For example, people with relatively healthy mitochondrial function often describe steady daytime energy,
          predictable recovery from physical activity, and sleep that leaves them refreshed. In contrast, those with
          strained energy systems may report â€œenergy crashes,â€ delayed-onset fatigue after exertion, or feeling wired
          but tired at night. Tracking these patterns over time can help clinicians decide when to investigate further.
        </p>

        <h2 id="labs-metrics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          3. Lab Markers and Objective Metrics that Inform Mitochondrial Health
        </h2>
        <p>
          No single lab test perfectly measures mitochondrial function, but several markers provide context. Blood sugar
          control, lipid profiles, iron studies, thyroid function, vitamin D, B12, and inflammatory markers all interact
          with energy metabolism. In some specialized settings, clinicians may also order lactate, pyruvate, organic
          acids, or genetic testing when indicated.
        </p>
        <p>
          Wearables and home devices can add further insight: heart rate variability (HRV), resting heart rate, sleep
          staging estimates, and step counts create a picture of how your body responds to training and stress. The
          mitochondrial health index in this tool is deliberately simpler, but it can sit alongside those metrics as a
          human-readable summary of how you feel.
        </p>

        <h2 id="lifestyle" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          4. Lifestyle Inputs that Support or Strain Mitochondria
        </h2>
        <p>
          Mitochondria thrive when the environment is â€œchallenging but manageable.â€ Too little stimulus (sedentary
          living) and too much unbuffered stress (overtraining, sleep deprivation, chronic inflammation) can both
          degrade function. The most impactful levers are usually fundamental: regular movement, strength training
          matched to your capacity, nutrient-dense meals, circadian-friendly light exposure, and structured stress
          management.
        </p>
        <p>
          Over time, small, sustainable changes in these domains may shift mitochondrial health more than any single
          supplement. That is why this calculator emphasizes sleep, fatigue, and tolerance to activity rather than
          specific nutraceuticals. Once the basics are in place, you and your clinician can decide whether and how
          targeted supplements fit your picture.
        </p>

        <h2 id="working-with-clinicians" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          5. How to Use This Index with Your Healthcare Team
        </h2>
        <p>
          If your scores are low or trending downward, consider scheduling a dedicated visit to explore drivers of
          fatigue and recovery problems. Bring logs of your sleep, exercise, and daily symptoms, along with any wearable
          data you track. This context can help your clinician prioritize tests and discuss treatment options.
        </p>
        <p>
          Importantly, a higher mitochondrial health index does not mean you should ignore warning signs like chest
          pain, shortness of breath, rapid unintentional weight loss, or neurological changes. Always treat red-flag
          symptoms as urgent and seek medical care promptly, regardless of calculator scores.
        </p>

        <hr />
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Conclusion
        </h2>
        <p>
          Your day-to-day energy and recovery are multi-factorial, and mitochondria are one important part of that
          story. By scoring fatigue, exercise tolerance, sleep, and metabolic balance, this calculator gives you a
          structured way to track trends and open deeper conversations with your healthcare team. It is not a
          diagnostic, but a lens through which to view your health decisions over time.
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
            This calculator estimates a mitochondrial health index and recovery capacity score using simple 0â€“10
            self-ratings.
          </p>
          <p>
            It surfaces patterns in fatigue, sleep, exercise tolerance, and metabolic balance to support more informed
            lifestyle and clinical decisions.
          </p>
          <p>
            Always interpret scores in partnership with qualified healthcare professionals who can connect them to your
            full medical picture.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}



