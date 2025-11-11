'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, DollarSign, TrendingUp, Target, Info, AlertCircle, BarChart3, Percent } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  gainFromInvestment: z.number(),
  costOfInvestment: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ReturnOnInvestmentCalculator() {
  const [result, setResult] = useState<{ 
    roi: number; 
    interpretation: string; 
    recommendation: string;
    performance: string;
    riskLevel: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gainFromInvestment: undefined,
      costOfInvestment: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.gainFromInvestment == null || v.costOfInvestment == null) return null;
    return ((v.gainFromInvestment - v.costOfInvestment) / v.costOfInvestment) * 100;
  };

  const interpret = (roi: number) => {
    if (roi > 50) return 'Excellent ROI indicates highly profitable investment.';
    if (roi > 20) return 'Good ROI suggests solid investment returns.';
    if (roi > 10) return 'Moderate ROI indicates reasonable investment performance.';
    if (roi > 0) return 'Low ROI suggests minimal investment returns.';
    return 'Negative ROI indicates investment losses and poor performance.';
  };

  const getPerformance = (roi: number) => {
    if (roi > 50) return 'Exceptional';
    if (roi > 20) return 'Strong';
    if (roi > 10) return 'Moderate';
    if (roi > 0) return 'Weak';
    return 'Poor';
  };

  const getRiskLevel = (roi: number) => {
    if (roi > 30) return 'Low';
    if (roi > 10) return 'Moderate';
    if (roi > 0) return 'High';
    return 'Very High';
  };

  const getInsights = (roi: number) => {
    const insights = [];
    
    if (roi > 50) {
      insights.push('Exceptional investment performance and returns');
      insights.push('Strong competitive advantages or market opportunities');
    } else if (roi > 20) {
      insights.push('Good investment performance and solid returns');
      insights.push('Effective investment strategy and execution');
    } else if (roi > 10) {
      insights.push('Moderate investment performance with room for improvement');
      insights.push('Consider optimization opportunities');
    } else if (roi > 0) {
      insights.push('Low investment returns suggest challenges or poor timing');
      insights.push('May indicate market conditions or execution issues');
    } else {
      insights.push('Negative returns indicate investment losses');
      insights.push('Requires immediate attention and strategy review');
    }

    if (roi > 100) {
      insights.push('Outstanding ROI may indicate exceptional opportunities or temporary factors');
    }

    return insights;
  };

  const getConsiderations = (roi: number) => {
    const considerations = [];
    
    considerations.push('Compare ROI with alternative investment opportunities');
    considerations.push('Consider the time horizon and risk profile of the investment');
    considerations.push('Evaluate the sustainability of high ROI levels');
    
    if (roi > 50) {
      considerations.push('Very high ROI may not be sustainable long-term');
      considerations.push('Investigate if high ROI is due to temporary factors or competitive advantages');
    } else if (roi < 5) {
      considerations.push('Low ROI requires investigation of underlying causes');
      considerations.push('Consider if the investment is in a turnaround phase or facing challenges');
    }

    considerations.push('Monitor ROI trends over multiple periods');
    considerations.push('Consider the impact of market conditions on ROI calculations');

    return considerations;
  };

  const recommendation = (roi: number) => {
    if (roi > 30) {
      return 'Excellent ROI indicates strong investment performance - consider expanding or replicating.';
    } else if (roi > 15) {
      return 'Good ROI suggests solid investment - evaluate alongside other factors.';
    } else if (roi > 5) {
      return 'Moderate ROI requires careful analysis of investment fundamentals.';
    } else {
      return 'Low ROI suggests investment challenges - consider exit or strategy changes.';
    }
  };

  const onSubmit = (values: FormValues) => {
    const roi = calculate(values);
    if (roi == null) { setResult(null); return; }
    setResult({ 
      roi, 
      interpretation: interpret(roi), 
      recommendation: recommendation(roi),
      performance: getPerformance(roi),
      riskLevel: getRiskLevel(roi),
      insights: getInsights(roi),
      considerations: getConsiderations(roi)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Investment Parameters
          </CardTitle>
          <CardDescription>
            Enter your investment details to calculate the return on investment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="gainFromInvestment" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Gain from Investment ($)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="e.g., 150000" 
                        {...field} 
                        value={field.value ?? ''} 
                        onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <FormField control={form.control} name="costOfInvestment" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Cost of Investment ($)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="e.g., 100000" 
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
                Calculate ROI
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
                  <CardTitle>Return on Investment Analysis</CardTitle>
                  <CardDescription>Investment performance assessment and insights</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Percent className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">ROI</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {result.roi.toFixed(2)}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.performance}
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
                
                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-muted-foreground">Recommendation</span>
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    {result.roi > 30 ? 'Excellent' : result.roi > 15 ? 'Good' : 'Review'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.recommendation}
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
                  Calculate NPV to evaluate investment profitability and decision-making.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/payback-period-calculator" className="text-primary hover:underline">
                    Payback Period Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate payback period to assess investment recovery time.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/return-on-equity-calculator" className="text-primary hover:underline">
                    Return on Equity Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate ROE to assess management efficiency and profitability.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/return-on-assets-calculator" className="text-primary hover:underline">
                    Return on Assets Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate ROA to evaluate asset utilization efficiency.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Return on Investment (ROI): Calculation, Interpretation, and Investment Performance" />
    <meta itemProp="description" content="An expert guide detailing the Return on Investment (ROI) formula, its core role as a profitability metric, its use in comparing different asset classes, and the difference between realized (historical) ROI and annualized ROI." />
    <meta itemProp="keywords" content="return on investment formula explained, calculating ROI percentage, profitability metric finance, investment performance analysis, ROI vs IRR, annualized return on investment" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-11-11" /> 
    <meta itemProp="url" content="/definitive-roi-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Return on Investment (ROI): The Universal Measure of Profitability</h1>
    <p className="text-lg italic text-gray-700">Master the fundamental metric that quantifies the efficiency and success of any investment by comparing gain against cost.</p>
    

[Image of Return on Investment (ROI) calculation concept]


    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#definition" className="hover:underline">ROI: Definition and Core Significance</a></li>
        <li><a href="#formula" className="hover:underline">The ROI Formula and Calculation</a></li>
        <li><a href="#annualized" className="hover:underline">Annualized ROI vs. Cumulative ROI</a></li>
        <li><a href="#limitations" className="hover:underline">Key Limitations and Alternatives (IRR)</a></li>
        <li><a href="#applications" className="hover:underline">Applications in Business and Personal Finance</a></li>
    </ul>
<hr />

    {/* ROI: DEFINITION AND CORE SIGNIFICANCE */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">ROI: Definition and Core Significance</h2>
    <p>The **Return on Investment (ROI)** is a performance measure used to evaluate the efficiency or profitability of an investment or to compare the efficiency of different investments. It directly compares the net benefit generated by an investment to the cost of the investment.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Universal Metric</h3>
    <p>ROI is the most widely used metric in finance and business because it is simple, intuitive, and universally applicable across different types of assets, including stocks, real estate, marketing campaigns, and capital expenditures (CapEx). The resulting figure is expressed as a percentage.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Focus on Net Gain</h3>
    <p>ROI always focuses on **Net Gain**—the profit after all costs are accounted for. A positive ROI indicates the investment is profitable, while a negative ROI indicates a net loss.</p>

<hr />

    {/* THE ROI FORMULA AND CALCULATION */}
    <h2 id="formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The ROI Formula and Calculation</h2>
    <p>ROI is calculated by taking the net gain of an investment, dividing it by the total cost of the investment, and then converting the result into a percentage.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Identity</h3>
    <p>The standard formula for Return on Investment is:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'ROI = [(Final Value - Initial Cost) / Initial Cost] * 100'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Defining Total Investment Cost</h3>
    <p>The **Initial Cost** must include all capital outlays associated with the investment, including the purchase price, transaction fees, commissions, and any necessary startup or renovation costs. Excluding these fees results in an artificially inflated ROI.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Defining Net Gain</h3>
    <p>The **Final Value** must include all returns, including capital appreciation and any intermediate cash flows received (e.g., dividends, rent, or coupons) during the holding period.</p>

<hr />

    {/* ANNUALIZED ROI VS. CUMULATIVE ROI */}
    <h2 id="annualized" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Annualized ROI vs. Cumulative ROI</h2>
    <p>The standard ROI calculation is a **Cumulative ROI**—it measures the total return over the entire holding period, regardless of length. This creates an apples-to-oranges problem when comparing investments with different durations, necessitating the **Annualized ROI**.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Cumulative ROI (Total Return)</h3>
    <p>This is the simple, non-time-weighted percentage that answers, "What was the total profit?" It is useful for assessing the final outcome of a project but not for comparing against a benchmark like the stock market (which is always quoted in annual terms).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Annualized ROI (Time-Weighted)</h3>
    <p>The Annualized ROI adjusts the total return to a single, yearly rate, making it comparable to metrics like Yield to Maturity (YTM) or Compounded Annual Growth Rate (CAGR).</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Annualized ROI = [ (1 + Cumulative ROI)^(1/Years Held) - 1 ] * 100'}
        </p>
    </div>
    <p>This provides a truer measure of the investment's compounding performance over time.</p>

<hr />

    {/* KEY LIMITATIONS AND ALTERNATIVES (IRR) */}
    <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Key Limitations and Alternatives (IRR)</h2>
    <p>While simple, the ROI metric has a critical flaw that limits its use in complex capital budgeting decisions: its failure to account for the Time Value of Money (TVM).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Ignoring the Time Value of Money (TVM)</h3>
    <p>The ROI calculation treats all cash flows as equal, regardless of when they are received. A dollar received in Year 1 is treated the same as a dollar received in Year 10. This is financially flawed because a dollar received today can be reinvested to earn returns, making it more valuable.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Internal Rate of Return (IRR)</h3>
    <p>For large business investments with uneven cash flows and long durations, the **Internal Rate of Return (IRR)** or **Net Present Value (NPV)** are superior metrics. IRR and NPV address the TVM flaw by discounting future cash flows back to their present value, providing an economically accurate assessment of the project's intrinsic worth.</p>

<hr />

    {/* APPLICATIONS IN BUSINESS AND PERSONAL FINANCE */}
    <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Applications in Business and Personal Finance</h2>
    <p>ROI remains a primary quick screening tool across various fields due to its simplicity.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Personal Investment Comparison</h3>
    <p>Investors use ROI to compare different asset classes, such as: "Did my rental property achieve a better return than my stock portfolio last year?" The simple percentage allows for rapid portfolio rebalancing decisions.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Marketing and Advertising</h3>
    <p>In business, **Marketing ROI** measures the profitability of advertising campaigns. The formula calculates (Revenue from Campaign - Cost of Campaign) / Cost of Campaign, providing a direct metric for allocating marketing capital efficiently.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Return on Investment (ROI) is the universal metric of efficiency, quantifying profit by dividing the **Net Gain** by the **Initial Cost**. Its simplicity makes it indispensable for rapid performance evaluation and comparing diverse investments.</p>
    <p>While the **Cumulative ROI** reveals the total profit, savvy investors rely on **Annualized ROI** to properly assess compounding performance and recognize that, for complex, long-term decisions, metrics like the Internal Rate of Return (IRR) offer a more accurate assessment by accounting for the Time Value of Money.</p>
</section>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about Return on Investment analysis and performance measurement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is Return on Investment (ROI)?</h4>
              <p className="text-muted-foreground">
                ROI is a performance measure used to evaluate the efficiency of an investment. It's calculated as (Gain from Investment - Cost of Investment) ÷ Cost of Investment × 100.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I calculate ROI?</h4>
              <p className="text-muted-foreground">
                ROI = ((Gain from Investment - Cost of Investment) ÷ Cost of Investment) × 100. For example, if you invest $100,000 and gain $150,000, your ROI is 50%.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's a good ROI?</h4>
              <p className="text-muted-foreground">
                A good ROI depends on the investment type and risk level. Generally, 10-20% is considered good for most investments, but this varies significantly by asset class and market conditions.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What does a high ROI indicate?</h4>
              <p className="text-muted-foreground">
                High ROI indicates efficient use of capital, strong investment performance, or favorable market conditions. It suggests the investment generated significant returns relative to the initial cost.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What does a low ROI indicate?</h4>
              <p className="text-muted-foreground">
                Low ROI may indicate poor investment performance, unfavorable market conditions, or inefficient use of capital. It suggests the investment didn't generate adequate returns relative to the initial cost.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can ROI be negative?</h4>
              <p className="text-muted-foreground">
                Yes, ROI can be negative when the gain from investment is less than the cost of investment. Negative ROI indicates investment losses and poor performance.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What are the limitations of ROI?</h4>
              <p className="text-muted-foreground">
                ROI doesn't account for the time value of money, risk levels, or the time horizon of the investment. It should be used alongside other metrics like NPV and payback period.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I compare ROI across different investments?</h4>
              <p className="text-muted-foreground">
                Compare ROI within similar asset classes and time horizons. Consider risk levels, market conditions, and investment objectives when making comparisons.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between ROI and ROE?</h4>
              <p className="text-muted-foreground">
                ROI measures returns on any investment, while ROE specifically measures returns on shareholders' equity. ROI is broader and can apply to any investment, while ROE is specific to equity investments.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How often should I calculate ROI?</h4>
              <p className="text-muted-foreground">
                Calculate ROI regularly to monitor investment performance. The frequency depends on the investment type - daily for trading, monthly for active investments, or annually for long-term investments.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}