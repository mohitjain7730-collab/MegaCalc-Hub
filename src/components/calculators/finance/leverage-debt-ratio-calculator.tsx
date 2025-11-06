'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, TrendingUp, Shield, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  totalDebt: z.number().nonnegative(),
  totalEquity: z.number().positive(),
  interestRate: z.number().nonnegative(),
  taxRate: z.number().min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

export default function LeverageDebtRatioImpactCalculator() {
  const [result, setResult] = useState<{ 
    debtToEquityRatio: number;
    debtToAssetsRatio: number;
    interpretation: string; 
    leverageLevel: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      totalDebt: undefined,
      totalEquity: undefined,
      interestRate: undefined,
      taxRate: undefined,
    },
  });

  const calculateLeverageRatios = (v: FormValues) => {
    if (v.totalDebt == null || v.totalEquity == null) return null;
    
    const debtToEquityRatio = v.totalDebt / v.totalEquity;
    const totalAssets = v.totalDebt + v.totalEquity;
    const debtToAssetsRatio = v.totalDebt / totalAssets;
    
    return { debtToEquityRatio, debtToAssetsRatio };
  };

  const interpret = (debtToEquityRatio: number, debtToAssetsRatio: number) => {
    if (debtToEquityRatio >= 2) return 'High leverage - significant debt burden with elevated financial risk.';
    if (debtToEquityRatio >= 1) return 'Moderate leverage - balanced debt structure with manageable risk.';
    if (debtToEquityRatio >= 0.5) return 'Low leverage - conservative debt structure with lower risk.';
    if (debtToEquityRatio >= 0) return 'Very low leverage - minimal debt with low financial risk.';
    return 'No debt - equity-only financing with minimal financial risk.';
  };

  const getLeverageLevel = (debtToEquityRatio: number) => {
    if (debtToEquityRatio >= 2) return 'High';
    if (debtToEquityRatio >= 1) return 'Moderate';
    if (debtToEquityRatio >= 0.5) return 'Low';
    if (debtToEquityRatio >= 0) return 'Very Low';
    return 'None';
  };

  const getRecommendation = (debtToEquityRatio: number) => {
    if (debtToEquityRatio >= 2) return 'Consider debt reduction strategies to improve financial stability.';
    if (debtToEquityRatio >= 1) return 'Monitor debt levels closely and maintain balanced approach.';
    if (debtToEquityRatio >= 0.5) return 'Consider strategic debt for growth opportunities.';
    if (debtToEquityRatio >= 0) return 'Evaluate opportunities for strategic leverage.';
    return 'Consider debt financing for growth and tax benefits.';
  };

  const getStrength = (debtToEquityRatio: number) => {
    if (debtToEquityRatio >= 2) return 'Weak';
    if (debtToEquityRatio >= 1) return 'Moderate';
    if (debtToEquityRatio >= 0.5) return 'Strong';
    if (debtToEquityRatio >= 0) return 'Very Strong';
    return 'Excellent';
  };

  const getInsights = (debtToEquityRatio: number, debtToAssetsRatio: number) => {
    const insights = [];
    if (debtToEquityRatio >= 2) {
      insights.push('High financial leverage');
      insights.push('Significant debt burden');
      insights.push('Elevated financial risk');
    } else if (debtToEquityRatio >= 1) {
      insights.push('Moderate financial leverage');
      insights.push('Balanced debt structure');
      insights.push('Manageable financial risk');
    } else if (debtToEquityRatio >= 0.5) {
      insights.push('Low financial leverage');
      insights.push('Conservative debt structure');
      insights.push('Lower financial risk');
    } else if (debtToEquityRatio >= 0) {
      insights.push('Very low financial leverage');
      insights.push('Minimal debt burden');
      insights.push('Low financial risk');
    } else {
      insights.push('No financial leverage');
      insights.push('Equity-only financing');
      insights.push('Minimal financial risk');
    }
    return insights;
  };

  const getConsiderations = (debtToEquityRatio: number) => {
    const considerations = [];
    considerations.push('Optimal leverage varies by industry');
    considerations.push('Debt provides tax benefits but increases risk');
    considerations.push('Consider interest rate environment');
    considerations.push('Monitor debt service capacity');
    considerations.push('Balance growth opportunities with financial stability');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const ratios = calculateLeverageRatios(values);
    if (ratios !== null) {
      setResult({
        debtToEquityRatio: ratios.debtToEquityRatio,
        debtToAssetsRatio: ratios.debtToAssetsRatio,
        interpretation: interpret(ratios.debtToEquityRatio, ratios.debtToAssetsRatio),
        leverageLevel: getLeverageLevel(ratios.debtToEquityRatio),
        recommendation: getRecommendation(ratios.debtToEquityRatio),
        strength: getStrength(ratios.debtToEquityRatio),
        insights: getInsights(ratios.debtToEquityRatio, ratios.debtToAssetsRatio),
        considerations: getConsiderations(ratios.debtToEquityRatio)
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <CardTitle>Leverage / Debt Ratio Impact Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate your company's leverage ratios to assess debt impact and financial risk
          </CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="totalDebt" render={({ field }) => (
              <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Total Debt ($)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter total debt" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="totalEquity" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Total Equity ($)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter total equity" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="interestRate" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Interest Rate (%)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter interest rate" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                <FormMessage />
              </FormItem>
            )} />
                <FormField control={form.control} name="taxRate" render={({ field }) => (
              <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Tax Rate (%)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter tax rate" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Leverage Ratios
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
                  <CardTitle>Leverage Ratios Result</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={result.leverageLevel === 'Low' ? 'default' : result.leverageLevel === 'Moderate' ? 'secondary' : 'destructive'}>
                    {result.leverageLevel}
                  </Badge>
                  <Badge variant="outline">{result.strength}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-3xl font-bold text-primary">
                      {result.debtToEquityRatio.toFixed(2)}
                    </div>
                    <p className="text-sm text-muted-foreground">Debt-to-Equity Ratio</p>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary">
                      {(result.debtToAssetsRatio * 100).toFixed(1)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Debt-to-Assets Ratio</p>
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
            Explore other essential financial metrics for comprehensive business analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/category/finance/wacc-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Calculator className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">WACC</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/interest-coverage-ratio-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Interest Coverage</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/current-ratio-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Current Ratio</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/debt-to-equity-ratio-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Debt-to-Equity</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Financial Leverage, Debt Ratios, and Solvency Analysis" />
    <meta itemProp="description" content="An expert guide detailing the calculation and impact of key debt ratios (Debt-to-Equity, Debt-to-Assets) on company risk, return on equity (ROE), the concept of positive and negative leverage, and its role in corporate capital structure decisions." />
    <meta itemProp="keywords" content="financial leverage calculator, debt ratio formula explained, debt to equity ratio interpretation, positive vs negative leverage, solvency risk analysis, return on equity leverage impact, corporate capital structure" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-11-06" /> 
    <meta itemProp="url" content="/definitive-leverage-debt-ratio-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Financial Leverage and Debt Ratios: Risk, Reward, and Capital Structure</h1>
    <p className="text-lg italic text-gray-700">Master the metrics that quantify a company's reliance on borrowed capital and its ability to magnify shareholder returns.</p>
    

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#definition" className="hover:underline">Financial Leverage: Definition and Impact</a></li>
        <li><a href="#debt-equity" className="hover:underline">Debt-to-Equity (D/E) Ratio Calculation</a></li>
        <li><a href="#debt-assets" className="hover:underline">Debt-to-Assets Ratio Calculation</a></li>
        <li><a href="#positive-negative" className="hover:underline">Positive vs. Negative Leverage</a></li>
        <li><a href="#roe-impact" className="hover:underline">Impact on Return on Equity (ROE)</a></li>
    </ul>
<hr />

    {/* FINANCIAL LEVERAGE: DEFINITION AND IMPACT */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Financial Leverage: Definition and Impact</h2>
    <p>Financial **Leverage** is the use of borrowed money (debt) to finance the purchase of assets. The goal of using leverage is to amplify the potential return on equity (ROE), magnifying the investor's gain when returns are positive, but also magnifying losses when returns are negative.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Concept of Risk Amplification</h3>
    <p>Leverage fundamentally increases the volatility of a company's earnings. A company with high financial leverage will experience wider fluctuations in its net income and ROE compared to an unleveraged company, even if both experience the same change in sales revenue. This risk is quantified through various **debt ratios**.</p>

<hr />

    {/* DEBT-TO-EQUITY (D/E) RATIO CALCULATION */}
    <h2 id="debt-equity" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Debt-to-Equity (D/E) Ratio Calculation</h2>
    <p>The **Debt-to-Equity (D/E) Ratio** is the most common leverage ratio. It compares the total funds provided by creditors (debt) to the total funds provided by owners (equity).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">D/E Ratio Formula</h3>
    <p>The D/E ratio measures how much of the company's capital structure is financed by debt relative to equity:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'D/E Ratio = Total Liabilities / Total Shareholders\' Equity'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Interpretation and Solvency</h3>
    <p>A D/E ratio of $1.0$ means the company is financed equally by debt and equity. A **high D/E ratio** (e.g., $2.5$) signals high financial risk, as the company has a smaller equity cushion to absorb losses before becoming insolvent. Lenders use this ratio to assess the margin of safety.</p>

<hr />

    {/* DEBT-TO-ASSETS RATIO CALCULATION */}
    <h2 id="debt-assets" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Debt-to-Assets Ratio Calculation</h2>
    <p>The **Debt-to-Assets Ratio** focuses on the percentage of a company’s total assets that are funded by debt. It is an alternative measure of solvency that shows the reliance on external funding.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Debt-to-Assets Formula</h3>
    <p>This ratio indicates the proportional claim creditors have on the firm's assets:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Debt-to-Assets Ratio = Total Liabilities / Total Assets'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Interpretation and Benchmarks</h3>
    <p>A ratio of $0.5$ (or $50\%$) means half of the company's assets were purchased with borrowed money. A **high ratio** (e.g., $0.7$ or $70\%$) suggests that the firm has little equity remaining in its assets, increasing the risk of default during an economic downturn. Generally, lower ratios are considered safer.</p>

<hr />

    {/* POSITIVE VS. NEGATIVE LEVERAGE */}
    <h2 id="positive-negative" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Positive vs. Negative Leverage</h2>
    <p>The financial impact of debt depends on the relationship between the **Return on Assets (ROA)** and the **Cost of Debt**.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Positive Leverage (Value Creation)</h3>
    <p>Positive leverage occurs when the **Return on Assets (ROA)** is **greater than the after-tax Cost of Debt**. The assets purchased with borrowed funds generate a return higher than the interest cost, and the excess profit accrues to the shareholders, amplifying the ROE.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Negative Leverage (Value Destruction)</h3>
    <p>Negative leverage occurs when the **ROA** is **less than the after-tax Cost of Debt**. The borrowed money is used to acquire assets that do not generate enough profit to cover the interest payments. The shortfall must be covered by shareholder equity, leading to a decrease in ROE.</p>

<hr />

    {/* IMPACT ON RETURN ON EQUITY (ROE) */}
    <h2 id="roe-impact" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Impact on Return on Equity (ROE)</h2>
    <p>The most direct measure of the effectiveness of leverage is its impact on the **Return on Equity (ROE)**, which is the final return generated for shareholders.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The DuPont Analysis Component</h3>
    <p>Leverage is explicitly incorporated into the <strong className="font-semibold">DuPont Analysis</strong> via the <strong className="font-semibold">Equity Multiplier</strong> (Total Assets divided by Total Equity), which is directly proportional to the D/E ratio. The full DuPont formula is:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'ROE = Net Profit Margin * Asset Turnover * Equity Multiplier'}
        </p>
    </div>
    <p>The Equity Multiplier shows how much the ROE is being amplified by the use of debt. A company with high leverage will have a high Equity Multiplier, meaning small changes in Net Profit Margin will result in large changes in ROE.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Financial leverage, quantified by the **Debt-to-Equity Ratio** and **Debt-to-Assets Ratio**, is the primary mechanism for amplifying shareholder returns but carries the corresponding risk of amplifying losses.</p>
    <p>Prudent financial management focuses on achieving **positive leverage**—ensuring the return generated by assets exceeds the cost of debt. By controlling debt ratios, companies balance risk and reward to maximize the **Return on Equity** without jeopardizing long-term solvency.</p>
</section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about Leverage Ratios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What are leverage ratios?</h4>
              <p className="text-muted-foreground">
                Leverage ratios measure the extent to which a company uses debt to finance its operations. Common ratios include Debt-to-Equity (Total Debt ÷ Total Equity) and Debt-to-Assets (Total Debt ÷ Total Assets). These ratios help assess financial risk, creditworthiness, and the company's ability to meet debt obligations.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate Debt-to-Equity ratio?</h4>
              <p className="text-muted-foreground">
                The Debt-to-Equity ratio is calculated as: Total Debt ÷ Total Equity. This ratio shows how much debt a company has relative to its equity. A ratio of 1.0 means equal amounts of debt and equity, while ratios above 1.0 indicate more debt than equity.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is considered a good Debt-to-Equity ratio?</h4>
              <p className="text-muted-foreground">
                Good Debt-to-Equity ratios vary by industry. Generally, ratios below 0.5 are considered low leverage, 0.5-1.0 are moderate, and above 1.0 are high leverage. Technology companies often have lower ratios, while capital-intensive industries may have higher acceptable ratios. Compare to industry averages.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does high leverage mean?</h4>
              <p className="text-muted-foreground">
                High leverage means a company has significant debt relative to its equity. This increases financial risk as the company must make regular debt payments regardless of performance. However, it can also amplify returns when the company performs well. High leverage requires careful risk management.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does low leverage mean?</h4>
              <p className="text-muted-foreground">
                Low leverage means a company has minimal debt relative to its equity. This indicates conservative financial management and lower financial risk. However, it may also mean the company is not taking advantage of debt's tax benefits and potential for higher returns through financial leverage.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do leverage ratios affect credit ratings?</h4>
              <p className="text-muted-foreground">
                Credit rating agencies use leverage ratios to assess a company's creditworthiness. Higher leverage ratios typically result in lower credit ratings and higher borrowing costs. Companies with low leverage ratios generally receive better credit ratings and can borrow at more favorable rates.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the benefits of debt financing?</h4>
              <p className="text-muted-foreground">
                Debt financing provides tax benefits (interest is tax-deductible), allows companies to retain ownership control, and can amplify returns when performance is good. It's often cheaper than equity financing and provides predictable payment schedules. However, it increases financial risk and requires regular payments.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the risks of high leverage?</h4>
              <p className="text-muted-foreground">
                High leverage increases financial risk, makes companies more vulnerable to economic downturns, and can lead to financial distress if cash flows decline. It reduces financial flexibility and may limit growth opportunities. Companies with high leverage must carefully manage cash flow and debt service requirements.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I optimize leverage ratios?</h4>
              <p className="text-muted-foreground">
                Optimize leverage ratios by balancing the benefits of debt (tax advantages, lower cost) with the risks (financial distress, reduced flexibility). Consider industry standards, business cycle, growth opportunities, and cash flow stability. Regular monitoring and adjustment help maintain optimal capital structure.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why are leverage ratios important for investors?</h4>
              <p className="text-muted-foreground">
                Leverage ratios help investors assess financial risk, evaluate creditworthiness, and understand the company's capital structure. They indicate how well a company can weather economic downturns and whether it's taking appropriate risks. Investors use these ratios to make informed investment decisions and assess potential returns.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}