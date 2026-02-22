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
  creditSales: z.number().min(0, 'Must be positive'),
  startAR: z.number().min(0).optional(),
  endAR: z.number().min(0).optional(),
  avgAR: z.number().min(0).optional(),
  creditDays: z.number().min(0).default(30),
});

type FormValues = z.infer<typeof formSchema>;

export default function ReceivablesTurnoverCalculator() {
  const [result, setResult] = useState<{
    turnoverRatio: number;
    dso: number;
    avgAR: number;
    efficiencyRating: string;
    gap: number;
    interpretation: string;
    recommendation: string;
    insights: string[];
    riskFactors: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      creditSales: undefined,
      startAR: undefined,
      endAR: undefined,
      avgAR: undefined,
      creditDays: 30,
    },
  });

  const calculate = (v: FormValues) => {
    const { creditSales, startAR, endAR, avgAR: inputAvg, creditDays } = v;

    let averageReceivables = 0;
    if (inputAvg) {
      averageReceivables = inputAvg;
    } else if (startAR !== undefined && endAR !== undefined) {
      averageReceivables = (startAR + endAR) / 2;
    } else {
      return null; // Not enough data
    }

    if (averageReceivables === 0) return null;

    const turnoverRatio = creditSales / averageReceivables;
    const dso = 365 / turnoverRatio;
    const gap = dso - creditDays;

    let efficiencyRating = 'Stable';
    if (gap <= 0) efficiencyRating = 'Excellent';
    else if (gap <= 10) efficiencyRating = 'Good';
    else if (gap <= 30) efficiencyRating = 'Lagging';
    else efficiencyRating = 'Critical';

    const interpretation = gap <= 0
      ? `You collect cash in ${dso.toFixed(0)} days, which is faster than your ${creditDays}-day policy.`
      : `Customers are paying ${dso.toFixed(0)} days on average, which is ${gap.toFixed(0)} days late.`;

    let recommendation = '';
    if (efficiencyRating === 'Excellent') recommendation = 'Efficiency is high. You might be too strict—consider relaxing terms to boost sales.';
    else if (efficiencyRating === 'Critical') recommendation = 'Cash flow danger. Implement strict credit controls and stop supplying late payers immediately.';
    else recommendation = 'Collection performance is acceptable but could be tightened.';

    const insights = [
      `Turnover: ${turnoverRatio.toFixed(2)}x per year`,
      `Cash Delay: It takes ${dso.toFixed(0)} days to turn a sale into money.`,
      `Policy Gap: Payments are falling ${Math.abs(gap).toFixed(0)} days ${gap > 0 ? 'behind' : 'ahead of'} schedule.`
    ];

    const riskFactors = [
      turnoverRatio < 4 ? 'Low Turnover: Assets are tied up in unpaid invoices.' : undefined,
      gap > 20 ? 'Credit Policy Failure: Customers are ignoring your payment terms.' : undefined,
      averageReceivables > creditSales * 0.25 ? 'High AR Balance: A quarter of your annual sales is uncollected.' : undefined,
    ].filter(Boolean) as string[];

    if (riskFactors.length === 0) riskFactors.push('Credit management appears effective.');

    return {
      turnoverRatio,
      dso,
      avgAR: averageReceivables,
      efficiencyRating,
      gap,
      interpretation,
      recommendation,
      insights,
      riskFactors,
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
            <Wallet className="h-5 w-5" />
            Receivables Data
          </CardTitle>
          <CardDescription>
            Enter annual sales and accounts receivable balances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="creditSales"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Net Credit Sales ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Annual Sales on Credit"
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
                  name="creditDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Credit Policy (Days)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g. 30 (Net 30)"
                          {...field}
                          onChange={e => field.onChange(Number(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="col-span-1 md:col-span-2 border-t pt-4">
                  <h4 className="text-sm font-medium mb-4 text-muted-foreground">Accounts Receivable Balance</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="startAR"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Beginning of Year ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Jan 1st Balance"
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value) || undefined)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endAR"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End of Year ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Dec 31st Balance"
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value) || undefined)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="avgAR"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>OR Enter Average ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Direct Average"
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value) || undefined)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Analyze Collections
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
                  <CardTitle>Collection Efficiency</CardTitle>
                  <CardDescription>Accounts Receivable Metrics</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-center p-6 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/20">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Turnover Ratio</p>
                  <p className="text-4xl font-bold text-indigo-700 dark:text-indigo-400">{result.turnoverRatio.toFixed(2)}x</p>
                  <p className="text-xs text-muted-foreground mt-2">Collections per year</p>
                </div>
                <div className="text-center p-6 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/20">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Days Sales Outstanding (DSO)</p>
                  <p className={`text-4xl font-bold ${result.gap <= 0 ? 'text-green-600' : 'text-amber-600'}`}>
                    {result.dso.toFixed(0)} Days
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">Time to collect cash</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Activity className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="font-semibold">Rating</p>
                  <Badge variant={result.efficiencyRating === 'Excellent' || result.efficiencyRating === 'Good' ? 'default' : result.efficiencyRating === 'Stable' ? 'secondary' : 'destructive'}>
                    {result.efficiencyRating}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <RotateCcw className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Avg AR Balance</p>
                  <p className="text-lg font-bold text-blue-600">${result.avgAR.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Clock className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Gap vs Policy</p>
                  <p className={`text-lg font-bold ${result.gap <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(result.gap).toFixed(0)} Days {result.gap > 0 ? 'Late' : 'Early'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-lg font-medium text-foreground">{result.interpretation}</p>
              </div>

              <Alert>
                <Activity className="h-4 w-4" />
                <AlertDescription>
                  <strong>Management Tip:</strong> {result.recommendation}
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
                  Performance Insights
                </CardTitle>
                <CardDescription>Understanding the data</CardDescription>
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
                  Credit Risks
                </CardTitle>
                <CardDescription>Potential issues</CardDescription>
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
            Understanding the Inputs
          </CardTitle>
          <CardDescription>
            Key components of the Receivables Turnover calculation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <DollarSign className="h-4 w-4" />
                Net Credit Sales
              </h4>
              <p className="text-sm text-muted-foreground">The total revenue generated from sales where payment was not collected immediately. (Exclude cash sales). It reflects the volume of business done on credit.</p>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <Wallet className="h-4 w-4" />
                Average Accounts Receivable
              </h4>
              <p className="text-sm text-muted-foreground">The average amount of money owed to you at any given time. Calculated as (Start Balance + End Balance) / 2. This represents average capital tied up.</p>
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
              Receivables Turnover = Net Credit Sales / Average Accounts Receivable
            </p>
            <p className="font-mono text-sm text-center mt-2">
              DSO = 365 / Receivables Turnover
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
          <CardDescription>
            Tools to compare simplified options and plan repayments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/working-capital-requirement-estimator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Working Capital</p>
                      <p className="text-sm text-muted-foreground">Liquidity estimator</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/current-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Current Ratio</p>
                      <p className="text-sm text-muted-foreground">Short-term solvency</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/cash-conversion-cycle-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <RotateCcw className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium">Cash Cycle</p>
                      <p className="text-sm text-muted-foreground">Cash speed testing</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/inventory-turnover-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Box className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Inventory Turnover</p>
                      <p className="text-sm text-muted-foreground">Stock efficiency</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/payables-turnover-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">AP Turnover</p>
                      <p className="text-sm text-muted-foreground">Payment analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/cash-flow-forecasting-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-teal-600" />
                    <div>
                      <p className="font-medium">Operating Cash Flow</p>
                      <p className="text-sm text-muted-foreground">Cash generation</p>
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
        <meta itemProp="headline" content="Mastering Sales Collection: Receivables Turnover & DSO" />
        <meta itemProp="description" content="A complete guide to calculating Receivables Turnover Ratio and Days Sales Outstanding (DSO). Learn to optimize credit terms and cash flow." />
        <meta itemProp="author" content="Credit Management Association" />
        <meta itemProp="datePublished" content="2025-07-20" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Mastering Sales Collection: Receivables Turnover & DSO</h1>
        <p className="text-lg italic text-muted-foreground">A sale is not a sale until the money is in the bank. Receivables Turnover metrics reveal whether your customers are paying you on time, or if your business is acting as an interest-free bank for them.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-is-it" className="hover:underline">What is Receivables Turnover?</a></li>
          <li><a href="#dso" className="hover:underline">Understanding Days Sales Outstanding (DSO)</a></li>
          <li><a href="#benchmarks" className="hover:underline">Industry Benchmarks & Interpretations</a></li>
          <li><a href="#improvement" className="hover:underline">Strategies to Improve Collections</a></li>
          <li><a href="#risks" className="hover:underline">The Risks of Poor Credit Management</a></li>
        </ul>
        <hr className="my-6" />

        <h2 id="what-is-it" className="text-2xl font-bold text-foreground pt-8">What is Receivables Turnover?</h2>
        <p>The Receivables Turnover Ratio measures how many times per year a company collects its average accounts receivable balance. It is a key efficiency ratio.</p>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-primary font-bold">
            Ratio = Net Credit Sales / Average Accounts Receivable
          </p>
        </div>
        <p>A high ratio means you collect debts quickly (efficient). A low ratio means you have trouble collecting (inefficient), waiting months for payments that should take weeks.</p>

        <hr className="my-6" />

        <h2 id="dso" className="text-2xl font-bold text-foreground pt-8">Understanding Days Sales Outstanding (DSO)</h2>
        <p>DSO converts the ratio into days, which is easier to understand. If you have "Net 30" payment terms, your DSO should be close to 30.</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>DSO 30 Days:</strong> Excellent. Customers pay exactly on time.</li>
          <li><strong>DSO 45 Days:</strong> Average. Customers pay slightly late, but acceptable.</li>
          <li><strong>DSO 60+ Days:</strong> Critical. Customers are treating you as a lender. You are financing their business at your own expense.</li>
        </ul>

        <hr className="my-6" />

        <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8">Industry Benchmarks & Interpretations</h2>
        <p>Context matters. Comparing a supermarket to a construction firm is useless.</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Retail/Grocery:</strong> Very High Turnover (Customers pay cash instantly).</li>
          <li><strong>Construction:</strong> Low Turnover (Large progress payments take months to approve).</li>
          <li><strong>SaaS:</strong> Mixed (Monthly subscriptions are instant, Enterprise contracts are Net 30/60).</li>
        </ul>

        <hr className="my-6" />

        <h2 id="improvement" className="text-2xl font-bold text-foreground pt-8">Strategies to Improve Collections</h2>
        <ol className="list-decimal ml-6 space-y-2">
          <li><strong>Early Payment Discount:</strong> Offer "2/10 Net 30" (2% discount if paid in 10 days). It's cheaper than a loan.</li>
          <li><strong>Automated Reminders:</strong> Use software to email clients 3 days before payment is due, not just after.</li>
          <li><strong>Credit Checks:</strong> Do not offer credit to customers with a history of default.</li>
          <li><strong>Stop Supply:</strong> If a customer is 60 days overdue, stop shipping new goods until they pay the old bill.</li>
        </ol>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common queries about collection metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Is a higher ratio always better?</h4>
              <p className="text-muted-foreground">
                Generally yes, but if it's *too* high, it might mean your credit policy is too strict (e.g., Cash On Delivery only). You might be losing sales to competitors who offer Net 30.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does this include cash sales?</h4>
              <p className="text-muted-foreground">
                No. You should strictly use **Credit Sales** (where an invoice is issued). Including cash sales inflates the ratio because there was never any "receivable" to collect.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate "Average AR"?</h4>
              <p className="text-muted-foreground">
                (Beginning AR + Ending AR) / 2. For more accuracy in seasonal businesses, calculate the average of 12 monthly ending balances.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is "Bad Debt"?</h4>
              <p className="text-muted-foreground">
                Receivables that are deemed uncollectible (the customer went bankrupt or refuses to pay). These should eventually be written off, which lowers the AR balance.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Why does DSO go up in a recession?</h4>
              <p className="text-muted-foreground">
                Customers are cash-strapped, so they delay paying suppliers like you to preserve their own cash. It's a "contagion" of liquidity issues.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How does factoring affect this?</h4>
              <p className="text-muted-foreground">
                Factoring (selling invoices to a third party) artificially lowers DSO because you get cash immediately (from the factor), removing the AR from your books.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is an "Aging Schedule"?</h4>
              <p className="text-muted-foreground">
                A report showing how much AR is 0-30 days, 31-60 days, and 90+ days overdue. It's more detailed than a single DSO number.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Should I offer Net 60 or Net 90?</h4>
              <p className="text-muted-foreground">
                Only for large, reliable corporate clients. For small businesses, Net 30 is standard. Extended terms effectively mean you are loaning them money for free.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How does this impact working capital?</h4>
              <p className="text-muted-foreground">
                High DSO = High Receivables = High Working Capital requirement. Reducing DSO unlocks cash that can be used for growth.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is "DSO Best Possible"?</h4>
              <p className="text-muted-foreground">
                It considers only current receivables (not overdue ones) to show the theoretical best collection speed achievable with current payment terms.
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
            Best practices for applying collection metrics
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
                <strong className="block text-primary mb-1">Credit Managers</strong>
                <span className="text-sm text-muted-foreground">To assess the effectiveness of their collection department.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">CFOs</strong>
                <span className="text-sm text-muted-foreground">To forecast cash inflows. If sales double but DSO also doubles, the company will run out of cash.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Auditors</strong>
                <span className="text-sm text-muted-foreground">To detect potential fraud. Soaring AR without cash collection can indicate fake sales.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Investors</strong>
                <span className="text-sm text-muted-foreground">To judge the "quality of earnings." Earnings backed by cash are better than earnings backed by IOUs.</span>
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
                <span><strong>Averages mislead:</strong> If you have one huge customer who pays 90 days late, and 100 small ones who pay on time, the average DSO will look bad, hiding the specific problem.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Sales Fluctuations:</strong> If sales spike in the last month of the year (December), the Ending AR will be huge, making the Turnover Ratio look artificially low.</span>
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
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Scenario A: The Efficient Distributor</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  Offers 2% discount for Net 10 payments. 80% of customers take the discount. DSO is 12 days. Turnover is 30x. They have massive cash flow to buy new inventory and often grow faster than competitors.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Scenario B: The "Channel Stuffing" Trap</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                  A company boosts Q4 "Sales" by shipping unwanted product to distributors with Net 120 terms. Revenue looks great, but AR Turnover crashes. Investors spot the anomaly and realize the growth is fake.
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
          <p>The Receivables Turnover Calculator helps you analyze the speed and efficiency of your cash collection process.</p>
          <p>By monitoring the time gap between making a sale and receiving the cash (DSO), you can identify liquidity bottlenecks before they become crises.</p>
          <p>Use it to benchmark your credit policies and ensure your earnings quality remains high.</p>
        </CardContent>
      </Card>
    </div>
  );
}
