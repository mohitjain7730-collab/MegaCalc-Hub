'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, TrendingUp, BarChart3, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  portfolioValue: z.number().positive(),
  volatility: z.number().positive(),
  confidenceLevel: z.number().min(90).max(99.9),
  timeHorizon: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ValueAtRiskCalculator() {
  const [result, setResult] = useState<{ 
    varValue: number;
    varPercentage: number;
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
      portfolioValue: undefined,
      volatility: undefined,
      confidenceLevel: 95,
      timeHorizon: 1,
    },
  });

  const calculateVaR = (v: FormValues) => {
    if (v.portfolioValue == null || v.volatility == null || v.confidenceLevel == null || v.timeHorizon == null) return null;
    
    // Convert percentages to decimals
    const volatility = v.volatility / 100;
    const confidenceLevel = v.confidenceLevel / 100;
    
    // Calculate Z-score for the confidence level
    // Using approximation for common confidence levels
    let zScore;
    if (confidenceLevel === 0.95) zScore = 1.645;
    else if (confidenceLevel === 0.99) zScore = 2.326;
    else if (confidenceLevel === 0.90) zScore = 1.282;
    else if (confidenceLevel === 0.975) zScore = 1.96;
    else {
      // Approximation for other confidence levels
      zScore = Math.sqrt(2) * Math.sqrt(-Math.log(1 - confidenceLevel));
    }
    
    // VaR calculation using parametric method
    const varValue = v.portfolioValue * volatility * zScore * Math.sqrt(v.timeHorizon);
    const varPercentage = (varValue / v.portfolioValue) * 100;
    
    return { varValue, varPercentage };
  };

  const interpret = (varPercentage: number, confidenceLevel: number) => {
    if (varPercentage <= 5) return `Very low risk - ${confidenceLevel}% confidence that losses won't exceed ${varPercentage.toFixed(1)}% of portfolio value.`;
    if (varPercentage <= 10) return `Low risk - ${confidenceLevel}% confidence that losses won't exceed ${varPercentage.toFixed(1)}% of portfolio value.`;
    if (varPercentage <= 20) return `Moderate risk - ${confidenceLevel}% confidence that losses won't exceed ${varPercentage.toFixed(1)}% of portfolio value.`;
    if (varPercentage <= 30) return `High risk - ${confidenceLevel}% confidence that losses won't exceed ${varPercentage.toFixed(1)}% of portfolio value.`;
    return `Very high risk - ${confidenceLevel}% confidence that losses won't exceed ${varPercentage.toFixed(1)}% of portfolio value.`;
  };

  const getRiskLevel = (varPercentage: number) => {
    if (varPercentage <= 5) return 'Very Low';
    if (varPercentage <= 10) return 'Low';
    if (varPercentage <= 20) return 'Moderate';
    if (varPercentage <= 30) return 'High';
    return 'Very High';
  };

  const getRecommendation = (varPercentage: number, confidenceLevel: number) => {
    if (varPercentage <= 5) return 'Excellent risk management - maintain current strategy with confidence.';
    if (varPercentage <= 10) return 'Good risk management - consider minor adjustments if risk tolerance is lower.';
    if (varPercentage <= 20) return 'Moderate risk management - review portfolio allocation and risk controls.';
    if (varPercentage <= 30) return 'High risk exposure - consider reducing risk through diversification or hedging.';
    return 'Very high risk exposure - urgent review needed to reduce portfolio risk.';
  };

  const getStrength = (varPercentage: number) => {
    if (varPercentage <= 5) return 'Excellent';
    if (varPercentage <= 10) return 'Strong';
    if (varPercentage <= 20) return 'Moderate';
    if (varPercentage <= 30) return 'Weak';
    return 'Very Weak';
  };

  const getInsights = (varPercentage: number, confidenceLevel: number, timeHorizon: number) => {
    const insights = [];
    
    if (varPercentage <= 5) {
      insights.push('Very conservative risk profile');
      insights.push('Excellent downside protection');
      insights.push('Low probability of significant losses');
    } else if (varPercentage <= 10) {
      insights.push('Conservative risk profile');
      insights.push('Good downside protection');
      insights.push('Low probability of moderate losses');
    } else if (varPercentage <= 20) {
      insights.push('Moderate risk profile');
      insights.push('Balanced risk-return profile');
      insights.push('Reasonable downside exposure');
    } else if (varPercentage <= 30) {
      insights.push('Aggressive risk profile');
      insights.push('Higher return potential');
      insights.push('Significant downside exposure');
    } else {
      insights.push('Very aggressive risk profile');
      insights.push('Maximum return potential');
      insights.push('High downside exposure');
    }
    
    insights.push(`${confidenceLevel}% confidence level`);
    insights.push(`${timeHorizon}-day time horizon`);
    
    return insights;
  };

  const getConsiderations = (varPercentage: number) => {
    const considerations = [];
    considerations.push('VaR assumes normal distribution of returns');
    considerations.push('Results may not capture extreme market events');
    considerations.push('Consider correlation between portfolio assets');
    considerations.push('VaR is a statistical measure, not a guarantee');
    considerations.push('Regular monitoring and updates recommended');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const varResult = calculateVaR(values);
    if (varResult !== null) {
      setResult({
        varValue: varResult.varValue,
        varPercentage: varResult.varPercentage,
        interpretation: interpret(varResult.varPercentage, values.confidenceLevel),
        riskLevel: getRiskLevel(varResult.varPercentage),
        recommendation: getRecommendation(varResult.varPercentage, values.confidenceLevel),
        strength: getStrength(varResult.varPercentage),
        insights: getInsights(varResult.varPercentage, values.confidenceLevel, values.timeHorizon),
        considerations: getConsiderations(varResult.varPercentage)
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <CardTitle>Value at Risk (VaR) Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate Value at Risk to assess potential portfolio losses at a given confidence level
          </CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="portfolioValue" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Portfolio Value ($)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter portfolio value" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="volatility" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Portfolio Volatility (%)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter volatility" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
            <FormField control={form.control} name="confidenceLevel" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Confidence Level (%)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter confidence level" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="timeHorizon" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Time Horizon (Days)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter time horizon" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />
          </div>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Value at Risk
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
                  <CardTitle>Value at Risk Results</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={result.riskLevel === 'Very Low' ? 'default' : result.riskLevel === 'Low' ? 'secondary' : 'destructive'}>
                    {result.riskLevel}
                  </Badge>
                  <Badge variant="outline">{result.strength}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-3xl font-bold text-primary">
                      ${result.varValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <p className="text-sm text-muted-foreground">VaR Amount</p>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary">
                      {result.varPercentage.toFixed(2)}%
                    </div>
                    <p className="text-sm text-muted-foreground">VaR Percentage</p>
                  </div>
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
            Explore other essential financial metrics for comprehensive risk analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/category/finance/conditional-value-at-risk-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Conditional VaR</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/monte-carlo-portfolio-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Monte Carlo</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/portfolio-variance-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Portfolio Variance</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/sharpe-ratio-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Sharpe Ratio</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Value at Risk (VaR): Calculation Methods, Interpretation, and Risk Management" />
    <meta itemProp="description" content="An expert guide detailing the Value at Risk (VaR) concept, its role as the primary regulatory risk measure, the three main calculation methods (Historical, Parametric, Monte Carlo), and its use in financial institutions for risk control and capital allocation." />
    <meta itemProp="keywords" content="value at risk VaR formula, calculating VaR historical simulation, parametric VaR standard deviation, Monte Carlo VaR modeling, risk management metric finance, confidence level VaR, expected shortfall" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-11-06" /> 
    <meta itemProp="url" content="/definitive-value-at-risk-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Value at Risk (VaR): Quantifying Maximum Expected Loss</h1>
    <p className="text-lg italic text-gray-700">Master the critical risk metric used globally by financial institutions to estimate the largest probable loss over a specific time horizon.</p>
    

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#definition" className="hover:underline">VaR: Core Definition and Parameters</a></li>
        <li><a href="#parametric" className="hover:underline">Method 1: Parametric VaR (Variance-Covariance)</a></li>
        <li><a href="#historical" className="hover:underline">Method 2: Historical Simulation VaR</a></li>
        <li><a href="#monte-carlo" className="hover:underline">Method 3: Monte Carlo VaR</a></li>
        <li><a href="#limitations" className="hover:underline">Limitations and Expected Shortfall (ES)</a></li>
    </ul>
<hr />

    {/* VAR: CORE DEFINITION AND PARAMETERS */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">VaR: Core Definition and Parameters</h2>
    <p>The **Value at Risk (VaR)** is a statistical measure that quantifies the maximum likely loss a portfolio could suffer over a specified time horizon at a given confidence level. It is the primary tool used by banks and regulators to measure market risk.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Three Core Parameters</h3>
    <p>A VaR statement is meaningless without its three defining parameters:</p>
    <ol className="list-decimal ml-6 space-y-2">
        <li><strong className="font-semibold">Loss Amount:</strong> The maximum monetary loss estimated (e.g., $5 million).</li>
        <li><strong className="font-semibold">Time Horizon:</strong> The period over which the loss is expected (e.g., 1 day, 10 days, or 1 year). Regulatory VaR (Basel Accords) typically uses a 10-day horizon.</li>
        <li><strong className="font-semibold">Confidence Level:</strong> The probability that the actual loss will **not** exceed the VaR amount (e.g., 95% or 99%). A 99% VaR means that the loss will not exceed the VaR amount 99 times out of 100 days.</li>
    </ol>
    <p>Example VaR statement: "The one-day 99% VaR is $5 million." This means there is only a 1% chance (1 day out of 100) that the portfolio will lose more than $5 million in one day.</p>

<hr />

    {/* METHOD 1: PARAMETRIC VAR (VARIANCE-COVARIANCE) */}
    <h2 id="parametric" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Method 1: Parametric VaR (Variance-Covariance)</h2>
    <p>The Parametric VaR method (also known as the Variance-Covariance Method) is the fastest and simplest approach, relying on the assumption that asset returns are normally distributed.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Identity (Normal Distribution)</h3>
    <p>This method calculates VaR by scaling the portfolio's expected loss by a factor related to the confidence level and the standard deviation (volatility) of the returns:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'VaR = Portfolio Value * Z-Score * Volatility'}
        </p>
    </div>

    <p>Where Z-Score is the number of standard deviations corresponding to the confidence level (e.g., Z = 2.33 for 99% confidence). Volatility is the standard deviation of returns over the time horizon.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Limitations</h3>
    <p>The main drawback is the **Normal Distribution Assumption**. Financial markets exhibit "fat tails" (more extreme positive and negative events than predicted by a normal distribution). Parametric VaR tends to underestimate risk during periods of high market stress (black swan events).</p>

<hr />

    {/* METHOD 2: HISTORICAL SIMULATION VAR */}
    <h2 id="historical" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Method 2: Historical Simulation VaR</h2>
    <p>The Historical Simulation method is non-parametric, meaning it does not rely on the assumption of a normal distribution. It is calculated entirely from the portfolio's past performance data.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Methodology</h3>
    <p>The process involves:</p>
    <ol className="list-decimal ml-6 space-y-2">
        <li><strong className="font-semibold">Gather Data:</strong> Collect the portfolio's actual returns (or simulated returns based on historical price changes) over a long look-back period (e.g., 500 trading days).</li>
        <li><strong className="font-semibold">Sort Returns:</strong> Rank all observed returns from the worst loss to the largest gain.</li>
        <li><strong className="font-semibold">Identify Percentile:</strong> The VaR is simply the loss amount corresponding to the chosen confidence level percentile. For a 99% VaR using 500 days of data, the VaR is the 5th worst loss (500 $\times$ 1%).</li>
    </ol>
    <p>This method automatically incorporates the non-normal distributions and "fat tails" that existed in the historical data, making it more robust in volatile markets.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Limitations</h3>
    <p>Historical VaR is highly dependent on the historical period chosen. It assumes the immediate future will resemble the recent past, failing to predict risks that have not yet occurred (i.e., a new type of crisis).</p>

<hr />

    {/* METHOD 3: MONTE CARLO VAR */}
    <h2 id="monte-carlo" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Method 3: Monte Carlo VaR</h2>
    <p>The **Monte Carlo Method** is the most complex and flexible approach. It calculates VaR by simulating thousands of possible future return scenarios based on user-defined parameters for asset volatility, mean returns, and correlation.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Simulation Process</h3>
    <p>The simulation uses the Geometric Brownian Motion model to generate a vast distribution of potential future portfolio values. Once the simulation is complete, the loss distribution is sorted, and the VaR is identified by locating the loss corresponding to the required confidence level percentile (e.g., the 99th percentile loss).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Advantages</h3>
    <p>Monte Carlo VaR is superior because it can incorporate complex risk factors (like options or derivatives) and allow the user to test hypothetical scenarios that have never occurred in history, providing a forward-looking risk assessment.</p>

<hr />

    {/* LIMITATIONS AND EXPECTED SHORTFALL (ES) */}
    <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Limitations and Expected Shortfall (ES)</h2>
    <p>Despite its widespread use, VaR has critical flaws, leading financial regulators to adopt the **Expected Shortfall (ES)** as a superior risk metric.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The VaR Flaw: Ignoring the Tail</h3>
    <p>The main criticism of VaR is that it only measures the loss *at* the confidence level percentile, but says nothing about the potential magnitude of the loss *beyond* that threshold (the "tail risk"). For example, a $99\%$ VaR of $10$ million dollars tells you nothing about whether the $1\%$ loss will be $11$ million dollars or $100$ million dollars.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Expected Shortfall (ES) / Conditional VaR (CVaR)</h3>
    <p>**Expected Shortfall (ES)**, or Conditional VaR (CVaR), addresses this flaw. ES calculates the **expected loss amount** given that the loss *exceeds* the VaR threshold. It is the average loss in the tail of the distribution, providing a more conservative and complete picture of extreme risk. ES is the required regulatory market risk measure under the Basel III framework.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Value at Risk (VaR) is the standard statistical metric that quantifies maximum expected portfolio loss at a given probability level over a specific time horizon. It is calculated using three primary methods: **Parametric** (assuming normal distribution), **Historical** (using past data), and **Monte Carlo** (using simulations).</p>
    <p>While VaR is essential for basic risk management, sophisticated risk control now favors the **Expected Shortfall (ES)** metric, which provides a more robust measure of "tail risk" by averaging the potential losses that exceed the VaR threshold.</p>
</section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about Value at Risk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is Value at Risk (VaR)?</h4>
              <p className="text-muted-foreground">
                Value at Risk (VaR) is a statistical measure that quantifies the potential loss in value of a portfolio over a specific time period at a given confidence level. It answers the question: "What is the maximum loss I can expect with X% confidence over Y days?" VaR is widely used in risk management and regulatory reporting.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate VaR?</h4>
              <p className="text-muted-foreground">
                VaR can be calculated using different methods: parametric (using normal distribution), historical simulation, or Monte Carlo simulation. The parametric method uses: VaR = Portfolio Value × Volatility × Z-score × √Time Horizon. The Z-score corresponds to the confidence level (e.g., 1.645 for 95% confidence).
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What confidence level should I use?</h4>
              <p className="text-muted-foreground">
                Common confidence levels are 90%, 95%, and 99%. A 95% confidence level means there's a 5% chance of losses exceeding the VaR amount. Higher confidence levels (99%) provide more conservative estimates but may be too restrictive. Choose based on your risk tolerance and regulatory requirements.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What time horizon should I use?</h4>
              <p className="text-muted-foreground">
                Time horizon depends on your investment strategy and risk management needs. Common horizons are 1 day, 1 week, 1 month, or 1 year. Shorter horizons are used for daily risk management, while longer horizons are used for strategic planning. VaR scales with the square root of time.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of VaR?</h4>
              <p className="text-muted-foreground">
                VaR limitations include: assumes normal distribution of returns, doesn't predict extreme events beyond the confidence level, may underestimate tail risk, relies on historical data, and doesn't provide information about losses beyond VaR. It's a statistical measure, not a guarantee of maximum loss.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I interpret VaR results?</h4>
              <p className="text-muted-foreground">
                VaR results show the maximum expected loss at a given confidence level. For example, a $10,000 VaR at 95% confidence over 1 day means there's a 5% chance of losing more than $10,000 in one day. Use VaR to assess risk levels, set position limits, and compare risk across different investments.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What's the difference between VaR and Expected Shortfall?</h4>
              <p className="text-muted-foreground">
                VaR shows the maximum loss at a confidence level, while Expected Shortfall (Conditional VaR) shows the average loss beyond VaR. Expected Shortfall provides more information about tail risk and is considered more coherent for risk management. Both measures complement each other in risk analysis.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I use VaR for portfolio management?</h4>
              <p className="text-muted-foreground">
                Use VaR to set risk limits, allocate capital, evaluate investment strategies, and monitor portfolio risk. Compare VaR across different assets and strategies, set maximum VaR limits for positions, and use VaR to determine appropriate position sizes based on risk tolerance.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What factors affect VaR calculations?</h4>
              <p className="text-muted-foreground">
                Key factors include portfolio value, volatility, confidence level, time horizon, and correlation between assets. Higher volatility increases VaR, longer time horizons increase VaR, and higher confidence levels increase VaR. Correlation affects portfolio VaR through diversification effects.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How often should I update VaR calculations?</h4>
              <p className="text-muted-foreground">
                Update VaR calculations regularly based on your risk management needs. Daily updates are common for active trading, while weekly or monthly updates may suffice for longer-term strategies. Update when market conditions change significantly or when portfolio composition changes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}