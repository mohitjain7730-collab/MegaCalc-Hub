'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, TrendingUp, Target, Info, AlertCircle, BarChart3, Percent } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  riskFreeRate: z.number().positive(),
  beta: z.number(),
  marketReturn: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DiscountRateCalculator() {
  const [result, setResult] = useState<{ 
    discountRate: number; 
    interpretation: string; 
    recommendation: string;
    riskLevel: string;
    marketPremium: number;
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

  const calculate = (v: FormValues) => {
    if (v.riskFreeRate == null || v.beta == null || v.marketReturn == null) return null;
    const r = v.riskFreeRate / 100;
    const b = v.beta;
    const m = v.marketReturn / 100;
    const discountRate = (r + b * (m - r)) * 100;
    const marketPremium = (m - r) * 100;
    return { discountRate, marketPremium };
  };

  const interpret = (discountRate: number, beta: number) => {
    if (discountRate > 20) return 'Very high discount rate indicates significant risk or high opportunity cost.';
    if (discountRate > 15) return 'High discount rate suggests elevated risk or strong market expectations.';
    if (discountRate > 10) return 'Moderate discount rate reflects balanced risk-return expectations.';
    if (discountRate > 5) return 'Conservative discount rate suggests lower risk or market conditions.';
    return 'Very low discount rate may indicate low risk or unusual market conditions.';
  };

  const getRiskLevel = (discountRate: number, beta: number) => {
    if (discountRate > 20 || beta > 2) return 'Very High';
    if (discountRate > 15 || beta > 1.5) return 'High';
    if (discountRate > 10 || beta > 1) return 'Moderate';
    if (discountRate > 5 || beta > 0.5) return 'Low';
    return 'Very Low';
  };

  const getInsights = (discountRate: number, beta: number, marketPremium: number) => {
    const insights = [];
    
    if (beta > 1.5) {
      insights.push('High beta indicates the investment is more volatile than the market');
    } else if (beta < 0.5) {
      insights.push('Low beta suggests the investment is less volatile than the market');
    }

    if (marketPremium > 8) {
      insights.push('High market risk premium reflects elevated market risk expectations');
    } else if (marketPremium < 4) {
      insights.push('Low market risk premium suggests conservative market outlook');
    }

    if (discountRate > 15) {
      insights.push('High discount rate may limit investment opportunities');
    } else if (discountRate < 8) {
      insights.push('Low discount rate may make more investments attractive');
    }

    return insights;
  };

  const getConsiderations = (discountRate: number, beta: number) => {
    const considerations = [];
    
    considerations.push('Verify beta reflects current market conditions and company fundamentals');
    considerations.push('Consider if risk-free rate matches your investment horizon');
    considerations.push('Review market return assumptions for accuracy');
    
    if (beta > 1.5) {
      considerations.push('High beta investments require careful risk management');
    }
    
    if (discountRate > 15) {
      considerations.push('High discount rate may require exceptional returns to justify investment');
    }

    considerations.push('Consider sensitivity analysis with different beta and market return assumptions');
    considerations.push('Account for changes in market conditions over time');

    return considerations;
  };

  const recommendation = (discountRate: number, beta: number) => {
    if (discountRate > 20) return 'Use with caution - very high discount rate may limit viable investments.';
    if (discountRate > 15) return 'Appropriate for high-risk investments or volatile market conditions.';
    if (discountRate > 10) return 'Suitable for moderate-risk investments and standard market conditions.';
    if (discountRate > 5) return 'Conservative rate suitable for low-risk investments.';
    return 'Very conservative rate - verify assumptions and market conditions.';
  };

  const onSubmit = (values: FormValues) => {
    const calc = calculate(values);
    if (calc == null) { setResult(null); return; }
    setResult({ 
      discountRate: calc.discountRate, 
      interpretation: interpret(calc.discountRate, values.beta), 
      recommendation: recommendation(calc.discountRate, values.beta),
      riskLevel: getRiskLevel(calc.discountRate, values.beta),
      marketPremium: calc.marketPremium,
      insights: getInsights(calc.discountRate, values.beta, calc.marketPremium),
      considerations: getConsiderations(calc.discountRate, values.beta)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            CAPM Parameters
          </CardTitle>
          <CardDescription>
            Enter the parameters to calculate the discount rate using the Capital Asset Pricing Model (CAPM)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="riskFreeRate" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Risk-Free Rate (%)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        placeholder="e.g., 4.5" 
                        {...field} 
                        value={field.value ?? ''} 
                        onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <FormField control={form.control} name="beta" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Investment Beta (β)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        placeholder="e.g., 1.2" 
                        {...field} 
                        value={field.value ?? ''} 
                        onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <FormField control={form.control} name="marketReturn" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      Expected Market Return (%)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        placeholder="e.g., 10" 
                        {...field} 
                        value={field.value ?? ''} 
                        onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              
              <Button type="submit" className="w-full md:w-auto">
                Calculate Discount Rate
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          {/* Main Results Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Calculator className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Discount Rate Analysis</CardTitle>
                  <CardDescription>Required rate of return and risk assessment</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Percent className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Discount Rate</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {result.discountRate.toFixed(2)}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Required Rate of Return
                  </p>
                </div>
                
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <BarChart3 className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Risk Level</span>
                  </div>
                  <div className="text-2xl font-bold">
                    <Badge variant={result.riskLevel === 'Very High' ? 'destructive' : result.riskLevel === 'High' ? 'default' : 'secondary'}>
                      {result.riskLevel}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.interpretation}
                  </p>
                </div>
                
                <div className="text-center p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-muted-foreground">Market Premium</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {result.marketPremium.toFixed(2)}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Risk Premium
                  </p>
                </div>
              </div>

              {/* Detailed Analysis */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Target className="h-5 w-5" />
                        Key Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.insights.map((insight, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm">{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <AlertCircle className="h-5 w-5" />
                        Important Considerations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.considerations.map((consideration, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm">{consideration}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Educational Content - Expanded Sections */}
      <div className="space-y-6">
        {/* Related Calculators Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Related Calculators
            </CardTitle>
            <CardDescription>
              Explore other financial calculators to enhance your investment analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/npv-calculator" className="text-primary hover:underline">
                    Net Present Value Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate NPV using your discount rate to evaluate investment profitability.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/dcf-calculator" className="text-primary hover:underline">
                    Discounted Cash Flow Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Use DCF analysis to determine the intrinsic value of investments.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/wacc-calculator" className="text-primary hover:underline">
                    WACC Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate the weighted average cost of capital for comprehensive analysis.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/capm-calculator" className="text-primary hover:underline">
                    CAPM Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Understand the Capital Asset Pricing Model for risk assessment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to the Discount Rate: Calculation, WACC, and Risk Assessment in Valuation" />
    <meta itemProp="description" content="An expert guide detailing the concept of the Discount Rate, its fundamental role in Present Value (PV) and Net Present Value (NPV), methods for its calculation (WACC, CAPM), and its function as the required rate of return that accounts for risk." />
    <meta itemProp="keywords" content="discount rate formula explained, required rate of return, cost of capital, WACC calculation, CAPM formula, risk adjustment finance, time value of money, hurdle rate finance" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-discount-rate-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to the Discount Rate: Quantifying Risk and Opportunity Cost in Valuation</h1>
    <p className="text-lg italic text-gray-700">Master the single most critical variable in financial modeling that determines the current worth of future cash flows.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#concept" className="hover:underline">Discount Rate: Definition and Economic Function</a></li>
        <li><a href="#lump-sum" className="hover:underline">Role in Present Value (PV) and Valuation</a></li>
        <li><a href="#wacc" className="hover:underline">Corporate Finance: The Weighted Average Cost of Capital (WACC)</a></li>
        <li><a href="#capm" className="hover:underline">Equity Investment: The Capital Asset Pricing Model (CAPM)</a></li>
        <li><a href="#sensitivity" className="hover:underline">Discount Rate Sensitivity and Risk Adjustment</a></li>
    </ul>
<hr />

    {/* DISCOUNT RATE: DEFINITION AND ECONOMIC FUNCTION */}
    <h2 id="concept" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Discount Rate: Definition and Economic Function</h2>
    <p>The <strong className="font-semibold">Discount Rate</strong> is the rate used to calculate the present value of a series of future cash flows. It is simultaneously a measure of the <strong className="font-semibold">Time Value of Money (TVM)</strong>, the <strong className="font-semibold">Opportunity Cost</strong> of capital, and the **Risk** inherent in receiving the payment in the future.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Discounting and the TVM</h3>
    <p>In the context of the Time Value of Money, the discount rate is applied to future amounts to adjust for two economic realities:</p>
    <ol className="list-decimal ml-6 space-y-2">
        <li><strong className="font-semibold">Inflation:</strong> The erosion of purchasing power over time.</li>
        <li><strong className="font-semibold">Risk/Uncertainty:</strong> The possibility that the promised cash flow may not be received (default risk).</li>
    </ol>
    <p>By using the discount rate, financial analysts convert uncertain future cash flows into a single, comparable figure called the **Present Value (PV)**.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Required Rate of Return (The Hurdle)</h3>
    <p>For an investor, the discount rate is synonymous with the <strong className="font-semibold">Required Rate of Return</strong> or **Hurdle Rate**. It is the minimum annual percentage return an investment must yield to justify its risk and cover the cost of financing. If a project's expected return is below the hurdle rate, it should be rejected.</p>

<hr />

    {/* ROLE IN PRESENT VALUE (PV) AND VALUATION */}
    <h2 id="lump-sum" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Role in Present Value (PV) and Valuation</h2>
    <p>The discount rate ($r$) is the denominator in all Present Value calculations. A higher discount rate results in a lower Present Value, reflecting the fact that higher risk investments must offer a greater potential reward to be equally attractive.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">PV of a Single Cash Flow</h3>
    <p>The core formula for discounting a single future lump sum demonstrates the inverse relationship between the discount rate and Present Value:</p>
    
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'PV = FV / (1 + r)^n'}
        </p>
    </div>

    <p>For example, if an investment promises 1,000 dollars in 10 years, discounting at a 5 percent rate gives a much higher PV than discounting at a 10 percent rate. The 10 percent rate correctly implies the investor can earn more elsewhere or perceives higher risk.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">PV of a Perpetuity</h3>
    <p>In the valuation of assets that generate infinite cash flows (perpetuities), the discount rate is the sole determinant of value, highlighting its absolute power in modeling:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'PV = Cash Flow / r'}
        </p>
    </div>

<hr />

    {/* CORPORATE FINANCE: THE WEIGHTED AVERAGE COST OF CAPITAL (WACC) */}
    <h2 id="wacc" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Corporate Finance: The Weighted Average Cost of Capital (WACC)</h2>
    <p>In corporate finance, the appropriate discount rate for valuing an entire firm or an average-risk project is the <strong className="font-semibold">Weighted Average Cost of Capital (WACC)</strong>.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">WACC Mechanics</h3>
    <p>WACC is the weighted average of the costs of all sources of long-term funding—debt, preferred stock, and common equity. It reflects the average rate the company pays to finance its assets.</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'WACC = (E/V) * Re + (D/V) * Rd * (1 - T)'}
        </p>
    </div>
    <p>Where:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li>$Re$ = Cost of Equity (often calculated using CAPM).</li>
        <li>$Rd$ = Cost of Debt.</li>
        <li>$E/V$ and $D/V$ = Market value weights of Equity and Debt.</li>
        <li>$T$ = Corporate tax rate (Cost of Debt is tax-deductible).</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Hurdle for NPV</h3>
    <p>WACC serves as the specific discount rate ($r$) used in Net Present Value (NPV) calculations. If a project's discounted cash flows (at the WACC rate) exceed the initial investment, the NPV is positive, confirming the project will add value above the cost of capital.</p>

<hr />

    {/* EQUITY INVESTMENT: THE CAPITAL ASSET PRICING MODEL (CAPM) */}
    <h2 id="capm" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Equity Investment: The Capital Asset Pricing Model (CAPM)</h2>
    <p>For valuing individual stocks or the equity portion of a firm, the discount rate used is the <strong className="font-semibold">Cost of Equity ($Re$)</strong>, which is typically calculated using the **Capital Asset Pricing Model (CAPM)**.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The CAPM Formula</h3>
    <p>CAPM links a project's systematic (non-diversifiable) risk to its required rate of return:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Re = Rf + Beta * (Rm - Rf)'}
        </p>
    </div>
    <p>Where:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li>$Rf$ = Risk-Free Rate (Return on long-term government bonds).</li>
        <li>$Rm$ = Expected market return.</li>
        <li>$Beta$ = Systematic Risk (Measures the asset's volatility relative to the overall market).</li>
    </ul>
    <p>This method ensures the discount rate correctly incorporates only the market risk that an investor cannot eliminate through diversification.</p>

<hr />

    {/* DISCOUNT RATE SENSITIVITY AND RISK ADJUSTMENT */}
    <h2 id="sensitivity" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Discount Rate Sensitivity and Risk Adjustment</h2>
    <p>The discount rate is the primary mechanism for adjusting valuation models for risk. A small change in the discount rate can lead to a massive change in the Present Value, especially for projects with long time horizons.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The High Sensitivity Problem</h3>
    <p>Because the discount rate is in the denominator of the PV formula and is raised to a high power (n), its impact is exponential. For instance, increasing the discount rate by just 1% on a 30-year cash flow can decrease its PV by 20% or more. This high sensitivity necessitates thorough **sensitivity analysis** on the chosen rate.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Project-Specific Discount Rates</h3>
    <p>Best practice dictates that a company should not use a single, universal WACC for all projects. Instead, high-risk projects (e.g., launching a new technology or entering an unstable foreign market) should be discounted using a rate higher than the company's WACC, while low-risk projects (e.g., upgrading existing equipment) may use a lower rate.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The discount rate is the single most important determinant of value in finance. It is the quantification of opportunity cost and risk, serving as the required rate of return that links future cash flows to their present-day worth.</p>
    <p>Whether calculated as the comprehensive WACC for corporate projects or the CAPM for equity investments, selecting the appropriate, risk-adjusted discount rate is the foundational step for any rational investment decision, ensuring that capital is allocated efficiently to projects that truly maximize wealth.</p>
</section>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about discount rates and CAPM analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is a discount rate?</h4>
              <p className="text-muted-foreground">
                A discount rate is the interest rate used to determine the present value of future cash flows. It reflects the time value of money and the risk associated with an investment.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How is the discount rate calculated using CAPM?</h4>
              <p className="text-muted-foreground">
                CAPM calculates discount rate as: Risk-Free Rate + Beta × (Market Return - Risk-Free Rate). This formula accounts for systematic risk and market conditions.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What is beta and how does it affect the discount rate?</h4>
              <p className="text-muted-foreground">
                Beta measures an investment's sensitivity to market movements. A beta greater than 1 indicates higher volatility than the market, while beta less than 1 indicates lower volatility.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What should I use as the risk-free rate?</h4>
              <p className="text-muted-foreground">
                Use government bond yields that match your investment horizon. For long-term investments, use 10-year treasury yields; for short-term, use 3-month treasury bills.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I determine the expected market return?</h4>
              <p className="text-muted-foreground">
                Use historical market returns (typically 8-12% annually) or forward-looking estimates based on current market conditions and economic outlook.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">When should I use CAPM vs. WACC?</h4>
              <p className="text-muted-foreground">
                Use CAPM for equity-focused analysis or when evaluating individual investments. Use WACC for company-wide valuation or when considering both debt and equity financing.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can discount rates change over time?</h4>
              <p className="text-muted-foreground">
                Yes, discount rates should be updated as market conditions, interest rates, and company risk profiles change. Review and adjust annually or when significant changes occur.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What are the limitations of CAPM?</h4>
              <p className="text-muted-foreground">
                CAPM assumes efficient markets, constant beta, and that investors hold diversified portfolios. It may not capture all risk factors or work well for private companies or unique investments.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I adjust for different risk levels?</h4>
              <p className="text-muted-foreground">
                Add risk premiums for specific factors like size, liquidity, country risk, or industry-specific risks. These adjustments reflect additional risks not captured by beta alone.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I use real or nominal discount rates?</h4>
              <p className="text-muted-foreground">
                Use nominal rates with nominal cash flows, or real rates with inflation-adjusted cash flows. Mixing them will lead to incorrect valuations. Convert between them using the Fisher equation.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
