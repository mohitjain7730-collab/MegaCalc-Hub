'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Info, Zap } from 'lucide-react';

const formSchema = z.object({
  winProbability: z.number().min(0).max(100).optional(),
  averageWin: z.number().min(0).optional(),
  averageLoss: z.number().min(0).optional(),
  portfolioValue: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function KellyCriterionCalculator() {
  const [result, setResult] = useState<{
    kellyPercent: number;
    fractionalKelly: number;
    positionSize: number;
    interpretation: string;
    recommendation: string;
  } | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      winProbability: undefined as unknown as number,
      averageWin: undefined as unknown as number,
      averageLoss: undefined as unknown as number,
      portfolioValue: undefined as unknown as number,
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
                const max = name === 'winProbability' ? 100 : undefined;
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
    if (v.winProbability == null || v.averageWin == null || v.averageLoss == null ||
        v.averageLoss === 0 || v.winProbability < 0 || v.winProbability > 100) {
      setResult(null);
      return;
    }
    const p = v.winProbability / 100;
    const q = 1 - p;
    const b = v.averageWin / v.averageLoss; // win/loss ratio
    const kelly = (p * b - q) / b;
    if (kelly <= 0 || !Number.isFinite(kelly)) {
      setResult(null);
      return;
    }
    const kellyPercent = Math.min(100, Math.max(0, kelly * 100));
    const fractionalKelly = kellyPercent * 0.5; // Half-Kelly is common
    const portfolioVal = v.portfolioValue || 100000;
    const positionSize = (kellyPercent / 100) * portfolioVal;
    let recommendation = '';
    if (kellyPercent > 25) recommendation = 'Full Kelly is very aggressive. Consider fractional Kelly (25-50% of full) to reduce volatility while maintaining most of the growth benefit.';
    else if (kellyPercent > 10) recommendation = 'Full Kelly is aggressive. Consider fractional Kelly (50% of full) for more conservative position sizing.';
    else if (kellyPercent > 5) recommendation = 'Full Kelly is moderate. Consider fractional Kelly for risk management, especially if win probability or win/loss ratio estimates are uncertain.';
    else recommendation = 'Full Kelly is conservative. This suggests the edge is small or uncertain. Verify win probability and win/loss ratio estimates.';
    const interpretation = `Kelly Criterion suggests allocating ${kellyPercent.toFixed(2)}% of portfolio ($${positionSize.toFixed(2)}). Full Kelly maximizes long-term growth but can be volatile. ${recommendation}`;
    setResult({ kellyPercent, fractionalKelly, positionSize, interpretation, recommendation });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5"/> Kelly Criterion Calculator</CardTitle>
          <CardDescription>Calculate optimal position size using the Kelly Criterion based on win probability and average win/loss ratio.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {numInput('winProbability', 'Win Probability', 'e.g., 55', '%')}
              {numInput('averageWin', 'Average Win ($ or %)', 'e.g., 100')}
              {numInput('averageLoss', 'Average Loss ($ or %)', 'e.g., 50')}
              {numInput('portfolioValue', 'Portfolio Value ($, optional)', 'e.g., 100000', '$')}
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Optimal position size using Kelly Criterion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><div className="text-sm text-muted-foreground">Full Kelly %</div><div className="text-2xl font-semibold">{result.kellyPercent.toFixed(2)}%</div></div>
              <div><div className="text-sm text-muted-foreground">Half-Kelly %</div><div className="text-xl font-medium">{result.fractionalKelly.toFixed(2)}%</div></div>
              {form.getValues('portfolioValue') && (
                <>
                  <div><div className="text-sm text-muted-foreground">Position Size</div><div className="text-xl font-semibold">${result.positionSize.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
                  <div><div className="text-sm text-muted-foreground">Half-Kelly Size</div><div className="text-xl font-medium">${(result.positionSize * 0.5).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
                </>
              )}
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
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/risk-reward-ratio-calculator" className="text-primary hover:underline">Risk/Reward Ratio</a></h4><p className="text-sm text-muted-foreground">Trade evaluation.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/expected-shortfall-calculator" className="text-primary hover:underline">Expected Shortfall</a></h4><p className="text-sm text-muted-foreground">Tail risk assessment.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/value-at-risk-calculator" className="text-primary hover:underline">Value at Risk</a></h4><p className="text-sm text-muted-foreground">Risk threshold.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Using the Kelly Criterion for optimal position sizing</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Kelly Criterion formula: f* = (p × b - q) / b, where p = win probability, q = loss probability, b = win/loss ratio.</li>
            <li>Kelly Criterion maximizes long-term portfolio growth but can be very volatile. Full Kelly assumes perfect knowledge of win probability and win/loss ratio.</li>
            <li>Use fractional Kelly (typically 25-50% of full Kelly) to reduce volatility while retaining most of the growth benefit. Half-Kelly is common.</li>
            <li>Win probability and win/loss ratio must be estimated accurately. Overestimating edge leads to over-sizing and increased risk of ruin.</li>
            <li>Kelly Criterion works best for repeated, independent bets with known edge. For single trades or uncertain edges, use more conservative sizing.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Kelly Criterion, optimal position sizing, and long-term growth</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is the Kelly Criterion?</h4><p className="text-muted-foreground">The Kelly Criterion is a formula that determines the optimal position size to maximize long-term portfolio growth, based on win probability and win/loss ratio.</p></div>
          <div><h4 className="font-semibold mb-2">How is Kelly Criterion calculated?</h4><p className="text-muted-foreground">f* = (p × b - q) / b, where p = win probability, q = 1 - p (loss probability), and b = average win / average loss (win/loss ratio).</p></div>
          <div><h4 className="font-semibold mb-2">Why use fractional Kelly instead of full Kelly?</h4><p className="text-muted-foreground">Full Kelly maximizes growth but creates high volatility and risk of large drawdowns. Fractional Kelly (25-50% of full) reduces volatility while retaining most growth benefits.</p></div>
          <div><h4 className="font-semibold mb-2">What if Kelly suggests a negative percentage?</h4><p className="text-muted-foreground">Negative Kelly means the strategy has negative expected value (no edge). Avoid the trade or revise your strategy. Kelly only works for positive expected value situations.</p></div>
          <div><h4 className="font-semibold mb-2">How accurate do win probability and win/loss ratio need to be?</h4><p className="text-muted-foreground">Very accurate. Small errors in estimates lead to large errors in position sizing. Use historical data, backtesting, or conservative estimates. When uncertain, use fractional Kelly or more conservative sizing.</p></div>
          <div><h4 className="font-semibold mb-2">Can I use Kelly for single trades?</h4><p className="text-muted-foreground">Kelly assumes repeated, independent bets. For single trades, Kelly may not apply directly. Use Kelly for strategies with many similar trades, or combine with other position sizing methods.</p></div>
          <div><h4 className="font-semibold mb-2">What is the risk of using full Kelly?</h4><p className="text-muted-foreground">Full Kelly can lead to large drawdowns, high volatility, and risk of ruin if estimates are wrong. It assumes perfect knowledge and can be psychologically difficult to follow during drawdowns.</p></div>
          <div><h4 className="font-semibold mb-2">How does Kelly compare to fixed position sizing?</h4><p className="text-muted-foreground">Kelly adjusts position size based on edge (win probability and win/loss ratio), while fixed sizing uses constant risk per trade. Kelly maximizes growth but requires accurate edge estimates.</p></div>
          <div><h4 className="font-semibold mb-2">Should I recalculate Kelly for each trade?</h4><p className="text-muted-foreground">If win probability or win/loss ratio changes significantly, recalculate. For consistent strategies, use average win probability and win/loss ratio across all trades.</p></div>
          <div><h4 className="font-semibold mb-2">What are limitations of Kelly Criterion?</h4><p className="text-muted-foreground">Kelly assumes known, constant edge; independent bets; and no transaction costs. Real trading has uncertainty, correlation, and costs. Use fractional Kelly and combine with other risk management methods.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


