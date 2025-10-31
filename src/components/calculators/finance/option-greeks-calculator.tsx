'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Info, Activity } from 'lucide-react';

const formSchema = z.object({
  spot: z.number().min(0).optional(),
  strike: z.number().min(0).optional(),
  rate: z.number().min(-100).max(100).optional(),
  volatility: z.number().min(0).max(500).optional(),
  timeYears: z.number().min(0).max(100).optional(),
  optionType: z.enum(['call', 'put']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function normPdf(x: number) { return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI); }
function normCdf(x: number) { return 0.5 * (1 + erf(x / Math.SQRT2)); }
function erf(x: number) { // numerical approximation
  const sign = x < 0 ? -1 : 1; x = Math.abs(x);
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}

function greeks(S: number, K: number, rPct: number, volPct: number, T: number, type: 'call'|'put') {
  const r = rPct / 100; const sigma = volPct / 100;
  if (sigma === 0 || T === 0) return { delta: NaN, gamma: NaN, vega: NaN, theta: NaN, rho: NaN };
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  const Nd1 = normCdf(type === 'call' ? d1 : -d1);
  const Nd2 = normCdf(type === 'call' ? d2 : -d2);
  const pdf = normPdf(d1);
  const delta = type === 'call' ? Nd1 : Nd1 - 1;
  const gamma = pdf / (S * sigma * Math.sqrt(T));
  const vega = S * pdf * Math.sqrt(T) / 100; // per 1% vol
  const theta = (-(S * pdf * sigma) / (2 * Math.sqrt(T)) - (type === 'call' ? r * K * Math.exp(-r * T) * Nd2 : -r * K * Math.exp(-r * T) * Nd2)) / 365; // per day
  const rho = (type === 'call' ? K * T * Math.exp(-r * T) * normCdf(d2) : -K * T * Math.exp(-r * T) * normCdf(-d2)) / 100; // per 1% rate
  return { delta, gamma, vega, theta, rho };
}

export default function OptionGreeksCalculator() {
  const [result, setResult] = useState<{ delta: number; gamma: number; vega: number; theta: number; rho: number } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { spot: undefined as unknown as number, strike: undefined as unknown as number, rate: undefined as unknown as number, volatility: undefined as unknown as number, timeYears: undefined as unknown as number, optionType: undefined } });

  const onSubmit = (v: FormValues) => {
    if (v.spot === undefined || v.strike === undefined || v.rate === undefined || v.volatility === undefined || v.timeYears === undefined || v.optionType === undefined) { setResult(null); return; }
    const g = greeks(v.spot, v.strike, v.rate, v.volatility, v.timeYears, v.optionType);
    setResult(g as any);
  };

  const num = (ph: string, field: any) => (
    <Input type="number" step="0.01" placeholder={ph} {...field}
      value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
      onChange={e => { const v = e.target.value; const n = v === '' ? undefined : Number(v); field.onChange(Number.isFinite(n as any) ? n : undefined); }} />
  );

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Option Delta / Gamma / Vega / Theta / Rho Calculator</CardTitle>
          <CardDescription>Compute Black–Scholes Greeks for calls and puts.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="spot" render={({ field }) => (<FormItem><FormLabel>Spot Price</FormLabel><FormControl>{num('e.g., 100', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="strike" render={({ field }) => (<FormItem><FormLabel>Strike Price</FormLabel><FormControl>{num('e.g., 105', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="rate" render={({ field }) => (<FormItem><FormLabel>Risk-free Rate (%)</FormLabel><FormControl>{num('e.g., 3', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="volatility" render={({ field }) => (<FormItem><FormLabel>Volatility (%)</FormLabel><FormControl>{num('e.g., 20', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="timeYears" render={({ field }) => (<FormItem><FormLabel>Time to Expiry (years)</FormLabel><FormControl>{num('e.g., 0.5', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="optionType" render={({ field }) => (
                  <FormItem><FormLabel>Option Type</FormLabel><FormControl>
                    <Input placeholder="call or put" {...field as any} value={field.value ?? ''} onChange={e => field.onChange((e.target.value as any) || undefined)} />
                  </FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Greeks</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Delta</p><p className="text-2xl font-bold">{result.delta.toFixed(4)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Gamma</p><p className="text-2xl font-bold">{result.gamma.toExponential(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Vega (per 1%)</p><p className="text-2xl font-bold">{result.vega.toFixed(4)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Theta (per day)</p><p className="text-2xl font-bold">{result.theta.toFixed(4)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Rho (per 1%)</p><p className="text-2xl font-bold">{result.rho.toFixed(4)}</p></div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Options and models</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/black-scholes-calculator" className="text-primary hover:underline">Black–Scholes Calculator</a></h4><p className="text-sm text-muted-foreground">Option pricing baseline.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/implied-volatility-calculator" className="text-primary hover:underline">Implied Volatility Calculator</a></h4><p className="text-sm text-muted-foreground">Back out IV from prices.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/option-payoff-calculator" className="text-primary hover:underline">Option Payoff Calculator</a></h4><p className="text-sm text-muted-foreground">Payoff visualization.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/put-call-parity-calculator" className="text-primary hover:underline">Put-Call Parity</a></h4><p className="text-sm text-muted-foreground">Arbitrage relationships.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Option Greeks</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain interpretation and hedge usage for each Greek.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Greeks and risk management</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What do Greeks measure?</h4><p className="text-muted-foreground">First- and higher-order sensitivities of option price to inputs like spot, volatility, time, and rates.</p></div>
          <div><h4 className="font-semibold mb-2">Why is gamma important?</h4><p className="text-muted-foreground">Gamma indicates how delta changes with spot; high gamma increases re-hedging needs.</p></div>
          <div><h4 className="font-semibold mb-2">What does vega represent?</h4><p className="text-muted-foreground">Sensitivity to volatility; expressed per 1% vol change in this tool.</p></div>
          <div><h4 className="font-semibold mb-2">Is theta always negative?</h4><p className="text-muted-foreground">For long options typically yes; short options earn time decay (positive theta).</p></div>
          <div><h4 className="font-semibold mb-2">How is rho used?</h4><p className="text-muted-foreground">Rate sensitivity matters more for longer-dated options or deep ITM/OTM positions.</p></div>
          <div><h4 className="font-semibold mb-2">Do Greeks assume constant vol?</h4><p className="text-muted-foreground">Black–Scholes assumes constant vol; in practice use surface/term structure for accuracy.</p></div>
          <div><h4 className="font-semibold mb-2">How often to re-hedge?</h4><p className="text-muted-foreground">Depends on risk tolerance; higher gamma or vol requires more frequent adjustments.</p></div>
          <div><h4 className="font-semibold mb-2">Can Greeks be aggregated?</h4><p className="text-muted-foreground">Yes—sum across positions to get portfolio-level exposure by Greek.</p></div>
          <div><h4 className="font-semibold mb-2">Are Greeks linear?</h4><p className="text-muted-foreground">Only locally; use second-order terms (gamma, vomma) for larger shocks.</p></div>
          <div><h4 className="font-semibold mb-2">Do dividends matter?</h4><p className="text-muted-foreground">This basic model ignores dividends; for equities, use dividend-adjusted formulas.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


