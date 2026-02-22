'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Truck, ShoppingCart, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, TrendingDown, FunctionSquare, CheckCircle2, Users, Briefcase, AlertTriangle, ArrowRight, Warehouse, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  beginningInventory: z.number().min(0, "Must be positive"),
  purchases: z.number().min(0, "Must be positive"),
  freightIn: z.number().min(0).optional(),
  returnsAndAllowances: z.number().min(0).optional(),
  endingInventory: z.number().min(0, "Must be positive"),
});

type FormValues = z.infer<typeof formSchema>;

export default function COGSEstimator() {
  const [result, setResult] = useState<{
    netPurchases: number;
    goodsAvailable: number;
    cogs: number;
    inventoryChange: number;
    inventoryFlowStatus: string;
    recommendation: string;
    insights: string[];
    breakdown: { label: string; value: number }[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      beginningInventory: undefined,
      purchases: undefined,
      freightIn: undefined,
      returnsAndAllowances: undefined,
      endingInventory: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    const freight = v.freightIn || 0;
    const returns = v.returnsAndAllowances || 0;

    // Step 1: Net Purchases
    const netPurchases = v.purchases + freight - returns;

    // Step 2: Goods Available for Sale
    const goodsAvailable = v.beginningInventory + netPurchases;

    // Step 3: COGS
    const cogs = goodsAvailable - v.endingInventory;

    // Inventory Change Analysis
    const inventoryChange = v.endingInventory - v.beginningInventory;

    return { netPurchases, goodsAvailable, cogs, inventoryChange };
  };

  const getInventoryFlowStatus = (change: number) => {
    if (change > 0) return 'Stockpiling (Inventory grew)';
    if (change < 0) return 'Liquidation (Inventory shrank)';
    return 'Stable Inventory';
  };

  const getRecommendation = (cogs: number, inventoryChange: number, endingInv: number) => {
    if (cogs < 0) return 'Error: Ending Inventory cannot be higher than Goods Available. Check your count.';
    if (inventoryChange > (cogs * 0.2)) return 'Warning: Your inventory grew significantly. Ensure this is intentional (e.g. for holiday season) and not dead stock accumulation.';
    if (endingInv < (cogs * 0.05)) return 'Warning: Ending inventory is extremely low relative to COGS. You risk stockouts.';
    return 'Your COGS flow appears normal. Ensure you perform regular physical counts to verify the Ending Inventory figure.';
  };

  const getInsights = (cogs: number, netPurchases: number, inventoryChange: number) => {
    const insights = [];
    if (cogs > netPurchases) {
      insights.push('You sold more than you bought this period (Drawing down inventory)');
    } else {
      insights.push('You bought more than you sold (Building up inventory)');
    }

    if (Math.abs(inventoryChange) < (cogs * 0.05)) {
      insights.push('Purchasing matched sales velocity almost perfectly');
    }

    return insights;
  };

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);

    // Safety check for UI rendering if calculation is weird
    if (res.cogs < 0) {
      // We still set result but recommendation catches it
    }

    setResult({
      ...res,
      inventoryFlowStatus: getInventoryFlowStatus(res.inventoryChange),
      recommendation: getRecommendation(res.cogs, res.inventoryChange, values.endingInventory),
      insights: getInsights(res.cogs, res.netPurchases, res.inventoryChange),
      breakdown: [
        { label: 'Beginning Inventory', value: values.beginningInventory },
        { label: '(+) Net Purchases', value: res.netPurchases },
        { label: '(=) Goods Available', value: res.goodsAvailable },
        { label: '(-) Ending Inventory', value: values.endingInventory },
      ]
    });
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory & Purchase Data
          </CardTitle>
          <CardDescription>
            Enter figures from your general ledger or physical count.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="beginningInventory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Warehouse className="h-4 w-4" /> Beginning Inventory ($)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g. 50000" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endingInventory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Warehouse className="h-4 w-4" /> Ending Inventory ($)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g. 45000" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-3">Purchasing Activity</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="purchases"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4" /> Gross Purchases ($)
                        </FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="e.g. 100000" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="freightIn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Truck className="h-4 w-4" /> Freight In ($)
                        </FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="e.g. 2000" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="returnsAndAllowances"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <TrendingDown className="h-4 w-4" /> Returns/Discounts ($)
                        </FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="e.g. 1500" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Estimate COGS
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
                <Target className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>COGS Calculation</CardTitle>
                  <CardDescription>Cost of Goods Sold Statement</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">${result.cogs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="text-lg text-muted-foreground mt-2">Total Cost of Goods Sold</p>
              </div>

              {/* Waterfall Logic Visual */}
              <div className="space-y-2 bg-muted/40 p-4 rounded-lg text-sm">
                <div className="flex justify-between">
                  <span>Beginning Inventory</span>
                  <span className="font-medium">${result.breakdown[0].value.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-blue-600">
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> (+) Net Purchases</span>
                  <span className="font-medium">${result.breakdown[1].value.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-dashed pt-2 font-semibold">
                  <span>(=) Goods Available for Sale</span>
                  <span>${result.breakdown[2].value.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span className="flex items-center gap-1"><TrendingDown className="w-3 h-3" /> (-) Ending Inventory</span>
                  <span className="font-medium">${result.breakdown[3].value.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-double pt-2 text-lg font-bold">
                  <span>(=) COGS</span>
                  <span>${result.cogs.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Warehouse className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Inventory Movement</span>
                </div>
                <Badge variant={result.inventoryChange > 0 ? 'default' : 'secondary'}>
                  {result.inventoryFlowStatus}
                </Badge>
              </div>

              <Alert variant={result.cogs < 0 ? "destructive" : "default"}>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Analysis:</strong> {result.recommendation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <BarChart3 className="h-6 w-6" />
                  Performance Insights
                </CardTitle>
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

            <Card className="h-full border-slate-100 bg-slate-50/10 dark:border-slate-900/20 dark:bg-slate-900/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-slate-600 dark:text-slate-400">
                  <Warehouse className="h-6 w-6" />
                  Key Metrics Check
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <span className="text-sm">Purchases Ratio</span>
                  <span className="font-mono">{((result.netPurchases / result.cogs) * 100).toFixed(0)}% of COGS</span>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <span className="text-sm">Change in Inv.</span>
                  <span className={`font-mono ${result.inventoryChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {result.inventoryChange > 0 ? '+' : ''}{result.inventoryChange.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Understanding Inputs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Components
          </CardTitle>
          <CardDescription>
            COGS is drawn from these primary ledger accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 bg-muted/40 rounded-lg">
              <strong className="block text-sm mb-1">Beginning Inv.</strong>
              <p className="text-xs text-muted-foreground">Value of stock at the start of the period. Matches last period's Ending Inv.</p>
            </div>
            <div className="p-3 bg-muted/40 rounded-lg">
              <strong className="block text-sm mb-1">Purchases</strong>
              <p className="text-xs text-muted-foreground">Cost of new stock bought during the period.</p>
            </div>
            <div className="p-3 bg-muted/40 rounded-lg">
              <strong className="block text-sm mb-1">Freight In</strong>
              <p className="text-xs text-muted-foreground">Shipping costs to get goods to you. This IS part of COGS.</p>
            </div>
            <div className="p-3 bg-muted/40 rounded-lg">
              <strong className="block text-sm mb-1">Ending Inv.</strong>
              <p className="text-xs text-muted-foreground">Value of stock left unsold. Must be counted physically.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formula */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FunctionSquare className="h-5 w-5" />
            Standard Periodic Formula
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto text-center">
            <p className="font-mono text-lg font-bold mb-3">
              COGS = (Beginning Inventory + Purchases) − Ending Inventory
            </p>
            <p className="text-xs text-muted-foreground">
              *Purchases should include Freight-In and exclude Returns/Discounts.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/gross-margin-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Gross Margin</p>
                      <p className="text-sm text-muted-foreground">Profit after COGS</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/inventory-turnover-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Warehouse className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium">Inventory Turnover</p>
                      <p className="text-sm text-muted-foreground">Sales velocity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/break-even-analysis-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Break-Even</p>
                      <p className="text-sm text-muted-foreground">Volume needed</p>
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
        <meta itemProp="headline" content="The Complete Guide to Calculating Cost of Goods Sold (COGS)" />
        <meta itemProp="description" content="Learn how to accurately calculate COGS using the periodic inventory method, understand inclusion rules for freight and labor, and ensure tax compliance." />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Demystifying Cost of Goods Sold (COGS)</h1>
        <p className="text-lg italic text-muted-foreground mb-6">
          COGS is the single largest expense for most businesses. Getting it wrong distorts your profit, your taxes, and your business valuation.
        </p>

        <div className="bg-muted/30 p-6 rounded-xl mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Content</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-primary">
            <li><a href="#what-is-cogs" className="hover:underline flex items-center gap-2"><ArrowRight className="w-4 h-4" /> What Goes Into COGS?</a></li>
            <li><a href="#periodic-vs-perpetual" className="hover:underline flex items-center gap-2"><ArrowRight className="w-4 h-4" /> Periodic vs. Perpetual Systems</a></li>
            <li><a href="#valuation-methods" className="hover:underline flex items-center gap-2"><ArrowRight className="w-4 h-4" /> FIFO vs. LIFO Impact</a></li>
            <li><a href="#red-flags" className="hover:underline flex items-center gap-2"><ArrowRight className="w-4 h-4" /> Common Accounting Errors</a></li>
            <li><a href="#shrinkage" className="hover:underline flex items-center gap-2"><ArrowRight className="w-4 h-4" /> Understanding Shrinkage</a></li>
          </ul>
        </div>

        <h2 id="what-is-cogs" className="text-2xl font-bold text-foreground">What Exactly Goes Into COGS?</h2>
        <p>
          The "Cost of Goods Sold" is strictly the direct cost of producing the goods sold by a company. It includes:
        </p>
        <ul className="list-disc ml-6 space-y-2 mt-4">
          <li><strong>Direct Materials:</strong> The raw stuff (wood, steel, fabric).</li>
          <li><strong>Direct Labor:</strong> The wages of the specific workers making the product (assembly line workers).</li>
          <li><strong>Factory Overhead:</strong> Electricity for the factory, machine depreciation using the units-of-production method.</li>
          <li><strong>Freight-In:</strong> The cost to ship materials <em>to</em> your warehouse.</li>
        </ul>
        <p className="mt-4 font-semibold text-destructive">
          It does NOT include:
        </p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Sales & Marketing costs.</li>
          <li>Administrative salaries (CEO, HR).</li>
          <li>Freight-Out (Shipping to customers is a selling expense, not COGS).</li>
        </ul>

        <h2 id="periodic-vs-perpetual" className="text-2xl font-bold text-foreground mt-8">Periodic vs. Perpetual Inventory</h2>
        <p>This calculator uses the <strong>Periodic Inventory System</strong> formula.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">1. Periodic System (The "Formula" Method)</h3>
        <p>
          The business doesn't track every single sale's cost in real-time. Instead, they count inventory at the start and end of the month.
          <br />
          <em>Logic: "We started with 10 units, bought 90, and have 5 left. We must have sold 95."</em>
          <br />
          <strong>Pros:</strong> Simple, low tech. <strong>Cons:</strong> Cannot detect theft (shrinkage). Theft looks like sales.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">2. Perpetual System (The "Scanner" Method)</h3>
        <p>
          Every time a barcode is scanned, the software updates inventory and records COGS instantly.
          <br />
          <strong>Pros:</strong> Real-time data, detects theft (if physical count != computer count). <strong>Cons:</strong> Expensive setup.
        </p>

        <h2 id="valuation-methods" className="text-2xl font-bold text-foreground mt-8">Valuation: FIFO vs. LIFO</h2>
        <p>
          The value of "Beginning Inventory" depends on your accounting method:
        </p>
        <ul className="list-disc ml-6 space-y-3 mt-4">
          <li><strong>FIFO (First-In, First-Out):</strong> Assumes you sell oldest goods first. In inflation, this results in lower COGS and higher reported profit (and higher taxes).</li>
          <li><strong>LIFO (Last-In, First-Out):</strong> Assumes you sell newest (most expensive) goods first. Results in higher COGS and lower taxes.</li>
          <li><strong>Weighted Average:</strong> Blends all costs. Best for liquids or homogeneous goods like grain.</li>
        </ul>

        <h2 id="shrinkage" className="text-2xl font-bold text-foreground mt-8">The "Shrinkage" Problem</h2>
        <p>
          In the Periodic system, theft acts as a ghost sale.
        </p>
        <div className="bg-muted p-4 rounded-lg border-l-4 border-destructive my-4">
          <p className="italic">
            "If you had 100 units, bought 0, and sold 10, you should have 90. If your physical count shows 80, the missing 10 units are 'Shrinkage'."
          </p>
        </div>
        <p>
          With the periodic formula, those 10 missing units are automatically bundled into COGS. This means you do not see the theft expense separately; it just looks like your margins got worse. This is why annual physical counts are critical.
        </p>
      </section>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-2">Can I perform this calculation for a service business?</h4>
            <p className="text-muted-foreground text-sm">
              Technically, yes, but it is called "Cost of Services" (COS). It includes the direct labor hours of the consultants/engineers and software costs used directly for the client. There is no physical inventory to count.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">Why is Freight-In included but Freight-Out excluded?</h4>
            <p className="text-muted-foreground text-sm">
              Accounting rules state that an asset's cost includes all costs necessary to get it ready for sale (which includes bringing it to your warehouse). Shipping it to the customer is a "distribution" activity, happening after the good is ready.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">What happens if I overstate my Ending Inventory?</h4>
            <p className="text-muted-foreground text-sm">
              If Ending Inventory is artificially high, COGS becomes artificially low. This inflates your profit and your tax bill. It is a common form of accounting fraud.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">What is "Just-In-Time" inventory?</h4>
            <p className="text-muted-foreground text-sm">
              JIT strategies (like Toyota) keep inventory near zero. Purchases = COGS. This saves warehousing costs/obsolescence but leaves you vulnerable to supply chain disruptions.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">How does COGS affect depreciation?</h4>
            <p className="text-muted-foreground text-sm">
              Office furniture depreciation is an operating expense. <em>Factory</em> machine depreciation is part of overhead, which gets allocated to inventory cost, and flows into COGS when the product is sold.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">What is "Absorption Costing"?</h4>
            <p className="text-muted-foreground text-sm">
              A method where all manufacturing costs (fixed and variable) are absorbed into the inventory cost. This is required for GAAP/IFRS reporting, unlike "Variable Costing" which is used for internal management.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">Does currency fluctuation affect COGS?</h4>
            <p className="text-muted-foreground text-sm">
              Yes. If you import raw materials, a weak local currency raises your Purchases cost, increasing COGS and squeezing margins unless you raise prices.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">Is labor always part of COGS?</h4>
            <p className="text-muted-foreground text-sm">
              Only "Direct Labor" (people touching the product). A supervisor watching the line is "Indirect Labor" (Overhead). A salesperson is "SG&A" (Operating Expense).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Usage */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Usage of this Calculator
          </CardTitle>
          <CardDescription>Practical applications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Users className="h-5 w-5 text-blue-600" />
              Who Should Use This?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Small Business Owners</strong>
                <span className="text-sm text-muted-foreground">To close the books at month-end and estimate gross profit before the accountant arrives.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Ecommerce Sellers</strong>
                <span className="text-sm text-muted-foreground">To track margins on Amazon FBA or Shopify stores where inventory reporting can be complex.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Auditors</strong>
                <span className="text-sm text-muted-foreground">To perform a "reasonableness test" on a client's reported Gross Margin.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Tax Preparers</strong>
                <span className="text-sm text-muted-foreground">To calculate Schedule C "Cost of Goods Sold" for IRS reporting.</span>
              </div>
            </div>
          </div>

          <hr className="border-border/50" />

          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Limitations
            </h4>
            <p className="text-sm text-muted-foreground">
              This calculator assumes you do not have "Work in Process" (WIP) inventory, which is common in manufacturing. For manufacturers, a detailed "Cost of Goods Manufactured" schedule is needed before calculating COGS. It also relies on the accuracy of the Ending Inventory count.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Summary</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>The COGS Estimator simplifies the periodic inventory formula.</p>
          <p>By accurately tracking beginning stock, purchases, and ending stock, businesses can determine their true direct costs and gross margins with precision.</p>
        </CardContent>
      </Card>
    </div>
  );
}
