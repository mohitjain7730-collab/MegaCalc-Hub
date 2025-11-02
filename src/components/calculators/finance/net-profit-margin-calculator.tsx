'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Percent, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, TrendingUp, Shield, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  netIncome: z.number(),
  revenue: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NetProfitMarginCalculator() {
  const [result, setResult] = useState<{ 
    margin: number; 
    interpretation: string; 
    profitabilityLevel: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      netIncome: undefined,
      revenue: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.netIncome == null || v.revenue == null) return null;
    return (v.netIncome / v.revenue) * 100;
  };

  const interpret = (margin: number) => {
    if (margin >= 20) return 'Excellent net profitability with strong overall financial performance.';
    if (margin >= 15) return 'Good net profitability with healthy financial results.';
    if (margin >= 10) return 'Adequate net profitability but monitor overall efficiency.';
    if (margin >= 5) return 'Marginal net profitability - comprehensive financial concerns.';
    return 'Poor net profitability - immediate financial distress.';
  };

  const getProfitabilityLevel = (margin: number) => {
    if (margin >= 20) return 'Excellent';
    if (margin >= 15) return 'Good';
    if (margin >= 10) return 'Adequate';
    if (margin >= 5) return 'Marginal';
    return 'Poor';
  };

  const getRecommendation = (margin: number) => {
    if (margin >= 20) return 'Maintain financial excellence and consider strategic investments.';
    if (margin >= 15) return 'Continue current financial management and optimize further.';
    if (margin >= 10) return 'Focus on comprehensive cost management and revenue optimization.';
    if (margin >= 5) return 'Urgent need to improve overall financial performance.';
    return 'Critical situation - immediate financial restructuring required.';
  };

  const getStrength = (margin: number) => {
    if (margin >= 20) return 'Very Strong';
    if (margin >= 15) return 'Strong';
    if (margin >= 10) return 'Moderate';
    if (margin >= 5) return 'Weak';
    return 'Very Weak';
  };

  const getInsights = (margin: number) => {
    const insights = [];
    if (margin >= 20) {
      insights.push('Exceptional overall profitability');
      insights.push('Strong financial management');
      insights.push('Excellent competitive position');
    } else if (margin >= 15) {
      insights.push('Healthy overall profitability');
      insights.push('Good financial control');
      insights.push('Strong market position');
    } else if (margin >= 10) {
      insights.push('Adequate overall profitability');
      insights.push('Room for financial optimization');
      insights.push('Monitor competitive position');
    } else if (margin >= 5) {
      insights.push('Marginal overall profitability');
      insights.push('High sensitivity to financial changes');
      insights.push('Urgent need for financial improvements');
    } else {
      insights.push('Poor overall profitability');
      insights.push('Immediate financial distress');
      insights.push('Critical financial management issues');
    }
    return insights;
  };

  const getConsiderations = (margin: number) => {
    const considerations = [];
    considerations.push('Industry benchmarks vary significantly');
    considerations.push('Seasonal businesses may have fluctuating margins');
    considerations.push('One-time items can distort net income');
    considerations.push('Compare with historical performance');
    considerations.push('Consider tax rates and interest expenses');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const margin = calculate(values);
    if (margin !== null) {
      setResult({
        margin,
        interpretation: interpret(margin),
        profitabilityLevel: getProfitabilityLevel(margin),
        recommendation: getRecommendation(margin),
        strength: getStrength(margin),
        insights: getInsights(margin),
        considerations: getConsiderations(margin)
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Percent className="h-6 w-6 text-primary" />
            <CardTitle>Net Profit Margin Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate your company's net profit margin to assess overall profitability and financial health
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="netIncome" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Net Income (Profit)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter net income" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="revenue" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Net Sales (Revenue)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter net sales" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Net Profit Margin
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
                  <CardTitle>Net Profit Margin Result</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={result.profitabilityLevel === 'Excellent' ? 'default' : result.profitabilityLevel === 'Good' ? 'secondary' : 'destructive'}>
                    {result.profitabilityLevel}
                  </Badge>
                  <Badge variant="outline">{result.strength}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold text-primary">
                  {result.margin.toFixed(2)}%
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
            <Link href="/category/finance/gross-margin-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Gross Margin</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/operating-margin-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Percent className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Operating Margin</p>
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
                  <Calculator className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">EBITDA/EBIT</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Net Profit Margin Calculation, Interpretation, and Final Profitability Analysis" />
    <meta itemProp="description" content="An expert guide detailing the Net Profit Margin formula, its role as the ultimate measure of a company’s overall profitability and efficiency after all expenses (including taxes and interest) are paid, and its use in competitive benchmarking." />
    <meta itemProp="keywords" content="net profit margin formula explained, calculating net income margin, bottom line profitability metric, net income to revenue ratio, interpreting net margin, profit efficiency analysis" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-11-02" /> 
    <meta itemProp="url" content="/definitive-net-profit-margin-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Net Profit Margin: The Ultimate Measure of Financial Success</h1>
    <p className="text-lg italic text-gray-700">Master the bottom-line metric that reveals the percentage of revenue a company successfully converts into profit after paying every single expense.</p>
    

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#definition" className="hover:underline">Net Margin: Definition and Bottom-Line Significance</a></li>
        <li><a href="#calculation" className="hover:underline">The Net Profit Margin Formula and Components</a></li>
        <li><a href="#comparison" className="hover:underline">Net Margin vs. Gross and Operating Margins</a></li>
        <li><a href="#interpretation" className="hover:underline">Interpreting the Ratio and Industry Benchmarks</a></li>
        <li><a href="#drivers" className="hover:underline">Key Drivers of Net Margin Change</a></li>
    </ul>
<hr />

    {/* NET MARGIN: DEFINITION AND BOTTOM-LINE SIGNIFICANCE */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Net Margin: Definition and Bottom-Line Significance</h2>
    <p>The **Net Profit Margin** (or simply **Net Margin**) is the most comprehensive measure of a company’s overall profitability. It expresses the percentage of total revenue that translates into net income after all expenses—including Cost of Goods Sold, operating expenses, interest, and taxes—have been deducted.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Bottom-Line Metric</h3>
    <p>Net Margin is often referred to as the **"bottom line"** because it uses the final Net Income figure from the Income Statement. It is the last profitability measure, showing the final amount of profit available for retention (retained earnings) or distribution to shareholders (dividends).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">A Measure of Final Efficiency</h3>
    <p>A high Net Margin signals highly effective management across all functions of the business—not just production, but also administrative cost control, efficient use of debt (low interest expense), and favorable tax management. It quantifies the value left over for the owners after every financial obligation is met.</p>

<hr />

    {/* THE NET PROFIT MARGIN FORMULA AND COMPONENTS */}
    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Net Profit Margin Formula and Components</h2>
    <p>Net Profit Margin is calculated by dividing Net Income by Total Revenue (Net Sales) and multiplying by 100 to express the result as a percentage.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Identity</h3>
    <p>The formula for the Net Profit Margin is:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Net Profit Margin = (Net Income / Total Revenue) * 100'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Defining Net Income</h3>
    <p>Net Income (or Net Profit) is the residual income after deducting the following costs from Revenue:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li>Cost of Goods Sold (COGS).</li>
        <li>Operating Expenses (SG&A, R&D).</li>
        <li>Interest Expense (cost of debt).</li>
        <li>Taxes (corporate income tax).</li>
        <li>Non-Operating Gains/Losses (e.g., gains on asset sales).</li>
    </ul>
    <p>Because it includes interest and taxes, Net Margin is the only metric that truly reflects the impact of a company's capital structure and tax jurisdiction on its final profit.</p>

<hr />

    {/* NET MARGIN VS. GROSS AND OPERATING MARGINS */}
    <h2 id="comparison" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Net Margin vs. Gross and Operating Margins</h2>
    <p>Analyzing Net Margin in isolation can be misleading. It must be compared to Gross and Operating Margins to diagnose where profitability is being lost on the Income Statement.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Margin Funnel Analysis</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">If Gross Margin is Low:</strong> The problem is fundamental—the company cannot profitably produce or acquire its goods. Net Margin will also be low.</li>
        <li><strong className="font-semibold">If Operating Margin is Low, but Gross Margin is High:</strong> The problem is inefficient overhead (SG&A). The core product is profitable, but the costs of management, marketing, and administration are too high.</li>
        <li><strong className="font-semibold">If Operating Margin is High, but Net Margin is Low:</strong> The problem is external to operations, likely due to high **Interest Expense** (heavy debt load) or high **Tax Expense**.</li>
    </ul>
    <p>Net Margin is the least comparable across companies because interest and tax strategies vary widely, while Operating Margin is the better metric for direct operational comparison.</p>

<hr />

    {/* INTERPRETING THE RATIO AND INDUSTRY BENCHMARKS */}
    <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting the Ratio and Industry Benchmarks</h2>
    <p>The interpretation of a "good" Net Margin is entirely dependent on the industry sector and the capital intensity of the business model.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Industry Variations and Benchmarks</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">High Net Margins (e.g., Pharmaceuticals, Software, Financial Services):</strong> Often range from 15% to 30%. High margins reflect strong intellectual property, specialized services, and high barriers to entry.</li>
        <li><strong className="font-semibold">Low Net Margins (e.g., Grocery, Airlines, Construction):</strong> Often range from 1% to 5%. Low margins are compensated for by very high sales volume and rapid inventory turnover.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Profitability and Cost Control</h3>
    <p>A consistent positive Net Margin is essential for financial stability. A ratio that is rising over time indicates strong management, improving operational leverage, and increasing profitability per dollar of sales. A negative Net Margin means the company is losing money on every sale after accounting for all costs.</p>

<hr />

    {/* KEY DRIVERS OF NET MARGIN CHANGE */}
    <h2 id="drivers" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Key Drivers of Net Margin Change</h2>
    <p>Net Margin can be managed through strategic changes affecting the bottom of the Income Statement.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Financing Costs (Interest Expense)</h3>
    <p>A company can improve its Net Margin without changing its core operations by reducing its debt load or refinancing existing debt at lower interest rates. This lowers the Interest Expense line, increasing Net Income.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Tax Strategy</h3>
    <p>Net Margin is highly susceptible to tax planning. A company can employ legal tax minimization strategies (e.g., utilizing deferred tax assets, optimizing legal domicile) to lower the effective tax rate, which directly boosts Net Income without requiring any change in operations or pricing.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The Net Profit Margin is the final and most encompassing measure of a company’s financial success, calculating the percentage of revenue that becomes profit after covering **all** costs, including interest and taxes.</p>
    <p>While Net Margin reflects final profitability, true financial diagnosis requires comparison to **Gross Margin** and **Operating Margin** to pinpoint whether profit erosion is due to production costs, operational inefficiency, or excessive financing expenses.</p>
</section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about Net Profit Margin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is Net Profit Margin?</h4>
              <p className="text-muted-foreground">
                Net Profit Margin is a profitability ratio that measures how much profit a company makes on each dollar of sales after accounting for all expenses, including operating costs, interest, and taxes. It's calculated as Net Income ÷ Revenue × 100, expressed as a percentage.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is considered a good Net Profit Margin?</h4>
              <p className="text-muted-foreground">
                Good net profit margins vary by industry. Generally, margins above 10% are considered good, above 15% are excellent, and above 5% are adequate. Technology companies often have higher margins (15-25%), while retail companies typically have lower margins (2-5%). Always compare within the same industry.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate Net Profit Margin?</h4>
              <p className="text-muted-foreground">
                The formula is: Net Profit Margin = (Net Income ÷ Revenue) × 100. Net Income is the bottom line profit after all expenses, found at the bottom of the income statement. Revenue is the total sales amount, found at the top of the income statement.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does negative Net Profit Margin mean?</h4>
              <p className="text-muted-foreground">
                A negative net profit margin means the company is losing money overall, spending more than it earns. This indicates serious financial problems and requires immediate attention to cost management, pricing, or operational restructuring. It's unsustainable in the long term.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Do Net Profit Margins vary by industry?</h4>
              <p className="text-muted-foreground">
                Yes, net profit margins vary significantly by industry. Software companies often have high margins due to scalable business models. Manufacturing companies typically have moderate margins. Retail companies usually have low margins due to high competition. Always compare within the same industry for meaningful analysis.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of Net Profit Margin?</h4>
              <p className="text-muted-foreground">
                Net profit margin is a snapshot in time and doesn't reflect seasonal variations or one-time items. It doesn't consider the quality of earnings or future growth prospects. It can be manipulated through accounting practices. Compare with historical performance and industry benchmarks for better insights.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How can a company improve its Net Profit Margin?</h4>
              <p className="text-muted-foreground">
                Companies can improve net profit margin by increasing revenue through growth or price increases, reducing all types of costs (operating, interest, tax), improving operational efficiency, optimizing capital structure, or focusing on higher-margin products. However, these strategies should be balanced with long-term growth objectives.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does Net Profit Margin differ from other margins?</h4>
              <p className="text-muted-foreground">
                Net Profit Margin includes all expenses (operating, interest, taxes), while Gross Margin only considers direct costs and Operating Margin excludes interest and taxes. Net Profit Margin provides the most comprehensive view of profitability and is always the lowest of the three margin ratios.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is Net Profit Margin important for investors?</h4>
              <p className="text-muted-foreground">
                For investors, net profit margin indicates overall financial health and management effectiveness. Higher margins suggest better ability to generate returns and weather economic downturns. It helps assess the company's competitive position and provides insight into management's ability to control all aspects of the business.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do creditors use Net Profit Margin?</h4>
              <p className="text-muted-foreground">
                Creditors use net profit margin to assess the company's ability to generate profits and service debt. Higher margins suggest better debt service capability and lower credit risk. Creditors often require minimum net profit margin levels in loan covenants to ensure borrowers maintain adequate profitability.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}