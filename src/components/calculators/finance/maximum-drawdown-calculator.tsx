'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Info, TrendingDown } from 'lucide-react';

const formSchema = z.object({
  values: z.string().min(1, 'Enter portfolio values'),
});

type FormValues = z.infer<typeof formSchema>;

function parseValues(s: string): number[] | null {
  try {
    const parts = s.replace(/\n/g, ',').split(',').map(x => x.trim()).filter(Boolean);
    const arr = parts.map(p => {
      const v = parseFloat(p.replace(/[$,]/g, ''));
      if (!Number.isFinite(v) || v <= 0) throw new Error('bad');
      return v;
    });
    return arr.length >= 2 ? arr : null;
  } catch {
    return null;
  }
}

export default function MaximumDrawdownCalculator() {
  const [result, setResult] = useState<{
    maxDrawdown: number;
    maxDrawdownPercent: number;
    peakValue: number;
    troughValue: number;
    peakIndex: number;
    troughIndex: number;
    interpretation: string;
  } | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      values: '',
    }
  });

  const onSubmit = (v: FormValues) => {
    const parsed = parseValues(v.values);
    if (!parsed || parsed.length < 2) {
      setResult(null);
      return;
    }
    let peak = parsed[0];
    let maxDD = 0;
    let peakIdx = 0;
    let troughIdx = 0;
    let troughVal = parsed[0];
    for (let i = 1; i < parsed.length; i++) {
      if (parsed[i] > peak) {
        peak = parsed[i];
        peakIdx = i;
      }
      const dd = (peak - parsed[i]) / peak;
      if (dd > maxDD) {
        maxDD = dd;
        troughIdx = i;
        troughVal = parsed[i];
      }
    }
    const interpretation = `Maximum drawdown: ${(maxDD * 100).toFixed(2)}% (from $${peak.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} to $${troughVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}). This represents the largest peak-to-trough decline in portfolio value. Lower drawdowns indicate better downside protection.`;
    setResult({
      maxDrawdown: maxDD * 100,
      maxDrawdownPercent: maxDD * 100,
      peakValue: peak,
      troughValue: troughVal,
      peakIndex: peakIdx,
      troughIndex: troughIdx,
      interpretation
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingDown className="h-5 w-5"/> Maximum Drawdown Calculator</CardTitle>
          <CardDescription>Calculate maximum drawdown from portfolio value series to measure peak-to-trough decline and downside risk.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="values" render={({ field }) => (
                <FormItem>
                  <FormLabel>Portfolio Values (comma or newline separated)</FormLabel>
                  <FormControl>
                    <Textarea rows={8} placeholder="100000,105000,102000,98000,101000,95000,99000..." {...field} className="font-mono" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Maximum drawdown analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><div className="text-sm text-muted-foreground">Max Drawdown</div><div className="text-2xl font-semibold text-red-600">{result.maxDrawdown.toFixed(2)}%</div></div>
              <div><div className="text-sm text-muted-foreground">Peak Value</div><div className="text-lg font-medium">${result.peakValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
              <div><div className="text-sm text-muted-foreground">Trough Value</div><div className="text-lg font-medium">${result.troughValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
              <div><div className="text-sm text-muted-foreground">Drawdown Amount</div><div className="text-lg font-medium">${(result.peakValue - result.troughValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
            </div>
            <p className="text-sm leading-6">{result.interpretation}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Related Calculators</CardTitle>
          <CardDescription>Risk and performance analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/expected-shortfall-calculator" className="text-primary hover:underline">Expected Shortfall</a></h4><p className="text-sm text-muted-foreground">Tail risk assessment.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/portfolio-drawdown-calculator" className="text-primary hover:underline">Portfolio Drawdown</a></h4><p className="text-sm text-muted-foreground">Drawdown analysis.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/value-at-risk-calculator" className="text-primary hover:underline">Value at Risk</a></h4><p className="text-sm text-muted-foreground">Risk threshold.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/win-rate-expectancy-calculator" className="text-primary hover:underline">Win Rate & Expectancy</a></h4><p className="text-sm text-muted-foreground">Strategy performance.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Understanding maximum drawdown and downside risk</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Maximum drawdown (MDD) is the largest peak-to-trough decline in portfolio value over a period, measured as a percentage of the peak value.</li>
            <li>MDD = (Peak Value - Trough Value) / Peak Value. Lower MDD indicates better downside protection and risk management.</li>
            <li>MDD helps assess downside risk and psychological stress. Large drawdowns can lead to emotional decisions and strategy abandonment.</li>
            <li>Compare MDD across strategies or time periods. A strategy with lower MDD and similar returns may be preferable for risk-averse investors.</li>
            <li>MDD recovery time measures how long it takes to recover from the trough to the previous peak. Shorter recovery times indicate better resilience.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Maximum drawdown, downside risk, and portfolio analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is maximum drawdown?</h4><p className="text-muted-foreground">Maximum drawdown (MDD) is the largest peak-to-trough decline in portfolio value over a period, expressed as a percentage of the peak value.</p></div>
          <div><h4 className="font-semibold mb-2">How is maximum drawdown calculated?</h4><p className="text-muted-foreground">MDD = (Peak Value - Trough Value) / Peak Value. It measures the worst decline from a peak to the subsequent trough.</p></div>
          <div><h4 className="font-semibold mb-2">Why is maximum drawdown important?</h4><p className="text-muted-foreground">MDD helps assess downside risk, psychological stress, and risk management. Large drawdowns can lead to emotional decisions and strategy abandonment.</p></div>
          <div><h4 className="font-semibold mb-2">What is a good maximum drawdown?</h4><p className="text-muted-foreground">Lower is generally better. MDD depends on strategy and risk tolerance. Conservative strategies may target MDD &lt;10-15%, while aggressive strategies may tolerate higher MDD for higher returns.</p></div>
          <div><h4 className="font-semibold mb-2">How does maximum drawdown relate to volatility?</h4><p className="text-muted-foreground">Higher volatility often leads to larger drawdowns, but MDD focuses on worst-case decline rather than day-to-day volatility. MDD is a more intuitive measure of downside risk.</p></div>
          <div><h4 className="font-semibold mb-2">Can maximum drawdown be negative?</h4><p className="text-muted-foreground">No. MDD is always positive (or zero if no decline). It represents the percentage decline from peak to trough.</p></div>
          <div><h4 className="font-semibold mb-2">How do I reduce maximum drawdown?</h4><p className="text-muted-foreground">Reduce drawdown by diversifying, using stop losses, reducing position sizes, hedging, or using lower-volatility strategies. Risk management is key.</p></div>
          <div><h4 className="font-semibold mb-2">What is drawdown recovery time?</h4><p className="text-muted-foreground">Drawdown recovery time is how long it takes to recover from the trough to the previous peak. Shorter recovery times indicate better resilience and faster recovery.</p></div>
          <div><h4 className="font-semibold mb-2">Should I compare strategies by maximum drawdown?</h4><p className="text-muted-foreground">Yes, alongside returns and other metrics. Compare MDD across strategies with similar returns. A strategy with lower MDD may be preferable for risk-averse investors.</p></div>
          <div><h4 className="font-semibold mb-2">How often should I calculate maximum drawdown?</h4><p className="text-muted-foreground">Calculate regularly (daily, weekly, or monthly) to monitor downside risk. Update when portfolio composition changes or market conditions shift significantly.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}
