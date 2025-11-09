'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  portfolioReturn: z.number(),
  riskFreeRate: z.number(),
  portfolioStdDev: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SharpeRatioCalculator() {
  const [result, setResult] = useState<{ 
    sharpeRatio: number; 
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
      portfolioStdDev: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.portfolioReturn == null || v.riskFreeRate == null || v.portfolioStdDev == null) return null;
    return (v.portfolioReturn - v.riskFreeRate) / v.portfolioStdDev;
  };

  const interpret = (sharpeRatio: number) => {
    if (sharpeRatio >= 2) return 'Excellent risk-adjusted returns with superior performance.';
    if (sharpeRatio >= 1) return 'Good risk-adjusted returns with solid performance.';
    if (sharpeRatio >= 0.5) return 'Adequate risk-adjusted returns but room for improvement.';
    if (sharpeRatio >= 0) return 'Poor risk-adjusted returns - high risk for low excess return.';
    return 'Negative risk-adjusted returns - portfolio underperforming risk-free rate.';
  };

  const getRiskLevel = (sharpeRatio: number) => {
    if (sharpeRatio >= 2) return 'Excellent';
    if (sharpeRatio >= 1) return 'Good';
    if (sharpeRatio >= 0.5) return 'Adequate';
    if (sharpeRatio >= 0) return 'Poor';
    return 'Very Poor';
  };

  const getRecommendation = (sharpeRatio: number) => {
    if (sharpeRatio >= 2) return 'Maintain current strategy - excellent risk-adjusted performance.';
    if (sharpeRatio >= 1) return 'Continue current approach with minor optimizations.';
    if (sharpeRatio >= 0.5) return 'Focus on improving risk-adjusted returns through diversification.';
    if (sharpeRatio >= 0) return 'Urgent need to improve risk management and return optimization.';
    return 'Critical situation - immediate portfolio restructuring required.';
  };

  const getStrength = (sharpeRatio: number) => {
    if (sharpeRatio >= 2) return 'Very Strong';
    if (sharpeRatio >= 1) return 'Strong';
    if (sharpeRatio >= 0.5) return 'Moderate';
    if (sharpeRatio >= 0) return 'Weak';
    return 'Very Weak';
  };

  const getInsights = (sharpeRatio: number) => {
    const insights = [];
    if (sharpeRatio >= 2) {
      insights.push('Exceptional risk-adjusted performance');
      insights.push('Superior portfolio management');
      insights.push('Excellent risk-return trade-off');
    } else if (sharpeRatio >= 1) {
      insights.push('Strong risk-adjusted performance');
      insights.push('Good portfolio management');
      insights.push('Solid risk-return balance');
    } else if (sharpeRatio >= 0.5) {
      insights.push('Adequate risk-adjusted performance');
      insights.push('Room for optimization');
      insights.push('Monitor risk management');
    } else if (sharpeRatio >= 0) {
      insights.push('Poor risk-adjusted performance');
      insights.push('High risk for low returns');
      insights.push('Urgent need for improvement');
    } else {
      insights.push('Negative risk-adjusted performance');
      insights.push('Portfolio underperforming');
      insights.push('Critical risk management issues');
    }
    return insights;
  };

  const getConsiderations = (sharpeRatio: number) => {
    const considerations = [];
    considerations.push('Sharpe ratio assumes normal distribution of returns');
    considerations.push('Historical performance may not predict future results');
    considerations.push('Risk-free rate varies by market conditions');
    considerations.push('Compare with appropriate benchmarks');
    considerations.push('Consider investment time horizon and objectives');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const sharpeRatio = calculate(values);
    if (sharpeRatio !== null) {
      setResult({
        sharpeRatio,
        interpretation: interpret(sharpeRatio),
        riskLevel: getRiskLevel(sharpeRatio),
        recommendation: getRecommendation(sharpeRatio),
        strength: getStrength(sharpeRatio),
        insights: getInsights(sharpeRatio),
        considerations: getConsiderations(sharpeRatio)
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <CardTitle>Sharpe Ratio Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate your portfolio's Sharpe ratio to assess risk-adjusted returns and performance
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
                <FormField control={form.control} name="portfolioStdDev" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Portfolio Standard Deviation (%)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter standard deviation" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Sharpe Ratio
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
                  <CardTitle>Sharpe Ratio Result</CardTitle>
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
                  {result.sharpeRatio.toFixed(3)}
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
            <Link href="/category/finance/sortino-ratio-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Sortino Ratio</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/treynor-ratio-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Treynor Ratio</p>
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
    <meta itemProp="name" content="The Definitive Guide to the Sharpe Ratio: Calculation, Interpretation, and Risk-Adjusted Returns" />
    <meta itemProp="description" content="An expert guide detailing the Sharpe Ratio formula, its role in measuring risk-adjusted performance, calculating excess return and standard deviation of returns, and its application in portfolio management and investment comparison." />
    <meta itemProp="keywords" content="sharpe ratio formula explained, calculating risk-adjusted return, excess return investment, standard deviation of portfolio returns, risk-free rate finance, investment performance metric" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-11-02" /> 
    <meta itemProp="url" content="/definitive-sharpe-ratio-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to the Sharpe Ratio: The Standard for Risk-Adjusted Performance</h1>
    <p className="text-lg italic text-muted-foreground">Master the critical metric that assesses an investment's return relative to the risk taken, quantifying the quality of the excess gain.</p>
    

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#definition" className="hover:underline">Sharpe Ratio: Definition and Core Purpose</a></li>
        <li><a href="#formula" className="hover:underline">The Sharpe Ratio Formula and Components</a></li>
        <li><a href="#excess-return" className="hover:underline">Calculating Excess Return (The Numerator)</a></li>
        <li><a href="#risk" className="hover:underline">Measuring Portfolio Risk (The Denominator)</a></li>
        <li><a href="#interpretation" className="hover:underline">Interpretation and Benchmarking Performance</a></li>
    </ul>
<hr />

    {/* SHARPE RATIO: DEFINITION AND CORE PURPOSE */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Sharpe Ratio: Definition and Core Purpose</h2>
    <p>The **Sharpe Ratio** is a measure developed by Nobel laureate William F. Sharpe that calculates the **risk-adjusted return** of an investment portfolio. It is the most widely used metric in finance for comparing the performance of different assets or strategies.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Goal: Quality of Return</h3>
    <p>The core philosophy of the Sharpe Ratio is that higher returns are only valuable if they are not accompanied by proportionally higher risk. The ratio quantifies the amount of additional return (premium) an investor receives for taking on one unit of total risk (volatility).</p>
    <p>A higher Sharpe Ratio indicates better risk-adjusted performance. A ratio of $1.0$ is generally considered good, while a ratio of $2.0$ or higher is excellent.</p>

<hr />

    {/* THE SHARPE RATIO FORMULA AND COMPONENTS */}
    <h2 id="formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Sharpe Ratio Formula and Components</h2>
    <p>The ratio is constructed by dividing the portfolio's excess return (the reward) by the portfolio's total volatility (the risk).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Identity</h3>
    <p>The formula for the Sharpe Ratio (S) is:</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'S = (R_p - R_f) / σ_p'}
        </p>
    </div>

    <p>Where:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li>$R_p$ = Return of the Portfolio (Average return over the period).</li>
        <li>$R_f$ = Risk-Free Rate (Return of a risk-free asset, like a Treasury bill).</li>
        <li>$\sigma_p$ = Standard Deviation of the Portfolio's Returns (Volatility/Risk).</li>
    </ul>

<hr />

    {/* CALCULATING EXCESS RETURN (THE NUMERATOR) */}
    <h2 id="excess-return" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculating Excess Return (The Numerator)</h2>
    <p>The numerator of the Sharpe Ratio, $(R_p - R_f)$, is the **Excess Return**—the return earned above and beyond what could have been achieved risk-free.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Risk-Free Rate ($R_f$)</h3>
    <p>The Risk-Free Rate ($R_f$) is theoretically the return of an investment with zero risk of default. In practice, this is usually defined as the yield on short-term U.S. Treasury bills (e.g., 3-month T-Bills), as they are considered free of credit risk.</p>
    <p>This subtraction ensures that the ratio only credits the portfolio manager for the return generated by taking on *actual* investment risk.</p>

<hr />

    {/* MEASURING PORTFOLIO RISK (THE DENOMINATOR) */}
    <h2 id="risk" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Measuring Portfolio Risk (The Denominator)</h2>
    <p>The denominator, $\sigma_p$, is the **Standard Deviation** of the portfolio's returns. Standard deviation is the conventional measure of volatility in finance, quantifying the dispersion of returns around the portfolio's average return.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Standard Deviation as Total Risk</h3>
    <p>In the context of the Sharpe Ratio, standard deviation measures **Total Risk**, which includes both systematic risk (market risk) and unsystematic risk (specific risk). The formula penalizes the portfolio for any volatility, regardless of whether that volatility could be diversified away.</p>
    <p>The volatility must be calculated over the same time frame as the average return and the risk-free rate (e.g., all must be annualized).</p>

<hr />

    {/* INTERPRETATION AND BENCHMARKING PERFORMANCE */}
    <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpretation and Benchmarking Performance</h2>
    <p>The Sharpe Ratio is used for making apples-to-apples comparisons of investment performance across different asset classes, strategies, and fund managers.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Comparison Rule</h3>
    <p>When comparing two portfolios, the one with the **higher Sharpe Ratio** has delivered higher returns for the equivalent amount of volatility, or the same return with lower volatility. This is the definition of superior risk-adjusted performance.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Interpretation Benchmarks</h3>
    <p>While there are no universally fixed ranges, performance is generally judged as:</p>
    <ul className="list-disc ml-6 space-y-2">
    <li><strong className="font-semibold">S &lt; 1.0 (Suboptimal):</strong> The portfolio's volatility is too high relative to its excess return.</li>
        <li>**S = 1.0:** The portfolio is generating one unit of excess return for every unit of risk taken (Generally considered good).</li>
        <li>**S {'>'} 2.0 (Excellent):** The portfolio is generating two units or more of excess return per unit of risk (High-quality performance).</li>
    </ul>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The Sharpe Ratio is the indispensable metric for quantifying the **quality** of investment returns. It measures the excess return earned by a portfolio above the risk-free rate, divided by the portfolio's total volatility (standard deviation).</p>
    <p>A higher Sharpe Ratio signifies superior risk-adjusted performance, confirming that the fund manager is efficiently generating returns without exposing investors to undue or excessive levels of risk.</p>
</section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about Sharpe Ratio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is the Sharpe Ratio?</h4>
              <p className="text-muted-foreground">
                The Sharpe Ratio is a risk-adjusted performance metric that measures how much excess return you receive for the extra volatility you endure for holding a riskier asset. It's calculated as (Portfolio Return - Risk-Free Rate) ÷ Portfolio Standard Deviation. Higher ratios indicate better risk-adjusted performance.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate the Sharpe Ratio?</h4>
              <p className="text-muted-foreground">
                The formula is: Sharpe Ratio = (Portfolio Return - Risk-Free Rate) ÷ Portfolio Standard Deviation. Portfolio Return is the average return of your investment. Risk-Free Rate is typically the yield on government bonds. Standard Deviation measures the volatility of returns.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is considered a good Sharpe Ratio?</h4>
              <p className="text-muted-foreground">
                Generally, a Sharpe ratio above 1 is considered good, above 2 is excellent, and above 0.5 is acceptable. A ratio below 0 indicates the portfolio is underperforming the risk-free rate. However, what's considered good varies by market conditions and investment objectives.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does a negative Sharpe Ratio mean?</h4>
              <p className="text-muted-foreground">
                A negative Sharpe ratio means the portfolio is underperforming the risk-free rate. This indicates that the investment is not providing adequate returns for the risk taken. It suggests the portfolio should be restructured or the investment strategy should be reconsidered.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does the Sharpe Ratio help with investment decisions?</h4>
              <p className="text-muted-foreground">
                The Sharpe ratio helps investors compare different investments on a risk-adjusted basis. It identifies which investments provide the best returns per unit of risk. This helps in portfolio optimization, asset allocation decisions, and selecting the most efficient investment strategies.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of the Sharpe Ratio?</h4>
              <p className="text-muted-foreground">
                The Sharpe ratio assumes returns are normally distributed and may not capture tail risk. It treats all volatility equally, whether upside or downside. It doesn't account for non-linear risks or extreme market events. It's based on historical data and may not predict future performance.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How can I improve my Sharpe Ratio?</h4>
              <p className="text-muted-foreground">
                You can improve the Sharpe ratio by increasing returns through better investment selection, reducing volatility through diversification, or optimizing the risk-return trade-off. Focus on investments that provide higher returns with lower volatility, and consider alternative strategies that may offer better risk-adjusted returns.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does the Sharpe Ratio differ from other risk metrics?</h4>
              <p className="text-muted-foreground">
                Unlike total return metrics, the Sharpe ratio considers risk. Unlike volatility alone, it considers the excess return over the risk-free rate. It's more comprehensive than simple return metrics but less sophisticated than downside risk measures like the Sortino ratio.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is the Sharpe Ratio important for portfolio management?</h4>
              <p className="text-muted-foreground">
                The Sharpe ratio is crucial for portfolio management as it helps optimize the risk-return trade-off. It guides asset allocation decisions, helps identify underperforming investments, and provides a standardized way to compare different strategies. It's essential for building efficient portfolios.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do institutional investors use the Sharpe Ratio?</h4>
              <p className="text-muted-foreground">
                Institutional investors use the Sharpe ratio to evaluate fund managers, compare investment strategies, and optimize portfolio allocation. It's used in performance attribution analysis, risk budgeting, and setting investment guidelines. It helps ensure that risk-taking is appropriately rewarded with returns.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}