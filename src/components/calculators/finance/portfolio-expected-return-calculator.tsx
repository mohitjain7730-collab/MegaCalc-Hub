'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, Activity, PlusCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const assetSchema = z.object({
  name: z.string().optional(),
  return: z.number().optional(),
  weight: z.number().optional(),
});

const formSchema = z.object({
  assets: z.array(assetSchema),
}).refine(data => {
    const totalWeight = data.assets.reduce((sum, asset) => sum + (asset.weight || 0), 0);
    return Math.abs(totalWeight - 100) < 0.01;
}, {
    message: "Total portfolio weights must add up to 100%.",
    path: ['assets'],
});

type FormValues = z.infer<typeof formSchema>;

export default function PortfolioExpectedReturnCalculator() {
  const [result, setResult] = useState<{ 
    expectedReturn: number; 
    interpretation: string; 
    returnLevel: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assets: [
        { name: 'Asset 1', return: undefined, weight: undefined },
        { name: 'Asset 2', return: undefined, weight: undefined },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "assets"
  });

  const calculateExpectedReturn = (assets: any[]) => {
    const validAssets = assets.filter(asset => 
      asset.return !== undefined && 
      asset.weight !== undefined && 
      !isNaN(asset.return) && 
      !isNaN(asset.weight)
    );
    
    if (validAssets.length === 0) return null;
    
    const expectedReturn = validAssets.reduce((sum, asset) => {
      return sum + (asset.return * asset.weight / 100);
    }, 0);
    
    return expectedReturn;
  };

  const interpret = (expectedReturn: number) => {
    if (expectedReturn >= 15) return 'High expected return - aggressive portfolio with significant growth potential.';
    if (expectedReturn >= 10) return 'Moderate expected return - balanced portfolio with reasonable growth prospects.';
    if (expectedReturn >= 5) return 'Conservative expected return - stable portfolio with modest growth expectations.';
    if (expectedReturn >= 0) return 'Low expected return - very conservative portfolio with minimal growth.';
    return 'Negative expected return - portfolio may not meet investment objectives.';
  };

  const getReturnLevel = (expectedReturn: number) => {
    if (expectedReturn >= 15) return 'High';
    if (expectedReturn >= 10) return 'Moderate';
    if (expectedReturn >= 5) return 'Conservative';
    if (expectedReturn >= 0) return 'Low';
    return 'Negative';
  };

  const getRecommendation = (expectedReturn: number) => {
    if (expectedReturn >= 15) return 'Monitor risk levels closely - high returns come with higher risk.';
    if (expectedReturn >= 10) return 'Maintain balanced approach - good risk-return profile.';
    if (expectedReturn >= 5) return 'Consider increasing growth assets if risk tolerance allows.';
    if (expectedReturn >= 0) return 'Review asset allocation - may need more growth-oriented investments.';
    return 'Urgent portfolio review needed - returns below expectations.';
  };

  const getStrength = (expectedReturn: number) => {
    if (expectedReturn >= 15) return 'Strong';
    if (expectedReturn >= 10) return 'Good';
    if (expectedReturn >= 5) return 'Moderate';
    if (expectedReturn >= 0) return 'Weak';
    return 'Very Weak';
  };

  const getInsights = (expectedReturn: number) => {
    const insights = [];
    if (expectedReturn >= 15) {
      insights.push('High growth potential');
      insights.push('Aggressive investment strategy');
      insights.push('Significant return expectations');
    } else if (expectedReturn >= 10) {
      insights.push('Balanced growth potential');
      insights.push('Moderate investment strategy');
      insights.push('Reasonable return expectations');
    } else if (expectedReturn >= 5) {
      insights.push('Conservative growth potential');
      insights.push('Stable investment strategy');
      insights.push('Modest return expectations');
    } else if (expectedReturn >= 0) {
      insights.push('Limited growth potential');
      insights.push('Very conservative strategy');
      insights.push('Low return expectations');
    } else {
      insights.push('Negative growth potential');
      insights.push('Underperforming strategy');
      insights.push('Below-expectation returns');
    }
    return insights;
  };

  const getConsiderations = (expectedReturn: number) => {
    const considerations = [];
    considerations.push('Expected returns are not guaranteed');
    considerations.push('Higher returns typically come with higher risk');
    considerations.push('Consider your investment time horizon');
    considerations.push('Review portfolio regularly for rebalancing');
    considerations.push('Diversification can help manage risk');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const expectedReturn = calculateExpectedReturn(values.assets);
    if (expectedReturn !== null) {
      setResult({
        expectedReturn,
        interpretation: interpret(expectedReturn),
        returnLevel: getReturnLevel(expectedReturn),
        recommendation: getRecommendation(expectedReturn),
        strength: getStrength(expectedReturn),
        insights: getInsights(expectedReturn),
        considerations: getConsiderations(expectedReturn)
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <CardTitle>Portfolio Expected Return Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate your portfolio's expected return based on asset allocation and individual asset returns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField control={form.control} name={`assets.${index}.name`} render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Asset Name
                          </FormLabel>
                          <FormControl>
                            <Input placeholder={`Asset ${index + 1}`} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name={`assets.${index}.return`} render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Expected Return (%)
                          </FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Enter expected return" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name={`assets.${index}.weight`} render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Portfolio Weight (%)
                          </FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Enter weight" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    {fields.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => remove(index)}
                        className="mt-2"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Remove Asset
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ name: '', return: undefined, weight: undefined })}
                className="w-full"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Another Asset
              </Button>
              
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Expected Return
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
                  <CardTitle>Portfolio Expected Return Result</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={result.returnLevel === 'High' ? 'default' : result.returnLevel === 'Moderate' ? 'secondary' : 'destructive'}>
                    {result.returnLevel}
                  </Badge>
                  <Badge variant="outline">{result.strength}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold text-primary">
                  {result.expectedReturn.toFixed(2)}%
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
            <Link href="/category/finance/capm-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">CAPM</p>
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
            <Link href="/category/finance/sharpe-ratio-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Sharpe Ratio</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/beta-asset-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Beta Asset</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Portfolio Expected Return: Calculation, MPT, and Weighted Average" />
    <meta itemProp="description" content="An expert guide detailing the Portfolio Expected Return formula, its role in Modern Portfolio Theory (MPT), how to calculate the weighted average return for multiple assets, and its comparison to the required rate of return." />
    <meta itemProp="keywords" content="portfolio expected return formula, calculating weighted average return, modern portfolio theory MPT, capital allocation line CAL, efficient frontier, investment forecasting" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-11-11" /> 
    <meta itemProp="url" content="/definitive-portfolio-expected-return-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Portfolio Expected Return: Forecasting Your Investment Strategy</h1>
    <p className="text-lg italic text-gray-700">Master the foundational metric that estimates the total rate of return you anticipate generating from a diversified mix of assets.</p>
    

[Image of Expected Return vs Risk chart]


    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#definition" className="hover:underline">Expected Return: Definition and Core Concept</a></li>
        <li><a href="#weighted-average" className="hover:underline">The Calculation: Weighted Average Return</a></li>
        <li><a href="#inputs" className="hover:underline">Determining Asset Expected Returns</a></li>
        <li><a href="#mpt" className="hover:underline">Role in Modern Portfolio Theory (MPT)</a></li>
        <li><a href="#vs-required" className="hover:underline">Expected vs. Required Rate of Return</a></li>
    </ul>
<hr />

    {/* EXPECTED RETURN: DEFINITION AND CORE CONCEPT */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Expected Return: Definition and Core Concept</h2>
    <p>The **Portfolio Expected Return** ($E(R_p)$) is the statistically projected rate of return an investment portfolio is anticipated to yield over a specified time horizon. It is a crucial forecasting tool used in all investment strategies, particularly those based on diversification.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">A Probability-Weighted Average</h3>
    <p>The expected return is always a probability-weighted average—it is the sum of all potential returns multiplied by their respective probabilities of occurring. For a portfolio of multiple assets, the portfolio's expected return is the weighted average of the individual expected returns of the component assets.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Importance of Forecasting</h3>
    <p>Forecasting the expected return is essential for setting financial goals (e.g., retirement planning) and making capital allocation decisions. It provides the numerator for risk-adjusted metrics like the Sharpe Ratio and is plotted against risk (standard deviation) to create the Efficient Frontier.</p>

<hr />

    {/* THE CALCULATION: WEIGHTED AVERAGE RETURN */}
    <h2 id="weighted-average" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Calculation: Weighted Average Return</h2>
    <p>For a portfolio containing multiple assets, the portfolio's expected return is the sum of the expected return of each asset multiplied by its respective portfolio weight.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Identity</h3>
    <p>The formula for the portfolio's expected return is:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'E(R_p) = Sum [ w_i * E(R_i) ]'}
        </p>
    </div>

    <p>Where:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li>$w_i$ = The weight (percentage) of asset i in the total portfolio.</li>
        <li>$E(R_i)$ = The expected return of the individual asset i.</li>
    </ul>
    <p>The sum of all weights ($w_i$) must equal 1.0 (or 100%).</p>

<hr />

    {/* DETERMINING ASSET EXPECTED RETURNS */}
    <h2 id="inputs" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Determining Asset Expected Returns</h2>
    <p>The accuracy of the portfolio forecast hinges entirely on the methodology used to forecast the expected return for each individual asset ($E(R_i)$).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Historical Average Return</h3>
    <p>The simplest method assumes that the future will resemble the past. The expected return is estimated using the arithmetic average of the asset's historical returns over a long period (e.g., 30 years). While simple, this method fails to account for current market conditions or structural changes in the company/economy.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Forward-Looking Models (CAPM)</h3>
    <p>The most rigorous method uses the **Capital Asset Pricing Model (CAPM)** to link the asset's expected return to its systematic risk (Beta):</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'E(R_i) = R_f + β_i * (R_m - R_f)'}
        </p>
    </div>
    <p>This model establishes the expected return based on risk principles, making it theoretically sound for equity markets.</p>

<hr />

    {/* ROLE IN MODERN PORTFOLIO THEORY (MPT) */}
    <h2 id="mpt" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Role in Modern Portfolio Theory (MPT)</h2>
    <p>Expected return is one of the two core inputs (the other being variance/risk) necessary for **Modern Portfolio Theory (MPT)**, which focuses on constructing the most efficient portfolio mix.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Efficient Frontier</h3>
    <p>MPT models plot portfolios based on their risk (standard deviation) and expected return. The **Efficient Frontier** is the curved line connecting all portfolios that offer the highest possible expected return for a given level of risk, or the lowest possible risk for a given expected return.</p>
    <p>By calculating the expected return of various portfolio weightings, an investor can identify which mix of assets sits on the Efficient Frontier, maximizing the return potential of their risk budget.</p>

<hr />

    {/* EXPECTED VS. REQUIRED RATE OF RETURN */}
    <h2 id="vs-required" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Expected vs. Required Rate of Return</h2>
    <p>It is vital to distinguish between the **Expected Rate of Return** (what the market projects) and the **Required Rate of Return** (what the investor demands).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Required Rate of Return (R req - The Hurdle)</h3>
    <p>This is the minimum return an investor demands to take on the risk associated with a security or project. It is often calculated using CAPM and is used as the discount rate in valuation. The Required Return is used to value the asset.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Investment Decision Rule</h3>
    <p>The comparison between the two rates drives investment decisions:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li>If Expected Return $\gt$ Required Return, the asset is considered **undervalued** and is a Buy.</li>
        <li>If Expected Return $\lt$ Required Return, the asset is considered **overvalued** and is a Sell.</li>
    </ul>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The Portfolio Expected Return ($E(R_p)$) is the cornerstone of investment strategy, calculated as the **weighted average** of the anticipated returns of all assets within the portfolio.</p>
    <p>Accurate forecasting, typically achieved through models like **CAPM**, is necessary for effective capital allocation. By comparing the Expected Return against the Required Rate of Return, investors can identify undervalued assets and construct portfolios that maximize returns along the **Efficient Frontier**.</p>
</section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about Portfolio Expected Return
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is Portfolio Expected Return?</h4>
              <p className="text-muted-foreground">
                Portfolio Expected Return is the weighted average of individual asset returns in your portfolio. It's calculated by multiplying each asset's expected return by its portfolio weight and summing the results. This provides an estimate of your portfolio's overall expected performance.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate Portfolio Expected Return?</h4>
              <p className="text-muted-foreground">
                The formula is: Expected Return = Σ(Weighti × Returni). For each asset, multiply its portfolio weight (as a percentage) by its expected return (as a percentage), then sum all the results. This gives you the portfolio's overall expected return.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is considered a good expected return?</h4>
              <p className="text-muted-foreground">
                Good expected returns depend on your risk tolerance and investment objectives. Generally, 8-12% is considered good for balanced portfolios, 12-15% for growth portfolios, and 4-6% for conservative portfolios. Consider your time horizon and risk tolerance when evaluating expected returns.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does asset allocation affect expected return?</h4>
              <p className="text-muted-foreground">
                Asset allocation significantly affects expected return. Higher allocations to growth assets (stocks) typically increase expected returns but also increase risk. Conservative allocations (bonds) provide lower expected returns but more stability. The key is finding the right balance for your risk tolerance.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of expected return calculations?</h4>
              <p className="text-muted-foreground">
                Expected returns are estimates based on historical data and assumptions, not guarantees. They don't account for market volatility, economic changes, or unexpected events. Past performance doesn't predict future results. Use expected returns as planning tools, not as promises of future performance.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How often should I recalculate expected returns?</h4>
              <p className="text-muted-foreground">
                Recalculate expected returns whenever you change your asset allocation, add or remove assets, or when market conditions significantly change. Regular portfolio reviews (quarterly or annually) help ensure your expected returns align with your investment objectives and current market conditions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How can I improve my portfolio's expected return?</h4>
              <p className="text-muted-foreground">
                You can improve expected returns by increasing allocations to higher-return assets (within your risk tolerance), rebalancing regularly, and considering alternative investments. However, remember that higher expected returns typically come with higher risk. Balance return objectives with risk management.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is expected return important for portfolio management?</h4>
              <p className="text-muted-foreground">
                Expected return is crucial for portfolio management as it helps set realistic performance expectations, guides asset allocation decisions, and provides a benchmark for evaluating portfolio performance. It's essential for financial planning, retirement planning, and investment goal setting.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I use expected return in financial planning?</h4>
              <p className="text-muted-foreground">
                Use expected returns to project future portfolio values, calculate required savings rates, and assess whether your investment strategy can meet your financial goals. Consider different scenarios (conservative, moderate, aggressive) to understand the range of possible outcomes.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What's the difference between expected return and actual return?</h4>
              <p className="text-muted-foreground">
                Expected return is a forward-looking estimate based on historical data and assumptions, while actual return is the realized performance over a specific period. Actual returns often differ from expected returns due to market volatility, economic changes, and other unpredictable factors.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}