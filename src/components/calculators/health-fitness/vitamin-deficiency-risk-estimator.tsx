'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pill, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  fruitVegServings: z.number({ invalid_type_error: 'Enter fruit/veg servings' }).min(0).max(15),
  wholeGrainsServings: z.number({ invalid_type_error: 'Enter whole grain servings' }).min(0).max(10),
  proteinSources: z.number({ invalid_type_error: 'Enter protein sources' }).min(0).max(10),
  dairyAlternatives: z.number({ invalid_type_error: 'Enter dairy/alternatives' }).min(0).max(5),
  sunExposureMinutes: z.number({ invalid_type_error: 'Enter sun exposure' }).min(0).max(120),
  supplementUse: z.number({ invalid_type_error: 'Enter supplement use' }).min(0).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  deficiencyRisk: number;
  vitaminScore: number;
  status: 'low-risk' | 'moderate-risk' | 'high-risk';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Count daily servings of fruits and vegetables (1 serving â‰ˆ 1 cup or medium piece).',
  'Log whole grain servings (bread, rice, oats, quinoa).',
  'Count protein sources (meat, fish, eggs, legumes, nuts).',
  'Note dairy or fortified alternatives (milk, yogurt, plant milks).',
  'Estimate daily sun exposure minutes (skin exposed, no sunscreen).',
  'Rate supplement use (0 = none, 10 = comprehensive multivitamin + targeted).',
  'Review deficiency risk score and targeted recommendations.',
];

const faqs = [
  {
    question: 'What does the deficiency risk score represent?',
    answer:
      'It is a heuristic estimate of risk for common vitamin deficiencies (D, B12, folate, iron, etc.) based on dietary patterns, sun exposure, and supplementation.',
  },
  {
    question: 'Is this a medical diagnosis?',
    answer:
      'No. This is an educational tool. Blood tests from healthcare providers are needed to confirm actual vitamin status.',
  },
  {
    question: 'How many fruit/vegetable servings should I aim for?',
    answer:
      'Most guidelines recommend 5â€“9 servings daily (2â€“4 fruits, 3â€“5 vegetables) for adequate vitamins, minerals, and fiber.',
  },
  {
    question: 'Do I need supplements if I eat well?',
    answer:
      'Not always. A varied, whole-foods diet often provides sufficient vitamins. Some (vitamin D, B12 for vegans) may need supplementation.',
  },
  {
    question: 'How much sun exposure for vitamin D?',
    answer:
      '10â€“30 minutes of midday sun on arms/legs, 2â€“3 times per week, can support vitamin D synthesis. Darker skin or northern latitudes may need more.',
  },
  {
    question: 'What if I am vegan or vegetarian?',
    answer:
      'Focus on B12 (supplement or fortified foods), iron (legumes, leafy greens), and vitamin D. Consider a B-complex or multivitamin.',
  },
  {
    question: 'Can I overdo vitamins?',
    answer:
      'Yes. Fat-soluble vitamins (A, D, E, K) can accumulate. Water-soluble vitamins (B, C) are safer but very high doses can cause issues.',
  },
  {
    question: 'What are early signs of deficiency?',
    answer:
      'Fatigue, weakness, brittle nails, hair loss, poor wound healing, or mood changes can indicate deficiencies. See a doctor for evaluation.',
  },
  {
    question: 'Does cooking affect vitamins?',
    answer:
      'Some vitamins (C, B) are heat-sensitive. Eat a mix of raw and cooked vegetables to maximize intake.',
  },
  {
    question: 'Should I get blood tests?',
    answer:
      'If you have symptoms or risk factors (restricted diet, malabsorption, chronic illness), blood tests can confirm status and guide supplementation.',
  },
];

const relatedCalculators = [
  {
    name: 'Anti-Aging Nutrition Score Calculator',
    slug: 'anti-aging-nutrition-score-calculator',
    description: 'Assess overall nutrition patterns for longevity.',
  },
  {
    name: 'Vitamin D Sun Exposure Calculator',
    slug: 'electrolyte-replacement-calculator',
    description: 'Estimate vitamin D synthesis from sun exposure.',
  },
  {
    name: 'Electrolyte Balance Restoration Calculator',
    slug: 'electrolyte-balance-restoration-calculator',
    description: 'Balance minerals alongside vitamin status.',
  },
  {
    name: 'Blue Zone Lifestyle Score Calculator',
    slug: 'blue-zone-lifestyle-score-calculator',
    description: 'Check lifestyle patterns that support nutrient intake.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/vitamin-deficiency-risk-estimator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Vitamin Deficiency Risk Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Vitamin Deficiency Risk Estimator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate deficiency risk, vitamin score, and get targeted nutrition recommendations.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const fruitVegScore = clamp(values.fruitVegServings / 7 * 30, 0, 30); // 0-30 points
  const grainScore = clamp(values.wholeGrainsServings / 4 * 15, 0, 15); // 0-15 points
  const proteinScore = clamp(values.proteinSources / 3 * 15, 0, 15); // 0-15 points
  const dairyScore = clamp(values.dairyAlternatives / 2 * 10, 0, 10); // 0-10 points
  const sunScore = clamp(values.sunExposureMinutes / 20 * 15, 0, 15); // 0-15 points
  const supplementScore = clamp(values.supplementUse / 10 * 15, 0, 15); // 0-15 points
  
  const vitaminScore = fruitVegScore + grainScore + proteinScore + dairyScore + sunScore + supplementScore;
  const deficiencyRisk = clamp(100 - vitaminScore, 0, 100);

  let status: ResultPayload['status'] = 'low-risk';
  let interpretation =
    'In this simple pattern lens, your current food, sun, and supplement habits look broadly supportive for common vitamins.';

  if (deficiencyRisk > 30) {
    status = 'moderate-risk';
    interpretation =
      'This snapshot suggests there may be some gentle room to increase variety or frequency of nutrientâ€‘rich foods, or to explore supportive habits with a professional.';
  }
  if (deficiencyRisk > 50) {
    status = 'high-risk';
    interpretation =
      'Here, your entries point to a pattern that may be lighter on certain nutrient sources. It could be a good moment to focus on more nutrientâ€‘dense foods and to consider talking with a clinician about testing if you have concerns.';
  }

  const recommendations = [
    'When possible, you can lean toward more fruits and vegetables you enjoy to support a wider mix of vitamins.',
    'Including some wholeâ€‘grain choices and varied protein sources can gently boost many B vitamins and minerals.',
    'If it fits your life and is safe for you, a bit of regular daylight on skin can complement food and/or supplements for vitamin D.',
  ];
  if (status === 'moderate-risk') {
    recommendations.push('You might explore, with a professional, whether a simple multivitamin or specific nutrients (like B12 for vegans or D with low sun) feel appropriate.');
  }
  if (status === 'high-risk') {
    recommendations.push('If you have symptoms or worries, consider asking a healthcare provider about testing and tailored nutrition or supplement options.');
  }

  const plan = [
    { label: 'This Week', detail: 'Gently notice what you are already eating and how much daylight you tend to get, without judgment.' },
    { label: 'Next 2 Weeks', detail: 'If it feels realistic, add small, enjoyable boostsâ€”like an extra serving of produce or a slightly more varied protein or grain choice.' },
    { label: 'Ongoing', detail: 'If certain concerns or symptoms stay on your mind, you can bring this snapshot to a clinician for a more specific conversation.' },
  ];

  return { deficiencyRisk, vitaminScore, status, interpretation, recommendations, plan };
};

export default function VitaminDeficiencyRiskEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fruitVegServings: undefined,
      wholeGrainsServings: undefined,
      proteinSources: undefined,
      dairyAlternatives: undefined,
      sunExposureMinutes: undefined,
      supplementUse: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="vitamin-deficiency-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Vitamin Deficiency Risk Estimator
          </CardTitle>
          <CardDescription>Estimate deficiency risk, vitamin score, and get targeted nutrition recommendations.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your nutrition patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fruitVegServings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fruit/vegetable servings per day</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="wholeGrainsServings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Whole grain servings per day</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="proteinSources"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protein sources per day</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 2" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dairyAlternatives"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dairy/alternatives per day</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 2" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sunExposureMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sun exposure (minutes/day)</FormLabel>
                      <FormControl>
                        <Input type="number" step="5" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="supplementUse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplement use (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate risk
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
            <CardDescription>See deficiency risk, vitamin score, and targeted recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Deficiency risk</p>
                <p className="text-2xl font-semibold text-primary">{result.deficiencyRisk.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">A 0â€“100 pattern score in this model (lower means more nutrientâ€‘dense entries).</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Vitamin score</p>
                <p className="text-2xl font-semibold text-primary">{result.vitaminScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Combined view of your food, sun, and supplement pattern in this simple framework.</p>
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
          <p><strong>Vitamin score</strong> = fruitVegScore (0-30) + grainScore (0-15) + proteinScore (0-15) + dairyScore (0-10) + sunScore (0-15) + supplementScore (0-15), max 100.</p>
          <p><strong>Deficiency risk</strong> = 100 âˆ’ vitaminScore, clamped to 0-100.</p>
          <p>Higher fruit/vegetable intake, whole grains, protein, dairy, sun exposure, and supplements raise the score and lower risk.</p>
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
                <p className="text-sm text-muted-foreground">Fruit/veg adequacy</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().fruitVegServings ?? 0) / 7 * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Target: 5-9 servings</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sun exposure adequacy</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().sunExposureMinutes ?? 0) / 20 * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Target: 10-30 min/day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Supplement support</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().supplementUse ?? 0) / 10 * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">0-10 scale</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your nutrition patterns to see additional metrics.</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Complete guide snapshot</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Vitamin deficiency risk depends on dietary patterns, sun exposure, and supplementation. Common gaps include vitamin D, B12, folate, and iron.</p>
          <p>Use this calculator to assess risk, identify gaps, and plan targeted nutrition or supplementation strategies.</p>
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
          <p>This tool offers a simple snapshot of how your current eating pattern, sun exposure, and supplement use may relate to common vitamin needs.</p>
          <p>You can use the scores and ideas as gentle prompts for exploring food and lifestyle shifts, alongside any advice from qualified professionals.</p>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a
        medical or psychological diagnosis. For any health concerns, please consult a qualified professional.
      </p>
    </div>
  );
}

