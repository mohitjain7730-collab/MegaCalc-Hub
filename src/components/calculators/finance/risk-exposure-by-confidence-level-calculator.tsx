'use client';

import React, { useState } from 'react';
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
  volatility: z.number({ invalid_type_error: 'Enter volatility' }).min(0).max(100),
  confidenceLevel: z.number({ invalid_type_error: 'Enter confidence level' }).min(0).max(100),
  timeHorizon: z.number({ invalid_type_error: 'Enter time horizon' }).min(0.01),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  portfolioValue: number;
  volatility: number;
  confidenceLevel: number;
  timeHorizon: number;
  varValue: number;
  varPercentage: number;
  zScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter portfolio value (total investment value).',
  'Enter volatility (standard deviation of returns as percentage, e.g., 15 for 15%).',
  'Enter confidence level (percentage, e.g., 95 for 95%).',
  'Enter time horizon (number of days or periods).',
  'Review Value-at-Risk (VaR), risk exposure, and recommendations.',
];

const faqs = [
  {
    question: 'What is Value-at-Risk (VaR)?',
    answer:
      'Value-at-Risk (VaR) is a statistical measure that estimates the maximum potential loss in portfolio value over a defined period for a given confidence level. It quantifies risk exposure under normal market conditions.',
  },
  {
    question: 'How is VaR calculated?',
    answer:
      'VaR is calculated as: VaR = Portfolio Value × Z-score × Volatility × √Time Horizon. The Z-score corresponds to the confidence level (e.g., 1.645 for 95%, 2.326 for 99%).',
  },
  {
    question: 'What is confidence level?',
    answer:
      'Confidence level represents the probability that losses will not exceed VaR. For example, 95% confidence means there is a 5% chance that losses will exceed the VaR amount. Higher confidence levels result in higher VaR values.',
  },
  {
    question: 'What is volatility?',
    answer:
      'Volatility is the standard deviation of portfolio returns, representing the variability or uncertainty of returns. Higher volatility indicates greater risk and results in higher VaR values.',
  },
  {
    question: 'How does time horizon affect VaR?',
    answer:
      'Longer time horizons increase VaR because risk compounds over time. VaR scales with the square root of time, meaning a 10-day VaR is approximately √10 times the 1-day VaR.',
  },
  {
    question: 'What are limitations of VaR?',
    answer:
      'VaR assumes normal distribution of returns, which may not hold in extreme market conditions. It does not capture tail risks beyond the confidence level and may underestimate risk during market crises.',
  },
  {
    question: 'How can I reduce risk exposure?',
    answer:
      'Reduce risk exposure by: diversifying the portfolio, reducing volatility through asset allocation, hedging positions, reducing leverage, and implementing risk management controls.',
  },
  {
    question: 'What is a good VaR?',
    answer:
      'VaR acceptability depends on risk tolerance and portfolio objectives. Lower VaR indicates lower risk exposure. Compare VaR to portfolio value and ensure it aligns with risk tolerance and investment objectives.',
  },
  {
    question: 'How does VaR relate to portfolio management?',
    answer:
      'VaR helps set risk limits, allocate capital, evaluate portfolio performance, and make informed investment decisions. It provides a common metric for comparing risk across different portfolios and strategies.',
  },
  {
    question: 'When should I consult a risk manager?',
    answer:
      'Consult a risk manager for complex portfolios, regulatory compliance, stress testing, scenario analysis, and comprehensive risk management strategies. Professional risk analysis provides detailed risk assessment and mitigation recommendations.',
  },
];

const relatedCalculators = [
  {
    name: 'Value-at-Risk (Historical Simulation) Calculator',
    slug: 'value-at-risk-historical-simulation-calculator',
    description: 'Calculate VaR using historical simulation method based on historical returns.',
  },
  {
    name: 'Conditional VaR (CVaR) Backtest Calculator',
    slug: 'conditional-var-cvar-backtest-calculator',
    description: 'Backtest Conditional Value-at-Risk models to assess tail risk capture.',
  },
  {
    name: 'Stress Testing (Portfolio Shock) Simulator',
    slug: 'stress-testing-portfolio-shock-simulator',
    description: 'Simulate portfolio stress testing under extreme market conditions.',
  },
  {
    name: 'Sensitivity to Correlation (Diversification) Calculator',
    slug: 'sensitivity-to-correlation-diversification-calculator',
    description: 'Calculate portfolio sensitivity to correlation and diversification benefits.',
  },
];

const baseUrl = 'https://mycalculating.com/category/finance/risk-exposure-by-confidence-level-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Risk Exposure by Confidence Level Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Risk Exposure by Confidence Level Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate Value-at-Risk (VaR) and risk exposure by confidence level based on portfolio value, volatility, confidence level, and time horizon.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const portfolioValue = values.portfolioValue;
  const volatility = values.volatility / 100; // Convert percentage to decimal
  const confidenceLevel = values.confidenceLevel / 100; // Convert percentage to decimal
  const timeHorizon = values.timeHorizon;

  // Calculate Z-score for confidence level
  let zScore: number;
  if (confidenceLevel === 0.95) {
    zScore = 1.645;
  } else if (confidenceLevel === 0.99) {
    zScore = 2.326;
  } else if (confidenceLevel === 0.90) {
    zScore = 1.282;
  } else if (confidenceLevel === 0.975) {
    zScore = 1.96;
  } else {
    // Approximation for other confidence levels using inverse normal
    zScore = Math.sqrt(2) * Math.sqrt(-Math.log(1 - confidenceLevel));
  }

  // Calculate VaR using parametric method
  // VaR = Portfolio Value × Z-score × Volatility × √Time Horizon
  const varValue = portfolioValue * zScore * volatility * Math.sqrt(timeHorizon);
  const varPercentage = (varValue / portfolioValue) * 100;

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Risk exposure calculated. VaR represents the maximum expected loss at the specified confidence level under normal market conditions.';

  if (varPercentage >= 20) {
    status = 'low';
    interpretation = 'Very high risk exposure (VaR ≥ 20% of portfolio). Significant potential losses possible. Consider reducing volatility, diversifying portfolio, or reducing position sizes to lower risk exposure.';
  } else if (varPercentage >= 10) {
    status = 'moderate';
    interpretation = 'High risk exposure (VaR 10-20% of portfolio). Elevated potential losses. Review portfolio allocation, consider diversification, and ensure risk aligns with objectives and risk tolerance.';
  } else if (varPercentage >= 5) {
    status = 'good';
    interpretation = 'Moderate risk exposure (VaR 5-10% of portfolio). Manageable potential losses. Monitor regularly and ensure risk exposure aligns with investment objectives and risk tolerance.';
  } else {
    status = 'optimal';
    interpretation = 'Low risk exposure (VaR < 5% of portfolio). Lower potential losses. Continue maintaining appropriate risk management and portfolio diversification to sustain low risk exposure.';
  }

  const recommendations = [
    `Value-at-Risk (VaR): $${varValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} (${varPercentage.toFixed(2)}% of portfolio). This represents the maximum expected loss at ${(confidenceLevel * 100).toFixed(0)}% confidence level over ${timeHorizon} ${timeHorizon === 1 ? 'period' : 'periods'}.`,
    `Z-score: ${zScore.toFixed(3)} for ${(confidenceLevel * 100).toFixed(0)}% confidence level. This statistical measure corresponds to the confidence level in the normal distribution.`,
    `Volatility: ${(volatility * 100).toFixed(2)}% (annualized). Higher volatility increases VaR and risk exposure. Consider strategies to reduce volatility if risk exposure is too high.`,
  ];
  if (varPercentage >= 10) {
    recommendations.push('High risk exposure requires immediate attention. Consider reducing portfolio volatility through diversification, hedging, or reducing position sizes to lower VaR and risk exposure.');
  } else if (varPercentage >= 5) {
    recommendations.push('Moderate risk exposure should be monitored. Ensure portfolio allocation and risk management align with investment objectives and risk tolerance. Review regularly.');
  } else {
    recommendations.push('Low risk exposure indicates good risk management. Continue maintaining appropriate diversification and risk controls to sustain low risk exposure and portfolio stability.');
  }
  if (volatility > 0.25) {
    recommendations.push('High volatility (above 25%) significantly increases risk exposure. Consider reducing volatility through diversification, asset allocation, or risk management strategies.');
  }

  const plan = [
    { label: 'This Week', detail: `Review VaR: $${varValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} (${varPercentage.toFixed(2)}% of portfolio) at ${(confidenceLevel * 100).toFixed(0)}% confidence. Assess if risk exposure aligns with objectives and risk tolerance.` },
    { label: 'This Month', detail: 'If risk exposure is too high, take action: diversify portfolio, reduce volatility through asset allocation, implement hedging strategies, or reduce position sizes to lower VaR and risk exposure.' },
    { label: 'Ongoing', detail: 'Continuously monitor VaR and risk exposure. Maintain appropriate diversification, risk management controls, and portfolio allocation to ensure risk exposure remains within acceptable levels aligned with objectives.' },
  ];

  return {
    portfolioValue,
    volatility: values.volatility,
    confidenceLevel: values.confidenceLevel,
    timeHorizon,
    varValue,
    varPercentage,
    zScore,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function RiskExposureByConfidenceLevelCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      portfolioValue: undefined,
      volatility: undefined,
      confidenceLevel: 95,
      timeHorizon: 1,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="risk-exposure-confidence-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Risk Exposure by Confidence Level Calculator
          </CardTitle>
          <CardDescription>Calculate Value-at-Risk (VaR) and risk exposure by confidence level based on portfolio value, volatility, confidence level, and time horizon.</CardDescription>
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
                console.error('Error calculating result:', error);
                alert('An error occurred while calculating. Please check the console for details.');
              }
            }, (errors) => {
              console.log('Form validation errors:', errors);
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
                  name="volatility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Volatility (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                        <Input type="number" step="0.01" placeholder="e.g., 95" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Time Horizon (days/periods)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 1" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate risk exposure
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
            <CardDescription>See Value-at-Risk (VaR), risk exposure, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Value-at-Risk (VaR)</p>
                <p className="text-2xl font-semibold text-primary">${result.varValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground">Maximum expected loss</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">VaR Percentage</p>
                <p className="text-2xl font-semibold text-primary">{result.varPercentage.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">Of portfolio value</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Z-Score</p>
                <p className="text-2xl font-semibold text-primary">{result.zScore.toFixed(3)}</p>
                <p className="text-xs text-muted-foreground">For {result.confidenceLevel.toFixed(0)}% confidence</p>
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
            <strong>Z-Score</strong> = Statistical measure corresponding to confidence level. Common values: 1.645 (95%), 2.326 (99%), 1.282 (90%), 1.96 (97.5%).
          </p>
          <p>
            <strong>Value-at-Risk (VaR)</strong> = Portfolio Value × Z-Score × Volatility × √Time Horizon. This represents the maximum expected loss at the specified confidence level under normal market conditions.
          </p>
          <p>
            <strong>VaR Percentage</strong> = (VaR / Portfolio Value) × 100. The percentage of portfolio value at risk.
          </p>
          <p>This calculation uses the parametric method, assuming normally distributed returns. VaR scales with the square root of time horizon. Higher volatility and confidence levels increase VaR and risk exposure.</p>
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
                <p className="text-sm text-muted-foreground">Remaining Value</p>
                <p className="text-xl font-semibold text-primary">
                  ${(result.portfolioValue - result.varValue).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground">After VaR loss</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Volatility Impact</p>
                <p className="text-xl font-semibold text-primary">
                  {result.volatility.toFixed(2)}%
                </p>
                <p className="text-xs text-muted-foreground">Annualized</p>
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
        className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/FinancialProduct"
      >
    <meta itemProp="name" content="The Definitive Guide to Risk Exposure by Confidence Level: Value-at-Risk (VaR) Calculation" />
    <meta itemProp="description" content="A comprehensive guide to calculating and understanding Value-at-Risk (VaR) and risk exposure by confidence level, a critical metric for portfolio risk management." />
    <meta itemProp="keywords" content="value at risk, VaR, risk exposure, confidence level, portfolio risk, volatility, risk management" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-01-02" />
    <meta itemProp="url" content="/definitive-risk-exposure-confidence-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Risk Exposure by Confidence Level: Value-at-Risk (VaR) Calculation</h1>
    <p className="text-lg italic text-muted-foreground">A comprehensive guide to understanding and calculating Value-at-Risk (VaR) and risk exposure by confidence level, a critical metric for portfolio risk management and investment decision-making.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#overview" className="hover:underline">Overview: Value-at-Risk (VaR)</a></li>
        <li><a href="#calculation" className="hover:underline">VaR Calculation</a></li>
        <li><a href="#confidence" className="hover:underline">Confidence Levels</a></li>
        <li><a href="#interpretation" className="hover:underline">Interpretation and Risk Management</a></li>
    </ul>
<hr />

    <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: Value-at-Risk (VaR)</h2>
    <p><b>Value-at-Risk (VaR)</b> is a statistical measure that estimates the maximum potential loss in portfolio value over a defined period for a given confidence level. It quantifies risk exposure under normal market conditions.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Concepts</h3>
    <ul>
        <li><b>Portfolio Value:</b> Total investment value at risk</li>
        <li><b>Volatility:</b> Standard deviation of returns, representing return variability</li>
        <li><b>Confidence Level:</b> Probability that losses will not exceed VaR (e.g., 95% means 5% chance of exceeding VaR)</li>
        <li><b>Time Horizon:</b> Period over which risk is assessed (days, weeks, months)</li>
        <li><b>Z-Score:</b> Statistical measure corresponding to confidence level in normal distribution</li>
    </ul>

<hr />

    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">VaR Calculation</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Parametric Method</h3>
    <p>VaR is calculated using the parametric method:</p>
    <p><b>VaR = Portfolio Value × Z-Score × Volatility × √Time Horizon</b></p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Example Calculation</h3>
    <p>For a $1,000,000 portfolio with 15% volatility, 95% confidence, and 1-day horizon:</p>
    <ul>
        <li>Z-Score (95%) = 1.645</li>
        <li>VaR = $1,000,000 × 1.645 × 0.15 × √1 = $24,675</li>
        <li>This means 5% chance of losing more than $24,675 in one day</li>
    </ul>

<hr />

    <h2 id="confidence" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Confidence Levels</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Common Confidence Levels</h3>
    <ul>
        <li><b>90%:</b> Z-Score = 1.282, 10% chance of exceeding VaR</li>
        <li><b>95%:</b> Z-Score = 1.645, 5% chance of exceeding VaR (most common)</li>
        <li><b>97.5%:</b> Z-Score = 1.96, 2.5% chance of exceeding VaR</li>
        <li><b>99%:</b> Z-Score = 2.326, 1% chance of exceeding VaR</li>
    </ul>
    <p>Higher confidence levels result in higher VaR values, as they account for more extreme scenarios.</p>

<hr />

    <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpretation and Risk Management</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Risk Levels</h3>
    <ul>
        <li><b>VaR < 5%:</b> Low risk exposure, favorable risk profile</li>
        <li><b>VaR 5-10%:</b> Moderate risk exposure, manageable with monitoring</li>
        <li><b>VaR 10-20%:</b> High risk exposure, requires attention and risk mitigation</li>
        <li><b>VaR ≥ 20%:</b> Very high risk exposure, immediate action required</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Risk Mitigation</h3>
    <p>Reduce risk exposure by: diversifying portfolio, reducing volatility through asset allocation, hedging positions, reducing leverage, and implementing risk management controls.</p>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p><b>Value-at-Risk (VaR)</b> is a critical metric for assessing portfolio risk exposure. Lower VaR indicates lower risk. Monitor VaR regularly, ensure it aligns with risk tolerance and investment objectives, and implement risk management strategies to maintain appropriate risk exposure.</p>
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
          <p>This tool calculates Value-at-Risk (VaR) and risk exposure by confidence level based on portfolio value, volatility, confidence level, and time horizon.</p>
          <p>Outputs include VaR value, VaR percentage, Z-score, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
