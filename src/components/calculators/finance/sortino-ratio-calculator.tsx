'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  portfolioReturn: z.number(),
  riskFreeRate: z.number(),
  downsideDeviation: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SortinoRatioCalculator() {
  const [result, setResult] = useState<{ 
    sortinoRatio: number; 
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
      downsideDeviation: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.portfolioReturn == null || v.riskFreeRate == null || v.downsideDeviation == null) return null;
    return (v.portfolioReturn - v.riskFreeRate) / v.downsideDeviation;
  };

  const interpret = (sortinoRatio: number) => {
    if (sortinoRatio >= 2) return 'Excellent downside risk-adjusted returns with superior performance.';
    if (sortinoRatio >= 1.5) return 'Good downside risk-adjusted returns with solid performance.';
    if (sortinoRatio >= 1) return 'Adequate downside risk-adjusted returns but room for improvement.';
    if (sortinoRatio >= 0.5) return 'Poor downside risk-adjusted returns - high downside risk.';
    return 'Very poor downside risk-adjusted returns - significant downside risk exposure.';
  };

  const getRiskLevel = (sortinoRatio: number) => {
    if (sortinoRatio >= 2) return 'Excellent';
    if (sortinoRatio >= 1.5) return 'Good';
    if (sortinoRatio >= 1) return 'Adequate';
    if (sortinoRatio >= 0.5) return 'Poor';
    return 'Very Poor';
  };

  const getRecommendation = (sortinoRatio: number) => {
    if (sortinoRatio >= 2) return 'Maintain current strategy - excellent downside risk management.';
    if (sortinoRatio >= 1.5) return 'Continue current approach with focus on downside protection.';
    if (sortinoRatio >= 1) return 'Focus on improving downside risk management and protection.';
    if (sortinoRatio >= 0.5) return 'Urgent need to improve downside risk management strategies.';
    return 'Critical situation - immediate downside risk management required.';
  };

  const getStrength = (sortinoRatio: number) => {
    if (sortinoRatio >= 2) return 'Very Strong';
    if (sortinoRatio >= 1.5) return 'Strong';
    if (sortinoRatio >= 1) return 'Moderate';
    if (sortinoRatio >= 0.5) return 'Weak';
    return 'Very Weak';
  };

  const getInsights = (sortinoRatio: number) => {
    const insights = [];
    if (sortinoRatio >= 2) {
      insights.push('Exceptional downside risk management');
      insights.push('Superior downside-adjusted performance');
      insights.push('Excellent downside protection');
    } else if (sortinoRatio >= 1.5) {
      insights.push('Strong downside risk management');
      insights.push('Good downside-adjusted performance');
      insights.push('Solid downside protection');
    } else if (sortinoRatio >= 1) {
      insights.push('Adequate downside risk management');
      insights.push('Room for downside optimization');
      insights.push('Monitor downside risk exposure');
    } else if (sortinoRatio >= 0.5) {
      insights.push('Poor downside risk management');
      insights.push('High downside risk exposure');
      insights.push('Urgent need for downside protection');
    } else {
      insights.push('Very poor downside risk management');
      insights.push('Significant downside risk exposure');
      insights.push('Critical downside protection issues');
    }
    return insights;
  };

  const getConsiderations = (sortinoRatio: number) => {
    const considerations = [];
    considerations.push('Sortino ratio focuses only on downside volatility');
    considerations.push('Historical performance may not predict future results');
    considerations.push('Risk-free rate varies by market conditions');
    considerations.push('Compare with appropriate benchmarks');
    considerations.push('Consider investment objectives and risk tolerance');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const sortinoRatio = calculate(values);
    if (sortinoRatio !== null) {
      setResult({
        sortinoRatio,
        interpretation: interpret(sortinoRatio),
        riskLevel: getRiskLevel(sortinoRatio),
        recommendation: getRecommendation(sortinoRatio),
        strength: getStrength(sortinoRatio),
        insights: getInsights(sortinoRatio),
        considerations: getConsiderations(sortinoRatio)
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingDown className="h-6 w-6 text-primary" />
            <CardTitle>Sortino Ratio Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate your portfolio's Sortino ratio to assess downside risk-adjusted returns
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
                <FormField control={form.control} name="downsideDeviation" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Downside Deviation (%)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter downside deviation" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Sortino Ratio
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
                  <CardTitle>Sortino Ratio Result</CardTitle>
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
                  {result.sortinoRatio.toFixed(3)}
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
                    <TrendingDown className="h-5 w-5 text-green-600" />
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
                  <TrendingDown className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Sharpe Ratio</p>
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
    <meta itemProp="name" content="The Definitive Guide to the Sortino Ratio: Calculation, Interpretation, and Downside Risk Analysis" />
    <meta itemProp="description" content="An expert guide detailing the Sortino Ratio formula, its role in measuring risk-adjusted performance by focusing only on harmful volatility (downside deviation), and its comparison to the Sharpe Ratio." />
    <meta itemProp="keywords" content="sortino ratio formula explained, calculating downside deviation, risk-adjusted return metric, comparison to sharpe ratio, downside risk finance, minimum acceptable return MAR" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-11-06" /> 
    <meta itemProp="url" content="/definitive-sortino-ratio-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to the Sortino Ratio: Focusing on Downside Risk Performance</h1>
    <p className="text-lg italic text-muted-foreground">Master the crucial metric that refines risk-adjusted return analysis by penalizing only the volatility associated with losses.</p>
    

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#definition" className="hover:underline">Sortino Ratio: Definition and Downside Focus</a></li>
        <li><a href="#formula" className="hover:underline">The Sortino Ratio Formula and Components</a></li>
        <li><a href="#mar" className="hover:underline">Minimum Acceptable Return (MAR)</a></li>
        <li><a href="#downside" className="hover:underline">Calculating Downside Deviation (The Denominator)</a></li>
        <li><a href="#vs-sharpe" className="hover:underline">Sortino Ratio vs. Sharpe Ratio: The Key Distinction</a></li>
    </ul>
<hr />

    {/* SORTINO RATIO: DEFINITION AND DOWNSIDE FOCUS */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Sortino Ratio: Definition and Downside Focus</h2>
    <p>The **Sortino Ratio** is a risk-adjusted return metric developed to address a key flaw in the Sharpe Ratio. It measures the reward (excess return) generated by an investment relative to its **downside risk** (volatility below a target return), completely ignoring upside volatility.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Why Upside Volatility Is Ignored</h3>
    <p>The Sharpe Ratio uses the standard deviation of all returns, penalizing a portfolio for volatility regardless of whether the movement is positive or negative. The Sortino Ratio recognizes that volatility associated with gains is beneficial to the investor. By focusing solely on returns that fall below a specified threshold, the Sortino Ratio provides a purer measure of **harmful risk**.</p>
    
<hr />

    {/* THE SORTINO RATIO FORMULA AND COMPONENTS */}
    <h2 id="formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Sortino Ratio Formula and Components</h2>
    <p>The ratio is calculated by dividing the portfolio's excess return (above the target) by its downside deviation (volatility below the target).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Identity</h3>
    <p>The formula for the Sortino Ratio (S) is:</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'Sortino Ratio = (R_p - MAR) / Downside Deviation'}
        </p>
    </div>

    <p>Where:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li>$R_p$ = Portfolio Return (Average return over the period).</li>
        <li>$MAR$ = Minimum Acceptable Return (The target threshold, often 0% or the risk-free rate).</li>
        <li>Downside Deviation = The standard deviation of only the returns that fall below the MAR.</li>
    </ul>

<hr />

    {/* MINIMUM ACCEPTABLE RETURN (MAR) */}
    <h2 id="mar" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Minimum Acceptable Return (MAR)</h2>
    <p>The **Minimum Acceptable Return (MAR)** is the benchmark used in the Sortino Ratio denominator. It defines the threshold below which returns are considered detrimental volatility (downside risk).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Selecting the MAR</h3>
    <p>The MAR can be chosen by the analyst or investor based on the investment goal:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li>**Risk-Free Rate:** If the goal is to outperform passive, safe investments, the MAR is set to the risk-free rate ($R_f$).</li>
        <li>**Zero:** If the goal is simply to avoid losses, the MAR is set to $0\%$.</li>
        <li>**Custom Hurdle Rate:** For hedge funds or institutional mandates, the MAR may be set to a specific hurdle rate (e.g., $8\%$ annual return).</li>
    </ul>
    <p>The choice of MAR critically influences the calculated downside deviation and, thus, the final Sortino Ratio.</p>

<hr />

    {/* CALCULATING DOWNSIDE DEVIATION (THE DENOMINATOR) */}
    <h2 id="downside" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculating Downside Deviation (The Denominator)</h2>
    <p>The **Downside Deviation** (sometimes called Downside Risk) is the core calculation of the Sortino Ratio. It is identical to standard deviation, but only uses the returns that fell below the MAR.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Downside Deviation Process</h3>
    <ol className="list-decimal ml-6 space-y-2">
        <li><strong className="font-semibold">Identify Detrimental Returns:</strong> Filter the historical return data, keeping only the periods where the portfolio return ($R_p$) was less than the MAR.</li>
        <li><strong className="font-semibold">Calculate Squared Deviation:</strong> For these detrimental returns, calculate the squared difference between the MAR and the portfolio return: $(MAR - R_p)^2$.</li>
        <li><strong className="font-semibold">Find the Mean:</strong> Sum the squared deviations and divide by the total number of observations (including periods where $R_p \ge MAR$, treating their deviation as zero).</li>
        <li><strong className="font-semibold">Take the Square Root:</strong> The square root of this mean is the Downside Deviation.</li>
    </ol>
    <p>Because the denominator only includes losses, a fund manager who achieves high returns with few large drawdowns will have a high Sortino Ratio, even if they experience high volatility on the positive side.</p>

<hr />

    {/* SORTINO RATIO VS. SHARPE RATIO: THE KEY DISTINCTION */}
    <h2 id="vs-sharpe" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Sortino Ratio vs. Sharpe Ratio: The Key Distinction</h2>
    <p>While both ratios measure risk-adjusted performance, they quantify risk differently, leading to potentially contradictory conclusions about a portfolio's quality.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Sharpe Ratio (Total Risk Focus)</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Risk Measure:</strong> Standard Deviation of *All* Returns ($\sigma_p$).</li>
        <li><strong className="font-semibold">Penalty:</strong> Penalizes a portfolio for both upside volatility (large gains) and downside volatility (large losses).</li>
        <li><strong className="font-semibold">Best for:</strong> Passive, diversified portfolios (like index funds) where consistency is key.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Sortino Ratio (Downside Risk Focus)</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Risk Measure:</strong> Downside Deviation (volatility below MAR).</li>
        <li><strong className="font-semibold">Penalty:</strong> Penalizes a portfolio only for volatility that falls below the target return (the actual risk of loss).</li>
        <li><strong className="font-semibold">Best for:</strong> Hedge funds, active traders, or strategies that intentionally generate skewed returns (few large gains, but strict controls against large losses).</li>
    </ul>
    <p>A portfolio with a low Sharpe Ratio but a high Sortino Ratio suggests the fund manager takes a high level of risk, but that risk primarily results in beneficial upside volatility.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The Sortino Ratio is a superior measure of risk-adjusted performance when the goal is to evaluate the quality of returns relative to the **risk of loss**. By using **Downside Deviation** in the denominator, it quantifies the excess return generated over the **Minimum Acceptable Return (MAR)**, penalizing only the volatility that is detrimental to the investor.</p>
    <p>A high Sortino Ratio confirms that a portfolio manager is highly efficient at avoiding significant drawdowns, providing a truer reflection of performance for risk-averse investors.</p>
</section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about Sortino Ratio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is the Sortino Ratio?</h4>
              <p className="text-muted-foreground">
                The Sortino Ratio is a risk-adjusted performance metric that focuses specifically on downside volatility. It's calculated as (Portfolio Return - Risk-Free Rate) ÷ Downside Deviation. Unlike the Sharpe ratio, it only considers negative volatility, making it more relevant for investors concerned about losses.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate the Sortino Ratio?</h4>
              <p className="text-muted-foreground">
                The formula is: Sortino Ratio = (Portfolio Return - Risk-Free Rate) ÷ Downside Deviation. Downside Deviation measures only the volatility of negative returns below a target return (usually the risk-free rate). This focuses the risk measurement on what investors typically want to avoid - losses.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is considered a good Sortino Ratio?</h4>
              <p className="text-muted-foreground">
                Generally, a Sortino ratio above 1.5 is considered good, above 2 is excellent, and above 1 is acceptable. Since it focuses on downside risk, it's typically higher than Sharpe ratios for the same investment. The threshold depends on your risk tolerance and investment objectives.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does the Sortino Ratio differ from the Sharpe Ratio?</h4>
              <p className="text-muted-foreground">
                The Sharpe ratio considers all volatility (both upside and downside), while the Sortino ratio only considers downside volatility. This makes the Sortino ratio more relevant for investors who are primarily concerned about losses rather than overall volatility. It typically provides higher values than the Sharpe ratio.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does a high Sortino Ratio mean?</h4>
              <p className="text-muted-foreground">
                A high Sortino ratio indicates that the investment provides good returns relative to its downside risk. This suggests effective downside risk management and that the investment is achieving returns without exposing investors to significant losses. It's particularly valuable for conservative investors.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does a low Sortino Ratio mean?</h4>
              <p className="text-muted-foreground">
                A low Sortino ratio indicates that the investment has high downside risk relative to its returns. This suggests that the investment may not be adequately compensating investors for the downside risk they're taking. It may indicate poor downside risk management or excessive risk-taking.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of the Sortino Ratio?</h4>
              <p className="text-muted-foreground">
                The Sortino ratio assumes that only downside volatility matters, which may not be true for all investors. It requires a target return to calculate downside deviation. It's based on historical data and may not predict future performance. It doesn't account for extreme tail risks or non-normal distributions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How can I improve my Sortino Ratio?</h4>
              <p className="text-muted-foreground">
                You can improve the Sortino ratio by reducing downside volatility through better downside protection strategies, diversification, or hedging. Focus on investments that provide consistent returns with minimal downside risk. Consider strategies that limit losses while maintaining upside potential.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is the Sortino Ratio important for portfolio management?</h4>
              <p className="text-muted-foreground">
                The Sortino ratio is crucial for portfolio management as it helps optimize the risk-return trade-off specifically for downside risk. It guides asset allocation decisions, helps identify investments with good downside protection, and provides a standardized way to compare strategies based on downside risk management.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do institutional investors use the Sortino Ratio?</h4>
              <p className="text-muted-foreground">
                Institutional investors use the Sortino ratio to evaluate fund managers' downside risk management, compare investment strategies, and optimize portfolio allocation. It's particularly important for pension funds, endowments, and other institutions with fiduciary responsibilities to protect capital while generating returns.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}