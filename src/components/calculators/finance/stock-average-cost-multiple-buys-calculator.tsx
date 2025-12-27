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

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        {/* SEO & SCHEMA METADATA */}
        <meta itemProp="name" content="The Definitive Guide to Stock Average Cost: Calculation, Tax Implications, and Portfolio Tracking" />
        <meta itemProp="description" content="A comprehensive guide to calculating weighted average cost basis for stocks with multiple buy lots. Learn about tax implications, wash sale rules, and how to handle fees and stock splits." />
        <meta itemProp="keywords" content="stock average cost calculator, weighted average price, cost basis calculation, multiple stock purchases, dollar cost averaging, tax cost basis methods, fifo vs average cost" />
        <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
        <meta itemProp="datePublished" content="2025-11-15" />
        <meta itemProp="url" content="/definitive-guide-stock-average-cost" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Stock Average Cost: Managing Multiple Purchase Lots</h1>
        <p className="text-lg italic text-muted-foreground">Master cost basis tracking for accurate tax reporting, performance measurement, and smarter investment decisions. Learn why the "Average Cost" method is a favorite for long-term investors.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-is-cost-basis" className="hover:underline">What is Cost Basis and Why It Matters</a></li>
          <li><a href="#calculation-example" className="hover:underline">Step-by-Step Calculation Example</a></li>
          <li><a href="#cost-methods" className="hover:underline">Average Cost vs. FIFO vs. Specific ID</a></li>
          <li><a href="#dollar-cost-averaging" className="hover:underline">The Power of Dollar Cost Averaging (DCA)</a></li>
          <li><a href="#tax-implications" className="hover:underline">Tax Implications & Wash Sale Rules</a></li>
        </ul>
        <hr />

        <h2 id="what-is-cost-basis" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Cost Basis and Why It Matters</h2>
        <p><strong>Cost basis</strong> is essentially the original value of an asset for tax purposes. It includes the purchase price plus any associated costs like commissions and recording fees. It is the baseline used to determine whether you have a capital gain or loss when you sell.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Three Pillars of Cost Basis</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Tax Reporting:</strong> The IRS requires accurate basis reporting. If you overstate your basis, you pay too little tax (audit risk). If you understate it, you pay too much tax (wasting money).</li>
          <li><strong>Performance Tracking:</strong> You can't know if you're "winning" if you don't know your starting line. Average cost gives you a single, clear break-even point for your entire position.</li>
          <li><strong>Decision Making:</strong> Knowing your average cost helps you decide whether to "average down" (buy more at a lower price to lower your avg cost) or trim a position.</li>
        </ul>
        <hr />

        <h2 id="calculation-example" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Step-by-Step Calculation Example</h2>
        <p>Let's look at a real-world scenario to see how the mathematical weighted average works.</p>

        <div className="my-6 p-4 bg-muted rounded-lg border">
          <h4 className="font-semibold mb-2">Scenario: Buying TechCorp Stock</h4>
          <ul className="list-disc ml-6 space-y-1 text-sm">
            <li><strong>Purchase 1:</strong> 10 shares @ $100 = $1,000</li>
            <li><strong>Purchase 2:</strong> 20 shares @ $110 = $2,200</li>
            <li><strong>Purchase 3:</strong> 5 shares @ $120 = $600</li>
          </ul>
          <div className="mt-4 pt-4 border-t">
            <p><strong>Total Shares:</strong> 10 + 20 + 5 = 35 shares</p>
            <p><strong>Total Cost:</strong> $1,000 + $2,200 + $600 = $3,800</p>
            <p className="mt-2 font-mono text-lg font-bold text-primary">Average Cost = $3,800 / 35 = $108.57 per share</p>
          </div>
        </div>
        <p>Even though you bought some shares at $120, your break-even price is only $108.57. If the stock goes to $115, you are profitable on the <em>entire position</em>, not just the early lots.</p>
        <hr />

        <h2 id="cost-methods" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Average Cost vs. FIFO vs. Specific ID</h2>
        <p>When you sell only <em>part</em> of your position, which shares are you selling? The method you choose dictates your tax bill.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">1. Average Cost Method</h3>
        <p>You treat all shares as a single pool. Every share has the same cost ($108.57 in our example). Simple, set-it-and-forget-it, and required for most mutual funds.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">2. FIFO (First In, First Out)</h3>
        <p>The default method at most brokerages. You sell the oldest shares first. In a rising market, these are usually your cheapest shares, which means you realize the <strong>largest capital gain</strong> (and highest tax bill) now.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">3. Specific Identification</h3>
        <p>The sniper approach. You tell your broker, "Sell the 5 shares I bought on Oct 12th @ $120." This allows you to sell high-cost shares to minimize gains or even realize a loss for tax harvesting, but requires meticulous record-keeping.</p>
        <hr />

        <h2 id="dollar-cost-averaging" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Power of Dollar Cost Averaging (DCA)</h2>
        <p>This calculator is the perfect companion for a <strong>Dollar Cost Averaging</strong> strategy. DCA involves investing a fixed dollar amount at regular intervals, regardless of share price.</p>
        <ul className="list-disc ml-6 space-y-2 mt-4">
          <li>When prices are high, your fixed amount buys fewer shares.</li>
          <li>When prices are low, your fixed amount buys <em>more</em> shares.</li>
          <li><strong>Result:</strong> Your average cost per share often ends up <em>lower</em> than the average market price over the same period.</li>
        </ul>
        <hr />

        <h2 id="tax-implications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Tax Implications & Wash Sale Rules</h2>
        <p>Taxes are the friction that drags down returns. Understanding how cost basis interacts with taxes is crucial.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Wash Sale Trap</h3>
        <p>A <strong>wash sale</strong> occurs if you sell stock at a loss and buy "substantially identical" stock within 30 days before or after the sale.
          <br /><br />
          <strong>Consequence:</strong> The IRS <em>disallows</em> your loss deduction. Instead, the loss is added to the cost basis of the new replacement shares. This isn't a disaster—it just defers your tax benefit—but it complicates your accounting significantly.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Including Fees</h3>
        <p>Never forget to include trading fees in your cost basis. If you pay a $5 commission to buy, that's $5 less profit you'll validly report later. Our calculator allows you to input these fees to ensure your basis is "fully loaded" and accurate.</p>
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
              No. FIFO and LIFO refer to specific identification methods where you track individual lots. Average cost treats all shares as identical and fungible, having the same "blended" cost, so the order of specific purchases doesn't matter for the calculation.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Should I include fees in my cost basis?</h4>
            <p className="text-muted-foreground">
              Yes. Transaction fees are part of your acquisition cost and should be added to your cost basis. This increases your basis, which reduces your taxable capital gain (or increases your deductible loss) when you eventually sell.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How do stock splits affect average cost?</h4>
            <p className="text-muted-foreground">
              Stock splits don't change your total investment value or total cost basis, but they change your per-share cost. For a 2-for-1 split, your share count doubles and your per-share average cost cuts in half. You must adjust both figures to keep your tracking accurate.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Do DRIP reinvestments count as new lots?</h4>
            <p className="text-muted-foreground">
              Yes. Each dividend reinvestment creates a new tax lot with its own cost basis—the market price at the time of reinvestment. Using the average cost method combines all these small lots into one weighted average, greatly simplifying record-keeping.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What is a "Wash Sale" and does it affect average cost?</h4>
            <p className="text-muted-foreground">
              A wash sale occurs if you sell a security at a loss and buy a "substantially identical" one within 30 days before or after the sale. The IRS disallows the loss deduction and adds the loss amount to the cost basis of the new shares. This increases your average cost on the new position.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Can I switch from Average Cost to FIFO later?</h4>
            <p className="text-muted-foreground">
              Generally, once you sell, if you choose the Average Cost method for mutual funds, you may be locked into it for that fund account. For stocks, brokers often default to FIFO but let you choose "Average Cost" for display. Check with your specific broker and tax advisor on switching methods.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How is cost basis handled for inherited stock?</h4>
            <p className="text-muted-foreground">
              Inherited stock typically receives a "step-up" in basis. This means the cost basis becomes the fair market value of the stock on the date of the original owner's death, not their original purchase price. This often eliminates significant capital gains taxes for heirs.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What is the cost basis for gifted stock?</h4>
            <p className="text-muted-foreground">
              For gifted stock, if the stock is sold at a gain, your basis is the donor's original basis. If sold at a loss, your basis is the <em>lower</em> of the donor's basis or the fair market value on the date of the gift. This dual-basis rule prevents transferring tax losses.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How often should I update my average cost?</h4>
            <p className="text-muted-foreground">
              Update it after every purchase, DRIP reinvestment, stock split, or corporate action (like a spinoff). Keeping an up-to-date running average ensures you always know your break-even point and potential tax liability.
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


