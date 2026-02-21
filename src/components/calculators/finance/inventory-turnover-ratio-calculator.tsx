'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Package,
  TrendingUp,
  AlertCircle,
  Target,
  Info,
  Calculator,
  DollarSign,
  BarChart3,
  Briefcase,
  Clock,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  ShoppingCart,
  Warehouse,
  Truck
} from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  cogs: z.number().min(0, 'COGS must be positive'),
  startInventory: z.number().min(0, 'Must be positive').optional(),
  endInventory: z.number().min(0, 'Must be positive').optional(),
  avgInventory: z.number().min(0, 'Must be positive').optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function InventoryTurnoverRatioCalculator() {
  const [result, setResult] = useState<{
    turnoverRatio: number;
    dsi: number;
    avgInv: number;
    rating: string;
    interpretation: string;
    recommendation: string;
    insights: string[];
    riskFactors: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cogs: undefined,
      startInventory: undefined,
      endInventory: undefined,
      avgInventory: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    const { cogs, startInventory, endInventory, avgInventory } = v;

    let computedAvgInventory = 0;
    if (avgInventory !== undefined && avgInventory > 0) {
      computedAvgInventory = avgInventory;
    } else if (startInventory !== undefined && endInventory !== undefined) {
      computedAvgInventory = (startInventory + endInventory) / 2;
    } else {
      return null;
    }

    if (computedAvgInventory === 0) return null;

    const turnoverRatio = cogs / computedAvgInventory;
    const dsi = 365 / turnoverRatio;

    // Interpretation logic
    let rating = 'Standard';
    let recommendation = '';

    // Benchmarks vary by industry, but using general retail/manufacturing baselines
    if (turnoverRatio > 10) rating = 'Very High';
    else if (turnoverRatio >= 6 && turnoverRatio <= 10) rating = 'Excellent';
    else if (turnoverRatio >= 4 && turnoverRatio < 6) rating = 'Good';
    else if (turnoverRatio >= 2 && turnoverRatio < 4) rating = 'Low';
    else rating = 'Critical';

    // DSI Interpretation
    if (dsi < 30) {
      recommendation = 'Inventory moves extremely fast. Watch out for stockouts and missed sales opportunities.';
    } else if (dsi <= 60) {
      recommendation = 'Optimal balance between sales velocity and stocking levels. Maintain this efficiency.';
    } else if (dsi <= 90) {
      recommendation = 'Inventory is moving somewhat slowly. Consider discounting slightly to clear old stock.';
    } else {
      recommendation = 'Severe stock stagnation. You are paying high holding costs. Immediate clearance strategy required.';
    }

    const interpretation = `You turn over your entire inventory ${turnoverRatio.toFixed(1)} times per year. It takes roughly ${dsi.toFixed(0)} days to sell a product after stocking it.`;

    const insights = [
      `Sales Velocity: ${turnoverRatio.toFixed(2)}x per year`,
      `Shelf Life: Products sit for ${dsi.toFixed(0)} days on average`,
      `Liquidity Impact: Faster turnover frees up cash for reinvestment`,
    ];

    const riskFactors = [];
    if (turnoverRatio < 3) riskFactors.push('Obsolete Stock Risk: Items may expire or go out of fashion.');
    if (turnoverRatio < 3) riskFactors.push('High Holding Costs: Storage and insurance fees eat into margins.');
    if (turnoverRatio > 20) riskFactors.push('Stockout Risk: You may be losing customers due to empty shelves.');
    if (turnoverRatio > 20) riskFactors.push('Supply Chain Strain: Frequent reordering stresses logistics.');

    return {
      turnoverRatio,
      dsi,
      avgInv: computedAvgInventory,
      rating,
      interpretation,
      recommendation,
      insights,
      riskFactors
    };
  };

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    if (res) setResult(res);
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory Metrics
          </CardTitle>
          <CardDescription>
            Enter Cost of Goods Sold and Inventory levels to analyze efficiency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="cogs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Cost of Goods Sold (COGS)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Annual COGS"
                          {...field}
                          onChange={e => field.onChange(Number(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="hidden md:block"></div> {/* Spacer */}

                <div className="col-span-1 md:col-span-2 border-t pt-4">
                  <h4 className="text-sm font-medium mb-4 text-muted-foreground">Inventory Levels ($)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="startInventory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Beginning Inventory</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Start of Year"
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
                      name="endInventory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ending Inventory</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="End of Year"
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
                      name="avgInventory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>OR Average Inventory</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Manual Average"
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
                Calculate Turnover
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Warehouse className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Efficiency Analysis</CardTitle>
                  <CardDescription>Stock Movement Performance</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-center p-6 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/20">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Turnover Ratio</p>
                  <p className="text-4xl font-bold text-indigo-700 dark:text-indigo-400">{result.turnoverRatio.toFixed(2)}x</p>
                  <p className="text-xs text-muted-foreground mt-2">Restocked per year</p>
                </div>
                <div className="text-center p-6 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/20">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Days Sales of Inventory (DSI)</p>
                  <p className="text-4xl font-bold text-amber-700 dark:text-amber-400">{result.dsi.toFixed(0)} Days</p>
                  <p className="text-xs text-muted-foreground mt-2">Avg time to sell</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="font-semibold">Rating</p>
                  <Badge variant={result.rating === 'Excellent' || result.rating === 'Very High' ? 'default' : result.rating === 'Good' ? 'secondary' : 'destructive'}>
                    {result.rating}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Avg Stock Value</p>
                  <p className="text-lg font-bold">${result.avgInv.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Truck className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Sales Speed</p>
                  <p className="text-sm font-medium text-muted-foreground">Every {result.dsi.toFixed(1)} days</p>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-lg font-medium text-foreground">{result.interpretation}</p>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Strategic Advice:</strong> {result.recommendation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <CheckCircle2 className="h-6 w-6" />
                  Smart Insights
                </CardTitle>
                <CardDescription>Key takeaways</CardDescription>
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
                <CardDescription>Potential bottlenecks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.riskFactors.length > 0 ? (
                  result.riskFactors.map((factor, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                      <span className="text-sm font-medium text-red-800 dark:text-red-300">{factor}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                    <p className="text-sm text-green-700 dark:text-green-300">No immediate inventory risks detected.</p>
                  </div>
                )}
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
            Components of the Inventory Turnover formula
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <DollarSign className="h-4 w-4" />
                Cost of Goods Sold (COGS)
              </h4>
              <p className="text-sm text-muted-foreground">
                The direct costs of producing the goods sold by a company. This includes the cost of the materials and labor directly used to create the good. Do not use "Sales Revenue" as it includes profit margin.
              </p>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <Warehouse className="h-4 w-4" />
                Average Inventory
              </h4>
              <p className="text-sm text-muted-foreground">
                The mean value of inventory during a certain time period. Calculated as (Beginning Inventory + Ending Inventory) / 2. This smooths out seasonal spikes or drops.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formula Used */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Formula Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              Inventory Turnover = Cost of Goods Sold / Average Inventory
            </p>
            <p className="font-mono text-sm text-center mt-2">
              DSI (Days Sales of Inventory) = 365 / Inventory Turnover
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            This ratio measures how many times a company has sold and replaced its inventory during a certain period. High turnover implies strong sales; low turnover implies weak sales or excess inventory.
          </p>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>
            Explore other supply chain and efficiency tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/finance/current-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Current Ratio</p>
                      <p className="text-sm text-muted-foreground">Liquidity check</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/receivables-turnover-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Receivables Turnover</p>
                      <p className="text-sm text-muted-foreground">Collection speed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/cash-conversion-cycle-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <RotateCcw className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium">Cash Cycle</p>
                      <p className="text-sm text-muted-foreground">Cash efficiency</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/working-capital-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Working Capital</p>
                      <p className="text-sm text-muted-foreground">Operating funds</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/operating-margin-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Operating Margin</p>
                      <p className="text-sm text-muted-foreground">Profitability</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/economic-break-even-quantity-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-teal-600" />
                    <div>
                      <p className="font-medium">Econ Break-Even Qty</p>
                      <p className="text-sm text-muted-foreground">Order optimization</p>
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
        <meta itemProp="headline" content="The Ultimate Guide to Inventory Turnover Ratio" />
        <meta itemProp="description" content="A complete guide to understanding, calculating, and optimizing Inventory Turnover. Learn how to manage stock efficiently and improve cash flow." />
        <meta itemProp="author" content="Supply Chain Management Institute" />
        <meta itemProp="datePublished" content="2025-08-15" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">The Ultimate Guide to Inventory Turnover Ratio</h1>
        <p className="text-lg italic text-muted-foreground">Inventory is cash sitting on a shelf. The Inventory Turnover Ratio tells you how fast that cash is moving back into your bank account. In the world of retail and manufacturing, speed is solvency.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#definition" className="hover:underline">What is Inventory Turnover?</a></li>
          <li><a href="#formula" className="hover:underline">The Formula Explained</a></li>
          <li><a href="#importance" className="hover:underline">Why This Metric Matters</a></li>
          <li><a href="#benchmarks" className="hover:underline">Industry Benchmarks: What is "Good"?</a></li>
          <li><a href="#strategies" className="hover:underline">Strategies to Improve Turnover</a></li>
          <li><a href="#risks" className="hover:underline">The Risks of Extremes</a></li>
        </ul>
        <hr className="my-6" />

        <h2 id="definition" className="text-2xl font-bold text-foreground pt-8">What is Inventory Turnover?</h2>
        <p>The **Inventory Turnover Ratio** is a financial efficiency metric that reveals how many times a company has sold and replaced its entire inventory over a specific period, usually a year.</p>
        <p>Think of it as the "pulse" of your supply chain. A healthy pulse means goods are flowing smoothly from suppliers to customers. A weak pulse (low turnover) means goods are stuck, clogging the arteries of your business with dead stock.</p>

        <div className="p-4 bg-muted/50 border-l-4 border-primary my-6">
          <p className="font-medium text-foreground">Key Concept: Holding Costs</p>
          <p className="text-sm mt-2">Every day an item sits in your warehouse, it costs you money. Rent, electricity, insurance, security, and the "opportunity cost" of tied-up cash. High turnover minimizes these costs.</p>
        </div>

        <h2 id="formula" className="text-2xl font-bold text-foreground pt-8">The Formula Explained</h2>
        <p>There are two ways to calculate it, but only one is strictly correct for financial analysis.</p>

        <h3 className="text-xl font-semibold text-foreground mt-4">1. The Accurate Method (COGS Based)</h3>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-primary font-bold">
            Turnover = Cost of Goods Sold (COGS) / Average Inventory
          </p>
        </div>
        <p><strong>Why COGS?</strong> Because inventory is recorded on your books at <em>cost</em>, not at clear <em>sale price</em>. Comparing "Sales Revenue" (market price) to "Inventory" (cost price) inflates the ratio artificially. Always use COGS for accuracy.</p>

        <h3 className="text-xl font-semibold text-foreground mt-4">2. Days Sales of Inventory (DSI)</h3>
        <p>This converts the abstract ratio into days, which is often easier for humans to grasp.</p>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-primary font-bold">
            Days on Hand = 365 / Turnover Ratio
          </p>
        </div>
        <p>If your turnover is 6x, you sell your average stock every 60 days. This is your "Days on Hand".</p>

        <hr className="my-6" />

        <h2 id="importance" className="text-2xl font-bold text-foreground pt-8">Why This Metric Matters</h2>
        <p>Monitoring inventory turnover isn't just about accounting; it's about survival.</p>
        <ul className="list-disc ml-6 space-y-4 mt-4">
          <li><strong>Cash Flow Management:</strong> High turnover generates cash. Low turnover consumes cash. Companies often fail not because they lack profit, but because they lack cash—usually because it's all stuck in unsellable inventory.</li>
          <li><strong>Preventing Obsolescence:</strong> In industries like fashion or technology, inventory "rots." A smartphone on a shelf loses value every week. High turnover ensures you sell products while they are still desirable.</li>
          <li><strong>Storage Efficiency:</strong> Lower metrics mean you need less warehouse space for the same amount of sales, reducing rent and overhead.</li>
        </ul>

        <hr className="my-6" />

        <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8">Industry Benchmarks: What is "Good"?</h2>
        <p>There is no universal "good" number. High fashion moves slow; bananas move fast. Context is everything.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="p-4 border rounded-lg">
            <h4 className="font-bold text-foreground">Grocery & Perishables</h4>
            <p className="text-2xl font-bold text-green-600">14x - 20x</p>
            <p className="text-sm mt-1">Food spoils. Supermarkets must turn stock every 2-3 weeks.</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-bold text-foreground">Fast Fashion (Zara/H&M)</h4>
            <p className="text-2xl font-bold text-blue-600">10x - 12x</p>
            <p className="text-sm mt-1">Trends die fast. They aim to sell out collections in a month.</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-bold text-foreground">Automotive</h4>
            <p className="text-2xl font-bold text-amber-600">5x - 8x</p>
            <p className="text-sm mt-1">Cars are expensive and take space. 45-60 days on lot is standard.</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-bold text-foreground">Luxury Goods</h4>
            <p className="text-2xl font-bold text-purple-600">1x - 3x</p>
            <p className="text-sm mt-1">High margin, low volume. It's okay to hold a diamond watch for a year.</p>
          </div>
        </div>

        <hr className="my-6" />

        <h2 id="strategies" className="text-2xl font-bold text-foreground pt-8">Strategies to Improve Turnover</h2>
        <p>If your calculator result showed "Low" or "Critical," consider these tactics:</p>
        <ol className="list-decimal ml-6 space-y-4 mt-4">
          <li>
            <strong>Markdowns and Promotions:</strong>
            <p>It's painful to sell at a discount, but holding dead stock is worse. Cash in hand (even at 70% of value) can be reinvested in better-selling items. Holding the item yields $0.</p>
          </li>
          <li>
            <strong>Just-in-Time (JIT) Inventory:</strong>
            <p>Order smaller batches more frequently. Instead of buying 1,000 units for the whole year, buy 100 units every month. This keeps your average inventory low and turnover high.</p>
          </li>
          <li>
            <strong>Pareto Analysis (80/20 Rule):</strong>
            <p>Identify the 20% of your products that generate 80% of your sales. Stock those heavily. Ruthlessly cut or reduce stock of the 80% of products that hardly move.</p>
          </li>
          <li>
            <strong>Better Forecasting:</strong>
            <p>Use historical data and seasonality trends to predict demand. Don't order winter coats in February.</p>
          </li>
        </ol>

        <hr className="my-6" />

        <h2 id="risks" className="text-2xl font-bold text-foreground pt-8">The Risks of Extremes</h2>
        <p>While usually "higher is better," there is a limit.</p>
        <h3 className="text-xl font-semibold text-foreground mt-4">Risk of Too Low Turnover</h3>
        <p>Bloated holding costs, obsolescence, and liquidity crisis. You are tying up capital in things nobody wants.</p>

        <h3 className="text-xl font-semibold text-foreground mt-4">Risk of Too High Turnover</h3>
        <p>If your turnover is 50x, you are likely stocking out constantly. Customers come to buy, find empty shelves, and go to your competitor. You are missing sales and damaging your brand reliability. You may also be spending too much on shipping for tiny, frequent restocks.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common queries about inventory management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Why use COGS instead of Sales Revenue?</h4>
              <p className="text-muted-foreground">
                Using Sales Revenue inflates the ratio because sales include profit markup, whereas inventory is recorded at cost. To compare "apples to apples," you must use the cost of the goods sold (COGS) to match the cost basis of the inventory.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What does a turnover of 1.0 mean?</h4>
              <p className="text-muted-foreground">
                It means you sold through your exact inventory amount once during the year. Essentially, you have a year's supply of stock on hand. Unless you sell heavy machinery or luxury yachts, this is usually considered very poor efficiency.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can inventory turnover be too high?</h4>
              <p className="text-muted-foreground">
                Yes. An extremely high ratio (e.g., &gt;20x for non-perishables) might indicate inadequate stocking levels. This leads to "stockouts," where customers can't buy what they want, leading to lost revenue and customer dissatisfaction.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How does JIT (Just-In-Time) affect this?</h4>
              <p className="text-muted-foreground">
                JIT drastically increases inventory turnover because companies hold almost zero stock, relying on suppliers to deliver parts exactly when needed. This pushes the ratio very high, signaling maximum efficiency, but also higher supply chain risk.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does this apply to service businesses?</h4>
              <p className="text-muted-foreground">
                Generally, no. Service businesses (consultants, software, hair salons) do not hold physical inventory. However, they might track "employee utilization," which is a similar concept of efficiency.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate "Average Inventory"?</h4>
              <p className="text-muted-foreground">
                The simple formula is (Beginning + Ending Inventory) / 2. However, for seasonal businesses, this can be misleading. A more accurate method is to take the inventory balance at the end of each month, sum them up, and divide by 12.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What causes low inventory turnover?</h4>
              <p className="text-muted-foreground">
                Common causes include weak marketing, overestimating demand (overbuying), poor product quality, updated competitors rendering your product obsolete, or seasonal shifts (e.g., selling swimsuits in winter).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How often should I calculate this?</h4>
              <p className="text-muted-foreground">
                Annually is standard for external reporting, but internal managers should track it quarterly or even monthly to spot trends before they become serious problems.
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
            Who strictly needs this tool and when
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Who should use */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Target className="h-5 w-5 text-blue-600" />
              Who Should Use This Tool?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Retail Managers</strong>
                <span className="text-sm text-muted-foreground">To decide which products to reorder and which to put on clearance sale.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Supply Chain Analysts</strong>
                <span className="text-sm text-muted-foreground">To optimize warehouse space and reduce carrying costs.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Investors</strong>
                <span className="text-sm text-muted-foreground">To judge a company's sales strength. Rising inventory with flat sales is a major "sell" signal.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Small Business Owners</strong>
                <span className="text-sm text-muted-foreground">To avoid the "cash trap" of buying too much stock that doesn't sell.</span>
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
                <span><strong>Seasonality Distortion:</strong> Calculating this in January for a toy store will show dangerously low inventory (sold out for Xmas), which isn't the annual norm.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Volume Discounts:</strong> Sometimes buying bulk (lowering turnover) is actually cheaper due to massive supplier discounts. The ratio ignores this trade-off.</span>
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
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Walmart (Efficiency King)</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  Walmart consistently achieves turnover ratios of 8x-9x. Their immense supply chain power allows them to restock shelves almost instantly, minimizing the cash tied up in backrooms.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Company X (The Glut)</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                  A fictional electronics retailer stockpiled 3D TVs believing they were the future. They didn't sell. Turnover dropped to 2x. They had to write off millions in losses when the tech became obsolete.
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
          <p>The Inventory Turnover Ratio Calculator is a vital diagnostics tool for retail and manufacturing businesses.</p>
          <p>It balances the need for sales availability against the cost of holding stock.</p>
          <p>Use it to refine your purchasing strategy, free up working capital, and ensure your product lineup remains fresh and profitable.</p>
        </CardContent>
      </Card>
    </div>
  );
}
