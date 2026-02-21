'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertCircle, TrendingUp, DollarSign, Calculator, Percent, BarChart3, CheckCircle2, ShoppingCart, PieChart, Scale, ArrowRight, BookOpen, Layers, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  salesPrice: z.number().positive('Sales price must be positive'),
  variableCost: z.number().min(0, 'Variable cost must be non-negative'),
  salesVolume: z.number().min(0).optional(),
  fixedCosts: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ContributionMarginCalculator() {
  const [result, setResult] = useState<{
    unitCM: number;
    cmRatio: number;
    totalCM: number | null;
    netProfit: number | null;
    breakEvenUnits: number | null;
    profitabilityLevel: string;
    interpretation: string;
    recommendation: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      salesPrice: undefined,
      variableCost: undefined,
      salesVolume: undefined,
      fixedCosts: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    const { salesPrice, variableCost, salesVolume, fixedCosts } = v;

    if (salesPrice <= variableCost) {
      // Negative contribution
      return {
        unitCM: salesPrice - variableCost,
        cmRatio: ((salesPrice - variableCost) / salesPrice) * 100,
        totalCM: salesVolume ? (salesPrice - variableCost) * salesVolume : null,
        netProfit: null,
        breakEvenUnits: null,
        profitabilityLevel: 'Critical',
        interpretation: 'You are losing money on every unit sold.',
        recommendation: 'Stop sales immediately until you can raise prices or cut variable costs.',
        insights: ['Negative Contribution: The more you sell, the more you lose.'],
        considerations: ['Immediate pricing overhaul required.'],
      };
    }

    const unitCM = salesPrice - variableCost;
    const cmRatio = (unitCM / salesPrice) * 100;

    let totalCM = null;
    let netProfit = null;
    let breakEvenUnits = null;

    if (salesVolume !== undefined) {
      totalCM = unitCM * salesVolume;
      if (fixedCosts !== undefined) {
        netProfit = totalCM - fixedCosts;
        breakEvenUnits = fixedCosts / unitCM;
      }
    } else if (fixedCosts !== undefined) {
      breakEvenUnits = fixedCosts / unitCM;
    }

    // Determine Level
    let profitabilityLevel = 'Moderate';
    if (cmRatio > 50) profitabilityLevel = 'Very High';
    else if (cmRatio > 30) profitabilityLevel = 'High';
    else if (cmRatio < 15) profitabilityLevel = 'Low';

    const interpretation = `Each unit sold contributes $${unitCM.toFixed(2)} to covering fixed costs and profit.`;

    let recommendation = '';
    if (profitabilityLevel === 'Very High') recommendation = 'High margin per unit allowed for aggressive marketing spend to boost volume.';
    else if (profitabilityLevel === 'Low') recommendation = 'Low margin requires high volume efficiency; control fixed costs strictly.';
    else recommendation = 'Healthy margin; focus on optimizing sales volume while monitoring variable cost variance.';

    const insights = [
      `Your Contribution Margin Ratio is ${cmRatio.toFixed(1)}%, meaning ${cmRatio.toFixed(1)} cents of every dollar is "profit-ready" after variable costs.`,
      `Gross Profit potential per unit is $${unitCM.toFixed(2)}.`,
    ];

    if (breakEvenUnits) {
      insights.push(`You need to sell ${Math.ceil(breakEvenUnits)} units just to cover your fixed costs.`);
    }

    const considerations = [
      'Pricing Power: Can you raise prices without losing significant volume?',
      'Cost Control: Are your variable costs (materials, labor) optimized?',
      'Product Mix: Compare this CM Ratio against your other products to prioritize sales efforts.',
    ];

    return {
      unitCM,
      cmRatio,
      totalCM,
      netProfit,
      breakEvenUnits,
      profitabilityLevel,
      interpretation,
      recommendation,
      insights,
      considerations,
    };
  };

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    setResult(res);
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Product Economics
          </CardTitle>
          <CardDescription>
            Analyze the profitability of a specific product or service unit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="salesPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Selling Price per Unit ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 100"
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
                  name="variableCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Variable Cost per Unit ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 60"
                          {...field}
                          onChange={e => field.onChange(Number(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="col-span-1 md:col-span-2 border-t pt-4 mt-2">
                  <h4 className="text-sm font-medium mb-4 text-muted-foreground">Optional: Advanced Analysis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="salesVolume"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Sales Volume (Units)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 1000"
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
                      name="fixedCosts"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Scale className="h-4 w-4" />
                            Total Fixed Costs ($)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 25000"
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Margin
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
                <PieChart className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Contribution Margin</CardTitle>
                  <CardDescription>Unit Economics Analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-center p-6 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/20">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Unit Contribution</p>
                  <p className="text-4xl font-bold text-indigo-700 dark:text-indigo-400">${result.unitCM.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-2">Amount available for fixed costs & profit</p>
                </div>
                <div className="text-center p-6 bg-teal-50/50 dark:bg-teal-900/10 rounded-xl border border-teal-100 dark:border-teal-900/20">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Contribution Ratio</p>
                  <p className="text-4xl font-bold text-teal-700 dark:text-teal-400">{result.cmRatio.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground mt-2">Efficiency of each sales dollar</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Activity className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Profitability</p>
                  <Badge variant={result.profitabilityLevel === 'Very High' || result.profitabilityLevel === 'High' ? 'default' : result.profitabilityLevel === 'Moderate' ? 'secondary' : 'destructive'}>
                    {result.profitabilityLevel}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="font-semibold">Total Contribution</p>
                  <p className="text-lg font-bold text-primary">
                    {result.totalCM !== null ? `$${result.totalCM.toLocaleString()}` : <span className="text-sm text-muted-foreground font-normal">Enter Volume</span>}
                  </p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Scale className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Net Profit</p>
                  <p className={`text-lg font-bold ${result.netProfit && result.netProfit < 0 ? 'text-destructive' : 'text-green-600'}`}>
                    {result.netProfit !== null ? `$${result.netProfit.toLocaleString()}` : <span className="text-sm text-muted-foreground font-normal">Enter Vol + Fixed Costs</span>}
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
                <CardDescription>Key takeaways from margins</CardDescription>
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
                  Risk Factors
                </CardTitle>
                <CardDescription>Areas to monitor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.considerations.map((consideration, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">{consideration}</span>
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
            Components of Contribution Margin analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <DollarSign className="h-4 w-4" />
                Direct Financials
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span><strong>Sales Price:</strong> The final price charged to the customer.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span><strong>Variable Costs:</strong> Costs that rise with every unit sold (materials, commissions, packaging).</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <Scale className="h-4 w-4" />
                Advanced Inputs
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span><strong>Sales Volume:</strong> The total number of units sold in a period.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span><strong>Fixed Costs:</strong> Overhead costs that do not change with volume (rent, salaries). Essential for calculating Net Profit.</span>
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
              CM = Sales Price - Variable Costs
            </p>
            <p className="font-mono text-sm text-center mt-2">
              CM Ratio = (CM / Sales Price) × 100
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Contribution Margin represents the incremental money generated for each product/unit sold after deducting the variable portion of the firm's costs.
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
            Tools to compare simplified options and plan repayments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/finance/break-even-analysis-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Scale className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Break-Even Analysis</p>
                      <p className="text-sm text-muted-foreground">Find zero profit point</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/gross-margin-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Percent className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Gross Margin</p>
                      <p className="text-sm text-muted-foreground">Revenue minus COGS</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/operating-margin-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium">Operating Margin</p>
                      <p className="text-sm text-muted-foreground">EBIT Analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/net-profit-margin-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Net Profit Margin</p>
                      <p className="text-sm text-muted-foreground">Bottom line analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/ebitda-ebit-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">EBITDA Calculator</p>
                      <p className="text-sm text-muted-foreground">earnings before interest</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/return-on-investment-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-teal-600" />
                    <div>
                      <p className="font-medium">ROI Calculator</p>
                      <p className="text-sm text-muted-foreground">Return on Investment</p>
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
        <meta itemProp="headline" content="Mastering Contribution Margin: The Key to Profitability Analysis" />
        <meta itemProp="description" content="A comprehensive guide to Contribution Margin. Learn how to calculate it, why it differs from Gross Margin, and how to use it for pricing strategies and product mix optimization." />
        <meta itemProp="author" content="Corporate Finance Institute" />
        <meta itemProp="datePublished" content="2025-08-20" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Mastering Contribution Margin: The Key to Profitability Analysis</h1>
        <p className="text-lg italic text-muted-foreground">Unlock the true profitability of your products by isolating variable costs. Contribution Margin is the definitive metric for pricing decisions and break-even analysis.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#definition" className="hover:underline">What is Contribution Margin (CM)?</a></li>
          <li><a href="#vs-gross" className="hover:underline">Contribution Margin vs. Gross Margin</a></li>
          <li><a href="#calculation" className="hover:underline">How to Calculate CM</a></li>
          <li><a href="#strategies" className="hover:underline">Using CM for Business Strategy</a></li>
          <li><a href="#ratio" className="hover:underline">The CM Ratio Explained</a></li>
        </ul>
        <hr className="my-6" />

        <h2 id="definition" className="text-2xl font-bold text-foreground pt-8">What is Contribution Margin (CM)?</h2>
        <p>The **Contribution Margin** is a financial metric that calculates the revenue remaining after subtracting variable costs directly associated with producing a product. It is called "contribution" because it represents the portion of sales revenue that is not consumed by variable costs and so contributes to the coverage of **fixed costs**.</p>
        <p>Once fixed costs are fully covered, any remaining contribution flows directly to the bottom line as **Operating Profit**.</p>

        <hr className="my-6" />

        <h2 id="vs-gross" className="text-2xl font-bold text-foreground pt-8">Contribution Margin vs. Gross Margin</h2>
        <p>While often confused, these two metrics serve different purposes:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Gross Margin:</strong> Calculates (Revenue - Cost of Goods Sold). COGS often includes fixed overheads like factory rent or supervisor salaries (depending on accounting method). It is a measure of production efficiency.</li>
          <li><strong>Contribution Margin:</strong> Calculates (Revenue - Variable Costs). It strictly excludes *all* fixed costs. It is a measure of pure variable profitability per unit.</li>
        </ul>
        <p>For decision-making (like accepting a special order at a lower price), **Contribution Margin** is the superior metric.</p>

        <hr className="my-6" />

        <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8">How to Calculate CM</h2>
        <p>The calculation is straightforward but powerful:</p>

        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-primary font-bold">
            Unit CM = Selling Price - Variable Cost per Unit
          </p>
        </div>

        <h3 className="text-xl font-semibold text-foreground mt-6">Example</h3>
        <p>You sell a software subscription for **$100/month**.</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Customer support cost per user: $10</li>
          <li>Server hosting per user: $5</li>
          <li>Payment processing fee: $3</li>
        </ul>
        <p className="mt-4">Total Variable Costs = $18.</p>
        <p><strong>Contribution Margin = $100 - $18 = $82.</strong></p>
        <p>This means every new customer contributes $82 towards paying your office rent and developer salaries (fixed costs).</p>

        <hr className="my-6" />

        <h2 id="strategies" className="text-2xl font-bold text-foreground pt-8">Using CM for Business Strategy</h2>
        <p>Managers use Contribution Margin analysis to make critical decisions:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Adding/Dropping Products:</strong> If a product has a negative CM, it drains cash with every sale. It should be dropped unless it drives sales of other high-margin items (loss leader).</li>
          <li><strong>Pricing Floors:</strong> In a competitive bid, the absolute lowest price you should accept is your Variable Cost (where CM = $0). Any price above this contributes to overheads.</li>
          <li><strong>Sales Commission Structure:</strong> Smart companies pay commissions based on Contribution Margin, not Revenue, to encourage salespeople to sell the most profitable products, not just the most expensive ones.</li>
        </ul>

        <hr className="my-6" />

        <h2 id="ratio" className="text-2xl font-bold text-foreground pt-8">The CM Ratio Explained</h2>
        <p>The **Contribution Margin Ratio** expresses the margin as a percentage of sales.</p>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-primary font-bold">
            CM Ratio = (Unit CM / Selling Price) × 100
          </p>
        </div>
        <p>If your CM Ratio is 40%, it means that for every $1 increase in sales, your profit increases by $0.40 (once fixed costs are covered). This is a vital number for calculating the <strong>Break-Even Point</strong> in dollars.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common queries about profit margins and cost accounting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is a good Contribution Margin?</h4>
              <p className="text-muted-foreground">
                It varies heavily by industry. Software (SaaS) companies often have CM ratios of 80-90% because variable costs are low. Retail usually has much lower margins (20-40%). The key is that it must be high enough to cover your fixed costs at a reasonable sales volume.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can Contribution Margin be negative?</h4>
              <p className="text-muted-foreground">
                Yes, if your variable costs exceed your selling price. This is a disastrous situation where every sale loses money directly. It requires immediate price increases or cost restructuring.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How does Contribution Margin relate to Break-Even?</h4>
              <p className="text-muted-foreground">
                They are mathematically linked. Break-Even Point (Units) = Total Fixed Costs / Unit Contribution Margin. A higher CM lowers your break-even point, making the business less risky.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does CM include labor costs?</h4>
              <p className="text-muted-foreground">
                It includes **Direct Labor** (variable labor dependent on volume, like assembly line wages) but excludes **Indirect Labor** (fixed salaries like supervisors or HR staff).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Should I always maximize Contribution Margin?</h4>
              <p className="text-muted-foreground">
                Usually, yes, but not in isolation. A luxury product might have a huge CM but very low sales volume. Total profitability (Total CM) is the goal, which balances margin percentage with sales volume.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What affects Contribution Margin?</h4>
              <p className="text-muted-foreground">
                Only three levers move it: Selling Price, Variable Costs (efficiency, material prices), and Sales Volume (influences Total CM, but not Unit CM). Fixed costs (rent) do *not* affect Contribution Margin.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Why do airlines care about CM?</h4>
              <p className="text-muted-foreground">
                Industries with high fixed costs (planes, fuel, crew) focus intensely on CM. Once a flight is scheduled (fixed cost incurred), every extra passenger's ticket price minus meal cost (variable) is pure contribution to profit.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate Weighted Average CM?</h4>
              <p className="text-muted-foreground">
                For multiple products, multiply each product's CM by its share of the total sales mix. Sum these results to get the Weighted Average CM, used for company-wide break-even analysis.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Is high CM always safe?</h4>
              <p className="text-muted-foreground">
                Not necessarily. A company can have a high CM per unit but such massive fixed costs (huge R&D or debt) that they still lose money. High CM typically implies high "operating leverage," meaning volatility in profit based on sales volume.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does calculating CM require GAAP compliance?</h4>
              <p className="text-muted-foreground">
                No. Contribution Margin is a **Managerial Accounting** concept used for internal decision-making. It does not appear on standard GAAP financial statements like the Income Statement (which uses Gross Margin).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage of Calculator */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Usage of this Calculator
          </CardTitle>
          <CardDescription>
            When and how to apply this analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Who should use */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
              Who Should Use This Tool?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Business Owners</strong>
                <span className="text-sm text-muted-foreground">To determine the minimum price they can sell a product for without losing money.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Sales Managers</strong>
                <span className="text-sm text-muted-foreground">To set commission structures and identify which products the sales team should push.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Restaurateurs</strong>
                <span className="text-sm text-muted-foreground">To analyze menu items—keeping "high contribution" dishes even if their percentage margin is lower than others.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Financial Analysts</strong>
                <span className="text-sm text-muted-foreground">To perform sensitivity analysis: "What happens to profit if material costs rise by 10%?"</span>
              </div>
            </div>
          </div>

          <hr className="border-border/50" />

          {/* Limitations */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Limitations & Nuances
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Cost Categorization:</strong> The hardest part is accurately splitting costs into Fixed and Variable. Mistakes here (e.g., treating labor as fixed when it's variable) distort the result.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Short-Term Focus:</strong> CM is great for short-term decisions. In the long run, *all* costs (even fixed rent) must be covered, so ignoring fixed costs forever is dangerous.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Quality Impact:</strong> Maximizing CM by cutting variable costs (cheaper materials) can backfire if it hurts product quality and brand reputation.</span>
              </li>

            </ul>
          </div>

          <hr className="border-border/50" />

          {/* Real World Examples */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Real-World Examples
            </h4>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Scenario A: The Coffee Shop Menu</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  A latte sells for $5 (Variable Cost $2, CM = $3). A drip coffee sells for $3 (Variable Cost $0.20, CM = $2.80). While the latte invites more Revenue, the drip coffee has a 93% CM Ratio. The shop promotes drip coffee refills to maximize total contribution with minimal variable cost.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Scenario B: The Software "Loss Leader"</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                  A tech company offers a "Basic" plan for $10/mo. Support costs (variable) are $12/user. This has a Negative CM of -$2. They discontinue this tier immediately because no amount of volume will ever make it profitable—it bleeds cash with every signup.
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
          <p>The Contribution Margin Calculator reveals the fundamental profitability of each unit you sell.</p>
          <p>It separates variable costs from fixed overheads to show exactly how much revenue is available to support the business structure.</p>
          <p>Use this metric to optimize pricing, manage product portfolios, and make data-driven decisions on volume vs. margin trade-offs.</p>
        </CardContent>
      </Card>
    </div>
  );
}
