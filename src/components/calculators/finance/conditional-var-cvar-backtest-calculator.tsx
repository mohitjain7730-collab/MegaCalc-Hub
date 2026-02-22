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
  predictedCVaR: z.number({ invalid_type_error: 'Enter predicted CVaR' }).min(0),
  actualLosses: z.string({ invalid_type_error: 'Enter actual losses' }),
  confidenceLevel: z.number({ invalid_type_error: 'Enter confidence level' }).min(90).max(99.9),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  predictedCVaR: number;
  confidenceLevel: number;
  actualLossesArray: number[];
  exceedances: number;
  exceedanceRate: number;
  averageExceedance: number;
  backtestScore: number;
  modelAccuracy: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter predicted CVaR (expected average loss beyond VaR threshold).',
  'Enter actual losses as comma-separated values (losses that occurred).',
  'Enter confidence level (90-99.9%, typically 95% or 99%).',
  'Review backtest results: exceedances, exceedance rate, average exceedance, and model accuracy.',
];

const faqs = [
  {
    question: 'What is CVaR backtesting?',
    answer:
      'CVaR backtesting evaluates the accuracy of Conditional Value-at-Risk (CVaR) models by comparing predicted CVaR values against actual portfolio losses. It assesses whether the model accurately captures tail risk and extreme loss scenarios.',
  },
  {
    question: 'What is Conditional VaR (CVaR)?',
    answer:
      'Conditional VaR (CVaR), also known as Expected Shortfall, is the average loss beyond the VaR threshold. While VaR estimates the maximum loss at a confidence level, CVaR estimates the average loss when losses exceed VaR, providing additional insight into tail risk severity.',
  },
  {
    question: 'What are exceedances?',
    answer:
      'Exceedances are instances where actual losses exceed the predicted CVaR threshold. The number of exceedances and their magnitude help assess model accuracy. Too many exceedances suggests the model underestimates risk, while too few suggests overestimation.',
  },
  {
    question: 'What is exceedance rate?',
    answer:
      'Exceedance rate is the percentage of observations where actual losses exceed predicted CVaR. For 95% confidence level, expected exceedance rate is 5% (100% - 95%). Actual exceedance rate should be close to expected rate for accurate models.',
  },
  {
    question: 'What is average exceedance?',
    answer:
      'Average exceedance is the average magnitude of losses that exceed predicted CVaR. It measures the severity of exceedances. Lower average exceedance relative to predicted CVaR suggests better model accuracy in capturing tail risk.',
  },
  {
    question: 'What is a good backtest score?',
    answer:
      'A good backtest score indicates model accuracy. Key indicators: exceedance rate close to expected (e.g., 5% for 95% confidence), average exceedance close to predicted CVaR, and consistent performance over time. Scores above 80% are generally considered good.',
  },
  {
    question: 'What does high exceedance rate mean?',
    answer:
      'High exceedance rate (above expected) suggests the model underestimates risk. Predicted CVaR is too low, and actual losses exceed predictions more frequently than expected. This requires model recalibration or risk parameter adjustments.',
  },
  {
    question: 'What does low exceedance rate mean?',
    answer:
      'Low exceedance rate (below expected) suggests the model overestimates risk. Predicted CVaR is too high, and actual losses exceed predictions less frequently than expected. While conservative, this may lead to excessive capital allocation.',
  },
  {
    question: 'How often should CVaR models be backtested?',
    answer:
      'CVaR models should be backtested regularly (monthly, quarterly, or annually) to ensure ongoing accuracy. More frequent backtesting helps identify model degradation early and allows timely recalibration. Regulatory requirements may specify backtesting frequency.',
  },
  {
    question: 'What if backtest fails?',
    answer:
      'If backtest indicates model inaccuracy, consider: recalibrating model parameters, updating historical data, reviewing assumptions, adjusting confidence levels, or switching to alternative risk models. Failed backtests require immediate attention to maintain risk management effectiveness.',
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

const baseUrl = 'https://mycalculating.com/finance/conditional-var-cvar-backtest-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/finance' },
        { '@type': 'ListItem', position: 3, name: 'Conditional VaR (CVaR) Backtest Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Conditional VaR (CVaR) Backtest Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Backtest Conditional Value-at-Risk (CVaR) models by comparing predicted CVaR against actual losses to assess model accuracy and tail risk capture.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const predictedCVaR = values.predictedCVaR;
  const confidenceLevel = values.confidenceLevel;

  // Parse actual losses from comma-separated string
  const lossesStr = values.actualLosses.trim();
  const actualLossesArray = lossesStr
    .split(',')
    .map((l) => parseFloat(l.trim()))
    .filter((l) => !isNaN(l));

  if (actualLossesArray.length === 0) {
    throw new Error('No valid actual losses provided');
  }

  // Count exceedances (losses exceeding predicted CVaR)
  const exceedances = actualLossesArray.filter((loss) => loss > predictedCVaR).length;
  const exceedanceRate = (exceedances / actualLossesArray.length) * 100;

  // Calculate average exceedance (average of losses exceeding CVaR)
  const exceedanceLosses = actualLossesArray.filter((loss) => loss > predictedCVaR);
  const averageExceedance = exceedanceLosses.length > 0 ? exceedanceLosses.reduce((sum, loss) => sum + loss, 0) / exceedanceLosses.length : 0;

  // Expected exceedance rate = 100% - confidence level
  const expectedExceedanceRate = 100 - confidenceLevel;

  // Calculate backtest score (0-100)
  // Score based on: exceedance rate accuracy (50%), average exceedance accuracy (50%)
  const exceedanceRateAccuracy = Math.max(0, 100 - Math.abs(exceedanceRate - expectedExceedanceRate) * 2);
  const averageExceedanceAccuracy = predictedCVaR > 0 ? Math.max(0, 100 - Math.abs((averageExceedance - predictedCVaR) / predictedCVaR) * 100) : 0;
  const backtestScore = (exceedanceRateAccuracy * 0.5) + (averageExceedanceAccuracy * 0.5);

  // Determine model accuracy
  let modelAccuracy = 'Excellent';
  if (backtestScore < 60) {
    modelAccuracy = 'Poor';
  } else if (backtestScore < 75) {
    modelAccuracy = 'Fair';
  } else if (backtestScore < 90) {
    modelAccuracy = 'Good';
  }

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = `CVaR backtest completed. Exceedance rate: ${exceedanceRate.toFixed(2)}% (expected: ${expectedExceedanceRate.toFixed(2)}%). Model accuracy: ${modelAccuracy} (score: ${backtestScore.toFixed(1)}%).`;

  if (backtestScore < 60) {
    status = 'low';
    interpretation = `Poor model accuracy (score: ${backtestScore.toFixed(1)}%). Exceedance rate: ${exceedanceRate.toFixed(2)}% vs expected ${expectedExceedanceRate.toFixed(2)}%. Model significantly underestimates or overestimates risk. Immediate model recalibration required.`;
  } else if (backtestScore < 75) {
    status = 'moderate';
    interpretation = `Fair model accuracy (score: ${backtestScore.toFixed(1)}%). Exceedance rate: ${exceedanceRate.toFixed(2)}% vs expected ${expectedExceedanceRate.toFixed(2)}%. Model shows some inaccuracy. Review and recalibrate model parameters.`;
  } else if (backtestScore < 90) {
    status = 'good';
    interpretation = `Good model accuracy (score: ${backtestScore.toFixed(1)}%). Exceedance rate: ${exceedanceRate.toFixed(2)}% vs expected ${expectedExceedanceRate.toFixed(2)}%. Model performs reasonably well but may benefit from minor adjustments.`;
  } else {
    status = 'optimal';
    interpretation = `Excellent model accuracy (score: ${backtestScore.toFixed(1)}%). Exceedance rate: ${exceedanceRate.toFixed(2)}% vs expected ${expectedExceedanceRate.toFixed(2)}%. Model accurately captures tail risk. Continue monitoring and maintain current approach.`;
  }

  const recommendations = [
    `Exceedance Rate: ${exceedanceRate.toFixed(2)}% (Expected: ${expectedExceedanceRate.toFixed(2)}%). ${Math.abs(exceedanceRate - expectedExceedanceRate) < 2 ? 'Exceedance rate is close to expected, indicating good model calibration.' : exceedanceRate > expectedExceedanceRate ? 'Exceedance rate exceeds expected, suggesting model underestimates risk. Consider increasing predicted CVaR or recalibrating model.' : 'Exceedance rate below expected, suggesting model overestimates risk. Consider decreasing predicted CVaR or recalibrating model.'}`,
    `Average Exceedance: $${averageExceedance.toLocaleString(undefined, { maximumFractionDigits: 2 })} (Predicted CVaR: $${predictedCVaR.toLocaleString(undefined, { maximumFractionDigits: 2 })}). ${Math.abs(averageExceedance - predictedCVaR) / predictedCVaR < 0.2 ? 'Average exceedance is close to predicted CVaR, indicating good tail risk capture.' : averageExceedance > predictedCVaR ? 'Average exceedance exceeds predicted CVaR, suggesting model underestimates tail risk severity.' : 'Average exceedance below predicted CVaR, suggesting model overestimates tail risk severity.'}`,
    `Model Accuracy: ${modelAccuracy} (Score: ${backtestScore.toFixed(1)}%). ${backtestScore >= 90 ? 'Excellent model performance. Continue monitoring and maintain current approach.' : backtestScore >= 75 ? 'Good model performance with room for improvement. Consider minor recalibration.' : 'Model requires attention. Review assumptions, update parameters, or consider alternative models.'}`,
  ];
  if (exceedances === 0 && expectedExceedanceRate > 0) {
    recommendations.push('No exceedances observed, but expected exceedance rate is positive. This may indicate model overestimation or insufficient data. Consider reviewing model parameters or collecting more data.');
  }
  if (exceedanceRate > expectedExceedanceRate * 1.5) {
    recommendations.push('Exceedance rate significantly exceeds expected. Model likely underestimates risk. Immediate recalibration required: increase predicted CVaR, review model assumptions, or update risk parameters.');
  }

  const plan = [
    { label: 'This Week', detail: `Review backtest results: Exceedance rate ${exceedanceRate.toFixed(2)}% (expected ${expectedExceedanceRate.toFixed(2)}%), Model accuracy ${modelAccuracy} (${backtestScore.toFixed(1)}%). Assess model performance and identify any issues.` },
    { label: 'This Month', detail: 'If model accuracy is below acceptable threshold, develop recalibration plan: review model assumptions, update historical data, adjust parameters, or consider alternative models. Implement improvements and re-backtest.' },
    { label: 'Ongoing', detail: 'Conduct regular backtesting (monthly, quarterly, or annually). Monitor exceedance rates and model accuracy over time. Update models as market conditions change or new data becomes available. Maintain model documentation and validation records.' },
  ];

  return {
    predictedCVaR,
    confidenceLevel,
    actualLossesArray,
    exceedances,
    exceedanceRate,
    averageExceedance,
    backtestScore,
    modelAccuracy,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function ConditionalVarCvarBacktestCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      predictedCVaR: undefined,
      actualLosses: undefined,
      confidenceLevel: 95,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="cvar-backtest-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Conditional VaR (CVaR) Backtest Calculator
          </CardTitle>
          <CardDescription>Backtest Conditional Value-at-Risk (CVaR) models by comparing predicted CVaR against actual losses to assess model accuracy and tail risk capture.</CardDescription>
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
                  name="predictedCVaR"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Predicted CVaR ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 50000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                  name="actualLosses"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Actual Losses (comma-separated, e.g., 30000, 45000, 52000, 35000)</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="e.g., 30000, 45000, 52000, 35000, 28000" value={field.value ?? ''} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Run backtest
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
            <CardDescription>See backtest results: exceedances, exceedance rate, average exceedance, and model accuracy assessment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Exceedance Rate</p>
                <p className="text-2xl font-semibold text-primary">{result.exceedanceRate.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">Expected: {100 - result.confidenceLevel}%</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Exceedances</p>
                <p className="text-2xl font-semibold text-primary">{result.exceedances}</p>
                <p className="text-xs text-muted-foreground">Out of {result.actualLossesArray.length}</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Average Exceedance</p>
                <p className="text-2xl font-semibold text-primary">{result.averageExceedance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Model Accuracy</p>
                <p className="text-2xl font-semibold text-primary">{result.modelAccuracy}</p>
                <p className="text-xs text-muted-foreground">Score: {result.backtestScore.toFixed(1)}%</p>
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
            <strong>Exceedances</strong> = Count of actual losses exceeding predicted CVaR. Exceedances indicate instances where actual losses exceed model predictions.
          </p>
          <p>
            <strong>Exceedance Rate</strong> = (Exceedances / Total Observations) Ã— 100. The percentage of observations where actual losses exceed predicted CVaR. For 95% confidence level, expected exceedance rate is 5%.
          </p>
          <p>
            <strong>Average Exceedance</strong> = Average of losses that exceed predicted CVaR. Measures the severity of exceedances. Should be close to predicted CVaR for accurate models.
          </p>
          <p>
            <strong>Backtest Score</strong> = (Exceedance Rate Accuracy Ã— 50%) + (Average Exceedance Accuracy Ã— 50%). Composite score (0-100) assessing overall model accuracy. Higher scores indicate better model performance.
          </p>
          <p>
            <strong>Expected Exceedance Rate</strong> = 100% - Confidence Level. For 95% confidence, expected exceedance rate is 5%. Actual exceedance rate should be close to expected for accurate models.
          </p>
          <p>CVaR backtesting evaluates model accuracy by comparing predicted CVaR against actual losses. Key metrics: exceedance rate (should match expected), average exceedance (should match predicted CVaR), and backtest score (overall accuracy). Regular backtesting ensures models remain accurate over time.</p>
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
                <p className="text-sm text-muted-foreground">Predicted CVaR</p>
                <p className="text-xl font-semibold text-primary">
                  ${result.predictedCVaR.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Exceedance Difference</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.exceedanceRate - (100 - result.confidenceLevel)).toFixed(2)}%
                </p>
                <p className="text-xs text-muted-foreground">vs expected</p>
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
    <meta itemProp="name" content="The Definitive Guide to Conditional VaR (CVaR) Backtesting: Validating Tail Risk Models" />
    <meta itemProp="description" content="A comprehensive guide to backtesting Conditional Value-at-Risk (CVaR) models by comparing predicted CVaR against actual losses to assess model accuracy, tail risk capture, and risk management effectiveness." />
    <meta itemProp="keywords" content="CVaR backtest, conditional VaR backtesting, expected shortfall backtest, tail risk validation, risk model validation, exceedance rate, model accuracy, risk management" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-01-02" />
    <meta itemProp="url" content="/definitive-cvar-backtest-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Conditional VaR (CVaR) Backtesting: Validating Tail Risk Models</h1>
    <p className="text-lg italic text-muted-foreground">A comprehensive guide to understanding and performing CVaR backtesting, a critical process for validating Conditional Value-at-Risk models and ensuring accurate tail risk capture in portfolio risk management.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#overview" className="hover:underline">Overview: CVaR Backtesting</a></li>
        <li><a href="#cvar" className="hover:underline">Understanding Conditional VaR (CVaR)</a></li>
        <li><a href="#backtest" className="hover:underline">Backtesting Process</a></li>
        <li><a href="#metrics" className="hover:underline">Key Backtest Metrics</a></li>
        <li><a href="#interpretation" className="hover:underline">Interpreting Results</a></li>
        <li><a href="#calibration" className="hover:underline">Model Calibration</a></li>
        <li><a href="#best" className="hover:underline">Best Practices</a></li>
    </ul>
<hr />

    <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: CVaR Backtesting</h2>
    <p><b>CVaR backtesting</b> is a critical process for validating Conditional Value-at-Risk (CVaR) models by comparing predicted CVaR values against actual portfolio losses. It assesses whether models accurately capture tail risk and extreme loss scenarios, ensuring effective risk management.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Concepts</h3>
    <ul>
        <li><b>CVaR Backtesting:</b> Process of comparing predicted CVaR against actual losses</li>
        <li><b>Exceedances:</b> Instances where actual losses exceed predicted CVaR</li>
        <li><b>Exceedance Rate:</b> Percentage of observations with exceedances</li>
        <li><b>Model Accuracy:</b> Measure of how well the model predicts tail risk</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Why CVaR Backtesting Matters</h3>
    <p>CVaR backtesting provides critical insights for:</p>
    <ul>
        <li><b>Model Validation:</b> Ensuring CVaR models accurately capture tail risk</li>
        <li><b>Risk Management:</b> Confirming risk measures are reliable for decision-making</li>
        <li><b>Regulatory Compliance:</b> Meeting requirements for risk model validation</li>
        <li><b>Continuous Improvement:</b> Identifying and addressing model deficiencies</li>
    </ul>

<hr />

    <h2 id="cvar" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding Conditional VaR (CVaR)</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">CVaR Definition</h3>
    <p><b>Conditional VaR (CVaR)</b>, also known as Expected Shortfall, is the average loss beyond the VaR threshold. While VaR estimates the maximum loss at a confidence level, CVaR estimates the average loss when losses exceed VaR, providing additional insight into tail risk severity.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">CVaR vs VaR</h3>
    <ul>
        <li><b>VaR:</b> Maximum expected loss at confidence level (e.g., "losses won't exceed $X with 95% confidence")</li>
        <li><b>CVaR:</b> Average loss beyond VaR threshold (e.g., "when losses exceed VaR, average loss is $Y")</li>
        <li><b>CVaR Advantage:</b> Provides information about tail risk severity, not just threshold</li>
    </ul>

<hr />

    <h2 id="backtest" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Backtesting Process</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Step-by-Step Process</h3>
    <ol>
        <li><b>Collect Data:</b> Gather predicted CVaR values and corresponding actual losses</li>
        <li><b>Identify Exceedances:</b> Count instances where actual losses exceed predicted CVaR</li>
        <li><b>Calculate Metrics:</b> Compute exceedance rate, average exceedance, and backtest score</li>
        <li><b>Assess Accuracy:</b> Compare actual performance to expected performance</li>
        <li><b>Take Action:</b> Recalibrate model if accuracy is insufficient</li>
    </ol>

    <h3 className="text-xl font-semibold text-foreground mt-6">Data Requirements</h3>
    <ul>
        <li><b>Predicted CVaR:</b> Model predictions for each period</li>
        <li><b>Actual Losses:</b> Realized losses for corresponding periods</li>
        <li><b>Sufficient Observations:</b> Minimum 100-250 observations for reliable backtesting</li>
        <li><b>Time Alignment:</b> Predicted CVaR and actual losses must be properly aligned</li>
    </ul>

<hr />

    <h2 id="metrics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Key Backtest Metrics</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Exceedance Rate</h3>
    <p>Exceedance rate = (Exceedances / Total Observations) Ã— 100</p>
    <p>For 95% confidence level, expected exceedance rate is 5%. Actual exceedance rate should be close to expected for accurate models.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Average Exceedance</h3>
    <p>Average exceedance = Average of losses exceeding predicted CVaR</p>
    <p>Should be close to predicted CVaR for accurate models. Large differences suggest model underestimation or overestimation of tail risk.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Backtest Score</h3>
    <p>Composite score (0-100) combining exceedance rate accuracy and average exceedance accuracy. Higher scores indicate better model performance.</p>

<hr />

    <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting Results</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">High Exceedance Rate</h3>
    <p>Exceedance rate above expected suggests:</p>
    <ul>
        <li>Model underestimates risk</li>
        <li>Predicted CVaR is too low</li>
        <li>Model recalibration required</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Low Exceedance Rate</h3>
    <p>Exceedance rate below expected suggests:</p>
    <ul>
        <li>Model overestimates risk</li>
        <li>Predicted CVaR is too high</li>
        <li>May lead to excessive capital allocation</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Model Accuracy Levels</h3>
    <ul>
        <li><b>Excellent (90-100%):</b> Model accurately captures tail risk</li>
        <li><b>Good (75-90%):</b> Model performs reasonably well with minor adjustments possible</li>
        <li><b>Fair (60-75%):</b> Model shows some inaccuracy, recalibration recommended</li>
        <li><b>Poor (&lt;60%):</b> Model significantly inaccurate, immediate recalibration required</li>
    </ul>

<hr />

    <h2 id="calibration" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Model Calibration</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">When to Recalibrate</h3>
    <p>Recalibrate models when:</p>
    <ul>
        <li>Backtest score falls below acceptable threshold (typically 75%)</li>
        <li>Exceedance rate significantly differs from expected</li>
        <li>Average exceedance differs substantially from predicted CVaR</li>
        <li>Market conditions change significantly</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Recalibration Steps</h3>
    <ol>
        <li>Review model assumptions and parameters</li>
        <li>Update historical data and time periods</li>
        <li>Adjust confidence levels or risk parameters</li>
        <li>Re-backtest to validate improvements</li>
        <li>Document changes and rationale</li>
    </ol>

<hr />

    <h2 id="best" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Best Practices</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Regular Backtesting</h3>
    <p>Conduct backtesting:</p>
    <ul>
        <li><b>Monthly:</b> For active portfolios with frequent changes</li>
        <li><b>Quarterly:</b> For most portfolios and risk models</li>
        <li><b>Annually:</b> For stable portfolios with infrequent changes</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Documentation</h3>
    <p>Maintain records of:</p>
    <ul>
        <li>Backtest results and metrics</li>
        <li>Model changes and recalibrations</li>
        <li>Rationale for decisions</li>
        <li>Regulatory compliance evidence</li>
    </ul>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p><b>CVaR backtesting</b> is essential for validating Conditional Value-at-Risk models and ensuring accurate tail risk capture. Key metrics include exceedance rate (should match expected), average exceedance (should match predicted CVaR), and backtest score (overall accuracy). Regular backtesting, proper interpretation, and timely recalibration ensure models remain accurate and effective for risk management.</p>
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
          <p>This tool backtests Conditional Value-at-Risk (CVaR) models by comparing predicted CVaR against actual losses to assess model accuracy and tail risk capture.</p>
          <p>Outputs include exceedance rate, exceedances, average exceedance, backtest score, model accuracy, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

