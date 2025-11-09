'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Info, TrendingUp } from 'lucide-react';

const formSchema = z.object({
  spotPrice: z.number().min(0).optional(),
  interestRate: z.number().min(0).optional(),
  dividendYield: z.number().min(0).optional(),
  timeToExpiration: z.number().min(0).optional(),
  storageCost: z.number().min(0).optional(),
  convenienceYield: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function FuturesFairValueCalculator() {
  const [result, setResult] = useState<{
    fairValue: number;
    costOfCarry: number;
    pricingBasis: number;
    interpretation: string;
  } | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      spotPrice: undefined as unknown as number,
      interestRate: undefined as unknown as number,
      dividendYield: undefined as unknown as number,
      timeToExpiration: undefined as unknown as number,
      storageCost: undefined as unknown as number,
      convenienceYield: undefined as unknown as number,
    }
  });

  const numInput = (name: keyof FormValues, label: string, placeholder: string, suffix = '') => (
    <FormField control={form.control} name={name} render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              step="0.01"
              placeholder={placeholder}
              value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
              onChange={e => {
                const v = e.target.value;
                const n = v === '' ? undefined : Number(v);
                field.onChange(Number.isFinite(n as any) && n !== null && n >= 0 ? n : undefined);
              }}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
            {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
  );

  const onSubmit = (v: FormValues) => {
    if (v.spotPrice == null || v.spotPrice <= 0) {
      setResult(null);
      return;
    }
    const r = (v.interestRate ?? 0) / 100;
    const d = (v.dividendYield ?? 0) / 100;
    const t = (v.timeToExpiration ?? 0) / 365;
    const s = (v.storageCost ?? 0) / 100;
    const cy = (v.convenienceYield ?? 0) / 100;
    
    // Cost of carry = (r - d + s - cy) × t
    const costOfCarry = (r - d + s - cy) * t;
    const fairValue = v.spotPrice * Math.exp(costOfCarry);
    const pricingBasis = fairValue - v.spotPrice;
    
    let marketCondition = '';
    if (fairValue > v.spotPrice) {
      marketCondition = 'Futures are in contango (fair value exceeds spot).';
    } else if (fairValue < v.spotPrice) {
      marketCondition = 'Futures are in backwardation (fair value below spot).';
    } else {
      marketCondition = 'Futures are at fair value (fair value equals spot).';
    }
    
    const interpretation = `Fair value: $${fairValue.toFixed(2)}. Cost of carry: ${(costOfCarry * 100).toFixed(2)}%. Pricing basis: $${pricingBasis.toFixed(2)} (${((pricingBasis / v.spotPrice) * 100).toFixed(2)}% of spot). ${marketCondition} If market futures price differs significantly from fair value, arbitrage opportunities may exist.`;
    setResult({ fairValue, costOfCarry: costOfCarry * 100, pricingBasis, interpretation });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5"/> Futures Fair Value Calculator</CardTitle>
          <CardDescription>Calculate fair value of futures contracts from spot price, interest rate, dividends, and time to expiration to identify pricing discrepancies.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {numInput('spotPrice', 'Spot Price ($)', 'e.g., 50.00', '$')}
              {numInput('interestRate', 'Risk-Free Interest Rate (%, optional)', 'e.g., 5', '%')}
              {numInput('timeToExpiration', 'Time to Expiration (days, optional)', 'e.g., 30')}
              {numInput('dividendYield', 'Dividend Yield (%, optional)', 'e.g., 2', '%')}
              {numInput('storageCost', 'Storage Cost (%, optional, for commodities)', 'e.g., 1', '%')}
              {numInput('convenienceYield', 'Convenience Yield (%, optional, for commodities)', 'e.g., 0.5', '%')}
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Futures fair value analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div><div className="text-sm text-muted-foreground">Fair Value</div><div className="text-2xl font-semibold">${result.fairValue.toFixed(2)}</div></div>
              <div><div className="text-sm text-muted-foreground">Cost of Carry</div><div className="text-xl font-medium">{result.costOfCarry.toFixed(2)}%</div></div>
              <div><div className="text-sm text-muted-foreground">Pricing Basis</div><div className={`text-xl font-medium ${result.pricingBasis >= 0 ? 'text-green-600' : 'text-red-600'}`}>${result.pricingBasis.toFixed(2)}</div></div>
            </div>
            <p className="text-sm leading-6">{result.interpretation}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Related Calculators</CardTitle>
          <CardDescription>Futures pricing and analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/basis-risk-calculator" className="text-primary hover:underline">Basis Risk</a></h4><p className="text-sm text-muted-foreground">Price convergence.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/futures-hedge-ratio-calculator" className="text-primary hover:underline">Futures Hedge Ratio</a></h4><p className="text-sm text-muted-foreground">Optimal hedging.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/arbitrage-profit-calculator" className="text-primary hover:underline">Arbitrage Profit</a></h4><p className="text-sm text-muted-foreground">Price differences.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/put-call-parity-checker" className="text-primary hover:underline">Put-Call Parity</a></h4><p className="text-sm text-muted-foreground">Option pricing.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Calculating futures fair value and cost of carry</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Futures Fair Value = Spot Price × e^(Cost of Carry × Time). Cost of carry includes interest rate, dividends, storage costs, and convenience yield.</li>
            <li>Cost of Carry = (Interest Rate - Dividend Yield + Storage Cost - Convenience Yield) × Time. Positive cost of carry results in contango (futures exceed spot).</li>
            <li>For financial futures (stocks, indices), cost of carry = Interest Rate - Dividend Yield. Dividends reduce cost of carry, making futures cheaper relative to spot.</li>
            <li>For commodities, storage costs increase cost of carry, while convenience yield (benefit of holding physical commodity) decreases it. Net cost determines pricing.</li>
            <li>If market futures price differs from fair value, arbitrage opportunities exist. Buy if futures are below fair value, sell if futures are above fair value (after accounting for costs).</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Futures fair value, cost of carry, and pricing analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is futures fair value?</h4><p className="text-muted-foreground">Futures fair value is the theoretical price of a futures contract based on spot price, interest rates, dividends, storage costs, and time to expiration. It represents the no-arbitrage price.</p></div>
          <div><h4 className="font-semibold mb-2">How is futures fair value calculated?</h4><p className="text-muted-foreground">Futures Fair Value = Spot Price × e^(Cost of Carry × Time), where Cost of Carry = (Interest Rate - Dividend Yield + Storage Cost - Convenience Yield) × Time.</p></div>
          <div><h4 className="font-semibold mb-2">What is cost of carry?</h4><p className="text-muted-foreground">Cost of carry is the net cost of holding an asset until futures expiration, including interest costs, dividends received, storage costs, and convenience yield. It determines the premium or discount of futures to spot.</p></div>
          <div><h4 className="font-semibold mb-2">What is contango?</h4><p className="text-muted-foreground">Contango occurs when futures price exceeds spot price (positive basis). This is normal when cost of carry is positive (interest rate exceeds dividend yield, or storage costs exceed convenience yield).</p></div>
          <div><h4 className="font-semibold mb-2">What is backwardation?</h4><p className="text-muted-foreground">Backwardation occurs when futures price is below spot price (negative basis). This happens when convenience yield exceeds storage costs, or when there is strong demand for immediate delivery.</p></div>
          <div><h4 className="font-semibold mb-2">How do dividends affect futures fair value?</h4><p className="text-muted-foreground">Dividends reduce cost of carry (dividend yield is subtracted), making futures cheaper relative to spot. Higher dividends result in lower futures fair value, all else equal.</p></div>
          <div><h4 className="font-semibold mb-2">What is convenience yield?</h4><p className="text-muted-foreground">Convenience yield is the benefit of holding physical commodity (e.g., ability to use in production, avoiding supply disruptions). It reduces cost of carry and can cause backwardation.</p></div>
          <div><h4 className="font-semibold mb-2">How does time to expiration affect fair value?</h4><p className="text-muted-foreground">Longer time to expiration increases the impact of cost of carry. As expiration approaches, fair value converges to spot price (basis converges to zero).</p></div>
          <div><h4 className="font-semibold mb-2">What if market futures price differs from fair value?</h4><p className="text-muted-foreground">If market price differs significantly from fair value (after accounting for transaction costs), arbitrage opportunities exist. Buy if futures are below fair value, sell if futures are above fair value.</p></div>
          <div><h4 className="font-semibold mb-2">Can I use fair value to predict futures prices?</h4><p className="text-muted-foreground">Fair value provides a theoretical benchmark, but actual prices may deviate due to market sentiment, supply/demand, and other factors. Use fair value as a guide, not a prediction.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

