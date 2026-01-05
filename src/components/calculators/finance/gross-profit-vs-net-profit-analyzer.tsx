'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, TrendingUp, TrendingDown, FunctionSquare, CheckCircle2, Users, Briefcase, AlertTriangle, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  revenue: z.number().positive('Revenue must be a positive number'),
  cogs: z.number().min(0, 'COGS cannot be negative'),
  operatingExpenses: z.number().min(0, 'Operating expenses cannot be negative'),
  interestExpense: z.number().min(0, 'Interest expense cannot be negative'),
  taxes: z.number().min(0, 'Taxes cannot be negative'),
});

type FormValues = z.infer<typeof formSchema>;

export default function GrossProfitVsNetProfitAnalyzer() {
  const [result, setResult] = useState<{
    grossProfit: number;
    grossMargin: number;
    operatingProfit: number;
    operatingMargin: number;
    netProfit: number;
    netMargin: number;
    efficiencyRating: string;
    profitabilityHealth: string;
    recommendation: string;
    insights: string[];
    riskFactors: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      revenue: undefined,
      cogs: undefined,
      operatingExpenses: undefined,
      interestExpense: undefined,
      taxes: undefined,
    },
  });

  const getEfficiencyRating = (grossMargin: number, netMargin: number) => {
    // This is a simplified logic relative to general business; adjustments vary by industry
    if (netMargin >= 20) return 'Excellent';
    if (netMargin >= 10) return 'Good';
    if (netMargin >= 5) return 'Average';
    if (netMargin > 0) return 'Fair';
    return 'Poor';
  };

  const getProfitabilityHealth = (netMargin: number) => {
    if (netMargin >= 20) return 'Very Strong';
    if (netMargin >= 15) return 'Strong';
    if (netMargin >= 10) return 'Healthy';
    if (netMargin >= 5) return 'Stable';
    if (netMargin >= 0) return 'Marginal';
    return 'Critical';
  };

  const getRecommendation = (grossMargin: number, netMargin: number, operatingMargin: number) => {
    if (netMargin < 0) return 'Immediate action required to stop losses. Review cost structure and pricing strategy.';
    if (grossMargin < 20) return 'Focus on direct costs (COGS) and pricing. Your core product profitability is low.';
    if (operatingMargin < 5) return 'High operating expenses are eating your profits. Look for efficiency gains in overhead.';
    if (netMargin < 5) return 'Healthy operations, but financial costs or taxes are significant. Investigate tax planning or debt restructuring.';
    return 'Strong profitability. Consider reinvesting profits into growth or building cash reserves.';
  };

  const calculate = (v: FormValues) => {
    const grossProfit = v.revenue - v.cogs;
    const operatingProfit = grossProfit - v.operatingExpenses;
    const netProfit = operatingProfit - v.interestExpense - v.taxes;

    const grossMargin = (grossProfit / v.revenue) * 100;
    const operatingMargin = (operatingProfit / v.revenue) * 100;
    const netMargin = (netProfit / v.revenue) * 100;

    const insights = [];
    if (grossMargin > 50) insights.push('High gross margin indicates strong pricing power or low production costs.');
    else if (grossMargin < 20) insights.push('Low gross margin suggests high competition or inefficient production.');

    if (operatingMargin < grossMargin / 2) insights.push('Operating expenses are consuming a large portion of your gross profit.');

    if (v.interestExpense > operatingProfit * 0.3) insights.push('Interest payments are significantly impacting your bottom line.');

    const riskFactors = [];
    if (netMargin < 0) riskFactors.push('Business is operating at a net loss.');
    if (grossMargin < 10) riskFactors.push('Very thin gross margins leave little room for error.');
    if (v.interestExpense > operatingProfit) riskFactors.push('Interest coverage is critical; operating profit cannot cover interest.');

    setResult({
      grossProfit,
      grossMargin,
      operatingProfit,
      operatingMargin,
      netProfit,
      netMargin,
      efficiencyRating: getEfficiencyRating(grossMargin, netMargin),
      profitabilityHealth: getProfitabilityHealth(netMargin),
      recommendation: getRecommendation(grossMargin, netMargin, operatingMargin),
      insights,
      riskFactors
    });
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Profitability Inputs
          </CardTitle>
          <CardDescription>
            Enter your income statement figures to analyze profit levels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(calculate)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="revenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Total Revenue ($)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g. 500000" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cogs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Cost of Goods Sold (COGS) ($)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g. 200000" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="operatingExpenses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Operating Expenses ($)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g. 150000" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
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
                        <DollarSign className="h-4 w-4" />
                        Interest Expense ($)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g. 10000" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="taxes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Taxes ($)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g. 40000" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Analyze Profitability
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Landmark className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Profit Analysis Results</CardTitle>
                  <CardDescription>Breakdown of your margins from top to bottom</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="p-4 bg-muted/30 rounded-lg border">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Gross Profit</p>
                  <p className="text-3xl font-bold text-primary my-1">${result.grossProfit.toLocaleString()}</p>
                  <Badge variant="outline" className="bg-primary/10 text-primary hover:bg-primary/20">{result.grossMargin.toFixed(2)}% Margin</Badge>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Operating Profit</p>
                  <p className="text-3xl font-bold text-foreground my-1">${result.operatingProfit.toLocaleString()}</p>
                  <Badge variant="outline" className="bg-foreground/5">{result.operatingMargin.toFixed(2)}% Margin</Badge>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg border">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Net Profit</p>
                  <p className={`text-3xl font-bold my-1 ${result.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>${result.netProfit.toLocaleString()}</p>
                  <Badge variant={result.netProfit >= 0 ? "default" : "destructive"}>{result.netMargin.toFixed(2)}% Margin</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Efficiency Rating</p>
                  <Badge variant={result.efficiencyRating === 'Excellent' || result.efficiencyRating === 'Good' ? 'default' : result.efficiencyRating === 'Average' ? 'secondary' : 'destructive'}>
                    {result.efficiencyRating}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Profitability Health</p>
                  <Badge variant={result.profitabilityHealth === 'Very Strong' || result.profitabilityHealth === 'Strong' || result.profitabilityHealth === 'Healthy' ? 'default' : 'destructive'}>
                    {result.profitabilityHealth}
                  </Badge>
                </div>
              </div>

              <Alert variant={result.netProfit >= 0 ? "default" : "destructive"}>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Recommendation:</strong> {result.recommendation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Target className="h-6 w-6" />
                  Smart Insights
                </CardTitle>
                <CardDescription>Key takeaways from your data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm font-medium">{insight}</span>
                  </div>
                ))}
                {result.insights.length === 0 && <p className="text-sm text-muted-foreground">No specific insights generated based on these values.</p>}
              </CardContent>
            </Card>

            <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/20 dark:bg-red-900/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400">
                  <AlertCircle className="h-6 w-6" />
                  Risk Factors
                </CardTitle>
                <CardDescription>Potential issues to address</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.riskFactors.map((factor, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">{factor}</span>
                  </div>
                ))}
                {result.riskFactors.length === 0 && <p className="text-sm text-green-600">No critical risk factors checked.</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Understanding the Inputs */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
          <CardDescription>
            Definitions of the key financial terms used in this calculator.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Revenue
              </h4>
              <p className="text-sm text-muted-foreground">
                The total amount of money generated from the sale of goods or services before any expenses are deducted. Also known as "top line" or "sales".
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                COGS (Cost of Goods Sold)
              </h4>
              <p className="text-sm text-muted-foreground">
                The direct costs attributable to the production of the goods sold in a company. Includes material cost and direct labor.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-primary" />
                Operating Expenses (OpEx)
              </h4>
              <p className="text-sm text-muted-foreground">
                Expenses incurred during normal business operations that are not part of COGS, such as rent, marketing, payroll, and insurance.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Landmark className="h-4 w-4 text-primary" />
                Interest & Taxes
              </h4>
              <p className="text-sm text-muted-foreground">
                Non-operating costs. Interest is the cost of borrowing money. Taxes are mandatory contributions to state and federal revenue.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formula Used */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FunctionSquare className="h-5 w-5" />
            Profit Formulas Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto space-y-2">
            <p className="font-mono text-sm">
              <strong>Gross Profit</strong> = Revenue - COGS
            </p>
            <p className="font-mono text-sm">
              <strong>Operating Profit</strong> = Gross Profit - Operating Expenses
            </p>
            <p className="font-mono text-sm">
              <strong>Net Profit</strong> = Operating Profit - Interest - Taxes
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            These formulas represent the step-down approach of an income statement, isolating profitability at each stage of the business's operations.
          </p>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>
            Compare other profitability metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/net-profit-margin-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Net Profit Margin</p>
                      <p className="text-sm text-muted-foreground">Bottom line analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/gross-margin-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Gross Margin Ratio</p>
                      <p className="text-sm text-muted-foreground">Production efficiency</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/return-on-investment-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">ROI Calculator</p>
                      <p className="text-sm text-muted-foreground">Investment returns</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/operating-margin-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Operating Margin</p>
                      <p className="text-sm text-muted-foreground">Operational efficiency</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/ebitda-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Calculator className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">EBITDA Calculator</p>
                      <p className="text-sm text-muted-foreground">Earnings before interest/tax</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/break-even-point-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Break-Even Point</p>
                      <p className="text-sm text-muted-foreground">Zero profit threshold</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Comprehensive Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="Gross Profit vs Net Profit: A Comprehensive Guide to Profitability Analysis" />
        <meta itemProp="description" content="Master the difference between gross profit and net profit. Learn how to calculate, interpret, and optimize these critical financial metrics." />
        <meta itemProp="author" content="Financial Analyst Team" />
        <meta itemProp="datePublished" content="2025-09-15" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Gross Profit vs Net Profit: The Definitive Guide for Business Owners</h1>
        <p className="text-lg italic text-muted-foreground">Understanding the "Top Line" vs. the "Bottom Line" is fundamental to financial literacy. This guide breaks down every layer of profitability.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#definitions" className="hover:underline">Defining the Core Concepts</a></li>
          <li><a href="#key-differences" className="hover:underline">Key Differences Explained</a></li>
          <li><a href="#calculations" className="hover:underline">Detailed Calculation Methods</a></li>
          <li><a href="#strategies" className="hover:underline">Strategies to Improve Margins</a></li>
          <li><a href="#industry-benchmarks" className="hover:underline">Industry Benchmarks</a></li>
        </ul>
        <hr className="my-6" />

        <h2 id="definitions" className="text-2xl font-bold text-foreground pt-8">Definitions: The Layers of Profit</h2>
        <p>In the world of finance, "profit" isn't just one number. It's a series of cascading metrics that reveal how efficiently a company operates at different stages. The two most critical bookends of this cascade are <strong>Gross Profit</strong> and <strong>Net Profit</strong>.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">What is Gross Profit?</h3>
        <p>Gross Profit represents the earnings generated directly from a company's core products or services. It is calculated as <strong>Revenue minus Cost of Goods Sold (COGS)</strong>. It answers the question: <em>"Did we make money on the specific item we sold?"</em></p>
        <p className="mt-2">It ignores all administrative costs, marketing, rent, and taxes. It only cares about the direct costs of production—materials and direct labor.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">What is Net Profit?</h3>
        <p>Net Profit, often called the "bottom line," is the final profit remaining after <strong>ALL</strong> expenses have been paid. This includes COGS, operating expenses (rent, salaries, utilities, marketing), interest on debt, and government taxes.</p>
        <p className="mt-2">It answers the question: <em>"Is the business as a whole viable?"</em> A company can have high gross profit but negative net profit if its overhead is too bloated.</p>

        <hr className="my-6" />

        <h2 id="key-differences" className="text-2xl font-bold text-foreground pt-8">Key Differences Between Gross and Net Profit</h2>
        <p>While both metrics measure financial success, they serve different analytical purposes:</p>

        <div className="overflow-x-auto my-6">
          <table className="w-full text-sm text-left border rounded-lg">
            <thead className="text-xs uppercase bg-muted text-foreground">
              <tr>
                <th className="px-6 py-3">Feature</th>
                <th className="px-6 py-3">Gross Profit</th>
                <th className="px-6 py-3">Net Profit</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-card border-b">
                <td className="px-6 py-4 font-medium">Scope</td>
                <td className="px-6 py-4">Direct production costs only</td>
                <td className="px-6 py-4">All business expenses included</td>
              </tr>
              <tr className="bg-card border-b">
                <td className="px-6 py-4 font-medium">Focus</td>
                <td className="px-6 py-4">Production efficiency & pricing</td>
                <td className="px-6 py-4">Overall business health & viability</td>
              </tr>
              <tr className="bg-card border-b">
                <td className="px-6 py-4 font-medium">Volatility</td>
                <td className="px-6 py-4">More stable (tied to sales volume)</td>
                <td className="px-6 py-4">Volatile (affected by one-time costs, interest, tax)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 id="calculations" className="text-2xl font-bold text-foreground pt-8">The Income Statement Cascade</h2>
        <p>To truly understand the relationship, visualize the Income Statement as a waterfall:</p>
        <ol className="list-decimal ml-6 space-y-4 mt-4">
          <li><strong>Total Revenue:</strong> All money coming in.</li>
          <li><strong>(-) COGS:</strong> Subtract direct costs.
            <br /><em className="text-primary font-semibold">= Gross Profit</em>
          </li>
          <li><strong>(-) Operating Expenses:</strong> Subtract rent, salaries, marketing.
            <br /><em className="text-primary font-semibold">= Operating Profit (EBIT)</em>
          </li>
          <li><strong>(-) Interest & Taxes:</strong> Subtract debt costs and government payments.
            <br /><em className="text-primary font-semibold">= Net Profit</em>
          </li>
        </ol>

        <h2 id="strategies" className="text-2xl font-bold text-foreground pt-8">Strategies to Improve Your Margins</h2>

        <h3 className="text-xl font-semibold text-foreground mt-6">Improving Gross Profit</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Price Optimization:</strong> Increase prices if demand is inelastic.</li>
          <li><strong>Supplier Negotiation:</strong> Bulk buy materials or find cheaper suppliers to lower COGS.</li>
          <li><strong>Product Mix:</strong> Focus on selling higher-margin products and discontinue low-margin SKUs.</li>
          <li><strong>Reduce Waste:</strong> Improve manufacturing efficiency to reduce scrap and material usage.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Improving Net Profit</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Overhead Reduction:</strong> Audit subscriptions, lower rent, or optimize staffing levels.</li>
          <li><strong>Debt Refinancing:</strong> Refinance high-interest loans to lower interest expenses.</li>
          <li><strong>Tax Planning:</strong> Utilize tax credits and deductions effectively.</li>
          <li><strong>Marketing Efficiency:</strong> Improve ROAS (Return on Ad Spend) to ensure marketing dollars drive actual profit.</li>
        </ul>

        <h2 id="industry-benchmarks" className="text-2xl font-bold text-foreground pt-8">Industry Benchmarks</h2>
        <p>Margins vary wildly across industries. Comparing a software company to a grocery store is useless.</p>
        <ul className="list-disc ml-6 space-y-2 mt-4">
          <li><strong>SaaS (Software):</strong> Gross Margins ~80%, Net Margins ~20-30%. (Low COGS, high R&D/Marketing).</li>
          <li><strong>Retail/Grocery:</strong> Gross Margins ~25%, Net Margins ~2-5%. (High COGS, thin margins, high volume).</li>
          <li><strong>Consulting/Services:</strong> Gross Margins ~50%, Net Margins ~15-20%. (Labor intensive).</li>
          <li><strong>Manufacturing:</strong> Gross Margins ~30%, Net Margins ~10%. (Heavy equipment and material costs).</li>
        </ul>

        <p className="mt-6">Use this calculator to see where you stand. If your Gross Margin is healthy but Net Margin is low, your problem is overhead. If Gross Margin is low, your problem is pricing or production costs.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about profitability analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Which is more important: Gross Profit or Net Profit?</h4>
              <p className="text-muted-foreground">
                Neither is "more" important; they diagnose different problems. Gross Profit validates your business model (product/market fit), while Net Profit validates your operational efficiency and overall sustainability. Investors look at Net Profit for returns, but Gross Profit to see scalability.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Can Gross Profit be negative?</h4>
              <p className="text-muted-foreground">
                Yes, if the cost to produce goods exceeds the price you sell them for, you have a negative gross profit. This is unsustainable and means you lose money on every single unit sold. Immediate pricing or cost adjustments are needed.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is my Net Profit higher than my Operating Profit?</h4>
              <p className="text-muted-foreground">
                This is rare but can happen if you have significant "other income," such as returns from investments, a one-time sale of property or assets, or tax credits that exceed your operating expenses.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">What is a good Net Profit Margin?</h4>
              <p className="text-muted-foreground">
                Across all industries, a 10% net profit margin is considered average, and 20% is considered high. However, supermarkets may be happy with 3%, while law firms might target 25-30%.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Does COGS include salaries?</h4>
              <p className="text-muted-foreground">
                Only for employees directly involved in production (e.g., factory workers, assembly line staff). Administrative salaries (CEO, HR, Accounting) are considered Operating Expenses, not COGS.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate Gross Margin percentage?</h4>
              <p className="text-muted-foreground">
                (Revenue - COGS) / Revenue × 100. For example, if you sell a widget for $100 and it costs $60 to make, your Gross Profit is $40, and your Gross Margin is 40%.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">What is "EBITDA"?</h4>
              <p className="text-muted-foreground">
                Earnings Before Interest, Taxes, Depreciation, and Amortization. It is a proxy for pure operating cash flow. It sits between Operating Profit and Net Profit in many analyses but adds back non-cash expenses like depreciation.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">How do fixed costs affect these margins?</h4>
              <p className="text-muted-foreground">
                Fixed costs (rent, insurance) are typically Operating Expenses. They don't affect Gross Margin, but they heavily leverage Net Profit. High fixed costs mean you need higher sales volume to break even.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage of this Calculator */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Usage of this Calculator
          </CardTitle>
          <CardDescription>
            Who strictly benefits from this analysis tool?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Users className="h-5 w-5 text-blue-600" />
              Target Audience
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Business Owners</strong>
                <span className="text-sm text-muted-foreground">To identify where money is leaking—production inefficiency (COGS) or bloated overhead (OpEx).</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Investors & VCs</strong>
                <span className="text-sm text-muted-foreground">To assess the scalability of a business. High gross margins generally indicate a more scalable business model.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Managers</strong>
                <span className="text-sm text-muted-foreground">Department heads use this to justify budget requests or cost-cutting initiatives.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Pricing Analysts</strong>
                <span className="text-sm text-muted-foreground">To determine if current pricing structures are sufficient to cover both direct and indirect costs.</span>
              </div>
            </div>
          </div>

          <hr className="border-border/50" />

          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Limitations & Considerations
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Accounting Methods:</strong> Cash vs. Accrual accounting can significantly change these numbers in the short term.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>One-time Events:</strong> A large lawsuit settlement or asset sale can distort Net Profit for a specific period, making it look better or worse than the trend.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Cost Allocation:</strong> The line between COGS and OpEx can sometimes be blurry (e.g., a manager who supervises both production and sales).</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Gross Profit vs Net Profit Analyzer provides a complete vertical analysis of your income statement.</p>
          <p>It highlights the efficiency of your production (Gross Margin) distinguishably from the efficiency of your overall operations (Net Margin).</p>
          <p>Regularly monitoring the gap between these two metrics works as an early warning system for rising overhead costs.</p>
        </CardContent>
      </Card>
    </div>
  );
}
