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
  netIncome: z.number().positive(),
  shareholdersEquity: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ReturnOnEquityCalculator() {
  const [result, setResult] = useState<{ 
    roe: number; 
    interpretation: string; 
    recommendation: string;
    efficiency: string;
    riskLevel: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      netIncome: undefined,
      shareholdersEquity: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.netIncome == null || v.shareholdersEquity == null) return null;
    return (v.netIncome / v.shareholdersEquity) * 100;
  };

  const interpret = (roe: number) => {
    if (roe > 20) return 'Excellent ROE indicates highly efficient use of shareholder equity.';
    if (roe > 15) return 'Good ROE suggests effective management of shareholder capital.';
    if (roe > 10) return 'Moderate ROE indicates reasonable efficiency in equity utilization.';
    if (roe > 5) return 'Low ROE suggests inefficient use of shareholder equity.';
    return 'Very low ROE indicates poor management efficiency or financial challenges.';
  };

  const getEfficiency = (roe: number) => {
    if (roe > 20) return 'Highly Efficient';
    if (roe > 15) return 'Efficient';
    if (roe > 10) return 'Moderately Efficient';
    if (roe > 5) return 'Inefficient';
    return 'Very Inefficient';
  };

  const getRiskLevel = (roe: number) => {
    if (roe > 25) return 'Low';
    if (roe > 15) return 'Moderate';
    if (roe > 10) return 'High';
    return 'Very High';
  };

  const getInsights = (roe: number) => {
    const insights = [];
    
    if (roe > 20) {
      insights.push('Exceptional management efficiency in generating returns');
      insights.push('Strong competitive advantage and operational excellence');
    } else if (roe > 15) {
      insights.push('Good management efficiency and capital utilization');
      insights.push('Solid operational performance');
    } else if (roe > 10) {
      insights.push('Moderate efficiency in equity utilization');
      insights.push('Room for improvement in management effectiveness');
    } else {
      insights.push('Low efficiency suggests management or operational challenges');
      insights.push('May indicate competitive disadvantages or poor capital allocation');
    }

    if (roe > 30) {
      insights.push('Outstanding ROE may indicate exceptional business model or temporary factors');
    }

    return insights;
  };

  const getConsiderations = (roe: number) => {
    const considerations = [];
    
    considerations.push('Compare ROE with industry peers and historical performance');
    considerations.push('Consider the company\'s business model and competitive position');
    considerations.push('Evaluate the sustainability of high ROE levels');
    
    if (roe > 25) {
      considerations.push('Very high ROE may not be sustainable long-term');
      considerations.push('Investigate if high ROE is due to temporary factors or competitive advantages');
    } else if (roe < 10) {
      considerations.push('Low ROE requires investigation of underlying causes');
      considerations.push('Consider if the company is in a turnaround phase or facing challenges');
    }

    considerations.push('Monitor ROE trends over multiple periods');
    considerations.push('Consider the impact of leverage on ROE calculations');

    return considerations;
  };

  const recommendation = (roe: number) => {
    if (roe > 20) {
      return 'Excellent ROE indicates strong management - consider for investment.';
    } else if (roe > 15) {
      return 'Good ROE suggests solid management - evaluate alongside other metrics.';
    } else if (roe > 10) {
      return 'Moderate ROE requires careful analysis of business fundamentals.';
    } else {
      return 'Low ROE suggests management challenges - proceed with caution.';
    }
  };

  const onSubmit = (values: FormValues) => {
    const roe = calculate(values);
    if (roe == null) { setResult(null); return; }
    setResult({ 
      roe, 
      interpretation: interpret(roe), 
      recommendation: recommendation(roe),
      efficiency: getEfficiency(roe),
      riskLevel: getRiskLevel(roe),
      insights: getInsights(roe),
      considerations: getConsiderations(roe)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Company Financials
          </CardTitle>
          <CardDescription>
            Enter the company's net income and shareholders' equity to calculate ROE
          </CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="netIncome" render={({ field }) => (
              <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Net Income ($)
                    </FormLabel>
                <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="e.g., 1000000" 
                        {...field} 
                        value={field.value ?? ''} 
                        onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                      />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
                
                <FormField control={form.control} name="shareholdersEquity" render={({ field }) => (
              <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Shareholders' Equity ($)
                    </FormLabel>
                <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="e.g., 5000000" 
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
                Calculate ROE
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
                  <CardTitle>Return on Equity Analysis</CardTitle>
                  <CardDescription>Management efficiency assessment and investment insights</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Percent className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">ROE</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {result.roe.toFixed(2)}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.efficiency}
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
                    {result.roe > 20 ? 'Strong' : result.roe > 15 ? 'Consider' : 'Caution'}
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
                  <a href="/category/finance/return-on-assets-calculator" className="text-primary hover:underline">
                    Return on Assets Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate ROA to evaluate asset utilization efficiency.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/earnings-per-share-calculator" className="text-primary hover:underline">
                    Earnings per Share Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate EPS to understand company profitability per share.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/debt-to-equity-ratio-calculator" className="text-primary hover:underline">
                    Debt-to-Equity Ratio Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate debt-to-equity ratio to assess financial leverage.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/return-on-investment-calculator" className="text-primary hover:underline">
                    ROI Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate ROI to assess investment returns and efficiency.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Return on Equity (ROE): Calculation, DuPont Analysis, and Profitability Metric" />
    <meta itemProp="description" content="An expert guide detailing the Return on Equity (ROE) formula, its core role as a profitability metric for shareholders, the mechanics of the DuPont Analysis (breaking ROE into profit, efficiency, and leverage), and its use in financial benchmarking." />
    <meta itemProp="keywords" content="return on equity formula explained, calculating ROE, du pont analysis explained, shareholder return metric, profitability ratio finance, equity vs debt financing impact on ROE" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-11-11" /> 
    <meta itemProp="url" content="/definitive-roe-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Return on Equity (ROE): Measuring Shareholder Profitability</h1>
    <p className="text-lg italic text-gray-700">Master the critical metric that reveals how effectively a company uses the capital invested by its shareholders to generate profits.</p>
    

[Image of Return on Equity calculation concept]


    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#definition" className="hover:underline">ROE: Definition and Core Significance</a></li>
        <li><a href="#formula" className="hover:underline">The ROE Formula and Calculation</a></li>
        <li><a href="#du-pont" className="hover:underline">DuPont Analysis: Deconstructing the Drivers of ROE</a></li>
        <li><a href="#leverage" className="hover:underline">The Impact of Financial Leverage on ROE</a></li>
        <li><a href="#applications" className="hover:underline">Interpretation and Benchmarking</a></li>
    </ul>
<hr />

    {/* ROE: DEFINITION AND CORE SIGNIFICANCE */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">ROE: Definition and Core Significance</h2>
    <p>The **Return on Equity (ROE)** is a vital financial performance measure that calculates the net income earned by a company as a percentage of the total shareholders' equity. It is the single most important profitability metric for common shareholders.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Shareholder Profitability Metric</h3>
    <p>ROE answers the question: "For every dollar of equity capital invested in the company, how much profit did the company generate?" It serves as a direct indicator of the efficiency and effectiveness of management in utilizing the capital base provided by the owners.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Importance of Context</h3>
    <p>A high ROE is generally desirable, but it must be viewed in context. It should be compared against the company's cost of equity (the return investors require) and the ROE of industry competitors. A company that generates an ROE below the required rate of return is functionally destroying shareholder value.</p>

<hr />

    {/* THE ROE FORMULA AND CALCULATION */}
    <h2 id="formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The ROE Formula and Calculation</h2>
    <p>ROE is calculated by dividing the company's Net Income by its Average Shareholders' Equity for the period.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Identity</h3>
    <p>The standard formula for Return on Equity is:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'ROE = Net Income / Average Shareholders\' Equity'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Averaging the Denominator</h3>
    <p>It is best practice to use the **Average Shareholders' Equity** (Equity at the start of the period plus Equity at the end of the period, divided by two). This mitigates potential distortions caused by large, one-time changes in equity (e.g., a major share buyback or new stock issuance) that occur mid-period.</p>

<hr />

    {/* DU PONT ANALYSIS: DECONSTRUCTING THE DRIVERS OF ROE */}
    <h2 id="du-pont" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">DuPont Analysis: Deconstructing the Drivers of ROE</h2>
    <p>The **DuPont Analysis** is a technique that breaks the ROE calculation into three fundamental components, allowing analysts to pinpoint the exact source of a company's profitability and management efficiency.</p>
    

    <h3 className="text-xl font-semibold text-foreground mt-6">The Three-Component Formula</h3>
    <p>The three components of ROE are Profitability, Asset Efficiency, and Financial Leverage:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'ROE = Net Profit Margin * Asset Turnover * Equity Multiplier'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Net Profit Margin (Profitability)</h3>
<p>Measures the <strong className="font-semibold">operating efficiency</strong>—how much net income is generated per dollar of sales. This is calculated as Net Income divided by Revenue.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">2. Asset Turnover (Asset Efficiency)</h3>
<p>Measures the <strong className="font-semibold">utilization of assets</strong>—how effectively the company generates revenue from its assets. This is calculated as Revenue divided by Average Total Assets.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">3. Equity Multiplier (Financial Leverage)</h3>
<p>Measures <strong className="font-semibold">financial risk</strong>—the extent to which assets are financed by debt versus equity. This is calculated as Average Total Assets divided by Average Shareholders' Equity.</p>
<p>The DuPont framework provides diagnostic power: a high ROE can be traced back to strong profit margins, rapid asset turnover, or simply high leverage.</p>

<hr />

    {/* THE IMPACT OF FINANCIAL LEVERAGE ON ROE */}
    <h2 id="leverage" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Impact of Financial Leverage on ROE</h2>
    <p>Financial leverage (debt) is the primary factor that causes the ROE to deviate from the Return on Assets (ROA). The Equity Multiplier quantifies this leverage effect.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">ROE vs. ROA</h3>
    <p>If a company has **no debt**, Assets equal Equity, the Equity Multiplier is $1.0$, and **ROE equals ROA** (Return on Assets). Any use of debt increases the Equity Multiplier, making the ROE potentially higher than the ROA.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Positive Leverage</h3>
    <p>If the return generated by the assets (ROA) is higher than the interest rate paid on the debt, the excess return accrues to the shareholders, resulting in **Positive Leverage** and an amplified ROE.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Risk of High Leverage</h3>
    <p>While leverage boosts ROE in good times, it is a double-edged sword. If profitability declines, the mandatory interest payments must still be met. High leverage amplifies losses, creating a low and volatile ROE, and severely increasing the risk of insolvency.</p>

<hr />

    {/* INTERPRETATION AND BENCHMARKING */}
    <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpretation and Benchmarking</h2>
    <p>ROE is the essential metric for investors to judge management and for companies to benchmark against competitors.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">ROE and Industry Context</h3>
    <p>What constitutes a "good" ROE is entirely dependent on the industry. Capital-intensive industries (e.g., utilities) or sectors with slow asset turnover naturally have lower average ROEs than capital-light, high-turnover sectors (e.g., software or branded retail).</p>
    <p>A sustainable ROE that consistently exceeds the average of its industry peers is a strong indicator of a company's competitive advantage and operational superiority.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">ROE vs. Cost of Equity</h3>
    <p>The ultimate test of management is whether the calculated ROE exceeds the investors' **Cost of Equity** (the return required by shareholders, often calculated via CAPM). If ROE is less than the Cost of Equity, the company is failing to meet shareholder expectations and is destroying value.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Return on Equity (ROE) is the definitive measure of profitability from the shareholder's perspective, calculating the net income generated relative to the equity capital invested.</p>
    <p>The **DuPont Analysis** provides the diagnostic power to deconstruct ROE into its three drivers—**Profit Margin**, **Asset Turnover**, and **Financial Leverage**—allowing investors to pinpoint whether high returns are sustainable and generated by operational excellence or inflated by excessive debt risk.</p>
</section>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about Return on Equity analysis and management efficiency
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is Return on Equity (ROE)?</h4>
              <p className="text-muted-foreground">
                ROE measures how efficiently a company uses shareholders' equity to generate profits. It's calculated as Net Income ÷ Shareholders' Equity × 100.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I calculate ROE?</h4>
              <p className="text-muted-foreground">
                ROE = (Net Income ÷ Shareholders' Equity) × 100. For example, if a company has $1 million in net income and $5 million in shareholders' equity, the ROE is 20%.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's a good ROE?</h4>
              <p className="text-muted-foreground">
                A good ROE typically ranges from 15-20% or higher. However, this varies by industry. Compare with industry peers and historical performance for better context.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What does a high ROE indicate?</h4>
              <p className="text-muted-foreground">
                High ROE indicates efficient management of shareholder capital, strong competitive advantages, or effective use of leverage. It suggests the company generates good returns on equity investments.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What does a low ROE indicate?</h4>
              <p className="text-muted-foreground">
                Low ROE may indicate inefficient management, poor capital allocation, competitive disadvantages, or operational challenges. It suggests the company isn't generating adequate returns on equity.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How does leverage affect ROE?</h4>
              <p className="text-muted-foreground">
                Higher leverage (debt) can increase ROE when the cost of debt is lower than the return on assets. However, excessive leverage increases financial risk and can lead to volatile ROE.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can ROE be negative?</h4>
              <p className="text-muted-foreground">
                Yes, ROE can be negative when a company has net losses. Negative ROE indicates the company is destroying shareholder value and may signal serious financial problems.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What are the limitations of ROE?</h4>
              <p className="text-muted-foreground">
                ROE can be manipulated through accounting practices, doesn't account for risk, and can be inflated by excessive leverage. It should be used alongside other financial metrics.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I compare ROE across companies?</h4>
              <p className="text-muted-foreground">
                Compare ROE within the same industry and similar business models. Consider company size, growth stage, and leverage levels when making comparisons.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between ROE and ROA?</h4>
              <p className="text-muted-foreground">
                ROE measures returns on shareholders' equity, while ROA measures returns on total assets. ROE includes the effect of leverage, while ROA shows pure operational efficiency.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}