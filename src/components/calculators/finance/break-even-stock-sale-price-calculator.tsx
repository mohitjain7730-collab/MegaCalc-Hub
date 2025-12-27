'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Percent, FunctionSquare, HelpCircle, Shield, Info, Hash, TrendingUp, AlertCircle, CheckCircle2, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  averageCost: z.number().min(0.0001).optional(),
  shares: z.number().min(0.0001).optional(),
  sellCommission: z.number().min(0).optional(),
  taxRatePct: z.number().min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function BreakEvenStockSalePriceCalculator() {
  const [result, setResult] = useState<{
    price: number;
    costBasis: number;
    taxImpact: number;
    commissionImpact: number;
    priceLevel: string;
    interpretation: string;
    recommendation: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { averageCost: undefined, shares: undefined, sellCommission: undefined as any, taxRatePct: undefined as any } });

  const getPriceLevel = (price: number, avgCost: number): string => {
    const diff = ((price - avgCost) / avgCost) * 100;
    if (diff > 5) return 'Above Cost';
    if (diff > 0) return 'Near Cost';
    return 'At Cost';
  };

  const getInsights = (price: number, avgCost: number, tax: number, comm: number): string[] => {
    const insights: string[] = [];
    insights.push(`Break-even price is $${price.toFixed(4)} per share`);
    if (tax > 0) {
      insights.push(`Tax adds $${(comm > 0 ? tax : 0).toFixed(2)} to your break-even requirement`);
    }
    if (comm > 0) {
      insights.push(`Commission adds $${(comm / 100).toFixed(4)} per share to break-even`);
    }
    return insights;
  };

  const getConsiderations = (): string[] => [
    'Break-even ignores opportunity cost of capital',
    'Tax rates vary by holding period and jurisdiction',
    'Losses may offset gains for tax purposes',
    'Consider wash sale rules when selling at a loss',
    'Factor in time value when deciding to exit'
  ];

  const getRecommendation = (price: number, avgCost: number, taxRate: number): string => {
    if (price > avgCost * 1.1) return 'Significant premium needed. Consider tax-loss harvesting opportunities.';
    if (taxRate > 30) return 'High tax rate impacts break-even. Consider holding for long-term rates.';
    return 'Set limit orders at your break-even price for zero-loss exits.';
  };

  const onSubmit = (v: FormValues) => {
    if (v.averageCost == null || v.shares == null || v.sellCommission == null || v.taxRatePct == null) { setResult(null); return; }
    const basis = v.averageCost * v.shares;
    const t = v.taxRatePct / 100;
    let price = (basis + v.sellCommission - v.averageCost * v.shares * t) / (v.shares * (1 - t || 1));
    if (price < v.averageCost) {
      price = (basis + v.sellCommission) / v.shares;
    }
    const taxImpact = price > v.averageCost ? (price - v.averageCost) * v.shares * t : 0;
    setResult({
      price,
      costBasis: basis,
      taxImpact,
      commissionImpact: v.sellCommission,
      priceLevel: getPriceLevel(price, v.averageCost),
      interpretation: `To break even after $${v.sellCommission.toFixed(2)} commission and ${v.taxRatePct}% tax on gains, sell at $${price.toFixed(4)} per share.`,
      recommendation: getRecommendation(price, v.averageCost, v.taxRatePct),
      insights: getInsights(price, v.averageCost, taxImpact, v.sellCommission),
      considerations: getConsiderations()
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader><CardTitle>Break-even Stock Sale Price</CardTitle><CardDescription>Account for commission and gain taxes</CardDescription></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField control={form.control} name="averageCost" render={({ field }) => (
                  <FormItem><FormLabel className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Average Cost/Share</FormLabel><FormControl><Input type="number" step="0.0001" placeholder="e.g., 35.25" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="shares" render={({ field }) => (
                  <FormItem><FormLabel>Shares</FormLabel><FormControl><Input type="number" step="0.0001" placeholder="e.g., 150" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="sellCommission" render={({ field }) => (
                  <FormItem><FormLabel>Sell Commission ($)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 5" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="taxRatePct" render={({ field }) => (
                  <FormItem><FormLabel className="flex items-center gap-2"><Percent className="h-4 w-4" /> Tax Rate on Gain (%)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="e.g., 15" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate Break-even Price</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Target className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Break-even Analysis</CardTitle>
                  <CardDescription>Required sale price for zero profit/loss</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">${result.price.toFixed(4)}</p>
                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Cost Basis</p>
                  <p className="text-lg font-bold">${result.costBasis.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Percent className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                  <p className="font-semibold">Tax Impact</p>
                  <p className="text-lg font-bold">${result.taxImpact.toFixed(2)}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Commission</p>
                  <p className="text-lg font-bold">${result.commissionImpact.toFixed(2)}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Target className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Price Level</p>
                  <Badge variant={result.priceLevel === 'At Cost' ? 'secondary' : result.priceLevel === 'Near Cost' ? 'outline' : 'default'}>
                    {result.priceLevel}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Target className="h-6 w-6" />
                  Strategic Insights
                </CardTitle>
                <CardDescription>Break-even analysis</CardDescription>
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
        <CardHeader><CardTitle>Related Calculators</CardTitle><CardDescription>Plan exits and taxes</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/stock-average-cost-multiple-buys-calculator" className="text-primary hover:underline">Average Cost (Multi‑Buys)</a></h4><p className="text-sm text-muted-foreground">Cost basis helper.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/capital-gain-loss-calculator" className="text-primary hover:underline">Capital Gain/Loss</a></h4><p className="text-sm text-muted-foreground">Net proceeds.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/target-price-calculator" className="text-primary hover:underline">Target Price</a></h4><p className="text-sm text-muted-foreground">Goal based exits.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/real-rate-of-return-calculator" className="text-primary hover:underline">Real Return</a></h4><p className="text-sm text-muted-foreground">After‑inflation metric.</p></div>
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
              Break-even = (Cost Basis + Commission) / Shares × (1 / (1 - TaxRate))
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            This accounts for the fact that taxes are owed on gains. If selling at a loss, taxes don't apply and the formula simplifies.
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
          <CardDescription>What each parameter means for break-even calculation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><DollarSign className="h-4 w-4" /> Average Cost/Share</h4>
              <p className="text-sm text-muted-foreground">Your cost basis per share, including any buy commissions.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><Hash className="h-4 w-4" /> Shares</h4>
              <p className="text-sm text-muted-foreground">Number of shares you plan to sell.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><DollarSign className="h-4 w-4" /> Sell Commission</h4>
              <p className="text-sm text-muted-foreground">Transaction costs when selling—brokerage fees, SEC fees.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><Percent className="h-4 w-4" /> Tax Rate on Gain</h4>
              <p className="text-sm text-muted-foreground">Your expected capital gains tax rate (15%, 20%, etc.).</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete SEO Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        {/* SEO & SCHEMA METADATA */}
        <meta itemProp="name" content="The Definitive Guide to Break-Even Stock Price: Calculating Your Loss Limit" />
        <meta itemProp="description" content="Calculate your true stock break-even price by accounting for trading commissions, fees, and capital gains taxes. Understand the math behind zero-loss exit strategies." />
        <meta itemProp="keywords" content="break even stock calculator, stock exit price, trading break even formula, calculate trading fees, capital gains tax impact, zero loss strategy, investment recovery" />
        <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
        <meta itemProp="datePublished" content="2025-11-15" />
        <meta itemProp="url" content="/definitive-guide-break-even-stock" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Break-Even Analysis: Precise Exit Planning</h1>
        <p className="text-lg italic text-muted-foreground">Stop guessing. Calculate the exact price you need to exit a trade without losing a penny—covering all costs, commissions, and taxes.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-is-breakeven" className="hover:underline">What is Break-Even Price?</a></li>
          <li><a href="#hidden-costs" className="hover:underline">The Hidden Costs of Trading</a></li>
          <li><a href="#tax-impact" className="hover:underline">The Tax Paradox</a></li>
          <li><a href="#strategies" className="hover:underline">Break-Even Strategies</a></li>
          <li><a href="#using-calculator" className="hover:underline">Using the Calculator Effectively</a></li>
        </ul>
        <hr />

        <h2 id="what-is-breakeven" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Break-Even Price?</h2>
        <p>In trading, the "break-even price" is the specific price at which your net profit is exactly zero. It's the line in the sand where your trade recovers your initial capital and all associated expenses. Selling one cent below this price results in a realized loss; selling one cent above results in a realized gain.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why It's Not Just Your Buy Price</h3>
        <p>Many novice investors believe if they buy a stock at $50, their break-even is $50. This is incorrect. You must account for the friction of the market: transaction fees, commissions, spreads, and taxes.</p>
        <hr />

        <h2 id="hidden-costs" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Hidden Costs of Trading</h2>
        <p>To calculate a true break-even, you must stack all costs on top of your purchase price:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Buy Commissions:</strong> Added to your initial cost basis.</li>
          <li><strong>Sell Commissions:</strong> Deducted from your final proceeds.</li>
          <li><strong>Regulatory Fees:</strong> Small SEC fees (in the US) applied to sell orders.</li>
          <li><strong>Slippage:</strong> The difference between the quoted price and your actual execution price.</li>
        </ul>
        <hr />

        <h2 id="tax-impact" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Tax Impact on Break-Even</h2>
        <p>This is where it gets tricky. If you sell for a profit (price &gt; cost), you owe taxes. That tax bill is a cash outflow.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Short-Term vs. Long-Term Rates</h3>
        <p>Use your expected rate. Short-term gains (held &lt;1 year) are taxed at ordinary income rates (up to 37%). Long-term gains are taxed at 0%, 15%, or 20% depending on income.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">The "Tax Gross-Up"</h3>
        <p>If you need to cover a fixed cost (like a commission) using trading profits, you actually need to earn <em>more</em> than the cost amount because the government takes a cut of that profit. This calculator automatically performs that "gross-up" calculation.</p>
        <p className="mt-2 text-sm text-muted-foreground p-3 bg-muted rounded"><em>Note: If you are selling at a loss, taxes generally don't apply (and you may get a tax benefit), simplifying the math to just covering commissions.</em></p>
        <hr />

        <h2 id="strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Break-Even Strategies</h2>

        <h3 className="text-xl font-semibold text-foreground mt-6">The "Scratch" Trade</h3>
        <p>Active traders often use a "scratch" trade strategy. If a trade isn't working immediately but hasn't hit the stop loss, they advise exiting at break-even to free up capital while preserving the mental state (no loss taken).</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Partial Break-Even</h3>
        <p>If you own 100 shares and sell 50 at a profit, your break-even on the remaining 50 shares drops significantly (or can even become negative!), meaning you can hold the rest "risk-free" in terms of your original capital outlay.</p>
        <hr />

        <h2 id="using-calculator" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Using the Calculator Effectively</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Commission Field:</strong> Sum up <em>both</em> your buy-side (if not in basis) and sell-side commissions.</li>
          <li><strong>Tax Rate:</strong> Be conservative. Use your highest marginal short-term rate if unsure.</li>
          <li><strong>Buffer:</strong> Always add 0.5% to the result to account for market execution slippage.</li>
        </ul>
      </section>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Detailed answers about break-even pricing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">Is break-even before or after tax?</h4>
            <p className="text-muted-foreground">
              This calculator gives you a <strong>post-tax</strong> break-even price. It accounts for potential taxes on gains. It answers the question: "What price do I need to sell at so that the money landing in my bank account—after paying the broker and the IRS—equals exactly what I started with?"
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What if I sell at a loss?</h4>
            <p className="text-muted-foreground">
              If the price falls below your cost basis, capital gains taxes disappear (you don't pay tax on losses). In this scenario, the break-even calculation simplifies to just: (Cost Basis + Sell Commission) / Shares. Taxes only "drag" your break-even higher when you are in profit territory trying to cover costs.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Do dividends lower my break-even price?</h4>
            <p className="text-muted-foreground">
              Yes, in a "Total Return" sense. If you received $1.00 in dividends, you have already recovered $1.00 of your capital. You can technically sell the stock for $1.00 less than your purchase price and still break even overall. This calculator focuses on <em>price</em> break-even, but you can mentally subtract dividends from the result.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What tax rate should I use?</h4>
            <p className="text-muted-foreground">
              If holding less than 1 year, use your ordinary income tax bracket (e.g., 22%, 32%). If holding more than 1 year, use the long-term capital gains rate (typically 15% or 20% for most investors).
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Does currency exchange affect break-even?</h4>
            <p className="text-muted-foreground">
              Yes, significantly. If you trade foreign stocks, a fluctuation in the exchange rate can turn a stock profit into a realized loss (or vice versa). You would need to add an "FX buffer" to your break-even calculation to be safe.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How do options strategies affect break-even?</h4>
            <p className="text-muted-foreground">
              Selling covered calls against your stock generates premium income. This premium effectively lowers your cost basis, and thus lowers your break-even price. If you bought at $50 and sold a $2 call, your new break-even is $48.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Does slippage matter?</h4>
            <p className="text-muted-foreground">
              Yes. In fast-moving markets, you may not get filled at the price you see on screen. It is wise to add a small buffer (e.g., consider your break-even to be 5-10 cents higher than calculated) to account for bid-ask spread costs.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How do stock splits affect break-even?</h4>
            <p className="text-muted-foreground">
              Splits adjust shares and price inversely. Recalculate your input "Average Cost per Share" after the split (divide cost by split ratio), and the calculator will give you the correct new post-split break-even price.
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
          <p>The Break-even Stock Sale Price Calculator determines the exact price you need to sell at to cover your cost basis, commissions, and taxes on gains.</p>
          <p>• If selling above cost: you need a higher price to cover taxes on the gain.</p>
          <p>It accounts for the fact that taxes only apply to positive gains, providing an accurate post-tax break-even price.</p>
          <p>Use this to set realistic sell targets and understand the true cost of your position.</p>
        </CardContent>
      </Card>
    </div>
  );
}


