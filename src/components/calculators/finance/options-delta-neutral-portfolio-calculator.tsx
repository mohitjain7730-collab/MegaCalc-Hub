'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Info, Scale } from 'lucide-react';

const formSchema = z.object({
  optionDelta: z.number().min(-1).max(1).optional(),
  optionContracts: z.number().min(0).optional(),
  contractSize: z.number().min(1).optional(),
  underlyingPrice: z.number().min(0).optional(),
  existingPosition: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function OptionsDeltaNeutralPortfolioCalculator() {
  const [result, setResult] = useState<{
    totalDelta: number;
    sharesToHedge: number;
    hedgeValue: number;
    interpretation: string;
  } | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      optionDelta: undefined as unknown as number,
      optionContracts: undefined as unknown as number,
      contractSize: undefined as unknown as number,
      underlyingPrice: undefined as unknown as number,
      existingPosition: undefined as unknown as number,
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
                if (name === 'optionDelta') {
                  max = 1;
                  min = -1;
                } else if (name === 'contractSize') {
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
    if (v.optionDelta == null || v.optionContracts == null || v.contractSize == null || v.underlyingPrice == null ||
        v.optionContracts <= 0 || v.contractSize <= 0 || v.underlyingPrice <= 0) {
      setResult(null);
      return;
    }
    const existing = v.existingPosition ?? 0;
    const optionDelta = v.optionDelta * v.optionContracts * v.contractSize;
    const totalDelta = optionDelta + existing;
    const sharesToHedge = -totalDelta;
    const hedgeValue = sharesToHedge * v.underlyingPrice;
    const interpretation = `Total portfolio delta: ${totalDelta.toFixed(2)}. To achieve delta neutrality, ${sharesToHedge > 0 ? 'buy' : 'sell'} ${Math.abs(sharesToHedge).toFixed(0)} shares of the underlying (hedge value: $${Math.abs(hedgeValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}). Delta-neutral portfolios are insensitive to small price movements in the underlying asset, focusing on other Greeks (gamma, theta, vega) for profit.`;
    setResult({ totalDelta, sharesToHedge, hedgeValue, interpretation });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Scale className="h-5 w-5"/> Options Delta Neutral Portfolio Calculator</CardTitle>
          <CardDescription>Calculate positions needed to create a delta-neutral portfolio using options and underlying assets to hedge directional risk.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {numInput('optionDelta', 'Option Delta (-1 to 1)', 'e.g., 0.5')}
              {numInput('optionContracts', 'Number of Option Contracts', 'e.g., 10')}
              {numInput('contractSize', 'Contract Size (shares per contract)', 'e.g., 100')}
              {numInput('underlyingPrice', 'Underlying Price ($)', 'e.g., 50.00', '$')}
              {numInput('existingPosition', 'Existing Underlying Position (shares, optional)', 'e.g., 0')}
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Delta-neutral hedge calculation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div><div className="text-sm text-muted-foreground">Total Portfolio Delta</div><div className="text-2xl font-semibold">{result.totalDelta.toFixed(2)}</div></div>
              <div><div className="text-sm text-muted-foreground">Shares to Hedge</div><div className={`text-xl font-medium ${result.sharesToHedge > 0 ? 'text-green-600' : 'text-red-600'}`}>{result.sharesToHedge > 0 ? '+' : ''}{result.sharesToHedge.toFixed(0)}</div></div>
              <div><div className="text-sm text-muted-foreground">Hedge Value</div><div className="text-xl font-medium">${Math.abs(result.hedgeValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
            </div>
            <p className="text-sm leading-6">{result.interpretation}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Related Calculators</CardTitle>
          <CardDescription>Options trading and hedging</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/futures-hedge-ratio-calculator" className="text-primary hover:underline">Futures Hedge Ratio</a></h4><p className="text-sm text-muted-foreground">Futures hedging.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/basis-risk-calculator" className="text-primary hover:underline">Basis Risk</a></h4><p className="text-sm text-muted-foreground">Hedging effectiveness.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/arbitrage-profit-calculator" className="text-primary hover:underline">Arbitrage Profit</a></h4><p className="text-sm text-muted-foreground">Price differences.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/position-sizing-calculator" className="text-primary hover:underline">Position Sizing</a></h4><p className="text-sm text-muted-foreground">Risk-based sizing.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Creating delta-neutral portfolios with options</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Delta measures the sensitivity of option price to underlying price changes. Delta-neutral portfolios have zero net delta, making them insensitive to small price movements.</li>
            <li>Total Delta = (Option Delta × Contracts × Contract Size) + Existing Position. To achieve delta neutrality, hedge by buying or selling underlying shares equal to -Total Delta.</li>
            <li>Delta-neutral strategies profit from other Greeks: gamma (price acceleration), theta (time decay), or vega (volatility changes), rather than directional price movement.</li>
            <li>Delta changes as underlying price moves (gamma effect). Rebalance regularly to maintain delta neutrality, especially for large price movements.</li>
            <li>Delta-neutral portfolios are commonly used in market-making, volatility trading, and hedging strategies where directional risk is unwanted.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Delta neutrality, options Greeks, and portfolio hedging</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is delta?</h4><p className="text-muted-foreground">Delta is the rate of change of option price with respect to underlying price. Call options have positive delta (0 to 1), put options have negative delta (-1 to 0).</p></div>
          <div><h4 className="font-semibold mb-2">What is a delta-neutral portfolio?</h4><p className="text-muted-foreground">A delta-neutral portfolio has zero net delta, making it insensitive to small price movements in the underlying asset. It profits from other Greeks (gamma, theta, vega) rather than directional movement.</p></div>
          <div><h4 className="font-semibold mb-2">How do I calculate total portfolio delta?</h4><p className="text-muted-foreground">Total Delta = Sum of (Option Delta × Contracts × Contract Size) for all options + Existing Underlying Position. Positive delta means long exposure, negative delta means short exposure.</p></div>
          <div><h4 className="font-semibold mb-2">How do I hedge to achieve delta neutrality?</h4><p className="text-muted-foreground">To achieve delta neutrality, buy or sell underlying shares equal to -Total Delta. If total delta is +500, sell 500 shares. If total delta is -300, buy 300 shares.</p></div>
          <div><h4 className="font-semibold mb-2">Do I need to rebalance delta-neutral positions?</h4><p className="text-muted-foreground">Yes. Delta changes as underlying price moves (gamma effect). Rebalance regularly (daily or when delta exceeds a threshold) to maintain delta neutrality, especially for large price movements.</p></div>
          <div><h4 className="font-semibold mb-2">What are the benefits of delta-neutral strategies?</h4><p className="text-muted-foreground">Delta-neutral strategies eliminate directional risk, allowing traders to profit from volatility (vega), time decay (theta), or price acceleration (gamma) without exposure to underlying price movement.</p></div>
          <div><h4 className="font-semibold mb-2">What are the risks of delta-neutral strategies?</h4><p className="text-muted-foreground">Risks include gamma risk (delta changes with price), theta decay (time decay), vega risk (volatility changes), and basis risk (options vs underlying divergence).</p></div>
          <div><h4 className="font-semibold mb-2">Can I use futures instead of stocks for hedging?</h4><p className="text-muted-foreground">Yes. Use futures contracts with appropriate hedge ratio. Futures delta is typically 1.0 per contract (adjusted for contract size), making them effective for delta hedging.</p></div>
          <div><h4 className="font-semibold mb-2">What is gamma and how does it affect delta neutrality?</h4><p className="text-muted-foreground">Gamma measures the rate of change of delta with respect to underlying price. High gamma means delta changes quickly, requiring frequent rebalancing to maintain delta neutrality.</p></div>
          <div><h4 className="font-semibold mb-2">When should I use delta-neutral strategies?</h4><p className="text-muted-foreground">Use delta-neutral strategies when you want to profit from volatility, time decay, or other Greeks without directional exposure. Common in market-making, volatility trading, and hedging strategies.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

