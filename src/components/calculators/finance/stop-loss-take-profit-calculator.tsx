'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Info, Target } from 'lucide-react';

const formSchema = z.object({
  entryPrice: z.number().min(0).optional(),
  positionSize: z.number().min(0).optional(),
  riskAmount: z.number().min(0).optional(),
  riskRewardRatio: z.number().min(0).optional(),
  tradeDirection: z.enum(['long', 'short']),
});

type FormValues = z.infer<typeof formSchema>;

export default function StopLossTakeProfitCalculator() {
  const [result, setResult] = useState<{
    stopLoss: number;
    takeProfit: number;
    riskPercent: number;
    rewardPercent: number;
    interpretation: string;
  } | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entryPrice: undefined as unknown as number,
      positionSize: undefined as unknown as number,
      riskAmount: undefined as unknown as number,
      riskRewardRatio: undefined as unknown as number,
      tradeDirection: 'long',
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
    if (v.entryPrice == null || v.positionSize == null || v.riskAmount == null || v.riskRewardRatio == null ||
        v.entryPrice <= 0 || v.positionSize <= 0 || v.riskAmount <= 0 || v.riskRewardRatio <= 0) {
      setResult(null);
      return;
    }
    const riskPercent = (v.riskAmount / v.positionSize) * 100;
    const priceRisk = v.riskAmount / (v.positionSize / v.entryPrice);
    const isLong = v.tradeDirection === 'long';
    const stopLoss = isLong ? v.entryPrice - priceRisk : v.entryPrice + priceRisk;
    const rewardAmount = v.riskAmount * v.riskRewardRatio;
    const priceReward = rewardAmount / (v.positionSize / v.entryPrice);
    const takeProfit = isLong ? v.entryPrice + priceReward : v.entryPrice - priceReward;
    const rewardPercent = (rewardAmount / v.positionSize) * 100;
    const interpretation = `Stop Loss: $${stopLoss.toFixed(2)} (${(Math.abs(stopLoss - v.entryPrice) / v.entryPrice * 100).toFixed(2)}% from entry). Take Profit: $${takeProfit.toFixed(2)} (${(Math.abs(takeProfit - v.entryPrice) / v.entryPrice * 100).toFixed(2)}% from entry). Risk: ${riskPercent.toFixed(2)}% of position. Reward: ${rewardPercent.toFixed(2)}% of position. Risk/Reward: ${v.riskRewardRatio.toFixed(2)}:1.`;
    setResult({ stopLoss, takeProfit, riskPercent, rewardPercent, interpretation });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5"/> Stop Loss / Take Profit Calculator</CardTitle>
          <CardDescription>Calculate stop loss and take profit levels from entry price, risk amount, and risk/reward ratio for trade management.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {numInput('entryPrice', 'Entry Price', 'e.g., 50.00', '$')}
                <FormField control={form.control} name="tradeDirection" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trade Direction</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="long">Long</SelectItem>
                          <SelectItem value="short">Short</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )} />
              </div>
              {numInput('positionSize', 'Position Size ($)', 'e.g., 10000', '$')}
              {numInput('riskAmount', 'Risk Amount ($)', 'e.g., 200', '$')}
              {numInput('riskRewardRatio', 'Risk/Reward Ratio', 'e.g., 2.0')}
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Stop loss and take profit levels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><div className="text-sm text-muted-foreground">Stop Loss</div><div className="text-xl font-semibold text-red-600">${result.stopLoss.toFixed(2)}</div></div>
              <div><div className="text-sm text-muted-foreground">Take Profit</div><div className="text-xl font-semibold text-green-600">${result.takeProfit.toFixed(2)}</div></div>
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
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/risk-reward-ratio-calculator" className="text-primary hover:underline">Risk/Reward Ratio</a></h4><p className="text-sm text-muted-foreground">Trade evaluation.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/position-sizing-calculator" className="text-primary hover:underline">Position Sizing</a></h4><p className="text-sm text-muted-foreground">Risk-based sizing.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/kelly-criterion-calculator" className="text-primary hover:underline">Kelly Criterion</a></h4><p className="text-sm text-muted-foreground">Optimal betting size.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/maximum-drawdown-calculator" className="text-primary hover:underline">Maximum Drawdown</a></h4><p className="text-sm text-muted-foreground">Peak-to-trough decline.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Setting stop loss and take profit levels for trade management</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Stop loss limits potential losses by automatically exiting if price moves against you. Set based on support/resistance levels or volatility (ATR).</li>
            <li>Take profit locks in gains by exiting when price reaches your target. Set based on resistance levels, Fibonacci extensions, or risk/reward targets.</li>
            <li>Risk amount is the maximum loss you're willing to accept if stop loss is hit. Position size should be calculated to limit risk to this amount.</li>
            <li>Risk/reward ratio compares potential profit to potential loss. Ratios ≥2:1 are generally favorable. Higher ratios allow lower win rates.</li>
            <li>For long positions, stop loss below entry, take profit above. For short positions, stop loss above entry, take profit below.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Stop loss, take profit, and trade management</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is a stop loss?</h4><p className="text-muted-foreground">A stop loss is an order to automatically exit a position at a predetermined price to limit losses if the trade moves against you.</p></div>
          <div><h4 className="font-semibold mb-2">How do I set a stop loss?</h4><p className="text-muted-foreground">Set stop loss below support levels (long) or above resistance (short), considering volatility (ATR), and ensuring it aligns with your risk tolerance.</p></div>
          <div><h4 className="font-semibold mb-2">What is a take profit?</h4><p className="text-muted-foreground">A take profit is an order to automatically exit a position at a target price to lock in gains when the trade reaches your profit target.</p></div>
          <div><h4 className="font-semibold mb-2">How do I set take profit levels?</h4><p className="text-muted-foreground">Set take profit based on technical levels (resistance, Fibonacci extensions), fundamental targets, or risk/reward ratios (e.g., 2:1 or 3:1).</p></div>
          <div><h4 className="font-semibold mb-2">Should I always use stop loss and take profit?</h4><p className="text-muted-foreground">Yes, for most trades. Stop loss limits losses, and take profit locks in gains. Exceptions may include swing trades or when using trailing stops.</p></div>
          <div><h4 className="font-semibold mb-2">What is a trailing stop loss?</h4><p className="text-muted-foreground">A trailing stop loss moves with favorable price movement, locking in profits while allowing for further upside. It adjusts automatically as price moves in your favor.</p></div>
          <div><h4 className="font-semibold mb-2">How tight should my stop loss be?</h4><p className="text-muted-foreground">Stop loss should be tight enough to limit risk but wide enough to avoid being hit by normal market noise. Consider volatility (ATR) and support/resistance levels.</p></div>
          <div><h4 className="font-semibold mb-2">Can I adjust stop loss after entry?</h4><p className="text-muted-foreground">Yes. Move stop loss to breakeven after price moves favorably, or use trailing stops. Avoid widening stop loss, which increases risk.</p></div>
          <div><h4 className="font-semibold mb-2">What if my stop loss is hit too often?</h4><p className="text-muted-foreground">If stop loss is hit frequently, either widen it (if too tight), improve entry timing, or reconsider the trade setup. Frequent stops may indicate poor entry or setup quality.</p></div>
          <div><h4 className="font-semibold mb-2">Should I take partial profits?</h4><p className="text-muted-foreground">Taking partial profits (e.g., 50% at 2:1, 50% at 3:1) can improve overall risk/reward while securing some gains. Useful for managing risk and reducing emotional stress.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}
