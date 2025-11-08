'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Info, Target } from 'lucide-react';

const formSchema = z.object({
  portfolioValue: z.number().min(0).optional(),
  accountRiskPercent: z.number().min(0).max(100).optional(),
  entryPrice: z.number().min(0).optional(),
  stopLossPrice: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PositionSizingCalculator() {
  const [result, setResult] = useState<{
    positionSize: number;
    positionValue: number;
    shares: number;
    riskAmount: number;
    interpretation: string;
  } | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      portfolioValue: undefined as unknown as number,
      accountRiskPercent: undefined as unknown as number,
      entryPrice: undefined as unknown as number,
      stopLossPrice: undefined as unknown as number,
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
                const max = name === 'accountRiskPercent' ? 100 : undefined;
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
    if (v.portfolioValue == null || v.accountRiskPercent == null || v.entryPrice == null || v.stopLossPrice == null ||
        v.entryPrice <= 0 || v.stopLossPrice <= 0 || v.entryPrice === v.stopLossPrice) {
      setResult(null);
      return;
    }
    const riskAmount = v.portfolioValue * (v.accountRiskPercent / 100);
    const priceRisk = Math.abs(v.entryPrice - v.stopLossPrice);
    const riskPercent = priceRisk / v.entryPrice;
    if (riskPercent === 0) {
      setResult(null);
      return;
    }
    const positionValue = riskAmount / riskPercent;
    const shares = Math.floor(positionValue / v.entryPrice);
    const actualPositionValue = shares * v.entryPrice;
    const interpretation = `For ${v.accountRiskPercent}% account risk ($${riskAmount.toFixed(2)}), optimal position size is $${actualPositionValue.toFixed(2)} (${shares} shares) at $${v.entryPrice.toFixed(2)} with stop loss at $${v.stopLossPrice.toFixed(2)}. This limits loss to $${riskAmount.toFixed(2)} if stop loss is hit.`;
    setResult({ positionSize: actualPositionValue, positionValue: actualPositionValue, shares, riskAmount, interpretation });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5"/> Position Sizing Calculator</CardTitle>
          <CardDescription>Calculate optimal position sizes based on portfolio value, risk tolerance, stop loss, and account risk percentage.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {numInput('portfolioValue', 'Portfolio Value', 'e.g., 100000', '$')}
              {numInput('accountRiskPercent', 'Account Risk (%)', 'e.g., 2', '%')}
              {numInput('entryPrice', 'Entry Price', 'e.g., 50.00', '$')}
              {numInput('stopLossPrice', 'Stop Loss Price', 'e.g., 48.00', '$')}
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Optimal position sizing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><div className="text-sm text-muted-foreground">Position Size</div><div className="text-xl font-semibold">${result.positionSize.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
              <div><div className="text-sm text-muted-foreground">Shares</div><div className="text-xl font-semibold">{result.shares}</div></div>
              <div><div className="text-sm text-muted-foreground">Risk Amount</div><div className="text-xl font-semibold text-red-600">${result.riskAmount.toFixed(2)}</div></div>
              <div><div className="text-sm text-muted-foreground">Risk % of Portfolio</div><div className="text-xl font-semibold">{form.getValues('accountRiskPercent')?.toFixed(1)}%</div></div>
            </div>
            <p className="text-sm leading-6">{result.interpretation}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Related Calculators</CardTitle>
          <CardDescription>Risk management and trading</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/risk-reward-ratio-calculator" className="text-primary hover:underline">Risk/Reward Ratio</a></h4><p className="text-sm text-muted-foreground">Trade evaluation.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/kelly-criterion-calculator" className="text-primary hover:underline">Kelly Criterion</a></h4><p className="text-sm text-muted-foreground">Optimal betting size.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/expected-shortfall-calculator" className="text-primary hover:underline">Expected Shortfall</a></h4><p className="text-sm text-muted-foreground">Tail risk assessment.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/value-at-risk-calculator" className="text-primary hover:underline">Value at Risk</a></h4><p className="text-sm text-muted-foreground">Risk threshold.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Using risk-based position sizing to manage portfolio risk</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Position size = Account Risk Amount / Price Risk Percentage. This ensures losses are limited to your risk tolerance if stop loss is hit.</li>
            <li>Account risk percentage (typically 1-2% per trade) determines how much of your portfolio you're willing to risk on a single position.</li>
            <li>Price risk = |Entry Price - Stop Loss Price| / Entry Price. Tighter stop losses require smaller positions to limit risk.</li>
            <li>Always use stop losses when position sizing. Position size should be inversely related to price risk—wider stops allow larger positions.</li>
            <li>Consider correlation when sizing multiple positions. If positions are correlated, total risk exceeds the sum of individual position risks.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Position sizing, risk management, and stop loss placement</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is position sizing?</h4><p className="text-muted-foreground">Position sizing determines how much capital to allocate to a trade based on risk tolerance, stop loss placement, and portfolio value to limit potential losses.</p></div>
          <div><h4 className="font-semibold mb-2">Why is position sizing important?</h4><p className="text-muted-foreground">Proper position sizing limits losses per trade, prevents over-concentration, and helps preserve capital during drawdowns. It's a key risk management tool.</p></div>
          <div><h4 className="font-semibold mb-2">What is account risk percentage?</h4><p className="text-muted-foreground">Account risk percentage is the maximum percentage of portfolio value you're willing to risk on a single trade if the stop loss is hit. Common values are 1-2% per trade.</p></div>
          <div><h4 className="font-semibold mb-2">How do I set a stop loss?</h4><p className="text-muted-foreground">Place stop loss below support levels (long) or above resistance (short), considering volatility. Stop loss should reflect your risk tolerance and trade setup, not arbitrary levels.</p></div>
          <div><h4 className="font-semibold mb-2">What if my calculated position is too large?</h4><p className="text-muted-foreground">If position size exceeds your comfort level or portfolio constraints, either tighten the stop loss (increase price risk), reduce account risk percentage, or skip the trade.</p></div>
          <div><h4 className="font-semibold mb-2">Should I risk the same amount on every trade?</h4><p className="text-muted-foreground">Consistent risk per trade (e.g., 1-2%) is a good default. Some traders adjust risk based on trade quality or market conditions, but consistency helps manage overall portfolio risk.</p></div>
          <div><h4 className="font-semibold mb-2">How does volatility affect position sizing?</h4><p className="text-muted-foreground">Higher volatility requires wider stop losses or smaller positions to limit risk. Consider using ATR (Average True Range) or volatility-based stop loss placement.</p></div>
          <div><h4 className="font-semibold mb-2">What about position sizing for options?</h4><p className="text-muted-foreground">For options, consider delta-adjusted position sizing and account for different risk profiles. Option positions can have asymmetric risk/reward compared to stocks.</p></div>
          <div><h4 className="font-semibold mb-2">How do I account for correlation?</h4><p className="text-muted-foreground">If positions are correlated, total portfolio risk exceeds the sum of individual risks. Reduce position sizes or limit the number of correlated positions to manage overall exposure.</p></div>
          <div><h4 className="font-semibold mb-2">Should I recalculate position size after entry?</h4><p className="text-muted-foreground">If you move stop loss (trailing stop) or price moves significantly, recalculate position size to maintain constant risk. Alternatively, adjust position size as price moves to maintain risk percentage.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


