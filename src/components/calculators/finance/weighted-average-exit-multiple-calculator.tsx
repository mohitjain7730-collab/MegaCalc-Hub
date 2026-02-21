'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  exitMultiple1: z.number({ invalid_type_error: 'Enter exit multiple 1' }).min(0),
  weight1: z.number({ invalid_type_error: 'Enter weight 1' }).min(0).max(100),
  exitMultiple2: z.number({ invalid_type_error: 'Enter exit multiple 2' }).min(0).optional(),
  weight2: z.number({ invalid_type_error: 'Enter weight 2' }).min(0).max(100).optional(),
  exitMultiple3: z.number({ invalid_type_error: 'Enter exit multiple 3' }).min(0).optional(),
  weight3: z.number({ invalid_type_error: 'Enter weight 3' }).min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  exitMultiple1: number;
  weight1: number;
  exitMultiple2?: number;
  weight2?: number;
  exitMultiple3?: number;
  weight3?: number;
  weightedAverageMultiple: number;
  totalWeight: number;
  interpretation: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter exit multiple 1 and its weight (required).',
  'Optionally enter exit multiple 2 and weight 2.',
  'Optionally enter exit multiple 3 and weight 3.',
  'Review weighted average exit multiple calculation.',
];

const faqs = [
  {
    question: 'What is weighted average exit multiple?',
    answer:
      'Weighted average exit multiple is an exit multiple calculated by weighting multiple exit multiples based on their relative importance or relevance. It provides a more representative multiple by considering multiple sources, with weights reflecting the significance of each multiple in the analysis.',
  },
  {
    question: 'How is weighted average exit multiple calculated?',
    answer:
      'Weighted Average = Sum(Multiple_i * Weight_i) / Sum(Weights). Each exit multiple is multiplied by its weight, and the sum of these weighted multiples is divided by the sum of all weights. Weights should typically sum to 100% or 1.0, but the formula normalizes if they don\'t.',
  },
  {
    question: 'What are exit multiples?',
    answer:
      'Exit multiples are valuation multiples (typically EV/EBITDA, EV/Revenue, EV/EBIT) applied to terminal year financial metrics to estimate terminal value. They reflect how the market values similar companies and are derived from comparable company analysis or precedent transactions.',
  },
  {
    question: 'How do I assign weights to exit multiples?',
    answer:
      'Assign weights based on: relevance of comparable companies (more similar companies get higher weights), recency of transactions (more recent transactions get higher weights), quality of data (more reliable multiples get higher weights), number of comparables (larger sample sizes get higher weights), and analyst judgment on market conditions.',
  },
  {
    question: 'Should weights sum to 100%?',
    answer:
      'Weights don\'t need to sum to exactly 100% - the formula normalizes by dividing by the sum of weights. However, using weights that sum to 100% makes interpretation clearer and is more intuitive. Some analysts prefer weights that sum to 1.0 (decimal form) for mathematical consistency.',
  },
  {
    question: 'What if I have more than 3 exit multiples?',
    answer:
      'If you have more than 3 exit multiples, you can calculate weighted averages manually or use spreadsheet software. The calculator can handle 1-3 multiples efficiently. For more multiples, consider grouping similar ones or using the most relevant ones, or calculate weighted average manually using the same formula pattern.',
  },
  {
    question: 'How do I use weighted average exit multiple?',
    answer:
      'Use the weighted average exit multiple to calculate terminal value: Terminal Value = Final Year Financial Metric * Weighted Average Exit Multiple. This provides a more robust terminal value estimate by incorporating multiple perspectives rather than relying on a single multiple.',
  },
  {
    question: 'Should I use weighted average or simple average?',
    answer:
      'Weighted average is preferred when multiples have different levels of relevance or reliability. If all multiples are equally relevant, simple average is fine. Weighted average is more sophisticated and allows you to emphasize more relevant or recent multiples, providing a more accurate representation.',
  },
  {
    question: 'How do I validate the weighted average?',
    answer:
      'Validate weighted average by: comparing to simple average (should be similar if weights are balanced), checking individual multiples for outliers, ensuring weights reflect actual relevance, comparing to industry benchmarks, and performing sensitivity analysis by adjusting weights to see impact on terminal value.',
  },
  {
    question: 'What if weights are subjective?',
    answer:
      'Weights are often subjective and require analyst judgment. Document your rationale for weight assignments. Perform sensitivity analysis to see how changes in weights affect the weighted average. Consider using equal weights if you can\'t justify different weights, or use a range of weight scenarios to assess impact.',
  },
];

const relatedCalculators = [
  {
    name: 'Terminal Value (Exit Multiple) Calculator',
    slug: 'terminal-value-exit-multiple-calculator',
    description: 'Calculate terminal value using exit multiples.',
  },
  {
    name: 'Terminal Value (Gordon Growth) Calculator',
    slug: 'terminal-value-gordon-growth-calculator',
    description: 'Calculate terminal value using Gordon Growth Model.',
  },
  {
    name: 'Comparable Company (Trading Multiples) Valuation Calculator',
    slug: 'comparable-company-trading-multiples-valuation-calculator',
    description: 'Calculate comparable company multiples.',
  },
  {
    name: 'Precedent Transaction Valuation Calculator',
    slug: 'precedent-transaction-valuation-calculator',
    description: 'Calculate precedent transaction multiples.',
  },
];

const baseUrl = 'https://mycalculating.com/category/finance/weighted-average-exit-multiple-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Weighted Average Exit Multiple Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Weighted Average Exit Multiple Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate weighted average exit multiple by weighting multiple exit multiples based on their relative importance or relevance.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const exitMultiple1 = values.exitMultiple1;
  const weight1 = values.weight1;
  const exitMultiple2 = values.exitMultiple2;
  const weight2 = values.weight2;
  const exitMultiple3 = values.exitMultiple3;
  const weight3 = values.weight3;
  
  // Calculate weighted sum and total weight
  let weightedSum = exitMultiple1 * weight1;
  let totalWeight = weight1;
  
  if (exitMultiple2 && weight2) {
    weightedSum += exitMultiple2 * weight2;
    totalWeight += weight2;
  }
  
  if (exitMultiple3 && weight3) {
    weightedSum += exitMultiple3 * weight3;
    totalWeight += weight3;
  }
  
  // Weighted Average = Sum(Multiple * Weight) / Sum(Weights)
  const weightedAverageMultiple = totalWeight > 0 ? weightedSum / totalWeight : 0;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = '';
  
  if (totalWeight === 0) {
    status = 'low';
    interpretation = 'No valid weights entered.';
  } else {
    const numMultiples = 1 + (exitMultiple2 && weight2 ? 1 : 0) + (exitMultiple3 && weight3 ? 1 : 0);
    interpretation = `Weighted average exit multiple: ${weightedAverageMultiple.toFixed(2)}x based on ${numMultiples} multiple(s) with total weight of ${totalWeight}%.`;
    
    if (Math.abs(totalWeight - 100) > 5) {
      status = 'good';
      interpretation += ' Note: Weights do not sum to 100% (formula normalizes).';
    } else {
      status = 'optimal';
    }
  }

  const recommendations: string[] = [];
  
  if (totalWeight === 0) {
    recommendations.push('CRITICAL: No valid weights entered - Enter at least one exit multiple with its corresponding weight to calculate weighted average.');
  } else {
    recommendations.push(`Weighted average calculation: ${weightedAverageMultiple.toFixed(2)}x calculated from ${1 + (exitMultiple2 && weight2 ? 1 : 0) + (exitMultiple3 && weight3 ? 1 : 0)} exit multiple(s). The weighted average incorporates multiple perspectives, with weights reflecting the relative importance of each multiple.`);
    
    if (Math.abs(totalWeight - 100) > 5) {
      recommendations.push(`Weight normalization: Total weight is ${totalWeight}% (not 100%). The formula normalizes by dividing by total weight, so this is mathematically valid. However, weights summing to 100% make interpretation clearer. Consider adjusting weights to sum to 100% for better clarity.`);
    }
    
    const numMultiples = 1 + (exitMultiple2 && weight2 ? 1 : 0) + (exitMultiple3 && weight3 ? 1 : 0);
    if (numMultiples === 1) {
      recommendations.push('Consider using multiple multiples: Using multiple exit multiples with appropriate weights provides more robust terminal value estimates by incorporating different perspectives. Add additional multiples if available to improve accuracy.');
    } else {
      recommendations.push(`Multiple perspectives: Using ${numMultiples} exit multiples provides triangulation and reduces reliance on a single multiple. Ensure weights reflect actual relevance - higher weights for more relevant, recent, or reliable multiples.`);
    }
    
    recommendations.push('Application: Use the weighted average exit multiple to calculate terminal value: Terminal Value = Final Year Financial Metric * Weighted Average Exit Multiple. This weighted average provides a more robust estimate than a single multiple or simple average.');
  }
  
  recommendations.push('Validation: Compare weighted average to simple average to validate. Check for outliers in individual multiples. Ensure weights reflect actual relevance. Perform sensitivity analysis by adjusting weights to assess impact on terminal value.');

  const plan = [
    { label: 'This Week', detail: `Calculate weighted average exit multiple: ${weightedAverageMultiple.toFixed(2)}x based on ${1 + (exitMultiple2 && weight2 ? 1 : 0) + (exitMultiple3 && weight3 ? 1 : 0)} multiple(s). Document weight assignments and rationale.` },
    { label: 'This Month', detail: 'Use weighted average to calculate terminal value. Compare to simple average and individual multiples to validate. Perform sensitivity analysis by adjusting weights to assess impact on terminal value. Ensure weights reflect actual relevance of multiples.' },
    { label: 'Ongoing', detail: 'Update exit multiples and weights as market conditions change or new comparable data becomes available. Regularly validate weighted average against industry benchmarks and perform sensitivity analysis to understand valuation impact.' },
  ];

  return { exitMultiple1, weight1, exitMultiple2, weight2, exitMultiple3, weight3, weightedAverageMultiple, totalWeight, interpretation, status, recommendations, plan };
};

export default function WeightedAverageExitMultipleCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      exitMultiple1: undefined,
      weight1: undefined,
      exitMultiple2: undefined,
      weight2: undefined,
      exitMultiple3: undefined,
      weight3: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="weighted-average-exit-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Weighted Average Exit Multiple Calculator
          </CardTitle>
          <CardDescription>Calculate weighted average exit multiple by weighting multiple exit multiples based on their relative importance or relevance.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your exit multiples and weights</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="exitMultiple1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exit Multiple 1</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 8.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="weight1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight 1 (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 50" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="exitMultiple2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exit Multiple 2 (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 7.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="weight2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight 2 (%) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 30" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="exitMultiple3"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exit Multiple 3 (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 9.0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="weight3"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight 3 (%) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 20" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Weighted Average
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
            <CardDescription>See weighted average exit multiple calculation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Weighted Average Multiple</p>
                <p className="text-2xl font-semibold text-primary">{result.weightedAverageMultiple.toFixed(2)}x</p>
                <p className="text-xs text-muted-foreground">Weighted average</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total Weight</p>
                <p className="text-2xl font-semibold text-primary">{result.totalWeight.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Sum of weights</p>
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
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
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
            <strong>Weighted Average Exit Multiple</strong> = Sum(Exit Multiple_i * Weight_i) / Sum(Weights)
          </p>
          <p>Example with 3 multiples:</p>
          <p>
            <strong>Weighted Average</strong> = (Multiple1 * Weight1 + Multiple2 * Weight2 + Multiple3 * Weight3) / (Weight1 + Weight2 + Weight3)
          </p>
          <p>The weighted average exit multiple calculates a representative exit multiple by weighting multiple exit multiples based on their relative importance or relevance. Weights reflect the significance of each multiple in the analysis. The formula normalizes by dividing by the sum of weights, so weights don\'t need to sum to exactly 100%, though 100% makes interpretation clearer.</p>
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
                <p className="text-sm text-muted-foreground">Multiple 1 Contribution</p>
                <p className="text-xl font-semibold text-primary">{(result.exitMultiple1 * result.weight1).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Multiple * Weight</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Multiples Used</p>
                <p className="text-xl font-semibold text-primary">
                  {1 + (result.exitMultiple2 && result.weight2 ? 1 : 0) + (result.exitMultiple3 && result.weight3 ? 1 : 0)}
                </p>
                <p className="text-xs text-muted-foreground">Number of multiples</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Weight Sum Check</p>
                <p className="text-xl font-semibold text-primary">{result.totalWeight.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">{Math.abs(result.totalWeight - 100) < 5 ? 'Normalized' : 'Needs normalization'}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your exit multiples and weights to see additional insights.</p>
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
                <Link href={`/finance/${calc.slug}`} className="text-primary hover:underline">
                  {calc.name}
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">{calc.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-white dark:bg-gray-900 p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="name" content="The Complete Guide to Weighted Average Exit Multiple: Multi-Perspective Terminal Value Estimation" />
        <meta itemProp="description" content="An in-depth guide on calculating weighted average exit multiple by weighting multiple exit multiples based on their relative importance." />
        <meta itemProp="keywords" content="weighted average exit multiple, exit multiple, terminal value, valuation multiple, weighted average" />
        <meta itemProp="author" content="[Your Site's Finance Team]" />
        <meta itemProp="datePublished" content="2025-12-02" />
        <meta itemProp="url" content="/finance/weighted-average-exit-multiple-calculator" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Weighted Average Exit Multiple: Multi-Perspective Terminal Value Estimation</h1>
        <p className="text-lg italic text-gray-700 dark:text-gray-300">A comprehensive look at calculating weighted average exit multiple by weighting multiple exit multiples based on their relative importance or relevance.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600 dark:text-blue-400">
          <li><a href="#basics" className="hover:underline">Understanding Weighted Average Exit Multiple</a></li>
          <li><a href="#calculation" className="hover:underline">Calculation Method</a></li>
          <li><a href="#weights" className="hover:underline">Weight Assignment</a></li>
          <li><a href="#application" className="hover:underline">Practical Application</a></li>
          <li><a href="#validation" className="hover:underline">Validation and Best Practices</a></li>
        </ul>
        <hr className="my-6" />

        <h2 id="basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding Weighted Average Exit Multiple</h2>
        <p>Weighted average exit multiple provides a representative exit multiple by incorporating multiple perspectives with appropriate weights.</p>

        <hr className="my-6" />

        <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculation Method</h2>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
          <p className="font-mono text-lg"><strong>Weighted Average = Sum(Multiple_i * Weight_i) / Sum(Weights)</strong></p>
        </div>

        <hr className="my-6" />

        <h2 id="weights" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Weight Assignment</h2>
        <p>Assign weights based on relevance, recency, data quality, and sample size of comparables.</p>

        <hr className="my-6" />

        <h2 id="application" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Practical Application</h2>
        <p>Use weighted average exit multiple to calculate terminal value for DCF analysis.</p>

        <hr className="my-6" />

        <h2 id="validation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Validation and Best Practices</h2>
        <p>Validate by comparing to simple average, checking for outliers, and performing sensitivity analysis.</p>

        <hr className="my-6" />

        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Weighted average exit multiple provides a more robust approach to terminal value estimation by incorporating multiple exit multiples with appropriate weights. This method allows analysts to emphasize more relevant, recent, or reliable multiples while still considering multiple perspectives. Proper weight assignment and validation are essential for accurate terminal value estimates.</p>
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
          <p>This tool calculates weighted average exit multiple by weighting multiple exit multiples based on their relative importance or relevance.</p>
          <p>Outputs include weighted average multiple, total weight, interpretation, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}



