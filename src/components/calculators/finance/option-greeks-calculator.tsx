'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Info, Activity, Target, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

function greeks(S: number, K: number, rPct: number, volPct: number, T: number, type: 'call' | 'put') {
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
  const [result, setResult] = useState<{ delta: number; gamma: number; vega: number; theta: number; rho: number; insights: string[]; considerations: string[] } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { spot: undefined as unknown as number, strike: undefined as unknown as number, rate: undefined as unknown as number, volatility: undefined as unknown as number, timeYears: undefined as unknown as number, optionType: undefined } });

  const onSubmit = (v: FormValues) => {
    if (v.spot === undefined || v.strike === undefined || v.rate === undefined || v.volatility === undefined || v.timeYears === undefined || v.optionType === undefined) { setResult(null); return; }
    const g = greeks(v.spot, v.strike, v.rate, v.volatility, v.timeYears, v.optionType);

    setResult({
      ...g,
      insights: [
        `Delta of ${g.delta.toFixed(2)} indicates directional sensitivity; ${Math.abs(g.delta) > 0.5 ? 'high' : 'low'} probability of ITM expiry.`,
        `Monitor Gamma (${g.gamma.toExponential(2)}) to anticipate delta changes.`,
        `Vega exposure means volatility changes impact price significantly.`
      ],
      considerations: [
        'Theta decay accelerates as expiry approaches (for ATM options).',
        'Model assumes constant volatility and log-normal rates.',
        'High gamma near expiry creates significant hedging risk.',
        'Rho assumes parallel yield curve shifts.',
        'Large bid-ask spreads can erode theoretical greek edges.'
      ]
    });
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
        <>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Option Sensitivity Metrics</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Delta</p><p className="text-2xl font-bold text-primary">{result.delta.toFixed(4)}</p></div>
                <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Gamma</p><p className="text-2xl font-bold">{result.gamma.toExponential(2)}</p></div>
                <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Vega</p><p className="text-2xl font-bold">{result.vega.toFixed(4)}</p></div>
                <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Theta</p><p className="text-2xl font-bold text-red-600 dark:text-red-400">{result.theta.toFixed(4)}</p></div>
                <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Rho</p><p className="text-2xl font-bold">{result.rho.toFixed(4)}</p></div>
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
                <CardDescription>Position management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.insights.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm font-medium">{s}</span>
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
                <CardDescription>Greek sensitivities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.considerations.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">{s}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
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

      {/* Formula Used */}
      <Card className="mb-6">
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" />Formula Used</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto"><p className="font-mono text-sm text-center">Delta = ∂V/∂S, Gamma = ∂²V/∂S², Vega = ∂V/∂σ, Theta = ∂V/∂t, Rho = ∂V/∂r</p></div>
          <p className="text-sm text-muted-foreground">Partial derivatives of option value with respect to underlying (S), volatility (σ), time (t), and rate (r).</p>
        </CardContent>
      </Card>

      {/* Input Explanations */}
      <Card className="mb-6">
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Understanding the Inputs</CardTitle></CardHeader>
        <CardContent><div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg"><h4 className="font-semibold mb-2">Spot & Strike</h4><p className="text-sm text-muted-foreground">Current price and option strike price.</p></div>
          <div className="p-4 bg-muted/50 rounded-lg"><h4 className="font-semibold mb-2">Volatility & Rate</h4><p className="text-sm text-muted-foreground">Annualized implied volatility and risk-free rate.</p></div>
          <div className="p-4 bg-muted/50 rounded-lg"><h4 className="font-semibold mb-2">Time & Type</h4><p className="text-sm text-muted-foreground">Years to expiry and call/put selection.</p></div>
        </div></CardContent>
      </Card>

      {/* Complete SEO Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Complete Guide to Option Greeks</h1>
        <p className="text-lg italic">Greeks measure option price sensitivities: Delta for directional exposure, Gamma for convexity, Vega for volatility risk, Theta for time decay, Rho for rate sensitivity.</p>
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Hedging with Greeks</h2>
        <p>Delta-neutral portfolios eliminate directional risk. Monitor Gamma for re-hedging frequency needs. Vega exposure matters during volatility events.</p>
        <h2 className="text-2xl font-bold text-foreground pt-8">Conclusion</h2>
        <p>Mastering Greeks is essential for options trading, portfolio risk management, and constructing sophisticated hedging strategies.</p>
      </section>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Greeks and risk management</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What do Greeks measure?</h4><p className="text-muted-foreground">First- and higher-order sensitivities of option price to inputs like spot, volatility, time, and rates.</p></div>
          <div><h4 className="font-semibold mb-2">Why is gamma important?</h4><p className="text-muted-foreground">Gamma indicates how delta changes with spot; high gamma increases re-hedging needs.</p></div>
          <div><h4 className="font-semibold mb-2">What does vega represent?</h4><p className="text-muted-foreground">Sensitivity to volatility; expressed per 1% vol change in this tool.</p></div>
          <div><h4 className="font-semibold mb-2">Is theta always negative?</h4><p className="text-muted-foreground">For long options typically yes; short options earn time decay (positive theta).</p></div>
        </CardContent>
      </Card>

      {/* Summary Section */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Summary</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">The Option Greeks Calculator computes Delta, Gamma, Vega, Theta, and Rho using Black-Scholes. Use Greeks to understand and hedge option position risks.</p></CardContent>
      </Card>
    </div>
  );
}


