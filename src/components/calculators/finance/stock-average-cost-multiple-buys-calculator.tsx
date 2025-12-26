'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, DollarSign, Hash, FunctionSquare, HelpCircle, Shield, Info, Target, AlertCircle, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const lotSchema = z.object({ shares: z.number().min(0.0001).optional(), price: z.number().min(0.0001).optional(), fee: z.number().min(0).optional() });
const formSchema = z.object({ lots: z.array(lotSchema).min(1) });
type FormValues = z.infer<typeof formSchema>;

export default function StockAverageCostMultipleBuysCalculator() {
  const [result, setResult] = useState<{
    totalShares: number;
    totalCost: number;
    averageCost: number;
    totalFees: number;
    feePercentage: number;
    lotCount: number;
    interpretation: string;
    costLevel: string;
    recommendation: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { lots: [{ shares: undefined as any, price: undefined as any, fee: undefined as any }] as any } });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'lots' });

  const getInsights = (avgCost: number, totalFees: number, lotCount: number, feePercentage: number): string[] => {
    const insights: string[] = [];
    insights.push(`Your weighted average cost is $${avgCost.toFixed(4)} per share`);
    if (feePercentage < 0.5) {
      insights.push('Low fee impact—transaction costs are well-controlled');
    } else if (feePercentage < 2) {
      insights.push('Moderate fee impact on your cost basis');
    } else {
      insights.push('High fee impact—consider lower-cost brokers');
    }
    if (lotCount > 5) {
      insights.push('Multiple purchases indicate dollar-cost averaging strategy');
    }
    return insights;
  };

  const getConsiderations = (): string[] => [
    'Verify this matches broker-reported cost basis',
    'Remember to adjust for stock splits and corporate actions',
    'DRIP reinvestments create additional lots over time',
    'Cost basis method affects your tax liability',
    'Keep records for at least 7 years for tax purposes'
  ];

  const getCostLevel = (feePercentage: number): string => {
    if (feePercentage < 0.5) return 'Low Fees';
    if (feePercentage < 2) return 'Moderate Fees';
    return 'High Fees';
  };

  const getRecommendation = (feePercentage: number, lotCount: number): string => {
    if (feePercentage > 2) return 'Consider consolidating purchases to reduce fee impact on cost basis.';
    if (lotCount > 10) return 'Good dollar-cost averaging approach—track for wash sale compliance.';
    return 'Your cost basis is well-tracked. Compare to current price to assess unrealized gains.';
  };

  const onSubmit = (v: FormValues) => {
    let totalShares = 0; let totalCost = 0; let totalFees = 0; let validLots = 0;
    v.lots.forEach(l => {
      if (l.shares != null && l.price != null) {
        totalShares += l.shares;
        totalCost += l.shares * l.price + (l.fee ?? 0);
        totalFees += l.fee ?? 0;
        validLots++;
      }
    });
    const avg = totalCost / totalShares;
    const feePercentage = (totalFees / totalCost) * 100;
    setResult({
      totalShares,
      totalCost,
      averageCost: avg,
      totalFees,
      feePercentage,
      lotCount: validLots,
      interpretation: `Your weighted average cost per share is $${avg.toFixed(4)}, including $${totalFees.toFixed(2)} in total fees across ${validLots} lot(s).`,
      costLevel: getCostLevel(feePercentage),
      recommendation: getRecommendation(feePercentage, validLots),
      insights: getInsights(avg, totalFees, validLots, feePercentage),
      considerations: getConsiderations()
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader><CardTitle>Stock Average Cost (Multiple Buys)</CardTitle><CardDescription>Compute weighted cost basis with fees</CardDescription></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-3">
                {fields.map((f, i) => (
                  <div key={f.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                    <FormField control={form.control} name={`lots.${i}.shares` as const} render={({ field }) => (
                      <FormItem><FormLabel className="flex items-center gap-2"><Hash className="h-4 w-4" /> Shares</FormLabel><FormControl><Input type="number" step="0.0001" {...field} value={field.value as any} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name={`lots.${i}.price` as const} render={({ field }) => (
                      <FormItem><FormLabel className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Price</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value as any} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name={`lots.${i}.fee` as const} render={({ field }) => (
                      <FormItem><FormLabel>Fee (optional)</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value as any ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <Button type="button" variant="destructive" onClick={() => remove(i)} className="md:w-auto"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <Button type="button" onClick={() => append({ shares: undefined as any, price: undefined as any, fee: undefined as any })}><Plus className="h-4 w-4 mr-2" />Add Lot</Button>
                <Button type="submit" className="md:w-auto">Calculate Average Cost</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          {/* Main Result Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <DollarSign className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Average Cost Basis</CardTitle>
                  <CardDescription>Weighted cost across all lots</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">${result.averageCost.toFixed(4)}</p>
                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Hash className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Total Shares</p>
                  <p className="text-lg font-bold">{result.totalShares.toFixed(4)}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Total Cost</p>
                  <p className="text-lg font-bold">${result.totalCost.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingDown className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                  <p className="font-semibold">Total Fees</p>
                  <p className="text-lg font-bold">${result.totalFees.toFixed(2)}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Target className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Fee Impact</p>
                  <Badge variant={result.feePercentage < 0.5 ? 'default' : result.feePercentage < 2 ? 'secondary' : 'destructive'}>
                    {result.costLevel}
                  </Badge>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Recommendation:</strong> {result.recommendation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Strategic Insights & Risk Assessment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Target className="h-6 w-6" />
                  Strategic Insights
                </CardTitle>
                <CardDescription>Cost basis optimization opportunities</CardDescription>
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
                <CardDescription>Critical factors to monitor</CardDescription>
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

      <Card>
        <CardHeader><CardTitle>Related Calculators</CardTitle><CardDescription>More investing tools</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/stock-split-impact-calculator" className="text-primary hover:underline">Stock Split Impact</Link></h4><p className="text-sm text-muted-foreground">Share count changes.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/dividend-yield-calculator" className="text-primary hover:underline">Dividend Yield</Link></h4><p className="text-sm text-muted-foreground">Income rate.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/present-value-calculator" className="text-primary hover:underline">Present Value</Link></h4><p className="text-sm text-muted-foreground">Discount cash flows.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/compound-interest-calculator" className="text-primary hover:underline">Compound Interest</Link></h4><p className="text-sm text-muted-foreground">Growth over time.</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Formula Used */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FunctionSquare className="h-5 w-5" />
            Formula Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              Average Cost = Total Cost / Total Shares
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Where: Total Cost = Σ(Shares × Price + Fees) for all lots
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            This weighted average captures your true cost basis including all transaction fees, essential for accurate tax reporting.
          </p>
        </CardContent>
      </Card>

      {/* Input Explanations */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
          <CardDescription>What each parameter means for cost basis calculations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><Hash className="h-4 w-4" /> Shares per Lot</h4>
              <p className="text-sm text-muted-foreground">The number of shares purchased in each transaction. Supports fractional shares for DRIPs.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><DollarSign className="h-4 w-4" /> Price per Share</h4>
              <p className="text-sm text-muted-foreground">The purchase price for each share in each lot from your brokerage statement.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><DollarSign className="h-4 w-4" /> Fee (optional)</h4>
              <p className="text-sm text-muted-foreground">Transaction costs—commissions, SEC fees. Including these gives true all-in cost.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete SEO Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Complete Guide to Stock Average Cost Basis: Managing Multiple Purchase Lots</h1>
        <p className="text-lg italic text-muted-foreground">Master cost basis tracking for accurate tax reporting and investment performance measurement.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-is-cost-basis" className="hover:underline">What is Cost Basis?</a></li>
          <li><a href="#why-average-cost" className="hover:underline">Why Use Average Cost?</a></li>
          <li><a href="#cost-methods" className="hover:underline">Cost Basis Methods Explained</a></li>
          <li><a href="#including-fees" className="hover:underline">Including Fees and Commissions</a></li>
          <li><a href="#special-situations" className="hover:underline">Special Situations</a></li>
          <li><a href="#tax-implications" className="hover:underline">Tax Implications</a></li>
        </ul>
        <hr />

        <h2 id="what-is-cost-basis" className="text-2xl font-bold text-foreground pt-8">What is Cost Basis?</h2>
        <p>Cost basis is the original value of an asset for tax purposes, typically the purchase price plus any associated costs. When you sell an investment, your capital gain or loss is calculated as the difference between your sale proceeds and your cost basis.</p>

        <p className="mt-4">When you buy a stock multiple times at different prices, you need a method to determine which cost to use when calculating gains or losses. This is where average cost basis becomes valuable.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why Cost Basis Matters</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Tax Reporting:</strong> You must report cost basis to calculate taxable gains or deductible losses.</li>
          <li><strong>Performance Tracking:</strong> Knowing your true cost helps measure actual investment returns.</li>
          <li><strong>Decision Making:</strong> Understanding your break-even point informs sell decisions.</li>
          <li><strong>Record Keeping:</strong> Brokers report basis to tax authorities; you should verify accuracy.</li>
        </ul>
        <hr />

        <h2 id="why-average-cost" className="text-2xl font-bold text-foreground pt-8">Why Use Average Cost?</h2>
        <p>Average cost simplifies tracking when you've made many purchases over time. Instead of tracking the specific cost of each share, you calculate a weighted average across all purchases.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Benefits of Average Cost Method</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Simplicity:</strong> One number to track instead of multiple lots.</li>
          <li><strong>Automatic:</strong> Most mutual funds and ETFs default to this method.</li>
          <li><strong>No Lot Selection:</strong> No need to specify which shares you're selling.</li>
          <li><strong>Predictable:</strong> Consistent treatment across all sales.</li>
        </ul>
        <hr />

        <h2 id="cost-methods" className="text-2xl font-bold text-foreground pt-8">Cost Basis Methods Explained</h2>
        <p>The IRS allows several methods for determining cost basis.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Average Cost</h3>
        <p>Total cost of all shares divided by total shares owned. Simple but offers less tax optimization flexibility.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">FIFO (First In, First Out)</h3>
        <p>Assumes oldest shares are sold first. Often results in higher gains in rising markets since older shares typically have lower costs.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Specific Identification</h3>
        <p>You choose exactly which shares to sell. Maximum flexibility for tax optimization.</p>
        <hr />

        <h2 id="including-fees" className="text-2xl font-bold text-foreground pt-8">Including Fees and Commissions</h2>
        <p>Transaction costs are part of your cost basis. Including them gives you the true all-in cost per share and reduces your taxable gain when you sell.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">What to Include</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Commissions:</strong> Per-trade fees charged by your broker.</li>
          <li><strong>SEC Fees:</strong> Small regulatory fees on sell transactions.</li>
          <li><strong>Exchange Fees:</strong> Market-specific transaction costs.</li>
        </ul>
        <hr />

        <h2 id="special-situations" className="text-2xl font-bold text-foreground pt-8">Special Situations</h2>
        <p>Several events can complicate cost basis calculations.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Stock Splits</h3>
        <p>When a stock splits, your total cost basis doesn't change, but the per-share cost adjusts. For a 2-for-1 split, divide your per-share cost by 2.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Dividend Reinvestment (DRIP)</h3>
        <p>Each reinvested dividend creates a new lot with its own cost basis (the market price at reinvestment). This can create many small lots over time.</p>
        <hr />

        <h2 id="tax-implications" className="text-2xl font-bold text-foreground pt-8">Tax Implications</h2>
        <p>Your choice of cost basis method directly affects your tax bill.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Short-Term vs. Long-Term</h3>
        <p>Holdings sold within one year are taxed at ordinary income rates. Holdings sold after one year qualify for lower long-term capital gains rates (0%, 15%, or 20%).</p>
        <hr />

        <h2 className="text-2xl font-bold text-foreground pt-8">Conclusion</h2>
        <p>Accurate cost basis tracking is essential for tax compliance and investment performance measurement. The average cost method simplifies tracking for most investors with multiple purchases over time.</p>
      </section>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Detailed answers about average cost basis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">What is average cost basis?</h4>
            <p className="text-muted-foreground">
              Average cost basis is the total cost of all shares you've purchased (including fees) divided by the total number of shares. It represents your weighted average purchase price and is used to calculate capital gains or losses when you sell.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Does FIFO/LIFO matter when using average cost?</h4>
            <p className="text-muted-foreground">
              No. FIFO and LIFO refer to specific identification methods where you track individual lots. Average cost treats all shares as having the same cost, so the order of purchase doesn't matter. However, tax authorities may restrict which method you can use.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Should I include fees in my cost basis?</h4>
            <p className="text-muted-foreground">
              Yes. Transaction fees are part of your acquisition cost and should be added to your cost basis. This increases your cost basis, which reduces your taxable gain when you sell.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How do stock splits affect average cost?</h4>
            <p className="text-muted-foreground">
              Stock splits don't change your total cost basis, but they change your per-share cost. For a 2-for-1 split, your share count doubles and your per-share cost halves. Update your share counts after splits.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Do DRIP reinvestments count as new lots?</h4>
            <p className="text-muted-foreground">
              Yes. Each dividend reinvestment creates a new lot with its own cost basis—the market price at time of reinvestment. Using average cost combines all these lots into one weighted average.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How often should I update my average cost?</h4>
            <p className="text-muted-foreground">
              Update after every purchase, DRIP reinvestment, stock split, or any corporate action that affects your shares. Keeping accurate records prevents errors in tax reporting.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Stock Average Cost Calculator computes your weighted average purchase price across multiple buy lots, including transaction fees.</p>
          <p>This cost basis is essential for calculating capital gains or losses when you sell.</p>
          <p>Use this tool to track accumulating positions, verify broker-reported cost basis, and determine your break-even sale price.</p>
        </CardContent>
      </Card>
    </div>
  );
}


