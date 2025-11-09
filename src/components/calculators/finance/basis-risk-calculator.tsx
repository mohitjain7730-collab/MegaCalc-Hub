'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Info, AlertTriangle } from 'lucide-react';

const formSchema = z.object({
  spotPrice: z.number().min(0).optional(),
  futuresPrice: z.number().min(0).optional(),
  spotVolatility: z.number().min(0).optional(),
  futuresVolatility: z.number().min(0).optional(),
  correlation: z.number().min(-1).max(1).optional(),
  positionSize: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function BasisRiskCalculator() {
  const [result, setResult] = useState<{
    basis: number;
    basisPercent: number;
    basisRisk: number;
    hedgeEffectiveness: number;
    interpretation: string;
  } | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      spotPrice: undefined as unknown as number,
      futuresPrice: undefined as unknown as number,
      spotVolatility: undefined as unknown as number,
      futuresVolatility: undefined as unknown as number,
      correlation: undefined as unknown as number,
      positionSize: undefined as unknown as number,
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
                let max: number | undefined = undefined;
                let min: number | undefined = undefined;
                if (name === 'correlation') {
                  max = 1;
                  min = -1;
                }
                field.onChange(Number.isFinite(n as any) && n !== null && (min === undefined || n >= min) && (max === undefined || n <= max) ? n : undefined);
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
    if (v.spotPrice == null || v.futuresPrice == null || v.spotPrice <= 0 || v.futuresPrice <= 0) {
      setResult(null);
      return;
    }
    const basis = v.spotPrice - v.futuresPrice;
    const basisPercent = (basis / v.spotPrice) * 100;
    const corr = v.correlation ?? 1;
    const spotVol = (v.spotVolatility ?? 0) / 100;
    const futuresVol = (v.futuresVolatility ?? 0) / 100;
    
    // Basis risk = sqrt(SpotVol^2 + FuturesVol^2 - 2 × Correlation × SpotVol × FuturesVol)
    let basisRisk = 0;
    if (spotVol > 0 || futuresVol > 0) {
      basisRisk = Math.sqrt(spotVol * spotVol + futuresVol * futuresVol - 2 * corr * spotVol * futuresVol) * 100;
    } else {
      basisRisk = Math.abs(basisPercent);
    }
    
    // Hedge effectiveness = Correlation^2 (R-squared)
    const hedgeEffectiveness = corr * corr * 100;
    
    const posSize = v.positionSize ?? 0;
    const riskAmount = posSize > 0 ? (basisRisk / 100) * posSize : 0;
    
    const interpretation = `Basis: $${basis.toFixed(2)} (${basisPercent.toFixed(2)}% of spot price). Basis risk: ${basisRisk.toFixed(2)}%. Hedge effectiveness: ${hedgeEffectiveness.toFixed(1)}%. ${posSize > 0 ? `For a $${posSize.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} position, potential basis risk is $${riskAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.` : ''} Lower basis risk and higher hedge effectiveness indicate better hedging performance.`;
    setResult({ basis, basisPercent, basisRisk, hedgeEffectiveness, interpretation });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5"/> Basis Risk Calculator</CardTitle>
          <CardDescription>Calculate basis risk between spot and futures prices to assess hedging effectiveness and price convergence.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {numInput('spotPrice', 'Spot Price ($)', 'e.g., 50.00', '$')}
                {numInput('futuresPrice', 'Futures Price ($)', 'e.g., 50.50', '$')}
              </div>
              {numInput('positionSize', 'Position Size ($, optional)', 'e.g., 100000', '$')}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {numInput('spotVolatility', 'Spot Volatility (%, optional)', 'e.g., 20', '%')}
                {numInput('futuresVolatility', 'Futures Volatility (%, optional)', 'e.g., 18', '%')}
              </div>
              {numInput('correlation', 'Correlation (-1 to 1, optional, default: 1)', 'e.g., 0.95')}
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Basis risk analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><div className="text-sm text-muted-foreground">Basis</div><div className={`text-xl font-semibold ${result.basis >= 0 ? 'text-green-600' : 'text-red-600'}`}>${result.basis.toFixed(2)}</div></div>
              <div><div className="text-sm text-muted-foreground">Basis %</div><div className={`text-lg font-medium ${result.basisPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>{result.basisPercent.toFixed(2)}%</div></div>
              <div><div className="text-sm text-muted-foreground">Basis Risk</div><div className="text-xl font-medium text-orange-600">{result.basisRisk.toFixed(2)}%</div></div>
              <div><div className="text-sm text-muted-foreground">Hedge Effectiveness</div><div className="text-lg font-medium">{result.hedgeEffectiveness.toFixed(1)}%</div></div>
            </div>
            <p className="text-sm leading-6">{result.interpretation}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Related Calculators</CardTitle>
          <CardDescription>Hedging and risk assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/futures-hedge-ratio-calculator" className="text-primary hover:underline">Futures Hedge Ratio</a></h4><p className="text-sm text-muted-foreground">Optimal hedging.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/options-delta-neutral-portfolio-calculator" className="text-primary hover:underline">Options Delta Neutral</a></h4><p className="text-sm text-muted-foreground">Delta hedging.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/arbitrage-profit-calculator" className="text-primary hover:underline">Arbitrage Profit</a></h4><p className="text-sm text-muted-foreground">Price differences.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/expected-shortfall-calculator" className="text-primary hover:underline">Expected Shortfall</a></h4><p className="text-sm text-muted-foreground">Tail risk.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Understanding basis risk and hedging effectiveness</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Basis = Spot Price - Futures Price. Basis risk is the risk that basis changes, causing imperfect hedging even with optimal hedge ratio.</li>
            <li>Basis Risk = sqrt(SpotVol² + FuturesVol² - 2 × Correlation × SpotVol × FuturesVol). Lower basis risk indicates better hedging effectiveness.</li>
            <li>Hedge Effectiveness = Correlation² (R-squared). Higher correlation (closer to 1.0) results in higher hedge effectiveness and lower basis risk.</li>
            <li>Basis typically converges to zero at futures expiration (spot and futures prices converge), but can fluctuate significantly before expiration.</li>
            <li>Factors affecting basis risk include correlation, volatility differences, time to expiration, storage costs, interest rates, and supply/demand imbalances.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Basis risk, hedging effectiveness, and futures pricing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is basis?</h4><p className="text-muted-foreground">Basis is the difference between spot price and futures price: Basis = Spot Price - Futures Price. Positive basis (contango) means futures trade above spot, negative basis (backwardation) means futures trade below spot.</p></div>
          <div><h4 className="font-semibold mb-2">What is basis risk?</h4><p className="text-muted-foreground">Basis risk is the risk that basis changes, causing imperfect hedging. Even with optimal hedge ratio, basis movements can result in gains or losses if spot and futures prices don't move in perfect correlation.</p></div>
          <div><h4 className="font-semibold mb-2">How is basis risk calculated?</h4><p className="text-muted-foreground">Basis Risk = sqrt(SpotVol² + FuturesVol² - 2 × Correlation × SpotVol × FuturesVol). It measures the volatility of basis, indicating how much basis can change over time.</p></div>
          <div><h4 className="font-semibold mb-2">What is hedge effectiveness?</h4><p className="text-muted-foreground">Hedge effectiveness = Correlation² (R-squared), ranging from 0% to 100%. Higher effectiveness means the hedge better offsets spot price movements. Effectiveness above 80% is generally considered good.</p></div>
          <div><h4 className="font-semibold mb-2">Why does basis exist?</h4><p className="text-muted-foreground">Basis exists due to carrying costs (storage, insurance, interest), convenience yield, supply/demand imbalances, and time to expiration. Basis typically converges to zero at futures expiration.</p></div>
          <div><h4 className="font-semibold mb-2">What is contango and backwardation?</h4><p className="text-muted-foreground">Contango: futures price &gt; spot price (positive basis). Backwardation: futures price &lt; spot price (negative basis). Contango is common in commodities with storage costs, backwardation in markets with convenience yield.</p></div>
          <div><h4 className="font-semibold mb-2">How does correlation affect basis risk?</h4><p className="text-muted-foreground">Higher correlation reduces basis risk. If correlation = 1.0 and volatilities are equal, basis risk = 0. Lower correlation increases basis risk, making hedging less effective.</p></div>
          <div><h4 className="font-semibold mb-2">Can basis risk be eliminated?</h4><p className="text-muted-foreground">Basis risk cannot be completely eliminated unless spot and futures prices move identically (correlation = 1.0, same volatility). In practice, basis risk is minimized but not eliminated.</p></div>
          <div><h4 className="font-semibold mb-2">How does time to expiration affect basis?</h4><p className="text-muted-foreground">Basis typically converges to zero as expiration approaches (spot and futures prices converge). Longer time to expiration generally means higher basis risk due to more time for basis to change.</p></div>
          <div><h4 className="font-semibold mb-2">What is cross-hedging basis risk?</h4><p className="text-muted-foreground">Cross-hedging (hedging with different asset) typically has higher basis risk due to lower correlation. Basis risk in cross-hedging is often higher than direct hedging with the same asset.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

