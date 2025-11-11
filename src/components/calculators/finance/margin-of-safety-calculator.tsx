'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, TrendingUp, BarChart3, Activity, Percent } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  intrinsicValue: z.number().positive(),
  currentPrice: z.number().positive(),
  targetReturn: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function MarginOfSafetyCalculator() {
  const [result, setResult] = useState<{ 
    marginOfSafety: number;
    marginOfSafetyPercentage: number;
    interpretation: string; 
    safetyLevel: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      intrinsicValue: undefined,
      currentPrice: undefined,
      targetReturn: undefined,
    },
  });

  const calculateMarginOfSafety = (values: FormValues) => {
    const { intrinsicValue, currentPrice } = values;
    
    // Calculate margin of safety in dollars
    const marginOfSafety = intrinsicValue - currentPrice;
    
    // Calculate margin of safety as percentage
    const marginOfSafetyPercentage = (marginOfSafety / intrinsicValue) * 100;
    
    return { marginOfSafety, marginOfSafetyPercentage };
  };

  const interpret = (marginOfSafetyPercentage: number, intrinsicValue: number, currentPrice: number) => {
    if (marginOfSafetyPercentage >= 50) return `Excellent margin of safety of ${marginOfSafetyPercentage.toFixed(1)}% - significant discount to intrinsic value provides substantial downside protection.`;
    if (marginOfSafetyPercentage >= 25) return `Good margin of safety of ${marginOfSafetyPercentage.toFixed(1)}% - reasonable discount to intrinsic value provides adequate downside protection.`;
    if (marginOfSafetyPercentage >= 10) return `Moderate margin of safety of ${marginOfSafetyPercentage.toFixed(1)}% - modest discount to intrinsic value provides basic downside protection.`;
    if (marginOfSafetyPercentage >= 0) return `Minimal margin of safety of ${marginOfSafetyPercentage.toFixed(1)}% - small discount to intrinsic value provides limited downside protection.`;
    return `No margin of safety - current price exceeds intrinsic value by ${Math.abs(marginOfSafetyPercentage).toFixed(1)}%, indicating overvaluation.`;
  };

  const getSafetyLevel = (marginOfSafetyPercentage: number) => {
    if (marginOfSafetyPercentage >= 50) return 'Excellent';
    if (marginOfSafetyPercentage >= 25) return 'Good';
    if (marginOfSafetyPercentage >= 10) return 'Moderate';
    if (marginOfSafetyPercentage >= 0) return 'Minimal';
    return 'None';
  };

  const getRecommendation = (marginOfSafetyPercentage: number, intrinsicValue: number, currentPrice: number) => {
    if (marginOfSafetyPercentage >= 50) return 'Excellent margin of safety - strong buy opportunity with substantial downside protection.';
    if (marginOfSafetyPercentage >= 25) return 'Good margin of safety - attractive investment opportunity with adequate downside protection.';
    if (marginOfSafetyPercentage >= 10) return 'Moderate margin of safety - consider investment with basic downside protection.';
    if (marginOfSafetyPercentage >= 0) return 'Minimal margin of safety - evaluate carefully as downside protection is limited.';
    return 'No margin of safety - avoid investment as current price exceeds intrinsic value.';
  };

  const getStrength = (marginOfSafetyPercentage: number) => {
    if (marginOfSafetyPercentage >= 50) return 'Very Strong';
    if (marginOfSafetyPercentage >= 25) return 'Strong';
    if (marginOfSafetyPercentage >= 10) return 'Good';
    if (marginOfSafetyPercentage >= 0) return 'Moderate';
    return 'Weak';
  };

  const getInsights = (marginOfSafetyPercentage: number, intrinsicValue: number, currentPrice: number) => {
    const insights = [];
    
    if (marginOfSafetyPercentage >= 50) {
      insights.push('Excellent downside protection');
      insights.push('Significant value opportunity');
      insights.push('Strong investment case');
    } else if (marginOfSafetyPercentage >= 25) {
      insights.push('Good downside protection');
      insights.push('Attractive value opportunity');
      insights.push('Solid investment case');
    } else if (marginOfSafetyPercentage >= 10) {
      insights.push('Moderate downside protection');
      insights.push('Reasonable value opportunity');
      insights.push('Basic investment case');
    } else if (marginOfSafetyPercentage >= 0) {
      insights.push('Limited downside protection');
      insights.push('Minimal value opportunity');
      insights.push('Weak investment case');
    } else {
      insights.push('No downside protection');
      insights.push('Overvalued opportunity');
      insights.push('Poor investment case');
    }
    
    if (marginOfSafetyPercentage > 0) {
      insights.push('Price below intrinsic value');
      insights.push('Value investment opportunity');
    } else {
      insights.push('Price above intrinsic value');
      insights.push('Growth investment consideration');
    }
    
    insights.push(`Margin of safety: ${marginOfSafetyPercentage.toFixed(1)}%`);
    insights.push('Risk assessment analysis');
    
    return insights;
  };

  const getConsiderations = (marginOfSafetyPercentage: number) => {
    const considerations = [];
    considerations.push('Margin of safety provides downside protection');
    considerations.push('Intrinsic value estimates may be inaccurate');
    considerations.push('Market conditions affect valuation');
    considerations.push('Consider multiple valuation methods');
    considerations.push('Monitor changes in intrinsic value');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const { marginOfSafety, marginOfSafetyPercentage } = calculateMarginOfSafety(values);
    setResult({
      marginOfSafety,
      marginOfSafetyPercentage,
      interpretation: interpret(marginOfSafetyPercentage, values.intrinsicValue, values.currentPrice),
      safetyLevel: getSafetyLevel(marginOfSafetyPercentage),
      recommendation: getRecommendation(marginOfSafetyPercentage, values.intrinsicValue, values.currentPrice),
      strength: getStrength(marginOfSafetyPercentage),
      insights: getInsights(marginOfSafetyPercentage, values.intrinsicValue, values.currentPrice),
      considerations: getConsiderations(marginOfSafetyPercentage)
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <CardTitle>Margin of Safety Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate the margin of safety to assess downside protection and investment risk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="intrinsicValue" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Intrinsic Value ($)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter intrinsic value" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="currentPrice" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Current Price ($)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter current price" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="targetReturn" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      Target Return (%) - Optional
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter target return" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Margin of Safety
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
                  <CardTitle>Margin of Safety Results</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={result.safetyLevel === 'Excellent' ? 'default' : result.safetyLevel === 'Good' ? 'secondary' : 'destructive'}>
                    {result.safetyLevel}
                  </Badge>
                  <Badge variant="outline">{result.strength}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      ${result.marginOfSafety.toFixed(2)}
                    </div>
                    <p className="text-sm text-muted-foreground">Margin of Safety ($)</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {result.marginOfSafetyPercentage.toFixed(1)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Margin of Safety (%)</p>
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
            Explore other essential financial metrics for comprehensive investment analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/category/finance/simple-inflation-adjusted-return-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Inflation-Adjusted Return</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/real-rate-of-return-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Percent className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Real Rate of Return</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/sharpe-ratio-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Sharpe Ratio</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/value-at-risk-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Value at Risk</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Margin of Safety: Calculation, Interpretation, and Investment Principle" />
    <meta itemProp="description" content="An expert guide detailing the Margin of Safety (MOS) calculation, its role as the core principle of value investing, its application in capital budgeting, and its function as a protective buffer against forecast errors and risk." />
    <meta itemProp="keywords" content="margin of safety formula explained, value investing principle, calculating MOS percentage, intrinsic value vs market price, break-even point analysis, investment risk mitigation" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-11-11" /> 
    <meta itemProp="url" content="/definitive-margin-of-safety-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Margin of Safety: The Core Principle of Value Investing</h1>
    <p className="text-lg italic text-gray-700">Master the fundamental concept that provides a cushion against adverse market events, misjudgment, or estimation errors.</p>
    

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#definition" className="hover:underline">MOS: Definition and Benjamin Graham's Principle</a></li>
        <li><a href="#formula-investing" className="hover:underline">Calculation in Investing (Intrinsic Value)</a></li>
        <li><a href="#formula-business" className="hover:underline">Calculation in Business (Break-Even Analysis)</a></li>
        <li><a href="#interpretation" className="hover:underline">Interpreting the Margin and Risk</a></li>
        <li><a href="#applications" className="hover:underline">Application in Valuation and Capital Allocation</a></li>
    </ul>
<hr />

    {/* MOS: DEFINITION AND BENJAMIN GRAHAM'S PRINCIPLE */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">MOS: Definition and Benjamin Graham's Principle</h2>
    <p>The **Margin of Safety (MOS)** is a principle formalized by the father of value investing, Benjamin Graham. It represents the difference between an asset's **Intrinsic Value** (its true, calculated worth) and its current **Market Price**. The MOS is the cushion that protects investors from financial loss if the valuation proves to be incorrect.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Protection Against Uncertainty</h3>
    <p>Graham argued that all valuations are inherently imprecise due to unpredictable future events, human errors in forecasting, and market irrationality. Therefore, the MOS is a protective buffer that accounts for inevitable misjudgments. The larger the MOS, the lower the risk of permanent capital loss.</p>

<hr />

    {/* CALCULATION IN INVESTING (INTRINSIC VALUE) */}
    <h2 id="formula-investing" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculation in Investing (Intrinsic Value)</h2>
    <p>In value investing, the Margin of Safety is calculated after determining the Intrinsic Value of a security using fundamental analysis (e.g., Discounted Cash Flow or Net Asset Value). It is often expressed as a percentage.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Identity for Equity</h3>
    <p>The formula calculates the difference between the true value and the price paid, relative to the true value:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-500 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'MOS % = [(Intrinsic Value - Market Price) / Intrinsic Value] * 100'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Buy/Sell Decision</h3>
    <p>A positive MOS means the investor is purchasing the asset at a price below its estimated worth. The investment decision is simplified: never buy a stock unless its market price offers a sufficient margin of safety (typically 20% or more, depending on the asset's volatility and the analyst's certainty).</p>

<hr />

    {/* CALCULATION IN BUSINESS (BREAK-EVEN ANALYSIS) */}
    <h2 id="formula-business" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculation in Business (Break-Even Analysis)</h2>
    <p>In business management, the Margin of Safety concept is applied to production and sales forecasting. Here, it measures the buffer between actual (or expected) sales and the minimum required sales needed to avoid a loss.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">MOS for Sales and Production</h3>
    <p>The MOS for a company's sales measures how much sales revenue can drop before the company reaches its **Break-Even Point** (the point where Net Income is zero):</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-500 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'MOS (Business) = (Actual Sales - Break-Even Sales) / Actual Sales'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Interpretation in Operations</h3>
    <p>If a company's MOS is 30%, it means sales can drop by 30% before the company begins to lose money. A high operational MOS signals strong cost control (low fixed costs) and pricing power, indicating a low risk of insolvency during an economic downturn.</p>

<hr />

    {/* INTERPRETING THE MARGIN AND RISK */}
    <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting the Margin and Risk</h2>
    <p>The size of the required MOS is not fixed; it must be proportional to the assessed risk and the perceived quality of the underlying asset.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Factors Dictating MOS Size</h3>
    <ol className="list-decimal ml-6 space-y-2">
        <li><strong className="font-semibold">Quality of Management/Company:</strong> A highly stable company (e.g., utility, established consumer brand) requires a smaller MOS (e.g., 10%) because its cash flows are highly predictable.</li>
        <li><strong className="font-semibold">Volatility/Uncertainty:</strong> A highly volatile, early-stage company (e.g., biotech, high-growth tech) requires a much larger MOS (e.g., 40% or more) to compensate for the higher uncertainty in future earnings.</li>
        <li><strong className="font-semibold">Integrity of Forecast:</strong> If the valuation model uses highly aggressive assumptions, the required MOS must be increased to compensate for the subjective input risk.</li>
    </ol>
    <p>The MOS provides the clearest mechanism for incorporating non-quantifiable risks (like poor management or regulatory change) into the investment decision.</p>

<hr />

    {/* APPLICATIONS IN VALUATION AND CAPITAL ALLOCATION */}
    <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Application in Valuation and Capital Allocation</h2>
    <p>The MOS is a psychological and quantitative screen used by both public equity investors and corporate finance departments.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Value Investing Screening</h3>
    <p>Value investors use the MOS as a primary filter. They establish their own **maximum purchase price** for every stock based on their calculated intrinsic value minus their required margin. This forces them to buy only when the stock is out of favor and trading at a clear discount.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Capital Allocation (NPV)</h3>
    <p>In capital budgeting, the MOS concept is applied by adjusting project forecasts. Before adopting a project, management may require that the expected Net Present Value (NPV) remains positive even when the most critical variables are stressed (e.g., sales are cut by 20% or costs are raised by 15%). This ensures the project has a safety cushion against forecast error.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The Margin of Safety (MOS) is the foundational defensive principle of value investing, requiring investors to purchase assets at a **significant discount** to their calculated Intrinsic Value.</p>
    <p>Whether applied to stock valuation or operational forecasting (the buffer above the **Break-Even Point**), the MOS serves as a non-negotiable protective buffer that shields capital against inevitable errors in judgment, unforeseen market events, and the inherent uncertainty of the future.</p>
</section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about Margin of Safety
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is margin of safety?</h4>
              <p className="text-muted-foreground">
                Margin of safety is the difference between an asset's intrinsic value and its current market price, expressed as a percentage. It provides downside protection by ensuring that even if the intrinsic value estimate is wrong, investors have a buffer against losses. A higher margin of safety indicates greater downside protection.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate margin of safety?</h4>
              <p className="text-muted-foreground">
                Calculate margin of safety as: Margin of Safety = (Intrinsic Value - Current Price) / Intrinsic Value × 100%. This formula shows the percentage discount to intrinsic value. For example, if intrinsic value is $100 and current price is $75, the margin of safety is 25%.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is a good margin of safety?</h4>
              <p className="text-muted-foreground">
                A good margin of safety depends on your risk tolerance and investment strategy. Generally, 20-30% is considered good, while 30-50% is excellent. Value investors often seek margins of safety above 25% to provide adequate downside protection against valuation errors and market volatility.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is margin of safety important?</h4>
              <p className="text-muted-foreground">
                Margin of safety is important because it provides downside protection, reduces investment risk, and helps identify undervalued opportunities. It acts as a buffer against valuation errors, market volatility, and unexpected events, making investments more resilient and reducing the likelihood of permanent capital loss.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does margin of safety protect against risk?</h4>
              <p className="text-muted-foreground">
                Margin of safety protects against risk by providing a buffer between the purchase price and intrinsic value. Even if the intrinsic value estimate is wrong or market conditions deteriorate, the margin of safety reduces the likelihood of permanent capital loss and provides room for error in valuation assumptions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What factors affect margin of safety?</h4>
              <p className="text-muted-foreground">
                Key factors include intrinsic value estimates, current market prices, market conditions, investor risk tolerance, and investment time horizon. Market volatility, economic conditions, and company-specific factors also affect margin of safety calculations and investment decisions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I use margin of safety for investment decisions?</h4>
              <p className="text-muted-foreground">
                Use margin of safety to identify undervalued opportunities, assess investment risk, and make informed investment decisions. Compare margins of safety across different investments, consider your risk tolerance, and ensure adequate downside protection before investing. Higher margins of safety generally indicate better risk-adjusted opportunities.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of margin of safety?</h4>
              <p className="text-muted-foreground">
                Limitations include: intrinsic value estimates may be inaccurate, market conditions can change rapidly, margin of safety doesn't guarantee positive returns, and it may miss growth opportunities. Consider multiple valuation methods and market factors when using margin of safety for investment decisions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does margin of safety relate to value investing?</h4>
              <p className="text-muted-foreground">
                Margin of safety is a core principle of value investing, popularized by Benjamin Graham. Value investors seek to buy assets at prices significantly below their intrinsic value, providing a margin of safety against losses. This approach focuses on downside protection and long-term wealth creation through disciplined valuation.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is margin of safety important for portfolio management?</h4>
              <p className="text-muted-foreground">
                Margin of safety is important for portfolio management as it helps assess investment risk, identify opportunities, and build resilient portfolios. It provides a framework for risk management, helps optimize risk-adjusted returns, and ensures that investments align with risk tolerance and investment objectives.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}