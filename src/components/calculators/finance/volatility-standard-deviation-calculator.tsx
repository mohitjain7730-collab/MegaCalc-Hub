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
import { average } from 'firebase/firestore';

const formSchema = z.object({
  returns: z.string().min(1, 'At least one return value is required'),
});

type FormValues = z.infer<typeof formSchema>;

export default function VolatilityStandardDeviationCalculator() {
  const [result, setResult] = useState<{ 
    volatility: number; 
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
      returns: '',
    },
  });

  const calculateVolatility = (returnsString: string) => {
    const returns = returnsString.split(',').map(r => parseFloat(r.trim())).filter(r => !isNaN(r));
    if (returns.length < 2) return null;

    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1);
    const volatility = Math.sqrt(variance);
    
    return volatility;
  };

  const interpret = (volatility: number) => {
    if (volatility >= 30) return 'Very high volatility - extremely risky investment with significant price swings.';
    if (volatility >= 20) return 'High volatility - risky investment with substantial price fluctuations.';
    if (volatility >= 10) return 'Moderate volatility - moderate risk with reasonable price stability.';
    if (volatility >= 5) return 'Low volatility - conservative investment with stable price movements.';
    return 'Very low volatility - very conservative investment with minimal price changes.';
  };

  const getRiskLevel = (volatility: number) => {
    if (volatility >= 30) return 'Very High';
    if (volatility >= 20) return 'High';
    if (volatility >= 10) return 'Moderate';
    if (volatility >= 5) return 'Low';
    return 'Very Low';
  };

  const getRecommendation = (volatility: number) => {
    if (volatility >= 30) return 'Consider reducing position size or implementing hedging strategies.';
    if (volatility >= 20) return 'Monitor closely and consider diversification to reduce risk.';
    if (volatility >= 10) return 'Maintain current strategy with regular risk monitoring.';
    if (volatility >= 5) return 'Consider increasing position size for potentially higher returns.';
    return 'Very stable investment - consider if returns meet your objectives.';
  };

  const getStrength = (volatility: number) => {
    if (volatility >= 30) return 'Very Weak';
    if (volatility >= 20) return 'Weak';
    if (volatility >= 10) return 'Moderate';
    if (volatility >= 5) return 'Strong';
    return 'Very Strong';
  };

  const getInsights = (volatility: number) => {
    const insights = [];
    if (volatility >= 30) {
      insights.push('Extremely high price volatility');
      insights.push('Significant investment risk');
      insights.push('Potential for large gains or losses');
    } else if (volatility >= 20) {
      insights.push('High price volatility');
      insights.push('Substantial investment risk');
      insights.push('Potential for significant price swings');
    } else if (volatility >= 10) {
      insights.push('Moderate price volatility');
      insights.push('Balanced risk-return profile');
      insights.push('Reasonable price stability');
    } else if (volatility >= 5) {
      insights.push('Low price volatility');
      insights.push('Conservative investment profile');
      insights.push('Stable price movements');
    } else {
      insights.push('Very low price volatility');
      insights.push('Very conservative investment');
      insights.push('Minimal price changes');
    }
    return insights;
  };

  const getConsiderations = (volatility: number) => {
    const considerations = [];
    considerations.push('Volatility varies by market conditions');
    considerations.push('Historical volatility may not predict future volatility');
    considerations.push('Consider your risk tolerance and investment horizon');
    considerations.push('Higher volatility often means higher potential returns');
    considerations.push('Diversification can help reduce portfolio volatility');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const volatility = calculateVolatility(values.returns);
    if (volatility !== null) {
      setResult({
        volatility,
        interpretation: interpret(volatility),
        riskLevel: getRiskLevel(volatility),
        recommendation: getRecommendation(volatility),
        strength: getStrength(volatility),
        insights: getInsights(volatility),
        considerations: getConsiderations(volatility)
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <CardTitle>Volatility / Standard Deviation Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate your investment's volatility to assess risk and price stability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="returns" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Historical Returns (%)
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="text" 
                      placeholder="Enter returns separated by commas (e.g., 5.2, -3.1, 8.7, 2.4)" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-sm text-muted-foreground">
                    Enter at least 2 return values separated by commas. Include both positive and negative returns for accurate calculation.
                  </p>
                </FormItem>
              )} />
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Volatility
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
                  <CardTitle>Volatility Result</CardTitle>
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
                <div className="text-4xl font-bold text-primary">
                  {result.volatility.toFixed(2)}%
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
            <Link href="/category/finance/beta-asset-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Beta Asset</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/alpha-investment-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Alpha Investment</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/sharpe-ratio-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Sharpe Ratio</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/portfolio-variance-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Portfolio Variance</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Volatility and Standard Deviation: Calculation, Risk, and Investment Analysis" />
    <meta itemProp="description" content="An expert guide detailing the Standard Deviation formula, its role as the primary metric for quantifying financial volatility (risk), its interpretation in portfolio analysis, and how to annualize daily volatility for comparison." />
    <meta itemProp="keywords" content="volatility calculation standard deviation, investment risk metric, historical volatility formula, annualizing volatility finance, dispersion of returns, portfolio risk management, variance calculation" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-11-06" /> 
    <meta itemProp="url" content="/definitive-volatility-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Volatility and Standard Deviation: Quantifying Financial Risk</h1>
    <p className="text-lg italic text-muted-foreground">Master the foundational statistical metric that measures the expected magnitude of price movements in an asset or portfolio.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#definition" className="hover:underline">Volatility and Standard Deviation: Core Concepts</a></li>
        <li><a href="#formula" className="hover:underline">The Standard Deviation Formula and Mechanics</a></li>
        <li><a href="#variance" className="hover:underline">Variance: The Statistical Precursor</a></li>
        <li><a href="#annualization" className="hover:underline">Annualizing Volatility for Comparison</a></li>
        <li><a href="#interpretation" className="hover:underline">Interpretation and Risk Management</a></li>
    </ul>
<hr />

    {/* VOLATILITY AND STANDARD DEVIATION: CORE CONCEPTS */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Volatility and Standard Deviation: Core Concepts</h2>
    <p>In finance, **Volatility** is a measure of risk. It quantifies the degree of price fluctuation of a security (such as a stock, bond, or index) over a given time period. **Standard Deviation ($\sigma$)** is the primary statistical tool used to calculate this volatility.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Risk as Dispersion</h3>
    <p>Standard Deviation measures the dispersion of a set of data points (in this case, periodic returns) around their average (mean). The higher the standard deviation, the greater the historical volatility and the greater the risk associated with the investment, as it implies a wider range of potential future returns.</p>
    

    <h3 className="text-xl font-semibold text-foreground mt-6">Historical vs. Implied Volatility</h3>
    <p>The calculation performed using historical return data is called **Historical Volatility**. This is distinct from **Implied Volatility**, which is derived from the current market prices of options and represents the market's *forecast* of future price volatility.</p>

<hr />

    {/* THE STANDARD DEVIATION FORMULA AND MECHANICS */}
    <h2 id="formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Standard Deviation Formula and Mechanics</h2>
    <p>Standard deviation is the square root of the variance. The full calculation requires several sequential steps to ensure accuracy.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Identity</h3>
    <p>The standard deviation ($\sigma$) formula is:</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'σ = Square Root of [ Sum((R_i - R_avg)^2) / (N - 1) ]'}
        </p>
    </div>
    <p>Where:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li>$R_i$ = The return in period i.</li>
        <li>R avg = The arithmetic mean (average) of all returns.</li>
        <li>$N$ = The total number of return periods observed.</li>
    </ul>

<hr />

    {/* VARIANCE: THE STATISTICAL PRECURSOR */}
    <h2 id="variance" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Variance: The Statistical Precursor</h2>
    <p>Before calculating standard deviation, the **Variance ($\sigma^2$)** must be determined. Variance is the average of the squared differences from the mean.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Steps in Calculating Variance</h3>
    <ol className="list-decimal ml-6 space-y-2">
        <li><strong className="font-semibold">Find the Mean:</strong> Calculate the arithmetic average of all returns (R avg).</li>
        <li><strong className="font-semibold">Calculate Deviations:</strong> Subtract the mean from each individual return: (R i minus R avg).</li>
        <li><strong className="font-semibold">Square the Deviations:</strong> Square the result of Step 2. This removes negative values and exponentially penalizes larger deviations.</li>
        <li><strong className="font-semibold">Calculate the Average (Variance):</strong> Sum the squared deviations and divide by $(N-1)$ for a sample, or $N$ for the total population.</li>
    </ol>
    <p>Standard deviation is simply the square root of this final variance value, bringing the risk metric back to the same unit of measure as the returns (e.g., percentage).</p>

<hr />

    {/* ANNUALIZING VOLATILITY FOR COMPARISON */}
    <h2 id="annualization" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Annualizing Volatility for Comparison</h2>
    <p>Since standard deviation is calculated based on the measurement frequency (e.g., daily, monthly), it must be scaled to an annual rate (**annualized volatility**) for comparison against other assets and long-term benchmarks.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Square Root of Time Rule</h3>
    <p>Volatility is proportional to the square root of time. To convert periodic standard deviation (sigma period) to an annual rate (sigma annual), the formula is:</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'σ_{annual} = σ_{daily} * Square Root(Trading Days)'}
        </p>
    </div>
    <p>In finance, the standard number of trading days used is 252 (or 365 for 24/7 markets like crypto). This conversion is essential for calculating annual metrics like the Sharpe Ratio.</p>

<hr />

    {/* INTERPRETATION AND RISK MANAGEMENT */}
    <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpretation and Risk Management</h2>
    <p>Volatility is interpreted using statistical probability, assuming that returns follow a normal (bell-curve) distribution.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The 68-95-99.7 Rule (Normal Distribution)</h3>
    <p>For an annual return distribution, the standard deviation allows investors to forecast the probable range of future returns:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li>Approximately **68.3%** of all future returns are expected to fall within one standard deviation ($\pm 1\sigma$) of the mean return.</li>
        <li>Approximately **95.5%** of all future returns are expected to fall within two standard deviations ($\pm 2\sigma$) of the mean return.</li>
    </ul>
    <p>For example, if the mean annual return is $10\%$ and the annual volatility is $20\%$, there is a $68.3\%$ chance the return will fall between $-10\%$ and $30\%$.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Risk Management Application</h3>
    <p>Risk managers use volatility to determine **Value at Risk (VaR)**—the maximum amount a portfolio is expected to lose over a given time period at a specified confidence level (e.g., 95%).</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Volatility is the defining statistical measure of investment risk, quantified using the **Standard Deviation** of returns. It measures the dispersion of returns around the mean, providing a clear statistical measure of the expected magnitude of price swings.</p>
    <p>Understanding standard deviation is essential for risk management, as it allows investors to forecast the probable range of returns and to calculate crucial risk-adjusted performance metrics like the Sharpe Ratio.</p>
</section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about Volatility
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is Volatility?</h4>
              <p className="text-muted-foreground">
                Volatility is a statistical measure of the dispersion of returns for a given security or market index. It's calculated as the standard deviation of returns and indicates how much the price of an asset fluctuates around its average price over a specific period. Higher volatility means greater price swings and higher risk.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate Volatility?</h4>
              <p className="text-muted-foreground">
                Volatility is calculated as the standard deviation of returns. First, calculate the mean return. Then, calculate the variance by finding the average of squared differences from the mean. Finally, take the square root of the variance to get the standard deviation (volatility). This measures the dispersion of returns around the average.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is considered high Volatility?</h4>
              <p className="text-muted-foreground">
                Generally, volatility above 20% is considered high, above 30% is very high, 10-20% is moderate, and below 10% is low. However, what's considered high varies by asset class and market conditions. Stocks typically have higher volatility than bonds, and individual stocks have higher volatility than market indices.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does high Volatility mean?</h4>
              <p className="text-muted-foreground">
                High volatility means the asset's price experiences large and frequent fluctuations. This indicates higher risk and uncertainty about future price movements. While high volatility can lead to significant gains, it also increases the risk of substantial losses. It's important for investors to understand their risk tolerance.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does low Volatility mean?</h4>
              <p className="text-muted-foreground">
                Low volatility means the asset's price experiences small and infrequent fluctuations. This indicates lower risk and more predictable price movements. While low volatility reduces the risk of losses, it may also limit the potential for significant gains. It's suitable for conservative investors seeking stability.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does Volatility affect investment decisions?</h4>
              <p className="text-muted-foreground">
                Volatility affects investment decisions by influencing risk assessment, position sizing, and portfolio allocation. High volatility investments may require smaller position sizes and more diversification. Low volatility investments may be suitable for larger allocations in conservative portfolios. Consider your risk tolerance and investment horizon.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of Volatility?</h4>
              <p className="text-muted-foreground">
                Volatility is based on historical data and may not predict future volatility. It assumes returns are normally distributed, which may not always be true. It doesn't distinguish between upside and downside volatility. It doesn't account for extreme events or tail risks that may occur infrequently but have significant impact.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How can I reduce portfolio Volatility?</h4>
              <p className="text-muted-foreground">
                You can reduce portfolio volatility through diversification across different asset classes, sectors, and geographic regions. Consider adding low-volatility assets like bonds or defensive stocks. Use hedging strategies or volatility-based position sizing. Regular rebalancing can also help maintain target volatility levels.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is Volatility important for portfolio management?</h4>
              <p className="text-muted-foreground">
                Volatility is crucial for portfolio management as it helps assess risk, determine appropriate position sizes, and optimize the risk-return trade-off. It guides asset allocation decisions, helps set risk budgets, and provides insight into portfolio stability. Understanding volatility helps investors make informed decisions about their investments.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do institutional investors use Volatility?</h4>
              <p className="text-muted-foreground">
                Institutional investors use volatility for risk management, portfolio optimization, and performance evaluation. They set volatility targets, use volatility-based position sizing, and implement volatility hedging strategies. Volatility helps them assess risk-adjusted returns and make informed decisions about asset allocation and risk management.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}