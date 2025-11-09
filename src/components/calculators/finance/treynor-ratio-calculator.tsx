'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, TrendingUp, Shield, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  portfolioReturn: z.number(),
  riskFreeRate: z.number(),
  beta: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function TreynorRatioCalculator() {
  const [result, setResult] = useState<{ 
    treynorRatio: number; 
    interpretation: string; 
    riskLevel: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      portfolioReturn: undefined,
      riskFreeRate: undefined,
      beta: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.portfolioReturn == null || v.riskFreeRate == null || v.beta == null) return null;
    return (v.portfolioReturn - v.riskFreeRate) / v.beta;
  };

  const interpret = (treynorRatio: number) => {
    if (treynorRatio >= 15) return 'Excellent systematic risk-adjusted returns with superior performance.';
    if (treynorRatio >= 10) return 'Good systematic risk-adjusted returns with solid performance.';
    if (treynorRatio >= 5) return 'Adequate systematic risk-adjusted returns but room for improvement.';
    if (treynorRatio >= 0) return 'Poor systematic risk-adjusted returns - high systematic risk.';
    return 'Negative systematic risk-adjusted returns - portfolio underperforming market risk.';
  };

  const getRiskLevel = (treynorRatio: number) => {
    if (treynorRatio >= 15) return 'Excellent';
    if (treynorRatio >= 10) return 'Good';
    if (treynorRatio >= 5) return 'Adequate';
    if (treynorRatio >= 0) return 'Poor';
    return 'Very Poor';
  };

  const getRecommendation = (treynorRatio: number) => {
    if (treynorRatio >= 15) return 'Maintain current strategy - excellent systematic risk management.';
    if (treynorRatio >= 10) return 'Continue current approach with focus on systematic risk optimization.';
    if (treynorRatio >= 5) return 'Focus on improving systematic risk-adjusted returns.';
    if (treynorRatio >= 0) return 'Urgent need to improve systematic risk management strategies.';
    return 'Critical situation - immediate systematic risk management required.';
  };

  const getStrength = (treynorRatio: number) => {
    if (treynorRatio >= 15) return 'Very Strong';
    if (treynorRatio >= 10) return 'Strong';
    if (treynorRatio >= 5) return 'Moderate';
    if (treynorRatio >= 0) return 'Weak';
    return 'Very Weak';
  };

  const getInsights = (treynorRatio: number) => {
    const insights = [];
    if (treynorRatio >= 15) {
      insights.push('Exceptional systematic risk management');
      insights.push('Superior market risk-adjusted performance');
      insights.push('Excellent systematic risk efficiency');
    } else if (treynorRatio >= 10) {
      insights.push('Strong systematic risk management');
      insights.push('Good market risk-adjusted performance');
      insights.push('Solid systematic risk efficiency');
    } else if (treynorRatio >= 5) {
      insights.push('Adequate systematic risk management');
      insights.push('Room for systematic risk optimization');
      insights.push('Monitor market risk exposure');
    } else if (treynorRatio >= 0) {
      insights.push('Poor systematic risk management');
      insights.push('High systematic risk exposure');
      insights.push('Urgent need for systematic risk improvement');
    } else {
      insights.push('Very poor systematic risk management');
      insights.push('Significant systematic risk exposure');
      insights.push('Critical systematic risk management issues');
    }
    return insights;
  };

  const getConsiderations = (treynorRatio: number) => {
    const considerations = [];
    considerations.push('Treynor ratio assumes CAPM model validity');
    considerations.push('Beta may not capture all systematic risks');
    considerations.push('Historical performance may not predict future results');
    considerations.push('Compare with appropriate market benchmarks');
    considerations.push('Consider investment objectives and risk tolerance');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const treynorRatio = calculate(values);
    if (treynorRatio !== null) {
      setResult({
        treynorRatio,
        interpretation: interpret(treynorRatio),
        riskLevel: getRiskLevel(treynorRatio),
        recommendation: getRecommendation(treynorRatio),
        strength: getStrength(treynorRatio),
        insights: getInsights(treynorRatio),
        considerations: getConsiderations(treynorRatio)
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <CardTitle>Treynor Ratio Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate your portfolio's Treynor ratio to assess systematic risk-adjusted returns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="portfolioReturn" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Portfolio Return (%)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter portfolio return" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="riskFreeRate" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Risk-Free Rate (%)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter risk-free rate" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="beta" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Beta (Systematic Risk)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter beta" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Treynor Ratio
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Landmark className="h-6 w-6 text-primary" />
                  <CardTitle>Treynor Ratio Result</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={result.riskLevel === 'Excellent' ? 'default' : result.riskLevel === 'Good' ? 'secondary' : 'destructive'}>
                    {result.riskLevel}
                  </Badge>
                  <Badge variant="outline">{result.strength}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold text-primary">
                  {result.treynorRatio.toFixed(3)}
                </div>
                <p className="text-lg text-muted-foreground">{result.interpretation}</p>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{result.recommendation}</AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Info className="h-6 w-6 text-primary" />
                <CardTitle>Insights & Analysis</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Strengths & Opportunities
                  </h4>
                  <ul className="space-y-2">
                    {result.insights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Important Considerations
                  </h4>
                  <ul className="space-y-2">
                    {result.considerations.map((consideration, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{consideration}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>
            Explore other essential financial metrics for comprehensive portfolio analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/category/finance/sharpe-ratio-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Sharpe Ratio</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/sortino-ratio-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Sortino Ratio</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/free-cash-flow-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Free Cash Flow</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/enterprise-value-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Enterprise Value</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to the Treynor Ratio: Calculation, Interpretation, and Systematic Risk Analysis" />
    <meta itemProp="description" content="An expert guide detailing the Treynor Ratio formula, its role in measuring risk-adjusted performance by focusing solely on market (systematic) risk, and its comparison to the Sharpe Ratio and Jensen's Alpha." />
    <meta itemProp="keywords" content="treynor ratio formula explained, systematic risk beta finance, risk-adjusted return metric, comparison to sharpe ratio, capital asset pricing model CAPM, treynor measure interpretation" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-11-06" /> 
    <meta itemProp="url" content="/definitive-treynor-ratio-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to the Treynor Ratio: Measuring Performance Against Market Risk</h1>
    <p className="text-lg italic text-muted-foreground">Master the specialized metric that assesses investment returns based exclusively on the systematic risk exposure of the portfolio.</p>
    

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#definition" className="hover:underline">Treynor Ratio: Definition and Core Focus</a></li>
        <li><a href="#formula" className="hover:underline">The Treynor Ratio Formula and Components</a></li>
        <li><a href="#beta" className="hover:underline">The Role of Beta ($\beta$): Measuring Systematic Risk</a></li>
        <li><a href="#vs-sharpe" className="hover:underline">Treynor Ratio vs. Sharpe Ratio: The Key Distinction</a></li>
        <li><a href="#interpretation" className="hover:underline">Interpretation and Benchmarking Performance</a></li>
    </ul>
<hr />

    {/* TREYNOR RATIO: DEFINITION AND CORE FOCUS */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Treynor Ratio: Definition and Core Focus</h2>
    <p>The **Treynor Ratio**, also known as the Treynor Measure or Reward-to-Volatility Ratio, is a risk-adjusted performance metric that evaluates the return generated by an investment portfolio relative to its **systematic risk**.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Focus on Undiversifiable Risk</h3>
    <p>Unlike the Sharpe Ratio, which uses standard deviation to measure total risk, the Treynor Ratio focuses solely on **Systematic Risk** (or market risk), quantified by the portfolio's **Beta ($\beta$)**. Systematic risk is the risk inherent in the entire market or economy and cannot be eliminated through diversification.</p>
    <p>The ratio credits a portfolio manager only for the return earned that is necessary to compensate the investor for taking on this unavoidable market risk.</p>

<hr />

    {/* THE TREYNOR RATIO FORMULA AND COMPONENTS */}
    <h2 id="formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Treynor Ratio Formula and Components</h2>
    <p>The Treynor Ratio divides the portfolio's excess return (the reward) by its systematic risk (Beta).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Identity</h3>
    <p>The formula for the Treynor Ratio (T) is:</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'T = (R_p - R_f) / β_p'}
        </p>
    </div>

    <p>Where:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li>$R_p$ = Portfolio Return (Average return over the period).</li>
        <li>$R_f$ = Risk-Free Rate (Return of a risk-free asset, typically a Treasury bill).</li>
        <li>$\beta_p$ = Beta of the Portfolio (Measure of systematic risk).</li>
    </ul>

<hr />

    {/* THE ROLE OF BETA ($\beta$): MEASURING SYSTEMATIC RISK */}
    <h2 id="beta" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Role of Beta ($\beta$): Measuring Systematic Risk</h2>
    <p>Beta ($\beta$) is the denominator of the Treynor Ratio and is derived directly from the Capital Asset Pricing Model (CAPM). It measures the volatility of the portfolio relative to the volatility of the overall market.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Interpretation of Beta</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li>**Beta ($\beta$) = 1.0:** The portfolio's price moves exactly in line with the market (e.g., the S&P 500).</li>
        <li><strong className="font-semibold">Beta is greater than 1.0:</strong> The portfolio is more volatile than the market (higher systematic risk).</li>
        <li><strong className="font-semibold">Beta is less than 1.0:</strong> The portfolio is less volatile than the market (lower systematic risk).</li>
    </ul>
    <p>By using Beta, the Treynor Ratio essentially assumes that the portfolio is fully diversified, and therefore, the only relevant risk is the unavoidable systematic risk.</p>

<hr />

    {/* TREYNOR RATIO VS. SHARPE RATIO: THE KEY DISTINCTION */}
    <h2 id="vs-sharpe" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Treynor Ratio vs. Sharpe Ratio: The Key Distinction</h2>
    <p>The difference between the Treynor Ratio and the Sharpe Ratio lies entirely in the type of risk used in the denominator.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Sharpe Ratio (Total Risk)</h3>
    <p>The Sharpe Ratio uses **Standard Deviation ($\sigma$)** in the denominator, measuring the portfolio's **Total Risk** (Systematic Risk + Unsystematic Risk). It penalizes managers for any volatility, including the unique risks that good diversification should eliminate.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Treynor Ratio (Systematic Risk)</h3>
    <p>The Treynor Ratio uses **Beta ($\beta$)** in the denominator, measuring only **Systematic Risk**. It is primarily used to evaluate **well-diversified portfolios** because it only judges the returns against the risk that cannot be eliminated.</p>
    <p>If a portfolio is not well-diversified (has high unsystematic risk), the Sharpe Ratio will be lower, providing a more conservative and accurate assessment of its overall risk-adjusted performance.</p>

<hr />

    {/* INTERPRETATION AND BENCHMARKING PERFORMANCE */}
    <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpretation and Benchmarking Performance</h2>
    <p>The Treynor Ratio is expressed as a number (e.g., 0.50), representing the amount of excess return generated per unit of systematic risk taken.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Comparison Rule</h3>
    <p>A **higher Treynor Ratio** signifies superior performance. When comparing mutual funds, the fund with the higher ratio is deemed to be more efficiently generating returns for the level of market risk assumed.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Contextual Use</h3>
    <p>The Treynor Ratio is best used when evaluating:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li>**Highly Diversified Funds:** Its reliance on Beta is valid only if unsystematic risk has been effectively eliminated.</li>
        <li>**Portfolios within a Larger Portfolio:** When a portfolio is just one component of a much larger, diversified asset base, its total risk is irrelevant, and only its systematic risk contribution (Beta) matters.</li>
    </ul>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The Treynor Ratio is a specialized risk-adjusted metric that isolates the performance of a portfolio by dividing the excess return by its **systematic risk ($\beta$)**. It answers how much return the portfolio provides for each unit of unavoidable market risk.</p>
    <p>A higher Treynor Ratio indicates superior efficiency in managing market exposure. It is the preferred tool for evaluating the managerial skill of funds that are already assumed to be well-diversified.</p>
</section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about Treynor Ratio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is the Treynor Ratio?</h4>
              <p className="text-muted-foreground">
                The Treynor Ratio is a risk-adjusted performance metric that measures how much excess return you receive for the systematic risk you take. It's calculated as (Portfolio Return - Risk-Free Rate) ÷ Beta. Unlike the Sharpe ratio, it focuses on market risk rather than total volatility.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate the Treynor Ratio?</h4>
              <p className="text-muted-foreground">
                The formula is: Treynor Ratio = (Portfolio Return - Risk-Free Rate) ÷ Beta. Portfolio Return is the average return of your investment. Risk-Free Rate is typically the yield on government bonds. Beta measures the systematic risk relative to the market.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is considered a good Treynor Ratio?</h4>
              <p className="text-muted-foreground">
                Generally, a Treynor ratio above 10 is considered good, above 15 is excellent, and above 5 is acceptable. Since it focuses on systematic risk, it's typically higher than Sharpe ratios for the same investment. The threshold depends on market conditions and investment objectives.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does the Treynor Ratio differ from the Sharpe Ratio?</h4>
              <p className="text-muted-foreground">
                The Sharpe ratio considers total volatility (systematic + unsystematic risk), while the Treynor ratio only considers systematic risk (beta). This makes the Treynor ratio more relevant for diversified portfolios where unsystematic risk has been eliminated. It typically provides higher values than the Sharpe ratio.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does a high Treynor Ratio mean?</h4>
              <p className="text-muted-foreground">
                A high Treynor ratio indicates that the investment provides good returns relative to its systematic risk. This suggests effective management of market risk and that the investment is achieving returns without exposing investors to excessive systematic risk. It's particularly valuable for diversified portfolios.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does a low Treynor Ratio mean?</h4>
              <p className="text-muted-foreground">
                A low Treynor ratio indicates that the investment has high systematic risk relative to its returns. This suggests that the investment may not be adequately compensating investors for the market risk they're taking. It may indicate poor systematic risk management or excessive market exposure.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of the Treynor Ratio?</h4>
              <p className="text-muted-foreground">
                The Treynor ratio assumes the CAPM model is valid and that beta accurately captures systematic risk. It doesn't account for unsystematic risk, which may be relevant for undiversified portfolios. It's based on historical data and may not predict future performance. Beta can be unstable over time.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How can I improve my Treynor Ratio?</h4>
              <p className="text-muted-foreground">
                You can improve the Treynor ratio by reducing systematic risk through better market timing, sector rotation, or hedging strategies. Focus on investments that provide higher returns with lower beta. Consider strategies that generate alpha while maintaining low systematic risk exposure.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is the Treynor Ratio important for portfolio management?</h4>
              <p className="text-muted-foreground">
                The Treynor ratio is crucial for portfolio management as it helps optimize the risk-return trade-off specifically for systematic risk. It guides asset allocation decisions, helps identify investments with good systematic risk management, and provides a standardized way to compare strategies based on market risk.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do institutional investors use the Treynor Ratio?</h4>
              <p className="text-muted-foreground">
                Institutional investors use the Treynor ratio to evaluate fund managers' systematic risk management, compare investment strategies, and optimize portfolio allocation. It's particularly important for large portfolios where diversification has eliminated most unsystematic risk, making systematic risk the primary concern.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}