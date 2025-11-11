'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, AlertCircle, Target, Info, Landmark, DollarSign, TrendingUp, Shield, BarChart3, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  enterpriseValue: z.number().positive(),
  ebit: z.number(),
  ebitda: z.number(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EVEBITDAEBITMultipleCalculator() {
  const [result, setResult] = useState<{ 
    evEbitMultiple: number;
    evEbitdaMultiple: number;
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
      enterpriseValue: undefined,
      ebit: undefined,
      ebitda: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.enterpriseValue == null || v.ebit == null || v.ebitda == null) return null;
    const evEbitMultiple = v.enterpriseValue / v.ebit;
    const evEbitdaMultiple = v.enterpriseValue / v.ebitda;
    return { evEbitMultiple, evEbitdaMultiple };
  };

  const interpret = (evEbitMultiple: number, evEbitdaMultiple: number) => {
    if (evEbitMultiple <= 8 && evEbitdaMultiple <= 6) return 'Attractive valuation multiples - potentially undervalued.';
    if (evEbitMultiple <= 12 && evEbitdaMultiple <= 10) return 'Fair valuation multiples - reasonably priced.';
    if (evEbitMultiple <= 20 && evEbitdaMultiple <= 15) return 'Moderate valuation multiples - premium pricing.';
    return 'High valuation multiples - potentially overvalued.';
  };

  const getValuationLevel = (evEbitMultiple: number, evEbitdaMultiple: number) => {
    if (evEbitMultiple <= 8 && evEbitdaMultiple <= 6) return 'Attractive';
    if (evEbitMultiple <= 12 && evEbitdaMultiple <= 10) return 'Fair';
    if (evEbitMultiple <= 20 && evEbitdaMultiple <= 15) return 'Moderate';
    return 'High';
  };

  const getRecommendation = (evEbitMultiple: number, evEbitdaMultiple: number) => {
    if (evEbitMultiple <= 8 && evEbitdaMultiple <= 6) return 'Consider investment opportunity - attractive valuation.';
    if (evEbitMultiple <= 12 && evEbitdaMultiple <= 10) return 'Monitor for investment opportunities - fair valuation.';
    if (evEbitMultiple <= 20 && evEbitdaMultiple <= 15) return 'Exercise caution - premium valuation requires strong growth.';
    return 'Avoid investment - high valuation multiples suggest overpricing.';
  };

  const getStrength = (evEbitMultiple: number, evEbitdaMultiple: number) => {
    if (evEbitMultiple <= 8 && evEbitdaMultiple <= 6) return 'Very Strong';
    if (evEbitMultiple <= 12 && evEbitdaMultiple <= 10) return 'Strong';
    if (evEbitMultiple <= 20 && evEbitdaMultiple <= 15) return 'Moderate';
    return 'Weak';
  };

  const getInsights = (evEbitMultiple: number, evEbitdaMultiple: number) => {
    const insights = [];
    if (evEbitMultiple <= 8 && evEbitdaMultiple <= 6) {
      insights.push('Attractive valuation opportunity');
      insights.push('Strong operational performance');
      insights.push('Potential for value appreciation');
    } else if (evEbitMultiple <= 12 && evEbitdaMultiple <= 10) {
      insights.push('Fair market valuation');
      insights.push('Balanced risk-return profile');
      insights.push('Reasonable investment opportunity');
    } else if (evEbitMultiple <= 20 && evEbitdaMultiple <= 15) {
      insights.push('Premium valuation pricing');
      insights.push('High growth expectations');
      insights.push('Requires strong performance');
    } else {
      insights.push('High valuation multiples');
      insights.push('Significant growth expectations');
      insights.push('High risk investment');
    }
    return insights;
  };

  const getConsiderations = (evEbitMultiple: number, evEbitdaMultiple: number) => {
    const considerations = [];
    considerations.push('Industry benchmarks vary significantly');
    considerations.push('Growth companies typically have higher multiples');
    considerations.push('Mature companies usually have lower multiples');
    considerations.push('Compare with historical performance');
    considerations.push('Consider market conditions and interest rates');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const multiples = calculate(values);
    if (multiples !== null) {
      setResult({
        evEbitMultiple: multiples.evEbitMultiple,
        evEbitdaMultiple: multiples.evEbitdaMultiple,
        interpretation: interpret(multiples.evEbitMultiple, multiples.evEbitdaMultiple),
        valuationLevel: getValuationLevel(multiples.evEbitMultiple, multiples.evEbitdaMultiple),
        recommendation: getRecommendation(multiples.evEbitMultiple, multiples.evEbitdaMultiple),
        strength: getStrength(multiples.evEbitMultiple, multiples.evEbitdaMultiple),
        insights: getInsights(multiples.evEbitMultiple, multiples.evEbitdaMultiple),
        considerations: getConsiderations(multiples.evEbitMultiple, multiples.evEbitdaMultiple)
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            <CardTitle>EV / EBIT and EV / EBITDA Multiple Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate enterprise value multiples to assess valuation and investment attractiveness
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="enterpriseValue" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Enterprise Value
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter enterprise value" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="ebit" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      EBIT (Earnings Before Interest & Taxes)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter EBIT" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="ebitda" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      EBITDA (Earnings Before Interest, Taxes, Depreciation & Amortization)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter EBITDA" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate EV Multiples
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
                  <CardTitle>EV Multiple Results</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={result.valuationLevel === 'Attractive' ? 'default' : result.valuationLevel === 'Fair' ? 'secondary' : 'destructive'}>
                    {result.valuationLevel}
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
                      {result.evEbitMultiple.toFixed(2)}x
                    </div>
                    <p className="text-sm text-muted-foreground">EV/EBIT Multiple</p>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary">
                      {result.evEbitdaMultiple.toFixed(2)}x
                    </div>
                    <p className="text-sm text-muted-foreground">EV/EBITDA Multiple</p>
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
            <Link href="/category/finance/enterprise-value-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Enterprise Value</p>
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
            <Link href="/category/finance/free-cash-flow-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Free Cash Flow</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/operating-margin-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Operating Margin</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to EV/EBIT and EV/EBITDA Multiples: Valuation, Calculation, and Benchmarking" />
    <meta itemProp="description" content="An expert guide detailing the calculation and application of EV/EBIT and EV/EBITDA multiples, their role in relative valuation, how they compare to the P/E ratio, and which metric is best for capital-intensive versus asset-light companies." />
    <meta itemProp="keywords" content="EV EBITDA multiple formula, calculating EV EBIT ratio, enterprise value valuation multiples, EBIT vs EBITDA multiple, acquisition benchmarking finance, capital intensity valuation" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-11-12" /> 
    <meta itemProp="url" content="/definitive-ev-multiples-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to EV/EBIT and EV/EBITDA Multiples: Benchmarking Operational Value</h1>
    <p className="text-lg italic text-gray-700">Master the preferred valuation tools of corporate finance that compare a firm's total value to its core operational profitability.</p>
    

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#definition" className="hover:underline">Valuation Multiples: Definition and Necessity</a></li>
        <li><a href="#ev-calc" className="hover:underline">The Numerator: Enterprise Value (EV)</a></li>
        <li><a href="#ebit-ebitda" className="hover:underline">The Denominators: EBIT vs. EBITDA</a></li>
        <li><a href="#comparison" className="hover:underline">EV/EBIT vs. EV/EBITDA: Which Multiple to Use</a></li>
        <li><a href="#applications" className="hover:underline">Application in M&A and Financial Analysis</a></li>
    </ul>
<hr />

    {/* VALUATION MULTIPLES: DEFINITION AND NECESSITY */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Valuation Multiples: Definition and Necessity</h2>
    <p>Valuation multiples are ratios used in **Relative Valuation** to determine a company’s worth by comparing its financial metrics to those of similar companies (peers). The EV/EBIT and EV/EBITDA multiples are the most common enterprise valuation tools.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Matching Numerator and Denominator</h3>
    <p>In valuation, it is critical to match the numerator (the value of the firm) with the corresponding metric for the firm's profitability (the denominator). Since **Enterprise Value (EV)** represents the value of the firm to *all* capital providers (equity and debt), it must be paired with profitability metrics—EBIT or EBITDA—that are calculated *before* deducting financing costs (interest).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Why EV Multiples are Superior to P/E</h3>
    <p>The **Price-to-Earnings (P/E) Ratio** uses Net Income, which is reduced by interest and taxes. This means P/E is dependent on the company's capital structure (debt) and tax rate. EV multiples remove these distortions, allowing for a much cleaner, apples-to-apples comparison of the core operational assets between two companies, regardless of their debt loads.</p>

<hr />

    {/* THE NUMERATOR: ENTERPRISE VALUE (EV) */}
    <h2 id="ev-calc" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Numerator: Enterprise Value (EV)</h2>
    <p>**Enterprise Value (EV)** is the comprehensive measure of a company's total value, representing the true cost an acquirer would pay to purchase all operating assets.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">EV Formula</h3>
    <p>EV is calculated by taking the market value of the equity (Market Capitalization) and adjusting for the claims of non-equity holders (debt) and the availability of cash:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'EV = Market Capitalization + Total Debt - Cash'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Rationale</h3>
    <p>Total Debt is added because the acquirer must assume this liability. Cash is subtracted because the acquirer immediately gains control of the cash, which can be used to pay down the debt, lowering the effective purchase price.</p>

<hr />

    {/* THE DENOMINATORS: EBIT VS. EBITDA */}
    <h2 id="ebit-ebitda" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Denominators: EBIT vs. EBITDA</h2>
    <p>The choice between **EBIT** (Earnings Before Interest and Taxes) and **EBITDA** (EBIT plus Depreciation and Amortization) depends on how much distortion the analyst wants to remove from the earnings figure.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">EBIT (Operating Income)</h3>
    <p>EBIT is a measure of profitability after accounting for the full cost of operations, **including Depreciation and Amortization (D&A)**. Since D&A represents the inevitable cost of using fixed assets, EBIT is viewed as a better measure of long-term, sustainable profitability.</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'EV / EBIT Ratio = Enterprise Value / Earnings Before Interest and Taxes'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">EBITDA (Cash Flow Proxy)</h3>
    <p>EBITDA excludes D&A. This is a crucial simplification because D&A policies can vary widely by country or accounting method. Excluding D&A provides a cleaner measure of the company's operating cash flow available to service debt or finance short-term working capital.</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'EV / EBITDA Ratio = Enterprise Value / EBITDA'}
        </p>
    </div>

<hr />

    {/* EV/EBIT VS. EV/EBITDA: WHICH MULTIPLE TO USE */}
    <h2 id="comparison" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">EV/EBIT vs. EV/EBITDA: Which Multiple to Use</h2>
    <p>The decision to use EBIT or EBITDA in the denominator is dictated by the **Capital Intensity** of the industry being valued.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Use EV/EBITDA for Capital-Intensive Firms</h3>
    <p>EV/EBITDA is the standard in capital-intensive sectors (e.g., manufacturing, airlines, telecoms). In these industries, D&A is often extremely high and highly variable due to different asset lifecycles and accounting policies. Using EBITDA removes this variability, allowing for fair comparison of core operations.</p>
    <p>However, analysts must be cautious: a high EV/EBITDA ratio for a firm with huge CapEx requirements can be misleading, as the large EBITDA cash flow must be reinvested just to maintain operations.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Use EV/EBIT for Asset-Light Firms</h3>
    <p>EV/EBIT is a superior metric for **asset-light** companies (e.g., technology, software, consulting). These companies have low D&A expenses, making the difference between EBIT and EBITDA negligible. Since EBIT accounts for the cost of maintaining assets, it is considered a more conservative and accurate proxy for long-term sustainable profitability.</p>

<hr />

    {/* APPLICATION IN M&A AND FINANCIAL ANALYSIS */}
    <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Application in M&A and Financial Analysis</h2>
    <p>These multiples are central to relative valuation because they standardize risk and profitability across diverse businesses.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">M&A Benchmarking</h3>
    <p>In mergers and acquisitions, the acquisition price paid for a target company is often justified by comparing the EV/EBITDA multiple of the transaction to those of recent comparable deals. This ensures the buyer is paying a fair market price based on precedent transactions.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Interpreting High Multiples</h3>
    <p>A **high EV/EBITDA multiple** suggests the market anticipates high future growth, high operating leverage, or a low-risk business model. A **low multiple** may indicate a business in distress, structural decline, or a deeply undervalued asset.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The EV/EBIT and EV/EBITDA ratios are the preferred **enterprise valuation multiples** because they match the total value of the firm (EV) against its operational earnings (EBIT/EBITDA), neutralizing distortions from debt and taxes.</p>
    <p>EV/EBITDA is favored in highly capital-intensive industries to smooth out D&A differences. The analysis of these ratios provides critical insight into a company's relative valuation and its inherent operational efficiency compared to its industry peers.</p>
</section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about EV Multiples
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What are EV Multiples?</h4>
              <p className="text-muted-foreground">
                EV multiples are valuation ratios that compare Enterprise Value to various financial metrics like EBIT and EBITDA. Common multiples include EV/EBIT and EV/EBITDA. These ratios help assess whether a company is undervalued or overvalued relative to its operational performance.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate EV/EBIT and EV/EBITDA multiples?</h4>
              <p className="text-muted-foreground">
                EV/EBIT = Enterprise Value ÷ EBIT. EV/EBITDA = Enterprise Value ÷ EBITDA. Enterprise Value is calculated as Market Cap + Total Debt - Cash. EBIT and EBITDA are found on the income statement. These multiples show how many times the operational earnings the company is valued at.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are considered good EV multiples?</h4>
              <p className="text-muted-foreground">
                Good EV multiples vary by industry. Generally, EV/EBIT below 10x and EV/EBITDA below 8x are considered attractive. EV/EBIT below 15x and EV/EBITDA below 12x are fair. Higher multiples suggest premium pricing or high growth expectations. Always compare within the same industry.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What do high EV multiples mean?</h4>
              <p className="text-muted-foreground">
                High EV multiples indicate that investors are paying a premium for the company's earnings. This can suggest high growth expectations, strong competitive position, or potential overvaluation. High multiples require strong future performance to justify the premium pricing.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What do low EV multiples mean?</h4>
              <p className="text-muted-foreground">
                Low EV multiples suggest that investors are paying less for the company's earnings, potentially indicating undervaluation, lower growth expectations, or higher risk. Low multiples can present investment opportunities if the company's fundamentals are strong.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do EV multiples vary by industry?</h4>
              <p className="text-muted-foreground">
                EV multiples vary significantly by industry. Technology companies often have higher multiples due to growth potential. Mature industries like utilities typically have lower multiples. Capital-intensive industries may have different multiples due to depreciation differences. Always compare within the same industry.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of EV multiples?</h4>
              <p className="text-muted-foreground">
                EV multiples don't account for growth rates, competitive position, or future prospects. They're based on current earnings and may not reflect cyclical or one-time factors. They don't consider the quality of earnings or management effectiveness. Use in conjunction with other metrics for comprehensive analysis.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do investors use EV multiples?</h4>
              <p className="text-muted-foreground">
                Investors use EV multiples to identify undervalued or overvalued companies, compare companies with different capital structures, and assess investment opportunities. They help determine fair value and make buy/sell decisions. EV multiples are particularly useful for M&A analysis and portfolio construction.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do creditors use EV multiples?</h4>
              <p className="text-muted-foreground">
                Creditors use EV multiples to assess the company's valuation and debt capacity. Higher EV multiples suggest more assets available to creditors. They help determine appropriate lending terms and assess credit risk. EV multiples are also used in debt restructuring and covenant calculations.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What's the difference between EV/EBIT and EV/EBITDA?</h4>
              <p className="text-muted-foreground">
                EV/EBIT includes depreciation and amortization in the denominator, while EV/EBITDA excludes them. EV/EBITDA is more commonly used as it's less affected by accounting policies and capital structure. EV/EBIT provides a more conservative view of valuation. Both metrics are useful for different analytical purposes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}