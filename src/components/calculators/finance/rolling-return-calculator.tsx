'use client';

import { useState, useMemo } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Info, TrendingUp } from 'lucide-react';

const formSchema = z.object({
  returns: z.string().min(1, 'Paste return series'),
  period: z.enum(['1', '3', '5', '10']),
  frequency: z.enum(['daily', 'monthly', 'annual']),
});

type FormValues = z.infer<typeof formSchema>;

function parseReturns(s: string): number[] | null {
  try {
    const parts = s.replace(/\n/g, ',').split(',').map(x => x.trim()).filter(Boolean);
    const arr = parts.map(p => {
      let v = parseFloat(p.replace('%', ''));
      if (!Number.isFinite(v)) throw new Error('bad');
      if (Math.abs(v) > 2) v = v / 100;
      return v;
    });
    return arr.length >= 2 ? arr : null;
  } catch {
    return null;
  }
}

function computeRollingReturns(returns: number[], windowPeriods: number, frequency: string): { startIdx: number; endIdx: number; returnPct: number }[] {
  const results: { startIdx: number; endIdx: number; returnPct: number }[] = [];
  if (returns.length < windowPeriods) return results;
  for (let i = 0; i <= returns.length - windowPeriods; i++) {
    const slice = returns.slice(i, i + windowPeriods);
    const compound = slice.reduce((acc, r) => acc * (1 + r), 1) - 1;
    results.push({ startIdx: i, endIdx: i + windowPeriods - 1, returnPct: compound * 100 });
  }
  return results;
}

export default function RollingReturnCalculator() {
  const [result, setResult] = useState<{
    rolling: { startIdx: number; endIdx: number; returnPct: number }[];
    stats: { mean: number; median: number; min: number; max: number; std: number };
    interpretation: string;
  } | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { returns: '', period: '1', frequency: 'monthly' }
  });

  const onSubmit = (v: FormValues) => {
    const parsed = parseReturns(v.returns);
    if (!parsed) { setResult(null); return; }
    const periodNum = parseInt(v.period);
    const periodsPerYear = v.frequency === 'daily' ? 252 : v.frequency === 'monthly' ? 12 : 1;
    const windowPeriods = periodNum * periodsPerYear;
    if (parsed.length < windowPeriods) { setResult(null); return; }
    const rolling = computeRollingReturns(parsed, windowPeriods, v.frequency);
    if (rolling.length === 0) { setResult(null); return; }
    const returns = rolling.map(r => r.returnPct);
    const mean = returns.reduce((s, x) => s + x, 0) / returns.length;
    const sorted = [...returns].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const min = Math.min(...returns);
    const max = Math.max(...returns);
    const varx = returns.reduce((s, x) => s + (x - mean) ** 2, 0) / returns.length;
    const std = Math.sqrt(varx);
    const interpretation = `${v.period}-year rolling returns show mean ${mean.toFixed(2)}%, median ${median.toFixed(2)}%, range [${min.toFixed(2)}%, ${max.toFixed(2)}%]. Standard deviation ${std.toFixed(2)}% indicates ${std < 5 ? 'low' : std < 15 ? 'moderate' : 'high'} volatility in period returns.`;
    setResult({ rolling, stats: { mean, median, min, max, std }, interpretation });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5"/> Rolling Return Calculator</CardTitle>
          <CardDescription>Compute rolling period returns (1-year, 3-year, 5-year, 10-year) from a time series to assess performance consistency.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="returns" render={({ field }) => (
                <FormItem>
                  <FormLabel>Return Series (comma or newline separated)</FormLabel>
                  <FormControl>
                    <Textarea rows={6} placeholder="0.8%,1.0%,−0.4%,0.3%,0.5%..." {...field} className="font-mono" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="period" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rolling Period (years)</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Year</SelectItem>
                          <SelectItem value="3">3 Years</SelectItem>
                          <SelectItem value="5">5 Years</SelectItem>
                          <SelectItem value="10">10 Years</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="frequency" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="annual">Annual</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Rolling return statistics and distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div><div className="text-sm text-muted-foreground">Mean</div><div className="text-2xl font-semibold">{result.stats.mean.toFixed(2)}%</div></div>
              <div><div className="text-sm text-muted-foreground">Median</div><div className="text-2xl font-semibold">{result.stats.median.toFixed(2)}%</div></div>
              <div><div className="text-sm text-muted-foreground">Min</div><div className="text-2xl font-semibold">{result.stats.min.toFixed(2)}%</div></div>
              <div><div className="text-sm text-muted-foreground">Max</div><div className="text-2xl font-semibold">{result.stats.max.toFixed(2)}%</div></div>
              <div><div className="text-sm text-muted-foreground">Std Dev</div><div className="text-2xl font-semibold">{result.stats.std.toFixed(2)}%</div></div>
            </div>
            <p className="text-sm leading-6">{result.interpretation}</p>
            <div className="max-h-60 overflow-y-auto border rounded-lg p-4">
              <div className="text-xs font-mono space-y-1">
                {result.rolling.slice(0, 20).map((r, i) => (
                  <div key={i} className="flex justify-between">
                    <span>Period {r.startIdx + 1}-{r.endIdx + 1}:</span>
                    <span className={r.returnPct >= 0 ? 'text-green-600' : 'text-red-600'}>{r.returnPct.toFixed(2)}%</span>
                  </div>
                ))}
                {result.rolling.length > 20 && <div className="text-muted-foreground">... and {result.rolling.length - 20} more periods</div>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Related Calculators</CardTitle>
          <CardDescription>Portfolio analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/portfolio-drawdown-calculator" className="text-primary hover:underline">Portfolio Drawdown</a></h4><p className="text-sm text-muted-foreground">Path risk metrics.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/tracking-difference-calculator" className="text-primary hover:underline">Tracking Difference</a></h4><p className="text-sm text-muted-foreground">Fund vs benchmark.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/sharpe-ratio-calculator" className="text-primary hover:underline">Sharpe Ratio</a></h4><p className="text-sm text-muted-foreground">Risk‑adjusted return.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/tangency-portfolio-calculator" className="text-primary hover:underline">Tangency Portfolio</a></h4><p className="text-sm text-muted-foreground">Max Sharpe mix.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Use rolling returns to assess performance consistency across different time horizons</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Paste a series of periodic returns (daily, monthly, or annual) as comma or newline-separated values.</li>
            <li>Rolling returns show how performance varies over different starting points, revealing consistency and volatility.</li>
            <li>Lower standard deviation in rolling returns indicates more consistent performance across periods.</li>
            <li>Compare mean vs median to spot skewness—large gaps suggest asymmetric return distributions.</li>
            <li>Use multiple rolling periods (1-year, 3-year, 5-year) to understand short-term vs long-term performance patterns.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Rolling returns, performance consistency, and time series analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What are rolling returns?</h4><p className="text-muted-foreground">Rolling returns calculate the return over a fixed period (e.g., 3 years) starting from each possible date in your data, showing how performance varies by entry point.</p></div>
          <div><h4 className="font-semibold mb-2">Why use rolling returns instead of point-to-point?</h4><p className="text-muted-foreground">Rolling returns eliminate start/end date bias and reveal performance consistency across different market cycles and entry points.</p></div>
          <div><h4 className="font-semibold mb-2">How many data points do I need?</h4><p className="text-muted-foreground">You need at least as many periods as your rolling window (e.g., 36 monthly returns for 3-year rolling). More data provides more rolling periods and better statistics.</p></div>
          <div><h4 className="font-semibold mb-2">What does a high standard deviation in rolling returns mean?</h4><p className="text-muted-foreground">High volatility in rolling returns indicates inconsistent performance—returns vary significantly depending on when you start the period.</p></div>
          <div><h4 className="font-semibold mb-2">Should I use mean or median rolling return?</h4><p className="text-muted-foreground">Median is less affected by outliers. Large gaps between mean and median suggest skewed distributions or extreme periods.</p></div>
          <div><h4 className="font-semibold mb-2">How do I interpret the min/max range?</h4><p className="text-muted-foreground">The range shows the best and worst outcomes over the rolling period. Wider ranges indicate higher uncertainty in period returns.</p></div>
          <div><h4 className="font-semibold mb-2">Can I compare different rolling periods?</h4><p className="text-muted-foreground">Yes. Shorter periods (1-year) show short-term volatility; longer periods (5-year, 10-year) reveal long-term trends and consistency.</p></div>
          <div><h4 className="font-semibold mb-2">What frequency should I use?</h4><p className="text-muted-foreground">Match your analysis needs: daily for intraday strategies, monthly for most portfolios, annual for long-term assessments.</p></div>
          <div><h4 className="font-semibold mb-2">How do rolling returns differ from CAGR?</h4><p className="text-muted-foreground">CAGR is a single point-to-point metric. Rolling returns provide a distribution, showing how CAGR would vary across different start dates.</p></div>
          <div><h4 className="font-semibold mb-2">What if my data has gaps or missing values?</h4><p className="text-muted-foreground">This tool expects complete series. For missing data, align dates first or use interpolation methods before calculating rolling returns.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

