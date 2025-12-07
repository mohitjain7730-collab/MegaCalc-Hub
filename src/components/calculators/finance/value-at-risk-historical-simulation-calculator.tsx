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
  portfolioValue: z.number({ invalid_type_error: 'Enter portfolio value' }).min(0),
  historicalReturns: z.string({ invalid_type_error: 'Enter historical returns' }),
  confidenceLevel: z.number({ invalid_type_error: 'Enter confidence level' }).min(90).max(99.9),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  portfolioValue: number;
  confidenceLevel: number;
  varValue: number;
  varPercentage: number;
  percentileReturn: number;
  riskLevel: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter portfolio value (current value of the portfolio).',
  'Enter historical returns as comma-separated values (e.g., -0.02, 0.01, -0.015, 0.03).',
  'Enter confidence level (90-99.9%, typically 95% or 99%).',
  'Review VaR calculation, percentile return, and risk assessment.',
];

const faqs = [
  {
    question: 'What is Value-at-Risk (VaR)?',
    answer:
      'Value-at-Risk (VaR) is a statistical measure that estimates the maximum potential loss in portfolio value over a defined period for a given confidence level. VaR answers: "What is the worst-case loss I can expect with X% confidence?"',
  },
  {
    question: 'What is historical simulation method?',
    answer:
      'Historical simulation estimates VaR by analyzing actual historical returns without assuming a specific distribution. It sorts historical returns and identifies the return at the desired confidence level percentile. This method is non-parametric and captures actual market behavior.',
  },
  {
    question: 'How is VaR calculated using historical simulation?',
    answer:
      'Steps: 1) Collect historical returns, 2) Sort returns from worst to best, 3) Identify the return at the desired confidence level percentile (e.g., 5th percentile for 95% confidence), 4) Calculate VaR = Portfolio Value × |Percentile Return|. The percentile return represents the maximum expected loss.',
  },
  {
    question: 'What confidence level should I use?',
    answer:
      'Common confidence levels are 95% (5% tail risk) and 99% (1% tail risk). Higher confidence levels (99%) provide more conservative estimates but may be less practical. 95% is most commonly used in practice. Choose based on risk tolerance and regulatory requirements.',
  },
  {
    question: 'What is percentile return?',
    answer:
      'Percentile return is the historical return at the desired confidence level. For 95% confidence with 100 days of data, it is the 5th worst return (5th percentile). This represents the threshold below which 5% of worst losses occur.',
  },
  {
    question: 'How many historical returns do I need?',
    answer:
      'More historical returns provide more reliable estimates. Minimum 100-250 returns (4-12 months of daily data) is recommended. For 95% confidence, at least 20 returns are needed to identify the 5th percentile. More data improves accuracy.',
  },
  {
    question: 'What are limitations of historical simulation?',
    answer:
      'Limitations include: assumes past patterns will continue, may not capture extreme events not in historical data, requires sufficient historical data, and may not reflect changing market conditions. It is backward-looking rather than forward-looking.',
  },
  {
    question: 'How does VaR help with risk management?',
    answer:
      'VaR helps: set position limits, determine capital requirements, assess portfolio risk, compare risk across portfolios, and communicate risk to stakeholders. It provides a single number summarizing potential losses at a given confidence level.',
  },
  {
    question: 'What is the difference between VaR and CVaR?',
    answer:
      'VaR estimates the maximum loss at a confidence level, while Conditional VaR (CVaR) estimates the average loss beyond the VaR threshold. CVaR provides additional insight into tail risk severity. VaR answers "how bad can it get?" while CVaR answers "how bad is it on average when it gets that bad?"',
  },
  {
    question: 'How often should VaR be recalculated?',
    answer:
      'VaR should be recalculated regularly (daily, weekly, or monthly) as portfolio composition and market conditions change. More frequent updates provide better risk monitoring. Many institutions calculate VaR daily for active portfolios.',
  },
];

const relatedCalculators = [
  {
    name: 'Conditional VaR (CVaR) Backtest Calculator',
    slug: 'conditional-var-cvar-backtest-calculator',
    description: 'Backtest Conditional VaR models.',
  },
  {
    name: 'Conditional Value at Risk Calculator',
    slug: 'conditional-value-at-risk-calculator',
    description: 'Calculate Conditional Value at Risk.',
  },
  {
    name: 'Stress Testing (Portfolio Shock) Simulator',
    slug: 'stress-testing-portfolio-shock-simulator',
    description: 'Simulate portfolio stress testing.',
  },
  {
    name: 'Scenario Analysis Tool (Monte Carlo for Losses)',
    slug: 'scenario-analysis-tool-monte-carlo-for-losses',
    description: 'Monte Carlo scenario analysis for losses.',
  },
];

const baseUrl = 'https://mycalculating.com/category/finance/value-at-risk-historical-simulation-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Value-at-Risk (Historical Simulation) Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Value-at-Risk (Historical Simulation) Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate Value-at-Risk (VaR) using historical simulation method based on portfolio value, historical returns, and confidence level.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const portfolioValue = values.portfolioValue;
  const confidenceLevel = values.confidenceLevel;

  // Parse historical returns from comma-separated string
  const returnsStr = values.historicalReturns.trim();
  const returns = returnsStr
    .split(',')
    .map((r) => parseFloat(r.trim()))
    .filter((r) => !isNaN(r))
    .sort((a, b) => a - b); // Sort from worst to best

  if (returns.length === 0) {
    throw new Error('No valid historical returns provided');
  }

  // Calculate percentile index for confidence level
  // For 95% confidence, we want the 5th percentile (5% tail risk)
  const tailRisk = (100 - confidenceLevel) / 100;
  const percentileIndex = Math.floor(returns.length * tailRisk);
  const adjustedIndex = Math.max(0, Math.min(percentileIndex, returns.length - 1));

  // Get percentile return (worst return at confidence level)
  const percentileReturn = returns[adjustedIndex];

  // VaR = Portfolio Value × |Percentile Return|
  // Use absolute value since percentile return is typically negative
  const varValue = portfolioValue * Math.abs(percentileReturn);
  const varPercentage = Math.abs(percentileReturn) * 100;

  // Determine risk level
  let riskLevel = 'Very Low';
  if (varPercentage > 20) {
    riskLevel = 'Very High';
  } else if (varPercentage > 10) {
    riskLevel = 'High';
  } else if (varPercentage > 5) {
    riskLevel = 'Moderate';
  } else if (varPercentage > 2) {
    riskLevel = 'Low';
  }

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = `VaR calculated using historical simulation. At ${confidenceLevel}% confidence level, the maximum expected loss is $${varValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} (${varPercentage.toFixed(2)}% of portfolio value).`;

  if (varPercentage > 20) {
    status = 'low';
    interpretation = `Very high VaR (${varPercentage.toFixed(2)}%) indicates significant portfolio risk. The portfolio may experience losses exceeding $${varValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} with ${100 - confidenceLevel}% probability. Consider reducing risk through diversification or hedging.`;
  } else if (varPercentage > 10) {
    status = 'moderate';
    interpretation = `High VaR (${varPercentage.toFixed(2)}%) indicates notable portfolio risk. The portfolio may experience losses exceeding $${varValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} with ${100 - confidenceLevel}% probability. Monitor risk and consider risk reduction strategies.`;
  } else if (varPercentage > 5) {
    status = 'good';
    interpretation = `Moderate VaR (${varPercentage.toFixed(2)}%) indicates manageable portfolio risk. The portfolio may experience losses exceeding $${varValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} with ${100 - confidenceLevel}% probability. Continue monitoring risk levels.`;
  } else {
    status = 'optimal';
    interpretation = `Low VaR (${varPercentage.toFixed(2)}%) indicates minimal portfolio risk. The portfolio may experience losses exceeding $${varValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} with ${100 - confidenceLevel}% probability. Risk is well-managed.`;
  }

  const recommendations = [
    `VaR at ${confidenceLevel}% confidence: $${varValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} (${varPercentage.toFixed(2)}% of portfolio value). This represents the maximum expected loss with ${confidenceLevel}% confidence based on historical returns.`,
    `Percentile Return: ${(percentileReturn * 100).toFixed(2)}%. This is the ${((100 - confidenceLevel) / 100 * 100).toFixed(1)}th percentile return from historical data, representing the threshold below which ${100 - confidenceLevel}% of worst losses occur.`,
    `Risk Level: ${riskLevel}. ${varPercentage > 10 ? 'High VaR suggests significant portfolio risk. Consider risk reduction through diversification, hedging, or position sizing.' : varPercentage > 5 ? 'Moderate VaR suggests manageable risk. Continue monitoring and maintain appropriate risk management.' : 'Low VaR suggests well-managed risk. Maintain current risk management practices.'}`,
  ];
  if (returns.length < 100) {
    recommendations.push(`Limited historical data (${returns.length} returns). More data (100+ returns) would improve VaR estimate accuracy. Consider using longer historical periods for more reliable estimates.`);
  }
  if (varPercentage > 10) {
    recommendations.push('High VaR requires attention. Consider: reducing position sizes, increasing diversification, implementing hedging strategies, or reviewing portfolio allocation to reduce risk exposure.');
  }

  const plan = [
    { label: 'This Week', detail: `Review VaR: $${varValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} at ${confidenceLevel}% confidence. Assess portfolio risk and compare to risk tolerance. Identify any positions contributing significantly to VaR.` },
    { label: 'This Month', detail: 'Monitor VaR regularly as portfolio composition and market conditions change. Update historical returns data and recalculate VaR. If VaR exceeds risk limits, develop action plan to reduce risk.' },
    { label: 'Ongoing', detail: 'Recalculate VaR regularly (daily, weekly, or monthly). Track VaR trends over time, compare to risk limits, and adjust portfolio allocation or hedging strategies to maintain appropriate risk levels.' },
  ];

  return {
    portfolioValue,
    confidenceLevel,
    varValue,
    varPercentage,
    percentileReturn,
    riskLevel,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function ValueAtRiskHistoricalSimulationCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      portfolioValue: undefined,
      historicalReturns: undefined,
      confidenceLevel: 95,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="var-historical-simulation-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Value-at-Risk (Historical Simulation) Calculator
          </CardTitle>
          <CardDescription>Calculate Value-at-Risk (VaR) using historical simulation method based on portfolio value, historical returns, and confidence level.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => {
              try {
                setResult(calculateResult(values));
              } catch (error) {
                alert(error instanceof Error ? error.message : 'An error occurred');
              }
            })} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="portfolioValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Portfolio Value ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 1000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confidenceLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confidence Level (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 95" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="historicalReturns"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Historical Returns (comma-separated, e.g., -0.02, 0.01, -0.015, 0.03)</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="e.g., -0.02, 0.01, -0.015, 0.03, -0.01, 0.02" value={field.value ?? ''} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate VaR
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
            <CardDescription>See VaR calculation, percentile return, and risk assessment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">VaR Value</p>
                <p className="text-2xl font-semibold text-primary">{result.varValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">VaR Percentage</p>
                <p className="text-2xl font-semibold text-primary">{result.varPercentage.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">Of portfolio value</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Percentile Return</p>
                <p className="text-2xl font-semibold text-primary">{(result.percentileReturn * 100).toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">Historical return</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Risk Level</p>
                <p className="text-2xl font-semibold text-primary">{result.riskLevel}</p>
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
            <strong>Historical Simulation Method:</strong> 1) Collect historical returns, 2) Sort returns from worst to best, 3) Identify return at desired confidence level percentile, 4) Calculate VaR = Portfolio Value × |Percentile Return|.
          </p>
          <p>
            <strong>Percentile Index:</strong> For confidence level C%, percentile index = floor(Number of Returns × (100 - C) / 100). For 95% confidence with 100 returns, index = floor(100 × 0.05) = 5 (5th worst return).
          </p>
          <p>
            <strong>VaR Value:</strong> VaR = Portfolio Value × |Percentile Return|. The absolute value of the percentile return (typically negative) multiplied by portfolio value gives the maximum expected loss.
          </p>
          <p>
            <strong>VaR Percentage:</strong> VaR % = |Percentile Return| × 100. The VaR as a percentage of portfolio value, representing the maximum expected loss percentage.
          </p>
          <p>
            <strong>Confidence Level:</strong> Common levels are 95% (5% tail risk) and 99% (1% tail risk). Higher confidence levels provide more conservative estimates but may be less practical. 95% is most commonly used.
          </p>
          <p>Historical simulation is a non-parametric method that uses actual historical returns without assuming a distribution. It captures actual market behavior but assumes past patterns will continue. More historical data improves accuracy.</p>
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
                <p className="text-sm text-muted-foreground">Confidence Level</p>
                <p className="text-xl font-semibold text-primary">
                  {result.confidenceLevel.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Tail risk: {100 - result.confidenceLevel}%</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Portfolio Value</p>
                <p className="text-xl font-semibold text-primary">
                  ${result.portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground">$</p>
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
    <meta itemProp="name" content="The Definitive Guide to Value-at-Risk (VaR) Using Historical Simulation: Measuring Portfolio Risk" />
    <meta itemProp="description" content="A comprehensive guide to calculating Value-at-Risk (VaR) using historical simulation method, a non-parametric approach that estimates maximum potential portfolio losses based on actual historical returns." />
    <meta itemProp="keywords" content="value at risk, VaR, historical simulation, portfolio risk, risk measurement, confidence level, percentile return, tail risk, risk management" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-01-02" />
    <meta itemProp="url" content="/definitive-var-historical-simulation-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Value-at-Risk (VaR) Using Historical Simulation: Measuring Portfolio Risk</h1>
    <p className="text-lg italic text-gray-700">A comprehensive guide to understanding and calculating Value-at-Risk (VaR) using historical simulation, a powerful non-parametric method for estimating maximum potential portfolio losses based on actual historical market behavior.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#overview" className="hover:underline">Overview: Value-at-Risk (VaR)</a></li>
        <li><a href="#historical" className="hover:underline">Historical Simulation Method</a></li>
        <li><a href="#calculation" className="hover:underline">VaR Calculation Steps</a></li>
        <li><a href="#interpretation" className="hover:underline">Interpreting VaR Results</a></li>
        <li><a href="#confidence" className="hover:underline">Confidence Levels</a></li>
        <li><a href="#advantages" className="hover:underline">Advantages and Limitations</a></li>
        <li><a href="#applications" className="hover:underline">Applications in Risk Management</a></li>
    </ul>
<hr />

    <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: Value-at-Risk (VaR)</h2>
    <p><b>Value-at-Risk (VaR)</b> is one of the most widely used risk measures in finance, providing a single number that estimates the maximum potential loss in portfolio value over a defined period for a given confidence level. VaR answers the critical question: "What is the worst-case loss I can expect with X% confidence?"</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Concepts</h3>
    <ul>
        <li><b>VaR:</b> Maximum expected loss at a given confidence level</li>
        <li><b>Confidence Level:</b> Probability that losses will not exceed VaR (typically 95% or 99%)</li>
        <li><b>Time Horizon:</b> Period over which VaR is calculated (typically 1 day, 1 week, or 1 month)</li>
        <li><b>Tail Risk:</b> Risk of extreme losses beyond VaR threshold</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Why VaR Matters</h3>
    <p>VaR provides critical insights for:</p>
    <ul>
        <li><b>Risk Measurement:</b> Quantifying portfolio risk in a single number</li>
        <li><b>Capital Allocation:</b> Determining capital requirements for risk</li>
        <li><b>Position Limits:</b> Setting limits on portfolio positions</li>
        <li><b>Risk Communication:</b> Communicating risk to stakeholders</li>
        <li><b>Regulatory Compliance:</b> Meeting regulatory risk reporting requirements</li>
    </ul>

<hr />

    <h2 id="historical" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Historical Simulation Method</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Method Overview</h3>
    <p><b>Historical simulation</b> is a non-parametric method that estimates VaR by analyzing actual historical returns without assuming a specific probability distribution. It uses real market data to capture actual market behavior, including correlations, volatility clustering, and extreme events.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Advantages</h3>
    <ul>
        <li><b>No Distribution Assumptions:</b> Does not assume normal distribution or other parametric forms</li>
        <li><b>Captures Actual Behavior:</b> Reflects real market patterns, correlations, and extreme events</li>
        <li><b>Simple Implementation:</b> Straightforward calculation using historical data</li>
        <li><b>Intuitive:</b> Easy to understand and explain to stakeholders</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Limitations</h3>
    <ul>
        <li><b>Backward-Looking:</b> Assumes past patterns will continue into the future</li>
        <li><b>Data Requirements:</b> Requires sufficient historical data for reliable estimates</li>
        <li><b>Extreme Events:</b> May not capture events not present in historical data</li>
        <li><b>Changing Conditions:</b> May not reflect changing market conditions or regime shifts</li>
    </ul>

<hr />

    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">VaR Calculation Steps</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Step-by-Step Process</h3>
    <ol>
        <li><b>Collect Historical Returns:</b> Gather historical price data and calculate returns for the portfolio or assets</li>
        <li><b>Sort Returns:</b> Arrange historical returns from worst (most negative) to best (most positive)</li>
        <li><b>Determine Percentile:</b> Identify the return at the desired confidence level percentile</li>
        <li><b>Calculate VaR:</b> Multiply portfolio value by the absolute value of the percentile return</li>
    </ol>

    <h3 className="text-xl font-semibold text-foreground mt-6">Example Calculation</h3>
    <p>Suppose you have 100 days of historical returns and want 95% VaR:</p>
    <ul>
        <li>Sort 100 returns from worst to best</li>
        <li>For 95% confidence, identify the 5th worst return (5th percentile)</li>
        <li>If 5th worst return is -2.5% and portfolio value is $1,000,000:</li>
        <li>VaR = $1,000,000 × 2.5% = $25,000</li>
    </ul>
    <p>This means with 95% confidence, losses will not exceed $25,000.</p>

<hr />

    <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting VaR Results</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">VaR Interpretation</h3>
    <p>A VaR of $25,000 at 95% confidence means:</p>
    <ul>
        <li>With 95% probability, losses will not exceed $25,000</li>
        <li>With 5% probability, losses may exceed $25,000</li>
        <li>The maximum expected loss is $25,000 in 95 out of 100 scenarios</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Risk Levels</h3>
    <ul>
        <li><b>VaR &lt; 2%:</b> Very low risk, well-managed portfolio</li>
        <li><b>VaR 2-5%:</b> Low risk, manageable portfolio risk</li>
        <li><b>VaR 5-10%:</b> Moderate risk, requires monitoring</li>
        <li><b>VaR 10-20%:</b> High risk, requires attention</li>
        <li><b>VaR &gt; 20%:</b> Very high risk, urgent review needed</li>
    </ul>

<hr />

    <h2 id="confidence" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Confidence Levels</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Common Confidence Levels</h3>
    <ul>
        <li><b>90%:</b> 10% tail risk, less conservative, more practical</li>
        <li><b>95%:</b> 5% tail risk, most commonly used, balanced approach</li>
        <li><b>99%:</b> 1% tail risk, more conservative, regulatory standard</li>
        <li><b>99.9%:</b> 0.1% tail risk, very conservative, extreme risk focus</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Choosing Confidence Level</h3>
    <p>Select confidence level based on:</p>
    <ul>
        <li><b>Risk Tolerance:</b> Higher tolerance allows lower confidence levels</li>
        <li><b>Regulatory Requirements:</b> Some regulations specify confidence levels (e.g., 99% for Basel)</li>
        <li><b>Practical Use:</b> 95% is most commonly used in practice</li>
        <li><b>Communication:</b> Consider what stakeholders understand</li>
    </ul>

<hr />

    <h2 id="advantages" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Advantages and Limitations</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Advantages</h3>
    <ul>
        <li>No distribution assumptions required</li>
        <li>Captures actual market behavior and correlations</li>
        <li>Simple to implement and understand</li>
        <li>Intuitive for stakeholders</li>
        <li>Handles non-normal distributions naturally</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Limitations</h3>
    <ul>
        <li>Assumes past patterns will continue</li>
        <li>Requires sufficient historical data</li>
        <li>May miss extreme events not in historical data</li>
        <li>May not reflect changing market conditions</li>
        <li>Equal weight to all historical periods</li>
    </ul>

<hr />

    <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Applications in Risk Management</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Risk Measurement</h3>
    <p>VaR provides a single number summarizing portfolio risk, making it easy to:</p>
    <ul>
        <li>Compare risk across different portfolios</li>
        <li>Track risk over time</li>
        <li>Set risk limits and thresholds</li>
        <li>Communicate risk to stakeholders</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Capital Allocation</h3>
    <p>VaR helps determine:</p>
    <ul>
        <li>Capital requirements for risk</li>
        <li>Reserve levels for potential losses</li>
        <li>Risk-adjusted performance metrics</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Position Limits</h3>
    <p>VaR can be used to:</p>
    <ul>
        <li>Set position size limits</li>
        <li>Control portfolio risk exposure</li>
        <li>Ensure compliance with risk limits</li>
    </ul>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p><b>Value-at-Risk (VaR) using historical simulation</b> is a powerful non-parametric method for estimating maximum potential portfolio losses. It uses actual historical returns without distribution assumptions, capturing real market behavior. While it has limitations (backward-looking, data requirements), it remains one of the most widely used risk measures in finance. Regular calculation and monitoring of VaR helps manage portfolio risk effectively.</p>
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
          <p>This tool calculates Value-at-Risk (VaR) using historical simulation method based on portfolio value, historical returns, and confidence level.</p>
          <p>Outputs include VaR value and percentage, percentile return, risk level, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

