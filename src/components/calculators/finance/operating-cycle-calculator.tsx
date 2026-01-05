'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Timer, ArrowLeftRight, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, Package, ShoppingCart, CreditCard, CheckCircle2, Users, Briefcase, AlertTriangle, RefreshCcw, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  dio: z.number().min(0, "Must be positive"),
  dso: z.number().min(0, "Must be positive"),
  dpo: z.number().min(0, "Must be positive"),
});

type FormValues = z.infer<typeof formSchema>;

export default function OperatingCycleCalculator() {
  const [result, setResult] = useState<{
    operatingCycle: number;
    cashConversionCycle: number;
    efficiencyLevel: string;
    recommendation: string;
    insights: string[];
    cycleBreakdown: { label: string; days: number; color: string }[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dio: undefined,
      dso: undefined,
      dpo: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    const operatingCycle = v.dio + v.dso;
    const cashConversionCycle = operatingCycle - v.dpo;
    return { operatingCycle, cashConversionCycle };
  };

  const getEfficiencyLevel = (ccc: number) => {
    if (ccc <= 0) return 'World Class (Negative Funding Gap)';
    if (ccc < 30) return 'Highly Efficient';
    if (ccc < 60) return 'Moderate Efficiency';
    if (ccc < 90) return 'Inefficient';
    return 'Critical Cash Drain';
  };

  const getRecommendation = (ccc: number, dio: number, dso: number, dpo: number) => {
    if (ccc <= 0) return 'Excellent! Your suppliers are effectively financing your operations. Maintain this leverage.';
    if (dso > 60) return `Your Days Sales Outstanding (${dso} days) is the bottleneck. Aggressively chase receivables or tighten credit terms.`;
    if (dio > 90) return `Your inventory is sitting for too long (${dio} days). Clear dead stock and improve demand forecasting.`;
    if (dpo < 15) return 'You are paying suppliers too quickly. Negotiate longer payment terms to match your sales cycle.';
    return 'Focus on small incremental improvements across all three metrics to free up cash flow.';
  };

  const getInsights = (ccc: number, operatingCycle: number, dpo: number) => {
    const insights = [];
    if (ccc > 0) {
      insights.push(`Your cash is tied up in operations for ${ccc.toFixed(0)} days`);
      insights.push('You likely need working capital financing (credit line) to bridge this gap');
    } else {
      insights.push('You generate cash before you have to pay suppliers');
      insights.push('This "negative working capital" funds your growth automatically');
    }

    if (dpo > operatingCycle) {
      insights.push('Warning: Suppliers might be stressed if DPO is excessively long');
    }

    return insights;
  };

  const onSubmit = (values: FormValues) => {
    const { operatingCycle, cashConversionCycle } = calculate(values);

    setResult({
      operatingCycle,
      cashConversionCycle,
      efficiencyLevel: getEfficiencyLevel(cashConversionCycle),
      recommendation: getRecommendation(cashConversionCycle, values.dio, values.dso, values.dpo),
      insights: getInsights(cashConversionCycle, operatingCycle, values.dpo),
      cycleBreakdown: [
        { label: 'Inventory (DIO)', days: values.dio, color: 'bg-blue-500' },
        { label: 'Receivables (DSO)', days: values.dso, color: 'bg-amber-500' },
        { label: 'Payables (DPO)', days: values.dpo, color: 'bg-green-500' },
      ]
    });
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Cycle Components
          </CardTitle>
          <CardDescription>
            Enter your turnover days metrics (annual averages).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="dio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Package className="h-4 w-4" /> DIO (Days Inventory)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 45" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dso"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" /> DSO (Days Sales)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 30" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dpo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" /> DPO (Days Payable)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 60" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Calculate Cycles
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
                <Landmark className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Cycle Efficiency Analysis</CardTitle>
                  <CardDescription>Operating & Cash Conversion Timeline</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-muted/30 rounded-lg text-center border">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Operating Cycle</p>
                  <p className="text-4xl font-bold text-slate-700 dark:text-slate-200">{result.operatingCycle.toFixed(0)} <span className="text-lg font-normal">days</span></p>
                  <p className="text-xs text-muted-foreground mt-2">Time from buying inventory to collecting cash</p>
                </div>
                <div className="p-6 bg-primary/5 rounded-lg text-center border border-primary/20">
                  <p className="text-sm font-medium text-primary mb-2">Cash Conversion Cycle (CCC)</p>
                  <p className="text-4xl font-bold text-primary">{result.cashConversionCycle.toFixed(0)} <span className="text-lg font-normal text-muted-foreground">days</span></p>
                  <p className="text-xs text-muted-foreground mt-2">Days cash is tied up (Funding Gap)</p>
                </div>
              </div>

              {/* Visual Breakdown */}
              <div className="mt-8">
                <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Cycle Visualization</h4>
                <div className="relative h-12 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  {/* Operating Cycle Bar */}
                  <div
                    className="bg-blue-500 h-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ width: `${(result.cycleBreakdown[0].days / result.operatingCycle) * 100}%` }}
                  >
                    DIO
                  </div>
                  <div
                    className="bg-amber-500 h-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ width: `${(result.cycleBreakdown[1].days / result.operatingCycle) * 100}%` }}
                  >
                    DSO
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1 px-1">
                  <span>Start: Buy Inventory</span>
                  <span className="text-center" style={{ marginLeft: '-20px' }}>Sell Goods</span>
                  <span>End: Collect Cash</span>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <ArrowLeftRight className="w-4 h-4 text-green-600" />
                  <span>Of the {result.operatingCycle.toFixed(0)} days, suppliers finance <strong>{result.cycleBreakdown[2].days} days</strong> (DPO). The remaining <strong>{result.cashConversionCycle.toFixed(0)} days</strong> is your funding gap.</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-muted/50 rounded-lg flex items-center justify-between">
                  <span className="font-medium">Efficiency Rating</span>
                  <Badge variant={result.efficiencyLevel.includes('Efficient') || result.efficiencyLevel.includes('World') ? 'default' : 'destructive'}>
                    {result.efficiencyLevel}
                  </Badge>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Strategic Advice:</strong> {result.recommendation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Target className="h-6 w-6" />
                  Key Takeaways
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

            <Card className="h-full border-blue-100 bg-blue-50/10 dark:border-blue-900/20 dark:bg-blue-900/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-blue-600 dark:text-blue-400">
                  <RefreshCcw className="h-6 w-6" />
                  Cycle Composition
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.cycleBreakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <span className="font-bold">{item.days} days</span>
                  </div>
                ))}
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
            Understanding the Three Levers
          </CardTitle>
          <CardDescription>
            Working capital is managed through these three critical time periods.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-muted/40 rounded-lg border border-border/50">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-600">
                <Package className="h-4 w-4" /> DIO
              </h4>
              <p className="text-sm text-muted-foreground">
                <strong>Days Inventory Outstanding:</strong> How long cash is trapped in stock sitting on shelves. Lower is better (leaner inventory).
              </p>
            </div>
            <div className="p-4 bg-muted/40 rounded-lg border border-border/50">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-600">
                <CreditCard className="h-4 w-4" /> DSO
              </h4>
              <p className="text-sm text-muted-foreground">
                <strong>Days Sales Outstanding:</strong> How long it takes customers to pay you after a sale. Lower is better (faster cash collection).
              </p>
            </div>
            <div className="p-4 bg-muted/40 rounded-lg border border-border/50">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-600">
                <ShoppingCart className="h-4 w-4" /> DPO
              </h4>
              <p className="text-sm text-muted-foreground">
                <strong>Days Payable Outstanding:</strong> How long you take to pay your suppliers. Higher is better (keeps cash in your pocket longer), provided it doesn't hurt relationships.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formula */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FunctionSquare className="h-5 w-5" />
            Formula Logic
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto text-center">
            <p className="font-mono text-sm mb-3">
              <strong>Operating Cycle</strong> = DIO + DSO
            </p>
            <p className="font-mono text-sm">
              <strong>Cash Conversion Cycle (CCC)</strong> = Operating Cycle - DPO
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
            <Link href="/category/finance/inventory-turnover-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Inventory Turnover</p>
                      <p className="text-sm text-muted-foreground">Optimize DIO</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/receivables-turnover-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium">Receivables Turnover</p>
                      <p className="text-sm text-muted-foreground">Optimize DSO</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/current-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Current Ratio</p>
                      <p className="text-sm text-muted-foreground">General Liquidity</p>
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
        <meta itemProp="headline" content="The Ultimate Guide to Operating Cycle & Cash Conversion Cycle" />
        <meta itemProp="description" content="Calculate and optimize your business's cash flow efficiency. Learn how to reduce the Cash Conversion Cycle to free up working capital and reduce reliance on debt." />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Cash Flow Velocity: Mastering the Operating Cycle</h1>
        <p className="text-lg italic text-muted-foreground mb-6">
          Profit is an opinion, but cash is a fact. The Cash Conversion Cycle measures how fast your company turns $1 invested in materials into $1 collect from customers.
        </p>

        <div className="bg-muted/30 p-6 rounded-xl mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Content</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-primary">
            <li><a href="#operating-vs-ccc" className="hover:underline flex items-center gap-2"><ArrowLeftRight className="w-4 h-4" /> Operating Cycle vs. CCC</a></li>
            <li><a href="#ccc-formula" className="hover:underline flex items-center gap-2"><ArrowLeftRight className="w-4 h-4" /> The Three Pillars (DIO, DSO, DPO)</a></li>
            <li><a href="#negative-ccc" className="hover:underline flex items-center gap-2"><ArrowLeftRight className="w-4 h-4" /> The "Negative CCC" Holy Grail</a></li>
            <li><a href="#optimization" className="hover:underline flex items-center gap-2"><ArrowLeftRight className="w-4 h-4" /> Optimization Strategies</a></li>
            <li><a href="#financing" className="hover:underline flex items-center gap-2"><ArrowLeftRight className="w-4 h-4" /> Supply Chain Financing</a></li>
          </ul>
        </div>

        <h2 id="operating-vs-ccc" className="text-2xl font-bold text-foreground">Operating Cycle vs. Cash Conversion Cycle</h2>
        <p>Many business owners confuse these two metrics, but the difference is critical:</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">1. Operating Cycle (The Process Time)</h3>
        <p>
          The Operating Cycle is the <strong>total time</strong> it takes to purchase inventory, sell it, and collect the cash.
          <br />
          <em>Formula: DIO + DSO</em>.
          <br />
          This is typically positive. It represents the "shelf life" plus the "credit life" of your product.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">2. Cash Conversion Cycle (The Funding Gap)</h3>
        <p>
          Because suppliers give you credit (DPO), you hold onto your cash for a while. The CCC measures the <strong>net time</strong> your own cash is tied up.
          <br />
          <em>Formula: Operating Cycle - DPO</em>.
        </p>
        <p className="mt-4">
          If your Operating Cycle is 60 days, but you act slow to pay suppliers (DPO = 60 days), your CCC is 0. You are effectively using supplier's money to run your business. This is the goal of efficient working capital management.
        </p>

        <h2 id="negative-ccc" className="text-2xl font-bold text-foreground mt-8">The Holy Grail: Negative CCC</h2>
        <p>
          Some companies, like Amazon or Dell, operate with a <strong>Negative Cash Conversion Cycle</strong>.
        </p>
        <ul className="list-disc ml-6 space-y-2 mt-4">
          <li><strong>Amazon:</strong> You pay Amazon instantly (DSO ≈ 0). Inventory moves fast (DIO is low). But Amazon pays suppliers in 60-90 days (DPO is high).</li>
          <li><strong>Result:</strong> Amazon collects cash from you <em>months</em> before it pays for the goods. It sits on a mountain of cash that it can invest in growth, earning interest, or buying competitors.</li>
        </ul>

        <h2 id="optimization" className="text-2xl font-bold text-foreground mt-8">Strategies to Reduce CCC</h2>
        <p>A lower CCC frees up cash. Here is how to achieve it:</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="p-4 border rounded-lg">
            <strong className="text-blue-600 block mb-2">Reduce DIO</strong>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Adopt Just-in-Time (JIT) inventory.</li>
              <li>Remove slow-moving SKUs (80/20 rule).</li>
              <li>Improve sales forecasting accuracy.</li>
              <li>Drop-shipping models.</li>
            </ul>
          </div>
          <div className="p-4 border rounded-lg">
            <strong className="text-amber-600 block mb-2">Reduce DSO</strong>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Offer "2/10 net 30" discounts.</li>
              <li>Automate billing reminders.</li>
              <li>Credit checks for new clients.</li>
              <li>Invoice factoring (selling receivables).</li>
            </ul>
          </div>
          <div className="p-4 border rounded-lg">
            <strong className="text-green-600 block mb-2">Increase DPO</strong>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Negotiate longer terms (Net 60).</li>
              <li>Pay on the due date, never early.</li>
              <li>Consolidate suppliers for power.</li>
              <li>But beware of relationships!</li>
            </ul>
          </div>
        </div>

        <h2 id="financing" className="text-2xl font-bold text-foreground mt-8">Supply Chain Financing</h2>
        <p>
          A modern tool to improve CCC is "Reverse Factoring." A bank pays your supplier immediately (helping them), but you pay the bank in 90 days (helping you).
          <br />
          This effectively extends your DPO without angering suppliers. Many Fortune 500 companies use this to unlock billions in working capital.
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
            <h4 className="font-semibold text-lg mb-2">Why is a longer Operating Cycle bad?</h4>
            <p className="text-muted-foreground text-sm">
              It means capital is trapped in the business process (inventory on shelves, invoices in mail) rather than being in the bank. This reduces your ability to react to opportunities or emergencies.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">Can DPO be too high?</h4>
            <p className="text-muted-foreground text-sm">
              Yes. If you stretch payments too far, suppliers may cut you off, increase prices to compensate for the delay, or lower the priority of your orders, hurting your operations.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">Does CCC apply to service businesses?</h4>
            <p className="text-muted-foreground text-sm">
              Yes, though DIO is usually zero (no inventory). Service firms focus on DSO (getting paid by clients) vs DPO (paying freelancers/software costs).
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">How do I calculate DIO/DSO/DPO?</h4>
            <p className="text-muted-foreground text-sm">
              <ul className="list-inside list-disc">
                <li>DIO = (Avg Inventory / COGS) * 365</li>
                <li>DSO = (Avg Receivables / Credit Sales) * 365</li>
                <li>DPO = (Avg Payables / Cost of Sales) * 365</li>
              </ul>
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">What is a "good" CCC?</h4>
            <p className="text-muted-foreground text-sm">
              It depends on the industry. Supermarkets (cash sales) have low/negative CCC. Construction (milestone payments) often has high CCC. Compare yourself to competitors, not random industries.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">Can aggressive DSO collection hurt sales?</h4>
            <p className="text-muted-foreground text-sm">
              Yes. Lenient credit terms are a form of marketing. If you demand "Cash on Delivery," customers might switch to a competitor offering "Net 30." You must balance cash flow vs. sales growth.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">Why isn't cash included in current assets for this?</h4>
            <p className="text-muted-foreground text-sm">
              The Operating Cycle measures the efficiency of <em>working</em> assets (Inventory/Receivables). Cash is the result, not the input.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">How often should I check this?</h4>
            <p className="text-muted-foreground text-sm">
              Monthly trending is best. A sudden spike in DSO is an early warning sign of bad debt risk before it hits the P&L.
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
                <strong className="block text-primary mb-1">CFOs & Treasurers</strong>
                <span className="text-sm text-muted-foreground">To determine short-term borrowing needs (credit lines).</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Supply Chain Managers</strong>
                <span className="text-sm text-muted-foreground">To balance inventory levels against cash flow constraints.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Bankers</strong>
                <span className="text-sm text-muted-foreground">To assess the liquidity risk of a borrower before issuing a loan.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Turnaround Consultants</strong>
                <span className="text-sm text-muted-foreground">The first place they look to "find cash" in a distressed company is by squeezing the CCC.</span>
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
              This calculator is a snapshot based on retrospective averages. Seasonality can cause massive swings in DIO/DSO that an annual average might hide. It also assumes inventory serves a single purpose, ignoring strategic stockpiling for shortages.
            </p>
          </div>

          <hr className="border-border/50" />

          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Landmark className="h-5 w-5 text-green-600" />
              Real-World Example
            </h4>
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
              <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">The Dell Model</h5>
              <p className="text-sm text-green-700/80 dark:text-green-400">
                In its prime, Dell had a CCC of -10 days. Customers paid online (DSO=0). Dell ordered parts just-in-time (DIO=5). Suppliers were paid in 45 days (DPO=45). <br />
                Eq: 5 + 0 - 45 = -40 days approx. <br />
                Dell grew its business using its suppliers' money, avoiding interest payments.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Summary</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>The Operating Cycle Calculator provides a clear view of your working capital efficiency.</p>
          <p>By monitoring the gap between your operating cycle and payment terms, you can unlock significant hidden cash flow within your business.</p>
        </CardContent>
      </Card>
    </div>
  );
}
