'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Info, Globe, Target, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  spotRate: z.number().min(0).optional(),
  domesticRate: z.number().min(-50).max(200).optional(),
  foreignRate: z.number().min(-50).max(200).optional(),
  timeYears: z.number().min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function InterestRateParityCalculator() {
  const [result, setResult] = useState<{ forwardRate: number; forwardPremiumPct: number; interp: string; suggestions: string[] } | null>(null);

  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { spotRate: undefined as unknown as number, domesticRate: undefined as unknown as number, foreignRate: undefined as unknown as number, timeYears: undefined as unknown as number } });

  const onSubmit = (v: FormValues) => {
    if (v.spotRate === undefined || v.domesticRate === undefined || v.foreignRate === undefined || v.timeYears === undefined) { setResult(null); return; }
    const rd = v.domesticRate / 100;
    const rf = v.foreignRate / 100;
    const t = v.timeYears;
    const fwd = v.spotRate * (1 + rd * t) / (1 + rf * t);
    const premium = ((fwd - v.spotRate) / v.spotRate) * 100;
    const interp = premium > 0 ? 'Forward premium on quote currency.' : premium < 0 ? 'Forward discount on quote currency.' : 'At parity: no forward premium or discount.';
    setResult({ forwardRate: fwd, forwardPremiumPct: premium, interp, suggestions: ['Match compounding conventions between spot and rates.', 'Use consistent day count and tenor for accuracy.', 'Consider transaction costs and capital controls affecting real-world pricing.', 'For long tenors, prefer continuously compounded parity.'] });
  };

  const num = (ph: string, field: any) => (
    <Input type="number" step="0.0001" placeholder={ph} {...field}
      value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
      onChange={e => { const v = e.target.value; const n = v === '' ? undefined : Number(v); field.onChange(Number.isFinite(n as any) ? n : undefined); }} />
  );

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> Interest Rate Parity Calculator</CardTitle>
          <CardDescription>Compute theoretical forward FX rate from spot and interest rates.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField control={form.control} name="spotRate" render={({ field }) => (<FormItem><FormLabel>Spot Rate (S)</FormLabel><FormControl>{num('e.g., 1.1200', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="domesticRate" render={({ field }) => (<FormItem><FormLabel>Domestic Rate r_d (%)</FormLabel><FormControl>{num('e.g., 4', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="foreignRate" render={({ field }) => (<FormItem><FormLabel>Foreign Rate r_f (%)</FormLabel><FormControl>{num('e.g., 2', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="timeYears" render={({ field }) => (<FormItem><FormLabel>Time (years)</FormLabel><FormControl>{num('e.g., 1', field)}</FormControl><FormMessage /></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Forward pricing</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Forward Rate (F)</p><p className="text-2xl font-bold">{result.forwardRate.toFixed(6)}</p></div>
                <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Forward Premium</p><p className={`text-2xl font-bold ${result.forwardPremiumPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>{result.forwardPremiumPct.toFixed(3)}%</p></div>
                <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interp}</p></div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Target className="h-6 w-6" />
                  Strategic Insights
                </CardTitle>
                <CardDescription>Arbitrage and hedging</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.suggestions.slice(0, 2).map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm font-medium">{s}</span>
                  </div>
                ))}
                <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm font-medium">Interest rate differentials drive forward premiums/discounts</span>
                </div>
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
                {result.suggestions.slice(2).map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">{s}</span>
                  </div>
                ))}
                <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-300">Counterparty risk remains even when IRP holds theoretically</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>FX and rates</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/currency-exchange-calculator" className="text-primary hover:underline">Currency Exchange Calculator</a></h4><p className="text-sm text-muted-foreground">Convert amounts at spot.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/discount-rate-calculator" className="text-primary hover:underline">Discount Rate Calculator</a></h4><p className="text-sm text-muted-foreground">Relate rates to present value.</p></div>
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
              F = S × (1 + r_d × t) / (1 + r_f × t)
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Forward rate is determined by spot rate and interest rate differential.
          </p>
        </CardContent>
      </Card>

      {/* Input Explanations */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Spot Rate & Time</h4>
              <p className="text-sm text-muted-foreground">Current exchange rate and forward contract duration (years).</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Interest Rates (%)</h4>
              <p className="text-sm text-muted-foreground">Domestic and foreign risk-free interest rates.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete SEO Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        {/* SEO & SCHEMA METADATA */}
        <meta itemProp="name" content="The Definitive Guide to Interest Rate Parity (IRP)" />
        <meta itemProp="description" content="Calculate the theoretical Forward Exchange Rate. Understand how interest rate differentials create forward premiums and discounts in the Forex market." />
        <meta itemProp="keywords" content="Interest Rate Parity, IRP, Forward Rate, Spot Rate, Arbitrage, FX Hedging, Covered Interest Parity, Uncovered Interest Parity, Carry Trade" />
        <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
        <meta itemProp="datePublished" content="2025-11-15" />
        <meta itemProp="url" content="/definitive-guide-irp" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Interest Rate Parity: The Gravity of FX</h1>
        <p className="text-lg italic text-muted-foreground">Why does the currency with the higher interest rate trade at a discount? It's not a paradox; it's the law of "No Arbitrage".</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#logic" className="hover:underline">The "No Free Lunch" Rule</a></li>
          <li><a href="#covered-vs-uncovered" className="hover:underline">Covered vs. Uncovered IRP</a></li>
          <li><a href="#carry-trade" className="hover:underline">The Carry Trade</a></li>
          <li><a href="#risk" className="hover:underline">The "Basis" Risk</a></li>
        </ul>
        <hr />

        <h2 id="logic" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The "No Free Lunch" Rule</h2>
        <p>Imagine the US interest rate is 5% and the Japanese rate is 0%.</p>
        <p>You might think: "I'll borrow Yen at 0%, convert to USD, and invest at 5%. Free money!"</p>
        <p><strong>Interest Rate Parity</strong> says: "Not so fast." To do this safely, you must lock in your exchange rate to convert the USD back to Yen in one year. Because everyone wants to do this trade, the <strong>Forward Rate</strong> for USD/JPY adjusts.</p>
        <p>Specifically, the USD forward rate will trade at a ~5% discount to the spot rate, wiping out your profit. If it didn't, arbitrageurs would exploit it until it did.</p>
        <hr />

        <h2 id="covered-vs-uncovered" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Covered vs. Uncovered IRP</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Covered IRP:</strong> You use a Forward Contract to lock in the rate. This relationship holds almost perfectly (~99.9%) in liquid markets.</li>
          <li><strong>Uncovered IRP (UIP):</strong> You <em>don't</em> hedge. You hope the future spot rate matches the theoretical forward rate. Studies show UIP often fails in the short run, leading to the "Carry Trade" anomaly.</li>
        </ul>
        <hr />

        <h2 id="carry-trade" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Carry Trade</h2>
        <p>The "Carry Trade" is betting against IRP. Investors borrow low-yielding currencies (like JPY) and buy high-yielding ones (like AUD or MXN) <em>without hedging</em>.</p>
        <p>If the high-yield currency stays stable (or appreciates), they make massive returns. But when panic hits, these trades unwind violently, causing the high-yield currency to crash. It's like "picking up pennies in front of a steamroller."</p>
      </section>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Advanced FX Concepts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">Why is the Forward Rate not a prediction?</h4>
            <p className="text-muted-foreground">
              The Forward Rate is a mathematical derivative of spot + interest rates. It is not a forecast of where the currency <em>will</em> go; it is the price you must pay today to remove uncertainty.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What is the "Cross-Currency Basis"?</h4>
            <p className="text-muted-foreground">
              A slight violation of IRP due to dollar shortages. When banks are desperate for US Dollars, they will "overpay" in the FX swap market, creating a negative basis. This is a key indicator of global financial stress.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Does IRP apply to Cryptocurrencies?</h4>
            <p className="text-muted-foreground">
              Ideally, yes. The "funding rate" in crypto perp futures is essentially an IRP mechanism. If longs pay shorts 100% APR, the future price should be higher than the spot price to compensate.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How does Inflation fit in?</h4>
            <p className="text-muted-foreground">
              IRP links interest rates to exchange rates. <strong>Purchasing Power Parity (PPP)</strong> links inflation rates to exchange rates. In the long run, high inflation → high interest rates → depreciating currency (Fisher Effect).
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Can I use IRP to arbitrage?</h4>
            <p className="text-muted-foreground">
              As a retail trader, no. Transaction costs (bid-ask spreads) will eat your profits. Banks and HFT firms with near-zero fees are the ones keeping the market in line.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What creates a Forward Premium?</h4>
            <p className="text-muted-foreground">
              If the domestic interest rate is <em>lower</em> than the foreign rate, the domestic currency will trade at a <strong>Forward Premium</strong> (it is more expensive in the future).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Interest Rate Parity is the glue that holds the global financial system together.</p>
          <p>It ensures that money has the same "price" everywhere once you account for exchange rates.</p>
          <p>Deviations from IRP are rare, but when they happen (like the Basis), they signal big trouble.</p>
        </CardContent>
      </Card>
    </div>
  );
}


