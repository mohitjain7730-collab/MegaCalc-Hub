'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertCircle, TrendingUp, TrendingDown, DollarSign, Calculator, Calendar, BarChart3, CheckCircle2, Wallet, ArrowRight, PieChart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  startingCash: z.number().min(0, 'Starting cash cannot be negative'),
  operatingIn: z.number().min(0).optional(),
  operatingOut: z.number().min(0).optional(),
  investingIn: z.number().min(0).optional(),
  investingOut: z.number().min(0).optional(),
  financingIn: z.number().min(0).optional(),
  financingOut: z.number().min(0).optional(),
  months: z.number().min(1).max(60).default(12),
});

type FormValues = z.infer<typeof formSchema>;

export default function CashFlowForecastingCalculator() {
  const [result, setResult] = useState<{
    endingCash: number;
    netCashFlow: number;
    operatingNet: number;
    investingNet: number;
    financingNet: number;
    runway: number | null;
    status: string;
    interpretation: string;
    recommendation: string;
    insights: string[];
    risks: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startingCash: undefined,
      operatingIn: undefined,
      operatingOut: undefined,
      investingIn: undefined,
      investingOut: undefined,
      financingIn: undefined,
      financingOut: undefined,
      months: 12,
    },
  });

  const calculate = (v: FormValues) => {
    const { startingCash, operatingIn = 0, operatingOut = 0, investingIn = 0, investingOut = 0, financingIn = 0, financingOut = 0, months } = v;

    const operatingNet = operatingIn - operatingOut;
    const investingNet = investingIn - investingOut;
    const financingNet = financingIn - financingOut;

    const netCashFlow = operatingNet + investingNet + financingNet;
    const endingCash = startingCash + (netCashFlow * months);

    let runway = null;
    if (netCashFlow < 0) {
      runway = Math.abs(startingCash / netCashFlow);
    }

    let status = 'Stable';
    if (netCashFlow > 0) status = 'Positive';
    else if (endingCash < 0) status = 'Insolvent';
    else status = 'Negative (But Surviving)';

    const interpretation = netCashFlow > 0
      ? `You are generating a monthly surplus of $${netCashFlow.toLocaleString()}. Over ${months} months, you will add $${(netCashFlow * months).toLocaleString()} to your reserves.`
      : `You are burning $${Math.abs(netCashFlow).toLocaleString()} per month.`;

    let recommendation = '';
    if (status === 'Insolvent') recommendation = 'CRITICAL: You will run out of cash before the period ends. Immediate capital injection or drastic cuts needed.';
    else if (status === 'Positive') recommendation = 'Healthy flow. Consider reinvesting surpluses into growth or paying down debt.';
    else if (runway && runway < 6) recommendation = 'Warning: Less than 6 months of runway. Start fundraising or cutting costs immediately.';
    else recommendation = `You have ${runway?.toFixed(1)} months of runway. Monitor expenses closely.`;

    const insights = [
      `Operating Cash Flow: $${operatingNet.toLocaleString()} (Core Business)`,
      `Monthly Burn/Surplus: $${netCashFlow.toLocaleString()}`,
      `Projected Balance in ${months} Months: $${endingCash.toLocaleString()}`,
    ];

    const risks = [
      operatingNet < 0 ? 'Core Operations Unprofitable: You are losing money on every sale/service.' : undefined,
      investingNet > 0 ? 'Asset Sales: You are sustaining cash flow by selling assets, which is not sustainable.' : undefined,
      endingCash < startingCash * 0.2 ? 'Low Buffer: Ending balance provides minimal safety margin.' : undefined,
    ].filter(Boolean) as string[];

    if (risks.length === 0 && netCashFlow > 0) risks.push('No immediate red flags detected.');
    if (risks.length === 0 && netCashFlow < 0) risks.push('Burn rate is strictly controlled but finite.');

    return {
      endingCash,
      netCashFlow,
      operatingNet,
      investingNet,
      financingNet,
      runway,
      status,
      interpretation,
      recommendation,
      insights,
      risks,
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
            Cash Flow Inputs (Monthly Average)
          </CardTitle>
          <CardDescription>
            Enter your monthly inflows and outflows by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="startingCash"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-lg font-semibold">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          Starting Cash Balance
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="text-lg"
                            placeholder="Current amount in bank"
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4 border p-4 rounded-lg bg-blue-50/50 dark:bg-blue-900/10">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Inflows (Money In)</h4>
                  <FormField control={form.control} name="operatingIn" render={({ field }) => (<FormItem><FormLabel>Operating (Sales/Revenue)</FormLabel><FormControl><Input type="number" placeholder="0" {...field} onChange={e => field.onChange(Number(e.target.value) || undefined)} /></FormControl></FormItem>)} />
                  <FormField control={form.control} name="investingIn" render={({ field }) => (<FormItem><FormLabel>Investing (Selling Assets)</FormLabel><FormControl><Input type="number" placeholder="0" {...field} onChange={e => field.onChange(Number(e.target.value) || undefined)} /></FormControl></FormItem>)} />
                  <FormField control={form.control} name="financingIn" render={({ field }) => (<FormItem><FormLabel>Financing (Loans/Equity)</FormLabel><FormControl><Input type="number" placeholder="0" {...field} onChange={e => field.onChange(Number(e.target.value) || undefined)} /></FormControl></FormItem>)} />
                </div>

                <div className="space-y-4 border p-4 rounded-lg bg-red-50/50 dark:bg-red-900/10">
                  <h4 className="font-semibold text-red-700 dark:text-red-300 flex items-center gap-2"><TrendingDown className="h-4 w-4" /> Outflows (Money Out)</h4>
                  <FormField control={form.control} name="operatingOut" render={({ field }) => (<FormItem><FormLabel>Operating (Rent/Wages)</FormLabel><FormControl><Input type="number" placeholder="0" {...field} onChange={e => field.onChange(Number(e.target.value) || undefined)} /></FormControl></FormItem>)} />
                  <FormField control={form.control} name="investingOut" render={({ field }) => (<FormItem><FormLabel>Investing (Buying Assets)</FormLabel><FormControl><Input type="number" placeholder="0" {...field} onChange={e => field.onChange(Number(e.target.value) || undefined)} /></FormControl></FormItem>)} />
                  <FormField control={form.control} name="financingOut" render={({ field }) => (<FormItem><FormLabel>Financing (Loan Repayments)</FormLabel><FormControl><Input type="number" placeholder="0" {...field} onChange={e => field.onChange(Number(e.target.value) || undefined)} /></FormControl></FormItem>)} />
                </div>

                <div className="md:col-span-2 pt-4">
                  <FormField
                    control={form.control}
                    name="months"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Projection Period (Months)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="12"
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
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Generate Forecast
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
                  <CardTitle>Forecast Summary</CardTitle>
                  <CardDescription>Projected position in {form.getValues('months')} months</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-center p-6 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/20">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Net Monthly Flow</p>
                  <p className={`text-4xl font-bold ${result.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {result.netCashFlow >= 0 ? '+' : ''}${result.netCashFlow.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">Change per month</p>
                </div>
                <div className="text-center p-6 bg-teal-50/50 dark:bg-teal-900/10 rounded-xl border border-teal-100 dark:border-teal-900/20">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Projected Ending Balance</p>
                  <p className={`text-4xl font-bold ${result.endingCash >= 0 ? 'text-teal-700 dark:text-teal-400' : 'text-red-600'}`}>
                    ${result.endingCash.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">Final cash position</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Activity className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Operating CF</p>
                  <p className={`text-lg font-bold ${result.operatingNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${result.operatingNet.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <PieChart className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Investing CF</p>
                  <p className={`text-lg font-bold ${result.investingNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${result.investingNet.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Wallet className="h-6 w-6 mx-auto mb-2 text-amber-600" />
                  <p className="font-semibold">Financing CF</p>
                  <p className={`text-lg font-bold ${result.financingNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${result.financingNet.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-lg font-medium text-foreground">{result.interpretation}</p>
                {result.runway && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Current Runway: <span className="font-bold text-foreground">{result.runway.toFixed(1)} Months</span>
                  </p>
                )}
              </div>

              <Alert variant={result.status === 'Insolvent' ? 'destructive' : 'default'}>
                <Activity className="h-4 w-4" />
                <AlertDescription>
                  <strong>Suggestion:</strong> {result.recommendation}
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
                  Key Insights
                </CardTitle>
                <CardDescription>Analysis highlights</CardDescription>
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
                <CardDescription>Potential dangers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.risks.map((factor, index) => (
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
            Understanding Cash Flow Categories
          </CardTitle>
          <CardDescription>
            Not all cash is created equal. Understanding the source matters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Activity className="h-4 w-4" />
                Operating
              </h4>
              <p className="text-sm text-muted-foreground">The core engine. Revenue from customers minus expenses (wages, rent, materials). Positive Operating CF is essential for long-term survival.</p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <PieChart className="h-4 w-4" />
                Investing
              </h4>
              <p className="text-sm text-muted-foreground">Buying/selling long-term assets. "Outflows" here are often good (buying new equipment for growth). "Inflows" can be bad (panic selling assets).</p>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <Wallet className="h-4 w-4" />
                Financing
              </h4>
              <p className="text-sm text-muted-foreground">Debt and Equity. Inflows mean you took a loan or sold stock. Outflows mean you are paying back debt or paying dividends.</p>
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
              Net Cash Flow = (Operating In - Out) + (Investing In - Out) + (Financing In - Out)
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Ending Balance = Starting Balance + (Net Cash Flow × Months)
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
            <Link href="/free-cash-flow-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Free Cash Flow</p>
                      <p className="text-sm text-muted-foreground">Valuation metric</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/working-capital-requirement-estimator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Working Capital</p>
                      <p className="text-sm text-muted-foreground">Liquidity needs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/financial-forecast-growth-rate-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium">Growth Planner</p>
                      <p className="text-sm text-muted-foreground">Revenue modeling</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/future-value-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Future Value</p>
                      <p className="text-sm text-muted-foreground">Saving projection</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dcf-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <PieChart className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">DCF Calculator</p>
                      <p className="text-sm text-muted-foreground">Intrinsic valuation</p>
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
        <meta itemProp="headline" content="Mastering Cash Flow Forecasting: The Survival Guide" />
        <meta itemProp="description" content="A comprehensive guide to predicting cash flow. Learn the difference between profit and cash, how to calculate runway, and manage liquidity risks." />
        <meta itemProp="author" content="Corporate Finance Institute" />
        <meta itemProp="datePublished" content="2025-08-10" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Mastering Cash Flow Forecasting: The Survival Guide</h1>
        <p className="text-lg italic text-muted-foreground">"Revenue is vanity, profit is sanity, but cash is reality." A cash flow forecast is the single most important tool for preventing bankruptcy and ensuring operational stability.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#profit-vs-cash" className="hover:underline">Profit vs. Cash: The Critical Distinction</a></li>
          <li><a href="#three-activities" className="hover:underline">The 3 Pillars of Cash Flow</a></li>
          <li><a href="#forecasting" className="hover:underline">How to Build a Reliable Forecast</a></li>
          <li><a href="#runway" className="hover:underline">Understanding "Burn Rate" & "Runway"</a></li>
          <li><a href="#mistakes" className="hover:underline">Common Forecasting Mistakes</a></li>
        </ul>
        <hr className="my-6" />

        <h2 id="profit-vs-cash" className="text-2xl font-bold text-foreground pt-8">Profit vs. Cash: The Critical Distinction</h2>
        <p>Many profitable businesses go bankrupt. Why? Because **Profit** is an accounting concept (Sales - Expenses), recorded when an invoice is sent. **Cash Flow** is the actual movement of money, recorded when the check clears.</p>
        <p>If you sell $1M of goods today but the customer pays in 90 days, your Profit is $1M, but your Cash Flow is $0. You still need to pay rent and salaries next month. Forecasting bridges this gap.</p>

        <hr className="my-6" />

        <h2 id="three-activities" className="text-2xl font-bold text-foreground pt-8">The 3 Pillars of Cash Flow</h2>
        <p>Standard accounting (GAAP/IFRS) splits cash flow into three distinct categories:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Operating Activities:</strong> The day-to-day business. Collecting cash from customers vs. paying suppliers/employees. This MUST be positive in the long run.</li>
          <li><strong>Investing Activities:</strong> Capital expenditures (CapEx). Buying or selling equipment, property, or stocks. Usually negative for growing companies (investing in the future).</li>
          <li><strong>Financing Activities:</strong> How you fund the business. Taking loans (Inflow), paying them back (Outflow), issuing shares (Inflow), or paying dividends (Outflow).</li>
        </ul>

        <hr className="my-6" />

        <h2 id="forecasting" className="text-2xl font-bold text-foreground pt-8">How to Build a Reliable Forecast</h2>
        <p>Specifically for the "Direct Method" used in this calculator:</p>
        <ol className="list-decimal ml-6 space-y-2">
          <li><strong>Estimate Collections:</strong> Don't just list sales. List when you expect to *receive* the money based on your average payment terms (e.g., Net 30).</li>
          <li><strong>List Fixed Outflows:</strong> Rent, salaries, insurance, loan payments. These happen regardless of sales.</li>
          <li><strong>Estimate Variable Outflows:</strong> Inventory purchases, marketing spend, shipping costs. These scale with sales.</li>
          <li><strong>Add One-Offs:</strong> Tax bills, annual bonuses, equipment repairs.</li>
        </ol>

        <hr className="my-6" />

        <h2 id="runway" className="text-2xl font-bold text-foreground pt-8">Understanding "Burn Rate" & "Runway"</h2>
        <p>For startups or companies in a turnaround, these metrics are vital:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Burn Rate:</strong> The amount of cash you are losing per month (Net Cash Flow is negative). E.g., -$10,000/month.</li>
          <li><strong>Runway:</strong> How much time you have left before you die. (Starting Cash / Monthly Burn). E.g., $100k Cash / $10k Burn = 10 Months Runway.</li>
        </ul>
        <p>If your runway drops below 6 months, it is generally considered an emergency. You must raise funds or cut costs immediately.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common queries about cash planning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">How often should I update my forecast?</h4>
              <p className="text-muted-foreground">
                Ideally, update it monthly. In a crisis (like a rigorous recession of cash crunch), update it weekly using a "13-Week Cash Flow Model."
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is "Free Cash Flow" (FCF)?</h4>
              <p className="text-muted-foreground">
                Operating Cash Flow minus Capital Expenditures. It represents the actual cash available to pay back investors after maintaining the company's asset base.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does depreciation affect cash flow?</h4>
              <p className="text-muted-foreground">
                No. Depreciation is a non-cash expense. It lowers your reported profit (and taxes), but no money actually leaves your bank account.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Why is my cash flow negative if I'm profitable?</h4>
              <p className="text-muted-foreground">
                Typically because of working capital issues: customers are paying too slow (High Receivables) or you are buying too much inventory upfront. Or you spent heavily on new equipment (investing outflow).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How does a loan affect cash flow?</h4>
              <p className="text-muted-foreground">
                Receiving the loan = Financing Inflow (Good for cash balance). Paying monthly interest/principal = Financing Outflow (Bad for cash balance).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is the "Indirect Method"?</h4>
              <p className="text-muted-foreground">
                It starts with Net Income (Profit) and adjusts for non-cash items (Depreciation) and changes in working capital. It's standard for corporate reporting but harder for small businesses to use for forecasting.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Should investing cash flow always be negative?</h4>
              <p className="text-muted-foreground">
                Usually, yes. A growing company should be "investing" cash into new assets. Positive investing cash flow usually means the company is shrinking or liquidating assets.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How do I increase cash flow without increasing sales?</h4>
              <p className="text-muted-foreground">
                Collect debts faster, negotiate longer payment terms with suppliers, reduce inventory levels, or sell unused assets.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Is a tax refund cash flow?</h4>
              <p className="text-muted-foreground">
                Yes, it is a cash inflow, usually categorized under Operating Activities.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is a "Cash Flow Hedge"?</h4>
              <p className="text-muted-foreground">
                A financial instrument (like a future or option) used to protect against the risk that future cash flows decrease due to currency changes or commodity price swings.
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
            Best practices for applying forecast data
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
                <strong className="block text-primary mb-1">Startup Founders</strong>
                <span className="text-sm text-muted-foreground">To calculate "Runway" and know exactly when they must close a funding round.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Small Business Owners</strong>
                <span className="text-sm text-muted-foreground">To ensure they have enough cash for the "slow season" or to cover a large tax bill.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">CFOs & Controllers</strong>
                <span className="text-sm text-muted-foreground">To model "what-if" scenarios: "Can we afford to hire 5 new engineers this month?"</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Banks & Lenders</strong>
                <span className="text-sm text-muted-foreground">Require forecasts to ensure a borrower has the liquidity to service debt payments (DSCR).</span>
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
                <span><strong>Lumpy Payments:</strong> Using "monthly averages" smooths out reality. If you have $100k inflow but it all comes on Day 30, and $50k expenses due Day 1, you will bounce checks despite being "Positive."</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Optimism Bias:</strong> Humans consistently overestimate future sales inflows and underestimate cost overruns. Always apply a "safety factor" (e.g., 90% of revenue, 110% of costs).</span>
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
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Scenario A: The SaaS Scale-Up</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  A software company has -$50k Operating Cash Flow (losing money on heavy customer acquisition) but +$2M Financing Inflow (VC investment). Their goal is to survive the "burn" until renewals (Operating Inflow) exceed costs.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Scenario B: The Construction Company</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                  They win a $1M contract. Great! But they must spend $200k on materials/labor (Operating Outflow) for 3 months before they can bill the client (Operating Inflow). They need a $600k bridge loan or cash reserve to survive the job.
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
          <p>The Cash Flow Forecasting Calculator allows you to peer into the future of your company's liquidity.</p>
          <p>By breaking down cash movements into Operating, Investing, and Financing activities, it pinpoints exactly where money is being created or consumed.</p>
          <p>Use it to calculate your runway, plan for capital expenditures, and sleep soundly knowing you can meet your future financial obligations.</p>
        </CardContent>
      </Card>
    </div>
  );
}
