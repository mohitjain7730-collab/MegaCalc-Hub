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
  goalAmount: z.number({ invalid_type_error: 'Enter goal amount' }).min(0),
  currentSavings: z.number({ invalid_type_error: 'Enter current savings' }).min(0),
  timeHorizonYears: z.number({ invalid_type_error: 'Enter time horizon' }).min(0.1),
  expectedReturn: z.number({ invalid_type_error: 'Enter expected return' }).min(0).max(100),
  riskFreeRate: z.number({ invalid_type_error: 'Enter risk-free rate' }).min(0).max(100),
  portfolioVolatility: z.number({ invalid_type_error: 'Enter portfolio volatility' }).min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  goalAmount: number;
  currentSavings: number;
  timeHorizonYears: number;
  expectedReturn: number;
  riskFreeRate: number;
  portfolioVolatility: number;
  requiredReturn: number;
  requiredMonthlyContribution: number;
  sharpeRatio: number;
  stockAllocation: number;
  bondAllocation: number;
  interpretation: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter goal amount (target amount needed).',
  'Enter current savings toward this goal.',
  'Enter time horizon in years until goal.',
  'Enter expected portfolio return as percentage.',
  'Enter risk-free rate and portfolio volatility.',
  'Review allocation recommendations and plan.',
];

const faqs = [
  {
    question: 'What is goal-based investing?',
    answer:
      'Goal-based investing allocates investments to achieve specific financial objectives, such as retirement, home purchase, or education funding. Each goal has its own time horizon, risk tolerance, and asset allocation strategy.',
  },
  {
    question: 'How does time horizon affect allocation?',
    answer:
      'Longer time horizons allow higher allocations to risky assets (stocks) because there is more time to recover from volatility. Shorter time horizons require more conservative allocations (bonds, cash) to preserve capital. Typical rule: stocks allocation = 100 - age, or higher for long-term goals.',
  },
  {
    question: 'How is required return calculated?',
    answer:
      'Required return is the annual return needed to reach the goal. It considers the goal amount, current savings, time horizon, and any regular contributions. Higher required returns may necessitate higher stock allocations.',
  },
  {
    question: 'What is Sharpe ratio?',
    answer:
      'Sharpe ratio measures risk-adjusted returns: (Expected Return - Risk-Free Rate) / Portfolio Volatility. Higher Sharpe ratios indicate better risk-adjusted performance. It helps evaluate whether expected returns justify the risk taken.',
  },
  {
    question: 'How do I determine stock vs bond allocation?',
    answer:
      'Allocation depends on time horizon, required return, and risk tolerance. General guidelines: Very long-term (20+ years): 80-100% stocks; Long-term (10-20 years): 60-80% stocks; Medium-term (5-10 years): 40-60% stocks; Short-term (&lt;5 years): 20-40% stocks.',
  },
  {
    question: 'What if required return is too high?',
    answer:
      'If required return exceeds realistic expectations, consider: extending time horizon, reducing goal amount, increasing contributions, accepting higher risk (with caution), or adjusting goal expectations. Unrealistic returns lead to poor allocation decisions.',
  },
  {
    question: 'How do I balance multiple goals?',
    answer:
      'Allocate portfolio separately for each goal based on its time horizon and risk requirements. Use separate accounts or mental accounting to track progress. Prioritize goals and adjust contributions based on importance and urgency.',
  },
  {
    question: 'Should allocation change over time?',
    answer:
      'Yes, allocation should gradually shift to more conservative investments as the goal approaches (glide path). This reduces risk as the time horizon shortens, preserving capital when it\'s needed. Reduce stock allocation systematically as goal nears.',
  },
  {
    question: 'What about inflation?',
    answer:
      'Consider inflation when setting goal amounts and expected returns. Use real (inflation-adjusted) returns and goals, or use nominal returns with inflation-adjusted goal amounts. Long-term goals require inflation consideration to maintain purchasing power.',
  },
  {
    question: 'How often should I review goal-based allocation?',
    answer:
      'Review annually or when circumstances change (goal amount, time horizon, current savings, risk tolerance). Monitor progress toward goals and adjust allocation and contributions as needed. Major life events may require goal reassessment.',
  },
];

const relatedCalculators = [
  {
    name: 'Retirement Savings Calculator',
    slug: 'retirement-savings-calculator',
    description: 'Calculate retirement savings needs.',
  },
  {
    name: 'Portfolio Rebalancing Planner',
    slug: 'portfolio-rebalancing-planner',
    description: 'Plan portfolio rebalancing.',
  },
  {
    name: 'Risk Tolerance Score Calculator',
    slug: 'risk-tolerance-score-calculator',
    description: 'Calculate risk tolerance.',
  },
  {
    name: 'Position Sizing Calculator',
    slug: 'position-sizing-calculator',
    description: 'Calculate position sizes.',
  },
];

const baseUrl = 'https://mycalculating.com/category/finance/goal-based-investing-allocation-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Goal-Based Investing Allocation Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Goal-Based Investing Allocation Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate optimal asset allocation for goal-based investing based on goal amount, time horizon, required return, and risk tolerance.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const goalAmount = values.goalAmount;
  const currentSavings = values.currentSavings;
  const timeHorizonYears = values.timeHorizonYears;
  const expectedReturnPct = values.expectedReturn / 100;
  const riskFreeRatePct = values.riskFreeRate / 100;
  const portfolioVolatilityPct = values.portfolioVolatility / 100;
  
  // Calculate required return: solve FV = PV(1+r)^n + PMT * [((1+r)^n - 1) / r]
  // For simplicity, assume monthly contributions
  // Using approximation: r ≈ (Goal/Current)^(1/n) - 1 if no contributions
  // More accurate: use present value formula
  const futureValueNeeded = goalAmount - (currentSavings * Math.pow(1 + expectedReturnPct, timeHorizonYears));
  
  // Required monthly contribution (simplified)
  // Using: PMT = (FV × r) / ((1+r)^n - 1) where r is monthly rate
  const monthlyRate = expectedReturnPct / 12;
  const numberOfMonths = timeHorizonYears * 12;
  let requiredMonthlyContribution = 0;
  if (monthlyRate > 0 && numberOfMonths > 0) {
    const futureValueFactor = Math.pow(1 + monthlyRate, numberOfMonths);
    requiredMonthlyContribution = (futureValueNeeded * monthlyRate) / (futureValueFactor - 1);
    if (requiredMonthlyContribution < 0) requiredMonthlyContribution = 0;
  }
  
  // Required return to achieve goal (simplified annual return needed)
  const requiredReturn = (Math.pow(goalAmount / currentSavings, 1 / timeHorizonYears) - 1) * 100;
  
  // Sharpe Ratio = (Expected Return - Risk-Free Rate) / Volatility
  const sharpeRatio = portfolioVolatilityPct > 0 ? (expectedReturnPct - riskFreeRatePct) / portfolioVolatilityPct : 0;
  
  // Stock allocation based on time horizon and required return
  // Rule of thumb: More aggressive for longer horizons and higher required returns
  let stockAllocation = 0;
  if (timeHorizonYears >= 20) {
    stockAllocation = Math.min(90, 70 + (requiredReturn / 10));
  } else if (timeHorizonYears >= 10) {
    stockAllocation = Math.min(80, 50 + (requiredReturn / 10));
  } else if (timeHorizonYears >= 5) {
    stockAllocation = Math.min(70, 40 + (requiredReturn / 10));
  } else {
    stockAllocation = Math.min(50, 20 + (requiredReturn / 10));
  }
  stockAllocation = Math.max(0, Math.min(100, stockAllocation));
  const bondAllocation = 100 - stockAllocation;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = `Recommended allocation: ${stockAllocation.toFixed(0)}% stocks, ${bondAllocation.toFixed(0)}% bonds based on ${timeHorizonYears.toFixed(1)}-year time horizon and required return of ${requiredReturn.toFixed(2)}% annually.`;
  
  if (requiredReturn > expectedReturn * 1.2) {
    status = 'low';
    interpretation += ' Required return significantly exceeds expected return. Consider adjusting goal, time horizon, or contribution amount.';
  } else if (stockAllocation > 80) {
    status = 'good';
    interpretation += ' High stock allocation appropriate for long-term goal with aggressive growth requirements.';
  } else {
    status = 'optimal';
  }

  const recommendations = [
    `Asset allocation: ${stockAllocation.toFixed(0)}% stocks, ${bondAllocation.toFixed(0)}% bonds for ${timeHorizonYears.toFixed(1)}-year goal. This allocation balances growth potential with risk appropriate for your time horizon.`,
    `Monitor progress: Track progress toward ${goalAmount.toLocaleString()} goal. Adjust allocation as time horizon shortens (glide path) to reduce risk as goal approaches. Consider reducing stock allocation by 5-10% annually as goal nears.`,
    `Monthly contribution: ${requiredMonthlyContribution >= 0 ? `Plan to contribute ${requiredMonthlyContribution.toFixed(0)} monthly to achieve goal.` : 'Current savings and expected return may be sufficient. Review if additional contributions are needed.'}`,
    `Sharpe ratio: ${sharpeRatio.toFixed(2)} indicates ${sharpeRatio > 1 ? 'good' : sharpeRatio > 0.5 ? 'moderate' : 'low'} risk-adjusted returns. ${sharpeRatio < 0.5 ? 'Consider optimizing portfolio to improve risk-adjusted returns.' : 'Portfolio risk-return profile appears reasonable.'}`,
  ];
  
  if (requiredReturn > 15) {
    recommendations.push('Very high required return: Achieving this return may require taking significant risk or may be unrealistic. Consider extending time horizon, increasing contributions, or adjusting goal expectations.');
  }
  if (timeHorizonYears < 3 && stockAllocation > 50) {
    recommendations.push('Short time horizon with high stock allocation: For goals less than 3 years away, consider more conservative allocation to preserve capital. Reduce stock allocation to 20-40%.');
  }

  const plan = [
    { label: 'This Week', detail: `Calculate goal-based allocation: ${stockAllocation.toFixed(0)}% stocks, ${bondAllocation.toFixed(0)}% bonds for ${goalAmount.toLocaleString()} goal over ${timeHorizonYears.toFixed(1)} years. Document allocation strategy and contribution plan.` },
    { label: 'This Month', detail: 'Implement allocation strategy and begin regular contributions. Set up automatic contributions if possible. Monitor portfolio performance and progress toward goal. Review asset allocation monthly or quarterly.' },
    { label: 'Ongoing', detail: 'Regularly review goal progress and adjust allocation as time horizon shortens (reduce stock allocation gradually). Reassess goal amount, time horizon, and contributions annually or when circumstances change. Maintain discipline in following allocation strategy.' },
  ];

  return { goalAmount, currentSavings, timeHorizonYears, expectedReturn: values.expectedReturn, riskFreeRate: values.riskFreeRate, portfolioVolatility: values.portfolioVolatility, requiredReturn, requiredMonthlyContribution, sharpeRatio, stockAllocation, bondAllocation, interpretation, status, recommendations, plan };
};

export default function GoalBasedInvestingAllocationCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goalAmount: undefined,
      currentSavings: undefined,
      timeHorizonYears: undefined,
      expectedReturn: undefined,
      riskFreeRate: undefined,
      portfolioVolatility: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="goal-based-allocation-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Goal-Based Investing Allocation Calculator
          </CardTitle>
          <CardDescription>Calculate optimal asset allocation for goal-based investing based on goal amount, time horizon, required return, and risk tolerance.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your goal and portfolio data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="goalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal Amount</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 500000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentSavings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Savings</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 50000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timeHorizonYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Horizon (Years)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 20" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expectedReturn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Return (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="riskFreeRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk-Free Rate (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="portfolioVolatility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Portfolio Volatility (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Allocation
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
            <CardDescription>See allocation recommendations and plan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Stock Allocation</p>
                <p className="text-2xl font-semibold text-primary">{result.stockAllocation.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Recommended</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Bond Allocation</p>
                <p className="text-2xl font-semibold text-primary">{result.bondAllocation.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Recommended</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Required Monthly</p>
                <p className="text-2xl font-semibold text-primary">{result.requiredMonthlyContribution.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Contribution</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
                <p className="text-2xl font-semibold text-primary">{result.sharpeRatio.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Risk-adjusted return</p>
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
            <strong>Required Return</strong> = [(Goal Amount / Current Savings)^(1/Time Horizon) - 1] × 100
          </p>
          <p>
            <strong>Sharpe Ratio</strong> = (Expected Return - Risk-Free Rate) / Portfolio Volatility
          </p>
          <p>
            <strong>Stock Allocation</strong> = Based on time horizon and required return (longer horizons and higher required returns support higher stock allocation)
          </p>
          <p>
            <strong>Bond Allocation</strong> = 100% - Stock Allocation
          </p>
          <p>Goal-based investing allocates assets to match each goal's time horizon and risk requirements. Longer time horizons allow higher stock allocations for growth. Shorter time horizons require more conservative allocations to preserve capital. Allocation should gradually shift to more conservative (glide path) as goals approach.</p>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Required Return</p>
                <p className="text-xl font-semibold text-primary">{result.requiredReturn.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">Annual return needed</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Time Horizon</p>
                <p className="text-xl font-semibold text-primary">{result.timeHorizonYears.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Years to goal</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Goal Progress</p>
                <p className="text-xl font-semibold text-primary">
                  {((result.currentSavings / result.goalAmount) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Current savings / Goal</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-xl font-semibold text-primary capitalize">{result.status}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your goal and portfolio data to see additional insights.</p>
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
        className="space-y-6 text-muted-foreground leading-relaxed bg-white dark:bg-gray-900 p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/Article"
      >
    <meta itemProp="name" content="The Complete Guide to Goal-Based Investing Allocation: Portfolio Strategy for Financial Goals" />
    <meta itemProp="description" content="An in-depth guide on goal-based investing allocation, calculating optimal asset allocation based on goals, time horizons, and risk requirements." />
    <meta itemProp="keywords" content="goal based investing, asset allocation, portfolio allocation, financial goals, time horizon, stock bond allocation" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-12-02" />
    <meta itemProp="url" content="/category/finance/goal-based-investing-allocation-calculator" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Goal-Based Investing Allocation: Portfolio Strategy for Financial Goals</h1>
    <p className="text-lg italic text-gray-700 dark:text-gray-300">A comprehensive look at goal-based investing allocation, optimizing asset allocation for specific financial goals based on time horizons and risk requirements.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600 dark:text-blue-400">
        <li><a href="#basics" className="hover:underline">Fundamentals of Goal-Based Investing</a></li>
        <li><a href="#allocation" className="hover:underline">Asset Allocation by Time Horizon</a></li>
        <li><a href="#calculation" className="hover:underline">Allocation Calculation Methods</a></li>
        <li><a href="#glide" className="hover:underline">Glide Path Strategy</a></li>
        <li><a href="#multiple" className="hover:underline">Multiple Goals Strategy</a></li>
        <li><a href="#review" className="hover:underline">Monitoring and Rebalancing</a></li>
    </ul>
<hr className="my-6" />

    <h2 id="basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Fundamentals of Goal-Based Investing</h2>
    <p>Goal-based investing tailors investment strategies to specific financial objectives, with each goal having its own time horizon, risk tolerance, and allocation strategy.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Principles</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Goal-Specific Allocation:</b> Each goal has its own optimal asset allocation</li>
        <li><b>Time Horizon Matching:</b> Allocation matches time horizon (longer = more aggressive)</li>
        <li><b>Risk Alignment:</b> Risk level appropriate for goal importance and timeline</li>
        <li><b>Progress Tracking:</b> Monitor progress toward each goal separately</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Benefits</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>Clear connection between investments and life goals</li>
        <li>Appropriate risk for each goal</li>
        <li>Better emotional engagement and discipline</li>
        <li>Systematic approach to financial planning</li>
    </ul>

<hr className="my-6" />

    <h2 id="allocation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Asset Allocation by Time Horizon</h2>
    <p>Time horizon is the primary factor determining asset allocation in goal-based investing.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Very Long-Term Goals (20+ Years)</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>Stock allocation: 80-100%</li>
        <li>Bond allocation: 0-20%</li>
        <li>Rationale: Long time to recover from volatility, maximize growth</li>
        <li>Examples: Retirement (for young investors), long-term wealth building</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Long-Term Goals (10-20 Years)</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>Stock allocation: 60-80%</li>
        <li>Bond allocation: 20-40%</li>
        <li>Rationale: Significant growth opportunity with some risk management</li>
        <li>Examples: College education (for young children), early retirement</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Medium-Term Goals (5-10 Years)</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>Stock allocation: 40-60%</li>
        <li>Bond allocation: 40-60%</li>
        <li>Rationale: Balanced approach, moderate growth with capital preservation</li>
        <li>Examples: Home down payment, major purchase</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Short-Term Goals (&lt;5 Years)</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>Stock allocation: 0-40%</li>
        <li>Bond/Cash allocation: 60-100%</li>
        <li>Rationale: Preserve capital, minimize volatility</li>
        <li>Examples: Emergency fund, near-term purchase</li>
    </ul>

<hr className="my-6" />

    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Allocation Calculation Methods</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Time Horizon-Based Rules</h3>
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
        <p className="font-mono"><strong>Stock Allocation = f(Time Horizon, Required Return)</strong></p>
    </div>
    <p>General guidelines:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Very long-term (20+ years): 80-100% stocks</li>
        <li>Long-term (10-20 years): 60-80% stocks</li>
        <li>Medium-term (5-10 years): 40-60% stocks</li>
        <li>Short-term (&lt;5 years): 0-40% stocks</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Required Return Consideration</h3>
    <p>If required return exceeds what's achievable with conservative allocation, increase stock allocation (with appropriate risk awareness). However, avoid unrealistic expectations that require excessive risk.</p>

<hr className="my-6" />

    <h2 id="glide" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Glide Path Strategy</h2>
    <p>A glide path gradually reduces stock allocation as the goal approaches, reducing risk over time.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">How Glide Paths Work</h3>
    <p>As time to goal decreases:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Gradually reduce stock allocation (e.g., 5-10% per year)</li>
        <li>Increase bond and cash allocation</li>
        <li>Preserve capital as goal nears</li>
        <li>Maintain some growth potential</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Example Glide Path</h3>
    <p>20-year goal:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Years 20-15: 80-90% stocks</li>
        <li>Years 15-10: 70-80% stocks</li>
        <li>Years 10-5: 60-70% stocks</li>
        <li>Years 5-1: 40-50% stocks</li>
        <li>Final year: 20-30% stocks</li>
    </ul>

<hr className="my-6" />

    <h2 id="multiple" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Multiple Goals Strategy</h2>
    <p>When managing multiple goals, allocate separately for each goal.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Separate Allocation</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>Calculate allocation for each goal independently</li>
        <li>Use separate accounts or mental accounting</li>
        <li>Track progress toward each goal separately</li>
        <li>Adjust allocations as goals approach</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Priority and Sequencing</h3>
    <p>Prioritize goals by:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Importance (essential vs. nice-to-have)</li>
        <li>Urgency (time-sensitive vs. flexible)</li>
        <li>Financial capacity (ability to fund multiple goals)</li>
    </ul>

<hr className="my-6" />

    <h2 id="review" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Monitoring and Rebalancing</h2>
    <p>Regular monitoring and rebalancing ensure goals remain on track.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Regular Reviews</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>Review progress annually or quarterly</li>
        <li>Assess if goals are on track</li>
        <li>Adjust contributions if needed</li>
        <li>Update allocations as time horizons shorten</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Rebalancing</h3>
    <p>Rebalance to maintain target allocations:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>When allocations drift significantly (e.g., ±5%)</li>
        <li>As time horizons shorten (glide path)</li>
        <li>When goal amounts or time horizons change</li>
    </ul>

<hr className="my-6" />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Goal-based investing allocation tailors asset allocation to specific financial goals based on time horizons, required returns, and risk tolerance. Longer time horizons support higher stock allocations for growth, while shorter horizons require more conservative allocations to preserve capital. Implementing glide paths that gradually reduce risk as goals approach, and regularly monitoring and rebalancing, ensures optimal progress toward financial objectives.</p>
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
          <p>This tool calculates optimal asset allocation for goal-based investing based on goal amount, time horizon, required return, and risk tolerance.</p>
          <p>Outputs include stock allocation, bond allocation, required monthly contribution, Sharpe ratio, interpretation, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
