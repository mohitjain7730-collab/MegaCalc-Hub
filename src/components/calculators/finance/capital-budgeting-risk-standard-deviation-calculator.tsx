'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ScatterChart,
  TrendingUp,
  AlertCircle,
  Target,
  Info,
  Calculator,
  DollarSign,
  BarChart3,
  Briefcase,
  Percent,
  Sigma,
  CheckCircle2,
  ArrowRight,
  PieChart,
  Activity,
  Scale
} from 'lucide-react';
import Link from 'next/link';

// Schema for up to 5 scenarios
const scenarioSchema = z.object({
  prob: z.number().min(0).max(100).optional(),
  flow: z.number().optional(),
});

const formSchema = z.object({
  scenarios: z.array(scenarioSchema),
});

type FormValues = z.infer<typeof formSchema>;

export default function CapitalBudgetingRiskCalculator() {
  const [result, setResult] = useState<{
    expectedValue: number;
    variance: number;
    stdDev: number;
    coefVariation: number;
    riskLevel: string;
    totalProb: number;
    interpretation: string;
    recommendation: string;
    insights: string[];
    riskFactors: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      scenarios: [
        { prob: 20, flow: undefined }, // Pessimistic
        { prob: 60, flow: undefined }, // Most Likely
        { prob: 20, flow: undefined }, // Optimistic
        { prob: undefined, flow: undefined },
        { prob: undefined, flow: undefined },
      ],
    },
  });

  const calculate = (v: FormValues) => {
    // Filter valid inputs
    const validScenarios = v.scenarios.filter(s => s.prob !== undefined && s.flow !== undefined) as { prob: number, flow: number }[];

    if (validScenarios.length < 2) return null; // Need at least 2 points for variance

    let totalProb = 0;
    let expectedValue = 0;

    // 1. Calculate Expected Value (Weighted Mean)
    validScenarios.forEach(s => {
      totalProb += s.prob;
      expectedValue += s.flow * (s.prob / 100);
    });

    // unexpected probability handling
    if (Math.abs(totalProb - 100) > 1) {
      // If not 100%, we normalize? Or just warn?
      // For this calc, let's normalize the weights for calculation but return totalProb for warning
      const factor = 100 / totalProb;
      expectedValue = 0;
      validScenarios.forEach(s => {
        expectedValue += s.flow * ((s.prob * factor) / 100);
      });
    }

    // 2. Calculate Variance & Standard Deviation
    let variance = 0;
    const factor = Math.abs(totalProb - 100) > 1 ? (100 / totalProb) : 1;

    validScenarios.forEach(s => {
      const p = (s.prob * factor) / 100; // Normalized probability decimals
      const diff = s.flow - expectedValue;
      variance += (diff * diff) * p;
    });

    const stdDev = Math.sqrt(variance);
    const coefVariation = expectedValue !== 0 ? stdDev / expectedValue : 0;

    // Interpretation Rating based on CV (Coefficient of Variation)
    // CV < 0.2: Low Risk
    // CV 0.2 - 0.5: Moderate
    // CV > 0.5: High Risk
    // CV > 1.0: Speculative
    let riskLevel = 'Low';
    if (coefVariation > 1.0) riskLevel = 'Speculative';
    else if (coefVariation > 0.5) riskLevel = 'High';
    else if (coefVariation > 0.2) riskLevel = 'Moderate';

    let recommendation = '';
    if (riskLevel === 'Low') recommendation = 'Returns are highly predictable. Suitable for conservative portfolios or core utility projects.';
    else if (riskLevel === 'Moderate') recommendation = 'Standard business risk. Ensure expected returns justify this volatility (Risk-Reward trade-off).';
    else if (riskLevel === 'High') recommendation = 'Significant uncertainty. Requires a high hurdle rate (discount rate) to justify investment.';
    else recommendation = 'Highly volatile outcomes. Only invest if you can absorb potential losses for a chance at high upside (Venture Capital style).';

    // Check if pessimistic scenario is negative
    const hasLossScenario = validScenarios.some(s => s.flow < 0);

    const interpretation = `The project has an expected return of $${expectedValue.toLocaleString()} but outcomes typically deviate by ±$${stdDev.toLocaleString()}.`;

    const insights = [
      `Expected Return: $${expectedValue.toLocaleString()} (Weighted Average)`,
      `Abs. Volatility: $${stdDev.toLocaleString()} (1 SD)`,
      `Risk per Unit of Return: ${coefVariation.toFixed(2)} (CV)`
    ];

    const riskFactors = [];
    if (hasLossScenario) riskFactors.push('Loss Probability: One or more scenarios result in negative cash flow.');
    if (Math.abs(totalProb - 100) > 1) riskFactors.push(`Probability Error: Inputs sum to ${totalProb}%. Calculations normalized, but please fix inputs.`);
    if (coefVariation > 0.8) riskFactors.push('Reliability Warning: Spread of outcomes is extremely wide.');

    return {
      expectedValue,
      variance,
      stdDev,
      coefVariation,
      riskLevel,
      totalProb,
      interpretation,
      recommendation,
      insights,
      riskFactors
    };
  };

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    // Don't set null results to valid, but alert if prob is way off?
    if (res) setResult(res);
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Scenario Probabilities
          </CardTitle>
          <CardDescription>
            Define possible outcomes (e.g., Recession vs. Boom) with their probability % and expected cash flow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground mb-2">
                  <div className="col-span-4">Scenario (Optional Label)</div>
                  <div className="col-span-3">Probability (%)</div>
                  <div className="col-span-5">Cash Flow / NPV ($)</div>
                </div>

                {/* 5 Fixed Input Rows for simplicity */}
                {[0, 1, 2, 3, 4].map((index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-4 flex items-center">
                      <Badge variant="outline" className="mr-2 hidden md:flex">
                        {index === 0 ? 'Pessimistic' : index === 1 ? 'Base Case' : index === 2 ? 'Optimistic' : `Scenario ${index + 1}`}
                      </Badge>
                      <span className="md:hidden text-xs text-muted-foreground">Scen {index + 1}</span>
                    </div>
                    <div className="col-span-3">
                      <FormField
                        control={form.control}
                        name={`scenarios.${index}.prob`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="%"
                                {...field}
                                onChange={e => field.onChange(Number(e.target.value) || undefined)}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-5">
                      <FormField
                        control={form.control}
                        name={`scenarios.${index}.flow`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Cash Value"
                                {...field}
                                onChange={e => field.onChange(Number(e.target.value) || undefined)}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Standard Deviation
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <ScatterChart className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Risk Profile Analysis</CardTitle>
                  <CardDescription>Statistical Volatility Measures</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-center p-6 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/20">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Standard Deviation (σ)</p>
                  <p className="text-4xl font-bold text-indigo-700 dark:text-indigo-400">${result.stdDev.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  <p className="text-xs text-muted-foreground mt-2">Absolute Risk (Volatility)</p>
                </div>
                <div className="text-center p-6 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/20">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Expected Value (EV)</p>
                  <p className="text-3xl font-bold text-amber-700 dark:text-amber-400">${result.expectedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  <p className="text-xs text-muted-foreground mt-2">Weighted Average Outcome</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Activity className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="font-semibold">Risk Rating</p>
                  <Badge variant={result.riskLevel === 'Speculative' || result.riskLevel === 'High' ? 'destructive' : result.riskLevel === 'Moderate' ? 'secondary' : 'default'}>
                    {result.riskLevel}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Scale className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Coeff. of Variation</p>
                  <p className="text-lg font-bold">{result.coefVariation.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Relative Risk</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Sigma className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Variance</p>
                  <p className="text-sm font-medium text-muted-foreground">{(result.variance / 1000000).toFixed(1)}M</p>
                  <p className="text-xs text-muted-foreground">Squared deviation</p>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-lg font-medium text-foreground">{result.interpretation}</p>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Investment Advice:</strong> {result.recommendation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <CheckCircle2 className="h-6 w-6" />
                  Statistical Insights
                </CardTitle>
                <CardDescription>Understanding the spread</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm font-medium">{insight}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/20 dark:bg-red-900/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400">
                  <AlertCircle className="h-6 w-6" />
                  Reliability Checks
                </CardTitle>
                <CardDescription>Data integrity warnings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.riskFactors.length > 0 ? (
                  result.riskFactors.map((factor, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                      <span className="text-sm font-medium text-red-800 dark:text-red-300">{factor}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                    <p className="text-sm text-green-700 dark:text-green-300">Inputs appear consistent and valid.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Understanding the Inputs */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
          <CardDescription>
            Variables for Probability Analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <PieChart className="h-4 w-4" />
                Probability (%)
              </h4>
              <p className="text-sm text-muted-foreground">
                The likelihood of a specific scenario occurring.
                <br />
                <em>Examples:</em> 20% for "Recession", 50% for "Normal", 30% for "Boom".
                All probabilities entered <strong>must sum to 100%</strong> to be statistically valid.
              </p>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <DollarSign className="h-4 w-4" />
                Cash Flow / NPV
              </h4>
              <p className="text-sm text-muted-foreground">
                The financial outcome associated with that specific scenario. This can be annual cash flow or the total Net Present Value (NPV) of the project.
                <br />
                <em>Note: Including negative values (losses) is important for realistic risk assessment.</em>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formula Used */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Statistical Formulas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm">
              Expected Value (EV) = Σ (Probability × Cash Flow)
            </p>
            <p className="font-mono text-sm mt-2">
              Variance (σ²) = Σ [Probability × (Cash Flow - EV)²]
            </p>
            <p className="font-mono text-sm mt-2">
              Standard Deviation (σ) = √Variance
            </p>
            <p className="font-mono text-sm mt-2">
              Coefficient of Variation (CV) = σ / EV
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            We use a weighted average of squared deviations to punish outliers. The square root brings the metric back to dollars ($), making it comparable to the Expected Value.
          </p>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>
            Explore other investment and risk tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/finance/return-on-investment-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">ROI Calculator</p>
                      <p className="text-sm text-muted-foreground">Basic returns</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/npv-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Calculator className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">NPV Calculator</p>
                      <p className="text-sm text-muted-foreground">Time value of money</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/project-irr-vs-wacc-comparison-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">IRR vs WACC Calculator</p>
                      <p className="text-sm text-muted-foreground">Profitability rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/wacc-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Scale className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">WACC</p>
                      <p className="text-sm text-muted-foreground">Cost of capital</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/information-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-teal-600" />
                    <div>
                      <p className="font-medium">Information Ratio</p>
                      <p className="text-sm text-muted-foreground">Risk-adjusted return</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/break-even-analysis-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Break-Even Analysis</p>
                      <p className="text-sm text-muted-foreground">Risk buffer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Comprehensive Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="Capital Budgeting Risk: Standard Deviation & Variance Analysis" />
        <meta itemProp="description" content="A deep dive into measuring the risk of capital projects using statistical tools like Standard Deviation and Coefficient of Variation." />
        <meta itemProp="author" content="Financial Risk Institute" />
        <meta itemProp="datePublished" content="2025-10-05" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Capital Budgeting Risk: Standard Deviation & Variance Analysis</h1>
        <p className="text-lg italic text-muted-foreground">In finance, "risk" is not just the chance of losing money—it's the likelihood that your actual return will differ from your expected return. Statistical tools allow us to quantify this uncertainty precisely.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#definition" className="hover:underline">What is Investment Risk vs. Uncertainty?</a></li>
          <li><a href="#std-dev" className="hover:underline">Understanding Standard Deviation (σ)</a></li>
          <li><a href="#cv" className="hover:underline">Coefficient of Variation: The Great Equalizer</a></li>
          <li><a href="#application" className="hover:underline">Comparing Two Projects</a></li>
          <li><a href="#diversification" className="hover:underline">Correlation and Diversification</a></li>
        </ul>
        <hr className="my-6" />

        <h2 id="definition" className="text-2xl font-bold text-foreground pt-8">What is Investment Risk vs. Uncertainty?</h2>
        <p>In Capital Budgeting, risk refers to the variability of potential outcomes. If a Treasury Bond pays 5%, there is zero variability; risk is zero. If a new product launch might earn $1M or lose $500k, the variability is high.</p>
        <p><strong>Scenario Analysis</strong> helps us model this by assigning probabilities to different states of the world (e.g., "Recession", "Base Case", "Boom") to calculate a weighted average, known as the **Expected Value**.</p>

        <h2 id="std-dev" className="text-2xl font-bold text-foreground pt-8">Understanding Standard Deviation (σ)</h2>
        <p>Standard Deviation measures the dispersion of data points from the mean. In finance, it acts as a proxy for risk.</p>
        <ul className="list-disc ml-6 space-y-2 mt-4">
          <li><strong>Tight Distribution (Low σ):</strong> Outcomes are clustered close to the mean. Prediction is reliable.</li>
          <li><strong>Wide Distribution (High σ):</strong> Outcomes are scattered. Extreme wins and extreme losses are more likely.</li>
        </ul>
        <p><em>Example:</em> Project A has an Expected Value of $1000 and σ of $10. You can be 95% confident the return will be between $980 and $1020. Project B has EV $1000 and σ of $500. Returns could swing from $0 to $2000. Project B is riskier.</p>

        <hr className="my-6" />

        <h2 id="cv" className="text-2xl font-bold text-foreground pt-8">Coefficient of Variation: The Great Equalizer</h2>
        <p>Standard Deviation (Absolute Risk) has a flaw: it scales with size. A $1 Million project will naturally have a larger deviation in dollars than a $1,000 project, even if it's safer.</p>
        <p>The **Coefficient of Variation (CV)** solves this by dividing risk by return:</p>

        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-primary font-bold">
            CV = Standard Deviation / Expected Value
          </p>
        </div>
        <p>This tells you the "units of risk taken per unit of return." <br />
          If Project A has CV 0.2 and Project B has CV 0.8, Project A is mathematically superior on a risk-adjusted basis, assuming you want to minimize volatility.</p>

        <hr className="my-6" />

        <h2 id="application" className="text-2xl font-bold text-foreground pt-8">Comparing Two Projects</h2>
        <p>Imagine you are a CFO choosing between two expansions:</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="border border-blue-200 bg-blue-50/50 p-4 rounded-lg">
            <h4 className="font-bold text-blue-700">Project X (Safe)</h4>
            <p className="text-sm mt-1">Expected Return: $200,000</p>
            <p className="text-sm">Std Dev: $40,000</p>
            <p className="font-bold mt-2">CV: 0.20</p>
          </div>
          <div className="border border-orange-200 bg-orange-50/50 p-4 rounded-lg">
            <h4 className="font-bold text-orange-700">Project Y (Risky)</h4>
            <p className="text-sm mt-1">Expected Return: $300,000</p>
            <p className="text-sm">Std Dev: $150,000</p>
            <p className="font-bold mt-2">CV: 0.50</p>
          </div>
        </div>
        <p className="mt-4">Project Y offers more money ($300k vs $200k), but much more risk (0.50 risk vs 0.20 risk). A conservative company chooses X. An aggressive company chooses Y <em>only if</em> they believe the extra return compensates for the sleepless nights.</p>

        <hr className="my-6" />

        <h2 id="diversification" className="text-2xl font-bold text-foreground pt-8">Correlation and Diversification</h2>
        <p>Calculating the risk of a single project is "Stand-Alone Risk." However, if a company holds multiple projects, the **Portfolio Risk** might be lower if the projects are negatively correlated.</p>
        <p>Example: An Umbrella factory and a Sunscreen factory. They are risky individually (weather dependent), but together, they form a stable portfolio because when one fails, the other succeeds. Standard Deviation calculations are the building blocks of this Portfolio Theory.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common queries about statistical risk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Why do we square the differences for Variance?</h4>
              <p className="text-muted-foreground">
                Squaring ensures that negative deviations (performing below expectations) don't cancel out positive deviations. It also penalizes large outliers more heavily than small ones.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is the "68-95-99.7" Rule?</h4>
              <p className="text-muted-foreground">
                Assuming a Normal Distribution (Bell Curve), 68% of outcomes fall within ±1 Standard Deviation, 95% within ±2 SDs, and 99.7% within ±3 SDs. This helps managers set "Worst Case" boundaries.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Is a higher Standard Deviation always bad?</h4>
              <p className="text-muted-foreground">
                Not if you are seeking "upside potential." In Venture Capital, high deviation is desired because it means there's a small chance of a 100x return. In utility bonds, high deviation is terrible because you just want stability.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What if my probabilities don't sum to 100%?</h4>
              <p className="text-muted-foreground">
                The math breaks. Most models (including this calculator) will normalize the weights to force them to 100%, but accurate inputs are crucial for valid results.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can I use this for stock portfolios?</h4>
              <p className="text-muted-foreground">
                Yes, the math is identical. You can input different stock return scenarios to calculate portfolio volatility.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is "Beta" risk?</h4>
              <p className="text-muted-foreground">
                Standard Deviation measures "Total Risk." Beta measures "Market Risk" (risk you can't diversify away). This calculator focuses on Total Risk (Stand-Alone Risk).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage of Calculator */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Usage of this Calculator
          </CardTitle>
          <CardDescription>
            Who strictly needs this tool and when
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Who should use */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Target className="h-5 w-5 text-blue-600" />
              Who Should Use This Tool?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Financial Analysts</strong>
                <span className="text-sm text-muted-foreground">To model "Best Case / Worst Case" scenarios for investment committees.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Project Managers</strong>
                <span className="text-sm text-muted-foreground">To set expectations. "We expect $1M profit, but there is a 20% chance of a $200k loss."</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Actuaries</strong>
                <span className="text-sm text-muted-foreground">To price insurance policies based on the variance of claim events.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Business Students</strong>
                <span className="text-sm text-muted-foreground">Learning Corporate Finance statistics (Mean-Variance optimization).</span>
              </div>
            </div>
          </div>

          <hr className="border-border/50" />

          {/* Limitations */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Limitations & Nuances
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>GIGO (Garbage In, Garbage Out):</strong> The math is perfect, but if your probability estimates (e.g., "There's a 90% chance of boom") are guesses, the result is a precise-looking guess.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Normal Distribution Fallacy:</strong> Financial markets often have "Fat Tails" (Black Swan events). Standard Deviation tends to underestimate the probability of extreme crashes.</span>
              </li>
            </ul>
          </div>

          <hr className="border-border/50" />

          {/* Real World Examples */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Real-World Examples
            </h4>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Pharmaceutical R&D</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  Developing a drug has binary outcomes with high variance: 90% chance of failure ($0 revenue, loss of R&D cost) vs 10% chance of blockbuster ($10 Billion). STD DEV is massive.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Government Bonds</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                  Return is fixed (e.g., 4%). Probability is 100%. Expected Value = 4%. Variance = 0. Standard Deviation = 0. This is the "Risk-Free Rate" baseline.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Capital Budgeting Risk Calculator quantifies the uncertainty of an investment using statistical variance.</p>
          <p>By determining the Standard Deviation and Coefficient of Variation, investors can compare the risk-adjusted returns of different projects.</p>
          <p>Use this tool to move beyond "best guess" estimates and make data-driven decisions that account for volatility.</p>
        </CardContent>
      </Card>
    </div>
  );
}
