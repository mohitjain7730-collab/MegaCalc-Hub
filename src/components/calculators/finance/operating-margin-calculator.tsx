'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, Percent, Shield, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  operatingIncome: z.number(),
  revenue: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function OperatingMarginCalculator() {
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
      operatingIncome: undefined,
      revenue: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.operatingIncome == null || v.revenue == null) return null;
    return (v.operatingIncome / v.revenue) * 100;
  };

  const interpret = (margin: number) => {
    if (margin >= 20) return 'Excellent operating efficiency with strong profitability.';
    if (margin >= 15) return 'Good operating efficiency with healthy profitability.';
    if (margin >= 10) return 'Adequate operating efficiency but room for improvement.';
    if (margin >= 5) return 'Marginal operating efficiency - operational concerns.';
    return 'Poor operating efficiency - immediate operational issues.';
  };

  const getEfficiencyLevel = (margin: number) => {
    if (margin >= 20) return 'Excellent';
    if (margin >= 15) return 'Good';
    if (margin >= 10) return 'Adequate';
    if (margin >= 5) return 'Marginal';
    return 'Poor';
  };

  const getRecommendation = (margin: number) => {
    if (margin >= 20) return 'Maintain operational excellence and consider strategic investments.';
    if (margin >= 15) return 'Continue current operations and optimize efficiency further.';
    if (margin >= 10) return 'Focus on cost reduction and operational improvements.';
    if (margin >= 5) return 'Urgent need to improve operational efficiency and reduce costs.';
    return 'Critical situation - immediate operational restructuring required.';
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
      insights.push('Exceptional operational efficiency');
      insights.push('Strong competitive advantage');
      insights.push('Excellent cost management');
    } else if (margin >= 15) {
      insights.push('Healthy operational efficiency');
      insights.push('Good cost control');
      insights.push('Strong market position');
    } else if (margin >= 10) {
      insights.push('Adequate operational efficiency');
      insights.push('Room for cost optimization');
      insights.push('Monitor competitive position');
    } else if (margin >= 5) {
      insights.push('Marginal operational efficiency');
      insights.push('High sensitivity to cost changes');
      insights.push('Urgent need for operational improvements');
    } else {
      insights.push('Poor operational efficiency');
      insights.push('Immediate operational distress');
      insights.push('Critical cost management issues');
    }
    return insights;
  };

  const getConsiderations = (margin: number) => {
    const considerations = [];
    considerations.push('Industry benchmarks vary significantly');
    considerations.push('Seasonal businesses may have fluctuating margins');
    considerations.push('One-time items can distort operating income');
    considerations.push('Compare with historical performance');
    considerations.push('Consider economic cycles and market conditions');
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
            <BarChart3 className="h-6 w-6 text-primary" />
            <CardTitle>Operating Margin Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate your company's operating margin to assess operational efficiency and profitability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="operatingIncome" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Operating Income (EBIT)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter operating income" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="revenue" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Percent className="h-4 w-4" />
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
                Calculate Operating Margin
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
                  <CardTitle>Operating Margin Result</CardTitle>
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
            <Link href="/category/finance/gross-margin-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Gross Margin</p>
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

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Operating Margin Calculation, Interpretation, and Core Profitability Analysis" />
    <meta itemProp="description" content="An expert guide detailing the Operating Margin formula, its role in assessing a company's core operational profitability and efficiency, its comparison to Net Margin and Gross Margin, and its use in benchmarking and competitive analysis." />
    <meta itemProp="keywords" content="operating margin formula explained, calculating operating profit margin, EBIT margin analysis, core profitability metric, sales efficiency ratio, gross margin vs operating margin" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-11-02" /> 
    <meta itemProp="url" content="/definitive-operating-margin-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Operating Margin: Measuring Core Operational Profitability</h1>
    <p className="text-lg italic text-muted-foreground">Master the essential metric that reveals how efficiently a company converts its revenue into pure profit before accounting for financing costs and taxes.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#definition" className="hover:underline">Operating Margin: Definition and Significance</a></li>
        <li><a href="#calculation" className="hover:underline">The Operating Margin Formula and Components</a></li>
        <li><a href="#comparison" className="hover:underline">Comparison to Gross Margin and Net Margin</a></li>
        <li><a href="#interpretation" className="hover:underline">Interpreting the Margin and Industry Benchmarks</a></li>
        <li><a href="#management" className="hover:underline">Operational Efficiency and Margin Management</a></li>
    </ul>
<hr />

    {/* OPERATING MARGIN: DEFINITION AND SIGNIFICANCE */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Operating Margin: Definition and Significance</h2>
    <p>The **Operating Margin** is a key profitability ratio that measures the percentage of revenue remaining after deducting the Cost of Goods Sold (COGS) and all operating expenses (SG&A, R&D). It reflects a company's ability to generate income from its core business operations alone.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Focus on Core Operations</h3>
    <p>The Operating Margin is considered a purer measure of management's efficiency than Net Margin because it excludes costs and revenues outside of the main business activities. Specifically, it ignores the impact of:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li>**Financing:** Interest expense and interest income.</li>
        <li>**Taxes:** Corporate income tax rates.</li>
        <li>**Non-Operating Items:** Gains or losses from selling assets.</li>
    </ul>
    <p>By excluding these external factors, the Operating Margin provides a clean, apples-to-apples comparison of the efficiency of different business units or competitors.</p>

<hr />

    {/* THE OPERATING MARGIN FORMULA AND COMPONENTS */}
    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Operating Margin Formula and Components</h2>
    <p>The Operating Margin is calculated by dividing the Operating Income by Net Sales (Revenue).</p>
    
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'Operating Margin = (Operating Income / Net Sales) * 100'}
        </p>
    </div>
    

    <h3 className="text-xl font-semibold text-foreground mt-6">Calculating Operating Income (EBIT)</h3>
    <p>**Operating Income** is synonymous with Earnings Before Interest and Taxes (**EBIT**). It is calculated by taking Gross Profit and subtracting all Operating Expenses:</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'Operating Income = Gross Profit - Operating Expenses (SG&A + R&D)'}
        </p>
    </div>
    <p>Operating Expenses include Selling, General, and Administrative expenses (SG&A), such as salaries, rent, marketing, and Research and Development (R&D).</p>

<hr />

    {/* COMPARISON TO GROSS MARGIN AND NET MARGIN */}
    <h2 id="comparison" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Comparison to Gross Margin and Net Margin</h2>
    <p>The Operating Margin sits between the Gross Margin and the Net Margin on the Income Statement, providing a focused view of efficiency at different stages of the value chain.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Gross Margin (Efficiency of Production)</h3>
    <p>Gross Margin measures profitability *before* operating expenses. It reveals the core markup on goods sold and the efficiency of the production process (Cost of Goods Sold). A company can have a high Gross Margin but a poor Operating Margin if its overhead is too high.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Net Margin (Final Bottom Line)</h3>
    <p>Net Margin measures the final profit percentage after **all** expenses are paid, including interest and taxes. While Net Margin is the final measure of overall profitability, Operating Margin is a better predictor of **future performance** because it focuses on core, repeatable efficiency, independent of non-operating costs like debt and tax strategy.</p>
    <p>The sequential relationship is: **Gross Margin** $\to$ **Operating Margin** $\to$ **Net Margin**.</p>

<hr />

    {/* INTERPRETING THE MARGIN AND INDUSTRY BENCHMARKS */}
    <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting the Margin and Industry Benchmarks</h2>
    <p>A higher Operating Margin is almost always desirable, as it indicates better operational leverage and superior management efficiency. Interpretation must be done relative to industry norms.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Interpretation Guidelines</h3>
    <ul className="list-disc ml-6 space-y-2">
    <li><strong className="font-semibold">High Margin:</strong> Indicates strong pricing power (ability to charge high prices) or excellent cost control. Common in high-value industries like software (often &gt;25%).</li>
    <li><strong className="font-semibold">Low Margin:</strong> Indicates high competitive pressure and low pricing power. Common in large-volume, low-markup industries like grocery retail (often &lt;5%).</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Benchmarking and Competitive Analysis</h3>
    <p>The Operating Margin is the most effective metric for comparing competitors because it eliminates distortions caused by differences in capital structure (debt load) and geographic tax rates. If Company A has a 15% Operating Margin and Company B has 10%, Company A is generating more core profit per dollar of sales, regardless of their debt levels.</p>

<hr />

    {/* OPERATIONAL EFFICIENCY AND MARGIN MANAGEMENT */}
    <h2 id="management" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Operational Efficiency and Margin Management</h2>
    <p>Management actively seeks to improve the Operating Margin through strategic control of two levers: pricing and operational expenses.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Strategies for Margin Expansion</h3>
    <ol className="list-decimal ml-6 space-y-2">
        <li><strong className="font-semibold">Price Optimization:</strong> Increasing sales prices without losing significant volume (requires product differentiation or market dominance).</li>
        <li><strong className="font-semibold">Cost of Goods Sold (COGS) Reduction:</strong> Negotiating lower input costs, improving supply chain efficiency, or optimizing manufacturing processes.</li>
        <li><strong className="font-semibold">Scaling SG&A:</strong> Achieving operational leverage by growing revenue faster than fixed operating costs (SG&A). For example, doubling sales without doubling the rent or administrative staff significantly boosts the operating margin.</li>
    </ol>
    <p>Continuous margin improvement is the clearest sign of a successful business model and effective management.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Operating Margin is the crucial profitability metric that isolates the efficiency of a company’s **core business model**, calculated by dividing Operating Income (EBIT) by Net Sales.</p>
    <p>The resulting percentage reveals how effectively management controls costs and extracts profit from every dollar of revenue before external factors intervene. It is the preferred metric for **competitive benchmarking**, as it provides a clean, repeatable measure of operational prowess independent of debt and tax strategies.</p>
</section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about Operating Margin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is Operating Margin?</h4>
              <p className="text-muted-foreground">
                Operating Margin is a profitability ratio that measures how much profit a company makes on each dollar of sales after paying for variable costs of production but before paying interest or tax. It's calculated as Operating Income divided by Revenue, expressed as a percentage.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is considered a good Operating Margin?</h4>
              <p className="text-muted-foreground">
                Good operating margins vary by industry. Generally, margins above 15% are considered good, above 20% are excellent, and above 10% are adequate. Technology companies often have higher margins (20-30%), while retail companies typically have lower margins (2-5%). Always compare within the same industry.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate Operating Margin?</h4>
              <p className="text-muted-foreground">
                The formula is: Operating Margin = (Operating Income ÷ Revenue) × 100. Operating Income (EBIT) is found on the income statement and represents profit from core operations. Revenue is the total sales amount, also found at the top of the income statement.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does negative Operating Margin mean?</h4>
              <p className="text-muted-foreground">
                A negative operating margin means the company is losing money on its core operations before interest and taxes. This indicates serious operational problems, such as high costs, low prices, or inefficient operations. It's a warning sign that requires immediate attention to operational restructuring.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Do Operating Margins vary by industry?</h4>
              <p className="text-muted-foreground">
                Yes, operating margins vary significantly by industry. Technology companies often have high margins due to scalable business models. Retail companies typically have low margins due to high competition and costs. Manufacturing companies usually have moderate margins. Always compare within the same industry for meaningful analysis.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of Operating Margin?</h4>
              <p className="text-muted-foreground">
                Operating margin doesn't account for interest, taxes, or non-operating items. It's a snapshot in time and doesn't reflect seasonal variations. One-time charges can distort the calculation. It doesn't consider the quality of revenue or future growth prospects. Compare with historical performance for better insights.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How can a company improve its Operating Margin?</h4>
              <p className="text-muted-foreground">
                Companies can improve operating margin by increasing revenue through price increases or volume growth, reducing operating costs through efficiency improvements, optimizing supply chains, automating processes, or renegotiating supplier contracts. However, these strategies should be balanced with long-term growth objectives.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does Operating Margin differ from Gross Margin?</h4>
              <p className="text-muted-foreground">
                Gross Margin only considers direct costs of goods sold, while Operating Margin includes all operating expenses (SG&A, R&D, etc.). Operating Margin provides a more comprehensive view of operational efficiency. Gross Margin focuses on production efficiency, while Operating Margin reflects overall operational management.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is Operating Margin important for investors?</h4>
              <p className="text-muted-foreground">
                For investors, operating margin indicates operational efficiency and competitive advantage. Higher margins suggest better cost management and pricing power. It helps assess the company's ability to generate profits from operations and provides insight into management's operational effectiveness and competitive positioning.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do creditors use Operating Margin?</h4>
              <p className="text-muted-foreground">
                Creditors use operating margin to assess the company's ability to generate operating profits and service debt. Higher margins suggest better debt service capability and lower credit risk. Creditors often require minimum operating margin levels in loan covenants to ensure borrowers maintain adequate operational profitability.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
