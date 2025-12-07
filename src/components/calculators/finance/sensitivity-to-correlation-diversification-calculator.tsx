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
  weight1: z.number({ invalid_type_error: 'Enter weight 1' }).min(0).max(100),
  weight2: z.number({ invalid_type_error: 'Enter weight 2' }).min(0).max(100),
  volatility1: z.number({ invalid_type_error: 'Enter volatility 1' }).min(0).max(100),
  volatility2: z.number({ invalid_type_error: 'Enter volatility 2' }).min(0).max(100),
  correlation: z.number({ invalid_type_error: 'Enter correlation' }).min(-1).max(1),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  weight1: number;
  weight2: number;
  volatility1: number;
  volatility2: number;
  correlation: number;
  portfolioVariance: number;
  portfolioVolatility: number;
  diversificationBenefit: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter weight of asset 1 (percentage, e.g., 60 for 60%).',
  'Enter weight of asset 2 (percentage, e.g., 40 for 40%).',
  'Enter volatility of asset 1 (percentage, e.g., 15 for 15%).',
  'Enter volatility of asset 2 (percentage, e.g., 20 for 20%).',
  'Enter correlation coefficient between assets (-1 to 1, e.g., 0.3 for 0.3).',
  'Review portfolio variance, volatility, diversification benefit, and recommendations.',
];

const faqs = [
  {
    question: 'What is portfolio variance?',
    answer:
      'Portfolio variance measures the variability of portfolio returns. It is calculated using asset weights, volatilities, and correlation. Lower variance indicates lower risk and better diversification.',
  },
  {
    question: 'How is portfolio variance calculated?',
    answer:
      'Portfolio variance = w₁²σ₁² + w₂²σ₂² + 2w₁w₂σ₁σ₂ρ, where w are weights, σ are volatilities, and ρ is correlation. This formula shows how correlation affects portfolio risk.',
  },
  {
    question: 'What is correlation?',
    answer:
      'Correlation measures how assets move together, ranging from -1 (perfect negative) to +1 (perfect positive). Lower correlation provides greater diversification benefits by reducing portfolio risk.',
  },
  {
    question: 'What is diversification benefit?',
    answer:
      'Diversification benefit is the reduction in portfolio volatility compared to a weighted average of individual asset volatilities. It occurs when correlation is less than 1, reducing portfolio risk.',
  },
  {
    question: 'How does correlation affect portfolio risk?',
    answer:
      'Lower correlation reduces portfolio variance and risk. When correlation = 1, assets move perfectly together with no diversification. When correlation < 1, diversification reduces risk. Negative correlation provides maximum diversification.',
  },
  {
    question: 'What is a good correlation for diversification?',
    answer:
      'Correlation below 0.5 provides good diversification benefits. Correlation near 0 or negative provides excellent diversification. Correlation above 0.7 provides limited diversification benefits.',
  },
  {
    question: 'How can I improve diversification?',
    answer:
      'Improve diversification by: selecting assets with low or negative correlation, adjusting portfolio weights, adding uncorrelated assets, and rebalancing regularly to maintain target allocation.',
  },
  {
    question: 'What are limitations of this calculation?',
    answer:
      'This calculation assumes constant correlation and volatility, which may not hold in all market conditions. Real-world correlations can change, especially during market stress. Use as part of comprehensive analysis.',
  },
  {
    question: 'How does portfolio weight affect risk?',
    answer:
      'Portfolio weights determine each asset\'s contribution to portfolio risk. Higher weights in lower volatility assets reduce portfolio risk. Optimal weights balance risk and return objectives.',
  },
  {
    question: 'When should I consult a portfolio manager?',
    answer:
      'Consult a portfolio manager for complex portfolios, multi-asset allocation, risk optimization, and comprehensive portfolio management strategies. Professional analysis provides detailed diversification and risk management recommendations.',
  },
];

const relatedCalculators = [
  {
    name: 'Risk Exposure by Confidence Level Calculator',
    slug: 'risk-exposure-by-confidence-level-calculator',
    description: 'Calculate Value-at-Risk (VaR) and risk exposure by confidence level.',
  },
  {
    name: 'Value-at-Risk (Historical Simulation) Calculator',
    slug: 'value-at-risk-historical-simulation-calculator',
    description: 'Calculate VaR using historical simulation method.',
  },
  {
    name: 'Stress Testing (Portfolio Shock) Simulator',
    slug: 'stress-testing-portfolio-shock-simulator',
    description: 'Simulate portfolio stress testing under extreme market conditions.',
  },
  {
    name: 'Scenario Analysis Tool (Monte Carlo for Losses)',
    slug: 'scenario-analysis-tool-monte-carlo-for-losses',
    description: 'Perform Monte Carlo simulation for scenario analysis.',
  },
];

const baseUrl = 'https://mycalculating.com/category/finance/sensitivity-to-correlation-diversification-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Sensitivity to Correlation (Diversification) Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Sensitivity to Correlation (Diversification) Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate portfolio variance, volatility, and diversification benefit based on asset weights, volatilities, and correlation.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const weight1 = values.weight1 / 100; // Convert percentage to decimal
  const weight2 = values.weight2 / 100;
  const volatility1 = values.volatility1 / 100; // Convert percentage to decimal
  const volatility2 = values.volatility2 / 100;
  const correlation = values.correlation;

  // Calculate portfolio variance using two-asset formula
  // σ²ₚ = w₁²σ₁² + w₂²σ₂² + 2w₁w₂σ₁σ₂ρ
  const portfolioVariance = 
    (weight1 * weight1 * volatility1 * volatility1) +
    (weight2 * weight2 * volatility2 * volatility2) +
    (2 * weight1 * weight2 * volatility1 * volatility2 * correlation);

  // Portfolio volatility is square root of variance
  const portfolioVolatility = Math.sqrt(portfolioVariance) * 100; // Convert back to percentage

  // Calculate weighted average volatility (no diversification)
  const weightedAvgVolatility = (weight1 * volatility1 + weight2 * volatility2) * 100;

  // Diversification benefit is reduction in volatility
  const diversificationBenefit = weightedAvgVolatility - portfolioVolatility;

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Portfolio variance and volatility calculated. Lower correlation provides greater diversification benefits by reducing portfolio risk.';

  if (correlation >= 0.8) {
    status = 'low';
    interpretation = 'High correlation (≥0.8) provides limited diversification benefits. Consider adding assets with lower correlation to improve diversification and reduce portfolio risk.';
  } else if (correlation >= 0.5) {
    status = 'moderate';
    interpretation = 'Moderate correlation (0.5-0.8) provides some diversification benefits. Consider optimizing asset selection and weights to improve diversification and reduce risk.';
  } else if (correlation >= 0) {
    status = 'good';
    interpretation = 'Low positive correlation (0-0.5) provides good diversification benefits. Portfolio risk is reduced compared to perfectly correlated assets.';
  } else {
    status = 'optimal';
    interpretation = 'Negative correlation provides excellent diversification benefits. Portfolio risk is significantly reduced, maximizing diversification advantage.';
  }

  const recommendations = [
    `Portfolio variance: ${(portfolioVariance * 10000).toFixed(4)} (${(portfolioVolatility).toFixed(2)}% volatility). This represents portfolio risk considering correlation and diversification.`,
    `Diversification benefit: ${diversificationBenefit.toFixed(2)}% reduction in volatility compared to weighted average. This shows how correlation reduces portfolio risk.`,
    `Correlation: ${correlation.toFixed(3)}. ${correlation < 0.5 ? 'Low correlation provides good diversification.' : correlation < 0.8 ? 'Moderate correlation provides some diversification.' : 'High correlation provides limited diversification.'}`,
  ];
  if (correlation >= 0.8) {
    recommendations.push('High correlation limits diversification benefits. Consider adding assets with lower correlation, adjusting portfolio weights, or selecting different asset classes to improve diversification.');
  } else if (correlation >= 0.5) {
    recommendations.push('Moderate correlation provides some diversification. Optimize asset selection and weights to improve diversification benefits and further reduce portfolio risk.');
  } else {
    recommendations.push('Low or negative correlation provides excellent diversification. Continue maintaining diversified portfolio with low-correlated assets to sustain diversification benefits.');
  }
  if (portfolioVolatility > 25) {
    recommendations.push('High portfolio volatility indicates elevated risk. Consider reducing weights in high-volatility assets or adding lower-volatility assets to reduce overall portfolio risk.');
  }

  const plan = [
    { label: 'This Week', detail: `Review portfolio variance: ${(portfolioVariance * 10000).toFixed(4)}, volatility: ${portfolioVolatility.toFixed(2)}%, and diversification benefit: ${diversificationBenefit.toFixed(2)}%. Assess if correlation and weights optimize diversification.` },
    { label: 'This Month', detail: 'If correlation is high (≥0.8), take action: add assets with lower correlation, adjust portfolio weights, or select different asset classes to improve diversification and reduce portfolio risk.' },
    { label: 'Ongoing', detail: 'Continuously monitor correlation, portfolio variance, and diversification benefits. Maintain diversified portfolio with low-correlated assets and optimal weights to sustain diversification advantages and manage risk effectively.' },
  ];

  return {
    weight1: values.weight1,
    weight2: values.weight2,
    volatility1: values.volatility1,
    volatility2: values.volatility2,
    correlation,
    portfolioVariance,
    portfolioVolatility,
    diversificationBenefit,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function SensitivityToCorrelationDiversificationCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weight1: undefined,
      weight2: undefined,
      volatility1: undefined,
      volatility2: undefined,
      correlation: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="sensitivity-correlation-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Sensitivity to Correlation (Diversification) Calculator
          </CardTitle>
          <CardDescription>Calculate portfolio variance, volatility, and diversification benefit based on asset weights, volatilities, and correlation.</CardDescription>
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
                  name="weight1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight of Asset 1 (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 60" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Weight of Asset 2 (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 40" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="volatility1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Volatility of Asset 1 (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="volatility2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Volatility of Asset 2 (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 20" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="correlation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correlation Coefficient (-1 to 1)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 0.3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate diversification
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
            <CardDescription>See portfolio variance, volatility, diversification benefit, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Portfolio Variance</p>
                <p className="text-2xl font-semibold text-primary">{(result.portfolioVariance * 10000).toFixed(4)}</p>
                <p className="text-xs text-muted-foreground">Risk measure</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Portfolio Volatility</p>
                <p className="text-2xl font-semibold text-primary">{result.portfolioVolatility.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">Standard deviation</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Diversification Benefit</p>
                <p className="text-2xl font-semibold text-primary">{result.diversificationBenefit.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">Risk reduction</p>
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
            <strong>Portfolio Variance</strong> = w₁²σ₁² + w₂²σ₂² + 2w₁w₂σ₁σ₂ρ, where w are weights, σ are volatilities, and ρ is correlation coefficient.
          </p>
          <p>
            <strong>Portfolio Volatility</strong> = √Portfolio Variance. The standard deviation of portfolio returns, representing portfolio risk.
          </p>
          <p>
            <strong>Diversification Benefit</strong> = Weighted Average Volatility - Portfolio Volatility. The reduction in volatility due to correlation less than 1.
          </p>
          <p>Lower correlation reduces portfolio variance and volatility, providing diversification benefits. When correlation = 1, assets move perfectly together with no diversification. When correlation < 1, diversification reduces risk.</p>
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
                <p className="text-sm text-muted-foreground">Weighted Avg Volatility</p>
                <p className="text-xl font-semibold text-primary">
                  {((result.weight1 / 100 * result.volatility1 / 100) + (result.weight2 / 100 * result.volatility2 / 100) * 100).toFixed(2)}%
                </p>
                <p className="text-xs text-muted-foreground">No diversification</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Correlation Impact</p>
                <p className="text-xl font-semibold text-primary">
                  {result.correlation.toFixed(3)}
                </p>
                <p className="text-xs text-muted-foreground">Coefficient</p>
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
    <meta itemProp="name" content="The Definitive Guide to Sensitivity to Correlation: Portfolio Diversification Benefits" />
    <meta itemProp="description" content="A comprehensive guide to calculating and understanding portfolio sensitivity to correlation and diversification benefits, critical concepts for portfolio risk management." />
    <meta itemProp="keywords" content="portfolio diversification, correlation, portfolio variance, portfolio volatility, risk management, asset allocation" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-01-02" />
    <meta itemProp="url" content="/definitive-correlation-diversification-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Sensitivity to Correlation: Portfolio Diversification Benefits</h1>
    <p className="text-lg italic text-muted-foreground">A comprehensive guide to understanding and calculating portfolio sensitivity to correlation and diversification benefits, critical concepts for effective portfolio risk management.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#overview" className="hover:underline">Overview: Correlation and Diversification</a></li>
        <li><a href="#variance" className="hover:underline">Portfolio Variance Calculation</a></li>
        <li><a href="#correlation" className="hover:underline">Correlation Impact</a></li>
        <li><a href="#diversification" className="hover:underline">Diversification Benefits</a></li>
    </ul>
<hr />

    <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: Correlation and Diversification</h2>
    <p><b>Correlation</b> measures how assets move together, and it significantly affects portfolio risk through diversification. Lower correlation reduces portfolio variance and volatility, providing diversification benefits.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Concepts</h3>
    <ul>
        <li><b>Correlation:</b> Measure of how assets move together, ranging from -1 (perfect negative) to +1 (perfect positive)</li>
        <li><b>Portfolio Variance:</b> Measure of portfolio return variability, calculated using weights, volatilities, and correlation</li>
        <li><b>Diversification Benefit:</b> Reduction in portfolio volatility compared to weighted average, achieved when correlation < 1</li>
        <li><b>Portfolio Weights:</b> Proportion of portfolio allocated to each asset</li>
    </ul>

<hr />

    <h2 id="variance" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Portfolio Variance Calculation</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Two-Asset Portfolio Formula</h3>
    <p><b>Portfolio Variance = w₁²σ₁² + w₂²σ₂² + 2w₁w₂σ₁σ₂ρ</b></p>
    <p>Where:</p>
    <ul>
        <li>w₁, w₂ = Weights of assets 1 and 2</li>
        <li>σ₁, σ₂ = Volatilities (standard deviations) of assets 1 and 2</li>
        <li>ρ = Correlation coefficient between assets</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Example</h3>
    <p>For a portfolio with 60% asset 1 (15% volatility) and 40% asset 2 (20% volatility) with 0.3 correlation:</p>
    <ul>
        <li>Portfolio Variance = 0.6² × 0.15² + 0.4² × 0.20² + 2 × 0.6 × 0.4 × 0.15 × 0.20 × 0.3 = 0.0234</li>
        <li>Portfolio Volatility = √0.0234 = 15.3%</li>
    </ul>

<hr />

    <h2 id="correlation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Correlation Impact</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Correlation Ranges</h3>
    <ul>
        <li><b>Correlation = 1:</b> Perfect positive correlation, no diversification benefit</li>
        <li><b>Correlation 0.5-1:</b> High correlation, limited diversification</li>
        <li><b>Correlation 0-0.5:</b> Low positive correlation, good diversification</li>
        <li><b>Correlation < 0:</b> Negative correlation, excellent diversification</li>
    </ul>
    <p>Lower correlation reduces portfolio variance and provides greater diversification benefits.</p>

<hr />

    <h2 id="diversification" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Diversification Benefits</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Calculating Diversification Benefit</h3>
    <p>Diversification benefit = Weighted Average Volatility - Portfolio Volatility</p>
    <p>This represents the reduction in risk achieved through diversification when correlation is less than 1.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Maximizing Diversification</h3>
    <p>Maximize diversification by: selecting assets with low or negative correlation, optimizing portfolio weights, adding uncorrelated assets, and rebalancing regularly to maintain target allocation.</p>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p><b>Correlation</b> significantly affects portfolio risk through diversification. Lower correlation reduces portfolio variance and volatility, providing diversification benefits. Select assets with low correlation, optimize weights, and maintain diversified portfolios to maximize diversification advantages and manage risk effectively.</p>
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
          <p>This tool calculates portfolio variance, volatility, and diversification benefit based on asset weights, volatilities, and correlation.</p>
          <p>Outputs include portfolio variance, portfolio volatility, diversification benefit, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
