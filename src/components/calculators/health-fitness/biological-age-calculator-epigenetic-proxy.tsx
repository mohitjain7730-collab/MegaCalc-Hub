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
  chronologicalAge: z.number({ invalid_type_error: 'Enter age' }).min(18).max(100),
  restingHeartRate: z.number({ invalid_type_error: 'Enter RHR' }).min(35).max(110),
  waistToHeightRatio: z.number({ invalid_type_error: 'Enter ratio' }).min(0.3).max(0.8),
  lifestyleScore: z.number({ invalid_type_error: 'Enter lifestyle score' }).min(0).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  chronologicalAge: number;
  restingHeartRate: number;
  waistToHeightRatio: number;
  lifestyleScore: number;
  biologicalAge: number;
  deltaAge: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your chronological age in years.',
  'Enter your resting heart rate (beats per minute) measured at rest.',
  'Enter your waist-to-height ratio (waist circumference divided by height).',
  'Rate your overall lifestyle quality (sleep, nutrition, movement, stress, substance use) from 0–10.',
  'Review your estimated biological age proxy, the difference from chronological age, and suggested longevity levers.',
];

const faqs = [
  {
    question: 'Is this a real epigenetic test?',
    answer:
      'No. True epigenetic clocks require lab analysis of DNA methylation. This calculator uses accessible health markers as a proxy for biological age trends.',
  },
  {
    question: 'What does biological age mean here?',
    answer:
      'It approximates how “old” your body might be functioning compared to your calendar age, based on cardiovascular fitness, central adiposity, and lifestyle.',
  },
  {
    question: 'Why resting heart rate and waist-to-height ratio?',
    answer:
      'Both are linked in research to cardiovascular risk, metabolic health, and mortality, and they are easy to track without labs.',
  },
  {
    question: 'How accurate is this calculator?',
    answer:
      'It is a rough heuristic. It cannot replace clinical tests, but it can highlight whether your current patterns likely push biological age up or down.',
  },
  {
    question: 'Can I lower my biological age?',
    answer:
      'Some interventions—improved sleep, nutrition, movement, and stress management—are associated with delayed biological aging in studies, though individual responses vary.',
  },
  {
    question: 'How often should I recalculate?',
    answer:
      'Every few months or after significant lifestyle changes. Biological aging shifts slowly, so daily tracking is not necessary.',
  },
  {
    question: 'Should I share these results with my doctor?',
    answer:
      'Yes, especially if they highlight risk factors. Use them as a conversation starter, not as a replacement for medical evaluation.',
  },
  {
    question: 'Do genetics matter?',
    answer:
      'Genetics influence baseline risk, but lifestyle still plays a major role. This calculator focuses on modifiable factors.',
  },
  {
    question: 'Can I use this while on medication?',
    answer:
      'Yes, but medications may influence some markers (like heart rate). Always interpret results in context of your medical care.',
  },
  {
    question: 'Is a negative delta age always good?',
    answer:
      'Generally yes—it suggests your health profile skews younger than your chronological age—but extreme negative values should be interpreted cautiously.',
  },
];

const relatedCalculators = [
  {
    name: 'Longevity Score Estimator',
    slug: 'longevity-score-estimator',
    description: 'Combine multiple lifestyle factors into a longevity-oriented score.',
  },
  {
    name: 'Lifespan Extension Strategy Score Calculator',
    slug: 'lifespan-extension-strategy-score-calculator',
    description: 'Evaluate the breadth of your longevity strategies.',
  },
  {
    name: 'Anti-Aging Nutrition Score Calculator',
    slug: 'anti-aging-nutrition-score-calculator',
    description: 'Assess how aging-friendly your diet appears.',
  },
  {
    name: 'Mitochondrial Health Estimator',
    slug: 'mitochondrial-health-estimator',
    description: 'Explore cellular energy factors behind aging.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/biological-age-calculator-epigenetic-proxy';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Biological Age Calculator (Epigenetic-Based Proxy)', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Biological Age Calculator (Epigenetic-Based Proxy)',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate a proxy for biological age using resting heart rate, waist-to-height ratio, lifestyle score, and chronological age.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const { chronologicalAge, restingHeartRate, waistToHeightRatio, lifestyleScore } = values;

  const rhrComponent = (restingHeartRate - 60) * 0.25; // each bpm above 60 adds ~0.25y
  const waistComponent = (waistToHeightRatio - 0.5) * 60; // 0.1 above 0.5 ≈ +6y
  const lifestyleComponent = (5 - lifestyleScore) * 0.8; // better lifestyle reduces age

  const proxyShift = rhrComponent + waistComponent + lifestyleComponent;
  const biologicalAgeRaw = chronologicalAge + proxyShift;
  const biologicalAge = clamp(biologicalAgeRaw, chronologicalAge - 15, chronologicalAge + 20);

  const deltaAge = Number((biologicalAge - chronologicalAge).toFixed(1));

  let status: ResultPayload['status'] = 'good';
  let interpretation = 'Your proxy biological age is close to your chronological age, suggesting an average aging pattern.';

  if (deltaAge <= -5) {
    status = 'optimal';
    interpretation = 'Your indicators suggest a younger biological profile relative to your chronological age.';
  } else if (deltaAge >= 5 && deltaAge < 10) {
    status = 'moderate';
    interpretation = 'Your proxy biological age trends older than your chronological age; targeted lifestyle changes may help.';
  } else if (deltaAge >= 10) {
    status = 'low';
    interpretation = 'Your markers point to substantially accelerated biological aging. Medical evaluation and lifestyle optimization are strongly recommended.';
  }

  const recommendations: string[] = [
    'Work toward a resting heart rate in the 50–70 bpm range through regular, appropriate cardio training (as cleared by your doctor).',
    'Adjust nutrition and movement to reduce waist circumference relative to height, prioritizing whole foods and resistance training.',
    'Improve lifestyle score by optimizing sleep, stress management, and reducing smoking or heavy alcohol use.',
  ];

  if (restingHeartRate > 80) {
    recommendations.push('Discuss elevated resting heart rate with a healthcare professional, especially if accompanied by symptoms.');
  }

  if (waistToHeightRatio > 0.6) {
    recommendations.push('Consider a structured weight-management or metabolic health program to lower central adiposity.');
  }

  if (lifestyleScore < 5) {
    recommendations.push('Start small: choose one habit (sleep, steps, or processed sugar reduction) and improve it for two weeks before adding another.');
  }

  const plan = [
    { label: 'This Month', detail: 'Track resting heart rate and waist measurements weekly while implementing one new lifestyle habit.' },
    { label: 'Next 3–6 Months', detail: 'Layer additional interventions (nutrition, strength training, stress practices) and re-check biological age proxy quarterly.' },
    { label: 'Ongoing', detail: 'Combine this proxy with clinical markers (blood pressure, labs, professional epigenetic tests where available) for a fuller picture.' },
  ];

  return {
    chronologicalAge,
    restingHeartRate,
    waistToHeightRatio,
    lifestyleScore,
    biologicalAge: Number(biologicalAge.toFixed(1)),
    deltaAge,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function BiologicalAgeCalculatorEpigeneticProxy() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      chronologicalAge: undefined,
      restingHeartRate: undefined,
      waistToHeightRatio: undefined,
      lifestyleScore: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="biological-age-epigenetic-proxy-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Biological Age Calculator (Epigenetic-Based Proxy)
          </CardTitle>
          <CardDescription>Estimate a proxy for biological age using simple cardiovascular and lifestyle markers.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your health markers</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="chronologicalAge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chronological age (years)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 38" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="restingHeartRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resting heart rate (bpm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 64" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="waistToHeightRatio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waist-to-height ratio</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 0.48" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lifestyleScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lifestyle score (0–10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 7.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Estimate biological age proxy
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
            <CardDescription>See estimated biological age, delta age, and targeted longevity levers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Biological age (proxy)</p>
                <p className="text-2xl font-semibold text-primary">{result.biologicalAge}</p>
                <p className="text-xs text-muted-foreground">Years (approximate)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Delta age</p>
                <p className="text-2xl font-semibold text-primary">
                  {result.deltaAge > 0 ? `+${result.deltaAge}` : result.deltaAge}
                </p>
                <p className="text-xs text-muted-foreground">Biological − chronological</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Lifestyle score</p>
                <p className="text-2xl font-semibold text-primary">{result.lifestyleScore}</p>
                <p className="text-xs text-muted-foreground">0–10 scale</p>
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
            <strong>Proxy shift</strong> combines heart-rate, waist-to-height ratio, and lifestyle inputs into a positive or negative age adjustment relative to chronological age.
          </p>
          <p>
            <strong>Biological age (proxy)</strong> = chronological age + proxy shift, with caps to avoid unrealistic extremes.
          </p>
          <p>
            <strong>Delta age</strong> highlights how far this proxy deviates from your actual age; small changes over time are more meaningful than any single reading.
          </p>
          <p>This simple model is meant for education and habit design, not for diagnosis or replacing lab-based epigenetic testing.</p>
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
                <p className="text-sm text-muted-foreground">Heart age signal</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.restingHeartRate - 60).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Bpm above 60 (lower is better)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Central adiposity signal</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.waistToHeightRatio - 0.5).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Relative to 0.5 benchmark</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Lifestyle leverage</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.lifestyleScore / 10 * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Of maximum lifestyle score</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your markers to see additional signals.</p>
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
          content="Biological Age and Epigenetic Proxies: Understanding What “Younger on the Inside” Really Means"
        />
        <meta
          itemProp="description"
          content="Explore how simple markers like resting heart rate, waist-to-height ratio, and lifestyle patterns can approximate biological age trends and inform longevity strategies."
        />
        <meta
          itemProp="keywords"
          content="biological age calculator, epigenetic clock proxy, resting heart rate, waist to height ratio, longevity planning"
        />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/definitive-biological-age-epigenetic-proxy-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          Biological Age Basics: What Epigenetic Proxies Can—and Can’t—Tell You
        </h1>
        <p className="text-lg italic text-gray-700">
          Learn how researchers think about biological age, why lab-based clocks are only part of the picture, and how simple lifestyle-linked markers can guide everyday decisions.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. Chronological Age vs. Biological Age</h2>
        <p>
          Chronological age counts birthdays; biological age reflects accumulated wear, repair, and resilience in your cells and systems. Two people the same age can have very different risks for disease and functional decline.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. Epigenetic Clocks in Brief</h2>
        <p>
          Epigenetic clocks use DNA methylation patterns to infer biological age. They are powerful research tools, but costly and still evolving. Proxies like cardiovascular fitness and central adiposity capture overlapping
          aspects of risk in a more accessible way.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. Why Resting Heart Rate and Waist-to-Height Ratio?</h2>
        <p>
          Resting heart rate reflects cardiorespiratory fitness and autonomic balance, both linked to mortality. Waist-to-height ratio tracks central fat, which strongly correlates with metabolic and cardiovascular risk. Together,
          they offer a quick snapshot of system-level health.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4. Lifestyle as a Lever, Not a Moral Score</h2>
        <p>
          Lifestyle score in this tool is intentionally simple. It should not be used to shame yourself but to highlight leverage points: sleep, nutrition, movement, stress, and substances. Small, sustainable improvements often
          matter more than aggressive overhauls that do not last.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">5. How to Use This Proxy Responsibly</h2>
        <p>
          Treat the result as a directional indicator, not a verdict. If the proxy suggests accelerated aging, use it to justify kinder schedules, more movement, or medical checkups—not to panic. If it looks favorable, remember
          that complacency can still erode health over time.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">6. Combining Proxies with Professional Care</h2>
        <p>
          For a fuller picture, combine this proxy with blood pressure checks, lipid panels, glucose markers, and, where appropriate, professional epigenetic tests. A clinician can help interpret patterns and recommend tailored
          interventions.
        </p>

        <hr />
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Conclusion
        </h2>
        <p>
          Biological age is best thought of as a moving average of how you have treated your body and how your body has responded. Tools like this proxy are invitations to experiment with better inputs—not fixed judgments about
          your future.
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
          <p>This calculator estimates a proxy for biological age using resting heart rate, waist-to-height ratio, lifestyle score, and chronological age.</p>
          <p>It outputs estimated biological age, delta age, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Expanded guide content, formulas, related calculators, and FAQs make the method easy to interpret for humans and AI assistants.</p>
        </CardContent>
      </Card>
    </div>
  );
}


