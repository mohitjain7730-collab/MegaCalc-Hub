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
  age: z.number({ invalid_type_error: 'Enter age' }).min(18).max(100),
  exerciseMinutes: z.number({ invalid_type_error: 'Enter minutes' }).min(0).max(2000),
  fastingHoursPerDay: z.number({ invalid_type_error: 'Enter hours' }).min(0).max(24),
  supplementScore: z.number({ invalid_type_error: 'Enter supplement score' }).min(0).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  age: number;
  exerciseMinutes: number;
  fastingHoursPerDay: number;
  supplementScore: number;
  nadSupportScore: number;
  lifestyleContribution: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your age.',
  'Enter your average weekly minutes of moderate-to-vigorous exercise.',
  'Enter your typical fasting window per day (hours between last meal and first meal next day).',
  'Rate your NAD+-targeted supplementation approach (if any) from 0–10.',
  'Review NAD+ support score and lifestyle contribution index.',
];

const faqs = [
  {
    question: 'What is NAD+ and why does it matter?',
    answer:
      'NAD+ (nicotinamide adenine dinucleotide) is a cofactor involved in energy metabolism, DNA repair, and cellular signaling. Levels tend to decline with age.',
  },
  {
    question: 'Does this estimator measure my actual NAD+ levels?',
    answer:
      'No. Laboratory testing is required to quantify NAD+ directly. This tool estimates how supportive your lifestyle and supplement patterns may be for NAD+ biology.',
  },
  {
    question: 'Why include exercise and fasting?',
    answer:
      'Exercise and caloric/fasting patterns influence mitochondrial function and pathways associated with NAD+ metabolism in animal and human studies.',
  },
  {
    question: 'How do I rate supplement score?',
    answer:
      'Consider evidence-backed NAD+ precursors (like NR or NMN where allowed), dosing consistency, and guidance from a qualified professional. 0 = none, 10 = optimized with oversight.',
  },
  {
    question: 'Is more supplementation always better?',
    answer:
      'Not necessarily. Long-term effects, individual variation, and interactions with conditions or medications mean professional guidance is important.',
  },
  {
    question: 'Can lifestyle alone support NAD+?',
    answer:
      'For many people, movement, metabolic health, and sleep may be sufficient. Supplementation is an adjunct, not a replacement, for basics.',
  },
  {
    question: 'How often should I re-check?',
    answer:
      'When changing exercise, fasting, or supplement routines, or every few months to see trends.',
  },
  {
    question: 'Should I change my medications based on this?',
    answer:
      'No. Always consult your clinician before altering medications or making major supplement changes.',
  },
  {
    question: 'Does this account for chronic illness?',
    answer:
      'No. Chronic conditions can alter NAD+ biology in complex ways; use this as a general lifestyle lens only.',
  },
  {
    question: 'Is there an ideal target score?',
    answer:
      'Scores above ~70 generally reflect strong NAD+-supportive patterns in this model, but context and safety always matter.',
  },
];

const relatedCalculators = [
  {
    name: 'Lifespan Extension Strategy Score Calculator',
    slug: 'lifespan-extension-strategy-score-calculator',
    description: 'Evaluate your overall longevity game plan.',
  },
  {
    name: 'Anti-Aging Nutrition Score Calculator',
    slug: 'anti-aging-nutrition-score-calculator',
    description: 'Check whether nutrition supports cellular health.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/nad-plus-optimization-estimator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'NAD+ Support Wellness Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'NAD+ Support Wellness Estimator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description:
        'Get general wellness insights about how supportive your habits and supplementation may be for NAD+ biology. This is a personal lifestyle insight, not a medical evaluation.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const { age, exerciseMinutes, fastingHoursPerDay, supplementScore } = values;

  const exerciseFactor = clamp(exerciseMinutes / 150, 0, 2); // up to double guideline
  const fastingFactor = clamp(fastingHoursPerDay / 16, 0, 1.5); // typical 12–16h window
  const supplementFactor = supplementScore / 10;

  const lifestyleContribution = clamp((exerciseFactor * 0.5 + fastingFactor * 0.3 + 0.2) * 100, 0, 100);
  const agePenalty = clamp((age - 30) / 50, 0, 1); // older age slightly lowers potential

  const nadSupportScore = clamp((lifestyleContribution * (1 - agePenalty * 0.3) + supplementFactor * 20), 0, 100);

  let status: ResultPayload['status'] = 'good';
  let interpretation =
    'This suggests a general lifestyle tendency where your current routine may offer a reasonable level of NAD+‑supportive behavior in this heuristic model.';

  if (nadSupportScore >= 80) {
    status = 'optimal';
    interpretation =
      'This suggests a general lifestyle tendency where you may have many NAD+‑supportive patterns in place. You may consider focusing on safety, monitoring, and sustainability with any strategies you choose. This is a personal insight, not a medical evaluation.';
  } else if (nadSupportScore < 50) {
    status = 'moderate';
    interpretation =
      'This suggests a general lifestyle tendency where there may be room to gently strengthen NAD+‑related lifestyle pillars—such as movement, recovery, or nutrition—before adding more intensive approaches.';
  } else if (nadSupportScore < 35) {
    status = 'low';
    interpretation =
      'This suggests a general lifestyle tendency where NAD+‑supportive signals in this simple model may appear softer. Improving fundamentals like movement, rest, and metabolic health may feel like meaningful next steps over time.';
  }

  const recommendations: string[] = [
    'Prioritize regular, age-appropriate exercise (aerobic plus some resistance) to support mitochondrial and metabolic health.',
    'Consider a gentle overnight fasting window (12–14 hours) if safe for you and cleared by your clinician.',
    'Discuss any NAD+-targeted supplements with a healthcare professional familiar with your history.',
  ];

  if (exerciseMinutes < 90) {
    recommendations.push('Increase activity gradually with walking, light cardio, or strength work until you reach or exceed guidelines.');
  }

  if (fastingHoursPerDay < 10) {
    recommendations.push('Avoid constant grazing; allow at least modest gaps between meals to reduce metabolic strain, if safe for you.');
  }

  if (supplementScore > 0 && supplementScore < 5) {
    recommendations.push('If you already supplement, ensure dosing is evidence-informed and coordinated with routine labs and medical oversight.');
  }

  const plan = [
    { label: 'This Month', detail: 'Stabilize sleep, exercise, and basic nutrition before altering fasting or supplements.' },
    { label: 'Next 3–6 Months', detail: 'Consider periodic check-ins with a clinician about markers influenced by NAD+-related interventions.' },
    { label: 'Ongoing', detail: 'Re-evaluate NAD+ support as your age, goals, and medical context evolve.' },
  ];

  return {
    age,
    exerciseMinutes,
    fastingHoursPerDay,
    supplementScore,
    nadSupportScore: Number(nadSupportScore.toFixed(1)),
    lifestyleContribution: Number(lifestyleContribution.toFixed(1)),
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function NadPlusOptimizationEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      exerciseMinutes: undefined,
      fastingHoursPerDay: undefined,
      supplementScore: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="nad-plus-optimization-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            NAD+ Support Wellness Estimator
          </CardTitle>
          <CardDescription>
            Get general wellness insights about how NAD+‑supportive your current lifestyle and supplement strategy may
            be. This is a personal lifestyle insight, not a medical evaluation.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your NAD+-related data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (years)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 45" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="exerciseMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exercise minutes/week</FormLabel>
                      <FormControl>
                        <Input type="number" step="10" placeholder="e.g., 160" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fastingHoursPerDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fasting window per day (hours)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 13.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="supplementScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NAD+-targeted supplement strategy (0–10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Estimate NAD+ support
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
            <CardDescription>See NAD+ support score, lifestyle contribution, and strategic guidance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">NAD+ support score</p>
                <p className="text-2xl font-semibold text-primary">{result.nadSupportScore}</p>
                <p className="text-xs text-muted-foreground">0–100 scale</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Lifestyle contribution</p>
                <p className="text-2xl font-semibold text-primary">{result.lifestyleContribution}</p>
                <p className="text-xs text-muted-foreground">From exercise + fasting</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Supplement score</p>
                <p className="text-2xl font-semibold text-primary">{result.supplementScore}</p>
                <p className="text-xs text-muted-foreground">Self-rated 0–10</p>
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
            <strong>Lifestyle contribution</strong> scales exercise and fasting relative to commonly discussed ranges in NAD+-adjacent research, then normalizes to 0–100.
          </p>
          <p>
            <strong>NAD+ support score</strong> adjusts lifestyle contribution for age-related headwinds and adds a modest boost based on self-rated supplement strategy.
          </p>
          <p>This model is purely heuristic and should never override medical advice or laboratory data.</p>
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
                <p className="text-sm text-muted-foreground">Exercise factor</p>
                <p className="text-xl font-semibold text-primary">
                  {clamp(result.exerciseMinutes / 150, 0, 2).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Relative to 150 min/week</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Fasting factor</p>
                <p className="text-xl font-semibold text-primary">
                  {clamp(result.fastingHoursPerDay / 16, 0, 1.5).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Relative to 16h</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Age headwind</p>
                <p className="text-xl font-semibold text-primary">
                  {clamp((result.age - 30) / 50, 0, 1).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">0–1 scale</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your data to see additional metrics.</p>
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
          content="NAD+ Optimization: How Lifestyle and Supplements Interact with Cellular Energy"
        />
        <meta
          itemProp="description"
          content="Understand the basics of NAD+ biology, what current evidence suggests about lifestyle and supplements, and how to have informed conversations with your clinician."
        />
        <meta
          itemProp="keywords"
          content="NAD+ optimization, NR, NMN, mitochondrial health, fasting, exercise, longevity supplements"
        />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/definitive-nad-plus-optimization-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          NAD+ Optimization: Separating Fundamentals from Hype
        </h1>
        <p className="text-lg italic text-gray-700">
          NAD+ has become a buzzword in longevity circles. This guide helps you focus on evidence-backed basics before layering on experimental strategies.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. What NAD+ Actually Does</h2>
        <p>
          NAD+ is central to redox reactions and energy transfer in cells. It also influences sirtuins and other longevity-associated pathways. Levels naturally change with age and metabolic state.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. Lifestyle Before Supplements</h2>
        <p>
          Movement, metabolic health, sleep, and stress regulation all influence NAD+-related pathways. Many experts advocate solidifying these pillars before investing heavily in supplements.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. The Role of Fasting and Nutrition</h2>
        <p>
          Caloric balance, meal timing, and nutrient density interact with cellular energy sensing. Thoughtful fasting windows and whole-food diets may support healthier NAD+ dynamics, though responses vary.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4. Considering Supplements Safely</h2>
        <p>
          NAD+ precursors and related compounds remain an active research area. Dosing, long-term effects, and individual risks are not fully understood. Working with a clinician who follows the literature is key.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">5. Building a Thoughtful Plan</h2>
        <p>
          Rather than chasing every new compound, use tools like this estimator to ground decisions in your actual routines and capacity. Adjust one variable at a time and monitor sleep, energy, labs, and how you feel.
        </p>

        <hr />
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Conclusion
        </h2>
        <p>
          NAD+ optimization is best approached as part of a broader longevity strategy, not a magic bullet. Focus on fundamentals, consult professionals, and use estimators like this as conversation aids—not prescriptions.
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
            This estimator provides general wellness insights about how NAD+‑supportive your current lifestyle and
            supplement patterns may be. This is a personal lifestyle insight, not a medical evaluation.
          </p>
          <p>Outputs include a NAD+ support score, lifestyle contribution index, qualitative status, recommendations, an action plan, and supporting metrics.</p>
          <p>An expanded guide and FAQs clarify scope and limitations so results are used responsibly by humans and AI assistants.</p>
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


