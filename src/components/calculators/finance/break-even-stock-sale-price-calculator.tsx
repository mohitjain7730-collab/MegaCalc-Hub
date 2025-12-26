'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Percent, FunctionSquare, HelpCircle, Shield, Info, Hash } from 'lucide-react';

const formSchema = z.object({
  averageCost: z.number().min(0.0001).optional(),
  shares: z.number().min(0.0001).optional(),
  sellCommission: z.number().min(0).optional(),
  taxRatePct: z.number().min(0).max(100).optional(), // applies to gains only
});

type FormValues = z.infer<typeof formSchema>;

export default function BreakEvenStockSalePriceCalculator() {
  const [result, setResult] = useState<{ price: number; interpretation: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { averageCost: undefined, shares: undefined, sellCommission: undefined as any, taxRatePct: undefined as any } });

  const onSubmit = (v: FormValues) => {
    if (v.averageCost == null || v.shares == null || v.sellCommission == null || v.taxRatePct == null) { setResult(null); return; }
    // Break-even equation: (P*shares - commission - tax_on_gain) = cost_basis
    // tax_on_gain = max(0, (P - cost_per_share) * shares) * tax
    // Solve for P; piecewise because tax applies only if P > cost.
    const basis = v.averageCost * v.shares;
    const t = v.taxRatePct / 100;
    // Assume P >= cost (typical case); P*sh - comm - (P - cost)*sh*t = basis
    // => P*sh*(1 - t) + cost*sh*t - comm = basis => P = (basis + comm - cost*sh*t) / (sh*(1 - t))
    let price = (basis + v.sellCommission - v.averageCost * v.shares * t) / (v.shares * (1 - t || 1));
    if (price < v.averageCost) {
      // In loss region taxes do not apply on negative gain (ignoring deductions): P*sh - comm = basis
      price = (basis + v.sellCommission) / v.shares;
    }
    setResult({ price, interpretation: 'Sale price per share required to break even after commission and taxes on gains.' });
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
        <Card>
          <CardHeader><CardTitle>Result</CardTitle><CardDescription>Required sale price</CardDescription></CardHeader>
          <CardContent>
            <div className="text-center p-6 bg-primary/5 rounded-lg"><div className="text-sm text-muted-foreground mb-1">Break-even Price</div><p className="text-3xl font-bold text-primary">${result.price.toFixed(4)}</p></div>
            <p className="text-sm mt-4">{result.interpretation}</p>
          </CardContent>
        </Card>
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
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Complete Guide to Break-even Stock Sale Price Calculation</h1>
        <p className="text-lg italic text-muted-foreground">Learn how to calculate the exact price needed to cover costs, commissions, and taxes.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-is-breakeven" className="hover:underline">What is Break-even Price?</a></li>
          <li><a href="#why-matters" className="hover:underline">Why Break-even Matters</a></li>
          <li><a href="#tax-impact" className="hover:underline">The Tax Impact on Break-even</a></li>
          <li><a href="#using-calculator" className="hover:underline">Using the Calculator Effectively</a></li>
        </ul>
        <hr />

        <h2 id="what-is-breakeven" className="text-2xl font-bold text-foreground pt-8">What is Break-even Price?</h2>
        <p>Break-even price is the sale price at which you neither gain nor lose money after accounting for all costs—your original purchase, commissions, and taxes on any gains. Selling at exactly this price means zero profit, zero loss.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Components of Break-even</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Cost Basis:</strong> What you paid for the shares originally.</li>
          <li><strong>Sell Commission:</strong> Fees to execute the sale.</li>
          <li><strong>Taxes:</strong> Capital gains tax owed on profit (if any).</li>
        </ul>
        <hr />

        <h2 id="why-matters" className="text-2xl font-bold text-foreground pt-8">Why Break-even Matters</h2>
        <p>Knowing your break-even helps you make informed decisions about when to sell, set realistic profit targets, and understand the true cost of holding positions.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Decision Making</h3>
        <p>If current price is below break-even, selling means a loss. If above, you're in profit territory. This clarity helps with stop-loss and take-profit decisions.</p>
        <hr />

        <h2 id="tax-impact" className="text-2xl font-bold text-foreground pt-8">The Tax Impact on Break-even</h2>
        <p>Taxes only apply to gains, not losses. This creates a piecewise calculation:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>If selling above cost: you need a higher price to cover taxes on the gain.</li>
          <li>If selling at a loss: no tax impact (and potential tax loss harvesting benefit).</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Short-Term vs. Long-Term Rates</h3>
        <p>Use your expected rate. Short-term gains (held &lt;1 year) are taxed at ordinary income rates (up to 37%). Long-term gains are taxed at 0%, 15%, or 20% depending on income.</p>
        <hr />

        <h2 id="using-calculator" className="text-2xl font-bold text-foreground pt-8">Using the Calculator Effectively</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>Include all fees in the commission field.</li>
          <li>Use your marginal capital gains rate.</li>
          <li>Add a small buffer for slippage in real trading.</li>
        </ul>
        <hr />

        <h2 className="text-2xl font-bold text-foreground pt-8">Conclusion</h2>
        <p>Understanding your break-even price is essential for exit planning. This calculator helps you factor in commissions and taxes to find the true price you need to avoid losses.</p>
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
              This calculator gives you a post-tax break-even price. It accounts for commission and applies your tax rate to any positive gains, so the result is the price that leaves you with exactly zero net profit.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What if I sell at a loss?</h4>
            <p className="text-muted-foreground">
              No capital gains taxes apply to losses. The break-even calculation becomes simpler—just cost basis plus sell commission divided by shares. Some jurisdictions allow losses to offset other gains for tax purposes.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What tax rate should I use?</h4>
            <p className="text-muted-foreground">
              Use your expected effective rate on capital gains. For positions held over one year, use long-term rates (0%, 15%, or 20% in the US). For shorter positions, use your ordinary income rate.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How do stock splits affect break-even?</h4>
            <p className="text-muted-foreground">
              Splits adjust shares and price inversely but don't change total basis. Recalculate your average cost per share after the split, then compute break-even with the new per-share cost.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Does slippage matter?</h4>
            <p className="text-muted-foreground">
              Yes. In practice, your execution price may differ from the quoted price. Consider adding a small buffer (0.1-0.5%) above your calculated break-even to account for slippage.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Do dividends change break-even?</h4>
            <p className="text-muted-foreground">
              Not directly for this calculation. Dividends are income you've already received and taxed separately. However, for total return analysis, dividends reduce your effective break-even.
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
          <p>It accounts for the fact that taxes only apply to positive gains, providing an accurate post-tax break-even price.</p>
          <p>Use this to set realistic sell targets and understand the true cost of your position.</p>
        </CardContent>
      </Card>
    </div>
  );
}


