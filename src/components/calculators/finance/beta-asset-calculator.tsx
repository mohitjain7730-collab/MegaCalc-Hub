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
  assetReturns: z.string().min(1, 'At least one return value is required'),
  marketReturns: z.string().min(1, 'At least one return value is required'),
});

type FormValues = z.infer<typeof formSchema>;

export default function BetaAssetCalculator() {
  const [result, setResult] = useState<{ 
    beta: number; 
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
      assetReturns: '',
      marketReturns: '',
    },
  });

  const calculateBeta = (assetReturnsString: string, marketReturnsString: string) => {
    const assetReturns = assetReturnsString.split(',').map(r => parseFloat(r.trim())).filter(r => !isNaN(r));
    const marketReturns = marketReturnsString.split(',').map(r => parseFloat(r.trim())).filter(r => !isNaN(r));
    
    if (assetReturns.length < 2 || marketReturns.length < 2 || assetReturns.length !== marketReturns.length) return null;

    const assetMean = assetReturns.reduce((sum, r) => sum + r, 0) / assetReturns.length;
    const marketMean = marketReturns.reduce((sum, r) => sum + r, 0) / marketReturns.length;

    let covariance = 0;
    let marketVariance = 0;

    for (let i = 0; i < assetReturns.length; i++) {
      const assetDiff = assetReturns[i] - assetMean;
      const marketDiff = marketReturns[i] - marketMean;
      covariance += assetDiff * marketDiff;
      marketVariance += marketDiff * marketDiff;
    }

    const beta = marketVariance === 0 ? 0 : covariance / marketVariance;
    
    return beta;
  };

  const interpret = (beta: number) => {
    if (beta >= 2) return 'Very high systematic risk - asset is extremely sensitive to market movements.';
    if (beta >= 1.5) return 'High systematic risk - asset is highly sensitive to market movements.';
    if (beta >= 1) return 'Above-average systematic risk - asset moves more than the market.';
    if (beta >= 0.5) return 'Below-average systematic risk - asset moves less than the market.';
    if (beta >= 0) return 'Low systematic risk - asset has minimal sensitivity to market movements.';
    return 'Negative systematic risk - asset moves opposite to market movements.';
  };

  const getRiskLevel = (beta: number) => {
    if (beta >= 2) return 'Very High';
    if (beta >= 1.5) return 'High';
    if (beta >= 1) return 'Above Average';
    if (beta >= 0.5) return 'Below Average';
    if (beta >= 0) return 'Low';
    return 'Negative';
  };

  const getRecommendation = (beta: number) => {
    if (beta >= 2) return 'Consider reducing position size - very high market sensitivity.';
    if (beta >= 1.5) return 'Monitor closely - high market sensitivity requires careful risk management.';
    if (beta >= 1) return 'Suitable for growth portfolios - above-average market sensitivity.';
    if (beta >= 0.5) return 'Good for balanced portfolios - moderate market sensitivity.';
    if (beta >= 0) return 'Excellent for conservative portfolios - low market sensitivity.';
    return 'Consider for hedging strategies - negative market sensitivity.';
  };

  const getStrength = (beta: number) => {
    if (beta >= 2) return 'Very Weak';
    if (beta >= 1.5) return 'Weak';
    if (beta >= 1) return 'Moderate';
    if (beta >= 0.5) return 'Strong';
    if (beta >= 0) return 'Very Strong';
    return 'Special';
  };

  const getInsights = (beta: number) => {
    const insights = [];
    if (beta >= 2) {
      insights.push('Extremely high market sensitivity');
      insights.push('Significant systematic risk exposure');
      insights.push('Potential for large gains or losses');
    } else if (beta >= 1.5) {
      insights.push('High market sensitivity');
      insights.push('Substantial systematic risk exposure');
      insights.push('Potential for significant price swings');
    } else if (beta >= 1) {
      insights.push('Above-average market sensitivity');
      insights.push('Moderate systematic risk exposure');
      insights.push('Moves more than market average');
    } else if (beta >= 0.5) {
      insights.push('Below-average market sensitivity');
      insights.push('Lower systematic risk exposure');
      insights.push('Moves less than market average');
    } else if (beta >= 0) {
      insights.push('Low market sensitivity');
      insights.push('Minimal systematic risk exposure');
      insights.push('Stable relative to market');
    } else {
      insights.push('Negative market sensitivity');
      insights.push('Moves opposite to market');
      insights.push('Potential hedging characteristics');
    }
    return insights;
  };

  const getConsiderations = (beta: number) => {
    const considerations = [];
    considerations.push('Beta can change over time');
    considerations.push('Historical beta may not predict future beta');
    considerations.push('Beta assumes CAPM model validity');
    considerations.push('Consider market conditions and economic cycles');
    considerations.push('Beta is just one measure of risk');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const beta = calculateBeta(values.assetReturns, values.marketReturns);
    if (beta !== null) {
      setResult({
        beta,
        interpretation: interpret(beta),
        riskLevel: getRiskLevel(beta),
        recommendation: getRecommendation(beta),
        strength: getStrength(beta),
        insights: getInsights(beta),
        considerations: getConsiderations(beta)
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <CardTitle>Beta Asset Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate your asset's beta to assess systematic risk and market sensitivity
          </CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="assetReturns" render={({ field }) => (
              <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Asset Returns (%)
                    </FormLabel>
                <FormControl>
                      <Input 
                        type="text" 
                        placeholder="Enter asset returns separated by commas" 
                        {...field} 
                      />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
                <FormField control={form.control} name="marketReturns" render={({ field }) => (
              <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Market Returns (%)
                    </FormLabel>
                <FormControl>
                      <Input 
                        type="text" 
                        placeholder="Enter market returns separated by commas" 
                        {...field} 
                      />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
              <p className="text-sm text-muted-foreground">
                Enter the same number of return values for both asset and market. Values should be separated by commas (e.g., 5.2, -3.1, 8.7, 2.4).
              </p>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Beta
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
                  <CardTitle>Beta Result</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={result.riskLevel === 'Low' ? 'default' : result.riskLevel === 'Below Average' ? 'secondary' : 'destructive'}>
                    {result.riskLevel}
                  </Badge>
                  <Badge variant="outline">{result.strength}</Badge>
                </div>
            </div>
          </CardHeader>
          <CardContent>
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold text-primary">
                  {result.beta.toFixed(3)}
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
            <Link href="/category/finance/alpha-investment-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Alpha Investment</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/treynor-ratio-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Treynor Ratio</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/correlation-coefficient-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Correlation</p>
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

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Beta ($\beta$): Calculation, Interpretation, and Systematic Risk Analysis" />
    <meta itemProp="description" content="An expert guide detailing the Beta ($\beta$) formula, its core role as a measure of systematic risk within the CAPM, how to interpret high, low, and negative Beta values, and its application in portfolio risk management and equity valuation." />
    <meta itemProp="keywords" content="beta asset formula explained, calculating stock beta, systematic risk finance, non-diversifiable risk, risk premium and beta, capital asset pricing model CAPM" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-11-11" /> 
    <meta itemProp="url" content="/definitive-beta-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Beta ($\beta$): Quantifying Systematic Risk and Market Volatility</h1>
    <p className="text-lg italic text-gray-700">Master the fundamental risk metric that measures an asset’s sensitivity to the overall movements of the financial market.</p>
    

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#definition" className="hover:underline">Beta: Definition and Systematic Risk</a></li>
        <li><a href="#formula" className="hover:underline">The Beta Calculation Formula</a></li>
        <li><a href="#interpretation" className="hover:underline">Interpretation: High, Low, and Negative Beta</a></li>
        <li><a href="#unlevered" className="hover:underline">Unlevered Beta vs. Levered Beta</a></li>
        <li><a href="#applications" className="hover:underline">Role in Valuation (CAPM) and Portfolio Management</a></li>
    </ul>
<hr />

    {/* BETA: DEFINITION AND SYSTEMATIC RISK */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Beta: Definition and Systematic Risk</h2>
    <p>Beta ($\beta$) is a financial coefficient used to measure the expected movement of a specific asset's return relative to the movements of the overall market. It is the core input for quantifying risk in the **Capital Asset Pricing Model (CAPM)**.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Systematic Risk vs. Unsystematic Risk</h3>
    <p>Beta only captures **Systematic Risk** (or market risk)—the risk that affects the entire market and cannot be eliminated through diversification (e.g., recessions, inflation, interest rate hikes). It ignores unsystematic risk (specific risk), which relates to a single company and can be diversified away.</p>
    <p>In short, Beta tells you how much risk an asset adds to an already well-diversified portfolio.</p>

<hr />

    {/* THE BETA CALCULATION FORMULA */}
    <h2 id="formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Beta Calculation Formula</h2>
    <p>Beta is calculated as the ratio of the covariance between the asset's returns and the market's returns, divided by the variance of the market's returns.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Identity</h3>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'β = Cov(R_a, R_m) / Var(R_m)'}
        </p>
    </div>

    <p>Where:</p>
    <ul className="list-disc ml-6 space-y-2">
    <li>Cov(R_a, R_m) = The covariance between the asset's return and the market's return.</li>
    <li>Var(R_m) = The variance of the market's return (the market's total risk).</li>
    </ul>
    <p>This formula essentially measures the sensitivity of the asset's fluctuations to the market's fluctuations over a defined historical period (e.g., 5 years of monthly data).</p>

<hr />

    {/* INTERPRETATION: HIGH, LOW, AND NEGATIVE BETA */}
    <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpretation: High, Low, and Negative Beta</h2>
    <p>The magnitude and sign of Beta define an asset's risk profile relative to the benchmark market (which always has a Beta of 1.0).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Beta = 1.0 (Neutral Risk)</h3>
    <p>The asset's price and volatility move precisely in line with the market. If the S\&P 500 rises by $10\%$, the asset is expected to rise by $10\%$.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Beta &gt; 1.0 (Aggressive Risk)</h3>
    <p>The asset is more volatile and sensitive than the market (e.g., a high-growth tech stock). If the market rises by 10%, a stock with a Beta of 1.5 is expected to rise by 15%. Conversely, it is expected to fall 50% more during a downturn.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Beta &lt; 1.0 (Defensive Risk)</h3>
    <p>The asset is less volatile than the market (e.g., a utility company or consumer staples). If the market rises by 10%, a stock with a Beta of 0.5 is expected to rise by only 5%. It provides stability and less exposure during market selloffs.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">4. Negative Beta (Counter-Cyclical)</h3>
    <p>The asset moves inversely to the market (e.g., gold or certain VIX-related instruments). If the market falls, a negative beta asset is expected to rise, making it a valuable hedging tool for portfolio protection.</p>

<hr />

    {/* UNLEVERED BETA VS. LEVERED BETA */}
    <h2 id="unlevered" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Unlevered Beta vs. Levered Beta</h2>
    <p>When analyzing companies, it is often necessary to separate the risk due to operations from the risk due to financing (debt). This is done by comparing unlevered and levered Beta.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Levered Beta (Beta L - Equity Risk)</h3>
    <p>This is the published Beta calculated from stock price movements. It measures the risk borne by <strong className="font-semibold">equity shareholders</strong>, incorporating both the business risk of the company and the financial risk arising from its debt load (leverage).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Unlevered Beta (Beta U - Asset Risk)</h3>
    <p>The <strong className="font-semibold">Unlevered Beta</strong> (or Asset Beta) is the theoretical beta the company would have if it carried no debt. It represents the risk inherent only to the company's core operations and industry, without the magnifying effect of financial leverage.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Deleveraging Formula</h3>
    <p>Unlevered Beta is calculated by removing the effect of debt (D), equity (E), and the corporate tax rate (T) from the levered Beta:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'β_U = β_L / [ 1 + (1 - T) * (D/E) ]'}
        </p>
    </div>
    <p>Unlevered Beta is essential for valuing private companies or business units because it removes the distortion of unique financing decisions, allowing for true industry comparison.</p>

<hr />

    {/* ROLE IN VALUATION (CAPM) AND PORTFOLIO MANAGEMENT */}
    <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Role in Valuation (CAPM) and Portfolio Management</h2>
    <p>Beta is the quantitative link between risk and return, providing the foundation for modern financial theory.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Cost of Equity Calculation</h3>
    <p>Beta is the central input for the **Capital Asset Pricing Model (CAPM)**, which uses Beta to determine the required rate of return ($R_i$) for a stock:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'R_i = R_f + β_i * (R_m - R_f)'}
        </p>
    </div>
    <p>This required return is used as the Cost of Equity in WACC and as the discount rate in DCF models.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Portfolio Risk Management</h3>
    <p>Fund managers use the **Portfolio Beta** (the weighted average of the Betas of all assets in the portfolio) to manage their overall exposure to market risk. A manager might deliberately increase their portfolio Beta when anticipating a bull market or reduce it when anticipating a recession.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Beta ($\beta$) is the essential risk metric that measures an asset's sensitivity to market movements, quantifying its **systematic risk**. A Beta of $1.0$ signifies market equivalence, while a higher Beta indicates higher volatility and risk.</p>
    <p>In valuation, Beta is the primary input in the **CAPM** used to calculate the required rate of return. Analyzing both **Levered Beta** (equity risk) and **Unlevered Beta** (asset risk) is crucial for comparing companies fairly and setting appropriate project hurdle rates.</p>
</section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about Beta Asset
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is Beta?</h4>
              <p className="text-muted-foreground">
                Beta is a measure of systematic risk that indicates how much an asset's price moves relative to the overall market. It's calculated as the covariance between the asset's returns and market returns divided by the variance of market returns. Beta helps investors understand an asset's sensitivity to market movements.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate Beta?</h4>
              <p className="text-muted-foreground">
                Beta is calculated as: Beta = Covariance(Asset Returns, Market Returns) ÷ Variance(Market Returns). This measures how much the asset's returns change relative to market returns. A beta of 1 means the asset moves with the market, while a beta of 2 means it moves twice as much as the market.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does a Beta of 1 mean?</h4>
              <p className="text-muted-foreground">
                A beta of 1 means the asset moves exactly with the market. If the market goes up 10%, the asset is expected to go up 10%. If the market goes down 10%, the asset is expected to go down 10%. This represents average market sensitivity and systematic risk.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does a Beta greater than 1 mean?</h4>
              <p className="text-muted-foreground">
                A beta greater than 1 means the asset is more volatile than the market. If beta is 1.5, the asset is expected to move 1.5 times as much as the market. This indicates higher systematic risk and greater sensitivity to market movements, potentially offering higher returns but with more risk.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does a Beta less than 1 mean?</h4>
              <p className="text-muted-foreground">
                A beta less than 1 means the asset is less volatile than the market. If beta is 0.5, the asset is expected to move half as much as the market. This indicates lower systematic risk and less sensitivity to market movements, offering more stability but potentially lower returns.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does negative Beta mean?</h4>
              <p className="text-muted-foreground">
                Negative beta means the asset moves opposite to the market. When the market goes up, the asset goes down, and vice versa. This is rare but can occur with certain defensive assets or hedging instruments. Negative beta assets can provide portfolio protection during market downturns.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of Beta?</h4>
              <p className="text-muted-foreground">
                Beta assumes the CAPM model is valid and that past relationships will continue. It only measures systematic risk and ignores unsystematic risk. Beta can change over time and may not capture all market relationships. It's based on historical data and may not predict future performance.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How can I use Beta in portfolio construction?</h4>
              <p className="text-muted-foreground">
                Use beta to assess systematic risk and build portfolios that match your risk tolerance. High beta assets for growth portfolios, low beta assets for conservative portfolios. Consider beta when determining position sizes and asset allocation. Use beta to understand how your portfolio will respond to market movements.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is Beta important for investors?</h4>
              <p className="text-muted-foreground">
                Beta is crucial for investors as it helps assess systematic risk and market sensitivity. It guides portfolio construction, risk management, and investment decisions. Understanding beta helps investors build portfolios that match their risk tolerance and investment objectives while managing exposure to market movements.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do institutional investors use Beta?</h4>
              <p className="text-muted-foreground">
                Institutional investors use beta for portfolio optimization, risk management, and performance evaluation. They set beta targets, use beta-based position sizing, and implement beta hedging strategies. Beta helps them assess systematic risk exposure and make informed decisions about asset allocation and risk management.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}