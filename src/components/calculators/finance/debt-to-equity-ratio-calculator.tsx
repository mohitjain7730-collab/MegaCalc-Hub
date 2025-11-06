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
  totalDebt: z.number().nonnegative(),
  shareholdersEquity: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DebtToEquityRatioCalculator() {
  const [result, setResult] = useState<{ 
    debtToEquityRatio: number; 
    interpretation: string; 
    recommendation: string;
    leverage: string;
    riskLevel: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      totalDebt: undefined,
      shareholdersEquity: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.totalDebt == null || v.shareholdersEquity == null) return null;
    return v.totalDebt / v.shareholdersEquity;
  };

  const interpret = (ratio: number) => {
    if (ratio > 2) return 'High debt-to-equity ratio indicates significant financial leverage and higher risk.';
    if (ratio > 1) return 'Moderate debt-to-equity ratio suggests balanced use of debt and equity financing.';
    if (ratio > 0.5) return 'Low debt-to-equity ratio indicates conservative financial approach with lower risk.';
    return 'Very low debt-to-equity ratio suggests minimal leverage and conservative financial management.';
  };

  const getLeverage = (ratio: number) => {
    if (ratio > 2) return 'High Leverage';
    if (ratio > 1) return 'Moderate Leverage';
    if (ratio > 0.5) return 'Low Leverage';
    return 'Minimal Leverage';
  };

  const getRiskLevel = (ratio: number) => {
    if (ratio > 2) return 'Very High';
    if (ratio > 1) return 'High';
    if (ratio > 0.5) return 'Moderate';
    return 'Low';
  };

  const getInsights = (ratio: number) => {
    const insights = [];
    
    if (ratio > 2) {
      insights.push('High leverage increases financial risk and interest obligations');
      insights.push('May indicate aggressive growth strategy or financial stress');
    } else if (ratio > 1) {
      insights.push('Balanced use of debt and equity financing');
      insights.push('Moderate leverage provides growth opportunities while managing risk');
    } else if (ratio > 0.5) {
      insights.push('Conservative financial approach with lower risk');
      insights.push('May indicate strong cash position or conservative management');
    } else {
      insights.push('Very low leverage suggests minimal debt obligations');
      insights.push('May indicate strong financial position or missed growth opportunities');
    }

    if (ratio > 3) {
      insights.push('Extremely high leverage requires careful monitoring of debt obligations');
    }

    return insights;
  };

  const getConsiderations = (ratio: number) => {
    const considerations = [];
    
    considerations.push('Compare debt-to-equity ratio with industry peers and historical performance');
    considerations.push('Consider the company\'s business model and cash flow generation ability');
    considerations.push('Evaluate the cost of debt and interest coverage ratios');
    
    if (ratio > 2) {
      considerations.push('High leverage requires strong cash flow to service debt obligations');
      considerations.push('Monitor interest rates and debt refinancing risks');
    } else if (ratio < 0.5) {
      considerations.push('Low leverage may indicate conservative approach or missed growth opportunities');
      considerations.push('Consider if the company could benefit from strategic debt financing');
    }

    considerations.push('Monitor debt-to-equity trends over multiple periods');
    considerations.push('Consider the impact of debt on financial flexibility and growth potential');

    return considerations;
  };

  const recommendation = (ratio: number) => {
    if (ratio > 2) {
      return 'High leverage requires careful monitoring - ensure strong cash flow and debt service capability.';
    } else if (ratio > 1) {
      return 'Moderate leverage provides balanced risk-return profile - monitor debt service capacity.';
    } else if (ratio > 0.5) {
      return 'Low leverage indicates conservative approach - consider growth opportunities.';
    } else {
      return 'Very low leverage suggests conservative management - evaluate growth potential.';
    }
  };

  const onSubmit = (values: FormValues) => {
    const ratio = calculate(values);
    if (ratio == null) { setResult(null); return; }
    setResult({ 
      debtToEquityRatio: ratio, 
      interpretation: interpret(ratio), 
      recommendation: recommendation(ratio),
      leverage: getLeverage(ratio),
      riskLevel: getRiskLevel(ratio),
      insights: getInsights(ratio),
      considerations: getConsiderations(ratio)
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
            Enter the company's total debt and shareholders' equity to calculate the debt-to-equity ratio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="totalDebt" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Total Debt ($)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="e.g., 2000000" 
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
                Calculate Debt-to-Equity Ratio
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
                  <CardTitle>Debt-to-Equity Ratio Analysis</CardTitle>
                  <CardDescription>Financial leverage assessment and risk insights</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Percent className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Debt-to-Equity</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {result.debtToEquityRatio.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.leverage}
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
                    {result.debtToEquityRatio > 2 ? 'Monitor' : result.debtToEquityRatio > 1 ? 'Balanced' : 'Conservative'}
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
                  <a href="/category/finance/interest-coverage-ratio-calculator" className="text-primary hover:underline">
                    Interest Coverage Ratio Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate interest coverage ratio to assess debt service ability.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/current-ratio-calculator" className="text-primary hover:underline">
                    Current Ratio Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate current ratio to assess short-term liquidity.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/quick-ratio-calculator" className="text-primary hover:underline">
                    Quick Ratio Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate quick ratio to assess immediate liquidity position.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to the Debt-to-Equity Ratio: Calculation, Interpretation, and Financial Leverage" />
    <meta itemProp="description" content="An expert guide detailing the Debt-to-Equity (D/E) ratio formula, its role in measuring financial leverage, comparing industry benchmarks, and its impact on company risk, solvency, and equity vs. debt financing decisions." />
    <meta itemProp="keywords" content="debt to equity ratio formula, calculating D/E ratio, financial leverage analysis, solvency ratio interpretation, shareholder equity vs total debt, debt financing risk metric" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-debt-to-equity-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to the Debt-to-Equity Ratio: Measuring Financial Leverage and Risk</h1>
    <p className="text-lg italic text-muted-foreground">Master the critical metric that quantifies a company's financial structure by comparing reliance on debt financing versus shareholder funding.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#definition" className="hover:underline">D/E Ratio: Definition and Core Function</a></li>
        <li><a href="#calculation" className="hover:underline">The Debt-to-Equity Ratio Formula</a></li>
        <li><a href="#interpretation" className="hover:underline">Interpreting the Ratio: Leverage, Risk, and Solvency</a></li>
        <li><a href="#analysis" className="hover:underline">Financial Analysis: Industry Benchmarks and Trends</a></li>
        <li><a href="#components" className="hover:underline">Refining the Calculation: Total vs. Long-Term Debt</a></li>
    </ul>
<hr />

    {/* D/E RATIO: DEFINITION AND CORE FUNCTION */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">D/E Ratio: Definition and Core Function</h2>
    <p>The **Debt-to-Equity (D/E) Ratio** is a key financial solvency ratio used to evaluate a company's financial leverage. It measures the proportion of a company’s assets that are financed by debt (liabilities) versus the proportion financed by shareholder funds (equity).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Measuring Financial Leverage</h3>
    <p>The D/E ratio is the most direct measure of **financial leverage**. A higher ratio indicates that a company relies more heavily on borrowing to fund its operations and growth. While leverage can magnify returns (positive leverage), it also dramatically increases the company's financial risk.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Importance for Creditors and Investors</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Creditors:</strong> Use the D/E ratio to assess the company's risk of default. A high ratio signals higher bankruptcy risk because the company has a smaller equity buffer to absorb losses before creditors are affected.</li>
        <li><strong className="font-semibold">Investors:</strong> Use the ratio to assess the risk taken on by management. They prefer a balance where debt is used strategically but not excessively.</li>
    </ul>

<hr />

    {/* THE DEBT-TO-EQUITY RATIO FORMULA */}
    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Debt-to-Equity Ratio Formula</h2>
    <p>The D/E ratio is derived directly from the company's Balance Sheet, comparing Total Liabilities (debt) against Total Shareholders' Equity.</p>
    
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'Debt-to-Equity Ratio = Total Liabilities / Total Shareholders\' Equity'}
        </p>
    </div>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Defining the Components</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Total Liabilities:</strong> Includes both current liabilities (due within one year, e.g., accounts payable, short-term debt) and non-current liabilities (long-term debt, deferred taxes).</li>
        <li><strong className="font-semibold">Total Shareholders' Equity:</strong> Includes common stock, retained earnings, and additional paid-in capital. It represents the residual claim owners have on the company's assets.</li>
    </ul>

<hr />

    {/* INTERPRETING THE RATIO: LEVERAGE, RISK, AND SOLVENCY */}
    <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting the Ratio: Leverage, Risk, and Solvency</h2>
    <p>The ratio's interpretation is relative, but general guidelines exist for assessing the balance between debt and equity financing.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Ratio Interpretation</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">D/E = 1.0:</strong> Total debt equals total equity. This means creditors and shareholders have an equal claim on the company's assets.</li>
        <li><strong className="font-semibold">D/E &gt; 1.0 (High Leverage):</strong> The company relies more on debt than on equity. While risky, this can be efficient if the company's return on invested capital exceeds its cost of debt.</li>
        <li><strong className="font-semibold">D/E &lt; 1.0 (Low Leverage):</strong> The company relies more on equity. This is seen as financially conservative, indicating lower default risk, but may signal missed opportunities for growth financed by cheaper debt.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Magnification of Returns (Positive Leverage)</h3>
    <p>If the return a company earns on its assets is higher than the interest rate it pays on its debt, the excess return accrues entirely to shareholders. This is known as **Positive Leverage**. A slightly higher D/E ratio is often desirable in stable industries where cash flows are predictable and the cost of debt is low.</p>

<hr />

    {/* FINANCIAL ANALYSIS: INDUSTRY BENCHMARKS AND TRENDS */}
    <h2 id="analysis" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Financial Analysis: Industry Benchmarks and Trends</h2>
    <p>The D/E ratio is only meaningful when compared against industry peers, as different economic sectors have different optimal capital structures.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Industry Variations</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Capital-Intensive Industries (e.g., Utilities, Telecom):</strong> Often have high D/E ratios (2.0 or higher). These companies have predictable cash flows, high tangible assets (collateral), and low growth, making debt financing safe and efficient.</li>
        <li><strong className="font-semibold">Technology and Services (e.g., Software, Consulting):</strong> Typically have low D/E ratios (often below 0.5). These companies have fewer tangible assets, high growth potential, and volatile cash flows, making excessive debt financing highly risky.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Analyzing Trends</h3>
    <p>Analysts pay close attention to the **trend** in the D/E ratio. A ratio that is consistently rising over several periods suggests that management is taking on increasing amounts of debt, potentially signaling over-optimism or financial strain. A stable ratio, even if high, suggests a consistent capital structure aligned with industry norms.</p>

<hr />

    {/* REFINING THE CALCULATION: TOTAL VS. LONG-TERM DEBT */}
    <h2 id="components" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Refining the Calculation: Total vs. Long-Term Debt</h2>
    <p>While the standard formula uses Total Liabilities, some analysts use refinements to focus on the long-term strategic debt that drives major investment decisions.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Adjusting the Debt Component</h3>
    <p>Some analysts prefer to calculate the D/E ratio using only **Interest-Bearing Debt** (bank loans, bonds, capital leases). This excludes operational liabilities like accounts payable and deferred taxes, providing a cleaner view of management's financing decisions regarding long-term capital structure.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Tangible Net Worth Adjustment</h3>
    <p>When assessing a company heavily reliant on intangible assets, analysts sometimes use **Tangible Net Worth** (Total Equity minus Intangible Assets like goodwill) in the denominator. This conservative approach provides creditors with a clearer picture of the collateral available to them if the company were to liquidate.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The Debt-to-Equity Ratio is the indispensable metric for quantifying a company's **financial leverage** and solvency. It directly compares the financing provided by creditors (Total Debt) to that provided by owners (Shareholders' Equity).</p>
    <p>A high D/E ratio signals aggressive growth or higher financial risk, while a low ratio suggests a more conservative structure. Ultimate interpretation requires comparing the ratio against industry benchmarks to determine if the company is using debt efficiently to maximize returns without jeopardizing its ability to meet its financial obligations.</p>
</section>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about Debt-to-Equity Ratio analysis and financial leverage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is the Debt-to-Equity Ratio?</h4>
              <p className="text-muted-foreground">
                The debt-to-equity ratio measures the relative proportion of debt and equity used to finance a company's assets. It's calculated as Total Debt ÷ Shareholders' Equity.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I calculate the debt-to-equity ratio?</h4>
              <p className="text-muted-foreground">
                Debt-to-Equity Ratio = Total Debt ÷ Shareholders' Equity. For example, if a company has $2 million in debt and $5 million in equity, the ratio is 0.4.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's a good debt-to-equity ratio?</h4>
              <p className="text-muted-foreground">
                A good debt-to-equity ratio depends on the industry and business model. Generally, ratios below 1.0 are considered conservative, while ratios above 2.0 may indicate high leverage.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What does a high debt-to-equity ratio indicate?</h4>
              <p className="text-muted-foreground">
                High debt-to-equity ratio indicates significant financial leverage, higher risk, and greater dependence on debt financing. It may suggest aggressive growth strategy or financial stress.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What does a low debt-to-equity ratio indicate?</h4>
              <p className="text-muted-foreground">
                Low debt-to-equity ratio indicates conservative financial management, lower risk, and less dependence on debt financing. It may suggest strong cash position or missed growth opportunities.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can the debt-to-equity ratio be negative?</h4>
              <p className="text-muted-foreground">
                Yes, the debt-to-equity ratio can be negative when shareholders' equity is negative (deficit). This indicates severe financial distress and potential bankruptcy risk.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How does leverage affect the debt-to-equity ratio?</h4>
              <p className="text-muted-foreground">
                Higher leverage increases the debt-to-equity ratio, which can amplify returns but also increases financial risk. The ratio helps assess the level of financial leverage a company uses.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What are the limitations of the debt-to-equity ratio?</h4>
              <p className="text-muted-foreground">
                The ratio doesn't account for the quality of debt, interest rates, or cash flow generation. It should be used alongside other financial metrics like interest coverage ratio.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I compare debt-to-equity ratios across companies?</h4>
              <p className="text-muted-foreground">
                Compare ratios within the same industry and similar business models. Consider company size, growth stage, and business model differences when making comparisons.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between debt-to-equity and debt-to-assets ratio?</h4>
              <p className="text-muted-foreground">
                Debt-to-equity compares debt to shareholders' equity, while debt-to-assets compares debt to total assets. Both measure leverage but from different perspectives.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}