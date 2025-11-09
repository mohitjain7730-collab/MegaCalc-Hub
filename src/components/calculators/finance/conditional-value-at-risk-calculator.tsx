'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, TrendingUp, BarChart3, Shield } from 'lucide-react';
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

export default function ConditionalValueAtRiskCalculator() {
  const [result, setResult] = useState<{ 
    varValue: number;
    cvarValue: number;
    cvarPercentage: number;
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

  const calculateCVaR = (v: FormValues) => {
    if (v.portfolioValue == null || v.volatility == null || v.confidenceLevel == null || v.timeHorizon == null) return null;
    
    // Convert percentages to decimals
    const volatility = v.volatility / 100;
    const confidenceLevel = v.confidenceLevel / 100;
    
    // Calculate Z-score for the confidence level
    let zScore;
    if (confidenceLevel === 0.95) zScore = 1.645;
    else if (confidenceLevel === 0.99) zScore = 2.326;
    else if (confidenceLevel === 0.90) zScore = 1.282;
    else if (confidenceLevel === 0.975) zScore = 1.96;
    else {
      // Approximation for other confidence levels
      zScore = Math.sqrt(2) * Math.sqrt(-Math.log(1 - confidenceLevel));
    }
    
    // VaR calculation
    const varValue = v.portfolioValue * volatility * zScore * Math.sqrt(v.timeHorizon);
    
    // CVaR calculation (Expected Shortfall)
    // For normal distribution, CVaR = VaR + (volatility * sqrt(time) * phi(z) / (1 - confidence_level))
    // where phi(z) is the standard normal density function
    const phiZ = Math.exp(-0.5 * zScore * zScore) / Math.sqrt(2 * Math.PI);
    const cvarValue = varValue + (v.portfolioValue * volatility * Math.sqrt(v.timeHorizon) * phiZ / (1 - confidenceLevel));
    const cvarPercentage = (cvarValue / v.portfolioValue) * 100;
    
    return { varValue, cvarValue, cvarPercentage };
  };

  const interpret = (cvarPercentage: number, confidenceLevel: number) => {
    if (cvarPercentage <= 5) return `Very low tail risk - average loss beyond ${confidenceLevel}% VaR is ${cvarPercentage.toFixed(1)}% of portfolio value.`;
    if (cvarPercentage <= 10) return `Low tail risk - average loss beyond ${confidenceLevel}% VaR is ${cvarPercentage.toFixed(1)}% of portfolio value.`;
    if (cvarPercentage <= 20) return `Moderate tail risk - average loss beyond ${confidenceLevel}% VaR is ${cvarPercentage.toFixed(1)}% of portfolio value.`;
    if (cvarPercentage <= 30) return `High tail risk - average loss beyond ${confidenceLevel}% VaR is ${cvarPercentage.toFixed(1)}% of portfolio value.`;
    return `Very high tail risk - average loss beyond ${confidenceLevel}% VaR is ${cvarPercentage.toFixed(1)}% of portfolio value.`;
  };

  const getRiskLevel = (cvarPercentage: number) => {
    if (cvarPercentage <= 5) return 'Very Low';
    if (cvarPercentage <= 10) return 'Low';
    if (cvarPercentage <= 20) return 'Moderate';
    if (cvarPercentage <= 30) return 'High';
    return 'Very High';
  };

  const getRecommendation = (cvarPercentage: number, confidenceLevel: number) => {
    if (cvarPercentage <= 5) return 'Excellent tail risk management - maintain current strategy with confidence.';
    if (cvarPercentage <= 10) return 'Good tail risk management - consider minor adjustments if risk tolerance is lower.';
    if (cvarPercentage <= 20) return 'Moderate tail risk management - review portfolio allocation and hedging strategies.';
    if (cvarPercentage <= 30) return 'High tail risk exposure - consider reducing risk through diversification or hedging.';
    return 'Very high tail risk exposure - urgent review needed to reduce portfolio tail risk.';
  };

  const getStrength = (cvarPercentage: number) => {
    if (cvarPercentage <= 5) return 'Excellent';
    if (cvarPercentage <= 10) return 'Strong';
    if (cvarPercentage <= 20) return 'Moderate';
    if (cvarPercentage <= 30) return 'Weak';
    return 'Very Weak';
  };

  const getInsights = (cvarPercentage: number, varValue: number, cvarValue: number, confidenceLevel: number) => {
    const insights = [];
    
    if (cvarPercentage <= 5) {
      insights.push('Very conservative tail risk profile');
      insights.push('Excellent downside protection');
      insights.push('Low probability of extreme losses');
    } else if (cvarPercentage <= 10) {
      insights.push('Conservative tail risk profile');
      insights.push('Good downside protection');
      insights.push('Low probability of moderate extreme losses');
    } else if (cvarPercentage <= 20) {
      insights.push('Moderate tail risk profile');
      insights.push('Balanced risk-return profile');
      insights.push('Reasonable extreme loss exposure');
    } else if (cvarPercentage <= 30) {
      insights.push('Aggressive tail risk profile');
      insights.push('Higher return potential');
      insights.push('Significant extreme loss exposure');
    } else {
      insights.push('Very aggressive tail risk profile');
      insights.push('Maximum return potential');
      insights.push('High extreme loss exposure');
    }
    
    const tailRiskRatio = ((cvarValue - varValue) / varValue) * 100;
    insights.push(`${confidenceLevel}% confidence level`);
    insights.push(`Tail risk ratio: ${tailRiskRatio.toFixed(1)}%`);
    
    return insights;
  };

  const getConsiderations = (cvarPercentage: number) => {
    const considerations = [];
    considerations.push('CVaR assumes normal distribution of returns');
    considerations.push('Results may not capture extreme market events');
    considerations.push('CVaR provides more information than VaR alone');
    considerations.push('Consider correlation between portfolio assets');
    considerations.push('CVaR is a statistical measure, not a guarantee');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const cvarResult = calculateCVaR(values);
    if (cvarResult !== null) {
      setResult({
        varValue: cvarResult.varValue,
        cvarValue: cvarResult.cvarValue,
        cvarPercentage: cvarResult.cvarPercentage,
        interpretation: interpret(cvarResult.cvarPercentage, values.confidenceLevel),
        riskLevel: getRiskLevel(cvarResult.cvarPercentage),
        recommendation: getRecommendation(cvarResult.cvarPercentage, values.confidenceLevel),
        strength: getStrength(cvarResult.cvarPercentage),
        insights: getInsights(cvarResult.cvarPercentage, cvarResult.varValue, cvarResult.cvarValue, values.confidenceLevel),
        considerations: getConsiderations(cvarResult.cvarPercentage)
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <CardTitle>Conditional VaR (CVaR) / Expected Shortfall Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate Conditional Value at Risk to assess average losses beyond VaR threshold
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
                      <Shield className="h-4 w-4" />
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
                Calculate Conditional VaR
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
                  <CardTitle>Conditional VaR Results</CardTitle>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      ${result.varValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <p className="text-sm text-muted-foreground">VaR Amount</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      ${result.cvarValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <p className="text-sm text-muted-foreground">CVaR Amount</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {result.cvarPercentage.toFixed(2)}%
                    </div>
                    <p className="text-sm text-muted-foreground">CVaR Percentage</p>
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
            <Link href="/category/finance/value-at-risk-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Value at Risk</p>
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
            <Link href="/category/finance/sortino-ratio-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Sortino Ratio</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Conditional Value at Risk (CVaR) / Expected Shortfall (ES): Calculation and Tail Risk" />
    <meta itemProp="description" content="An expert guide detailing the Conditional VaR (CVaR) or Expected Shortfall (ES) formula, its role in quantifying extreme loss (tail risk), and why it is superior to traditional VaR as a measure of post-VaR loss magnitude." />
    <meta itemProp="keywords" content="conditional var CVaR formula, expected shortfall ES calculation, tail risk finance explained, downside risk measurement, VaR vs CVaR comparison, risk management advanced metrics" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-11-06" /> 
    <meta itemProp="url" content="/definitive-cvar-expected-shortfall-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Expected Shortfall (ES) / Conditional VaR (CVaR): Quantifying Tail Risk</h1>
    <p className="text-lg italic text-muted-foreground">Master the advanced risk metric that measures the expected magnitude of loss in the worst-case scenario, exceeding the standard VaR threshold.</p>
    

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#definition" className="hover:underline">ES/CVaR: Definition and Superiority to VaR</a></li>
        <li><a href="#mechanics" className="hover:underline">Calculation Mechanics (The Averaging Principle)</a></li>
        <li><a href="#historical-calc" className="hover:underline">Historical Method for Calculating ES</a></li>
        <li><a href="#coherence" className="hover:underline">Risk Coherence and Regulatory Importance</a></li>
        <li><a href="#applications" className="hover:underline">Applications in Capital Allocation and Portfolio Optimization</a></li>
    </ul>
<hr />

    {/* ES/CVAR: DEFINITION AND SUPERIORITY TO VAR */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">ES/CVaR: Definition and Superiority to VaR</h2>
    <p>The **Expected Shortfall (ES)**, also known as **Conditional Value at Risk (CVaR)**, is a coherent risk measure that quantifies the expected loss of a portfolio given that the loss exceeds the traditional **Value at Risk (VaR)** threshold.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Flaw of VaR</h3>
    <p>Traditional VaR is a **percentile measure**; it tells you the maximum loss amount for a given confidence level (e.g., 99%). However, VaR is criticized because it completely ignores **tail risk**—the potential size of losses that occur beyond the VaR cutoff point. VaR tells you how often you *expect* to lose a certain amount, but not how *much* you stand to lose when the event occurs.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The ES/CVaR Advantage</h3>
    <p>ES addresses this by calculating the **average** of all losses that fall in the extreme tail (e.g., the worst 1% of outcomes). This provides a more comprehensive and severe measure of risk, making it the required metric for regulatory capital under the Basel framework.</p>

<hr />

    {/* CALCULATION MECHANICS (THE AVERAGING PRINCIPLE) */}
    <h2 id="mechanics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculation Mechanics (The Averaging Principle)</h2>
    <p>The calculation of ES is conceptually simple: find the VaR, then find the mean of the losses beyond that VaR point.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Conceptual Formula</h3>
    <p>ES is the weighted average of the losses in the specified tail of the distribution. For a $99\%$ confidence level, the ES calculation focuses on the $1\%$ worst-case scenario losses:</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'ES_α = E [ Loss | Loss > VaR_α ]'}
        </p>
    </div>
    <p>Where alpha is the confidence level (e.g., 99%), and E is the expected value (mean) of the losses given that the loss is greater than the VaR at that confidence level.</p>

<hr />

    {/* HISTORICAL METHOD FOR CALCULATING ES */}
    <h2 id="historical-calc" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Historical Method for Calculating ES</h2>
    <p>The most straightforward method for calculating ES is using historical simulation, which bypasses the restrictive assumption of a normal distribution.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Five-Step Historical Process</h3>
    <ol className="list-decimal ml-6 space-y-2">
        <li><strong className="font-semibold">Simulate/Collect Returns:</strong> Gather historical daily portfolio returns (e.g., 1,000 trading days).</li>
        <li><strong className="font-semibold">Sort Losses:</strong> Rank all 1,000 daily loss amounts from worst to best.</li>
        <li><strong className="font-semibold">Determine VaR Cutoff:</strong> For a $99\%$ VaR, the cutoff is the 10th worst day (1,000 days $\times$ $1\%$). This loss amount is the VaR.</li>
        <li><strong className="font-semibold">Identify the Tail:</strong> Isolate all losses that were worse than the VaR cutoff (the 1st through 9th worst days).</li>
        <li><strong className="font-semibold">Calculate ES:</strong> ES is the arithmetic average of those worst-case losses identified in Step 4.</li>
    </ol>
    <p>Because ES is an average of extreme losses, the ES value will almost always be **higher** than the corresponding VaR value.</p>

<hr />

    {/* RISK COHERENCE AND REGULATORY IMPORTANCE */}
    <h2 id="coherence" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Risk Coherence and Regulatory Importance</h2>
    <p>The ES measure is considered a **Coherent Risk Measure**, a mathematical definition that satisfies desirable properties for effective risk management. This led regulators to mandate its use.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Coherent Risk Properties</h3>
    <p>Unlike VaR, which fails the "subadditivity" test (meaning the risk of two combined portfolios could be greater than the sum of their individual risks, ignoring diversification), ES satisfies all four coherence properties, making it superior for aggregating risk across diverse assets.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Basel III and Regulatory Capital</h3>
    <p>The Basel Committee on Banking Supervision (Basel III) has moved away from traditional VaR for market risk calculations. ES is now the primary regulatory measure used by banks to determine the necessary **capital reserves** required to withstand severe market shocks, as it explicitly models the severity of tail events.</p>

<hr />

    {/* APPLICATIONS IN CAPITAL ALLOCATION AND PORTFOLIO OPTIMIZATION */}
    <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Applications in Capital Allocation and Portfolio Optimization</h2>
    <p>ES is an integral tool for hedge fund managers, institutional traders, and regulators seeking efficient risk allocation.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Portfolio Optimization</h3>
    <p>In portfolio construction, minimizing ES is often a goal. By allocating capital based on ES, managers ensure that the portfolio is optimized not just for volatility (Sharpe Ratio), but specifically for **reducing exposure to catastrophic loss scenarios**.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Risk Budgeting</h3>
    <p>Firms use ES to allocate risk budgets across different trading desks. If a trading desk is operating near its VaR limit, the ES calculation reveals the cost of a potential breach, guiding the firm on whether to reduce exposure or inject more capital.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The Expected Shortfall (ES) is the superior, **coherent** risk metric that measures the **average loss** within the extreme tail of the return distribution, conditional on the loss exceeding the VaR threshold.</p>
    <p>By quantifying the magnitude of extreme losses, ES provides a more complete assessment of **tail risk** than traditional VaR. Its use in the Basel regulatory framework underscores its importance as the definitive measure for managing catastrophic financial exposure.</p>
</section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about Conditional VaR
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is Conditional Value at Risk (CVaR)?</h4>
              <p className="text-muted-foreground">
                Conditional Value at Risk (CVaR), also known as Expected Shortfall, measures the average loss beyond the VaR threshold. While VaR tells you the maximum loss at a confidence level, CVaR tells you the average loss when losses exceed VaR. This provides more comprehensive information about tail risk and extreme losses.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate CVaR?</h4>
              <p className="text-muted-foreground">
                CVaR is calculated as the expected value of losses beyond VaR. For normal distributions, CVaR = VaR + (volatility × √time × φ(z) / (1 - confidence_level)), where φ(z) is the standard normal density function. CVaR can also be calculated using historical simulation or Monte Carlo methods for more complex distributions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What's the difference between VaR and CVaR?</h4>
              <p className="text-muted-foreground">
                VaR shows the maximum loss at a confidence level, while CVaR shows the average loss beyond VaR. VaR answers "What's the worst loss I can expect?" while CVaR answers "What's the average loss when things go really bad?" CVaR provides more information about the severity of extreme losses.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is CVaR considered better than VaR?</h4>
              <p className="text-muted-foreground">
                CVaR is considered more coherent because it captures the severity of losses beyond VaR, satisfies subadditivity (portfolio CVaR ≤ sum of individual CVaRs), and provides more information about tail risk. VaR can be misleading because it doesn't tell you how bad losses can be beyond the threshold.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I interpret CVaR results?</h4>
              <p className="text-muted-foreground">
                CVaR results show the average loss beyond VaR. For example, if CVaR is $15,000 at 95% confidence, it means that when losses exceed the 95% VaR threshold, the average loss is $15,000. Lower CVaR values indicate better tail risk management and more conservative risk profiles.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the advantages of CVaR?</h4>
              <p className="text-muted-foreground">
                Advantages include: captures tail risk severity, satisfies coherence properties, provides more information than VaR, useful for portfolio optimization, better for risk management decisions, and widely accepted in regulatory frameworks. CVaR helps investors understand the potential magnitude of extreme losses.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of CVaR?</h4>
              <p className="text-muted-foreground">
                Limitations include: assumes normal distribution of returns, relies on historical data and assumptions, may not capture extreme market events, computationally more complex than VaR, and results are still probabilistic estimates. Use CVaR as one tool among many for risk analysis.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I use CVaR for portfolio management?</h4>
              <p className="text-muted-foreground">
                Use CVaR to assess tail risk exposure, optimize portfolio allocation, set risk limits, evaluate investment strategies, and compare risk across different assets. CVaR helps determine appropriate position sizes, assess hedging effectiveness, and make informed decisions about risk-return trade-offs.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What confidence level should I use for CVaR?</h4>
              <p className="text-muted-foreground">
                Common confidence levels are 90%, 95%, and 99%. A 95% confidence level means CVaR shows the average loss in the worst 5% of scenarios. Higher confidence levels (99%) provide more conservative estimates but may be too restrictive. Choose based on your risk tolerance and regulatory requirements.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How often should I update CVaR calculations?</h4>
              <p className="text-muted-foreground">
                Update CVaR calculations regularly based on your risk management needs. Daily updates are common for active trading, while weekly or monthly updates may suffice for longer-term strategies. Update when market conditions change significantly or when portfolio composition changes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}