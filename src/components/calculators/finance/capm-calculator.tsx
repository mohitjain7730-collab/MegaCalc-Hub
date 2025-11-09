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
  riskFreeRate: z.number(),
  beta: z.number(),
  marketReturn: z.number(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CAPMCalculator() {
  const [result, setResult] = useState<{ 
    expectedReturn: number; 
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
      riskFreeRate: undefined,
      beta: undefined,
      marketReturn: undefined,
    },
  });

  const calculateCAPM = (v: FormValues) => {
    if (v.riskFreeRate == null || v.beta == null || v.marketReturn == null) return null;
    return v.riskFreeRate + v.beta * (v.marketReturn - v.riskFreeRate);
  };

  const interpret = (expectedReturn: number) => {
    if (expectedReturn >= 15) return 'High expected return - high-risk investment with significant growth potential.';
    if (expectedReturn >= 10) return 'Moderate expected return - balanced risk-return profile.';
    if (expectedReturn >= 5) return 'Conservative expected return - lower risk with modest growth expectations.';
    if (expectedReturn >= 0) return 'Low expected return - very conservative investment.';
    return 'Negative expected return - investment may not meet objectives.';
  };

  const getRiskLevel = (expectedReturn: number) => {
    if (expectedReturn >= 15) return 'High';
    if (expectedReturn >= 10) return 'Moderate';
    if (expectedReturn >= 5) return 'Conservative';
    if (expectedReturn >= 0) return 'Low';
    return 'Negative';
  };

  const getRecommendation = (expectedReturn: number) => {
    if (expectedReturn >= 15) return 'Monitor risk levels closely - high returns come with higher risk.';
    if (expectedReturn >= 10) return 'Maintain balanced approach - good risk-return profile.';
    if (expectedReturn >= 5) return 'Consider if returns meet your investment objectives.';
    if (expectedReturn >= 0) return 'Review investment strategy - returns may be too conservative.';
    return 'Urgent review needed - investment not meeting expectations.';
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
      insights.push('Significant risk exposure');
      insights.push('Aggressive investment profile');
    } else if (expectedReturn >= 10) {
      insights.push('Balanced growth potential');
      insights.push('Moderate risk exposure');
      insights.push('Well-balanced investment profile');
    } else if (expectedReturn >= 5) {
      insights.push('Conservative growth potential');
      insights.push('Lower risk exposure');
      insights.push('Stable investment profile');
    } else if (expectedReturn >= 0) {
      insights.push('Limited growth potential');
      insights.push('Minimal risk exposure');
      insights.push('Very conservative profile');
    } else {
      insights.push('Negative growth potential');
      insights.push('Underperforming investment');
      insights.push('Below-expectation returns');
    }
    return insights;
  };

  const getConsiderations = (expectedReturn: number) => {
    const considerations = [];
    considerations.push('CAPM assumes efficient markets');
    considerations.push('Beta may not capture all risks');
    considerations.push('Historical data may not predict future');
    considerations.push('Market conditions affect results');
    considerations.push('Consider your risk tolerance');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const expectedReturn = calculateCAPM(values);
    if (expectedReturn !== null) {
      setResult({
        expectedReturn,
        interpretation: interpret(expectedReturn),
        riskLevel: getRiskLevel(expectedReturn),
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
            <BarChart3 className="h-6 w-6 text-primary" />
            <CardTitle>Capital Asset Pricing Model (CAPM) Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate expected return using the Capital Asset Pricing Model based on risk-free rate, beta, and market return
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <FormField control={form.control} name="marketReturn" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Market Return (%)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter market return" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
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
                  <CardTitle>CAPM Expected Return Result</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={result.riskLevel === 'High' ? 'default' : result.riskLevel === 'Moderate' ? 'secondary' : 'destructive'}>
                    {result.riskLevel}
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
            <Link href="/category/finance/portfolio-expected-return-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Portfolio Expected Return</p>
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
            <Link href="/category/finance/alpha-investment-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Alpha Investment</p>
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

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to the Capital Asset Pricing Model (CAPM): Calculation, Beta, and Expected Return" />
    <meta itemProp="description" content="An expert guide detailing the CAPM formula, its role in calculating the required rate of return for an asset, the function of Beta as a measure of systematic risk, and the model's application in valuation and risk management." />
    <meta itemProp="keywords" content="CAPM formula explained, calculating required return, systematic risk beta finance, risk-free rate, market risk premium, security market line SML, expected return asset" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-11-06" /> 
    <meta itemProp="url" content="/definitive-capm-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to the Capital Asset Pricing Model (CAPM): Calculating Expected Return</h1>
    <p className="text-lg italic text-muted-foreground">Master the foundational model that defines the relationship between an asset's systematic risk and its required rate of return.</p>
    

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#definition" className="hover:underline">CAPM: Core Definition and Principle</a></li>
        <li><a href="#formula" className="hover:underline">The CAPM Formula and Components</a></li>
        <li><a href="#beta" className="hover:underline">The Role of Beta ($\beta$): Measuring Systematic Risk</a></li>
        <li><a href="#premium" className="hover:underline">Market Risk Premium and Risk-Free Rate</a></li>
        <li><a href="#applications" className="hover:underline">Applications in Valuation and Portfolio Management</a></li>
    </ul>
<hr />

    {/* CAPM: CORE DEFINITION AND PRINCIPLE */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">CAPM: Core Definition and Principle</h2>
    <p>The **Capital Asset Pricing Model (CAPM)** is a foundational model in modern finance used to calculate the theoretically appropriate **required rate of return** for an asset, given its inherent risk. CAPM is based on the principle that investors must be compensated for two things: the time value of money and the systematic risk they assume.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Risk and Return Relationship</h3>
    <p>The model explicitly assumes that investors are rational and that they only need to be compensated for **Systematic Risk** (market risk), which cannot be eliminated through diversification. Unsystematic risk (specific risk) is ignored because a well-diversified portfolio should eliminate it.</p>

<hr />

    {/* THE CAPM FORMULA AND COMPONENTS */}
    <h2 id="formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The CAPM Formula and Components</h2>
    <p>The CAPM formula calculates the required return ($R_i$) by adding the risk-free rate ($R_f$) to the market risk premium, scaled by the asset's beta ($\beta$).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Identity</h3>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'R_i = R_f + β_i * (R_m - R_f)'}
        </p>
    </div>

    <p>Where:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li>$R_i$ = Required rate of return for the asset.</li>
        <li>$R_f$ = Risk-free rate.</li>
        <li>$\beta_i$ = Beta of the asset.</li>
        <li>$R_m$ = Expected return of the overall market.</li>
    </ul>

<hr />

    {/* THE ROLE OF BETA ($\beta$): MEASURING SYSTEMATIC RISK */}
    <h2 id="beta" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Role of Beta ($\beta$): Measuring Systematic Risk</h2>
    <p>**Beta ($\beta$)** is the measure of **systematic risk** within the CAPM model. It quantifies the expected volatility of the asset's return relative to the volatility of the overall market (the benchmark).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Interpreting Beta</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li>**Beta ($\beta$) = 1.0:** The asset moves exactly in line with the market.</li>
        <li><strong className="font-semibold">Beta is greater than 1.0:</strong> The asset is more volatile than the market (higher systematic risk). It is expected to rise faster than the market during bull cycles and fall faster during bear cycles.</li>
        <li><strong className="font-semibold">Beta is less than 1.0:</strong> The asset is less volatile than the market (lower systematic risk). It is often considered defensive.</li>
        <li>**Beta ($\beta$) = 0:** The asset is completely uncorrelated with the market (e.g., a short-term Treasury bill).</li>
    </ul>
    <p>Beta is the scalar that adjusts the market risk premium to reflect the specific risk of the asset being analyzed.</p>

<hr />

    {/* MARKET RISK PREMIUM AND RISK-FREE RATE */}
    <h2 id="premium" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Market Risk Premium and Risk-Free Rate</h2>
    <p>The CAPM separates the risk-free return component from the risk premium component, allowing for detailed compensation analysis.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Risk-Free Rate ($R_f$)</h3>
    <p>The risk-free rate ($R_f$) compensates the investor for the **time value of money** and inflation. It is the minimum return an investor demands just to defer consumption. In practice, the $R_f$ is typically proxied by the yield on long-term U.S. government bonds (e.g., 10-year Treasury notes), as these are considered free of default risk.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Market Risk Premium ($R_m - R_f$)</h3>
    <p>The **Market Risk Premium** is the extra return that investors, on average, expect to receive for holding a risky market portfolio ($R_m$) over a risk-free asset ($R_f$). This premium is the compensation for taking on average systematic risk. The entire second half of the CAPM formula scales this premium based on the asset's beta.</p>

<hr />

    {/* APPLICATIONS IN VALUATION AND PORTFOLIO MANAGEMENT */}
    <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Applications in Valuation and Portfolio Management</h2>
    <p>The CAPM is central to determining the cost of equity and assessing investment performance.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Cost of Equity and WACC</h3>
    <p>In corporate finance, the required rate of return calculated by CAPM is used as the **Cost of Equity** component of the **Weighted Average Cost of Capital (WACC)**. WACC is the key discount rate used in the Net Present Value (NPV) and Discounted Cash Flow (DCF) valuation models.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Security Market Line (SML)</h3>
    <p>The Security Market Line (SML) is the graphical representation of the CAPM formula. It plots risk (Beta) on the x-axis and expected return (R i) on the y-axis. The SML is used to determine if an asset is undervalued or overvalued:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li>**Above SML:** The asset is generating a return higher than required for its risk (undervalued).</li>
        <li>**Below SML:** The asset is generating a return lower than required for its risk (overvalued).</li>
    </ul>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The Capital Asset Pricing Model (CAPM) is the fundamental theoretical tool for calculating the **required rate of return** for any investment by linking return to systematic risk ($\beta$).</p>
    <p>By scaling the **Market Risk Premium** by the asset's **Beta**, the CAPM provides the essential cost of equity used in corporate valuation, ensuring that projects and assets are only undertaken if their expected returns adequately compensate the investor for the market risk assumed.</p>
</section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about CAPM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is CAPM?</h4>
              <p className="text-muted-foreground">
                The Capital Asset Pricing Model (CAPM) is a financial model that calculates the expected return of an asset based on its systematic risk. The formula is: Expected Return = Risk-Free Rate + Beta × (Market Return - Risk-Free Rate). It's used to determine appropriate returns for investments based on their risk level.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate CAPM?</h4>
              <p className="text-muted-foreground">
                The CAPM formula is: E(R) = Rf + β × (Rm - Rf), where E(R) is expected return, Rf is risk-free rate, β is beta (systematic risk), and Rm is market return. You need the risk-free rate (typically government bond yield), the asset's beta, and the expected market return to calculate the expected return.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is the risk-free rate?</h4>
              <p className="text-muted-foreground">
                The risk-free rate is the return on an investment with no risk of financial loss. It's typically represented by the yield on government bonds (like US Treasury bills). This rate serves as the baseline return that investors can earn without taking any risk.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is beta in CAPM?</h4>
              <p className="text-muted-foreground">
                Beta measures the systematic risk of an asset relative to the market. A beta of 1 means the asset moves with the market, a beta greater than 1 means it's more volatile than the market, and a beta less than 1 means it's less volatile. Beta is calculated using historical price data.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the assumptions of CAPM?</h4>
              <p className="text-muted-foreground">
                CAPM assumes efficient markets, rational investors, no transaction costs, unlimited borrowing and lending at the risk-free rate, and that all investors have the same expectations. These assumptions are often criticized as unrealistic, but CAPM remains widely used despite its limitations.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How is CAPM used in practice?</h4>
              <p className="text-muted-foreground">
                CAPM is used to determine discount rates for valuation, evaluate investment performance, assess risk-adjusted returns, and make portfolio allocation decisions. It's commonly used in corporate finance for project evaluation and in portfolio management for risk assessment and performance measurement.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of CAPM?</h4>
              <p className="text-muted-foreground">
                CAPM has several limitations: it assumes efficient markets, relies on historical beta which may not predict future risk, doesn't account for unsystematic risk, and assumes investors can borrow unlimited amounts at the risk-free rate. These assumptions often don't hold in real markets.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does CAPM relate to portfolio theory?</h4>
              <p className="text-muted-foreground">
                CAPM is an extension of Modern Portfolio Theory. It provides a way to determine the expected return of individual assets based on their contribution to portfolio risk. CAPM helps investors understand the relationship between risk and return and make informed investment decisions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is CAPM important for investors?</h4>
              <p className="text-muted-foreground">
                CAPM is important for investors as it provides a systematic way to assess risk and determine appropriate returns. It helps evaluate whether investments are fairly priced, assess portfolio performance, and make informed decisions about risk-return trade-offs. It's a fundamental tool in investment analysis.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I interpret CAPM results?</h4>
              <p className="text-muted-foreground">
                Higher CAPM expected returns indicate higher risk investments. Compare the CAPM expected return to actual returns to assess performance. If actual returns exceed CAPM expected returns, the investment is outperforming relative to its risk. Use CAPM results as a benchmark for investment evaluation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}