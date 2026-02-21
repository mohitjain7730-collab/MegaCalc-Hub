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
  standardDeviation: z.number({ invalid_type_error: 'Enter standard deviation' }).min(0).max(100),
  timeHorizon: z.number({ invalid_type_error: 'Enter time horizon' }).min(0),
  confidenceLevel: z.number({ invalid_type_error: 'Enter confidence level' }).min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  portfolioValue: number;
  standardDeviation: number;
  timeHorizon: number;
  confidenceLevel: number;
  zScore: number;
  riskExposure: number;
  interpretation: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter portfolio value (current value of the portfolio).',
  'Enter standard deviation (volatility) as a percentage (e.g., 15 for 15%).',
  'Enter time horizon in days.',
  'Enter confidence level as a percentage (e.g., 95 for 95%).',
  'Review risk exposure calculation and recommendations.',
];

const faqs = [
  {
    question: 'What is risk exposure by confidence level?',
    answer:
      'Risk exposure by confidence level calculates the potential loss at a specific confidence level (e.g., 95%) using Value-at-Risk (VaR) methodology. It estimates the maximum loss expected with a given probability over a time horizon.',
  },
  {
    question: 'What is Value-at-Risk (VaR)?',
    answer:
      'Value-at-Risk is a statistical measure that estimates the potential loss in portfolio value over a specified time period at a given confidence level. For example, 95% VaR tells you the loss that will not be exceeded 95% of the time.',
  },
  {
    question: 'How is risk exposure calculated?',
    answer:
      'Risk Exposure = Z-score Ã— Standard Deviation Ã— âˆšTime Horizon Ã— Portfolio Value. The Z-score corresponds to the confidence level (e.g., 1.645 for 95%, 2.33 for 99%).',
  },
  {
    question: 'What is a Z-score?',
    answer:
      'Z-score is the number of standard deviations from the mean for a given confidence level. Common values: 1.28 (90%), 1.645 (95%), 2.33 (99%). Higher confidence levels require higher Z-scores, indicating larger potential losses.',
  },
  {
    question: 'How does confidence level affect risk exposure?',
    answer:
      'Higher confidence levels (e.g., 99% vs 95%) result in higher risk exposure estimates because you are accounting for more extreme scenarios. A 99% VaR is more conservative and shows larger potential losses than 95% VaR.',
  },
  {
    question: 'How does time horizon affect risk?',
    answer:
      'Longer time horizons increase risk exposure because volatility compounds over time. The risk exposure increases with the square root of time, meaning a 4-day horizon has twice the risk of a 1-day horizon.',
  },
  {
    question: 'What is standard deviation in this context?',
    answer:
      'Standard deviation measures portfolio volatility (price fluctuations). Higher volatility means larger potential gains and losses. It is typically expressed as a percentage (e.g., 15% annual volatility) and converted to daily if needed.',
  },
  {
    question: 'How do I interpret the risk exposure?',
    answer:
      'Risk exposure shows the maximum expected loss at your chosen confidence level. For example, a $10,000 risk exposure at 95% confidence means there is a 5% chance of losing more than $10,000 over the time horizon.',
  },
  {
    question: 'What are limitations of VaR?',
    answer:
      'VaR assumes normal distribution of returns, which may not hold in extreme markets. It does not indicate loss magnitude beyond the VaR threshold. Use VaR alongside stress testing and scenario analysis for comprehensive risk assessment.',
  },
  {
    question: 'How do I use risk exposure for risk management?',
    answer:
      'Use risk exposure to set position limits, determine capital requirements, assess portfolio risk, and inform risk management decisions. Monitor actual losses against VaR estimates and adjust portfolios when exposure exceeds acceptable levels.',
  },
];

const relatedCalculators = [
  {
    name: 'Value-at-Risk (Historical Simulation) Calculator',
    slug: 'value-at-risk-historical-simulation-calculator',
    description: 'Calculate VaR using historical simulation.',
  },
  {
    name: 'Conditional Value at Risk Calculator',
    slug: 'conditional-value-at-risk-calculator',
    description: 'Calculate tail risk and expected shortfall.',
  },
  {
    name: 'Expected Shortfall Calculator',
    slug: 'expected-shortfall-calculator',
    description: 'Calculate expected shortfall for tail risk.',
  },
  {
    name: 'Stress Testing (Portfolio Shock) Simulator',
    slug: 'stress-testing-portfolio-shock-simulator',
    description: 'Simulate portfolio stress scenarios.',
  },
];

const baseUrl = 'https://mycalculating.com/finance/risk-exposure-by-confidence-level-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/finance' },
        { '@type': 'ListItem', position: 3, name: 'Risk Exposure by Confidence Level Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Risk Exposure by Confidence Level Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate risk exposure (VaR) at different confidence levels based on portfolio value, volatility, time horizon, and confidence level.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

// Z-score lookup for common confidence levels
const getZScore = (confidenceLevel: number): number => {
  const level = confidenceLevel / 100;
  if (level <= 0.90) return 1.28;
  if (level <= 0.95) return 1.645;
  if (level <= 0.975) return 1.96;
  if (level <= 0.99) return 2.33;
  if (level <= 0.995) return 2.58;
  return 3.0; // 99.9% and above
};

const calculateResult = (values: FormValues): ResultPayload => {
  const portfolioValue = values.portfolioValue;
  const standardDeviation = values.standardDeviation / 100; // Convert percentage to decimal
  const timeHorizon = values.timeHorizon;
  const confidenceLevel = values.confidenceLevel;
  
  const zScore = getZScore(confidenceLevel);
  
  // VaR = Z Ã— Ïƒ Ã— âˆšt Ã— V
  const riskExposure = zScore * standardDeviation * Math.sqrt(timeHorizon) * portfolioValue;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = `At ${confidenceLevel}% confidence level, the estimated maximum loss is ${riskExposure.toLocaleString()} over ${timeHorizon} day(s). This means there is a ${(100 - confidenceLevel)}% chance of exceeding this loss.`;
  
  const riskPercent = (riskExposure / portfolioValue) * 100;
  if (riskPercent > 20) {
    status = 'low';
    interpretation += ' High risk exposure detected. Consider reducing portfolio risk or increasing capital buffers.';
  } else if (riskPercent > 10) {
    status = 'moderate';
    interpretation += ' Moderate risk exposure. Monitor portfolio performance and maintain adequate capital.';
  } else {
    status = 'optimal';
  }

  const recommendations = [
    `Monitor actual losses against VaR: Compare realized losses to the ${riskExposure.toLocaleString()} VaR estimate to validate model accuracy and portfolio risk assumptions.`,
    `Consider multiple confidence levels: Calculate VaR at 90%, 95%, and 99% to understand risk across different scenarios and tail risks.`,
    'Use complementary risk measures: Combine VaR with stress testing, scenario analysis, and expected shortfall for comprehensive risk assessment.',
    `Review portfolio composition: ${riskPercent.toFixed(2)}% risk exposure relative to portfolio value. Consider diversification, hedging, or position sizing adjustments if exposure exceeds acceptable levels.`,
  ];
  
  if (timeHorizon > 30) {
    recommendations.push('Long time horizon detected: Risk estimates for long horizons may be less reliable. Use scenario analysis and stress testing for extended periods.');
  }
  if (standardDeviation * 100 > 30) {
    recommendations.push('High volatility detected: Portfolios with high volatility have larger risk exposure. Consider risk reduction strategies or more conservative positions.');
  }

  const plan = [
    { label: 'This Week', detail: `Calculate risk exposure: ${riskExposure.toLocaleString()} at ${confidenceLevel}% confidence over ${timeHorizon} days. Document assumptions including volatility and confidence level.` },
    { label: 'This Month', detail: 'Monitor actual portfolio losses against VaR estimates. Review and update volatility estimates based on recent market conditions and portfolio changes.' },
    { label: 'Ongoing', detail: 'Regularly recalculate VaR as portfolio composition and market conditions change. Use risk exposure for position limits, capital planning, and risk management decisions.' },
  ];

  return { portfolioValue, standardDeviation: values.standardDeviation, timeHorizon, confidenceLevel, zScore, riskExposure, interpretation, status, recommendations, plan };
};

export default function RiskExposureByConfidenceLevelCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      portfolioValue: undefined,
      standardDeviation: undefined,
      timeHorizon: undefined,
      confidenceLevel: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="risk-exposure-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Risk Exposure by Confidence Level Calculator
          </CardTitle>
          <CardDescription>Calculate risk exposure (VaR) at different confidence levels based on portfolio value, volatility, time horizon, and confidence level.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your portfolio data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="portfolioValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Portfolio Value</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 1000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Time Horizon (days)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 1" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
              <Button type="submit" className="w-full md:w-auto">
                Calculate Risk Exposure
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
            <CardDescription>See risk exposure calculation and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Risk Exposure (VaR)</p>
                <p className="text-2xl font-semibold text-primary">{result.riskExposure.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Maximum expected loss</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Z-Score</p>
                <p className="text-2xl font-semibold text-primary">{result.zScore.toFixed(3)}</p>
                <p className="text-xs text-muted-foreground">For {result.confidenceLevel}%</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Risk as % of Portfolio</p>
                <p className="text-2xl font-semibold text-primary">{((result.riskExposure / result.portfolioValue) * 100).toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">Exposure ratio</p>
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
            <strong>Risk Exposure (VaR)</strong> = Z-score Ã— Standard Deviation Ã— âˆšTime Horizon Ã— Portfolio Value
          </p>
          <p>
            <strong>Z-score</strong> corresponds to confidence level: 1.645 (95%), 2.33 (99%), etc.
          </p>
          <p>
            <strong>Standard Deviation</strong> = Portfolio volatility as decimal (e.g., 0.15 for 15%).
          </p>
          <p>
            <strong>Time Horizon</strong> = Number of days for risk calculation.
          </p>
          <p>Value-at-Risk (VaR) estimates the maximum expected loss at a given confidence level. This assumes normal distribution of returns. Higher confidence levels and longer time horizons increase risk exposure. VaR does not indicate loss magnitude beyond the threshold, so use alongside stress testing.</p>
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
                <p className="text-sm text-muted-foreground">Daily VaR</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.riskExposure / Math.sqrt(result.timeHorizon)).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Per day equivalent</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Volatility</p>
                <p className="text-xl font-semibold text-primary">{result.standardDeviation.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">Portfolio volatility</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Confidence</p>
                <p className="text-xl font-semibold text-primary">{result.confidenceLevel.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Probability level</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your portfolio data to see additional insights.</p>
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
    <meta itemProp="name" content="The Complete Guide to Risk Exposure: Value-at-Risk (VaR) and Confidence Levels" />
    <meta itemProp="description" content="An in-depth guide on calculating risk exposure using Value-at-Risk (VaR) methodology, understanding confidence levels, and applying VaR for portfolio risk management." />
    <meta itemProp="keywords" content="risk exposure VaR, value at risk, confidence level, portfolio risk, volatility, risk management, z-score" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-12-02" />
    <meta itemProp="url" content="/finance/risk-exposure-by-confidence-level-calculator" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Risk Exposure: Value-at-Risk (VaR) and Confidence Levels</h1>
    <p className="text-lg italic text-gray-700 dark:text-gray-300">A comprehensive look at Value-at-Risk (VaR) calculation, confidence levels, and how to use risk exposure for effective portfolio risk management.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600 dark:text-blue-400">
        <li><a href="#var" className="hover:underline">Understanding Value-at-Risk (VaR)</a></li>
        <li><a href="#confidence" className="hover:underline">Confidence Levels and Z-Scores</a></li>
        <li><a href="#calculation" className="hover:underline">VaR Calculation Methodology</a></li>
        <li><a href="#factors" className="hover:underline">Factors Affecting Risk Exposure</a></li>
        <li><a href="#interpretation" className="hover:underline">Interpreting VaR Results</a></li>
        <li><a href="#limitations" className="hover:underline">Limitations and Best Practices</a></li>
    </ul>
<hr className="my-6" />

    <h2 id="var" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding Value-at-Risk (VaR)</h2>
    <p>Value-at-Risk (VaR) is one of the most widely used risk metrics in finance. It estimates the maximum potential loss of a portfolio over a specified time period at a given confidence level.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">What is VaR?</h3>
    <p>VaR answers the question: "What is the maximum loss I can expect with X% confidence over Y days?" For example, a $10,000 VaR at 95% confidence over 1 day means there is a 5% chance (1 in 20) of losing more than $10,000 in one day.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Why VaR Matters</h3>
    <p>VaR provides a single number that summarizes portfolio risk, making it useful for:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Risk Communication:</b> Easy-to-understand risk metric for stakeholders</li>
        <li><b>Capital Planning:</b> Determining capital reserves needed to cover potential losses</li>
        <li><b>Position Limits:</b> Setting limits on portfolio positions based on risk tolerance</li>
        <li><b>Regulatory Compliance:</b> Meeting regulatory capital requirements</li>
    </ul>

<hr className="my-6" />

    <h2 id="confidence" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Confidence Levels and Z-Scores</h2>
    <p>The confidence level determines how conservative the VaR estimate is. Higher confidence levels require larger Z-scores and result in higher risk exposure estimates.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Common Confidence Levels</h3>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 dark:bg-gray-800 border rounded-lg">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr>
                    <th className="border-b p-2 font-bold">Confidence Level</th>
                    <th className="border-b p-2 font-bold">Z-Score</th>
                    <th className="border-b p-2 font-bold">Interpretation</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td className="border-b p-2">90%</td>
                    <td className="border-b p-2">1.28</td>
                    <td className="border-b p-2">10% chance of exceeding VaR</td>
                </tr>
                <tr>
                    <td className="border-b p-2">95%</td>
                    <td className="border-b p-2">1.645</td>
                    <td className="border-b p-2">5% chance of exceeding VaR</td>
                </tr>
                <tr>
                    <td className="border-b p-2">97.5%</td>
                    <td className="border-b p-2">1.96</td>
                    <td className="border-b p-2">2.5% chance of exceeding VaR</td>
                </tr>
                <tr>
                    <td className="border-b p-2">99%</td>
                    <td className="border-b p-2">2.33</td>
                    <td className="border-b p-2">1% chance of exceeding VaR</td>
                </tr>
                <tr>
                    <td className="border-b p-2">99.5%</td>
                    <td className="border-b p-2">2.58</td>
                    <td className="border-b p-2">0.5% chance of exceeding VaR</td>
                </tr>
            </tbody>
        </table>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Choosing a Confidence Level</h3>
    <p>The appropriate confidence level depends on:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Risk Tolerance:</b> Conservative portfolios use higher confidence (99%), aggressive portfolios may use 95%</li>
        <li><b>Regulatory Requirements:</b> Some regulations specify confidence levels (e.g., 99% for market risk)</li>
        <li><b>Use Case:</b> Trading desks may use 95% for day-to-day risk, while capital planning may require 99%</li>
    </ul>

<hr className="my-6" />

    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">VaR Calculation Methodology</h2>
    <p>The parametric (variance-covariance) method assumes normal distribution of returns and calculates VaR using the formula:</p>
    
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
        <p className="font-mono text-lg"><strong>VaR = Z Ã— Ïƒ Ã— âˆšt Ã— V</strong></p>
    </div>
    
    <p>Where:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Z:</b> Z-score corresponding to confidence level</li>
        <li><b>Ïƒ:</b> Standard deviation (volatility) of portfolio returns</li>
        <li><b>t:</b> Time horizon in days</li>
        <li><b>V:</b> Current portfolio value</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Example Calculation</h3>
    <p>Portfolio value: $1,000,000</p>
    <p>Daily volatility: 2% (0.02)</p>
    <p>Time horizon: 1 day</p>
    <p>Confidence level: 95% (Z = 1.645)</p>
    <p>VaR = 1.645 Ã— 0.02 Ã— âˆš1 Ã— 1,000,000 = $32,900</p>
    <p>Interpretation: There is a 5% chance of losing more than $32,900 in one day.</p>

<hr className="my-6" />

    <h2 id="factors" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Factors Affecting Risk Exposure</h2>
    <p>Several factors influence VaR calculations and risk exposure estimates.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Portfolio Volatility</h3>
    <p>Higher volatility increases risk exposure. A portfolio with 20% volatility has twice the VaR of a portfolio with 10% volatility (all else equal). Volatility can change over time, so regular updates are essential.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Time Horizon</h3>
    <p>Risk exposure increases with the square root of time. A 4-day VaR is twice the 1-day VaR. This scaling assumes independent daily returns and may not hold during market stress.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Portfolio Value</h3>
    <p>Larger portfolios have larger absolute VaR, but risk as a percentage of portfolio value may remain constant if composition is unchanged.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Confidence Level</h3>
    <p>Higher confidence levels require larger Z-scores and produce higher VaR estimates. The difference between 95% and 99% VaR can be substantial, especially for volatile portfolios.</p>

<hr className="my-6" />

    <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting VaR Results</h2>
    <p>Proper interpretation of VaR requires understanding what it does and does not tell you.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">What VaR Tells You</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>Maximum expected loss at specified confidence level</li>
        <li>Relative risk comparison between portfolios</li>
        <li>Risk exposure for capital planning</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">What VaR Does Not Tell You</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>Magnitude of losses beyond VaR threshold (tail risk)</li>
        <li>Expected loss amount when VaR is exceeded</li>
        <li>Distribution of returns beyond normal assumptions</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Backtesting VaR</h3>
    <p>Regularly compare actual losses to VaR estimates. If losses exceed VaR more frequently than the confidence level suggests (e.g., 95% VaR exceeded 10% of the time), the model may need adjustment.</p>

<hr className="my-6" />

    <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Limitations and Best Practices</h2>
    <p>VaR has important limitations that risk managers must understand.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Limitations</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Normal Distribution Assumption:</b> Real returns often have fat tails, making extreme losses more likely than VaR suggests</li>
        <li><b>Non-Stationarity:</b> Volatility and correlations change over time, especially during crises</li>
        <li><b>No Tail Risk Information:</b> VaR doesn't quantify losses beyond the threshold</li>
        <li><b>Correlation Breakdown:</b> Correlations often increase during market stress, increasing portfolio risk</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Best Practices</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Use Multiple Methods:</b> Combine parametric VaR with historical simulation and Monte Carlo</li>
        <li><b>Stress Testing:</b> Complement VaR with scenario analysis and stress tests</li>
        <li><b>Expected Shortfall:</b> Calculate Conditional VaR (CVaR) to understand tail risk</li>
        <li><b>Regular Updates:</b> Update volatility estimates and review model assumptions frequently</li>
        <li><b>Backtesting:</b> Validate VaR models by comparing estimates to actual outcomes</li>
    </ul>

<hr className="my-6" />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Risk exposure calculated using Value-at-Risk (VaR) provides a valuable tool for portfolio risk management when used appropriately. Understanding confidence levels, calculation methodology, and limitations enables effective risk assessment. Combine VaR with stress testing, scenario analysis, and expected shortfall for comprehensive risk management. Regular monitoring, backtesting, and model updates ensure VaR remains a reliable risk metric.</p>
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
          <p>This tool calculates risk exposure (VaR) at different confidence levels based on portfolio value, volatility, time horizon, and confidence level.</p>
          <p>Outputs include risk exposure (VaR), Z-score, risk as percentage of portfolio, interpretation, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

