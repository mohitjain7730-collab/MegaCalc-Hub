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
  baselineReturn: z.number({ invalid_type_error: 'Enter baseline return' }),
  shockReturn: z.number({ invalid_type_error: 'Enter shock return' }),
  assetWeights: z.string({ invalid_type_error: 'Enter asset weights' }).optional(),
  shockMagnitudes: z.string({ invalid_type_error: 'Enter shock magnitudes' }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  portfolioValue: number;
  baselineReturn: number;
  shockReturn: number;
  portfolioReturnUnderShock: number;
  portfolioValueUnderShock: number;
  lossAmount: number;
  lossPercentage: number;
  shockMagnitude: number;
  riskLevel: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter portfolio value (current value of the portfolio).',
  'Enter baseline return (expected return under normal conditions, as percentage).',
  'Enter shock return (return under stress scenario, as percentage, typically negative).',
  'Review stress test results: portfolio value under shock, loss amount, loss percentage, and risk assessment.',
];

const faqs = [
  {
    question: 'What is stress testing?',
    answer:
      'Stress testing evaluates how investment portfolios would perform under extreme but plausible market conditions. It helps identify vulnerabilities that traditional risk measures might overlook, ensuring portfolios are resilient against potential financial shocks.',
  },
  {
    question: 'What is a portfolio shock?',
    answer:
      'A portfolio shock is an extreme but plausible change in market conditions that significantly impacts portfolio returns. Examples include: market crashes, interest rate spikes, currency devaluations, or commodity price collapses. Shocks are typically expressed as percentage changes in returns.',
  },
  {
    question: 'How is stress testing different from VaR?',
    answer:
      'VaR estimates losses at a confidence level based on historical patterns, while stress testing evaluates losses under specific extreme scenarios. Stress testing is forward-looking and scenario-based, while VaR is statistical and probability-based. Both complement each other in risk management.',
  },
  {
    question: 'What are common stress scenarios?',
    answer:
      'Common stress scenarios include: 2008 financial crisis (equity -50%, credit spreads +500bps), interest rate shock (+300bps), currency crisis (-30%), commodity collapse (-40%), or combinations. Scenarios should be extreme but plausible based on historical events.',
  },
  {
    question: 'How do I calculate portfolio return under shock?',
    answer:
      'Portfolio return under shock = Baseline Return + Shock Return. For example, if baseline return is 8% and shock return is -20%, portfolio return under shock = 8% + (-20%) = -12%. This represents the return under the stress scenario.',
  },
  {
    question: 'What is shock magnitude?',
    answer:
      'Shock magnitude is the absolute difference between shock return and baseline return. For example, if baseline is 8% and shock is -12%, shock magnitude is 20 percentage points. Larger shock magnitudes represent more severe stress scenarios.',
  },
  {
    question: 'What is a reasonable shock magnitude?',
    answer:
      'Reasonable shock magnitudes vary by asset class: equities typically 20-50%, bonds 5-15%, currencies 10-30%, commodities 20-40%. Magnitudes should reflect historical extreme events (e.g., 2008 crisis, 1987 crash) while remaining plausible.',
  },
  {
    question: 'How often should stress testing be performed?',
    answer:
      'Stress testing should be performed regularly (quarterly or annually) and whenever: portfolio composition changes significantly, market conditions change, new risks emerge, or regulatory requirements specify. More frequent testing provides better risk monitoring.',
  },
  {
    question: 'What if stress test shows large losses?',
    answer:
      'If stress test shows large losses, consider: reducing risk exposure, increasing diversification, implementing hedging strategies, adjusting asset allocation, or increasing capital reserves. Large losses indicate vulnerability to stress scenarios requiring risk mitigation.',
  },
  {
    question: 'How do I use stress test results?',
    answer:
      'Use stress test results to: assess portfolio resilience, set risk limits, determine capital requirements, develop contingency plans, communicate risk to stakeholders, and make informed risk management decisions. Results guide portfolio construction and risk mitigation strategies.',
  },
];

const relatedCalculators = [
  {
    name: 'Value-at-Risk (Historical Simulation) Calculator',
    slug: 'value-at-risk-historical-simulation-calculator',
    description: 'Calculate VaR using historical simulation.',
  },
  {
    name: 'Conditional VaR (CVaR) Backtest Calculator',
    slug: 'conditional-var-cvar-backtest-calculator',
    description: 'Backtest Conditional VaR models.',
  },
  {
    name: 'Scenario Analysis Tool (Monte Carlo for Losses)',
    slug: 'scenario-analysis-tool-monte-carlo-for-losses',
    description: 'Monte Carlo scenario analysis for losses.',
  },
  {
    name: 'Conditional Value at Risk Calculator',
    slug: 'conditional-value-at-risk-calculator',
    description: 'Calculate Conditional Value at Risk.',
  },
];

const baseUrl = 'https://mycalculating.com/finance/stress-testing-portfolio-shock-simulator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/finance' },
        { '@type': 'ListItem', position: 3, name: 'Stress Testing (Portfolio Shock) Simulator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Stress Testing (Portfolio Shock) Simulator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Simulate portfolio stress testing by evaluating portfolio performance under extreme but plausible market shock scenarios.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const portfolioValue = values.portfolioValue;
  const baselineReturn = values.baselineReturn; // percentage
  const shockReturn = values.shockReturn; // percentage

  // Portfolio return under shock = Baseline Return + Shock Return
  const portfolioReturnUnderShock = baselineReturn + shockReturn;

  // Portfolio value under shock = Portfolio Value Ã— (1 + Portfolio Return Under Shock / 100)
  const portfolioValueUnderShock = portfolioValue * (1 + portfolioReturnUnderShock / 100);

  // Loss amount = Portfolio Value - Portfolio Value Under Shock
  const lossAmount = portfolioValue - portfolioValueUnderShock;

  // Loss percentage = (Loss Amount / Portfolio Value) Ã— 100
  const lossPercentage = (lossAmount / portfolioValue) * 100;

  // Shock magnitude = |Shock Return|
  const shockMagnitude = Math.abs(shockReturn);

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
  let interpretation = `Stress test completed. Under shock scenario (${shockReturn > 0 ? '+' : ''}${shockReturn.toFixed(2)}% shock), portfolio value would be $${portfolioValueUnderShock.toLocaleString(undefined, { maximumFractionDigits: 2 })} (loss: $${lossAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} or ${lossPercentage.toFixed(2)}%).`;

  if (lossPercentage > 30) {
    status = 'low';
    interpretation = `Very high loss (${lossPercentage.toFixed(2)}%) under stress scenario indicates significant portfolio vulnerability. Portfolio may experience losses exceeding $${lossAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} under extreme conditions. Immediate risk mitigation required.`;
  } else if (lossPercentage > 20) {
    status = 'moderate';
    interpretation = `High loss (${lossPercentage.toFixed(2)}%) under stress scenario indicates notable portfolio vulnerability. Portfolio may experience losses exceeding $${lossAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} under extreme conditions. Consider risk reduction strategies.`;
  } else if (lossPercentage > 10) {
    status = 'good';
    interpretation = `Moderate loss (${lossPercentage.toFixed(2)}%) under stress scenario indicates manageable portfolio vulnerability. Portfolio may experience losses of $${lossAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} under extreme conditions. Monitor risk and consider mitigation if needed.`;
  } else {
    status = 'optimal';
    interpretation = `Low loss (${lossPercentage.toFixed(2)}%) under stress scenario indicates good portfolio resilience. Portfolio may experience losses of $${lossAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} under extreme conditions. Risk is well-managed.`;
  }

  const recommendations = [
    `Portfolio Value Under Shock: $${portfolioValueUnderShock.toLocaleString(undefined, { maximumFractionDigits: 2 })} (Loss: $${lossAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} or ${lossPercentage.toFixed(2)}%). This represents portfolio value under the stress scenario (${shockReturn > 0 ? '+' : ''}${shockReturn.toFixed(2)}% shock).`,
    `Shock Magnitude: ${shockMagnitude.toFixed(2)} percentage points. ${shockMagnitude > 30 ? 'Very severe shock scenario, representing extreme market conditions.' : shockMagnitude > 20 ? 'Severe shock scenario, representing significant market stress.' : 'Moderate shock scenario, representing plausible market stress.'}`,
    `Risk Level: ${riskLevel}. ${lossPercentage > 20 ? 'High loss under stress indicates portfolio vulnerability. Consider: reducing risk exposure, increasing diversification, implementing hedging, or adjusting asset allocation.' : lossPercentage > 10 ? 'Moderate loss under stress indicates manageable vulnerability. Monitor risk and consider mitigation if losses exceed risk tolerance.' : 'Low loss under stress indicates good portfolio resilience. Continue monitoring and maintain appropriate risk management.'}`,
  ];
  if (lossPercentage > 20) {
    recommendations.push('High loss under stress requires attention. Develop risk mitigation plan: reduce position sizes, increase diversification across uncorrelated assets, implement hedging strategies, or adjust portfolio allocation to reduce vulnerability.');
  }
  if (shockMagnitude > 30) {
    recommendations.push('Very severe shock scenario. While extreme, such scenarios have occurred historically (e.g., 2008 financial crisis). Ensure portfolio can withstand such shocks or implement robust risk mitigation strategies.');
  }

  const plan = [
    { label: 'This Week', detail: `Review stress test results: Loss ${lossPercentage.toFixed(2)}% ($${lossAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}) under ${shockReturn > 0 ? '+' : ''}${shockReturn.toFixed(2)}% shock. Assess portfolio vulnerability and compare to risk tolerance.` },
    { label: 'This Month', detail: 'If losses exceed risk tolerance, develop risk mitigation plan: reduce risk exposure, increase diversification, implement hedging strategies, or adjust asset allocation. Test multiple stress scenarios to identify vulnerabilities.' },
    { label: 'Ongoing', detail: 'Conduct stress testing regularly (quarterly or annually) and when portfolio composition or market conditions change. Test various scenarios (market crashes, interest rate shocks, currency crises) to ensure portfolio resilience across different stress conditions.' },
  ];

  return {
    portfolioValue,
    baselineReturn,
    shockReturn,
    portfolioReturnUnderShock,
    portfolioValueUnderShock,
    lossAmount,
    lossPercentage,
    shockMagnitude,
    riskLevel,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function StressTestingPortfolioShockSimulator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      portfolioValue: undefined,
      baselineReturn: undefined,
      shockReturn: undefined,
      assetWeights: undefined,
      shockMagnitudes: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="stress-testing-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Stress Testing (Portfolio Shock) Simulator
          </CardTitle>
          <CardDescription>Simulate portfolio stress testing by evaluating portfolio performance under extreme but plausible market shock scenarios.</CardDescription>
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
                  name="baselineReturn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Baseline Return (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shockReturn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shock Return (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., -20" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Run stress test
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
            <CardDescription>See stress test results: portfolio value under shock, loss amount and percentage, and risk assessment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Portfolio Value Under Shock</p>
                <p className="text-2xl font-semibold text-primary">{result.portfolioValueUnderShock.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Loss Amount</p>
                <p className="text-2xl font-semibold text-primary">{result.lossAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Loss Percentage</p>
                <p className="text-2xl font-semibold text-primary">{result.lossPercentage.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">Of portfolio value</p>
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
            <strong>Portfolio Return Under Shock</strong> = Baseline Return + Shock Return. The portfolio return under the stress scenario, combining baseline expected return with the shock impact.
          </p>
          <p>
            <strong>Portfolio Value Under Shock</strong> = Portfolio Value Ã— (1 + Portfolio Return Under Shock / 100). The portfolio value after applying the shock scenario return.
          </p>
          <p>
            <strong>Loss Amount</strong> = Portfolio Value - Portfolio Value Under Shock. The absolute dollar loss under the stress scenario.
          </p>
          <p>
            <strong>Loss Percentage</strong> = (Loss Amount / Portfolio Value) Ã— 100. The loss as a percentage of portfolio value, representing the impact of the stress scenario.
          </p>
          <p>
            <strong>Shock Magnitude</strong> = |Shock Return|. The absolute value of the shock return, representing the severity of the stress scenario. Larger magnitudes represent more severe shocks.
          </p>
          <p>Stress testing evaluates portfolio resilience under extreme but plausible scenarios. It complements VaR by providing forward-looking, scenario-based risk assessment. Regular stress testing helps identify vulnerabilities and guides risk mitigation strategies.</p>
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
                <p className="text-sm text-muted-foreground">Portfolio Return Under Shock</p>
                <p className="text-xl font-semibold text-primary">
                  {result.portfolioReturnUnderShock.toFixed(2)}%
                </p>
                <p className="text-xs text-muted-foreground">Return %</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Shock Magnitude</p>
                <p className="text-xl font-semibold text-primary">
                  {result.shockMagnitude.toFixed(2)}%
                </p>
                <p className="text-xs text-muted-foreground">Percentage points</p>
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
                <Link href={`/${calc.slug}`} className="text-primary hover:underline">
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
    <meta itemProp="name" content="The Definitive Guide to Stress Testing: Evaluating Portfolio Resilience Under Extreme Market Conditions" />
    <meta itemProp="description" content="A comprehensive guide to portfolio stress testing, a critical risk management tool that evaluates how investment portfolios perform under extreme but plausible market shock scenarios to identify vulnerabilities and ensure resilience." />
    <meta itemProp="keywords" content="stress testing, portfolio shock, stress scenario, market stress, portfolio resilience, risk management, scenario analysis, extreme events, financial crisis simulation" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-01-02" />
    <meta itemProp="url" content="/definitive-stress-testing-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Stress Testing: Evaluating Portfolio Resilience Under Extreme Market Conditions</h1>
    <p className="text-lg italic text-muted-foreground">A comprehensive guide to understanding and performing portfolio stress testing, a critical risk management tool that evaluates portfolio performance under extreme but plausible market conditions to identify vulnerabilities and ensure financial resilience.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#overview" className="hover:underline">Overview: Stress Testing in Risk Management</a></li>
        <li><a href="#purpose" className="hover:underline">Purpose and Benefits</a></li>
        <li><a href="#scenarios" className="hover:underline">Stress Scenarios</a></li>
        <li><a href="#calculation" className="hover:underline">Stress Test Calculation</a></li>
        <li><a href="#interpretation" className="hover:underline">Interpreting Results</a></li>
        <li><a href="#scenarios" className="hover:underline">Common Stress Scenarios</a></li>
        <li><a href="#best" className="hover:underline">Best Practices</a></li>
    </ul>
<hr />

    <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: Stress Testing in Risk Management</h2>
    <p><b>Stress testing</b> is a critical component of portfolio risk management, designed to evaluate how investment portfolios would perform under extreme but plausible market conditions. Unlike statistical risk measures like VaR, stress testing uses specific scenarios to assess portfolio resilience and identify vulnerabilities that traditional measures might overlook.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Concepts</h3>
    <ul>
        <li><b>Stress Testing:</b> Evaluation of portfolio performance under extreme scenarios</li>
        <li><b>Portfolio Shock:</b> Extreme but plausible change in market conditions</li>
        <li><b>Stress Scenario:</b> Specific set of market conditions to test</li>
        <li><b>Resilience:</b> Portfolio ability to withstand stress scenarios</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Why Stress Testing Matters</h3>
    <p>Stress testing provides critical insights for:</p>
    <ul>
        <li><b>Risk Identification:</b> Discovering vulnerabilities not captured by traditional measures</li>
        <li><b>Capital Planning:</b> Determining capital requirements for extreme scenarios</li>
        <li><b>Portfolio Construction:</b> Building resilient portfolios</li>
        <li><b>Regulatory Compliance:</b> Meeting stress testing requirements</li>
        <li><b>Stakeholder Communication:</b> Demonstrating risk management effectiveness</li>
    </ul>

<hr />

    <h2 id="purpose" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Purpose and Benefits</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Complement to VaR</h3>
    <p>Stress testing complements VaR by:</p>
    <ul>
        <li><b>Forward-Looking:</b> Evaluates specific scenarios rather than statistical probabilities</li>
        <li><b>Extreme Events:</b> Focuses on tail risks and extreme market conditions</li>
        <li><b>Scenario-Based:</b> Tests specific market conditions and their impacts</li>
        <li><b>Intuitive:</b> Easy to understand and communicate to stakeholders</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Benefits</h3>
    <ul>
        <li>Identifies vulnerabilities not captured by traditional risk measures</li>
        <li>Evaluates portfolio resilience under extreme conditions</li>
        <li>Guides risk mitigation and portfolio construction decisions</li>
        <li>Supports capital planning and regulatory compliance</li>
        <li>Enhances risk communication and stakeholder confidence</li>
    </ul>

<hr />

    <h2 id="scenarios" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Stress Scenarios</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Types of Scenarios</h3>
    <ul>
        <li><b>Historical Scenarios:</b> Based on past extreme events (2008 crisis, 1987 crash)</li>
        <li><b>Hypothetical Scenarios:</b> Plausible but not yet occurred events</li>
        <li><b>Factor-Based Scenarios:</b> Shocks to specific risk factors (interest rates, equity prices)</li>
        <li><b>Combined Scenarios:</b> Multiple simultaneous shocks</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Common Stress Scenarios</h3>
    <ul>
        <li><b>Market Crash:</b> Equity markets decline 30-50%</li>
        <li><b>Interest Rate Shock:</b> Rates increase 200-300 basis points</li>
        <li><b>Currency Crisis:</b> Currency devalues 20-40%</li>
        <li><b>Credit Crisis:</b> Credit spreads widen 300-500 basis points</li>
        <li><b>Commodity Collapse:</b> Commodity prices decline 30-50%</li>
    </ul>

<hr />

    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Stress Test Calculation</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Basic Formula</h3>
    <p>Portfolio return under shock = Baseline Return + Shock Return</p>
    <p>Portfolio value under shock = Portfolio Value Ã— (1 + Portfolio Return Under Shock / 100)</p>
    <p>Loss = Portfolio Value - Portfolio Value Under Shock</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Example Calculation</h3>
    <p>If portfolio value is $1,000,000, baseline return is 8%, and shock return is -20%:</p>
    <ul>
        <li>Portfolio Return Under Shock = 8% + (-20%) = -12%</li>
        <li>Portfolio Value Under Shock = $1,000,000 Ã— (1 - 0.12) = $880,000</li>
        <li>Loss = $1,000,000 - $880,000 = $120,000 (12%)</li>
    </ul>

<hr />

    <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting Results</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Loss Levels</h3>
    <ul>
        <li><b>Loss &lt; 5%:</b> Excellent resilience, well-managed portfolio</li>
        <li><b>Loss 5-10%:</b> Good resilience, manageable risk</li>
        <li><b>Loss 10-20%:</b> Moderate vulnerability, requires monitoring</li>
        <li><b>Loss 20-30%:</b> High vulnerability, risk mitigation needed</li>
        <li><b>Loss &gt; 30%:</b> Very high vulnerability, urgent action required</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Action Based on Results</h3>
    <p>If losses exceed risk tolerance:</p>
    <ul>
        <li>Reduce risk exposure and position sizes</li>
        <li>Increase diversification across uncorrelated assets</li>
        <li>Implement hedging strategies</li>
        <li>Adjust asset allocation</li>
        <li>Increase capital reserves</li>
    </ul>

<hr />

    <h2 id="best" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Best Practices</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Regular Testing</h3>
    <p>Conduct stress testing:</p>
    <ul>
        <li><b>Quarterly:</b> For most portfolios</li>
        <li><b>Annually:</b> For stable portfolios</li>
        <li><b>When Needed:</b> Portfolio changes, market shifts, new risks</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Multiple Scenarios</h3>
    <p>Test various scenarios:</p>
    <ul>
        <li>Different types of shocks (equity, interest rate, currency)</li>
        <li>Different magnitudes (moderate, severe, extreme)</li>
        <li>Combined scenarios (multiple simultaneous shocks)</li>
        <li>Historical and hypothetical scenarios</li>
    </ul>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p><b>Stress testing</b> is essential for evaluating portfolio resilience under extreme but plausible market conditions. It complements VaR by providing forward-looking, scenario-based risk assessment. Regular stress testing helps identify vulnerabilities, guides risk mitigation, and ensures portfolios can withstand extreme market conditions. Test multiple scenarios regularly to maintain effective risk management.</p>
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
          <p>This tool simulates portfolio stress testing by evaluating portfolio performance under extreme but plausible market shock scenarios.</p>
          <p>Outputs include portfolio value under shock, loss amount and percentage, shock magnitude, risk level, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

