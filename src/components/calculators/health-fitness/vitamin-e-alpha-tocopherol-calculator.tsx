'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield as ShieldIcon, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  alphaTocopherol: z.number({ invalid_type_error: 'Enter alpha-tocopherol' }).min(0).max(1000),
  gammaTocopherol: z.number({ invalid_type_error: 'Enter gamma-tocopherol' }).min(0).max(1000).optional(),
  otherTocopherols: z.number({ invalid_type_error: 'Enter other tocopherols' }).min(0).max(1000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  alphaTocopherol: number;
  gammaTocopherol: number;
  otherTocopherols: number;
  totalAlphaTocopherol: number;
  totalIU: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter alpha-tocopherol (mg) from food label or tracking.',
  'Optionally enter gamma-tocopherol (mg) if known.',
  'Optionally enter other tocopherols (mg) if known.',
  'Review total alpha-tocopherol equivalent, total IU, and recommendations.',
];

const faqs = [
  {
    question: 'What is alpha-tocopherol?',
    answer:
      'Alpha-tocopherol is the most biologically active form of vitamin E and the form used to establish vitamin E requirements. It has the highest vitamin E activity and is the primary form found in supplements.',
  },
  {
    question: 'What are tocopherols?',
    answer:
      'Tocopherols are forms of vitamin E: alpha, beta, gamma, and delta. Alpha-tocopherol has the highest biological activity. Natural alpha-tocopherol (d-alpha) is more active than synthetic (dl-alpha).',
  },
  {
    question: 'How is alpha-tocopherol equivalent calculated?',
    answer:
      'Alpha-tocopherol equivalent = alpha-tocopherol (mg) + gamma-tocopherol (mg) × 0.1 + other tocopherols (mg) × 0.05. Only alpha-tocopherol is fully counted; other forms have lower activity.',
  },
  {
    question: 'What are vitamin E requirements?',
    answer:
      'Recommended daily intake: Adults: 15 mg alpha-tocopherol (22.4 IU natural, 33.3 IU synthetic). Requirements are based on alpha-tocopherol equivalents. Individual needs may vary.',
  },
  {
    question: 'What are sources of vitamin E?',
    answer:
      'Vitamin E sources include nuts (almonds, hazelnuts), seeds (sunflower seeds), vegetable oils (wheat germ, sunflower), leafy greens, and fortified foods. Alpha-tocopherol is the primary active form.',
  },
  {
    question: 'What is the difference between natural and synthetic?',
    answer:
      'Natural alpha-tocopherol (d-alpha) has higher biological activity than synthetic (dl-alpha). 1 mg natural = 1.49 IU, 1 mg synthetic = 1.0 IU. Natural forms are generally preferred.',
  },
  {
    question: 'What about vitamin E deficiency?',
    answer:
      'Vitamin E deficiency is rare but can cause neurological problems, muscle weakness, and vision issues. Adequate intake from food sources typically prevents deficiency.',
  },
  {
    question: 'What about vitamin E supplements?',
    answer:
      'Vitamin E supplements may be beneficial for some, but excessive intake (upper limit: 1000 mg/day) can increase bleeding risk. Food sources are generally preferred. Consult healthcare provider before high-dose supplements.',
  },
  {
    question: 'Can I track alpha-tocopherol at home?',
    answer:
      'Yes. Use food databases to find alpha-tocopherol content. Many foods list vitamin E in IU or mg. Convert to alpha-tocopherol equivalents for accurate tracking.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if you have vitamin E deficiency concerns, are considering high-dose supplements, have bleeding disorders, or need personalized guidance on vitamin E intake.',
  },
];

const relatedCalculators = [
  {
    name: 'Vitamin A Retinol Equivalent Calculator',
    slug: 'vitamin-a-retinol-equivalent-calculator',
    description: 'Assess vitamin A alongside vitamin E.',
  },
  {
    name: 'Vitamin K Daily Needs Estimator',
    slug: 'vitamin-k-daily-needs-estimator',
    description: 'Evaluate fat-soluble vitamins comprehensively.',
  },
  {
    name: 'Oxidative Stress Index Calculator',
    slug: 'oxidative-stress-index-calculator',
    description: 'Assess oxidative stress that vitamin E addresses.',
  },
  {
    name: 'Nutrient Density to Calorie Ratio Calculator',
    slug: 'nutrient-density-to-calorie-ratio-calculator',
    description: 'Assess nutritional quality comprehensively.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/vitamin-e-alpha-tocopherol-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Vitamin E Alpha-Tocopherol Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Vitamin E Alpha-Tocopherol Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate vitamin E alpha-tocopherol equivalent from alpha-tocopherol, gamma-tocopherol, and other tocopherols.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const alphaTocopherol = values.alphaTocopherol;
  const gammaTocopherol = values.gammaTocopherol || 0;
  const otherTocopherols = values.otherTocopherols || 0;
  
  // Calculate total alpha-tocopherol equivalent
  // Alpha-tocopherol is fully counted, gamma has ~10% activity, others have ~5%
  const totalAlphaTocopherol = alphaTocopherol + (gammaTocopherol * 0.1) + (otherTocopherols * 0.05);
  
  // Calculate total IU (assuming natural alpha-tocopherol: 1 mg = 1.49 IU)
  const totalIU = alphaTocopherol * 1.49 + gammaTocopherol * 0.15 + otherTocopherols * 0.075;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your vitamin E intake appears adequate. Continue maintaining balanced intake from diverse sources.';

  if (totalAlphaTocopherol < 8) {
    status = 'low';
    interpretation = 'Your vitamin E intake is low. This may increase deficiency risk. Consider increasing intake from nuts, seeds, vegetable oils, and leafy greens to meet recommended levels (15 mg/day).';
  } else if (totalAlphaTocopherol < 12) {
    status = 'moderate';
    interpretation = 'Your vitamin E intake is moderate. Aim for recommended daily intake (15 mg alpha-tocopherol/day for adults) to ensure adequate vitamin E status and prevent deficiency.';
  } else if (totalAlphaTocopherol > 1000) {
    status = 'low';
    interpretation = 'Your vitamin E intake exceeds the upper limit (1000 mg/day). Excessive intake can increase bleeding risk. Consult a healthcare provider if taking high-dose supplements.';
  } else if (totalAlphaTocopherol >= 12 && totalAlphaTocopherol <= 20) {
    status = 'optimal';
    interpretation = 'Your vitamin E intake is within recommended range. Continue maintaining balanced intake from diverse sources to support optimal vitamin E status and antioxidant function.';
  } else {
    status = 'good';
    interpretation = 'Your vitamin E intake is good. Continue including vitamin E-rich foods in your diet to maintain adequate intake and support antioxidant protection.';
  }

  const recommendations = [
    'Include vitamin E-rich foods: consume nuts (almonds, hazelnuts), seeds (sunflower seeds), vegetable oils (wheat germ, sunflower), and leafy greens to meet recommended intake (15 mg alpha-tocopherol/day).',
    'Choose natural sources: vitamin E from food sources is generally preferred over supplements. Natural alpha-tocopherol has higher biological activity than synthetic forms.',
    'Balance intake: aim for recommended daily intake (15 mg alpha-tocopherol for adults) to support antioxidant function and prevent deficiency without exceeding upper limits.',
  ];
  if (status === 'low' && totalAlphaTocopherol < 12) {
    recommendations.push('Increase vitamin E intake through food sources. Include nuts, seeds, vegetable oils, and leafy greens to meet recommended levels and support antioxidant protection.');
  }
  if (totalAlphaTocopherol > 1000) {
    recommendations.push('Reduce vitamin E intake if from supplements. Excessive intake (upper limit: 1000 mg/day) can increase bleeding risk. Food sources are generally safer. Consult healthcare provider before high-dose supplements.');
  }
  if (alphaTocopherol === 0) {
    recommendations.push('Include alpha-tocopherol sources in your diet. Alpha-tocopherol is the most biologically active form of vitamin E and is essential for meeting vitamin E requirements.');
  }

  const plan = [
    { label: 'This Week', detail: 'Calculate vitamin E alpha-tocopherol equivalent for your foods. Assess intake and compare to recommended daily intake (15 mg alpha-tocopherol/day).' },
    { label: 'This Month', detail: 'Optimize vitamin E intake: include nuts, seeds, vegetable oils, and leafy greens to ensure adequate alpha-tocopherol intake and support antioxidant function.' },
    { label: 'Ongoing', detail: 'Monitor vitamin E intake through regular food assessment. Maintain recommended intake levels to prevent deficiency and support optimal antioxidant protection.' },
  ];

  return { alphaTocopherol, gammaTocopherol, otherTocopherols, totalAlphaTocopherol, totalIU, status, interpretation, recommendations, plan };
};

export default function VitaminEAlphaTocopherolCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      alphaTocopherol: undefined,
      gammaTocopherol: undefined,
      otherTocopherols: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="vitamin-e-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldIcon className="h-5 w-5" />
            Vitamin E Alpha-Tocopherol Calculator
          </CardTitle>
          <CardDescription>Calculate vitamin E alpha-tocopherol equivalent from alpha-tocopherol, gamma-tocopherol, and other tocopherols.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your vitamin E data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="alphaTocopherol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alpha-tocopherol (mg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gammaTocopherol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gamma-tocopherol (mg) (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="otherTocopherols"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other tocopherols (mg) (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 2" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate alpha-tocopherol equivalent
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
            <CardDescription>See total alpha-tocopherol equivalent, total IU, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Alpha-tocopherol</p>
                <p className="text-2xl font-semibold text-primary">{result.alphaTocopherol.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">mg</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total equivalent</p>
                <p className="text-2xl font-semibold text-primary">{result.totalAlphaTocopherol.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">mg alpha-tocopherol</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total IU</p>
                <p className="text-2xl font-semibold text-primary">{result.totalIU.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">International Units</p>
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
          <p>
            <strong>Alpha-tocopherol equivalent</strong> = alpha-tocopherol (mg) + gamma-tocopherol (mg) × 0.1 + other tocopherols (mg) × 0.05.
          </p>
          <p>
            <strong>Conversion factors</strong>: Alpha-tocopherol is fully counted (100% activity). Gamma-tocopherol has ~10% activity. Other tocopherols have ~5% activity. Only alpha-tocopherol meets vitamin E requirements.
          </p>
          <p>
            <strong>IU conversion</strong>: Natural alpha-tocopherol: 1 mg = 1.49 IU. Synthetic: 1 mg = 1.0 IU. This calculator assumes natural forms.
          </p>
          <p>
            <strong>Recommended intake</strong>: Adults: 15 mg alpha-tocopherol/day (22.4 IU natural). Upper limit: 1000 mg/day. Requirements are based on alpha-tocopherol equivalents.
          </p>
          <p>Alpha-tocopherol is the most biologically active form of vitamin E. Other tocopherols contribute minimally to vitamin E activity. Adequate alpha-tocopherol intake supports antioxidant function and prevents deficiency.</p>
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
                <p className="text-sm text-muted-foreground">Target intake</p>
                <p className="text-xl font-semibold text-primary">15 mg</p>
                <p className="text-xs text-muted-foreground">Alpha-tocopherol/day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Other forms contribution</p>
                <p className="text-xl font-semibold text-primary">
                  {((result.gammaTocopherol * 0.1 + result.otherTocopherols * 0.05) / result.totalAlphaTocopherol * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Of total equivalent</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Intake status</p>
                <p className="text-xl font-semibold text-primary">
                  {result.totalAlphaTocopherol >= 12 && result.totalAlphaTocopherol <= 20 ? 'Adequate' : result.totalAlphaTocopherol < 12 ? 'Low' : result.totalAlphaTocopherol > 1000 ? 'Excessive' : 'Good'}
                </p>
                <p className="text-xs text-muted-foreground">Based on intake</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your vitamin E data to see additional insights.</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Complete guide snapshot</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Alpha-tocopherol is the most biologically active form of vitamin E. Alpha-tocopherol equivalent = alpha-tocopherol + gamma-tocopherol × 0.1 + other tocopherols × 0.05. Recommended intake: 15 mg alpha-tocopherol/day for adults.</p>
          <p>Use this calculator to calculate vitamin E alpha-tocopherol equivalent from alpha-tocopherol, gamma-tocopherol, and other tocopherols.</p>
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
          <p>This tool calculates vitamin E alpha-tocopherol equivalent from alpha-tocopherol, gamma-tocopherol, and other tocopherols.</p>
          <p>Outputs include alpha-tocopherol, gamma-tocopherol, other tocopherols, total alpha-tocopherol equivalent, total IU, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

