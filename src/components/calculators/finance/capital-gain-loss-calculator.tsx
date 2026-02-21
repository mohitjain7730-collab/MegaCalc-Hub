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
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/finance/break-even-stock-sale-price-calculator" className="text-primary hover:underline">Break‑even Sale Price</a></h4><p className="text-sm text-muted-foreground">Required price.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/finance/holding-period-return-hpr-calculator" className="text-primary hover:underline">Holding Period Return</a></h4><p className="text-sm text-muted-foreground">Total return.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/finance/cagr-calculator" className="text-primary hover:underline">CAGR</a></h4><p className="text-sm text-muted-foreground">Annualized growth.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/finance/stock-average-cost-multiple-buys-calculator" className="text-primary hover:underline">Average Cost</a></h4><p className="text-sm text-muted-foreground">Basis helper.</p></div>
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
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        {/* SEO & SCHEMA METADATA */}
        <meta itemProp="name" content="The Definitive Guide to Capital Gains & Losses: Tax Calculation and Strategy" />
        <meta itemProp="description" content="Master capital gains tax calculations. Understand the difference between short-term and long-term rates, how to harvest losses to offset gains, and calculate net proceeds." />
        <meta itemProp="keywords" content="capital gains tax calculator, stock profit calculator, realize capital loss, short term vs long term tax rates, tax loss harvesting, net investment income tax, crypto tax calculator" />
        <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
        <meta itemProp="datePublished" content="2025-11-15" />
        <meta itemProp="url" content="/definitive-guide-capital-gains" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Capital Gains & Losses: Maximizing After-Tax Returns</h1>
        <p className="text-lg italic text-muted-foreground">It's not what you make, it's what you keep. Learn how to calculate realized gains, estimate your tax bill, and strategically use losses to your advantage.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-is-gain" className="hover:underline">What is a Capital Gain?</a></li>
          <li><a href="#tax-rates" className="hover:underline">Short-Term vs. Long-Term Rates</a></li>
          <li><a href="#losses" className="hover:underline">Turning Losses into Assets</a></li>
          <li><a href="#net-proceeds" className="hover:underline">Calculating Your "Take Home"</a></li>
          <li><a href="#strategies" className="hover:underline">Tax Minimization Strategies</a></li>
        </ul>
        <hr />

        <h2 id="what-is-gain" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is a Capital Gain?</h2>
        <p>A capital gain occurs when you sell a capital asset (stocks, bonds, real estate, crypto) for more than its adjusted cost basis. It is the "profit" portion of your sale.</p>
        <p><strong>Crucial Distinction:</strong> You only pay taxes on <em>realized</em> gains (when you sell). Paper gains (increase in value while holding) are not taxed, allowing your money to compound tax-deferred.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation</h3>
        <p className="font-mono bg-muted p-2 rounded">Net Gain/Loss = Sell Proceeds - (Original Cost + Buying Fees + Selling Fees)</p>
        <hr />

        <h2 id="tax-rates" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Tax Rates: Time Matters</h2>
        <p>The IRS incentivizes long-term investing by offering preferential tax rates.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Short-Term (Held ≤ 1 Year)</h3>
        <p>Taxed as <strong>Ordinary Income</strong>. This is added to your wages/salary and taxed at your marginal bracket (ranging from 10% to 37% in the US). It's the most expensive type of gain.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Long-Term (Held &gt; 1 Year)</h3>
        <p>Taxed at <strong>Capital Gains Rates</strong>. For most people, this is 15%. For lower incomes, it can be 0%. For high earners, it caps at 20%. This discount is significant—often half the tax rate of short-term gains.</p>
        <hr />

        <h2 id="losses" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Capital Losses and Tax Benefits</h2>
        <p>Losses are painful, but they have a silver lining: they lower your tax bill.</p>

        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Offset Gains:</strong> Losses first offset gains of the same type (short vs. short), then the other type.</li>
          <li><strong>Deduction Limit:</strong> If your losses exceed <em>all</em> your gains for the year, you can deduct up to <strong>$3,000</strong> of the excess loss against your regular job income.</li>
          <li><strong>Carryover:</strong> Any loss remaining after that carries forward to future years indefinitely. You never "lose" a loss deduction until it's used.</li>
        </ul>
        <hr />

        <h2 id="net-proceeds" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculating Net Proceeds</h2>
        <p>Investors often focus on the "Gross" sale amount. But your bank account only sees the "Net."</p>
        <p><strong>Net Proceeds = Sell Price - Broker Commissions - Regulatory Fees - Estimated Taxes.</strong> This calculator helps you see that final, real number.</p>
        <hr />

        <h2 id="strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Tax Minimization Strategies</h2>
        <h3 className="text-xl font-semibold text-foreground mt-6">Tax-Loss Harvesting</h3>
        <p>Subjectively "harvesting" losses involves selling losing positions before year-end to offset realized gains elsewhere in your portfolio. Just beware of the Wash Sale Rule.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Holding On</h3>
        <p>Simply waiting until the 1-year mark passes before selling can boost your after-tax return by 10-20% purely due to the lower tax rate.</p>
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
              Cost basis is your total acquisition cost—the purchase price plus any commissions and fees you paid when buying. This is the baseline against which gains or losses are calculated. You subtract this from your sale price to find your profit.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Does the "Net Investment Income Tax" (NIIT) apply?</h4>
            <p className="text-muted-foreground">
              High-income earners (Modified AGI &gt; $200k single/$250k married) may face an additional <strong>3.8%</strong> surtax on investment income (including capital gains) on top of the standard capital gains rates. This calculator estimates standard rates; be sure to factor in NIIT if you are a high earner.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Do I pay state taxes on capital gains?</h4>
            <p className="text-muted-foreground">
              Most individual US states tax capital gains as regular income. Some (like California) have high rates (up to 13.3%), while others (like Florida, Texas) have 0%. You must stack your state tax rate on top of the federal rate to get your true liability.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What's the difference between short-term and long-term gains?</h4>
            <p className="text-muted-foreground">
              <strong>Short-term:</strong> Held for 1 year or less. Taxed at ordinary income rates (expensive).<br />
              <strong>Long-term:</strong> Held for more than 1 year (at least 1 year and 1 day). Taxed at preferential rates (0%, 15%, 20%). Holding for that extra day matters!
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How does this apply to Cryptocurrency?</h4>
            <p className="text-muted-foreground">
              In most jurisdictions (including the US), crypto is treated as property. Every trade (crypto-to-fiat OR crypto-to-crypto) is a taxable event triggering a capital gain or loss calculation. You need to track the cost basis of every coin individually.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Does this work for Real Estate?</h4>
            <p className="text-muted-foreground">
              Yes, the math is the same (Sale - Cost - Expenses). However, real estate has a special exclusion for primary residences (Section 121 in the US) where you can exclude up to $250k/$500k of gains. This calculator doesn't auto-apply that exclusion.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Do fees reduce taxable gain?</h4>
            <p className="text-muted-foreground">
              Yes! Transaction costs are deductible from your profit. If you bought at $1,000, paid $10 fees, sold at $1,200 with $10 fees, your taxable gain is $1,200 - $1,010 - $10 = $180, not $200. Always track your fees.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What about wash-sale rules?</h4>
            <p className="text-muted-foreground">
              If you sell at a loss and repurchase the same (or substantially identical) security within 30 days, the loss is disallowed for tax purposes. The loss isn't lost forever; it's added to the cost basis of the new shares, deferring the tax benefit until you finally sell the new position.
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


