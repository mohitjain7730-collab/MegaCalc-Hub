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
  initialValue: z.number({ invalid_type_error: 'Enter initial value' }).min(0),
  meanReturn: z.number({ invalid_type_error: 'Enter mean return' }),
  standardDeviation: z.number({ invalid_type_error: 'Enter standard deviation' }).min(0),
  timeHorizon: z.number({ invalid_type_error: 'Enter time horizon' }).min(1),
  numberOfSimulations: z.number({ invalid_type_error: 'Enter number of simulations' }).min(100).max(10000),
  confidenceLevel: z.number({ invalid_type_error: 'Enter confidence level' }).min(90).max(99.9),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  initialValue: number;
  meanReturn: number;
  standardDeviation: number;
  timeHorizon: number;
  numberOfSimulations: number;
  confidenceLevel: number;
  meanFinalValue: number;
  medianFinalValue: number;
  percentileValue: number;
  expectedLoss: number;
  lossPercentage: number;
  riskLevel: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter initial value (starting portfolio or asset value).',
  'Enter mean return (expected average return, as percentage).',
  'Enter standard deviation (volatility/risk measure, as percentage).',
  'Enter time horizon (number of periods to simulate).',
  'Enter number of simulations (100-10,000, more simulations = more accuracy).',
  'Enter confidence level (90-99.9%, typically 95% or 99%).',
  'Review Monte Carlo results: mean final value, percentile value, expected loss, and risk assessment.',
];

const faqs = [
  {
    question: 'What is Monte Carlo simulation?',
    answer:
      'Monte Carlo simulation is a powerful technique for assessing potential losses by using random sampling to model uncertainty. It generates thousands of possible outcomes based on probability distributions to estimate the range and likelihood of potential results.',
  },
  {
    question: 'How does Monte Carlo work for losses?',
    answer:
      'Monte Carlo simulation generates random returns based on mean return and standard deviation, calculates final values for each simulation, and analyzes the distribution of outcomes. It estimates expected losses, percentiles, and probabilities of different loss scenarios.',
  },
  {
    question: 'What is mean return?',
    answer:
      'Mean return is the expected average return over the time horizon, expressed as a percentage. It represents the central tendency of returns. For example, 8% mean return means average return is expected to be 8% per period.',
  },
  {
    question: 'What is standard deviation?',
    answer:
      'Standard deviation measures volatility or risk, expressed as a percentage. Higher standard deviation indicates greater variability in returns. For example, 15% standard deviation means returns typically vary by ±15% around the mean.',
  },
  {
    question: 'How many simulations do I need?',
    answer:
      'More simulations provide more accurate results but require more computation. Minimum 1,000 simulations is recommended for reliable estimates. 10,000 simulations provide excellent accuracy. Balance accuracy needs with computation time.',
  },
  {
    question: 'What is percentile value?',
    answer:
      'Percentile value is the final value at the specified confidence level percentile. For 95% confidence, it is the 5th percentile (5% of worst outcomes). This represents the value below which only 5% of outcomes fall, providing a conservative estimate.',
  },
  {
    question: 'What is expected loss?',
    answer:
      'Expected loss is the average loss across all simulations, calculated as Initial Value - Mean Final Value. It represents the expected reduction in value over the time horizon, accounting for uncertainty and volatility.',
  },
  {
    question: 'How accurate is Monte Carlo simulation?',
    answer:
      'Monte Carlo accuracy depends on: number of simulations (more = better), quality of input parameters (mean, standard deviation), appropriateness of distribution assumptions, and model complexity. With sufficient simulations and good inputs, accuracy is typically high.',
  },
  {
    question: 'What are limitations of Monte Carlo?',
    answer:
      'Limitations include: assumes normal distribution (may not capture extreme events), requires accurate input parameters, computationally intensive for large simulations, and may not reflect changing market conditions. Results are probabilistic, not deterministic.',
  },
  {
    question: 'How do I use Monte Carlo results?',
    answer:
      'Use results to: assess potential loss scenarios, determine capital requirements, set risk limits, evaluate portfolio strategies, communicate risk to stakeholders, and make informed risk management decisions. Results provide probability-based insights into potential outcomes.',
  },
];

const relatedCalculators = [
  {
    name: 'Value-at-Risk (Historical Simulation) Calculator',
    slug: 'value-at-risk-historical-simulation-calculator',
    description: 'Calculate VaR using historical simulation.',
  },
  {
    name: 'Stress Testing (Portfolio Shock) Simulator',
    slug: 'stress-testing-portfolio-shock-simulator',
    description: 'Simulate portfolio stress testing.',
  },
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
];

const baseUrl = 'https://mycalculating.com/category/finance/scenario-analysis-tool-monte-carlo-for-losses';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Scenario Analysis Tool (Monte Carlo for Losses)', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Scenario Analysis Tool (Monte Carlo for Losses)',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Perform Monte Carlo simulation for scenario analysis to estimate potential losses and assess risk using random sampling and probability distributions.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

// Simple random number generator using Box-Muller transform for normal distribution
const generateNormalRandom = (mean: number, stdDev: number): number => {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + stdDev * z0;
};

const calculateResult = (values: FormValues): ResultPayload => {
  const initialValue = values.initialValue;
  const meanReturn = values.meanReturn; // percentage
  const standardDeviation = values.standardDeviation; // percentage
  const timeHorizon = values.timeHorizon;
  const numberOfSimulations = values.numberOfSimulations;
  const confidenceLevel = values.confidenceLevel;

  // Run Monte Carlo simulation
  const finalValues: number[] = [];
  
  for (let i = 0; i < numberOfSimulations; i++) {
    let currentValue = initialValue;
    
    // Simulate each period
    for (let t = 0; t < timeHorizon; t++) {
      // Generate random return from normal distribution
      const randomReturn = generateNormalRandom(meanReturn / 100, standardDeviation / 100);
      // Apply return to current value
      currentValue = currentValue * (1 + randomReturn);
    }
    
    finalValues.push(currentValue);
  }

  // Sort final values for percentile calculation
  finalValues.sort((a, b) => a - b);

  // Calculate statistics
  const meanFinalValue = finalValues.reduce((sum, val) => sum + val, 0) / finalValues.length;
  const medianFinalValue = finalValues[Math.floor(finalValues.length / 2)];

  // Calculate percentile value at confidence level
  // For 95% confidence, we want the 5th percentile (5% worst outcomes)
  const tailRisk = (100 - confidenceLevel) / 100;
  const percentileIndex = Math.floor(finalValues.length * tailRisk);
  const percentileValue = finalValues[Math.max(0, percentileIndex)];

  // Expected loss = Initial Value - Mean Final Value
  const expectedLoss = initialValue - meanFinalValue;
  const lossPercentage = (expectedLoss / initialValue) * 100;

  // Determine risk level
  let riskLevel = 'Very Low';
  if (lossPercentage > 30) {
    riskLevel = 'Very High';
  } else if (lossPercentage > 20) {
    riskLevel = 'High';
  } else if (lossPercentage > 10) {
    riskLevel = 'Moderate';
  } else if (lossPercentage > 5) {
    riskLevel = 'Low';
  }

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = `Monte Carlo simulation completed (${numberOfSimulations} simulations). Mean final value: $${meanFinalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}, ${confidenceLevel}% percentile: $${percentileValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}. Expected loss: $${expectedLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })} (${lossPercentage.toFixed(2)}%).`;

  if (lossPercentage > 30) {
    status = 'low';
    interpretation = `Very high expected loss (${lossPercentage.toFixed(2)}%) indicates significant risk. Mean final value: $${meanFinalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}, ${confidenceLevel}% percentile: $${percentileValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}. Portfolio may experience substantial losses. Immediate risk mitigation required.`;
  } else if (lossPercentage > 20) {
    status = 'moderate';
    interpretation = `High expected loss (${lossPercentage.toFixed(2)}%) indicates notable risk. Mean final value: $${meanFinalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}, ${confidenceLevel}% percentile: $${percentileValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}. Portfolio may experience significant losses. Consider risk reduction strategies.`;
  } else if (lossPercentage > 10) {
    status = 'good';
    interpretation = `Moderate expected loss (${lossPercentage.toFixed(2)}%) indicates manageable risk. Mean final value: $${meanFinalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}, ${confidenceLevel}% percentile: $${percentileValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}. Portfolio may experience moderate losses. Monitor risk levels.`;
  } else {
    status = 'optimal';
    interpretation = `Low expected loss (${lossPercentage.toFixed(2)}%) indicates minimal risk. Mean final value: $${meanFinalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}, ${confidenceLevel}% percentile: $${percentileValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}. Portfolio risk is well-managed.`;
  }

  const recommendations = [
    `Mean Final Value: $${meanFinalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}. This is the average final value across ${numberOfSimulations.toLocaleString()} simulations, representing the expected outcome based on mean return (${meanReturn.toFixed(2)}%) and volatility (${standardDeviation.toFixed(2)}%).`,
    `${confidenceLevel}% Percentile Value: $${percentileValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}. This represents the value below which only ${100 - confidenceLevel}% of outcomes fall, providing a conservative estimate of potential losses. Loss at this level: $${(initialValue - percentileValue).toLocaleString(undefined, { maximumFractionDigits: 2 })} (${((initialValue - percentileValue) / initialValue * 100).toFixed(2)}%).`,
    `Expected Loss: $${expectedLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })} (${lossPercentage.toFixed(2)}%). ${lossPercentage > 20 ? 'High expected loss suggests significant risk. Consider: reducing volatility, adjusting mean return assumptions, or implementing risk mitigation strategies.' : lossPercentage > 10 ? 'Moderate expected loss suggests manageable risk. Monitor outcomes and adjust strategies if losses exceed risk tolerance.' : 'Low expected loss suggests well-managed risk. Continue monitoring and maintain appropriate risk management.'}`,
  ];
  if (numberOfSimulations < 1000) {
    recommendations.push(`Limited simulations (${numberOfSimulations}). More simulations (1,000+) would improve accuracy. Consider increasing number of simulations for more reliable estimates.`);
  }
  if (standardDeviation > 20) {
    recommendations.push(`High volatility (${standardDeviation.toFixed(2)}%) increases uncertainty and potential losses. Consider: reducing volatility through diversification, hedging, or adjusting portfolio allocation.`);
  }

  const plan = [
    { label: 'This Week', detail: `Review Monte Carlo results: Mean final value $${meanFinalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}, ${confidenceLevel}% percentile $${percentileValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}, Expected loss ${lossPercentage.toFixed(2)}%. Assess risk and compare to risk tolerance.` },
    { label: 'This Month', detail: 'If expected loss exceeds risk tolerance, develop risk mitigation plan: reduce volatility, adjust portfolio allocation, implement hedging strategies, or revise return assumptions. Run additional simulations with different parameters to explore scenarios.' },
    { label: 'Ongoing', detail: 'Conduct Monte Carlo analysis regularly (quarterly or annually) and when portfolio composition or market conditions change. Update parameters (mean return, volatility) based on actual experience and market conditions. Monitor actual outcomes vs. simulated results.' },
  ];

  return {
    initialValue,
    meanReturn,
    standardDeviation,
    timeHorizon,
    numberOfSimulations,
    confidenceLevel,
    meanFinalValue,
    medianFinalValue,
    percentileValue,
    expectedLoss,
    lossPercentage,
    riskLevel,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function ScenarioAnalysisToolMonteCarloForLosses() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      initialValue: undefined,
      meanReturn: undefined,
      standardDeviation: undefined,
      timeHorizon: undefined,
      numberOfSimulations: 1000,
      confidenceLevel: 95,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="monte-carlo-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Scenario Analysis Tool (Monte Carlo for Losses)
          </CardTitle>
          <CardDescription>Perform Monte Carlo simulation for scenario analysis to estimate potential losses and assess risk using random sampling and probability distributions.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => {
              setIsCalculating(true);
              setTimeout(() => {
                try {
                  setResult(calculateResult(values));
                } catch (error) {
                  alert(error instanceof Error ? error.message : 'An error occurred');
                } finally {
                  setIsCalculating(false);
                }
              }, 100);
            })} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="initialValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Value ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 1000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="meanReturn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mean Return (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="standardDeviation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Standard Deviation (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timeHorizon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Horizon (periods)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 12" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="numberOfSimulations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Simulations</FormLabel>
                      <FormControl>
                        <Input type="number" step="100" placeholder="e.g., 1000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
              </div>
              <Button type="submit" className="w-full md:w-auto" disabled={isCalculating}>
                {isCalculating ? 'Running simulation...' : 'Run Monte Carlo simulation'}
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
            <CardDescription>See Monte Carlo simulation results: mean final value, percentile value, expected loss, and risk assessment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Mean Final Value</p>
                <p className="text-2xl font-semibold text-primary">{result.meanFinalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">{result.confidenceLevel}% Percentile</p>
                <p className="text-2xl font-semibold text-primary">{result.percentileValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Expected Loss</p>
                <p className="text-2xl font-semibold text-primary">{result.expectedLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground">$ ({result.lossPercentage.toFixed(2)}%)</p>
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
            <strong>Monte Carlo Simulation:</strong> For each simulation, generate random returns from normal distribution N(mean, stdDev) for each period, apply returns sequentially to calculate final value, repeat for specified number of simulations.
          </p>
          <p>
            <strong>Random Return Generation:</strong> Using Box-Muller transform: z = sqrt(-2 × ln(u1)) × cos(2π × u2), where u1 and u2 are uniform random numbers. Return = mean + stdDev × z.
          </p>
          <p>
            <strong>Final Value Calculation:</strong> For each period: Value(t) = Value(t-1) × (1 + RandomReturn). Final value after all periods is the simulation outcome.
          </p>
          <p>
            <strong>Mean Final Value:</strong> Average of all simulation final values. Represents expected outcome based on mean return and volatility assumptions.
          </p>
          <p>
            <strong>Percentile Value:</strong> Value at specified confidence level percentile. For 95% confidence, it is the 5th percentile (5% worst outcomes). Calculated by sorting final values and selecting value at percentile index.
          </p>
          <p>
            <strong>Expected Loss:</strong> Expected Loss = Initial Value - Mean Final Value. Represents average loss across all simulations, accounting for uncertainty and volatility.
          </p>
          <p>Monte Carlo simulation uses random sampling to model uncertainty and estimate potential outcomes. More simulations provide more accurate estimates. Results are probabilistic, representing the distribution of possible outcomes rather than deterministic predictions.</p>
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
                <p className="text-sm text-muted-foreground">Median Final Value</p>
                <p className="text-xl font-semibold text-primary">
                  ${result.medianFinalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Simulations Run</p>
                <p className="text-xl font-semibold text-primary">
                  {result.numberOfSimulations.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Iterations</p>
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
    <meta itemProp="name" content="The Definitive Guide to Monte Carlo Simulation for Scenario Analysis: Estimating Potential Losses Through Random Sampling" />
    <meta itemProp="description" content="A comprehensive guide to Monte Carlo simulation for scenario analysis, a powerful technique for assessing potential losses by using random sampling to model uncertainty and estimate the range and likelihood of potential outcomes." />
    <meta itemProp="keywords" content="Monte Carlo simulation, scenario analysis, random sampling, probability distribution, expected loss, risk assessment, portfolio simulation, uncertainty modeling, financial modeling" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-01-02" />
    <meta itemProp="url" content="/definitive-monte-carlo-scenario-analysis-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Monte Carlo Simulation for Scenario Analysis: Estimating Potential Losses Through Random Sampling</h1>
    <p className="text-lg italic text-gray-700">A comprehensive guide to understanding and performing Monte Carlo simulation for scenario analysis, a powerful technique for assessing potential losses by using random sampling to model uncertainty and estimate the range and likelihood of potential outcomes.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#overview" className="hover:underline">Overview: Monte Carlo Simulation</a></li>
        <li><a href="#process" className="hover:underline">Monte Carlo Process</a></li>
        <li><a href="#parameters" className="hover:underline">Input Parameters</a></li>
        <li><a href="#calculation" className="hover:underline">Simulation Calculation</a></li>
        <li><a href="#results" className="hover:underline">Interpreting Results</a></li>
        <li><a href="#applications" className="hover:underline">Applications</a></li>
        <li><a href="#best" className="hover:underline">Best Practices</a></li>
    </ul>
<hr />

    <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: Monte Carlo Simulation</h2>
    <p><b>Monte Carlo simulation</b> is a powerful technique for assessing potential losses in scenario analysis by employing random sampling to model uncertainty. It generates thousands of possible outcomes based on probability distributions to estimate the range and likelihood of potential results, providing probability-based insights into potential losses.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Concepts</h3>
    <ul>
        <li><b>Monte Carlo Simulation:</b> Random sampling technique to model uncertainty</li>
        <li><b>Random Sampling:</b> Generating random values from probability distributions</li>
        <li><b>Simulation Iterations:</b> Running model thousands of times with different random inputs</li>
        <li><b>Outcome Distribution:</b> Analyzing distribution of simulation results</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Why Monte Carlo Matters</h3>
    <p>Monte Carlo simulation provides critical insights for:</p>
    <ul>
        <li><b>Risk Assessment:</b> Estimating potential losses and their probabilities</li>
        <li><b>Scenario Analysis:</b> Evaluating outcomes under uncertainty</li>
        <li><b>Decision Making:</b> Making informed decisions with probability-based information</li>
        <li><b>Capital Planning:</b> Determining capital requirements for potential losses</li>
    </ul>

<hr />

    <h2 id="process" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Monte Carlo Process</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Step-by-Step Process</h3>
    <ol>
        <li><b>Define Model:</b> Identify key variables (returns, volatility, time horizon)</li>
        <li><b>Assign Distributions:</b> Specify probability distributions for variables (typically normal distribution)</li>
        <li><b>Generate Random Samples:</b> Use random sampling to draw values from distributions</li>
        <li><b>Run Simulation:</b> Calculate outcome for each set of sampled values</li>
        <li><b>Repeat:</b> Perform large number of iterations (1,000-10,000+)</li>
        <li><b>Analyze Results:</b> Aggregate outcomes to estimate statistics (mean, percentiles, probabilities)</li>
    </ol>

    <h3 className="text-xl font-semibold text-foreground mt-6">Random Sampling Methods</h3>
    <ul>
        <li><b>Box-Muller Transform:</b> Generates normal random numbers from uniform random numbers</li>
        <li><b>Inverse Transform:</b> Uses cumulative distribution function to generate random samples</li>
        <li><b>Acceptance-Rejection:</b> Generates samples from proposal distribution and accepts/rejects based on criteria</li>
    </ul>

<hr />

    <h2 id="parameters" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Input Parameters</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Required Parameters</h3>
    <ul>
        <li><b>Initial Value:</b> Starting portfolio or asset value</li>
        <li><b>Mean Return:</b> Expected average return (percentage)</li>
        <li><b>Standard Deviation:</b> Volatility/risk measure (percentage)</li>
        <li><b>Time Horizon:</b> Number of periods to simulate</li>
        <li><b>Number of Simulations:</b> Iterations to run (1,000-10,000 recommended)</li>
        <li><b>Confidence Level:</b> Percentile for conservative estimates (typically 95% or 99%)</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Parameter Selection</h3>
    <p>Select parameters based on:</p>
    <ul>
        <li>Historical data and market analysis</li>
        <li>Expert judgment and forecasts</li>
        <li>Industry benchmarks and standards</li>
        <li>Regulatory requirements</li>
    </ul>

<hr />

    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Simulation Calculation</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">For Each Simulation</h3>
    <ol>
        <li>Generate random return from normal distribution N(mean, stdDev) for each period</li>
        <li>Apply return to current value: Value(t) = Value(t-1) × (1 + RandomReturn)</li>
        <li>Repeat for all periods in time horizon</li>
        <li>Record final value as simulation outcome</li>
    </ol>

    <h3 className="text-xl font-semibold text-foreground mt-6">Result Aggregation</h3>
    <ul>
        <li><b>Mean Final Value:</b> Average of all simulation final values</li>
        <li><b>Median Final Value:</b> Middle value when sorted</li>
        <li><b>Percentile Value:</b> Value at specified confidence level percentile</li>
        <li><b>Expected Loss:</b> Initial Value - Mean Final Value</li>
    </ul>

<hr />

    <h2 id="results" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting Results</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Mean Final Value</h3>
    <p>Represents expected outcome based on mean return and volatility. Higher mean return and lower volatility increase mean final value.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Percentile Value</h3>
    <p>Conservative estimate at confidence level. For 95% confidence, represents value below which only 5% of worst outcomes fall. Useful for capital planning and risk limits.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Expected Loss</h3>
    <p>Average loss across all simulations. Accounts for uncertainty and volatility. Higher volatility increases expected loss even with positive mean return.</p>

<hr />

    <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Applications</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Risk Assessment</h3>
    <p>Use Monte Carlo to:</p>
    <ul>
        <li>Estimate potential losses and their probabilities</li>
        <li>Assess portfolio risk under uncertainty</li>
        <li>Evaluate risk-return trade-offs</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Capital Planning</h3>
    <p>Use results to:</p>
    <ul>
        <li>Determine capital requirements for potential losses</li>
        <li>Set risk limits and position sizes</li>
        <li>Plan for extreme scenarios</li>
    </ul>

<hr />

    <h2 id="best" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Best Practices</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Number of Simulations</h3>
    <p>Use sufficient simulations:</p>
    <ul>
        <li>Minimum 1,000 for basic estimates</li>
        <li>5,000-10,000 for reliable estimates</li>
        <li>More simulations = better accuracy but more computation</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Parameter Accuracy</h3>
    <p>Ensure accurate inputs:</p>
    <ul>
        <li>Use historical data and market analysis</li>
        <li>Validate assumptions regularly</li>
        <li>Update parameters as conditions change</li>
    </ul>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p><b>Monte Carlo simulation</b> is a powerful technique for scenario analysis that uses random sampling to model uncertainty and estimate potential losses. It generates thousands of possible outcomes to provide probability-based insights. Key outputs include mean final value (expected outcome), percentile value (conservative estimate), and expected loss (average loss). More simulations improve accuracy. Regular analysis helps assess risk, plan capital, and make informed decisions under uncertainty.</p>
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
          <p>This tool performs Monte Carlo simulation for scenario analysis to estimate potential losses and assess risk using random sampling and probability distributions.</p>
          <p>Outputs include mean final value, median final value, percentile value, expected loss and percentage, risk level, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

