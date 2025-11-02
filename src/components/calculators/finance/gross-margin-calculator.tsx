'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, Percent, Shield, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  revenue: z.number().positive(),
  cogs: z.number().nonnegative(),
});

type FormValues = z.infer<typeof formSchema>;

export default function GrossMarginCalculator() {
  const [result, setResult] = useState<{ 
    margin: number; 
    interpretation: string; 
    efficiencyLevel: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      revenue: undefined,
      cogs: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.revenue == null || v.cogs == null) return null;
    return ((v.revenue - v.cogs) / v.revenue) * 100;
  };

  const interpret = (margin: number) => {
    if (margin >= 50) return 'Excellent gross margin with strong pricing power and cost control.';
    if (margin >= 40) return 'Good gross margin with healthy profitability.';
    if (margin >= 30) return 'Adequate gross margin but monitor cost structure.';
    if (margin >= 20) return 'Marginal gross margin - pricing and cost concerns.';
    return 'Poor gross margin - immediate pricing and cost issues.';
  };

  const getEfficiencyLevel = (margin: number) => {
    if (margin >= 50) return 'Excellent';
    if (margin >= 40) return 'Good';
    if (margin >= 30) return 'Adequate';
    if (margin >= 20) return 'Marginal';
    return 'Poor';
  };

  const getRecommendation = (margin: number) => {
    if (margin >= 50) return 'Maintain pricing excellence and consider premium positioning.';
    if (margin >= 40) return 'Continue current pricing strategy and optimize costs.';
    if (margin >= 30) return 'Focus on pricing optimization and cost reduction.';
    if (margin >= 20) return 'Urgent need to improve pricing and reduce direct costs.';
    return 'Critical situation - immediate pricing and cost restructuring required.';
  };

  const getStrength = (margin: number) => {
    if (margin >= 50) return 'Very Strong';
    if (margin >= 40) return 'Strong';
    if (margin >= 30) return 'Moderate';
    if (margin >= 20) return 'Weak';
    return 'Very Weak';
  };

  const getInsights = (margin: number) => {
    const insights = [];
    if (margin >= 50) {
      insights.push('Exceptional pricing power');
      insights.push('Strong competitive advantage');
      insights.push('Excellent cost management');
    } else if (margin >= 40) {
      insights.push('Healthy pricing strategy');
      insights.push('Good cost control');
      insights.push('Strong market position');
    } else if (margin >= 30) {
      insights.push('Adequate pricing strategy');
      insights.push('Room for cost optimization');
      insights.push('Monitor competitive position');
    } else if (margin >= 20) {
      insights.push('Marginal pricing power');
      insights.push('High sensitivity to cost changes');
      insights.push('Urgent need for pricing improvements');
    } else {
      insights.push('Poor pricing power');
      insights.push('Immediate cost management issues');
      insights.push('Critical pricing strategy problems');
    }
    return insights;
  };

  const getConsiderations = (margin: number) => {
    const considerations = [];
    considerations.push('Industry benchmarks vary significantly');
    considerations.push('Seasonal businesses may have fluctuating margins');
    considerations.push('Raw material costs can impact margins');
    considerations.push('Compare with historical performance');
    considerations.push('Consider competitive pricing pressures');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const margin = calculate(values);
    if (margin !== null) {
      setResult({
        margin,
        interpretation: interpret(margin),
        efficiencyLevel: getEfficiencyLevel(margin),
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
            <TrendingUp className="h-6 w-6 text-primary" />
            <CardTitle>Gross Margin Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate your company's gross margin to assess pricing power and cost efficiency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <FormField control={form.control} name="cogs" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Cost of Goods Sold (COGS)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter COGS" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Gross Margin
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
                  <CardTitle>Gross Margin Result</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={result.efficiencyLevel === 'Excellent' ? 'default' : result.efficiencyLevel === 'Good' ? 'secondary' : 'destructive'}>
                    {result.efficiencyLevel}
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
            <Link href="/category/finance/operating-margin-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Operating Margin</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/net-profit-margin-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Percent className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Net Profit Margin</p>
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
    <meta itemProp="name" content="The Definitive Guide to Gross Margin Calculation, Interpretation, and Core Profitability Analysis" />
    <meta itemProp="description" content="An expert guide detailing the Gross Margin formula, its role in assessing a company's production efficiency and pricing power, and its crucial distinction from Operating Margin and Net Margin." />
    <meta itemProp="keywords" content="gross margin formula explained, calculating gross profit, cost of goods sold COGS analysis, production efficiency metric, pricing power finance, gross profit margin vs operating margin" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-11-02" /> 
    <meta itemProp="url" content="/definitive-gross-margin-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Gross Margin: Measuring Core Production Profitability</h1>
    <p className="text-lg italic text-gray-700">Master the essential metric that reveals how much profit a company retains from sales after paying the direct costs of manufacturing or acquiring goods.</p>
    

[Image of Gross Margin ratio diagram showing Gross Profit over Revenue]


    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#definition" className="hover:underline">Gross Margin: Definition and Core Purpose</a></li>
        <li><a href="#calculation" className="hover:underline">The Gross Margin Formula and Components</a></li>
        <li><a href="#cogs" className="hover:underline">Detailed Analysis of Cost of Goods Sold (COGS)</a></li>
        <li><a href="#comparison" className="hover:underline">Comparison to Operating Margin and Net Margin</a></li>
        <li><a href="#applications" className="hover:underline">Interpretation, Benchmarking, and Strategic Use</a></li>
    </ul>
<hr />

    {/* GROSS MARGIN: DEFINITION AND CORE PURPOSE */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Gross Margin: Definition and Core Purpose</h2>
    <p>The **Gross Margin** is a fundamental profitability metric that measures the percentage of revenue remaining after deducting the Cost of Goods Sold (COGS). It reflects a company's efficiency at producing a product or service and its pricing power in the market.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Focus on Direct Costs</h3>
    <p>The Gross Margin calculation strictly focuses on **direct costs** associated with production. It is the first measure of profit on the Income Statement and is crucial because it isolates the core profitability of the product itself, before overhead costs like rent, salaries, or marketing expenses are factored in.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Indicator of Pricing Power</h3>
    <p>A consistently high Gross Margin suggests two things:</p>
    <ol className="list-decimal ml-6 space-y-2">
        <li>The company can command a premium price for its goods due to a strong brand or unique features (**pricing power**).</li>
        <li>The company has achieved efficient production or purchasing of its raw materials, keeping COGS low.</li>
    </ol>
    <p>Conversely, a falling Gross Margin signals intense competition or rising raw material costs that the company cannot pass on to consumers.</p>

<hr />

    {/* THE GROSS MARGIN FORMULA AND COMPONENTS */}
    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Gross Margin Formula and Components</h2>
    <p>The Gross Margin is calculated in two steps: first finding the Gross Profit, and then expressing that profit as a percentage of Net Sales (Revenue).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Step 1: Calculating Gross Profit</h3>
    <p>Gross Profit is the dollar amount remaining after deducting COGS from revenue:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Gross Profit = Net Sales - Cost of Goods Sold (COGS)'}
        </p>
    </div>
    <p>Net Sales is the total revenue generated from sales, minus returns and discounts.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Step 2: Calculating Gross Margin Percentage</h3>
    <p>The Gross Margin Percentage expresses the Gross Profit as a percentage of the revenue generated:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Gross Margin % = (Gross Profit / Net Sales) * 100'}
        </p>
    </div>

<hr />

    {/* DETAILED ANALYSIS OF COST OF GOODS SOLD (COGS) */}
    <h2 id="cogs" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Detailed Analysis of Cost of Goods Sold (COGS)</h2>
    <p>COGS is the most variable and scrutinized component of the Gross Margin calculation. It includes all direct costs necessary to bring a product or service to a sellable state.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Components of COGS (for Manufacturing)</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Direct Materials:</strong> The raw goods that physically make up the product (e.g., steel for a car, fabric for a shirt).</li>
        <li><strong className="font-semibold">Direct Labor:</strong> The wages paid to employees who physically assemble or create the product.</li>
        <li><strong className="font-semibold">Manufacturing Overhead:</strong> Factory costs directly tied to production, such as utilities, maintenance, and factory depreciation.</li>
    </ul>
    <p>COGS explicitly excludes indirect costs, such as marketing, administrative salaries, and rent for the headquarters, which are categorized as operating expenses below the Gross Profit line.</p>

<hr />

    {/* COMPARISON TO OPERATING MARGIN AND NET MARGIN */}
    <h2 id="comparison" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Comparison to Operating Margin and Net Margin</h2>
    <p>Gross Margin is distinct from the other two major profit margins, providing a specific layer of insight into business efficiency.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Gross Margin vs. Operating Margin</h3>
    <p>The difference between the Gross Margin and the Operating Margin lies in **Operating Expenses (OpEx)** (SG&A, R&D). A company can maintain a high Gross Margin but fail to translate it into a high Operating Margin if its overhead is excessive (e.g., poor marketing or administrative cost control).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Gross Margin vs. Net Margin</h3>
    <p>Net Margin is the "bottom line" profit after **all** expenses are deducted, including taxes and interest. Gross Margin is always the highest percentage profit because it has the fewest costs subtracted. A positive Gross Margin is required for a company to have a chance at having a positive Net Margin.</p>
    <p>The sequence shows efficiency reduction: **Gross Margin** ($\to$ Production Efficiency) $\to$ **Operating Margin** ($\to$ Management Efficiency) $\to$ **Net Margin** ($\to$ Financial Efficiency).</p>

<hr />

    {/* INTERPRETATION, BENCHMARKING, AND STRATEGIC USE */}
    <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpretation, Benchmarking, and Strategic Use</h2>
    <p>Gross Margin is a primary tool for benchmarking competitors and for internal operational control.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Industry Variations</h3>
    <p>The acceptable Gross Margin percentage varies significantly by sector:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li>**High Margins (e.g., Software, Luxury Goods):** Often 70% to 90%. High margins compensate for high fixed costs (R&D) or reflect strong brand differentiation.</li>
        <li>**Low Margins (e.g., Grocery Retail, Airlines):** Often 20% to 30%. Low margins are offset by high sales volumes and rapid inventory turnover.</li>
    </ul>
    <p>A change in Gross Margin is a strong signal of a shift in competitive dynamics or raw material costs, forcing management to adjust pricing or supply chain strategy.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Strategic Margin Management</h3>
    <p>Management actively seeks to improve Gross Margin through: 1) Negotiating lower prices with suppliers, 2) Improving manufacturing yield and efficiency, or 3) Raising the sales price to the customer.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Gross Margin is the indispensable metric for measuring a company's fundamental **production efficiency and pricing power**, calculated by deducting the Cost of Goods Sold (COGS) from Net Sales.</p>
    <p>The resulting percentage reveals the viability of the core business model before overhead is considered. Continuous monitoring and improvement of the Gross Margin are essential for sustaining profitability and maintaining a competitive edge in any market.</p>
</section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about Gross Margin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is Gross Margin?</h4>
              <p className="text-muted-foreground">
                Gross Margin is a profitability ratio that measures how much profit a company makes on each dollar of sales after accounting for the direct costs of producing goods or services. It's calculated as (Revenue - COGS) ÷ Revenue × 100, expressed as a percentage.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is considered a good Gross Margin?</h4>
              <p className="text-muted-foreground">
                Good gross margins vary by industry. Generally, margins above 40% are considered good, above 50% are excellent, and above 30% are adequate. Technology companies often have high margins (60-80%), while retail companies typically have lower margins (20-30%). Always compare within the same industry.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate Gross Margin?</h4>
              <p className="text-muted-foreground">
                The formula is: Gross Margin = ((Revenue - COGS) ÷ Revenue) × 100. Revenue is the total sales amount, and COGS includes direct costs like materials, labor, and manufacturing overhead. Both figures are found on the income statement.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does negative Gross Margin mean?</h4>
              <p className="text-muted-foreground">
                A negative gross margin means the company is selling products for less than it costs to produce them. This indicates serious pricing or cost management problems and is unsustainable in the long term. It requires immediate attention to pricing strategy or cost reduction.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Do Gross Margins vary by industry?</h4>
              <p className="text-muted-foreground">
                Yes, gross margins vary significantly by industry. Software companies often have high margins due to low production costs. Manufacturing companies typically have moderate margins. Retail companies usually have lower margins due to high competition. Always compare within the same industry for meaningful analysis.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of Gross Margin?</h4>
              <p className="text-muted-foreground">
                Gross margin only considers direct production costs and doesn't include operating expenses, interest, or taxes. It's a snapshot in time and doesn't reflect seasonal variations. It doesn't account for the quality of products or services. Compare with historical performance for better insights.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How can a company improve its Gross Margin?</h4>
              <p className="text-muted-foreground">
                Companies can improve gross margin by increasing prices, reducing COGS through better supplier negotiations, improving production efficiency, reducing waste, or focusing on higher-margin products. However, these strategies should be balanced with market competitiveness and customer satisfaction.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does Gross Margin differ from Operating Margin?</h4>
              <p className="text-muted-foreground">
                Gross Margin only considers direct production costs (COGS), while Operating Margin includes all operating expenses (SG&A, R&D, etc.). Gross Margin focuses on production efficiency, while Operating Margin reflects overall operational management. Operating Margin is always lower than Gross Margin.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is Gross Margin important for investors?</h4>
              <p className="text-muted-foreground">
                For investors, gross margin indicates pricing power, cost efficiency, and competitive advantage. Higher margins suggest better ability to generate profits and weather cost increases. It helps assess the company's competitive positioning and management's effectiveness in pricing and cost control.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do creditors use Gross Margin?</h4>
              <p className="text-muted-foreground">
                Creditors use gross margin to assess the company's ability to generate profits from core operations and service debt. Higher margins suggest better debt service capability and lower credit risk. Creditors often monitor gross margin trends to identify potential financial stress early.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}