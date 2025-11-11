'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, TrendingUp, Shield, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  marketCap: z.number().positive(),
  totalDebt: z.number().nonnegative(),
  cash: z.number().nonnegative(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EnterpriseValueCalculator() {
  const [result, setResult] = useState<{ 
    enterpriseValue: number; 
    interpretation: string; 
    valuationLevel: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      marketCap: undefined,
      totalDebt: undefined,
      cash: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.marketCap == null || v.totalDebt == null || v.cash == null) return null;
    return v.marketCap + v.totalDebt - v.cash;
  };

  const interpret = (ev: number, marketCap: number) => {
    const ratio = ev / marketCap;
    if (ratio >= 1.5) return 'High enterprise value relative to market cap - significant debt or low cash position.';
    if (ratio >= 1.2) return 'Moderate enterprise value with balanced capital structure.';
    if (ratio >= 0.8) return 'Low enterprise value relative to market cap - strong cash position or low debt.';
    return 'Very low enterprise value - excellent financial position with high cash and low debt.';
  };

  const getValuationLevel = (ev: number, marketCap: number) => {
    const ratio = ev / marketCap;
    if (ratio >= 1.5) return 'High';
    if (ratio >= 1.2) return 'Moderate';
    if (ratio >= 0.8) return 'Low';
    return 'Very Low';
  };

  const getRecommendation = (ev: number, marketCap: number) => {
    const ratio = ev / marketCap;
    if (ratio >= 1.5) return 'Consider debt reduction strategies and cash optimization.';
    if (ratio >= 1.2) return 'Maintain balanced capital structure and monitor debt levels.';
    if (ratio >= 0.8) return 'Consider strategic investments or debt optimization opportunities.';
    return 'Excellent financial position - consider growth investments or shareholder returns.';
  };

  const getStrength = (ev: number, marketCap: number) => {
    const ratio = ev / marketCap;
    if (ratio >= 1.5) return 'Weak';
    if (ratio >= 1.2) return 'Moderate';
    if (ratio >= 0.8) return 'Strong';
    return 'Very Strong';
  };

  const getInsights = (ev: number, marketCap: number) => {
    const insights = [];
    const ratio = ev / marketCap;
    if (ratio >= 1.5) {
      insights.push('High debt burden relative to equity value');
      insights.push('Limited financial flexibility');
      insights.push('Potential credit risk concerns');
    } else if (ratio >= 1.2) {
      insights.push('Balanced capital structure');
      insights.push('Moderate financial flexibility');
      insights.push('Manageable debt levels');
    } else if (ratio >= 0.8) {
      insights.push('Strong cash position');
      insights.push('Good financial flexibility');
      insights.push('Conservative capital structure');
    } else {
      insights.push('Exceptional cash position');
      insights.push('Excellent financial flexibility');
      insights.push('Very conservative capital structure');
    }
    return insights;
  };

  const getConsiderations = (ev: number) => {
    const considerations = [];
    considerations.push('Industry benchmarks vary significantly');
    considerations.push('Growth companies may have higher EV ratios');
    considerations.push('Mature companies typically have lower EV ratios');
    considerations.push('Compare with historical performance');
    considerations.push('Consider market conditions and interest rates');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const ev = calculate(values);
    if (ev !== null) {
      setResult({
        enterpriseValue: ev,
        interpretation: interpret(ev, values.marketCap),
        valuationLevel: getValuationLevel(ev, values.marketCap),
        recommendation: getRecommendation(ev, values.marketCap),
        strength: getStrength(ev, values.marketCap),
        insights: getInsights(ev, values.marketCap),
        considerations: getConsiderations(ev)
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <CardTitle>Enterprise Value Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate your company's enterprise value to assess total business valuation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="marketCap" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Market Capitalization
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter market cap" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="totalDebt" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Total Debt
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter total debt" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="cash" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Cash & Cash Equivalents
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter cash position" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Enterprise Value
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
                  <CardTitle>Enterprise Value Result</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={result.valuationLevel === 'Very Low' ? 'default' : result.valuationLevel === 'Low' ? 'secondary' : 'destructive'}>
                    {result.valuationLevel}
                  </Badge>
                  <Badge variant="outline">{result.strength}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold text-primary">
                  ${result.enterpriseValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
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
            <Link href="/category/finance/ev-ebit-ebitda-multiple-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Calculator className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">EV Multiples</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/free-cash-flow-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Free Cash Flow</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/ebitda-ebit-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">EBITDA/EBIT</p>
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
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Enterprise Value (EV): Calculation, Interpretation, and Valuation Metric" />
    <meta itemProp="description" content="An expert guide detailing the Enterprise Value (EV) formula, its core role as the true cost of acquiring a company, how to calculate Net Debt, and its use in valuation multiples (EV/EBITDA) and mergers & acquisitions (M&A) analysis." />
    <meta itemProp="keywords" content="enterprise value formula explained, calculating EV, market capitalization vs EV, net debt calculation, EV to EBITDA multiple, acquisition cost metric, total value of the firm" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-11-12" /> 
    <meta itemProp="url" content="/definitive-enterprise-value-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Enterprise Value (EV): The True Cost of Acquiring a Company</h1>
    <p className="text-lg italic text-gray-700">Master the comprehensive valuation metric that quantifies the total price required to purchase all operating assets of a business.</p>
    

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#definition" className="hover:underline">EV: Definition and Core Significance</a></li>
        <li><a href="#formula" className="hover:underline">The Enterprise Value Formula and Components</a></li>
        <li><a href="#net-debt" className="hover:underline">Calculating Net Debt and Non-Operating Assets</a></li>
        <li><a href="#vs-mcap" className="hover:underline">EV vs. Market Capitalization: The Key Difference</a></li>
        <li><a href="#multiples" className="hover:underline">Application in Valuation Multiples (EV/EBITDA)</a></li>
    </ul>
<hr />

    {/* EV: DEFINITION AND CORE SIGNIFICANCE */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">EV: Definition and Core Significance</h2>
    <p>The **Enterprise Value (EV)** is a comprehensive measure of a company’s total value, often used as the theoretical takeover price in a merger or acquisition (M&A). It represents the market value of a company’s operating assets, attributable to both its equity and debt holders.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Acquisition Cost Metric</h3>
    <p>EV provides a truer economic value than Market Capitalization (Market Cap) because it accounts for the crucial financial reality that a buyer must assume the company’s debt but also immediately gains its cash reserves. EV is essentially the "sticker price" plus the net debt burden.</p>

<hr />

    {/* THE ENTERPRISE VALUE FORMULA AND COMPONENTS */}
    <h2 id="formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Enterprise Value Formula and Components</h2>
    <p>The core formula for Enterprise Value starts with the value of the equity (Market Cap) and adjusts for the claims of non-equity holders (debt) and the presence of excess cash.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Identity</h3>
    <p>The standard formula for Enterprise Value is:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'EV = Market Capitalization + Total Debt - Cash & Cash Equivalents'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Rationale for Components</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Add Debt:</strong> Debt holders (creditors) have a claim on the company's assets. When a firm is acquired, the acquirer assumes this liability, so the debt must be added to the price.</li>
        <li><strong className="font-semibold">Subtract Cash:</strong> Cash is a non-operating asset. Upon acquisition, the buyer immediately gains control of the cash, which can be used to pay down the acquired debt. Therefore, cash reduces the net cost of the acquisition.</li>
    </ul>

<hr />

    {/* CALCULATING NET DEBT AND NON-OPERATING ASSETS */}
    <h2 id="net-debt" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculating Net Debt and Non-Operating Assets</h2>
    <p>For more rigorous analysis, the EV calculation is often simplified by using the **Net Debt** figure and including other non-operating balance sheet items.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Net Debt Calculation</h3>
    <p>**Net Debt** is the total debt (short-term and long-term interest-bearing liabilities) minus the total cash and cash equivalents. This single figure represents the amount of debt the buyer would effectively have to fund if they used the company's cash immediately to pay down the acquired debt.</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Net Debt = Total Debt - Cash'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Refined EV Formula</h3>
    <p>Using Net Debt, the formula simplifies to:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'EV = Market Capitalization + Net Debt'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Other Non-Operating Adjustments</h3>
    <p>For large transactions, the EV formula may include other adjustments for non-operating items found on the balance sheet:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li>**Add:** Minority Interest (the value of subsidiaries not fully owned by the parent company).</li>
        <li>**Add:** Capitalized Operating Leases (treating lease obligations as debt).</li>
        <li>**Subtract:** Value of Non-Controlling Interest (NCI).</li>
    </ul>

<hr />

    {/* EV VS. MARKET CAPITALIZATION: THE KEY DIFFERENCE */}
    <h2 id="vs-mcap" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">EV vs. Market Capitalization: The Key Difference</h2>
    <p>Market Capitalization (Mcap) is the value of a company’s equity, whereas EV is the value of the firm's overall operations.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Market Capitalization (Equity Value)</h3>
    <p>Mcap is calculated as: Share Price multiplied by Total Shares Outstanding. It represents the total amount investors paid for the stock and is used to measure the size of the publicly traded equity.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Difference in Scope</h3>
    <p>EV is a better comparison metric for valuation because it is independent of the capital structure. If Company A and Company B have the same Market Cap but Company A has significantly more debt, Company A's EV will be much higher, reflecting the true, higher cost to acquire Company A's operational assets.</p>

<hr />

    {/* APPLICATION IN VALUATION MULTIPLES (EV/EBITDA) */}
    <h2 id="multiples" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Application in Valuation Multiples (EV/EBITDA)</h2>
    <p>Enterprise Value is the preferred numerator for most valuation multiples because it matches the value of the firm's operations against the profitability generated by those operations (which is before debt/interest expenses).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">EV/EBITDA Ratio</h3>
    <p>The **EV/EBITDA** ratio is the most commonly used valuation multiple in finance. It is preferred over the P/E ratio for benchmarking because:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li>**EV (Numerator):** Includes debt, reflecting the full acquisition cost.</li>
        <li>**EBITDA (Denominator):** Excludes interest, taxes, and D\&A, reflecting cash flow available to all capital providers.</li>
    </ul>
    <p>By matching EV (value to all providers of capital) with EBITDA (profitability available to all providers of capital), the ratio provides a clean, cross-border, and cross-industry comparable valuation.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Enterprise Value (EV) is the definitive measure of a company’s **total operational value**, calculated as Market Capitalization plus Net Debt. It represents the true cost of acquiring the entire business.</p>
    <p>EV is the essential tool for **M&A analysis** and **valuation multiples** (such as EV/EBITDA) because it provides a reliable, capital-structure-neutral metric for comparing the efficiency and price of businesses across diverse markets.</p>
</section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about Enterprise Value
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is Enterprise Value?</h4>
              <p className="text-muted-foreground">
                Enterprise Value (EV) is a comprehensive measure of a company's total value that accounts for both equity and debt. It's calculated as Market Capitalization + Total Debt - Cash and Cash Equivalents. EV represents the theoretical takeover price an acquirer would pay to buy the entire business.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate Enterprise Value?</h4>
              <p className="text-muted-foreground">
                The formula is: EV = Market Capitalization + Total Debt - Cash and Cash Equivalents. Market Cap is calculated as Share Price × Number of Shares Outstanding. Total Debt includes all interest-bearing debt. Cash includes cash, cash equivalents, and short-term investments.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is Enterprise Value important?</h4>
              <p className="text-muted-foreground">
                EV provides a more accurate picture of a company's true value than market cap alone because it accounts for debt and cash. It's essential for valuation analysis, M&A transactions, and comparing companies with different capital structures. EV multiples are widely used in financial analysis.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does a high Enterprise Value mean?</h4>
              <p className="text-muted-foreground">
                A high EV relative to market cap indicates significant debt or low cash position. This suggests the company has borrowed heavily or has limited cash reserves. It may indicate higher financial risk but doesn't necessarily mean the company is overvalued - it depends on the underlying business fundamentals.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does a low Enterprise Value mean?</h4>
              <p className="text-muted-foreground">
                A low EV relative to market cap indicates strong cash position or low debt. This suggests the company has significant cash reserves or minimal debt, providing financial flexibility. It may indicate a conservative capital structure and lower financial risk.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does Enterprise Value differ from Market Cap?</h4>
              <p className="text-muted-foreground">
                Market Cap only considers equity value (share price × shares outstanding), while EV considers the entire business value including debt and excluding cash. EV provides a more comprehensive view of what it would cost to acquire the entire business, making it better for valuation comparisons.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are Enterprise Value multiples?</h4>
              <p className="text-muted-foreground">
                EV multiples compare Enterprise Value to various financial metrics like EBITDA, EBIT, or Revenue. Common multiples include EV/EBITDA, EV/EBIT, and EV/Revenue. These multiples help assess valuation relative to operational performance and are widely used in financial analysis and M&A transactions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do investors use Enterprise Value?</h4>
              <p className="text-muted-foreground">
                Investors use EV for valuation analysis, comparing companies with different capital structures, and assessing takeover value. EV multiples help identify undervalued or overvalued companies. It's particularly useful for M&A analysis and comparing companies in the same industry with different debt levels.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of Enterprise Value?</h4>
              <p className="text-muted-foreground">
                EV doesn't account for off-balance sheet items, contingent liabilities, or future growth prospects. It's a snapshot in time and doesn't reflect operational efficiency or management quality. EV should be used in conjunction with other financial metrics and qualitative factors for comprehensive analysis.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do creditors use Enterprise Value?</h4>
              <p className="text-muted-foreground">
                Creditors use EV to assess the company's total value and ability to service debt. Higher EV suggests more assets available to creditors. EV-to-debt ratios help assess credit risk and determine appropriate lending terms. It's also used in debt restructuring and bankruptcy analysis.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}