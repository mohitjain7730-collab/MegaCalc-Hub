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
  CreditCard,
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
  Wallet,
  CalendarClock,
  ShieldAlert
} from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  creditPurchases: z.number().min(0, 'Purchases must be positive'),
  startAP: z.number().min(0).optional(),
  endAP: z.number().min(0).optional(),
  avgAP: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PayablesTurnoverCalculator() {
  const [result, setResult] = useState<{
    turnoverRatio: number;
    dpo: number;
    avgAP: number;
    rating: string;
    interpretation: string;
    recommendation: string;
    insights: string[];
    riskFactors: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      creditPurchases: undefined,
      startAP: undefined,
      endAP: undefined,
      avgAP: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    const { creditPurchases, startAP, endAP, avgAP } = v;

    let computedAvgAP = 0;
    if (avgAP !== undefined && avgAP > 0) {
      computedAvgAP = avgAP;
    } else if (startAP !== undefined && endAP !== undefined) {
      computedAvgAP = (startAP + endAP) / 2;
    } else {
      return null;
    }

    if (computedAvgAP === 0) return null;

    const turnoverRatio = creditPurchases / computedAvgAP;
    const dpo = 365 / turnoverRatio;

    // Interpretation logic
    // General benchmark: 30 days is standard (Net 30), 45 is stretched, 60+ is questionable
    let rating = 'Standard';
    let recommendation = '';

    if (dpo < 20) rating = 'Very Fast';
    else if (dpo >= 20 && dpo <= 45) rating = 'Healthy';
    else if (dpo > 45 && dpo <= 60) rating = 'Stretched';
    else rating = 'Critical';

    // Recommendation Logic
    if (dpo < 20) {
      recommendation = 'You are paying suppliers very quickly. Ensure you are taking advantage of early payment discounts (e.g., 2/10 Net 30), otherwise, you are hurting your own cash flow.';
    } else if (dpo <= 45) {
      recommendation = 'Your payment cycle is balanced. You are likely maintaining good relationships with suppliers without draining cash reserves too early.';
    } else if (dpo <= 60) {
      recommendation = 'You are delaying payments. This is good for cash flow, but be careful not to damage supplier relationships or incur late fees.';
    } else {
      recommendation = 'You are taking a long time to pay. Suppliers may cut off credit or stop shipments if this persists. This signals potential liquidity distress.';
    }

    const interpretation = `You pay off your average accounts payable balance ${turnoverRatio.toFixed(1)} times per year. On average, you take ${dpo.toFixed(0)} days to pay a supplier invoice.`;

    const insights = [
      `Payment Speed: ${dpo.toFixed(0)} days per invoice`,
      `Annual Cycles: ${turnoverRatio.toFixed(2)} payments per year`,
      `Cash Preservation: Slower payments = More cash on hand`,
    ];

    const riskFactors = [];
    if (dpo < 15) riskFactors.push('Cash Drag: Paying too early reduces working capital.');
    if (dpo > 60) riskFactors.push('Supplier Risk: Vendors may refuse future credit.');
    if (dpo > 60) riskFactors.push('Credit Rating: Consistent late payments hurt business credit scores.');
    if (turnoverRatio < 3) riskFactors.push('High AP Balance: Large debt overhang relative to purchasing volume.');

    return {
      turnoverRatio,
      dpo,
      avgAP: computedAvgAP,
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
            <CreditCard className="h-5 w-5" />
            Payables Metrics
          </CardTitle>
          <CardDescription>
            Enter annual purchases and accounts payable to analyze payment speed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="creditPurchases"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Total Credit Purchases ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Annual Purchases"
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
                  <h4 className="text-sm font-medium mb-4 text-muted-foreground">Accounts Payable Balance ($)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="startAP"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Beginning AP</FormLabel>
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
                      name="endAP"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ending AP</FormLabel>
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
                      name="avgAP"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>OR Average AP</FormLabel>
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
                Calculate Payables Turnover
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
                <Wallet className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Payment Efficiency</CardTitle>
                  <CardDescription>Accounts Payable Analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-center p-6 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/20">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Turnover Ratio</p>
                  <p className="text-4xl font-bold text-indigo-700 dark:text-indigo-400">{result.turnoverRatio.toFixed(2)}x</p>
                  <p className="text-xs text-muted-foreground mt-2">Payments per year</p>
                </div>
                <div className="text-center p-6 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/20">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Days Payable Outstanding (DPO)</p>
                  <p className="text-4xl font-bold text-amber-700 dark:text-amber-400">{result.dpo.toFixed(0)} Days</p>
                  <p className="text-xs text-muted-foreground mt-2">Avg time to pay</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="font-semibold">Rating</p>
                  <Badge variant={result.rating === 'Healthy' ? 'default' : result.rating === 'Very Fast' ? 'secondary' : 'destructive'}>
                    {result.rating}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Avg AP Balance</p>
                  <p className="text-lg font-bold">${result.avgAP.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <CalendarClock className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Cash Retention</p>
                  <p className="text-sm font-medium text-muted-foreground">{result.dpo > 30 ? 'Extended' : 'Short-term'}</p>
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
                  <ShieldAlert className="h-6 w-6" />
                  Risk Assessment
                </CardTitle>
                <CardDescription>Potential issues</CardDescription>
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
                    <p className="text-sm text-green-700 dark:text-green-300">No immediate payment risks detected.</p>
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
            Components of the Payables Turnover formula
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <DollarSign className="h-4 w-4" />
                Total Credit Purchases
              </h4>
              <p className="text-sm text-muted-foreground">
                The total amount of inventory or raw materials purchased on credit during the period.
                <br /><br />
                <em>Note: If you don't have this exact figure, you can estimate it using: Cost of Goods Sold + Ending Inventory - Beginning Inventory.</em>
              </p>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <Wallet className="h-4 w-4" />
                Average Accounts Payable
              </h4>
              <p className="text-sm text-muted-foreground">
                The average amount you owed to suppliers across the period. Calculated as (Start AP + End AP) / 2. This represents the average liability carried on your balance sheet.
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
              Payables Turnover Ratio = Total Credit Purchases / Average Accounts Payable
            </p>
            <p className="font-mono text-sm text-center mt-2">
              DPO (Days Payable Outstanding) = 365 / Payables Turnover Ratio
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            This ratio shows how many times a company pays off its accounts payable during a period. DPO converts this into the number of days it takes to pay a typical bill.
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
            Explore other working capital and liquidity tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/current-ratio-calculator" className="block">
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
            <Link href="/category/finance/receivables-turnover-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Receivables Turnover</p>
                      <p className="text-sm text-muted-foreground">Collection delay</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/inventory-turnover-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium">Inventory Turnover</p>
                      <p className="text-sm text-muted-foreground">Stock efficiency</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/cash-conversion-cycle-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <RotateCcw className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Cash Cycle</p>
                      <p className="text-sm text-muted-foreground">Net working capital</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/quick-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Quick Ratio</p>
                      <p className="text-sm text-muted-foreground">Acid test</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/working-capital-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-teal-600" />
                    <div>
                      <p className="font-medium">Working Capital</p>
                      <p className="text-sm text-muted-foreground">Daily operations</p>
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
        <meta itemProp="headline" content="Mastering Payables Turnover & DPO" />
        <meta itemProp="description" content="A comprehensive guide to the Payables Turnover Ratio and Days Payable Outstanding (DPO). Learn how managing these metrics can optimize your cash flow." />
        <meta itemProp="author" content="Corporate Finance Institute" />
        <meta itemProp="datePublished" content="2025-09-10" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Mastering Payables Turnover & DPO</h1>
        <p className="text-lg italic text-muted-foreground">Your accounts payable are essentially an interest-free loan from your suppliers. Managing how fast—or slow—you pay them is a delicate balancing act between maximizing cash flow and maintaining reputation.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#definition" className="hover:underline">What is Payables Turnover?</a></li>
          <li><a href="#formula" className="hover:underline">DPO: The Time Metric</a></li>
          <li><a href="#strategy" className="hover:underline">The "Slow Pay" Strategy: Pros & Cons</a></li>
          <li><a href="#benchmarks" className="hover:underline">Industry Benchmarks</a></li>
          <li><a href="#cash-cycle" className="hover:underline">Connection to Cash Conversion Cycle</a></li>
          <li><a href="#risks" className="hover:underline">Signs of Distress</a></li>
        </ul>
        <hr className="my-6" />

        <h2 id="definition" className="text-2xl font-bold text-foreground pt-8">What is Payables Turnover?</h2>
        <p>The **Accounts Payable Turnover Ratio** is a short-term liquidity metric involving trade payables. It quantifies the rate at which a company pays off its suppliers. </p>
        <p>A higher ratio means the company pays its bills frequently (fast). A lower ratio means the company pays its bills infrequently (slow). Unlike other liquidity ratios (like Current Ratio), a "higher" number isn't always better here. It depends on whether you are paying fast by choice or by necessity.</p>

        <div className="p-4 bg-muted/50 border-l-4 border-primary my-6">
          <p className="font-medium text-foreground">The Golden Rule of Working Capital</p>
          <p className="text-sm mt-2">Collect from customers as fast as possible. Pay suppliers as slow as possible (without angering them). This gap creates "free" cash flow.</p>
        </div>

        <h2 id="formula" className="text-2xl font-bold text-foreground pt-8">DPO: The Time Metric</h2>
        <p>While accountants use the ratio, business managers use **Days Payable Outstanding (DPO)**. It translates the ratio into days.</p>

        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-primary font-bold">
            DPO = 365 / Payables Turnover
          </p>
        </div>

        <p>If your DPO is 45 days, it means, on average, cash stays in your bank account for 45 days after you receive an invoice before you transfer it to the supplier.</p>

        <h3 className="text-xl font-semibold text-foreground mt-4">Deriving Credit Purchases</h3>
        <p>The hardest part of the formula is finding "Total Credit Purchases." It is rarely listed on the Income Statement. Analysts usually approximate it:</p>
        <ul className="list-disc ml-6 space-y-2 text-sm mt-2 font-mono bg-muted p-2 rounded">
          <li>Purchases = Cost of Goods Sold + Ending Inventory - Beginning Inventory</li>
        </ul>

        <hr className="my-6" />

        <h2 id="strategy" className="text-2xl font-bold text-foreground pt-8">The "Slow Pay" Strategy: Pros & Cons</h2>
        <p>Extending your DPO is a legitimate strategy used by giants like Amazon and Walmart, but it carries risks.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="border border-green-200 bg-green-50/50 p-4 rounded-lg">
            <h4 className="font-bold text-green-700">Advantages (High DPO)</h4>
            <ul className="list-disc ml-4 mt-2 space-y-1 text-sm text-muted-foreground">
              <li><strong>Increased Liquidity:</strong> You hold cash longer, which can earn interest or fund growth.</li>
              <li><strong>Working Capital Efficiency:</strong> Reduces the amount of external financing (loans) needed.</li>
              <li><strong>Leverage:</strong> Shows you have bargaining power over suppliers.</li>
            </ul>
          </div>
          <div className="border border-red-200 bg-red-50/50 p-4 rounded-lg">
            <h4 className="font-bold text-red-700">Disadvantages (High DPO)</h4>
            <ul className="list-disc ml-4 mt-2 space-y-1 text-sm text-muted-foreground">
              <li><strong>Lost Discounts:</strong> Missing a "2/10 Net 30" discount is equivalent to paying 36% annual interest.</li>
              <li><strong>Supplier Strain:</strong> If you starve suppliers of cash, they may go bankrupt or deprioritize your orders.</li>
              <li><strong>Reputation Damage:</strong> You get a reputation as a "bad payer."</li>
            </ul>
          </div>
        </div>

        <hr className="my-6" />

        <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8">Industry Benchmarks</h2>
        <p>Benchmarks are vital. A DPO of 90 days is brilliant for a car manufacturer but disastrous for a fresh vegetable market.</p>
        <ul className="space-y-4 mt-4 list-disc ml-6">
          <li><strong>Retail (Groceries):</strong> DPO ~40 days. They sell food in 2 weeks but pay suppliers in 6 weeks. This negative working capital model is highly powerful.</li>
          <li><strong>Technology/SaaS:</strong> DPO ~60+ days. Large tech firms often dictate terms to smaller vendors.</li>
          <li><strong>Construction:</strong> DPO can be very high (90+ days) due to "pay when paid" clauses with subcontractors.</li>
          <li><strong>Utilities:</strong> DPO is usually low (~30 days) as fuel suppliers require prompt payment.</li>
        </ul>

        <hr className="my-6" />

        <h2 id="cash-cycle" className="text-2xl font-bold text-foreground pt-8">Connection to Cash Conversion Cycle</h2>
        <p>Payables Turnover is one of the three legs of the **Cash Conversion Cycle (CCC)**.</p>
        <div className="my-4 p-4 bg-muted rounded-lg font-mono text-center text-sm md:text-base">
          CCC = Days Inventory Outstanding + Days Sales Outstanding - Days Payable Outstanding
        </div>
        <p>Notice that DPO is <strong>subtracted</strong>. Increasing your DPO reduces your Cash Conversion Cycle, which is generally a positive goal for financial managers.</p>

        <hr className="my-6" />

        <h2 id="risks" className="text-2xl font-bold text-foreground pt-8">Signs of Distress</h2>
        <p>Analysts watch DPO trends closely. A DPO that suddenly jumps from 45 to 60 days without explanation is a classic red flag.</p>
        <p>It suggests the company <em>cannot</em> pay its bills, rather than choosing not to. This "stretching of payables" is often the first sign of an impending liquidity crisis or bankruptcy.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common queries about supplier payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Is a higher Payables Turnover Ratio better?</h4>
              <p className="text-muted-foreground">
                Not necessarily. High turnover means you pay suppliers very quickly. While this ensures excellent credit standing, it might mean you are being too generous with your cash. You might be paying in 10 days when you are allowed 30.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What happens if DPO is too high?</h4>
              <p className="text-muted-foreground">
                If DPO is excessively high (e.g., >90 days without agreement), suppliers may stop shipping goods, demand Cash on Delivery (COD), or charge late fees. It indicates you are funding your business on the backs of your vendors.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How do early payment discounts work?</h4>
              <p className="text-muted-foreground">
                Terms like "2/10 Net 30" mean you get a 2% discount if you pay within 10 days; otherwise, the full amount is due in 30 days. Taking the discount increases turnover (lowers DPO) but is usually financially superior due to the high effective interest rate of savings.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Why is my turnover ratio calculated as negative?</h4>
              <p className="text-muted-foreground">
                This shouldn't happen in standard business. It implies either negative purchases (returns exceeding purchases) or negative accounts payable (suppliers owing you money due to overpayment). Check your input sign conventions.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How often should I calculate this?</h4>
              <p className="text-muted-foreground">
                At least quarterly. However, if cash flow is tight, a weekly review of the "Aging of Accounts Payable" report is more practical than the ratio itself.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can I use Cost of Sales instead of Purchases?</h4>
              <p className="text-muted-foreground">
                Yes, it's a common proxy when exact purchase data isn't available, assuming inventory levels remained relatively stable. However, using (COGS + Change in Inventory) is much more accurate.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does this include accrued expenses?</h4>
              <p className="text-muted-foreground">
                Typically, no. The ratio focuses on Trade Payables (invoices from suppliers of goods). Accrued liabilities (wages, taxes) are usually excluded because they don't have standard "credit terms" like Net 30.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is "Window Dressing" regarding Payables?</h4>
              <p className="text-muted-foreground">
                Some companies delay payments right up until the end of the quarter to keep cash on the balance sheet high for reporting, then pay everyone the next day. This makes the cash position look strong but inflates DPO.
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
                <strong className="block text-primary mb-1">CFOs & Treasurers</strong>
                <span className="text-sm text-muted-foreground">To manage working capital strategy. Are we paying too fast? Too slow?</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Procurement Teams</strong>
                <span className="text-sm text-muted-foreground">To negotiate better terms. If DPO is low, they can ask for longer payment terms (e.g., Net 60).</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Credit Analysts</strong>
                <span className="text-sm text-muted-foreground">To assess a company's liquidity. A skyrocketing DPO is a warning sign of insolvency.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Auditors</strong>
                <span className="text-sm text-muted-foreground">To check for unrecorded liabilities or irregularities in the payment cycle.</span>
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
                <span><strong>Averages Hide Spikes:</strong> Using annual average AP can mask the fact that you missed payments in June but overpaid in December.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Industry Differences:</strong> Comparing a supermarket's DPO to an airplane manufacturer's DPO is meaningless. Always compare to peers.</span>
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
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Amazon (Strategic Delay)</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  Amazon often has a high DPO. They collect money from customers instantly but pay suppliers later. This creates "float," effectively giving them interest-free money to expand their empire.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                <h5 className="font-semibold text-red-800 dark:text-red-300 mb-1">Toys "R" Us (The Warning Sign)</h5>
                <p className="text-sm text-red-700/80 dark:text-red-400">
                  Before bankruptcy, their DPO stretched significantly as they delayed payments to conserve cash. Suppliers eventually noticed, demanded cash upfront, and the lack of inventory accelerated their collapse.
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
          <p>The Payables Turnover Calculator reveals the speed at which a company settles its obligations to suppliers.</p>
          <p>Optimizing this metric allows businesses to balance good vendor relationships with maximized working capital.</p>
          <p>Use it to monitor cash flow health and detect early warning signs of liquidity stress.</p>
        </CardContent>
      </Card>
    </div>
  );
}
