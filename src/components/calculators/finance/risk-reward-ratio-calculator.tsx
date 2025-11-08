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
  entryPrice: z.number().min(0).optional(),
  stopLossPrice: z.number().min(0).optional(),
  targetPrice: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function RiskRewardRatioCalculator() {
  const [result, setResult] = useState<{
    risk: number;
    reward: number;
    ratio: number;
    riskPercent: number;
    rewardPercent: number;
    interpretation: string;
  } | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entryPrice: undefined as unknown as number,
      stopLossPrice: undefined as unknown as number,
      targetPrice: undefined as unknown as number,
    }
  });

  const numInput = (name: keyof FormValues, label: string, placeholder: string) => (
    <FormField control={form.control} name={name} render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
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
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
  );

  const onSubmit = (v: FormValues) => {
    if (v.entryPrice == null || v.stopLossPrice == null || v.targetPrice == null ||
        v.entryPrice <= 0 || v.stopLossPrice <= 0 || v.targetPrice <= 0) {
      setResult(null);
      return;
    }
    const risk = Math.abs(v.entryPrice - v.stopLossPrice);
    const reward = Math.abs(v.targetPrice - v.entryPrice);
    if (risk === 0) {
      setResult(null);
      return;
    }
    const ratio = reward / risk;
    const riskPercent = (risk / v.entryPrice) * 100;
    const rewardPercent = (reward / v.entryPrice) * 100;
    let assessment = '';
    if (ratio >= 3) assessment = 'Excellent risk/reward. High probability trades are not required for profitability.';
    else if (ratio >= 2) assessment = 'Good risk/reward. Favorable for systematic trading if win rate is reasonable.';
    else if (ratio >= 1) assessment = 'Acceptable risk/reward. Requires higher win rate or careful trade selection.';
    else assessment = 'Poor risk/reward. Consider adjusting target or stop loss, or skipping the trade.';
    const interpretation = `Risk: $${risk.toFixed(2)} (${riskPercent.toFixed(2)}%). Reward: $${reward.toFixed(2)} (${rewardPercent.toFixed(2)}%). Risk/Reward Ratio: ${ratio.toFixed(2)}:1. ${assessment}`;
    setResult({ risk, reward, ratio, riskPercent, rewardPercent, interpretation });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5"/> Risk/Reward Ratio Calculator</CardTitle>
          <CardDescription>Calculate risk/reward ratio from entry price, stop loss, and target price to assess trade attractiveness.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {numInput('entryPrice', 'Entry Price', 'e.g., 50.00')}
              {numInput('stopLossPrice', 'Stop Loss Price', 'e.g., 48.00')}
              {numInput('targetPrice', 'Target Price', 'e.g., 55.00')}
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Risk/reward analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div><div className="text-sm text-muted-foreground">Risk</div><div className="text-xl font-semibold text-red-600">${result.risk.toFixed(2)}</div></div>
              <div><div className="text-sm text-muted-foreground">Reward</div><div className="text-xl font-semibold text-green-600">${result.reward.toFixed(2)}</div></div>
              <div><div className="text-sm text-muted-foreground">Ratio</div><div className="text-2xl font-bold">{result.ratio.toFixed(2)}:1</div></div>
              <div><div className="text-sm text-muted-foreground">Risk %</div><div className="text-lg font-medium">{result.riskPercent.toFixed(2)}%</div></div>
              <div><div className="text-sm text-muted-foreground">Reward %</div><div className="text-lg font-medium">{result.rewardPercent.toFixed(2)}%</div></div>
            </div>
            <p className="text-sm leading-6">{result.interpretation}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Related Calculators</CardTitle>
          <CardDescription>Trading and risk management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/position-sizing-calculator" className="text-primary hover:underline">Position Sizing</a></h4><p className="text-sm text-muted-foreground">Risk-based sizing.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/kelly-criterion-calculator" className="text-primary hover:underline">Kelly Criterion</a></h4><p className="text-sm text-muted-foreground">Optimal betting size.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/expected-shortfall-calculator" className="text-primary hover:underline">Expected Shortfall</a></h4><p className="text-sm text-muted-foreground">Tail risk assessment.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/value-at-risk-calculator" className="text-primary hover:underline">Value at Risk</a></h4><p className="text-sm text-muted-foreground">Risk threshold.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Evaluating trades using risk/reward ratio</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Risk/Reward Ratio = Potential Reward / Potential Risk. Higher ratios (e.g., 2:1 or 3:1) are generally more attractive.</li>
            <li>Risk = |Entry Price - Stop Loss Price|. Reward = |Target Price - Entry Price|. Calculate based on trade direction (long/short).</li>
            <li>A ratio ≥2:1 is generally favorable for systematic trading. Ratios &lt;1:1 require very high win rates to be profitable.</li>
            <li>Set realistic targets based on technical levels (resistance/support) or fundamental analysis, not arbitrary price points.</li>
            <li>Consider win rate alongside risk/reward. A 2:1 ratio with 40% win rate can be profitable, while 1:1 ratio requires &gt;50% win rate.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Risk/reward ratio, trade evaluation, and profit targets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is risk/reward ratio?</h4><p className="text-muted-foreground">Risk/reward ratio compares potential profit (reward) to potential loss (risk) for a trade, helping evaluate trade attractiveness and set profit targets.</p></div>
          <div><h4 className="font-semibold mb-2">How is risk/reward ratio calculated?</h4><p className="text-muted-foreground">Ratio = |Target Price - Entry Price| / |Entry Price - Stop Loss Price|. For long positions, target &gt; entry and stop &lt; entry. For short, reverse.</p></div>
          <div><h4 className="font-semibold mb-2">What is a good risk/reward ratio?</h4><p className="text-muted-foreground">Ratios ≥2:1 are generally favorable. Ratios ≥3:1 are excellent. Ratios &lt;1:1 require very high win rates and are generally unfavorable.</p></div>
          <div><h4 className="font-semibold mb-2">Does a higher ratio always mean a better trade?</h4><p className="text-muted-foreground">Not necessarily. Consider win probability, trade setup quality, and market conditions. A 3:1 ratio with 20% win rate may be worse than 2:1 with 50% win rate.</p></div>
          <div><h4 className="font-semibold mb-2">How do I set realistic profit targets?</h4><p className="text-muted-foreground">Base targets on technical levels (resistance, Fibonacci extensions), fundamental targets, or statistical measures (ATR multiples). Avoid arbitrary price points.</p></div>
          <div><h4 className="font-semibold mb-2">What if my ratio is less than 1:1?</h4><p className="text-muted-foreground">Consider adjusting target (higher for long), tightening stop loss, or skipping the trade. Ratios &lt;1:1 require very high win rates to be profitable long-term.</p></div>
          <div><h4 className="font-semibold mb-2">How does win rate relate to risk/reward?</h4><p className="text-muted-foreground">Breakeven win rate = 1 / (1 + Risk/Reward Ratio). For 2:1 ratio, you need 33% win rate to break even. Higher ratios allow lower win rates.</p></div>
          <div><h4 className="font-semibold mb-2">Should I use the same ratio for all trades?</h4><p className="text-muted-foreground">Not necessarily. Adjust based on trade setup, market conditions, and volatility. Some strategies work better with different ratios, but consistency helps manage expectations.</p></div>
          <div><h4 className="font-semibold mb-2">What about partial profits?</h4><p className="text-muted-foreground">You can take partial profits at different targets (e.g., 50% at 2:1, 50% at 3:1), improving overall risk/reward while securing some gains.</p></div>
          <div><h4 className="font-semibold mb-2">How do I improve risk/reward ratio?</h4><p className="text-muted-foreground">Improve entry timing (better entries), set tighter stops (based on support/resistance), or set more ambitious targets (based on technical or fundamental analysis).</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

