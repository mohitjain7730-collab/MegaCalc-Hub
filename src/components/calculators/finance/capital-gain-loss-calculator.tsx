'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Percent, FunctionSquare, HelpCircle, Shield, Info, Hash, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  costBasis: z.number().min(0.0001).optional(),
  sellProceeds: z.number().min(0).optional(),
  fees: z.number().min(0).optional(),
  taxRatePct: z.number().min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CapitalGainLossCalculator() {
  const [result, setResult] = useState<{
    gain: number;
    gainPct: number;
    taxOwed: number;
    netProceeds: number;
    gainType: string;
    interpretation: string;
    recommendation: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { costBasis: undefined, sellProceeds: undefined, fees: undefined as any, taxRatePct: undefined as any } });

  const getGainType = (gain: number, pct: number): string => {
    if (gain > 0 && pct >= 50) return 'Large Gain';
    if (gain > 0) return 'Gain';
    if (gain === 0) return 'Break-even';
    if (pct >= -20) return 'Small Loss';
    return 'Large Loss';
  };

  const getInsights = (gain: number, pct: number, tax: number, net: number): string[] => {
    const insights: string[] = [];
    if (gain > 0) {
      insights.push(`${pct.toFixed(1)}% return on your investment`);
      insights.push(`Tax liability of $${tax.toFixed(2)} reduces net to $${net.toFixed(2)}`);
    } else if (gain < 0) {
      insights.push(`Loss of $${Math.abs(gain).toFixed(2)} (${Math.abs(pct).toFixed(1)}%)`);
      insights.push('Losses can offset gains for tax purposes');
    } else {
      insights.push('Break-even—no gain or loss');
    }
    return insights;
  };

  const getConsiderations = (): string[] => [
    'Short-term gains taxed at higher ordinary income rates',
    'Long-term gains (>1 year) get preferential tax treatment',
    'Losses can offset gains up to $3,000/year excess against income',
    'Wash sale rules prevent immediate repurchase for tax loss',
    'State taxes may add to federal tax liability'
  ];

  const getRecommendation = (gain: number, pct: number, taxRate: number): string => {
    if (gain > 0 && pct > 30) return 'Strong gain. Consider holding for long-term rates if short-term.';
    if (gain < 0 && pct < -30) return 'Significant loss. Evaluate tax-loss harvesting opportunities.';
    if (gain < 0) return 'Small loss may be offset against gains. Review portfolio for rebalancing.';
    return 'Moderate outcome. Consider your overall portfolio tax situation.';
  };

  const onSubmit = (v: FormValues) => {
    if (v.costBasis == null || v.sellProceeds == null || v.fees == null || v.taxRatePct == null) { setResult(null); return; }
    const grossGain = v.sellProceeds - v.costBasis - v.fees;
    const tax = grossGain > 0 ? grossGain * (v.taxRatePct / 100) : 0;
    const net = v.sellProceeds - v.fees - tax;
    const pct = v.costBasis > 0 ? (grossGain / v.costBasis) * 100 : 0;
    setResult({
      gain: Math.round(grossGain * 100) / 100,
      gainPct: Math.round(pct * 100) / 100,
      taxOwed: Math.round(tax * 100) / 100,
      netProceeds: Math.round(net * 100) / 100,
      gainType: getGainType(grossGain, pct),
      interpretation: grossGain >= 0 ? `Gain of $${grossGain.toFixed(2)} (${pct.toFixed(1)}%) with $${tax.toFixed(2)} tax, netting $${net.toFixed(2)}.` : `Loss of $${Math.abs(grossGain).toFixed(2)} (${Math.abs(pct).toFixed(1)}%) with no tax liability.`,
      recommendation: getRecommendation(grossGain, pct, v.taxRatePct),
      insights: getInsights(grossGain, pct, tax, net),
      considerations: getConsiderations()
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader><CardTitle>Capital Gain / Loss</CardTitle><CardDescription>Estimate tax and net proceeds</CardDescription></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField control={form.control} name="costBasis" render={({ field }) => (
                  <FormItem><FormLabel className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Cost Basis</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 3000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="sellProceeds" render={({ field }) => (
                  <FormItem><FormLabel>Sell Proceeds</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 3800" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="fees" render={({ field }) => (
                  <FormItem><FormLabel>Fees/Commission</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 5" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="taxRatePct" render={({ field }) => (
                  <FormItem><FormLabel className="flex items-center gap-2"><Percent className="h-4 w-4" /> Tax Rate (%)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="e.g., 15" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate Gain/Loss</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                {result.gain >= 0 ? <TrendingUp className="h-8 w-8 text-green-600" /> : <TrendingDown className="h-8 w-8 text-red-600" />}
                <div>
                  <CardTitle>Capital {result.gain >= 0 ? 'Gain' : 'Loss'} Analysis</CardTitle>
                  <CardDescription>Investment outcome breakdown</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className={`text-4xl font-bold ${result.gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>${result.gain >= 0 ? '+' : ''}{result.gain.toLocaleString()}</p>
                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Percent className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Return %</p>
                  <p className="text-lg font-bold">{result.gainPct}%</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                  <p className="font-semibold">Tax Owed</p>
                  <p className="text-lg font-bold">${result.taxOwed.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Net Proceeds</p>
                  <p className="text-lg font-bold">${result.netProceeds.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Target className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Outcome</p>
                  <Badge variant={result.gainType.includes('Gain') ? 'default' : result.gainType === 'Break-even' ? 'secondary' : 'destructive'}>
                    {result.gainType}
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
                <CardDescription>Tax and return analysis</CardDescription>
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
                <CardDescription>Tax considerations</CardDescription>
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
        <CardHeader><CardTitle>Related Calculators</CardTitle><CardDescription>Plan proceeds and returns</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/break-even-stock-sale-price-calculator" className="text-primary hover:underline">Break‑even Sale Price</a></h4><p className="text-sm text-muted-foreground">Required price.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/holding-period-return-hpr-calculator" className="text-primary hover:underline">Holding Period Return</a></h4><p className="text-sm text-muted-foreground">Total return.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/cagr-calculator" className="text-primary hover:underline">CAGR</a></h4><p className="text-sm text-muted-foreground">Annualized growth.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/stock-average-cost-multiple-buys-calculator" className="text-primary hover:underline">Average Cost</a></h4><p className="text-sm text-muted-foreground">Basis helper.</p></div>
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
              Gain/Loss = Sell Proceeds - Cost Basis - Fees
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Tax = max(0, Gain × Tax Rate)
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Net Proceeds = Sell Proceeds - Fees - Tax
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Taxes only apply to positive gains. Losses may provide tax benefits but aren't taxed.
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
          <CardDescription>What each parameter means</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><DollarSign className="h-4 w-4" /> Cost Basis</h4>
              <p className="text-sm text-muted-foreground">Total amount paid to acquire shares, including any buy-side fees.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><DollarSign className="h-4 w-4" /> Sell Proceeds</h4>
              <p className="text-sm text-muted-foreground">Total amount received from selling shares before any fees.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><DollarSign className="h-4 w-4" /> Fees/Commission</h4>
              <p className="text-sm text-muted-foreground">Transaction costs on the sell side—brokerage and regulatory fees.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><Percent className="h-4 w-4" /> Tax Rate</h4>
              <p className="text-sm text-muted-foreground">Your capital gains tax rate (depends on holding period and income).</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete SEO Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Complete Guide to Capital Gains and Losses: Tax Calculations and Net Proceeds</h1>
        <p className="text-lg italic text-muted-foreground">Understand how to calculate gains, estimate taxes, and determine net proceeds from stock sales.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-is-gain" className="hover:underline">What is a Capital Gain?</a></li>
          <li><a href="#tax-rates" className="hover:underline">Tax Rates: Short-Term vs. Long-Term</a></li>
          <li><a href="#losses" className="hover:underline">Capital Losses and Tax Benefits</a></li>
          <li><a href="#net-proceeds" className="hover:underline">Calculating Net Proceeds</a></li>
        </ul>
        <hr />

        <h2 id="what-is-gain" className="text-2xl font-bold text-foreground pt-8">What is a Capital Gain?</h2>
        <p>A capital gain is the profit realized when you sell an asset for more than you paid for it. Capital gains are taxable income in most jurisdictions.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Calculating Gain or Loss</h3>
        <p>Gain = Sell Proceeds - Cost Basis - Fees. A positive result is a gain; negative is a loss.</p>
        <hr />

        <h2 id="tax-rates" className="text-2xl font-bold text-foreground pt-8">Tax Rates: Short-Term vs. Long-Term</h2>
        <h3 className="text-xl font-semibold text-foreground mt-6">Short-Term (≤1 Year)</h3>
        <p>Taxed at ordinary income rates—up to 37% in the US. This applies to positions held one year or less.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Long-Term (&gt;1 Year)</h3>
        <p>Taxed at preferential rates: 0%, 15%, or 20% depending on your taxable income. This incentivizes longer holding periods.</p>
        <hr />

        <h2 id="losses" className="text-2xl font-bold text-foreground pt-8">Capital Losses and Tax Benefits</h2>
        <p>Capital losses aren't taxed—instead, they can offset gains. In the US, you can deduct up to $3,000 in net losses against ordinary income annually, with excess carried forward.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Tax-Loss Harvesting</h3>
        <p>Strategically selling losing positions to offset gains elsewhere. Be aware of wash-sale rules that disallow losses if you repurchase the same or substantially identical security within 30 days.</p>
        <hr />

        <h2 id="net-proceeds" className="text-2xl font-bold text-foreground pt-8">Calculating Net Proceeds</h2>
        <p>Net Proceeds = Sell Proceeds - Fees - Taxes. This is what actually lands in your account after the sale.</p>
        <hr />

        <h2 className="text-2xl font-bold text-foreground pt-8">Conclusion</h2>
        <p>Understanding capital gains taxation is essential for investment planning. Use long-term holding periods when possible, harvest losses strategically, and always account for taxes when calculating net returns.</p>
      </section>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Detailed answers about capital gains</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">What is cost basis?</h4>
            <p className="text-muted-foreground">
              Cost basis is your total acquisition cost—the purchase price plus any commissions and fees you paid when buying. This is the baseline against which gains or losses are calculated.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Are taxes applied on losses?</h4>
            <p className="text-muted-foreground">
              No. Losses aren't taxed—in fact, they can provide tax benefits. You can use losses to offset gains dollar-for-dollar, and deduct up to $3,000 in net losses against ordinary income annually.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What's the difference between short-term and long-term gains?</h4>
            <p className="text-muted-foreground">
              Short-term gains (assets held one year or less) are taxed at ordinary income rates up to 37%. Long-term gains (held over one year) qualify for preferential rates of 0%, 15%, or 20% depending on income.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Do fees reduce taxable gain?</h4>
            <p className="text-muted-foreground">
              Yes. Transaction costs reduce your realized gain. If you bought at $1,000, paid $10 fees, sold at $1,200 with $10 fees, your gain is $1,200 - $1,010 - $10 = $180, not $200.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What about wash-sale rules?</h4>
            <p className="text-muted-foreground">
              If you sell at a loss and repurchase the same (or substantially identical) security within 30 days before or after, the loss is disallowed for tax purposes. The disallowed loss adds to the cost basis of the new shares.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How do dividends affect gains?</h4>
            <p className="text-muted-foreground">
              Dividends are taxed separately as income. This calculator focuses on capital gains from selling shares. For total return, add dividend income received during the holding period.
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
          <p>The Capital Gain/Loss Calculator determines your profit or loss, estimates taxes owed, and calculates net proceeds from a stock sale.</p>
          <p>Taxes only apply to positive gains—losses can offset gains or provide income deductions.</p>
          <p>Use this to understand the true after-tax outcome of selling your investments.</p>
        </CardContent>
      </Card>
    </div>
  );
}


