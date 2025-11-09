'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Info, Shield } from 'lucide-react';

const formSchema = z.object({
  spotPrice: z.number().min(0).optional(),
  futuresPrice: z.number().min(0).optional(),
  spotVolatility: z.number().min(0).optional(),
  futuresVolatility: z.number().min(0).optional(),
  correlation: z.number().min(-1).max(1).optional(),
  spotQuantity: z.number().min(0).optional(),
  futuresContractSize: z.number().min(1).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function FuturesHedgeRatioCalculator() {
  const [result, setResult] = useState<{
    hedgeRatio: number;
    futuresContracts: number;
    hedgeValue: number;
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
      spotQuantity: undefined as unknown as number,
      futuresContractSize: undefined as unknown as number,
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
                } else if (name === 'futuresContractSize') {
                  min = 1;
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
    if (v.spotPrice == null || v.futuresPrice == null || v.spotQuantity == null || v.futuresContractSize == null ||
        v.spotPrice <= 0 || v.futuresPrice <= 0 || v.spotQuantity <= 0 || v.futuresContractSize <= 0) {
      setResult(null);
      return;
    }
    const corr = v.correlation ?? 1;
    const spotVol = (v.spotVolatility ?? 0) / 100;
    const futuresVol = (v.futuresVolatility ?? 0) / 100;
    
    // Hedge ratio = (Spot Volatility / Futures Volatility) × Correlation
    // If volatilities not provided, use price ratio as approximation
    let hedgeRatio: number;
    if (spotVol > 0 && futuresVol > 0) {
      hedgeRatio = (spotVol / futuresVol) * corr;
    } else {
      hedgeRatio = (v.spotPrice / v.futuresPrice) * corr;
    }
    
    const spotValue = v.spotQuantity * v.spotPrice;
    const futuresContracts = Math.round((hedgeRatio * spotValue) / (v.futuresPrice * v.futuresContractSize));
    const hedgeValue = futuresContracts * v.futuresPrice * v.futuresContractSize;
    
    const interpretation = `Optimal hedge ratio: ${hedgeRatio.toFixed(4)}. To hedge ${v.spotQuantity.toLocaleString('en-US')} units of spot position, ${hedgeRatio < 0 ? 'sell' : 'buy'} ${Math.abs(futuresContracts)} futures contracts (hedge value: $${Math.abs(hedgeValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}). This hedge ratio minimizes basis risk by accounting for price differences, volatility differences, and correlation between spot and futures markets.`;
    setResult({ hedgeRatio, futuresContracts, hedgeValue, interpretation });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5"/> Futures Hedge Ratio Calculator</CardTitle>
          <CardDescription>Calculate optimal hedge ratio for futures contracts to minimize basis risk and hedge spot positions effectively.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {numInput('spotPrice', 'Spot Price ($)', 'e.g., 50.00', '$')}
                {numInput('futuresPrice', 'Futures Price ($)', 'e.g., 50.50', '$')}
              </div>
              {numInput('spotQuantity', 'Spot Quantity (units)', 'e.g., 1000')}
              {numInput('futuresContractSize', 'Futures Contract Size (units per contract)', 'e.g., 100')}
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
            <CardDescription>Optimal futures hedge ratio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div><div className="text-sm text-muted-foreground">Hedge Ratio</div><div className="text-2xl font-semibold">{result.hedgeRatio.toFixed(4)}</div></div>
              <div><div className="text-sm text-muted-foreground">Futures Contracts</div><div className="text-xl font-medium">{result.futuresContracts}</div></div>
              <div><div className="text-sm text-muted-foreground">Hedge Value</div><div className="text-xl font-medium">${Math.abs(result.hedgeValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
            </div>
            <p className="text-sm leading-6">{result.interpretation}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Related Calculators</CardTitle>
          <CardDescription>Hedging and risk management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/basis-risk-calculator" className="text-primary hover:underline">Basis Risk</a></h4><p className="text-sm text-muted-foreground">Hedging effectiveness.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/options-delta-neutral-portfolio-calculator" className="text-primary hover:underline">Options Delta Neutral</a></h4><p className="text-sm text-muted-foreground">Delta hedging.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/arbitrage-profit-calculator" className="text-primary hover:underline">Arbitrage Profit</a></h4><p className="text-sm text-muted-foreground">Price differences.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/position-sizing-calculator" className="text-primary hover:underline">Position Sizing</a></h4><p className="text-sm text-muted-foreground">Risk-based sizing.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Calculating optimal hedge ratio for futures contracts</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Hedge ratio determines how many futures contracts are needed to hedge a spot position. Optimal hedge ratio minimizes basis risk (difference between spot and futures prices).</li>
            <li>Hedge Ratio = (Spot Volatility / Futures Volatility) × Correlation. If volatilities are unknown, use price ratio: (Spot Price / Futures Price) × Correlation.</li>
            <li>Perfect hedge ratio is 1.0 when spot and futures prices move identically. Lower correlation or different volatilities require adjusted hedge ratios.</li>
            <li>Futures Contracts = (Hedge Ratio × Spot Value) / (Futures Price × Contract Size). Round to nearest whole contract.</li>
            <li>Basis risk arises when spot and futures prices don't move in perfect correlation. Monitor basis and adjust hedge ratio as correlation or volatilities change.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Futures hedging, hedge ratio, and basis risk management</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is a hedge ratio?</h4><p className="text-muted-foreground">Hedge ratio is the ratio of futures contracts to spot position needed to minimize risk. A hedge ratio of 1.0 means one futures contract per unit of spot position.</p></div>
          <div><h4 className="font-semibold mb-2">How is hedge ratio calculated?</h4><p className="text-muted-foreground">Hedge Ratio = (Spot Volatility / Futures Volatility) × Correlation. If volatilities are unknown, use price ratio: (Spot Price / Futures Price) × Correlation.</p></div>
          <div><h4 className="font-semibold mb-2">What is a perfect hedge ratio?</h4><p className="text-muted-foreground">Perfect hedge ratio is 1.0 when spot and futures prices move identically (correlation = 1.0, same volatility). In practice, hedge ratios differ from 1.0 due to basis risk.</p></div>
          <div><h4 className="font-semibold mb-2">How do I calculate number of futures contracts?</h4><p className="text-muted-foreground">Futures Contracts = (Hedge Ratio × Spot Value) / (Futures Price × Contract Size). Round to nearest whole contract, as fractional contracts are not traded.</p></div>
          <div><h4 className="font-semibold mb-2">What is basis risk?</h4><p className="text-muted-foreground">Basis risk is the risk that spot and futures prices don't move in perfect correlation, causing the hedge to be imperfect. Basis = Spot Price - Futures Price.</p></div>
          <div><h4 className="font-semibold mb-2">How does correlation affect hedge ratio?</h4><p className="text-muted-foreground">Lower correlation between spot and futures requires adjusted hedge ratio. If correlation is 0.8, hedge ratio is reduced proportionally, requiring fewer futures contracts.</p></div>
          <div><h4 className="font-semibold mb-2">Should I hedge 100% of my position?</h4><p className="text-muted-foreground">Not necessarily. Optimal hedge ratio may be less than 1.0 if correlation is imperfect or volatilities differ. Over-hedging (ratio &gt;1.0) can increase risk if basis moves against you.</p></div>
          <div><h4 className="font-semibold mb-2">How often should I recalculate hedge ratio?</h4><p className="text-muted-foreground">Recalculate when correlation or volatilities change significantly, when basis changes, or periodically (weekly/monthly) to maintain optimal hedging effectiveness.</p></div>
          <div><h4 className="font-semibold mb-2">Can I use this for cross-hedging?</h4><p className="text-muted-foreground">Yes, but cross-hedging (hedging with different asset) requires lower correlation and adjusted hedge ratio. Basis risk is typically higher in cross-hedging scenarios.</p></div>
          <div><h4 className="font-semibold mb-2">What are the costs of hedging with futures?</h4><p className="text-muted-foreground">Costs include margin requirements, transaction costs, basis risk, and opportunity cost if spot price moves favorably. Consider these costs when deciding whether to hedge.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

