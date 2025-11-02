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
import Link from 'next/link';

const formSchema = z.object({
  operatingCashFlow: z.number(),
  capitalExpenditures: z.number().nonnegative(),
});

type FormValues = z.infer<typeof formSchema>;

export default function FreeCashFlowCalculator() {
  const [result, setResult] = useState<{ 
    fcf: number; 
    interpretation: string; 
    healthLevel: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      operatingCashFlow: undefined,
      capitalExpenditures: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.operatingCashFlow == null || v.capitalExpenditures == null) return null;
    return v.operatingCashFlow - v.capitalExpenditures;
  };

  const interpret = (fcf: number) => {
    if (fcf >= 1000000) return 'Excellent free cash flow generation with strong financial flexibility.';
    if (fcf >= 500000) return 'Good free cash flow with comfortable financial position.';
    if (fcf >= 100000) return 'Adequate free cash flow but monitor capital allocation.';
    if (fcf >= 0) return 'Marginal free cash flow - potential financial constraints.';
    return 'Negative free cash flow - immediate financial distress risk.';
  };

  const getHealthLevel = (fcf: number) => {
    if (fcf >= 1000000) return 'Excellent';
    if (fcf >= 500000) return 'Good';
    if (fcf >= 100000) return 'Adequate';
    if (fcf >= 0) return 'Marginal';
    return 'Poor';
  };

  const getRecommendation = (fcf: number) => {
    if (fcf >= 1000000) return 'Consider strategic investments, dividends, or debt reduction.';
    if (fcf >= 500000) return 'Maintain current operations and consider growth investments.';
    if (fcf >= 100000) return 'Focus on improving operational efficiency and cash generation.';
    if (fcf >= 0) return 'Urgent need to improve cash flow generation and reduce CapEx.';
    return 'Critical situation - immediate cash flow improvement required.';
  };

  const getStrength = (fcf: number) => {
    if (fcf >= 1000000) return 'Very Strong';
    if (fcf >= 500000) return 'Strong';
    if (fcf >= 100000) return 'Moderate';
    if (fcf >= 0) return 'Weak';
    return 'Very Weak';
  };

  const getInsights = (fcf: number) => {
    const insights = [];
    if (fcf >= 1000000) {
      insights.push('Exceptional cash generation capability');
      insights.push('Strong position for growth investments');
      insights.push('Excellent financial flexibility');
    } else if (fcf >= 500000) {
      insights.push('Healthy cash generation');
      insights.push('Good operational efficiency');
      insights.push('Strong financial position');
    } else if (fcf >= 100000) {
      insights.push('Adequate cash generation');
      insights.push('Room for operational improvements');
      insights.push('Monitor capital allocation');
    } else if (fcf >= 0) {
      insights.push('Marginal cash generation');
      insights.push('High sensitivity to operational changes');
      insights.push('Urgent need for cash flow improvement');
    } else {
      insights.push('Negative cash generation');
      insights.push('Immediate financial distress');
      insights.push('Critical operational issues');
    }
    return insights;
  };

  const getConsiderations = (fcf: number) => {
    const considerations = [];
    considerations.push('Industry benchmarks vary significantly');
    considerations.push('Seasonal businesses may have fluctuating FCF');
    considerations.push('One-time items can distort FCF');
    considerations.push('Compare with historical performance');
    considerations.push('Consider working capital changes');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const fcf = calculate(values);
    if (fcf !== null) {
      setResult({
        fcf,
        interpretation: interpret(fcf),
        healthLevel: getHealthLevel(fcf),
        recommendation: getRecommendation(fcf),
        strength: getStrength(fcf),
        insights: getInsights(fcf),
        considerations: getConsiderations(fcf)
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <CardTitle>Free Cash Flow Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate your company's free cash flow to assess financial health and investment capacity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="operatingCashFlow" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Operating Cash Flow (OCF)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter operating cash flow" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="capitalExpenditures" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Capital Expenditures (CapEx)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter capital expenditures" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Free Cash Flow
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
                  <CardTitle>Free Cash Flow Result</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={result.healthLevel === 'Excellent' ? 'default' : result.healthLevel === 'Good' ? 'secondary' : 'destructive'}>
                    {result.healthLevel}
                  </Badge>
                  <Badge variant="outline">{result.strength}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold text-primary">
                  ${result.fcf.toLocaleString(undefined, { maximumFractionDigits: 2 })}
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
            <Link href="/category/finance/operating-margin-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Operating Margin</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/net-profit-margin-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Net Profit Margin</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/ebitda-ebit-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Calculator className="h-8 w-8 mx-auto mb-2 text-primary" />
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
    <meta itemProp="name" content="The Definitive Guide to Free Cash Flow (FCF): Calculation, Types, and Valuation" />
    <meta itemProp="description" content="An expert guide detailing the Free Cash Flow (FCF) formula, the difference between FCFE and FCFF, its role as the core input for DCF valuation, and its significance as a measure of corporate financial health and internal financing capacity." />
    <meta itemProp="keywords" content="free cash flow formula explained, calculating FCF, FCFF vs FCFE, sustainable growth metric, DCF input FCF, cash flow analysis corporate finance, capital expenditure net income" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-11-02" /> 
    <meta itemProp="url" content="/definitive-free-cash-flow-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Free Cash Flow (FCF): The True Measure of Corporate Value</h1>
    <p className="text-lg italic text-gray-700">Master the critical metric that quantifies the cash available to a company's investors after all necessary operational and capital expenses are paid.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#definition" className="hover:underline">FCF: Definition and Core Significance</a></li>
        <li><a href="#fcff-fcfe" className="hover:underline">Two Primary Types: FCFF and FCFE</a></li>
        <li><a href="#calculation-fcff" className="hover:underline">Calculating Free Cash Flow to Firm (FCFF)</a></li>
        <li><a href="#calculation-fcfe" className="hover:underline">Calculating Free Cash Flow to Equity (FCFE)</a></li>
        <li><a href="#applications" className="hover:underline">Role in Valuation and Growth Analysis</a></li>
    </ul>

<hr />

    {/* FCF: DEFINITION AND CORE SIGNIFICANCE */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">FCF: Definition and Core Significance</h2>
    <p>Free Cash Flow (FCF) is arguably the most important metric in financial analysis. It represents the actual cash a company generates that is available to be distributed to its debt and equity investors, either through dividends, debt repayment, or share buybacks, after funding all operations and necessary investments in fixed assets.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Why FCF is Superior to Net Income</h3>
    <p>Net Income (profit) from the Income Statement can be misleading because it includes non-cash expenses (like depreciation and amortization) and excludes changes in working capital. FCF is a more accurate measure of a company’s financial health and solvency because it represents **real, spendable cash**.</p>
    <p>If a company has high net income but low FCF, it usually means the profit is tied up in increasing inventory or accounts receivable, indicating poor quality earnings.</p>

<hr />

    {/* TWO PRIMARY TYPES: FCFF AND FCFE */}
    <h2 id="fcff-fcfe" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Two Primary Types: FCFF and FCFE</h2>
    <p>FCF is calculated in two primary forms, depending on whether the analyst is valuing the entire firm or just the equity portion of the firm.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Free Cash Flow to Firm (FCFF)</h3>
    <p>FCFF is the cash flow available to **all investors** (both debt holders and equity holders). It is the standard input used when valuing the entire company (Enterprise Value) because it measures the total cash generated before any financing decisions (interest payments) are factored in.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Free Cash Flow to Equity (FCFE)</h3>
    <p>FCFE is the cash flow available only to **equity holders** (shareholders), as it is calculated *after* all debt obligations (principal and interest payments) have been paid. FCFE is the correct input for determining Equity Value or for models that calculate dividends.</p>

<hr />

    {/* CALCULATING FREE CASH FLOW TO FIRM (FCFF) */}
    <h2 id="calculation-fcff" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculating Free Cash Flow to Firm (FCFF)</h2>
    <p>FCFF can be calculated from Net Income or, more commonly in corporate finance, from Earnings Before Interest and Taxes (EBIT), as this approach maintains the separation of operating and financing decisions.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The FCFF Formula (from EBIT)</h3>
    <p>This method starts with operating profit and adjusts for non-cash items and required investments:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'FCFF = EBIT * (1 - T) + D&A - CapEx - Increase in NWC'}
        </p>
    </div>
    <p>Where T is the tax rate, D&A is Depreciation and Amortization, CapEx is Capital Expenditures, and NWC is Net Working Capital. The term (EBIT $\times$ (1-T) is often called Net Operating Profit After Taxes (NOPAT).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Capital Expenditures (CapEx)</h3>
    <p>CapEx represents the investment required to maintain or expand the company's long-term fixed assets (Property, Plant, and Equipment). It is a necessary cash outflow that is subtracted to arrive at FCF. Only cash flows remaining *after* this necessary investment are considered "free."</p>

<hr />

    {/* CALCULATING FREE CASH FLOW TO EQUITY (FCFE) */}
    <h2 id="calculation-fcfe" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculating Free Cash Flow to Equity (FCFE)</h2>
    <p>FCFE can be derived directly from FCFF or calculated independently from Net Income. It accounts for all obligations to lenders.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The FCFE Formula (from Net Income)</h3>
    <p>This formula starts at the bottom line of the Income Statement and makes the necessary non-cash adjustments:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'FCFE = Net Income + D&A - CapEx - Increase in NWC + Net Borrowing'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Net Borrowing Factor</h3>
    <p>The term "Net Borrowing" is the difference between new debt issued and old debt repaid (principal payments). This factor is crucial: increasing debt provides cash to equity holders (positive FCFE), while paying down debt consumes cash (negative FCFE). This step is what differentiates FCFE from FCFF.</p>

<hr />

    {/* ROLE IN VALUATION AND GROWTH ANALYSIS */}
    <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Role in Valuation and Growth Analysis</h2>
    <p>FCF is the core input for valuation and is a key indicator of a company's financial flexibility and growth potential.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Discounted Cash Flow (DCF) Valuation</h3>
    <p>FCF is the fuel for the DCF model. Future FCF forecasts are discounted back to the present value (using the WACC for FCFF, or Cost of Equity for FCFE) to determine the company's **Intrinsic Value**. This is the most theoretically sound method of valuation, as it is based on the company's true cash-generating ability.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Sustainable Growth Rate (SGR)</h3>
    <p>A positive, growing FCF is the true source of sustainable growth. Companies with high FCF can fund their expansion and innovation internally, reducing their reliance on expensive external financing (equity or debt issuance). This allows the company to reinvest and grow faster, providing a competitive advantage.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Free Cash Flow (FCF) is the definitive measure of a company's financial success, representing the true cash surplus available to investors after accounting for all operational and maintenance needs.</p>
    <p>The distinction between **FCFF** (available to all capital providers) and **FCFE** (available only to equity holders) is critical for valuation. A consistent, positive FCF is the hallmark of a healthy, valuable enterprise, confirming the company generates high-quality earnings that fund internal growth and shareholder returns.</p>
</section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about Free Cash Flow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is Free Cash Flow?</h4>
              <p className="text-muted-foreground">
                Free Cash Flow (FCF) is the cash that a company generates after accounting for cash outflows to support operations and maintain its capital assets. It's calculated as Operating Cash Flow minus Capital Expenditures. FCF represents the cash available for dividends, debt reduction, share buybacks, or reinvestment in the business.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is considered good Free Cash Flow?</h4>
              <p className="text-muted-foreground">
                Good FCF varies by industry and company size. Generally, positive FCF is good, indicating the company generates more cash than it spends on operations and capital investments. FCF margins of 5-10% are typically healthy, while margins above 15% are excellent. Compare FCF to revenue and industry benchmarks for meaningful analysis.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate Free Cash Flow?</h4>
              <p className="text-muted-foreground">
                The formula is: FCF = Operating Cash Flow - Capital Expenditures. Operating Cash Flow is found on the Statement of Cash Flows and represents cash from core business operations. Capital Expenditures (CapEx) are also on the cash flow statement and represent investments in property, plant, and equipment.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does negative Free Cash Flow mean?</h4>
              <p className="text-muted-foreground">
                Negative FCF means the company is spending more on operations and capital investments than it's generating in cash. This can indicate growth investments, operational inefficiencies, or financial distress. Young companies often have negative FCF due to heavy growth investments, while mature companies should typically generate positive FCF.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Do Free Cash Flow requirements vary by industry?</h4>
              <p className="text-muted-foreground">
                Yes, FCF requirements vary significantly by industry. Capital-intensive industries like manufacturing may have lower FCF margins due to high CapEx requirements. Technology companies often have higher FCF margins due to lower capital requirements. Service companies typically have moderate FCF margins. Always compare within the same industry.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of Free Cash Flow?</h4>
              <p className="text-muted-foreground">
                FCF is a snapshot in time and doesn't reflect seasonal variations or one-time items. It doesn't consider the quality of cash flows or future capital requirements. FCF can be manipulated through timing of CapEx or working capital changes. It doesn't account for off-balance sheet items or future growth investments.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How can a company improve its Free Cash Flow?</h4>
              <p className="text-muted-foreground">
                Companies can improve FCF by increasing operating cash flow through revenue growth, cost reduction, or working capital optimization. They can also reduce CapEx through better capital allocation, asset efficiency, or outsourcing. However, excessive CapEx reduction may harm long-term growth prospects.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does Free Cash Flow relate to valuation?</h4>
              <p className="text-muted-foreground">
                FCF is crucial for valuation as it represents the actual cash available to shareholders. Many valuation models use FCF as the basis for discounted cash flow (DCF) analysis. Higher FCF typically leads to higher valuations, as it indicates the company's ability to generate returns for investors.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is Free Cash Flow important for investors?</h4>
              <p className="text-muted-foreground">
                For investors, FCF indicates the company's ability to generate cash returns, pay dividends, reduce debt, or reinvest in growth. It's a more reliable indicator of financial health than earnings, as it's harder to manipulate. Strong FCF suggests the company has financial flexibility and can weather economic downturns.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do creditors use Free Cash Flow?</h4>
              <p className="text-muted-foreground">
                Creditors use FCF to assess the company's ability to service debt and meet financial obligations. Positive FCF suggests the company can make debt payments without additional financing. Creditors often require minimum FCF levels in loan covenants to ensure borrowers maintain adequate cash generation capability.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
