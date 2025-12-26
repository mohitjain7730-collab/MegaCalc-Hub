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
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Complete Guide to Interest Rate Parity</h1>
        <p className="text-lg italic text-muted-foreground">Understand the no-arbitrage relationship between spot, forward, and interest rates.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">What is Interest Rate Parity?</h2>
        <p>Interest rate parity (IRP) is a no-arbitrage condition stating that the forward exchange rate should reflect the interest rate differential between two currencies.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Covered vs. Uncovered IRP</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Covered IRP:</strong> Uses forward contracts to lock in rates—no currency risk.</li>
          <li><strong>Uncovered IRP:</strong> Assumes expected future spot equals forward—currency risk exists.</li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground pt-8">Conclusion</h2>
        <p>IRP is fundamental to FX pricing. Use this calculator to determine theoretical forward rates based on interest differentials.</p>
      </section>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>FX forward pricing</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is interest rate parity?</h4><p className="text-muted-foreground">A no-arbitrage relationship linking forward FX rates to spot rates and interest rates.</p></div>
          <div><h4 className="font-semibold mb-2">Which rate is domestic vs. foreign?</h4><p className="text-muted-foreground">Domestic corresponds to the currency in the quote’s base; be consistent with market conventions.</p></div>
          <div><h4 className="font-semibold mb-2">How does tenor affect F?</h4><p className="text-muted-foreground">Longer tenors amplify the premium/discount through the time factor.</p></div>
          <div><h4 className="font-semibold mb-2">What about continuous compounding?</h4><p className="text-muted-foreground">Use F = S · e^(rd − rf)·t if using continuously compounded rates.</p></div>
          <div><h4 className="font-semibold mb-2">Why does market F differ from parity?</h4><p className="text-muted-foreground">Transaction costs, credit constraints, and carry trade frictions cause deviations.</p></div>
          <div><h4 className="font-semibold mb-2">Is parity a trading signal?</h4><p className="text-muted-foreground">Not directly; it’s a pricing identity, not an alpha model.</p></div>
          <div><h4 className="font-semibold mb-2">Can rates be negative?</h4><p className="text-muted-foreground">Yes; the formula still applies with negative r.</p></div>
          <div><h4 className="font-semibold mb-2">Should I round quotes?</h4><p className="text-muted-foreground">Round to market-appropriate precision; we show six decimals by default.</p></div>
        </CardContent>
      </Card>

      {/* Summary Section */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Summary</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">The Interest Rate Parity Calculator computes theoretical forward FX rates from spot rates and interest rate differentials. IRP links FX markets and interest rates through a no-arbitrage relationship.</p></CardContent>
      </Card>
    </div>
  );
}


