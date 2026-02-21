'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertCircle, TrendingUp, TrendingDown, DollarSign, Calculator, Percent, BarChart3, CheckCircle2, RotateCcw, Clock, Wallet, Box, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  currentAssets: z.number().min(0, 'Must be positive'),
  currentLiabilities: z.number().min(0, 'Must be positive'),
  inventory: z.number().min(0).optional(),
  receivables: z.number().min(0).optional(),
  payables: z.number().min(0).optional(),
  sales: z.number().min(0).optional(),
  cogs: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function WorkingCapitalRequirementEstimator() {
  const [result, setResult] = useState<{
    nwc: number;
    currentRatio: number;
    dso: number | null;
    dio: number | null;
    dpo: number | null;
    ccc: number | null;
    healthLevel: string;
    interpretation: string;
    recommendation: string;
    insights: string[];
    riskFactors: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentAssets: undefined,
      currentLiabilities: undefined,
      inventory: undefined,
      receivables: undefined,
      payables: undefined,
      sales: undefined,
      cogs: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    const { currentAssets, currentLiabilities, inventory, receivables, payables, sales, cogs } = v;

    const nwc = currentAssets - currentLiabilities;
    const currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;

    // Advanced Cycle Calculation
    let dso = null; // Days Sales Outstanding
    let dio = null; // Days Inventory Outstanding
    let dpo = null; // Days Payable Outstanding
    let ccc = null; // Cash Conversion Cycle

    // Need Annual Sales/COGS to calculate days
    if (sales && receivables) dso = (receivables / sales) * 365;
    if (cogs && inventory) dio = (inventory / cogs) * 365;
    if (cogs && payables) dpo = (payables / cogs) * 365;

    if (dso !== null && dio !== null && dpo !== null) {
      ccc = dio + dso - dpo;
    }

    let healthLevel = 'Stable';
    if (currentRatio < 1) healthLevel = 'Distressed';
    if (currentRatio > 2) healthLevel = 'Strong';
    if (ccc !== null && ccc < 0) healthLevel = 'Excellent (Cash Generator)';

    const interpretation = nwc > 0
      ? `You have a working capital surplus of $${nwc.toLocaleString()}.`
      : `You have a working capital deficit of $${Math.abs(nwc).toLocaleString()}.`;

    let recommendation = '';
    if (nwc < 0) recommendation = 'Immediate liquidity risk. You may struggle to pay short-term bills. Consider credit line or inventory liquidation.';
    else if (currentRatio > 3) recommendation = 'Excessively conservative. You have idle cash that could be invested for growth.';
    else recommendation = 'Healthy balance. You can cover debts while funding day-to-day operations.';

    const insights = [
      `Current Ratio: ${currentRatio.toFixed(2)}x (Industry Standard: 1.5x - 2.0x)`,
      ccc !== null ? `Cash Conversion Cycle: ${ccc.toFixed(0)} Days` : 'Enter Sales/COGS/Inventory details to calculate your Cash Cycle.',
    ];

    if (ccc !== null) {
      if (ccc > 90) insights.push('Warning: It takes over 3 months to turn a dollar spent into cash collected.');
      else if (ccc < 0) insights.push('Negative Cash Cycle! Suppliers are essentially funding your growth.');
    }

    const riskFactors = [
      currentRatio < 1 ? 'Liquidity Crisis: Liabilities exceed Assets.' : undefined,
      dso && dso > 60 ? 'Slow Collections: Customers are taking too long to pay.' : undefined,
      dio && dio > 90 ? 'Stale Inventory: Stock is sitting on shelves too long.' : undefined,
    ].filter(Boolean) as string[];

    if (riskFactors.length === 0) riskFactors.push('Capital efficiency appears optimal.');

    return {
      nwc,
      currentRatio,
      dso,
      dio,
      dpo,
      ccc,
      healthLevel,
      interpretation,
      recommendation,
      insights,
      riskFactors,
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
            <Wallet className="h-5 w-5" />
            Balance Sheet Data
          </CardTitle>
          <CardDescription>
            Enter current assets and liabilities to estimate requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="currentAssets"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Total Current Assets ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Cash + Inventory + Receivables"
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
                  name="currentLiabilities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4" />
                        Total Current Liabilities ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Payables + Short-term Debt"
                          {...field}
                          onChange={e => field.onChange(Number(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="col-span-1 md:col-span-2 border-t pt-4 mt-2">
                  <h4 className="text-sm font-medium mb-4 text-muted-foreground">Optional: Advanced Cash Cycle Analysis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="sales"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Annual Sales ($)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g. 1000000" {...field} onChange={e => field.onChange(Number(e.target.value) || undefined)} />
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
                          <FormLabel>Annual COGS ($)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Cost of Goods" {...field} onChange={e => field.onChange(Number(e.target.value) || undefined)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="hidden md:block"></div> {/* Spacer */}

                    <FormField
                      control={form.control}
                      name="receivables"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Receivables ($)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Money owed to you" {...field} onChange={e => field.onChange(Number(e.target.value) || undefined)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="inventory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inventory Value ($)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Stock on hand" {...field} onChange={e => field.onChange(Number(e.target.value) || undefined)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="payables"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payables ($)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Money you owe" {...field} onChange={e => field.onChange(Number(e.target.value) || undefined)} />
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
                Analyze Working Capital
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
                <Activity className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Liquidity Analysis</CardTitle>
                  <CardDescription>Short-term financial health</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-center p-6 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/20">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Net Working Capital</p>
                  <p className={`text-4xl font-bold ${result.nwc >= 0 ? 'text-indigo-700 dark:text-indigo-400' : 'text-red-600'}`}>
                    ${result.nwc.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">Liquid Cushion</p>
                </div>
                <div className="text-center p-6 bg-teal-50/50 dark:bg-teal-900/10 rounded-xl border border-teal-100 dark:border-teal-900/20">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Current Ratio</p>
                  <p className="text-4xl font-bold text-teal-700 dark:text-teal-400">{result.currentRatio.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-2">Assets coverage of liabilities</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Activity className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="font-semibold">Health Status</p>
                  <Badge variant={result.healthLevel === 'Strong' || result.healthLevel.includes('Excellent') ? 'default' : result.healthLevel === 'Stable' ? 'secondary' : 'destructive'}>
                    {result.healthLevel}
                  </Badge>
                </div>
                {result.ccc !== null && (
                  <>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <RotateCcw className="h-6 w-6 mx-auto mb-2 text-amber-600" />
                      <p className="font-semibold">Cash Cycle</p>
                      <p className="text-lg font-bold text-amber-600">{result.ccc.toFixed(0)} Days</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <Box className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                      <p className="font-semibold">Inventory Speed</p>
                      <p className="text-lg font-bold text-blue-600">
                        {result.dio ? `${result.dio.toFixed(0)} Days` : 'N/A'}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-lg font-medium text-foreground">{result.interpretation}</p>
              </div>

              <Alert>
                <Activity className="h-4 w-4" />
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
                  Efficiency Metrics
                </CardTitle>
                <CardDescription>Operational breakdown</CardDescription>
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
                  Operational Risks
                </CardTitle>
                <CardDescription>Areas of concern</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.riskFactors.map((factor, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
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
            <BarChart3 className="h-5 w-5" />
            Understanding the Components
          </CardTitle>
          <CardDescription>
            Working capital is derived from these key balance sheet items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <TrendingUp className="h-4 w-4" />
                Current Assets (Inflows)
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span><strong>Inventory:</strong> Goods available for sale. Money is tied up here until sold.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span><strong>Accounts Receivable:</strong> Goods sold but not yet paid for by customers.</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <TrendingDown className="h-4 w-4" />
                Current Liabilities (Outflows)
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span><strong>Accounts Payable:</strong> Money you owe to suppliers for materials/inventory.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span><strong>Short-Term Debt:</strong> Loans due within 12 months.</span>
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
              Net Working Capital = Current Assets - Current Liabilities
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Cash Cycle = DSO + DIO - DPO
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Where DSO = Days Sales Outstanding, DIO = Days Inventory Outstanding, and DPO = Days Payable Outstanding.
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
            <Link href="/finance/current-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Current Ratio</p>
                      <p className="text-sm text-muted-foreground">Standard liquidity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/quick-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Quick Ratio</p>
                      <p className="text-sm text-muted-foreground">Acid test</p>
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
                      <p className="text-sm text-muted-foreground">Efficiency metric</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/cash-flow-forecasting-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Cash Flow Forecast</p>
                      <p className="text-sm text-muted-foreground">Budgeting tool</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/receivables-turnover-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">AR Turnover</p>
                      <p className="text-sm text-muted-foreground">Collection efficiency</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/payables-turnover-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-teal-600" />
                    <div>
                      <p className="font-medium">AP Turnover</p>
                      <p className="text-sm text-muted-foreground">Payment analysis</p>
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
        <meta itemProp="headline" content="Working Capital Requirements: The Lifeblood of Your Business" />
        <meta itemProp="description" content="Learn how to estimate operating capital needs using the Working Capital Ratio and Cash Conversion Cycle. Essential guide for liquidity management." />
        <meta itemProp="author" content="Business Efficiency Institute" />
        <meta itemProp="datePublished" content="2025-08-01" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Working Capital Requirements: The Lifeblood of Your Business</h1>
        <p className="text-lg italic text-muted-foreground">Profit is opinion; cash is fact. Working capital is the measure of your company's short-term liquidity and operational efficiency. Without it, even a profitable business can go bankrupt.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-is-it" className="hover:underline">What is Net Working Capital (NWC)?</a></li>
          <li><a href="#cycle" className="hover:underline">The Cash Conversion Cycle (CCC)</a></li>
          <li><a href="#calculating" className="hover:underline">How to Calculate Requirements</a></li>
          <li><a href="#optimizing" className="hover:underline">Strategies to Optimize Liquidity</a></li>
          <li><a href="#dangers" className="hover:underline">The Dangers of Overtrading</a></li>
        </ul>
        <hr className="my-6" />

        <h2 id="what-is-it" className="text-2xl font-bold text-foreground pt-8">What is Net Working Capital (NWC)?</h2>
        <p>Net Working Capital is simply the difference between what you own that is liquid (Current Assets) and what you owe soon (Current Liabilities).</p>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-primary font-bold">
            NWC = Current Assets - Current Liabilities
          </p>
        </div>
        <p>Current Assets include cash, inventory, and unpaid invoices (receivables). Current Liabilities include bills from suppliers (payables) and short-term debt repayments. Positive NWC means you can fund your own growth; negative NWC means you are relying on external credit to survive.</p>

        <hr className="my-6" />

        <h2 id="cycle" className="text-2xl font-bold text-foreground pt-8">The Cash Conversion Cycle (CCC)</h2>
        <p>Working capital is not static; it flows in a cycle. The CCC measures how many days it takes for a dollar spent on raw materials to return to your pocket as cash from sales.</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Step 1 (DIO):</strong> You buy inventory. It sits on the shelf for 30 days.</li>
          <li><strong>Step 2 (DSO):</strong> You sell it on credit. The customer pays in 30 days.</li>
          <li><strong>Step 3 (DPO):</strong> You pay your supplier in 45 days.</li>
        </ul>
        <p className="mt-4"><strong>Calculation:</strong> 30 (Inventory) + 30 (Receivables) - 45 (Payables) = <strong>15 Days</strong>.</p>
        <p>This means you need to fund 15 days of operations out of your own pocket (Working Capital Requirement) before the customer's cash arrives to replenish you.</p>

        <hr className="my-6" />

        <h2 id="calculating" className="text-2xl font-bold text-foreground pt-8">How to Calculate Requirements</h2>
        <p>To estimate your total Working Capital Requirement for the year:</p>
        <ol className="list-decimal ml-6 space-y-2">
          <li>Forecast your daily Operating Expenses (OpEx).</li>
          <li>Calculate your Cash Conversion Cycle (days).</li>
          <li>Multiply Daily OpEx × CCC Days.</li>
        </ol>
        <p>If you spend $1,000/day and your CCC is 15 days, you need **$15,000** permanently sitting in the bank (working capital) just to keep the lights on.</p>

        <hr className="my-6" />

        <h2 id="optimizing" className="text-2xl font-bold text-foreground pt-8">Strategies to Optimize Liquidity</h2>
        <p>You can reduce your Working Capital Requirement (effectively unlocking free cash) by:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Collecting Faster (Reduce DSO):</strong> Offer early payment discounts (e.g., 2% Net 10).</li>
          <li><strong>Selling Faster (Reduce DIO):</strong> Don't stockpile slow-moving goods. Use Just-In-Time (JIT) inventory.</li>
          <li><strong>Paying Slower (Increase DPO):</strong> Negotiate longer payment terms with suppliers (e.g., Net 60 instead of Net 30).</li>
        </ul>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common queries about liquidity management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Is negative working capital always bad?</h4>
              <p className="text-muted-foreground">
                Not always. Supermarkets (like Walmart) collect cash instantly from customers but pay suppliers 90 days later. This creates a negative cycle where they essentially use supplier money to grow. However, for most businesses, it is a danger sign suitable only for very predictable models.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is "Overtrading"?</h4>
              <p className="text-muted-foreground">
                Overtrading happens when a business grows sales faster than it can fund the working capital. You sell more, so you buy more stock and hire more staff, but since customers pay in 60 days, you run out of cash before the money hits your account. It is "growing broke."
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How does inflation affect working capital?</h4>
              <p className="text-muted-foreground">
                Inflation increases the cost of replacing inventory. If you sell an item for $100 that cost $80, but now costs $90 to replace, your working capital requirement has effectively increased just to maintain the same stock levels.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is the difference between specific and permanent working capital?</h4>
              <p className="text-muted-foreground">
                **Permanent** working capital is the minimum level required to operate year-round. **Temporary** working capital is the extra boost needed for seasonal peaks (e.g., stocking up for Christmas).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does a line of credit count as working capital?</h4>
              <p className="text-muted-foreground">
                Technically, debt increases liabilities, lowering NWC. However, a revolving credit facility is often used to *fund* working capital gaps during the cash cycle.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate Current Ratio?</h4>
              <p className="text-muted-foreground">
                Current Assets divided by Current Liabilities. A ratio of 2:1 is traditionally considered ideal, though 1.5:1 is acceptable in modern lean businesses.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is the "Quick Ratio"?</h4>
              <p className="text-muted-foreground">
                (Current Assets - Inventory) / Current Liabilities. It excludes inventory because inventory can be hard to sell quickly in a crisis. It's a stricter test of liquidity.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Why are receivables high?</h4>
              <p className="text-muted-foreground">
                High receivables mean customers aren't paying you effectively. This could be due to loose credit terms, poor collection processes, or disputes over product quality.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can working capital be too high?</h4>
              <p className="text-muted-foreground">
                Yes. Excessive inventory or idle cash suggests inefficient management. That capital could be better used investing in new machinery, R&D, or paying dividends.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How does JIT inventory help?</h4>
              <p className="text-muted-foreground">
                Just-In-Time (JIT) minimizes inventory holding (DIO), which drastically reduces the amount of cash tied up in warehouses, improving the cash cycle.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage of Calculator */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Usage of this Calculator
          </CardTitle>
          <CardDescription>
            Applying these insights to your busines operations
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
                <strong className="block text-primary mb-1">Treasurers</strong>
                <span className="text-sm text-muted-foreground">To forecast cash needs and negotiate credit lines with banks.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Supply Chain Managers</strong>
                <span className="text-sm text-muted-foreground">To see the financial impact of inventory holding times and supplier terms.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Small Business Owners</strong>
                <span className="text-sm text-muted-foreground">To ensure they have enough cash buffer to survive a bad month.</span>
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
                <span><strong>Seasonality:</strong> A snapshot at year-end might show healthy working capital, missing the fact that the company was nearly bankrupt in July due to seasonal inventory build-up.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Asset Quality:</strong> The calculator assumes all "Current Assets" are real. If 50% of your Inventory is obsolete trash, your liquidity is fake.</span>
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
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Scenario A: The Consultant (Service)</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  Zero Inventory. DSO is 30 days. DPO is 0 days (pays salaries immediately). CCC = 30 days. They need working capital strictly to cover payroll while waiting for clients to pay.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Scenario B: The Manufacturer (Product)</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                  Holds raw steel (Inventory) for 60 days. Sells to retailers on Net 60 (Receivables). Pays suppliers on Net 90. CCC = 60 + 60 - 90 = 30 days. They must fund 30 days of factory overheads themselves.
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
          <p>The Working Capital Requirement Estimator provides a clear snapshot of your short-term financial resilience.</p>
          <p>By analyzing the interplay between assets, liabilities, and cycle times, you can determine exactly how much cash is needed to operate safely.</p>
          <p>Use it to prevent liquidity crises and optimize the efficiency of your operational cash flow.</p>
        </CardContent>
      </Card>
    </div>
  );
}
