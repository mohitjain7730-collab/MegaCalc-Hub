'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Info, Gauge } from 'lucide-react';

const formSchema = z.object({
  accountSize: z.number().min(0).optional(),
  riskPercent: z.number().min(0).max(100).optional(),
  atr: z.number().min(0).optional(),
  atrMultiplier: z.number().min(0).optional(),
  sharePrice: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ATRBasedPositionSizeCalculator() {
  const [result, setResult] = useState<{
    positionSize: number;
    shares: number;
    riskAmount: number;
    stopLossDistance: number;
    stopLossPrice: number;
    interpretation: string;
  } | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountSize: undefined as unknown as number,
      riskPercent: undefined as unknown as number,
      atr: undefined as unknown as number,
      atrMultiplier: undefined as unknown as number,
      sharePrice: undefined as unknown as number,
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
                if (name === 'riskPercent') max = 100;
                field.onChange(Number.isFinite(n as any) && n !== null && n >= 0 && (max === undefined || n <= max) ? n : undefined);
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
    if (v.accountSize == null || v.riskPercent == null || v.atr == null || v.sharePrice == null ||
        v.accountSize <= 0 || v.riskPercent <= 0 || v.atr <= 0 || v.sharePrice <= 0) {
      setResult(null);
      return;
    }
    const multiplier = v.atrMultiplier ?? 2;
    const riskAmount = (v.riskPercent / 100) * v.accountSize;
    const stopLossDistance = multiplier * v.atr;
    const stopLossPrice = v.sharePrice - stopLossDistance;
    const shares = Math.floor(riskAmount / stopLossDistance);
    const positionSize = shares * v.sharePrice;
    const interpretation = `Position size: $${positionSize.toFixed(2)} (${shares} shares at $${v.sharePrice.toFixed(2)}). Risk amount: $${riskAmount.toFixed(2)} (${v.riskPercent.toFixed(2)}% of account). Stop loss distance: $${stopLossDistance.toFixed(2)} (${multiplier}x ATR). Stop loss price: $${stopLossPrice.toFixed(2)}. This position sizing method adjusts position size based on volatility (ATR), ensuring consistent risk across different assets.`;
    setResult({ positionSize, shares, riskAmount, stopLossDistance, stopLossPrice, interpretation });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Gauge className="h-5 w-5"/> ATR-based Position Size Calculator</CardTitle>
          <CardDescription>Calculate position size based on Average True Range (ATR) to set stop losses and manage risk relative to volatility.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {numInput('accountSize', 'Account Size ($)', 'e.g., 100000', '$')}
              {numInput('riskPercent', 'Risk Per Trade (%)', 'e.g., 2', '%')}
              {numInput('sharePrice', 'Share Price ($)', 'e.g., 50.00', '$')}
              {numInput('atr', 'ATR (Average True Range) ($)', 'e.g., 1.50', '$')}
              {numInput('atrMultiplier', 'ATR Multiplier (optional, default: 2)', 'e.g., 2')}
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>ATR-based position sizing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div><div className="text-sm text-muted-foreground">Position Size</div><div className="text-2xl font-semibold">${result.positionSize.toFixed(2)}</div></div>
              <div><div className="text-sm text-muted-foreground">Shares</div><div className="text-xl font-medium">{result.shares}</div></div>
              <div><div className="text-sm text-muted-foreground">Risk Amount</div><div className="text-xl font-medium">${result.riskAmount.toFixed(2)}</div></div>
              <div><div className="text-sm text-muted-foreground">Stop Loss Distance</div><div className="text-lg font-medium">${result.stopLossDistance.toFixed(2)}</div></div>
              <div><div className="text-sm text-muted-foreground">Stop Loss Price</div><div className="text-lg font-medium text-red-600">${result.stopLossPrice.toFixed(2)}</div></div>
            </div>
            <p className="text-sm leading-6">{result.interpretation}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Related Calculators</CardTitle>
          <CardDescription>Position sizing and risk management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/position-sizing-calculator" className="text-primary hover:underline">Position Sizing</a></h4><p className="text-sm text-muted-foreground">Risk-based sizing.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/stop-loss-take-profit-calculator" className="text-primary hover:underline">Stop Loss / Take Profit</a></h4><p className="text-sm text-muted-foreground">Trade management.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/volatility-target-position-size-calculator" className="text-primary hover:underline">Volatility Target Position Size</a></h4><p className="text-sm text-muted-foreground">Volatility-based sizing.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/kelly-criterion-calculator" className="text-primary hover:underline">Kelly Criterion</a></h4><p className="text-sm text-muted-foreground">Optimal betting size.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Using ATR for volatility-based position sizing</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>ATR (Average True Range) measures volatility by averaging true range over a period (typically 14 days). Higher ATR indicates higher volatility.</li>
            <li>ATR-based position sizing adjusts position size based on volatility, ensuring consistent risk across different assets regardless of their volatility levels.</li>
            <li>Stop loss distance = ATR × Multiplier (typically 2x ATR). This sets stop loss based on volatility rather than fixed dollar amounts or percentages.</li>
            <li>Position size = Risk Amount / Stop Loss Distance. Higher volatility (ATR) results in smaller positions to maintain consistent risk.</li>
            <li>ATR multiplier typically ranges from 1.5 to 3.0. Lower multipliers (tighter stops) require smaller positions, while higher multipliers allow larger positions.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>ATR, volatility-based position sizing, and risk management</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is ATR?</h4><p className="text-muted-foreground">ATR (Average True Range) is a volatility indicator that measures the average price range over a period (typically 14 days). It helps assess market volatility and set stop losses based on volatility rather than fixed amounts.</p></div>
          <div><h4 className="font-semibold mb-2">How is ATR calculated?</h4><p className="text-muted-foreground">ATR = Average of True Range over N periods (typically 14). True Range = Maximum of (High - Low, |High - Previous Close|, |Low - Previous Close|).</p></div>
          <div><h4 className="font-semibold mb-2">Why use ATR for position sizing?</h4><p className="text-muted-foreground">ATR-based position sizing adjusts position size based on volatility, ensuring consistent risk across different assets. A high-volatility stock gets a smaller position than a low-volatility stock for the same risk amount.</p></div>
          <div><h4 className="font-semibold mb-2">What is a good ATR multiplier?</h4><p className="text-muted-foreground">ATR multiplier typically ranges from 1.5 to 3.0. Lower multipliers (tighter stops) require smaller positions but may be hit by noise. Higher multipliers allow larger positions but increase risk per trade.</p></div>
          <div><h4 className="font-semibold mb-2">How do I find ATR for a stock?</h4><p className="text-muted-foreground">ATR is available on most charting platforms (TradingView, ThinkOrSwim, etc.). Calculate it manually using historical price data, or use the ATR indicator with a 14-period setting.</p></div>
          <div><h4 className="font-semibold mb-2">Does ATR work for all timeframes?</h4><p className="text-muted-foreground">Yes. ATR adapts to different timeframes. Use daily ATR for swing trades, hourly ATR for day trades. Ensure the ATR period matches your trading timeframe.</p></div>
          <div><h4 className="font-semibold mb-2">How often should I recalculate ATR-based positions?</h4><p className="text-muted-foreground">Recalculate when ATR changes significantly (e.g., after major news or volatility spikes), when entering new positions, or periodically (weekly/monthly) to adjust for changing volatility.</p></div>
          <div><h4 className="font-semibold mb-2">Can I use ATR for options or futures?</h4><p className="text-muted-foreground">Yes, but adjust for contract size. For options, use ATR of the underlying asset and adjust for delta. For futures, use ATR of the futures contract and adjust for contract multiplier.</p></div>
          <div><h4 className="font-semibold mb-2">What if ATR is very high?</h4><p className="text-muted-foreground">High ATR indicates high volatility, resulting in smaller positions for the same risk. Consider waiting for lower volatility, using wider stops (higher multiplier), or reducing risk percentage per trade.</p></div>
          <div><h4 className="font-semibold mb-2">How does ATR compare to fixed percentage stops?</h4><p className="text-muted-foreground">ATR-based stops adapt to volatility, while fixed percentage stops don't. ATR stops are wider in volatile markets and tighter in calm markets, providing more consistent risk management across different market conditions.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

