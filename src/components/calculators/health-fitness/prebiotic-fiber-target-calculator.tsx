'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Moon, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  totalFiberIntake: z.number({ invalid_type_error: 'Enter total fiber intake' }).min(0).max(100),
  currentPrebioticIntake: z.number({ invalid_type_error: 'Enter current prebiotic intake' }).min(0).max(50).optional(),
  gutHealthGoal: z.enum(['maintenance', 'improve', 'digestive_issues'], { invalid_type_error: 'Select gut health goal' }),
  probioticUse: z.number({ invalid_type_error: 'Enter probiotic use rating' }).min(0).max(10).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  prebioticTarget: number;
  prebioticGap: number;
  prebioticPercentage: number;
  recommendedFoods: string[];
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your total daily fiber intake in grams.',
  'Enter your current daily prebiotic fiber intake in grams (optional).',
  'Select your gut health goal (maintenance, improve, or digestive issues).',
  'Optionally rate your probiotic use (0 = none, 10 = regular use).',
  'Review prebiotic fiber target, gap analysis, and food recommendations.',
];

const faqs = [
  {
    question: 'What are prebiotics?',
    answer:
      'Prebiotics are non-digestible fibers that feed beneficial gut bacteria. They selectively promote the growth and activity of beneficial bacteria (probiotics) in your gut, supporting digestive health and overall well-being.',
  },
  {
    question: 'What is the difference between fiber and prebiotic fiber?',
    answer:
      'All prebiotics are fiber, but not all fiber is prebiotic. Prebiotic fiber specifically feeds beneficial gut bacteria, while other fibers primarily add bulk. Common prebiotics include inulin, FOS, and GOS found in specific foods.',
  },
  {
    question: 'How much prebiotic fiber do I need?',
    answer:
      'Most adults should aim for 5-10 grams of prebiotic fiber daily. Higher amounts (10-15g) may benefit those with digestive issues or those taking probiotics. Prebiotics should make up about 20-30% of total fiber intake.',
  },
  {
    question: 'What foods are high in prebiotic fiber?',
    answer:
      'Rich sources include: garlic, onions, leeks, asparagus, bananas (especially slightly green), oats, barley, chicory root, Jerusalem artichokes, dandelion greens, and legumes. Many whole grains and fruits also contain prebiotic fibers.',
  },
  {
    question: 'Do I need prebiotics if I take probiotics?',
    answer:
      'Yes! Prebiotics feed the probiotic bacteria you consume, helping them survive and multiply in your gut. Combining probiotics with prebiotics (called synbiotics) is more effective than taking probiotics alone.',
  },
  {
    question: 'Can you eat too much prebiotic fiber?',
    answer:
      'Excessive prebiotic fiber (15g+) can cause digestive discomfort (gas, bloating) in some people, especially when increased suddenly. Gradually increase intake and monitor tolerance. Most people tolerate 5-10g daily well.',
  },
  {
    question: 'How quickly should I increase prebiotic intake?',
    answer:
      'Gradually increase prebiotic foods over 2-3 weeks to allow your gut to adjust. Start with small amounts (2-3g) and increase by 1-2g weekly until reaching your target. This minimizes digestive side effects.',
  },
  {
    question: 'Do prebiotics have other health benefits?',
    answer:
      'Yes. Beyond feeding beneficial bacteria, prebiotics can improve calcium absorption, support immune function, help regulate blood sugar, and promote feelings of fullness. They also support overall digestive health.',
  },
  {
    question: 'Are prebiotic supplements as good as food sources?',
    answer:
      'Prebiotic supplements can help meet targets, but food sources are preferred because they provide additional nutrients, other types of fiber, and phytochemicals. Supplements can complement dietary intake when needed.',
  },
  {
    question: 'What if I have digestive issues with prebiotics?',
    answer:
      'Some people (especially those with IBS) may be sensitive to certain prebiotics (FODMAPs). Start with lower amounts, choose FODMAP-friendly sources (oats, bananas), and increase gradually. Consider working with a dietitian if issues persist.',
  },
];

const relatedCalculators = [
  {
    name: 'Probiotic Daily Dose Wellness Guide',
    slug: 'probiotic-daily-dose-estimator',
    description: 'Get wellness insights about combining with prebiotics for synbiotic effect.',
  },
  {
    name: 'Gut Microbiome Diversity Wellness Score',
    slug: 'gut-microbiome-diversity-score-calculator',
    description: 'Get wellness insights about gut microbiome diversity.',
  },
  {
    name: 'Fiber Intake Calculator',
    slug: 'carbohydrate-intake-calculator',
    description: 'Calculate total fiber intake including prebiotics.',
  },
  {
    name: 'Antioxidant Diversity Wellness Index',
    slug: 'antioxidant-diversity-index-calculator',
    description: 'Get wellness insights about antioxidant diversity.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/prebiotic-fiber-target-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Prebiotic Fiber Wellness Target Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Prebiotic Fiber Wellness Target Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Get general wellness insights about prebiotic fiber target based on dietary fiber intake, gut wellness goals, and current consumption. This is a personal lifestyle insight, not a medical evaluation.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const totalFiber = values.totalFiberIntake;
  const currentPrebiotic = values.currentPrebioticIntake ?? 0;
  const gutHealthGoal = values.gutHealthGoal;
  const probioticUse = values.probioticUse ?? 0;
  
  // Calculate prebiotic target based on total fiber and goals
  // Prebiotics should be 20-30% of total fiber for maintenance
  let prebioticTarget: number;
  if (gutHealthGoal === 'maintenance') {
    prebioticTarget = totalFiber * 0.25; // 25% of total fiber
  } else if (gutHealthGoal === 'improve') {
    prebioticTarget = totalFiber * 0.30; // 30% of total fiber
  } else {
    // digestive_issues
    prebioticTarget = Math.max(10, totalFiber * 0.30); // Minimum 10g for digestive issues
  }
  
  // Adjust for probiotic use (if taking probiotics, prebiotics are more important)
  if (probioticUse >= 7) {
    prebioticTarget *= 1.2; // 20% increase
  } else if (probioticUse >= 4) {
    prebioticTarget *= 1.1; // 10% increase
  }
  
  // Minimum target: 5g, Maximum practical: 15g
  prebioticTarget = Math.max(5, Math.min(15, prebioticTarget));
  
  const prebioticGap = prebioticTarget - currentPrebiotic;
  const prebioticPercentage = totalFiber > 0 ? (currentPrebiotic / totalFiber) * 100 : 0;
  
  // Recommended foods based on gap
  const recommendedFoods: string[] = [];
  if (prebioticGap > 0) {
    if (prebioticGap <= 2) {
      recommendedFoods.push('1 medium banana', '1/2 cup oats', '1-2 cloves garlic');
    } else if (prebioticGap <= 5) {
      recommendedFoods.push('1-2 medium bananas', '1 cup oats', '1 small onion', '1/2 cup asparagus');
    } else {
      recommendedFoods.push('2 medium bananas', '1 cup oats', '1 small onion', '1/2 cup asparagus', '1 cup barley', '2-3 cloves garlic');
    }
  }
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'This suggests a general lifestyle tendency where your prebiotic fiber intake may meet or exceed suggestions for your gut wellness goals.';
  
  if (currentPrebiotic > 0) {
    if (currentPrebiotic >= prebioticTarget * 0.9) {
      status = 'optimal';
      interpretation = 'This suggests a general lifestyle tendency where your prebiotic fiber intake is excellent and may meet suggestions for supporting beneficial gut bacteria.';
    } else if (currentPrebiotic >= prebioticTarget * 0.7) {
      status = 'good';
      interpretation = 'This suggests a general lifestyle tendency where your prebiotic intake is good but could be slightly increased to fully meet suggestions.';
    } else if (currentPrebiotic >= prebioticTarget * 0.5) {
      status = 'moderate';
      interpretation = 'This suggests a general lifestyle tendency where your prebiotic intake is moderate. You may consider increasing prebiotic foods to support your beneficial gut bacteria.';
    } else {
      status = 'low';
      interpretation = 'This suggests a general lifestyle tendency where your prebiotic intake may be below suggestions. You may consider adding prebiotic-rich foods to feed beneficial gut bacteria.';
    }
  } else {
    status = 'low';
    interpretation = 'You may consider starting to incorporate prebiotic foods to support beneficial gut bacteria. Prebiotics feed the probiotics in your gut.';
  }
  
  const recommendations = [
    `Prebiotic fiber target: ${prebioticTarget.toFixed(1)}g daily (${((prebioticTarget / totalFiber) * 100).toFixed(0)}% of total fiber intake). This is a personal insight, not a medical evaluation.`,
    prebioticGap > 0
      ? `You may consider adding ${prebioticGap.toFixed(1)}g more prebiotic fiber daily. Add prebiotic-rich foods: ${recommendedFoods.slice(0, 3).join(', ')}.`
      : 'Your prebiotic intake meets or exceeds suggestions. You may consider continuing to include prebiotic foods regularly.',
    'You may consider including prebiotic foods daily: garlic, onions, bananas, oats, asparagus, leeks, barley, and chicory root. These may feed beneficial gut bacteria.',
    'If taking probiotics, you may consider ensuring adequate prebiotic intake to feed and support the probiotic bacteria in your gut (synbiotic effect).',
  ];
  
  if (totalFiber < 25) {
    recommendations.push(`Your total fiber intake (${totalFiber}g) may be below the suggested 25-35g daily. Increasing overall fiber intake may also help increase prebiotic fiber naturally.`);
  }
  
  if (gutHealthGoal === 'digestive_issues' && prebioticGap > 0) {
    recommendations.push('For digestive wellness, you may consider increasing prebiotic fiber gradually over 2-3 weeks to allow your gut to adjust. Start with smaller amounts and monitor tolerance.');
  }
  
  const plan = [
    { label: 'This Week', detail: `You may consider adding ${Math.min(prebioticGap, 3).toFixed(1)}g prebiotic fiber daily. Include 1-2 prebiotic foods (e.g., 1 banana, 1/2 cup oats). Start gradually if new to prebiotics.` },
    { label: 'This Month', detail: `You may consider building to ${prebioticTarget.toFixed(1)}g daily. Include diverse prebiotic sources (garlic, onions, bananas, oats, asparagus). Monitor digestive tolerance and adjust as needed.` },
    { label: 'Ongoing', detail: `You may consider maintaining ${prebioticTarget.toFixed(1)}g prebiotic fiber daily. Combine with probiotics for synbiotic effect. Rotate prebiotic foods for variety and to support different beneficial bacteria.` },
  ];
  
  return { prebioticTarget, prebioticGap, prebioticPercentage, recommendedFoods, status, interpretation, recommendations, plan };
};

export default function PrebioticFiberTargetCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      totalFiberIntake: undefined,
      currentPrebioticIntake: undefined,
      gutHealthGoal: undefined,
      probioticUse: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="prebiotic-fiber-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Prebiotic Fiber Wellness Target Calculator
          </CardTitle>
          <CardDescription>Get general wellness insights about prebiotic fiber target based on dietary fiber intake, gut wellness goals, and current consumption. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your prebiotic fiber data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="totalFiberIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total daily fiber intake (grams)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 25" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentPrebioticIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current prebiotic intake (grams, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gutHealthGoal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gut health goal</FormLabel>
                      <FormControl>
                        <select
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select gut health goal</option>
                          <option value="maintenance">Maintenance</option>
                          <option value="improve">Improve</option>
                          <option value="digestive_issues">Digestive Issues</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="probioticUse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Probiotic use (0-10, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate prebiotic target
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
            <CardDescription>See prebiotic fiber target, gap analysis, and food recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Prebiotic target</p>
                <p className="text-2xl font-semibold text-primary">{result.prebioticTarget.toFixed(1)}g</p>
                <p className="text-xs text-muted-foreground">Daily goal</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Current intake</p>
                <p className="text-2xl font-semibold text-primary">
                  {(form.getValues().currentPrebioticIntake ?? 0).toFixed(1)}g
                </p>
                <p className="text-xs text-muted-foreground">Per day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Gap to target</p>
                <p className="text-2xl font-semibold text-primary">
                  {result.prebioticGap > 0 ? `+${result.prebioticGap.toFixed(1)}g` : result.prebioticGap < 0 ? `${result.prebioticGap.toFixed(1)}g` : 'Met'}
                </p>
                <p className="text-xs text-muted-foreground">{result.prebioticGap > 0 ? 'Needed' : 'Status'}</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
            </div>
            {result.recommendedFoods.length > 0 && (
              <div className="p-4 border rounded">
                <p className="text-sm font-semibold mb-2">Recommended prebiotic foods:</p>
                <p className="text-sm text-muted-foreground">{result.recommendedFoods.join(', ')}</p>
              </div>
            )}
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
            <strong>Prebiotic target</strong> = Total fiber × Prebiotic percentage + Adjustment for probiotics + Goal adjustment.
          </p>
          <p>
            <strong>Prebiotic percentage</strong>: Maintenance = 25% of total fiber, Improve = 30% of total fiber, Digestive issues = 30% (minimum 10g).
          </p>
          <p>
            <strong>Probiotic adjustment</strong>: Regular probiotic use (rating ≥7) = +20% target, Moderate use (rating ≥4) = +10% target.
          </p>
          <p>
            <strong>Target range</strong>: Minimum 5g daily, maximum practical 15g daily. Prebiotics should make up 20-30% of total fiber intake.
          </p>
          <p>Prebiotic fiber specifically feeds beneficial gut bacteria. Adequate prebiotic intake supports probiotic bacteria and promotes a healthy, diverse gut microbiome.</p>
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
                <p className="text-sm text-muted-foreground">Prebiotic percentage</p>
                <p className="text-xl font-semibold text-primary">{result.prebioticPercentage.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Of total fiber</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Target range</p>
                <p className="text-xl font-semibold text-primary">5-15g/day</p>
                <p className="text-xs text-muted-foreground">Recommended daily</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Synbiotic benefit</p>
                <p className="text-xl font-semibold text-primary">
                  {(() => {
                    const probioticUse = form.getValues().probioticUse ?? 0;
                    return probioticUse >= 4 ? 'Enhanced' : 'Standard';
                  })()}
                </p>
                <p className="text-xs text-muted-foreground">With probiotics</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your prebiotic fiber data to see additional insights.</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Complete guide snapshot</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Prebiotic fiber is non-digestible fiber that feeds beneficial gut bacteria. Unlike general fiber, prebiotics selectively promote the growth of beneficial bacteria (probiotics) in your gut, supporting digestive health and overall well-being.</p>
          <p>Use this calculator to determine your prebiotic fiber target based on total fiber intake, gut health goals, and probiotic use, and receive recommendations for prebiotic-rich foods to include in your diet.</p>
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
          <p>This tool provides general wellness insights about prebiotic fiber target based on dietary fiber intake, gut wellness goals, and current consumption. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include prebiotic fiber target, gap analysis, prebiotic percentage of total fiber, suggested foods, status, recommendations, an action plan, and supporting metrics.</p>
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

