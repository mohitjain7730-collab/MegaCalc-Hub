
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

const formSchema = z.object({
  ebit: z.number(),
  interestExpense: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function InterestCoverageRatioCalculator() {
  const [result, setResult] = useState<{ 
    ratio: number; 
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
      ebit: undefined,
      interestExpense: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.ebit == null || v.interestExpense == null) return null;
    return v.ebit / v.interestExpense;
  };

  const interpret = (ratio: number) => {
    if (ratio >= 5) return 'Excellent debt servicing capability with strong financial health.';
    if (ratio >= 2.5) return 'Good ability to cover interest payments with comfortable margin.';
    if (ratio >= 1.5) return 'Adequate coverage but monitor debt levels closely.';
    if (ratio >= 1) return 'Barely sufficient coverage - high risk of default.';
    return 'Insufficient coverage - immediate financial distress risk.';
  };

  const getRiskLevel = (ratio: number) => {
    if (ratio >= 5) return 'Very Low';
    if (ratio >= 2.5) return 'Low';
    if (ratio >= 1.5) return 'Moderate';
    if (ratio >= 1) return 'High';
    return 'Very High';
  };

  const getRecommendation = (ratio: number) => {
    if (ratio >= 5) return 'Maintain current debt structure and consider strategic investments.';
    if (ratio >= 2.5) return 'Continue monitoring and consider debt reduction strategies.';
    if (ratio >= 1.5) return 'Focus on improving profitability and reducing debt burden.';
    if (ratio >= 1) return 'Urgent need to restructure debt and improve cash flow.';
    return 'Critical situation - immediate debt restructuring required.';
  };

  const getStrength = (ratio: number) => {
    if (ratio >= 5) return 'Very Strong';
    if (ratio >= 2.5) return 'Strong';
    if (ratio >= 1.5) return 'Moderate';
    if (ratio >= 1) return 'Weak';
    return 'Very Weak';
  };

  const getInsights = (ratio: number) => {
    const insights = [];
    if (ratio >= 5) {
      insights.push('Company has exceptional financial flexibility');
      insights.push('Low risk of financial distress');
      insights.push('Strong position for growth investments');
    } else if (ratio >= 2.5) {
      insights.push('Healthy debt servicing capacity');
      insights.push('Good financial stability');
      insights.push('Room for strategic debt if needed');
    } else if (ratio >= 1.5) {
      insights.push('Adequate but not optimal coverage');
      insights.push('Monitor cash flow trends closely');
      insights.push('Consider debt reduction strategies');
    } else if (ratio >= 1) {
      insights.push('Marginal debt servicing ability');
      insights.push('High sensitivity to earnings volatility');
      insights.push('Urgent need for financial restructuring');
    } else {
      insights.push('Insufficient earnings to cover interest');
      insights.push('Immediate default risk');
      insights.push('Critical financial distress situation');
    }
    return insights;
  };

  const getConsiderations = (ratio: number) => {
    const considerations = [];
    considerations.push('Industry benchmarks vary significantly');
    considerations.push('Seasonal businesses may have fluctuating ratios');
    considerations.push('One-time charges can distort the ratio');
    considerations.push('Compare with historical performance');
    considerations.push('Consider cash flow timing differences');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const ratio = calculate(values);
    if (ratio !== null) {
      setResult({
        ratio,
        interpretation: interpret(ratio),
        riskLevel: getRiskLevel(ratio),
        recommendation: getRecommendation(ratio),
        strength: getStrength(ratio),
        insights: getInsights(ratio),
        considerations: getConsiderations(ratio)
      });
    }
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Financial Parameters
          </CardTitle>
          <CardDescription>
            Enter your company's financial data to calculate the Interest Coverage Ratio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField 
                  control={form.control} 
                  name="ebit" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        EBIT ($)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="e.g., 500000" 
                          {...field} 
                          value={field.value ?? ''} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
                <FormField 
                  control={form.control} 
                  name="interestExpense" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Interest Expense ($)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="e.g., 50000" 
                          {...field} 
                          value={field.value ?? ''} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Interest Coverage Ratio
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Main Result Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Landmark className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Interest Coverage Ratio</CardTitle>
                  <CardDescription>Debt Servicing Capability Analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{result.ratio.toFixed(2)}x</p>
                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Risk Level</p>
                  <Badge variant={result.riskLevel === 'Very Low' ? 'default' : result.riskLevel === 'Low' ? 'secondary' : result.riskLevel === 'Moderate' ? 'outline' : 'destructive'}>
                    {result.riskLevel}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Financial Strength</p>
                  <Badge variant={result.strength === 'Very Strong' ? 'default' : result.strength === 'Strong' ? 'secondary' : result.strength === 'Moderate' ? 'outline' : 'destructive'}>
                    {result.strength}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Coverage Multiple</p>
                  <p className="text-lg font-bold">{result.ratio.toFixed(1)}x</p>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Recommendation:</strong> {result.recommendation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Insights Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-green-600">Strengths & Opportunities</h4>
                  <ul className="space-y-1 text-sm">
                    {result.insights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-orange-600">Important Considerations</h4>
                  <ul className="space-y-1 text-sm">
                    {result.considerations.map((consideration, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span>{consideration}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>
            Explore other financial ratios and analysis tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/debt-to-equity-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Debt-to-Equity Ratio</p>
                      <p className="text-sm text-muted-foreground">Capital structure analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/current-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Current Ratio</p>
                      <p className="text-sm text-muted-foreground">Short-term liquidity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/quick-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Quick Ratio</p>
                      <p className="text-sm text-muted-foreground">Acid-test liquidity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/working-capital-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Working Capital</p>
                      <p className="text-sm text-muted-foreground">Operational liquidity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/return-on-equity-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Return on Equity</p>
                      <p className="text-sm text-muted-foreground">Profitability analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/ebitda-ebit-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">EBITDA Calculator</p>
                      <p className="text-sm text-muted-foreground">Earnings analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide Section */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to the Interest Coverage Ratio (ICR): Calculation, Interpretation, and Solvency Analysis" />
    <meta itemProp="description" content="An expert guide detailing the Interest Coverage Ratio (ICR) formula, its role in assessing a company's solvency and debt-servicing capacity, interpreting safe thresholds, and analyzing its impact on creditworthiness and lending decisions." />
    <meta itemProp="keywords" content="interest coverage ratio formula, calculating ICR, EBIT vs EBITDA in ICR, debt servicing capacity ratio, solvency ratio interpretation, credit risk analysis corporate finance, times interest earned ratio" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-interest-coverage-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to the Interest Coverage Ratio (ICR): Measuring Debt-Servicing Capacity</h1>
    <p className="text-lg italic text-muted-foreground">Master the critical solvency metric that quantifies a company's ability to cover its debt payments using its operating profits.</p>
    

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#definition" className="hover:underline">ICR: Definition and Core Purpose</a></li>
        <li><a href="#calculation" className="hover:underline">The Interest Coverage Ratio Formula</a></li>
        <li><a href="#interpretation" className="hover:underline">Interpreting the Ratio and Safe Thresholds</a></li>
        <li><a href="#ebit-vs-ebitda" className="hover:underline">EBIT vs. EBITDA in the Numerator</a></li>
        <li><a href="#applications" className="hover:underline">Role in Credit Analysis and Lending Decisions</a></li>
    </ul>
<hr />

    {/* ICR: DEFINITION AND CORE PURPOSE */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">ICR: Definition and Core Purpose</h2>
    <p>The **Interest Coverage Ratio (ICR)**, often called the **Times Interest Earned (TIE) Ratio**, is a critical financial solvency metric. It measures a company's ability to meet its interest obligations using its current operating profit.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">A Measure of Solvency</h3>
    <p>The ICR is used by investors and creditors (lenders) to assess a firm's **short-term and medium-term financial health**. It quantifies the margin of safety the company has before defaulting on its debt payments. A low ratio indicates that the company's profitability is barely sufficient to cover its financing costs, making it highly vulnerable to a downturn in revenue.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Operational Profit Focus</h3>
    <p>The key to the ICR is that it isolates the profit generated directly from core **operations** (the numerator) and compares it to the financial obligation (the denominator). This separation ensures the profit used to cover interest is sustainable and not derived from non-recurring activities or asset sales.</p>

<hr />

    {/* THE INTEREST COVERAGE RATIO FORMULA */}
    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Interest Coverage Ratio Formula</h2>
    <p>The ICR is a ratio of a company's earnings before interest and taxes (EBIT) to its interest expense for a specific period (usually 12 months).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Standard Formula</h3>
    <p>The most common and most conservative version uses Earnings Before Interest and Taxes (EBIT) in the numerator:</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'ICR = EBIT / Interest Expense'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Defining the Components</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">EBIT (Earnings Before Interest and Taxes):</strong> The company's operating profit, found on the Income Statement. It represents the income generated from core business activities before any financing decisions or tax obligations are considered.</li>
        <li><strong className="font-semibold">Interest Expense:</strong> The total cost of debt, including interest paid on bonds, loans, and other financial obligations. This is the liability the ICR must cover.</li>
    </ul>

<hr />

    {/* INTERPRETING THE RATIO AND SAFE THRESHOLDS */}
    <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting the Ratio and Safe Thresholds</h2>
    <p>The ICR is expressed as a number of times (e.g., 5x). An ICR of 5 means the company's operating profit is five times greater than its annual interest obligation.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Interpretation Guidelines</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">ICR = 1.0:</strong> Operating profit exactly equals interest expense. The company has zero margin of safety; any slight decrease in revenue will lead to an inability to pay interest. This level is highly risky.</li>
        <li><strong className="font-semibold">ICR &lt; 1.0 (Critical):</strong> The company is operating at a loss before accounting for interest, meaning it cannot cover its interest payments with its operating earnings. This signals a high risk of default or bankruptcy.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Industry Thresholds (Safe Range)</h3>
    <p>The acceptable threshold for the ICR varies significantly by industry. Stable industries with predictable cash flows (e.g., utilities) can safely operate with a lower ICR than cyclical, high-growth industries (e.g., technology, manufacturing).</p>
    <p>As a general benchmark, lenders typically prefer an ICR of **2.5 or higher**. Ratios of **4.0 or higher** are generally considered excellent, indicating strong solvency and easy access to new credit.</p>

<hr />

    {/* EBIT VS. EBITDA IN THE NUMERATOR */}
    <h2 id="ebit-vs-ebitda" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">EBIT vs. EBITDA in the Numerator</h2>
    <p>While EBIT is the technically correct profit measure for the ICR, analysts sometimes use EBITDA (Earnings Before Interest, Taxes, Depreciation, and Amortization) to gauge the company's immediate cash-generating capability.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">ICR using EBITDA</h3>
    <p>The ratio calculated using EBITDA is often significantly higher than the EBIT-based ICR, particularly for capital-intensive companies with high depreciation expenses. This calculation (EBITDA divided by Interest Expense) provides a looser, but important, measure of the ability to pay interest before accounting for major non-cash expenses like depreciation.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Conservative Choice (EBIT)</h3>
    <p>Using **EBIT** is the more conservative and preferred method because depreciation and amortization are recurring, necessary costs of maintaining the business's asset base. While non-cash, they signal a future need for capital expenditure (CapEx). A company should ideally cover its interest payments even after these recurring expenses are considered.</p>

<hr />

    {/* ROLE IN CREDIT ANALYSIS AND LENDING DECISIONS */}
    <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Role in Credit Analysis and Lending Decisions</h2>
    <p>The ICR is a mandatory input in credit agreements and covenant analysis, directly influencing the cost and availability of debt financing.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Covenant Compliance</h3>
    <p>Lenders frequently include a minimum ICR threshold (e.g., must maintain ICR &gt; 3.0) in loan agreements (covenants). If the company breaches this covenant, the lender has the right to demand immediate repayment of the principal or impose punitive measures, as the company's debt-servicing risk has increased.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Investment Risk Assessment</h3>
    <p>Investors use the ICR, along with the Debt-to-Equity Ratio, to evaluate the total financial risk of a company's capital structure. A company with high debt but a consistently high ICR (e.g., 10x) is generally safer than a company with low debt but a low ICR (e.g., 2.0x), because the high ICR proves the debt is easily manageable by current operations.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The Interest Coverage Ratio (ICR) is the definitive measure of a firm’s **debt-servicing capacity**, calculated as the ratio of its operating profit (EBIT) to its interest expense. The resulting figure quantifies the margin of safety available to creditors.</p>
    <p>A benchmark ICR of **2.5 or higher** is generally considered safe, indicating robust solvency. Analyzing the ICR is crucial for lenders to enforce covenants and for investors to gauge financial risk, ensuring the company's core operations generate more than enough profit to meet all financial obligations.</p>
</section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about Interest Coverage Ratio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is the Interest Coverage Ratio?</h4>
              <p className="text-muted-foreground">
                The Interest Coverage Ratio is a financial metric that measures a company's ability to pay interest on its outstanding debt. It's calculated by dividing earnings before interest and taxes (EBIT) by interest expense. This ratio indicates how many times a company can cover its interest payments with its current earnings.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is considered a good Interest Coverage Ratio?</h4>
              <p className="text-muted-foreground">
                Generally, a ratio of 2.5 or higher is considered good, indicating the company can comfortably cover its interest payments. A ratio of 5 or higher is excellent, showing strong financial health. Ratios below 1.5 may indicate potential financial distress, while ratios below 1 suggest the company cannot cover its interest payments from current earnings.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate the Interest Coverage Ratio?</h4>
              <p className="text-muted-foreground">
                The formula is: Interest Coverage Ratio = EBIT ÷ Interest Expense. EBIT (Earnings Before Interest and Taxes) is found on the income statement and represents operating profit. Interest Expense is also on the income statement and represents the cost of debt for the period.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Do Interest Coverage Ratios vary by industry?</h4>
              <p className="text-muted-foreground">
                Yes, acceptable ratios vary significantly by industry. Capital-intensive industries like utilities or telecommunications may have lower acceptable ratios due to stable cash flows. Technology companies might have higher ratios due to less debt reliance. Always compare ratios within the same industry for meaningful analysis.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of the Interest Coverage Ratio?</h4>
              <p className="text-muted-foreground">
                The ratio doesn't account for principal payments, only interest. It's based on historical data and may not reflect future performance. One-time charges can distort EBIT. It doesn't consider cash flow timing or the quality of earnings. Seasonal businesses may have fluctuating ratios throughout the year.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How can a company improve its Interest Coverage Ratio?</h4>
              <p className="text-muted-foreground">
                Companies can improve the ratio by increasing EBIT through revenue growth, cost reduction, or operational efficiency. They can also reduce interest expense by refinancing debt at lower rates, paying down debt, or restructuring debt terms. However, these strategies should be balanced with growth objectives and capital structure optimization.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What if EBIT is negative?</h4>
              <p className="text-muted-foreground">
                If EBIT is negative, the Interest Coverage Ratio will also be negative, indicating the company cannot cover its interest payments from current operations. This is a serious financial distress signal. The company would need to rely on cash reserves, asset sales, or additional financing to meet interest obligations.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How should I compare Interest Coverage Ratios between companies?</h4>
              <p className="text-muted-foreground">
                Compare companies within the same industry and similar business models. Consider company size, growth stage, and capital structure. Look at historical trends rather than single data points. Also consider other financial ratios and qualitative factors for a complete picture of financial health.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is the Interest Coverage Ratio important for investors?</h4>
              <p className="text-muted-foreground">
                For investors, this ratio indicates the company's financial stability and ability to meet debt obligations. A strong ratio suggests lower bankruptcy risk and more predictable cash flows. It also indicates whether the company has financial flexibility for growth investments or dividend payments.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do creditors use the Interest Coverage Ratio?</h4>
              <p className="text-muted-foreground">
                Creditors use this ratio to assess credit risk and determine loan terms. Higher ratios may result in better interest rates and loan conditions. Creditors typically require minimum ratios in loan covenants to ensure borrowers maintain adequate debt servicing capability throughout the loan term.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
