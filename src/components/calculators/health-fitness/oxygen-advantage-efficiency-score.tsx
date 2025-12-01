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
  boltScore: z.number({ invalid_type_error: 'Enter BOLT score' }).min(5).max(60),
  walkingTestHoldSeconds: z.number({ invalid_type_error: 'Enter hold seconds' }).min(5).max(120),
  nasalBreathingPercent: z.number({ invalid_type_error: 'Enter percent' }).min(0).max(100),
  perceivedBreathlessnessScore: z.number({ invalid_type_error: 'Enter breathlessness score' }).min(0).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  boltScore: number;
  walkingTestHoldSeconds: number;
  nasalBreathingPercent: number;
  perceivedBreathlessnessScore: number;
  efficiencyScore: number;
  trainingReadinessScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your BOLT score (seconds) from the standard Oxygen Advantage test.',
  'Enter your walking breath-hold time (seconds) from the OA walking test, if you use it.',
  'Estimate what percentage of daily breathing (including low-effort activity) is through your nose.',
  'Rate perceived breathlessness during everyday tasks or light exercise (0–10).',
  'Review your Oxygen Advantage Efficiency Score and training readiness.',
];

const faqs = [
  {
    question: 'What is the Oxygen Advantage Efficiency Score?',
    answer:
      'It is a composite that reflects how well your breathing patterns align with principles used in the Oxygen Advantage method (BOLT, functional breathing, nasal use, low breathlessness).',
  },
  {
    question: 'What is a BOLT score?',
    answer:
      'The Body Oxygen Level Test (BOLT) measures the time between a normal exhale and the first urge to breathe, without forcing. Higher scores typically indicate better functional breathing and CO₂ tolerance.',
  },
  {
    question: 'Why include nasal breathing percentage?',
    answer:
      'Nasal breathing supports nitric oxide production, filters and humidifies air, and often encourages calmer patterns compared to chronic mouth breathing.',
  },
  {
    question: 'Is this an official Oxygen Advantage tool?',
    answer:
      'No. It is inspired by OA concepts but is not endorsed or validated by Oxygen Advantage or its creators.',
  },
  {
    question: 'Why track perceived breathlessness?',
    answer:
      'High breathlessness at low workloads may indicate inefficient breathing or deconditioning, which breath training and conditioning can help.',
  },
  {
    question: 'Can I use this without doing formal OA training?',
    answer:
      'Yes. It still gives insight into your breathing efficiency, but structured programs and coaches can help you apply the concepts safely.',
  },
  {
    question: 'Can children or people with medical conditions use this?',
    answer:
      'Only under guidance from qualified professionals; aggressive breath holds are not suitable for everyone.',
  },
  {
    question: 'Does a high score guarantee performance?',
    answer:
      'No. It is one piece of the puzzle. Strength, technique, mental skills, and overall health all contribute to performance.',
  },
  {
    question: 'How often should I test?',
    answer:
      'Every few weeks or when modifying your breath training; avoid re-testing obsessively after every session.',
  },
  {
    question: 'When should I consult a doctor?',
    answer:
      'If you experience unexplained breathlessness, chest pain, dizziness, or other concerning symptoms, speak with a healthcare professional regardless of your score.',
  },
];

const relatedCalculators = [
  {
    name: 'Breath-Hold CO₂ Tolerance Calculator',
    slug: 'breath-hold-co2-tolerance-calculator',
    description: 'Dig deeper into CO₂ tolerance that underpins OA work.',
  },
  {
    name: 'HRV (Heart Rate Variability) Resilience Index',
    slug: 'hrv-resilience-index',
    description: 'Relate breathing efficiency to autonomic resilience.',
  },
  {
    name: 'Sleep Optimization Routine Score',
    slug: 'sleep-optimization-routine-score',
    description: 'Assess sleep habits that affect breathing and recovery.',
  },
  {
    name: 'Circadian Rhythm Alignment Score',
    slug: 'circadian-rhythm-alignment-score',
    description: 'Explore timing factors that influence breathing patterns.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/oxygen-advantage-efficiency-score';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Oxygen Advantage Efficiency Score', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Oxygen Advantage Efficiency Score',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate breathing efficiency based on BOLT, walking breath holds, nasal breathing use, and perceived breathlessness.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const { boltScore, walkingTestHoldSeconds, nasalBreathingPercent, perceivedBreathlessnessScore } = values;

  const boltComponent = clamp((boltScore / 40) * 40, 0, 40); // 40s BOLT often cited as strong
  const walkComponent = clamp((walkingTestHoldSeconds / 60) * 25, 0, 25);
  const nasalComponent = clamp((nasalBreathingPercent / 100) * 20, 0, 20);
  const breathlessPenalty = clamp(perceivedBreathlessnessScore / 10 * 25, 0, 25);

  const rawEfficiency = boltComponent + walkComponent + nasalComponent - breathlessPenalty + 10;
  const efficiencyScore = clamp(rawEfficiency, 0, 100);

  const trainingReadinessScore = clamp(efficiencyScore + (40 - breathlessPenalty), 0, 100);

  let status: ResultPayload['status'] = 'good';
  let interpretation = 'Your breathing metrics suggest reasonably efficient patterns with room for fine-tuning.';

  if (efficiencyScore >= 80 && perceivedBreathlessnessScore <= 3) {
    status = 'optimal';
    interpretation = 'You show strong functional breathing indicators; advanced protocols may be appropriate with proper coaching.';
  } else if (efficiencyScore < 50 || perceivedBreathlessnessScore >= 6) {
    status = 'moderate';
    interpretation = 'Breathing efficiency appears limited or uncomfortable; begin with foundational OA drills and lifestyle adjustments.';
  } else if (efficiencyScore < 35) {
    status = 'low';
    interpretation = 'Scores suggest suboptimal breathing efficiency. Work with a trained coach and consider medical evaluation if symptoms persist.';
  }

  const recommendations: string[] = [
    'Practice gentle nasal breathing during daily activities to increase nasal usage without strain.',
    'Use low-intensity OA or Buteyko-style drills to gradually increase BOLT and reduce breathlessness.',
    'Avoid aggressive breath-hold or hyperventilation protocols without professional supervision.',
  ];

  if (boltScore < 20) {
    recommendations.push('Focus on building a BOLT score toward ~20–25 seconds before attempting more intense performance drills.');
  }

  if (nasalBreathingPercent < 60) {
    recommendations.push('Gradually shift more of your day (especially low-intensity tasks) to nasal-only breathing.');
  }

  const plan = [
    { label: 'This Week', detail: 'Record baseline BOLT, walking test, and nasal-breathing notes; test again only after several days of practice.' },
    { label: 'This Month', detail: 'Implement a simple OA-inspired routine and adjust intensity based on how you feel during daily life and training.' },
    { label: 'Ongoing', detail: 'Reassess efficiency and readiness scores monthly, particularly when changing training load or stress levels.' },
  ];

  return {
    boltScore,
    walkingTestHoldSeconds,
    nasalBreathingPercent,
    perceivedBreathlessnessScore,
    efficiencyScore: Number(efficiencyScore.toFixed(1)),
    trainingReadinessScore: Number(trainingReadinessScore.toFixed(1)),
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function OxygenAdvantageEfficiencyScore() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      boltScore: undefined,
      walkingTestHoldSeconds: undefined,
      nasalBreathingPercent: undefined,
      perceivedBreathlessnessScore: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="oxygen-advantage-efficiency-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Oxygen Advantage Efficiency Score
          </CardTitle>
          <CardDescription>Estimate how closely your breathing aligns with Oxygen Advantage-style efficiency markers.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your OA-related metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="boltScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BOLT score (s)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 22" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="walkingTestHoldSeconds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Walking breath hold (s)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 40" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nasalBreathingPercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nasal breathing share of day (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 80" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="perceivedBreathlessnessScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Perceived breathlessness (0–10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate OA efficiency score
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
            <CardDescription>See efficiency score, training readiness, and progression ideas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Efficiency score</p>
                <p className="text-2xl font-semibold text-primary">{result.efficiencyScore}</p>
                <p className="text-xs text-muted-foreground">0–100 scale</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Training readiness</p>
                <p className="text-2xl font-semibold text-primary">{result.trainingReadinessScore}</p>
                <p className="text-xs text-muted-foreground">Higher = ready for more load</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Nasal breathing</p>
                <p className="text-2xl font-semibold text-primary">{result.nasalBreathingPercent}%</p>
                <p className="text-xs text-muted-foreground">Of day (approx)</p>
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
            <strong>Efficiency score</strong> blends BOLT, walking hold, nasal breathing percentage, and a penalty for high breathlessness into a 0–100 index.
          </p>
          <p>
            <strong>Training readiness</strong> boosts efficiency when breathlessness is low, suggesting capacity for more advanced work.
          </p>
          <p>These heuristics are for education and planning; they do not replace OA coaching or medical advice.</p>
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
                <p className="text-sm text-muted-foreground">BOLT relative to 40 s</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.boltScore / 40 * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Higher = better according to OA guides</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Walking hold ratio</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.walkingTestHoldSeconds / result.boltScore).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Higher suggests better functional transfer</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Breathlessness impact</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.perceivedBreathlessnessScore / 10 * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Higher = more limiting</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your OA metrics to unlock more details.</p>
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
          content="Oxygen Advantage Efficiency: Using BOLT and Nasal Breathing as Practical Metrics"
        />
        <meta
          itemProp="description"
          content="Learn how to interpret BOLT scores, walking breath holds, and nasal breathing habits through the lens of Oxygen Advantage-style training."
        />
        <meta
          itemProp="keywords"
          content="Oxygen Advantage efficiency score, BOLT test calculator, nasal breathing, functional breathing, breathwork performance"
        />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/definitive-oxygen-advantage-efficiency-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          Oxygen Advantage Efficiency: Making Sense of BOLT Scores and Everyday Breathing
        </h1>
        <p className="text-lg italic text-gray-700">
          This guide helps you move beyond raw numbers to practical decisions about breath training, recovery, and performance.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. Why BOLT Matters</h2>
        <p>
          BOLT is a proxy for chemosensitivity to CO₂ and functional breathing efficiency. Higher scores usually reflect calmer, more economical breathing rather than just “lung capacity.”
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. Building from Foundation to Performance</h2>
        <p>
          Before heavy performance drills, many OA-style programs focus on improving BOLT, nasal breathing habits, and tolerance to gentle air hunger. Skipping this foundation can make later sessions uncomfortable or counter-
          productive.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. Interaction with Training Load and Stress</h2>
        <p>
          If life stress or heavy training pushes your BOLT or walking holds down, it may be a sign to ease back until resilience rebounds, much like HRV-informed training adjustments.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4. Safety and Contraindications</h2>
        <p>
          Intense breath holds are not suitable for everyone. People with cardiovascular, respiratory, neurological, or panic disorders need individualized assessment before following aggressive protocols.
        </p>

        <hr />
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Conclusion
        </h2>
        <p>
          Oxygen Advantage-style metrics are powerful feedback tools when used with humility and safety. This calculator helps you summarize those metrics into one view while emphasizing that professional guidance remains key.
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
          <p>This calculator estimates an Oxygen Advantage Efficiency Score and training readiness from BOLT, walking holds, nasal breathing, and breathlessness.</p>
          <p>It returns scores, status, recommendations, an action plan, and extra metrics for informed breath training decisions.</p>
          <p>The expanded guide and FAQs aim to support SEO, E‑E‑A‑T, and responsible use by humans and AI assistants.</p>
        </CardContent>
      </Card>
    </div>
  );
}


