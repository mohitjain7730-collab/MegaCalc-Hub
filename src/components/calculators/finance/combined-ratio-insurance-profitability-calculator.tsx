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
  incurredLosses: z.number({ invalid_type_error: 'Enter incurred losses' }).min(0),
  lossAdjustmentExpenses: z.number({ invalid_type_error: 'Enter loss adjustment expenses' }).min(0),
  underwritingExpenses: z.number({ invalid_type_error: 'Enter underwriting expenses' }).min(0),
  earnedPremiums: z.number({ invalid_type_error: 'Enter earned premiums' }).min(0),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  incurredLosses: number;
  lossAdjustmentExpenses: number;
  underwritingExpenses: number;
  earnedPremiums: number;
  lossRatio: number;
  expenseRatio: number;
  combinedRatio: number;
  underwritingProfit: number;
  underwritingProfitMargin: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter incurred losses (total amount paid out in claims, including reserves).',
  'Enter loss adjustment expenses (costs of investigating and settling claims).',
  'Enter underwriting expenses (commissions, administrative costs, etc.).',
  'Enter earned premiums (portion of premiums corresponding to elapsed coverage period).',
  'Review combined ratio, loss ratio, expense ratio, and underwriting profitability.',
];

const faqs = [
  {
    question: 'What is combined ratio?',
    answer:
      'Combined ratio is a key metric in insurance that assesses underwriting profitability by comparing incurred losses and expenses to earned premiums. Formula: Combined Ratio = Loss Ratio + Expense Ratio. A combined ratio below 100% indicates underwriting profit, while above 100% indicates underwriting loss.',
  },
  {
    question: 'What is loss ratio?',
    answer:
      'Loss ratio represents the percentage of earned premiums paid out as claims. Formula: Loss Ratio = (Incurred Losses + Loss Adjustment Expenses) / Earned Premiums × 100. Lower loss ratios indicate better claims performance.',
  },
  {
    question: 'What is expense ratio?',
    answer:
      'Expense ratio indicates the percentage of earned premiums used to cover underwriting expenses, such as commissions and administrative costs. Formula: Expense Ratio = Underwriting Expenses / Earned Premiums × 100. Lower expense ratios indicate better operational efficiency.',
  },
  {
    question: 'What is a good combined ratio?',
    answer:
      'A combined ratio below 100% indicates underwriting profit. Industry benchmarks vary: property insurance typically 85-95%, liability insurance 90-100%, workers compensation 95-105%. Lower combined ratios indicate better profitability.',
  },
  {
    question: 'What does combined ratio above 100% mean?',
    answer:
      'A combined ratio above 100% indicates underwriting losses. The insurer is spending more on claims and expenses than it is earning in premiums. This requires immediate attention to pricing, expenses, or claims management.',
  },
  {
    question: 'How is underwriting profit calculated?',
    answer:
      'Underwriting profit is calculated as: Underwriting Profit = Earned Premiums × (100% - Combined Ratio) / 100. For example, if earned premiums are $1,000,000 and combined ratio is 95%, underwriting profit is $50,000 (5% of premiums).',
  },
  {
    question: 'What affects combined ratio?',
    answer:
      'Combined ratio is affected by: loss ratio (claims experience), expense ratio (operational efficiency), pricing adequacy, underwriting quality, reserve adequacy, and market conditions. Both components must be managed to achieve profitability.',
  },
  {
    question: 'How do I improve combined ratio?',
    answer:
      'Improve combined ratio by: reducing loss ratio (better pricing, underwriting, claims management), reducing expense ratio (operational efficiency, cost control), or both. Target both components for optimal profitability.',
  },
  {
    question: 'What is the difference between loss ratio and combined ratio?',
    answer:
      'Loss ratio measures only claims costs relative to premiums, while combined ratio includes both claims costs (loss ratio) and operating expenses (expense ratio). Combined ratio provides a complete picture of underwriting profitability.',
  },
  {
    question: 'How often should combined ratio be reviewed?',
    answer:
      'Combined ratio should be reviewed regularly (monthly, quarterly, or annually) to monitor underwriting profitability. Trends in combined ratio help identify issues early and guide pricing and expense management decisions.',
  },
];

const relatedCalculators = [
  {
    name: 'Loss Ratio Calculator',
    slug: 'loss-ratio-calculator',
    description: 'Calculate insurance loss ratio.',
  },
  {
    name: 'Insurance Reserve Requirement Calculator',
    slug: 'insurance-reserve-requirement-calculator',
    description: 'Calculate insurance reserve requirements.',
  },
  {
    name: 'Expected Loss (Insurance Risk) Calculator',
    slug: 'expected-loss-insurance-risk-calculator',
    description: 'Calculate expected loss from insurance risk.',
  },
  {
    name: 'Probability of Claim Impact Calculator',
    slug: 'probability-of-claim-impact-calculator',
    description: 'Calculate probability of claim impact.',
  },
];

const baseUrl = 'https://mycalculating.com/category/finance/combined-ratio-insurance-profitability-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Combined Ratio (Insurance Profitability) Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Combined Ratio (Insurance Profitability) Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate combined ratio for insurance profitability by combining loss ratio and expense ratio to assess underwriting performance.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const incurredLosses = values.incurredLosses;
  const lossAdjustmentExpenses = values.lossAdjustmentExpenses;
  const underwritingExpenses = values.underwritingExpenses;
  const earnedPremiums = values.earnedPremiums;

  // Loss Ratio = (Incurred Losses + Loss Adjustment Expenses) / Earned Premiums × 100
  const lossRatio = earnedPremiums > 0 ? ((incurredLosses + lossAdjustmentExpenses) / earnedPremiums) * 100 : 0;

  // Expense Ratio = Underwriting Expenses / Earned Premiums × 100
  const expenseRatio = earnedPremiums > 0 ? (underwritingExpenses / earnedPremiums) * 100 : 0;

  // Combined Ratio = Loss Ratio + Expense Ratio
  const combinedRatio = lossRatio + expenseRatio;

  // Underwriting Profit = Earned Premiums × (100% - Combined Ratio) / 100
  const underwritingProfit = earnedPremiums * ((100 - combinedRatio) / 100);

  // Underwriting Profit Margin = (100% - Combined Ratio)
  const underwritingProfitMargin = 100 - combinedRatio;

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Combined ratio calculated. A combined ratio below 100% indicates underwriting profit, while above 100% indicates underwriting loss.';

  if (combinedRatio > 100) {
    status = 'low';
    interpretation = 'Combined ratio above 100% indicates underwriting losses. The insurer is spending more on claims and expenses than it is earning in premiums. Immediate attention to pricing, expenses, or claims management is required.';
  } else if (combinedRatio > 95) {
    status = 'moderate';
    interpretation = 'Combined ratio between 95-100% indicates marginal underwriting profitability. Premiums barely exceed claims and expenses, leaving minimal profit margin. Consider improving loss ratio or expense ratio to enhance profitability.';
  } else if (combinedRatio > 90) {
    status = 'good';
    interpretation = 'Combined ratio between 90-95% indicates moderate underwriting profitability. This is typical for many insurance lines. Monitor trends and maintain pricing and expense discipline to preserve profitability.';
  } else {
    status = 'optimal';
    interpretation = 'Combined ratio below 90% indicates strong underwriting profitability. Premiums significantly exceed claims and expenses, providing healthy profit margin. This is excellent performance for most insurance lines.';
  }

  const recommendations = [
    `Combined Ratio: ${combinedRatio.toFixed(2)}%. ${combinedRatio < 100 ? 'Combined ratio below 100% indicates underwriting profit. Premiums exceed claims and expenses, providing profit margin.' : 'Combined ratio above 100% indicates underwriting losses. Premiums are insufficient to cover claims and expenses.'}`,
    `Loss Ratio: ${lossRatio.toFixed(2)}%. This represents the percentage of earned premiums paid out as claims. ${lossRatio < 70 ? 'Low loss ratio indicates excellent claims performance.' : lossRatio < 90 ? 'Moderate loss ratio indicates typical claims performance.' : 'High loss ratio indicates adverse claims experience.'}`,
    `Expense Ratio: ${expenseRatio.toFixed(2)}%. This represents the percentage of earned premiums used for underwriting expenses. ${expenseRatio < 25 ? 'Low expense ratio indicates excellent operational efficiency.' : expenseRatio < 35 ? 'Moderate expense ratio indicates typical operational efficiency.' : 'High expense ratio indicates operational inefficiency.'}`,
  ];
  if (combinedRatio > 100) {
    recommendations.push('Combined ratio above 100% requires immediate attention. Consider: increasing premiums to improve pricing adequacy, reducing expenses through operational efficiency, improving claims management, or reviewing underwriting quality.');
  } else if (combinedRatio > 95) {
    recommendations.push('Marginal combined ratio suggests both loss ratio and expense ratio need attention. Focus on: improving pricing adequacy, reducing claims costs, controlling expenses, and maintaining underwriting discipline.');
  } else {
    recommendations.push(`Underwriting Profit: $${underwritingProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })} (${underwritingProfitMargin.toFixed(2)}% margin). Strong combined ratio indicates good profitability. Continue monitoring trends and maintain pricing and expense discipline.`);
  }

  const plan = [
    { label: 'This Week', detail: `Review combined ratio: ${combinedRatio.toFixed(2)}% (Loss: ${lossRatio.toFixed(2)}%, Expense: ${expenseRatio.toFixed(2)}%). Assess underwriting profitability and compare to industry benchmarks.` },
    { label: 'This Month', detail: 'Analyze components: review loss ratio trends (claims experience) and expense ratio trends (operational efficiency). If combined ratio exceeds target, develop action plan to address loss ratio, expense ratio, or both.' },
    { label: 'Ongoing', detail: 'Monitor combined ratio regularly (monthly, quarterly, or annually). Track trends over time, compare to industry benchmarks, and adjust pricing and expense management strategies to maintain target combined ratio below 100%.' },
  ];

  return {
    incurredLosses,
    lossAdjustmentExpenses,
    underwritingExpenses,
    earnedPremiums,
    lossRatio,
    expenseRatio,
    combinedRatio,
    underwritingProfit,
    underwritingProfitMargin,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function CombinedRatioInsuranceProfitabilityCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      incurredLosses: undefined,
      lossAdjustmentExpenses: undefined,
      underwritingExpenses: undefined,
      earnedPremiums: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="combined-ratio-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Combined Ratio (Insurance Profitability) Calculator
          </CardTitle>
          <CardDescription>Calculate combined ratio for insurance profitability by combining loss ratio and expense ratio to assess underwriting performance.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="incurredLosses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Incurred Losses ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 500000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lossAdjustmentExpenses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loss Adjustment Expenses ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 50000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="underwritingExpenses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Underwriting Expenses ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 200000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="earnedPremiums"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Earned Premiums ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 1000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate combined ratio
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
            <CardDescription>See combined ratio, loss ratio, expense ratio, and underwriting profitability assessment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Combined Ratio</p>
                <p className="text-2xl font-semibold text-primary">{result.combinedRatio.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">Loss + Expense</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Loss Ratio</p>
                <p className="text-2xl font-semibold text-primary">{result.lossRatio.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">Of earned premiums</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Expense Ratio</p>
                <p className="text-2xl font-semibold text-primary">{result.expenseRatio.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">Of earned premiums</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Underwriting Profit</p>
                <p className="text-2xl font-semibold text-primary">{result.underwritingProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground">$</p>
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
            <strong>Loss Ratio</strong> = (Incurred Losses + Loss Adjustment Expenses) / Earned Premiums × 100. The percentage of earned premiums paid out as claims.
          </p>
          <p>
            <strong>Expense Ratio</strong> = Underwriting Expenses / Earned Premiums × 100. The percentage of earned premiums used to cover underwriting expenses (commissions, administrative costs, etc.).
          </p>
          <p>
            <strong>Combined Ratio</strong> = Loss Ratio + Expense Ratio. The sum of loss ratio and expense ratio, representing total costs relative to earned premiums.
          </p>
          <p>
            <strong>Underwriting Profit</strong> = Earned Premiums × (100% - Combined Ratio) / 100. The profit from underwriting operations when combined ratio is below 100%.
          </p>
          <p>
            <strong>Underwriting Profit Margin</strong> = 100% - Combined Ratio. The profit margin as a percentage of earned premiums.
          </p>
          <p>Combined ratio is a key metric for assessing underwriting profitability. A combined ratio below 100% indicates underwriting profit, while above 100% indicates underwriting loss. Both loss ratio and expense ratio must be managed to achieve profitability.</p>
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
                <p className="text-sm text-muted-foreground">Profit Margin</p>
                <p className="text-xl font-semibold text-primary">
                  {result.underwritingProfitMargin.toFixed(2)}%
                </p>
                <p className="text-xs text-muted-foreground">Of earned premiums</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total Costs</p>
                <p className="text-xl font-semibold text-primary">
                  ${(result.incurredLosses + result.lossAdjustmentExpenses + result.underwritingExpenses).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground">Claims + Expenses</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-xl font-semibold text-primary capitalize">{result.status}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your information to see additional insights.</p>
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
                <Link href={`/category/finance/${calc.slug}`} className="text-primary hover:underline">
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
        itemType="https://schema.org/FinancialProduct"
      >
    <meta itemProp="name" content="The Definitive Guide to Combined Ratio: Assessing Insurance Underwriting Profitability" />
    <meta itemProp="description" content="A comprehensive guide to calculating and interpreting combined ratio, the key metric for assessing insurance underwriting profitability by combining loss ratio and expense ratio." />
    <meta itemProp="keywords" content="combined ratio, insurance profitability, loss ratio, expense ratio, underwriting profit, insurance metrics, insurance performance, underwriting performance" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-01-02" />
    <meta itemProp="url" content="/definitive-combined-ratio-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Combined Ratio: Assessing Insurance Underwriting Profitability</h1>
    <p className="text-lg italic text-gray-700">A comprehensive guide to understanding and calculating combined ratio, the most critical metric for evaluating insurance underwriting profitability by combining loss ratio and expense ratio.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#overview" className="hover:underline">Overview: Combined Ratio in Insurance</a></li>
        <li><a href="#calculation" className="hover:underline">Combined Ratio Calculation</a></li>
        <li><a href="#components" className="hover:underline">Components: Loss Ratio and Expense Ratio</a></li>
        <li><a href="#interpretation" className="hover:underline">Interpreting Combined Ratio</a></li>
        <li><a href="#benchmarks" className="hover:underline">Industry Benchmarks</a></li>
        <li><a href="#profitability" className="hover:underline">Underwriting Profitability</a></li>
        <li><a href="#management" className="hover:underline">Combined Ratio Management</a></li>
    </ul>
<hr />

    <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: Combined Ratio in Insurance</h2>
    <p><b>Combined ratio</b> is the most comprehensive metric in the insurance industry for assessing underwriting profitability. It combines loss ratio (claims costs) and expense ratio (operating expenses) to provide a complete picture of underwriting performance. A combined ratio below 100% indicates underwriting profit, while above 100% indicates underwriting loss.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Concepts</h3>
    <ul>
        <li><b>Combined Ratio:</b> Sum of loss ratio and expense ratio (Loss Ratio + Expense Ratio)</li>
        <li><b>Loss Ratio:</b> Percentage of earned premiums paid out as claims</li>
        <li><b>Expense Ratio:</b> Percentage of earned premiums used for underwriting expenses</li>
        <li><b>Underwriting Profit:</b> Profit when combined ratio is below 100%</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Why Combined Ratio Matters</h3>
    <p>Combined ratio provides critical insights into:</p>
    <ul>
        <li><b>Underwriting Profitability:</b> Whether underwriting operations are profitable</li>
        <li><b>Overall Performance:</b> Complete picture of claims and expense management</li>
        <li><b>Competitive Position:</b> How performance compares to industry benchmarks</li>
        <li><b>Financial Health:</b> Sustainability of underwriting operations</li>
    </ul>

<hr />

    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Combined Ratio Calculation</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Basic Formula</h3>
    <p>The combined ratio is calculated as:</p>
    <p className="text-lg font-semibold text-foreground">Combined Ratio = Loss Ratio + Expense Ratio</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Component Calculations</h3>
    
    <h4 className="text-lg font-semibold text-foreground mt-4">Loss Ratio</h4>
    <p>Loss Ratio = (Incurred Losses + Loss Adjustment Expenses) / Earned Premiums × 100</p>

    <h4 className="text-lg font-semibold text-foreground mt-4">Expense Ratio</h4>
    <p>Expense Ratio = Underwriting Expenses / Earned Premiums × 100</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Example Calculation</h3>
    <p>Suppose an insurance company has:</p>
    <ul>
        <li>Incurred Losses: $500,000</li>
        <li>Loss Adjustment Expenses: $50,000</li>
        <li>Underwriting Expenses: $200,000</li>
        <li>Earned Premiums: $1,000,000</li>
    </ul>
    <p>Calculations:</p>
    <ul>
        <li>Loss Ratio = ($500,000 + $50,000) / $1,000,000 × 100 = <b>55%</b></li>
        <li>Expense Ratio = $200,000 / $1,000,000 × 100 = <b>20%</b></li>
        <li>Combined Ratio = 55% + 20% = <b>75%</b></li>
    </ul>
    <p>The combined ratio of 75% indicates that the insurer is spending 75 cents of every premium dollar on claims and expenses, leaving 25 cents as underwriting profit.</p>

<hr />

    <h2 id="components" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Components: Loss Ratio and Expense Ratio</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Loss Ratio</h3>
    <p>Loss ratio measures claims costs relative to premiums:</p>
    <ul>
        <li><b>Incurred Losses:</b> Total claims paid plus reserves for future payments</li>
        <li><b>Loss Adjustment Expenses (LAE):</b> Costs of investigating and settling claims</li>
        <li><b>Lower is Better:</b> Lower loss ratios indicate better claims performance</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Expense Ratio</h3>
    <p>Expense ratio measures operating efficiency:</p>
    <ul>
        <li><b>Underwriting Expenses:</b> Commissions, administrative costs, marketing, etc.</li>
        <li><b>Operational Efficiency:</b> Lower expense ratios indicate better efficiency</li>
        <li><b>Cost Control:</b> Essential for maintaining profitability</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Balancing Components</h3>
    <p>Both components must be managed:</p>
    <ul>
        <li><b>Low Loss Ratio + Low Expense Ratio:</b> Excellent profitability</li>
        <li><b>High Loss Ratio + Low Expense Ratio:</b> May still be profitable if loss ratio is manageable</li>
        <li><b>Low Loss Ratio + High Expense Ratio:</b> May still be profitable if expense ratio is manageable</li>
        <li><b>High Loss Ratio + High Expense Ratio:</b> Likely unprofitable</li>
    </ul>

<hr />

    <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting Combined Ratio</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Combined Ratio Below 100%</h3>
    <p>A combined ratio below 100% indicates <b>underwriting profit</b>:</p>
    <ul>
        <li>Premiums exceed total costs (claims + expenses)</li>
        <li>Underwriting operations are profitable</li>
        <li>Lower combined ratios indicate higher profitability</li>
    </ul>
    <p>For example, a 75% combined ratio means 75% of premiums go to costs, leaving 25% as profit.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Combined Ratio Above 100%</h3>
    <p>A combined ratio above 100% indicates <b>underwriting losses</b>:</p>
    <ul>
        <li>Total costs exceed premiums</li>
        <li>Underwriting operations are unprofitable</li>
        <li>Requires immediate attention to pricing, expenses, or claims</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Combined Ratio Categories</h3>
    <ul>
        <li><b>Below 90%:</b> Highly profitable, excellent performance</li>
        <li><b>90-95%:</b> Moderate profitability, typical for many lines</li>
        <li><b>95-100%:</b> Marginal profitability, minimal profit margin</li>
        <li><b>Above 100%:</b> Unprofitable, underwriting losses</li>
    </ul>

<hr />

    <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Industry Benchmarks</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Typical Combined Ratios by Line of Business</h3>
    <p>Combined ratio benchmarks vary by insurance line:</p>
    <ul>
        <li><b>Property Insurance:</b> Typically 85-95% (lower loss ratios, moderate expenses)</li>
        <li><b>Liability Insurance:</b> Typically 90-100% (moderate loss ratios, moderate expenses)</li>
        <li><b>Workers Compensation:</b> Typically 95-105% (higher loss ratios, moderate expenses)</li>
        <li><b>Health Insurance:</b> Typically 85-95% (regulated medical loss ratios, lower expenses)</li>
        <li><b>Auto Insurance:</b> Typically 90-100% (moderate loss ratios, moderate expenses)</li>
    </ul>

<hr />

    <h2 id="profitability" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Underwriting Profitability</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Underwriting Profit Calculation</h3>
    <p>Underwriting profit is calculated as:</p>
    <p className="text-lg font-semibold text-foreground">Underwriting Profit = Earned Premiums × (100% - Combined Ratio) / 100</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Example</h3>
    <p>If earned premiums are $1,000,000 and combined ratio is 95%:</p>
    <ul>
        <li>Underwriting Profit = $1,000,000 × (100% - 95%) / 100 = $50,000</li>
        <li>Profit Margin = 5% of earned premiums</li>
    </ul>

<hr />

    <h2 id="management" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Combined Ratio Management</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Improving Combined Ratio</h3>
    <p>Improve combined ratio by:</p>
    <ul>
        <li><b>Reducing Loss Ratio:</b> Better pricing, underwriting, claims management</li>
        <li><b>Reducing Expense Ratio:</b> Operational efficiency, cost control</li>
        <li><b>Both:</b> Optimal approach for maximum profitability</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Regular Monitoring</h3>
    <p>Monitor combined ratio:</p>
    <ul>
        <li><b>Monthly:</b> For early trend detection</li>
        <li><b>Quarterly:</b> For comprehensive performance review</li>
        <li><b>Annually:</b> For strategic planning and benchmarking</li>
    </ul>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p><b>Combined ratio</b> is the most comprehensive metric for assessing insurance underwriting profitability. It combines loss ratio and expense ratio to provide a complete picture of underwriting performance. A combined ratio below 100% indicates underwriting profit, while above 100% indicates losses. Industry benchmarks typically range from 85-105% depending on line of business. Regular monitoring, trend analysis, and management of both components are essential for maintaining profitability.</p>
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
          <p>This tool calculates combined ratio for insurance profitability by combining loss ratio and expense ratio to assess underwriting performance.</p>
          <p>Outputs include combined ratio, loss ratio, expense ratio, underwriting profit and margin, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

