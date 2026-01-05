'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertCircle, TrendingUp, DollarSign, Calculator, Target, BarChart3, CheckCircle2, Shield, AlertTriangle, Layers, BookOpen, Warehouse, Factory, HelpCircle, Users, Briefcase, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  fixedCosts: z.number().min(0, 'Fixed costs must be non-negative'),
  variableCostPerUnit: z.number().min(0, 'Variable costs must be non-negative'),
  pricePerUnit: z.number().positive('Price must be greater than 0'),
  targetSalesUnits: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function BreakEvenAnalysisCalculator() {
  const [result, setResult] = useState<{
    breakEvenUnits: number;
    breakEvenRevenue: number;
    contributionMargin: number;
    contributionMarginRatio: number;
    profitAtTarget: number | null;
    marginOfSafetyUnits: number | null;
    marginOfSafetyPercent: number | null;
    safetyLevel: string;
    interpretation: string;
    recommendation: string;
    insights: string[];
    riskFactors: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fixedCosts: undefined,
      variableCostPerUnit: undefined,
      pricePerUnit: undefined,
      targetSalesUnits: undefined,
    },
  });

  const getSafetyLevel = (percent: number) => {
    if (percent >= 40) return 'Very High';
    if (percent >= 25) return 'High';
    if (percent >= 15) return 'Moderate';
    if (percent >= 0) return 'Low';
    return 'Critical'; // Negative safety margin means operating at a loss
  };

  const calculate = (v: FormValues) => {
    const { fixedCosts, variableCostPerUnit, pricePerUnit, targetSalesUnits } = v;

    if (pricePerUnit <= variableCostPerUnit) {
      // Cannot calculate if variable cost exceeds price
      return null;
    }

    const contributionMargin = pricePerUnit - variableCostPerUnit;
    const contributionMarginRatio = (contributionMargin / pricePerUnit) * 100;
    const breakEvenUnits = fixedCosts / contributionMargin;
    const breakEvenRevenue = breakEvenUnits * pricePerUnit;

    let profitAtTarget = null;
    let marginOfSafetyUnits = null;
    let marginOfSafetyPercent = null;
    let safetyLevel = 'Standard';
    let interpretation = `You need to sell ${Math.ceil(breakEvenUnits)} units to cover your costs.`;
    let recommendation = 'Review your pricing structure and cost base to lower the break-even point.';

    if (targetSalesUnits !== undefined) {
      profitAtTarget = (targetSalesUnits * contributionMargin) - fixedCosts;
      marginOfSafetyUnits = targetSalesUnits - breakEvenUnits;
      marginOfSafetyPercent = (marginOfSafetyUnits / targetSalesUnits) * 100;
      safetyLevel = getSafetyLevel(marginOfSafetyPercent);

      if (marginOfSafetyPercent < 0) {
        interpretation = `At ${targetSalesUnits} units, you are below the break-even point and operating at a loss.`;
        recommendation = 'Urgent action required: Increase prices, reduce variable costs, or boost sales volume immediately.';
      } else if (marginOfSafetyPercent < 20) {
        interpretation = `You are dangerously close to the break-even point with only a ${marginOfSafetyPercent.toFixed(1)}% buffer.`;
        recommendation = 'Monitor fixed expenses strictly and focus on high-margin sales to build a safety cushion.';
      } else {
        interpretation = `You have a healthy buffer of ${marginOfSafetyPercent.toFixed(1)}% above break-even.`;
        recommendation = 'Consider reinvesting profits into growth or efficiency improvements.';
      }
    }

    const insights = [
      `Each unit sold contributes $${contributionMargin.toFixed(2)} towards covering fixed costs.`,
      `Your Contribution Margin Ratio is ${contributionMarginRatio.toFixed(1)}%, meaning ${contributionMarginRatio.toFixed(1)} cents of every dollar is available to cover fixed costs and profit.`,
      targetSalesUnits ? `At target sales volume, your projected profit is $${profitAtTarget?.toFixed(2)}.` : 'Enter a target sales volume to see projected profit and safety margins.',
    ];

    const riskFactors = [
      pricePerUnit - variableCostPerUnit < pricePerUnit * 0.2 ? 'Low Contribution Margin: High volume is required to generate profit.' : 'High Contribution Margin: Lower volume sensitivity but pricing risk may exist.',
      breakEvenUnits > 1000 ? 'High Break-Even Volume: Requires robust sales channels to sustain.' : undefined,
      variableCostPerUnit / pricePerUnit > 0.8 ? 'High Variable Costs: Leaves little room for error or discounts.' : undefined,
    ].filter(Boolean) as string[];

    if (riskFactors.length === 0) riskFactors.push('Cost structure appears balanced relative to pricing.');

    return {
      breakEvenUnits,
      breakEvenRevenue,
      contributionMargin,
      contributionMarginRatio,
      profitAtTarget,
      marginOfSafetyUnits,
      marginOfSafetyPercent,
      safetyLevel,
      interpretation,
      recommendation,
      insights,
      riskFactors,
    };
  };

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    if (!res) {
      alert('Error: Price must be greater than Variable Cost per Unit.');
      return;
    }
    setResult(res);
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Cost & Pricing Parameters
          </CardTitle>
          <CardDescription>
            Input your cost structure to calculate the break-even point
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="fixedCosts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Warehouse className="h-4 w-4" />
                        Total Fixed Costs ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 50000 (Rent, Salaries)"
                          {...field}
                          onChange={e => field.onChange(Number(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="variableCostPerUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Factory className="h-4 w-4" />
                        Variable Cost per Unit ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 15 (Materials, Labor)"
                          {...field}
                          onChange={e => field.onChange(Number(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pricePerUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Price per Unit ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 40"
                          {...field}
                          onChange={e => field.onChange(Number(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetSalesUnits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Target Sales Volume (Units) - Optional
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 5000 (Projected Sales)"
                          {...field}
                          onChange={e => field.onChange(Number(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full">
                <Activity className="mr-2 h-4 w-4" />
                Calculate Break-Even Point
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
                <BarChart3 className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Analysis Results</CardTitle>
                  <CardDescription>Profitability & Risk Thresholds</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-center p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Break-Even Units</p>
                  <p className="text-4xl font-bold text-blue-700 dark:text-blue-400">{Math.ceil(result.breakEvenUnits).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-2">Units to sell to reach $0 profit</p>
                </div>
                <div className="text-center p-6 bg-green-50/50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/20">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Break-Even Revenue</p>
                  <p className="text-4xl font-bold text-green-700 dark:text-green-400">${result.breakEvenRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                  <p className="text-xs text-muted-foreground mt-2">Required sales revenue</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Layers className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Unit Contribution</p>
                  <p className="text-lg font-bold text-purple-600">${result.contributionMargin.toFixed(2)}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Safety Margin</p>
                  {result.marginOfSafetyPercent !== null ? (
                    <Badge variant={result.safetyLevel === 'Very High' || result.safetyLevel === 'High' ? 'default' : result.safetyLevel === 'Moderate' ? 'secondary' : result.safetyLevel === 'Critical' ? 'destructive' : 'outline'}>
                      {result.safetyLevel} ({result.marginOfSafetyPercent.toFixed(1)}%)
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground block">Enter Target Sales</span>
                  )}
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-amber-600" />
                  <p className="font-semibold">Projected Profit</p>
                  <p className={`text-lg font-bold ${result.profitAtTarget && result.profitAtTarget < 0 ? 'text-red-600' : 'text-amber-600'}`}>
                    {result.profitAtTarget !== null ? `$${result.profitAtTarget.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '-'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-lg font-medium text-foreground">{result.interpretation}</p>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Strategic Recommendation:</strong> {result.recommendation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Smart Actions & Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <CheckCircle2 className="h-6 w-6" />
                  Strategic Insights
                </CardTitle>
                <CardDescription>Key takeaways from your cost structure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm font-medium">{insight}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/20 dark:bg-red-900/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400">
                  <AlertCircle className="h-6 w-6" />
                  Risk Assessment
                </CardTitle>
                <CardDescription>Vulnerabilities in your business model</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.riskFactors.map((factor, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">{factor}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Understanding the Inputs */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
          <CardDescription>
            Differentiation between Fixed and Variable costs is critical
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Warehouse className="h-4 w-4" />
                Fixed Costs
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Expenses that remain constant regardless of how many units you produce or sell.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Rent & Lease Payments</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Salaries (Full-time employees)</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Insurance Premiums</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <Factory className="h-4 w-4" />
                Variable Costs
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Expenses that increase directly in proportion to the number of units produced.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Raw Materials</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Direct Labor (Hourly/Commission)</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Shipping & Packaging</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formula Used */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Formula Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              Break-Even Units = Fixed Costs / (Price - Variable Cost)
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            The denominator <strong>(Price - Variable Cost)</strong> is known as the <strong>Contribution Margin</strong> per unit.
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
            Expand your financial analysis with these tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/contribution-margin-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Contribution Margin</p>
                      <p className="text-sm text-muted-foreground">Profitability per unit</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/operating-margin-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Operating Margin</p>
                      <p className="text-sm text-muted-foreground">Operational efficiency</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/margin-of-safety-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Margin of Safety</p>
                      <p className="text-sm text-muted-foreground">Risk buffer analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/return-on-investment-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium">ROI Calculator</p>
                      <p className="text-sm text-muted-foreground">Investment returns</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/gross-margin-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Gross Margin</p>
                      <p className="text-sm text-muted-foreground">Revenue minus COGS</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/free-cash-flow-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-teal-600" />
                    <div>
                      <p className="font-medium">Free Cash Flow</p>
                      <p className="text-sm text-muted-foreground">Inflow & Outflow</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide Section */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceArticle">
        <meta itemProp="headline" content="Break-Even Analysis: Determining the Point of Profitability" />
        <meta itemProp="description" content="Learn how to calculate the Break-Even Point (BEP) in units and revenue. Understand fixed vs. variable costs and how to use this metric for pricing and business planning." />
        <meta itemProp="author" content="Business Efficiency Team" />
        <meta itemProp="datePublished" content="2025-04-10" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Break-Even Analysis: The Definitive Guide to Profitability</h1>
        <p className="text-lg italic text-muted-foreground">Discover the exact moment your business stops losing money and starts making a profit. The Break-Even Point is the cornerstone of financial planning for startups and established enterprises alike.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#definition" className="hover:underline">What is the Break-Even Point (BEP)?</a></li>
          <li><a href="#formula" className="hover:underline">The Break-Even Formula Explained</a></li>
          <li><a href="#components" className="hover:underline">Fixed vs. Variable Costs</a></li>
          <li><a href="#analysis" className="hover:underline">Interpreting the Results</a></li>
          <li><a href="#limitations" className="hover:underline">Limitations of Break-Even Analysis</a></li>
        </ul>
        <hr className="my-6" />

        <h2 id="definition" className="text-2xl font-bold text-foreground pt-8">What is the Break-Even Point (BEP)?</h2>
        <p>The **Break-Even Point** is the level of sales volume at which total revenues equal total costs. At this specific point, a company makes neither a profit nor a loss.</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Below BEP:</strong> The business is operating at a loss.</li>
          <li><strong>Above BEP:</strong> Every additional unit sold generates pure profit (minus variable taxes).</li>
        </ul>
        <p>Knowing your BEP helps answer the critical question: "How much do I need to sell just to keep the lights on?"</p>

        <hr className="my-6" />

        <h2 id="formula" className="text-2xl font-bold text-foreground pt-8">The Break-Even Formula Explained</h2>
        <p>The core formula relies on the concept of **Contribution Margin**, which is the sales price minus variable costs.</p>

        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-primary font-bold">
            BEP (Units) = Fixed Costs / (Price - Variable Cost per Unit)
          </p>
        </div>

        <h3 className="text-xl font-semibold text-foreground mt-6">Example Calculation</h3>
        <p>Imagine you sell handcrafted watches.</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Fixed Costs:</strong> $10,000 per month (Rent, Salary).</li>
          <li><strong>Variable Cost:</strong> $50 per watch (Parts, Labor).</li>
          <li><strong>Selling Price:</strong> $150 per watch.</li>
        </ul>
        <p className="mt-4">First, calculate the Contribution Margin: $150 - $50 = **$100**.</p>
        <p>Then, divide Fixed Costs by Contribution Margin: $10,000 / $100 = **100 units**.</p>
        <p>You must sell 100 watches per month to break even. The 101st watch yields your first $100 of profit.</p>

        <hr className="my-6" />

        <h2 id="components" className="text-2xl font-bold text-foreground pt-8">Fixed vs. Variable Costs</h2>
        <p>Categorizing costs correctly is vital for accurate analysis.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Fixed Costs (Overheads)</h3>
        <p>These are "time-based" costs that exist even if you sell zero units. Examples include rent, insurance, office salaries, software subscriptions, and loan interest.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Variable Costs (COGS)</h3>
        <p>These are "volume-based" costs that occur only when a sale is made. Examples include raw materials, packaging, credit card processing fees, and sales commissions.</p>

        <hr className="my-6" />

        <h2 id="analysis" className="text-2xl font-bold text-foreground pt-8">Interpreting the Results</h2>
        <p>Once you know your BEP, you can make strategic decisions:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Pricing Strategy:</strong> If your BEP volume is too high to achieve realistically, you may need to increase prices.</li>
          <li><strong>Cost Control:</strong> If you cannot raise prices, focus on negotiating lower material costs (variable) or downsizing office space (fixed).</li>
          <li><strong>Margin of Safety:</strong> This metric tells you how much sales can drop before you start losing money. A higher margin of safety means a more resilient business.</li>
        </ul>

        <hr className="my-6" />

        <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8">Limitations of Break-Even Analysis</h2>
        <p>While powerful, BEP analysis is a simplified model of reality.</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Static Prices:</strong> It assumes you sell all units at the same price (ignoring bulk discounts).</li>
          <li><strong>Constant Costs:</strong> It assumes variable costs don't change with scale (ignoring economies of scale).</li>
          <li><strong>Inventory Ignored:</strong> It assumes all units produced are sold immediately.</li>
        </ul>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about profitability and cost structures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What happens if my Fixed Costs increase?</h4>
              <p className="text-muted-foreground">
                If fixed costs rise (e.g., rent goes up), your Break-Even Point increases. You will need to sell more units or raise prices just to maintain the same profitability level. This increases the business's risk profile.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Is a lower Break-Even Point always better?</h4>
              <p className="text-muted-foreground">
                Generally, yes. A lower BEP means you start making profit sooner and have less risk of loss during slow months. However, if achieving a low BEP means sacrificing product quality (reducing variable costs) or underinvesting in marketing (fixed costs), it could hurt long-term growth.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate BEP for multiple products?</h4>
              <p className="text-muted-foreground">
                For multi-product companies, use the "Weighted Average Contribution Margin." Calculate the contribution margin for each product and weight it by its percentage of total sales mix. This provides a composite BEP for the entire business.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is the "Contribution Margin Ratio"?</h4>
              <p className="text-muted-foreground">
                It is the Contribution Margin expressed as a percentage of sales (CM / Price). A 40% CM ratio means that for every dollar of sales, 40 cents is left over to pay fixed costs and generate profit.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does Break-Even Analysis include taxes?</h4>
              <p className="text-muted-foreground">
                Typically, no. The standard Break-Even Point is an "Operating" break-even, calculated before interest and taxes. To calculate specific after-tax profit targets, you would need to adjust the formula to account for the tax rate.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is the difference between Break-Even and ROI?</h4>
              <p className="text-muted-foreground">
                Break-Even tells you *when* you stop losing money in terms of volume. ROI (Return on Investment) measures the *efficiency* of an investment over a period. BEP is about survival volume; ROI is about investment performance.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can the Break-Even Point be negative?</h4>
              <p className="text-muted-foreground">
                Mathematically, if variable costs &gt; price, the denominator becomes negative, resulting in a negative BEP. In reality, this means the business model is broken: you lose money on every single unit sold, so you can never break even regardless of volume.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How often should I recalculate my BEP?</h4>
              <p className="text-muted-foreground">
                You should recalculate whenever there is a significant change in your cost structure (e.g., new supplier prices, rent hike) or pricing strategy. Quarterly reviews are standard for dynamic businesses.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What are "semi-variable" costs?</h4>
              <p className="text-muted-foreground">
                Some costs have both fixed and variable components (e.g., a utility bill with a base charge plus usage fees). For an accurate BEP, you should split these into their respective fixed and variable portions.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How does automation affect the BEP?</h4>
              <p className="text-muted-foreground">
                Automation typically increases Fixed Costs (machinery depreciation, software) but decreases Variable Costs (labor). This raises the Break-Even Point (requiring higher volume) but increases the Profit Margin on additional units once that point is passed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage of Calculator */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Usage of this Calculator
          </CardTitle>
          <CardDescription>
            Practical applications and strategic decision making
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Who should use */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Users className="h-5 w-5 text-blue-600" />
              Who Should Use This Calculator?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Startup Founders</strong>
                <span className="text-sm text-muted-foreground">To set initial sales targets and determine viability before launching a product.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Product Managers</strong>
                <span className="text-sm text-muted-foreground">To price new features or products correctly to ensure they contribute to overheads.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Restaurant Owners</strong>
                <span className="text-sm text-muted-foreground">To calculate how many meals must be served daily to cover rent and staff wages.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Investors</strong>
                <span className="text-sm text-muted-foreground">To assess the risk of a potential investment—high BEP indicates higher risk.</span>
              </div>
            </div>
          </div>

          <hr className="border-border/50" />

          {/* Limitations */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Limitations & Accuracy Nuances
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Linearity Assumption:</strong> The model assumes costs and revenues are linear. In reality, you might offer bulk discounts (lowering revenue per unit) or pay overtime (increasing variable costs) at high volumes.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Market Demand:</strong> The calculator tells you how many units you *need* to sell, not how many the market *wants*. A low BEP is useless if no one buys the product.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Time Horizon:</strong> Fixed costs are usually fixed only in the short term. Over longer periods, rent increases and contracts expire, changing the calculations.</span>
              </li>
            </ul>
          </div>

          <hr className="border-border/50" />

          {/* Real World Examples */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <BarChart3 className="h-5 w-5 text-green-600" />
              Real-World Examples
            </h4>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Case A: The SaaS Company</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  High Fixed Costs (Development salaries, servers) but extremely low Variable Costs (hosting a new user is pennies). They have a high BEP volume, but once passed, profit margins are massive (80%+).
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Case B: The Retail Store</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                  Moderate Fixed Costs (Rent) but high Variable Costs (buying inventory). Their profit per unit is lower, so they rely on consistent turnover. A slight drop in sales volume can quickly plunge them into loss.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Break-Even Analysis Calculator identifies the precise sales volume required to cover all costs.</p>
          <p>It segregates fixed and variable expenses to provide clarity on your business's risk profile and scalability.</p>
          <p>Use this tool to set realistic sales targets, price your products effectively, and ensure financial sustainability.</p>
        </CardContent>
      </Card>
    </div>
  );
}
